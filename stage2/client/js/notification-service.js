// Notification Service for Stage 2 - Schedule Reminders and Alerts
class NotificationService {
  constructor() {
    this.notifications = [];
    this.reminders = new Map(); // Store active reminders
    this.isNotificationSupported = 'Notification' in window;
    this.notificationPermission = 'default';
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isNotificationSupported) {
      console.warn('Browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  // Check notification status
  getPermissionStatus() {
    return this.notificationPermission;
  }

  // Show browser notification
  showNotification(title, options = {}) {
    if (!this.isNotificationSupported) {
      this.showFallbackNotification(title, options);
      return;
    }

    if (this.notificationPermission === 'granted') {
      const notification = new Notification(title, {
        icon: '/assets/icon.png',
        badge: '/assets/badge.png',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } else {
      this.showFallbackNotification(title, options);
    }
  }

  // Fallback UI notification (in-page banner)
  showFallbackNotification(title, options = {}) {
    const notification = {
      id: 'notif_' + Date.now(),
      title,
      type: options.type || 'info',
      message: options.body || '',
      icon: options.icon,
      timestamp: new Date(),
      timeout: options.timeout || 5000
    };

    this.notifications.push(notification);

    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('fallback_notification', {
      detail: notification
    }));

    // Auto-remove after timeout
    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n.id !== notification.id);
    }, notification.timeout);

    return notification;
  }

  // Schedule a reminder for calendar event
  scheduleReminder(event, minutesBefore = 15) {
    const eventDate = new Date(`${event.date}T${event.time}`);
    const reminderTime = new Date(eventDate.getTime() - minutesBefore * 60000);
    const now = new Date();

    if (reminderTime < now) {
      console.warn('Reminder time is in the past, skipping');
      return null;
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    // Clear existing reminder for same event
    if (this.reminders.has(event.id)) {
      clearTimeout(this.reminders.get(event.id).timerId);
    }

    // Schedule reminder
    const timerId = setTimeout(() => {
      this.triggerEventReminder(event, minutesBefore);
      this.reminders.delete(event.id);
    }, timeUntilReminder);

    this.reminders.set(event.id, {
      timerId,
      event,
      scheduledTime: reminderTime,
      minutesBefore
    });

    console.log(`Reminder scheduled for "${event.title}" at ${reminderTime.toLocaleString()}`);
    return timerId;
  }

  // Trigger event reminder notification
  triggerEventReminder(event, minutesBefore = 15) {
    const title = `Reminder: ${event.title}`;
    const options = {
      type: 'reminder',
      body: `Starting at ${event.time}\n${event.description || ''}`,
      tag: `reminder-${event.id}`,
      requireInteraction: false
    };

    this.showNotification(title, options);

    // Dispatch reminder event
    window.dispatchEvent(new CustomEvent('event_reminder', {
      detail: { event, minutesBefore }
    }));
  }

  // Schedule multiple reminders for an event
  scheduleMultipleReminders(event, minutesArray = [15, 60]) {
    const reminders = [];

    minutesArray.forEach(minutes => {
      const reminderId = this.scheduleReminder(event, minutes);
      if (reminderId) {
        reminders.push(reminderId);
      }
    });

    return reminders;
  }

  // Cancel a reminder
  cancelReminder(eventId) {
    if (this.reminders.has(eventId)) {
      const { timerId } = this.reminders.get(eventId);
      clearTimeout(timerId);
      this.reminders.delete(eventId);
      console.log(`Reminder cancelled for event ${eventId}`);
      return true;
    }
    return false;
  }

  // Cancel all reminders
  cancelAllReminders() {
    this.reminders.forEach(({ timerId }) => clearTimeout(timerId));
    this.reminders.clear();
    console.log('All reminders cancelled');
  }

  // Get all active reminders
  getActiveReminders() {
    return Array.from(this.reminders.values()).map(reminder => ({
      eventId: reminder.event.id,
      eventTitle: reminder.event.title,
      scheduledTime: reminder.scheduledTime,
      minutesBefore: reminder.minutesBefore
    }));
  }

  // Show success notification
  showSuccess(message) {
    return this.showNotification('Success!', {
      type: 'success',
      body: message,
      icon: '✓'
    });
  }

  // Show error notification
  showError(message) {
    return this.showNotification('Error', {
      type: 'error',
      body: message,
      icon: '✕'
    });
  }

  // Show warning notification
  showWarning(message) {
    return this.showNotification('Warning', {
      type: 'warning',
      body: message,
      icon: '!'
    });
  }

  // Show info notification
  showInfo(message) {
    return this.showNotification('Info', {
      type: 'info',
      body: message,
      icon: 'ℹ'
    });
  }

  // Handle collaboration notifications
  notifyUserJoined(username) {
    this.showInfo(`${username} joined the whiteboard`);
  }

  notifyUserLeft(username) {
    this.showInfo(`${username} left the whiteboard`);
  }

  // Handle real-time sync notifications
  notifySyncStatus(status) {
    if (status === 'syncing') {
      this.showInfo('Syncing changes...');
    } else if (status === 'synced') {
      this.showSuccess('Changes synced');
    } else if (status === 'error') {
      this.showError('Sync failed - changes queued');
    }
  }

  // Display notification history
  getNotificationHistory() {
    return this.notifications.map(notif => ({
      id: notif.id,
      title: notif.title,
      type: notif.type,
      message: notif.message,
      timestamp: notif.timestamp.toLocaleString()
    }));
  }

  // Clear notification history
  clearHistory() {
    this.notifications = [];
  }
}

// Initialize global instance
const notificationService = new NotificationService();
