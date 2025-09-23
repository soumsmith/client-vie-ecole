const getFullUrl = () => {
  // En développement, utiliser le proxy local
  if (import.meta.env.DEV) {
    return ''; // Proxy configuré dans vite.config.js
  }
  
  // En production, utiliser l'URL complète de l'API
  return import.meta.env.VITE_API_URL || 'http://10.3.119.232:8889';
};

export const rootUrl = getFullUrl();
export const baseUrl = getFullUrl();
export const urlBaseImage = `${import.meta.env.VITE_API_URL || 'http://10.3.119.232:8889'}/`;
export default getFullUrl;