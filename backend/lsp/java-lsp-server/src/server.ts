/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import { javaLspConfig } from './config.js';
import express from 'express';
import { WebSocketServer } from 'ws';
import { Socket } from 'node:net';
import { IncomingMessage } from 'node:http';
import { URL } from 'node:url';
import { type IWebSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import { createConnection, createServerProcess, forward } from 'vscode-ws-jsonrpc/server';
import { Message, InitializeRequest, type InitializeParams } from 'vscode-languageserver-protocol';

// Handle uncaught exceptions
process.on('uncaughtException', err => {
    console.error('Uncaught Exception: ', err.toString());
    if (err.stack !== undefined) {
        console.error(err.stack);
    }
});

export function runJavaLanguageServer(): void {
    // Create express application
    const app = express();

    // Serve static content if needed
    app.use(express.static('.'));

    // Create HTTP server
    const server = app.listen(javaLspConfig.port, () => {
        console.log(`Eclipse JDT LS Server is running at http://localhost:${javaLspConfig.port}`);
        console.log(`WebSocket path: ${javaLspConfig.path}`);
    });

    // Create WebSocket server
    const wss = new WebSocketServer({
        noServer: true,
        perMessageDeflate: false
    });

    // Handle WebSocket upgrade
    server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
        const baseURL = `http://${request.headers.host}/`;
        const pathName = request.url !== undefined ? new URL(request.url, baseURL).pathname : undefined;

        if (pathName === javaLspConfig.path) {
            wss.handleUpgrade(request, socket, head, webSocket => {
                const socket: IWebSocket = {
                    send: content => webSocket.send(content, error => {
                        if (error) {
                            throw error;
                        }
                    }),
                    onMessage: cb => webSocket.on('message', (data) => {
                        cb(data);
                    }),
                    onError: cb => webSocket.on('error', cb),
                    onClose: cb => webSocket.on('close', cb),
                    dispose: () => webSocket.close()
                };

                // Launch the server when the web socket is opened
                if (webSocket.readyState === webSocket.OPEN) {
                    launchJavaLsp(socket);
                } else {
                    webSocket.on('open', () => {
                        launchJavaLsp(socket);
                    });
                }
            });
        }
    });
}

function launchJavaLsp(socket: IWebSocket): void {
    // Start the language server as an external process
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const socketConnection = createConnection(reader, writer, () => socket.dispose());

    const serverConnection = createServerProcess(
        'Eclipse JDT LS',
        'java',
        [
            '-Declipse.application=org.eclipse.jdt.ls.core.id1',
            '-Dosgi.bundles.defaultStartLevel=4',
            '-Declipse.product=org.eclipse.jdt.ls.core.product',
            '-Dlog.level=ALL',
            '-Xmx1G',
            '--add-modules=ALL-SYSTEM',
            '--add-opens',
            'java.base/java.util=ALL-UNNAMED',
            '--add-opens',
            'java.base/java.lang=ALL-UNNAMED',
            '-jar',
            `${javaLspConfig.basePath}/ls/plugins/org.eclipse.equinox.launcher_1.6.900.v20240613-2009.jar`,
            '-configuration',
            `${javaLspConfig.basePath}/ls/config_linux`,
            '-data',
            `${javaLspConfig.basePath}/workspace`
        ]
    );

    if (serverConnection) {
        forward(socketConnection, serverConnection, message => {
            if (Message.isRequest(message)) {
                if (message.method === InitializeRequest.type.method) {
                    const initializeParams = message.params as InitializeParams;
                    initializeParams.processId = process.pid;
                }

                // Log messages if needed
                console.log(`Eclipse JDT LS Server received: ${message.method}`);
                console.log(message);
            }

            if (Message.isResponse(message)) {
                console.log('Eclipse JDT LS Server sent:');
                console.log(message);
            }

            return message;
        });
    } else {
        console.error("Failed to create server connection");
        socket.dispose();
    }
}
