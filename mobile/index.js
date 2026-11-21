import { registerRootComponent } from 'expo';

// Enhanced stack trace logging
if (global.ErrorUtils) {
  const defaultHandler = global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('🔥 UNHANDLED ERROR:', error?.message);
    if (error?.stack) {
      console.error('🔥 STACK:', error.stack);
    }
    if (defaultHandler) defaultHandler(error, isFatal);
  });
}

const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  const firstArg = args[0];
  const msg = (firstArg && (firstArg.message || firstArg.toString())) || '';
  if (typeof msg === 'string' && msg.includes('navigation context')) {
    originalConsoleError('💥💥💥 CRITICAL STACK TRACE:\n', firstArg?.stack || new Error().stack);
  }
};

import App from './App';

registerRootComponent(App);
