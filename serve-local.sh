#!/bin/sh

PORT="${1:-8000}"
HOST="${HOST:-127.0.0.1}"
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"

exec python3 -m http.server "$PORT" --bind "$HOST" --directory "$SCRIPT_DIR"
