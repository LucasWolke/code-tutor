import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt, code, options = {} } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        // Get API key from environment variable
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is not configured' },
                { status: 500 }
            );
        }

        // Initialize Google GenAI
        const genAI = new GoogleGenAI({ apiKey });

        // Generate content
        const result = await genAI.models.generateContent({
            model: options.model || 'gemini-2.0-flash',
            contents: prompt + "\n" + code,
        });
        const response = result.text;

        return NextResponse.json({
            response: response,
        });
    } catch (error) {
        console.error('AI generation error:', error);

        return NextResponse.json(
            {
                error: 'Failed to generate AI response',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}