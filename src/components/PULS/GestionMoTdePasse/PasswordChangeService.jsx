/**
 * Service pour la gestion de la modification de mot de passe
 * Contient la logique métier, les appels API et les fonctions utilitaires
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';

// ===========================
// CONSTANTES ET CONFIGURATION
// ===========================
export const PASSWORD_CONFIG = {
    MIN_LENGTH: 8,
    STRENGTH_LEVELS: {
        VERY_WEAK: 1,
        WEAK: 2,
        MEDIUM: 3,
        STRONG: 4,
        VERY_STRONG: 5
    },
    STRENGTH_COLORS: {
        1: '#ef4444', // Rouge
        2: '#f59e0b', // Orange
        3: '#eab308', // Jaune
        4: '#22c55e', // Vert clair
        5: '#16a34a'  // Vert foncé
    },
    STRENGTH_LABELS: {
        1: 'Très faible',
        2: 'Faible', 
        3: 'Moyen',
        4: 'Fort',
        5: 'Très fort'
    }
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Valide un mot de passe selon les critères de sécurité
 * @param {string} password - Le mot de passe à valider
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Le mot de passe est requis' };
    }

    const minLength = PASSWORD_CONFIG.MIN_LENGTH;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { 
            isValid: false, 
            message: `Le mot de passe doit contenir au moins ${minLength} caractères` 
        };
    }
    if (!hasUpperCase) {
        return { 
            isValid: false, 
            message: 'Le mot de passe doit contenir au moins une majuscule' 
        };
    }
    if (!hasLowerCase) {
        return { 
            isValid: false, 
            message: 'Le mot de passe doit contenir au moins une minuscule' 
        };
    }
    if (!hasNumbers) {
        return { 
            isValid: false, 
            message: 'Le mot de passe doit contenir au moins un chiffre' 
        };
    }
    if (!hasSpecialChar) {
        return { 
            isValid: false, 
            message: 'Le mot de passe doit contenir au moins un caractère spécial' 
        };
    }
    
    return { isValid: true, message: '' };
};

/**
 * Calcule la force d'un mot de passe (1-5)
 * @param {string} password - Le mot de passe à évaluer
 * @returns {number} - Niveau de force de 1 à 5
 */
export const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Longueur suffisante
    if (password.length >= PASSWORD_CONFIG.MIN_LENGTH) strength++;
    
    // Majuscules
    if (/[A-Z]/.test(password)) strength++;
    
    // Minuscules
    if (/[a-z]/.test(password)) strength++;
    
    // Chiffres
    if (/\d/.test(password)) strength++;
    
    // Caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    return strength;
};

/**
 * Obtient la couleur correspondant à la force du mot de passe
 * @param {number} strength - Niveau de force (0-5)
 * @returns {string} - Code couleur hexadécimal
 */
export const getPasswordStrengthColor = (strength) => {
    return PASSWORD_CONFIG.STRENGTH_COLORS[strength] || '#e2e8f0';
};

/**
 * Obtient le label correspondant à la force du mot de passe
 * @param {number} strength - Niveau de force (0-5)
 * @returns {string} - Label descriptif
 */
export const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return 'Entrez un mot de passe';
    return PASSWORD_CONFIG.STRENGTH_LABELS[strength] || 'Inconnu';
};

/**
 * Valide la correspondance entre deux mots de passe
 * @param {string} password - Premier mot de passe
 * @param {string} confirmPassword - Mot de passe de confirmation
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
    if (!confirmPassword) {
        return { isValid: true, message: '' }; // Ne pas afficher d'erreur si vide
    }
    
    const isMatch = password === confirmPassword;
    return {
        isValid: isMatch,
        message: isMatch ? '' : 'Les mots de passe ne correspondent pas'
    };
};

// ===========================
// FONCTIONS D'API
// ===========================

/**
 * Modifie le mot de passe via l'API avec Axios
 * @param {object} credentials - { login, motdePasse, confirmMotPass }
 * @param {object} apiUrls - URLs d'API obtenues via useAllApiUrls()
 * @returns {Promise<object>} - Réponse de l'API
 */
export const changePasswordAPI = async (credentials, apiUrls) => {
    try {
        const response = await axios.put(apiUrls.profils.editPasseWord(), credentials);
        return response.data;
    } catch (error) {
        // Gestion des erreurs Axios
        if (error.response) {
            // Le serveur a répondu avec un code d'erreur
            const status = error.response.status;
            const message = error.response.data?.message || error.response.data?.error || `Erreur HTTP ${status}`;
            
            throw new Error(message);
        } else if (error.request) {
            // La requête a été faite mais pas de réponse
            throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
        } else {
            // Erreur lors de la configuration de la requête
            throw new Error(`Erreur de configuration: ${error.message}`);
        }
    }
};

// ===========================
// HOOK PERSONNALISÉ POUR LA GESTION DU FORMULAIRE
// ===========================

/**
 * Hook personnalisé pour gérer le formulaire de modification de mot de passe
 * @param {string} userLogin - Login de l'utilisateur
 * @returns {object} - État et fonctions de gestion du formulaire
 */
