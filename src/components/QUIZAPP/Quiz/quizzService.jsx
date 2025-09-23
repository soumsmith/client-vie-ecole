/**
 * Service pour la gestion des questions
 */
import useFetchData from "../../hooks/useFetchData"; // Assure-toi d'avoir le bon chemin d'import
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Badge } from 'rsuite';


const API_URL =
  "http://localhost/CRUDPHP/api/questions_api.php?action=get_all_questions";

/**
 * Récupère les questions depuis l'API
 */
export const fetchQuestions = async (
  updateQuestionsState,
  preventLoadingState = false
) => {
  try {
    if (!preventLoadingState) {
      updateQuestionsState({ loading: true, error: null });
    }

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erreur HTTP: ${response.status} - ${response.statusText}`
      );
    }

    const apiResponse = await response.json();

    if (
      !apiResponse.success ||
      !apiResponse.data ||
      !apiResponse.data.questions
    ) {
      throw new Error("Format de réponse API invalide");
    }

    // Traitement et formatage des données
    const processedData = apiResponse.data.questions.map((question) => ({
      ...question,
      difficulty_display: question.difficulty_name || "Non défini",
      type_display: question.type_name || "Non défini",
      domain_display: question.domain_name || "Non défini",
      answers_summary: `${question.stats?.correct_answers_count || 0}/${
        question.stats?.answers_count || 0
      }`,
      content_preview: question.content
        ? question.content.length > 100
          ? question.content.substring(0, 100) + "..."
          : question.content
        : "Contenu non disponible",
      created_date: question.created_at
        ? new Date(question.created_at).toLocaleDateString("fr-FR")
        : "",
      last_modified: question.updated_at || question.created_at,
      media_types: question.media
        ? [...new Set(question.media.map((m) => m.media_type))].join(", ")
        : "",
    }));

    updateQuestionsState({ data: processedData, loading: false });
    return processedData;
  } catch (err) {
    console.error("Erreur lors du chargement des questions:", err);
    updateQuestionsState({
      error: err.message,
      loading: false,
    });
    throw err;
  }
};

/**
 * Crée une nouvelle question
 */
export const createQuestion = async (questionData) => {
  try {
    const response = await fetch(
      "http://localhost/CRUDPHP/api/questions_api.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_question",
          ...questionData,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Erreur lors de la création");
    }

    return result;
  } catch (error) {
    console.error("Erreur lors de la création de la question:", error);
    throw error;
  }
};

/**
 * Met à jour une question existante
 */
export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await fetch(
      "http://localhost/CRUDPHP/api/questions_api.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_question",
          id: questionId,
          ...questionData,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Erreur lors de la mise à jour");
    }

    return result;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la question:", error);
    throw error;
  }
};

/**
 * Supprime une question
 */
export const deleteQuestion = async (questionId) => {
  try {
    const response = await fetch(
      "http://localhost/CRUDPHP/api/questions_api.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete_question",
          id: questionId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Erreur lors de la suppression");
    }

    return result;
  } catch (error) {
    console.error("Erreur lors de la suppression de la question:", error);
    throw error;
  }
};

export const useQuizData = (refreshTrigger = 0) => {
  const {
    data: responseData,
    loading,
    error,
    refetch,
  } = useFetchData(
    "quiz_api.php",
    {
      action: "get_quizzes",
    },
    "data",
    refreshTrigger,
    {
      Authorization: "Bearer token_xyz",
      "Content-Type": "application/json",
    }
  );

  // Traitement et formatage des données de quiz
  const processedQuizzes = responseData?.quizzes
    ? responseData.quizzes.map((quiz) => ({
        ...quiz,
        title_display: quiz.title || "Titre non défini",
        description_display: quiz.description || "Description non disponible",
        description_preview: quiz.description
          ? quiz.description.length > 100
            ? quiz.description.substring(0, 100) + "..."
            : quiz.description
          : "Description non disponible",
        difficulty_display: quiz.difficulty_name || "Difficulté non définie",
        course_display: quiz.course_title || "Cours non défini",
        country_display: quiz.country_name || "Pays non défini",
        created_at_display: quiz.created_at
          ? new Date(quiz.created_at).toLocaleString()
          : "Date inconnue",
      }))
    : [];

  return {
    quizzes: processedQuizzes,
    loading,
    error,
    refetch,
  };
};




export const quizTableConfig = {
  columns: [
    {
      title: 'Titre du Quiz',
      dataKey: 'title_display',
      flexGrow: 2,
      minWidth: 300, // ✅ Augmenté pour forcer le scroll horizontal
      cellType: 'avatar',
      avatarGenerator: (rowData) => {
        if (rowData.title) return rowData.title.charAt(0).toUpperCase();
        if (rowData.title_display) return rowData.title_display.charAt(0).toUpperCase();
        return 'Q';
      },
      avatarColor: '#2980b9',
      subField: 'description_preview',
      sortable: true
    },
    {
      title: 'Description',
      dataKey: 'description_display',
      flexGrow: 2,
      minWidth: 250, // ✅ Ajouté pour forcer le scroll horizontal
      cellType: 'text',
      sortable: true
    },
    {
      title: 'Points',
      dataKey: 'total_points',
      flexGrow: 1,
      minWidth: 100, // ✅ Défini explicitement
      align: 'center',
      cellType: 'text',
      sortable: true
    },
    {
      title: 'Difficulté',
      dataKey: 'difficulty_name',
      flexGrow: 1,
      minWidth: 130, // ✅ Ajouté pour forcer le scroll horizontal
      cellType: 'badge',
      badgeColorMap: (value) => {
        if (value === 'Facile') return 'green';
        if (value === 'Moyen') return 'orange';
        if (value === 'Difficile') return 'red';
        return 'gray';
      },
      sortable: true
    },
    {
      title: 'Statut',
      dataKey: 'active',
      flexGrow: 1,
      minWidth: 110, // ✅ Ajouté pour forcer le scroll horizontal
      cellType: 'badge',
      customRenderer: (rowData, cellValue) => (
        <Badge color={cellValue ? 'green' : 'red'}>
          {cellValue ? 'Actif' : 'Inactif'}
        </Badge>
      ),
      sortable: true
    },
    {
      title: 'Actions',
      dataKey: 'actions',
      flexGrow: 1,
      minWidth: 160, // ✅ Ajouté pour forcer le scroll horizontal
      cellType: 'actions',
      fixed: 'right'
    }
  ],
  filterConfigs: [
    {
      field: 'title',
      label: 'Titre',
      placeholder: 'Rechercher par titre',
      type: 'text',
      tagColor: 'blue'
    },
    {
      field: 'description',
      label: 'Description',
      placeholder: 'Rechercher par description',
      type: 'text',
      tagColor: 'green'
    },
    {
      field: 'difficulty_name',
      label: 'Difficulté',
      placeholder: 'Toutes les difficultés',
      type: 'select',
      options: [
        { value: '', label: 'Toutes les difficultés' }, // ✅ Ajout de l'option "Toutes"
        { value: 'Facile', label: 'Facile' },
        { value: 'Moyen', label: 'Moyen' },
        { value: 'Difficile', label: 'Difficile' }
      ],
      tagColor: 'purple'
    },
    {
      field: 'active',
      label: 'Statut',
      placeholder: 'Tous les statuts',
      type: 'select',
      options: [
        { value: '', label: 'Tous les statuts' }, // ✅ Ajout de l'option "Tous"
        { value: true, label: 'Actif' },
        { value: false, label: 'Inactif' }
      ],
      tagColor: 'orange'
    }
  ],
  searchableFields: [
    'title',
    'title_display',
    'description',
    'description_display',
    'description_preview',
    'domain_name',
    'difficulty_name'
  ],
  actions: [
    {
      type: 'view',
      icon: <FiEye />,
      tooltip: 'Voir les détails du quiz',
      color: '#3498db'
    },
    {
      type: 'edit',
      icon: <FiEdit />,
      tooltip: 'Modifier le quiz',
      color: '#f39c12'
    },
    {
      type: 'delete',
      icon: <FiTrash2 />,
      tooltip: 'Supprimer le quiz',
      color: '#e74c3c'
    }
  ]
};


