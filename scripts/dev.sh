#!/usr/bin/env bash
set -euo pipefail

# Kill any process listening on given port(s)
kill_port() {
  local port="$1"
  if lsof -ti tcp:"$port" >/dev/null 2>&1; then
    echo "[dev] Killing processes on port $port"
    # shellcheck disable=SC2046
    kill -9 $(lsof -ti tcp:"$port") || true
  else
    echo "[dev] No process on port $port"
  fi
}

# Ensure we are at repo root (script directory is scripts)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT"

# Kill frontend (3000) and backend (3001) ports
kill_port 3000
kill_port 3001

echo "[dev] Starting backend (port 3001) and frontend (port 3000) ..."

# Use npm workspace run to ensure correct dependency context
# Run both in parallel; prefix output for clarity
(
  echo "[backend] starting...";
  cd backend; npm run dev
) & BACKEND_PID=$!
(
  echo "[frontend] starting...";
  cd frontend; npm run dev
) & FRONTEND_PID=$!

# Cleanup on exit
cleanup() {
  echo "\n[dev] Caught exit signal, terminating child processes..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
}
trap cleanup INT TERM EXIT

# Wait on both
wait $BACKEND_PID
wait $FRONTEND_PID
