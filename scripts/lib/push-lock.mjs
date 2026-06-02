import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";

const LOCK_DIR = ".push-lock";
const LOCK_FILE = "push.lock";
const STALE_MS = 15 * 60 * 1000;
const POLL_MS = 3000;
const MAX_WAIT_MS = 12 * 60 * 1000;

function lockPath(root) {
  return path.join(root, LOCK_DIR, LOCK_FILE);
}

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readLock(root) {
  const file = lockPath(root);
  if (!existsSync(file)) return null;
  try {
    const raw = readFileSync(file, "utf8").trim();
    const [pidStr, startedAtStr] = raw.split(/\s+/);
    const pid = Number(pidStr);
    const startedAt = Number(startedAtStr);
    if (!Number.isFinite(pid) || !Number.isFinite(startedAt)) return { stale: true };
    return { pid, startedAt, stale: Date.now() - startedAt > STALE_MS || !pidAlive(pid) };
  } catch {
    return { stale: true };
  }
}

function writeLock(root) {
  const dir = path.join(root, LOCK_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(lockPath(root), `${process.pid} ${Date.now()}\n`, "utf8");
}

function clearLock(root) {
  try {
    rmSync(lockPath(root), { force: true });
  } catch {
    /* ignore */
  }
}

export async function acquirePushLock(root) {
  const deadline = Date.now() + MAX_WAIT_MS;
  while (true) {
    const current = readLock(root);
    if (!current) {
      writeLock(root);
      const verify = readLock(root);
      if (verify?.pid === process.pid) return () => clearLock(root);
      continue;
    }
    if (current.stale) {
      clearLock(root);
      continue;
    }
    if (current.pid === process.pid) return () => clearLock(root);
    if (Date.now() >= deadline) {
      throw new Error(
        `Another deploy is running (PID ${current.pid}). Stop it or wait, then retry push.`,
      );
    }
    console.log(`Waiting for deploy PID ${current.pid}…`);
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
}
