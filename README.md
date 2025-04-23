# Code Tutor 💻

Code Tutor is a web-based IDE for learning and practicing Java, featuring an integrated AI Tutor.

## Features

- **Editor**: Provides a code editor with Java syntax highlighting and IntelliSense.
- **AI Chat Tutor**: The tutor engages in conversation, applying the principle of minimal help by utilizing multiple AI agents to provide only necessary guidance.
- **Language Server Protocol (LSP)**: Offers real-time diagnostics and autocompletions.
- **Code Execution**: Executes Java code and displays output.

## Tech Stack

- **Frontend**: Next.js (React, TypeScript), TailwindCSS, shadcn/ui, Zustand
- **Editor**: Monaco Editor
- **Backend Services**: Node.js, Express
- **Language Server**: Eclipse JDT LS (proxied via WebSocket)
- **Code Execution**: Docker
- **AI**: Currently uses Google Gemini API

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

    Create a `.env` file in the project root and add your LLM API keys:

    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run the development environment:**

    This command starts the frontend (Next.js) and backend services (LSP, Code Execution Sandbox via Docker) concurrently.

    ```bash
    npm run dev
    ```

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
