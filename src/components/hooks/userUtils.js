// src/utils/userUtils.js

/**
 * Normalise le profil utilisateur en fonction de l'ID du profil
 * @param {string|number} profileId
 * @returns {string}
 */
export const normalizeUserProfile = (profileId) => {
  switch (profileId) {
    case 1: return "Admin";
    case 2: return "Professeur";
    case 3: return "Fondateur";
    default: return "user";
  }
};

/**
 * Récupère le profil utilisateur depuis localStorage
 * @returns {string} profil utilisateur
 */
export const getUserProfile = () => {
  try {
    const userProfil = localStorage.getItem("userProfil");
    if (userProfil) {
      return userProfil;
    }

    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      if (parsedData.profileId) {
        return normalizeUserProfile(parsedData.profileId);
      }
    }

    return "user";
  } catch (error) {
    console.error("Erreur lors de la lecture du profil utilisateur:", error);
    return "user";
  }
};
