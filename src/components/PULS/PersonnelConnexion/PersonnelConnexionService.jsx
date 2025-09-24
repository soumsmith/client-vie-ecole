/**
 * Service pour la gestion des informations de connexion du personnel
 * VERSION COMPLÈTE avec filtres école et DataTable optimisé
 * MISE À JOUR: Formatage basé sur le modèle de données réel de l'API
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "rsuite";
import {
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUser,
  FiMail,
  FiKey,
  FiUsers,
  FiPhone,
} from "react-icons/fi";
import { getFromCache, setToCache } from "../utils/cacheUtils";
import getFullUrl from "../../hooks/urlUtils";
import axios from "axios";

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const ECOLES_ENDPOINT = "connecte/ecole";
const PERSONNEL_CONNEXION_ENDPOINT = "personnel/infos-connexion-personnels";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ===========================
// FONCTION UTILITAIRE POUR FORMATAGE DES EMAILS
// ===========================
/**
 * Valide et formate une adresse email
 * @param {string} email
 * @returns {object}
 */
const analyzeEmail = (email) => {
  if (!email)
    return { isValid: false, display: "Email non renseigné", domain: "" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  const domain = email.includes("@") ? email.split("@")[1] : "";

  return {
    isValid: isValid,
    display: email,
    domain: domain,
    type: domain.includes("gmail")
      ? "Gmail"
      : domain.includes("yahoo")
      ? "Yahoo"
      : domain.includes("outlook")
      ? "Outlook"
      : "Autre",
  };
};

/**
 * Analyse la force d'un mot de passe
 * @param {string} password
 * @returns {object}
 */
const analyzePassword = (password) => {
  if (!password)
    return { strength: "AUCUN", score: 0, display: "Aucun mot de passe" };

  let score = 0;
  const length = password.length;

  // Critères de force
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  let strength;
  if (score >= 5) strength = "FORTE";
  else if (score >= 3) strength = "MOYENNE";
  else if (score >= 1) strength = "FAIBLE";
  else strength = "TRES_FAIBLE";

  return {
    strength: strength,
    score: score,
    length: length,
    display: `${length} caractères - ${strength.toLowerCase()}`,
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LA LISTE DES ÉCOLES
// ===========================
/**
 * Récupère la liste des écoles connectées
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useEcolesConnexionData = (refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEcoles = useCallback(async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);
      const cacheKey = "ecoles-connexion-data";

      // Vérifier le cache
      if (!skipCache) {
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // Appel direct à l'API
      const response = await axios.get(`${getFullUrl()}${ECOLES_ENDPOINT}`);

      // Traitement des données d'écoles
      let processedEcoles = [];
      if (response.data && Array.isArray(response.data)) {
        processedEcoles = response.data.map((ecole, index) => {
          return {
            // Propriétés essentielles pour SelectPicker
            value: ecole.ecoleid,
            label: `${ecole.ecolecode} - ${ecole.ecoleclibelle}`,

            // Données complètes de l'école
            id: ecole.ecoleid,
            code: ecole.ecolecode || "",
            libelle: ecole.ecoleclibelle || "",

            // Affichage optimisé
            display_short: ecole.ecoleclibelle,
            display_code: `${ecole.ecolecode} - ${ecole.ecoleclibelle}`,
            display_full: ecole.ecoleclibelle,

            // Données brutes
            raw_data: ecole,
          };
        });

        // Tri par libellé
        processedEcoles.sort((a, b) => a.libelle.localeCompare(b.libelle));
      }

      setToCache(cacheKey, processedEcoles, CACHE_DURATION);
      setData(processedEcoles);
    } catch (err) {
      console.error("Erreur lors de la récupération des écoles:", err);
      setError({
        message:
          err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des écoles",
        type: err.name || "FetchError",
        code: err.response?.status || err.code || "UNKNOWN",
        details: err.response?.data,
        url: err.config?.url,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEcoles(false);
  }, [refreshTrigger, fetchEcoles]);

  return {
    ecoles: data,
    loading,
    error,
    refetch: () => fetchEcoles(true),
  };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES INFORMATIONS DE CONNEXION
// ===========================
/**
 * Récupère les informations de connexion du personnel pour une école donnée
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const usePersonnelConnexionData = (refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const searchConnexions = useCallback(async (ecoleId) => {
    if (!ecoleId) {
      setError({
        message: "Veuillez sélectionner une école",
        type: "ValidationError",
        code: "MISSING_ECOLE",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchPerformed(false);

      const cacheKey = `personnel-connexion-${ecoleId}`;

      // Vérifier le cache
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setSearchPerformed(true);
        setLoading(false);
        return;
      }

      // Appel direct à l'API
      const response = await axios.get(
        `${getFullUrl()}${PERSONNEL_CONNEXION_ENDPOINT}/${ecoleId}`
      );

      // Traitement des informations de connexion
      let processedConnexions = [];
      if (response.data && Array.isArray(response.data)) {
        processedConnexions = response.data.map((item, index) => {
          // Analyse de l'email
          const emailAnalysis = analyzeEmail(item.login);

          // Analyse du mot de passe
          const passwordAnalysis = analyzePassword(item.motPasse);

          // Nom complet
          const nomComplet = `${item.nom || "Nom"} ${
            item.prenom || "Prénom"
          }`.trim();

          return {
            id: `connexion-${ecoleId}-${index}`,
            ordre: index + 1,

            // Informations personnelles
            nom: item.nom || "Nom inconnu",
            prenom: item.prenom || "Prénom inconnu",
            nomComplet: nomComplet,

            // Informations de connexion
            login: item.login || "",
            motPasse: item.motPasse || "",

            // École
            ecole: item.ecole || "",
            ecole_id: ecoleId,

            // Analyses
            email_analysis: emailAnalysis,
            password_analysis: passwordAnalysis,

            // Sécurité
            has_secure_password:
              passwordAnalysis.strength === "FORTE" ||
              passwordAnalysis.strength === "MOYENNE",
            has_valid_email: emailAnalysis.isValid,
            security_score:
              (emailAnalysis.isValid ? 1 : 0) +
              (passwordAnalysis.score >= 3 ? 1 : 0),

            // Affichage optimisé
            display_personnel: nomComplet,
            display_login: emailAnalysis.display,
            display_password_strength: passwordAnalysis.display,
            display_email_type: emailAnalysis.type,
            display_security: `${
              (emailAnalysis.isValid ? 1 : 0) +
              (passwordAnalysis.score >= 3 ? 1 : 0)
            }/2`,

            // Indicateurs visuels
            couleur_email: emailAnalysis.isValid ? "#16a34a" : "#dc2626",
            couleur_password:
              passwordAnalysis.strength === "FORTE"
                ? "#16a34a"
                : passwordAnalysis.strength === "MOYENNE"
                ? "#f59e0b"
                : "#dc2626",
            couleur_security:
              passwordAnalysis.score >= 3 && emailAnalysis.isValid
                ? "#16a34a"
                : passwordAnalysis.score >= 2 || emailAnalysis.isValid
                ? "#f59e0b"
                : "#dc2626",

            // Données brutes pour debug
            raw_data: item,
          };
        });

        // Tri par nom du personnel
        processedConnexions.sort((a, b) =>
          a.nomComplet.localeCompare(b.nomComplet)
        );
      }

      setToCache(cacheKey, processedConnexions, CACHE_DURATION);
      setData(processedConnexions);
      setSearchPerformed(true);
    } catch (err) {
      console.error("Erreur lors de la récupération des connexions:", err);
      setError({
        message:
          err.response?.data?.message ||
          err.message ||
          "Erreur lors de la recherche des informations de connexion",
        type: err.name || "SearchError",
        code: err.response?.status || err.code || "UNKNOWN",
        details: err.response?.data,
        url: err.config?.url,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setData([]);
    setError(null);
    setSearchPerformed(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      // Possibilité de rafraîchir si besoin
    }
  }, [refreshTrigger]);

  return {
    connexions: data,
    loading,
    error,
    searchPerformed,
    searchConnexions,
    clearResults,
  };
};

// ===========================
// CONFIGURATION DU TABLEAU DES CONNEXIONS
// ===========================
export const personnelConnexionTableConfig = {
  columns: [
    {
      title: "N°",
      dataKey: "ordre",
      flexGrow: 0.5,
      minWidth: 60,
      cellType: "custom",
      customRenderer: (rowData) => (
        <div
          style={{
            padding: "6px 8px",
            backgroundColor: "#667eea",
            color: "white",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            minWidth: "35px",
          }}
        >
          {rowData.ordre}
        </div>
      ),
      sortable: true,
    },
    {
      title: "Personnel",
      dataKey: "nomComplet",
      flexGrow: 2,
      minWidth: 180,
      cellType: "custom",
      customRenderer: (rowData) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#f1f5f9",
              border: "2px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FiUser size={16} color="#64748b" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: "600",
                color: "#1e293b",
                fontSize: "14px",
                marginBottom: "2px",
              }}
            >
              {rowData.display_personnel}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              {rowData.ecole}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      title: "Login (Email)",
      dataKey: "login",
      flexGrow: 2.5,
      minWidth: 220,
      cellType: "custom",
      customRenderer: (rowData) => (
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "500",
              color: rowData.couleur_email,
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <FiMail size={12} />
            {rowData.display_login}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                padding: "1px 4px",
                backgroundColor: rowData.has_valid_email
                  ? "#dcfce7"
                  : "#fee2e2",
                color: rowData.has_valid_email ? "#16a34a" : "#dc2626",
                borderRadius: "3px",
                fontSize: "9px",
                fontWeight: "500",
              }}
            >
              {rowData.has_valid_email ? "✓ Valide" : "✗ Invalide"}
            </span>
            <span>{rowData.display_email_type}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      title: "Mot de passe",
      dataKey: "motPasse",
      flexGrow: 2,
      minWidth: 160,
      cellType: "custom",
      customRenderer: (rowData) => (
        <div>
          <div
            style={{
              fontSize: "12px",
              fontFamily: "monospace",
              color: "#475569",
              marginBottom: "4px",
              backgroundColor: "#f8fafc",
              padding: "4px 6px",
              borderRadius: "4px",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "150px",
            }}
          >
            {rowData.motPasse || "Aucun mot de passe"}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <FiKey size={9} />
            <span
              style={{
                padding: "1px 4px",
                backgroundColor:
                  rowData.password_analysis.strength === "FORTE"
                    ? "#dcfce7"
                    : rowData.password_analysis.strength === "MOYENNE"
                    ? "#fef3c7"
                    : "#fee2e2",
                color: rowData.couleur_password,
                borderRadius: "3px",
                fontSize: "9px",
                fontWeight: "500",
              }}
            >
              {rowData.password_analysis.strength}
            </span>
            <span>{rowData.password_analysis.length} car.</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      title: "Sécurité",
      dataKey: "security_score",
      flexGrow: 1,
      minWidth: 100,
      cellType: "custom",
      customRenderer: (rowData) => (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              padding: "6px 10px",
              backgroundColor:
                rowData.security_score === 2
                  ? "#dcfce7"
                  : rowData.security_score === 1
                  ? "#fef3c7"
                  : "#fee2e2",
              color: rowData.couleur_security,
              border: `1px solid ${rowData.couleur_security}`,
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            {rowData.display_security}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#64748b",
            }}
          >
            {rowData.security_score === 2
              ? "Sécurisé"
              : rowData.security_score === 1
              ? "Moyen"
              : "Faible"}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      title: "Actions",
      dataKey: "actions",
      flexGrow: 1,
      minWidth: 120,
      cellType: "actions",
      fixed: "right",
    },
  ],
  filterConfigs: [
    {
      field: "has_valid_email",
      label: "Email valide",
      type: "boolean",
      tagColor: "blue",
    },
    {
      field: "has_secure_password",
      label: "Mot de passe sécurisé",
      type: "boolean",
      tagColor: "green",
    },
    {
      field: "email_analysis.type",
      label: "Type d'email",
      type: "select",
      dynamic: true,
      tagColor: "violet",
    },
    {
      field: "password_analysis.strength",
      label: "Force du mot de passe",
      type: "select",
      dynamic: true,
      tagColor: "orange",
    },
    {
      field: "security_score",
      label: "Score de sécurité",
      type: "select",
      options: [
        { label: "2/2 - Sécurisé", value: 2 },
        { label: "1/2 - Moyen", value: 1 },
        { label: "0/2 - Faible", value: 0 },
      ],
      tagColor: "red",
    },
  ],
  searchableFields: [
    "nomComplet",
    "nom",
    "prenom",
    "login",
    "motPasse",
    "ecole",
  ],
  actions: [
    {
      type: "view",
      icon: <FiEye />,
      tooltip: "Voir les détails de connexion",
      color: "#3498db",
    },
    {
      type: "edit",
      icon: <FiEdit />,
      tooltip: "Modifier les informations",
      color: "#f39c12",
    },
    {
      type: "download",
      icon: <FiDownload />,
      tooltip: "Exporter les données",
      color: "#9b59b6",
    },
    {
      type: "delete",
      icon: <FiTrash2 />,
      tooltip: "Supprimer l'accès",
      color: "#e74c3c",
    },
  ],
  // Configuration supplémentaire pour le tableau
  defaultSortField: "nomComplet",
  defaultSortOrder: "asc",
  pageSize: 15,
  showPagination: true,
  showSearch: true,
  showFilters: true,
  enableExport: true,
  exportFormats: ["excel", "pdf", "csv"],
};
