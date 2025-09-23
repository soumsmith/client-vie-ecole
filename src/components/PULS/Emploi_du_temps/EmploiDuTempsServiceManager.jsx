/**
 * Service pour la gestion des données d'emploi du temps
 * VERSION MISE À JOUR - Conserve toutes les fonctions existantes + nouvelles fonctions
 */

import axios from 'axios';
import { Badge, Tag } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiClock, FiBook, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAllApiUrls } from '../utils/apiConfig';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { usePulsParams } from '../../hooks/useDynamicParams';
import getFullUrl from "../../hooks/urlUtils";


/**
 * Hook pour récupérer les activités de l'emploi du temps (FONCTION EXISTANTE)
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useEmploiDuTempsData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);
    const apiUrls = useAllApiUrls();
    const { ecoleId: dynamicEcoleId } = usePulsParams();

    const fetchData = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const startTime = Date.now();
            const cacheKey = `emploi-du-temps-${dynamicEcoleId}`;

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    setPerformance({
                        duration: Date.now() - startTime,
                        source: 'cache',
                        itemCount: cachedData.length
                    });
                    return;
                }
            }

            const response = await axios.get(apiUrls.emploiDuTemps.listActivitesByEcole());
            const processedActivites = response.data && Array.isArray(response.data)
                ? response.data.map(activite => ({
                    id: activite.id,
                    classe: activite.classe?.libelle || 'Non définie',
                    classeId: activite.classe?.id,
                    jour: activite.jour?.libelle || 'Non défini',
                    jourCode: activite.jour?.code,
                    jourId: activite.jour?.id,
                    heureDeb: activite.heureDeb,
                    heureFin: activite.heureFin,
                    matiere: activite.matiere?.libelle || 'Non définie',
                    matiereId: activite.matiere?.id,
                    salle: activite.salle?.libelle || 'Non définie',
                    salleId: activite.salle?.id,
                    typeActivite: activite.typeActivite?.libelle || 'Non défini',
                    typeActiviteId: activite.typeActivite?.id,
                    statut: activite.statut,
                    annee: activite.annee,
                    user: activite.user,
                    creneauHoraire: `${activite.heureDeb} - ${activite.heureFin}`,
                    raw_data: activite
                }))
                : [];

            setToCache(cacheKey, processedActivites);
            setData(processedActivites);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedActivites.length,
                dataSize: JSON.stringify(response.data).length
            });
        } catch (err) {
            setError({
                message: err.message || 'Erreur inconnue',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(false);
    }, [dynamicEcoleId, refreshTrigger]);

    const forceRefresh = () => {
        fetchData(true);
    };

    return {
        emploiDuTemps: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Hook pour récupérer les classes (FONCTION EXISTANTE)
 */
export const useClassesData = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await axios.get(apiUrls.classes.listByEcoleSorted());
            console.log('Classes reçues ========>:', response.data);
            setClasses(response.data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    return { classes, loading, error, refetch: fetchClasses };
};

/**
 * Hook pour récupérer les jours (FONCTION EXISTANTE)
 */
