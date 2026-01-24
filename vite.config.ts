import { defineConfig } from 'vite'
import { viteSingleFile } from "vite-plugin-singlefile"
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // plugins: [react(), viteSingleFile({ removeViteModuleLoader: true }),
  plugins: [react(),
  VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      // increase cache limit to 5 MiB
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      clientsClaim: true,
      skipWaiting: true,
      cleanupOutdatedCaches: true,
      navigateFallback: '/iia/index.html',
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      runtimeCaching: []
    },
    manifest: {
      name: 'KUL IIAs Search',
      short_name: 'KUL IIAs Search',
      description: 'KUL IIAs Search',
      theme_color: '#000000',
      start_url: '/iia/',
      scope: '/iia/',
      display: 'standalone',
      icons: [
        { src: 'icons/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: 'icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
  }),
  ],
  base: "/iia/",
});