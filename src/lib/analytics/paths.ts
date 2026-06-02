import path from "path";

export function analyticsDataDir() {
  return path.join(process.cwd(), "data", "analytics");
}

export function analyticsStorePath() {
  return path.join(analyticsDataDir(), "store.json");
}
