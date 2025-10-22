import { useMemo, useCallback } from 'react';
import { useUserContext } from './useUserContext';

/**
 * Hook pour récupérer les paramètres dynamiques basés sur les données utilisateur
 * Utilise uniquement les données du contexte utilisateur
 * @returns {object} - Paramètres dynamiques avec utilitaires
 */
export const useDynamicParams = () => {
    const userContext = useUserContext();

    // Mémoriser les paramètres pour éviter les re-rendus inutiles
    const params = useMemo(() => ({
        ecoleId: userContext.ecoleId,
        academicYearId: userContext.academicYearId,
        periodiciteId: userContext.periodiciteId,
        userId: userContext.userId,
        profileId: userContext.profileId,
        email: userContext.email,
        personnelInfo: userContext.personnelInfo,
        academicYearInfo: userContext.academicYearInfo
    }), [
        userContext.ecoleId,
        userContext.academicYearId,
        userContext.periodiciteId,
        userContext.userId,
        userContext.profileId,
        userContext.email,
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
 * Fournit les paramètres directement depuis le contexte utilisateur
 * @param {object} options - Options de configuration
 * @param {boolean} options.requireAuth - Nécessite une authentification
 * @returns {object} - Paramètres pour les services PULS
 */
export const usePulsParams = (options = {}) => {
    const {
        requireAuth = false
    } = options;

    const userContext = useUserContext();

    // Vérification d'authentification si requise
    if (requireAuth && !userContext.isAuthenticated) {
        console.warn('usePulsParams: Authentification requise mais utilisateur non connecté');
    }

    const params = useMemo(() => ({
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
    }), [
        userContext.ecoleId,
        userContext.academicYearId,
        userContext.periodiciteId,
        userContext.userId,
        userContext.profileId,
        userContext.email,
        userContext.personnelInfo,
        userContext.academicYearInfo,
        userContext.isAuthenticated,
        userContext.isInitialized
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
            const ecoleId = userContext.ecoleId;
            if (!excludeNullValues || ecoleId) {
                params.ecoleId = ecoleId;
            }
        }
        
        if (includeAcademicYearId) {
            const academicYearId = userContext.academicYearId;
            if (!excludeNullValues || academicYearId) {
                params.academicYearId = academicYearId;
            }
        }
        
        if (includePeriodiciteId) {
            const periodiciteId = userContext.periodiciteId;
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
        return userData.email || `Utilisateur ${userData.userId || 'inconnu'}`;
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