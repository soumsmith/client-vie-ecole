import { useMemo, useCallback } from 'react';
import { useUserContext } from './useUserContext';

/**
 * Hook pour récupérer les paramètres dynamiques basés sur les données utilisateur
 * Remplace les valeurs codées en dur par des valeurs dynamiques
 * @param {object} options - Options de configuration
 * @param {number} options.ecoleId - ID de l'école par défaut
 * @param {number} options.academicYearId - ID de l'année académique par défaut
 * @param {number} options.periodiciteId - ID de la périodicité par défaut
 * @param {number|null} options.userId - ID utilisateur par défaut
 * @param {number|null} options.profileId - ID profil par défaut
 * @param {string|null} options.email - Email par défaut
 * @returns {object} - Paramètres dynamiques avec fallbacks et utilitaires
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

    // Mémoriser les paramètres pour éviter les re-rendus inutiles
    const params = useMemo(() => ({
        ecoleId: userContext.ecoleId || defaultEcoleId,
        academicYearId: userContext.academicYearId || defaultAcademicYearId,
        periodiciteId: userContext.periodiciteId || defaultPeriodiciteId,
        userId: userContext.userId || defaultUserId,
        profileId: userContext.profileId || defaultProfileId,
        email: userContext.email || defaultEmail,
        personnelInfo: userContext.personnelInfo,
        academicYearInfo: userContext.academicYearInfo
    }), [
        userContext.ecoleId, defaultEcoleId,
        userContext.academicYearId, defaultAcademicYearId,
        userContext.periodiciteId, defaultPeriodiciteId,
        userContext.userId, defaultUserId,
        userContext.profileId, defaultProfileId,
        userContext.email, defaultEmail,
        userContext.personnelInfo,
        userContext.academicYearInfo
    ]);

    // Fonctions utilitaires mémorisées
    const hasRequiredData = useCallback(() => {
        return !!(params.ecoleId && params.academicYearId && params.periodiciteId);
    }, [params.ecoleId, params.academicYearId, params.periodiciteId]);

    const hasUserData = useCallback(() => {
        return !!(params.userId && params.profileId);
    }, [params.userId, params.profileId]);

    const getFullUserInfo = useCallback(() => {
        return {
            ...params,
            isComplete: hasRequiredData() && hasUserData(),
            hasMinimalData: hasRequiredData()
        };
    }, [params, hasRequiredData, hasUserData]);

    return {
        ...params,
        // États
        isAuthenticated: userContext.isAuthenticated,
        isInitialized: userContext.isInitialized,
        
        // Méthodes pour mettre à jour les paramètres
        updateParams: userContext.updateUserParams,
        updateFromLogin: userContext.updateFromLoginData,
        clearParams: userContext.clearUserParams,
        
        // Méthodes pour récupérer des paramètres spécifiques
        getParam: userContext.getParam,
        getAllParams: userContext.getAllParams,
        
        // Nouvelles fonctions utilitaires
        hasRequiredData,
        hasUserData,
        getFullUserInfo
    };
};

/**
 * Hook spécialisé pour les services PULS
 * Fournit les paramètres les plus couramment utilisés dans les services
 * @param {object} options - Options de configuration
 * @param {boolean} options.useDefaultEcoleId - Utiliser l'ID école par défaut si non défini
 * @param {boolean} options.useDefaultAcademicYearId - Utiliser l'ID année académique par défaut si non défini
 * @param {boolean} options.useDefaultPeriodiciteId - Utiliser l'ID périodicité par défaut si non défini
 * @param {boolean} options.requireAuth - Nécessite une authentification
 * @returns {object} - Paramètres pour les services PULS
 */
export const usePulsParams = (options = {}) => {
    const {
        useDefaultEcoleId = true,
        useDefaultAcademicYearId = true,
        useDefaultPeriodiciteId = true,
        requireAuth = false
    } = options;

    const userContext = useUserContext();

    // Vérification d'authentification si requise
    if (requireAuth && !userContext.isAuthenticated) {
        console.warn('usePulsParams: Authentification requise mais utilisateur non connecté');
    }

    const params = useMemo(() => ({
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
    }), [
        useDefaultEcoleId, userContext.ecoleId,
        useDefaultAcademicYearId, userContext.academicYearId,
        useDefaultPeriodiciteId, userContext.periodiciteId,
        userContext.userId, userContext.profileId, userContext.email,
        userContext.personnelInfo, userContext.academicYearInfo,
        userContext.isAuthenticated, userContext.isInitialized
    ]);

    // Validation des données
    const isDataValid = useMemo(() => {
        const hasBasicData = !!(params.ecoleId && params.academicYearId && params.periodiciteId);
        const hasUserDataIfRequired = requireAuth ? !!(params.userId && params.profileId) : true;
        return hasBasicData && hasUserDataIfRequired && params.isInitialized;
    }, [params, requireAuth]);

    return {
        ...params,
        isDataValid,
        // Indicateur si toutes les données nécessaires sont présentes
        isReady: isDataValid && (!requireAuth || params.isAuthenticated)
    };
};

/**
 * Hook pour les paramètres de requête API
 * Génère automatiquement les paramètres pour les requêtes API
 * @param {object} options - Options de configuration
 * @param {boolean} options.includeEcoleId - Inclure l'ID école
 * @param {boolean} options.includeAcademicYearId - Inclure l'ID année académique
 * @param {boolean} options.includePeriodiciteId - Inclure l'ID périodicité
 * @param {boolean} options.includeUserId - Inclure l'ID utilisateur
 * @param {boolean} options.includeProfileId - Inclure l'ID profil
 * @param {boolean} options.includeEmail - Inclure l'email
 * @param {boolean} options.excludeNullValues - Exclure les valeurs null/undefined
 * @returns {object} - Paramètres pour les requêtes API
 */
