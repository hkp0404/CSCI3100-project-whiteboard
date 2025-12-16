# Quick Online Setup - 5 Minutes

## Choose Your Platform

### Option A: Railway (Recommended)

**Why**: Easiest, modern UI, automatic deployment

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose `CSCI3100-project-whiteboard`
5. Select branch: `stage2-sync`
6. Set root directory: `stage2`
7. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-random-secret-key-here
   PORT=3000
   ```
8. Click "Deploy"
9. Click "Generate Domain"

**Done!** Your whiteboard is online at `https://fancy-whiteboard-production.up.railway.app`

### Option B: Render

**Why**: Good free tier, reliable

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - Name: `fancy-whiteboard`
   - Branch: `stage2-sync`
   - Root Directory: `stage2`
   - Build: `npm install`
   - Start: `npm start`
5. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   ```
6. Click "Create Web Service"

**Done!** Your whiteboard is online at `https://fancy-whiteboard.onrender.com`

### Option C: Heroku

**Why**: Industry standard, good documentation

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
cd stage2
heroku create fancy-whiteboard-yourname

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key

# Deploy
git push heroku stage2-sync:main

# Open
heroku open
```

**Done!** Your whiteboard is online at `https://fancy-whiteboard-yourname.herokuapp.com`

## Test Online Mode

1. Open your deployed URL
2. Register a new user
3. Create a whiteboard
4. Copy the session ID
5. Open another browser/device
6. Login with different user
7. Join using the session ID
8. Start drawing - changes should sync in real-time!

## Share with Friends

Just send them your deployed URL:
- `https://your-app-name.herokuapp.com`
- `https://your-app-name.up.railway.app`
- `https://your-app-name.onrender.com`

## Troubleshooting

**Problem**: Can't connect
- Check if deployment succeeded (check platform dashboard)
- Look at deployment logs
- Verify environment variables are set

**Problem**: WebSocket errors
- Ensure using `https://` (not `http://`)
- Check CORS settings in server
- Clear browser cache

**Problem**: Server restarts and loses data
- Normal for free tiers with in-memory storage
- Upgrade to paid tier or add database

## Next Steps

- [ ] Test with multiple users
- [ ] Share with classmates
- [ ] Add custom domain (optional)
- [ ] Set up database for persistence
- [ ] Monitor usage and performance

---

**Congratulations!** Your whiteboard is now online and ready for multi-computer collaboration! 🎉
