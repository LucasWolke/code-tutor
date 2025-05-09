import { NextResponse } from 'next/server';
import {
    assessHelpLevel,
    createTutorRouterChain,
    checkResponseConsistency
} from '@/lib/langchain/tutorAgents';
import {
    getMemory,
    summarizeMemoryIfNeeded,
    addUserMessage,
    addAIMessage
} from '@/lib/langchain/memory';
import {
    ChatRequest,
    ChatResponse,
    TutorContext,
} from '@/lib/langchain/types';

// Track message count to trigger periodic context summarization
const messageCounters: Record<string, number> = {};

export async function POST(request: Request): Promise<Response> {
    try {
        // Parse request body
        const body = await request.json() as ChatRequest;
        const { userId, sessionId, codeSnapshot, userMessage } = body;

        if (!userId || !sessionId || !userMessage) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get API key from environment
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is not configured' },
                { status: 500 }
            );
        }

        // Increment message counter for session
        messageCounters[sessionId] = (messageCounters[sessionId] || 0) + 1;

        // Get memory for this session
        const memory = getMemory(sessionId);

        // Store user message in memory
        await addUserMessage(sessionId, userMessage);

        // Get conversation history
        const chatHistory = await memory.chatHistory.getMessages();

        // Assess help level or use provided level
        const helpLevel = body.helpLevel || await assessHelpLevel({
            userId,
            sessionId,
            code: codeSnapshot,
            userMessage,
        });

        console.log("Help level assessed:", helpLevel);

        // Create a context object for the tutor chain
        const context: TutorContext = {
            userId,
            sessionId,
            code: codeSnapshot,
            userMessage,
            helpLevel,
            chat_history: chatHistory,
        };

        // Periodically summarize the context
        if (messageCounters[sessionId] % 5 === 0) {
            await summarizeMemoryIfNeeded(sessionId);
        }

        // First attempt
        let responseText = await generateResponse(context);
        console.log("Tutor response:", responseText);

        // Comment in code snippet to test consistency check
        // responseText += "Here is the code snippet you asked for: if (i % 15 == 0) { System.out.println(\'FizzBuzz\'); }"

        // Check consistency
        let consistency = await checkResponseConsistency(
            responseText,
            helpLevel,
        );
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
            );
            console.log("Retry response consistency check:", consistency);

            // If still not consistent, return error
            if (!consistency) {
                return NextResponse.json(
                    { error: 'Inconsistent response' },
                    { status: 400 }
                );
            }
        }

        // Store AI response in memory
        await addAIMessage(sessionId, responseText);

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

    return routerChain.invoke(contextWithFeedback);
}