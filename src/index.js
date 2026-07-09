import search from "@inquirer/search";

import {
  focusWindow,
  getWindows,
} from "./services/niri.js";

import {
  searchWindows,
} from "./utils/search.js";

function formatWindow(window) {
  const current =
    window.is_focused ? " • current" : "";

  return `${window.title} — ${window.app_id} [WS ${window.workspace_id}]${current}`;
}

async function main() {
  const windows = getWindows();

  if (windows.length === 0) {
    console.log("No open windows.");
    return;
  }

  const selectedWindowId = await search({
    message: "Switch to",
    pageSize: 8,

    source: async (input = "") => {
      const matches = searchWindows(
        windows,
        input
      );

      return matches.map((window) => ({
        name: formatWindow(window),
        value: window.id,
      }));
    },
  });

  focusWindow(selectedWindowId);
}

main().catch((error) => {
  if (error?.name === "ExitPromptError") {
    process.exit(0);
  }

  console.error(
    "Switcher failed:",
    error.message
  );

  process.exit(1);
});