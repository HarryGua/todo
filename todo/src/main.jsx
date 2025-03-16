import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from './pwa';

// 注册 Service Worker
registerSW();

// 注册计时器 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/timer-worker.js')
      .then(registration => {
        console.log('计时器 Service Worker 注册成功:', registration.scope);
      })
      .catch(error => {
        console.log('计时器 Service Worker 注册失败:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
