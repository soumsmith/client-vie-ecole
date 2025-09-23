// utils/questionUtils.js

/**
 * Données de référence initiales pour les questions
 */
export const initialQuestionReferenceData = {
    domaines: [],
    sousdomaines: [],
    typesQuestion: [],
    langues: [],
    pays: [],
    difficultes: [],
    niveauxPremium: [],
    cours: [],
    lecons: []
};

/**
 * Validation du formulaire de question
 */
export const validateQuestionForm = (formData, answers) => {
    const errors = [];

    // Validation des champs obligatoires
    if (!formData.content.trim()) {
        errors.push("Le contenu de la question est requis");
    }

    if (!formData.type_id) {
        errors.push("Le type de question est requis");
    }

    if (!formData.points || formData.points < 1) {
        errors.push("Les points doivent être supérieurs à 0");
    }

    // Validation des réponses
    const validAnswers = answers.filter(answer => answer.content.trim());
    if (validAnswers.length < 2) {
        errors.push("Au moins 2 réponses sont requises");
    }

    const correctAnswers = validAnswers.filter(answer => answer.is_correct);
    if (correctAnswers.length === 0) {
        errors.push("Au moins une réponse correcte est requise");
    }

    // Validation des champs optionnels avec valeurs
    if (formData.time_limit && formData.time_limit < 10) {
        errors.push("Le temps limite doit être d'au moins 10 secondes");
    }

    return errors;
};

/**
 * Prépare les données de question pour l'envoi à l'API
 */
export const prepareQuestionDataForSubmission = (formData, answers, sources, mediaFiles) => {
    // Préparer les données principales
    const dataToSend = {
        action: "create_question",
        content: formData.content.trim(),
        explanation: formData.explanation.trim(),
        domain_id: formData.domain_id ? parseInt(formData.domain_id) : null,
        sub_domain_id: formData.sub_domain_id ? parseInt(formData.sub_domain_id) : null,
        type_id: parseInt(formData.type_id),
        language_id: formData.language_id ? parseInt(formData.language_id) : null,
        country_id: formData.country_id ? parseInt(formData.country_id) : null,
        difficulty_level: formData.difficulty_level ? parseInt(formData.difficulty_level) : null,
        points: parseInt(formData.points),
        time_limit: formData.time_limit ? parseInt(formData.time_limit) : null,
        tags: formData.tags.trim(),
        active: parseInt(formData.active),
        
        // Filtrer les réponses valides
        answers: answers
            .filter(answer => answer.content.trim())
            .map(answer => ({
                content: answer.content.trim(),
                is_correct: answer.is_correct,
                explanation: answer.explanation.trim()
            })),
        
        // Filtrer les sources valides
        sources: sources
            .filter(source => source.title.trim())
            .map(source => ({
                title: source.title.trim(),
                author: source.author.trim(),
                url: source.url.trim(),
                description: source.description.trim()
            }))
    };

    // Créer FormData pour inclure les fichiers
    const formDataToSend = new FormData();
    formDataToSend.append('data', JSON.stringify(dataToSend));

    // Ajouter les fichiers média
    mediaFiles.forEach((file, index) => {
        formDataToSend.append(`media_files[]`, file);
    });

    return formDataToSend;
};

/**
 * Utilitaires pour la gestion des réponses
 */
export const answerUtils = {
    // Créer une nouvelle réponse vide
    createEmptyAnswer: () => ({
        content: "",
        is_correct: false,
        explanation: ""
    }),

    // Vérifier si une réponse est valide
    isValidAnswer: (answer) => {
        return answer.content.trim().length > 0;
    },

    // Compter les réponses correctes
    countCorrectAnswers: (answers) => {
        return answers.filter(answer => answer.is_correct && answer.content.trim()).length;
    },

    // Validation spécifique aux réponses
    validateAnswers: (answers) => {
        const errors = [];
        const validAnswers = answers.filter(answer => answer.content.trim());
        
        if (validAnswers.length < 2) {
            errors.push("Au moins 2 réponses sont requises");
        }

        const correctAnswers = validAnswers.filter(answer => answer.is_correct);
        if (correctAnswers.length === 0) {
            errors.push("Au moins une réponse correcte est requise");
        }

        return errors;
    }
};

/**
 * Utilitaires pour la gestion des sources
 */
export const sourceUtils = {
    // Créer une nouvelle source vide
    createEmptySource: () => ({
        title: "",
        author: "",
        url: "",
        description: ""
    }),

    // Vérifier si une source est valide
    isValidSource: (source) => {
        return source.title.trim().length > 0;
    },

    // Validation des URLs
    isValidUrl: (url) => {
        if (!url.trim()) return true; // URL optionnelle
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Validation spécifique aux sources
    validateSources: (sources) => {
        const errors = [];
        
        sources.forEach((source, index) => {
            if (source.title.trim() && source.url.trim()) {
                if (!sourceUtils.isValidUrl(source.url)) {
                    errors.push(`L'URL de la source ${index + 1} n'est pas valide`);
                }
            }
        });

        return errors;
    }
};

/**
 * Utilitaires pour la gestion des médias
 */
export const mediaUtils = {
    // Types de fichiers acceptés
    ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
    ACCEPTED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg'],

    // Taille maximale (en bytes)
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

    // Vérifier si un fichier est une image
    isImageFile: (file) => {
        return mediaUtils.ACCEPTED_IMAGE_TYPES.includes(file.type);
    },

    // Vérifier si un fichier est accepté
    isAcceptedFileType: (file) => {
        return [
            ...mediaUtils.ACCEPTED_IMAGE_TYPES,
            ...mediaUtils.ACCEPTED_DOCUMENT_TYPES,
            ...mediaUtils.ACCEPTED_VIDEO_TYPES,
            ...mediaUtils.ACCEPTED_AUDIO_TYPES
        ].includes(file.type);
    },

    // Vérifier la taille du fichier
    isValidFileSize: (file) => {
        return file.size <= mediaUtils.MAX_FILE_SIZE;
    },

    // Validation des fichiers média
    validateMediaFiles: (files) => {
        const errors = [];
        
        files.forEach((file, index) => {
            if (!mediaUtils.isAcceptedFileType(file)) {
                errors.push(`Le fichier ${file.name} n'est pas d'un type accepté`);
            }
            
            if (!mediaUtils.isValidFileSize(file)) {
                errors.push(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
            }
        });

        return errors;
    },

    // Formater la taille du fichier
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

/**
 * Constantes pour les types de questions
 */
export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    OPEN_ENDED: 'open_ended',
    MATCHING: 'matching',
    FILL_IN_BLANK: 'fill_in_blank'
};

/**
 * Constantes pour les niveaux de difficulté
 */
export const DIFFICULTY_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert'
};

/**
 * Utilitaires pour les tags
 */
export const tagUtils = {
    // Normaliser les tags
    normalizeTags: (tagsString) => {
        if (!tagsString) return [];
        
        return tagsString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .map(tag => tag.toLowerCase());
    },

    // Convertir un tableau de tags en string
    tagsToString: (tagsArray) => {
        return tagsArray.join(', ');
    },

    // Validation des tags
    validateTags: (tagsString) => {
        const errors = [];
        
        if (tagsString) {
            const tags = tagUtils.normalizeTags(tagsString);
            
            if (tags.length > 10) {
                errors.push("Maximum 10 tags autorisés");
            }
            
            tags.forEach(tag => {
                if (tag.length > 30) {
                    errors.push(`Le tag "${tag}" est trop long (max 30 caractères)`);
                }
            });
        }
        
        return errors;
    }
};