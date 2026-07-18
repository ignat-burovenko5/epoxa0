/**
 * Restart Django API server. Default port 8000.
 * Usage: node scripts/restart-backend.mjs
 */
import { execSync } from "child_process";
import { appendFileSync, existsSync } from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./load-env-local.mjs";
import { spawnDetached } from "./spawn-detached.mjs";

const PORT = Number(process.env.BACKEND_PORT || 8000);
const STOP_ONLY = process.env.STOP_ONLY === "1";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BACKEND = path.join(ROOT, "backend");
const LOG = path.join(ROOT, `.django-server-${PORT}.log`);
const PROCESS_LOG = path.join(ROOT, `.django-server-${PORT}.out.log`);
const VENV_PYTHON = path.join(
  ROOT,
  "backend",
  process.platform === "win32" ? path.join(".venv", "Scripts", "python.exe") : path.join(".venv", "bin", "python"),
);

function pythonCmd() {
  if (existsSync(VENV_PYTHON)) return VENV_PYTHON;
  return process.platform === "win32" ? "python" : "python3";
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  appendFileSync(LOG, line);
  console.log(msg);
}

function portInUse() {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once("error", () => resolve(true));
    s.once("listening", () => {
      s.close(() => resolve(false));
    });
    s.listen(PORT, "127.0.0.1");
  });
}

function stopListener() {
  if (process.platform === "win32") {
    try {
      const ps = execSync(
        `(Get-NetTCPConnection -LocalPort ${PORT} -State Listen -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique`,
        { encoding: "utf8", shell: "powershell.exe" },
      );
      for (const pid of ps.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
          log(`Stopped PID ${pid} on port ${PORT}`);
        } catch {
          /* already gone */
        }
      }
    } catch {
      /* nothing listening */
    }
    return;
  }

  try {
    execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null`, {
      stdio: "ignore",
      shell: true,
    });
  } catch {
    /* nothing listening */
  }
}

async function waitForPortFree(maxMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (!(await portInUse())) return;
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Port ${PORT} still in use after ${maxMs}ms`);
}

async function waitForHttp(maxMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/api/blog/auth/session`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.status < 500) return;
    } catch {
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Django did not respond on port ${PORT} within ${maxMs}ms — see ${LOG}`);
}

async function main() {
  stopListener();
  await waitForPortFree();

  if (STOP_ONLY) {
    log(`Port ${PORT} is free (stop only)`);
    return;
  }

  const localEnv = loadEnvLocal(ROOT);
  const py = pythonCmd();
  const args = [
    "-m",
    "waitress",
    `--listen=127.0.0.1:${PORT}`,
    "config.wsgi:application",
  ];
  spawnDetached({
    executable: py,
    args,
    cwd: BACKEND,
    logPath: PROCESS_LOG,
    env: {
      ...process.env,
      ...localEnv,
      DJANGO_DEBUG: process.env.DJANGO_DEBUG ?? localEnv.DJANGO_DEBUG ?? "false",
    },
  });
  log(`Started: ${py} ${args.join(" ")} (output: ${PROCESS_LOG})`);

  await waitForHttp();
  log(`Django API ready at http://127.0.0.1:${PORT}`);
}

main().catch((err) => {
  log(`ERROR: ${err.message || err}`);
  process.exit(1);
});
