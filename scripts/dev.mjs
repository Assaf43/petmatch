// Starts the API and the web app together for local use: `npm run dev`.
import { spawn } from 'node:child_process';

const SERVICES = [
  { name: 'api', workspace: '@petmatch/api' },
  { name: 'web', workspace: '@petmatch/web' },
];

// 3000 is a popular port that other local projects often hold, so the API defaults to 3100 here.
// Set PORT yourself to use another one; the web app is pointed at whatever the API uses.
const apiPort = process.env.PORT ?? '3100';
const env = {
  ...process.env,
  PORT: apiPort,
  VITE_API_URL: process.env.VITE_API_URL ?? `http://localhost:${apiPort}`,
};

const children = SERVICES.map(({ name, workspace }) => {
  const child = spawn('npm', ['run', 'dev', '-w', workspace], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env,
  });
  const prefix = (stream, target) => {
    let pending = '';
    stream.on('data', (chunk) => {
      pending += chunk.toString();
      const lines = pending.split('\n');
      pending = lines.pop() ?? '';
      for (const line of lines) target.write(`[${name}] ${line}\n`);
    });
  };
  prefix(child.stdout, process.stdout);
  prefix(child.stderr, process.stderr);
  child.on('exit', (code) => {
    if (!stopping) {
      console.error(`[${name}] stopped (exit ${code}); stopping the rest`);
      stop(code ?? 1);
    }
  });
  return child;
});

let stopping = false;
function stop(code) {
  stopping = true;
  for (const child of children) {
    if (child.pid === undefined || child.exitCode !== null) continue;
    if (process.platform === 'win32') {
      // npm runs a tree of processes on Windows; kill the whole tree.
      spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
  }
  setTimeout(() => process.exit(code), 500);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
