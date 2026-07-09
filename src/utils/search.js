function getSearchText(window) {
  return [
    window.title,
    window.app_id,
    `workspace ${window.workspace_id}`,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreWindow(window, query) {
  const normalizedQuery = query
    .trim()
    .toLowerCase();

  if (!normalizedQuery) {
    return 1;
  }

  const title =
    window.title?.toLowerCase() || "";

  const appId =
    window.app_id?.toLowerCase() || "";

  const searchText = getSearchText(window);

  if (title.startsWith(normalizedQuery)) {
    return 100;
  }

  if (appId.startsWith(normalizedQuery)) {
    return 80;
  }

  if (title.includes(normalizedQuery)) {
    return 60;
  }

  if (appId.includes(normalizedQuery)) {
    return 40;
  }

  if (searchText.includes(normalizedQuery)) {
    return 20;
  }

  return 0;
}

export function searchWindows(windows, query) {
  return windows
    .map((window) => ({
      window,
      score: scoreWindow(window, query),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.window);
}