#!/usr/bin/env -S gjs -m

import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import Gio from "gi://Gio";
import GLib from "gi://GLib";

function getWindows() {
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



function focusWindow(windowId) {
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

function sortByRecentFocus(windows) {
  return [...windows].sort((a, b) => {
    // Current window should come after non-focused windows
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


const iconCache = new Map();

function getDesktopApplications() {
  return Gio.AppInfo.get_all();
}

function normalizeAppId(value = "") {
  return value
    .toLowerCase()
    .replace(/\.desktop$/, "")
    .replace(/-default$/, "");
}

const appNameCache = new Map();

function getAppName(appId) {
  if (!appId) return "Unknown App";

  if (appNameCache.has(appId)) {
    return appNameCache.get(appId);
  }

  const normalizedAppId = normalizeAppId(appId);

  const applications = Gio.AppInfo.get_all();

  const exactMatch = applications.find((application) => {
    const desktopId = normalizeAppId(
      application.get_id() || ""
    );

    return desktopId === normalizedAppId;
  });

  if (exactMatch) {
    const name = exactMatch.get_display_name();

    appNameCache.set(appId, name);
    return name;
  }

  const partialMatch = applications.find((application) => {
    const desktopId = normalizeAppId(
      application.get_id() || ""
    );

    return (
      desktopId.includes(normalizedAppId) ||
      normalizedAppId.includes(desktopId)
    );
  });

  if (partialMatch) {
    const name = partialMatch.get_display_name();

    appNameCache.set(appId, name);
    return name;
  }

  const fallbackMap = [
    ["chrome-", "Google Chrome"],
    ["google-chrome", "Google Chrome"],
    ["code", "Visual Studio Code"],
    ["ghostty", "Ghostty"],
    ["kitty", "Kitty"],
    ["snap-store", "App Center"],
    ["nautilus", "Files"],
    ["opera", "Opera"],
    ["firefox", "Firefox"],
  ];

  const fallback = fallbackMap.find(([key]) =>
    normalizedAppId.includes(key)
  );

  const name = fallback?.[1] || appId;

  appNameCache.set(appId, name);

  return name;
}

function getIconName(appId) {
  if (!appId) {
    return "application-x-executable";
  }

  if (iconCache.has(appId)) {
    return iconCache.get(appId);
  }

  const normalizedAppId = normalizeAppId(appId);

  const manualMap = [
    ["google-chrome", "google-chrome"],
    ["chrome-", "google-chrome"],
    ["code", "com.visualstudio.code"],
    ["ghostty", "com.mitchellh.ghostty"],
    ["nautilus", "org.gnome.Nautilus"],
    ["opera", "opera"],
    ["firefox", "firefox"],
  ];

  const manualMatch = manualMap.find(([key]) =>
    normalizedAppId.includes(key)
  );

  if (manualMatch) {
    iconCache.set(appId, manualMatch[1]);
    return manualMatch[1];
  }

  const applications = getDesktopApplications();

  const exactMatch = applications.find((application) => {
    const desktopId = normalizeAppId(
      application.get_id() || ""
    );

    return desktopId === normalizedAppId;
  });

  if (exactMatch) {
    const icon = exactMatch.get_icon();

    if (icon) {
      iconCache.set(appId, icon);
      return icon;
    }
  }

  const partialMatch = applications.find((application) => {
    const desktopId = normalizeAppId(
      application.get_id() || ""
    );

    return (
      desktopId.includes(normalizedAppId) ||
      normalizedAppId.includes(desktopId)
    );
  });

  if (partialMatch) {
    const icon = partialMatch.get_icon();

    if (icon) {
      iconCache.set(appId, icon);
      return icon;
    }
  }

  iconCache.set(
    appId,
    "application-x-executable"
  );

  return "application-x-executable";
}


let mainWindow = null;
let windows = [];

const app = new Gtk.Application({
  application_id: "dev.mohit.NiriSeek",
  flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
});

app.connect("activate", () => {
  if (mainWindow) {
    try {
      windows = sortByRecentFocus(getWindows());

      renderWindows(
        searchEntry.get_text()
      );
    } catch (error) {
      console.error(error.message);
    }

    mainWindow.present();
    searchEntry.grab_focus();

    return;
  }

  try {
    windows = sortByRecentFocus(getWindows());
  } catch (error) {
    console.error(error.message);
    return;
  }

  const window = new Gtk.ApplicationWindow({
    application: app,
    title: "NiriSeek",
    default_width: 680,
    default_height: 120,
  });

  mainWindow = window;

  window.connect("destroy", () => {
    mainWindow = null;
  });

  const root = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 12,
    margin_top: 16,
    margin_bottom: 16,
    margin_start: 16,
    margin_end: 16,
  });

  const searchEntry = new Gtk.SearchEntry({
    placeholder_text: "Search open windows...",
  });

  const listBox = new Gtk.ListBox({
    selection_mode: Gtk.SelectionMode.SINGLE,
  });

  function getSelectedRow() {
    return listBox.get_selected_row();
  }

  function selectFirstRow() {
    const firstRow = listBox.get_row_at_index(0);

    if (firstRow) {
      listBox.select_row(firstRow);
    }
  }

  

  function moveSelection(direction) {
    const selectedRow = getSelectedRow();

    if (!selectedRow) {
      selectFirstRow();
      return;
    }

    const currentIndex = selectedRow.get_index();

    const nextRow = listBox.get_row_at_index(
      currentIndex + direction
    );

    if (nextRow) {
      listBox.select_row(nextRow);
    }
  }

  function activateSelectedWindow() {
    const selectedRow = getSelectedRow();

    if (!selectedRow) return;

    focusWindow(selectedRow.niriWindowId);
    window.close();
  }

  function renderWindows(query = "") {
    let child = listBox.get_first_child();

    while (child) {
      const next = child.get_next_sibling();

      listBox.remove(child);

      child = next;
    }

    const normalizedQuery =
      query.trim().toLowerCase();

    const matches = windows
  .filter((item) => {
    return item.app_id !== "dev.mohit.NiriSeek";
  })
  .filter((item) => {
    if (!normalizedQuery) {
      return true;
    }

    const title =
      item.title?.toLowerCase() || "";

    const appId =
      item.app_id?.toLowerCase() || "";

    return (
      title.includes(normalizedQuery) ||
      appId.includes(normalizedQuery)
    );
  });

    for (const niriWindow of matches) {
      const row = new Gtk.ListBoxRow();

      row.niriWindowId = niriWindow.id;

      const content = new Gtk.Box({
  orientation: Gtk.Orientation.HORIZONTAL,
  spacing: 12,
  margin_top: 10,
  margin_bottom: 10,
  margin_start: 12,
  margin_end: 12,
});

const resolvedIcon =
  getIconName(niriWindow.app_id);

const icon = new Gtk.Image({
  pixel_size: 32,
});

if (typeof resolvedIcon === "string") {
  icon.set_from_icon_name(resolvedIcon);
} else {
  icon.set_from_gicon(resolvedIcon);
}

const textContent = new Gtk.Box({
  orientation: Gtk.Orientation.VERTICAL,
  spacing: 4,
  hexpand: true,
});

const title = new Gtk.Label({
  label: niriWindow.title || "Untitled",
  xalign: 0,
  ellipsize: 3,
});

const meta = new Gtk.Label({
  label:
    `${getAppName(niriWindow.app_id)} • Workspace ${niriWindow.workspace_id}`,
  xalign: 0,
});

textContent.append(title);
textContent.append(meta);

content.append(icon);
content.append(textContent);

row.set_child(content);
      listBox.append(row);
    }

    selectFirstRow();
  }

  searchEntry.connect("search-changed", () => {
    renderWindows(searchEntry.get_text());
  });

  listBox.connect("row-activated", (_, row) => {
    if (!row) return;

    focusWindow(row.niriWindowId);
    window.close();
  });

const keyController = new Gtk.EventControllerKey();

keyController.set_propagation_phase(
  Gtk.PropagationPhase.CAPTURE
);

keyController.connect(
  "key-pressed",
  (_, keyval) => {
    if (keyval === Gdk.KEY_Down) {
      moveSelection(1);
      return true;
    }

    if (keyval === Gdk.KEY_Up) {
      moveSelection(-1);
      return true;
    }

    if (
      keyval === Gdk.KEY_Return ||
      keyval === Gdk.KEY_KP_Enter
    ) {
      activateSelectedWindow();
      return true;
    }

    if (keyval === Gdk.KEY_Escape) {
      window.close();
      return true;
    }

    return false;
  }
);

  window.add_controller(keyController);

  root.append(searchEntry);
  root.append(listBox);

  window.set_child(root);

  renderWindows();

  window.present();
  searchEntry.grab_focus();
});

app.run([]);