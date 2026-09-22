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

# main.js is a single-instance GTK app (application_id "dev.mohit.NiriSeek",
# default flags), so if it's already running, this just forwards a D-Bus
# "activate" to it and exits instead of needing to be killed and restarted.
exec "$APP"
