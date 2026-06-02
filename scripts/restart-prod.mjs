/**
 * Restart Next.js production server. Default port 3000 (Caddy → levushkin.art).
 * Usage: PORT=6854 node scripts/restart-prod.mjs
 */
import { execSync } from "child_process";
import { appendFileSync, existsSync } from "fs";
import net from "net";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./load-env-local.mjs";
import { spawnDetached } from "./spawn-detached.mjs";
import { systemNodeExe } from "./system-node.mjs";

const PORT = Number(process.env.PORT || 3000);
const STOP_ONLY = process.env.STOP_ONLY === "1";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOG = path.join(ROOT, `.next-server-${PORT}.log`);
const PROCESS_LOG = path.join(ROOT, `.next-server-${PORT}.out.log`);

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
      if (res.ok) return;
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

  if (STOP_ONLY) {
    log(`Port ${PORT} is free (stop only)`);
    return;
  }

  const localEnv = loadEnvLocal(ROOT);
  const envFile = path.join(ROOT, ".env.local");
  const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const node = systemNodeExe();
  const args = existsSync(envFile)
    ? ["--env-file", envFile, nextBin, "start", "-p", String(PORT), "-H", "0.0.0.0"]
    : [nextBin, "start", "-p", String(PORT), "-H", "0.0.0.0"];

  spawnDetached({
    executable: node,
    args,
    cwd: ROOT,
    logPath: PROCESS_LOG,
    env: {
      ...process.env,
      ...localEnv,
      PORT: String(PORT),
      NODE_ENV: "production",
      NEXT_BUILD_STAGING: undefined,
      NEXT_DIST_DIR: undefined,
    },
  });
  log(`Started: ${node} ${args.join(" ")} (output: ${PROCESS_LOG})`);

  await waitForHttp();
  log(`Production server ready at http://localhost:${PORT}`);
  const lan = lanPreviewUrl();
  if (lan) {
    log(`On your phone (same Wi‑Fi): ${lan}`);
  }
}

function lanPreviewUrl() {
  const nets = os.networkInterfaces();
  for (const ifaces of Object.values(nets)) {
    if (!ifaces) continue;
    for (const iface of ifaces) {
      if (iface.family === "IPv4" && !iface.internal) {
        return `http://${iface.address}:${PORT}`;
      }
    }
  }
  return null;
}

main().catch((err) => {
  log(`ERROR: ${err.message || err}`);
  process.exit(1);
});
