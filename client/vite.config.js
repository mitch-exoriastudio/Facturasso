import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration de Vite (serveur de développement + build de production).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Pendant le développement, les appels commençant par /api sont
    // redirigés vers le serveur Node : pas besoin de gérer le CORS.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
