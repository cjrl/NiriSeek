import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import Gio from "gi://Gio";

let stylesLoaded = false;

export function loadStyles() {
  if (stylesLoaded) {
    return;
  }

  const provider = new Gtk.CssProvider();

  const currentFile = Gio.File.new_for_uri(import.meta.url);

  const utilsDir = currentFile.get_parent();

  const guiDir = utilsDir.get_parent();

  const cssFile = guiDir
    .get_child("styles")
    .get_child("main.css");

  provider.load_from_path(cssFile.get_path());

  const display = Gdk.Display.get_default();

  if (!display) {
    throw new Error("Could not get default GDK display");
  }

  Gtk.StyleContext.add_provider_for_display(
    display,
    provider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
  );

  stylesLoaded = true;
}