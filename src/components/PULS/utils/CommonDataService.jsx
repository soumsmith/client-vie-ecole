/**
 * Service centralisé pour la gestion des données communes
 * Classes, Niveaux, Branches, Matières, Périodes, Élèves, Fonctions
 * VERSION OPTIMISÉE avec cache et gestion d'erreurs
 * REFACTORING : Utilise la configuration centralisée des URLs
 * MISE À JOUR : Hook useMatieresData unifié pour supporter les deux approches
 */

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getFromCache, setToCache } from "./cacheUtils";
import { getUserProfile } from "../../hooks/userUtils";
import { 
  useAllApiUrls,
  useAppParams,
  useClassesUrls,
  useNiveauxUrls,
  useBranchesUrls,
  useMatieresUrls,
  usePersonnelUrls,
  usePeriodesUrls,
  useElevesUrls,
  useMessagesUrls,
  useFonctionsUrls,
  useAnneesUrls,
  useEvaluationsUrls
} from "./apiConfig";


// ===========================
// CONFIGURATION GLOBALE
// ===========================
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
//let userProfile = localStorage.getItem('userProfile');


// ===========================
// FONCTIONS UTILITAIRES POUR MATIÈRES
// ===========================
const determineTypeMatiere = (categorieLibelle) => {
  if (!categorieLibelle) return "autre";
  const categorie = categorieLibelle.toLowerCase();

  if (categorie.includes("fondamental") || categorie.includes("principal"))
    return "fondamental";
  if (categorie.includes("option") || categorie.includes("spécialité"))
    return "option";
  if (categorie.includes("langues")) return "langue";
  if (categorie.includes("sciences")) return "science";
  if (categorie.includes("art") || categorie.includes("sport"))
    return "art_sport";

  return "autre";
};

const getCouleurTypeMatiere = (type) => {
  const couleurs = {
    fondamental: "#3B82F6", // Bleu
    option: "#10B981", // Vert
    langue: "#F59E0B", // Orange
    science: "#8B5CF6", // Violet
    art_sport: "#EF4444", // Rouge
    autre: "#6B7280", // Gris
  };
  return couleurs[type] || couleurs.autre;
};

