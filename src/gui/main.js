#!/usr/bin/env -S gjs -m

import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import Gio from "gi://Gio";
import {
  loadStyles,
} from "./utils/styles.js";

import {
  createWindowRow,
} from "./components/window-row.js";

import {
  focusWindow,
} from "../niri/ipc.js";

import {
  filterWindows,
  getWindows,
  sortByRecentFocus,
} from "../niri/windows.js";

let mainWindow = null;
let searchEntry = null;
let listBox = null;
let windows = [];

const app = new Gtk.Application({
  application_id: "dev.mohit.NiriSeek",
  flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
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
  mainWindow.hide();
}

function renderWindows(query = "") {
  let child = listBox.get_first_child();

  while (child) {
    const next = child.get_next_sibling();

    listBox.remove(child);

    child = next;
  }

  const matches = filterWindows(windows, query);

  for (const niriWindow of matches) {
    listBox.append(createWindowRow(niriWindow));
  }

  selectFirstRow();
}

// Builds the window and all its widgets exactly once per process lifetime.
// Called only the first time the app is activated; every later activation
// (Mod+Tab again) reuses this same window instead of rebuilding it.
function buildWindow() {
  const window = new Gtk.ApplicationWindow({
    application: app,
    title: "NiriSeek",
    default_width: 680,
    default_height: 120,
  });

  mainWindow = window;

  // Keep the app process alive after the window is hidden, so re-launching
  // is an instant D-Bus "activate" to this same process instead of a cold
  // GJS/GTK4 restart. Only an actual "destroy" (not our hide() calls below)
  // should ever clear mainWindow.
  app.hold();

  window.connect("destroy", () => {
    mainWindow = null;
  });

  // Also catch window-manager-initiated close (e.g. a CSD close button) and
  // just hide instead of letting it fall through to the default destroy.
  window.connect("close-request", () => {
    window.hide();
    return true;
  });

  const root = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 12,
    margin_top: 16,
    margin_bottom: 16,
    margin_start: 16,
    margin_end: 16,
  });
  root.add_css_class("niriseek-root");

  searchEntry = new Gtk.SearchEntry({
    placeholder_text: "Search open windows...",
  });
  searchEntry.add_css_class("niriseek-search");

  listBox = new Gtk.ListBox({
    selection_mode: Gtk.SelectionMode.SINGLE,
  });
  listBox.add_css_class("niriseek-list");

  searchEntry.connect("search-changed", () => {
    renderWindows(searchEntry.get_text());
  });

  listBox.connect("row-activated", (_, row) => {
    if (!row) return;

    focusWindow(row.niriWindowId);
    window.hide();
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
        window.hide();
        return true;
      }

      return false;
    }
  );

  window.add_controller(keyController);

  root.append(searchEntry);
  root.append(listBox);

  window.set_child(root);
}

app.connect("activate", () => {
  loadStyles();

  try {
    windows = sortByRecentFocus(getWindows());
  } catch (error) {
    console.error(error.message);
    if (!mainWindow) return;
  }

  if (!mainWindow) {
    buildWindow();
  }

  renderWindows(searchEntry.get_text());

  mainWindow.present();
  searchEntry.grab_focus();
});

app.run([]);
