#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(
  cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1
  pwd
)"

PROJECT_DIR="$(
  cd -- "$SCRIPT_DIR/.." >/dev/null 2>&1
  pwd
)"

APP="$PROJECT_DIR/src/gui/main.js"

# Don't kill/restart on every launch: main.js registers as a GTK single-instance
# app (application_id "dev.mohit.NiriSeek", default flags), so if an instance is
# already running, this exec just forwards a D-Bus "activate" to it and exits
# immediately instead of paying full GJS/GTK4/Vulkan cold-start cost every time.
exec "$APP"
