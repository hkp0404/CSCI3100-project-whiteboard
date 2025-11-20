// auth.js - Improved Authentication Service with Registration Feedback

const AuthService = {
    currentUser: null,

    // Initialize - check if user is logged in
    init() {
        DatabaseManager.init(); // Ensure localStorage is initialized!
        const savedUser = localStorage.getItem('fancy_whiteboard_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    },

    // Register new user, returns {success: bool, message: string}
    async register(username, email, password) {
        // Check if username exists
        if (!username || !email || !password) {
            return { success: false, message: 'Please fill in all fields' };
        }
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }
        const existingUser = DatabaseManager.getUserByUsername(username);
        if (existingUser) {
            return { success: false, message: 'Username already exists' };
        }
        // Hash password
        const passwordHash = await Utils.hashPassword(password);
        // Create user object
        const user = {
            id: Utils.generateUUID(),
            username,
            email,
            passwordHash,
            createdAt: new Date().toISOString()
        };
        // Save to database
        DatabaseManager.saveUser(user);
        return { success: true, message: 'Registration successful! You can now login.' };
    },

    // Login user, returns {success, message}
    async login(username, password) {
        const user = DatabaseManager.getUserByUsername(username);
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        const passwordHash = await Utils.hashPassword(password);
        if (passwordHash !== user.passwordHash) {
            return { success: false, message: 'Incorrect password' };
        }
        this.currentUser = user;
        localStorage.setItem('fancy_whiteboard_current_user', JSON.stringify(user));
        return { success: true, message: 'Login successful!' };
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('fancy_whiteboard_current_user');
        window.location.href = 'login.html';
    },

    getCurrentUser() { return this.currentUser; },
    isLoggedIn() { return this.currentUser !== null; }
};

// Initialize on load
AuthService.init();