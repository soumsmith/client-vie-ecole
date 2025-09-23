/**
 * Service pour la gestion des bulletins scolaires
 * VERSION MODIFIÉE utilisant useFetchData avec méthode GET
 */

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getFromCache, setToCache } from "../utils/cacheUtils";
import { useAllApiUrls } from "../utils/apiConfig";

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const DEFAULT_ECOLE_ID = 38;
const DEFAULT_ANNEE_ID = 226;
const DEFAULT_PERIODICITE_ID = 2;

// ===========================
// HOOK POUR RÉCUPÉRER LES CLASSES
// ===========================
/**
 * Récupère la liste des classes pour une école donnée
 * @param {number} ecoleId
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useClassesData = (
  ecoleId = DEFAULT_ECOLE_ID,
  refreshTrigger = 0
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrls = useAllApiUrls();

  const fetchClasses = useCallback(
    async (skipCache = false) => {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = `bulletin-classes-data-${ecoleId}`;
        if (!skipCache) {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }
        const response = await axios.get(apiUrls.classes.listByEcoleSorted());
        const processed =
          response.data && Array.isArray(response.data)
            ? response.data.map((classe) => ({
                value: classe.id,
                label: classe.libelle,
                id: classe.id,
                niveau: classe.niveau || "",
                serie: classe.serie || "",
                raw_data: classe,
              }))
            : [];
        setToCache(cacheKey, processed);
        setData(processed);
      } catch (err) {
        setError({
          message: err.message || "Erreur lors du chargement des classes",
          type: err.name || "FetchError",
          code: err.code || "UNKNOWN",
        });
      } finally {
        setLoading(false);
      }
    },
    [ecoleId, apiUrls.classes]
  );

  useEffect(() => {
    if (ecoleId) {
      fetchClasses(false);
    }
  }, [ecoleId, refreshTrigger, fetchClasses]);

  return {
    classes: data,
    loading,
    error,
    refetch: () => fetchClasses(true),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES PÉRIODES
// ===========================
/**
 * Récupère la liste des périodes pour une périodicité donnée
 * @param {number} periodicitieId
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const usePeriodesData = (
  periodicitieId = DEFAULT_PERIODICITE_ID,
  refreshTrigger = 0
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrls = useAllApiUrls();

  const fetchPeriodes = useCallback(
    async (skipCache = false) => {
      try {
        setLoading(true);
        setError(null);
        const cacheKey = `bulletin-periodes-data-${periodicitieId}`;
        if (!skipCache) {
          const cachedData = getFromCache(cacheKey);
          if (cachedData) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }
        const response = await axios.get(
          apiUrls.periodes.listByPeriodiciteId(periodicitieId)
        );
        const processed =
          response.data && Array.isArray(response.data)
            ? response.data.map((periode) => ({
                value: periode.id,
                label: periode.libelle,
                id: periode.id,
                coef: periode.coef || 1,
                dateDebut: periode.dateDebut || "",
                dateFin: periode.dateFin || "",
                raw_data: periode,
              }))
            : [];
        setToCache(cacheKey, processed);
        setData(processed);
      } catch (err) {
        setError({
          message: err.message || "Erreur lors du chargement des périodes",
          type: err.name || "FetchError",
          code: err.code || "UNKNOWN",
        });
      } finally {
        setLoading(false);
      }
    },
    [periodicitieId, apiUrls.periodes]
  );

  useEffect(() => {
    if (periodicitieId) {
      fetchPeriodes(false);
    }
  }, [periodicitieId, refreshTrigger, fetchPeriodes]);

  return {
    periodes: data,
    loading,
    error,
    refetch: () => fetchPeriodes(true),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES ÉLÈVES D'UNE CLASSE
// ===========================
/**
 * Récupère la liste des élèves d'une classe pour une année donnée
 * @returns {object}
 */
