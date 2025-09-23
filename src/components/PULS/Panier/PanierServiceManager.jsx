/**
 * Service pour la gestion des données de personnel
 * VERSION OPTIMISÉE avec axios et cache
 * REFACTORING : Utilise la configuration centralisée des URLs
 */

import axios from "axios";
import { Badge } from "rsuite";
import {
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUser,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { usePersonnelUrls } from "../utils/apiConfig";
import { getFromCache, setToCache, clearCache } from "../utils/cacheUtils";

/**
 * Hook pour récupérer la liste du personnel validé
 * @param {string} statut - Statut du personnel (VALIDEE par défaut)
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const usePersonnelData = (statut = "VALIDEE", refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performance, setPerformance] = useState(null);

  // Utilisation des URLs centralisées
  const personnelUrls = usePersonnelUrls();

  const fetchData = async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);
      const startTime = Date.now();
      const cacheKey = `personnel-data-${statut}`;

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

      // Utilisation de l'URL centralisée
      const url = personnelUrls.getSouscriptionsByStatut(statut);
      const response = await axios.get(url);

      const processedPersonnel =
        response.data && Array.isArray(response.data)
          ? response.data.map((person) => ({
              ...person,
              id: person.sous_attent_personnid,
              nom_complet: `${person.sous_attent_personn_prenom || ""} ${
                person.sous_attent_personn_nom || ""
              }`.trim(),
              nom_display: person.sous_attent_personn_nom || "Nom non défini",
              prenom_display:
                person.sous_attent_personn_prenom || "Prénom non défini",
              contact_display:
                person.sous_attent_personn_contact || "Non renseigné",
              email_display:
                person.sous_attent_personn_email || "Non renseigné",
              date_creation_display: person.sous_attent_personn_date_creation
                ? new Date(
                    person.sous_attent_personn_date_creation
                  ).toLocaleDateString("fr-FR")
                : "Non renseigné",
              date_naissance_display: person.sous_attent_personn_date_naissance
                ? new Date(
                    person.sous_attent_personn_date_naissance
                  ).toLocaleDateString("fr-FR")
                : "Non renseigné",
              date_traitement_display:
                person.sous_attent_personn_date_traitement
                  ? new Date(
                      person.sous_attent_personn_date_traitement
                    ).toLocaleDateString("fr-FR")
                  : "Non traité",
              age_display: person.sous_attent_personn_date_naissance
                ? Math.floor(
                    (new Date() -
                      new Date(person.sous_attent_personn_date_naissance)) /
                      (365.25 * 24 * 60 * 60 * 1000)
                  )
                : "N/A",
              statut_display: person.sous_attent_personn_statut || "En attente",
              sexe_display: person.sous_attent_personn_sexe || "Non renseigné",
              experience_display:
                person.sous_attent_personn_nbre_annee_experience
                  ? `${person.sous_attent_personn_nbre_annee_experience} an${
                      person.sous_attent_personn_nbre_annee_experience > 1
                        ? "s"
                        : ""
                    }`
                  : "Non renseigné",
              domaine_formation_display:
                person.domaine_formation?.domaine_formation_libelle ||
                "Non renseigné",
              domaine_formation_code:
                person.domaine_formation?.domaine_formation_code || "",
              fonction_display:
                person.fonction?.fonctionlibelle || "Non renseigné",
              fonction_code: person.fonction?.fonctioncode || "",
              niveau_etude_display:
                person.niveau_etude?.niveau_etude_libelle || "Non renseigné",
              niveau_etude_code: person.niveau_etude?.niveau_etude_code || "",
              has_cv: !!person.sous_attent_personn_lien_cv,
              has_autorisation: !!person.sous_attent_personn_lien_autorisation,
              has_piece: !!person.sous_attent_personn_lien_piece,
              cv_display: person.sous_attent_personn_lien_cv || "Non fourni",
              autorisation_display:
                person.sous_attent_personn_lien_autorisation || "Non fourni",
              piece_display:
                person.sous_attent_personn_lien_piece || "Non fourni",
              diplome_display:
                person.sous_attent_personn_diplome_recent || "Non renseigné",
              motif_refus_display:
                person.sous_attent_personn_motifrefus || "Aucun",
              raw_data: person,
            }))
          : [];

      setToCache(cacheKey, processedPersonnel);
      setData(processedPersonnel);
      setPerformance({
        duration: Date.now() - startTime,
        source: "api",
        itemCount: processedPersonnel.length,
        dataSize: JSON.stringify(response.data).length,
      });
    } catch (err) {
      console.error("Erreur lors de la récupération du personnel:", err);
      setError({
        message:
          err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement du personnel",
        type: err.name || "FetchError",
        code: err.response?.status || err.code || "UNKNOWN",
        details: err.response?.data,
        url: err.config?.url,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, [refreshTrigger, statut]);

  // Fonction pour forcer le refresh sans cache
  const forceRefresh = () => {
    fetchData(true);
  };

  return {
    personnel: data,
    loading,
    error,
    refetch: forceRefresh,
    performance,
  };
};

/**
 * Hook pour ajouter un personnel au panier de recrutement
 * @returns {object} Fonctions pour gérer le panier
 */
export const usePersonnelPanier = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const personnelUrls = usePersonnelUrls();

  /**
   * Ajoute un personnel au panier
   * @param {number} identifiant_ecole - ID de l'école
   * @param {number} identifiant_personnel - ID du personnel
   * @param {string} panier_personnel_date_creation - Date de création (optionnel)
   * @Produces(MediaType.APPLICATION_JSON)
   * @returns {Promise} Résultat de l'opération
   */
  const addToPanier = async (
    identifiant_ecole,
    identifiant_personnel,
    panier_personnel_date_creation = null
  ) => {
    try {
      setLoading(true);
      setError(null);

      const apiData = {
        identifiant_ecole,
        identifiant_personnel,
        panier_personnel_date_creation,
      };

      const url = personnelUrls.addToPanier();
      const response = await axios.post(url, apiData, {
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json'
        },
        timeout: 10000,
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (err) {
      console.error("Erreur lors de l'ajout au panier:", err);
      const errorInfo = {
        message:
          err.response?.data?.message ||
          err.message ||
          "Erreur lors de l'ajout au panier",
        type: err.name || "PanierError",
        code: err.response?.status || err.code || "UNKNOWN",
        details: err.response?.data,
        url: err.config?.url,
      };

      setError(errorInfo);
      return {
        success: false,
        error: errorInfo,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Récupère le panier d'une école
   * @param {number} ecoleId - ID de l'école
   * @returns {Promise} Liste du personnel dans le panier
   */
  const getPanier = async (ecoleId) => {
    try {
      setLoading(true);
      setError(null);

      const url = personnelUrls.getPanier(ecoleId);
      const response = await axios.get(url);

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (err) {
      console.error("Erreur lors de la récupération du panier:", err);
      const errorInfo = {
        message:
          err.response?.data?.message ||
          err.message ||
          "Erreur lors de la récupération du panier",
        type: err.name || "PanierError",
        code: err.response?.status || err.code || "UNKNOWN",
        details: err.response?.data,
        url: err.config?.url,
      };

      setError(errorInfo);
      return {
        success: false,
        error: errorInfo,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    addToPanier,
    getPanier,
    loading,
    error,
  };
};

/**
 * Vide le cache du personnel
 */
export const clearPersonnelCache = () => {
  clearCache();
};

// Configuration du tableau (identique à votre code)
export const personnelTableConfig = {
  columns: [
    {
      title: "Nom complet",
      dataKey: "nom_complet",
      flexGrow: 2,
      minWidth: 200,
      cellType: "avatar",
      avatarGenerator: (rowData) =>
        `${rowData.prenom_display.charAt(0)}${rowData.nom_display.charAt(0)}`,
      avatarColor: "#667eea",
      subField: "fonction_display",
      sortable: true,
    },
    {
      title: "Contact",
      dataKey: "contact_display",
      flexGrow: 1,
      minWidth: 130,
      cellType: "custom",
      customRenderer: (rowData) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <FiPhone size={12} />
            <span style={{ fontSize: "12px" }}>{rowData.contact_display}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <FiMail size={12} />
            <span style={{ fontSize: "11px", color: "#666" }}>
              {rowData.email_display}
            </span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      title: "Fonction",
      dataKey: "fonction_display",
      flexGrow: 1,
      minWidth: 120,
      cellType: "badge",
      badgeColorMap: (value) => {
        const colorMap = {
          EDUCATEUR: "blue",
          ENSEIGNANT: "green",
          DIRECTEUR: "orange",
          SURVEILLANT: "cyan",
        };
        return colorMap[value] || "gray";
      },
      sortable: true,
    },
    {
      title: "Domaine",
      dataKey: "domaine_formation_display",
      flexGrow: 1,
      minWidth: 120,
      sortable: true,
    },
    {
      title: "Niveau",
      dataKey: "niveau_etude_display",
      flexGrow: 1,
      minWidth: 80,
      cellType: "badge",
      badgeColorMap: (value) => {
        const colorMap = {
          BAC: "green",
          LICENCE: "blue",
          MASTER: "orange",
          DOCTORAT: "red",
        };
        return colorMap[value] || "gray";
      },
      sortable: true,
    },
    {
      title: "Expérience",
      dataKey: "experience_display",
      flexGrow: 1,
      minWidth: 90,
      align: "center",
      sortable: true,
    },
    {
      title: "Statut",
      dataKey: "statut_display",
      flexGrow: 1,
      minWidth: 100,
      cellType: "badge",
      badgeColorMap: (value) => {
        const colorMap = {
          VALIDEE: "green",
          EN_ATTENTE: "orange",
          REFUSEE: "red",
          EN_COURS: "blue",
        };
        return colorMap[value] || "gray";
      },
      sortable: true,
    },
    {
      title: "Documents",
      dataKey: "documents",
      flexGrow: 1,
      minWidth: 100,
      cellType: "custom",
      customRenderer: (rowData) => (
        <div style={{ display: "flex", gap: "4px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: rowData.has_cv ? "#4CAF50" : "#f44336",
              title: rowData.has_cv ? "CV fourni" : "CV manquant",
            }}
          ></div>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: rowData.has_autorisation ? "#4CAF50" : "#f44336",
              title: rowData.has_autorisation
                ? "Autorisation fournie"
                : "Autorisation manquante",
            }}
          ></div>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: rowData.has_piece ? "#4CAF50" : "#f44336",
              title: rowData.has_piece ? "Pièce fournie" : "Pièce manquante",
            }}
          ></div>
        </div>
      ),
      sortable: false,
    },
    {
      title: "Date création",
      dataKey: "date_creation_display",
      flexGrow: 1,
      minWidth: 110,
      cellType: "date",
      sortable: true,
    },
    {
      title: "Actions",
      dataKey: "actions",
      flexGrow: 1,
      minWidth: 60,
      cellType: "actions",
      fixed: "right",
    },
  ],
  filterConfigs: [
    {
      field: "statut_display",
      label: "Statut",
      placeholder: "Tous les statuts",
      type: "select",
      dynamic: true,
      tagColor: "blue",
    },
    {
      field: "fonction_display",
      label: "Fonction",
      placeholder: "Toutes les fonctions",
      type: "select",
      dynamic: true,
      tagColor: "green",
    },
    {
      field: "domaine_formation_display",
      label: "Domaine de formation",
      placeholder: "Tous les domaines",
      type: "select",
      dynamic: true,
      tagColor: "orange",
    },
    {
      field: "niveau_etude_display",
      label: "Niveau d'étude",
      placeholder: "Tous les niveaux",
      type: "select",
      dynamic: true,
      tagColor: "purple",
    },
    {
      field: "sexe_display",
      label: "Sexe",
      placeholder: "Tous",
      type: "select",
      dynamic: true,
      tagColor: "cyan",
    },
    {
      field: "date_creation_display",
      label: "Date de création",
      placeholder: "Sélectionner une date",
      type: "date",
      tagColor: "pink",
    },
    {
      field: "date_traitement_display",
      label: "Période de traitement",
      placeholder: "Sélectionner une période",
      type: "dateRange",
      tagColor: "indigo",
    },
  ],
  searchableFields: [
    "nom_complet",
    "nom_display",
    "prenom_display",
    "contact_display",
    "email_display",
    "fonction_display",
    "domaine_formation_display",
    "niveau_etude_display",
    "diplome_display",
  ],
  actions: [
    {
      type: "edit",
      icon: <FiEdit size={17} />,
      tooltip: "Modifier le personnel",
      color: "#f39c12",
    },
  ],
};

// Alias pour maintenir la compatibilité
export const useQuestionsData = usePersonnelData;
export const questionsTableConfig = personnelTableConfig;
