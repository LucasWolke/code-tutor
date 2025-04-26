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
        memoryStore[sessionId] = new BufferWindowMemory({
            k: 10, // Keep last 10 messages
            returnMessages: true,
            memoryKey: "chat_history",
            inputKey: "input",
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

        console.log(`Summary: ${result.text}`);

        // Create a new memory with the summary as a SystemMessage
        const newChatHistory = new ChatMessageHistory();
        await newChatHistory.addMessage(
            new SystemMessage(`Previous conversation summary: ${result.text}`)
        );

        // Create new memory with the summarized history
        memoryStore[sessionId] = new BufferWindowMemory({
            k: 3, // Start with smaller window after summarization
            returnMessages: true,
            memoryKey: "chat_history",
            inputKey: "input",
            chatHistory: newChatHistory,
        });
    }
}

/**
 * Add a user message to memory
 */
export async function addUserMessage(sessionId: string, content: string): Promise<void> {
    const memory = getMemory(sessionId);
    await memory.chatHistory.addMessage(new HumanMessage(content));
}

/**
 * Add an AI message to memory
 */
export async function addAIMessage(sessionId: string, content: string): Promise<void> {
    const memory = getMemory(sessionId);
    await memory.chatHistory.addMessage(new AIMessage(content));
}

/**
 * Clear memory for a specific session
 */
export function clearMemory(sessionId: string): void {
    delete memoryStore[sessionId];
}