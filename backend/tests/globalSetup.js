// /backend/tests/globalSetup.js

const { app } = require('../src/index');
const http = require('http');

module.exports = async () => {
    // Start the server
    const server = http.createServer(app);
    global.__SERVER__ = server.listen(3000);
    console.log('\n--- Global Test Server Started ---');
};