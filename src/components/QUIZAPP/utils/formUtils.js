import { useCallback } from 'react';

/**
 * Hook pour la gestion des formulaires
 */
export const useFormUtils = (initialFormData, setFormData) => {
    /**
     * Met à jour un champ spécifique du formulaire
     */
    const updateFormField = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, [setFormData]);

    /**
     * Réinitialise le formulaire à son état initial
     */
    const resetForm = useCallback(() => {
        setFormData(initialFormData);
    }, [setFormData, initialFormData]);

    /**
     * Met à jour les points dans le formulaire basé sur les questions sélectionnées
     */
    const updatePointsFromQuestions = useCallback((totalPoints) => {
        setFormData(prev => ({
            ...prev,
            total_points: totalPoints,
            // Ajustement automatique du score minimum si nécessaire
            min_pass_points: prev.min_pass_points > totalPoints ? 
                Math.floor(totalPoints * 0.6) : prev.min_pass_points
        }));
    }, [setFormData]);

    return {
        updateFormField,
        resetForm,
        updatePointsFromQuestions
    };
};

/**
 * Données de référence initiales pour les formulaires
 */
export const initialReferenceData = {
    domaines: [],
    sousdomaines: [],
    typesQuestion: [],
    langues: [],
    pays: [],
    difficultes: [],
    niveauxPremium: [],
    cours: [],
    lecons: [],
    exerciseTypes: [
        { value: 'text', label: 'Texte' },
        { value: 'link', label: 'Lien externe' },
        { value: 'pdf', label: 'PDF' },
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Vidéo' },
        { value: 'interactive', label: 'Interactif' },
        { value: 'mixed', label: 'Mixte' }
    ]
};

/**
 * Validation des formulaires
 */
export const validateQuizForm = (formData, selectedQuestions) => {
    const errors = [];

    if (!formData.title.trim()) {
        errors.push('Le titre du quiz est requis');
    }

    if (!formData.domain_id) {
        errors.push('Le domaine d\'activité est requis');
    }

    if (selectedQuestions.length === 0) {
        errors.push('Veuillez sélectionner au moins une question');
    }

    if (formData.time_limit < 60) {
        errors.push('Le temps limite doit être d\'au moins 60 secondes');
    }

    return errors;
};

/**
 * Validation du formulaire d'exercice
 */
export const validateExerciseForm = (formData, selectedQuestions) => {
    const errors = [];

    if (!formData.title.trim()) {
        errors.push('Le titre de l\'exercice est requis');
    }

    if (selectedQuestions.length === 0) {
        errors.push('Veuillez sélectionner au moins une question');
    }

    if (formData.estimated_duration < 1) {
        errors.push('La durée estimée doit être d\'au moins 1 minute');
    }

    if (formData.points < 1) {
        errors.push('Les points doivent être d\'au moins 1');
    }

    // Validation spécifique pour les types avec fichiers
    if (['pdf', 'image', 'video'].includes(formData.exercise_type)) {
        if (!formData.file_url && !formData.uploaded_file) {
            errors.push('Un fichier est requis pour ce type d\'exercice');
        }
    }

    if (formData.exercise_type === 'link' && !formData.external_link.trim()) {
        errors.push('Un lien externe est requis pour ce type d\'exercice');
    }

    return errors;
};

/**
 * Prépare les données pour l'envoi API
 */
export const prepareQuizDataForSubmission = (formData, selectedQuestions) => {
    return {
       // action: "create_quiz",
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : '',
        color: formData.color,
        domain_id: parseInt(formData.domain_id),
        sub_domain_id: formData.sub_domain_id ? parseInt(formData.sub_domain_id) : null,
        country_id: formData.country_id ? parseInt(formData.country_id) : null,
        course_id: formData.course_id ? parseInt(formData.course_id) : null,
        lesson_id: formData.lesson_id ? parseInt(formData.lesson_id) : null,
        difficulty_id: formData.difficulty_id ? parseInt(formData.difficulty_id) : null,
        time_limit: parseInt(formData.time_limit),
        total_points: parseInt(formData.total_points),
        min_pass_points: parseInt(formData.min_pass_points),
        is_featured: parseInt(formData.is_featured),
        premium_level_id: formData.premium_level_id ? parseInt(formData.premium_level_id) : null,
        active: parseInt(formData.active),
        selected_questions: selectedQuestions.map(id => ({ id: parseInt(id) }))
    };
};