// ===========================
// HOOK POUR RÉCUPÉRER LES CLASSES PAR BRANCHE
// ===========================
export const useClassesByBrancheData = (ecoleId = null, refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const classesUrls = useClassesUrls();
  const finalEcoleId = ecoleId || appParams.ecoleId;

  const fetchClasses = useCallback(async (brancheId) => {
    if (!brancheId) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const cacheKey = `classes-branche-${brancheId}-${finalEcoleId}`;
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // Utilisation de l'URL centralisée
      const url = classesUrls.getVisibleByBranche(brancheId, finalEcoleId);
      const response = await axios.get(url);

      // Traitement des classes
      let processedClasses = [];
      if (response.data && Array.isArray(response.data)) {
        processedClasses = response.data.map((classe, index) => ({
          value: classe.id,
          label: classe.libelle,
          id: classe.id || `temp-${index}`,
          code: classe.code || "",
          libelle: classe.libelle || "Classe sans nom",
          effectif: parseInt(classe.effectif || 0),
          visible: classe.visible || 0,
          branche_id: classe.branche?.id || brancheId,
          branche_libelle: classe.branche?.libelle || "",
          ecole_id: classe.ecole?.id || finalEcoleId,
          ecole_libelle: classe.ecole?.libelle || "",
          ecole_code: classe.ecole?.code || "",
          ecole_tel: classe.ecole?.tel || "",
          ecole_signataire: classe.ecole?.nomSignataire || "",
          langueVivante: classe.langueVivante?.libelle || "",
          langueVivante_code: classe.langueVivante?.code || "",
          langueVivante_type: classe.langueVivante?.type || "",
          niveau: classe.branche?.niveau?.libelle || "",
          serie: classe.branche?.serie?.libelle || "",
          filiere: classe.branche?.filiere?.libelle || "",
          programme: classe.branche?.programme?.libelle || "",
          display_text: `${classe.libelle} (${classe.effectif || 0} élèves)`,
          raw_data: classe,
        }));
      }

      setToCache(cacheKey, processedClasses);
      setData(processedClasses);
    } catch (err) {
      setError({
        message:
          err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des classes",
        type: err.name || "FetchError",
        code: err.response?.status || err.code || "UNKNOWN",
        details: err.response?.data,
        url: err.config?.url,
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [classesUrls, finalEcoleId]);

  const clearClasses = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    classes: data,
    loading,
    error,
    fetchClasses,
    clearClasses,
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES CLASSES
// ===========================
export const useClassesData = (refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const classesUrls = useClassesUrls();
  const personnelUrls = usePersonnelUrls();
  const userProfile = getUserProfile();

  const fetchClasses = useCallback(
    
    async (skipCache = false) => {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = `common-classes-data-${appParams.ecoleId}`;
 
        if (!skipCache) {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        let response;
        let url;
        console.log("🔄 userProfile:", userProfile);

        if (userProfile === "Professeur") {
          url = personnelUrls.getMatiereClasseByProf();
          response = await axios.get(url);
        } else if (userProfile === "Fondateur") {

          url = classesUrls.listByEcoleSorted();
          response = await axios.get(url);
        }

        let processed = [];

        if (response.data && Array.isArray(response.data)) {
          if (userProfile === "Professeur") {
            // Pour le professeur : la classe est dans response.data[].classe
            processed = response.data.map((item) => {
              const classe = item.classe;
              return {
                value: classe.id,
                label: classe.libelle,
                id: classe.id,
                niveau: classe.branche?.niveau?.libelle || "",
                serie: classe.branche?.serie?.libelle || "",
                raw_data: classe,
              };
            });
          } else if (userProfile === "Fondateur") {
            // Pour le fondateur : la classe est directement dans response.data[]
            processed = response.data.map((classe) => ({
              value: classe.id,
              label: classe.libelle,
              id: classe.id,
              niveau: classe.branche?.niveau?.libelle || "",
              serie: classe.branche?.serie?.libelle || "",
              raw_data: classe,
            }));
          }
        }

        setToCache(cacheKey, processed, CACHE_DURATION);
        setData(processed);
      } catch (err) {
        console.error("Erreur lors de la récupération des classes:", err);
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des classes",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
          url: err.config?.url,
        });
      } finally {
        setLoading(false);
      }
    },
    [appParams, classesUrls, personnelUrls]
  );

  useEffect(() => {
    if (userProfile) {
      fetchClasses(false);
    }
  }, [appParams.ecoleId, refreshTrigger, fetchClasses]);

  return {
    classes: data,
    loading,
    error,
    refetch: () => fetchClasses(true),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES NIVEAUX
// ===========================
export const useNiveauxData = (ecoleId = null, refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const niveauxUrls = useNiveauxUrls();
  const finalEcoleId = ecoleId || appParams.ecoleId;

  const fetchNiveaux = useCallback(
    async (skipCache = false) => {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = `common-niveaux-data-${finalEcoleId}`;

        if (!skipCache) {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        const url = niveauxUrls.getVisibleByBranche(finalEcoleId);
        const response = await axios.get(url);
        
        const processed =
          response.data && Array.isArray(response.data)
            ? response.data.map((niveau) => ({
                value: niveau.id,
                label: niveau.libelle,
                id: niveau.id,
                code: niveau.code || "",
                raw_data: niveau,
              }))
            : [];

        setToCache(cacheKey, processed, CACHE_DURATION);
        setData(processed);
      } catch (err) {
        console.error("Erreur lors de la récupération des niveaux:", err);
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des niveaux",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
          url: err.config?.url,
        });
      } finally {
        setLoading(false);
      }
    },
    [finalEcoleId, niveauxUrls]
  );

  useEffect(() => {
    if (finalEcoleId) {
      console.log("🔄 UseEffect Niveaux déclenché pour école:", finalEcoleId);
      fetchNiveaux(false);
    }
  }, [finalEcoleId, refreshTrigger, fetchNiveaux]);

  return {
    niveaux: data,
    loading,
    error,
    refetch: () => fetchNiveaux(true),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES BRANCHES (VERSION AVANCÉE)
// ===========================
export const useNiveauxBranchesData = (ecoleId = null, refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const branchesUrls = useBranchesUrls();
  const finalEcoleId = ecoleId || appParams.ecoleId;

  const fetchNiveauxBranches = useCallback(
    async (skipCache = false) => {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = `niveaux-branches-data-${finalEcoleId}`;

        // Vérifier le cache
        if (!skipCache) {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        // Utilisation de l'URL centralisée
        const url = branchesUrls.getByNiveauEnseignement(finalEcoleId);
        const response = await axios.get(url);

        // Traitement simple et direct des données
        let processedBranches = [];
        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          processedBranches = response.data.map((branche) => {
            // Construction du libellé d'affichage
            let displayText = branche.libelle || "Branche sans nom";

            // Ajouter les informations supplémentaires si disponibles
            const additionalInfo = [];
            if (branche.filiere?.libelle) {
              additionalInfo.push(branche.filiere.libelle);
            }
            if (branche.serie?.libelle) {
              additionalInfo.push(`Série ${branche.serie.libelle}`);
            }
            if (
              branche.programme?.libelle &&
              branche.programme.libelle !== branche.filiere?.libelle
            ) {
              additionalInfo.push(branche.programme.libelle);
            }

            if (additionalInfo.length > 0) {
              displayText += ` (${additionalInfo.join(" - ")})`;
            }

            return {
              // Propriétés essentielles pour SelectPicker
              value: branche.id,
              label: displayText,

              // Données complètes de la branche
              id: branche.id,
              libelle: branche.libelle,

              // Informations de niveau
              niveau_id: branche.niveau?.id || null,
              niveau_libelle: branche.niveau?.libelle || "",
              niveau_ordre: branche.niveau?.ordre || 0,

              // Informations de filière et série
              filiere_libelle: branche.filiere?.libelle || "",
              serie_libelle: branche.serie?.libelle || "",
              programme_libelle: branche.programme?.libelle || "",

              // Niveau d'enseignement pour regroupement
              niveauEnseignement_id: branche.niveauEnseignement?.id || null,
              niveauEnseignement_libelle:
                branche.niveauEnseignement?.libelle || "Non classé",

              // Données brutes
              raw_data: branche,
            };
          });

          // Tri par ordre de niveau puis par libellé
          processedBranches.sort((a, b) => {
            if (a.niveau_ordre !== b.niveau_ordre) {
              return a.niveau_ordre - b.niveau_ordre;
            }
            return a.libelle.localeCompare(b.libelle);
          });
        }

        setToCache(cacheKey, processedBranches, CACHE_DURATION);
        setData(processedBranches);
      } catch (err) {
        console.error("Erreur lors de la récupération des branches:", err);
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des branches",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
          url: err.config?.url,
        });
      } finally {
        setLoading(false);
      }
    },
    [finalEcoleId, branchesUrls]
  );

  useEffect(() => {
    if (finalEcoleId) {
      console.log("🔄 UseEffect Branches déclenché pour école:", finalEcoleId);
      fetchNiveauxBranches(false);
    }
  }, [finalEcoleId, refreshTrigger, fetchNiveauxBranches]);

  return {
    branches: data,
    loading,
    error,
    refetch: () => fetchNiveauxBranches(true),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES MATIÈRES PAR ÉCOLE (VERSION AVANCÉE)
// ===========================
export const useMatieresEcoleData = (ecoleId = null, refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const matieresUrls = useMatieresUrls();
  const finalEcoleId = ecoleId || appParams.ecoleId;

  const fetchMatieres = useCallback(
    async (skipCache = false) => {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = `matieres-ecole-data-${finalEcoleId}`;

        // Vérifier le cache
        if (!skipCache) {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        // Utilisation de l'URL centralisée
        const url = matieresUrls.getByEcoleViaNiveauEnseignement(finalEcoleId);
        const response = await axios.get(url);

        // Traitement des données de matières
        let processedMatieres = [];
        if (response.data && Array.isArray(response.data)) {
          processedMatieres = response.data.map((matiere, index) => {
            const categorie = matiere.categorie || {};
            const matiereParent = matiere.matiere || {};

            // Construction du libellé d'affichage
            let displayText = matiere.libelle || "Matière sans nom";

            // Ajouter des informations contextuelles
            const additionalInfo = [];
            if (categorie.libelle) {
              additionalInfo.push(categorie.libelle);
            }
            if (
              matiere.parentMatiereLibelle &&
              matiere.parentMatiereLibelle !== matiere.libelle
            ) {
              additionalInfo.push(
                `Sous-matière de ${matiere.parentMatiereLibelle}`
              );
            }

            if (additionalInfo.length > 0) {
              displayText += ` (${additionalInfo.join(" - ")})`;
            }

            return {
              // Propriétés essentielles pour SelectPicker
              value: matiere.id,
              label: displayText,

              // Données complètes de la matière
              id: matiere.id,
              code: matiere.code || "",
              libelle: matiere.libelle || "",

              // Informations de catégorie
              categorie_id: categorie.id || null,
              categorie_code: categorie.code || "",
              categorie_libelle: categorie.libelle || "",

              // Informations hiérarchiques
              parentMatiereLibelle: matiere.parentMatiereLibelle || "",
              numOrdre: matiere.numOrdre || 0,

              // Informations complémentaires
              bonus: matiere.bonus || 0,
              pec: matiere.pec || 0,

              // Niveau d'enseignement
              niveauEnseignement_id: matiere.niveauEnseignement?.id || null,
              niveauEnseignement_libelle:
                matiere.niveauEnseignement?.libelle || "",

              // École
              ecole_id: matiere.ecole?.id || finalEcoleId,
              ecole_libelle: matiere.ecole?.libelle || "",

              // Métadonnées
              dateCreation: matiere.dateCreation || "",
              dateUpdate: matiere.dateUpdate || "",

              // Affichage optimisé
              display_short: matiere.libelle,
              display_code: `${matiere.code} - ${matiere.libelle}`,
              display_categorie: categorie.libelle || "Non classée",

              // Type de matière pour classification
              type_matiere: determineTypeMatiere(categorie.libelle),
              couleur_type: getCouleurTypeMatiere(
                determineTypeMatiere(categorie.libelle)
              ),

              // Données brutes
              raw_data: matiere,
            };
          });

          // Tri par numéro d'ordre puis par libellé
          processedMatieres.sort((a, b) => {
            if (a.numOrdre !== b.numOrdre) {
              return a.numOrdre - b.numOrdre;
            }
            return a.libelle.localeCompare(b.libelle);
          });
        }

        setToCache(cacheKey, processedMatieres, CACHE_DURATION);
        setData(processedMatieres);
      } catch (err) {
        console.error("Erreur lors de la récupération des matières:", err);
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des matières",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
          url: err.config?.url,
        });
      } finally {
        setLoading(false);
      }
    },
    [finalEcoleId, matieresUrls]
  );

  useEffect(() => {
    if (finalEcoleId) {
      console.log("🔄 UseEffect Matières déclenché pour école:", finalEcoleId);
      fetchMatieres(false);
    }
  }, [finalEcoleId, refreshTrigger, fetchMatieres]);

  return {
    matieres: data,
    loading,
    error,
    refetch: () => fetchMatieres(true),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES MATIÈRES PAR CLASSE (VERSION UNIFIÉE)
// ===========================
export const useMatieresData = (
  classeId = null,
  ecoleId = null,
  refreshTrigger = 0
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const personnelUrls = usePersonnelUrls();
  const matieresUrls = useMatieresUrls();
  const finalEcoleId = ecoleId || appParams.ecoleId;

  // Fonction fetchMatieres exposée publiquement pour usage manuel
  const fetchMatieres = useCallback(
    async (targetClasseId, targetEcoleId = finalEcoleId, skipCache = false) => {
      console.log("🔄 fetchMatieres appelé avec:", {
        targetClasseId,
        targetEcoleId,
        skipCache,
      });

      if (!targetClasseId) {
        console.log("❌ Pas de classe fournie, nettoyage des matières");
        setData([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const cacheKey = `common-matieres-data-${targetClasseId}-${targetEcoleId}`;
        console.log("🔍 Utilisation de la clé de cache:", cacheKey);

        // Vérification du cache
        if (!skipCache) {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            console.log(
              "✅ Données trouvées en cache:",
              cachedData.length,
              "matières"
            );
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        console.log("🌐 Appel API pour récupérer les matières");
        let response;
        let url;

        if (userProfile === "Professeur") {
          url = personnelUrls.getMatiereClasseByProfClasse(
            appParams.personnelId,
            targetClasseId
          );
          response = await axios.get(url);
        } else if (userProfile === "Fondateur") {
          url = matieresUrls.getAllByBrancheViaClasse(targetClasseId, targetEcoleId);
          response = await axios.get(url);
        }

        let processed = [];
        processed = response.data.map((item, index) => {
          const matiere = item.matiere; // Extraire l'objet matière
          return {
            value: matiere.id || `temp-${index}`,
            label: matiere.libelle || "Matière sans nom",
            id: matiere.id || `temp-${index}`,
            code: matiere.code || "",
            libelle: matiere.libelle || "Matière sans nom",
            coef: parseFloat(matiere.coef || 1),
            numOrdre: parseInt(matiere.numOrdre || 0),
            pec: matiere.pec || null,
            bonus: matiere.bonus || null,
            raw_data: matiere,
          };
        });

        console.log("✅ Matières traitées:", processed.length);
        setToCache(cacheKey, processed, CACHE_DURATION);
        setData(processed);
      } catch (err) {
        console.error(
          "❌ Erreur lors de la récupération des matières par classe:",
          err
        );
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des matières",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
          url: err.config?.url,
        });
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [finalEcoleId, appParams, personnelUrls, matieresUrls]
  );

  // Fonction pour nettoyer les matières
  const clearMatieres = useCallback(() => {
    console.log("🗑️ Nettoyage des matières");
    setData([]);
    setError(null);
    setLoading(false);
  }, []);

  // Fonction refetch pour compatibilité
  const refetch = useCallback(() => {
    if (classeId) {
      console.log("🔄 Refetch des matières pour classe:", classeId);
      return fetchMatieres(classeId, finalEcoleId, true);
    }
  }, [classeId, finalEcoleId, fetchMatieres]);

  // Mode automatique : déclencher fetch quand classeId change
  useEffect(() => {
    if (classeId && userProfile) {
      console.log(
        "🔄 UseEffect Matières par classe déclenché pour classe:",
        classeId,
        "école:",
        finalEcoleId
      );
      fetchMatieres(classeId, finalEcoleId, refreshTrigger > 0);
    } else {
      console.log("🧹 Pas de classe ou profil manquant, nettoyage automatique");
      clearMatieres();
    }
  }, [
    classeId,
    finalEcoleId,
    refreshTrigger,
    fetchMatieres,
    clearMatieres,
    userProfile,
  ]);

  return {
    matieres: data,
    loading,
    error,
    fetchMatieres, // Exposé pour usage manuel
    clearMatieres, // Exposé pour nettoyage manuel
    refetch, // Exposé pour compatibilité
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES PÉRIODES
// ===========================
export const usePeriodesData = (periodicitieId = null, refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const periodesUrls = usePeriodesUrls();
  const finalPeriodicitieId = periodicitieId || appParams.periodicitieId;

  const fetchPeriodes = useCallback(
    async (skipCache = false) => {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = `common-periodes-data-${finalPeriodicitieId}`;

        if (!skipCache) {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        const url = periodesUrls.listByPeriodicite(finalPeriodicitieId);
        const response = await axios.get(url);
        
        const processed =
          response.data && Array.isArray(response.data)
            ? response.data.map((periode) => ({
                value: periode.id,
                label: periode.libelle,
                id: periode.id,
                niveau: periode.niveau || 1,
                coef: periode.coef || 1,
                dateDebut: periode.dateDebut || "",
                dateFin: periode.dateFin || "",
                debut: periode.debut,
                fin: periode.fin,
                raw_data: periode,
              }))
            : [];

        setToCache(cacheKey, processed, CACHE_DURATION);
        setData(processed);
      } catch (err) {
        console.error("Erreur lors de la récupération des périodes:", err);
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des périodes",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
          url: err.config?.url,
        });
      } finally {
        setLoading(false);
      }
    },
    [finalPeriodicitieId, periodesUrls]
  );

  useEffect(() => {
    if (finalPeriodicitieId) {
      console.log(
        "🔄 UseEffect Périodes déclenché pour périodicité:",
        finalPeriodicitieId
      );
      fetchPeriodes(false);
    }
  }, [finalPeriodicitieId, refreshTrigger, fetchPeriodes]);

  return {
    periodes: data,
    loading,
    error,
    refetch: () => fetchPeriodes(true),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES MESSAGES
// ===========================
export const useMessagesData = (
  typeMessage = "reception",
  refreshTrigger = 0
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performance, setPerformance] = useState(null);

  const appParams = useAppParams();
  const messagesUrls = useMessagesUrls();

  const fetchData = async (skipCache = false) => {
    // Vérifier que userId est disponible avant de faire la requête
    if (!appParams.userId) {
      console.warn("userId is not available yet, skipping fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const startTime = Date.now();
      const cacheKey = `messages-data-${appParams.userId}`;

      if (!skipCache) {
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          setPerformance({
            duration: Date.now() - startTime,
            source: "cache",
            itemCount: cachedData.length,
          });
          return;
        }
      }

      // Utilisation de l'URL centralisée selon le type de message
      let url;
      if (typeMessage === "reception") {
        url = messagesUrls.boiteReception();
      } else {
        url = messagesUrls.boiteEnvoi();
      }

      const response = await axios.get(url);

      const processedMessages =
        response.data && Array.isArray(response.data)
          ? response.data.map((message) => ({
              id: message.message_personnel_id,
              fullName: message.fullName,
              sujet: message.message_personnel_sujet,
              message: message.message_personnel_message,
              date: message.message_personnel_date,
              raw_data: message,
            }))
          : [];

      setToCache(cacheKey, processedMessages);
      setData(processedMessages);
      setPerformance({
        duration: Date.now() - startTime,
        source: "api",
        itemCount: processedMessages.length,
        dataSize: JSON.stringify(response.data).length,
      });
    } catch (err) {
      setError({
        message: err.message || "Erreur inconnue",
        type: err.name || "FetchError",
        code: err.code || "UNKNOWN",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [refreshTrigger, appParams.userId, typeMessage]);

  return {
    messages: data,
    loading,
    error,
    refetch: () => fetchData(true),
    performance,
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES ÉLÈVES
// ===========================
export const useElevesData = (
  classeId = null,
  anneeId = null,
  refreshTrigger = 0
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const elevesUrls = useElevesUrls();
  const finalAnneeId = anneeId || appParams.academicYearId;

  const fetchEleves = useCallback(
    async (newClasseId, newAnneeId = finalAnneeId) => {
      if (!newClasseId) {
        setData([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const cacheKey = `common-eleves-data-${newClasseId}-${newAnneeId}`;

        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }

        const url = elevesUrls.retrieveByClasse(newClasseId, newAnneeId);
        const response = await axios.get(url);
        
        let processedEleves = [];

        if (response.data && Array.isArray(response.data)) {
          processedEleves = response.data.map((eleveData, index) => {
            const eleve =
              eleveData.inscription?.eleve || eleveData.eleve || eleveData;
            const classe = eleveData.classe || {};

            return {
              id: eleve.id || `temp-${index}`,
              matricule: eleve.matricule || "N/A",
              nom: eleve.nom || "Nom inconnu",
              prenom: eleve.prenom || "Prénom inconnu",
              nomComplet: `${eleve.prenom || ""} ${eleve.nom || ""}`.trim(),
              sexe: eleve.sexe || "N/A",
              dateNaissance: eleve.dateNaissance || "",
              lieuNaissance: eleve.lieuNaissance || "",
              nationalite: eleve.nationalite || "",
              urlPhoto: eleve.urlPhoto || eleveData.inscription?.urlPhoto || "",
              tuteur: eleve.tuteur || {},
              classe: {
                id: classe.id || "",
                libelle: classe.libelle || "",
                niveau: classe.branche?.niveau?.libelle || "",
                serie: classe.branche?.serie?.libelle || "",
              },
              inscription: {
                id: eleveData.inscription?.id || "",
                statut: eleveData.inscription?.statut || "",
                redoublant: eleveData.inscription?.redoublant || "NON",
                ecoleOrigine: eleveData.inscription?.ecoleOrigine || "",
              },
              raw_data: eleveData,
            };
          });
        }

        setToCache(cacheKey, processedEleves, CACHE_DURATION);
        setData(processedEleves);
      } catch (err) {
        console.error("Erreur lors de la récupération des élèves:", err);
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des élèves",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
          url: err.config?.url,
        });
      } finally {
        setLoading(false);
      }
    },
    [finalAnneeId, elevesUrls]
  );

  useEffect(() => {
    if (classeId) {
      console.log(
        "🔄 UseEffect Élèves déclenché pour classe:",
        classeId,
        "année:",
        finalAnneeId
      );
      fetchEleves(classeId, finalAnneeId);
    } else {
      // Si pas de classe, nettoyer les données
      setData([]);
      setError(null);
    }
  }, [classeId, finalAnneeId, refreshTrigger, fetchEleves]);

  const clearEleves = useCallback(() => {
    setData([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    eleves: data,
    loading,
    error,
    fetchEleves, // Exposé pour usage externe
    clearEleves,
    refetch: () => fetchEleves(classeId, finalAnneeId),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES FONCTIONS
// ===========================
export const useFonctionsData = (ecoleId = null, refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const fonctionsUrls = useFonctionsUrls();
  const finalEcoleId = ecoleId || appParams.ecoleId;

  const fetchFonctions = useCallback(
    async (skipCache = false) => {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = `common-fonctions-data-${finalEcoleId}`;

        if (!skipCache) {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        const url = fonctionsUrls.listByEcole(finalEcoleId);
        const response = await axios.get(url);
        
        const processed =
          response.data && Array.isArray(response.data)
            ? response.data.map((fonction) => ({
                value: fonction.id,
                label: fonction.libelle,
                id: fonction.id,
                code: fonction.code || "",
                description: fonction.description || "",
                raw_data: fonction,
              }))
            : [];

        setToCache(cacheKey, processed, CACHE_DURATION);
        setData(processed);
      } catch (err) {
        console.error("Erreur lors de la récupération des fonctions:", err);
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des fonctions",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
          url: err.config?.url,
        });
      } finally {
        setLoading(false);
      }
    },
    [finalEcoleId, fonctionsUrls]
  );

  useEffect(() => {
    if (finalEcoleId) {
      console.log("🔄 UseEffect Fonctions déclenché pour école:", finalEcoleId);
      fetchFonctions(false);
    }
  }, [finalEcoleId, refreshTrigger, fetchFonctions]);

  return {
    fonctions: data,
    loading,
    error,
    refetch: () => fetchFonctions(true),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES ANNÉES SCOLAIRES
// ===========================
export const useAnneesData = (refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const anneesUrls = useAnneesUrls();

  const fetchAnnees = useCallback(async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);
      const cacheKey = "common-annees-data";

      if (!skipCache) {
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      const url = anneesUrls.listOpenedOrClosedToEcole();
      const response = await axios.get(url);

      const processed =
        response.data && Array.isArray(response.data)
          ? response.data.map((annee) => ({
              value: annee.id,
              label: annee.libelle,
              id: annee.id,
              debut: annee.debut,
              fin: annee.fin,
              actif: annee.actif || false,
              raw_data: annee,
            }))
          : [];

      setToCache(cacheKey, processed, CACHE_DURATION);
      setData(processed);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des années scolaires:",
        err
      );
      setError({
        message:
          err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des années scolaires",
        type: err.name || "FetchError",
        code: err.response?.status || err.code || "UNKNOWN",
        details: err.response?.data,
        url: err.config?.url,
      });
    } finally {
      setLoading(false);
    }
  }, [anneesUrls]);

  useEffect(() => {
    console.log("🔄 UseEffect Années scolaires déclenché");
    fetchAnnees(false);
  }, [refreshTrigger, fetchAnnees]);

  return {
    annees: data,
    loading,
    error,
    refetch: () => fetchAnnees(true),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES ENSEIGNANTS
// ===========================
export const useEnseignantsData = (profProfilId, refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const personnelUrls = usePersonnelUrls();

  const fetchEnseignants = useCallback(
    async (skipCache = false) => {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = `common-enseignants-data-${appParams.ecoleId}`;

        // Vérifier le cache
        if (!skipCache) {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        const url = personnelUrls.getByEcoleAndProfil(
          appParams.ecoleId, 
          profProfilId || appParams.profileId
        );
        const response = await axios.get(url);

        // Traitement des données d'enseignants
        const processedEnseignants =
          response.data && Array.isArray(response.data)
            ? response.data.map((enseignant, index) => ({
                value: enseignant.id || `temp-${index}`,
                label: `${enseignant.nom || "Nom"} ${
                  enseignant.prenom || "Prénom"
                }`,
                id: enseignant.id || `temp-${index}`,
                nom: enseignant.nom || "",
                prenom: enseignant.prenom || "",
                nomComplet: `${enseignant.nom || "Nom"} ${
                  enseignant.prenom || "Prénom"
                }`,
                contact: enseignant.contact || "",
                email: enseignant.email || "",
                sexe: enseignant.sexe || "Non spécifié",
                dateNaissance: enseignant.dateNaissance || "",
                lieuNaissance: enseignant.lieuNaissance || "",
                niveauEtude: enseignant.niveauEtude || 0,
                diplome: enseignant.diplome || "",
                specialite: enseignant.specialite || "",
                fonction: enseignant.fonction?.libelle || "Professeur",
                fonction_id: enseignant.fonction?.id || null,
                fonction_code: enseignant.fonction?.code || "",
                fonction_description: enseignant.fonction?.description || "",
                ecole_id: enseignant.ecole?.id || appParams.ecoleId,
                ecole_libelle: enseignant.ecole?.libelle || "",
                ecole_code: enseignant.ecole?.code || "",
                profil_id: enseignant.profil?.id || appParams.defaults.PROFIL_PROFESSEUR_ID,
                profil_libelle: enseignant.profil?.libelle || "Professeur",
                dateCreation: enseignant.dateCreation || "",
                dateUpdate: enseignant.dateUpdate || "",
                actif: enseignant.actif !== undefined ? enseignant.actif : true,

                // Affichage optimisé
                display_text: `${enseignant.nom || "Nom"} ${
                  enseignant.prenom || "Prénom"
                } (${enseignant.fonction?.libelle || "Professeur"})`,
                display_short: `${enseignant.nom || "Nom"} ${
                  enseignant.prenom || "Prénom"
                }`,
                display_full: `${enseignant.nom || "Nom"} ${
                  enseignant.prenom || "Prénom"
                } - ${enseignant.fonction?.libelle || "Professeur"} - ${
                  enseignant.contact || "Contact non renseigné"
                }`,

                // Données brutes
                raw_data: enseignant,
              }))
            : [];

        // Tri par nom puis prénom
        processedEnseignants.sort((a, b) => {
          const compareNom = a.nom.localeCompare(b.nom);
          if (compareNom !== 0) return compareNom;
          return a.prenom.localeCompare(b.prenom);
        });

        setToCache(cacheKey, processedEnseignants, CACHE_DURATION);
        setData(processedEnseignants);
      } catch (err) {
        console.error("Erreur lors de la récupération des enseignants:", err);
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des enseignants",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
          url: err.config?.url,
        });
      } finally {
        setLoading(false);
      }
    },
    [appParams, personnelUrls, profProfilId]
  );

  useEffect(() => {
    if (appParams.ecoleId) {
      console.log(
        "🔄 UseEffect Enseignants déclenché pour école:",
        appParams.ecoleId
      );
      fetchEnseignants(false);
    }
  }, [appParams.ecoleId, refreshTrigger, fetchEnseignants]);

  return {
    enseignants: data,
    loading,
    error,
    refetch: () => fetchEnseignants(true),
  };
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Vide le cache de toutes les données communes
 */
export const clearCommonDataCache = () => {
  console.log("🧹 Cache des données communes vidé");
};

/**
 * Récupère uniquement les données essentielles (classes + enseignants + matières)
 */
export const useEssentialData = (ecoleId = null) => {
  const classes = useClassesData(ecoleId);
  const enseignants = useEnseignantsData(ecoleId);
  const matieres = useMatieresEcoleData(ecoleId);

  const loading = classes.loading || enseignants.loading || matieres.loading;
  const error = classes.error || enseignants.error || matieres.error;

  return {
    classes: classes.classes,
    enseignants: enseignants.enseignants,
    matieres: matieres.matieres,
    loading,
    error,
    refetch: () => {
      classes.refetch();
      enseignants.refetch();
      matieres.refetch();
    },
  };
};

/**
 * Récupère les données de base pour une école (classes, niveaux, branches)
 */
export const useBaseData = (ecoleId = null) => {
  const classes = useClassesData(ecoleId);
  const niveaux = useNiveauxData(ecoleId);
  const branches = useNiveauxBranchesData(ecoleId);

  const loading = classes.loading || niveaux.loading || branches.loading;
  const error = classes.error || niveaux.error || branches.error;

  return {
    classes: classes.classes,
    niveaux: niveaux.niveaux,
    branches: branches.branches,
    loading,
    error,
    refetch: () => {
      classes.refetch();
      niveaux.refetch();
      branches.refetch();
    },
  };
};

/**
 * Récupère les données complètes pour une école
 */
export const useCompletDataByEcole = (ecoleId = null) => {
  const baseData = useBaseData(ecoleId);
  const matieres = useMatieresEcoleData(ecoleId);
  const fonctions = useFonctionsData(ecoleId);
  const enseignants = useEnseignantsData(ecoleId);

  const loading =
    baseData.loading ||
    matieres.loading ||
    fonctions.loading ||
    enseignants.loading;
  const error =
    baseData.error || matieres.error || fonctions.error || enseignants.error;

  return {
    ...baseData,
    matieres: matieres.matieres,
    fonctions: fonctions.fonctions,
    enseignants: enseignants.enseignants,
    loading,
    error,
    refetch: () => {
      baseData.refetch();
      matieres.refetch();
      fonctions.refetch();
      enseignants.refetch();
    },
  };
};

// ===========================
// FONCTIONS UTILITAIRES POUR FORMATAGE DES DATES
// ===========================
const formatDate = (dateString) => {
  if (!dateString) return "Non définie";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Date invalide";
  }
};

const formatDuree = (minutes) => {
  if (!minutes || minutes === 0) return "Non définie";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, "0")}`;
};

// ===========================
// HOOK PRINCIPAL POUR LES ÉVALUATIONS
// ===========================
export const useEvaluationsDataByFilters = (refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const evaluationsUrls = useEvaluationsUrls();

  const searchEvaluations = useCallback(
    async (
      classeId,
      matiereId = null,
      periodeId = null,
      anneeId = null
    ) => {
      if (!classeId) {
        setError({
          message: "Veuillez sélectionner une classe",
          type: "ValidationError",
          code: "MISSING_CLASSE",
        });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setSearchPerformed(false);

        const appParams = useAppParams();
        const finalAnneeId = anneeId || appParams.academicYearId;

        // Construction de la clé de cache
        const cacheKey = `evaluations-filters-${classeId}-${
          matiereId || "all"
        }-${periodeId || "all"}-${finalAnneeId}`;

        // Vérifier le cache d'abord
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
          console.log(
            "📦 Données évaluations trouvées en cache:",
            cachedData.length
          );
          setData(cachedData);
          setSearchPerformed(true);
          setLoading(false);
          return;
        }

        console.log("🔍 Recherche évaluations avec filtres:", {
          classeId,
          matiereId,
          periodeId,
          anneeId: finalAnneeId,
        });

        // Construction de l'URL avec les filtres
        const url = evaluationsUrls.getByFilters({
          classe_id: classeId,
          annee_id: finalAnneeId,
          matiere_id: matiereId,
          periode_id: periodeId,
        });

        const response = await axios.get(url);
        console.log("📡 Réponse API évaluations:", response.data);

        // Traitement des évaluations
        let processedEvaluations = [];
        if (response.data && Array.isArray(response.data)) {
          processedEvaluations = response.data.map((evaluation, index) => {
            const typeMapping = {
              1: "Composition",
              2: "Devoir",
              3: "Interrogation",
            };

            const type_display =
              typeMapping[evaluation.type_id] || `Type ${evaluation.type_id}`;

            return {
              // IDs et codes
              id: evaluation.id || `eval-${index}`,
              code:
                evaluation.code || `EVAL${String(index + 1).padStart(4, "0")}`,

              // Informations de base
              type: type_display,
              type_id: evaluation.type_id,

              // Matière
              matiere: evaluation.matiere?.libelle || "Matière inconnue",
              matiere_id: evaluation.matiere?.id || matiereId,
              matiere_code: evaluation.matiere?.code || "",

              // Classe
              classe: evaluation.classe?.libelle || "Classe inconnue",
              classe_id: evaluation.classe?.id || classeId,
              classe_code: evaluation.classe?.code || "",

              // Période
              periode: evaluation.periode?.libelle || "Période inconnue",
              periode_id: evaluation.periode?.id || periodeId,

              // École
              ecole: evaluation.ecole?.libelle || "",
              ecole_id: evaluation.ecole?.id || appParams.ecoleId,
              ecole_code: evaluation.ecole?.code || "",

              // Année
              annee: evaluation.annee?.libelle || "Année inconnue",
              annee_id: evaluation.annee?.id || finalAnneeId,

              // Date et durée
              date: evaluation.date || "",
              date_display: formatDate(evaluation.date),
              duree: evaluation.duree || 0,
              duree_raw: evaluation.duree || 0,
              duree_display: formatDuree(evaluation.duree),

              // Configuration de notation
              noteSur: evaluation.noteSur || "20",
              coefficient: evaluation.coefficient || 1,

              // Statuts
              statut: evaluation.statut || "ACTIVE",
              statut_display:
                evaluation.statut === "ACTIVE"
                  ? "Active"
                  : evaluation.statut || "Active",

              // Informations de création
              dateCreation: evaluation.dateCreation || "",
              dateCreation_display: formatDate(evaluation.dateCreation),
              dateUpdate: evaluation.dateUpdate || "",

              // Statistiques (si disponibles dans l'API)
              nombreEleves: evaluation.nombreEleves || 0,
              nombreNotesRenseignees: evaluation.nombreNotesRenseignees || 0,
              moyenneClasse: evaluation.moyenneClasse || null,

              // Affichage optimisé
              display_title: `${type_display} - ${
                evaluation.matiere?.libelle || "Matière"
              }`,
              display_subtitle: `${
                evaluation.classe?.libelle || "Classe"
              } • ${formatDate(evaluation.date)}`,
              display_details: `/${evaluation.noteSur || 20} • ${formatDuree(
                evaluation.duree
              )}`,

              // Données brutes pour debug
              raw_data: evaluation,
            };
          });

          // Tri par date décroissante (plus récentes en premier)
          processedEvaluations.sort((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(b.date) - new Date(a.date);
          });
        }

        console.log("✅ Évaluations traitées:", processedEvaluations.length);

        // Mise en cache et mise à jour de l'état
        setToCache(cacheKey, processedEvaluations);
        setData(processedEvaluations);
        setSearchPerformed(true);
      } catch (err) {
        console.error(
          "❌ Erreur lors de la récupération des évaluations:",
          err
        );
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors de la recherche des évaluations",
          type: err.name || "SearchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
          url: err.config?.url,
        });
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [evaluationsUrls]
  );

  const clearEvaluations = useCallback(() => {
    setData([]);
    setError(null);
    setSearchPerformed(false);
    setLoading(false);
  }, []);

  const refetchEvaluations = useCallback(
    (
      classeId,
      matiereId = null,
      periodeId = null,
      anneeId = null
    ) => {
      searchEvaluations(classeId, matiereId, periodeId, anneeId);
    },
    [searchEvaluations]
  );

  const getEvaluationByCode = useCallback(
    (evaluationCode) => {
      return data.find((evaluation) => evaluation.code === evaluationCode);
    },
    [data]
  );

  return {
    evaluations: data,
    loading,
    error,
    searchPerformed,
    searchEvaluations,
    clearEvaluations,
    refetchEvaluations,
    getEvaluationByCode,
    totalEvaluations: data.length,
  };
};

// ===========================
// HOOK SIMPLIFIÉ POUR LES ÉVALUATIONS D'UNE CLASSE
// ===========================
export const useClasseEvaluations = (classeId = null, autoFetch = true) => {
  const {
    evaluations,
    loading,
    error,
    searchPerformed,
    searchEvaluations,
    clearEvaluations,
  } = useEvaluationsDataByFilters();

  useEffect(() => {
    if (autoFetch && classeId) {
      searchEvaluations(classeId);
    }
  }, [classeId, autoFetch, searchEvaluations]);

  return {
    evaluations,
    loading,
    error,
    searchPerformed,
    fetchEvaluations: (matiereId, periodeId) =>
      searchEvaluations(classeId, matiereId, periodeId),
    clearEvaluations,
  };
};

// ===========================
// ALIAS POUR COMPATIBILITÉ
// ===========================
export const useBranchesData = useNiveauxBranchesData;