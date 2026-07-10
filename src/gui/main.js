#!/usr/bin/env -S gjs -m

import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import Gio from "gi://Gio";

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

let mainWindow = null;

const app = new Gtk.Application({
  application_id: "dev.mohit.NiriSeek",
  flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
});

app.connect("activate", () => {
  if (mainWindow) {
    mainWindow.present();
    return;
  }

  let windows;

  try {
    windows = getWindows();
  } catch (error) {
    console.error(error.message);
    return;
  }

  const window = new Gtk.ApplicationWindow({
    application: app,
    title: "NiriSeek",
    default_width: 680,
    default_height: 480,
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

    const matches = windows.filter((item) => {
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
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 4,
        margin_top: 10,
        margin_bottom: 10,
        margin_start: 12,
        margin_end: 12,
      });

      const title = new Gtk.Label({
        label: niriWindow.title || "Untitled",
        xalign: 0,
        ellipsize: 3,
      });

      const meta = new Gtk.Label({
        label:
          `${niriWindow.app_id} • Workspace ${niriWindow.workspace_id}`,
        xalign: 0,
      });

      content.append(title);
      content.append(meta);

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

  window.add_controller(keyController);

  root.append(searchEntry);
  root.append(listBox);

  window.set_child(root);

  renderWindows();

  window.present();
  searchEntry.grab_focus();
});

app.run([]);