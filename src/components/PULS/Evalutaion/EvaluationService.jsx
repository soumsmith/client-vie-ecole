/**
 * Service pour la gestion des évaluations
 * VERSION COMPLÈTE avec filtres classe/matière et DataTable
 * MISE À JOUR: Formatage basé sur le modèle de données réel de l'API
 * REFACTORING: Hook useMatieresData déplacé vers CommonDataService
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Badge, Toggle } from "rsuite";
import {
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiCalendar,
  FiBookOpen,
  FiClock,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { getFromCache, setToCache } from "../utils/cacheUtils";
import { useAllApiUrls } from "../utils/apiConfig";
import { usePulsParams } from "../../hooks/useDynamicParams";
import axios from "axios";
import { useAppParams } from '../utils/apiConfig';

// ===========================
// CONFIGURATION GLOBALE (VALEURS PAR DÉFAUT)
// ===========================

// ===========================
// FONCTION UTILITAIRE POUR FORMATAGE DES DATES
// ===========================
/**
 * Formate une date ISO en format français JJ/MM/AAAA
 * @param {string} dateString
 * @returns {string}
 */
const formatDate = (dateString) => {
  if (!dateString) return "Non définie";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return "Date invalide";
  }
};

// ===========================
// FONCTION UTILITAIRE POUR FORMATAGE DE LA DURÉE
// ===========================
/**
 * Formate une durée de type "02-00" en "2h00"
 * @param {string} duration
 * @returns {string}
 */
const formatDuration = (duration) => {
  if (!duration) return "2h00";
  if (typeof duration === "string" && duration.includes("-")) {
    const [hours, minutes] = duration.split("-");
    return `${hours}h${minutes}`;
  }
  if (typeof duration === "string" && duration.includes("h")) {
    return duration;
  }
  return duration || "2h00";
};

// ===========================
// FONCTION UTILITAIRE POUR DÉTERMINER LE STATUT D'UNE ÉVALUATION
// ===========================
/**
 * Détermine le statut d'une évaluation selon la date et l'état
 * @param {object} evaluation
 * @returns {string}
 */
const determineStatut = (evaluation) => {
  if (evaluation.etat && evaluation.etat.trim() !== "") {
    return evaluation.etat;
  }
  const now = new Date();
  const evalDate = new Date(evaluation.date);
  if (evalDate > now) {
    return "Programmée";
  } else if (evalDate.toDateString() === now.toDateString()) {
    return "En cours";
  } else {
    return "Terminée";
  }
};

