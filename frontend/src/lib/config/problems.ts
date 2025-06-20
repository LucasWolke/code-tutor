import { Problem, ProblemDifficulty } from "@/types/problem";


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
            "name": "reverseString",
            "returnType": "char[]",
            "parameters": [
                { "name": "s", "type": "char[]" }
            ]
        },

        testCases: [
            {
                "args": [
                    "new char[]{'h','e','l','l','o'}"
                ],
                "expected": "new char[]{'o','l','l','e','h'}"
            },
            {
                "args": [
                    "new char[]{'H','a','n','n','a','h'}"
                ],
                "expected": "new char[]{'h','a','n','n','a','H'}"
            },
            {
                "args": [
                    "new char[]{'a'}"
                ],
                "expected": "new char[]{'a'}"
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
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        switch (c) {
            case '(': stack.push(')'); break;
            case '[': stack.push(']'); break;
            case '{': stack.push('}'); break;
            default:
                if (stack.isEmpty() || stack.pop() != c) {
                    return false;
                }
        }
    }
    return stack.isEmpty();
}`,
        methodSignature: {
            "name": "isValid",
            "returnType": "boolean",
            "parameters": [
                { "name": "s", "type": "String" }
            ]
        },
        testCases: [
            {
                "args": [
                    "\"()\""
                ],
                "expected": "true"
            },
            {
                "args": [
                    "\"()}\""
                ],
                "expected": "false"
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
    Set<String> dict = new HashSet<>(wordList);
    if (!dict.contains(endWord)) return 0;
    Queue<String> q = new ArrayDeque<>();
    q.add(beginWord);
    Set<String> seen = new HashSet<>();
    seen.add(beginWord);
    int level = 1;

    while (!q.isEmpty()) {
        int sz = q.size();
        for (int i = 0; i < sz; i++) {
            String word = q.poll();
            if (word.equals(endWord)) return level;
            char[] chars = word.toCharArray();
            for (int pos = 0; pos < chars.length; pos++) {
                char orig = chars[pos];
                for (char c = 'a'; c <= 'z'; c++) {
                    if (c == orig) continue;
                    chars[pos] = c;
                    String next = new String(chars);
                    if (dict.contains(next) && !seen.contains(next)) {
                        seen.add(next);
                        q.add(next);
                    }
                }
                chars[pos] = orig;
            }
        }
        level++;
    }
    return 0;
}`,
        methodSignature: {
            "name": "ladderLength",
            "returnType": "int",
            "parameters": [
                { "name": "beginWord", "type": "String" },
                { "name": "endWord", "type": "String" },
                { "name": "wordList", "type": "List<String>" }
            ]
        },
        testCases: [
            {
                "args": [
                    "\"hit\"",
                    "\"cog\"",
                    "Arrays.asList(\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\")"
                ],
                "expected": "5"
            },
            {
                "args": [
                    "\"hit\"",
                    "\"cog\"",
                    "Arrays.asList(\"hot\",\"dot\",\"dog\",\"lot\",\"log\")"
                ],
                "expected": "0"
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