// database.js - Local Storage Database Manager

const DatabaseManager = {
    // Initialize database structure
    init() {
        if (!localStorage.getItem('fancy_whiteboard_users')) {
            localStorage.setItem('fancy_whiteboard_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('fancy_whiteboard_whiteboards')) {
            localStorage.setItem('fancy_whiteboard_whiteboards', JSON.stringify([]));
        }
        if (!localStorage.getItem('fancy_whiteboard_schedules')) {
            localStorage.setItem('fancy_whiteboard_schedules', JSON.stringify([]));
        }
    },

    // User operations
    getUsers() {
        return JSON.parse(localStorage.getItem('fancy_whiteboard_users') || '[]');
    },

    saveUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('fancy_whiteboard_users', JSON.stringify(users));
    },

    getUserByUsername(username) {
        const users = this.getUsers();
        return users.find(u => u.username === username);
    },

    // Whiteboard operations
    getWhiteboards(userId) {
        const whiteboards = JSON.parse(localStorage.getItem('fancy_whiteboard_whiteboards') || '[]');
        return whiteboards.filter(wb => wb.userId === userId);
    },

    saveWhiteboard(whiteboard) {
        const whiteboards = JSON.parse(localStorage.getItem('fancy_whiteboard_whiteboards') || '[]');
        
        // Check if updating existing
        const existingIndex = whiteboards.findIndex(wb => wb.id === whiteboard.id);
        if (existingIndex !== -1) {
            whiteboards[existingIndex] = whiteboard;
        } else {
            whiteboards.push(whiteboard);
        }
        
        localStorage.setItem('fancy_whiteboard_whiteboards', JSON.stringify(whiteboards));
    },

    deleteWhiteboard(id) {
        let whiteboards = JSON.parse(localStorage.getItem('fancy_whiteboard_whiteboards') || '[]');
        whiteboards = whiteboards.filter(wb => wb.id !== id);
        localStorage.setItem('fancy_whiteboard_whiteboards', JSON.stringify(whiteboards));
    },

    // Schedule operations
    getSchedules(userId) {
        const schedules = JSON.parse(localStorage.getItem('fancy_whiteboard_schedules') || '[]');
        return schedules.filter(s => s.userId === userId);
    },

    saveSchedule(schedule) {
        const schedules = JSON.parse(localStorage.getItem('fancy_whiteboard_schedules') || '[]');
        
        const existingIndex = schedules.findIndex(s => s.id === schedule.id);
        if (existingIndex !== -1) {
            schedules[existingIndex] = schedule;
        } else {
            schedules.push(schedule);
        }
        
        localStorage.setItem('fancy_whiteboard_schedules', JSON.stringify(schedules));
    },

    deleteSchedule(id) {
        let schedules = JSON.parse(localStorage.getItem('fancy_whiteboard_schedules') || '[]');
        schedules = schedules.filter(s => s.id !== id);
        localStorage.setItem('fancy_whiteboard_schedules', JSON.stringify(schedules));
    }
};

// Initialize database on load
DatabaseManager.init();
