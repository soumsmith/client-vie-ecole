import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  build: {
    outDir: 'dist',
  },
  
  server: {
    proxy: {
      '/api': {
        target: 'https://api-pro.pouls-scolaire.net',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          // Gestion des erreurs simplifiée
          proxy.on('error', (err, req, res) => {
            console.log('❌ Erreur proxy:', err.message);
          });
          
          // Configuration des requêtes sortantes
          proxy.on('proxyReq', (proxyReq, req) => {
            // Nettoyer les headers CORS côté client
            ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 
             'Access-Control-Allow-Headers', 'Origin'].forEach(header => {
              proxyReq.removeHeader(header);
            });
            
            // Définir Content-Type par défaut pour les méthodes avec body
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && 
                !proxyReq.getHeader('Content-Type')) {
              proxyReq.setHeader('Content-Type', 'application/json');
            }
          });
          
          // Configuration des réponses
          proxy.on('proxyRes', (proxyRes, req) => {
            // Headers CORS essentiels
            Object.assign(proxyRes.headers, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
              'Access-Control-Max-Age': '86400'
            });
            
            // Gérer les requêtes OPTIONS
            if (req.method === 'OPTIONS') {
              proxyRes.statusCode = 200;
            }
          });
        },
      }
    }
  }
});