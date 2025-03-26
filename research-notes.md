# Research Notes

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
