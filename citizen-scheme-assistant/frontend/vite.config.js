import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // public/Assets contains existing artwork. A separate generated directory
  // avoids the Assets/assets collision on Windows and case-sensitive hosts.
  build: { assetsDir: 'static' },
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: true,
    open: false,
    proxy: {
      '/api': 'http://127.0.0.1:8002',
      '/health': 'http://127.0.0.1:8002',
    },
  },
  // Tests the built, same-origin API configuration without embedding localhost
  // into production assets. A hosted deployment needs its own reverse proxy.
  preview: { host: '127.0.0.1', port: 5176, strictPort: true },
});

