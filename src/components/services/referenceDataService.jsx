import { loadStores } from "./apiUtils";

/**
 * Service pour la gestion des données de référence
 */

/**
 * Charge toutes les données de référence nécessaires
 */
export const loadAllReferenceData = async (
  setReferenceData,
  updateQuestionsState
) => {
  const REFERENCE_DATA_API_URL = import.meta.env.VITE_REFERENCE_DATA_API_URL;

  try {
    const dataPromises = [
      // Domaines
      loadStores(
        { action: "get_domains" },
        REFERENCE_DATA_API_URL,
        (data) => setReferenceData((prev) => ({ ...prev, domaines: data })),
        { valueKey: "id", labelKey: "name" }
      ),
      // Types de questions
      loadStores(
        { action: "get_question_types" },
        REFERENCE_DATA_API_URL,
        (data) =>
          setReferenceData((prev) => ({ ...prev, typesQuestion: data })),
        { valueKey: "id", labelKey: "name" }
      ),
      // Niveaux premium
      loadStores(
        { action: "get_premium_levels" },
        REFERENCE_DATA_API_URL,
        (data) =>
          setReferenceData((prev) => ({ ...prev, niveauxPremium: data })),
        { valueKey: "id", labelKey: "name" }
      ),
      // Langues
      loadStores(
        { action: "get_languages" },
        REFERENCE_DATA_API_URL,
        (data) => setReferenceData((prev) => ({ ...prev, langues: data })),
        { valueKey: "id", labelKey: "name" }
      ),

      // Pays
      loadStores(
        { action: "get_countries" },
        REFERENCE_DATA_API_URL,
        (data) => setReferenceData((prev) => ({ ...prev, pays: data })),
        { valueKey: "id", labelKey: "name" }
      ),

      // Difficultés
      loadStores(
        { action: "get_difficulty_levels" },
        REFERENCE_DATA_API_URL,
        (data) => setReferenceData((prev) => ({ ...prev, difficultes: data })),
        { valueKey: "id", labelKey: "name" }
      ),
      


      // ===========================
      // GESTION DES DONNÉES DE COURS
      // ===========================
      // Cours
      loadStores(
        { action: "get_alllesson" },
        "courses-api.php",
        (data) => setReferenceData((prev) => ({ ...prev, cours: data })),
        { valueKey: "id", labelKey: "name" }
      ),
      // Leçons
      loadStores(
        { action: "get_allcours" },
        "courses-api.php",
        (data) => setReferenceData((prev) => ({ ...prev, lecons: data })),
        { valueKey: "id", labelKey: "name" }
      ),

      // ===========================
      // GESTION DES DONNÉES DE QUESTIONS
      // ===========================
      
      // Types de réponses
      loadStores(
        { action: "get_answer_types" },
        REFERENCE_DATA_API_URL,
        (data) =>
          setReferenceData((prev) => ({ ...prev, typesReponse: data })),
        { valueKey: "id", labelKey: "name" }
      ),  

      // Catégories de questions
      loadStores(
        { action: "get_question_categories" },
        REFERENCE_DATA_API_URL,
        (data) =>
          setReferenceData((prev) => ({ ...prev, categoriesQuestion: data })),
        { valueKey: "id", labelKey: "name" }
      ),  

    ];

    await Promise.all(dataPromises);
  } catch (error) {
    console.error("Erreur lors du chargement des données de référence:", error);
    if (updateQuestionsState) {
      updateQuestionsState({
        error: "Erreur lors du chargement des données de référence",
      });
    }
    throw error;
  }
};

/**
 * Charge les sous-domaines basés sur le domaine sélectionné
 */
export const loadSubDomains = async (domainId, setReferenceData) => {
  const REFERENCE_DATA_API_URL = import.meta.env.VITE_REFERENCE_DATA_API_URL;
  if (domainId) {
    try {
      await loadStores(
        { action: "get_sub_domains", domain_id: domainId },
        REFERENCE_DATA_API_URL,
        (data) => setReferenceData((prev) => ({ ...prev, sousdomaines: data })),
        { valueKey: "id", labelKey: "name" }
      );
    } catch (error) {
      console.error("Erreur lors du chargement des sous-domaines:", error);
      throw error;
    }
  } else {
    setReferenceData((prev) => ({ ...prev, sousdomaines: [] }));
  }
};

/**
 * Charge les données de contexte pour les exercices
 */
export const fetchContextData = async (contextType, updateContextState) => {
  const CONTEXTS_API_URL = "http://localhost/CRUDPHPcourses-api.php";

  try {
    updateContextState(contextType, { loading: true, error: null });

    let action = "";
    switch (contextType) {
      case "domains":
        action = "get_domains";
        break;
      case "subDomains":
      case "courses":
      case "lessons":
        action = "get_exercise_contexts";
        break;
      default:
        throw new Error(`Type de contexte inconnu: ${contextType}`);
    }

    const response = await fetch(CONTEXTS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Erreur lors du chargement");
    }

    let processedData = [];

    if (contextType === "domains") {
      processedData = result.data || [];
    } else {
      // Pour get_exercise_contexts
      switch (contextType) {
        case "subDomains":
          processedData = result.data?.sub_domains || [];
          break;
        case "courses":
          processedData = result.data?.courses || [];
          break;
        case "lessons":
          processedData = result.data?.lessons || [];
          break;
      }
    }

    updateContextState(contextType, {
      data: processedData,
      loading: false,
    });

    return processedData;
  } catch (err) {
    console.error(`Erreur lors du chargement de ${contextType}:`, err);
    updateContextState(contextType, {
      error: err.message,
      loading: false,
    });
    throw err;
  }
};
