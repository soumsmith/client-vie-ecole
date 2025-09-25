/**
 * Service pour la gestion de la modification des informations utilisateur
 * Contient la logique métier, les appels API et les fonctions utilitaires
 * VERSION CORRIGÉE AVEC GESTION D'UPLOAD
 */

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';

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
    ]
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {object} - { isValid: boolean, message: string }
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
 * @param {string} phone - Numéro à valider
 * @returns {object} - { isValid: boolean, message: string }
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
 * @param {string} date - Date à valider (YYYY-MM-DD)
 * @returns {object} - { isValid: boolean, message: string }
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
 * Valide un fichier uploadé - VERSION CORRIGÉE
 * @param {File} file - Fichier à valider
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateFile = (file) => {
    if (!file) {
        return { isValid: true, message: '' }; // Fichiers optionnels
    }

    // Vérifier que c'est bien un objet File
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

/**
 * Upload un fichier vers le serveur - VERSION AMÉLIORÉE
 * @param {File} file - Fichier à uploader
 * @param {string} endpoint - Endpoint d'upload
 * @returns {Promise<string>} - Nom du fichier uploadé
 */
export const uploadFileToServer = async (file, endpoint) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Ajouter des métadonnées utiles
        formData.append('originalName', file.name);
        formData.append('size', file.size.toString());
        formData.append('type', file.type);

        console.log('Uploading to:', endpoint);
        console.log('File details:', { name: file.name, size: file.size, type: file.type });

        const response = await axios.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 secondes timeout
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload progress: ${percentCompleted}%`);
            },
        });

        console.log('Upload response:', response.data);

        // Retourner le nom du fichier selon la réponse du serveur
        return response.data.fileName || response.data.filename || response.data.name || file.name;
    } catch (error) {
        console.error('Erreur upload:', error);
        
        if (error.code === 'ECONNABORTED') {
            throw new Error('Timeout lors de l\'upload du fichier');
        } else if (error.response?.status === 413) {
            throw new Error('Fichier trop volumineux pour le serveur');
        } else if (error.response?.status === 415) {
            throw new Error('Type de fichier non supporté par le serveur');
        } else {
            throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload du fichier');
        }
    }
};

/**
 * Convertit un fichier en base64 - ALTERNATIVE LOCALE
 * @param {File} file - Fichier à convertir
 * @returns {Promise<string>} - Fichier en base64
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

/**
 * Formate les données pour l'API - VERSION CORRIGÉE AVEC OBJETS PEUPLÉS
 * @param {object} formData - Données du formulaire
 * @param {number} userId - ID de l'utilisateur  
 * @param {object} uploadedFileNames - Noms des fichiers uploadés
 * @param {object} selectLists - Listes de référence (domaines, niveaux, fonctions)
 * @returns {object} - Données formatées pour l'API
 */
export const formatDataForAPI = (formData, userId, uploadedFileNames = {}, selectLists = {}) => {
    // Rechercher les objets correspondants dans les listes de référence
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
        
        // CORRECTION: Seulement les noms des fichiers, pas les données base64
        sous_attent_personn_lien_cv: uploadedFileNames.lien_cv || "",
        sous_attent_personn_lien_piece: uploadedFileNames.lien_piece || "",  
        sous_attent_personn_lien_autorisation: uploadedFileNames.lien_autorisation || "",
        
        // CORRECTION: Valeurs numériques uniquement
        niveau_etudeIdentifiant: parseInt(formData.niveau_etudeIdentifiant) || null,
        identifiantdomaine_formation: parseInt(formData.identifiantdomaine_formation) || null,
        fonctionidentifiant: parseInt(formData.fonctionidentifiant) || null,
        type_autorisation_idtype_autorisationid: formData.type_autorisation_id ? parseInt(formData.type_autorisation_id) : null,

        // CORRECTION: Objets peuplés avec les vraies données des sélections
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
// FONCTIONS D'API
// ===========================

/**
 * Récupère les informations d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {object} apiUrls - URLs d'API
 * @returns {Promise<object>} - Données utilisateur
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
 * @param {object} apiUrls - URLs d'API
 * @returns {Promise<Array>} - Liste des domaines
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
 * @param {object} apiUrls - URLs d'API
 * @returns {Promise<Array>} - Liste des niveaux
 */
export const getNiveauxAPI = async (apiUrls) => {
    try {
        const response = await axios.get(`${apiUrls.offres.getNiveauxEtude()}`);
        return response.data;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des niveaux d\'étude');
    }
};

/**
 * Récupère la liste des fonctions
 * @param {object} apiUrls - URLs d'API
 * @returns {Promise<Array>} - Liste des fonctions
 */
export const getFonctionsAPI = async (apiUrls) => {
    try {
        const response = await axios.get(`${apiUrls.fonctions.getFondateur()}`);
        return response.data;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des fonctions');
    }
};

/**
 * Récupère la liste des types d'autorisation
 * @param {object} apiUrls - URLs d'API
 * @returns {Promise<Array>} - Liste des autorisations
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
 * Met à jour les informations utilisateur - AVEC DEBUG
 * @param {object} userData - Données utilisateur formatées
 * @param {object} apiUrls - URLs d'API
 * @returns {Promise<object>} - Réponse API
 */
export const updateUserInfoAPI = async (userData, apiUrls) => {
    try {
        // DEBUG: Afficher les données exactes envoyées
        console.log('=== DEBUG API CALL ===');
        console.log('Endpoint:', `${apiUrls.souscriptions.souscriptionPersonnel()}`);
        console.log('Data sent:', JSON.stringify(userData, null, 2));
        console.log('Data size:', JSON.stringify(userData).length, 'characters');
        console.log('====================');

        const response = await axios.put(`${apiUrls.souscriptions.souscriptionPersonnel()}`, userData, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 15000 // 15 secondes
        });

        console.log('API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error Details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        // Messages d'erreur plus précis
        if (error.response?.status === 400) {
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               'Données invalides';
            throw new Error(`Erreur 400: ${errorMessage}`);
        } else if (error.response?.status === 422) {
            throw new Error('Erreur de validation des données');
        } else if (error.response?.status === 500) {
            throw new Error('Erreur serveur interne');
        } else {
            throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        }
    }
};

// ===========================
// HOOK PERSONNALISÉ - VERSION CORRIGÉE
// ===========================

/**
 * Hook personnalisé pour gérer les informations utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {object} - État et fonctions de gestion
 */
export const useUserInfoForm = (userId) => {
    const apiUrls = useAllApiUrls();

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
        lien_autorisation: ''
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

    // États des fichiers - NOUVEAU
    const [uploadedFiles, setUploadedFiles] = useState({
        lien_piece: null,
        lien_cv: null,
        lien_autorisation: null
    });

    // États des URLs des fichiers uploadés - NOUVEAU
    const [uploadedFileUrls, setUploadedFileUrls] = useState({
        lien_piece: '',
        lien_cv: '',
        lien_autorisation: ''
    });

    // États d'interface
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Chargement initial des données
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [userData, domaines, niveaux, fonctions, autorisations] = await Promise.all([
                    getUserInfoAPI(userId, apiUrls),
                    getDomainesAPI(apiUrls),
                    getNiveauxAPI(apiUrls),
                    getFonctionsAPI(apiUrls),
                    getAutorisationsAPI(apiUrls)
                ]);

                // Mise à jour des données du formulaire
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
                    lien_autorisation: userData.sous_attent_personn_lien_autorisation || ''
                });

                // Initialiser les URLs des fichiers existants
                setUploadedFileUrls({
                    lien_piece: userData.sous_attent_personn_lien_piece || '',
                    lien_cv: userData.sous_attent_personn_lien_cv || '',
                    lien_autorisation: userData.sous_attent_personn_lien_autorisation || ''
                });

                // Mise à jour des listes de sélection
                setSelectLists({
                    domaines,
                    niveaux,
                    fonctions,
                    autorisations
                });

            } catch (error) {
                console.error('Erreur lors du chargement initial:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        if (userId) {
            loadInitialData();
        }
    }, [userId, apiUrls]);

    // Gestion des changements de champs
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

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
            default:
                if (USER_CONFIG.REQUIRED_FIELDS.includes(field) && !value) {
                    fieldValidation = { isValid: false, message: 'Ce champ est requis' };
                }
        }

        setValidation(prev => ({
            ...prev,
            [field]: fieldValidation
        }));
    }, []);

    // Gestion des fichiers - VERSION CORRIGÉE
    const handleFileChange = useCallback((field, file) => {
        console.log('handleFileChange called:', { field, file });

        const fileValidation = validateFile(file);

        if (fileValidation.isValid && file) {
            // Stocker le fichier pour upload ultérieur
            setUploadedFiles(prev => ({
                ...prev,
                [field]: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file, // Garder référence au fichier original
                    lastModified: file.lastModified
                }
            }));

            // Créer une URL temporaire pour prévisualisation si c'est une image
            if (file.type.startsWith('image/')) {
                const previewUrl = URL.createObjectURL(file);
                setUploadedFileUrls(prev => ({
                    ...prev,
                    [field]: previewUrl
                }));
            }

            console.log('File stored successfully:', file.name);
        } else {
            console.error('File validation failed:', fileValidation);
        }

        setValidation(prev => ({
            ...prev,
            [field]: fileValidation
        }));
    }, []);

    // Fonction pour supprimer un fichier - NOUVEAU
    const removeFile = useCallback((field) => {
        setUploadedFiles(prev => ({
            ...prev,
            [field]: null
        }));

        // Nettoyer l'URL temporaire si elle existe
        if (uploadedFileUrls[field] && uploadedFileUrls[field].startsWith('blob:')) {
            URL.revokeObjectURL(uploadedFileUrls[field]);
        }

        setUploadedFileUrls(prev => ({
            ...prev,
            [field]: ''
        }));

        // Nettoyer la validation
        setValidation(prev => {
            const newValidation = { ...prev };
            delete newValidation[field];
            return newValidation;
        });
    }, [uploadedFileUrls]);

    // Fonction pour uploader tous les fichiers - VERSION CORRIGÉE
    const uploadAllFiles = useCallback(async (apiUrls) => {
        const uploadedFileNames = {};

        for (const [field, fileData] of Object.entries(uploadedFiles)) {
            if (fileData && fileData.file) {
                console.log(`Uploading ${field}:`, fileData.name);
                
                try {
                    // OPTION 1: Upload réel vers serveur (recommandé)
                    if (apiUrls.upload) {
                        const uploadEndpoint = `${apiUrls.upload}/files`;
                        const serverFileName = await uploadFileToServer(fileData.file, uploadEndpoint);
                        uploadedFileNames[field] = serverFileName;
                    } else {
                        // OPTION 2: Simulation - utiliser le nom original du fichier
                        // En attendant la configuration de l'endpoint d'upload
                        uploadedFileNames[field] = fileData.name;
                        
                        // Vous devrez implémenter l'upload réel ici
                        console.warn(`Upload simulation pour ${field}. Configurez apiUrls.upload pour un upload réel.`);
                    }
                    
                    console.log(`${field} uploaded successfully:`, uploadedFileNames[field]);
                } catch (error) {
                    console.error(`Erreur upload ${field}:`, error);
                    throw new Error(`Erreur lors de l'upload du fichier ${field}: ${error.message}`);
                }
            }
        }

        return uploadedFileNames;
    }, [uploadedFiles]);

    // Validation complète du formulaire
    const validateForm = useCallback(() => {
        const newValidation = {};
        let isValid = true;

        USER_CONFIG.REQUIRED_FIELDS.forEach(field => {
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

        // Validation des fichiers
        Object.entries(uploadedFiles).forEach(([field, fileData]) => {
            if (fileData) {
                const fileValidation = validateFile(fileData.file);
                if (!fileValidation.isValid) {
                    newValidation[field] = fileValidation;
                    isValid = false;
                }
            }
        });

        setValidation(newValidation);
        return isValid;
    }, [formData, uploadedFiles]);

    // Soumission du formulaire - VERSION CORRIGÉE
    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            return { success: false, error: 'Veuillez corriger les erreurs dans le formulaire' };
        }

        setLoading(true);

        try {
            // 1. Uploader tous les fichiers en premier (si il y en a)
            console.log('Processing file uploads...');
            const uploadedFileNames = await uploadAllFiles(apiUrls);
            console.log('Files processed:', uploadedFileNames);

            // 2. Formater les données avec les noms des fichiers
            const formattedData = formatDataForAPI(formData, userId, uploadedFileNames);
            console.log('Formatted data for API:', formattedData);

            // 3. Envoyer les données à l'API
            const result = await updateUserInfoAPI(formattedData, apiUrls);
            console.log('API Response:', result);

            return { success: true };
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            return {
                success: false,
                error: error.message || 'Erreur lors de la mise à jour'
            };
        } finally {
            setLoading(false);
        }
    }, [formData, userId, validateForm, apiUrls, uploadAllFiles]);

    // Nettoyage des URLs temporaires lors du démontage du composant
    useEffect(() => {
        return () => {
            Object.values(uploadedFileUrls).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    return {
        formData,
        validation,
        selectLists,
        loading,
        initialLoading,
        uploadedFiles,
        uploadedFileUrls,
        handleInputChange,
        handleFileChange,
        handleSubmit,
        removeFile
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
        FONCTION: 'Fonction *',
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