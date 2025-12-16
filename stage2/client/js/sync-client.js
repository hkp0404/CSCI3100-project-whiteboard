/**
 * Real-time Synchronization Client
 * Handles WebSocket communication for multi-computer collaboration
 */

class SyncClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.sessionId = null;
    this.userId = null;
    this.username = null;
    this.remoteUsers = new Map();
    this.actionQueue = [];
    this.lastSyncTime = Date.now();
    this.isConnected = false;
    this.listeners = {};
    this.pendingAcks = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts
        });

        this.socket.on('connect', () => {
          console.log('Connected to server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connection-established');
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from server');
          this.isConnected = false;
          this.emit('connection-lost');
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Failed to connect after multiple attempts'));
          }
        });

        this.setupEventListeners();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup all Socket.IO event listeners
   */
  setupEventListeners() {
    // User joined
    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data.username);
      this.remoteUsers.set(data.userId, {
        username: data.username,
        joinedAt: data.timestamp
      });
      this.emit('user-joined', data);
    });

    // User left
    this.socket.on('user-left', (data) => {
      console.log('User left:', data.userId);
      this.remoteUsers.delete(data.userId);
      this.emit('user-left', data);
    });

    // Receive remote drawing stroke
    this.socket.on('remote-stroke', (data) => {
      this.emit('remote-stroke', data);
    });

    // Receive remote text input
    this.socket.on('remote-text', (data) => {
      this.emit('remote-text', data);
    });

    // Receive remote erase action
    this.socket.on('remote-erase', (data) => {
      this.emit('remote-erase', data);
    });

    // Canvas cleared by remote user
    this.socket.on('canvas-cleared', (data) => {
      this.emit('canvas-cleared', data);
    });

    // Receive drawing state when joining
    this.socket.on('load-drawing-state', (data) => {
      this.emit('drawing-state-loaded', data);
    });

    // Remote cursor position
    this.socket.on('remote-cursor', (data) => {
      this.emit('remote-cursor', data);
    });
  }

  /**
   * Join a whiteboard session
   */
  joinSession(sessionId, userId, username) {
    return new Promise((resolve, reject) => {
      this.sessionId = sessionId;
      this.userId = userId;
      this.username = username;

      this.socket.emit('join-session', sessionId, userId, username, (response) => {
        if (response.success) {
          console.log('Joined session:', sessionId);
          resolve(response);
        } else {
          reject(new Error(response.error || 'Failed to join session'));
        }
      });
    });
  }

  /**
   * Send drawing stroke to server
   */
  sendStroke(strokeData) {
    if (!this.isConnected || !this.sessionId) {
      console.warn('Not connected or not in session');
      return Promise.reject(new Error('Not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('draw-stroke', this.sessionId, strokeData, this.userId, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Send text input to server
   */
  sendText(textData) {
    if (!this.isConnected || !this.sessionId) {
      console.warn('Not connected or not in session');
      return Promise.reject(new Error('Not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('add-text', this.sessionId, textData, this.userId, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Send erase action to server
   */
  sendErase(eraseData) {
    if (!this.isConnected || !this.sessionId) {
      return Promise.reject(new Error('Not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('erase-action', this.sessionId, eraseData, this.userId, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Clear canvas on all connected clients
   */
  clearCanvas() {
    if (!this.isConnected || !this.sessionId) {
      return Promise.reject(new Error('Not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('clear-canvas', this.sessionId, this.userId, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Broadcast cursor position for user awareness
   */
  updateCursorPosition(x, y) {
    if (this.isConnected && this.sessionId) {
      this.socket.emit('cursor-move', this.sessionId, { x, y }, this.userId);
    }
  }

  /**
   * Leave current session
   */
  leaveSession() {
    if (this.sessionId) {
      this.socket.emit('leave-session', this.sessionId, this.userId);
      this.sessionId = null;
      this.remoteUsers.clear();
    }
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Emit custom event
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Get remote users in session
   */
  getRemoteUsers() {
    return Array.from(this.remoteUsers.values());
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      inSession: !!this.sessionId,
      sessionId: this.sessionId,
      remoteUserCount: this.remoteUsers.size,
      userId: this.userId,
      username: this.username
    };
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }
}
