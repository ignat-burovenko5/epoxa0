/**
 * Spawn a long-lived background process (Windows-safe: no shell wrapper).
 */
import { spawn } from "child_process";
import { openSync } from "fs";

/**
 * @param {{ executable: string, args: string[], cwd: string, env?: NodeJS.ProcessEnv, logPath: string }} opts
 */
export function spawnDetached({ executable, args, cwd, env, logPath }) {
  const out = openSync(logPath, "a");
  const child = spawn(executable, args, {
    cwd,
    env,
    detached: true,
    stdio: ["ignore", out, out],
    windowsHide: true,
  });
  child.unref();
  return child;
}
