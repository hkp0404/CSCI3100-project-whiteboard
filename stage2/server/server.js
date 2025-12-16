const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const path = require('path');
const SyncHandler = require('./sync-handler');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
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
app.use(express.static(path.join(__dirname, '../client')));

// Initialize Sync Handler
const syncHandler = new SyncHandler(io);

// In-memory storage (with persistent actions)
const users = new Map();
const sessions = new Map();
const whiteboards = new Map();
const actionHistory = new Map(); // sessionId -> [actions]

// Helper functions
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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
    if (user.email === email || user.username === username) {
      return res.status(409).json({ error: 'User already exists' });
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
    socketId: null,
    createdAt: new Date()
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

// Create new whiteboard session
app.post('/api/whiteboards', (req, res) => {
  const { token, title } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const sessionId = generateSessionId();
    const whiteboardId = generateWhiteboardId();

    // Create session
    sessions.set(sessionId, {
      id: sessionId,
      whiteboardId,
      owner: decoded.userId,
      title: title || 'Untitled Whiteboard',
      users: new Set([decoded.userId]),
      createdAt: new Date(),
      lastModified: new Date(),
      maxUsers: 10
    });

    // Initialize whiteboard
    whiteboards.set(whiteboardId, {
      id: whiteboardId,
      strokes: [],
      texts: [],
      shapes: []
    });

    // Initialize action history
    actionHistory.set(sessionId, []);

    // Initialize sync session
    syncHandler.createSession(sessionId);

    res.status(201).json({ sessionId, whiteboardId, title });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Get user's whiteboards
app.get('/api/whiteboards', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userWhiteboards = [];

    for (let session of sessions.values()) {
      if (session.owner === decoded.userId) {
        userWhiteboards.push({
          sessionId: session.id,
          whiteboardId: session.whiteboardId,
          title: session.title,
          createdAt: session.createdAt,
          lastModified: session.lastModified,
          participantCount: session.users.size
        });
      }
    }

    res.json(userWhiteboards);
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
    title: session.title,
    users: Array.from(session.users),
    participantCount: session.users.size,
    maxUsers: session.maxUsers,
    createdAt: session.createdAt
  });
});

// Get action history for session
app.get('/api/sessions/:sessionId/history', (req, res) => {
  const { sessionId } = req.params;
  const history = actionHistory.get(sessionId) || [];

  res.json({
    sessionId,
    totalActions: history.length,
    actions: history
  });
});

// Socket.IO Events

