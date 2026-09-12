#!/usr/bin/env node
// ============================================================================
// Build-time wrapper for the legacy URL gate (see docs/legacy-urls.md).
//
//   npm run verify:redirects:build
//
// Starts the production build that `next build` produced on a spare port,
// waits until it answers, runs scripts/verify-redirects.mjs against it with
// the original Host header (so the www → apex rule is exercised too), then
// stops the server and exits with the verifier's status. Run it after
// `npm run build` — locally before a release, or as the last step of a CI
// job — so a redirect regression fails the build instead of shipping.
//
//   --port <n>   Port for the temporary server (default 3999).
//   Any other argument is passed through to the verifier (--json, --no-junk…).
// ============================================================================
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const portIdx = args.indexOf('--port');
const PORT = portIdx > -1 ? args[portIdx + 1] : '3999';
const passthrough = args.filter((a, i) => !(i === portIdx || i === portIdx + 1));
const BASE = `http://localhost:${PORT}`;

const server = spawn('npx', ['next', 'start', '-p', PORT], { stdio: ['ignore', 'pipe', 'inherit'] });
server.stdout.on('data', () => {});

async function waitForServer(timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/en`, { redirect: 'manual' });
      if (res.status > 0) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server on ${BASE} did not come up within ${timeoutMs / 1000}s`);
}

function stop() {
  if (!server.killed) server.kill('SIGTERM');
}
process.on('exit', stop);
process.on('SIGINT', () => {
  stop();
  process.exit(130);
});

try {
  await waitForServer();
  const verifier = spawn(
    process.execPath,
    ['scripts/verify-redirects.mjs', '--base', BASE, '--host-header', ...passthrough],
    { stdio: 'inherit' },
  );
  const code = await new Promise((resolve) => verifier.on('exit', resolve));
  stop();
  process.exit(code ?? 1);
} catch (err) {
  console.error(err?.message || err);
  stop();
  process.exit(1);
}
