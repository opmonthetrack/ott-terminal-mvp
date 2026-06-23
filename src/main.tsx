import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Suppress known extension injection errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('MetaMask') || event.reason?.message?.includes('ethereum')) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (event.message.includes('MetaMask')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
