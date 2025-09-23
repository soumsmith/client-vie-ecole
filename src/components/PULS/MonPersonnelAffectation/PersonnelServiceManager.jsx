/**
 * Service pour la gestion des données de personnel
 * VERSION CORRIGÉE avec filtres fonctionnels et actions améliorées
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
  FiUserCheck,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { getFromCache, setToCache, clearCache } from "../utils/cacheUtils";
import { usePersonnelUrls, useAppParams } from '../utils/apiConfig';

/**
 * Hook pour récupérer la liste du personnel
 * @param {number} ecoleId - ID de l'école
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const usePersonnelData = (typeDeListe, refreshTrigger = 0) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performance, setPerformance] = useState(null);

  const appParams = useAppParams();
  const personnelUrls = usePersonnelUrls();
  
  const fetchData = async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);
      const startTime = Date.now();
      const cacheKey = `personnel-data-${appParams.ecoleId}`;

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

      const url = personnelUrls.getSouscriptionsByEcole();
      const response = await axios.get(url);

      // CORRECTION: L'API retourne un objet unique, pas un tableau
      const apiData = response.data;
      let personnelArray = [];

      // Si c'est un objet unique, on le met dans un tableau
      if (apiData && !Array.isArray(apiData)) {
        personnelArray = [apiData];
      } else if (Array.isArray(apiData)) {
        personnelArray = apiData;
      }

      const processedPersonnel = personnelArray.map((personnel) => ({
        id: personnel.personnelid,
        nom: personnel.personnelnom,
        prenom: personnel.personnelprenom,
        nomComplet: `${personnel.personnelprenom || ""} ${personnel.personnelnom || ""
          }`.trim(),
        sexe: personnel.personnel_sexe,
        contact: personnel.personnel_contact,
        dateNaissance: personnel.personneldatenaissance,
        age: calculateAge(personnel.personneldatenaissance),
        fonction: personnel.fonction?.fonctionlibelle || "Non définie",
        fonctionCode: personnel.fonction?.fonctioncode || "",
        niveauEtude:
          personnel.niveau_etude?.niveau_etude_libelle || "Non défini",
        niveauEtudeCode: personnel.niveau_etude?.niveau_etude_code || "",
        domaineFormation:
          personnel.domaine_formation_domaine_formationid
            ?.domaine_formation_libelle || "Non défini",
        domaineFormationCode:
          personnel.domaine_formation_domaine_formationid
            ?.domaine_formation_code || "",
        ecole: personnel.ecole?.ecoleclibelle || "Non définie",
        ecoleCode: personnel.ecole?.ecolecode || "",
        email: personnel.sous_attent_personn?.sous_attent_personn_email || "",
        diplomeRecent:
          personnel.sous_attent_personn?.sous_attent_personn_diplome_recent ||
          "",
        experienceAnnees:
          personnel.sous_attent_personn
            ?.sous_attent_personn_nbre_annee_experience || 0,
        statut:
          personnel.sous_attent_personn?.sous_attent_personn_statut ||
          "INCONNU",
        dateCreation:
          personnel.sous_attent_personn?.sous_attent_personn_date_creation ||
          "",
        dateTraitement:
          personnel.sous_attent_personn?.sous_attent_personn_date_traitement ||
          "",
        cvLien:
          personnel.sous_attent_personn?.sous_attent_personn_lien_cv || "",
        pieceIdentiteLien:
          personnel.sous_attent_personn?.sous_attent_personn_lien_piece || "",
        autorisationLien:
          personnel.sous_attent_personn
            ?.sous_attent_personn_lien_autorisation || "",
        raw_data: personnel,
      }));

      console.log("Données traitées:", processedPersonnel); // Pour debug

      setToCache(cacheKey, processedPersonnel);
      setData(processedPersonnel);
      setPerformance({
        duration: Date.now() - startTime,
        source: "api",
        itemCount: processedPersonnel.length,
        dataSize: JSON.stringify(response.data).length,
      });
    } catch (err) {
      console.error("Erreur lors du fetch:", err);
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
  }, [appParams.ecoleId, refreshTrigger]);

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
 * Fonction utilitaire pour calculer l'âge
 * @param {string} dateNaissance
 * @returns {number}
 */
const calculateAge = (dateNaissance) => {
  if (!dateNaissance) return 0;
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

/**
 * Vide le cache du personnel
 */
export const clearPersonnelCache = () => {
  clearCache();
};

/**
 * Composant pour afficher le statut
 */
const StatutBadge = ({ statut }) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "VALIDEE":
        return "green";
      case "EN_ATTENTE":
        return "orange";
      case "REFUSEE":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Badge
      style={{
        backgroundColor: getStatusColor(statut),
        color: "white",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "11px",
      }}
    >
      {statut || "INCONNU"}
    </Badge>
  );
};

