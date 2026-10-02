import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages is configured with the custom domain at the site root.
  base: '/',
  plugins: [react()],
  server: {
    allowedHosts: true, // Tells Vite's security bouncer to step aside for dev tunnel
    port: 3001,
  },
  preview: {
    allowedHosts: true, // Allows Cloudflare tunnel host for preview/production mode
    port: 3001,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          motion: ['framer-motion', 'gsap'],
          vendor: ['react', 'react-dom', 'react-router'],
        },
      },
    },
  },
})
