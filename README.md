# NiriSeek

A fast, keyboard-first window switcher built specifically for the [Niri](https://github.com/YaLTeR/niri) Wayland compositor.

NiriSeek lets you quickly search, navigate, and focus open windows across Niri workspaces using a lightweight native GTK4 interface.

Press `Mod + Tab`, type a window name, and jump directly to it.

> Built for personal use on Niri, then polished into something worth sharing.

---

## Preview

<!-- Add your screenshot here -->

```text
Mod + Tab
    ↓
NiriSeek opens
    ↓
Type to search
    ↓
↑ / ↓ to navigate
    ↓
Enter to focus
```

---

## Features

- Native GTK4 interface
- Built with JavaScript using GJS
- Direct integration with Niri IPC
- Search open windows by title
- Search using application IDs
- Keyboard-first navigation
- Mouse activation support
- Cross-workspace window focusing
- MRU-style recent-window sorting
- Currently focused window is deprioritized
- Automatic application icon resolution
- Human-readable application names
- Workspace information
- Dark transparent GTK theme
- Floating window integration with Niri
- Fresh window state on repeated launch
- No Electron
- No frontend framework
- No npm runtime dependencies

---

## Keyboard Controls

| Key | Action |
| --- | --- |
| `Mod + Tab` | Open or relaunch NiriSeek |
| `↑` | Select previous window |
| `↓` | Select next window |
| `Enter` | Focus selected window |
| `Esc` | Close NiriSeek |
| Type | Filter open windows |

Mouse row activation is also supported.

---

## Tested Environment

NiriSeek is currently tested with:

```text
Niri Compositor: 26.04
Niri CLI:        26.04
GTK4:            4.22.4
GJS:             1.88.0
Display Server:  Wayland
```

The project may work on other Niri versions, but they are not currently verified.

---

## How It Works

NiriSeek communicates with the running Niri compositor using the `niri msg` CLI.

Conceptually:

```text
Niri compositor
      ↓
niri msg --json windows
      ↓
NiriSeek reads window metadata
      ↓
MRU sorting + filtering
      ↓
GTK4 window list
      ↓
User selects a window
      ↓
niri msg action focus-window --id <window-id>
```

Window metadata includes information such as:

- Window ID
- Title
- Application ID
- Workspace ID
- Focus state
- Focus timestamp

NiriSeek uses this information to create a searchable recent-window list.

---

# Installation

## 1. Install Required Dependencies

You need:

- Niri
- GJS
- GTK4
- Git

### Ubuntu / Debian-based systems

```bash
sudo apt update
sudo apt install -y git gjs libgtk-4-1
```

Verify:

```bash
gjs --version
gtk4-launch --version
niri msg version
```

Expected output should show installed versions for GJS, GTK4, and Niri.

### Arch Linux

```bash
sudo pacman -S git gjs gtk4
```

### Fedora

```bash
sudo dnf install git gjs gtk4
```

Package names may vary slightly depending on your distribution.

---

## 2. Clone the Repository

Clone NiriSeek into your preferred directory:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Then enter the project:

```bash
cd NiriSeek
```

If your repository folder is lowercase:

```bash
cd niriseek
```

---

## 3. Make the GUI Entry File Executable

Run:

```bash
chmod +x src/gui/main.js
```

Make sure the first line of `src/gui/main.js` contains a valid GJS shebang if you launch it directly.

For example:

```bash
#!/usr/bin/env -S gjs -m
```

You can also test the application explicitly with:

```bash
gjs -m src/gui/main.js
```

---

## 4. Make the Launcher Executable

NiriSeek uses a launcher script so repeated `Mod + Tab` presses do not leave multiple stale floating windows open.

Run:

```bash
chmod +x scripts/launch.sh
```

---

## 5. Configure Local Paths

### Important

The current project may contain absolute paths from the original development machine.

Before running NiriSeek, inspect:

```text
scripts/launch.sh
src/gui/main.js
```

Look for paths similar to:

```text
```

Replace them with the absolute path where **you cloned NiriSeek**.

Find your repository path:

```bash
pwd
```

Example:

```text
/home/alex/projects/NiriSeek
```

Your launcher should then point to:

```text
/home/alex/projects/NiriSeek/src/gui/main.js
```

### Example `scripts/launch.sh`

```bash
#!/usr/bin/env bash

APP="/home/alex/projects/NiriSeek/src/gui/main.js"

pkill -f "$APP" 2>/dev/null || true

sleep 0.05

exec "$APP"
```

Replace:

```text
/home/alex/projects/NiriSeek
```

with your real installation path.

---

## 6. Check the GTK CSS Path

If `src/gui/main.js` loads CSS using an absolute path, update it too.

For example, if you see:

```js
provider.load_from_path(
);
```

replace it with your actual path:

```js
provider.load_from_path(
  "/home/alex/projects/NiriSeek/src/gui/styles/main.css"
);
```

Again, use:

```bash
pwd
```

to find the correct repository location.

---

## 7. Test NiriSeek Manually

Before adding a Niri shortcut, run NiriSeek directly.

From the project root:

```bash
./src/gui/main.js
```

Or:

```bash
gjs -m src/gui/main.js
```

If everything is working, you should see a GTK window containing your currently open Niri windows.

Test:

- Search
- Arrow keys
- Enter
- Escape
- Mouse selection

Do not continue to the shortcut configuration until manual launching works.

---

# Niri Configuration

NiriSeek needs:

1. A keyboard binding
2. A floating window rule

You can place these directly in your Niri configuration or use a separate custom include file.

---

## Recommended: Separate NiriSeek Config

Create a custom directory:

```bash
mkdir -p ~/.config/niri/custom
```

Create:

```bash
nano ~/.config/niri/custom/niriseek.kdl
```

Add:

```kdl
binds {
    Mod+Tab {
        spawn "/absolute/path/to/NiriSeek/scripts/launch.sh"
    }
}

window-rule {
    match app-id="dev.mohit.NiriSeek"
    open-floating true
}
```

Replace:

```text
/absolute/path/to/NiriSeek
```

with your real repository path.

Example:

```kdl
binds {
    Mod+Tab {
        spawn "/home/alex/projects/NiriSeek/scripts/launch.sh"
    }
}

window-rule {
    match app-id="dev.mohit.NiriSeek"
    open-floating true
}
```

---

## Include the Custom Config

Open your main Niri config:

```bash
nano ~/.config/niri/config.kdl
```

Add:

```kdl
include "custom/niriseek.kdl"
```

For example:

```kdl
include "custom/niriseek.kdl"
```

The exact location of the include line is flexible, but make sure it does not conflict with another `Mod+Tab` binding.

---

## Validate the Niri Configuration

Before reloading:

```bash
niri validate
```

If the configuration is valid, reload it:

```bash
niri msg action load-config-file
```

Now press:

```text
Mod + Tab
```

NiriSeek should open as a floating window.

---

# Existing `Mod + Tab` Conflicts

Some Niri configurations already use `Mod + Tab`.

If your config contains a built-in recent-window switcher such as:

```kdl
recent-windows {
    binds {
        Mod+Tab {
            next-window
        }
    }
}
```

or another `Mod+Tab` binding, you must remove, disable, or change the conflicting shortcut.

You can search your config with:

```bash
grep -Rni "Mod+Tab" ~/.config/niri
```

You can also search for:

```bash
grep -Rni "recent-windows" ~/.config/niri
```

If you use a shell or desktop configuration framework that manages Niri config files, check included `.kdl` files too.

---

# Project Structure

The project is organized around small focused modules.

```text
NiriSeek/
├── scripts/
│   └── launch.sh
│
├── src/
│   ├── gui/
│   │   ├── main.js
│   │   ├── components/
│   │   │   └── window-row.js
│   │   ├── utils/
│   │   │   ├── app-info.js
│   │   │   └── styles.js
│   │   └── styles/
│   │       └── main.css
│   │
│   └── niri/
│       ├── ipc.js
│       └── windows.js
│
├── .gitignore
├── LICENSE
└── README.md
```

Depending on the current development version, the exact structure may differ slightly.

---

# Architecture

## `src/gui/main.js`

Responsible for:

- GTK application lifecycle
- Main window creation
- Search input
- List rendering orchestration
- Keyboard event handling
- Selection behavior
- High-level event wiring

---

## `src/gui/components/window-row.js`

Responsible for:

- Creating GTK window rows
- Rendering application icons
- Rendering window titles
- Rendering application names
- Showing workspace information

---

## `src/gui/utils/app-info.js`

Responsible for:

- Application ID normalization
- Automatic icon resolution
- Human-readable application names
- `Gio.AppInfo` matching
- Icon caching
- Application metadata caching
- Fallback mappings

---

## `src/gui/utils/styles.js`

Responsible for:

- Loading GTK CSS
- Registering the CSS provider
- Applying application styling

---

## `src/niri/ipc.js`

Responsible for low-level communication with Niri.

Examples:

```text
niri msg --json windows
```

and:

```text
niri msg action focus-window --id <id>
```

---

## `src/niri/windows.js`

Responsible for window-specific logic such as:

- Reading open windows
- MRU sorting
- Focus timestamp comparison
- Current-window deprioritization
- NiriSeek exclusion
- Window transformations

---

# MRU Window Sorting

NiriSeek uses Niri's focus timestamp metadata:

```json
{
  "focus_timestamp": {
    "secs": 5285,
    "nanos": 4951951
  }
}
```

Windows are sorted by recent focus history.

The currently focused window is deprioritized so that the previously used window becomes easier to access.

Example:

```text
Current window: Chrome

Recently used:
1. VS Code
2. Ghostty
3. YouTube Music
```

Opening NiriSeek prioritizes useful switching targets instead of simply placing the current window first.

---

# Application Icons

NiriSeek attempts to resolve real installed application icons using:

```text
Gio.AppInfo
```

This allows applications such as:

- Google Chrome
- Visual Studio Code
- Ghostty
- Kitty
- App Center
- Firefox
- Other installed desktop applications

to display their native system icons.

If no icon can be resolved, NiriSeek falls back to a generic application icon.

---

# Application Names

Raw Wayland application IDs can look like:

```text
chrome-hnpfjngllnobngcgfapefoaidbinmjnm-Default
```

NiriSeek attempts to resolve these into readable application names such as:

```text
Google Chrome
```

or:

```text
WhatsApp Web
```

where metadata is available.

---

# Relaunch Behavior

Repeated shortcut presses intentionally create a fresh NiriSeek session.

Example:

```text
Mod + Tab
→ NiriSeek opens

Mod + Tab again
→ previous NiriSeek process closes
→ fresh NiriSeek opens
→ latest window state is loaded
```

This prevents duplicate floating switcher windows from accumulating.

The current launcher implementation uses a path-specific process match.

This works well for local use, but a future version may replace it with a more robust mechanism such as:

- PID files
- Lock files
- D-Bus activation
- Dedicated application activation handling

---

# Troubleshooting

## NiriSeek Does Not Open

Run it manually:

```bash
gjs -m src/gui/main.js
```

Look for GJS errors.

Also verify:

```bash
gjs --version
```

---

## `Mod + Tab` Does Nothing

Check your Niri config:

```bash
niri validate
```

Then reload:

```bash
niri msg action load-config-file
```

Verify the launcher path exists:

```bash
ls -l /absolute/path/to/NiriSeek/scripts/launch.sh
```

Verify it is executable:

```bash
chmod +x /absolute/path/to/NiriSeek/scripts/launch.sh
```

Search for conflicting shortcuts:

```bash
grep -Rni "Mod+Tab" ~/.config/niri
```

---

## Window Opens Tiled Instead of Floating

Inspect the real application ID:

```bash
niri msg --json windows
```

If you have `jq` installed:

```bash
niri msg --json windows | jq '.[] | {title, app_id, id}'
```

NiriSeek should use:

```text
dev.mohit.NiriSeek
```

Make sure your rule is:

```kdl
window-rule {
    match app-id="dev.mohit.NiriSeek"
    open-floating true
}
```

Then validate and reload:

```bash
niri validate
niri msg action load-config-file
```

---

## Search Box Appears but Windows Do Not

First verify Niri returns windows:

```bash
niri msg --json windows
```

If this command fails, NiriSeek cannot retrieve the current window list.

Make sure you are running NiriSeek inside an active Niri session.

---

## Icons Are Missing

NiriSeek resolves icons using installed desktop application metadata.

Check whether the application has a `.desktop` entry:

```bash
find /usr/share/applications ~/.local/share/applications \
  -iname "*.desktop" 2>/dev/null
```

Some applications, PWAs, custom launchers, and sandboxed applications may not map cleanly from Wayland `app_id` to desktop entry ID.

A generic icon may be shown as fallback.

---

## Escape or Enter Does Not Work

NiriSeek uses a GTK key controller in capture phase:

```text
Gtk.PropagationPhase.CAPTURE
```

This is required because the GTK search entry may otherwise consume keys before the window-level handler sees them.

If modifying the keyboard code, preserve capture-phase handling.

---

## Permission Denied

If you see:

```text
permission denied
```

make scripts executable:

```bash
chmod +x src/gui/main.js
chmod +x scripts/launch.sh
```

Also remember that configuration files such as:

```text
~/.config/niri/custom/niriseek.kdl
```

are not shell commands.

Edit them with:

```bash
nano ~/.config/niri/custom/niriseek.kdl
```

or:

```bash
code ~/.config/niri/custom/niriseek.kdl
```

---

# Development

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd NiriSeek
```

Run directly:

```bash
gjs -m src/gui/main.js
```

Or, if executable:

```bash
./src/gui/main.js
```

Check Niri window data:

```bash
niri msg --json windows
```

Pretty-print with `jq`:

```bash
niri msg --json windows | jq
```

Inspect selected fields:

```bash
niri msg --json windows | jq \
  '.[] | {id, title, app_id, workspace_id, is_focused, focus_timestamp}'
```

---

# Design Philosophy

NiriSeek follows a simple rule:

> Make it work first. Make it useful second. Make it beautiful third.

The project started as a small experiment to answer one question:

> Can a custom application read Niri's open windows and focus them?

That became:

```text
Terminal prototype
    ↓
Niri IPC integration
    ↓
Window search
    ↓
GTK4 interface
    ↓
Keyboard navigation
    ↓
Cross-workspace focusing
    ↓
MRU sorting
    ↓
Automatic icons
    ↓
Application metadata
    ↓
Custom transparent theme
    ↓
NiriSeek
```

---

# Current Limitations

- Primarily tested on Niri 26.04
- Linux/Wayland/Niri-specific
- Some application icons may require fallback mappings
- Some browser PWAs expose long generated application IDs
- Current launcher behavior uses process matching
- Installation currently requires manual Niri configuration
- Absolute paths may need manual adjustment after cloning
- True compositor-level background blur is not implemented by NiriSeek itself

---

# Roadmap

Possible future improvements:

- Better fuzzy search
- More robust single-instance activation
- PID or lock-file based relaunch handling
- Automatic installation script
- XDG-compliant resource paths
- `.desktop` application entry
- Configurable keyboard shortcut
- Configurable theme
- Better PWA metadata detection
- Package support
- Reduced hardcoded paths
- Improved accessibility
- Support testing across more Niri versions

---

# Why NiriSeek?

Niri already provides powerful window-management primitives.

NiriSeek is not trying to replace Niri's workflow.

It adds a searchable, visual, keyboard-first layer for users who want to jump directly between open windows across workspaces.

Especially useful when:

- Many windows are open
- Multiple workspaces are active
- Several windows belong to the same application
- Window titles matter more than application names
- You prefer keyboard-driven navigation

---

# Contributing

Contributions, bug reports, and ideas are welcome.

If you find an issue, include:

- Niri version
- GJS version
- GTK4 version
- Linux distribution
- Relevant terminal error
- Relevant `app_id` if the issue involves a specific application

Useful commands:

```bash
niri msg version
gjs --version
gtk4-launch --version
```

---

# License

Add your preferred open-source license to the repository.

MIT is a good option for a small developer tool like NiriSeek.

---

## Built With

- JavaScript
- GJS
- GTK4
- Gio
- Gdk
- Niri IPC
- Wayland

---

If you use NiriSeek, improve it, break it, or make it prettier, feel free to open an issue or contribute.