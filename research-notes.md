# Research Notes

## Key Takeaways

- Focus on scaffolded guidance (step-by-step help that builds understanding) instead of long detailed response that solves entire problem.
- Use interactive support like Socratic questioning (open ended questions to encourage thinking about problem) to engage students.
- Integration into workflow, i.e LLM directly in IDE is really important for engagement.
- Provide explanations and pseudocode, not just full code solutions.
- Add guardrails to stop students from cheating/learning wrong patterns like poor/very short prompts.
- Adaptive feedback based on student skills, behavior and query quality(?).
- Find balance between providing enough help (so students actually use it) and not doing the heavy lifting for students.
- Non goal?: Although many papers focus on teaching LLMs (learn how to prompt better, how to work with LLMs), the goal of code tutor is to help students learn programming, not to learn how to use LLMs

## Papers

### Beyond Traditional Teaching: Large Language Models as Simulated Teaching Assistants in Computer Science

- https://doi.org/10.1145/3626252.3630789
- GPT-3.5, LangChain, VirtualTA
- Proposes flowchart for design of VirtualTA: Question Filtering, Question Categorization, Response Filtering
- VirutalTA as good if not better than human TAs, promising but still requires human oversight

### Finding Misleading Identifiers in Novice Code Using LLMs

- https://doi.org/10.1145/3641555.3705282
- GPT-4.0, CS1, Variable Name Misleadingness
- Proposes detection of misleading variable names in novice code using LLMs
- GPT-4.0 > Claude, good performance, but tends to be too pendantic - hard to fix with prompting

### Bridging Novice Programmers and LLMs with Interactivity

- https://doi.org/10.1145/3641554.3701867
- Not very relevant, Interactivity in LLMs, CS1
- Proposes interactive LLMs, asks clarifying questions until model has enough info to generate better quality responses
- Improves students prompting skills, suggests that actually understanding code is not necessarily improved -> Better at prompting != Better at understanding code

### Compiler-Integrated, Conversational AI for Debugging CS1 Programs

- https://doi.org/10.1145/3641554.3701827
- ChatGPT3.5-turbo, CS1, Debugging for compile- and run-time errors
- Proposes conversational AI for debugging CS1 programs, integrated into compiler
- Uses Socratic Method to guide learning through targeted questions that lead students to solutions
- Promising, integrating within existing workflows is crucial for adoption, engagement in llm conversation -> more time and effort invested from students
- Plans future work with open source llms, costs were only 0.10$ per student (1000) over 8 week period

### Enhancing CS1 Education through Experiential Learning with Robotics Projects

- https://doi.org/10.1145/3641554.3701810
- Not very relevant, CS1, Robotics
- Proposes robotics instead of traditional development projects for CS1
- Students had better exam scores compared to control group
- Reasons: LLMs couldnt generate good code - more self-reliance, takes longer to rerun code - less trial and error, more engagement - less frustration with code syntax

### Personalized Parsons Puzzles as Scaffolding Enhance Practice Engagement Over Just Showing LLM-Powered Solutions

- https://doi.org/10.1145/3641555.3705227
- GPT-4, CS1, Parsons Puzzle
- Students receive personalized Parsons puzzles compared to full LLM-generated solutions
- Students spend more time on pratice, more engaged with assignment, but some students wanted more guidance
- Control group sometimes copy-pasted full answers, less learning

### Desirable Characteristics for AI Teaching Assistants in Programming Education

- https://doi.org/10.1145/3649217.3653574
- GPT-4, CodeHelp, Intro Programming
- Deployed an LLM-powered assistant (CodeHelp) that doesnt generate code, only provides "scaffolded" explanations
- Students preferred step-by-step guidance, pseudocode, and conceptual help over direct answers
- Helps students understand how and why, adapts to student level, avoids jargon
- Students want correctness and helpfulness
- 6000 queries cost $500 with GPT-4

### Patterns of Student Help-Seeking When Using a Large Language Model-Powered Programming Assistant

- https://doi.org/10.1145/3636243.3636249
- GPT-3.5, CodeHelp, CS1, Semester-long study (n=52), ~2,500 queries
- CodeHelp from above paper (web-based, LLM-powered assistant, not integrated into IDE) that never returns code, only explanations + pseudocode
- Interface: required students to fill in language, code snippet, error message, issue description
- Paper includes prompts for system!
- Most queries were debugging/implementation help, not conceptual understanding - many were low-effort
- Found positive correlation between usage and final course performance
- Suggests importance of teaching students how to ask good questions, possibly using automated scaffolding
- LLMs with guardrails can support learning without leading to over-reliance/cheating
- Idea: Query analysis to adaptively coach students on asking better questions?

### Using an LLM to Help With Code Understanding

- GPT-3.5, GILT, CS1, IDE-integrated
- GILT is an IDE-integrated LLM tool (GPT-3.5) designed to help developers understand unfamiliar code via prompt-less and prompt-based interactions
- Offers features like code summaries, domain concept help, and usage examples
- Improved task completion rate compared to web search, but did not improve speed or deep understanding
- Professionals benefited more than students, likely due to better prompt engineering skills
- Prompt-less interactions (buttons) helped students more, suggesting value in reducing prompt-writing demands
- Preference over web search because of usability and usefulness, context-aware answers are important
- Risk: Some outsource comprehension to LLMs, need for guardrails

## Architecture

### Open questions

- Open Source model vs API
  - Is using an API really more expensive? GPT-3.5-turbo: 500 Students x 100 queries x 0.003€ = 150€ for a semester
  - Renting a server for 1 month 24/7, 1€ per hour = 700€ for a month, but way more complicated setup
