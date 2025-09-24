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
          target: 'http://10.3.119.232:8889',
          changeOrigin: true,
          secure: false,
          // ✅ Configuration complète pour gérer CORS et toutes les méthodes HTTP
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('❌ Erreur proxy:', err.message);
            });
            
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🔄 Proxy req:', req.method, req.url);
              
              // ✅ Nettoyer les headers problématiques envoyés par le client
              proxyReq.removeHeader('Access-Control-Allow-Origin');
              proxyReq.removeHeader('Access-Control-Allow-Methods');
              proxyReq.removeHeader('Access-Control-Allow-Headers');
              proxyReq.removeHeader('Origin');
              
              // ✅ Gestion spécifique des différentes méthodes HTTP
              if (req.method === 'POST' && !proxyReq.getHeader('Content-Type')) {
                proxyReq.setHeader('Content-Type', 'application/json');
              }
              
              // ✅ Configuration spéciale pour DELETE
              if (req.method === 'DELETE') {
                // Assurer que le Content-Type est défini même pour DELETE
                if (!proxyReq.getHeader('Content-Type')) {
                  proxyReq.setHeader('Content-Type', 'application/json');
                }
                
                // Headers additionnels que certains serveurs exigent pour DELETE
                proxyReq.setHeader('X-HTTP-Method-Override', 'DELETE');
                
                // S'assurer que la longueur du contenu est définie
                if (!proxyReq.getHeader('Content-Length')) {
                  const body = req.body ? JSON.stringify(req.body) : '';
                  proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
                }
              }
              
              // ✅ Configuration spéciale pour PUT/PATCH
              if (['PUT', 'PATCH'].includes(req.method)) {
                if (!proxyReq.getHeader('Content-Type')) {
                  proxyReq.setHeader('Content-Type', 'application/json');
                }
              }
            });
            
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('✅ Proxy res:', proxyRes.statusCode, req.url);
              
              // ✅ Headers CORS complets pour toutes les réponses
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, X-Requested-With, X-HTTP-Method-Override';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'false';
              proxyRes.headers['Access-Control-Max-Age'] = '86400'; // Cache preflight 24h
              
              // ✅ Forcer le statut 200 pour les OPTIONS (preflight)
              if (req.method === 'OPTIONS') {
                proxyRes.statusCode = 200;
                proxyRes.statusMessage = 'OK';
              }
            });
          },
        }
      }
    }
  };
});