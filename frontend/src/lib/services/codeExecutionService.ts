/**
 * Service for executing Java code using Piston API via internal server
 */

import { Problem } from '@/types/problem';
import { wrapCodeWithTests } from './codeWrapperService';
import { ExecutionResult, MethodSignature, TestCase, TestResult, TestRunResult } from '@/types/code';

/**
 * Executes Java code using internal API
 * @param main The main class code
 * @param solution The solution class code
 * @returns The execution result containing output and status
 */
export async function executeJavaCode(main: string): Promise<ExecutionResult> {
    try {
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                main: main,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                output: errorData.error || `Error: ${response.statusText}`,
                success: false,
                error: errorData.error || response.statusText
            };
        }

        const result = await response.json();

        return {
            output: result.output || 'No output',
            success: result.success,
            error: result.error || undefined,
            exitCode: result.exitCode,
            stderr: result.stderr,
            stdout: result.stdout
        };
    } catch (error) {
        return {
            output: `Error connecting to execution server: ${error instanceof Error ? error.message : String(error)}`,
            success: false,
            error: 'Connection error'
        };
    }
}

/**
 * Runs test cases against Java code using LeetCode-style execution
 * @param userCode The user's solution method code
 * @param methodSignature The method signature information
 * @param testCases Array of test cases to run
 * @returns Test run results
 */
export async function runTestCases(
    userCode: string,
    problem: Problem,
): Promise<TestRunResult> {
    const results: TestResult[] = [];
    let executionError: string | undefined;

    try {
        // Wrap the user code with test execution
        const wrappedCode = wrapCodeWithTests(userCode, problem);

        // Execute the wrapped code
        const result = await executeJavaCode(wrappedCode);

        if (!result.success) {
            executionError = result.error || 'Execution failed';
            // Create failed results for all test cases
            problem.testCases.forEach(testCase => {
                results.push({
                    testCase,
                    passed: false,
                    actualOutput: result.output,
                    error: result.error
                });
            });
        } else {
            // Parse the test results from output
            const output = result.stdout || result.output || '';
            parseTestResults(output, problem.testCases, results);
        }
    } catch (error) {
        executionError = error instanceof Error ? error.message : String(error);
        problem.testCases.forEach(testCase => {
            results.push({
                testCase,
                passed: false,
                actualOutput: '',
                error: executionError
            });
        });
    }

    const allPassed = results.every(r => r.passed);

    return {
        allPassed,
        results,
        executionError
    };
}

/**
 * Parses test execution output to extract individual test results
 */
function parseTestResults(output: string, testCases: TestCase[], results: TestResult[]): void {
    const lines = output.split('\n');

    testCases.forEach((testCase, index) => {
        const casePattern = `CASE_${index + 1}:`;
        const outputPattern = `GOT_${index + 1}:`;
        const expectedPattern = `EXPECTED_${index + 1}:`;
        const errorPattern = `ERROR_${index + 1}:`;
        const resultLine = lines.find(line => line.includes(casePattern));
        const outputLine = lines.find(line => line.includes(outputPattern));
        const expectedLine = lines.find(line => line.includes(expectedPattern));
        const errorLine = lines.find(line => line.includes(errorPattern));

        if (resultLine) {
            const passed = resultLine.includes('true');
            const actualOutput = outputLine ? outputLine.replace(outputPattern, '').trim() : 'No output';
            const expectedOutput = expectedLine ? expectedLine.replace(expectedPattern, '').trim() : testCase.expected;
            const error = errorLine ? errorLine.replace(errorPattern, '').trim() : undefined;
            results.push({
                testCase,
                passed,
                actualOutput: actualOutput,
                expectedOutput: expectedOutput,
                error: error,
            });
        } else {
            const error = errorLine ? errorLine.replace(errorPattern, '').trim() : undefined;
            results.push({
                testCase,
                passed: false,
                actualOutput: 'No output',
                expectedOutput: testCase.expected,
                error: error
            });
        }
    });
    console.log('Parsed test results:', results);
}