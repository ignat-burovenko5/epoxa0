import { existsSync } from "fs";
import path from "path";

/** Prefer system Node over Cursor/VS Code shims (stable for autostart + detached children). */
export function systemNodeExe() {
  const candidates = [
    path.join(process.env.ProgramFiles || "C:\\Program Files", "nodejs", "node.exe"),
    path.join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "nodejs", "node.exe"),
    path.join(process.env.LOCALAPPDATA || "", "Programs", "node", "node.exe"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  const exe = process.execPath;
  if (!/cursor|code/i.test(exe)) return exe;
  return "node";
}
