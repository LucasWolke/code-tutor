import * as monaco from 'monaco-editor';
import { initialize } from 'vscode/services';
import 'vscode/localExtensionHost';
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextMateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';

// Define worker loaders
export type WorkerLoader = () => Worker;
const workerLoaders: Partial<Record<string, WorkerLoader>> = {
    TextEditorWorker: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
    TextMateWorker: () => new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' })
};

// Set up Monaco environment for workers
if (typeof window !== 'undefined') {
    window.MonacoEnvironment = {
        getWorker: function (_moduleId: string, label: string) {
            console.log('getWorker', _moduleId, label);
            const workerFactory = workerLoaders[label];
            if (workerFactory != null) {
                return workerFactory();
            }
            throw new Error(`Worker ${label} not found`);
        }
    };
}

/**
 * Initialize VSCode API bridge for Monaco Editor
 * This must be called before creating any editor instances
 */
export const initializeVscodeApi = async () => {
    try {
        // Initialize VSCode services required for advanced features
        await initialize({
            ...getTextMateServiceOverride(),
            ...getThemeServiceOverride(),
            ...getLanguagesServiceOverride(),
        });

        console.log('Monaco VSCode API initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Monaco VSCode API:', error);
        return false;
    }
};

/**
 * Configure basic Java language features 
 * This is a fallback if the language server is not available
 */
export const configureJavaLanguage = () => {
    monaco.languages.register({ id: 'java' });

    // Add Java snippets
    monaco.languages.registerCompletionItemProvider('java', {
        provideCompletionItems: (model, position) => {
            const range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            return {
                suggestions: [
                    {
                        label: 'sout',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'System.out.println(${1:});',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: 'System.out.println()',
                        documentation: 'Print to standard output',
                        range: range
                    },
                    {
                        label: 'main',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            'public static void main(String[] args) {',
                            '\t${1:}',
                            '}'
                        ].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: 'main method',
                        documentation: 'Public static main method',
                        range: range
                    },
                    {
                        label: 'for',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {',
                            '\t${3:}',
                            '}'
                        ].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: 'For Loop',
                        documentation: 'For loop with index',
                        range: range
                    },
                ]
            };
        }
    });

    // Set basic formatting options for Java
    monaco.languages.setLanguageConfiguration('java', {
        indentationRules: {
            decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
            increaseIndentPattern: /^.*\{[^}"']*$/
        },
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: '\'', close: '\'' },
            { open: '/**', close: ' */' }
        ]
    });
};