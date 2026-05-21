import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');

function showBootFallback(error) {
  console.warn('[Apex] Boot fallback:', error);
  if (typeof window.__APEX_SHOW_BOOT_FALLBACK__ === 'function') {
    window.__APEX_SHOW_BOOT_FALLBACK__();
    return;
  }
  if (rootElement) {
    rootElement.innerHTML = '<div style="min-height:100vh;background:#1C1C1E;color:white;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;text-align:center"><div><div style="font-size:24px;font-weight:900;margin-bottom:8px">Apex si sta ricaricando</div><button onclick="window.location.reload()" style="height:44px;border:0;border-radius:14px;background:#B84D3A;color:white;font-weight:900;padding:0 18px">Ricarica</button></div></div>';
  }
}

try {
  if (window.location.hash === '#') {
    window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
  }
} catch {}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  showBootFallback(error);
}

window.addEventListener('error', (event) => {
  if (rootElement && rootElement.childElementCount === 0) showBootFallback(event.error || event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  if (rootElement && rootElement.childElementCount === 0) showBootFallback(event.reason || 'unhandled rejection');
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
