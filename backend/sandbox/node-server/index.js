const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'https://code-tutor-jade.vercel.app']
}));
app.use(express.json({ limit: '100kb' }));

const docker = new Docker();  // assumes /var/run/docker.sock
let active = 0;
const MAX_CONTAINERS = 2;

app.post('/execute', async (req, res) => {
    if (active >= MAX_CONTAINERS) {
        return res.status(429).json({ error: 'Too many concurrent runs. Please try again shortly.' });
    }
    active++;

    const { source, stdin = '', timeoutMs = 20000 } = req.body;
    if (typeof source !== 'string' || source.length > 50_000) {
        active--;
        return res.status(400).json({ error: 'Invalid source code.' });
    }

    // prepare temp dir
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sandbox-'));
    const codeFile = path.join(tmpDir, 'Main.java');
    const inputFile = path.join(tmpDir, 'input.txt');

    try {
        await fs.writeFile(codeFile, source);
        await fs.writeFile(inputFile, stdin);

        const container = await docker.createContainer({
            Image: 'java-sandbox:latest',
            HostConfig: {
                NetworkMode: 'none',
                Memory: 256 * 1024 * 1024,
                CpuShares: 256
            },
            Env: [`TIMEOUT=${Math.ceil(timeoutMs / 1000)}`],
            WorkingDir: '/sandbox'
        });

        const tar = require('tar-fs');
        const pack = tar.pack(tmpDir);
        await container.putArchive(pack, { path: '/sandbox' });

        const attachOpts = { stream: true, stdout: true, stderr: true };
        const logStream = await container.attach(attachOpts);

        // demux into two Writable streams to accumulate stdout
        let output = '';
        const stdoutCollector = {
            write: chunk => { output += chunk.toString(); }
        };
        const stderrCollector = {
            write: chunk => { output += chunk.toString(); }  // or separate if you want
        };
        // strip the 8-byte headers automatically with demuxStream
        container.modem.demuxStream(logStream, stdoutCollector, stderrCollector);

        await container.start();
        // wait for the container to finish, but kill it after timeoutMs
        let timedOut = false;
        const waitPromise = container.wait();
        const killer = new Promise(resolve => {
            setTimeout(async () => {
                timedOut = true;
                try { await container.kill(); } catch (_) { /* might already be dead */ }
                resolve();
            }, timeoutMs);
        });
        await Promise.race([waitPromise, killer]);

        // 4) respond based on timeout vs normal exit
        if (timedOut) {
            res.status(408).json({ error: 'Execution timed out.' });
        } else {
            res.json({ output });
        }
        await container.remove({ force: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
        active--;
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Executor API listening on http://localhost:${PORT}`);
});
