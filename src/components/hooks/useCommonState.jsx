import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer les états communs
 */
export const useCommonState = () => {
    // ===========================
    // ÉTATS - GESTION DES QUESTIONS
    // ===========================
    const [questionsState, setQuestionsState] = useState({
        data: [],
        selectedIds: [],
        selectedQuestions: [],
        loading: false,
        error: null
    });

    // ===========================
    // ÉTATS - GESTION DU MODAL
    // ===========================
    const [modalState, setModalState] = useState({
        show: false,
        type: 'view',
        selectedQuestion: null,
        context: null
    });

    // ===========================
    // ÉTATS - INTERFACE UTILISATEUR
    // ===========================
    const [uiState, setUiState] = useState({
        submitLoading: false
    });

    // ===========================
    // FONCTIONS UTILITAIRES
    // ===========================
    
    /**
     * Met à jour l'état des questions
     */
    const updateQuestionsState = useCallback((updates) => {
        setQuestionsState(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    /**
     * Met à jour l'état du modal
     */
    const updateModalState = useCallback((updates) => {
        setModalState(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    /**
     * Met à jour l'état de l'interface utilisateur
     */
    const updateUiState = useCallback((updates) => {
        setUiState(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    /**
     * Gère la sélection/désélection des questions
     */
    const handleQuestionSelection = useCallback((questionIds, questionsData, onPointsUpdate) => {
        const selectedQuestionsData = questionsData.filter(q => 
            questionIds.includes(q.id)
        );
        
        const totalPoints = selectedQuestionsData.reduce((sum, q) => 
            sum + (parseInt(q.points) || 0), 0
        );
        
        updateQuestionsState({
            selectedIds: questionIds,
            selectedQuestions: selectedQuestionsData
        });

        // Callback pour mettre à jour les points dans le formulaire parent
        if (onPointsUpdate) {
            onPointsUpdate(totalPoints);
        }
    }, [updateQuestionsState]);

    /**
     * Gère les actions du tableau (view, edit, delete, create)
     */
    const handleTableAction = useCallback((actionType, item, context = null) => {
        switch (actionType) {
            case 'view':
                updateModalState({
                    selectedQuestion: item,
                    type: 'view',
                    context: context,
                    show: true
                });
                break;

            case 'edit':
                updateModalState({
                    selectedQuestion: item,
                    type: 'edit',
                    context: context,
                    show: true
                });
                break;

            case 'delete':
                updateModalState({
                    selectedQuestion: item,
                    type: 'delete',
                    context: context,
                    show: true
                });
                break;

            case 'create':
                updateModalState({
                    selectedQuestion: null,
                    type: 'create',
                    context: context,
                    show: true
                });
                break;

            default:
                console.warn('Action non reconnue:', actionType);
        }
    }, [updateModalState]);

    /**
     * Ferme le modal et remet à zéro l'état
     */
    const handleCloseModal = useCallback(() => {
        updateModalState({
            show: false,
            selectedQuestion: null,
            type: 'view',
            context: null
        });
    }, [updateModalState]);

    return {
        // États
        questionsState,
        modalState,
        uiState,
        
        // Fonctions de mise à jour
        updateQuestionsState,
        updateModalState,
        updateUiState,
        
        // Fonctions de gestion
        handleQuestionSelection,
        handleTableAction,
        handleCloseModal,
        
        // Setters directs (si nécessaire)
        setQuestionsState,
        setModalState,
        setUiState
    };
};