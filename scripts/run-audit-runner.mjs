import { spawn } from 'node:child_process';

console.log('Starting preview server...');
const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--host', '127.0.0.1'], {
  stdio: 'inherit',
  shell: true,
});

await new Promise((resolve) => setTimeout(resolve, 3000));

console.log('Starting release smoke audit v2...');
const audit = spawn('node', ['scripts/release-smoke-audit-v2.mjs'], {
  stdio: 'inherit',
  shell: true,
});

audit.on('close', (code) => {
  console.log(`Audit completed with exit code ${code}`);
  server.kill('SIGTERM');
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', server.pid, '/f', '/t'], { shell: true });
  }
  process.exit(code || 0);
});
