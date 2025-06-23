# Code Tutor 💻

Code Tutor is a web-based IDE for learning and practicing Java, featuring an integrated AI Tutor.

## Features

- **Editor**: Provides a code editor with Java syntax highlighting and IntelliSense.
- **AI Chat Tutor**: The tutor engages in conversation, applying the principle of minimal help by utilizing multiple AI agents to provide only necessary guidance.
- **Language Server Protocol (LSP)**: Offers real-time IntelliSense and autocompletions.
- **Code Execution**: Executes Java test cases.

## Tech Stack

- **Frontend**: Next.js (TypeScript), TailwindCSS
- **Editor**: Monaco Editor
- **Language Server**: Eclipse JDT LS
- **Code Execution**: Uses [Piston](https://github.com/engineer-man/piston)
- **AI**: Supports Google Gemini and OpenAI LLM models

## Wiki

An overview of the systems architecture and more can be found in the [Project Wiki](https://github.com/LucasWolke/code-tutor/wiki/).

## Getting Started

### Prerequisites

- npm
- Docker Desktop

### Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/LucasWolke/code-tutor.git
    cd code-tutor
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in the project root and add your LLM API keys and backend URLS (only if not using local Docker containers):

    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    OPENAI_API_KEY=your_openai_api_key_here
    PISTON_URL="https://emkc.org/api/v2/piston/execute"
    LSP_URL=your_language_server_url_here
    ```

4.  **Run the development environment:**

    This command starts the frontend (Next.js) and backend services (LSP, Code Execution via Piston) concurrently.

    ```bash
    npm run start
    ```

    Send a POST request to `http://localhost:2000/api/v2/packages` with the desired language and version (e.g., {"language": "java", "version": "15.0.2"}) to install a runtime package.

5.  **Access the application:**

    Open your browser and navigate to `http://localhost:3000`.

6.  **Stopping the services:**

    To stop the backend Docker containers:

    ```bash
    npm run stop:services
    ```

    Use `Ctrl+C` in the terminal where `npm run dev` is running to stop the frontend.

## License

This project is licensed under the [MIT License](./LICENSE).
