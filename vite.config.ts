import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages project site — base path must match the repository name.
const REPO_NAME = process.env.WISP_REPO_NAME ?? 'wisp-wallet'
const BASE_PATH = process.env.WISP_BASE_PATH ?? `/${REPO_NAME}/`

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        id: BASE_PATH,
        start_url: BASE_PATH,
        scope: BASE_PATH,
        name: 'Wisp Wallet — Simulated Crypto Wallet',
        short_name: 'Wisp Wallet',
        description:
          'A premium simulated crypto wallet interface. Demo balances only — no keys, no funds, no blockchain access.',
        theme_color: '#0a0910',
        background_color: '#0a0910',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: `${BASE_PATH}icons/pwa-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${BASE_PATH}icons/pwa-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `${BASE_PATH}icons/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: `${BASE_PATH}index.html`,
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallbackDenylist: [/^\/icons\//],
        runtimeCaching: [
          {
            // CoinGecko quotes are network-first, never cached stale beyond their TTL.
            urlPattern: /^https:\/\/api\.coingecko\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wisp-market-quotes',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 16, maxAgeSeconds: 300 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  build: { target: 'es2020', sourcemap: false },
})
