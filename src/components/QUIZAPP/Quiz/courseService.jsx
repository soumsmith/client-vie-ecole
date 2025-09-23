/**
 * Service pour la gestion des questions
 */

import useFetchData from '../../hooks/useFetchData'; // Assure-toi d'avoir le bon chemin d'import

const API_URL = "http://localhost/CRUDPHP/api/courses-api.php";

/**
 * Hook pour récupérer les cours depuis l'API
 * @param {number} refreshTrigger - Déclencheur pour rafraîchir les données
 * @returns {Object} Les données des cours, l'état du chargement, les erreurs et la fonction refetch
 */
export const useCoursesData = (refreshTrigger = 0) => {
    const { data: coursesData, loading, error, refetch } = useFetchData(
        'quiz_api.php',
        {
            action: "get_all_quizzes_with_details",
            include_inactive: true,
        },
        "data",
        refreshTrigger
    );

    // Traitement et formatage des données des cours
    const processedCourses = coursesData ? coursesData.map(course => ({
        ...course,
        // Ajouter des propriétés formatées si nécessaire
        name_display: course.name || 'Nom non défini',
        description_display: course.description || 'Description non disponible',
        description_preview: course.description ?
            (course.description.length > 100 ?
                course.description.substring(0, 100) + '...' :
                course.description) : 'Description non disponible'
    })) : [];

    return {
        courses: processedCourses,
        loading,
        error,
        refetch
    };
};

/**
 * Fonction legacy pour la compatibilité (optionnel)
 * Tu peux garder cette fonction si d'autres parties de ton code l'utilisent encore
 */
export const fetchQuestions = async (updateQuestionsState, preventLoadingState = false) => {
    try {
        if (!preventLoadingState) {
            updateQuestionsState({ loading: true, error: null });
        }
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const apiResponse = await response.json();

        if (!apiResponse.success || !apiResponse.data) {
            throw new Error('Format de réponse API invalide');
        }

        // Traitement et formatage des données
        const processedData = apiResponse.data.map(course => ({
            ...course,
            name_display: course.name || 'Nom non défini',
            description_display: course.description || 'Description non disponible',
            description_preview: course.description ?
                (course.description.length > 100 ?
                    course.description.substring(0, 100) + '...' :
                    course.description) : 'Description non disponible'
        }));

        updateQuestionsState({ data: processedData, loading: false });
        return processedData;

    } catch (err) {
        console.error('Erreur lors du chargement des cours:', err);
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
        const response = await fetch('http://localhost/CRUDPHP/api/questions_api.php', {
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
        const response = await fetch('http://localhost/CRUDPHP/api/questions_api.php', {
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
        const response = await fetch('http://localhost/CRUDPHP/api/questions_api.php', {
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