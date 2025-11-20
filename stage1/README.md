# Fancy Whiteboard - Stage 1

## 🎨 Offline Drawing & Calendar Application

**CSCI3100 Course Project** - Stage 1 Implementation  
**Student:** Law Sau Ho (1155213041)  
**Date:** November 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Project Structure](#project-structure)
6. [Technologies](#technologies)
7. [Testing](#testing)

---

## Overview

**Fancy Whiteboard Stage 1** is a fully offline web application that provides:
- ✏️ **Drawing Tools** - Pen, eraser, text, with customizable colors and stroke widths
- 💾 **Save/Load** - Persistent storage of whiteboards using browser LocalStorage
- 📅 **Calendar** - Full event management with CRUD operations
- 🔐 **Authentication** - Secure user registration and login

This is the foundational stage before implementing real-time collaboration in Stage 2.

---

## Features

### ✨ Core Features

#### 1. User Authentication
- User registration with email validation
- Secure password hashing (SHA-256)
- Login/logout functionality
- Session persistence

#### 2. Drawing Tools
- **Pen Tool**: Draw with customizable colors and stroke widths
- **Eraser Tool**: Remove unwanted strokes
- **Text Tool**: Add text annotations to canvas
- **Color Picker**: Choose from full color spectrum
- **Stroke Width Slider**: Adjust pen thickness (1-20px)
- **Clear Canvas**: Reset entire drawing area

#### 3. Whiteboard Management
- **Save**: Store whiteboards with custom titles
- **Load**: Retrieve previously saved whiteboards
- **Delete**: Remove unwanted whiteboards
- **Persistent Storage**: All data stored in browser LocalStorage

#### 4. Calendar & Scheduling
- **Monthly View**: Navigate through months
- **Add Events**: Create events with title, date, start/end time
- **Event List**: View all upcoming events
- **Delete Events**: Remove past or cancelled events
- **Visual Indicators**: Days with events are highlighted

---

## Installation

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Python 3.x OR Node.js (for local HTTP server)

### Setup Steps

#### Option 1: Using Python (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/I-am-Lucas-Law-Sau-Ho/CSCI3100-project-whiteboard.git
cd CSCI3100-project-whiteboard

# 2. Switch to stage1-app branch
git checkout stage1-app

# 3. Navigate to stage1 folder
cd stage1

# 4. Start local HTTP server
python -m http.server 8000

# 5. Open browser
# Navigate to: http://localhost:8000/login.html
```

#### Option 2: Using Node.js

```bash
# Steps 1-3 same as above

# 4. Install http-server globally (if not already installed)
npm install -g http-server

# 5. Start server
http-server -p 8000

# 6. Open browser to: http://localhost:8000/login.html
```

#### Option 3: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Open `stage1/login.html` in VS Code
3. Right-click and select "Open with Live Server"

---

## Usage

### First Time Setup

1. **Register Account**
   - Click "Register here" on login page
   - Enter username, email, and password (min 6 characters)
   - Click "Create Account"

2. **Login**
   - Enter your username and password
   - Click "Login"

### Using the Whiteboard

1. **Drawing**
   - Select **Pen Tool** from toolbar
   - Choose color using color picker
   - Adjust stroke width with slider
   - Click and drag on canvas to draw

2. **Erasing**
   - Select **Eraser Tool**
   - Click and drag over strokes to remove them

3. **Adding Text**
   - Select **Text Tool**
   - Click on canvas where you want text
   - Type text in prompt dialog
   - Text appears at clicked location

4. **Saving**
   - Click "Save" button
   - Enter a title for your whiteboard
   - Click "Save" in modal

5. **Loading**
   - Click "Load" button
   - Select whiteboard from list
   - Click "Load" to restore

### Using the Calendar

1. **Navigate to Calendar**
   - Click "Calendar" tab in navigation bar

2. **Add Event**
   - Click "+ Add Event" button
   - Fill in event details:
     - Title (required)
     - Description (optional)
     - Date (required)
     - Start Time (required)
     - End Time (required)
   - Click "Save Event"

3. **View Events**
   - Events appear in the "Upcoming Events" list
   - Days with events are highlighted in calendar grid

4. **Delete Event**
   - Click "Delete" button next to event in list
   - Confirm deletion

---

## Project Structure

```
stage1/
├── index.html              # Main application page
├── login.html              # Authentication page
├── README.md               # This file
│
├── css/
│   ├── main.css           # Main application styles
│   └── calendar.css       # Calendar-specific styles
│
└── js/
    ├── utils.js           # Utility functions (UUID, hashing, formatting)
    ├── database.js        # LocalStorage database manager
    ├── auth.js            # Authentication service
    ├── drawing.js         # Drawing engine (canvas management)
    ├── calendar.js        # Calendar functionality
    └── app.js             # Main application logic
```

### File Descriptions

| File | Purpose | Key Functions |
|------|---------|---------------|
| `utils.js` | Helper functions | UUID generation, password hashing, date formatting |
| `database.js` | Data persistence | User/whiteboard/schedule CRUD operations |
| `auth.js` | Authentication | Registration, login, logout, session management |
| `drawing.js` | Drawing engine | Pen, eraser, text tools, canvas state management |
| `calendar.js` | Calendar UI | Month rendering, event display, CRUD operations |
| `app.js` | Application coordinator | Initialization, tab switching, modal management |

---

## Technologies

### Frontend
- **HTML5** - Semantic markup, Canvas API
- **CSS3** - Flexbox, Grid, responsive design
- **JavaScript (ES6+)** - Classes, modules, async/await

### Storage
- **LocalStorage** - Browser-based persistent storage
- **JSON** - Data serialization

### Security
- **SHA-256** - Password hashing (Web Crypto API)
- **Input Validation** - Client-side form validation

### Design
- **Responsive Layout** - Works on desktop and tablet
- **Modern UI** - Clean, professional interface
- **Accessibility** - Semantic HTML, proper labeling

---

## Testing

### Manual Testing Checklist

#### Authentication Tests
- [ ] Register new account with valid credentials
- [ ] Attempt registration with duplicate username
- [ ] Login with correct credentials
- [ ] Attempt login with incorrect password
- [ ] Logout successfully
- [ ] Session persists across page reloads

#### Drawing Tests
- [ ] Draw with pen tool
- [ ] Change pen color
- [ ] Adjust stroke width
- [ ] Use eraser to remove strokes
- [ ] Add text to canvas
- [ ] Clear entire canvas

#### Save/Load Tests
- [ ] Save whiteboard with title
- [ ] Load saved whiteboard
- [ ] Delete whiteboard
- [ ] Verify data persists after logout

#### Calendar Tests
- [ ] Navigate between months
- [ ] Add new event
- [ ] View event in list
- [ ] Delete event
- [ ] Verify event highlighting on calendar grid

### Browser Compatibility

Tested and verified on:
- ✅ Chrome 120+
- ✅ Firefox 110+
- ✅ Safari 17+
- ✅ Edge 120+

---

## Known Limitations (Stage 1)

- **Offline Only**: No server, no real-time collaboration
- **Local Storage**: Data stored per browser/device
- **No Sync**: Whiteboards don't sync across devices
- **Simple Eraser**: Removes entire strokes, not partial
- **No Undo/Redo**: Will be added in future versions

---

## Next Steps (Stage 2)

Planned features for Stage 2:
- ☁️ **Server Integration**: Node.js + Express backend
- 🔄 **Real-Time Collaboration**: WebSocket synchronization
- 👥 **Multi-User Support**: 10 concurrent users per session
- 🔔 **Push Notifications**: Event reminders
- 🗄️ **Server Database**: Persistent cloud storage

---

## Troubleshooting

### Issue: "Cannot read localStorage"
**Solution**: Must run with HTTP server, not file:// protocol. Use Python or Node.js server.

### Issue: "Page not loading"
**Solution**: 
1. Check browser console (F12) for errors
2. Verify all files are in correct directories
3. Ensure server is running on correct port

### Issue: "Canvas not responding"
**Solution**:
1. Check if JavaScript is enabled
2. Verify all JS files loaded (check Network tab)
3. Check console for script errors

### Issue: "Login fails"
**Solution**:
1. Clear localStorage: `localStorage.clear()` in console
2. Re-register account
3. Check password meets minimum length (6 chars)

---

## License

This project is part of CSCI3100 coursework.  
For educational purposes only.

---

## Contact

**Student**: Law Sau Ho  
**Student ID**: 1155213041  
**Email**: lucaslawsauho@gmail.com  
**GitHub**: [@I-am-Lucas-Law-Sau-Ho](https://github.com/I-am-Lucas-Law-Sau-Ho)

---

**Last Updated**: November 20, 2025
