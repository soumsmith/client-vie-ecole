// utils/urlUtils.js
const getFullUrl = () => {
  // En développement, utiliser le proxy local

  // En production, utiliser l'URL complète de l'API
  return '/api/';
  //return 'https://api-pro.pouls-scolaire.net/api/';
};

export const rootUrl = getFullUrl();
export const baseUrl = getFullUrl();
export default getFullUrl;