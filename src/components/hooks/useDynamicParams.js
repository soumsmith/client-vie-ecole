import { useUserContext } from './useUserContext';

/**
 * Hook pour récupérer les paramètres dynamiques basés sur les données utilisateur
 * Utilise uniquement les données du contexte utilisateur
 * @returns {object} - Paramètres dynamiques depuis le contexte
 */
export const useDynamicParams = () => {
    const userContext = useUserContext();

    // Récupérer les paramètres directement depuis le contexte
    const params = {
        ecoleId: userContext.ecoleId,
        academicYearId: userContext.academicYearId,
        periodiciteId: userContext.periodiciteId,
        userId: userContext.userId,
        profileId: userContext.profileId,
        email: userContext.email,
        personnelInfo: userContext.personnelInfo,
        academicYearInfo: userContext.academicYearInfo
    };

    return {
        ...params,
        // Fonctions utilitaires
        isAuthenticated: userContext.isAuthenticated,
        isInitialized: userContext.isInitialized,
        
        // Méthodes pour mettre à jour les paramètres
        updateParams: userContext.updateUserParams,
        updateFromLogin: userContext.updateFromLoginData,
        clearParams: userContext.clearUserParams,
        
        // Méthodes pour récupérer des paramètres spécifiques
        getParam: userContext.getParam,
        getAllParams: userContext.getAllParams
    };
};

/**
 * Hook spécialisé pour les services PULS
 * Fournit les paramètres directement depuis le contexte utilisateur
 * @returns {object} - Paramètres pour les services PULS
 */
export const usePulsParams = () => {
    const userContext = useUserContext();
    
    return {
        // Paramètres principaux depuis le contexte
        ecoleId: userContext.ecoleId,
        academicYearId: userContext.academicYearId,
        periodiciteId: userContext.periodiciteId,
            
        // Paramètres utilisateur
        userId: userContext.userId,
        profileId: userContext.profileId,
        email: userContext.email,
        
        // Informations complètes
        personnelInfo: userContext.personnelInfo,
        academicYearInfo: userContext.academicYearInfo,
        
        // États
        isAuthenticated: userContext.isAuthenticated,
        isInitialized: userContext.isInitialized
    };
};

/**
 * Hook pour les paramètres de requête API
 * Génère automatiquement les paramètres pour les requêtes API
 * @param {object} options - Options pour inclure/exclure certains paramètres
 * @returns {object} - Paramètres pour les requêtes API
 */
export const useApiParams = (options = {}) => {
    const {
        includeEcoleId = true,
        includeAcademicYearId = true,
        includePeriodiciteId = true,
        includeUserId = true,
        includeProfileId = true,
        includeEmail = true
    } = options;

    const userContext = useUserContext();

    const apiParams = {};

    if (includeEcoleId && userContext.ecoleId) {
        apiParams.ecoleId = userContext.ecoleId;
    }
    
    if (includeAcademicYearId && userContext.academicYearId) {
        apiParams.academicYearId = userContext.academicYearId;
    }
    
    if (includePeriodiciteId && userContext.periodiciteId) {
        apiParams.periodiciteId = userContext.periodiciteId;
    }
    
    if (includeUserId && userContext.userId) {
        apiParams.userId = userContext.userId;
    }
    
    if (includeProfileId && userContext.profileId) {
        apiParams.profileId = userContext.profileId;
    }
    
    if (includeEmail && userContext.email) {
        apiParams.email = userContext.email;
    }

    return apiParams;
};