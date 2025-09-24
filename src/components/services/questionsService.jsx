/**
 * Service pour la gestion des questions
 */

const API_URL = "http://localhost/CRUDPHPquestions_api.php?action=get_all_questions";

/**
 * Récupère les questions depuis l'API
 */
export const fetchQuestions = async (updateQuestionsState, preventLoadingState = false) => {
    try {
        if (!preventLoadingState) {
            updateQuestionsState({ loading: true, error: null });
        }

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const apiResponse = await response.json();

        if (!apiResponse.success || !apiResponse.data || !apiResponse.data.questions) {
            throw new Error('Format de réponse API invalide');
        }

        // Traitement et formatage des données
        const processedData = apiResponse.data.questions.map(question => ({
            ...question,
            difficulty_display: question.difficulty_name || 'Non défini',
            type_display: question.type_name || 'Non défini',
            domain_display: question.domain_name || 'Non défini',
            answers_summary: `${question.stats?.correct_answers_count || 0}/${question.stats?.answers_count || 0}`,
            content_preview: question.content ?
                (question.content.length > 100 ?
                    question.content.substring(0, 100) + '...' :
                    question.content) : 'Contenu non disponible',
            created_date: question.created_at ?
                new Date(question.created_at).toLocaleDateString('fr-FR') : '',
            last_modified: question.updated_at || question.created_at,
            media_types: question.media ?
                [...new Set(question.media.map(m => m.media_type))].join(', ') : ''
        }));

        updateQuestionsState({ data: processedData, loading: false });
        return processedData;

    } catch (err) {
        console.error('Erreur lors du chargement des questions:', err);
        updateQuestionsState({ 
            error: err.message, 
            loading: false 
        });
        throw err;
    }
};

/**
 * Crée une nouvelle question
 */
export const createQuestion = async (questionData) => {
    try {
        const response = await fetch('http://localhost/CRUDPHPquestions_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'create_question',
                ...questionData
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Erreur lors de la création');
        }

        return result;
    } catch (error) {
        console.error('Erreur lors de la création de la question:', error);
        throw error;
    }
};

/**
 * Met à jour une question existante
 */
export const updateQuestion = async (questionId, questionData) => {
    try {
        const response = await fetch('http://localhost/CRUDPHPquestions_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update_question',
                id: questionId,
                ...questionData
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Erreur lors de la mise à jour');
        }

        return result;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la question:', error);
        throw error;
    }
};

/**
 * Supprime une question
 */
export const deleteQuestion = async (questionId) => {
    try {
        const response = await fetch('http://localhost/CRUDPHPquestions_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete_question',
                id: questionId
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Erreur lors de la suppression');
        }

        return result;
    } catch (error) {
        console.error('Erreur lors de la suppression de la question:', error);
        throw error;
    }
};