#### Config Vite https
1. Intall Choco for window. Open PowerShell with administrator
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))  

2. Install mkcert
choco install mkcert

3. Create certificate file
mkcert -install
mkcert localhost

We got: localhost-key.pem
localhost.pem

Copy to the vite project (root path)

4. Config vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "localhost.pem")),
    },
    port: 5185,
    host: "localhost",
  },
});

## Git repo
git push -u salefrontendv2 main