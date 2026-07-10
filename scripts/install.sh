#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(
  cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1
  pwd
)"

SOURCE_LAUNCHER="$PROJECT_DIR/scripts/launch.sh"
INSTALL_DIR="$HOME/.local/bin"
INSTALLED_LAUNCHER="$INSTALL_DIR/niriseek"

if [[ ! -f "$SOURCE_LAUNCHER" ]]; then
  echo "Error: launch.sh not found:"
  echo "  $SOURCE_LAUNCHER"
  exit 1
fi

chmod +x "$SOURCE_LAUNCHER"

mkdir -p "$INSTALL_DIR"

cat > "$INSTALLED_LAUNCHER" <<EOF_INNER
#!/usr/bin/env bash
exec "$SOURCE_LAUNCHER" "\$@"
EOF_INNER

chmod +x "$INSTALLED_LAUNCHER"

echo
echo "NiriSeek installed successfully."
echo
echo "Launcher:"
echo "  $INSTALLED_LAUNCHER"
echo

if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
  echo "Warning: $INSTALL_DIR is not currently in PATH."
  echo
  echo "Add this to your shell config:"
  echo
  echo '  export PATH="$HOME/.local/bin:$PATH"'
  echo
fi

echo "Add this to your Niri config:"
echo
cat <<'EOF_CONFIG'
binds {
    Mod+Tab {
        spawn "niriseek"
    }
}

window-rule {
    match app-id="dev.mohit.NiriSeek"
    open-floating true
}
EOF_CONFIG

echo
echo "Then validate and reload Niri:"
echo
echo "  niri validate"
echo "  niri msg action load-config-file"
echo