export const useJoursData = () => {
    const [jours, setJours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchJours = async () => {
        try {
            setLoading(true);
            const response = await axios.get(apiUrls.emploiDuTemps.listJours());
            setJours(response.data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJours();
    }, []);

    return { jours, loading, error, refetch: fetchJours };
};

/**
 * Hook pour récupérer les types d'activité (FONCTION EXISTANTE)
 */
export const useTypesActiviteData = () => {
    const [typesActivite, setTypesActivite] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();
    const { ecoleId: dynamicEcoleId } = usePulsParams();

    const fetchTypesActivite = async () => {
        try {
            setLoading(true);
            const response = await axios.get(apiUrls.emploiDuTemps.getTypesActiviteByEcole());
            setTypesActivite(response.data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypesActivite();
    }, [dynamicEcoleId]);

    return { typesActivite, loading, error, refetch: fetchTypesActivite };
};

/**
 * Hook pour récupérer les matières par classe (FONCTION EXISTANTE)
 */
export const useMatieresByClasse = (classeId) => {
    const [matieres, setMatieres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchMatieres = async () => {
        if (!classeId) {
            setMatieres([]);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(
                apiUrls.emploiDuTemps.getMatieresByClasse(classeId)
            );
            setMatieres(response.data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatieres();
    }, [classeId]);

    return { matieres, loading, error, refetch: fetchMatieres };
};

// ============================
// NOUVELLES FONCTIONS AJOUTÉES
// ============================

/**
 * Hook pour récupérer la liste des classes avec format d'affichage (NOUVELLE FONCTION)
 */
export const useClassesListData = (refreshTrigger = 0) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { ecoleId: dynamicEcoleId } = usePulsParams();
    const apiUrls = useAllApiUrls();


    const fetchClasses = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `classes-list-${dynamicEcoleId}`;

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setClasses(cachedData);
                    setLoading(false);
                    return;
                }
            }
            const response = await axios.get(apiUrls.classes.listByEcoleSorted());

            const processedClasses = response.data && Array.isArray(response.data)
                ? response.data.map(classe => ({
                    id: classe.id,
                    libelle: classe.libelle,
                    code: classe.code,
                    effectif: classe.effectif,
                    visible: classe.visible,
                    branche: classe.branche,
                    ecole: classe.ecole,
                    dateCreation: classe.dateCreation,
                    dateUpdate: classe.dateUpdate,
                    niveau: classe.branche?.niveau?.libelle || 'Non défini',
                    programme: classe.branche?.programme?.libelle || 'Non défini',
                    niveauEnseignement: classe.branche?.niveauEnseignement?.libelle || 'Non défini',
                    ordre: classe.branche?.niveau?.ordre || 999
                }))
                : [];

            processedClasses.sort((a, b) => a.ordre - b.ordre);

            setToCache(cacheKey, processedClasses);
            setClasses(processedClasses);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des classes',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses(false);
    }, [dynamicEcoleId, refreshTrigger]);

    const forceRefresh = () => {
        fetchClasses(true);
    };

    return { classes, loading, error, refetch: forceRefresh };
};

/**
 * Hook pour récupérer la liste des jours avec cache (NOUVELLE FONCTION)
 */
export const useJoursListData = () => {
    const [jours, setJours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();


    const fetchJours = async () => {
        try {
            setLoading(true);
            const cacheKey = 'jours-list';

            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setJours(cachedData);
                setLoading(false);
                return;
            }

            const response = await axios.get(apiUrls.emploiDuTemps.listJours());

            const joursFiltered = response.data
                ? response.data.filter(jour => jour.id <= 6)
                : [];

            setToCache(cacheKey, joursFiltered, 3600000);
            setJours(joursFiltered);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJours();
    }, []);

    return { jours, loading, error, refetch: fetchJours };
};

/**
 * Hook pour récupérer les activités par classe et jour (NOUVELLE FONCTION)
 */