io.on('connection', (socket) => {
  console.log(`[WS] New client connected: ${socket.id}`);

  // User joins session
  socket.on('join_session', (data, callback) => {
    try {
      const { sessionId, userId, username } = data;
      const session = sessions.get(sessionId);

      if (!session) {
        callback?.({ success: false, error: 'Session not found' });
        return;
      }

      if (session.users.size >= session.maxUsers) {
        callback?.({ success: false, error: 'Session is full' });
        return;
      }

      // Add user to session
      session.users.add(userId);
      socket.join(sessionId);

      // Add participant to sync handler
      const participant = syncHandler.addParticipant(sessionId, userId, username, socket.id);

      // Send session joined confirmation
      socket.emit('session_joined', {
        sessionId,
        whiteboardId: session.whiteboardId,
        users: Array.from(session.users),
        title: session.title
      });

      // Notify other users
      socket.to(sessionId).emit('user_joined', {
        userId,
        username,
        users: Array.from(session.users),
        timestamp: new Date()
      });

      // Send current whiteboard state
      const whiteboard = whiteboards.get(session.whiteboardId);
      if (whiteboard) {
        socket.emit('whiteboard_state', {
          whiteboardId: whiteboard.id,
          strokes: whiteboard.strokes,
          texts: whiteboard.texts,
          shapes: whiteboard.shapes
        });
      }

      // Send action history
      const history = actionHistory.get(sessionId) || [];
      socket.emit('action_history', history);

      callback?.({ success: true, sessionId, userId, username });
      console.log(`[WS] ${username} (${userId}) joined session ${sessionId}`);
    } catch (error) {
      console.error('[WS] Join session error:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // Handle drawing events
  socket.on('draw', (data, callback) => {
    try {
      const { sessionId, stroke, userId } = data;
      const session = sessions.get(sessionId);

      if (session) {
        const whiteboard = whiteboards.get(session.whiteboardId);
        if (whiteboard) {
          whiteboard.strokes.push(stroke);
        }

        // Record action
        const action = syncHandler.recordAction(sessionId, {
          type: 'draw',
          data: stroke,
          userId
        });

        // Add to history
        const history = actionHistory.get(sessionId) || [];
        history.push(action);
        actionHistory.set(sessionId, history);

        // Update last modified
        session.lastModified = new Date();

        // Broadcast to all users in session (except sender)
        socket.to(sessionId).emit('draw', { stroke, userId, timestamp: Date.now() });

        callback?.({ success: true });
      }
    } catch (error) {
      console.error('[WS] Draw error:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // Handle text events
  socket.on('add_text', (data, callback) => {
    try {
      const { sessionId, text, userId } = data;
      const session = sessions.get(sessionId);

      if (session) {
        const whiteboard = whiteboards.get(session.whiteboardId);
        if (whiteboard) {
          whiteboard.texts.push(text);
        }

        // Record action
        const action = syncHandler.recordAction(sessionId, {
          type: 'add_text',
          data: text,
          userId
        });

        // Add to history
        const history = actionHistory.get(sessionId) || [];
        history.push(action);
        actionHistory.set(sessionId, history);

        session.lastModified = new Date();

        socket.to(sessionId).emit('add_text', { text, userId, timestamp: Date.now() });

        callback?.({ success: true });
      }
    } catch (error) {
      console.error('[WS] Add text error:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // Handle eraser
  socket.on('erase', (data, callback) => {
    try {
      const { sessionId, eraseData, userId } = data;
      const session = sessions.get(sessionId);

      if (session) {
        // Record action
        const action = syncHandler.recordAction(sessionId, {
          type: 'erase',
          data: eraseData,
          userId
        });

        const history = actionHistory.get(sessionId) || [];
        history.push(action);
        actionHistory.set(sessionId, history);

        session.lastModified = new Date();

        socket.to(sessionId).emit('erase', { eraseData, userId, timestamp: Date.now() });

        callback?.({ success: true });
      }
    } catch (error) {
      console.error('[WS] Erase error:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // Handle clear board
  socket.on('clear_board', (data, callback) => {
    try {
      const { sessionId, userId } = data;
      const session = sessions.get(sessionId);

      if (session) {
        const whiteboard = whiteboards.get(session.whiteboardId);
        if (whiteboard) {
          whiteboard.strokes = [];
          whiteboard.texts = [];
          whiteboard.shapes = [];
        }

        // Record action
        const action = syncHandler.recordAction(sessionId, {
          type: 'clear_board',
          data: {},
          userId
        });

        const history = actionHistory.get(sessionId) || [];
        history.push(action);
        actionHistory.set(sessionId, history);

        session.lastModified = new Date();

        io.to(sessionId).emit('clear_board', { userId, timestamp: Date.now() });

        callback?.({ success: true });
      }
    } catch (error) {
      console.error('[WS] Clear board error:', error);
      callback?.({ success: false, error: error.message });
    }
  });

  // Handle cursor movement (for user awareness)
  socket.on('cursor_move', (data) => {
    const { sessionId, position, userId } = data;
    socket.to(sessionId).emit('cursor_move', { position, userId, timestamp: Date.now() });
  });

  // User leaves session
  socket.on('leave_session', (data) => {
    try {
      const { sessionId, userId, username } = data;
      const session = sessions.get(sessionId);

      if (session) {
        session.users.delete(userId);
        syncHandler.removeParticipant(sessionId, socket.id);

        // Notify other users
        io.to(sessionId).emit('user_left', {
          userId,
          username,
          users: Array.from(session.users),
          timestamp: new Date()
        });

        // Clean up empty sessions
        if (session.users.size === 0) {
          sessions.delete(sessionId);
          whiteboards.delete(session.whiteboardId);
          syncHandler.clearSession(sessionId);
          console.log(`[WS] Session ${sessionId} closed (no participants)`);
        }
      }
    } catch (error) {
      console.error('[WS] Leave session error:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);

    // Clean up any sessions
    for (let [sessionId, session] of sessions.entries()) {
      for (let userId of session.users) {
        // Find if this socket belonged to this user
        const participants = syncHandler.getParticipants(sessionId);
        const participant = participants.find(p => p.socketId === socket.id);
        if (participant) {
          session.users.delete(participant.userId);
          syncHandler.removeParticipant(sessionId, socket.id);
          break;
        }
      }

      if (session.users.size === 0) {
        sessions.delete(sessionId);
        whiteboards.delete(session.whiteboardId);
        syncHandler.clearSession(sessionId);
      }
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    activeSessions: sessions.size,
    connectedUsers: users.size
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✨ Fancy-Whiteboard Stage 2 Server`);
  console.log(`${'='.repeat(50)}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket ready for real-time multi-computer sync`);
  console.log(`📊 Max concurrent users per session: 10`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || '*'}`);
  console.log(`📝 Client: http://localhost:${PORT}/client/login.html`);
  console.log(`${'='.repeat(50)}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = server;
