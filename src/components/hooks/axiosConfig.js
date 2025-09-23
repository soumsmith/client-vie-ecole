// utils/axiosConfig.js
import axios from 'axios';
import getFullUrl from './urlUtils';

// Configuration globale d'Axios
const api = axios.create({
  baseURL: getFullUrl(),
  timeout: 10000,
  withCredentials: true, // Important pour les cookies de session
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 Requête: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Ajouter le token d'authentification si disponible
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    // Ajouter des headers spécifiques si nécessaire
    const userProfil = localStorage.getItem('userProfil');
    if (userProfil) {
      config.headers['X-User-Profile'] = userProfil;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur intercepteur requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Erreur réponse: ${error.response?.status} ${error.config?.url}`);
    
    // Gestion des erreurs 401/403 (non autorisé)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn('🔒 Session expirée, redirection vers login');
      // Nettoyer le localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('isAuthenticated');
      // Rediriger vers la page de connexion
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default api;