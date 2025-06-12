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
        boilerplateCode: `public char[] reverseString(char[] s) {
    // TODO: implement two-pointer swap
    int left = 0;
    int right = s.length - 1;
    
    while (left < right) {
        // Swap characters at left and right indices
        char temp = s[left];
        s[left] = s[right];
        s[right] = temp;
        
        // Move pointers toward each other
        left++;
        right--;
    }
    
    return s;
}`,
        methodSignature: {
            name: "reverseString",
            returnType: "char[]",
            parameters: [
                { name: "s", type: "char[]" }
            ]
        },
        testCases: [
            {
                inputs: [['h', 'e', 'l', 'l', 'o']],
                expectedOutput: ['o', 'l', 'l', 'e', 'h'],
                description: "Reverse the string 'hello'"
            },
            {
                inputs: [['H', 'a', 'n', 'n', 'a', 'h']],
                expectedOutput: ['h', 'a', 'n', 'n', 'a', 'H'],
                description: "Reverse the string 'Hannah'"
            },
            {
                inputs: [['a']],
                expectedOutput: ['a'],
                description: "Reverse single character"
            }
        ],
        additionalResources: [
            "Java Arrays - Oracle Documentation - https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html",
            "Reverse String In-Place Video Tutorial - https://www.youtube.com/watch?v=T-IFvmUgL0g"
        ]
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
        boilerplateCode: `public boolean isValid(String s) {
    // TODO: use stack to match brackets
    return false;
}`,
        methodSignature: {
            name: "isValid",
            returnType: "boolean",
            parameters: [
                { name: "s", type: "String" }
            ]
        },
        testCases: [
            {
                inputs: ["()[]{}"],
                expectedOutput: true,
                description: "Valid parentheses mix"
            },
            {
                inputs: ["(]"],
                expectedOutput: false,
                description: "Invalid parentheses"
            },
            {
                inputs: ["([)]"],
                expectedOutput: false,
                description: "Incorrectly nested parentheses"
            },
            {
                inputs: ["{[]}"],
                expectedOutput: true,
                description: "Properly nested brackets"
            }
        ]
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
int ladderLength(String beginWord, String endWord, List<String> wordList)
\`\`\`

**Example**

\`\`\`
Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
Output: 5
\`\`\`

**Constraints**

- 1 ≤ wordList.length ≤ 5000
- All words have the same length ≤ 10.
`,
        boilerplateCode: `public int ladderLength(String beginWord, String endWord, List<String> wordList) {
    // TODO: BFS or bidirectional BFS
    return 0;
}`,
        methodSignature: {
            name: "ladderLength",
            returnType: "int",
            parameters: [
                { name: "beginWord", type: "String" },
                { name: "endWord", type: "String" },
                { name: "wordList", type: "List<String>" }
            ]
        },
        testCases: [
            {
                inputs: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]],
                expectedOutput: 5,
                description: "Standard word ladder case"
            },
            {
                inputs: ["hit", "cog", ["hot", "dot", "dog", "lot", "log"]],
                expectedOutput: 0,
                description: "No path to target word"
            }
        ]
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