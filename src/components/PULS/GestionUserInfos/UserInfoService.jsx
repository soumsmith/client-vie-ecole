/**
 * Service pour la gestion de la création et modification des informations utilisateur
 * Contient la logique métier, les appels API et les fonctions utilitaires
 * VERSION COMPLÈTE AVEC CRÉATION ET MODIFICATION
 */

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';
import getFullUrl from "../../hooks/urlUtils";

// ===========================
// CONSTANTES ET CONFIGURATION
// ===========================
export const USER_CONFIG = {
    SEXES: [
        { value: 'MASCULIN', label: 'Masculin' },
        { value: 'FEMININ', label: 'Féminin' }
    ],
    FILE_TYPES: {
        PIECE: 'lien_piece',
        CV: 'lien_cv',
        AUTORISATION: 'lien_autorisation'
    },
    ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    REQUIRED_FIELDS: [
        'nom',
        'prenom',
        'email',
        'contact',
        'sexe',
        'date_naissance',
        'identifiantdomaine_formation',
        'niveau_etudeIdentifiant',
        'fonctionidentifiant'
    ],
    REQUIRED_FIELDS_CREATE: [
        'nom',
        'prenom',
        'email',
        'contact',
        'sexe',
        'date_naissance',
        'identifiantdomaine_formation',
        'niveau_etudeIdentifiant',
        'fonctionidentifiant',
        'login'
    ]
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Valide un email
 */
export const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, message: 'Email requis' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Format email invalide' };
    }

    return { isValid: true, message: '' };
};

/**
 * Valide un numéro de téléphone
 */
export const validatePhone = (phone) => {
    if (!phone) {
        return { isValid: false, message: 'Numéro de contact requis' };
    }

    const phoneRegex = /^[0-9]{8,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
        return { isValid: false, message: 'Format numéro invalide (8-15 chiffres)' };
    }

    return { isValid: true, message: '' };
};

/**
 * Valide une date de naissance
 */
export const validateBirthDate = (date) => {
    if (!date) {
        return { isValid: false, message: 'Date de naissance requise' };
    }

    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 16 || age > 100) {
        return { isValid: false, message: 'Âge doit être entre 16 et 100 ans' };
    }

    return { isValid: true, message: '' };
};

/**
 * Valide un fichier uploadé
 */
export const validateFile = (file) => {
    if (!file) {
        return { isValid: true, message: '' }; // Fichiers optionnels
    }

    if (!(file instanceof File)) {
        return { isValid: false, message: 'Format de fichier invalide' };
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!USER_CONFIG.ALLOWED_FILE_TYPES.includes(fileExtension)) {
        return {
            isValid: false,
            message: `Type de fichier non autorisé. Formats acceptés: ${USER_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`
        };
    }

    if (file.size > USER_CONFIG.MAX_FILE_SIZE) {
        return {
            isValid: false,
            message: 'Fichier trop volumineux (max 5MB)'
        };
    }

    return { isValid: true, message: '' };
};

// ===========================
// FONCTIONS D'API
// ===========================

/**
 * Vérifie la disponibilité d'un login
 */
export const checkLoginAvailabilityAPI = async (login) => {
    try {
        const response = await axios.get(`${getFullUrl()}/connexion/check-pseudo/${login}`);
        // L'API retourne "Login disponible!" si le login est disponible
        return {
            available: response.data.includes('disponible') || response.status === 200,
            message: response.data
        };
    } catch (error) {
        // Si erreur 404 ou autre, considérer comme indisponible
        return {
            available: false,
            message: 'Login déjà utilisé'
        };
    }
};

/**
 * Upload des fichiers vers le serveur
 * @param {Array<File>} files - Tableau de fichiers à uploader
 * @returns {Promise<Array<string>>} - Tableau des noms de fichiers uploadés
 */
