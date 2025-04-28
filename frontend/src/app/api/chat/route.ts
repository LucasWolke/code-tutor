import { NextResponse } from 'next/server';
import {
    assessHelpLevel,
    createTutorRouterChain,
    summarizeContext,
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

        // Create router chain to delegate to the appropriate tutor agent
        const routerChain = await createTutorRouterChain();
        // Get AI response using our simplified router
        const responseText = await routerChain.invoke(context);

        // Check if the response is consistent with the help level
        const consistency = await checkResponseConsistency(
            responseText,
            helpLevel,
            context
        );

        if (!consistency) {
            return NextResponse.json(
                { error: 'Inconsistent response' },
                { status: 400 }
            );
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