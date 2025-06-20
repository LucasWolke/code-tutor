import { MethodSignature, TestCase } from "@/types/code";

export type ProblemDifficulty = 'easy' | 'medium' | 'hard';

export interface Problem {
    id: string;
    title: string;
    content: string;
    difficulty: ProblemDifficulty;
    boilerplateCode: string;
    methodSignature: MethodSignature;
    stringify?: string;
    testCases: TestCase[];
    additionalResources?: string[];
}