# 🚀 Fancy Whiteboard Stage 2 - Quick Start

## ⚡ Easiest Way to Run (One Command!)

### For macOS / Linux

```bash
cd stage2
bash start.sh
```

### For Windows

```bash
cd stage2
start.bat
```

That's it! Both the server and client will start automatically. ✨

---

## 📋 What the Scripts Do

1. ✅ Check if Node.js and Python are installed
2. ✅ Install server dependencies (`npm install`)
3. ✅ Start the Node.js server (port 3000)
4. ✅ Start the Python web server (port 8001)
5. ✅ Display connection info and next steps

---

## 🌐 Once Started

Automatically opens two terminal windows:

**Terminal 1 (Server):**
```
🚀 Fancy Whiteboard Server running on http://localhost:3000
⚡ WebSocket ready for real-time collaboration
📊 Max concurrent users: 10
```

**Terminal 2 (Client):**
```
Serving HTTP on 0.0.0.0 port 8001 ...
```

---

## 🎯 Next Steps

1. **Open browser:**
   ```
   http://localhost:8001/login.html
   ```

2. **Register a new account:**
   - Username: `john_doe` (any name)
   - Email: `john@test.com` (any email)
   - Password: `password123`
   - Click **Register**

3. **Create a session:**
   - Click **Create New** button
   - You'll be taken to the collaborative whiteboard

4. **Test with 2 users:**
   - Open **another browser tab** (or new window)
   - Go to `http://localhost:8001/login.html`
   - Register different user (or same one)
   - Paste the **Session ID** and click **Join Session**
   - Now draw in both tabs - see real-time sync! 🎨

---

## 🛑 How to Stop

**Close the terminal windows** or press `Ctrl+C`:

```
ctrl+c   # In each terminal window
```

This stops:
- Server (port 3000)
- Client (port 8001)

---

## ⚠️ Prerequisites

Before running the startup script, make sure you have:

- ✅ **Node.js** (v14+) - Download from [nodejs.org](https://nodejs.org/)
- ✅ **Python** (v3) - Usually comes with your OS, or [download here](https://www.python.org/)
- ✅ **Git** (to clone the repo)

### Check if installed:

```bash
node --version      # Should show v14+
npm --version       # Should show 6+
python --version    # Should show 3.x
```

---

## 🐛 Troubleshooting

### "Node.js is not installed"
- Download from [nodejs.org](https://nodejs.org/)
- Restart your computer after installing
- Try again

### "Port 3000 already in use"
- Kill the process using port 3000:
  
  **macOS/Linux:**
  ```bash
  lsof -ti :3000 | xargs kill -9
  ```
  
  **Windows:**
  ```cmd
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### "Port 8001 already in use"
- Kill the process:
  
  **macOS/Linux:**
  ```bash
  lsof -ti :8001 | xargs kill -9
  ```
  
  **Windows:**
  ```cmd
  netstat -ano | findstr :8001
  taskkill /PID <PID> /F
  ```

### "CORS error"
- Restart both servers
- Clear browser cache (Ctrl+Shift+Del)
- Make sure client is on `localhost:8001`

### "WebSocket connection failed"
- Check server is running (Terminal 1 shows no errors)
- Check firewall isn't blocking port 3000
- Refresh browser page
- Restart both servers

---

## 📁 File Structure

```
stage2/
├── start.sh                 ← Run on Mac/Linux
├── start.bat                ← Run on Windows
├── server/
│   ├── server.js
│   ├── package.json
│   └── README.md
├── client/
│   ├── index.html
│   ├── login.html
│   ├── css/
│   └── js/
└── SETUP-INSTRUCTIONS.md    ← Full detailed guide
```

---

## 💡 Tips & Tricks

### Test Real-Time Sync

1. Open 2 browser tabs
2. Both join same session
3. Draw in one tab
4. Watch it appear instantly in the other!

### See Who's Connected

- Top-right corner shows "Users: 2" when 2 people are online
- Connection status shows "Connected" when synced with server

### Copy Session ID

- Click the **Copy ID** button
- Share with friend
- They paste it to join your session

### Work Offline

- Keep drawing even if server disconnects
- Changes are queued locally
- Auto-syncs when reconnected

---

## 🎓 Learn More

- Full setup guide: `SETUP-INSTRUCTIONS.md`
- Server API docs: `server/README.md`
- More troubleshooting help there too!

---

**Happy whiteboarding!** 🎨✨
