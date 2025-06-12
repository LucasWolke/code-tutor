export interface ExecutionResult {
    output: string;
    success: boolean;
    error?: string;
    exitCode?: number;
    stderr?: string;
    stdout?: string;
}

export interface TestCase {
    inputs: any;
    expectedOutput: any;
    description?: string;
}

export interface MethodSignature {
    name: string;
    returnType: string;
    parameters: {
        name: string;
        type: string;
    }[];
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