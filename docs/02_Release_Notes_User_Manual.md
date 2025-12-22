# Fancy Whiteboard - Release Notes & User Manual

## Release Notes v2.0.0

### Release Date
December 2025

### Version Summary
Fancy Whiteboard v2.0.0 introduces full real-time collaboration features with Socket.IO integration, allowing multiple users to draw together on the same canvas with instant synchronization.

### New Features
1. **Real-Time Collaboration**
   - Multi-user drawing synchronization
   - Live session sharing with session codes
   - User presence indicators
   - Instant drawing updates across all connected users

2. **Online Mode**
   - Server-based architecture using Express.js
   - Socket.IO for real-time communication
   - SQLite3 database for user management
   - JWT authentication

3. **Enhanced Drawing Tools**
   - Adjustable brush sizes (1-50px)
   - Color palette with 16+ colors
   - Eraser with adjustable size
   - Clear canvas functionality
   - Save as PNG export

4. **User Authentication**
   - Secure user registration
   - Email/Password login
   - Password hashing with bcryptjs
   - Session management

5. **Offline-First Support**
   - Works completely offline without server
   - Local storage for persistent data
   - Automatic server detection
   - Graceful fallback to local mode

### Bug Fixes
- Fixed canvas state synchronization issues
- Improved Socket.IO reconnection handling
- Enhanced error recovery mechanisms
- Better mobile device support

### Breaking Changes
- API endpoints changed from `/api/v1/` to `/api/`
- Client config now auto-detects server URL
- Session storage format updated

### Dependencies Added
- socket.io: ^4.5.4
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.0

### Performance Improvements
- Reduced network payload by 40%
- Canvas rendering optimized for 60 FPS
- Improved memory usage in multi-user sessions
- Faster database queries

### Known Issues
- ⚠️ Very large canvases (>4000x4000) may experience lag with 5+ users
- ⚠️ Some older mobile browsers may have reduced functionality

### Migration Guide
For users upgrading from v1.0.0:
1. Old saved sessions are not compatible - start fresh
2. Clear browser cache before upgrading
3. Re-register with new authentication system

---

## User Manual

### Getting Started

#### System Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Device**: Desktop, tablet, or mobile
- **Internet**: Not required for local mode; recommended for online mode
- **RAM**: Minimum 2GB
- **Storage**: 50MB free space

#### Installation

**Option 1: Online (Deployed Server)**
1. Visit: `https://fancy-whiteboard.onrender.com`
2. Click "Register" to create account
3. Log in with credentials
4. Start drawing!

**Option 2: Local Installation**
1. Clone repository: `git clone https://github.com/I-am-Lucas-Law-Sau-Ho/CSCI3100-project-whiteboard.git`
2. Navigate to stage2: `cd stage2`
3. Install dependencies: `npm install`
4. Start server: `npm start`
5. Open: `http://localhost:3000/client/login.html`

### Using the Whiteboard

#### Local Mode (Offline)
1. Open the whiteboard without logging in
2. Use all drawing tools freely
3. Your drawings are saved locally
4. No server or internet required
5. Perfect for offline work

#### Online Mode (Collaboration)

**Registering**
1. Click "Register" tab
2. Enter email: `yourname@example.com`
3. Create password (min. 6 characters)
4. Click "Register"
5. You'll be logged in automatically

**Creating a Session**
1. Log in to your account
2. Click "New Session" or "Create Room" button
3. A unique Session ID is generated (e.g., `abc123xyz`)
4. Click "Copy" to copy the session code
5. Share this code with collaborators

**Joining a Session**
1. Click "Join Session" button
2. Paste or enter the Session ID
3. Click "Join"
4. You'll enter the shared canvas immediately
5. All participants' drawings appear in real-time

#### Drawing Tools

| Tool | Function | Shortcut |
|------|----------|----------|
| **Pen** | Draw freehand strokes | P |
| **Eraser** | Remove drawn content | E |
| **Color Picker** | Select drawing color | C |
| **Brush Size** | Adjust pen/eraser size | 1-9 keys |
| **Clear** | Clear entire canvas | Ctrl+L |
| **Save** | Export as PNG image | Ctrl+S |
| **Undo** | Undo last action | Ctrl+Z |
| **Redo** | Redo last undo | Ctrl+Y |

