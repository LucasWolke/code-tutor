## AI Pipeline

1. **User Query & Context**

   - The system receives the user input along with any relevant code, exercise, or conversational context.

2. **Level Decision**

   - Based on an analysis of the query, current assistance level, and conversation context, the system selects one of the five defined help levels.

3. **Delegation to Agent**

   - The selected agent processes the query using its tailored prompt guidelines according to the designated level.

4. **Conformance Check**
   - A dedicated agent reviews the generated response to verify it complies with the minimal help principle for the chosen level;
   - If the response fails the check, the process goes back to Step 3 with stricter prompting and suggestion.

## Agents

### Level Decider Agent

- **Purpose:** Analyzes the student’s coding query and context to decide the appropriate level of assistance and returns a structured JSON decision.
- **Example Prompt:** "Given the following coding query and context [insert context here], please decide on the assistance level from 1 (motivational support) to 5 (detailed code help) and respond only in JSON format: { "level": "<1|2|3|4|5>" }."

### Agent L1 – Motivational Help

- **Purpose:** Provides basic encouragement and boosts the student's confidence without giving any coding hints.
- **Example Prompt:** "Respond with motivational support such as 'You’re off to a great start—keep pushing forward!' without offering any coding solutions."

### Agent L2 – General Feedback

- **Purpose:** Gives general feedback on the student's code or approach to affirm their progress without delving into specifics.
- **Example Prompt:** "Generate feedback for the student’s code like 'Your approach shows promise; what do you think could be improved next?' without suggesting concrete code changes."

### Agent L3 – General Strategic Help

- **Purpose:** Points the student toward useful resources or broad strategies, such as documentation or debugging techniques, without showing a full solution.
- **Example Prompt:** "Offer a strategic hint such as 'Have you considered reviewing the syntax for loops in Python? The official docs might give you a fresh perspective,' without presenting a complete code example."

### Agent L4 – Content-Oriented Strategic Help

- **Purpose:** Provides content-related advice that explains key concepts or connects ideas without giving away the full solution.
- **Example Prompt:** "Explain a concept like 'When using loops, ensure your loop variable is updated correctly; think about how a for-loop can simplify repetitive tasks,' without writing the entire code snippet."

### Agent L5 – Detailed Content Help

- **Purpose:** Offers detailed, step-by-step guidance with specific code examples or corrective actions to solve the student's problem.
- **Example Prompt:** "Generate an in-depth explanation such as 'To fix the error in your loop, first initialize your counter variable, then use a for-loop with the correct range, and finally check if your condition matches the expected output,' including a brief code snippet if necessary."

### Conformance Checker

- **Purpose:** Reviews the code-related answer to verify it adheres to the minimal help guidelines and the designated assistance level, ensuring the response is appropriate for CS1 novices.
- **Example Prompt:** "Review the following coding response and confirm if it follows the minimal assistance guidelines for level X; respond strictly in JSON format as { 'compliant': 'yes' } or { 'compliant': 'no', 'suggestion': '[brief revision instructions]' }."