export const uploadFilesAPI = async (files) => {
    try {
        const formData = new FormData();

        // Ajouter tous les fichiers au FormData
        files.forEach((file) => {
            formData.append('file', file);
        });

        console.log('Uploading files to:', `${getFullUrl()}/souscription-personnel/files`);

        const response = await axios.post(
            `${getFullUrl()}/souscription-personnel/files`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // 60 secondes pour l'upload de plusieurs fichiers
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                },
            }
        );

        console.log('Upload response:', response.data);

        // L'API devrait retourner les noms des fichiers uploadés
        // Adapter selon la structure de réponse réelle de votre API
        return response.data.fileNames || response.data.files || [];
    } catch (error) {
        console.error('Erreur upload:', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload des fichiers');
    }
};

/**
 * Envoie un email avec les identifiants de connexion
 */
export const sendEmailAPI = async (email, login, password) => {
    try {
        const message = `Vos paramètres de connexion pour la suite du processus : Login: ${login}    Mot de passe:${password}`;
        const objet = 'VOS PARAMETRES DE CONNEXION A POULS-SCOLAIRE';

        const params = new URLSearchParams({
            destinataire: email,
            message: message,
            objet: objet
        });

        console.log('Sending email to:', email);

        const response = await axios.post(
            `${getFullUrl()}/sendEmail?${params.toString()}`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 15000
            }
        );

        console.log('Email sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur envoi email:', error);
        throw new Error('Erreur lors de l\'envoi de l\'email');
    }
};

/**
 * Récupère les informations d'un utilisateur (mode modification)
 */
export const getUserInfoAPI = async (userId, apiUrls) => {
    try {
        const response = await axios.get(apiUrls.personnel.getUserInfos(userId));
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des données');
    }
};

/**
 * Récupère la liste des domaines de formation
 */
export const getDomainesAPI = async (apiUrls) => {
    try {
        const response = await axios.get(apiUrls.domaineFormation.getDomaineFormation());
        return response.data;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des domaines');
    }
};

/**
 * Récupère la liste des niveaux d'étude
 */
export const getNiveauxAPI = async (apiUrls) => {
    try {
        const response = await axios.get(apiUrls.offres.getNiveauxEtude());
        return response.data;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des niveaux d\'étude');
    }
};

/**
 * Récupère la liste des fonctions
 */
export const getFonctionsAPI = async (apiUrls) => {
    try {
        const response = await axios.get(apiUrls.fonctions.getFondateur());
        return response.data;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des fonctions');
    }
};

/**
 * Récupère la liste des types d'autorisation
 */
export const getAutorisationsAPI = async (apiUrls) => {
    try {
        const response = await axios.get(apiUrls.autorisation.getAutorsation());
        return response.data;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des autorisations');
    }
};

/**
 * Crée un nouveau compte utilisateur (POST)
 */
export const createUserAPI = async (userData) => {
    try {
        console.log('=== CREATE USER API CALL ===');
        console.log('Endpoint:', `${getFullUrl()}/souscription-personnel/`);
        console.log('Data sent:', JSON.stringify(userData, null, 2));

        const response = await axios.post(
            `${getFullUrl()}/souscription-personnel/`,
            userData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 15000
            }
        );

        console.log('Create API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Create API Error:', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la création du compte');
    }
};

/**
 * Met à jour les informations utilisateur (PUT)
 */
