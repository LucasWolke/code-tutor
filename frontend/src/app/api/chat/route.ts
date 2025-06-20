import { NextResponse } from 'next/server';
import {
    assessHelpLevel,
    createTutorRouterChain,
    checkResponseConsistency,
} from '@/lib/services/tutorService';
import {
    AIProvider,
    HelpLevel,
    TutorContext,
} from '@/types/chat';
import { ChatRequest, ChatResponse } from '@/types/api'
import { getModelById } from '@/lib/config/models';

export async function POST(request: Request): Promise<Response> {
    try {
        // Parse request body
        const body = await request.json() as ChatRequest & { modelId?: string };
        const { code, chatHistory, testResults, modelId, additionalResources, strict } = body;

        // Verify API key exists for selected model
        const model = modelId ? getModelById(modelId) : null;
        const providerKey = model?.provider === AIProvider.OpenAI
            ? process.env.OPENAI_API_KEY
            : process.env.GOOGLE_API_KEY;

        if (!providerKey) {
            return NextResponse.json(
                { error: 'API key is not configured for the selected model' },
                { status: 500 }
            );
        }

        // Construct string of failed test results
        let testResultsString = '';
        if (testResults?.results && testResults?.results.length > 0) {
            testResults.results.forEach(result => {
                if (!result.passed) {
                    testResultsString += `Test ${result.testCase}`;
                    if (result.error) {
                        testResultsString += ` failed: ${result.error}\n`;
                    } else {
                        testResultsString += ` failed: expected:${result.expectedOutput}, but was: ${result.actualOutput}\n`;
                    }
                }
            })
        };

        let helpLevel: HelpLevel;

        console.log("testResults: " + JSON.stringify(testResults));
        if (testResults?.allPassed) {
            // If all tests passed, set help level to Finished
            helpLevel = HelpLevel.Finished;
        } else {
            // Assess help level or use provided level
            helpLevel = body.helpLevel || await assessHelpLevel(
                modelId!,
                chatHistory[chatHistory.length - 1],
            );
        }

        console.log("Help level assessed:", helpLevel);
        if (modelId) console.log("Using model:", modelId);

        // Help level 0 = user asked unrelated question
        if (helpLevel === HelpLevel.Unrelated) {
            return NextResponse.json(
                { responseText: "I'm here to help with Java coding. Please ask a related question." },
                { status: 200 }
            );
        }

        // Create a context object for the tutor chain
        const context: TutorContext = {
            code,
            chatHistory,
            modelId,
            helpLevel,
            testResults: testResultsString,
            additionalResources: additionalResources?.toString(),
        };

        // Generate response with retry logic
        let responseText = await generateResponse(context);
        console.log("Tutor response:", responseText);

        // Check consistency
        let consistency;
        if (helpLevel !== HelpLevel.Finished && strict) {
            consistency = await checkResponseConsistency(
                responseText,
                helpLevel,
                modelId
            );
        } else {
            consistency = { isConsistent: true, feedback: '' };
        }

        console.log("Response consistency check:", consistency);

        // If inconsistent, try once more with feedback
        if (!consistency.isConsistent) {
            const feedback = consistency.feedback;

            // Second attempt with feedback
            responseText = await generateResponse(context, feedback);
            console.log("Retry tutor response:", responseText);

            // Check consistency again
            consistency = await checkResponseConsistency(
                responseText,
                helpLevel,
                modelId
            );
            console.log("Retry response consistency check:", consistency);

            // If still not consistent, return error
            if (!consistency.isConsistent) {
                return NextResponse.json(
                    { error: 'Inconsistent response' },
                    { status: 400 }
                );
            }
        }

        // Prepare the response object
        const chatResponse: ChatResponse = {
            responseText,
            helpLevel,
        };

        return NextResponse.json(chatResponse);

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate response',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

// Helper function to generate response with the tutor chain
async function generateResponse(ctx: TutorContext, feedbackForRetry?: string): Promise<string> {
    const routerChain = await createTutorRouterChain();

    // If this is a retry, include feedback in the context
    const contextWithFeedback = feedbackForRetry
        ? { ...ctx, feedbackForRetry }
        : ctx;

    return (await routerChain.invoke(contextWithFeedback)).text;
}