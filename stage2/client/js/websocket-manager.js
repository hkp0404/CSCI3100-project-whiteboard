// WebSocket Manager for Stage 2 - Real-time Collaboration
class WebSocketManager {
  constructor(serverURL = 'http://localhost:3000') {
    this.serverURL = serverURL;
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
    this.username = null;
    this.sessionId = null;
    this.whiteboardId = null;
    this.listeners = {};
    this.eventQueue = []; // Queue events when offline
    this.isOnline = navigator.onLine;
  }

  // Initialize WebSocket connection
  async connect(token) {
    try {
      const ioScript = document.createElement('script');
      ioScript.src = `${this.serverURL}/socket.io/socket.io.js`;
      ioScript.onload = () => {
        this.socket = io(this.serverURL, {
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        this.setupSocketListeners();
        this.setupOfflineDetection();
      };
      document.head.appendChild(ioScript);
    } catch (error) {
      console.error('Failed to connect to server:', error);
      this.handleOfflineMode();
    }
  }

  // Setup socket event listeners
  setupSocketListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.isOnline = true;
      this.emit('connected');
      this.flushEventQueue();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleOfflineMode();
    });

    // Session events
    this.socket.on('session_joined', (data) => {
      this.sessionId = data.sessionId;
      this.whiteboardId = data.whiteboardId;
      this.emit('session_joined', data);
    });

    // Whiteboard events
    this.socket.on('whiteboard_state', (state) => {
      this.emit('whiteboard_state', state);
    });

    this.socket.on('draw', (stroke) => {
      this.emit('draw', stroke);
    });

    this.socket.on('add_text', (text) => {
      this.emit('add_text', text);
    });

    this.socket.on('clear_board', () => {
      this.emit('clear_board');
    });

    // User presence events
    this.socket.on('user_joined', (data) => {
      this.emit('user_joined', data);
    });

    this.socket.on('user_left', (data) => {
      this.emit('user_left', data);
    });

    // Calendar and notification events
    this.socket.on('schedule_event', (event) => {
      this.emit('schedule_event', event);
    });

    this.socket.on('notification', (notification) => {
      this.emit('notification', notification);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  // Setup offline detection
  setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (!this.isConnected) {
        this.socket.connect();
      }
      this.emit('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
    });
  }

  // Join a session
  joinSession(sessionId, userId, username) {
    this.userId = userId;
    this.username = username;

    if (this.isConnected) {
      this.socket.emit('join_session', {
        sessionId,
        userId,
        username
      });
    } else {
      this.queueEvent('join_session', { sessionId, userId, username });
    }
  }

  // Send drawing stroke
  sendStroke(stroke) {
    const drawData = {
      sessionId: this.sessionId,
      stroke: {
        id: 'stroke_' + Date.now(),
        ...stroke
      }
    };

    if (this.isConnected && this.socket) {
      this.socket.emit('draw', drawData);
    } else {
      this.queueEvent('draw', drawData);
    }
  }

  // Send text
  sendText(text) {
    const textData = {
      sessionId: this.sessionId,
      text: {
        id: 'text_' + Date.now(),
        ...text
      }
    };

    if (this.isConnected && this.socket) {
      this.socket.emit('add_text', textData);
    } else {
      this.queueEvent('add_text', textData);
    }
  }

  // Send schedule event
  sendScheduleEvent(event) {
    const eventData = {
      sessionId: this.sessionId,
      event: {
        id: 'event_' + Date.now(),
        ...event
      }
    };

    if (this.isConnected && this.socket) {
      this.socket.emit('schedule_event', eventData);
    } else {
      this.queueEvent('schedule_event', eventData);
    }
  }

  // Trigger notification
  triggerNotification(notification) {
    const data = {
      sessionId: this.sessionId,
      notification
    };

    if (this.isConnected && this.socket) {
      this.socket.emit('trigger_notification', data);
    }
  }

  // Clear board
  clearBoard() {
    if (this.isConnected && this.socket) {
      this.socket.emit('clear_board', {
        sessionId: this.sessionId
      });
    } else {
      this.queueEvent('clear_board', { sessionId: this.sessionId });
    }
  }

  // Leave session
  leaveSession() {
    if (this.isConnected && this.socket) {
      this.socket.emit('leave_session', {
        sessionId: this.sessionId,
        userId: this.userId,
        username: this.username
      });
    }
    this.sessionId = null;
    this.whiteboardId = null;
  }

  // Queue event for later delivery
  queueEvent(eventName, data) {
    this.eventQueue.push({ eventName, data, timestamp: Date.now() });
    console.log(`Event queued (offline): ${eventName}`);
  }

  // Flush queued events when reconnected
  flushEventQueue() {
    console.log(`Flushing ${this.eventQueue.length} queued events...`);

    while (this.eventQueue.length > 0) {
      const { eventName, data } = this.eventQueue.shift();

      try {
        switch (eventName) {
          case 'draw':
            this.socket.emit('draw', data);
            break;
          case 'add_text':
            this.socket.emit('add_text', data);
            break;
          case 'schedule_event':
            this.socket.emit('schedule_event', data);
            break;
          case 'clear_board':
            this.socket.emit('clear_board', data);
            break;
          case 'join_session':
            this.socket.emit('join_session', data);
            break;
          default:
            console.warn(`Unknown event type: ${eventName}`);
        }
      } catch (error) {
        console.error(`Failed to send queued event ${eventName}:`, error);
      }
    }
  }

  // Handle offline mode
  handleOfflineMode() {
    console.log('Switching to offline mode...');
    this.isOnline = false;
    this.emit('offline');
  }

  // Subscribe to events
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  // Unsubscribe from events
  off(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
    }
  }

  // Emit event
  emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${eventName}:`, error);
        }
      });
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      isOnline: this.isOnline,
      sessionId: this.sessionId,
      whiteboardId: this.whiteboardId,
      userId: this.userId,
      username: this.username,
      queuedEvents: this.eventQueue.length
    };
  }
}

// Initialize global instance
const wsManager = new WebSocketManager();
