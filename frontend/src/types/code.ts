export interface EditorTheme {
    id: string;
    name: string;
    description?: string;
    isDefault?: boolean;
    color: string;
}

export interface ExecutionResult {
    output: string;
    success: boolean;
    error?: string;
    exitCode?: number;
    stderr?: string;
    stdout?: string;
}

export interface TestCase {
    args: string[];
    expected: string;
}

export interface MethodSignature {
    name: string;
    returnType: string;
    parameters: { name: string; type: string }[];
}

export interface TestResult {
    testCase: TestCase;
    passed: boolean;
    actualOutput: string;
    expectedOutput?: string;
    error?: string;
}

export interface TestRunResult {
    allPassed: boolean;
    results: TestResult[];
    executionError?: string;
}