/**
 * Stop all site background services.
 * Usage: npm run site:stop
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runScript(rel, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [rel], {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, STOP_ONLY: "1", ...env },
      shell: false,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${rel} exited with code ${code}`));
    });
  });
}

async function main() {
  console.log("Stopping Django API (8000)…");
  await runScript("scripts/restart-backend.mjs");

  for (const port of [3000, 6854]) {
    console.log(`Stopping Next.js (${port})…`);
    await runScript("scripts/restart-prod.mjs", { PORT: String(port) });
  }

  console.log("\nAll site services stopped.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
