# Fancy Whiteboard - Stage 2 Setup Guide

## 📋 Overview

Stage 2 adds real-time collaborative features to the Fancy Whiteboard application. Multiple users can now:
- Draw and edit together in real-time
- See each other's presence and changes instantly
- Share calendar events and get notifications
- Work offline and auto-sync when reconnected

## 🎯 What's New in Stage 2

✅ **Real-time Drawing Synchronization** - See other users drawing live  
✅ **WebSocket Server** - Node.js + Socket.IO backend  
✅ **User Authentication** - Server-side login/register  
✅ **Session Management** - Create or join collaborative sessions  
✅ **Notification System** - Schedule reminders and alerts  
✅ **Offline Support** - Works offline, syncs when reconnected  
✅ **User Presence** - See who's connected to the session  

## 📁 Folder Structure

```
stage2/
├── server/                          # Node.js backend
│   ├── server.js                   # Main server file
│   ├── package.json                # Dependencies
│   ├── .env.example                # Environment template
│   └── README.md                   # Server documentation
│
├── client/                          # Web frontend
│   ├── index.html                  # Collaborative whiteboard
│   ├── login.html                  # Login & session management
│   ├── css/
│   │   ├── main.css
│   │   └── calendar.css
│   └── js/
│       ├── app.js                  # Main app logic
│       ├── websocket-manager.js    # WebSocket handler
│       ├── notification-service.js # Notifications
│       ├── drawing.js              # Drawing engine
│       ├── calendar.js             # Calendar functionality
│       ├── auth.js                 # Authentication
│       ├── database.js             # Local storage
│       └── utils.js                # Utility functions
│
└── SETUP-INSTRUCTIONS.md           # This file
```

## 🚀 Quick Start (3 Commands)

### Step 1: Setup Server (Terminal 1)
```bash
cd stage2/server
npm install
npm start
```

### Step 2: Setup Client (Terminal 2)
```bash
cd stage2/client
python -m http.server 8001
```

### Step 3: Open Browser
```
http://localhost:8001/login.html
```

**That's it!** Your collaborative whiteboard is ready. 🎉

---

## 📝 Detailed Setup Instructions

### Prerequisites
- **Node.js** v14+ with npm
- **Python** v3 (for local web server)
- **Git** (for cloning)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/hkp0404/CSCI3100-project-whiteboard.git
cd CSCI3100-project-whiteboard
```

#### 2. Server Setup

**Terminal 1 - Start the backend server:**

```bash
# Navigate to server directory
cd stage2/server

# Install dependencies
npm install

# Copy environment configuration (optional)
cp .env.example .env

# Start server
npm start
```

**Expected output:**
```
🚀 Fancy Whiteboard Server running on http://localhost:3000
⚡ WebSocket ready for real-time collaboration
📊 Max concurrent users: 10
```

#### 3. Client Setup

**Terminal 2 - Start the frontend:**

```bash
# Navigate to client directory
cd stage2/client

# Start web server (using Python)
python -m http.server 8001

# Alternative (using Node.js http-server)
npx http-server -p 8001

# Alternative (using Python 2)
python -m SimpleHTTPServer 8001
```

**Expected output:**
```
Serving HTTP on 0.0.0.0 port 8001 (http://0.0.0.0:8001/) ...
```

#### 4. Open Application

In your browser, navigate to:
```
http://localhost:8001/login.html
```

---

## 🎮 How to Use

### Single User (Offline Mode)

1. Open `http://localhost:8001/login.html`
2. Click **Register** to create account
3. Fill in Username, Email, Password
4. Click **Register**
5. App works offline - no internet needed

### Collaborative Mode (With Server)

**User 1:**
1. Open `http://localhost:8001/login.html`
2. Register or login
3. Click **Create New** to create a session
4. Share the Session ID with User 2

**User 2:**
1. Open `http://localhost:8001/login.html` in **another browser/tab**
2. Register or login
3. Paste the Session ID in the text field
4. Click **Join Session**

**Now draw together!** 🎨
- Both users see each other's drawings in real-time
- See who's online in the "Online Users" section
- Changes sync automatically
- Calendar events are shared

### Testing Multi-User Features

**Test 1: Real-time Drawing Sync**
```
1. Open two browser tabs (User A and User B)
2. Both login and join same session
3. User A draws a circle
4. User B should see it appear instantly
5. User B draws a line
6. User A should see it immediately
```

**Test 2: User Presence**
```
1. Both users in same session
2. Look for "Online Users: 2" indicator
3. User A closes browser
4. User B sees "Online Users: 1"
```

**Test 3: Offline Sync**
```
1. Both users in same session
2. User A turns off internet (or closes server)
3. User A continues drawing
4. User A's drawing is queued locally
5. User A reconnects
6. Drawings auto-sync
```

---

## 🔧 Configuration

### Server Configuration (stage2/server/.env)

```bash
# Server
PORT=3000                          # Server port
NODE_ENV=development               # Environment

# JWT Authentication
JWT_SECRET=your_secret_key         # Change in production!
JWT_EXPIRATION=24h

# WebSocket
SOCKET_IO_MAX_USERS=10             # Max users per session
SOCKET_IO_PING_INTERVAL=25000      # Keep-alive ping
SOCKET_IO_PING_TIMEOUT=60000       # Connection timeout

# CORS
CORS_ORIGIN=http://localhost:8001  # Allow frontend origin
CORS_CREDENTIALS=true
```

### Client Configuration

Edit `stage2/client/js/websocket-manager.js` to change server URL:

```javascript
const wsManager = new WebSocketManager('http://localhost:3000');
// Change 'localhost:3000' to your server address
```

---

## 📡 API Reference

### Authentication Endpoints

**Register User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"pass123"}'
```

**Login User**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

### Session Endpoints

**Create Session**
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"token":"your_jwt_token_here"}'
```