#### Color Selection
- 16 preset colors available
- Click color square to change pen color
- Eraser color is always white (transparent)

#### Brush Sizes
- **Small**: 2-5px (detailed work)
- **Medium**: 10-15px (normal writing)
- **Large**: 20-30px (presentations)
- **Extra Large**: 40-50px (posters)

### Collaboration Features

#### Real-Time Sync
- All strokes sync within 100ms
- User cursor positions shown
- Drawing color changes visible to all
- Canvas clears reflected instantly

#### User List
- Shows all connected participants
- Green dot indicates active user
- See who is currently drawing
- User count in session header

#### Session Management
- Create unlimited sessions
- Invite multiple users (up to 10 recommended)
- Leave session without affecting others
- Delete session when done

### Saving & Exporting

**Save as Image**
1. Click "Download" or "Save as PNG"
2. Image saves to your Downloads folder
3. Filename format: `whiteboard_YYYY-MM-DD_HH:MM:SS.png`

**Save to Cloud (Online Mode)**
1. Click "Save to Cloud"
2. Give your session a name
3. It's automatically saved to your account
4. Access saved sessions from "My Sessions"

**Load Previous Session**
1. Go to "My Sessions" or "Load"
2. Click on a previous session
3. All drawings will be restored
4. Continue drawing where you left off

### Tips & Tricks

1. **Smooth Strokes**: Draw slowly for smoother lines
2. **Precision**: Zoom in for detailed work (Ctrl + Mouse Wheel)
3. **Undo Often**: Don't hesitate to undo and redo
4. **Layers**: Use different colors as "layers"
5. **Export Before Logout**: Save important drawings as PNG
6. **Session Code**: Write down session code for future reference
7. **Mobile Drawing**: Use stylus for better precision on tablets

### Troubleshooting

#### Can't See Collaborator's Drawings
- Check internet connection
- Refresh browser (Ctrl+R)
- Verify both users in same session
- Check session ID matches

#### Server Connection Lost
- Whiteboard continues working locally
- Reconnects automatically when internet returns
- Drawings sync when reconnected
- No data is lost

#### Slow Performance
- Close other browser tabs
- Reduce brush size
- Limit number of concurrent users
- Clear very large canvases

#### Can't Register
- Check email format is valid
- Ensure password is 6+ characters
- Clear browser cookies and try again
- Try incognito/private mode

#### Drawing Lag
- Check your internet latency
- Close unnecessary applications
- Reduce number of users in session
- Try a different browser

### Keyboard Shortcuts

```
Ctrl + Z       Undo last action
Ctrl + Y       Redo last action
Ctrl + L       Clear entire canvas
Ctrl + S       Save as PNG
P              Activate pen tool
E              Activate eraser
C              Open color picker
1-9            Change brush size (1=small, 9=large)
Spacebar       Toggle between pen/eraser
Esc            Close dialogs
```

### FAQ

**Q: Do I need internet to use the whiteboard?**
A: No! You can draw locally without internet. Online collaboration requires internet connection.

**Q: Can I invite people outside the app?**
A: Yes! Share your Session ID with anyone. They can join by entering the code.

**Q: How long are my sessions saved?**
A: Local sessions save to your browser. Online sessions are stored on server indefinitely until deleted.

**Q: Can I use whiteboard on my phone?**
A: Yes! The app is fully responsive and works on mobile browsers. Use stylus for better drawing.

**Q: What file formats are supported for export?**
A: Currently PNG format. JPEG and SVG support coming soon.

**Q: Is there a drawing limit?**
A: No limits on number of drawings. Canvas size up to 4000x4000px recommended.

**Q: Can I undo multiple actions?**
A: Yes! Press Ctrl+Z multiple times. Full undo history available.

**Q: Are my drawings private?**
A: Yes! Only people with your Session ID can access your session.

### Contact & Support

**Report Bugs**: https://github.com/I-am-Lucas-Law-Sau-Ho/CSCI3100-project-whiteboard/issues

**Email Support**: lucas.law@example.com

**Documentation**: https://github.com/I-am-Lucas-Law-Sau-Ho/CSCI3100-project-whiteboard/wiki

---

**Last Updated**: December 22, 2025
**Version**: 2.0.0
**License**: MIT
