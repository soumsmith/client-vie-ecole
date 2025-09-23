import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    
    build: {
      outDir: 'dist',
    },
    
    server: {
      proxy: {
        '/api': {
          target: 'http://46.105.52.105:8889',//'http://10.3.119.232:8889' // //http://10.3.119.232:8889
          changeOrigin: true,
          //secure: true,
          secure: false,
          //rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Erreur proxy:', err.message);
            });
            
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Requête proxy:', req.method, req.url);
              
              // Nettoyer les headers problématiques
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
              
              // Ajouter seulement les headers essentiels
              proxyReq.setHeader('Accept', 'application/json');
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Réponse proxy:', proxyRes.statusCode, req.url);
              
              // Ajouter les headers CORS nécessaires
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, X-Requested-With';
            });
          },
        }
      }
    }
  };
});