**Get Session Info**
```bash
curl http://localhost:3000/api/sessions/{sessionId}
```

---

## 🐛 Troubleshooting

### "Cannot find module 'socket.io'"
```bash
# Solution: Install dependencies
cd stage2/server
npm install
```

### "Port 3000 already in use"
```bash
# Solution: Kill process on port 3000
# macOS/Linux:
kill -9 $(lsof -t -i :3000)

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port:
PORT=3001 npm start
```

### "CORS error: origin not allowed"
```bash
# Solution: Update CORS_ORIGIN in .env
CORS_ORIGIN=http://localhost:8001
# Or allow all (NOT recommended for production):
CORS_ORIGIN=*
```

### "WebSocket connection refused"
```bash
# Check if server is running:
curl http://localhost:3000/

# If not, restart server:
cd stage2/server
npm start

# Check firewall is not blocking port 3000
```

### "Server shows 'Disconnected' in UI"
```bash
# Solution: 
# 1. Check server is running (port 3000)
# 2. Check network connectivity
# 3. Check CORS settings in .env
# 4. Clear browser cache and refresh
```

### "Drawings not syncing between users"
```bash
# Debug steps:
# 1. Open browser DevTools (F12)
# 2. Check Console tab for errors
# 3. Check Network tab for failed connections
# 4. Verify both users are in same session
# 5. Restart server and reconnect
```

---

## 🌐 Deployment

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-fancy-whiteboard

# Set environment variables
heroku config:set JWT_SECRET=your_production_secret
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-frontend.com

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy to AWS EC2

```bash
# 1. Launch EC2 instance (Ubuntu 20.04)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone repository
git clone https://github.com/hkp0404/CSCI3100-project-whiteboard.git
cd CSCI3100-project-whiteboard/stage2/server

# 5. Install and start with PM2
npm install
npm install -g pm2
pm2 start server.js --name "whiteboard"
pm2 startup
pm2 save

# 6. Setup reverse proxy with Nginx
# ... (Nginx configuration)
```

---

## 📊 Performance & Limits

- **Max Users**: 10 per session
- **Max Objects**: 10,000 (strokes, text, shapes)
- **Sync Latency**: <100ms (local network)
- **Drawing FPS**: 60 FPS
- **Event Queue**: Unlimited (when offline)

---

## 🔒 Security Notes

⚠️ **Important for Production:**

1. **Change JWT Secret**
   ```bash
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Use output as JWT_SECRET in .env
   ```

2. **Enable HTTPS/WSS**
   ```bash
   # Generate SSL certificates
   # Use Let's Encrypt or self-signed certs
   # Update .env to use HTTPS/WSS
   ```

3. **Add Rate Limiting**
   ```bash
   # Prevent abuse with rate limiting
   # See server.js for implementation
   ```

4. **Input Validation**
   ```bash
   # All user input is validated on server
   # Never trust client-side validation
   ```

---

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance/)

---

## 🆘 Support

For issues or questions:
1. Check server logs: Terminal 1 output
2. Check browser console: F12 → Console tab
3. Check Network tab: F12 → Network tab
4. Read error messages carefully
5. Contact CSCI3100 team

---

## ✅ Verification Checklist

- [ ] Node.js and npm installed
- [ ] Server running on port 3000
- [ ] Client running on port 8001
- [ ] Browser can access login.html
- [ ] Can register new account
- [ ] Can create a session
- [ ] Can join a session
- [ ] Real-time drawing works
- [ ] Online users visible
- [ ] Notifications working
- [ ] Offline mode functional

---

**Enjoy your real-time collaborative whiteboard!** 🎨✨
