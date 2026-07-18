/**
 * Restart local CMS/storefront preview (`next dev` on 127.0.0.1:3771).
 */
import { execSync } from "child_process";
import { appendFileSync, existsSync } from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./load-env-local.mjs";
import { spawnDetached } from "./spawn-detached.mjs";
import { systemNodeExe } from "./system-node.mjs";

const PORT = 3771;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOG = path.join(ROOT, `.next-server-${PORT}.log`);
const PROCESS_LOG = "/tmp/epoxa-dev-3771.log";

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
  try {
    execSync(`fuser -k ${PORT}/tcp`, { stdio: "ignore" });
  } catch {
    /* nothing listening */
  }
}

async function waitForPortFree(maxMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (!(await portInUse())) return;
    await new Promise((r) => setTimeout(r, 300));
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
      if (res.ok || res.status < 500) return;
    } catch {
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Preview did not respond on :${PORT} — see ${PROCESS_LOG}`);
}

async function main() {
  stopListener();
  await waitForPortFree();

  const localEnv = loadEnvLocal(ROOT);
  const envFile = path.join(ROOT, ".env.local");
  const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const node = systemNodeExe();
  const args = existsSync(envFile)
    ? [
        "--env-file",
        envFile,
        nextBin,
        "dev",
        "-p",
        String(PORT),
        "-H",
        "127.0.0.1",
      ]
    : [nextBin, "dev", "-p", String(PORT), "-H", "127.0.0.1"];

  spawnDetached({
    executable: node,
    args,
    cwd: ROOT,
    logPath: PROCESS_LOG,
    env: {
      ...process.env,
      ...localEnv,
      PORT: String(PORT),
      NODE_ENV: "development",
      NEXT_BUILD_STAGING: undefined,
      NEXT_DIST_DIR: undefined,
    },
  });
  log(`Started preview: ${node} ${args.join(" ")} (output: ${PROCESS_LOG})`);
  await waitForHttp();
  log(`Preview ready at http://127.0.0.1:${PORT}`);
}

main().catch((err) => {
  log(`ERROR: ${err.message || err}`);
  process.exit(1);
});
