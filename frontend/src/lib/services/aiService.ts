import { useProblemStore } from '@/lib/stores/problemStore';
import { useEditorStore } from '@/lib/stores/editorStore';
import { useChatStore } from '@/lib/stores/chatStore';
import { EnhancedChatMessage, HelpLevel } from '@/types/chat';


/**
 * Generate AI response using the selected model from chatStore
 */
export async function generateResponse(
    chatHistory: EnhancedChatMessage[] = [],
    options: { helpLevel?: HelpLevel } = {}
): Promise<{ text: string; helpLevel: HelpLevel }> {
    const additionalResources = useProblemStore.getState().additionalResources || [];
    const code = useEditorStore.getState().code;
    const testResults = useEditorStore.getState().testResults || undefined;
    const selectedModelId = useChatStore.getState().getSelectedModelId(); // Get modelId from chatStore

    try {
        const response = await fetch(`/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                helpLevel: options.helpLevel,
                modelId: selectedModelId, // Use modelId from chatStore
                chatHistory: chatHistory, // Ensure chatHistory is correctly formatted
                testResults: testResults || [],
                additionalResources: additionalResources
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`AI error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }

        const data = await response.json();
        return {
            text: data.responseText,
            helpLevel: data.helpLevel
        };
    } catch (error) {
        console.error('AI generation error:', error);
        throw error;
    }
}