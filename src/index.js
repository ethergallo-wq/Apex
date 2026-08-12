import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { hardReloadApp, isRecoverableLoadError, tryAutoRecoveryOnce } from './appRecovery';

const rootElement = document.getElementById('root');

function showBootFallback(error) {
  console.warn('[Apex] Boot fallback:', error);
  if (typeof window.__APEX_SHOW_BOOT_FALLBACK__ === 'function') {
    window.__APEX_SHOW_BOOT_FALLBACK__();
    return;
  }
  if (rootElement) {
    rootElement.innerHTML = '<div style="min-height:100vh;background:#1C1C1E;color:white;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;text-align:center"><div><div style="font-size:24px;font-weight:900;margin-bottom:8px">Apex si sta ricaricando</div><div style="color:rgba(255,255,255,.68);font-size:14px;line-height:1.45;margin-bottom:16px">Chiudi e riapri l\'app dalla schermata Home. Se continua, aprila una volta da Safari.</div><button type="button" id="apex-boot-reload-btn" style="height:44px;border:0;border-radius:14px;background:#B84D3A;color:white;font-weight:900;padding:0 18px;cursor:pointer">Ricarica</button></div></div>';
    const reloadBtn = document.getElementById('apex-boot-reload-btn');
    if (reloadBtn) reloadBtn.addEventListener('click', () => hardReloadApp({ bustCache: true }));
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
  window.__APEX_STOP_INLINE_BOOT__?.();
} catch (error) {
  showBootFallback(error);
}

window.addEventListener('error', (event) => {
  const err = event.error || event.message;
  if (isRecoverableLoadError(err) && tryAutoRecoveryOnce()) return;
  if (rootElement && rootElement.childElementCount === 0) showBootFallback(err);
});
window.addEventListener('unhandledrejection', (event) => {
  const err = event.reason || 'unhandled rejection';
  if (isRecoverableLoadError(err) && tryAutoRecoveryOnce()) return;
  if (rootElement && rootElement.childElementCount === 0) showBootFallback(err);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
