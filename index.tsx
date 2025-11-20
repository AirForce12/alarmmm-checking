import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Suppress benign ResizeObserver errors common with Recharts/Gauge components
const originalError = console.error;
console.error = (...args) => {
  const errorString = args[0]?.toString() || '';
  if (
    /ResizeObserver loop completed with undelivered notifications/.test(errorString) ||
    /ResizeObserver loop limit exceeded/.test(errorString)
  ) {
    return;
  }
  originalError.call(console, ...args);
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}