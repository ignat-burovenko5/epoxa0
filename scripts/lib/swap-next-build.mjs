/**
 * Atomically promote a staging Next build (.next-staging → .next-prod).
 * Keeps the previous build in .next-prev for rollback.
 * Dev/Turbopack cache stays in `.next` and is never swapped.
 */
import { existsSync, renameSync, rmSync } from "fs";
import path from "path";

export const STAGING_DIR = ".next-staging";
export const PREV_DIR = ".next-prev";
export const LIVE_DIR = ".next-prod";

export function stagingBuildReady(root) {
  return existsSync(path.join(root, STAGING_DIR, "BUILD_ID"));
}

export function swapNextBuild(root) {
  const live = path.join(root, LIVE_DIR);
  const staging = path.join(root, STAGING_DIR);
  const prev = path.join(root, PREV_DIR);

  if (!stagingBuildReady(root)) {
    throw new Error(`Missing ${STAGING_DIR}/BUILD_ID — build did not finish`);
  }

  if (existsSync(prev)) {
    rmSync(prev, { recursive: true, force: true });
  }
  if (existsSync(live)) {
    renameSync(live, prev);
  }
  renameSync(staging, live);
}

export function rollbackNextBuild(root) {
  const live = path.join(root, LIVE_DIR);
  const staging = path.join(root, STAGING_DIR);
  const prev = path.join(root, PREV_DIR);

  if (!existsSync(prev)) {
    throw new Error("No .next-prev backup to roll back to");
  }

  if (existsSync(live)) {
    if (!existsSync(staging)) {
      renameSync(live, staging);
    } else {
      rmSync(live, { recursive: true, force: true });
    }
  }
  renameSync(prev, live);
}

export function discardPrevBuild(root) {
  const prev = path.join(root, PREV_DIR);
  if (existsSync(prev)) {
    rmSync(prev, { recursive: true, force: true });
  }
}
