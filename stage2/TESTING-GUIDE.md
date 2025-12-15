# Stage 2 - Testing Guide (Login Fixes)

**Date:** December 15, 2025  
**Version:** 2.1

---

## 🚀 Quick Start Testing

### Setup (2 minutes)

```bash
# Terminal 1 - Start Server
cd stage2/server
npm install
npm start

# Terminal 2 - Start Client
cd stage2/client
python -m http.server 8001
```

### Access Application
```
http://localhost:8001/login.html
```

---

## ✅ Test 1: Basic Login (Fixes the Flash Issue)

### Objective
Verify that clicking login doesn't cause page flash and properly persists to whiteboard.

### Steps
1. Open `http://localhost:8001/login.html`
2. Register new account:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Create Account" button
4. **EXPECTED:** 
   - ✅ No page flashing
   - ✅ Success message appears
   - ✅ Session options appear below
   - ✅ Button changes to show session choices

### Verification
```javascript
// Open browser console (F12)
// Type:
localStorage.getItem('authToken')  // Should show token value
localStorage.getItem('username')   // Should show username
```

---

## ✅ Test 2: Create New Collaborative Session

### Objective
Verify session creation and redirect to whiteboard.

### Steps
1. After login, click **"Create New Collaborative Session"**
2. **EXPECTED:**
   - ✅ Redirects to index.html
   - ✅ Shows loading spinner briefly
   - ✅ Session ID displayed at top
   - ✅ "Collaborative" badge shown
   - ✅ Copy button available
   - ✅ Welcome notification

### Verify Persistence
```javascript
// After redirect, console should show:
localStorage.getItem('userId')     // Has value
localStorage.getItem('username')   // Has value
```

---

## ✅ Test 3: Offline Mode Fallback

### Objective
Verify app works when server is unavailable.

### Steps
1. **Stop the server** (Ctrl+C in Terminal 1)
2. Reload login page
3. **EXPECTED:**
   - ✅ Yellow warning: "Server offline"
   - ✅ Status indicator shows red
   - ✅ Can still login
   - ✅ Sees offline mode warning

### Steps (continued)
4. Login with any email/password
5. **EXPECTED:**
   - ✅ Success (offline simulation)
   - ✅ Session options appear
   - ✅ Can choose "Use Offline Mode"

### Verify
```javascript
// Should show:
localStorage.getItem('offlineMode')  // Should be 'true'
```

---

## ✅ Test 4: Multiple User Collaboration (With Server)

### Objective
Verify real-time sync between two users.

### Setup
1. **Restart server:**
   ```bash
   cd stage2/server
   npm start
   ```

### Steps
1. **User A:**
   - Login and create session
   - Copy session ID
   - Draw a circle

2. **User B (New Browser/Tab):**
   - Open `http://localhost:8001/login.html`
   - Login
   - Click "Join Existing Session"
   - Paste User A's session ID
   - Click "Join"

3. **EXPECTED:**
   - ✅ Both see same whiteboard
   - ✅ User B sees User A's circle
   - ✅ User count shows "2"
   - ✅ Both can draw
   - ✅ Changes sync in real-time

---

## ✅ Test 5: Drawing Features

### Objective
Verify drawing tools work correctly.

### Steps
1. Draw with pen tool (default)
2. Change color using color picker
3. Adjust brush size
4. Draw with eraser
5. Add text (click text tool, click canvas)
6. Clear canvas (confirm dialog)
7. Save drawing (downloads PNG)

### EXPECTED
- ✅ All tools work
- ✅ Colors apply correctly
- ✅ Size slider works
- ✅ Eraser removes content
- ✅ Text appears
- ✅ Clear works
- ✅ Save downloads file

---

## ✅ Test 6: Mobile/Touch Support

### Objective
Verify touch events work on mobile/tablet.

### Setup
1. Open DevTools (F12)
2. Click device icon (top-left)
3. Select "iPhone 12" or "iPad"
4. Rotate to landscape if needed

### Steps
1. Touch and drag to draw
2. Use touch for all interactions
3. Verify no console errors

### EXPECTED
- ✅ Touch drawing works
- ✅ Buttons responsive to touch
- ✅ No UI broken
- ✅ Canvas properly sized

---

## ✅ Test 7: Session Persistence

### Objective
Verify session stays connected across page refresh.

### Steps
1. Create/join collaborative session
2. Draw something
3. Press F5 (refresh page)
4. **EXPECTED:**
   - ✅ Stays logged in
   - ✅ Same session ID
   - ✅ Drawing persists (if using server)
   - ✅ User count correct

---

## ✅ Test 8: Logout

### Objective
Verify logout properly clears session.

### Steps
1. Click "Logout" button
2. Confirm dialog
3. **EXPECTED:**
   - ✅ Redirects to login.html
   - ✅ localStorage cleared
   - ✅ Cannot go back to whiteboard

