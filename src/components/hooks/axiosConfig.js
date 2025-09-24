// utils/axiosConfig.js
import axios from 'axios';
import getFullUrl from './urlUtils';

// Configuration globale d'Axios
const api = axios.create({
  baseURL: getFullUrl(),
  timeout: 15000, // Timeout plus long pour les connexions
  withCredentials: false, // ✅ Force à false pour éviter les problèmes CORS
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
// Dans axiosConfig.js, modifie l'intercepteur temporairement :
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 Requête: ${config.method?.toUpperCase()} ${config.url}`);
    
    // ✅ AJOUTE CECI TEMPORAIREMENT pour debug
    if (config.url.includes('connexion') || config.url.includes('se-connecter')) {
      console.log('🔥 DEBUG CONNEXION:');
      console.log('URL complète:', config.baseURL + config.url);
      console.log('Méthode:', config.method);
      console.log('Headers:', config.headers);
      console.log('Données envoyées:', config.data);
      console.log('Params:', config.params);
    }
    
    // Le reste du code...
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
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

export default api;