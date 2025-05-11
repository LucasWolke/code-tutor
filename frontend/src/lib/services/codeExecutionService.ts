/**
 * Service for executing Java code on the backend server
 */

export interface ExecutionResult {
    output: string;
    success: boolean;
    error?: string;
}

/**
 * Executes Java code on the backend
 * @param code The Java code to execute
 * @returns The execution result containing output and status
 */
export async function executeJavaCode(source: string): Promise<ExecutionResult> {
    try {
        const response = await fetch('http://localhost:3001/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ source })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                output: `Error: ${response.statusText}\n${errorText}`,
                success: false,
                error: response.statusText
            };
        }

        const result = await response.json();
        return {
            output: result.output || result.error || 'No output',
            success: !result.error,
            error: result.error
        };
    } catch (error) {
        return {
            output: `Error connecting to server: ${error instanceof Error ? error.message : String(error)}`,
            success: false,
            error: 'Connection error'
        };
    }
}