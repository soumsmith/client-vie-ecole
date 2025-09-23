import { useUserContext } from './useUserContext';

/**
 * Hook pour récupérer les paramètres dynamiques basés sur les données utilisateur
 * Remplace les valeurs codées en dur par des valeurs dynamiques
 * @param {object} options - Options de configuration
 * @returns {object} - Paramètres dynamiques avec fallbacks
 */
export const useDynamicParams = (options = {}) => {
    const {
        ecoleId: defaultEcoleId = 38,
        academicYearId: defaultAcademicYearId = 226,
        periodiciteId: defaultPeriodiciteId = 2,
        userId: defaultUserId = null,
        profileId: defaultProfileId = null,
        email: defaultEmail = null
    } = options;

    const userContext = useUserContext();

    // Récupérer les paramètres avec fallbacks
    const params = {
        ecoleId: userContext.ecoleId || defaultEcoleId,
        academicYearId: userContext.academicYearId || defaultAcademicYearId,
        periodiciteId: userContext.periodiciteId || defaultPeriodiciteId,
        userId: userContext.userId || defaultUserId,
        profileId: userContext.profileId || defaultProfileId,
        email: userContext.email || defaultEmail,
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
 * Fournit les paramètres les plus couramment utilisés dans les services
 * @param {object} options - Options de configuration
 * @returns {object} - Paramètres pour les services PULS
 */
export const usePulsParams = (options = {}) => {
    const {
        useDefaultEcoleId = true,
        useDefaultAcademicYearId = true,
        useDefaultPeriodiciteId = true
    } = options;

    const userContext = useUserContext();
    
    return {
        // Paramètres principaux avec fallbacks intelligents
        ecoleId: useDefaultEcoleId 
            ? (userContext.ecoleId || 38)
            : userContext.ecoleId,
            
        academicYearId: useDefaultAcademicYearId
            ? (userContext.academicYearId || 226)
            : userContext.academicYearId,
            
        periodiciteId: useDefaultPeriodiciteId
            ? (userContext.periodiciteId || 2)
            : userContext.periodiciteId,
            
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
 * @param {object} options - Options de configuration
 * @returns {object} - Paramètres pour les requêtes API
 */
export const useApiParams = (options = {}) => {
    const {
        includeEcoleId = true,
        includeAcademicYearId = true,
        includePeriodiciteId = true,
        includeUserId = false,
        includeProfileId = false,
        includeEmail = false
    } = options;

    const userContext = useUserContext();

    const apiParams = {};

    if (includeEcoleId) {
        apiParams.ecoleId = userContext.ecoleId || 38;
    }
    
    if (includeAcademicYearId) {
        apiParams.academicYearId = userContext.academicYearId || 226;
    }
    
    if (includePeriodiciteId) {
        apiParams.periodiciteId = userContext.periodiciteId || 2;
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