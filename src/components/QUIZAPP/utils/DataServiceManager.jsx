/**
 * Service pour la gestion des exercices
 */

import useFetchData from '../../hooks/useFetchData'; // Assure-toi d'avoir le bon chemin d'import

const API_URL = "courses-api.php";

const getQuestionTypeLabel = (typeCode) => {
    const types = {
        'MCQ': 'Choix multiple',
        'TF': 'Vrai/Faux',
        'SA': 'Réponse courte',
        'LA': 'Réponse longue',
        'NUM': 'Numérique',
        'MAT': 'Correspondance',
        'ORD': 'Classement',
        'FIB': 'Texte à trous',
        'DND': 'Glisser-déposer',
        'HOT': 'Zone cliquable'
    };
    return types[typeCode] || typeCode || 'Non défini';
};

// Fonction utilitaire pour formater la difficulté
const getDifficultyLabel = (difficultyLevel) => {
    const levels = {
        1: 'Facile',
        2: 'Moyen', 
        3: 'Difficile',
        4: 'Expert',
        5: 'Maître'
    };
    return levels[difficultyLevel] || 'Non défini';
};

// Fonction utilitaire pour formater le taux de réussite
const formatSuccessRate = (rate) => {
    const numRate = parseFloat(rate);
    return isNaN(numRate) ? '0%' : `${Math.round(numRate)}%`;
};