/**
 * Prépare les données d'exercice pour l'envoi API
 */
export const prepareExerciseDataForSubmission = (formData, selectedQuestions) => {
    return {
        action: "create_exercise_with_questions",
        title: formData.title.trim(),
        description: formData.description.trim(),
        instructions: formData.instructions.trim(),
        content: formData.content.trim(),
        exercise_type: formData.exercise_type,
        file_url: formData.file_url.trim() || null,
        uploaded_file: formData.uploaded_file || null,
        external_link: formData.external_link.trim() || null,
        solution: formData.solution.trim(),
        hints: formData.hints,
        difficulty_level_id: formData.difficulty_level_id,
        estimated_duration: formData.estimated_duration,
        points: formData.points,
        is_mandatory: formData.is_mandatory,
        is_interactive: formData.is_interactive,
        selected_questions: selectedQuestions.map(id => ({ id: parseInt(id) })),
        
        // Associations contextuelles
        domain_id: formData.domain_id,
        sub_domain_id: formData.sub_domain_id,
        course_id: formData.course_id,
        lesson_id: formData.lesson_id
    };
};








/**
 * Valide les données du formulaire de création/modification de leçon
 * @param {Object} formData - Données du formulaire de la leçon
 * @param {Array} selectedCourses - Liste des cours sélectionnés
 * @param {Array} sections - Sections de la leçon avec leurs blocs de contenu
 * @param {Array} exercises - Exercices associés à la leçon
 * @returns {Array} - Tableau des erreurs de validation
 */
