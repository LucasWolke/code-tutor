import { createHighlighter, Highlighter } from "shiki";

// Use lazy initialization for highlighter
let highlighter: Highlighter;

async function initializeHighlighter() {
    try {
        // Create the highlighter, it can be reused
        highlighter = await createHighlighter({
            themes: [
                'synthwave-84',
                'houston',
                'vitesse-dark',
                'vitesse-light',
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