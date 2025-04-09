import * as monaco from 'monaco-editor';
import { editor } from 'monaco-editor';
import * as vscode from 'vscode';
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { CloseAction, ErrorAction } from 'vscode-languageclient/browser.js';
import { MonacoLanguageClient } from 'monaco-languageclient';

// Track active language clients
const languageClients: Map<string, MonacoLanguageClient> = new Map();

/**
 * Create and start a language client via WebSocket
 * 
 * @param url The WebSocket URL for the language server
 * @param languageId The language ID (e.g., 'java')
 * @returns Promise resolving to the language client
 */
export const createLanguageClient = async (
    url: string = `ws://localhost:3001/lsp`,
    languageId: string = 'java'
): Promise<MonacoLanguageClient> => {
    // Check if a client already exists for this language
    const existingClient = languageClients.get(languageId);
    if (existingClient) {
        console.log(`Reusing existing ${languageId} language client`);
        return existingClient;
    }

    console.log(`Creating new ${languageId} language client via WebSocket...`);

    return new Promise((resolve, reject) => {
        // Create WebSocket connection
        const webSocket = new WebSocket(url);

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
            webSocket.close();
            reject(new Error(`Connection timeout to ${languageId} language server`));
        }, 10000);

        webSocket.onopen = () => {
            clearTimeout(connectionTimeout);

            try {
                // Create message transport
                const socket = toSocket(webSocket);
                const reader = new WebSocketMessageReader(socket);
                const writer = new WebSocketMessageWriter(socket);

                // Create language client
                const languageClient = createMonacoLanguageClient({
                    name: `${languageId.toUpperCase()} Language Client`,
                    languageId,
                    reader,
                    writer
                });

                // Start client and handle reader close
                languageClient.start();
                languageClients.set(languageId, languageClient);

                reader.onClose(() => {
                    languageClient.stop();
                    languageClients.delete(languageId);
                    console.log(`${languageId} language client disconnected`);
                });

                console.log(`${languageId} language client connected`);
                resolve(languageClient);
            } catch (error) {
                console.error(`Failed to create ${languageId} language client:`, error);
                reject(error);
            }
        };

        webSocket.onerror = (event) => {
            clearTimeout(connectionTimeout);
            console.error(`WebSocket connection error for ${languageId}:`, event);
            reject(new Error(`WebSocket connection failed for ${languageId}`));
        };

        webSocket.onclose = (event) => {
            clearTimeout(connectionTimeout);
            if (!event.wasClean) {
                console.warn(`WebSocket connection closed unexpectedly, code: ${event.code}`);
                reject(new Error(`Connection closed with code: ${event.code}`));
            }
        };
    });
};

/**
 * Helper function to create a Monaco Language Client
 */
const createMonacoLanguageClient = ({
    name,
    languageId,
    reader,
    writer
}: {
    name: string,
    languageId: string,
    reader: WebSocketMessageReader,
    writer: WebSocketMessageWriter,
}): MonacoLanguageClient => {
    return new MonacoLanguageClient({
        name,
        clientOptions: {
            // Use language id as a document selector
            documentSelector: [languageId],
            // Disable the default error handler
            errorHandler: {
                error: () => ({ action: ErrorAction.Continue }),
                closed: () => ({ action: CloseAction.DoNotRestart })
            },
            // Optional middleware for customizing client behavior
            middleware: {
                // You can add customizations here if needed
            }
        },
        messageTransports: {
            reader,
            writer
        }
    });
};

/**
 * Initialize Java language server for a Monaco editor instance
 * 
 * @param editorInstance The Monaco editor instance
 * @returns Promise resolving to the language client
 */
export const initJavaLanguageServer = async (
    editorInstance: editor.IStandaloneCodeEditor
): Promise<MonacoLanguageClient> => {
    try {
        // Create/get the language client
        const client = await createLanguageClient();

        // Register the document with the workspace
        setupEditorDocument(editorInstance);

        return client;
    } catch (error) {
        console.error('Failed to initialize Java language server:', error);
        throw error;
    }
};

/**
 * Set up the document in the VSCode workspace for LSP support
 * 
 * @param editorInstance The Monaco editor instance
 */
const setupEditorDocument = (editorInstance: editor.IStandaloneCodeEditor): void => {
    const model = editorInstance.getModel();
    if (!model) {
        console.error('Editor has no model');
        return;
    }

    // Get the document URI
    const uri = model.uri;

    // Create a virtual document in the VSCode workspace if not exists
    const documents = vscode.workspace.textDocuments;
    const existingDoc = documents.find(doc => doc.uri.toString() === uri.toString());

    if (!existingDoc) {
        // Create a document for the LSP to work with
        vscode.workspace.openTextDocument({
            language: 'java',
            content: model.getValue()
        }).then(document => {
            console.log(`Created virtual document: ${document.uri.toString()}`);
        });
    }

    // Monitor model changes to keep the virtual document updated
    model.onDidChangeContent(() => {
        const updatedContent = model.getValue();
        updateVirtualDocument(uri, updatedContent);
    });
};

/**
 * Update the virtual document in the VSCode workspace
 * 
 * @param uri The document URI
 * @param content The new document content
 */
const updateVirtualDocument = (uri: monaco.Uri, content: string): void => {
    const documents = vscode.workspace.textDocuments;
    const existingDoc = documents.find(doc => doc.uri.toString() === uri.toString());

    if (existingDoc) {
        // Update existing document
        const vscodeUri = vscode.Uri.parse(uri.toString());
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(existingDoc.lineCount, 0)
        );

        edit.replace(vscodeUri, fullRange, content);
        vscode.workspace.applyEdit(edit).then(success => {
            if (!success) {
                console.warn('Failed to update virtual document');
            }
        });
    } else {
        // Create a new document
        vscode.workspace.openTextDocument({
            language: 'java',
            content
        }).then(document => {
            console.log(`Created new virtual document: ${document.uri.toString()}`);
        });
    }
};