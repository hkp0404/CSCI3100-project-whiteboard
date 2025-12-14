const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8001',
    credentials: true,
    methods: ['GET', 'POST']
  },
  pingInterval: parseInt(process.env.SOCKET_IO_PING_INTERVAL || '25000'),
  pingTimeout: parseInt(process.env.SOCKET_IO_PING_TIMEOUT || '60000')
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const users = new Map(); // userId -> {username, socketId, email}
const sessions = new Map(); // sessionId -> {users, whiteboardData, createdAt}
const whiteboards = new Map(); // whiteboardId -> {strokes, text, shapes}

// Helper functions
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9);
}

function generateWhiteboardId() {
  return 'whiteboard_' + Math.random().toString(36).substr(2, 9);
}

// REST Endpoints

// User Registration
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if user already exists
  for (let user of users.values()) {
    if (user.email === email) {
      return res.status(409).json({ error: 'Email already registered' });
    }
  }

  // Hash password
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const userId = 'user_' + Math.random().toString(36).substr(2, 9);

  users.set(userId, {
    id: userId,
    username,
    email,
    password: hashedPassword,
    socketId: null
  });

  // Generate JWT
  const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '24h' });

  res.status(201).json({ success: true, token, userId, username });
});

// User Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Find user by email
  let user = null;
  for (let u of users.values()) {
    if (u.email === email) {
      user = u;
      break;
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Verify password
  if (!bcryptjs.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

  res.json({ success: true, token, userId: user.id, username: user.username });
});

// Create new session
app.post('/api/sessions', (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const sessionId = generateSessionId();
    const whiteboardId = generateWhiteboardId();

    sessions.set(sessionId, {
      id: sessionId,
      whiteboardId,
      owner: decoded.userId,
      users: new Set([decoded.userId]),
      createdAt: new Date(),
      maxUsers: 10
    });

    whiteboards.set(whiteboardId, {
      id: whiteboardId,
      strokes: [],
      texts: [],
      events: []
    });

    res.status(201).json({ sessionId, whiteboardId });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Get session info
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    sessionId,
    whiteboardId: session.whiteboardId,
    users: Array.from(session.users),
    maxUsers: session.maxUsers,
    createdAt: session.createdAt
  });
});

// Socket.IO Events

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins session
  socket.on('join_session', (data) => {
    const { sessionId, userId, username } = data;
    const session = sessions.get(sessionId);

    if (!session) {
      socket.emit('error', 'Session not found');
      return;
    }

    if (session.users.size >= session.maxUsers) {
      socket.emit('error', 'Session is full');
      return;
    }

    // Add user to session
    session.users.add(userId);
    socket.join(sessionId);
    socket.emit('session_joined', {
      sessionId,
      whiteboardId: session.whiteboardId,
      users: Array.from(session.users)
    });

    // Notify other users
    socket.to(sessionId).emit('user_joined', {
      userId,
      username,
      users: Array.from(session.users)
    });

    // Send current whiteboard state
    const whiteboard = whiteboards.get(session.whiteboardId);
    if (whiteboard) {
      socket.emit('whiteboard_state', whiteboard);
    }
  });

  // Handle drawing events
  socket.on('draw', (data) => {
    const { sessionId, stroke } = data;
    const session = sessions.get(sessionId);

    if (session) {
      const whiteboard = whiteboards.get(session.whiteboardId);
      if (whiteboard) {
        whiteboard.strokes.push(stroke);
      }

      // Broadcast to all users in session (except sender)
      socket.to(sessionId).emit('draw', stroke);
    }
  });

  // Handle text events
  socket.on('add_text', (data) => {
    const { sessionId, text } = data;
    const session = sessions.get(sessionId);

    if (session) {
      const whiteboard = whiteboards.get(session.whiteboardId);
      if (whiteboard) {
        whiteboard.texts.push(text);
      }

      socket.to(sessionId).emit('add_text', text);
    }
  });

  // Handle calendar events
  socket.on('schedule_event', (data) => {
    const { sessionId, event } = data;
    const session = sessions.get(sessionId);

    if (session) {
      const whiteboard = whiteboards.get(session.whiteboardId);
      if (whiteboard) {
        whiteboard.events.push(event);
      }

      // Broadcast to all users
      io.to(sessionId).emit('schedule_event', event);
    }
  });

  // Handle schedule notifications
  socket.on('trigger_notification', (data) => {
    const { sessionId, notification } = data;

    if (sessionId) {
      io.to(sessionId).emit('notification', notification);
    }
  });

  // User leaves session
  socket.on('leave_session', (data) => {
    const { sessionId, userId, username } = data;
    const session = sessions.get(sessionId);

    if (session) {
      session.users.delete(userId);

      // Notify other users
      io.to(sessionId).emit('user_left', {
        userId,
        username,
        users: Array.from(session.users)
      });

      // Delete session if empty
      if (session.users.size === 0) {
        sessions.delete(sessionId);
        whiteboards.delete(session.whiteboardId);
      }
    }
  });

  // Clear whiteboard
  socket.on('clear_board', (data) => {
    const { sessionId } = data;
    const session = sessions.get(sessionId);

    if (session) {
      const whiteboard = whiteboards.get(session.whiteboardId);
      if (whiteboard) {
        whiteboard.strokes = [];
        whiteboard.texts = [];
      }

      io.to(sessionId).emit('clear_board');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Fancy Whiteboard Server running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket ready for real-time collaboration`);
  console.log(`📊 Max concurrent users: ${process.env.SOCKET_IO_MAX_USERS || 10}`);
});

module.exports = server;
