/**
 * Client Configuration for Online/Offline Modes
 * 
 * This file configures API and WebSocket URLs based on environment.
 * Update the production URLs after deploying to your chosen platform.
 */

// Environment: 'development' or 'production'
// Change to 'production' when deploying online
const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';

const CONFIG = {
  development: {
    // Local development
    API_BASE_URL: 'http://localhost:3000',
    WS_URL: 'http://localhost:3000'
  },
  production: {
    // Online deployment
    // IMPORTANT: Update these URLs after deploying your server
    // Examples:
    // - Heroku: 'https://fancy-whiteboard-yourname.herokuapp.com'
    // - Railway: 'https://fancy-whiteboard-production.up.railway.app'
    // - Render: 'https://fancy-whiteboard.onrender.com'
    // - Custom domain: 'https://whiteboard.yourdomain.com'
    
    API_BASE_URL: window.location.origin,
    WS_URL: window.location.origin
  }
};

// Get current configuration
const currentConfig = CONFIG[ENV];

// Export configuration
const API_BASE_URL = currentConfig.API_BASE_URL;
const WEBSOCKET_URL = currentConfig.WS_URL;

console.log(`[Config] Running in ${ENV} mode`);
console.log(`[Config] API Base URL: ${API_BASE_URL}`);
console.log(`[Config] WebSocket URL: ${WEBSOCKET_URL}`);

// Make available globally
window.API_BASE_URL = API_BASE_URL;
window.WEBSOCKET_URL = WEBSOCKET_URL;

// Export for modules (if using)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_BASE_URL,
    WEBSOCKET_URL,
    ENV
  };
}
