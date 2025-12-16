# 🌐 How to Go Online - Complete Guide

## What You Have Now

❌ **Local Mode Only**: Your whiteboard currently runs only on your computer. No other computers can connect to it.

## What You'll Get

✅ **Online Mode**: Multiple users from different computers/networks can collaborate in real-time on the same whiteboard!

---

## Quick Summary

**3 Simple Steps to Go Online:**

1. **Deploy your server** to a cloud platform (Heroku, Railway, or Render)
2. **Update client configuration** (already done in `config.js`!)
3. **Test with friends** from different computers

**Time Required**: 10-15 minutes

---

## Step-by-Step: Going Online

### Step 1: Choose a Hosting Platform

**Easiest Options (Free Tier Available):**

| Platform | Difficulty | Free Tier | Best For |
|----------|-----------|-----------|----------|
| **Railway** | ⭐️ Easiest | ✅ Yes | Beginners, class projects |
| **Render** | ⭐️⭐️ Easy | ✅ Yes | Reliable, good docs |
| **Heroku** | ⭐️⭐️⭐️ Medium | ✅ Yes (credit card needed) | Industry standard |

**Recommended for CSCI3100**: **Railway** (easiest setup, no credit card)

---

### Step 2: Deploy to Railway (Recommended)

#### 2.1 Sign Up

