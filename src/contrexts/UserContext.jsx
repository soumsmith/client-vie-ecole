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
                    userId: parsedData.userId || (userId ? parseInt(userId) : null),
                    academicYearId: parsedAcademicYearMain?.id || parsedAcademicYearMain?.anneeid || null,
                    periodiciteId: parsedAcademicYearInfo?.periodiciteid || null,
                    profileId: parsedData.profileId || parsedUserData?.profileId || null,
                    email: parsedData.email || parsedUserData?.email || null,
                    personnelInfo: parsedData.personnelInfo || parsedPersonnelInfo || null,
                    academicYearInfo: parsedData.academicYearInfo || parsedAcademicYearInfo || null
                };

                setUserParams(newParams);
                setIsAuthenticated(true);
                console.log('✅ Paramètres utilisateur initialisés:', newParams);
            } else {
                // Pas de données utilisateur, tous les paramètres restent null
                setUserParams({
                    ecoleId: null,
                    userId: null,
                    academicYearId: null,
                    periodiciteId: null,
                    profileId: null,
                    email: null,
                    personnelInfo: null,
                    academicYearInfo: null
                });
                setIsAuthenticated(false);
                console.log('⚠️ Aucune donnée utilisateur trouvée');
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation des paramètres utilisateur:', error);
            // En cas d'erreur, réinitialiser à null
            setUserParams({
                ecoleId: null,
                userId: null,
                academicYearId: null,
                periodiciteId: null,
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
                ecoleId: userCompleteData.schoolId || null,
                userId: userCompleteData.userId || null,
                academicYearId: userCompleteData.academicYearMain?.id || userCompleteData.academicYearMain?.anneeid || null,
                periodiciteId: userCompleteData.academicYearInfo?.periodiciteid || null,
                profileId: userCompleteData.profileId || null,
                email: userCompleteData.email || null,
                personnelInfo: userCompleteData.personnelInfo || null,
                academicYearInfo: userCompleteData.academicYearInfo || null
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
            ecoleId: null,
            userId: null,
            academicYearId: null,
            periodiciteId: null,
            profileId: null,
            email: null,
            personnelInfo: null,
            academicYearInfo: null
        });
        setIsAuthenticated(false);
        console.log('🧹 Paramètres utilisateur nettoyés');
    };

    /**
     * Récupère un paramètre spécifique
     * @param {string} paramName - Nom du paramètre
     * @returns {any} - Valeur du paramètre (peut être null)
     */
    const getParam = (paramName) => {
        return userParams[paramName];
    };

    /**
     * Récupère tous les paramètres
     * @returns {object} - Tous les paramètres
     */
    const getAllParams = () => ({
        ecoleId: userParams.ecoleId,
        userId: userParams.userId,
        academicYearId: userParams.academicYearId,
        periodiciteId: userParams.periodiciteId,
        profileId: userParams.profileId,
        email: userParams.email,
        personnelInfo: userParams.personnelInfo,
        academicYearInfo: userParams.academicYearInfo
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
        
        // Paramètres individuels (valeurs dynamiques uniquement)
        ecoleId: userParams.ecoleId,
        userId: userParams.userId,
        academicYearId: userParams.academicYearId,
        periodiciteId: userParams.periodiciteId,
        profileId: userParams.profileId,
        email: userParams.email,
        personnelInfo: userParams.personnelInfo,
        academicYearInfo: userParams.academicYearInfo
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;