// Fonction utilitaire pour formater les tags
const formatTags = (tags) => {
    if (!tags) return [];
    if (typeof tags === 'string') {
        return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return Array.isArray(tags) ? tags : [];
};


/**
 * Hook pour récupérer les exercices depuis l'API
 * @param {number} refreshTrigger - Déclencheur pour rafraîchir les données
 * @param {Object} filters - Filtres optionnels pour la recherche
 * @returns {Object} Les données des exercices, l'état du chargement, les erreurs et la fonction refetch
 */
export const useQuestionsData = (refreshTrigger = 0, filters = {}) => {
    const { data: responseData, loading, error, refetch } = useFetchData(
        'questions_api.php', 
        { 
            action: "get_all_questions",
            //...filters
        },
        "data", // Chemin corrigé pour accéder aux questions
        refreshTrigger
    );
    

    // Traitement et formatage des données des questions
    const processedQuestions = responseData?.questions ? responseData?.questions.map(question => {
        // Calcul des statistiques des réponses
        const answers = question.answers || [];
        const correctAnswers = answers.filter(answer => answer.is_correct);
        const incorrectAnswers = answers.filter(answer => !answer.is_correct);

        // Formatage des tags
        const formattedTags = formatTags(question.tags);

        return {
            ...question,
            
            // === AFFICHAGE PRINCIPAL ===
            content_display: question.content || 'Contenu non défini',
            content_preview: question.content ? 
                (question.content.length > 150 ? 
                    question.content.substring(0, 150) + '...' : 
                    question.content) : 'Contenu non défini',
            
            // === TYPE ET CATÉGORISATION ===
            type_display: question.type_name || getQuestionTypeLabel(question.type_code),
            type_code_display: question.type_code || 'N/A',
            domain_display: question.domain_name || 'Non défini',
            sub_domain_display: question.sub_domain_name || 'Non défini',
            category_full: question.domain_name && question.sub_domain_name ? 
                `${question.domain_name} > ${question.sub_domain_name}` : 
                question.domain_name || 'Non catégorisé',
            
            // === DIFFICULTÉ ET CONFIGURATION ===
            difficulty_display: question.difficulty_name || getDifficultyLabel(question.difficulty_level),
            difficulty_level_num: question.difficulty_level || 1,
            difficulty_color: {
                1: 'success',
                2: 'info', 
                3: 'warning',
                4: 'error',
                5: 'violet'
            }[question.difficulty_level] || 'gray',
            
            // === POINTS ET TEMPS ===
            points_display: `${question.points || 0} pts`,
            points_num: parseInt(question.points) || 0,
            time_limit_display: question.time_limit ? `${question.time_limit}s` : 'Illimité',
            time_limit_minutes: question.time_limit ? Math.ceil(question.time_limit / 60) : null,
            
            // === STATISTIQUES D'UTILISATION ===
            usage_count_display: `${question.usage_count || 0} utilisation(s)`,
            success_rate_display: formatSuccessRate(question.success_rate),
            success_rate_num: parseFloat(question.success_rate) || 0,
            complexity_score_display: question.complexity_score ? 
                `${parseFloat(question.complexity_score).toFixed(1)}/5` : 'N/A',
            complexity_score_num: parseFloat(question.complexity_score) || 0,
            
            // === MÉTADONNÉES ===
            author_display: question.author_name || 'Auteur inconnu',
            language_display: question.language_name || 'Non spécifié',
            country_display: question.country_name || 'Non spécifié',
            
            // === DATES FORMATÉES ===
            created_display: question.created_at ? 
                new Date(question.created_at).toLocaleDateString('fr-FR') : 'N/A',
            updated_display: question.updated_at ? 
                new Date(question.updated_at).toLocaleDateString('fr-FR') : 'N/A',
            is_recent: question.created_at ? 
                (new Date() - new Date(question.created_at)) < (7 * 24 * 60 * 60 * 1000) : false,
            
            // === CONTENU STRUCTURÉ ===
            explanation_display: question.explanation || 'Aucune explication',
            explanation_preview: question.explanation ? 
                (question.explanation.length > 100 ? 
                    question.explanation.substring(0, 100) + '...' : 
                    question.explanation) : 'Aucune explication',
            
            // === TAGS ET MOTS-CLÉS ===
            tags_array: formattedTags,
            tags_display: formattedTags.length > 0 ? formattedTags.join(', ') : 'Aucun tag',
            tags_count: formattedTags.length,
            
            // === STATISTIQUES DES RÉPONSES ===
            answers_count: question.stats?.answers_count || answers.length,
            correct_answers_count: question.stats?.correct_answers_count || correctAnswers.length,
            answers_summary: `${answers.length} réponse(s), ${correctAnswers.length} correcte(s)`,
            has_multiple_correct: correctAnswers.length > 1,
            
            // === MÉDIAS ET SOURCES ===
            media_count: question.stats?.media_count || (question.media || []).length,
            sources_count: question.stats?.sources_count || (question.sources || []).length,
            has_media: (question.media || []).length > 0,
            has_sources: (question.sources || []).length > 0,
            resources_summary: `${question.stats?.media_count || 0} média(s), ${question.stats?.sources_count || 0} source(s)`,
            
            // === STATUT ET VALIDATION ===
            active_display: question.active ? 'Actif' : 'Inactif',
            status_color: question.active ? 'success' : 'error',
            is_complete: question.content && answers.length > 0 && correctAnswers.length > 0,
            completeness_score: (() => {
                let score = 0;
                if (question.content) score += 25;
                if (answers.length > 0) score += 25;
                if (correctAnswers.length > 0) score += 25;
                if (question.explanation) score += 10;
                if (formattedTags.length > 0) score += 10;
                if ((question.sources || []).length > 0) score += 5;
                return Math.min(score, 100);
            })(),
            
            // === DONNÉES POUR LES FILTRES ===
            domain_id_num: parseInt(question.domain_id) || null,
            sub_domain_id_num: parseInt(question.sub_domain_id) || null,
            type_id_num: parseInt(question.type_id) || null,
            
            // === DONNÉES ORIGINALES POUR LA SÉLECTION ===
            raw_answers: answers,
            raw_media: question.media || [],
            raw_sources: question.sources || [],
            raw_stats: question.stats || {}
        };
    }) : [];

    console.log("Questions formatées:", processedQuestions);

    return { 
        questionData: processedQuestions, 
        loading, 
        error, 
        refetch 
    };
};