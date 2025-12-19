# Multi-Computer Synchronization Guide - Stage 2

## Overview

This document describes the real-time multi-computer synchronization implementation for Fancy-Whiteboard Stage 2, enabling up to 10 concurrent users to collaborate on a single whiteboard with real-time updates.

## Architecture

### Server Components

#### 1. **WebSocket Server (server.js)**
- Uses Socket.IO for real-time bidirectional communication
- Manages active sessions and participant tracking
- Broadcasts drawing actions to all connected clients
- Persists all actions to SQLite database

#### 2. **Synchronization Handler (sync-handler.js)**
- Manages session state and participant tracking
- Implements CRDT (Conflict-free Replicated Data Type) approach
- Resolves concurrent edits with timestamp and user ID tiebreakers
- Maintains operation log for action replay and history

#### 3. **Database Schema**

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  created_at DATETIME
);

-- Whiteboards table
CREATE TABLE whiteboards (
  id INTEGER PRIMARY KEY,
  session_id TEXT UNIQUE,
  owner_id INTEGER,
  title TEXT,
  created_at DATETIME,
  last_modified DATETIME
);

-- Actions log
CREATE TABLE actions (
  id INTEGER PRIMARY KEY,
  session_id TEXT,
  action_type TEXT,
  action_data TEXT,
  user_id INTEGER,
  timestamp DATETIME
);

-- Active sessions
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  session_id TEXT,
  user_id INTEGER,
  socket_id TEXT,
  joined_at DATETIME
);
```

### Client Components

#### 1. **Sync Client (sync-client.js)**
- Handles all WebSocket communication
- Manages local event listeners
- Implements automatic reconnection
- Tracks remote users and connection status

#### 2. **Integration with Canvas**
- Captures drawing, text, and erase actions
- Sends actions to sync client
- Listens for remote actions and renders them
- Updates UI with participant information

## Real-Time Synchronization Flow

### 1. User Joins Session

```
Client: join-session
   ↓
Server: Validate session
   ↓
Server: Add participant to tracking
   ↓
Server: Save session record to database
   ↓
Server: Broadcast 'user-joined' to all clients in session
   ↓
Server: Send drawing state snapshot to new user
   ↓
Client: Load drawing state and render
```

### 2. User Draws on Canvas

```
Local User: Draw stroke
   ↓
Client: Capture stroke data
   ↓
Client: Emit 'draw-stroke' to server
   ↓
Server: Record action with operation number
   ↓
Server: Save action to database
   ↓
Server: Broadcast 'remote-stroke' to all other clients
   ↓
Remote Clients: Render stroke immediately
```

### 3. Conflict Resolution

When concurrent edits occur (rare for drawing app), the system uses:

```javascript
// CRDT approach
if (incomingAction.timestamp > existingAction.timestamp) {
  // Newer action wins
  return incomingAction;
} else if (incomingAction.timestamp === existingAction.timestamp) {
  // Use userId as tiebreaker
  return incomingAction.userId > existingAction.userId 
    ? incomingAction 
    : existingAction;
}
```

## API Endpoints

### Authentication

```
POST /api/auth/register
Body: { username, password }
Response: { userId, message }

POST /api/auth/login
Body: { username, password }
Response: { token, userId, username }
```

### Whiteboard Management

```
POST /api/whiteboards
Header: Authorization: Bearer <token>
Body: { title }
Response: { sessionId, message }

GET /api/whiteboards
Header: Authorization: Bearer <token>
Response: [{ sessionId, title, created_at, last_modified }]

GET /api/whiteboards/:sessionId/history
Response: [{ action_type, action_data, user_id, timestamp }]
```

## Socket.IO Events

### Client → Server

```javascript
// Join session
socket.emit('join-session', sessionId, userId, username, callback)

// Send drawing stroke
socket.emit('draw-stroke', sessionId, strokeData, userId, callback)

// Send text input
socket.emit('add-text', sessionId, textData, userId, callback)

// Send erase action
socket.emit('erase-action', sessionId, eraseData, userId, callback)

// Clear canvas
socket.emit('clear-canvas', sessionId, userId, callback)

// Update cursor position
socket.emit('cursor-move', sessionId, cursorData, userId)

// Leave session
socket.emit('leave-session', sessionId, userId)
```

### Server → Client

```javascript
// User joined notification
socket.on('user-joined', { userId, username, participants, timestamp })

