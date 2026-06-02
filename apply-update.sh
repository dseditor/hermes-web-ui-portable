#!/bin/sh
# ============================================================
#  hermes-web-ui portable self-updater (macOS / Linux)
#  ----------------------------------------------------------
#  Invoked DETACHED by the running server (controllers/update.ts)
#  after it has downloaded and extracted a new release into a
#  staging folder. Stops the server, copies the new files over the
#  install folder, then relaunches the CLI.
#
#  Args:
#    $1 SOURCE_DIR   extracted new files (deleted after copy)
#    $2 INSTALL_DIR  install folder to overwrite (additive copy)
#    $3 NODE_EXE     node executable used to relaunch
#    $4 CLI_MJS      bin/hermes-web-ui.mjs entry point
#    $5 PORT         server port (waited on until released)
#    $6 SERVER_PID   pid of the server to stop before copying
#
#  Inherits the parent server's environment so the relaunch matches
#  the original launcher. User data lives in a sibling data/ folder
#  and is never touched. Files not present in the release are kept.
# ============================================================
set -u

SOURCE="${1:-}"
INSTALL="${2:-}"
NODE="${3:-}"
CLI="${4:-}"
PORT="${5:-}"
SERVERPID="${6:-}"

[ -z "$SOURCE" ] && exit 1
[ -z "$INSTALL" ] && exit 1
[ -d "$SOURCE" ] || exit 1

# --- 1) Stop the running server so its files are unlocked ---
if [ -n "$SERVERPID" ]; then
  kill "$SERVERPID" 2>/dev/null || true
fi

# --- Wait up to ~30s for the port to be released ---
i=0
while [ "$i" -lt 30 ]; do
  if command -v lsof >/dev/null 2>&1; then
    if ! lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
      break
    fi
  else
    break
  fi
  i=$((i + 1))
  sleep 1
done

sleep 1

# --- 2) Copy new files over the install folder (additive) ---
#   cp -a preserves attributes; copying SOURCE/. merges into INSTALL
#   without removing files that are not part of the release.
cp -a "$SOURCE/." "$INSTALL/" || exit 1

# --- 3) Remove the staging folder ---
rm -rf "$SOURCE"

# --- 4) Relaunch the updated server (inherits this process env) ---
"$NODE" "$CLI" start &

exit 0
