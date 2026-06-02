import path from "path";

/** Runtime-writable blog data (survives `next build`). */
export function blogDataDir() {
  return path.join(process.cwd(), "data", "blog");
}

export function blogStorePath() {
  return path.join(blogDataDir(), "store.json");
}
