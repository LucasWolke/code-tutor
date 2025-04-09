// sandbox.js
const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Helper: Execute a command with a timeout.
function runCommand(command, args, options, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Process timed out'));
    }, timeoutMs);

    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

app.post('/execute', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  // Create an isolated temporary directory for the code
  const tempDir = path.join(os.tmpdir(), 'java-sandbox', uuidv4());
  fs.mkdirSync(tempDir, { recursive: true });

  // Write the provided code into Main.java.
  // Expecting a public class named Main.
  const javaFile = path.join(tempDir, 'Main.java');
  fs.writeFileSync(javaFile, code);

  try {
    // Compile the Java code with a 10-second timeout.
    const compileResult = await runCommand('javac', ['Main.java'], { cwd: tempDir }, 10000);
    if (compileResult.code !== 0) {
      return res.status(400).json({ error: 'Compilation failed', details: compileResult.stderr });
    }

    // Run the compiled class with a 5-second timeout.
    // Note: For a production system, load a security policy via -Djava.security.policy.
    const runResult = await runCommand('java', ['-Djava.security.manager', 'Main'], { cwd: tempDir }, 5000);
    res.json({
      output: runResult.stdout,
      error: runResult.stderr,
      exitCode: runResult.code
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Java sandbox server listening on port ${PORT}`);
});
