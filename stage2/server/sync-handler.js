/**
 * Real-time Synchronization Handler
 * Manages WebSocket connections, action broadcasting, and conflict resolution
 */

class SyncHandler {
  constructor(io) {
    this.io = io;
    this.activeSessions = new Map();
    this.operationLog = new Map();
  }

  /**
   * Initialize a new whiteboard session
   */
  createSession(sessionId) {
    if (!this.activeSessions.has(sessionId)) {
      this.activeSessions.set(sessionId, {
        participants: [],
        drawingState: [],
        operationCounter: 0,
        lastSyncTimestamp: Date.now(),
        conflictQueue: []
      });
      this.operationLog.set(sessionId, []);
    }
    return this.activeSessions.get(sessionId);
  }

  /**
   * Add participant to session
   */
  addParticipant(sessionId, userId, username, socketId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    const participant = {
      userId,
      username,
      socketId,
      joinedAt: Date.now(),
      color: this.generateUserColor(userId)
    };

    session.participants.push(participant);
    return participant;
  }

  /**
   * Remove participant from session
   */
  removeParticipant(sessionId, socketId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    const index = session.participants.findIndex(p => p.socketId === socketId);
    if (index > -1) {
      const participant = session.participants[index];
      session.participants.splice(index, 1);
      return participant;
    }
    return null;
  }

  /**
   * Record drawing action with operation number for conflict resolution
   */
  recordAction(sessionId, action) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    // Assign operation number for CRDT (Conflict-free Replicated Data Type)
    action.operationNumber = session.operationCounter++;
    action.timestamp = Date.now();
    action.id = `${action.userId}_${action.timestamp}_${Math.random()}`;

    // Add to drawing state
    session.drawingState.push(action);

    // Log operation
    const log = this.operationLog.get(sessionId) || [];
    log.push(action);
    this.operationLog.set(sessionId, log);

    return action;
  }

  /**
   * Broadcast action to all participants except sender
   */
  broadcastAction(sessionId, action, senderSocketId, io) {
    io.to(sessionId).except(senderSocketId).emit('remote-action', action);
  }

  /**
   * Handle concurrent edits - CRDT approach
   * Last write wins with timestamp and user ID as tiebreaker
   */
  resolveConcurrentEdit(sessionId, existingAction, incomingAction) {
    // If timestamps are different, newer action wins
    if (incomingAction.timestamp > existingAction.timestamp) {
      return incomingAction;
    }
    // If timestamps are same, use user ID as tiebreaker
    if (incomingAction.timestamp === existingAction.timestamp) {
      return incomingAction.userId > existingAction.userId ? incomingAction : existingAction;
    }
    // Existing action is newer
    return existingAction;
  }

  /**
   * Get drawing state for user joining mid-session
   */
  getDrawingState(sessionId) {
    const session = this.activeSessions.get(sessionId);
    return session ? session.drawingState : [];
  }

  /**
   * Get session participants
   */
  getParticipants(sessionId) {
    const session = this.activeSessions.get(sessionId);
    return session ? session.participants : [];
  }

  /**
   * Clear session when all participants leave
   */
  clearSession(sessionId) {
    this.activeSessions.delete(sessionId);
    this.operationLog.delete(sessionId);
  }

  /**
   * Generate unique color for user
   */
  generateUserColor(userId) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1',
      '#FFA07A', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E2', '#F8B739'
    ];
    const hash = userId.toString().split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return colors[hash % colors.length];
  }

  /**
   * Get operation history for specific time range
   */
  getOperationHistory(sessionId, from, to) {
    const log = this.operationLog.get(sessionId) || [];
    return log.filter(op => op.timestamp >= from && op.timestamp <= to);
  }

  /**
   * Compact drawing state to reduce memory usage
   */
  compactDrawingState(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Remove erased elements
    const eraseIds = session.drawingState
      .filter(a => a.type === 'erase')
      .map(a => a.targetId);

    session.drawingState = session.drawingState.filter(
      a => !eraseIds.includes(a.id)
    );
  }

  /**
   * Export session data
   */
  exportSessionData(sessionId) {
    const session = this.activeSessions.get(sessionId);
    const log = this.operationLog.get(sessionId) || [];

    return {
      sessionId,
      drawingState: session ? session.drawingState : [],
      operationHistory: log,
      participantCount: session ? session.participants.length : 0,
      exportedAt: Date.now()
    };
  }
}

module.exports = SyncHandler;