/**
 * Composant pour afficher le sexe avec icône
 */
const SexeDisplay = ({ sexe }) => {
  const isMale = sexe?.toUpperCase() === "MASCULIN";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span
        style={{
          color: isMale ? "#3498db" : "#e91e63",
          fontSize: "14px",
        }}
      >
        {isMale ? "♂" : "♀"}
      </span>
      <span>{sexe}</span>
    </div>
  );
};

/**
 * Hook pour récupérer les options de filtre dynamiques
 * @param {Array} personnel - Liste du personnel
 * @returns {Object} Options de filtre
 */
export const useFilterOptions = (personnel) => {
  return {
    sexeOptions: [
      { label: "Tous", value: "" },
      { label: "Masculin", value: "MASCULIN" },
      { label: "Féminin", value: "FEMININ" },
    ],
    statutOptions: [
      { label: "Tous", value: "" },
      { label: "Validée", value: "VALIDEE" },
      { label: "En attente", value: "EN_ATTENTE" },
      { label: "Refusée", value: "REFUSEE" },
    ],
    fonctionOptions: [
      { label: "Toutes", value: "" },
      ...Array.from(new Set(personnel.map((p) => p.fonction)))
        .filter((f) => f && f !== "Non définie")
        .map((fonction) => ({ label: fonction, value: fonction })),
    ],
    niveauEtudeOptions: [
      { label: "Tous", value: "" },
      ...Array.from(new Set(personnel.map((p) => p.niveauEtude)))
        .filter((n) => n && n !== "Non défini")
        .map((niveau) => ({ label: niveau, value: niveau })),
    ],
    domaineFormationOptions: [
      { label: "Tous", value: "" },
      ...Array.from(new Set(personnel.map((p) => p.domaineFormation)))
        .filter((d) => d && d !== "Non défini")
        .map((domaine) => ({ label: domaine, value: domaine })),
    ],
  };
};

