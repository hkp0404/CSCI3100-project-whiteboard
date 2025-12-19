#!/bin/bash
# Fancy Whiteboard Stage 2 - Quick Start Script
# This script starts both server and client automatically

echo "🚀 Starting Fancy Whiteboard Stage 2..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install it first."
    exit 1
fi

echo "📦 Installing server dependencies..."
cd server
npm install > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Server dependencies installed"
else
    echo "❌ Failed to install server dependencies"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Setup complete!"
echo ""
echo "Starting servers..."
echo ""
echo "📡 Server:  http://localhost:3000"
echo "🌐 Client:  http://localhost:8001/login.html"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start server in background
echo "▶️  Starting server..."
cd server
npm start &
SERVER_PID=$!
echo "✅ Server started (PID: $SERVER_PID)"

# Wait a bit for server to start
sleep 2

# Start client in background
echo "▶️  Starting client..."
cd ../client
echo "✅ Client starting on port 8001..."

# Check if Python is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8001
elif command -v python &> /dev/null; then
    python -m http.server 8001
else
    echo "❌ Python is not installed. Please install Python."
    kill $SERVER_PID
    exit 1
fi
