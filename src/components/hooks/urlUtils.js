// utils/urlUtils.js
const getFullUrl = () => {
  // En développement, utiliser le proxy local
  if (import.meta.env.DEV) {
    return '/api/';
  }
  
  // En production, utiliser l'URL complète de l'API
  return 'http://46.105.52.105:8889/api/';
};

export const rootUrl = getFullUrl();
export const baseUrl = getFullUrl();
export default getFullUrl;