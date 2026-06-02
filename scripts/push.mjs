/**
 * Build once, then restart production (3000 → levushkin.art) and local preview (6854).
 * Usage: npm run push
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORTS = [
  { port: 3000, label: "https://levushkin.art (via Caddy)" },
  { port: 6854, label: "http://localhost:6854" },
];

console.log("Building…");
execSync("npm run build", { cwd: ROOT, stdio: "inherit" });

for (const { port, label } of PORTS) {
  console.log(`\nRestarting port ${port} (${label})…`);
  execSync("node scripts/restart-prod.mjs", {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, PORT: String(port) },
  });
}

console.log("\nPush complete.");
