import { ExecuteRequest, ExecuteResponse } from '@/types/api';
import { NextRequest, NextResponse } from 'next/server';

const PISTON_URL = process.env.PISTON_URL || 'http://localhost:2000/api/v2/execute';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body: ExecuteRequest = await request.json();

        console.log('Execute API request:', body);

        // Validate input
        if ((!body.main || typeof body.main !== 'string')) {
            return NextResponse.json(
                { error: 'Invalid source code provided' },
                { status: 400 }
            );
        }

        if (body.main.length > 50000) {
            return NextResponse.json(
                { error: 'Source code too large (max 50KB)' },
                { status: 400 }
            );
        }

        // Prepare Piston request payload
        const pistonPayload = {
            language: 'java',
            version: '*',
            files: [
                {
                    name: 'Main.java',
                    content: body.main
                }
            ],
            stdin: body.stdin || ''
        };

        // Forward request to Piston
        const pistonResponse = await fetch(PISTON_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pistonPayload)
        });

        if (!pistonResponse.ok) {
            const errorData = await pistonResponse.json().catch(() => ({}));
            return NextResponse.json(
                {
                    error: errorData.message || 'Execution failed',
                    output: errorData.message || 'Execution failed',
                    success: false
                },
                { status: pistonResponse.status }
            );
        }

        const result = await pistonResponse.json();

        console.log('Piston response:', result);

        // Transform Piston response to match expected format
        const hasCompileError = result.compile && result.compile.stderr;
        const hasRuntimeError = result.run && result.run.stderr;
        const success = !hasCompileError && !hasRuntimeError && result.run?.code === 0;

        let output = '';
        let error = '';

        if (hasCompileError) {
            error = result.compile.stderr;
            output = `Compilation Error:\n${result.compile.stderr}`;
        } else if (hasRuntimeError) {
            error = result.run.stderr;
            output = result.run.stdout || result.run.stderr;
        } else {
            output = result.run?.stdout || 'No output';
        }

        const response: ExecuteResponse = {
            output,
            success,
            error: error || undefined,
            exitCode: result.run?.code || 0,
            stderr: hasCompileError ? result.compile.stderr : (result.run?.stderr || ''),
            stdout: result.run?.stdout || ''
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Execute API error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const response: ExecuteResponse = {
            output: `Error connecting to execution server: ${errorMessage}`,
            success: false,
            error: 'Connection error'
        };

        return NextResponse.json(response, { status: 500 });
    }
}
