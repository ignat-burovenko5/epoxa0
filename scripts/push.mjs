/**
 * Zero-downtime deploy: build to .next-staging while servers keep running,
 * then swap builds and restart (seconds of downtime, not the whole build).
 *
 * Usage: npm run push
 *   PUSH_BACKEND=1  — also restart Django after deploy (API code changed)
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import {
  discardPrevBuild,
  rollbackNextBuild,
  STAGING_DIR,
  stagingBuildReady,
  swapNextBuild,
} from "./lib/swap-next-build.mjs";
import { acquirePushLock } from "./lib/push-lock.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESTART_BACKEND =
  process.argv.includes("--backend") || process.env.PUSH_BACKEND === "1";
const PORTS = [
  { port: 3000, label: "https://levushkin.art (via Caddy)" },
  { port: 6854, label: "http://localhost:6854" },
];

function runScript(rel, env = {}) {
  const childEnv = { ...process.env, ...env };
  delete childEnv.NEXT_BUILD_STAGING;
  delete childEnv.NEXT_DIST_DIR;
  execSync(`node ${rel}`, {
    cwd: ROOT,
    stdio: "inherit",
    env: childEnv,
  });
}

function stopPort(port) {
  console.log(`Stopping port ${port}…`);
  runScript("scripts/restart-prod.mjs", {
    PORT: String(port),
    STOP_ONLY: "1",
  });
}

function startPort(port, label) {
  console.log(`Starting port ${port} (${label})…`);
  runScript("scripts/restart-prod.mjs", { PORT: String(port) });
}

function restartBackend() {
  console.log("\nRestarting Django API (http://127.0.0.1:8000)…");
  runScript("scripts/restart-backend.mjs");
}

async function main() {
  const releaseLock = await acquirePushLock(ROOT);
  try {
    await deploy();
  } finally {
    releaseLock();
  }
}

async function deploy() {
  console.log(
    `Building to ${STAGING_DIR} (site stays online on the current build)…`,
  );
  execSync("npm run build", {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, NEXT_BUILD_STAGING: "1" },
  });

  delete process.env.NEXT_BUILD_STAGING;
  delete process.env.NEXT_DIST_DIR;

  if (!stagingBuildReady(ROOT)) {
    throw new Error("Build finished but staging BUILD_ID is missing");
  }

  console.log("\nSwapping build and restarting Next.js (brief cutover)…");
  for (const { port } of PORTS) {
    stopPort(port);
  }

  swapNextBuild(ROOT);

  try {
    for (const { port, label } of PORTS) {
      startPort(port, label);
    }
  } catch (err) {
    console.error("Start failed — rolling back to previous build…");
    try {
      rollbackNextBuild(ROOT);
      for (const { port, label } of PORTS) {
        startPort(port, label);
      }
    } catch (rollbackErr) {
      console.error(rollbackErr.message || rollbackErr);
    }
    throw err;
  }

  discardPrevBuild(ROOT);

  // Old deploys used `.next` as the live dir — remove leftover prod trees so
  // `next dev` can own `.next` again without colliding with BUILD_ID artifacts.
  try {
    const legacyNext = path.join(ROOT, ".next");
    const legacyBuildId = path.join(legacyNext, "BUILD_ID");
    if (existsSync(legacyBuildId)) {
      rmSync(legacyNext, { recursive: true, force: true });
      console.log("Cleared legacy production tree from .next (dev cache path).");
    }
  } catch (err) {
    console.warn("Could not clear legacy .next:", err?.message || err);
  }

  // Preview (`next dev` on :3771) keeps working after deploy.
  try {
    execSync("ss -ltn '( sport = :3771 )'", { stdio: "ignore" });
    console.log("\nRestarting preview on :3771…");
    try {
      execSync("fuser -k 3771/tcp", { stdio: "ignore" });
    } catch {
      /* nothing listening */
    }
    runScript("scripts/restart-preview-3771.mjs");
  } catch {
    /* preview not running — skip */
  }

  if (RESTART_BACKEND) {
    restartBackend();
  } else {
    console.log(
      "\nDjango left running (no API restart). Set PUSH_BACKEND=1 if backend code changed.",
    );
  }

  console.log("\nPush complete.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
