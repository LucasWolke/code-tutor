import { createHighlighter, Highlighter } from "shiki";

export interface EditorTheme {
    id: string;
    name: string;
    description?: string;
    isDefault?: boolean;
    color: string;
}

export const editorThemes: EditorTheme[] = [
    {
        id: 'houston',
        name: 'Houston',
        description: 'Dark theme with cyan and yellow accents',
        color: 'bg-[#2ba5f9]'
    },
    {
        id: 'github-dark-default',
        name: 'GitHub Dark Default',
        description: 'Dark theme used on GitHub',
        color: 'bg-[#e2564d]',
        isDefault: true
    },
    {
        id: 'catppuccin-mocha',
        name: 'Catppuccin Mocha',
        description: 'Dark theme with soft contrast and pastel colors',
        color: 'bg-[#ae72f6]'
    },
    {
        id: 'github-light-default',
        name: 'GitHub Light Default',
        description: 'Light theme used on GitHub',
        color: 'bg-[#ffffff]'
    }
];

let highlighter: Highlighter;

async function initializeHighlighter() {
    try {
        highlighter = await createHighlighter({
            themes: [
                'houston',
                'github-dark-default',
                'catppuccin-mocha',
                'github-light-default',
                'rose-pine-dawn',
            ],
            langs: [
                'java'
            ],
        })
    } catch (error) {
        console.error("Error initializing highlighter:", error);
    }
}

initializeHighlighter();

export { highlighter };