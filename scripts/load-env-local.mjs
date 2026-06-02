import { existsSync, readFileSync } from "fs";
import path from "path";

/** Parse `.env.local` for restart scripts (Next prod does not always inherit shell env on Windows). */
export function loadEnvLocal(root) {
  const file = path.join(root, ".env.local");
  if (!existsSync(file)) return {};

  const out = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}
