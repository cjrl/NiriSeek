#!/usr/bin/env bash

pkill -f "/home/mr-zero/project/niri-window-switcher/src/gui/main.js" 2>/dev/null || true

sleep 0.05

exec /home/mr-zero/project/niri-window-switcher/src/gui/main.js