import {
  getWindows as getWindowsFromIpc,
} from "./ipc.js";

export const NIRI_SEEK_APP_ID =
  "dev.mohit.NiriSeek";

function matchesQuery(window, normalizedQuery) {
  if (!normalizedQuery) {
    return true;
  }

  const title = window.title?.toLowerCase() || "";
  const appId = window.app_id?.toLowerCase() || "";

  return (
    title.includes(normalizedQuery) ||
    appId.includes(normalizedQuery)
  );
}

export function sortByRecentFocus(windows) {
  return [...windows].sort((a, b) => {
    if (a.is_focused !== b.is_focused) {
      return a.is_focused ? 1 : -1;
    }

    const aSecs = a.focus_timestamp?.secs ?? 0;
    const bSecs = b.focus_timestamp?.secs ?? 0;

    if (aSecs !== bSecs) {
      return bSecs - aSecs;
    }

    const aNanos = a.focus_timestamp?.nanos ?? 0;
    const bNanos = b.focus_timestamp?.nanos ?? 0;

    return bNanos - aNanos;
  });
}

export function filterWindows(windows, query = "") {
  const normalizedQuery = query.trim().toLowerCase();

  return windows.filter((window) => {
    if (window.app_id === NIRI_SEEK_APP_ID) {
      return false;
    }

    return matchesQuery(window, normalizedQuery);
  });
}

export function getWindows() {
  return getWindowsFromIpc();
}