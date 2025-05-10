import { NextResponse } from 'next/server';
import {
    assessHelpLevel,
    createTutorRouterChain,
    checkResponseConsistency,
    getModelById
} from '@/lib/langchain/tutorAgents';
import { AIProvider } from '@/lib/config/models';
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
        const body = await request.json() as ChatRequest & { modelId?: string };
        const { userId, sessionId, codeSnapshot, userMessage, modelId } = body;

        if (!userId || !sessionId || !userMessage) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

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
            modelId,
            chat_history: chatHistory,
        });

        console.log("Help level assessed:", helpLevel);
        if (modelId) console.log("Using model:", modelId);

        // Create a context object for the tutor chain
        const context: TutorContext = {
            userId,
            sessionId,
            code: codeSnapshot,
            userMessage,
            helpLevel,
            chat_history: chatHistory,
            modelId,
        };

        // Periodically summarize the context
        if (messageCounters[sessionId] % 5 === 0) {
            await summarizeMemoryIfNeeded(sessionId);
        }

        // Generate response with retry logic
        let responseText = await generateResponse(context);
        console.log("Tutor response:", responseText);

        // Check consistency
        let consistency = await checkResponseConsistency(
            responseText,
            helpLevel,
            modelId
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