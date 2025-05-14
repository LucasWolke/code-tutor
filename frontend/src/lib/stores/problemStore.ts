import { create } from 'zustand';
import { PROBLEMS } from '../config/problems';

export type ProblemDifficulty = 'easy' | 'medium' | 'hard';

export interface Problem {
    id: string;
    title: string;
    content: string;
    difficulty: ProblemDifficulty;
    boilerplateCode: string;
}

interface ProblemState {
    title: string;
    content: string;
    difficulty: ProblemDifficulty;
    boilerplateCode: string;
    setTitle: (title: string) => void;
    setContent: (content: string) => void;
    setDifficulty: (difficulty: ProblemDifficulty) => void;
    setBoilerplateCode: (code: string) => void;
    setProblem: (problem: Problem) => void;
}

export const useProblemStore = create<ProblemState>((set) => ({
    title: PROBLEMS[0].title,
    content: PROBLEMS[0].content,
    difficulty: PROBLEMS[0].difficulty,
    boilerplateCode: PROBLEMS[0].boilerplateCode,

    setTitle: (title: string) => set({ title }),
    setContent: (content: string) => set({ content }),
    setDifficulty: (difficulty: ProblemDifficulty) => set({ difficulty }),
    setBoilerplateCode: (boilerplateCode: string) => set({ boilerplateCode }),
    setProblem: (problem: Problem) => set({
        title: problem.title,
        content: problem.content,
        difficulty: problem.difficulty,
        boilerplateCode: problem.boilerplateCode
    }),
}));