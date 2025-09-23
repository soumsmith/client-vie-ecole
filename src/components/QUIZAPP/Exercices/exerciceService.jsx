/**
 * Service pour la gestion des exercices
 */

import useFetchData from '../../hooks/useFetchData'; // Assure-toi d'avoir le bon chemin d'import

const API_URL = "courses-api.php";

/**
 * Hook pour récupérer les exercices depuis l'API
 * @param {number} refreshTrigger - Déclencheur pour rafraîchir les données
 * @param {Object} filters - Filtres optionnels pour la recherche
 * @returns {Object} Les données des exercices, l'état du chargement, les erreurs et la fonction refetch
 */
export const useExercisesData = (refreshTrigger = 0, filters = {}) => {
    const { data: exercisesData, loading, error, refetch } = useFetchData(
        'courses-api.php', 
        { 
            action: "get_exercises_list",
        },
        "data",
        refreshTrigger
    );

   

    // Traitement et formatage des données des exercices
    const processedExercises = exercisesData ? exercisesData.map(exercise => ({
        ...exercise,
        // Ajouter des propriétés formatées si nécessaire
        title_display: exercise.title || 'Titre non défini',
        description_display: exercise.description || 'Description non disponible',
        description_preview: exercise.description ? 
            (exercise.description.length > 100 ? 
                exercise.description.substring(0, 100) + '...' : 
                exercise.description) : 'Description non disponible',
        exercise_type_display: getExerciseTypeLabel(exercise.exercise_type),
        difficulty_display: exercise.difficulty_name || 'Non défini',
        duration_display: `${exercise.estimated_duration || 0} min`,
        points_display: `${exercise.points || 0} pts`,
        // Statistiques formatées
        usage_display: `${exercise.usage_stats?.total_attempts || 0} tentative(s)`,
        completion_rate: exercise.usage_stats?.total_attempts > 0 
            ? Math.round((exercise.usage_stats.completions / exercise.usage_stats.total_attempts) * 100)
            : 0,
        // Associations formatées
        associations_summary: `${exercise.associations_count?.courses || 0} cours, ${exercise.associations_count?.lessons || 0} leçons, ${exercise.associations_count?.questions || 0} questions`
    })) : [];

    

    return { 
        exercices: processedExercises, 
        loading, 
        error, 
        refetch 
    };
};

/**
 * Hook pour récupérer les statistiques globales des exercices
 * @param {number} refreshTrigger - Déclencheur pour rafraîchir les données
 * @returns {Object} Les statistiques des exercices
 */
export const useExercisesStats = (refreshTrigger = 0) => {
    const { data: statsData, loading, error, refetch } = useFetchData(
        'courses-api.php', 
        { action: "get_exercises_stats" },
        "data",
        refreshTrigger
    );

    return { 
        stats: statsData, 
        loading, 
        error, 
        refetch 
    };
};

/**
 * Fonction utilitaire pour obtenir le libellé du type d'exercice
 * @param {string} exerciseType - Type d'exercice
 * @returns {string} Libellé formaté
 */
const getExerciseTypeLabel = (exerciseType) => {
    const typeLabels = {
        'text': 'Texte',
        'pdf': 'PDF',
        'image': 'Image',
        'video': 'Vidéo',
        'link': 'Lien externe',
        'interactive': 'Interactif',
        'mixed': 'Mixte'
    };
    
    return typeLabels[exerciseType] || exerciseType || 'Non défini';
};

/**
 * Fonction utilitaire pour obtenir la couleur du type d'exercice
 * @param {string} exerciseType - Type d'exercice
 * @returns {string} Couleur CSS
 */
export const getExerciseTypeColor = (exerciseType) => {
    const typeColors = {
        'text': '#007bff',
        'pdf': '#dc3545',
        'image': '#28a745',
        'video': '#6f42c1',
        'link': '#fd7e14',
        'interactive': '#17a2b8',
        'mixed': '#6c757d'
    };
    
    return typeColors[exerciseType] || '#6c757d';
};

/**
 * Fonction utilitaire pour obtenir la couleur de la difficulté
 * @param {string} difficulty - Niveau de difficulté
 * @returns {string} Couleur CSS
 */
export const getDifficultyColor = (difficulty) => {
    const difficultyColors = {
        'Facile': '#28a745',
        'Moyen': '#fd7e14',
        'Difficile': '#dc3545'
    };
    
    return difficultyColors[difficulty] || '#6c757d';
};

