/**
 * Service for wrapping user code in LeetCode-style test execution
 */

import { MethodSignature, TestCase } from './codeExecutionService';

/**
 * Wraps user's solution method in a complete Java program with test cases
 */
export function wrapCodeWithTests(
    userCode: string,
    methodSignature: MethodSignature,
    testCases: TestCase[]
): string {
    const solutionClass = generateSolutionClass(userCode);
    const mainClass = generateMainClass(methodSignature, testCases);

    return `${mainClass}\n\n${solutionClass}`;
}

/**
 * Generates the Solution class with user's method
 */
export function generateSolutionClass(userCode: string): string {
    return `class Solution {
    ${userCode}
}`;
}

/**
 * Generates the Main class with test execution
 */
export function generateMainClass(methodSignature: MethodSignature, testCases: TestCase[]): string {
    const testExecutions = testCases.map((testCase, index) => {
        const args = formatArgumentsForCall(testCase.inputs, methodSignature.parameters);

        return `        // Test Case ${index + 1}: ${testCase.description || 'No description'}
        try {
            ${methodSignature.returnType} result${index + 1} = sol.${methodSignature.name}(${args});
            Object expected${index + 1} = ${formatValueForType(testCase.expectedOutput, methodSignature.returnType)};
            boolean passed${index + 1} = Objects.deepEquals(result${index + 1}, expected${index + 1});
            System.out.println("CASE_${index + 1}:" + passed${index + 1});
            System.out.println("OUTPUT_${index + 1}:" + ${generateOutput(`result${index + 1}`, methodSignature.returnType)});
            System.out.println("EXPECTED_${index + 1}:" + ${generateOutput(`expected${index + 1}`, methodSignature.returnType)});
        } catch (Exception e) {
            System.out.println("CASE_${index + 1}:false");
            System.out.println("ERROR_${index + 1}: " + e.getMessage());
        }`;
    }).join('\n\n');

    return `import java.util.Arrays;
import java.util.List;
import java.util.Objects;

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
${testExecutions}
    }
}`;
}

/**
 * Formats test case arguments for method call
 */
function formatArgumentsForCall(inputs: any[], parameters: { name: string; type: string }[]): string {
    return inputs.map((input, index) => {
        const paramType = parameters[index]?.type || 'Object';
        return formatValueForType(input, paramType);
    }).join(', ');
}

/**
 * Formats a value according to its Java type
 */
function formatValueForType(value: any, type: string): string {
    if (value === null) return "null";

    const lowerType = type.toLowerCase();

    // Primitive types and boolean
    if (['int', 'integer', 'long', 'double', 'float', 'boolean'].includes(lowerType)) {
        return String(value);
    }

    // Character
    if (lowerType === 'char') {
        return `'${value}'`;
    }

    // String
    if (lowerType === 'string') {
        return `"${String(value).replace(/"/g, '\\"')}"`;
    }

    // Arrays
    if (lowerType.includes('[]')) {
        if (!Array.isArray(value)) return String(value);

        if (lowerType.includes('int')) {
            return `new int[]{${value.join(', ')}}`;
        } else if (lowerType.includes('string')) {
            return `new String[]{${value.map(v => `"${String(v).replace(/"/g, '\\"')}"`).join(', ')}}`;
        } else if (lowerType.includes('char')) {
            return `new char[]{${value.map(v => `'${v}'`).join(', ')}}`;
        }
    }

    // Lists
    if (lowerType.includes('list')) {
        if (!Array.isArray(value)) return String(value);

        if (lowerType.includes('string')) {
            return `Arrays.asList(${value.map(v => `"${String(v).replace(/"/g, '\\"')}"`).join(', ')})`;
        } else {
            return `Arrays.asList(${value.join(', ')})`;
        }
    }

    // Default fallback
    return `"${String(value).replace(/"/g, '\\"')}"`;
}

function generateOutput(resultVar: string, returnType: string): string {
    const lowerType = returnType.toLowerCase();

    // Handle primitive types that don't have toString()
    if (['int', 'integer', 'long', 'double', 'float', 'boolean', 'char'].includes(lowerType)) {
        return `String.valueOf(${resultVar})`;
    }

    // Arrays - handle both typed arrays and Object arrays
    if (lowerType.includes('[]')) {
        // If it's an Object variable, we need to cast it
        if (resultVar.startsWith('expected')) {
            // For expected values stored as Object, we need to cast
            if (lowerType.includes('int')) {
                return `Arrays.toString((int[])${resultVar})`;
            } else if (lowerType.includes('string')) {
                return `Arrays.toString((String[])${resultVar})`;
            } else if (lowerType.includes('char')) {
                return `Arrays.toString((char[])${resultVar})`;
            } else {
                return `Arrays.toString((Object[])${resultVar})`;
            }
        } else {
            // For actual result variables, use direct Arrays.toString
            return `Arrays.toString(${resultVar})`;
        }
    }

    // Lists and collections
    if (lowerType.includes('list') || lowerType.includes('collection')) {
        return `${resultVar}.toString()`;
    }

    // String and other objects
    if (lowerType === 'string' || !['int', 'integer', 'long', 'double', 'float', 'boolean', 'char'].includes(lowerType)) {
        return `String.valueOf(${resultVar})`;
    }

    // Fallback
    return `String.valueOf(${resultVar})`;
}