export const usePasswordChangeForm = (userLogin) => {
    // ✅ Hook appelé au niveau racine du hook personnalisé
    const apiUrls = useAllApiUrls();
    
    // États du formulaire
    const [formData, setFormData] = useState({
        ancienMotPasse: '',
        nouveauMotPasse: '',
        confirmMotPasse: ''
    });

    // États de validation
    const [validation, setValidation] = useState({
        ancienMotPasse: { isValid: true, message: '' },
        nouveauMotPasse: { isValid: true, message: '' },
        confirmMotPasse: { isValid: true, message: '' }
    });

    // États d'interface
    const [showPasswords, setShowPasswords] = useState({
        ancien: false,
        nouveau: false,
        confirm: false
    });

    const [loading, setLoading] = useState(false);

    // Gestion des changements de champs
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Validation en temps réel
        if (field === 'nouveauMotPasse') {
            const passwordValidation = validatePassword(value);
            setValidation(prev => ({
                ...prev,
                nouveauMotPasse: passwordValidation
            }));
        }

        if (field === 'confirmMotPasse') {
            const matchValidation = validatePasswordMatch(formData.nouveauMotPasse, value);
            setValidation(prev => ({
                ...prev,
                confirmMotPasse: matchValidation
            }));
        }

        if (field === 'ancienMotPasse') {
            setValidation(prev => ({
                ...prev,
                ancienMotPasse: { 
                    isValid: value !== '', 
                    message: value === '' ? 'Ancien mot de passe requis' : '' 
                }
            }));
        }
    }, [formData.nouveauMotPasse]);

    // Toggle de visibilité des mots de passe
    const togglePasswordVisibility = useCallback((field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    }, []);

    // Validation finale du formulaire
    const validateForm = useCallback(() => {
        const nouveauMotPasseValidation = validatePassword(formData.nouveauMotPasse);
        const confirmValidation = validatePasswordMatch(formData.nouveauMotPasse, formData.confirmMotPasse);
        const ancienValidation = {
            isValid: formData.ancienMotPasse !== '',
            message: formData.ancienMotPasse === '' ? 'Ancien mot de passe requis' : ''
        };

        const newValidation = {
            ancienMotPasse: ancienValidation,
            nouveauMotPasse: nouveauMotPasseValidation,
            confirmMotPasse: confirmValidation
        };

        setValidation(newValidation);

        return ancienValidation.isValid && 
               nouveauMotPasseValidation.isValid && 
               confirmValidation.isValid;
    }, [formData]);

    // Soumission du formulaire
    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            return { success: false, error: 'Veuillez corriger les erreurs dans le formulaire' };
        }

        setLoading(true);

        try {
            // ✅ Passer apiUrls comme paramètre
            await changePasswordAPI({
                login: userLogin,
                motdePasse: formData.nouveauMotPasse,
                confirmMotPass: formData.confirmMotPasse
            }, apiUrls);

            // Réinitialiser le formulaire en cas de succès
            setFormData({
                ancienMotPasse: '',
                nouveauMotPasse: '',
                confirmMotPasse: ''
            });
            
            setValidation({
                ancienMotPasse: { isValid: true, message: '' },
                nouveauMotPasse: { isValid: true, message: '' },
                confirmMotPasse: { isValid: true, message: '' }
            });

            return { success: true };

        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Erreur lors de la modification du mot de passe' 
            };
        } finally {
            setLoading(false);
        }
    }, [formData, userLogin, validateForm, apiUrls]);

    // Calculer la force du mot de passe
    const passwordStrength = calculatePasswordStrength(formData.nouveauMotPasse);

    // Vérifier si le formulaire est valide
    const isFormValid = validation.ancienMotPasse.isValid && 
                       validation.nouveauMotPasse.isValid && 
                       validation.confirmMotPasse.isValid &&
                       formData.ancienMotPasse !== '' &&
                       formData.nouveauMotPasse !== '' &&
                       formData.confirmMotPasse !== '';

    return {
        // Données du formulaire
        formData,
        validation,
        showPasswords,
        loading,
        passwordStrength,
        isFormValid,

        // Actions
        handleInputChange,
        togglePasswordVisibility,
        handleSubmit,

        // Fonctions utilitaires
        getPasswordStrengthColor: () => getPasswordStrengthColor(passwordStrength),
        getPasswordStrengthLabel: () => getPasswordStrengthLabel(passwordStrength)
    };
};

// ===========================
// CONSTANTES POUR L'UI
// ===========================
export const UI_CONFIG = {
    SECURITY_TIPS: [
        'Au moins 8 caractères',
        'Majuscules et minuscules',
        'Chiffres et caractères spéciaux',
        'Évitez les informations personnelles'
    ],
    FORM_LABELS: {
        OLD_PASSWORD: 'Ancien mot de passe *',
        NEW_PASSWORD: 'Nouveau mot de passe *',
        CONFIRM_PASSWORD: 'Confirmer le nouveau mot de passe *',
        SUBMIT_BUTTON: 'Modifier mon mot de passe',
        LOADING_TEXT: 'Modification en cours...'
    },
    PLACEHOLDERS: {
        OLD_PASSWORD: 'Saisissez votre ancien mot de passe',
        NEW_PASSWORD: 'Saisissez votre nouveau mot de passe',
        CONFIRM_PASSWORD: 'Confirmez votre nouveau mot de passe'
    }
};