export const validateLessonForm = (formData, selectedCourses = [], sections = [], exercises = []) => {
    const errors = [];

    // Validation des champs obligatoires
    if (!formData.title || !formData.title.trim()) {
        errors.push('Le titre de la leçon est requis');
    }

    if (!formData.description || !formData.description.trim()) {
        errors.push('La description de la leçon est requise');
    }

    // Validation de la longueur des champs
    if (formData.title && formData.title.trim().length < 3) {
        errors.push('Le titre doit contenir au moins 3 caractères');
    }

    if (formData.title && formData.title.trim().length > 255) {
        errors.push('Le titre ne peut pas dépasser 255 caractères');
    }

    if (formData.description && formData.description.trim().length < 10) {
        errors.push('La description doit contenir au moins 10 caractères');
    }

    // Validation des valeurs numériques
    if (formData.estimated_duration < 1) {
        errors.push('La durée estimée doit être d\'au moins 1 minute');
    }

    if (formData.estimated_duration > 1440) { // 24 heures max
        errors.push('La durée estimée ne peut pas dépasser 1440 minutes (24 heures)');
    }

    if (formData.order_index < 0) {
        errors.push('L\'ordre d\'affichage ne peut pas être négatif');
    }

    // Validation du type de leçon
    const validLessonTypes = ['theory', 'practice', 'mixed', 'assessment', 'summary'];
    if (!validLessonTypes.includes(formData.lesson_type)) {
        errors.push('Le type de leçon sélectionné n\'est pas valide');
    }

    // Validation du niveau premium
    if (formData.premium_level_id && formData.premium_level_id < 0) {
        errors.push('Le niveau premium ne peut pas être négatif');
    }

    // Validation des concepts clés
    if (formData.key_concepts && !Array.isArray(formData.key_concepts)) {
        errors.push('Les concepts clés doivent être sous forme de liste');
    }

    // Validation des cours associés
    if (selectedCourses.length === 0) {
        errors.push('Veuillez sélectionner au moins un cours pour cette leçon');
    }

    // Validation des sections
    if (sections && sections.length > 0) {
        sections.forEach((section, sectionIndex) => {
            // Vérification du titre de la section
            if (!section.title || !section.title.trim()) {
                errors.push(`La section ${sectionIndex + 1} doit avoir un titre`);
            }

            // Vérification de l'ordre des sections
            if (section.order_index < 0) {
                errors.push(`L'ordre de la section "${section.title || sectionIndex + 1}" ne peut pas être négatif`);
            }

            // Validation du type de section
            const validSectionTypes = ['content', 'exercises', 'assessment', 'summary'];
            if (!validSectionTypes.includes(section.section_type)) {
                errors.push(`Le type de la section "${section.title || sectionIndex + 1}" n'est pas valide`);
            }

            // Validation des blocs de contenu
            if (section.content_blocks && section.content_blocks.length > 0) {
                section.content_blocks.forEach((block, blockIndex) => {
                    // Vérification du contenu du bloc
                    if (!block.content || !block.content.trim()) {
                        errors.push(`Le bloc ${blockIndex + 1} de la section "${section.title || sectionIndex + 1}" doit avoir du contenu`);
                    }

                    // Vérification du type de contenu
                    if (!block.content_type_id || block.content_type_id <= 0) {
                        errors.push(`Le bloc ${blockIndex + 1} de la section "${section.title || sectionIndex + 1}" doit avoir un type de contenu valide`);
                    }

                    // Validation des liens média
                    if (block.media_links && block.media_links.length > 0) {
                        block.media_links.forEach((mediaLink, linkIndex) => {
                            if (!mediaLink.media_resource_id || mediaLink.media_resource_id <= 0) {
                                errors.push(`Le lien média ${linkIndex + 1} du bloc ${blockIndex + 1} doit référencer une ressource valide`);
                            }

                            if (mediaLink.display_order < 0) {
                                errors.push(`L'ordre d'affichage du lien média ${linkIndex + 1} ne peut pas être négatif`);
                            }
                        });
                    }

                    // Validation des tags
                    if (block.tags && block.tags.length > 0) {
                        if (!Array.isArray(block.tags)) {
                            errors.push(`Les tags du bloc ${blockIndex + 1} doivent être sous forme de liste`);
                        } else {
                            block.tags.forEach((tagId) => {
                                if (!tagId || tagId <= 0) {
                                    errors.push(`Un tag invalide a été trouvé dans le bloc ${blockIndex + 1}`);
                                }
                            });
                        }
                    }
                });
            }
        });

        // Vérification des ordres de section uniques
        const sectionOrders = sections.map(s => s.order_index);
        const duplicateOrders = sectionOrders.filter((order, index) => sectionOrders.indexOf(order) !== index);
        if (duplicateOrders.length > 0) {
            errors.push('Chaque section doit avoir un ordre d\'affichage unique');
        }
    }

    // Validation des exercices
    if (exercises && exercises.length > 0) {
        exercises.forEach((exercise, exerciseIndex) => {
            // Vérification du titre de l'exercice
            if (!exercise.title || !exercise.title.trim()) {
                errors.push(`L'exercice ${exerciseIndex + 1} doit avoir un titre`);
            }

            // Vérification de l'ID de question ou d'exercice
            if (!exercise.question_id && !exercise.exercise_id) {
                errors.push(`L'exercice ${exerciseIndex + 1} doit être lié à une question ou un exercice valide`);
            }

            // Vérification de l'ordre des exercices
            if (exercise.order_index < 0) {
                errors.push(`L'ordre de l'exercice "${exercise.title || exerciseIndex + 1}" ne peut pas être négatif`);
            }

            // Validation du type d'exercice
            const validExerciseTypes = ['practice', 'assessment', 'homework', 'project', 'quiz'];
            if (!validExerciseTypes.includes(exercise.exercise_type)) {
                errors.push(`Le type de l'exercice "${exercise.title || exerciseIndex + 1}" n'est pas valide`);
            }

            // Validation des indices (hints)
            if (exercise.hints && !Array.isArray(exercise.hints)) {
                errors.push(`Les indices de l'exercice "${exercise.title || exerciseIndex + 1}" doivent être sous forme de liste`);
            }
        });

        // Vérification des ordres d'exercice uniques
        const exerciseOrders = exercises.map(e => e.order_index);
        const duplicateExerciseOrders = exerciseOrders.filter((order, index) => exerciseOrders.indexOf(order) !== index);
        if (duplicateExerciseOrders.length > 0) {
            errors.push('Chaque exercice doit avoir un ordre d\'affichage unique');
        }
    }

    // Validation de la cohérence globale
    const totalEstimatedDuration = sections.reduce((total, section) => {
        return total + (section.estimated_duration || 0);
    }, 0);

    if (totalEstimatedDuration > formData.estimated_duration) {
        errors.push('La durée totale des sections dépasse la durée estimée de la leçon');
    }

    // Validation des objectifs pédagogiques
    if (formData.learning_objectives && formData.learning_objectives.trim().length > 0) {
        if (formData.learning_objectives.trim().length < 20) {
            errors.push('Les objectifs pédagogiques doivent contenir au moins 20 caractères');
        }
    }

    // Validation de la situation d'apprentissage
    if (formData.learning_situation && formData.learning_situation.trim().length > 0) {
        if (formData.learning_situation.trim().length < 20) {
            errors.push('La situation d\'apprentissage doit contenir au moins 20 caractères');
        }
    }

    // Avertissements (optionnels - peuvent être des warnings plutôt que des erreurs)
    if (sections.length === 0) {
        errors.push('Il est recommandé d\'ajouter au moins une section à votre leçon');
    }

    if (exercises.length === 0) {
        errors.push('Il est recommandé d\'ajouter au moins un exercice à votre leçon');
    }

    const totalContentBlocks = sections.reduce((total, section) => {
        return total + (section.content_blocks ? section.content_blocks.length : 0);
    }, 0);

    if (totalContentBlocks === 0) {
        errors.push('Il est recommandé d\'ajouter du contenu dans vos sections');
    }

    return errors;
};

