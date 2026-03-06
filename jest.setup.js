import '@testing-library/jest-dom'

// Mock window.ethereum for Web3 tests
Object.defineProperty(window, 'ethereum', {
  writable: true,
  value: {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    isMetaMask: true,
  },
})

// Mock fetch for API tests
global.fetch = jest.fn()

// Mock console.error to suppress expected errors in tests
const originalConsoleError = console.error
console.error = (...args) => {
  // Filter out specific React warnings that are expected in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('Warning: act') ||
      args[0].includes('Error: Not implemented: navigation'))
  ) {
    return
  }
  originalConsoleError(...args)
}