// Configuration du tableau pour le personnel
export const getPersonnelTableConfig = (typeDeListe) => {
  const isListePersonnel = typeDeListe === "listePersonnel";

  return {
    columns: [
      {
        title: "Nom Complet",
        dataKey: "nomComplet",
        flexGrow: 2,
        minWidth: 180,
        sortable: true,
        cell: ({ rowData }) => {
          if (!rowData) return null;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiUser style={{ color: "#666", fontSize: "16px" }} />
              <div>
                <div style={{ fontWeight: "500", fontSize: "14px" }}>
                  {rowData.nomComplet || "Non défini"}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  ID: {rowData.id}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: "Contact",
        dataKey: "contact",
        flexGrow: 1,
        minWidth: 130,
        sortable: true,
        cell: ({ rowData }) => {
          if (!rowData) return null;
          return (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "2px",
                }}
              >
                <FiPhone style={{ color: "#27ae60", fontSize: "12px" }} />
                <span style={{ fontSize: "13px" }}>
                  {rowData.contact || "N/A"}
                </span>
              </div>
              {rowData.email && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <FiMail style={{ color: "#3498db", fontSize: "12px" }} />
                  <span style={{ fontSize: "11px", color: "#666" }}>
                    {rowData.email.length > 20
                      ? rowData.email.substring(0, 20) + "..."
                      : rowData.email}
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: "Sexe/Âge",
        dataKey: "sexe",
        flexGrow: 1,
        minWidth: 100,
        sortable: true,
        cell: ({ rowData }) => {
          if (!rowData) return null;
          return (
            <div>
              <SexeDisplay sexe={rowData.sexe} />
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}
              >
                {rowData.age} ans
              </div>
            </div>
          );
        },
      },
      {
        title: "Fonction",
        dataKey: "fonction",
        flexGrow: 1,
        minWidth: 140,
        sortable: true,
        cell: ({ rowData }) => {
          if (!rowData) return null;
          return (
            <div>
              <div style={{ fontWeight: "500", fontSize: "13px" }}>
                {rowData.fonction || "Non défini"}
              </div>
              <div style={{ fontSize: "11px", color: "#666" }}>
                Code: {rowData.fonctionCode || "N/A"}
              </div>
            </div>
          );
        },
      },
      {
        title: "Formation",
        dataKey: "niveauEtude",
        flexGrow: 1,
        minWidth: 150,
        sortable: true,
        cell: ({ rowData }) => {
          if (!rowData) return null;
          return (
            <div>
              <div style={{ fontSize: "12px", fontWeight: "500" }}>
                {rowData.niveauEtude}
              </div>
              <div style={{ fontSize: "11px", color: "#666" }}>
                {rowData.domaineFormation}
              </div>
              {rowData.diplomeRecent && (
                <div style={{ fontSize: "10px", color: "#27ae60" }}>
                  {rowData.diplomeRecent}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: "Expérience",
        dataKey: "experienceAnnees",
        flexGrow: 1,
        minWidth: 100,
        sortable: true,
        cell: ({ rowData }) => {
          if (!rowData) return null;
          return (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#27ae60",
                }}
              >
                {rowData.experienceAnnees}
              </div>
              <div style={{ fontSize: "11px", color: "#666" }}>
                année{rowData.experienceAnnees > 1 ? "s" : ""}
              </div>
            </div>
          );
        },
      },
      {
        title: "Statut",
        dataKey: "statut",
        flexGrow: 1,
        minWidth: 100,
        sortable: true,
        cell: ({ rowData }) => {
          if (!rowData) return null;
          return <StatutBadge statut={rowData.statut} />;
        },
      },
      {
        title: "Actions",
        dataKey: "actions",
        flexGrow: 0.5,
        minWidth: 120,
        cellType: "actions",
        fixed: "right",
      },
    ],
    searchableFields: [
      "nomComplet",
      "nom",
      "prenom",
      "contact",
      "fonction",
      "niveauEtude",
      "domaineFormation",
      "email",
    ],


    // Configuration des filtres corrigée
    getFilterConfigs: (personnel) => {
      const filterOptions = useFilterOptions(personnel);

      return [
        {
          key: "sexe",
          label: "Sexe",
          type: "select",
          options: filterOptions.sexeOptions,
          filterFunction: (item, value) => {
            if (!value) return true;
            return item.sexe === value;
          },
        },
        {
          key: "statut",
          label: "Statut",
          type: "select",
          options: filterOptions.statutOptions,
          filterFunction: (item, value) => {
            if (!value) return true;
            return item.statut === value;
          },
        },
        {
          key: "fonction",
          label: "Fonction",
          type: "select",
          options: filterOptions.fonctionOptions,
          filterFunction: (item, value) => {
            if (!value) return true;
            return item.fonction === value;
          },
        },
        {
          key: "niveauEtude",
          label: "Niveau d'étude",
          type: "select",
          options: filterOptions.niveauEtudeOptions,
          filterFunction: (item, value) => {
            if (!value) return true;
            return item.niveauEtude === value;
          },
        },
        {
          key: "domaineFormation",
          label: "Domaine de formation",
          type: "select",
          options: filterOptions.domaineFormationOptions,
          filterFunction: (item, value) => {
            if (!value) return true;
            return item.domaineFormation === value;
          },
        },
        {
          key: "experienceRange",
          label: "Expérience",
          type: "select",
          options: [
            { label: "Toutes", value: "" },
            { label: "0-2 ans", value: "0-2" },
            { label: "3-5 ans", value: "3-5" },
            { label: "6-10 ans", value: "6-10" },
            { label: "10+ ans", value: "10+" },
          ],
          filterFunction: (item, value) => {
            if (!value) return true;
            const exp = item.experienceAnnees || 0;
            switch (value) {
              case "0-2":
                return exp >= 0 && exp <= 2;
              case "3-5":
                return exp >= 3 && exp <= 5;
              case "6-10":
                return exp >= 6 && exp <= 10;
              case "10+":
                return exp > 10;
              default:
                return true;
            }
          },
        },
      ];
    },

    actions: [
      // Actions communes
      // {
      //   type: "view",
      //   icon: <FiEye size={17} />,
      //   tooltip: "Voir le détail du personnel",
      //   color: "#3498db",
      // },

      // Actions spécifiques selon le type de liste
      ...(isListePersonnel
        ? [
          // Actions pour la liste du personnel (consultation)
          // {
          //   type: "download",
          //   icon: <FiDownload size={17} />,
          //   tooltip: "Télécharger les documents",
          //   color: "#27ae60",
          // },
          {
            type: "view",
            icon: <FiEye size={17} />,
            tooltip: "Voir le détail du personnel",
            color: "#3498db",
          },
        ]
        : [
          // Actions pour la gestion du personnel (édition)
          {
            type: "edit",
            icon: <FiUserCheck size={17} />,
            tooltip: "Affecter des profils",
            color: "#f39c12",
          },
          // {
          //   type: "download",
          //   icon: <FiDownload size={17} />,
          //   tooltip: "Télécharger les documents",
          //   color: "#27ae60",
          // },
          // {
          //   type: "delete",
          //   icon: <FiTrash2 size={17} />,
          //   tooltip: "Supprimer le personnel",
          //   color: "#e74c3c",
          // },
        ]),
    ],
  };
};