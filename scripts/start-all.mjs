/**
 * Start all site services in the background (no build).
 * Django :8000, Next.js :3000 (prod), Next.js :6854 (local preview).
 * Usage: npm run site:start
 */
import { spawn } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runScript(rel, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [rel], {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, ...env },
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
  const buildId = path.join(ROOT, ".next-prod", "BUILD_ID");
  if (!existsSync(buildId)) {
    console.warn(
      "Warning: no production build (.next-prod/BUILD_ID). Run `npm run build` or `npm run push` first.\n",
    );
  }

  console.log("Starting Django API (background, port 8000)…");
  await runScript("scripts/restart-backend.mjs");

  console.log("\nStarting Next.js servers in background…");
  await Promise.all([
    runScript("scripts/restart-prod.mjs", { PORT: "3000" }),
    runScript("scripts/restart-prod.mjs", { PORT: "6854" }),
  ]);

  console.log("\nAll services running in background:");
  console.log("  Django API     http://127.0.0.1:8000");
  console.log("  Production     http://localhost:3000  (Caddy → https://levushkin.art)");
  console.log("  Local preview  http://localhost:6854");
  console.log("\nLogs: .django-server-8000.log, .next-server-3000.log, .next-server-6854.log");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
