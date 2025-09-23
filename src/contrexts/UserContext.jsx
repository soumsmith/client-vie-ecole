import React, { createContext, useState, useEffect } from 'react';

// ===========================
// CONTEXTE GLOBAL POUR LES PARAMÈTRES UTILISATEUR
// ===========================

const UserContext = createContext();



/**
 * Provider pour le contexte utilisateur
 * Gère les paramètres dynamiques basés sur les données de connexion
 */
export const UserProvider = ({ children }) => {
    // ===========================
    // ÉTATS POUR LES PARAMÈTRES UTILISATEUR
    // ===========================
    const [userParams, setUserParams] = useState({
        ecoleId: null,
        userId: null,
        academicYearId: null,
        periodiciteId: null,
        profileId: null,
        email: null,
        personnelInfo: null,
        academicYearInfo: null
    });

    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // ===========================
    // FONCTIONS POUR GÉRER LES PARAMÈTRES
    // ===========================

    /**
     * Initialise les paramètres utilisateur depuis le localStorage
     */
    const initializeUserParams = () => {
        try {
            const completeUserData = localStorage.getItem('completeUserData');
            const userPersonnelInfo = localStorage.getItem('userPersonnelInfo');
            const userId = localStorage.getItem('userId');
            const academicYearMain = localStorage.getItem('academicYearMain');
            const academicYearInfo = localStorage.getItem('academicYearInfo');
            const userData = localStorage.getItem('userData');
            const isAuth = localStorage.getItem('isAuthenticated');

            if (completeUserData && isAuth === 'true') {
                const parsedData = JSON.parse(completeUserData);
                const parsedPersonnelInfo = userPersonnelInfo ? JSON.parse(userPersonnelInfo) : null;
                const parsedAcademicYearMain = academicYearMain ? JSON.parse(academicYearMain) : null;
                const parsedAcademicYearInfo = academicYearInfo ? JSON.parse(academicYearInfo) : null;
                const parsedUserData = userData ? JSON.parse(userData) : null;

                const newParams = {
                    ecoleId: parsedData.schoolId || parsedUserData?.schoolId || null,
                    userId: parsedData.userId || userId ? parseInt(userId) : null,
                    academicYearId: parsedAcademicYearMain?.id || parsedAcademicYearMain?.anneeid || null,
                    periodiciteId: parsedAcademicYearInfo?.periodiciteid || 2, // Valeur par défaut
                    profileId: parsedData.profileId || parsedUserData?.profileId || null,
                    email: parsedData.email || parsedUserData?.email || null,
                    personnelInfo: parsedData.personnelInfo || parsedPersonnelInfo || null,
                    academicYearInfo: parsedData.academicYearInfo || parsedAcademicYearInfo || null
                };

                setUserParams(newParams);
                setIsAuthenticated(true);
                console.log('✅ Paramètres utilisateur initialisés:', newParams);
            } else {
                // Valeurs par défaut si pas de données utilisateur
                setUserParams({
                    ecoleId: 38, // Valeur par défaut
                    userId: null,
                    academicYearId: 226, // Valeur par défaut
                    periodiciteId: 2, // Valeur par défaut
                    profileId: null,
                    email: null,
                    personnelInfo: null,
                    academicYearInfo: null
                });
                setIsAuthenticated(false);
                console.log('⚠️ Aucune donnée utilisateur trouvée, utilisation des valeurs par défaut');
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation des paramètres utilisateur:', error);
            // Valeurs par défaut en cas d'erreur
            setUserParams({
                ecoleId: 38,
                userId: null,
                academicYearId: 226,
                periodiciteId: 2,
                profileId: null,
                email: null,
                personnelInfo: null,
                academicYearInfo: null
            });
            setIsAuthenticated(false);
        } finally {
            setIsInitialized(true);
        }
    };

    /**
     * Met à jour les paramètres utilisateur
     * @param {object} newParams - Nouveaux paramètres
     */
    const updateUserParams = (newParams) => {
        setUserParams(prev => ({
            ...prev,
            ...newParams
        }));
    };

    /**
     * Met à jour les paramètres depuis les données de connexion
     * @param {object} loginData - Données de connexion
     */
    const updateFromLoginData = (loginData) => {
        if (loginData && loginData.userCompleteData) {
            const { userCompleteData } = loginData;
            
            const newParams = {
                ecoleId: userCompleteData.schoolId,
                userId: userCompleteData.userId,
                academicYearId: userCompleteData.academicYearMain?.id || userCompleteData.academicYearMain?.anneeid,
                periodiciteId: userCompleteData.academicYearInfo?.periodiciteid || 2,
                profileId: userCompleteData.profileId,
                email: userCompleteData.email,
                personnelInfo: userCompleteData.personnelInfo,
                academicYearInfo: userCompleteData.academicYearInfo
            };

            setUserParams(newParams);
            setIsAuthenticated(true);
            console.log('✅ Paramètres mis à jour depuis les données de connexion:', newParams);
        }
    };

    /**
     * Nettoie les paramètres utilisateur (déconnexion)
     */
    const clearUserParams = () => {
        setUserParams({
            ecoleId: 38,
            userId: null,
            academicYearId: 226,
            periodiciteId: 2,
            profileId: null,
            email: null,
            personnelInfo: null,
            academicYearInfo: null
        });
        setIsAuthenticated(false);
        console.log('🧹 Paramètres utilisateur nettoyés');
    };

    /**
     * Récupère un paramètre spécifique avec fallback
     * @param {string} paramName - Nom du paramètre
     * @param {any} defaultValue - Valeur par défaut
     * @returns {any} - Valeur du paramètre
     */
    const getParam = (paramName, defaultValue = null) => {
        return userParams[paramName] !== null && userParams[paramName] !== undefined
            ? userParams[paramName]
            : defaultValue;
    };

    /**
     * Récupère tous les paramètres avec fallbacks
     * @returns {object} - Tous les paramètres avec valeurs par défaut
     */
    const getAllParams = () => ({
        ecoleId: getParam('ecoleId', 38),
        userId: getParam('userId'),
        academicYearId: getParam('academicYearId', 226),
        periodiciteId: getParam('periodiciteId', 2),
        profileId: getParam('profileId'),
        email: getParam('email'),
        personnelInfo: getParam('personnelInfo'),
        academicYearInfo: getParam('academicYearInfo')
    });

    // ===========================
    // EFFET POUR L'INITIALISATION
    // ===========================
    useEffect(() => {
        initializeUserParams();
    }, []);

    // ===========================
    // VALEUR DU CONTEXTE
    // ===========================
    const contextValue = {
        // Paramètres utilisateur
        userParams,
        isAuthenticated,
        isInitialized,
        
        // Fonctions de gestion
        updateUserParams,
        updateFromLoginData,
        clearUserParams,
        getParam,
        getAllParams,
        
        // Paramètres individuels avec fallbacks
        ecoleId: getParam('ecoleId', 38),
        userId: getParam('userId'),
        academicYearId: getParam('academicYearId', 226),
        periodiciteId: getParam('periodiciteId', 2),
        profileId: getParam('profileId'),
        email: getParam('email'),
        personnelInfo: getParam('personnelInfo'),
        academicYearInfo: getParam('academicYearInfo')
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;