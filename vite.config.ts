import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/solitaire-cascade/' : '/';

  return {
    base,
    build: {
      target: 'es2020',
    },
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'apple-touch-icon.png', 'icon-*.png'],
        manifest: {
          name: 'Solitaire Cascade',
          short_name: 'Solitaire',
          description: 'Klondike Solitaire Victory Cascade — Iconic Card Fall with Modern Effects',
          theme_color: '#0a0814',
          background_color: '#0a0814',
          display: 'standalone',
          orientation: 'portrait',
          scope: base,
          start_url: base,
          icons: [
            { src: 'icon-96.png',  sizes: '96x96',   type: 'image/png' },
            { src: 'icon-144.png', sizes: '144x144',  type: 'image/png' },
            { src: 'icon-192.png', sizes: '192x192',  type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512',  type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512',  type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,ico,woff2}'],
          runtimeCaching: [
            {
              // Google Fonts — cache with stale-while-revalidate
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
      }),
    ],
  };
});
