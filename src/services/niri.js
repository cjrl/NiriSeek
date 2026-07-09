import { execFileSync } from "node:child_process";

export function getWindows() {
  const output = execFileSync(
    "niri",
    ["msg", "--json", "windows"],
    {
      encoding: "utf8",
    }
  );

  return JSON.parse(output);
}

export function focusWindow(windowId) {
  execFileSync(
    "niri",
    [
      "msg",
      "action",
      "focus-window",
      "--id",
      String(windowId),
    ],
    {
      stdio: "ignore",
    }
  );
}