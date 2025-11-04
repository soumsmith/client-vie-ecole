import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import getFullUrl from '../hooks/urlUtils';
import { useUserContext } from '../../hooks/useUserContext';
import Swal from 'sweetalert2'; // 🆕 Importer SweetAlert2


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
    // FONCTIONS POUR LA GESTION DYNAMIQUE
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
    // NOUVELLES FONCTIONS POUR LA RÉCUPÉRATION DE MOT DE PASSE
    // ===========================

    /**
     * Envoie un email avec les informations de connexion
     */
    const sendPasswordEmail = async (email, loginInfo, password) => {
        try {
            console.log('📧 Envoi de l\'email de récupération...');

            const emailData = {
                destinataire: email,
                message: `Login :${loginInfo || email}  Mot de passe:${password}`,
                objet: "Vos paramètres d'identifications"
            };

            const params = new URLSearchParams(emailData);
            const emailUrl = `${getFullUrl()}sendEmail?${params.toString()}`;

            console.log('📤 Envoi email vers:', emailUrl);

            const response = await axios.post(emailUrl);

            if (response.status === 200) {
                console.log('✅ Email envoyé avec succès');
                return { success: true, message: 'Email envoyé avec succès' };
            } else {
                throw new Error('Erreur lors de l\'envoi de l\'email');
            }
        } catch (error) {
            console.error('❌ Erreur envoi email:', error);
            throw new Error('Impossible d\'envoyer l\'email. Veuillez réessayer.');
        }
    };

    /**
     * Gère la récupération de mot de passe
     */
    const handlePasswordRecovery = async (formData) => {
        try {
            console.log('🔐 Récupération des paramètres de connexion...');

            const loginData = mapFormDataToLoginData(formData, config?.loginFields);
            const paramUrl = `${getFullUrl()}${config.apis.login}`;

            const params = new URLSearchParams(loginData);
            const fullUrl = `${paramUrl}?${params.toString()}`;

            console.log('🔗 Récupération des infos depuis:', fullUrl);

            const loginResponse = await axios.get(fullUrl);

            console.log('📋 Réponse reçue:', loginResponse.data);

            if (!loginResponse.data || loginResponse.status !== 200) {
                throw new Error('Impossible de récupérer vos informations de connexion');
            }

            let loginInfo = formData.email;
            let password = '';

            if (typeof loginResponse.data === 'object') {
                password = loginResponse.data.motdePasse ||
                    loginResponse.data.password ||
                    loginResponse.data.motDepasse ||
                    loginResponse.data.pass || '';
                loginInfo = loginResponse.data.login ||
                    loginResponse.data.email ||
                    formData.email;
            } else if (typeof loginResponse.data === 'string') {
                password = loginResponse.data;
            }

            if (!password) {
                throw new Error('Mot de passe non trouvé dans la réponse');
            }

            console.log('🔑 Informations récupérées:', { loginInfo, passwordLength: password.length });

            const emailResult = await sendPasswordEmail(formData.email, loginInfo, password);

            if (emailResult.success) {
                return {
                    success: true,
                    message: 'Un email contenant vos identifiants a été envoyé à votre adresse.',
                    data: {
                        emailSent: true,
                        destination: formData.email
                    }
                };
            } else {
                throw new Error('Erreur lors de l\'envoi de l\'email');
            }

        } catch (error) {
            console.error('❌ Erreur récupération mot de passe:', error);
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
                ecoleId: storedData.userData?.schoolId || storedData.completeUserData?.schoolId,
                academicYearId: storedData.academicYearMain?.anneeid || storedData.academicYearMain?.id,
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
    // FONCTIONS POUR LES DONNÉES UTILISATEUR
    // ===========================

    /**
     * Récupère les informations du personnel avec gestion d'erreur individuelle
     */
    const fetchUserPersonnelInfo = async (email, schoolId, profileId) => {
        const results = {
            personnelInfo: null,
            personnelConnecteInfo: null,
            candidatInfo: null
        };

        console.log(`🔄 Récupération des infos personnel: ${email}/${schoolId}/${profileId}`);

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

        try {
            console.log('📞 Appel 3: Infos candidat connecté...');
            const candidatUrl = `${getFullUrl()}connexion/infos-personnel-connecte-candidat/${encodeURIComponent(email)}`;
            console.log('🔗 URL candidat:', candidatUrl);

            const response3 = await axios.get(candidatUrl);
            results.candidatInfo = response3.data;
            console.log('✅ Appel 3 réussi:', results.candidatInfo);
        } catch (error) {
            console.error('❌ Erreur appel 3 (Candidat):', error.message);
        }

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

        if (Object.keys(combinedInfo).length > 0) {
            setUserPersonnelInfo(combinedInfo);
            localStorage.setItem('userPersonnelInfo', JSON.stringify(combinedInfo));
            console.log('💾 Données sauvegardées:', combinedInfo);
        }

        console.log('📊 Résumé des appels:');
        console.log('  - Personnel Info:', results.personnelInfo ? '✅' : '❌');
        console.log('  - Personnel Connecté:', results.personnelConnecteInfo ? '✅' : '❌');
        console.log('  - Candidat Info:', results.candidatInfo ? '✅' : '❌');

        return combinedInfo;
    };

    /**
     * Détermine le profil utilisateur basé sur les données candidat
     */
    const determineCandidatProfile = (candidatInfo, modalType) => {
        if (modalType !== 'candidat' || !candidatInfo) {
            return modalType;
        }

        const libelleFonction = candidatInfo.libelleFonction || candidatInfo.fonction || candidatInfo.role;

        if (libelleFonction) {
            const fonctionNormalisee = libelleFonction.charAt(0).toUpperCase() +
                libelleFonction.slice(1).toLowerCase();

            const candidatProfile = `Candidat-${fonctionNormalisee}`;

            console.log(`👤 Profil candidat déterminé: ${candidatProfile}`);
            console.log(`📋 Basé sur libelleFonction: ${libelleFonction}`);

            return candidatProfile;
        }

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
    const fetchAllUserData__ = async (email, schoolId, profileId) => {
        setLoadingUserData(true);
        setUserDataError(null);

        try {
            console.log('🔄 Début de la récupération des données utilisateur...');

            // 🆕 RÉCUPÉRER LE LIBELLÉ DE L'ÉCOLE
            const selectedSchool = schools.find(school => school.value === schoolId);
            const schoolLabel = selectedSchool ? selectedSchool.label : 'École non trouvée';

            const [personnelInfo, userIdValue, academicYearMain, academicYearInfoData] = await Promise.allSettled([
                fetchUserPersonnelInfo(email, schoolId, profileId),
                fetchUserId(email),
                fetchAcademicYearMain(schoolId),
                fetchAcademicYearInfo(schoolId)
            ]);

            // ... le reste du code reste identique jusqu'à completeUserData ...

            const completeUserData = {
                email,
                schoolId,
                schoolLabel: schoolLabel, // 🆕 Ajout du libellé
                profileId,
                ecoleId: schoolId,
                academicYearId: results.academicYearMain?.anneeid || results.academicYearMain?.id,
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

    /**
 * Récupère toutes les données utilisateur après connexion
 */
    const fetchAllUserData = async (email, schoolId, profileId) => {
        setLoadingUserData(true);
        setUserDataError(null);

        try {
            console.log('🔄 Début de la récupération des données utilisateur...');

            // 🆕 RÉCUPÉRER LE LIBELLÉ DE L'ÉCOLE
            const selectedSchool = schools.find(school => school.value === schoolId);
            const schoolLabel = selectedSchool ? selectedSchool.label : 'École non trouvée';

            // Récupération parallèle avec Promise.allSettled
            const [personnelInfoResult, userIdResult, academicYearMainResult, academicYearInfoResult] = await Promise.allSettled([
                fetchUserPersonnelInfo(email, schoolId, profileId),
                fetchUserId(email),
                fetchAcademicYearMain(schoolId),
                fetchAcademicYearInfo(schoolId)
            ]);

            // ✅ Extraire les valeurs des résultats
            const results = {
                personnelInfo: personnelInfoResult.status === 'fulfilled' ? personnelInfoResult.value : null,
                userId: userIdResult.status === 'fulfilled' ? userIdResult.value : null,
                academicYearMain: academicYearMainResult.status === 'fulfilled' ? academicYearMainResult.value : null,
                academicYearInfo: academicYearInfoResult.status === 'fulfilled' ? academicYearInfoResult.value : null
            };

            console.log('📊 Résultats extraits:', results);

            // Construire l'objet des données complètes
            const completeUserData = {
                email,
                schoolId,
                schoolLabel: schoolLabel,
                profileId,
                ecoleId: schoolId,
                academicYearId: results.academicYearMain?.anneeid || results.academicYearMain?.id,
                periodiciteId: 2,
                userId: results.userId,
                personnelInfo: results.personnelInfo,
                academicYearMain: results.academicYearMain,
                academicYearInfo: results.academicYearInfo,
                loginTime: new Date().toISOString(),
                userType: config.modalType || 'user'
            };

            // Sauvegarder dans localStorage
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
    // FONCTION DE CONNEXION COMPLÈTE
    // ===========================

    const submitLogin = async (formData) => {
        setSubmitError(null);
        setSubmitting(true);

        try {
            // Détecter si c'est une récupération de mot de passe
            const isPasswordRecovery = config?.modalType === 'obtenir-mot-de-passe';

            if (isPasswordRecovery) {
                console.log('🔑 Mode récupération de mot de passe détecté');

                const result = await handlePasswordRecovery(formData);

                // 🆕 Notification de succès pour la récupération
                await Swal.fire({
                    icon: 'success',
                    title: 'Email envoyé !',
                    text: result.message,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#10b981'
                });

                return {
                    success: true,
                    data: result.data,
                    message: result.message,
                    isPasswordRecovery: true
                };
            }

            // LOGIQUE NORMALE DE CONNEXION
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

            // 🆕 VÉRIFIER D'ABORD LES CAS D'ÉCHEC SPÉCIFIQUES
            if (data === "Ce compte a expiré!") {
                await Swal.fire({
                    icon: 'error',
                    title: 'Compte expiré',
                    text: 'Votre compte a expiré. Veuillez contacter l\'administrateur.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#ef4444'
                });

                throw new Error('Ce compte a expiré!');
            }

            // 🆕 VÉRIFIER SI C'EST JUSTE UNE VALIDATION DE MOT DE PASSE (pas une vraie connexion)
            if (data === "Mot de passe correct!") {
                await Swal.fire({
                    icon: 'info',
                    title: 'Mot de passe correct',
                    text: 'Votre mot de passe est correct, mais la connexion complète a échoué.',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3b82f6'
                });

                throw new Error('Mot de passe correct mais connexion incomplète');
            }

            if (data === "Profil ou code école incorrect!") {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Profil ou code école incorrect',
                    text: 'Le profil ou l\'école selectionné incorrect',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#f6953bff'
                });

                throw new Error('Mot de passe correct mais connexion incomplète');
            }

            //

            // ✅ CONDITION DE SUCCÈS (sans les deux cas problématiques)
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
                data === "Educateur" ||
                data === "Directeur des études(DE)"
            );

            if (isSuccess) {
                console.log('✅ Connexion réussie !');
                const profils = {
                    "Directeur des études(DE)": "DE"
                };

                userProfil = profils[data] || data;

                // 🆕 RÉCUPÉRER LE LIBELLÉ DE L'ÉCOLE SÉLECTIONNÉE
                const selectedSchool = schools.find(school => school.value === formData.schoolId);
                const schoolLabel = selectedSchool ? selectedSchool.label : 'École non trouvée';

                console.log(`🏫 École sélectionnée: ${schoolLabel} (ID: ${formData.schoolId})`);

                const basicUserData = {
                    email: formData.email,
                    schoolId: formData.schoolId,
                    schoolLabel: schoolLabel,
                    profileId: formData.profileId,
                    loginTime: new Date().toISOString(),
                    userType: config.modalType || 'user',
                    method: method
                };

                localStorage.setItem('userProfil', userProfil);
                localStorage.setItem('userData', JSON.stringify(basicUserData));
                localStorage.setItem('schoolLabel', schoolLabel);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userType', config.modalType || 'user');

                try {
                    console.log('🔄 Récupération des données utilisateur...');
                    const completeUserData = await fetchAllUserData(
                        formData.email,
                        formData.schoolId,
                        formData.profileId
                    );

                    completeUserData.schoolLabel = schoolLabel;

                    let finalUserProfile = userProfil;

                    if (config.modalType === 'candidat' && completeUserData?.personnelInfo?.candidatDetails) {
                        finalUserProfile = determineCandidatProfile(
                            completeUserData.personnelInfo.candidatDetails,
                            config.modalType
                        );

                        console.log('👤 Profil candidat final déterminé:', finalUserProfile);

                        localStorage.setItem('userProfil', finalUserProfile);
                        localStorage.setItem('candidatProfile', finalUserProfile);

                        completeUserData.candidatProfile = finalUserProfile;
                        completeUserData.userProfile = finalUserProfile;
                    }

                    localStorage.setItem('completeUserData', JSON.stringify(completeUserData));

                    updateFromLoginData({ userCompleteData: completeUserData });

                    // 🆕 NOTIFICATION DE SUCCÈS AVANT LA REDIRECTION
                    await Swal.fire({
                        icon: 'success',
                        title: 'Connexion réussie !',
                        text: `Bienvenue ${finalUserProfile || userProfil}`,
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true
                    });

                    return {
                        success: true,
                        data,
                        userCompleteData: completeUserData,
                        userProfile: finalUserProfile,
                        schoolLabel: schoolLabel,
                        method: method
                    };
                } catch (userDataError) {
                    console.warn('⚠️ Connexion réussie mais erreur lors de la récupération des données utilisateur:', userDataError.message);

                    // 🆕 NOTIFICATION D'AVERTISSEMENT
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Connexion partiellement réussie',
                        text: 'Certaines données n\'ont pas pu être récupérées',
                        confirmButtonText: 'Continuer',
                        confirmButtonColor: '#f59e0b'
                    });

                    return {
                        success: true,
                        data,
                        userCompleteData: null,
                        userProfile: userProfil,
                        schoolLabel: schoolLabel,
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

            // 🆕 NOTIFICATION D'ERREUR
            let errorTitle = 'Erreur de connexion';
            let errorText = error.message || 'Une erreur est survenue';

            if (error.message.includes('CORS') || error.code === 'ERR_NETWORK') {
                errorTitle = 'Erreur réseau';
                errorText = 'Erreur de connexion au serveur. Vérifiez votre connexion.';
                setSubmitError(errorText);
            } else {
                setSubmitError(error.message || 'Erreur de connexion');
            }

            // await Swal.fire({
            //     icon: 'error',
            //     title: errorTitle,
            //     text: errorText,
            //     confirmButtonText: 'Réessayer',
            //     confirmButtonColor: '#ef4444'
            // });

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
        localStorage.removeItem('schoolLabel');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userType');
        localStorage.removeItem('candidatProfile');

        clearUserParams();

        console.log('🧹 Données utilisateur nettoyées');
    };

    const getCurrentCandidatProfile = () => {
        const storedProfile = localStorage.getItem('candidatProfile');
        const storedUserProfil = localStorage.getItem('userProfil');
        return storedProfile || storedUserProfil || 'Candidat';
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
                apis: config.apis,
                modalType: config.modalType
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

        // Fonctions spécifiques
        fetchUserPersonnelInfo,
        fetchUserId,
        fetchAcademicYearMain,
        fetchAcademicYearInfo,
        determineCandidatProfile,
        getCurrentCandidatProfile,

        // Nouvelles fonctions de récupération de mot de passe
        sendPasswordEmail,
        handlePasswordRecovery,

        // Fonctions de gestion dynamique
        mapFormDataToLoginData,
        performLoginRequest,

        // Configuration actuelle
        currentConfig: {
            method: config?.method || 'POST',
            loginFields: config?.loginFields,
            modalType: config?.modalType
        }
    };
};

export default useLoginData;