export const useActivitesByClasseJour = (classeId, jourId, refreshTrigger = 0) => {
    const [activites, setActivites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { ecoleId: dynamicEcoleId } = usePulsParams();

    const fetchActivites = async (skipCache = false) => {
        if (!classeId || !jourId) {
            setActivites([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const cacheKey = `activites-${classeId}-${jourId}`;

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setActivites(cachedData);
                    setLoading(false);
                    return;
                }
            }

            const response = await axios.get(
                `${getFullUrl()}/api/activite/list-by-classe-jour?annee=${dynamicEcoleId}&classe=${classeId}&jour=${jourId}`
            );

            const processedActivites = response.data && Array.isArray(response.data)
                ? response.data.map(activite => ({
                    id: activite.id,
                    heureDeb: activite.heureDeb,
                    heureFin: activite.heureFin,
                    matiere: activite.matiere,
                    matiereLibelle: activite.matiere?.libelle || 'Non définie', // Pour la recherche
                    salle: activite.salle,
                    salleLibelle: activite.salle?.libelle || 'Non définie', // Pour la recherche
                    typeActivite: activite.typeActivite,
                    typeActiviteLibelle: activite.typeActivite?.libelle || 'Non défini', // Pour la recherche
                    statut: activite.statut,
                    creneauHoraire: `${activite.heureDeb} - ${activite.heureFin}`,
                    raw_data: activite
                }))
                : [];


            processedActivites.sort((a, b) => a.heureDeb.localeCompare(b.heureDeb));

            setToCache(cacheKey, processedActivites, 300000);
            setActivites(processedActivites);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des activités',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivites(false);
    }, [classeId, jourId, dynamicEcoleId, refreshTrigger]);

    const forceRefresh = () => {
        fetchActivites(true);
    };

    return { activites, loading, error, refetch: forceRefresh };
};

/**
 * Vérifier la disponibilité d'un créneau horaire (FONCTION EXISTANTE)
 */
export const checkCreneauDisponibilite = async (academicYearId, classe, jour, heureDeb, heureFin, apiUrls) => {
    console.log('=== PARAMÈTRES DE VÉRIFICATION ===');
    console.log('academicYearId:', academicYearId);
    console.log('classe:', classe);
    console.log('jour:', jour);
    console.log('heureDeb:', heureDeb);
    console.log('heureFin:', heureFin);
    console.log('================================');

    try {
        const url = apiUrls.emploiDuTemps.isPlageHoraireValid(academicYearId, classe, jour, heureDeb, heureFin);
        console.log('URL de la requête:', url);

        const response = await axios.get(url);
        console.log('Réponse de l\'API:', response.data);

        return response.data;
    } catch (error) {
        console.error('Erreur lors de la vérification du créneau:', error);

        if (error.response) {
            console.error('Statut de l\'erreur:', error.response.status);
            console.error('Données de l\'erreur:', error.response.data);
        }

        return false;
    }
};

/**
 * Récupérer les salles disponibles (FONCTION EXISTANTE)
 */
export const getSallesDisponibles = async (annee, classe, jour, heureDeb, heureFin, date = '', apiUrls) => {
    try {
        const url = apiUrls.emploiDuTemps.getSallesDisponibles(annee, classe, jour, date, heureDeb, heureFin);
        console.log('URL récupération salles:', url);

        const response = await axios.get(url);
        console.log('Salles disponibles reçues:', response.data);

        return response.data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des salles:', error);
        return [];
    }
};

/**
 * Récupérer les activités par classe et jour (FONCTION EXISTANTE)
 */
export const getActivitesByClasseJour = async (annee, classe, jour, apiUrls) => {
    try {
        const url = apiUrls.emploiDuTemps.getActivitesByClasseJour(annee, classe, jour);
        console.log('URL récupération activités:', url);

        const response = await axios.get(url);
        console.log('Activités reçues:', response.data);

        return response.data || [];
    } catch (error) {
        console.error('Erreur lors de la récupération des activités:', error);
        return [];
    }
};

/**
 * Sauvegarder une activité (FONCTION EXISTANTE)
 */
export const saveActivite = async (activiteData, apiUrls) => {
    try {
        console.log('=== DONNÉES À SAUVEGARDER ===');
        console.log(JSON.stringify(activiteData, null, 2));
        console.log('=============================');

        const response = await axios.post(
            apiUrls.emploiDuTemps.saveActivite(),
            activiteData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log('Réponse de sauvegarde:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);

        if (error.response) {
            console.error('Statut d\'erreur sauvegarde:', error.response.status);
            console.error('Données d\'erreur sauvegarde:', error.response.data);
        }

        throw error;
    }
};

/**
 * Supprimer une activité (FONCTION EXISTANTE)
 */
export const deleteActivite = async (activiteId, apiUrls) => {
    try {
        console.log('Suppression de l\'activité ID:', activiteId);

        const response = await axios.delete(
            apiUrls.emploiDuTemps.deleteActivite(activiteId),
            {
                timeout: 10000
            }
        );

        console.log('Réponse de suppression:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
    }
};

/**
 * Vide le cache de l'emploi du temps (FONCTION EXISTANTE)
 */
export const clearEmploiDuTempsCache = () => {
    clearCache();
};

/**
 * Vider le cache d'une classe spécifique (NOUVELLE FONCTION)
 */
export const clearClasseCache = (classeId) => {
    const keysToRemove = [
        `activites-${classeId}-1`,
        `activites-${classeId}-2`,
        `activites-${classeId}-3`,
        `activites-${classeId}-4`,
        `activites-${classeId}-5`,
        `activites-${classeId}-6`
    ];

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });
};

// Configuration corrigée du tableau pour les activités
export const activitesTableConfig = {
    columns: [
      {
        title: 'Heure début',           // Changé de 'label' à 'title'
        dataKey: 'heureDeb',           // Changé de 'key' à 'dataKey'
        width: 120,
        sortable: true,
        cellRenderer: (value, rowData) => (  // Changé de 'render' à 'cellRenderer'
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiClock size={14} style={{ color: '#f59e0b' }} />
            <span style={{ fontWeight: '500', color: '#374151' }}>{value}</span>
          </div>
        )
      },
      {
        title: 'Heure fin',            // Changé de 'label' à 'title'
        dataKey: 'heureFin',          // Changé de 'key' à 'dataKey'
        width: 120,
        sortable: true,
        cellRenderer: (value, rowData) => (  // Changé de 'render' à 'cellRenderer'
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiClock size={14} style={{ color: '#f59e0b' }} />
            <span style={{ fontWeight: '500', color: '#374151' }}>{value}</span>
          </div>
        )
      },
      {
        title: 'Matière',             // Changé de 'label' à 'title'
        dataKey: 'matiere',          // Changé de 'key' à 'dataKey'
        flexGrow: 1,
        sortable: true,
        cellRenderer: (value, rowData) => {  // Changé de 'render' à 'cellRenderer'
          const matiereLabel = value?.libelle || rowData?.matiere?.libelle || value || 'Non définie';
          return (
            <span style={{ 
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {matiereLabel}
            </span>
          );
        }
      },
      {
        title: 'Salle',               // Changé de 'label' à 'title'
        dataKey: 'salle',            // Changé de 'key' à 'dataKey'
        width: 120,
        cellRenderer: (value, rowData) => {  // Changé de 'render' à 'cellRenderer'
          const salleLabel = value?.libelle || rowData?.salle?.libelle || value || 'Non définie';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#6b7280' }}>
                {salleLabel}
              </span>
            </div>
          );
        }
      },
      {
        title: 'Type',                // Changé de 'label' à 'title'
        dataKey: 'typeActivite',     // Changé de 'key' à 'dataKey'
        width: 100,
        cellRenderer: (value, rowData) => {  // Changé de 'render' à 'cellRenderer'
          const typeLabel = value?.libelle || rowData?.typeActivite?.libelle || value || 'Non défini';
          return (
            <span style={{ 
              backgroundColor: '#e0f2fe',
              color: '#0277bd',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {typeLabel}
            </span>
          );
        }
      },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 160,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['matiere', 'salle', 'heureDeb', 'heureFin', 'typeActivite'],
    actions: [
        {
            type: 'view',
            icon: <FiEye size={17}/>,
            tooltip: 'Voir les détails',
            color: '#6366f1'
        },
        {
            type: 'edit',
            icon: <FiEdit  size={17}/>,
            tooltip: 'Modifier l\'activité',
            color: '#f59e0b'
        },
        {
            type: 'delete',
            icon: <FiTrash2 size={17}/>,
            tooltip: 'Supprimer l\'activité',
            color: '#ef4444'
        }
    ]
  };

// Configuration du tableau pour l'emploi du temps (CONFIGURATION EXISTANTE)
export const emploiDuTempsTableConfig = {
    columns: [
        {
            title: 'Classe',
            dataKey: 'classe',
            flexGrow: 2,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value, rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBook size={16} style={{ color: '#6366f1' }} />
                    <span style={{ fontWeight: '600' }}>{value}</span>
                </div>
            )
        },
        {
            title: 'Jour',
            dataKey: 'jour',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellRenderer: (value, rowData) => {
                const jourConfig = {
                    'Lundi': { color: 'blue', variant: 'solid' },
                    'Mardi': { color: 'red', variant: 'solid' },
                    'Mercredi': { color: 'orange', variant: 'solid' },
                    'Jeudi': { color: 'green', variant: 'solid' },
                    'Vendredi': { color: 'violet', variant: 'solid' },
                    'Samedi': { color: 'cyan', variant: 'solid' },
                    'Dimanche': { color: 'yellow', variant: 'solid' }
                };

                const config = jourConfig[value] || { color: 'blue', variant: 'solid' };

                return (
                    <Tag
                        color={config.color}
                        size="md"
                    >
                        {value}
                    </Tag>
                );
            }
        },
        {
            title: 'Horaires',
            dataKey: 'creneauHoraire',
            flexGrow: 1,
            minWidth: 140,
            sortable: true,
            cellRenderer: (value) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiClock size={14} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{value}</span>
                </div>
            )
        },
        {
            title: 'Matière',
            dataKey: 'matiere',
            flexGrow: 2,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value) => (
                <Tag
                    color="blue"
                    size="md"
                    style={{
                        backgroundColor: '#f0f9ff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe'
                    }}
                >
                    {value}
                </Tag>
            )
        },
        {
            title: 'Salle',
            dataKey: 'salle',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellRenderer: (value) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiMapPin size={14} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '13px' }}>{value}</span>
                </div>
            )
        },
        {
            title: 'Type',
            dataKey: 'typeActivite',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellRenderer: (value) => {
                const typeConfig = {
                    'Cours': { color: 'green' },
                    'Devoir': { color: 'red' },
                    'Évaluation': { color: 'orange' }
                };

                const config = typeConfig[value] || { color: 'blue' };

                return (
                    <Tag
                        color={config.color}
                        size="md"
                    >
                        {value}
                    </Tag>
                );
            }
        },
        {
            title: 'Statut',
            dataKey: 'statut',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cellRenderer: (value) => {
                const isActive = value === 'ACT';

                return (
                    <Badge
                        content={isActive ? 'Actif' : 'Inactif'}
                        color={isActive ? 'green' : 'orange'}
                    />
                );
            }
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 160,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['classe', 'jour', 'matiere', 'salle', 'typeActivite'],
    filterConfigs: [
        {
            key: 'jour',
            label: 'Jour',
            type: 'select',
            options: [
                { label: 'Lundi', value: 'Lundi' },
                { label: 'Mardi', value: 'Mardi' },
                { label: 'Mercredi', value: 'Mercredi' },
                { label: 'Jeudi', value: 'Jeudi' },
                { label: 'Vendredi', value: 'Vendredi' },
                { label: 'Samedi', value: 'Samedi' },
                { label: 'Dimanche', value: 'Dimanche' }
            ],
            placeholder: 'Filtrer par jour'
        },
        {
            key: 'typeActivite',
            label: 'Type d\'activité',
            type: 'select',
            options: [
                { label: 'Cours', value: 'Cours' },
                { label: 'Devoir', value: 'Devoir' },
                { label: 'Évaluation', value: 'Évaluation' }
            ],
            placeholder: 'Filtrer par type'
        }
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails',
            color: '#6366f1'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier l\'activité',
            color: '#f59e0b'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer l\'activité',
            color: '#ef4444'
        }
    ]
};