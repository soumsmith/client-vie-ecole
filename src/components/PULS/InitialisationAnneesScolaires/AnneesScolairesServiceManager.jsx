/**
 * Service pour la gestion des données des années scolaires
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiCalendar, FiBook, FiClock } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAllApiUrls } from '../utils/apiConfig';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';

/**
 * Hook pour récupérer la liste des années scolaires
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useAnneesScolairesData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchData = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const startTime = Date.now();
            const cacheKey = 'annees-scolaires-data';
            
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

            const response = await axios.get(apiUrls.annees.listToCentral());
            
            const processedAnnees = response.data && Array.isArray(response.data)
                ? response.data.map(annee => ({
                    id: annee.id,
                    anneeDebut: annee.anneeDebut,
                    anneeFin: annee.anneeFin,
                    libelle: annee.libelle,
                    customLibelle: annee.customLibelle,
                    statut: annee.statut,
                    nbreEval: annee.nbreEval,
                    delaiNotes: annee.delaiNotes,
                    // Extraire les valeurs des objets imbriqués
                    niveauEnseignement: annee.niveauEnseignement?.libelle || 'Non défini',
                    niveauEnseignementId: annee.niveauEnseignement?.id,
                    periodicite: annee.periodicite?.libelle || 'Non définie',
                    periodiciteId: annee.periodicite?.id,
                    anneePeriodes: annee.anneePeriodes,
                    dateCreation: annee.dateCreation,
                    dateUpdate: annee.dateUpdate,
                    raw_data: annee
                }))
                : [];

            setToCache(cacheKey, processedAnnees);
            setData(processedAnnees);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedAnnees.length,
                dataSize: JSON.stringify(response.data).length
            });
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des années scolaires',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
            console.error('Erreur API années scolaires:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(false);
    }, [refreshTrigger]);

    const forceRefresh = () => {
        fetchData(true);
    };

    return {
        anneesScolaires: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Hook pour récupérer la liste des périodicités
 * @returns {object}
 */
export const usePeriodicitesData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    useEffect(() => {
        const fetchPeriodicitees = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get(apiUrls.periodes.listPeriodicites());
                
                const processedPeriodicitees = response.data && Array.isArray(response.data)
                    ? response.data.map(periodicite => ({
                        value: periodicite.id,
                        label: periodicite.libelle,
                        code: periodicite.code,
                        ordre: periodicite.ordre
                    }))
                    : [];

                setData(processedPeriodicitees);
            } catch (err) {
                setError({
                    message: err.message || 'Erreur lors du chargement des périodicités',
                    type: err.name || 'FetchError'
                });
                console.error('Erreur API périodicités:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPeriodicitees();
    }, []);

    return {
        periodicitees: data,
        loading,
        error
    };
};

/**
 * Hook pour récupérer la liste des niveaux d'enseignement
 * @returns {object}
 */


/**
 * Hook pour récupérer les périodes selon la périodicité
 * @param {number} periodiciteeId
 * @returns {object}
 */
export const usePeriodesData = (periodiciteeId) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    useEffect(() => {
        if (!periodiciteeId) {
            setData([]);
            return;
        }

        const fetchPeriodes = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get(apiUrls.periodes.listByPeriodiciteId(periodiciteeId));
                
                const processedPeriodes = response.data && Array.isArray(response.data)
                    ? response.data.map(periode => ({
                        id: periode.id,
                        libelle: periode.libelle,
                        niveau: periode.niveau,
                        coef: periode.coef,
                        periodicite: periode.periodicite
                    }))
                    : [];

                setData(processedPeriodes);
            } catch (err) {
                setError({
                    message: err.message || 'Erreur lors du chargement des périodes',
                    type: err.name || 'FetchError'
                });
                console.error('Erreur API périodes:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPeriodes();
    }, [periodiciteeId]);

    return {
        periodes: data,
        loading,
        error
    };
};

/**
 * Vide le cache des années scolaires
 */
export const clearAnneesScolairesCache = () => {
    clearCache();
};

/**
 * Badge pour le statut
 */
const getStatutBadge = (statut) => {
    const colors = {
        'DIFFUSE': '#28a745',
        'BROUILLON': '#ffc107',
        'ARCHIVE': '#6c757d',
        'ACTIVE': '#28a745',
        'INACTIVE': '#dc3545'
    };
    
    const color = colors[statut] || '#6c757d';
    return <Badge style={{ backgroundColor: color, color: 'white' }}>{statut}</Badge>;
};

/**
 * Badge pour la périodicité
 */
const getPeriodiciteBadge = (periodicite) => {
    const colors = {
        'Mensuelle': '#007bff',
        'Trimestrielle': '#28a745', 
        'Semestrielle': '#ffc107',
        'Annuelle': '#fd7e14'
    };
    
    const color = colors[periodicite] || '#6c757d';
    return <Badge style={{ backgroundColor: color, color: 'white' }}>{periodicite}</Badge>;
};

// Configuration du tableau des années scolaires
export const anneesScolairesTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'id',
            flexGrow: 0.5,
            minWidth: 60,
            sortable: true,
            cell: (rowData, rowIndex) => rowIndex + 1
        },
        {
            title: 'Niveau Enseignement',
            dataKey: 'niveauEnseignement',
            flexGrow: 2,
            minWidth: 200,
            sortable: true
        },
        {
            title: 'Année scolaire',
            dataKey: 'libelle',
            flexGrow: 2,
            minWidth: 180,
            sortable: true
        },
        {
            title: 'Périodicité',
            dataKey: 'periodicite',
            flexGrow: 1.5,
            minWidth: 140,
            cell: (rowData) => getPeriodiciteBadge(rowData.periodicite)
        },
        {
            title: 'Statut',
            dataKey: 'statut',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cell: (rowData) => getStatutBadge(rowData.statut)
        },
        // {
        //     title: 'Actions',
        //     dataKey: 'actions',
        //     flexGrow: 1,
        //     minWidth: 120,
        //     cellType: 'actions',
        //     fixed: 'right'
        // }
    ],
    searchableFields: ['libelle', 'customLibelle', 'niveauEnseignement', 'periodicite'],
    filterConfigs: [
        {
            field: 'statut',
            label: 'Statut',
            type: 'select'
        },
        {
            field: 'periodicite',
            label: 'Périodicité',
            type: 'select'
        },
        {
            field: 'niveauEnseignement',
            label: 'Niveau d\'enseignement',
            type: 'select'
        }
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails de l\'année scolaire',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier l\'année scolaire',
            color: '#f39c12'
        }
    ]
};