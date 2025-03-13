import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import './index.css'
import App from './App.jsx'
import { registerSW } from './pwa';

// 注册 Service Worker
registerSW();

// 仅在生产环境中初始化 Sentry
// if (import.meta.env.PROD) {
//   Sentry.init({
//     dsn: import.meta.env.VITE_SENTRY_DSN || "https://examplePublicKey@o0.ingest.sentry.io/0",
//     integrations: [new BrowserTracing()],
//     tracesSampleRate: 1.0, // 生产环境中应该降低这个值，例如 0.2
//     environment: import.meta.env.MODE,
//   });
// }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