1. Go to [railway.app](https://railway.app)
2. Click "Login with GitHub"
3. Authorize Railway to access your GitHub

#### 2.2 Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `CSCI3100-project-whiteboard`
4. Select branch: `stage2-sync`

#### 2.3 Configure Service

1. Click on the deployed service
2. Go to "Settings" tab
3. Set **Root Directory**: `stage2`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`

#### 2.4 Add Environment Variables

1. Go to "Variables" tab
2. Click "New Variable" and add:

```
NODE_ENV=production
JWT_SECRET=csci3100-whiteboard-secret-key-2025
PORT=3000
CORS_ORIGIN=*
```

**Important**: Change `JWT_SECRET` to a random string!

To generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2.5 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Once deployed, click "Generate Domain"

**Your URL**: `https://csci3100-whiteboard-production.up.railway.app` (example)

#### 2.6 Update Client Configuration (Already Done!)

Good news! The client (`stage2/client/js/config.js`) is already configured to automatically detect if it's running locally or online.

It uses:
- **Local**: `http://localhost:3000` when testing on your computer
- **Online**: `window.location.origin` when deployed (automatically uses your Railway URL)

No changes needed! ✅

---

### Step 3: Test Online Mode

#### Test 1: Same Computer, Different Browsers

1. Open Chrome: `https://your-app.up.railway.app/client/login.html`
2. Register as User 1
3. Create a new whiteboard
4. **Copy the session URL** or session ID
5. Open Firefox: `https://your-app.up.railway.app/client/login.html`
6. Register as User 2
7. **Join the same session** using the session ID
8. Draw on Chrome → You should see it appear in Firefox instantly!

#### Test 2: Different Computers

1. **Your Computer**: Open `https://your-app.up.railway.app`
2. **Friend's Computer/Phone**: Open the same URL
3. Both create accounts and join the same session
4. Draw together in real-time!

#### Test 3: Different Networks (True Internet Test)

1. **You**: Use home WiFi
2. **Friend**: Use mobile data or different WiFi
3. Both access the same URL
4. Verify real-time sync works across different networks

---

## Alternative Platforms

### Option B: Deploy to Render

```bash
1. Go to render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect your repo
5. Settings:
   - Name: fancy-whiteboard
   - Branch: stage2-sync
   - Root Directory: stage2
   - Build: npm install
   - Start: npm start
6. Environment:
   NODE_ENV=production
   JWT_SECRET=your-secret-key
7. Create Web Service
```

**URL**: `https://fancy-whiteboard.onrender.com`

### Option C: Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
cd stage2
heroku create fancy-whiteboard-yourname

# Set environment
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# Deploy
git push heroku stage2-sync:main

# Open
heroku open
```

**URL**: `https://fancy-whiteboard-yourname.herokuapp.com`

---

## How It Works

### Local Mode (Before)

```
Your Computer
  │
  └── Browser → Canvas (No sync, only you can see)
```

### Online Mode (After)

```
        Cloud Server (Railway/Render/Heroku)
              │
      ┌──────┼──────┐
      │               │
  Computer 1      Computer 2
   (You)         (Friend)
      │               │
  Draw →         ← Syncs in real-time!
```

### What Happens When You Draw:

1. **You** draw on your canvas
2. **Browser** sends drawing data to server via WebSocket
3. **Server** receives data and broadcasts to all connected users
4. **Other users' browsers** receive data and draw on their canvas
5. **Result**: Everyone sees the drawing in real-time!

---

## Understanding the Code Changes

### What Was Added

1. **`config.js`** - Auto-detects local vs online mode
2. **`sync-client.js`** - Handles WebSocket communication
3. **`server.js`** - Updated to support real-time sync
4. **`sync-handler.js`** - Manages sessions and conflicts
5. **`index.html`** - Integrated with sync client

### How Auto-Detection Works

```javascript
// In config.js
const ENV = window.location.hostname === 'localhost' 
  ? 'development'  // Running locally
  : 'production';  // Running online

// Automatically chooses:
// Local: http://localhost:3000
// Online: https://your-app.up.railway.app
const API_BASE_URL = ENV === 'development'
  ? 'http://localhost:3000'
  : window.location.origin;
```

**Magic**: No manual configuration needed! It just works. ✨

---

## Troubleshooting

### Problem: "Cannot connect to server"

**Possible Causes:**
1. Server not deployed yet
2. Deployment failed
3. Server crashed

**Solutions:**
```bash
# Check Railway logs
1. Go to Railway dashboard
2. Click on your service
3. Go to "Deployments" tab
4. Check logs for errors

# Common fixes:
- Ensure all environment variables are set
- Check that package.json has all dependencies
- Verify PORT is set to 3000
```

### Problem: "WebSocket connection failed"

**Solution:**
- Make sure you're using `https://` (not `http://`)
- Check browser console for specific error
- Verify CORS is set to `*` in environment variables

### Problem: "Session not found after restart"

**Cause**: Free tier servers restart and clear memory

**Solution**: This is normal for free tiers. Users need to create new sessions after restart. For persistent sessions, upgrade to paid tier or add database.

### Problem: Slow/Laggy

**Causes**:
- Free tier has limited resources
- Server location far from users
- Too many actions being sent

**Solutions**:
- Upgrade to paid tier
- Choose server region close to users
- Implement action throttling

---

## Security Checklist

☐ Change JWT_SECRET to a random value
☐ Use HTTPS (provided automatically by platforms)
☐ Don't commit `.env` file to Git
☐ Add rate limiting for production
☐ Validate all user inputs
☐ Set up monitoring/alerts

---

## Cost Analysis

| Platform | Free Tier | Paid Tier | When to Upgrade |
|----------|-----------|-----------|----------------|
| Railway | $5 credit/month | $5/month | Heavy usage |
| Render | Limited CPU/RAM | $7/month | Need 24/7 uptime |
| Heroku | 550 hrs/month | $7/month | Run multiple apps |

**For Class Project**: Free tier is sufficient! ✅

---

## Next Steps After Going Online

1. ✅ Test with 2-3 classmates
2. ✅ Add session sharing feature (share link/QR code)
3. ✅ Implement persistent storage (PostgreSQL)
4. ✅ Add user avatars/colors
5. ✅ Set up custom domain (optional)
6. ✅ Add usage analytics
7. ✅ Create demo video

---

## FAQ

**Q: Do I need to pay anything?**
A: No! All platforms have free tiers suitable for class projects.

**Q: Can I use my own domain?**
A: Yes! Most platforms support custom domains (some require paid tier).

**Q: How many users can connect?**
A: Server is configured for 10 concurrent users per session. You can increase this in environment variables.

**Q: Is the data secure?**
A: Yes, data is transmitted over HTTPS. However, for production use, implement additional security measures.

**Q: Can I switch platforms later?**
A: Yes! Your code works on any platform. Just redeploy to a different service.

**Q: Do I need to change my code when deploying?**
A: No! The code automatically detects if it's running locally or online.

---

## Success Checklist

☐ Server deployed to cloud platform
☐ Environment variables configured
☐ Client can access deployed URL
☐ Can register new user
☐ Can create whiteboard session
☐ Can draw on canvas
☐ Drawing syncs to other users in real-time
☐ Multiple users can collaborate
☐ Works across different networks

---

## Support Resources

- **Deployment Guide**: See `ONLINE-DEPLOYMENT.md` for detailed platform-specific instructions
- **Quick Setup**: See `QUICK-ONLINE-SETUP.md` for fastest deployment method
- **Sync Documentation**: See `MULTICOMPUTER-SYNC.md` for technical details
- **Platform Docs**:
  - [Railway Docs](https://docs.railway.app/)
  - [Render Docs](https://render.com/docs)
  - [Heroku Docs](https://devcenter.heroku.com/)

---

## Congratulations!

You now have a fully functional **online collaborative whiteboard**! 🎉

Your users can:
- ✅ Access from any device with internet
- ✅ Collaborate in real-time
- ✅ See each other's cursors
- ✅ Draw, erase, and clear together
- ✅ Join sessions with friends worldwide

Share your deployed URL with friends and start collaborating!

---

**Need Help?**
- Check deployment logs for errors
- Review browser console for client-side issues
- Consult platform documentation
- Ask on course forum or during office hours

**Happy Collaborating!** 🎨✨
