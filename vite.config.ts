import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['images/**/*'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        runtimeCaching: [
          {
            urlPattern: /\/images\/.*\.(jpg|png)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wedding-photos',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
          {
            urlPattern: /\/assets\/.*\.(woff2?|ttf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wedding-fonts',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: '영건 ♥ 지혜 Wedding Invitation',
        short_name: 'YG♥JH Wedding',
        description: '2026. 10. 04 (일) AM 10:30 · 비렌티웨딩홀 4층 매그넘홀 · 천안',
        lang: 'ko',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#171310',
        theme_color: '#171310',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
