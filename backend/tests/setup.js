// /backend/tests/setup.js

// This file now runs before each test suite.

// preventing one test from accidentally affecting another.
beforeEach(() => {
  jest.clearAllMocks();
});