export const useApiParams = (options = {}) => {
    const {
        includeEcoleId = true,
        includeAcademicYearId = true,
        includePeriodiciteId = true,
        includeUserId = false,
        includeProfileId = false,
        includeEmail = false,
        excludeNullValues = true
    } = options;

    const userContext = useUserContext();

    const apiParams = useMemo(() => {
        const params = {};

        if (includeEcoleId) {
            const ecoleId = userContext.ecoleId || 38;
            if (!excludeNullValues || ecoleId) {
                params.ecoleId = ecoleId;
            }
        }
        
        if (includeAcademicYearId) {
            const academicYearId = userContext.academicYearId || 226;
            if (!excludeNullValues || academicYearId) {
                params.academicYearId = academicYearId;
            }
        }
        
        if (includePeriodiciteId) {
            const periodiciteId = userContext.periodiciteId || 2;
            if (!excludeNullValues || periodiciteId) {
                params.periodiciteId = periodiciteId;
            }
        }
        
        if (includeUserId && (!excludeNullValues || userContext.userId)) {
            params.userId = userContext.userId;
        }
        
        if (includeProfileId && (!excludeNullValues || userContext.profileId)) {
            params.profileId = userContext.profileId;
        }
        
        if (includeEmail && (!excludeNullValues || userContext.email)) {
            params.email = userContext.email;
        }

        return params;
    }, [
        includeEcoleId, includeAcademicYearId, includePeriodiciteId,
        includeUserId, includeProfileId, includeEmail, excludeNullValues,
        userContext.ecoleId, userContext.academicYearId, userContext.periodiciteId,
        userContext.userId, userContext.profileId, userContext.email
    ]);

    // Fonction pour générer une query string
    const toQueryString = useCallback(() => {
        const searchParams = new URLSearchParams();
        Object.entries(apiParams).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                searchParams.append(key, value.toString());
            }
        });
        return searchParams.toString();
    }, [apiParams]);

    // Fonction pour générer les headers d'authentification
    const getAuthHeaders = useCallback(() => {
        const headers = {};
        if (userContext.profileId) {
            headers['X-Profile-Id'] = userContext.profileId.toString();
        }
        if (userContext.userId) {
            headers['X-User-Id'] = userContext.userId.toString();
        }
        if (userContext.email) {
            headers['X-User-Email'] = userContext.email;
        }
        return headers;
    }, [userContext.profileId, userContext.userId, userContext.email]);

    return {
        ...apiParams,
        toQueryString,
        getAuthHeaders,
        isEmpty: Object.keys(apiParams).length === 0,
        isAuthenticated: userContext.isAuthenticated
    };
};

/**
 * Hook spécialisé pour obtenir uniquement les données utilisateur
 * @returns {object} - Données utilisateur et méthodes utilitaires
 */
export const useUserData = () => {
    const userContext = useUserContext();

    const userData = useMemo(() => ({
        userId: userContext.userId,
        profileId: userContext.profileId,
        email: userContext.email,
        personnelInfo: userContext.personnelInfo,
        profil: userContext.personnelInfo?.profil,
        nom: userContext.personnelInfo?.nom,
        prenom: userContext.personnelInfo?.prenom
    }), [userContext.userId, userContext.profileId, userContext.email, userContext.personnelInfo]);

    const hasCompleteProfile = useMemo(() => {
        return !!(userData.userId && userData.profileId && userData.email && userData.personnelInfo);
    }, [userData]);

    const getDisplayName = useCallback(() => {
        if (userData.personnelInfo?.prenom && userData.personnelInfo?.nom) {
            return `${userData.personnelInfo.prenom} ${userData.personnelInfo.nom}`;
        }
        return userData.email || `Utilisateur ${userData.userId}`;
    }, [userData]);

    return {
        ...userData,
        hasCompleteProfile,
        getDisplayName,
        isAuthenticated: userContext.isAuthenticated,
        isInitialized: userContext.isInitialized
    };
};

/**
 * Hook pour vérifier les permissions utilisateur
 * @param {string|array} requiredRoles - Rôle(s) requis
 * @returns {object} - Informations sur les permissions
 */
export const useUserPermissions = (requiredRoles = []) => {
    const { personnelInfo } = useUserData();
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    const hasPermission = useMemo(() => {
        if (!personnelInfo?.profil) return false;
        return roles.length === 0 || roles.includes(personnelInfo.profil);
    }, [personnelInfo?.profil, roles]);

    const isAdmin = useMemo(() => {
        return ['SuperAdmin', 'Fondateur'].includes(personnelInfo?.profil);
    }, [personnelInfo?.profil]);

    const isProfesseur = useMemo(() => {
        return personnelInfo?.profil === 'Professeur';
    }, [personnelInfo?.profil]);

    const isEleve = useMemo(() => {
        return personnelInfo?.profil === 'Eleve';
    }, [personnelInfo?.profil]);

    return {
        hasPermission,
        isAdmin,
        isProfesseur,
        isEleve,
        currentRole: personnelInfo?.profil,
        canAccess: (roles) => {
            if (!personnelInfo?.profil) return false;
            const roleList = Array.isArray(roles) ? roles : [roles];
            return roleList.includes(personnelInfo.profil);
        }
    };
};