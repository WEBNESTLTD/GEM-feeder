import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './',
  publicDir: false,
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  test: {
    environment: 'node',
    globals: true
  }
});