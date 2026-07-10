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

pkill -f -- "$APP" 2>/dev/null || true

sleep 0.05

exec "$APP"
