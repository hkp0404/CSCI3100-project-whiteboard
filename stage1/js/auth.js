// auth.js - Authentication Service

const AuthService = {
    currentUser: null,

    // Initialize - check if user is logged in
    init() {
        const savedUser = localStorage.getItem('fancy_whiteboard_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    },

    // Register new user
    async register(username, email, password) {
        // Check if username exists
        const existingUser = DatabaseManager.getUserByUsername(username);
        if (existingUser) {
            return false;
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
        return true;
    },

    // Login user
    async login(username, password) {
        const user = DatabaseManager.getUserByUsername(username);
        if (!user) {
            return false;
        }

        // Verify password
        const passwordHash = await Utils.hashPassword(password);
        if (passwordHash !== user.passwordHash) {
            return false;
        }

        // Set current user
        this.currentUser = user;
        localStorage.setItem('fancy_whiteboard_current_user', JSON.stringify(user));
        return true;
    },

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('fancy_whiteboard_current_user');
        window.location.href = 'login.html';
    },

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },

    // Check if logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
};

// Initialize on load
AuthService.init();
