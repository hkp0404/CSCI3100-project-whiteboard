# Fancy Whiteboard Server - Stage 2

## Overview
This is the Node.js + Socket.IO backend server for the real-time collaborative whiteboard application. It handles:
- User authentication (register/login)
- Session management for collaborative whiteboards
- Real-time drawing synchronization via WebSocket
- Calendar event sharing and notifications
- User presence tracking

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

### Step 1: Install Dependencies
```bash
cd stage2/server
npm install
```

### Step 2: Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your settings (optional for development)
# Default values are already set
```

### Step 3: Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

You should see:
```
🚀 Fancy Whiteboard Server running on http://localhost:3000
⚡ WebSocket ready for real-time collaboration
📊 Max concurrent users: 10
```

## API Endpoints

### Authentication

**Register User**
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "user_abc123",
  "username": "john_doe"
}
```

**Login User**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "user_abc123",
  "username": "john_doe"
}
```

### Session Management

**Create Session**
```
POST /api/sessions
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "sessionId": "session_xyz789",
  "whiteboardId": "whiteboard_abc123"
}
```

**Get Session Info**
```
GET /api/sessions/{sessionId}

Response:
{
  "sessionId": "session_xyz789",
  "whiteboardId": "whiteboard_abc123",
  "users": ["user_abc123", "user_def456"],
  "maxUsers": 10,
  "createdAt": "2025-12-14T15:30:00Z"
}
```

## WebSocket Events

### Client → Server

**join_session**
```javascript
socket.emit('join_session', {
  sessionId: 'session_xyz789',
  userId: 'user_abc123',
  username: 'john_doe'
});
```

**draw**
```javascript
socket.emit('draw', {
  sessionId: 'session_xyz789',
  stroke: {
    id: 'stroke_001',
    x: 100,
    y: 200,
    color: '#000000',
    size: 5,
    tool: 'pen'
  }
});
```

**add_text**
```javascript
socket.emit('add_text', {
  sessionId: 'session_xyz789',
  text: {
    id: 'text_001',
    x: 150,
    y: 250,
    content: 'Hello World',
    fontSize: 16,
    color: '#000000'
  }
});
```

**schedule_event**
```javascript
socket.emit('schedule_event', {
  sessionId: 'session_xyz789',
  event: {
    id: 'event_001',
    date: '2025-12-15',
    time: '14:00',
    title: 'Team Meeting',
    description: 'Discuss Q1 roadmap'
  }
});
```

**leave_session**
```javascript
socket.emit('leave_session', {
  sessionId: 'session_xyz789',
  userId: 'user_abc123',
  username: 'john_doe'
});
```

**clear_board**
```javascript
socket.emit('clear_board', {
  sessionId: 'session_xyz789'
});
```

### Server → Client

**session_joined**
```javascript
socket.on('session_joined', (data) => {
  // data: { sessionId, whiteboardId, users }
});
```

**whiteboard_state**
```javascript
socket.on('whiteboard_state', (data) => {
  // data: { id, strokes, texts, events }
});
```

**draw**
```javascript
socket.on('draw', (stroke) => {
  // stroke: { id, x, y, color, size, tool }
});
```

**user_joined**
```javascript
socket.on('user_joined', (data) => {
  // data: { userId, username, users }
});
```

**user_left**
```javascript
socket.on('user_left', (data) => {
  // data: { userId, username, users }
});
```

**notification**
```javascript
socket.on('notification', (notification) => {
  // notification: { type, title, message, timestamp }
});
```

## Configuration

Edit `.env` file to customize:

```bash
# Server Port
PORT=3000

# Node Environment
NODE_ENV=development

# JWT Secret (change in production!)
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=24h

# WebSocket Settings
SOCKET_IO_MAX_USERS=10
SOCKET_IO_PING_INTERVAL=25000
SOCKET_IO_PING_TIMEOUT=60000

# CORS Settings
CORS_ORIGIN=http://localhost:8001
CORS_CREDENTIALS=true
```

## Database (Future Enhancement)

Currently uses in-memory storage. For production, replace with:
- PostgreSQL
- MongoDB
- Firebase
- AWS DynamoDB

## Deployment

### Using Heroku
```bash
heroku create your-app-name
heroku config:set JWT_SECRET=your_production_secret
heroku config:set NODE_ENV=production
git push heroku main
```

### Using AWS EC2
1. Launch EC2 instance (Node.js AMI)
2. SSH into instance
3. Clone repository
4. Run `npm install && npm start`
5. Configure security groups to allow ports 3000 and 443

## Troubleshooting

**Port 3000 already in use**
```bash
# Kill process on port 3000
kill -9 $(lsof -t -i :3000)

# Or use different port
PORT=3001 npm start
```

**CORS errors**
- Update `CORS_ORIGIN` in `.env` to match your client URL
- Make sure client is running on `http://localhost:8001` (default)

**WebSocket connection fails**
- Check server is running on port 3000
- Verify firewall allows port 3000
- Check browser console for detailed errors

## Testing

```bash
# Test server is running
curl http://localhost:3000/

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

## Performance

- Supports up to 10 concurrent users per session
- Real-time sync latency: <100ms
- Graceful handling of disconnections
- Automatic session cleanup when users leave

## Security Notes

⚠️ **For Production:**
- Change JWT_SECRET to a strong random string
- Use HTTPS/WSS (not HTTP/WS)
- Add rate limiting
- Implement database for persistent storage
- Add input validation and sanitization
- Use environment variables for all secrets
- Enable CORS only for trusted domains

## License
MIT

## Support
For issues or questions, contact the CSCI3100 team.