/**
 * Récupère les détails complets d'un exercice
 * @param {number} exerciseId - ID de l'exercice
 * @returns {Promise} Promesse contenant les détails de l'exercice
 */
export const fetchExerciseDetails = async (exerciseId) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: 'get_exercise_complete',
                exercise_id: exerciseId
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const apiResponse = await response.json();

        if (!apiResponse.success) {
            throw new Error(apiResponse.error || 'Erreur lors de la récupération de l\'exercice');
        }

        return apiResponse.data;

    } catch (err) {
        console.error('Erreur lors du chargement de l\'exercice:', err);
        throw err;
    }
};

/**
 * Supprime un exercice
 * @param {number} exerciseId - ID de l'exercice à supprimer
 * @returns {Promise} Promesse de suppression
 */
export const deleteExercise = async (exerciseId) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete_exercise_complete',
                exercise_id: exerciseId
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
        console.error('Erreur lors de la suppression de l\'exercice:', error);
        throw error;
    }
};

/**
 * Fonction legacy pour la compatibilité avec l'ancien code
 * @param {Function} updateExercisesState - Fonction pour mettre à jour l'état
 * @param {boolean} preventLoadingState - Empêcher l'état de chargement
 * @returns {Promise} Promesse contenant les exercices
 */
export const fetchExercises = async (updateExercisesState, preventLoadingState = false) => {
    try {
        if (!preventLoadingState) {
            updateExercisesState({ loading: true, error: null });
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: 'get_exercises_list',
                limit: 100,
                offset: 0
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const apiResponse = await response.json();

        if (!apiResponse.success || !apiResponse.data) {
            throw new Error('Format de réponse API invalide');
        }

        // Traitement et formatage des données
        const processedData = apiResponse.data.map(exercise => ({
            ...exercise,
            title_display: exercise.title || 'Titre non défini',
            description_display: exercise.description || 'Description non disponible',
            description_preview: exercise.description ?
                (exercise.description.length > 100 ?
                    exercise.description.substring(0, 100) + '...' :
                    exercise.description) : 'Description non disponible',
            exercise_type_display: getExerciseTypeLabel(exercise.exercise_type)
        }));

        updateExercisesState({ data: processedData, loading: false });
        return processedData;

    } catch (err) {
        console.error('Erreur lors du chargement des exercices:', err);
        updateExercisesState({ 
            error: err.message, 
            loading: false 
        });
        throw err;
    }
};

/**
 * Crée un nouvel exercice
 * @param {Object} exerciseData - Données de l'exercice à créer
 * @returns {Promise} Promesse de création
 */
export const createExercise = async (exerciseData) => {
    try {
        const formData = new FormData();
        
        // Ajouter toutes les données de l'exercice
        Object.keys(exerciseData).forEach(key => {
            if (exerciseData[key] !== null && exerciseData[key] !== undefined) {
                if (typeof exerciseData[key] === 'object' && key !== 'exercise_file') {
                    formData.append(key, JSON.stringify(exerciseData[key]));
                } else {
                    formData.append(key, exerciseData[key]);
                }
            }
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
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
        console.error('Erreur lors de la création de l\'exercice:', error);
        throw error;
    }
};

/**
 * Met à jour un exercice existant
 * @param {number} exerciseId - ID de l'exercice à modifier
 * @param {Object} exerciseData - Nouvelles données de l'exercice
 * @returns {Promise} Promesse de modification
 */
export const updateExercise = async (exerciseId, exerciseData) => {
    try {
        const formData = new FormData();
        
        // Ajouter l'action et l'ID
        formData.append('action', 'update_exercise_complete');
        formData.append('exercise_id', exerciseId);
        
        // Ajouter toutes les données de l'exercice
        Object.keys(exerciseData).forEach(key => {
            if (exerciseData[key] !== null && exerciseData[key] !== undefined) {
                if (typeof exerciseData[key] === 'object' && key !== 'exercise_file') {
                    formData.append(key, JSON.stringify(exerciseData[key]));
                } else {
                    formData.append(key, exerciseData[key]);
                }
            }
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
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
        console.error('Erreur lors de la mise à jour de l\'exercice:', error);
        throw error;
    }
};