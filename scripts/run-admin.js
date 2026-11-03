/**
 * BATU YEHIYWOT BERHAN CHURCH — Standalone IT Admin Portal Runner
 * Runs the Admin Portal individually on port 3001 alongside Backend API (port 5000).
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const BACKEND_PORT = 5000;
const ADMIN_PORT = 3001;
const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

let backendProc = null;
let adminProc = null;

function checkBackendStatus(callback) {
  let done = false;
  const finish = (val) => {
    if (!done) {
      done = true;
      callback(val);
    }
  };

  const req = http.get(`http://127.0.0.1:${BACKEND_PORT}/api/campaign`, (res) => {
    finish(res.statusCode === 200);
  });
  req.on('error', () => {
    finish(false);
  });
  req.setTimeout(1500, () => {
    req.destroy();
    finish(false);
  });
}

function startBackend(callback) {
  console.log(`[Admin Runner] Starting Backend REST API on port ${BACKEND_PORT}...`);
  backendProc = spawn('node', ['src/server.js'], {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    shell: false,
  });

  backendProc.on('error', (err) => {
    console.error('[Admin Runner] Failed to start backend:', err);
  });

  // Wait a moment for backend to initialize
  setTimeout(callback, 2000);
}

function startAdminPortal() {
  console.log(`\n===============================================================`);
  console.log(`👑 BATU YEHIYWOT BERHAN CHURCH — Standalone IT Admin Portal`);
  console.log(`===============================================================`);
  console.log(`  🔗 IT Admin Portal: http://localhost:${ADMIN_PORT}`);
  console.log(`  🔌 Backend API:     http://localhost:${BACKEND_PORT}`);
  console.log(`  🔑 Default Access:  admin / admin123`);
  console.log(`===============================================================\n`);

  const env = {
    ...process.env,
    ADMIN_MODE: 'true',
    PORT: String(ADMIN_PORT),
    BACKEND_URL: `http://127.0.0.1:${BACKEND_PORT}`,
  };

  const isWin = process.platform === 'win32';
  const nextCmd = isWin ? 'npx.cmd' : 'npx';

  adminProc = spawn(nextCmd, ['next', 'dev', '-p', String(ADMIN_PORT)], {
    cwd: FRONTEND_DIR,
    env,
    stdio: 'inherit',
    shell: false,
  });

  adminProc.on('error', (err) => {
    console.error('[Admin Runner] Failed to start Admin Portal Next.js dev server:', err);
  });
}

function cleanup() {
  console.log('\n[Admin Runner] Shutting down services...');
  if (adminProc) {
    try {
      adminProc.kill();
    } catch (e) {}
  }
  if (backendProc) {
    try {
      backendProc.kill();
    } catch (e) {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Execution flow
checkBackendStatus((isAlive) => {
  if (isAlive) {
    console.log(`[Admin Runner] Backend API is already running on port ${BACKEND_PORT} (Healthy).`);
    startAdminPortal();
  } else {
    startBackend(() => {
      startAdminPortal();
    });
  }
});
