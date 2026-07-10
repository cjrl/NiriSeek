import Gio from "gi://Gio";

export function getWindows() {
  const subprocess = new Gio.Subprocess({
    argv: ["niri", "msg", "--json", "windows"],
    flags:
      Gio.SubprocessFlags.STDOUT_PIPE |
      Gio.SubprocessFlags.STDERR_PIPE,
  });

  subprocess.init(null);

  const [, stdout, stderr] =
    subprocess.communicate_utf8(null, null);

  if (!subprocess.get_successful()) {
    throw new Error(
      stderr || "Failed to get Niri windows"
    );
  }

  return JSON.parse(stdout);
}

export function focusWindow(windowId) {
  const subprocess = new Gio.Subprocess({
    argv: [
      "niri",
      "msg",
      "action",
      "focus-window",
      "--id",
      String(windowId),
    ],
    flags: Gio.SubprocessFlags.NONE,
  });

  subprocess.init(null);
}