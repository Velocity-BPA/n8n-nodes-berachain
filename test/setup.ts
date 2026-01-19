/**
 * Jest Test Setup
 */

// Set longer timeout for async tests
jest.setTimeout(30000);

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};
