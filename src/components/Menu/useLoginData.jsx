import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getFullUrl from '../hooks/urlUtils';
import { useUserContext } from '../../hooks/useUserContext';

/**
 * Hook pour la gestion de la connexion utilisateur
 * Gère le chargement des écoles, profils, la soumission du formulaire de connexion
 * et la récupération des données utilisateur après connexion
 * @param {object} config - Configuration des endpoints API
 * @returns {object} - Données et fonctions de gestion de la connexion
 */
const useLoginData = (config) => {
    const navigate = useNavigate();
    const {
        updateFromLoginData,
        updateUserParams,
        clearUserParams,
        isInitialized,
        isAuthenticated
    } = useUserContext();

    const getDefaultHeaders = () => {
        return {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    };

    // ===========================
    // ÉTATS POUR LES DONNÉES DE BASE
    // ===========================
    const [schools, setSchools] = useState([]);
    const [profiles, setProfiles] = useState([]);

    // ===========================
    // ÉTATS POUR LES DONNÉES UTILISATEUR
    // ===========================
    const [userPersonnelInfo, setUserPersonnelInfo] = useState(null);
    const [userId, setUserId] = useState(null);
    const [academicYearMain, setAcademicYearMain] = useState(null);
    const [academicYearInfo, setAcademicYearInfo] = useState(null);

    // ===========================
    // ÉTATS POUR LES LOADERS
    // ===========================
    const [loadingSchools, setLoadingSchools] = useState(false);
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingUserData, setLoadingUserData] = useState(false);
    const [initializingFromStorage, setInitializingFromStorage] = useState(true);

    // ===========================
    // ÉTATS POUR LES ERREURS
    // ===========================
    const [schoolsError, setSchoolsError] = useState(null);
    const [profilesError, setProfilesError] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [userDataError, setUserDataError] = useState(null);

    // ===========================
    // FONCTIONS UTILITAIRES
    // ===========================

    /**
     * Nettoie un item pour ne garder que ceux ayant des données utiles
     */
    const validateAndCleanDataItem = (item, index) => {
        if (!item || typeof item !== 'object') return null;

        const hasUsableData = Object.keys(item).some(
            key =>
                item[key] !== null &&
                item[key] !== undefined &&
                item[key] !== '' &&
                typeof item[key] !== 'object'
        );

        return hasUsableData ? item : null;
    };

    /**
     * Transforme les données brutes des écoles en format utilisable
     */
    const transformSchoolsData = (rawData) => {
        if (!Array.isArray(rawData)) return [];

        const validItems = rawData
            .map(validateAndCleanDataItem)
            .filter(item => item !== null);

        if (validItems.length === 0) {
            return [
                { value: 1, label: 'École Principale' },
                { value: 2, label: 'École Secondaire' },
                { value: 3, label: 'École Technique' }
            ];
        }

        return validItems.map((school, index) => {
            const id = school.ecoleid || school.id || index + 1;
            const name = school.ecoleclibelle || school.nom || school.name || `École ${id}`;

            return { value: id, label: name, ...school };
        });
    };

    /**
     * Transforme les données brutes des profils en format utilisable
     */
    const transformProfilesData = (rawData) => {
        if (!Array.isArray(rawData)) return [];

        const validItems = rawData
            .map(validateAndCleanDataItem)
            .filter(item => item !== null);

        if (validItems.length === 0) {
            return [
                { value: 1, label: 'Personnel' },
                { value: 2, label: 'Candidat' },
                { value: 3, label: 'Parent' },
                { value: 4, label: 'Élève' }
            ];
        }

        return validItems.map((profile, index) => {
            const id = profile.profilid || profile.id || index + 1;
            const name = profile.profil_libelle || profile.nom || profile.name || `Profil ${id}`;

            return { value: id, label: name, ...profile };
        });
    };

    /**
     * Extrait les données d'une réponse API selon le type
     */
    const extractDataFromResponse = (responseData, dataType) => {
        let extractedData = [];

        if (Array.isArray(responseData)) {
            extractedData = responseData;
        } else if (responseData && typeof responseData === 'object') {
            const possibleKeys = dataType === 'schools'
                ? ['data', 'schools', 'ecoles', 'result', 'items', 'list']
                : ['data', 'profiles', 'profils', 'result', 'items', 'list'];

            for (const key of possibleKeys) {
                if (Array.isArray(responseData[key])) {
                    extractedData = responseData[key];
                    break;
                }
            }

            if (extractedData.length === 0) {
                const arrayValues = Object.values(responseData).filter(val => Array.isArray(val));
                if (arrayValues.length > 0) extractedData = arrayValues[0];
            }
        }

        return extractedData;
    };

    // ===========================
    // NOUVELLES FONCTIONS POUR LA GESTION DYNAMIQUE
    // ===========================

    /**
     * Mappe les données du formulaire selon la configuration des champs de connexion
     */
    const mapFormDataToLoginData = (formData, loginFields) => {
        if (!loginFields) {
            return {
                email: formData.email,
                motdePasse: formData.password,
                login: formData.email,
                ecoleid: formData.schoolId,
                profilid: formData.profileId
            };
        }

        const mappedData = {};

        Object.entries(loginFields).forEach(([formField, apiField]) => {
            let value;
            switch (formField) {
                case 'email':
                    value = formData.email;
                    break;
                case 'password':
                    value = formData.password;
                    break;
                case 'schoolId':
                    value = formData.schoolId;
                    break;
                case 'profileId':
                    value = formData.profileId;
                    break;
                case 'login':
                    value = formData.email;
                    break;
                default:
                    console.warn(`Champ de formulaire non reconnu: ${formField}`);
                    return;
            }

            if (value !== undefined && value !== null) {
                mappedData[apiField] = value;
            }
        });

        console.log('🔄 Données mappées:', {
            formData,
            loginFields,
            mappedData
        });

        return mappedData;
    };

    /**
     * Effectue la requête de connexion selon la méthode configurée
     */
    const performLoginRequest = async (url, loginData, method = 'POST') => {
        try {
            if (method.toUpperCase() === 'GET') {
                const params = new URLSearchParams(loginData);
                const fullUrl = `${url}?${params.toString()}`;
                console.log(`🔗 Requête GET vers: ${fullUrl}`);
                return await axios.get(fullUrl);
            } else {
                console.log(`🔗 Requête POST vers: ${url}`, loginData);
                return await axios.post(url, loginData);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la requête de connexion:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: url,
                method: method,
                loginData: loginData
            });

            if (error.response?.status === 403) {
                throw new Error('Accès refusé - Vérifiez vos identifiants');
            } else if (error.response?.status === 404) {
                throw new Error('Service de connexion non trouvé');
            } else if (error.response?.status >= 500) {
                throw new Error('Erreur serveur - Réessayez plus tard');
            } else if (error.code === 'ECONNABORTED') {
                throw new Error('Timeout - Connexion trop lente');
            } else if (error.code === 'ERR_NETWORK') {
                throw new Error('Erreur réseau - Vérifiez votre connexion');
            }

            throw error;
        }
    };

    // ===========================
    // FONCTION POUR RÉCUPÉRER LES DONNÉES DEPUIS LE LOCALSTORAGE
    // ===========================

    /**
     * Récupère toutes les données utilisateur stockées dans le localStorage
     */
    const getStoredUserData = () => {
        try {
            const completeUserData = localStorage.getItem('completeUserData');
            const userPersonnelInfo = localStorage.getItem('userPersonnelInfo');
            const userId = localStorage.getItem('userId');
            const academicYearMain = localStorage.getItem('academicYearMain');
            const academicYearInfo = localStorage.getItem('academicYearInfo');
            const userData = localStorage.getItem('userData');
            const userProfil = localStorage.getItem('userProfil');
            const isAuthenticated = localStorage.getItem('isAuthenticated');

            return {
                completeUserData: completeUserData ? JSON.parse(completeUserData) : null,
                userPersonnelInfo: userPersonnelInfo ? JSON.parse(userPersonnelInfo) : null,
                userId: userId ? parseInt(userId) : null,
                academicYearMain: academicYearMain ? JSON.parse(academicYearMain) : null,
                academicYearInfo: academicYearInfo ? JSON.parse(academicYearInfo) : null,
                userData: userData ? JSON.parse(userData) : null,
                userProfil,
                isAuthenticated: isAuthenticated === 'true'
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des données stockées:', error);
            return null;
        }
    };

    /**
     * Initialise le UserContext avec les données stockées dans localStorage
     */
    const initializeUserContextFromStorage = () => {
        console.log('🔄 Initialisation du contexte utilisateur depuis localStorage...');

        const storedData = getStoredUserData();

        if (!storedData || !storedData.isAuthenticated) {
            console.log('❌ Aucune donnée utilisateur trouvée ou utilisateur non authentifié');
            setInitializingFromStorage(false);
            return;
        }

        try {
            const contextData = {
                email: storedData.userData?.email || storedData.completeUserData?.email,
                userId: storedData.userId,
                profileId: storedData.userData?.profileId || storedData.completeUserData?.profileId,
                ecoleId: storedData.userData?.schoolId || storedData.completeUserData?.schoolId || 38,
                academicYearId: storedData.academicYearMain?.anneeid || storedData.academicYearMain?.id || 226,
                periodiciteId: 2,
                personnelInfo: storedData.userPersonnelInfo,
                academicYearInfo: storedData.academicYearInfo,
                loginTime: storedData.completeUserData?.loginTime || storedData.userData?.loginTime,
                userType: storedData.completeUserData?.userType || storedData.userData?.userType || 'user'
            };

            console.log('📋 Données à restaurer dans le contexte:', contextData);

            updateFromLoginData({ userCompleteData: contextData });

            if (storedData.userPersonnelInfo) setUserPersonnelInfo(storedData.userPersonnelInfo);
            if (storedData.userId) setUserId(storedData.userId);
            if (storedData.academicYearMain) setAcademicYearMain(storedData.academicYearMain);
            if (storedData.academicYearInfo) setAcademicYearInfo(storedData.academicYearInfo);

            console.log('✅ Contexte utilisateur initialisé avec succès depuis localStorage');

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du contexte:', error);
        } finally {
            setInitializingFromStorage(false);
        }
    };

    // ===========================
    // FONCTIONS DE CHARGEMENT DES DONNÉES DE BASE
    // ===========================

    /**
     * Charge la liste des écoles depuis l'API
     */
    const loadSchools = async () => {
        setLoadingSchools(true);
        setSchoolsError(null);

        try {
            const response = await axios.get(`${getFullUrl()}connecte/ecole`);
            const extractedData = extractDataFromResponse(response.data, 'schools');
            const transformed = transformSchoolsData(extractedData);

            setSchools(transformed.length ? transformed : [{ value: 1, label: 'École par défaut' }]);
        } catch (error) {
            console.error('Erreur chargement écoles:', error.message);
            setSchoolsError('Impossible de charger les écoles.');
            setSchools([{ value: 1, label: 'École par défaut' }]);
        } finally {
            setLoadingSchools(false);
        }
    };

    /**
     * Charge la liste des profils depuis l'API
     */
    const loadProfiles = async () => {
        setLoadingProfiles(true);
        setProfilesError(null);

        try {
            const response = await axios.get(`${getFullUrl()}profil`);
            const extractedData = extractDataFromResponse(response.data, 'profiles');
            const transformed = transformProfilesData(extractedData);

            setProfiles(transformed.length ? transformed : [{ value: 1, label: 'Profil par défaut' }]);
        } catch (error) {
            console.error('Erreur chargement profils:', error.message);
            setProfilesError('Impossible de charger les profils.');
            setProfiles([{ value: 1, label: 'Profil par défaut' }]);
        } finally {
            setLoadingProfiles(false);
        }
    };

    // ===========================
    // FONCTIONS POUR LES DONNÉES UTILISATEUR (CORRIGÉES)
    // ===========================

    /**
     * FONCTION CORRIGÉE - Récupère les informations du personnel avec gestion d'erreur individuelle
     */
    const fetchUserPersonnelInfo = async (email, schoolId, profileId) => {
        const results = {
            personnelInfo: null,
            personnelConnecteInfo: null,
            candidatInfo: null
        };

        console.log(`🔄 Récupération des infos personnel: ${email}/${schoolId}/${profileId}`);

        // Premier appel - ID utilisateur connecté
        try {
            console.log('📞 Appel 1: ID utilisateur connecté...');
            const response1 = await axios.get(
                `${getFullUrl()}connexion/id-utilisateur-connecte/${encodeURIComponent(email)}`
            );
            results.personnelInfo = response1.data;
            console.log('✅ Appel 1 réussi:', results.personnelInfo);
        } catch (error) {
            console.error('❌ Erreur appel 1 (ID utilisateur):', error.message);
        }

        // Deuxième appel - Infos personnel connecté v2
        try {
            console.log('📞 Appel 2: Infos personnel connecté v2...');
            const response2 = await axios.get(
                `${getFullUrl()}connexion/infos-personnel-connecte-v2/${email}/${schoolId}/${profileId}`
            );
            results.personnelConnecteInfo = response2.data;
            console.log('✅ Appel 2 réussi:', results.personnelConnecteInfo);
        } catch (error) {
            console.error('❌ Erreur appel 2 (Personnel connecté v2):', error.message);
        }

        // Troisième appel - Infos candidat connecté (CELUI QUI T'INTÉRESSE)
        try {
            console.log('📞 Appel 3: Infos candidat connecté...');
            const candidatUrl = `${getFullUrl()}connexion/infos-personnel-connecte-candidat/${encodeURIComponent(email)}`;
            console.log('🔗 URL candidat:', candidatUrl);
            
            const response3 = await axios.get(candidatUrl);
            results.candidatInfo = response3.data;
            console.log('✅ Appel 3 réussi:', results.candidatInfo);
        } catch (error) {
            console.error('❌ Erreur appel 3 (Candidat):', error.message);
            console.error('📋 Détails erreur candidat:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                url: `${getFullUrl()}connexion/infos-personnel-connecte-candidat/${encodeURIComponent(email)}`
            });
        }

        // Combinaison des résultats disponibles
        const combinedInfo = {};
        if (results.personnelInfo) {
            Object.assign(combinedInfo, results.personnelInfo);
        }
        if (results.candidatInfo) {
            combinedInfo.candidatDetails = results.candidatInfo;
        }
        if (results.personnelConnecteInfo) {
            combinedInfo.personnelConnecteDetail = results.personnelConnecteInfo;
        }

        // Sauvegarder même avec des données partielles
        if (Object.keys(combinedInfo).length > 0) {
            setUserPersonnelInfo(combinedInfo);
            localStorage.setItem('userPersonnelInfo', JSON.stringify(combinedInfo));
            console.log('💾 Données sauvegardées:', combinedInfo);
        }

        // Logs finaux
        console.log('📊 Résumé des appels:');
        console.log('  - Personnel Info:', results.personnelInfo ? '✅' : '❌');
        console.log('  - Personnel Connecté:', results.personnelConnecteInfo ? '✅' : '❌');
        console.log('  - Candidat Info:', results.candidatInfo ? '✅' : '❌');

        return combinedInfo;
    };

    /**
     * NOUVELLE FONCTION - Détermine le profil utilisateur basé sur les données candidat
     */
    const determineCandidatProfile = (candidatInfo, modalType) => {
        // Si ce n'est pas un candidat, retourner le type de modal original
        if (modalType !== 'candidat' || !candidatInfo) {
            return modalType;
        }

        // Vérifier si les données candidat contiennent une fonction
        const libelleFonction = candidatInfo.libelleFonction || candidatInfo.fonction || candidatInfo.role;
        
        if (libelleFonction) {
            // Normaliser le libellé de la fonction (première lettre en majuscule)
            const fonctionNormalisee = libelleFonction.charAt(0).toUpperCase() + 
                                     libelleFonction.slice(1).toLowerCase();
            
            const candidatProfile = `Candidat-${fonctionNormalisee}`;
            
            console.log(`👤 Profil candidat déterminé: ${candidatProfile}`);
            console.log(`📋 Basé sur libelleFonction: ${libelleFonction}`);
            
            return candidatProfile;
        }

        // Si pas de fonction trouvée, retourner "Candidat" par défaut
        console.log('👤 Profil candidat par défaut: Candidat');
        return 'Candidat';
    };

    /**
     * Récupère l'ID de l'utilisateur connecté
     */
    const fetchUserId = async (email) => {
        try {
            console.log(`Récupération ID utilisateur: ${encodeURIComponent(email)}`);
            const response = await axios.get(
                `${getFullUrl()}connexion/id-utilisateur-connecte-v2?login=${encodeURIComponent(email)}`,
                {
                    headers: getDefaultHeaders(),
                    timeout: 10000
                }
            );

            const userIdValue = response.data;
            setUserId(userIdValue);
            localStorage.setItem('userId', userIdValue.toString());

            console.log('ID utilisateur récupéré:', userIdValue);
            return userIdValue;
        } catch (error) {
            console.error('Erreur récupération ID utilisateur:', error.message);
            throw error;
        }
    };

    /**
     * Récupère l'année académique principale de l'école
     */
    const fetchAcademicYearMain = async (schoolId) => {
        try {
            console.log(`Récupération année académique principale: école ${schoolId}`);
            const response = await axios.get(
                `${getFullUrl()}annee/get-main-annee-by-ecole/${schoolId}`
            );

            const academicYear = response.data;
            setAcademicYearMain(academicYear);
            localStorage.setItem('academicYearMain', JSON.stringify(academicYear));

            console.log('Année académique principale récupérée:', academicYear);
            return academicYear;
        } catch (error) {
            console.error('Erreur récupération année académique principale:', error.message);
            throw error;
        }
    };

    /**
     * Récupère les informations sur l'année académique
     */
    const fetchAcademicYearInfo = async (schoolId) => {
        try {
            console.log(`Récupération infos année académique: école ${schoolId}`);
            const response = await axios.get(
                `${getFullUrl()}annee/info-annee/${schoolId}`
            );

            const academicYearInfoData = response.data;
            setAcademicYearInfo(academicYearInfoData);
            localStorage.setItem('academicYearInfo', JSON.stringify(academicYearInfoData));

            console.log('Informations année académique récupérées:', academicYearInfoData);
            return academicYearInfoData;
        } catch (error) {
            console.error('Erreur récupération infos année académique:', error.message);
            throw error;
        }
    };

    /**
     * Récupère toutes les données utilisateur après connexion
     */
    const fetchAllUserData = async (email, schoolId, profileId) => {
        setLoadingUserData(true);
        setUserDataError(null);

        try {
            console.log('🔄 Début de la récupération des données utilisateur...');

            const [personnelInfo, userIdValue, academicYearMain, academicYearInfoData] = await Promise.allSettled([
                fetchUserPersonnelInfo(email, schoolId, profileId),
                fetchUserId(email),
                fetchAcademicYearMain(schoolId),
                fetchAcademicYearInfo(schoolId)
            ]);

            const results = {
                personnelInfo: personnelInfo.status === 'fulfilled' ? personnelInfo.value : null,
                userId: userIdValue.status === 'fulfilled' ? userIdValue.value : null,
                academicYearMain: academicYearMain.status === 'fulfilled' ? academicYearMain.value : null,
                academicYearInfo: academicYearInfoData.status === 'fulfilled' ? academicYearInfoData.value : null
            };

            const errors = [];
            if (personnelInfo.status === 'rejected') errors.push('Infos personnel');
            if (userIdValue.status === 'rejected') errors.push('ID utilisateur');
            if (academicYearMain.status === 'rejected') errors.push('Année académique principale');
            if (academicYearInfoData.status === 'rejected') errors.push('Infos année académique');

            if (errors.length > 0) {
                console.warn(`⚠️ Erreurs lors de la récupération de: ${errors.join(', ')}`);
            }

            const completeUserData = {
                email,
                schoolId,
                profileId,
                ecoleId: schoolId,
                academicYearId: results.academicYearMain?.anneeid || results.academicYearMain?.id || 226,
                periodiciteId: 2,
                userId: results.userId,
                personnelInfo: results.personnelInfo,
                academicYearMain: results.academicYearMain,
                academicYearInfo: results.academicYearInfo,
                loginTime: new Date().toISOString(),
                userType: config.modalType || 'user'
            };

            localStorage.setItem('completeUserData', JSON.stringify(completeUserData));

            console.log('✅ Toutes les données utilisateur récupérées avec succès:', completeUserData);
            return completeUserData;

        } catch (error) {
            console.error('❌ Erreur lors de la récupération des données utilisateur:', error.message);
            setUserDataError('Erreur lors de la récupération des données utilisateur');
            throw error;
        } finally {
            setLoadingUserData(false);
        }
    };

    // ===========================
    // FONCTION DE CONNEXION CORRIGÉE
    // ===========================

    /**
     * Soumet le formulaire de connexion et récupère les données utilisateur
     */
    const submitLogin = async (formData) => {
        setSubmitError(null);
        setSubmitting(true);

        try {
            const method = config?.method || 'POST';
            const loginFields = config?.loginFields;

            console.log(`🔐 Tentative de connexion avec méthode ${method}...`);
            console.log('📋 Configuration des champs:', loginFields);

            const loginData = mapFormDataToLoginData(formData, loginFields);
            console.log('📤 Données de connexion préparées:', loginData);

            const response = await performLoginRequest(
                `${getFullUrl()}${config.apis.login}`,
                loginData,
                method
            );

            const data = response.data;
            let userProfil = "";

            // LOGIQUE DE VALIDATION CORRIGÉE
            const isSuccess = response.status === 200 && data && (
                data?.success === true ||
                data?.status === 'success' ||
                data?.code_statut === 1 ||
                data?.code_statut === '1' ||
                data?.token ||
                data?.user ||
                data?.utilisateur ||
                data === "Fondateur" ||
                data === "Professeur" ||
                data === "Admin" ||
                data === "Mot de passe correct!"
            );

            if (isSuccess) {
                console.log('✅ Connexion réussie !');

                // Détermination du profil utilisateur de base
                userProfil = data === "Mot de passe correct!" ? "Candidat" : data;

                const basicUserData = {
                    email: formData.email,
                    schoolId: formData.schoolId,
                    profileId: formData.profileId,
                    loginTime: new Date().toISOString(),
                    userType: config.modalType || 'user',
                    method: method
                };

                localStorage.setItem('userProfil', userProfil);
                localStorage.setItem('userData', JSON.stringify(basicUserData));
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userType', config.modalType || 'user');

                try {
                    console.log('🔄 Récupération des données utilisateur...');
                    const completeUserData = await fetchAllUserData(
                        formData.email,
                        formData.schoolId,
                        formData.profileId
                    );

                    // 🆕 NOUVELLE LOGIQUE - Déterminer le profil candidat spécifique
                    let finalUserProfile = userProfil;
                    
                    if (config.modalType === 'candidat' && completeUserData?.personnelInfo?.candidatDetails) {
                        finalUserProfile = determineCandidatProfile(
                            completeUserData.personnelInfo.candidatDetails,
                            config.modalType
                        );
                        
                        console.log('👤 Profil candidat final déterminé:', finalUserProfile);
                        
                        // Mettre à jour le profil stocké avec le profil spécifique
                        localStorage.setItem('userProfil', finalUserProfile);
                        localStorage.setItem('candidatProfile', finalUserProfile);
                        
                        // Ajouter le profil spécifique aux données complètes
                        completeUserData.candidatProfile = finalUserProfile;
                        completeUserData.userProfile = finalUserProfile;
                        
                        // Re-sauvegarder les données complètes avec le nouveau profil
                        localStorage.setItem('completeUserData', JSON.stringify(completeUserData));
                    }

                    updateFromLoginData({ userCompleteData: completeUserData });

                    return {
                        success: true,
                        data,
                        userCompleteData: completeUserData,
                        userProfile: finalUserProfile, // Retourner le profil final
                        method: method
                    };
                } catch (userDataError) {
                    console.warn('⚠️ Connexion réussie mais erreur lors de la récupération des données utilisateur:', userDataError.message);
                    return {
                        success: true,
                        data,
                        userCompleteData: null,
                        userProfile: userProfil, // Profil de base en cas d'erreur
                        method: method,
                        warning: 'Connexion réussie mais certaines données utilisateur n\'ont pas pu être récupérées'
                    };
                }
            } else {
                const errorMessage = data?.message || data?.error || 'Échec de la connexion';
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('❌ Erreur de connexion:', error.message);

            if (error.message.includes('CORS') || error.code === 'ERR_NETWORK') {
                setSubmitError('Erreur de connexion au serveur. Vérifiez votre connexion.');
            } else {
                setSubmitError(error.message || 'Erreur de connexion');
            }

            return { success: false, data: null };
        } finally {
            setSubmitting(false);
        }
    };

    // ===========================
    // FONCTIONS UTILITAIRES
    // ===========================

    const clearErrors = () => {
        setSchoolsError(null);
        setProfilesError(null);
        setSubmitError(null);
        setUserDataError(null);
    };

    const refreshData = () => {
        loadSchools();
        loadProfiles();
    };

    const clearUserData = () => {
        setUserPersonnelInfo(null);
        setUserId(null);
        setAcademicYearMain(null);
        setAcademicYearInfo(null);

        localStorage.removeItem('completeUserData');
        localStorage.removeItem('userPersonnelInfo');
        localStorage.removeItem('userId');
        localStorage.removeItem('academicYearMain');
        localStorage.removeItem('academicYearInfo');
        localStorage.removeItem('userData');
        localStorage.removeItem('userProfil');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userType');

        clearUserParams();

        console.log('🧹 Données utilisateur nettoyées');
    };

    // ===========================
    // EFFET POUR LE CHARGEMENT INITIAL
    // ===========================
    useEffect(() => {
        console.log('🚀 Initialisation du hook useLoginData...');

        if (config) {
            console.log('📋 Configuration reçue:', {
                method: config.method || 'POST (default)',
                loginFields: config.loginFields,
                apis: config.apis
            });

            loadSchools();
            loadProfiles();
        }

        if (!isInitialized && !initializingFromStorage) {
            initializeUserContextFromStorage();
        }
    }, [config, isInitialized]);

    // ===========================
    // RETOUR DU HOOK
    // ===========================
    return {
        // Données de base
        schools: schools.length > 0 ? schools : [{ value: 1, label: 'École par défaut' }],
        profiles: profiles.length > 0 ? profiles : [{ value: 1, label: 'Profil par défaut' }],

        // Données utilisateur
        userPersonnelInfo,
        userId,
        academicYearMain,
        academicYearInfo,

        // États de chargement
        loadingSchools,
        loadingProfiles,
        submitting,
        loadingUserData,
        initializingFromStorage,

        // États du contexte
        isAuthenticated,
        isInitialized,

        // Erreurs
        schoolsError,
        profilesError,
        submitError,
        userDataError,

        // Fonctions principales
        submitLogin,
        fetchAllUserData,
        getStoredUserData,
        clearUserData,
        initializeUserContextFromStorage,

        // Fonctions utilitaires
        clearErrors,
        refreshData,
        loadSchools,
        loadProfiles,

        // Fonctions spécifiques pour récupérer les données
        fetchUserPersonnelInfo,
        fetchUserId,
        fetchAcademicYearMain,
        fetchAcademicYearInfo,

        // Nouvelle fonction pour déterminer le profil candidat
        determineCandidatProfile,

        // Nouvelles fonctions utilitaires
        mapFormDataToLoginData,
        performLoginRequest,

        // Informations sur la configuration actuelle
        currentConfig: {
            method: config?.method || 'POST',
            loginFields: config?.loginFields,
            modalType: config?.modalType
        },

        // Nouvelle fonction utilitaire pour récupérer le profil candidat actuel
        getCurrentCandidatProfile: () => {
            const storedProfile = localStorage.getItem('candidatProfile');
            const storedUserProfil = localStorage.getItem('userProfil');
            return storedProfile || storedUserProfil || 'Candidat';
        }
    };
};

export default useLoginData;