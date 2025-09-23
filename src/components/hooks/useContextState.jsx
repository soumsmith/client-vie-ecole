import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer les états des contextes (domaines, cours, leçons, etc.)
 */
export const useContextState = () => {
    // ===========================
    // ÉTATS - GESTION DES CONTEXTES
    // ===========================
    const [contextsState, setContextsState] = useState({
        domains: {
            data: [],
            selectedIds: [],
            loading: false,
            error: null
        },
        subDomains: {
            data: [],
            selectedIds: [],
            loading: false,
            error: null
        },
        courses: {
            data: [],
            selectedIds: [],
            loading: false,
            error: null
        },
        lessons: {
            data: [],
            selectedIds: [],
            loading: false,
            error: null
        }
    });

    // ===========================
    // FONCTIONS UTILITAIRES
    // ===========================
    
    /**
     * Met à jour l'état d'un contexte spécifique
     */
    const updateContextState = useCallback((contextType, updates) => {
        setContextsState(prev => ({
            ...prev,
            [contextType]: {
                ...prev[contextType],
                ...updates
            }
        }));
    }, []);

    /**
     * Gère la sélection dans un contexte et met à jour le formulaire
     */
    const handleContextSelection = useCallback((contextType, selectedIds, updateFormField) => {
        updateContextState(contextType, { selectedIds });
        
        // Mettre à jour formData avec le premier élément sélectionné
        if (selectedIds.length > 0 && updateFormField) {
            const fieldMap = {
                'domains': 'domain_id',
                'subDomains': 'sub_domain_id', 
                'courses': 'course_id',
                'lessons': 'lesson_id'
            };
            
            const fieldName = fieldMap[contextType];
            if (fieldName) {
                updateFormField(fieldName, selectedIds[0]);
            }
        }
    }, [updateContextState]);

    /**
     * Réinitialise tous les contextes
     */
    const resetAllContexts = useCallback(() => {
        setContextsState(prev => {
            const newState = {};
            Object.keys(prev).forEach(contextType => {
                newState[contextType] = {
                    ...prev[contextType],
                    selectedIds: []
                };
            });
            return newState;
        });
    }, []);

    /**
     * Réinitialise un contexte spécifique
     */
    const resetContext = useCallback((contextType) => {
        updateContextState(contextType, { 
            selectedIds: [],
            error: null 
        });
    }, [updateContextState]);

    /**
     * Charge les données pour un contexte spécifique
     */
    const loadContextData = useCallback(async (contextType, fetchFunction) => {
        try {
            updateContextState(contextType, { loading: true, error: null });
            const data = await fetchFunction(contextType, updateContextState);
            return data;
        } catch (error) {
            updateContextState(contextType, { 
                loading: false, 
                error: error.message 
            });
            throw error;
        }
    }, [updateContextState]);

    /**
     * Obtient le nombre total d'éléments sélectionnés dans tous les contextes
     */
    const getTotalSelectedCount = useCallback(() => {
        return Object.values(contextsState).reduce((total, context) => {
            return total + context.selectedIds.length;
        }, 0);
    }, [contextsState]);

    /**
     * Obtient les détails des éléments sélectionnés pour un contexte
     */
    const getSelectedItemsDetails = useCallback((contextType) => {
        const context = contextsState[contextType];
        if (!context || context.selectedIds.length === 0) {
            return [];
        }

        return context.data.filter(item => 
            context.selectedIds.includes(item.id)
        );
    }, [contextsState]);

    /**
     * Vérifie si un contexte a des éléments sélectionnés
     */
    const hasSelectedItems = useCallback((contextType) => {
        return contextsState[contextType]?.selectedIds?.length > 0;
    }, [contextsState]);

    /**
     * Obtient le statut de chargement global
     */
    const getGlobalLoadingStatus = useCallback(() => {
        return Object.values(contextsState).some(context => context.loading);
    }, [contextsState]);

    /**
     * Obtient les erreurs globales
     */
    const getGlobalErrors = useCallback(() => {
        const errors = {};
        Object.entries(contextsState).forEach(([contextType, context]) => {
            if (context.error) {
                errors[contextType] = context.error;
            }
        });
        return errors;
    }, [contextsState]);

    /**
     * Valide les sélections selon des règles métier
     */
    const validateSelections = useCallback((rules = {}) => {
        const errors = [];
        
        // Règles par défaut
        const defaultRules = {
            requireDomain: false,
            requireCourse: false,
            requireLesson: false,
            maxSelections: {
                domains: 10,
                courses: 10,
                lessons: 10
            }
        };

        const finalRules = { ...defaultRules, ...rules };

        // Vérification des sélections requises
        if (finalRules.requireDomain && !hasSelectedItems('domains')) {
            errors.push('Au moins un domaine doit être sélectionné');
        }

        if (finalRules.requireCourse && !hasSelectedItems('courses')) {
            errors.push('Au moins un cours doit être sélectionné');
        }

        if (finalRules.requireLesson && !hasSelectedItems('lessons')) {
            errors.push('Au moins une leçon doit être sélectionnée');
        }

        // Vérification des limites de sélection
        Object.entries(finalRules.maxSelections || {}).forEach(([contextType, maxCount]) => {
            const context = contextsState[contextType];
            if (context && context.selectedIds.length > maxCount) {
                errors.push(`Trop de sélections dans ${contextType} (max: ${maxCount})`);
            }
        });

        return errors;
    }, [contextsState, hasSelectedItems]);

    return {
        // États
        contextsState,
        
        // Fonctions de gestion
        updateContextState,
        handleContextSelection,
        resetAllContexts,
        resetContext,
        loadContextData,
        
        // Fonctions utilitaires
        getTotalSelectedCount,
        getSelectedItemsDetails,
        hasSelectedItems,
        getGlobalLoadingStatus,
        getGlobalErrors,
        validateSelections,
        
        // Setter direct (si nécessaire)
        setContextsState
    };
};