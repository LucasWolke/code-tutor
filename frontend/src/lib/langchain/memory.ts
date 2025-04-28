import { BufferWindowMemory, ChatMessageHistory } from "langchain/memory";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

// Memory storage by session ID
const memoryStore: Record<string, BufferWindowMemory> = {};

/**
 * Creates or retrieves a memory instance for a given session
 */
export function getMemory(sessionId: string): BufferWindowMemory {
    if (!memoryStore[sessionId]) {
        // Explicitly create a new ChatMessageHistory instance
        const chatHistory = new ChatMessageHistory();

        memoryStore[sessionId] = new BufferWindowMemory({
            k: 10, // Keep last 10 messages
            returnMessages: true,
            memoryKey: "chat_history",
            inputKey: "input",
            chatHistory: chatHistory,
        });
    }

    return memoryStore[sessionId];
}

/**
 * Summarize chat history when it gets too large
 */
export async function summarizeMemoryIfNeeded(
    sessionId: string,
    tokenThreshold: number = 2000
): Promise<void> {
    const memory = memoryStore[sessionId];

    if (!memory) return;

    try {
        // Get the message history
        const history = await memory.chatHistory.getMessages();

        // Approximate token count (rough estimate: 4 chars ≈ 1 token)
        const totalContent = history.map(m => m.content).join(" ");
        const estimatedTokens = totalContent.length / 4;

        if (estimatedTokens > tokenThreshold) {
            // Create a summarizer
            const summarizer = new ChatGoogleGenerativeAI({
                model: "gemini-2.0-flash",
                temperature: 0,
            });

            const summaryPrompt = ChatPromptTemplate.fromTemplate(`
          Summarize the following conversation between a student and AI tutor about Java programming:
          
          {chat_history}
          
          Provide a concise summary capturing key points discussed and code shared.
        `);

            const summarizeChain = summaryPrompt.pipe(summarizer);

            // Generate summary
            const result = await summarizeChain.invoke({
                chat_history: totalContent,
            });

            // Create a new memory with the summary as a SystemMessage
            const newChatHistory = new ChatMessageHistory();
            await newChatHistory.addMessage(
                new SystemMessage(`Previous conversation summary: ${result.text}`)
            );

            // Create new memory with the summarized history
            memoryStore[sessionId] = new BufferWindowMemory({
                k: 10,
                returnMessages: true,
                memoryKey: "chat_history",
                inputKey: "input",
                chatHistory: newChatHistory,
            });
        }
    } catch (error) {
        console.error("Error in summarizeMemoryIfNeeded:", error);
    }
}

/**
 * Get the role from a message object
 */
export function getRoleFromMessage(msg: any): string {
    // Handle LangChain message objects directly
    if (msg instanceof HumanMessage) return "human";
    if (msg instanceof AIMessage) return "ai";
    if (msg instanceof SystemMessage) return "system";

    // Handle serialized message objects
    if (msg._getType) {
        return msg._getType().replace("Message", "").toLowerCase();
    }

    // Handle LangChain constructor-based message objects
    if (msg.type === 'constructor' && Array.isArray(msg.id) && msg.id.length >= 3) {
        const messageType = msg.id[2];
        if (messageType === 'HumanMessage') return "human";
        if (messageType === 'AIMessage') return "ai";
        if (messageType === 'SystemMessage') return "system";
    }

    // Fallback to other properties
    if (msg.type) return msg.type;
    if (msg.role) return msg.role;

    return "unknown";
}

/**
 * Get chat history messages
 */
export async function getChatHistory(sessionId: string): Promise<any[]> {
    try {
        const memory = getMemory(sessionId);
        return await memory.chatHistory.getMessages();
    } catch (error) {
        console.error("Error getting chat history:", error);
        return [];
    }
}

/**
 * Add a user message to memory
 */
export async function addUserMessage(sessionId: string, content: string): Promise<void> {
    try {
        const memory = getMemory(sessionId);
        await memory.chatHistory.addMessage(new HumanMessage(content));
    } catch (error) {
        console.error("Error adding user message:", error);
    }
}

/**
 * Add an AI message to memory
 */
export async function addAIMessage(sessionId: string, content: string): Promise<void> {
    try {
        const memory = getMemory(sessionId);
        await memory.chatHistory.addMessage(new AIMessage(content));
    } catch (error) {
        console.error("Error adding AI message:", error);
    }
}

/**
 * Clear memory for a specific session
 */
export function clearMemory(sessionId: string): void {
    delete memoryStore[sessionId];
}