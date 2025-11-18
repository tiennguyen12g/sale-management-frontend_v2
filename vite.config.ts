import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
            devOptions: {
        enabled: true, // 👈 this is crucial for dev mode
      },
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Sale Management",
        short_name: "TNBT",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0d6efd",
        icons: [
          {
            src: "icons/logo-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/logo-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certs/172.16.255.206+2-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certs/172.16.255.206+2.pem")),
    },
    port: 5195,
    host: true,   // binds 0.0.0.0
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@ui": path.resolve(__dirname, "./src/components/ui"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@apis": path.resolve(__dirname, "./src/apis"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@state": path.resolve(__dirname, "./src/state"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@layout": path.resolve(__dirname, "./src/layout"),
      "@i18n": path.resolve(__dirname, "./src/i18n"),
      "@playground": path.resolve(__dirname, "./src/playground"),
    },
  },
});
