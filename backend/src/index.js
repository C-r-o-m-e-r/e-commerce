// /backend/src/index.js 

const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

let server;

// FIX: Only start the server if this file is run directly
if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
} else {
  // When imported by tests, we still need to export the server instance
  // but we let the test setup files control when it starts and stops.
  server = app; 
}

module.exports = { app, server };