export const useElevesClasse = () => {
  const [classeId, setClasseId] = useState(null);
  const [anneeId, setAnneeId] = useState(DEFAULT_ANNEE_ID);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrls = useAllApiUrls();

  const fetchEleves = useCallback(
    async (newClasseId, newAnneeId = DEFAULT_ANNEE_ID) => {
      if (!newClasseId) {
        setData([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        setClasseId(newClasseId);
        setAnneeId(newAnneeId);
        const response = await axios.get(
          apiUrls.eleves.retrieveByClasseAnnee(newClasseId, newAnneeId)
        );
        const processed =
          response.data && Array.isArray(response.data)
            ? response.data.map((eleveData, index) => {
                const eleve =
                  eleveData.inscription?.eleve || eleveData.eleve || eleveData;
                const classe = eleveData.classe || {};
                return {
                  id: eleve.id || `temp-${index}`,
                  matricule: eleve.matricule || "N/A",
                  nom: eleve.nom || "Nom inconnu",
                  prenom: eleve.prenom || "Prénom inconnu",
                  sexe: eleve.sexe || "N/A",
                  dateNaissance: eleve.dateNaissance || "",
                  lieuNaissance: eleve.lieuNaissance || "",
                  nationalite: eleve.nationalite || "",
                  urlPhoto:
                    eleve.urlPhoto || eleveData.inscription?.urlPhoto || "",
                  tuteur: eleve.tuteur || {},
                  classeInfo: {
                    id: classe.id || newClasseId,
                    libelle: classe.libelle || "",
                    niveau: classe.branche?.niveau?.libelle || "",
                    serie: classe.branche?.serie?.libelle || "",
                    code: classe.code || "",
                  },
                  inscriptionInfo: {
                    id: eleveData.inscription?.id || "",
                    statut: eleveData.inscription?.statut || "",
                    redoublant: eleveData.inscription?.redoublant || "NON",
                    ecoleOrigine: eleveData.inscription?.ecoleOrigine || "",
                  },
                  raw_data: eleveData,
                };
              })
            : [];
        setData(processed);
      } catch (err) {
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des élèves",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
          details: err.response?.data,
        });
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [apiUrls.eleves]
  );

  const clearEleves = useCallback(() => {
    setData([]);
    setClasseId(null);
  }, []);

  return {
    eleves: data,
    loading,
    error,
    fetchEleves,
    clearEleves,
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES DONNÉES COMPLÈTES DU BULLETIN
// ===========================
/**
 * Récupère les données du bulletin pour un élève donné, une classe et une période
 * @returns {object}
 */
export const useBulletinData = () => {
  const [requestParams, setRequestParams] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialAdjustments, setInitialAdjustments] = useState({});
  const [initialToggles, setInitialToggles] = useState({});
  const apiUrls = useAllApiUrls();

  const fetchBulletinData = useCallback(
    async (classeId, periodeId, eleveMatricule) => {
      if (!classeId || !periodeId || !eleveMatricule) {
        setError({
          message: "Classe, période, élève et matricule requis",
          type: "ValidationError",
          code: "MISSING_PARAMS",
        });
        return;
      }
      try {
        setLoading(true);
        setError(null);
        setRequestParams({ classeId, periodeId, eleveMatricule });

        // Nouvelle API pour récupérer le bulletin directement
        const url = apiUrls.bulletins.getBulletinEleveAnneePeriode(
          eleveMatricule,
          periodeId,
          classeId
        );
        console.log("🔍 Appel API bulletin:", url);

        const response = await axios.get(url);
        const bulletinData = response.data;

        console.log("📊 Données brutes du bulletin:", bulletinData);

        if (!bulletinData || !bulletinData.details) {
          setData(null);
          throw new Error("Aucune donnée de bulletin trouvée pour cet élève");
        }

        // Nouvelle structure pour gérer les ajustements et toggles initiaux
        const adjustments = {};
        const toggles = {};

        // Traitement des données du bulletin avec la nouvelle structure API
        const processed = {
          eleve: {
            id: bulletinData.id,
            matricule: bulletinData.matricule,
            nom: bulletinData.nom,
            prenom: bulletinData.prenoms,
            sexe: bulletinData.sexe || "",
            urlPhoto: bulletinData.urlPhoto || "",
            dateNaissance: bulletinData.dateNaissance || "",
            lieuNaissance: bulletinData.lieuNaissance || "",
            nationalite: bulletinData.nationalite || "",
          },
          notes: {
            moyenneGenerale: parseFloat(bulletinData.moyGeneral || 0),
            rang: bulletinData.rang || 0,
            appreciation: bulletinData.appreciation || "",
            absencesJustifiees: bulletinData.absJust || 0,
            absencesNonJustifiees: bulletinData.absNonJust || 0,
            isClassed: bulletinData.isClassed || "N",
          },
          matieres: bulletinData.details
            ? bulletinData.details.map((detail, index) => {
                // Gérer les ajustements et toggles s'ils existent
                if (
                  detail.adjustMoyenne !== undefined &&
                  detail.adjustMoyenne !== null &&
                  detail.adjustMoyenne !== 0
                ) {
                  adjustments[index] = parseFloat(detail.adjustMoyenne);
                }

                if (detail.isChecked === true) {
                  toggles[index] = true;
                }

                return {
                  id: detail.matiereId || 0,
                  code: detail.matiereCode || "",
                  libelle: detail.matiereLibelle || "",
                  coefficient: parseFloat(detail.coef || 1),
                  moyenne: parseFloat(detail.moyenne || 0),
                  rang: detail.rang || "",
                  appreciation: detail.appreciation || "",
                  categorie: detail.categorie || "",
                  categorieMatiere: detail.categorieMatiere || "",
                  moyCoef: parseFloat(detail.moyCoef || 0),
                  // Nouvelles propriétés pour les ajustements
                  adjustMoyenne: detail.adjustMoyenne || null,
                  isChecked: detail.isChecked || false,
                  statut: detail.statut || null,
                  notes: [], // Peut être rempli si vous avez les détails des notes
                };
              })
            : [],
          periode: {
            id: periodeId,
            libelle: bulletinData.libellePeriode || "",
          },
          classe: {
            id: classeId,
            libelle: bulletinData.libelleClasse || "",
          },
          // Informations supplémentaires du bulletin
          raw_data: bulletinData, // Garder les données brutes pour référence
        };

        // Stocker les ajustements et toggles initiaux pour les utiliser dans le composant
        setInitialAdjustments(adjustments);
        setInitialToggles(toggles);
        setData(processed);

        console.log("📊 Données bulletin traitées:", processed);
        console.log("🔧 Ajustements initiaux:", adjustments);
        console.log("🎯 Toggles initiaux:", toggles);
      } catch (err) {
        console.error("❌ Erreur lors du chargement du bulletin:", err);
        setError({
          message:
            err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement du bulletin",
          type: err.name || "FetchError",
          code: err.response?.status || err.code || "UNKNOWN",
        });
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [apiUrls.bulletins]
  );

  const clearBulletin = useCallback(() => {
    setData(null);
    setRequestParams(null);
    setInitialAdjustments({});
    setInitialToggles({});
  }, []);

  return {
    bulletinData: data,
    loading,
    error,
    fetchBulletinData,
    clearBulletin,
    initialAdjustments, // Nouveaux états pour l'initialisation
    initialToggles,
  };
};

// ===========================
// FONCTIONS UTILITAIRES POUR LE BULLETIN
// ===========================
/**
 * Retourne une couleur selon la note
 */
export const getNoteColor = (note, noteSur = 20) => {
  const pourcentage = (note / noteSur) * 100;
  if (pourcentage >= 90) return "green";
  if (pourcentage >= 75) return "blue";
  if (pourcentage >= 60) return "orange";
  if (pourcentage >= 50) return "yellow";
  return "red";
};

/**
 * Retourne une couleur selon l'appréciation
 */
export const getAppreciationColor = (appreciation) => {
  const appreciationLower = appreciation?.toLowerCase() || "";
  if (appreciationLower.includes("excellent")) return "green";
  if (appreciationLower.includes("très bien")) return "blue";
  if (appreciationLower.includes("bien")) return "cyan";
  if (appreciationLower.includes("assez bien")) return "orange";
  if (appreciationLower.includes("passable")) return "yellow";
  return "red";
};

/**
 * Calcule la mention à partir de la moyenne
 */
export const getMention = (moyenne) => {
  if (moyenne >= 16) return { mention: "Très Bien", color: "green" };
  if (moyenne >= 14) return { mention: "Bien", color: "blue" };
  if (moyenne >= 12) return { mention: "Assez Bien", color: "cyan" };
  if (moyenne >= 10) return { mention: "Passable", color: "orange" };
  return { mention: "Insuffisant", color: "red" };
};

/**
 * Formate une note sur 20
 */
export const formatNote = (note, noteSur = 20) => {
  return `${parseFloat(note).toFixed(2)}/${noteSur}`;
};

/**
 * Calcule les totaux pour les matières
 */
export const calculateTotals = (matieres) => {
  let totalPoints = 0;
  let totalCoefficients = 0;
  matieres.forEach((matiere) => {
    if (matiere.moyenne && matiere.coefficient) {
      totalPoints += matiere.moyenne * matiere.coefficient;
      totalCoefficients += matiere.coefficient;
    }
  });
  return {
    totalPoints: totalPoints.toFixed(2),
    totalCoefficients,
    moyenneGenerale:
      totalCoefficients > 0 ? (totalPoints / totalCoefficients).toFixed(2) : 0,
  };
};
