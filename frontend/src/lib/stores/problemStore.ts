import { create } from 'zustand';
import { PROBLEMS } from '../config/problems';
import { TestCase, MethodSignature } from '../services/codeExecutionService';

export type ProblemDifficulty = 'easy' | 'medium' | 'hard';

export interface Problem {
    id: string;
    title: string;
    content: string;
    difficulty: ProblemDifficulty;
    boilerplateCode: string;
    methodSignature: MethodSignature;
    testCases?: TestCase[];
    additionalResources?: string[];
}

interface ProblemState {
    title: string;
    content: string;
    difficulty: ProblemDifficulty;
    boilerplateCode: string;
    methodSignature: MethodSignature;
    testCases: TestCase[];
    additionalResources?: string[];
    setTitle: (title: string) => void;
    setContent: (content: string) => void;
    setDifficulty: (difficulty: ProblemDifficulty) => void;
    setBoilerplateCode: (code: string) => void;
    setMethodSignature: (methodSignature: MethodSignature) => void;
    setTestCases: (testCases: TestCase[]) => void;
    setProblem: (problem: Problem) => void;
    setAdditionalResources?: (resources: string[]) => void;
}

export const useProblemStore = create<ProblemState>((set) => ({
    title: PROBLEMS[0].title,
    content: PROBLEMS[0].content,
    difficulty: PROBLEMS[0].difficulty,
    boilerplateCode: PROBLEMS[0].boilerplateCode,
    methodSignature: PROBLEMS[0].methodSignature,
    testCases: PROBLEMS[0].testCases || [],
    additionalResources: PROBLEMS[0].additionalResources || [],

    setTitle: (title: string) => set({ title }),
    setContent: (content: string) => set({ content }),
    setDifficulty: (difficulty: ProblemDifficulty) => set({ difficulty }),
    setBoilerplateCode: (boilerplateCode: string) => set({ boilerplateCode }),
    setMethodSignature: (methodSignature: MethodSignature) => set({ methodSignature }),
    setTestCases: (testCases: TestCase[]) => set({ testCases }),
    setAdditionalResources: (resources: string[]) => set({ additionalResources: resources }),
    setProblem: (problem: Problem) => set({
        title: problem.title,
        content: problem.content,
        difficulty: problem.difficulty,
        boilerplateCode: problem.boilerplateCode,
        methodSignature: problem.methodSignature,
        testCases: problem.testCases || [],
        additionalResources: problem.additionalResources || [],
    }),
}));