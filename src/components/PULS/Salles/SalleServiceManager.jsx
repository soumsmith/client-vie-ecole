/**
 * Service pour la gestion des données de salles
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';

import { useAllApiUrls } from '../utils/apiConfig';

/**
 * Hook pour récupérer la liste des salles
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useSallesData = (refreshTrigger = 0) => {
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
            const cacheKey = 'salles-data';
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
            const response = await axios.get(apiUrls.salles.listByEcole());
            const processedSalles = response.data && Array.isArray(response.data)
                ? response.data.map(salle => ({
                    id: salle.id,
                    libelle: salle.libelle,
                    code: salle.code,
                    ecole: salle.ecole,
                    raw_data: salle
                }))
                : [];
            setToCache(cacheKey, processedSalles);
            setData(processedSalles);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedSalles.length,
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
    }, [refreshTrigger]);

    // Fonction pour forcer le refresh sans cache
    const forceRefresh = () => {
        fetchData(true);
    };

    return {
        salles: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Vide le cache des salles
 */
export const clearSallesCache = () => {
    clearCache();
};

// Configuration du tableau pour les salles
export const sallesTableConfig = {
    columns: [
        {
            title: 'ID',
            dataKey: 'id',
            flexGrow: 1,
            minWidth: 80,
            sortable: true
        },
        {
            title: 'Libellé',
            dataKey: 'libelle',
            flexGrow: 2,
            minWidth: 200,
            sortable: true
        },
        {
            title: 'Code',
            dataKey: 'code',
            flexGrow: 1,
            minWidth: 100,
            sortable: true
        },
        {
            title: 'École',
            dataKey: 'ecole',
            flexGrow: 2,
            minWidth: 250,
            sortable: true,
            cellRenderer: (value) => {
                if (value && typeof value === 'object' && value.libelle) {
                    return (
                        <div>
                            <div><strong>{value.libelle}</strong></div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>
                                {value.niveauEnseignement?.libelle || ''}
                            </div>
                        </div>
                    );
                }
                return 'N/A';
            }
        },
        
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 0.5,
            minWidth: 80,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['libelle', 'code', 'ecole.libelle'],
    filterConfigs: [
        {
            key: 'ecole',
            label: 'École',
            type: 'select',
            options: [], // Sera rempli dynamiquement
            placeholder: 'Filtrer par école'
        }
    ],
    actions: [
        // {
        //     type: 'view',
        //     icon: <FiEye />,
        //     tooltip: 'Voir la salle',
        //     color: '#3498db'
        // },
        {
            type: 'edit',
            icon: <FiEdit size={17} />,
            tooltip: 'Modifier la salle',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 size={17} />,
            tooltip: 'Supprimer la salle',
            color: '#e74c3c'
        }
    ]
}; 