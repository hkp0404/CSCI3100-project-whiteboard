@echo off
REM Fancy Whiteboard Stage 2 - Quick Start Script for Windows
REM This script starts both server and client automatically

color 0A
echo.
echo ==================================================
echo  🚀 Starting Fancy Whiteboard Stage 2...
echo ==================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ✗ Node.js is not installed. Please install it first.
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ✗ npm is not installed. Please install Node.js again.
    pause
    exit /b 1
)

echo 📦 Installing server dependencies...
cd server
call npm install >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    color 0A
    echo ✓ Server dependencies installed
) else (
    color 0C
    echo ✗ Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo ==================================================
echo ✓ Setup complete!
echo ==================================================
echo.
echo Starting servers...
echo.
echo 📡 Server:  http://localhost:3000
echo 🌐 Client:  http://localhost:8001/login.html
echo.
echo ==================================================
echo.

REM Start server
echo ▶ Starting server...
start cmd /k "cd server && npm start"
echo ✓ Server started

REM Wait for server to start
timeout /t 2 /nobreak

REM Start client
echo ▶ Starting client...
start cmd /k "cd client && python -m http.server 8001"
echo ✓ Client started

echo.
echo ==================================================
echo ✓ Both servers are running!
echo ==================================================
echo.
echo 📝 Next steps:
echo    1. Open browser: http://localhost:8001/login.html
echo    2. Register or login
echo    3. Create or join a session
echo    4. Start drawing!
echo.
echo 💡 Tips:
echo    - Open in 2 browser tabs to test real-time sync
echo    - Server runs in one cmd window (port 3000)
echo    - Client runs in another cmd window (port 8001)
echo    - Close cmd windows to stop servers
echo.
pause
