// /backend/jest.config.js

export default {
  // Clears all mocks between every test.
  clearMocks: true,

  // Specifies the test environment as Node.js.
  testEnvironment: 'node',

  // Use global setup/teardown for the server.
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
};