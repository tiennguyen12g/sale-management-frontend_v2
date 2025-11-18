import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "@tnbt/react-favorit-style/styles.css"
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById('root')!).render(

    <BrowserRouter>
      <App />
    </BrowserRouter>
)
// Register service worker
// If you use vite-plugin-pwa, it will automatically generate /sw.js for you.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}