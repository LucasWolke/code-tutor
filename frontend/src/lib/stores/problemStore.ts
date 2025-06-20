import { create } from 'zustand';
import { PROBLEMS } from '../config/problems';
import { Problem } from '@/types/problem';

interface ProblemState {
    problem: Problem;
    setProblem: (problem: Problem) => void;
}

export const useProblemStore = create<ProblemState>((set) => ({
    problem: PROBLEMS[0],
    setProblem: (problem: Problem) => set({
        problem,
    }),
}));
