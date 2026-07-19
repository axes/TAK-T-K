#!/usr/bin/env bash

# Inicia el cliente Vite y el servidor Socket.IO para desarrollo local.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$PROJECT_DIR/server"
CLIENT_DIR="$PROJECT_DIR/tactical-neon"

SERVER_HOST="${SERVER_HOST:-127.0.0.1}"
SERVER_PORT="${SERVER_PORT:-3000}"
CLIENT_HOST="${CLIENT_HOST:-127.0.0.1}"
CLIENT_PORT="${CLIENT_PORT:-5173}"
CLIENT_URL="http://${CLIENT_HOST}:${CLIENT_PORT}"

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM

  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
  if [[ -n "${CLIENT_PID:-}" ]] && kill -0 "$CLIENT_PID" 2>/dev/null; then
    kill "$CLIENT_PID" 2>/dev/null || true
  fi

  wait "${SERVER_PID:-}" "${CLIENT_PID:-}" 2>/dev/null || true
  exit "$exit_code"
}

command -v node >/dev/null || { echo "Error: Node.js no está instalado." >&2; exit 1; }
command -v npm >/dev/null || { echo "Error: npm no está instalado." >&2; exit 1; }

install_if_needed() {
  local directory=$1
  if [[ ! -d "$directory/node_modules" ]]; then
    echo "Instalando dependencias en ${directory#$PROJECT_DIR/}..."
    npm install --prefix "$directory"
  fi
}

install_if_needed "$SERVER_DIR"
install_if_needed "$CLIENT_DIR"

trap cleanup EXIT INT TERM

echo "Iniciando servidor en http://${SERVER_HOST}:${SERVER_PORT}..."
PORT="$SERVER_PORT" CLIENT_URL="$CLIENT_URL" npm run dev --prefix "$SERVER_DIR" &
SERVER_PID=$!

echo "Iniciando cliente en ${CLIENT_URL}..."
npm run dev --prefix "$CLIENT_DIR" -- --host "$CLIENT_HOST" --port "$CLIENT_PORT" &
CLIENT_PID=$!

echo
echo "TAK-T-K disponible en ${CLIENT_URL}"
echo "Pulsa Ctrl+C para detener ambos procesos."

wait "$SERVER_PID" "$CLIENT_PID"