export const updateUserInfoAPI = async (userData, apiUrls) => {
    try {
        console.log('=== UPDATE USER API CALL ===');
        console.log('Endpoint:', apiUrls.souscriptions.souscriptionPersonnel());
        console.log('Data sent:', JSON.stringify(userData, null, 2));

        const response = await axios.put(
            apiUrls.souscriptions.souscriptionPersonnel(),
            userData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 15000
            }
        );

        console.log('Update API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Update API Error:', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
};

/**
 * Formate les données pour la création (POST)
 */
export const formatDataForCreate = (formData, uploadedFileNames, password) => {
    return {
        sous_attent_personnid: null,
        sous_attent_personn_nom: formData.nom,
        sous_attent_personn_prenom: formData.prenom,
        sous_attent_personn_email: formData.email,
        sous_attent_personn_login: formData.login,
        sous_attent_personn_sexe: formData.sexe,
        sous_attent_personn_diplome_recent: formData.diplome_recent || "",
        sous_attent_personn_date_naissance: formData.date_naissance,
        sous_attent_personn_nbre_annee_experience: parseInt(formData.nbre_annee_experience) || 0,
        sous_attent_personn_lien_cv: uploadedFileNames[0] || "",
        niveau_etudeIdentifiant: parseInt(formData.niveau_etudeIdentifiant) || null,
        sous_attent_personncode: "",
        identifiantdomaine_formation: parseInt(formData.identifiantdomaine_formation) || null,
        fonctionidentifiant: parseInt(formData.fonctionidentifiant) || null,
        type_autorisation_idtype_autorisationid: formData.type_autorisation_id ? parseInt(formData.type_autorisation_id) : null,
        sous_attent_personn_password: password,
        sous_attent_personn_donnee: null,
        sous_attent_personn_contact: formData.contact,
        sous_attent_personn_lien_piece: uploadedFileNames[1] || "",
        sous_attent_personn_lien_autorisation: uploadedFileNames[2] || ""
    };
};

/**
 * Formate les données pour la modification (PUT)
 */
export const formatDataForUpdate = (formData, userId, uploadedFileNames, selectLists) => {
    const selectedDomaine = selectLists.domaines?.find(d => d.domaine_formationid == formData.identifiantdomaine_formation);
    const selectedNiveau = selectLists.niveaux?.find(n => n.niveau_etudeid == formData.niveau_etudeIdentifiant);
    const selectedFonction = selectLists.fonctions?.find(f => f.fonctionid == formData.fonctionidentifiant);

    return {
        sous_attent_personnid: userId.toString(),
        sous_attent_personn_nom: formData.nom,
        sous_attent_personn_prenom: formData.prenom,
        sous_attent_personn_email: formData.email,
        sous_attent_personn_sexe: formData.sexe,
        sous_attent_personn_diplome_recent: formData.diplome_recent || "",
        sous_attent_personn_date_naissance: formData.date_naissance,
        sous_attent_personn_nbre_annee_experience: parseInt(formData.nbre_annee_experience) || 0,
        sous_attent_personn_contact: formData.contact,

        sous_attent_personn_lien_cv: uploadedFileNames[0] || formData.lien_cv || "",
        sous_attent_personn_lien_piece: uploadedFileNames[1] || formData.lien_piece || "",
        sous_attent_personn_lien_autorisation: uploadedFileNames[2] || formData.lien_autorisation || "",

        niveau_etudeIdentifiant: parseInt(formData.niveau_etudeIdentifiant) || null,
        identifiantdomaine_formation: parseInt(formData.identifiantdomaine_formation) || null,
        fonctionidentifiant: parseInt(formData.fonctionidentifiant) || null,
        type_autorisation_idtype_autorisationid: formData.type_autorisation_id ? parseInt(formData.type_autorisation_id) : null,

        sous_attent_personncode: "",
        domaine_formation: {
            domaine_formationid: selectedDomaine?.domaine_formationid || null,
            domaine_formation_code: selectedDomaine?.domaine_formation_code || "",
            domaine_formation_libelle: selectedDomaine?.domaine_formation_libelle || ""
        },
        fonction: {
            fonctionid: selectedFonction?.fonctionid || null,
            fonctioncode: selectedFonction?.fonctioncode || "",
            fonctionlibelle: selectedFonction?.fonctionlibelle || ""
        },
        niveau_etude: {
            niveau_etudeid: selectedNiveau?.niveau_etudeid || null,
            niveau_etude_code: selectedNiveau?.niveau_etude_code || "",
            niveau_etude_libelle: selectedNiveau?.niveau_etude_libelle || ""
        },
        sous_attent_personn_login: "",
        sous_attent_personn_password: "",
        sous_attent_personn_donnee: null
    };
};

// ===========================
// HOOK PERSONNALISÉ
// ===========================

/**
 * Hook personnalisé pour gérer les informations utilisateur
 * @param {number} userId - ID de l'utilisateur (null en mode création)
 * @param {string} mode - 'create' ou 'edit'
 */
export const useUserInfoForm = (userId, mode = 'edit') => {
    const apiUrls = useAllApiUrls();
    const isCreateMode = mode === 'create';

    // États du formulaire
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        contact: '',
        sexe: 'MASCULIN',
        date_naissance: '',
        diplome_recent: '',
        nbre_annee_experience: 0,
        identifiantdomaine_formation: '',
        niveau_etudeIdentifiant: '',
        fonctionidentifiant: '',
        type_autorisation_id: '',
        lien_piece: '',
        lien_cv: '',
        lien_autorisation: '',
        login: '' // Uniquement pour la création
    });

    // États de validation
    const [validation, setValidation] = useState({});

    // États des listes de sélection
    const [selectLists, setSelectLists] = useState({
        domaines: [],
        niveaux: [],
        fonctions: [],
        autorisations: []
    });

    // États des fichiers
    const [uploadedFiles, setUploadedFiles] = useState({
        lien_piece: null,
        lien_cv: null,
        lien_autorisation: null
    });

    // État pour la vérification du login (mode création)
    const [loginCheckStatus, setLoginCheckStatus] = useState({
        checked: false,
        available: false
    });

    // États d'interface
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(!isCreateMode);

    // Chargement initial des données
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                if (isCreateMode) {
                    // Mode création : charger uniquement les listes de référence
                    const [domaines, niveaux, fonctions, autorisations] = await Promise.all([
                        getDomainesAPI(apiUrls),
                        getNiveauxAPI(apiUrls),
                        getFonctionsAPI(apiUrls),
                        getAutorisationsAPI(apiUrls)
                    ]);

                    setSelectLists({
                        domaines,
                        niveaux,
                        fonctions,
                        autorisations
                    });
                } else {
                    // Mode modification : charger les données utilisateur et les listes
                    const [userData, domaines, niveaux, fonctions, autorisations] = await Promise.all([
                        getUserInfoAPI(userId, apiUrls),
                        getDomainesAPI(apiUrls),
                        getNiveauxAPI(apiUrls),
                        getFonctionsAPI(apiUrls),
                        getAutorisationsAPI(apiUrls)
                    ]);

                    setFormData({
                        nom: userData.sous_attent_personn_nom || '',
                        prenom: userData.sous_attent_personn_prenom || '',
                        email: userData.sous_attent_personn_email || '',
                        contact: userData.sous_attent_personn_contact || '',
                        sexe: userData.sous_attent_personn_sexe || 'MASCULIN',
                        date_naissance: userData.sous_attent_personn_date_naissance?.split('T')[0] || '',
                        diplome_recent: userData.sous_attent_personn_diplome_recent || '',
                        nbre_annee_experience: userData.sous_attent_personn_nbre_annee_experience || 0,
                        identifiantdomaine_formation: userData.domaine_formation?.domaine_formationid || '',
                        niveau_etudeIdentifiant: userData.niveau_etude?.niveau_etudeid || '',
                        fonctionidentifiant: userData.fonction?.fonctionid || '',
                        type_autorisation_id: '',
                        lien_piece: userData.sous_attent_personn_lien_piece || '',
                        lien_cv: userData.sous_attent_personn_lien_cv || '',
                        lien_autorisation: userData.sous_attent_personn_lien_autorisation || '',
                        login: ''
                    });

                    setSelectLists({
                        domaines,
                        niveaux,
                        fonctions,
                        autorisations
                    });
                }
            } catch (error) {
                console.error('Erreur lors du chargement initial:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        loadInitialData();
    }, [userId, apiUrls, isCreateMode]);

    // Vérifier la disponibilité du login
    const checkLoginAvailability = useCallback(async (login) => {
        try {
            const result = await checkLoginAvailabilityAPI(login);
            setLoginCheckStatus({
                checked: true,
                available: result.available
            });
            return result;
        } catch (error) {
            setLoginCheckStatus({
                checked: true,
                available: false
            });
            return { available: false, message: 'Erreur lors de la vérification' };
        }
    }, []);

    // Gestion des changements de champs
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Réinitialiser le statut de vérification du login si le login change
        if (field === 'login' && isCreateMode) {
            setLoginCheckStatus({
                checked: false,
                available: false
            });
        }

        // Validation en temps réel
        let fieldValidation = { isValid: true, message: '' };

        switch (field) {
            case 'email':
                fieldValidation = validateEmail(value);
                break;
            case 'contact':
                fieldValidation = validatePhone(value);
                break;
            case 'date_naissance':
                fieldValidation = validateBirthDate(value);
                break;
            case 'login':
                if (isCreateMode && (!value || value.trim().length < 3)) {
                    fieldValidation = { isValid: false, message: 'Le login doit contenir au moins 3 caractères' };
                }
                break;
            default:
                const requiredFields = isCreateMode ? USER_CONFIG.REQUIRED_FIELDS_CREATE : USER_CONFIG.REQUIRED_FIELDS;
                if (requiredFields.includes(field) && !value) {
                    fieldValidation = { isValid: false, message: 'Ce champ est requis' };
                }
        }

        setValidation(prev => ({
            ...prev,
            [field]: fieldValidation
        }));
    }, [isCreateMode]);

    // Gestion des fichiers
    const handleFileChange = useCallback((field, file) => {
        const fileValidation = validateFile(file);

        if (fileValidation.isValid && file) {
            setUploadedFiles(prev => ({
                ...prev,
                [field]: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file,
                    lastModified: file.lastModified
                }
            }));
        }

        setValidation(prev => ({
            ...prev,
            [field]: fileValidation
        }));
    }, []);

    // Supprimer un fichier
    const removeFile = useCallback((field) => {
        setUploadedFiles(prev => ({
            ...prev,
            [field]: null
        }));

        setValidation(prev => {
            const newValidation = { ...prev };
            delete newValidation[field];
            return newValidation;
        });
    }, []);

    // Upload de tous les fichiers
    const uploadAllFiles = useCallback(async () => {
        const filesToUpload = [];
        const fileFields = ['lien_cv', 'lien_piece', 'lien_autorisation'];

        // Collecter tous les fichiers à uploader dans l'ordre
        fileFields.forEach(field => {
            if (uploadedFiles[field] && uploadedFiles[field].file) {
                filesToUpload.push(uploadedFiles[field].file);
            }
        });

        if (filesToUpload.length === 0) {
            return [];
        }

        try {
            const uploadedFileNames = await uploadFilesAPI(filesToUpload);
            console.log('Files uploaded successfully:', uploadedFileNames);
            return uploadedFileNames;
        } catch (error) {
            console.error('Error uploading files:', error);
            throw new Error('Erreur lors de l\'upload des fichiers');
        }
    }, [uploadedFiles]);

    // Validation complète du formulaire
    const validateForm = useCallback(() => {
        const newValidation = {};
        let isValid = true;

        const requiredFields = isCreateMode ? USER_CONFIG.REQUIRED_FIELDS_CREATE : USER_CONFIG.REQUIRED_FIELDS;

        requiredFields.forEach(field => {
            const value = formData[field];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                newValidation[field] = { isValid: false, message: 'Ce champ est requis' };
                isValid = false;
            }
        });

        // Validations spécifiques
        const emailValidation = validateEmail(formData.email);
        const phoneValidation = validatePhone(formData.contact);
        const dateValidation = validateBirthDate(formData.date_naissance);

        if (!emailValidation.isValid) {
            newValidation.email = emailValidation;
            isValid = false;
        }
        if (!phoneValidation.isValid) {
            newValidation.contact = phoneValidation;
            isValid = false;
        }
        if (!dateValidation.isValid) {
            newValidation.date_naissance = dateValidation;
            isValid = false;
        }

        setValidation(newValidation);
        return isValid;
    }, [formData, isCreateMode]);

    // Soumission du formulaire
    const handleSubmit = useCallback(async (password = null) => {
        if (!validateForm()) {
            return { success: false, error: 'Veuillez corriger les erreurs dans le formulaire' };
        }

        setLoading(true);

        try {
            // 1. Uploader les fichiers
            console.log('Uploading files...');
            const uploadedFileNames = await uploadAllFiles();
            console.log('Files uploaded:', uploadedFileNames);

            let result;

            if (isCreateMode) {
                // MODE CRÉATION
                // 2. Formater les données pour la création
                const formattedData = formatDataForCreate(formData, uploadedFileNames, password);
                console.log('Creating user with data:', formattedData);

                // 3. Créer le compte
                result = await createUserAPI(formattedData);
                console.log('User created:', result);

                // 4. Envoyer l'email avec les identifiants
                try {
                    await sendEmailAPI(formData.email, formData.login, password);
                    console.log('Email sent successfully');
                } catch (emailError) {
                    console.error('Error sending email:', emailError);
                    // Ne pas bloquer si l'email échoue
                }
            } else {
                // MODE MODIFICATION
                // 2. Formater les données pour la modification
                const formattedData = formatDataForUpdate(formData, userId, uploadedFileNames, selectLists);
                console.log('Updating user with data:', formattedData);

                // 3. Mettre à jour le compte
                result = await updateUserInfoAPI(formattedData, apiUrls);
                console.log('User updated:', result);
            }

            return { success: true };
        } catch (error) {
            console.error('Error during submission:', error);
            return {
                success: false,
                error: error.message || (isCreateMode ? 'Erreur lors de la création' : 'Erreur lors de la mise à jour')
            };
        } finally {
            setLoading(false);
        }
    }, [formData, userId, validateForm, uploadAllFiles, isCreateMode, selectLists, apiUrls]);

    return {
        formData,
        validation,
        selectLists,
        loading,
        initialLoading,
        uploadedFiles,
        loginCheckStatus,
        handleInputChange,
        handleFileChange,
        handleSubmit,
        removeFile,
        checkLoginAvailability
    };
};

// ===========================
// CONSTANTES POUR L'UI
// ===========================
export const UI_CONFIG = {
    FORM_LABELS: {
        EMAIL: 'Email*',
        NOM: 'Nom*',
        PRENOM: 'Prénom*',
        CONTACT: 'Contact*',
        SEXE: 'Sexe*',
        DATE_NAISSANCE: 'Date de naissance*(dd/mm/yyyy)',
        DIPLOME: 'Diplôme récent',
        EXPERIENCE: 'Nombre d\'année d\'expérience*',
        DOMAINE: 'Domaine de formation*',
        NIVEAU: 'Niveau d\'étude*',
        FONCTION: 'Fonction*',
        AUTORISATION: 'Type autorisation',
        PIECE: 'Charger votre pièce*',
        CV: 'Charger votre cv*',
        AUTORISATION_FILE: 'Charger l\'autorisation d\'enseigner'
    },
    PLACEHOLDERS: {
        EMAIL: 'Saisissez votre email',
        NOM: 'Saisissez votre nom',
        PRENOM: 'Saisissez votre prénom',
        CONTACT: 'Saisissez votre numéro',
        DIPLOME: 'Saisissez votre diplôme le plus récent',
        EXPERIENCE: 'Nombre d\'années'
    }
};