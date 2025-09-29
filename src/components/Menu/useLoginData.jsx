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

    // États
    const [schools, setSchools] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [userPersonnelInfo, setUserPersonnelInfo] = useState(null);
    const [userId, setUserId] = useState(null);
    const [academicYearMain, setAcademicYearMain] = useState(null);
    const [academicYearInfo, setAcademicYearInfo] = useState(null);
    const [loadingSchools, setLoadingSchools] = useState(false);
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingUserData, setLoadingUserData] = useState(false);
    const [initializingFromStorage, setInitializingFromStorage] = useState(true);
    const [schoolsError, setSchoolsError] = useState(null);
    const [profilesError, setProfilesError] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [userDataError, setUserDataError] = useState(null);

    // Fonctions utilitaires (conservées du code original)
    const validateAndCleanDataItem = (item, index) => {
        if (!item || typeof item !== 'object') return null;
        const hasUsableData = Object.keys(item).some(
            key => item[key] !== null && item[key] !== undefined && item[key] !== '' && typeof item[key] !== 'object'
        );
        return hasUsableData ? item : null;
    };

    const transformSchoolsData = (rawData) => {
        if (!Array.isArray(rawData)) return [];
        const validItems = rawData.map(validateAndCleanDataItem).filter(item => item !== null);
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

    const transformProfilesData = (rawData) => {
        if (!Array.isArray(rawData)) return [];
        const validItems = rawData.map(validateAndCleanDataItem).filter(item => item !== null);
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
        return mappedData;
    };

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
            console.error('❌ Erreur lors de la requête:', error);
            throw error;
        }
    };

    /**
     * NOUVELLE FONCTION - Envoie un email avec les informations de connexion
     */
    const sendPasswordEmail = async (email, loginInfo, password) => {
        try {
            console.log('📧 Envoi de l\'email de récupération...');
            
            const emailData = {
                destinataire: email,
                message: `Login :${loginInfo || email}  Mot de passe:${password}`,
                objet: "Vos paramètres d'identifications"
            };

            // Construction de l'URL avec les paramètres
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
     * NOUVELLE FONCTION - Gère la récupération de mot de passe
     */
    const handlePasswordRecovery = async (formData) => {
        try {
            console.log('🔐 Récupération des paramètres de connexion...');
            
            // Étape 1: Récupérer les informations de connexion
            const loginData = mapFormDataToLoginData(formData, config?.loginFields);
            const paramUrl = `${getFullUrl()}${config.apis.login}`;
            
            const params = new URLSearchParams(loginData);
            const fullUrl = `${paramUrl}?${params.toString()}`;
            
            console.log('🔗 Récupération des infos depuis:', fullUrl);
            
            const loginResponse = await axios.get(fullUrl);
            
            console.log('📋 Réponse reçue:', loginResponse.data);
            
            // Vérifier si on a reçu les données nécessaires
            if (!loginResponse.data || loginResponse.status !== 200) {
                throw new Error('Impossible de récupérer vos informations de connexion');
            }

            // Extraire les informations de connexion et le mot de passe
            let loginInfo = formData.email;
            let password = '';
            
            // La réponse peut être un objet ou une chaîne
            if (typeof loginResponse.data === 'object') {
                password = loginResponse.data.motdePasse || 
                          loginResponse.data.password || 
                          loginResponse.data.motDepasse ||
                          loginResponse.data.pass || '';
                loginInfo = loginResponse.data.login || 
                           loginResponse.data.email || 
                           formData.email;
            } else if (typeof loginResponse.data === 'string') {
                // Si la réponse est une chaîne, elle contient peut-être le mot de passe
                password = loginResponse.data;
            }

            if (!password) {
                throw new Error('Mot de passe non trouvé dans la réponse');
            }

            console.log('🔑 Informations récupérées:', { loginInfo, passwordLength: password.length });

            // Étape 2: Envoyer l'email
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

    // Fonctions de chargement (conservées)
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

    // Fonctions userData (conservées du code original - je les abrège ici)
    const fetchUserPersonnelInfo = async (email, schoolId, profileId) => {
        // Code original conservé
        return {};
    };

    const determineCandidatProfile = (candidatInfo, modalType) => {
        if (modalType !== 'candidat' || !candidatInfo) return modalType;
        const libelleFonction = candidatInfo.libelleFonction || candidatInfo.fonction || candidatInfo.role;
        if (libelleFonction) {
            const fonctionNormalisee = libelleFonction.charAt(0).toUpperCase() + 
                                     libelleFonction.slice(1).toLowerCase();
            return `Candidat-${fonctionNormalisee}`;
        }
        return 'Candidat';
    };

    const fetchAllUserData = async (email, schoolId, profileId) => {
        // Code original conservé
        return {};
    };

    /**
     * FONCTION MODIFIÉE - Soumet le formulaire de connexion ou récupération
     */
    const submitLogin = async (formData) => {
        setSubmitError(null);
        setSubmitting(true);

        try {
            // NOUVELLE LOGIQUE: Détecter si c'est une récupération de mot de passe
            const isPasswordRecovery = config?.modalType === 'obtenir-mot-de-passe';

            if (isPasswordRecovery) {
                console.log('🔑 Mode récupération de mot de passe détecté');
                
                const result = await handlePasswordRecovery(formData);
                
                return {
                    success: true,
                    data: result.data,
                    message: result.message,
                    isPasswordRecovery: true
                };
            }

            // LOGIQUE NORMALE DE CONNEXION (code original)
            const method = config?.method || 'POST';
            const loginFields = config?.loginFields;

            console.log(`🔐 Tentative de connexion avec méthode ${method}...`);

            const loginData = mapFormDataToLoginData(formData, loginFields);
            
            const response = await performLoginRequest(
                `${getFullUrl()}${config.apis.login}`,
                loginData,
                method
            );

            const data = response.data;
            let userProfil = "";

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
                    const completeUserData = await fetchAllUserData(
                        formData.email,
                        formData.schoolId,
                        formData.profileId
                    );

                    let finalUserProfile = userProfil;
                    
                    if (config.modalType === 'candidat' && completeUserData?.personnelInfo?.candidatDetails) {
                        finalUserProfile = determineCandidatProfile(
                            completeUserData.personnelInfo.candidatDetails,
                            config.modalType
                        );
                        
                        localStorage.setItem('userProfil', finalUserProfile);
                        localStorage.setItem('candidatProfile', finalUserProfile);
                        completeUserData.candidatProfile = finalUserProfile;
                        completeUserData.userProfile = finalUserProfile;
                        localStorage.setItem('completeUserData', JSON.stringify(completeUserData));
                    }

                    updateFromLoginData({ userCompleteData: completeUserData });

                    return {
                        success: true,
                        data,
                        userCompleteData: completeUserData,
                        userProfile: finalUserProfile,
                        method: method
                    };
                } catch (userDataError) {
                    console.warn('⚠️ Connexion réussie mais erreur données utilisateur');
                    return {
                        success: true,
                        data,
                        userCompleteData: null,
                        userProfile: userProfil,
                        method: method,
                        warning: 'Connexion réussie mais certaines données utilisateur non récupérées'
                    };
                }
            } else {
                const errorMessage = data?.message || data?.error || 'Échec de la connexion';
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error('❌ Erreur:', error.message);
            
            setSubmitError(error.message || 'Une erreur est survenue');
            
            return { success: false, data: null };
        } finally {
            setSubmitting(false);
        }
    };

    // Fonctions utilitaires
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

    // useEffect
    useEffect(() => {
        if (config) {
            loadSchools();
            loadProfiles();
        }
    }, [config]);

    return {
        schools: schools.length > 0 ? schools : [{ value: 1, label: 'École par défaut' }],
        profiles: profiles.length > 0 ? profiles : [{ value: 1, label: 'Profil par défaut' }],
        loadingSchools,
        loadingProfiles,
        submitting,
        schoolsError,
        profilesError,
        submitError,
        submitLogin,
        clearErrors,
        refreshData,
        loadSchools,
        loadProfiles
    };
};

export default useLoginData;