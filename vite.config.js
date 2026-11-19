import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração otimizada para build estático na Cloudflare Pages (pasta dist)
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});