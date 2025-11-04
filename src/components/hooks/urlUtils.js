// utils/urlUtils.js
const getFullUrl = () => {
  // En développement, utiliser le proxy local
  if (import.meta.env.DEV) {
    return '/api/';
  }
  
  // En production, utiliser l'URL complète de l'API
  return 'https://api-pro.pouls-scolaire.net/api/';
};

export const rootUrl = getFullUrl();
export const baseUrl = getFullUrl();
export default getFullUrl;