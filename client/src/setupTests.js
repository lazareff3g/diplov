// src/setupTests.js
import '@testing-library/jest-dom';

// Мок для localStorage
const localStorageMock = {
  getItem: jest.fn((key) => {
    // Специальная обработка для user
    if (key === 'user') {
      return JSON.stringify({ id: 1, username: 'testuser', role: 'user' });
    }
    if (key === 'token') {
      return 'fake-token';
    }
    return null;
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

global.localStorage = localStorageMock;

// Мок для window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Подавление консольных предупреждений
console.error = jest.fn();
console.warn = jest.fn();