// ===========================
// HOOK POUR RÉCUPÉRER LES ÉVALUATIONS D'UNE CLASSE/MATIÈRE/PÉRIODE
// ===========================
/**
 * Récupère la liste des évaluations selon la classe, la matière, la période et l'année
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useEvaluationsData = (refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const apiUrls = useAllApiUrls();
  const params = useAppParams();

  const {
    periodicitieId: dynamicPeriodicitieId,
    personnelInfo: personnelInfo,
    academicYearId: dynamicAcademicYearId,
    ecoleId: dynamicEcoleId
  } = usePulsParams();

  const searchEvaluations = useCallback(

    async (
      classeId,
      matiereId = null,
      periodeId = null,
      anneeId
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

        // Construction des paramètres de query
        const appsparams = new URLSearchParams();
        appsparams.append("classeId", classeId);
        appsparams.append("annee", dynamicAcademicYearId);
        if (matiereId) appsparams.append("matiereId", matiereId);
        if (periodeId) appsparams.append("periodeId", periodeId);


        // Appel direct à l'API (pas de proxy)
        const filters = {
          classeId: classeId,
          annee: params.academicYearId,
          matiereId: matiereId,
          periodeId: periodeId
        };
        const response = await axios.get(
          apiUrls.evaluations.getClasseMatierePeriodie(filters)
        );
        // Traitement des évaluations
        let processedEvaluations = [];
        if (response.data && Array.isArray(response.data)) {
          processedEvaluations = response.data.map((evaluation, index) => {
            const statut = determineStatut(evaluation);
            return {
              id: evaluation.id || `eval-${index}`,
              code: evaluation.code || `eval-${index}`,
              numero: evaluation.numero || `${index + 1}`,
              date:
                evaluation.date ||
                evaluation.dateCreation ||
                new Date().toISOString(),
              date_display:
                evaluation.dateToFilter ||
                formatDate(evaluation.date || evaluation.dateCreation),
              dateToFilter:
                evaluation.dateToFilter || formatDate(evaluation.date),
              type: evaluation.type?.libelle || "Devoir",
              type_id: evaluation.type?.id || 1,
              type_seance: evaluation.type?.typeSeance || "EVAL",
              duree: formatDuration(evaluation.duree),
              duree_raw: evaluation.duree || "02-00",
              noteSur: evaluation.noteSur || "20",
              note_sur_display: `/${evaluation.noteSur || "20"}`,
              matiere: evaluation.matiereEcole?.libelle || "Matière inconnue",
              matiere_id: evaluation.matiereEcole?.id || matiereId,
              matiere_code: evaluation.matiereEcole?.code || "",
              matiere_categorie:
                evaluation.matiereEcole?.categorie?.libelle || "",
              matiere_numOrdre: evaluation.matiereEcole?.numOrdre || 0,
              matiere_pec: evaluation.matiereEcole?.pec || 0,
              matiere_bonus: evaluation.matiereEcole?.bonus || 0,
              periode: evaluation.periode?.libelle || "Période inconnue",
              periode_id: evaluation.periode?.id || periodeId,
              periode_coef: parseFloat(evaluation.periode?.coef || "1.0"),
              periode_niveau: evaluation.periode?.niveau || 1,
              classe: evaluation.classe?.libelle || "Classe inconnue",
              classe_id: evaluation.classe?.id || classeId,
              classe_code: evaluation.classe?.code || "",
              classe_effectif: evaluation.classe?.effectif || 0,
              ecole: evaluation.classe?.ecole?.libelle || "École inconnue",
              ecole_id: evaluation.classe?.ecole?.id,
              ecole_code: evaluation.classe?.ecole?.code || "",
              ecole_tel: evaluation.classe?.ecole?.tel || "",
              ecole_signataire: evaluation.classe?.ecole?.nomSignataire || "",
              serie: evaluation.classe?.branche?.serie?.libelle || "",
              filiere: evaluation.classe?.branche?.filiere?.libelle || "",
              niveau: evaluation.classe?.branche?.niveau?.libelle || "",
              annee: evaluation.annee?.libelle || "Année inconnue",
              annee_id: evaluation.annee?.id || anneeId,
              annee_debut: evaluation.annee?.anneeDebut || 2024,
              annee_statut: evaluation.annee?.statut || "DIFFUSE",
              statut: statut,
              statut_display: statut,
              etat_original: evaluation.etat || "",
              heure: evaluation.heure || "",
              dateLimite: evaluation.dateLimite || "",
              user: evaluation.user || "",
              dateCreation: evaluation.dateCreation || new Date().toISOString(),
              dateUpdate: evaluation.dateUpdate || "",
              pec: evaluation.pec || 0,
              coefficient: parseFloat(evaluation.periode?.coef || "1.0"),
              nombreEleves: evaluation.classe?.effectif || 0,
              evaluation_display: `${evaluation.type?.libelle || "Devoir"} N°${evaluation.numero || index + 1
                }`,
              description_complete: `${evaluation.type?.libelle || "Devoir"
                } de ${evaluation.matiereEcole?.libelle || "Matière"} - ${evaluation.periode?.libelle || "Période"
                }`,
              details_display: `${formatDuration(evaluation.duree)} • /${evaluation.noteSur || "20"
                } • ${evaluation.classe?.effectif || 0} élèves`,
              raw_data: evaluation,
            };
          });
        }
        //setToCache(cacheKey, processedEvaluations);
        setData(processedEvaluations);
        setSearchPerformed(true);
      } catch (err) {
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
      } finally {
        setLoading(false);
      }
    },
    [apiUrls.evaluations, dynamicAcademicYearId]
  );

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
    evaluations: data,
    loading,
    error,
    searchPerformed,
    searchEvaluations,
    clearResults,
  };
};

// ===========================
// CONFIGURATION DU TABLEAU DES ÉVALUATIONS
// ===========================
export const getEvaluationsTableConfig = (callbacks = {}) => {
  return {
    columns: [
      {
        title: "N°",
        dataKey: "numero",
        flexGrow: 0.5,
        minWidth: 70,
        sortable: true,
      },
      {
        title: "Date",
        dataKey: "date_display",
        flexGrow: 1,
        minWidth: 110,
        cellType: "custom",
        customRenderer: (rowData) => (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FiCalendar size={14} color="#667eea" />
            <span style={{ fontSize: "13px", fontWeight: "500" }}>
              {rowData.date_display}
            </span>
          </div>
        ),
        sortable: true,
      },
      {
        title: "Type d'évaluation",
        dataKey: "evaluation_display",
        flexGrow: 2.5,
        minWidth: 100,
        cellType: "custom",
        customRenderer: (rowData) => (
          <div>
            <div style={{
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '14px',
              marginBottom: '2px'
            }}>
              {rowData.evaluation_display}
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
              <span>🕒 {rowData.duree}</span>
              <span>📊 {rowData.note_sur_display}</span>
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        title: "Matière",
        dataKey: "matiere",
        flexGrow: 1.5,
        minWidth: 100,
        cellType: "custom",
        customRenderer: (rowData) => (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "2px",
              }}
            >
              <FiBookOpen size={12} color="#10b981" />
              <span
                style={{
                  fontSize: "12px",
                  color: "#059669",
                  fontWeight: "500",
                }}
              >
                {rowData.matiere}
              </span>
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        title: "Note sur",
        dataKey: "noteSur",
        flexGrow: 1,
        minWidth: 120,
      },
      {
        title: "Période",
        dataKey: "periode",
        flexGrow: 2.2,
        minWidth: 120,
        cellType: "custom",
        customRenderer: (rowData) => (
          <div>
            {rowData.periode}
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>Coef: {rowData.coefficient}</span>
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        title: "Classe",
        dataKey: "classe",
        flexGrow: 1,
        minWidth: 100,
        cellType: "custom",
        customRenderer: (rowData) => (
          <div>
            <div
              style={{
                fontWeight: "600",
                color: "#1e293b",
                fontSize: "13px",
                marginBottom: "2px",
              }}
            >
              {rowData.classe}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <FiUsers size={11} />
              <span>{rowData.nombreEleves} élèves</span>
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        title: "Statut",
        dataKey: "statut_display",
        flexGrow: 1.5,
        minWidth: 100,
        cellType: "custom",
        customRenderer: (rowData) => {
          const colorMap = {
            Programmée: { bg: "#fef3c7", text: "#d97706", border: "#f59e0b" },
            "En cours": { bg: "#dbeafe", text: "#2563eb", border: "#3b82f6" },
            Terminée: { bg: "#dcfce7", text: "#16a34a", border: "#22c55e" },
            Annulée: { bg: "#fee2e2", text: "#dc2626", border: "#ef4444" },
          };

          const colors =
            colorMap[rowData.statut_display] || colorMap["Programmée"];

          return (
            <div
              style={{
                padding: "4px 8px",
                backgroundColor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              {rowData.statut_display}
            </div>
          );
        },
        sortable: true,
      },
      {
        title: "P.E.C",
        dataKey: "pec",
        flexGrow: 1,
        minWidth: 70,
        cellType: "custom",
        customRenderer: (rowData) => (
          <Toggle
            checked={rowData.pec === 1}
            onChange={(checked) => {
              if (callbacks.onPecToggle) {
                callbacks.onPecToggle(rowData, checked);
              }
            }}
            checkedChildren="Oui"
            color="green"
            unCheckedChildren="Non"
            size="md"
          />
        ),
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
        field: "type",
        label: "Type d'évaluation",
        type: "select",
        dynamic: true,
        tagColor: "blue",
      },
      {
        field: "statut_display",
        label: "Statut",
        type: "select",
        dynamic: true,
        tagColor: "green",
      },
      {
        field: "matiere",
        label: "Matière",
        type: "select",
        dynamic: true,
        tagColor: "purple",
      },
      {
        field: "periode",
        label: "Période",
        type: "select",
        dynamic: true,
        tagColor: "orange",
      },
      {
        field: "date_display",
        label: "Date",
        type: "date",
        tagColor: "cyan",
      },
    ],
    searchableFields: [
      "numero",
      "evaluation_display",
      "type",
      "matiere",
      "periode",
      "classe",
      "description_complete",
    ],
    actions: [
      {
        type: "view",
        icon: <FiEye size={17} />,
        tooltip: "Voir les détails de l'évaluation",
        color: "#3498db",
      },
      {
        type: "edit",
        icon: <FiEdit size={17} />,
        tooltip: "Modifier l'évaluation",
        color: "#f39c12",
      },
      {
        type: "delete",
        icon: <FiTrash2 size={17} />,
        tooltip: "Supprimer l'évaluation",
        color: "#e74c3c",
      },
    ],
    defaultSortField: "date_display",
    defaultSortOrder: "desc",
    pageSize: 10,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ["excel", "pdf", "csv"],
  };
};