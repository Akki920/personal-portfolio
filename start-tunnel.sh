#!/bin/bash

echo "====================================================="
echo " Starting Cloudflare Tunnel for Vite (Port 5173)..."
echo "====================================================="
echo ""
echo "Look for the link ending in '.trycloudflare.com' below."
echo "Press Ctrl+C to stop the tunnel when you're done."
echo ""

# Launch the tunnel pointing to your local Vite server
cloudflared tunnel --url http://localhost:3001