// User left notification
socket.on('user-left', { userId, participants, timestamp })

// Receive remote stroke
socket.on('remote-stroke', { strokeData, userId, timestamp })

// Receive remote text
socket.on('remote-text', { textData, userId, timestamp })

// Receive remote erase
socket.on('remote-erase', { eraseData, userId, timestamp })

// Canvas cleared
socket.on('canvas-cleared', { userId, timestamp })

// Load drawing state on join
socket.on('load-drawing-state', { actions, participants })

// Receive remote cursor
socket.on('remote-cursor', { cursorData, userId, timestamp })
```

## Data Persistence

All actions are persisted to SQLite database in real-time:

```javascript
// Action structure
{
  session_id: string,
  action_type: 'draw-stroke' | 'add-text' | 'erase-action' | 'clear-canvas',
  action_data: JSON.stringify(actionData),
  user_id: integer,
  timestamp: datetime
}
```

### Benefits:
- Session can be replayed from action history
- Users joining mid-session can catch up
- Audit trail of all changes
- Recovery from client-side issues

## Performance Optimization

### 1. Action Batching
- Small actions are grouped before broadcasting
- Reduces network overhead

### 2. Drawing State Compaction
- Erased elements are removed from state
- Memory usage remains bounded

### 3. Lazy Loading
- New users only receive essential state
- Full history available on-demand via API

### 4. Connection Management
- Automatic reconnection with exponential backoff
- Handles temporary network interruptions
- Offline queue for pending actions

## Error Handling

```javascript
// Network errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Attempt reconnection
});

// Action acknowledgment failures
socket.emit('draw-stroke', ..., (response) => {
  if (!response.success) {
    // Handle failure - retry or notify user
  }
});

// Session errors
try {
  await syncClient.joinSession(sessionId, userId, username);
} catch (error) {
  console.error('Failed to join session:', error);
}
```

## Testing Multi-Computer Sync

### 1. Local Testing (Multiple Browsers)

```bash
# Terminal 1: Start server
cd stage2/server
npm install
node server.js

# Terminal 2: Start client 1
open http://localhost:3000/client/login.html

# Terminal 3: Start client 2 (different browser/window)
open http://localhost:3000/client/login.html

# Steps:
1. Register two users
2. Both login
3. User 1 creates whiteboard
4. User 1 shares session ID with User 2
5. User 2 joins session
6. Draw on both - see real-time updates
```

### 2. Network Testing

```bash
# Test connection loss
# Browser DevTools → Network → Offline
# Actions queue, reconnect restores

# Test high latency
# Chrome DevTools → Network → Slow 3G
# Verify order preservation and consistency
```

### 3. Stress Testing

```bash
# Test with maximum participants (10 users)
# Load testing tool: Apache JMeter or Artillery
# Verify server stability and response times
```

## Troubleshooting

### Connection Issues

```javascript
// Check connection status
console.log(syncClient.getStatus());
// { connected: boolean, inSession: boolean, ... }

// Check server logs
console.log('User connected:', socket.id);
```

### Missing Updates

```javascript
// Verify server broadcasting
socket.to(sessionId).emit('remote-stroke', data);

// Check database persistence
SELECT * FROM actions WHERE session_id = ?;
```

### Database Issues

```javascript
// Check database connection
db.get('SELECT 1', (err) => {
  if (err) console.error('DB error:', err);
});
```

## Security Considerations

1. **Authentication**: JWT tokens with 24h expiration
2. **Authorization**: Session access control via database
3. **Data Validation**: All inputs sanitized
4. **Rate Limiting**: Consider implementing for production
5. **HTTPS/WSS**: Use secure connections in production

## Future Enhancements

1. **Operational Transformation (OT)**: More sophisticated conflict resolution
2. **Offline-First**: Full offline support with later sync
3. **Version Control**: Branch and merge whiteboards
4. **Rich Presence**: Show user cursors and selections
5. **Comments/Annotations**: Collaborative feedback
6. **Permission System**: Edit, view-only, admin roles

## Summary

The multi-computer sync implementation provides:
- ✅ Real-time collaboration for up to 10 users
- ✅ Automatic action persistence
- ✅ Conflict resolution via CRDT
- ✅ Automatic reconnection
- ✅ Action history and replay
- ✅ Scalable architecture
