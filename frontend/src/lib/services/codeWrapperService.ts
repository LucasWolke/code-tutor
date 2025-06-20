/**
 * Service for wrapping user code in LeetCode-style test execution
 */
import { Problem } from "@/types/problem";


/**
 * Wraps user's solution method in a complete Java program with test cases
 */
export function wrapCodeWithTests(
    userCode: string,
    problem: Problem
): string {
    const { stringify, methodSignature, testCases } = problem;
    const rt = problem.methodSignature.returnType.trim();
    const isPrimitive = [
        "byte", "short", "int", "long", "float", "double", "boolean", "char"
    ].includes(rt);
    const isArray = rt.endsWith("[]");
    const printer = stringify
        ?? (isArray ? "Arrays.toString" : "String.valueOf");

    const compareExpr = isPrimitive
        ? "actual == expected"
        : isArray
            ? (() => {
                if (rt === "byte[]") return "Arrays.equals((byte[])actual,(byte[])expected)";
                if (rt === "short[]") return "Arrays.equals((short[])actual,(short[])expected)";
                if (rt === "int[]") return "Arrays.equals((int[])actual,(int[])expected)";
                if (rt === "long[]") return "Arrays.equals((long[])actual,(long[])expected)";
                if (rt === "float[]") return "Arrays.equals((float[])actual,(float[])expected)";
                if (rt === "double[]") return "Arrays.equals((double[])actual,(double[])expected)";
                if (rt === "boolean[]") return "Arrays.equals((boolean[])actual,(boolean[])expected)";
                if (rt === "char[]") return "Arrays.equals((char[])actual,(char[])expected)";
                return "Arrays.deepEquals((Object[])actual,(Object[])expected)";
            })()
            : "Objects.equals(actual, expected)";

    const calls = testCases
        .map((tc, i) => {
            const idx = i + 1;
            const argsList = tc.args.join(", ");

            const actualDecl = `${rt} actual   = sol.${methodSignature.name}(${argsList});`;
            const expectedDecl = `${rt} expected = ${tc.expected};`;

            return `
        try {
            ${actualDecl}
            ${expectedDecl}

            boolean pass = ${compareExpr};
            System.out.println("CASE_${idx}:" + pass);
            if (!pass) {
                System.out.println("  EXPECTED_${idx}: " + ${printer}(expected));
                System.out.println("  GOT_${idx}: " + ${printer}(actual));
                failures++;
            }
        } catch (Throwable t) {
            System.out.println("CASE_${idx}:" + false);
            System.out.println("ERROR_${idx}:" + t);
            failures++;
        }`.trim();
        })
        .join("\n\n        ");

    return `
import java.util.*;

public class Main {
    private static int failures = 0;

    public static void main(String[] args) {
        Solution sol = new Solution();

        ${calls}

        if (failures == 0) {
            System.out.println("ALL_PASS");
        }
    }
}

class Solution {
${userCode}
}
`.trim();
}