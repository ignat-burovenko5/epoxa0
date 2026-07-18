/**
 * Restart local CMS/storefront preview (`next dev` on 127.0.0.1:3771).
 * Loads env via process env (not `node --env-file`) so Turbopack workers stay happy.
 */
import { execSync } from "child_process";
import { appendFileSync, truncateSync, writeFileSync } from "fs";
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
  try {
    execSync(`lsof -ti:${PORT} | xargs -r kill -9`, { stdio: "ignore", shell: true });
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

async function waitForHttp(maxMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok || (res.status >= 200 && res.status < 500)) return;
    } catch {
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Preview did not respond on :${PORT} — see ${PROCESS_LOG}`);
}

function scrubNodeOptions(value) {
  if (!value) return undefined;
  const cleaned = value
    .split(/\s+/)
    .filter((part) => part && !part.startsWith("--env-file"))
    .join(" ")
    .trim();
  return cleaned || undefined;
}

async function main() {
  stopListener();
  await waitForPortFree();

  try {
    writeFileSync(PROCESS_LOG, "");
  } catch {
    truncateSync(PROCESS_LOG, 0);
  }

  const localEnv = loadEnvLocal(ROOT);
  const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const node = systemNodeExe();
  const args = [nextBin, "dev", "-p", String(PORT), "-H", "127.0.0.1"];

  const env = {
    ...process.env,
    ...localEnv,
    PORT: String(PORT),
    NODE_ENV: "development",
  };
  delete env.NEXT_BUILD_STAGING;
  delete env.NEXT_DIST_DIR;
  const nodeOptions = scrubNodeOptions(env.NODE_OPTIONS);
  if (nodeOptions) env.NODE_OPTIONS = nodeOptions;
  else delete env.NODE_OPTIONS;

  spawnDetached({
    executable: node,
    args,
    cwd: ROOT,
    logPath: PROCESS_LOG,
    env,
  });
  log(`Started preview: ${node} ${args.join(" ")} (output: ${PROCESS_LOG})`);
  await waitForHttp();
  log(`Preview ready at http://127.0.0.1:${PORT}`);
}

main().catch((err) => {
  log(`ERROR: ${err.message || err}`);
  process.exit(1);
});
