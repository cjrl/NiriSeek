import Gtk from "gi://Gtk?version=4.0";

import {
  getAppName,
  getIconName,
} from "../utils/app-info.js";

export function createWindowRow(niriWindow) {
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

  const resolvedIcon = getIconName(niriWindow.app_id);
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
    label: `${getAppName(niriWindow.app_id)} • Workspace ${niriWindow.workspace_id}`,
    xalign: 0,
  });

  textContent.append(title);
  textContent.append(meta);

  content.append(icon);
  content.append(textContent);

  row.set_child(content);

  return row;
}