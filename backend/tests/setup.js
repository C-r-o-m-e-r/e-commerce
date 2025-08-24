// /backend/tests/setup.js

const { server } = require('../src/index'); // Import the server we exported
const prisma = require('../src/config/prisma');

// This will run once before all test suites
beforeAll((done) => {
    // Optional: add a small delay to ensure the server is fully up
    setTimeout(done, 1000); 
});

// This will run once after all test suites
afterAll(async (done) => {
    await prisma.$disconnect(); // Disconnect Prisma client
    server.close(done); // Close the server connection
});