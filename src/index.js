import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Use window check to ensure client-side only execution
if (typeof window !== 'undefined') {
  const container = document.getElementById('root');
  const root = createRoot(container);
  
  // Remove StrictMode in production for better performance
  // as it causes double-rendering in development
  root.render(
    process.env.NODE_ENV === 'development' ? (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ) : (
      <App />
    )
  );

  // Only measure performance in production
  if (process.env.NODE_ENV === 'production') {
    reportWebVitals();
  }
}
