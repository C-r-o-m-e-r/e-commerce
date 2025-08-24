// /backend/tests/globalTeardown.js

const prisma = require('../src/config/prisma');

module.exports = async () => {
    await prisma.$disconnect();
    global.__SERVER__.close();
    console.log('\n--- Global Test Server Closed ---');
};