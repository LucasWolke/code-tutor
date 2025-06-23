import normalizeUrl from "normalize-url";
import type { MessageTransports } from "vscode-languageclient";
import type { MonacoLanguageClient } from "monaco-languageclient";
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from "vscode-ws-jsonrpc";

// Create the WebSocket URL based on the protocol and port
function createUrl(): string {
    return normalizeUrl(process.env.LSP_URL || "ws://localhost:30003/jdtls");
}

// Create the language client with the given transports
async function createLanguageClient(
    transports: MessageTransports,
): Promise<MonacoLanguageClient> {
    const { MonacoLanguageClient } = await import("monaco-languageclient");
    const { CloseAction, ErrorAction } = await import("vscode-languageclient");

    return new MonacoLanguageClient({
        name: `Java Language Client`,
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ["java"],
            // disable the default error handler
            errorHandler: {
                error: () => ({ action: ErrorAction.Continue }),
                closed: () => ({ action: CloseAction.DoNotRestart }),
            },
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: () => Promise.resolve(transports),
        },
    });
}

// Track active connections for cleanup
interface ConnectionState {
    client: MonacoLanguageClient;
    webSocket: WebSocket;
    isConnected: boolean;
}

let activeConnection: ConnectionState | null = null;

/**
 * Connect to the Language Server Protocol server
 * Returns the client and WebSocket for managing the connection
 */
export function connectToLanguageServer(): Promise<{ client: MonacoLanguageClient; webSocket: WebSocket }> {
    // First disconnect any existing connection
    if (activeConnection?.isConnected) {
        disconnectLanguageServer(activeConnection.client);
    }

    const url = createUrl();
    const webSocket = new WebSocket(url);

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            webSocket.close();
            reject(new Error("Connection to language server timed out"));
        }, 10000); // 10 second timeout

        // Handle the WebSocket opening event
        webSocket.onopen = async () => {
            clearTimeout(timeoutId);
            const socket = toSocket(webSocket);
            const reader = new WebSocketMessageReader(socket);
            const writer = new WebSocketMessageWriter(socket);

            try {
                const languageClient = await createLanguageClient({ reader, writer });

                // Start the language client
                await languageClient.start();

                // Store active connection
                activeConnection = {
                    client: languageClient,
                    webSocket,
                    isConnected: true
                };

                // Stop the language client when the reader closes
                reader.onClose(() => {
                    if (activeConnection?.client === languageClient) {
                        activeConnection.isConnected = false;
                    }
                    languageClient.stop();
                });

                resolve({ client: languageClient, webSocket });
            } catch (error) {
                activeConnection = null;
                webSocket.close();
                reject(error);
            }
        };

        // Handle WebSocket errors
        webSocket.onerror = (error) => {
            clearTimeout(timeoutId);
            reject(error);
        };

        webSocket.onclose = () => {
            clearTimeout(timeoutId);
            if (!activeConnection?.isConnected) {
                reject(new Error("Connection closed before it was established"));
            }
        };
    });
}

/**
 * Disconnect from the Language Server Protocol server
 * @param client The language client to disconnect
 */
export function disconnectLanguageServer(client: MonacoLanguageClient): void {
    if (!activeConnection) return;

    try {
        // Stop the client if it's running
        if (client.isRunning()) {
            client.stop();
        }

        // Close the WebSocket connection
        if (activeConnection.webSocket.readyState === WebSocket.OPEN ||
            activeConnection.webSocket.readyState === WebSocket.CONNECTING) {
            activeConnection.webSocket.close();
        }
    } catch (error) {
        console.error("Error disconnecting from language server:", error);
    } finally {
        activeConnection = null;
    }
}