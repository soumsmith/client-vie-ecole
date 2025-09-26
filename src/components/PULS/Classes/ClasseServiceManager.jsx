/**
 * Service pour la gestion des données de classes
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { useClassesUrls, useBranchesUrls, useAppParams } from '../utils/apiConfig';


/**
 * Hook pour récupérer la liste des classes
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useClassesData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);

    const appParams = useAppParams();
    const classesUrls = useClassesUrls();

    const fetchData = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const startTime = Date.now();
            const cacheKey = 'classes-data';
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

            const url = classesUrls.getClasseByEcole();
            const response = await axios.get(url);

            const processedClasses = response.data && Array.isArray(response.data)
                ? response.data.map(classe => ({
                    id: classe.id,
                    libelle: classe.libelle,
                    code: classe.code,
                    effectif: classe.effectif,
                    visible: classe.visible,
                    branche: classe.branche,
                    ecole: classe.ecole,
                    langueVivante: classe.langueVivante,
                    dateCreation: classe.dateCreation,
                    dateUpdate: classe.dateUpdate,
                    raw_data: classe
                }))
                : [];
            setToCache(cacheKey, processedClasses);
            setData(processedClasses);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedClasses.length,
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
        classes: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Hook pour récupérer les branches par niveauEnseignement et école
 * @param {number} niveauEnseignementId
 * @param {number} ecoleId
 * @returns {object}
 */
export const useBranchesByNiveauEnseignement = (niveauEnseignementId) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const classesUrls = useBranchesUrls();

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {

      const url = classesUrls.getByNiveauEnseignement();
      const response = await axios.get(url);
      // Filtrer par niveauEnseignement côté client si besoin
      const filtered = niveauEnseignementId
        ? (response.data || []).filter(b => b.niveauEnseignement?.id === niveauEnseignementId)
        : (response.data || []);
      setBranches(filtered);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [niveauEnseignementId, ecoleId]);

  useEffect(() => {
    if (ecoleId) fetchBranches();
  }, [fetchBranches, ecoleId, niveauEnseignementId]);

  return { branches, loading, error, refetch: fetchBranches };
};

/**
 * Vide le cache des classes
 */
export const clearClassesCache = () => {
    clearCache();
};

// Configuration du tableau pour les classes
export const classesTableConfig = {
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
            title: 'Effectif',
            dataKey: 'effectif',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
        },
        {
            title: 'Branche',
            dataKey: 'branche',
            flexGrow: 2,
            minWidth: 200,
            sortable: true,
            cellRenderer: (value) => {
                if (value && typeof value === 'object' && value.libelle) {
                    return (
                        <div>
                            <div><strong>{value.libelle}</strong></div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>
                                {value.niveau?.libelle || ''}
                            </div>
                        </div>
                    );
                }
                return 'N/A';
            }
        },
        {
            title: 'Série',
            dataKey: 'branche',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellRenderer: (value) => {
                if (value && typeof value === 'object' && value.serie && value.serie.libelle) {
                    return (
                        <Badge color="blue">
                            {value.serie.libelle}
                        </Badge>
                    );
                }
                return 'N/A';
            }
        },
        {
            title: 'Langue Vivante',
            dataKey: 'langueVivante',
            flexGrow: 1,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value) => {
                if (value && typeof value === 'object' && value.libelle) {
                    return value.libelle;
                }
                return 'N/A';
            }
        },
        {
            title: 'Statut',
            dataKey: 'visible',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cellRenderer: (value) => {
                return (
                    <Badge color={value === 1 ? 'green' : 'red'}>
                        {value === 1 ? 'Visible' : 'Masquée'}
                    </Badge>
                );
            }
        },
        
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 0.8,
            minWidth: 50,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['libelle', 'code', 'branche.libelle', 'branche.serie.libelle', 'langueVivante.libelle'],
    filterConfigs: [
        {
            key: 'branche',
            label: 'Branche',
            type: 'select',
            options: [], // Sera rempli dynamiquement
            placeholder: 'Filtrer par branche'
        },
        {
            key: 'serie',
            label: 'Série',
            type: 'select',
            options: [], // Sera rempli dynamiquement
            placeholder: 'Filtrer par série'
        },
        {
            key: 'visible',
            label: 'Statut',
            type: 'select',
            options: [
                { label: 'Visible', value: 1 },
                { label: 'Masquée', value: 0 }
            ],
            placeholder: 'Filtrer par statut'
        }
    ],
    actions: [
        // {
        //     type: 'view',
        //     icon: <FiEye />,
        //     tooltip: 'Voir la classe',
        //     color: '#3498db'
        // },
        {
            type: 'edit',
            icon: <FiEdit size={17} />,
            tooltip: 'Modifier la classe',
            color: '#f39c12'
        },
        // {
        //     type: 'delete',
        //     icon: <FiTrash2 />,
        //     tooltip: 'Supprimer la classe',
        //     color: '#e74c3c'
        // }
    ]
}; 