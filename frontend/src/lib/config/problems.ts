import { Problem, ProblemDifficulty } from "../stores/problemStore";

export const PROBLEMS: Problem[] = [
    // EASY PROBLEM
    {
        id: "reverse-string",
        title: "Reverse a String",
        difficulty: "easy",
        content: `# Reverse a String

Reverse an array of characters in-place.

**Function Signature**

\`\`\`java
void reverseString(char[] s)
\`\`\`

**Example**

\`\`\`
Input: ['h','e','l','l','o']
Output: ['o','l','l','e','h']
\`\`\`

**Constraints**

- 1 ≤ s.length ≤ 10^5
- Use O(1) extra memory.
`,
        boilerplateCode: `public class Main {
    public static void reverseString(char[] s) {
        // TODO: implement two-pointer swap
    }

    public static void main(String[] args) {
        char[] s1 = {'h','e','l','l','o'};
        reverseString(s1);
        System.out.println(java.util.Arrays.toString(s1));

        char[] s2 = {'H','a','n','n','a','h'};
        reverseString(s2);
        System.out.println(java.util.Arrays.toString(s2));
    }
}`
    },

    // MEDIUM PROBLEM
    {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "medium",
        content: `# Valid Parentheses

Check if a string of brackets is valid.

**Function Signature**

\`\`\`java
boolean isValid(String s)
\`\`\`

**Example**

\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Constraints**

- 1 ≤ s.length ≤ 10^4
- s contains only '(', ')', '{', '}', '[' and ']'.
`,
        boilerplateCode: `public class Main {
    public static boolean isValid(String s) {
        // TODO: use stack to match brackets
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isValid("()[]{}")); // true
        System.out.println(isValid("(]"));     // false
    }
}`
    },

    // HARD PROBLEM
    {
        id: "word-ladder",
        title: "Word Ladder",
        difficulty: "hard",
        content: `# Word Ladder

Find the length of the shortest transformation sequence from beginWord to endWord, changing one letter at a time using a given word list.

**Function Signature**

\`\`\`java
int ladderLength(String begin, String end, List<String> wordList)
\`\`\`

**Example**

\`\`\`
Input: begin = "hit", end = "cog", list = ["hot","dot","dog","lot","log","cog"]
Output: 5
\`\`\`

**Constraints**

- 1 ≤ wordList.length ≤ 5000
- All words have the same length ≤ 10.
`,
        boilerplateCode: `import java.util.*;
public class Main {
    public static int ladderLength(String begin, String end, List<String> wordList) {
        // TODO: BFS or bidirectional BFS
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(
            ladderLength("hit", "cog", Arrays.asList("hot","dot","dog","lot","log","cog"))
        ); // 5
        System.out.println(
            ladderLength("hit", "cog", Arrays.asList("hot","dot","dog","lot","log"))
        ); // 0
    }
}`
    }
];

// Helper functions
export const getProblemById = (id: string): Problem | undefined => {
    return PROBLEMS.find(problem => problem.id === id);
};

export const getProblemsByDifficulty = (difficulty: ProblemDifficulty): Problem[] => {
    return PROBLEMS.filter(problem => problem.difficulty === difficulty);
};

export const getAllProblems = (): Problem[] => {
    return PROBLEMS;
};