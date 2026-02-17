import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/.netlify\/functions\/token/, '/getToken')
      }
    }
  },
  envPrefix: 'VITE_'
});
