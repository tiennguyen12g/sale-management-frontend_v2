# Using PWA to convert desktop/mobile app.
Guide for React-Vite-TS
#### *** Prerequired
1. The frontend app must to running with "https"
2. The server have to run in "0.0.0.0" (catch all pc IP).
3. Config url api in frontend to PC's IP (window: ipconfig, macos: ipconf)
const backendAPI = "http://172.16.255.206:4000/api-v1";
const socketAPI = "http://172.16.255.206:4005"
4. Add certificate to the phone.
- Create new SSL certificate if the Pc's Ip does not include.
mkcert 172.16.255.206 localhost 127.0.0.1

- mkcert -CAROOT
open the path in response to get file "rootCA.pem".
Copy it to the phone.

- In phone: go Setting -> Developer options -> find "Encryption" or "Certificate" -> Install from device storage (select the rootCA.pem). 
-> Done
5. Edit originUrl in backend to add your Pc's IP and port:
const originURL =  [ 'https://localhost:5195', "https://172.16.255.206:5195"]

6. Run frontend with "npm run dev -- --host"
### Step by step
1. Easiest way for Vite is to use the plugin:
npm install vite-plugin-pwa --save-dev

Then in vite.config.ts:
using this for dev-mode
devOptions: {
        enabled: true, // 👈 this is crucial for dev mode
      },
```bash
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      devOptions: {
        enabled: true, // 👈 this is crucial for dev mode
      },
      manifest: {
        name: 'My React Vite App',
        short_name: 'MyApp',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0d6efd',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});

```

2. Create public folder and manifest.json
Also create folder icons; screenshoots
```bash
{
  "name": "Sale Management",
  "short_name": "TNBT",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0d6efd",
  "description": "A PWA built with React + Vite + TypeScript",
  "icons": [
    {
      "src": "/icons/logo-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/logo-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/banner-2.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/banner-540x720.png",
      "sizes": "192x192",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}

```
Create file sw.js
```bash
self.addEventListener('install', event => {
  console.log('Service worker installing...');
});

self.addEventListener('activate', event => {
  console.log('Service worker activated...');
});

```

3. Declare worker in main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}


### Debug on the phone.
1. Turn one debugging via USB in the phone.
2. Connect to pc (It have to show popup that required you accespt the computer access this phone)
3. in the browser chrome access: chrome://inspect/#devices you will see your device in the list.
4. Click the "Inpect" button below the name of the phone.
5. Open mobile chrome and access your website to debug.
