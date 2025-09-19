/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['foremanos-icon.svg'],
      manifest: {
        name: 'ForemanOS',
        short_name: 'ForemanOS',
        description: 'Field Operations Management Platform for Construction Professionals',
        theme_color: '#0074c7',
        icons: [
          {
            src: 'foremanos-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'foremanos-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests-e2e/**'],
  },
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
   build: {
    outDir: 'dist',
    sourcemap: true
  },
});