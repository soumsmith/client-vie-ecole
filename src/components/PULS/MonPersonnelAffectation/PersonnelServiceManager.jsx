/**
 * Service pour la gestion des données de personnel
 * VERSION CORRIGÉE - Filtres fonctionnels alignés sur les données
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

      const url = personnelUrls.getSouscriptionsByEcole();
      const response = await axios.get(url);

      const apiData = response.data;
      let personnelArray = [];

      if (apiData && !Array.isArray(apiData)) {
        personnelArray = [apiData];
      } else if (Array.isArray(apiData)) {
        personnelArray = apiData;
      }

      const processedPersonnel = personnelArray.map((personnel) => ({
        id: personnel.personnelid,
        nom: personnel.personnelnom,
        prenom: personnel.personnelprenom,
        nomComplet: `${personnel.personnelprenom || ""} ${personnel.personnelnom || ""}`.trim(),
        sexe: personnel.personnel_sexe,
        contact: personnel.personnel_contact,
        dateNaissance: personnel.personneldatenaissance,
        age: calculateAge(personnel.personneldatenaissance),
        fonction: personnel.fonction?.fonctionlibelle || "Non définie",
        fonctionCode: personnel.fonction?.fonctioncode || "",
        niveauEtude: personnel.niveau_etude?.niveau_etude_libelle || "Non défini",
        niveauEtudeCode: personnel.niveau_etude?.niveau_etude_code || "",
        domaineFormation: personnel.domaine_formation_domaine_formationid?.domaine_formation_libelle || "Non défini",
        domaineFormationCode: personnel.domaine_formation_domaine_formationid?.domaine_formation_code || "",
        ecole: personnel.ecole?.ecoleclibelle || "Non définie",
        ecoleCode: personnel.ecole?.ecolecode || "",
        email: personnel.sous_attent_personn?.sous_attent_personn_email || "",
        diplomeRecent: personnel.sous_attent_personn?.sous_attent_personn_diplome_recent || "",
        experienceAnnees: personnel.sous_attent_personn?.sous_attent_personn_nbre_annee_experience || 0,
        statut: personnel.sous_attent_personn?.sous_attent_personn_statut || "INCONNU",
        dateCreation: personnel.sous_attent_personn?.sous_attent_personn_date_creation || "",
        dateTraitement: personnel.sous_attent_personn?.sous_attent_personn_date_traitement || "",
        cvLien: personnel.sous_attent_personn?.sous_attent_personn_lien_cv || "", //--->
        pieceIdentiteLien: personnel.sous_attent_personn?.sous_attent_personn_lien_piece || "", //--->
        autorisationLien: personnel.sous_attent_personn?.sous_attent_personn_lien_autorisation || "",//--->
        raw_data: personnel,
      }));

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
 */
const calculateAge = (dateNaissance) => {
  if (!dateNaissance) return 0;
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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
      <span style={{ color: isMale ? "#3498db" : "#e91e63", fontSize: "14px" }}>
        {isMale ? "♂" : "♀"}
      </span>
      <span>{sexe}</span>
    </div>
  );
};

/**
 * Configuration du tableau pour le personnel
 * ⚠️ CORRECTION : Les champs des filtres correspondent maintenant aux propriétés réelles des données
 */
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
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                <FiPhone style={{ color: "#27ae60", fontSize: "12px" }} />
                <span style={{ fontSize: "13px" }}>{rowData.contact || "N/A"}</span>
              </div>
              {rowData.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <FiMail style={{ color: "#3498db", fontSize: "12px" }} />
                  <span style={{ fontSize: "11px", color: "#666" }}>
                    {rowData.email.length > 20 ? rowData.email.substring(0, 20) + "..." : rowData.email}
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
              <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
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
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#27ae60" }}>
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

    // ⚠️ CORRECTION MAJEURE : Les noms de champs correspondent maintenant exactement aux propriétés des données
    filterConfigs: [
      {
        field: 'fonction',  // ✓ Correspond à rowData.fonction
        label: 'Fonction',
        placeholder: 'Toutes les fonctions',
        type: 'select',
        dynamic: true,
        tagColor: 'green'
      },
      {
        field: 'niveauEtude',  // ✓ CORRIGÉ : était 'diplome', maintenant 'niveauEtude'
        label: 'Niveau d\'étude',
        placeholder: 'Tous les niveaux',
        type: 'select',
        dynamic: true,
        tagColor: 'blue'
      },
      {
        field: 'domaineFormation',  // ✓ CORRIGÉ : était 'domaine', maintenant 'domaineFormation'
        label: 'Domaine de formation',
        placeholder: 'Tous les domaines',
        type: 'select',
        dynamic: true,
        tagColor: 'orange'
      },
      {
        field: 'ecole',  // ✓ Correspond à rowData.ecole
        label: 'École',
        placeholder: 'Toutes les écoles',
        type: 'select',
        dynamic: true,
        tagColor: 'purple'
      },
      {
        field: 'experienceAnnees',  // ✓ CORRIGÉ : était 'experience', maintenant 'experienceAnnees'
        label: 'Années d\'expérience',
        placeholder: 'Toutes les expériences',
        type: 'range',
        min: 0,
        max: 20,
        tagColor: 'cyan'
      },
      {
        field: 'dateCreation',  // ✓ Correspond à rowData.dateCreation
        label: 'Date d\'ajout',
        placeholder: 'Sélectionner une date',
        type: 'date',
        tagColor: 'pink'
      }
    ],

    actions: [
      ...(isListePersonnel
        ? [
          {
            type: "view",
            icon: <FiEye size={17} />,
            tooltip: "Voir le détail du personnel",
            color: "#3498db",
          },
        ]
        : [
          {
            type: "edit",
            icon: <FiUserCheck size={17} />,
            tooltip: "Affecter des profils",
            color: "#f39c12",
          },
        ]),
    ],
  };
};