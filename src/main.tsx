import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './lib/firebase';

// Global Fetch Interceptor to redirect api requests to custom backend URL if VITE_API_URL is set
try {
  const originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    value: function (input: any, init: any) {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        const apiUrl = (import.meta as any).env.VITE_API_URL;
        if (apiUrl) {
          const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
          return originalFetch(base + input, init);
        }
      }
      return originalFetch(input, init);
    },
    writable: true,
    configurable: true
  });
} catch (e) {
  console.warn("Could not intercept global fetch:", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
