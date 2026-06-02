/**
 * Production-only zero-downtime deploy (port 3000 → levushkin.art).
 * Usage: npm run deploy
 *   PUSH_BACKEND=1  — also restart Django
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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESTART_BACKEND =
  process.argv.includes("--backend") || process.env.PUSH_BACKEND === "1";
const PORT = 3000;

function runScript(rel, env = {}) {
  execSync(`node ${rel}`, {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

async function main() {
  console.log(
    `Building to ${STAGING_DIR} (production stays online during build)…`,
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

  console.log(`\nSwapping build and restarting port ${PORT}…`);
  runScript("scripts/restart-prod.mjs", {
    PORT: String(PORT),
    STOP_ONLY: "1",
  });

  swapNextBuild(ROOT);

  try {
    runScript("scripts/restart-prod.mjs", { PORT: String(PORT) });
  } catch (err) {
    console.error("Start failed — rolling back…");
    rollbackNextBuild(ROOT);
    runScript("scripts/restart-prod.mjs", { PORT: String(PORT) });
    throw err;
  }

  discardPrevBuild(ROOT);

  if (RESTART_BACKEND) {
    console.log("\nRestarting Django API…");
    runScript("scripts/restart-backend.mjs");
  }

  console.log("\nDeploy complete.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