### Verify
```javascript
// After logout, console should show:
localStorage.getItem('authToken')   // null
localStorage.getItem('userId')      // null
```

---

## ✅ Test 9: Error Handling

### Objective
Verify proper error messages for various scenarios.

### Test 9a: Invalid Credentials
1. Try to login with wrong email/password
2. **EXPECTED:** Red error message

### Test 9b: Password Mismatch
1. Register with non-matching passwords
2. **EXPECTED:** "Passwords do not match" error

### Test 9c: Duplicate Email
1. Register twice with same email (server up)
2. **EXPECTED:** "Email already exists" error

### Test 9d: Invalid Session ID
1. Try to join with random session ID
2. **EXPECTED:** "Session not found" error

---

## ✅ Test 10: Keyboard Shortcuts

### Objective
Verify keyboard shortcuts work.

### Steps
- Press `P` → Pen tool selected
- Press `E` → Eraser tool selected
- Press `T` → Text tool selected
- Press `Ctrl+Z` → Undo (shows "coming soon")
- Press `Ctrl+S` → Download PNG

### EXPECTED
- ✅ All shortcuts work
- ✅ Tool buttons update
- ✅ No console errors

---

## 📊 Test Coverage Summary

| Test | Category | Status | Time |
|------|----------|--------|------|
| Login without flash | Critical | ✅ | 1m |
| Session creation | Critical | ✅ | 1m |
| Offline mode | Critical | ✅ | 2m |
| Multi-user sync | Feature | ✅ | 3m |
| Drawing tools | Feature | ✅ | 2m |
| Touch support | Feature | ✅ | 2m |
| Persistence | Feature | ✅ | 1m |
| Logout | Security | ✅ | 1m |
| Error handling | Robustness | ✅ | 2m |
| Shortcuts | UX | ✅ | 1m |
| **Total** | **All** | **✅** | **16m** |

---

## 🐛 Bug Report Template

If you find any issues:

```markdown
### Bug Report

**Title:** [Brief description]

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Behavior:**
- ...

**Actual Behavior:**
- ...

**Screenshots:**
[Attach if possible]

**Environment:**
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [Windows/macOS/Linux]
- Server: [Running/Not running]

**Console Errors:**
[F12 → Console → Paste errors]
```

---

## 🔧 Troubleshooting

### Login keeps flashing?

**Solution:**
```javascript
// Open console (F12)
localStorage.clear()
// Reload page
```

### Can't connect to server?

**Check:**
```bash
# Verify server is running
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr 3000  # Windows
```

### Touch not working on mobile?

**Check:**
- DevTools showing mobile viewport
- Browser supports touch events
- Try different browser

### Drawing not syncing between users?

**Check:**
- Server is running
- Both users in same session
- No browser console errors (F12)
- Try refreshing page

---

## 📝 Manual Testing Checklist

### Before Testing
- [ ] Server running (`npm start`)
- [ ] Client running (`python -m http.server 8001`)
- [ ] Browser cache cleared
- [ ] No other instances running on ports 3000/8001

### Authentication
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] No page flashing on login
- [ ] Redirects to whiteboard properly
- [ ] localStorage has auth data
- [ ] Can logout successfully

### Offline Mode
- [ ] App detects server down
- [ ] Shows offline warning
- [ ] Still allows login
- [ ] Works without server
- [ ] Drawing works offline
- [ ] Can save offline

### Collaborative Features
- [ ] Can create session
- [ ] Session ID copyable
- [ ] Can join session with ID
- [ ] Multiple users see each other
- [ ] Drawing syncs in real-time
- [ ] User count updates
- [ ] Users can disconnect

### Drawing Features
- [ ] Pen tool works
- [ ] Eraser works
- [ ] Text tool works
- [ ] Color picker works
- [ ] Brush size adjustable
- [ ] Clear canvas works
- [ ] Save downloads PNG

### User Interface
- [ ] No layout breaks
- [ ] Responsive on mobile
- [ ] Touch events work
- [ ] Notifications display
- [ ] Buttons are clickable
- [ ] Error messages clear
- [ ] Status indicators update

### Performance
- [ ] App loads quickly
- [ ] Drawing smooth (60 FPS)
- [ ] No lag with 10+ users
- [ ] Canvas handles large drawings
- [ ] No memory leaks
- [ ] Network efficient

---

## ✅ Success Criteria

**All tests must pass for release:**

1. ✅ Login doesn't flash or redirect loop
2. ✅ Auth data persists to localStorage
3. ✅ Can create collaborative sessions
4. ✅ Can join sessions with ID
5. ✅ Offline mode works without server
6. ✅ Multi-user sync works
7. ✅ Drawing features all functional
8. ✅ Mobile/touch fully supported
9. ✅ Error messages clear and helpful
10. ✅ Performance is smooth (60 FPS)

---

**Status:** ✅ **READY FOR TESTING**  
**Last Updated:** December 15, 2025  
**Estimated Test Time:** 16 minutes
