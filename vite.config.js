import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({ 
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lawig',
        short_name: 'Lawig',
        icons: [
          { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
};