# Online Deployment Guide - Fancy Whiteboard Stage 2

## Overview

This guide explains how to deploy your Fancy-Whiteboard application online so that users from different computers/networks can collaborate in real-time over the internet.

## Table of Contents

1. [Quick Online Setup (Easiest)](#quick-online-setup)
2. [Platform Deployment Options](#platform-deployment-options)
   - [Heroku (Free Tier Available)](#option-1-heroku)
   - [Railway (Free Tier Available)](#option-2-railway)
   - [Render (Free Tier Available)](#option-3-render)
   - [DigitalOcean (Paid)](#option-4-digitalocean)
3. [Local Network Deployment](#local-network-deployment)
4. [Configuring Client for Online Mode](#configuring-client)
5. [Testing Online Mode](#testing-online-mode)
6. [Troubleshooting](#troubleshooting)

---

## Quick Online Setup

### Prerequisites

- GitHub account
- Git installed locally
- Node.js v14+ installed

### Steps

1. **Prepare your code**

```bash
cd stage2
npm install
```

2. **Test locally first**

```bash
npm start
```

Open browser: `http://localhost:3000`

3. **Choose a deployment platform** (see options below)

---

## Platform Deployment Options

### Option 1: Heroku

#### Free Tier: ✅ (with credit card verification)
#### Best For: Quick deployment, automatic scaling

**Step 1: Install Heroku CLI**

```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

**Step 2: Login to Heroku**

```bash
heroku login
```

**Step 3: Create Heroku App**

```bash
cd stage2
heroku create fancy-whiteboard-yourname
```

**Step 4: Set Environment Variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-key-change-me
heroku config:set PORT=3000
```

**Step 5: Create Procfile**

Create `stage2/Procfile`:

```
web: node server/server.js
```

**Step 6: Deploy**

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku stage2-sync:main
```

**Step 7: Open Your App**

```bash
heroku open
```

Your app will be live at: `https://fancy-whiteboard-yourname.herokuapp.com`

**Step 8: View Logs**

```bash
heroku logs --tail
```

---

### Option 2: Railway

#### Free Tier: ✅ ($5 credit/month)
#### Best For: Modern UI, GitHub integration

**Step 1: Sign Up**

Go to [railway.app](https://railway.app) and sign up with GitHub.

**Step 2: Create New Project**

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `CSCI3100-project-whiteboard` repository
4. Select branch: `stage2-sync`
5. Set root directory: `stage2`

**Step 3: Configure Environment Variables**

In Railway dashboard:
- Click on your service
- Go to "Variables" tab
- Add:
  ```
  NODE_ENV=production
  JWT_SECRET=your-super-secret-key
  PORT=3000
  ```

**Step 4: Configure Build**

Railway should auto-detect Node.js. If not:
- Build Command: `npm install`
- Start Command: `npm start`

**Step 5: Deploy**

Railway will automatically deploy. Click "Generate Domain" to get public URL.

Your app will be live at: `https://fancy-whiteboard-production.up.railway.app`

---

### Option 3: Render

#### Free Tier: ✅ (with limitations)
#### Best For: Simple deployment, good documentation

**Step 1: Sign Up**

Go to [render.com](https://render.com) and sign up.

**Step 2: Create Web Service**

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Select `CSCI3100-project-whiteboard`
4. Configure:
   - **Name**: `fancy-whiteboard`
   - **Branch**: `stage2-sync`
   - **Root Directory**: `stage2`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

**Step 3: Set Environment Variables**

In "Environment" section:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-key
PORT=3000
```

**Step 4: Deploy**

Click "Create Web Service". Deployment takes ~5 minutes.

Your app will be live at: `https://fancy-whiteboard.onrender.com`

**Note**: Free tier spins down after inactivity. First request may be slow.

---

### Option 4: DigitalOcean

#### Free Tier: ❌ (Paid ~$5/month)
#### Best For: Full control, production use

**Step 1: Create Droplet**

1. Sign up at [digitalocean.com](https://digitalocean.com)
2. Create Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($5/month)
   - **Datacenter**: Closest to your users

**Step 2: SSH into Droplet**

```bash
ssh root@your-droplet-ip
```

**Step 3: Install Node.js**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y git
```

**Step 4: Clone Repository**

```bash
cd /var/www
git clone https://github.com/hkp0404/CSCI3100-project-whiteboard.git
cd CSCI3100-project-whiteboard
git checkout stage2-sync
cd stage2
npm install
```

**Step 5: Create Environment File**

```bash
cd server
cp .env.example .env
nano .env
```

Set:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-key
PORT=3000
CORS_ORIGIN=*
```

**Step 6: Install PM2 (Process Manager)**

```bash
sudo npm install -g pm2
cd /var/www/CSCI3100-project-whiteboard/stage2
pm2 start server/server.js --name whiteboard
pm2 save
pm2 startup
```

**Step 7: Configure Firewall**

```bash
sudo ufw allow 3000
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

**Step 8: Setup Nginx (Optional - for domain)**

```bash
sudo apt-get install -y nginx
sudo nano /etc/nginx/sites-available/whiteboard
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/whiteboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Your app will be live at: `http://your-droplet-ip:3000` or `http://your-domain.com`

---

## Local Network Deployment

### For Testing on Multiple Computers in Same Network

**Step 1: Find Your IP Address**

```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

Look for something like: `192.168.1.100`

**Step 2: Start Server**

```bash
cd stage2
PORT=3000 npm start
```

**Step 3: Update Client Configuration**

Edit `stage2/client/js/config.js` (create if doesn't exist):

```javascript
const SERVER_URL = 'http://192.168.1.100:3000';
```

**Step 4: Access from Other Computers**

On any computer on the same network:
- Open browser
- Go to: `http://192.168.1.100:3000/client/login.html`

**Note**: Firewall must allow connections on port 3000.

---

## Configuring Client for Online Mode

### Update Client Configuration

Create `stage2/client/js/config.js`:

```javascript
// config.js - Client configuration for online mode

const ENV = 'production'; // or 'development'

const CONFIG = {
  development: {
    SERVER_URL: 'http://localhost:3000',
    WS_URL: 'ws://localhost:3000'
  },
  production: {
    // Replace with your deployed server URL
    SERVER_URL: 'https://fancy-whiteboard-yourname.herokuapp.com',
    WS_URL: 'wss://fancy-whiteboard-yourname.herokuapp.com'
  }
};

const API_BASE_URL = CONFIG[ENV].SERVER_URL;
const WEBSOCKET_URL = CONFIG[ENV].WS_URL;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL, WEBSOCKET_URL };
}
```

### Update index.html

Add before other script tags in `stage2/client/index.html`:

```html
<script src="js/config.js"></script>
```

### Update Sync Client Initialization

In your canvas/whiteboard JavaScript:

```javascript
// Initialize sync client with online URL
const syncClient = new SyncClient(API_BASE_URL);

// Connect to server
await syncClient.connect();

// Join session
await syncClient.joinSession(sessionId, userId, username);
```

---

## Testing Online Mode

### Test 1: Different Browsers (Same Computer)

1. Deploy to online platform
2. Open Chrome: `https://your-app-url.com/client/login.html`
3. Register User 1, create whiteboard
4. Copy session ID
5. Open Firefox: `https://your-app-url.com/client/login.html`
6. Register User 2, join session with ID from step 4
7. Draw on User 1's browser → Should appear on User 2's browser

### Test 2: Different Computers (Same Network)

1. Computer 1: Open `https://your-app-url.com`
2. Computer 2: Open `https://your-app-url.com`
3. Both join same session
4. Test real-time sync

### Test 3: Different Networks (True Online)

1. Computer 1: Use home WiFi
2. Computer 2 (or phone): Use mobile data / different WiFi
3. Both access `https://your-app-url.com`
4. Join same session
5. Verify real-time collaboration works

---

## Troubleshooting

### Issue 1: "Cannot connect to server"

**Solution:**
- Check if server is running: `heroku ps` or check platform dashboard
- Verify URL in `config.js` is correct
- Check browser console for errors
- Ensure firewall allows connections

### Issue 2: "WebSocket connection failed"

**Solution:**
- Use `wss://` (not `ws://`) for HTTPS sites
- Check Socket.IO version compatibility
- Verify CORS settings in server:
  ```javascript
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
  ```

### Issue 3: "Session not found"

**Solution:**
- Server may have restarted (free tiers restart frequently)
- In-memory storage is cleared on restart
- Solution: Use persistent database (upgrade to SQLite/PostgreSQL)

### Issue 4: Slow performance

**Solution:**
- Free tier platforms have limited resources
- Consider upgrading to paid tier
- Optimize drawing data (reduce points, throttle updates)
- Implement compression for large payloads

### Issue 5: "CORS policy blocked"

**Solution:**

Update `stage2/server/server.js`:

```javascript
const io = socketIO(server, {
  cors: {
    origin: ["https://your-frontend-domain.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### Issue 6: Deployment fails

**Solution:**
- Check `package.json` has all dependencies
- Ensure `node` and `npm` versions are specified:
  ```json
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
  ```
- Check deployment logs for specific errors

---

## Environment Variables Reference

```bash
# Required
NODE_ENV=production
JWT_SECRET=your-super-secret-key-minimum-32-characters

# Optional
PORT=3000
CORS_ORIGIN=*
SOCKET_IO_PING_INTERVAL=25000
SOCKET_IO_PING_TIMEOUT=60000
SOCKET_IO_MAX_USERS=10

# For production with database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

---

## Security Considerations for Online Mode

### 1. Change JWT Secret

```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set as `JWT_SECRET` environment variable.

### 2. Enable HTTPS

Most platforms (Heroku, Railway, Render) provide HTTPS automatically.

For custom servers:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Rate Limiting

Add to `server/server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Input Validation

Always validate user inputs on server side.

---

## Next Steps

1. ✅ Deploy to free tier platform (Heroku/Railway/Render)
2. ✅ Test with multiple users online
3. ✅ Add database persistence (SQLite → PostgreSQL)
4. ✅ Set up custom domain
5. ✅ Add SSL certificate
6. ✅ Implement rate limiting
7. ✅ Set up monitoring (Sentry, LogRocket)
8. ✅ Create user documentation

---

## Summary

**Easiest Option**: Railway or Render (1-click deploy with GitHub)
**Free Option**: All have free tiers (with limitations)
**Production Option**: DigitalOcean or AWS (more control, better performance)

**Recommended for Class Project**: Railway or Render

---

## Resources

- [Heroku Node.js Docs](https://devcenter.heroku.com/categories/nodejs-support)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [Express.js Docs](https://expressjs.com/)

---

**Need Help?** Check logs, read error messages, and consult platform documentation. Most deployment issues are related to environment variables or CORS configuration.
