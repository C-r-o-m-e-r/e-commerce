// /backend/jest.config.js

module.exports = {
  // Clears all mocks between every test.
  clearMocks: true,

  // Specifies the test environment as Node.js.
  testEnvironment: 'node',

  // --- FIX: Use global setup/teardown for the server ---
  // This file runs ONCE before all tests start.
  globalSetup: './tests/globalSetup.js',

  // This file runs ONCE after all tests have finished.
  globalTeardown: './tests/globalTeardown.js',
};