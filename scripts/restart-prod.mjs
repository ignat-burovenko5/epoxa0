/**
 * Restart Next.js production server on port 3000 (Caddy → levushkin.art).
 * Usage: node scripts/restart-prod.mjs
 */
import { execSync, spawn } from "child_process";
import { appendFileSync } from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOG = path.join(ROOT, ".next-prod.log");

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

async function waitForHttp(maxMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.status < 500) return;
    } catch {
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not respond on port ${PORT} within ${maxMs}ms — see ${LOG}`);
}

async function main() {
  stopListener();
  await waitForPortFree();

  const cmd = `npx next start -p ${PORT}`;
  const child = spawn(cmd, [], {
    cwd: ROOT,
    detached: true,
    stdio: "ignore",
    shell: true,
    windowsHide: true,
  });
  child.unref();
  log(`Started: ${cmd}`);

  await waitForHttp();
  log(`Production server ready at http://localhost:${PORT}`);
}

main().catch((err) => {
  log(`ERROR: ${err.message || err}`);
  process.exit(1);
});
