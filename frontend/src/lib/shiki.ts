import { createHighlighter, Highlighter } from "shiki";

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