/**
 * Valide spécifiquement une section de leçon
 * @param {Object} section - Données de la section à valider
 * @param {number} sectionIndex - Index de la section
 * @returns {Array} - Tableau des erreurs de validation pour cette section
 */
export const validateLessonSection = (section, sectionIndex = 0) => {
    const errors = [];

    if (!section.title || !section.title.trim()) {
        errors.push(`La section ${sectionIndex + 1} doit avoir un titre`);
    }

    if (section.title && section.title.trim().length < 3) {
        errors.push(`Le titre de la section ${sectionIndex + 1} doit contenir au moins 3 caractères`);
    }

    if (section.order_index < 0) {
        errors.push(`L'ordre de la section ${sectionIndex + 1} ne peut pas être négatif`);
    }

    const validSectionTypes = ['content', 'exercises', 'assessment', 'summary'];
    if (!validSectionTypes.includes(section.section_type)) {
        errors.push(`Le type de la section ${sectionIndex + 1} n'est pas valide`);
    }

    return errors;
};

/**
 * Valide spécifiquement un bloc de contenu
 * @param {Object} contentBlock - Données du bloc de contenu à valider
 * @param {number} blockIndex - Index du bloc
 * @param {string} sectionTitle - Titre de la section parente
 * @returns {Array} - Tableau des erreurs de validation pour ce bloc
 */
export const validateContentBlock = (contentBlock, blockIndex = 0, sectionTitle = 'Section') => {
    const errors = [];

    if (!contentBlock.content || !contentBlock.content.trim()) {
        errors.push(`Le bloc ${blockIndex + 1} de "${sectionTitle}" doit avoir du contenu`);
    }

    if (!contentBlock.content_type_id || contentBlock.content_type_id <= 0) {
        errors.push(`Le bloc ${blockIndex + 1} de "${sectionTitle}" doit avoir un type de contenu valide`);
    }

    if (contentBlock.order_index < 0) {
        errors.push(`L'ordre du bloc ${blockIndex + 1} ne peut pas être négatif`);
    }

    return errors;
};

/**
 * Fonction utilitaire pour vérifier si une leçon est valide avant soumission
 * @param {Object} formData - Données du formulaire
 * @param {Array} selectedCourses - Cours sélectionnés
 * @param {Array} sections - Sections de la leçon
 * @param {Array} exercises - Exercices de la leçon
 * @returns {Object} - Résultat de validation avec isValid et errors
 */
export const isLessonFormValid = (formData, selectedCourses = [], sections = [], exercises = []) => {
    const errors = validateLessonForm(formData, selectedCourses, sections, exercises);
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        errorCount: errors.length
    };
};