#!/bin/bash

# Cleanup background processes on exit
cleanup() {
  echo ""
  echo "Stopping backend server and preview server..."
  kill $SERVER_PID 2>/dev/null
  kill $PREVIEW_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "====================================================="
echo " Starting Personal Portfolio (App + Analytics + Tunnel)"
echo "====================================================="

# 1. Start Analytics Backend Server (Port 3002)
echo "[1/3] Starting Analytics Backend Server (Port 3002)..."
(cd server && node index.js) &
SERVER_PID=$!
sleep 2

# 2. Start Vite Preview Frontend (Port 3001)
echo "[2/3] Starting Vite Production Preview (Port 3001)..."
npm run preview &
PREVIEW_PID=$!
sleep 2

# 3. Start Cloudflare Tunnel
echo "[3/3] Launching Cloudflare Tunnel..."
echo "Look for the public '.trycloudflare.com' link below:"
echo "-----------------------------------------------------"
cloudflared tunnel --url http://localhost:3001
