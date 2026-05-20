import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

const securityHeaders = ({ dev }: { dev: boolean }) => ({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://image.tmdb.org data: blob:",
    dev
      ? "connect-src 'self' https://api.themoviedb.org ws://localhost:* wss://localhost:*"
      : "connect-src 'self' https://api.themoviedb.org",
    "frame-src https://www.youtube.com",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
})

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    headers: securityHeaders({ dev: true }),
  },
  preview: {
    headers: securityHeaders({ dev: false }),
  },
})
