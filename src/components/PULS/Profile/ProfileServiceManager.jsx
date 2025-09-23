/**
 * Service pour la gestion des données de personnel
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useAllApiUrls } from '../utils/apiConfig';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';

/**
 * Hook pour récupérer la liste des profils de personnel
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useProfilsData = (refreshTrigger = 0) => {
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
            const cacheKey = 'personnel-data';
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
            const response = await axios.get(apiUrls.profils.getProfilVisible());
            const processedProfils = response.data && Array.isArray(response.data)
                ? response.data.map(profil => ({
                    id: profil.profilid,
                    libelle: profil.profil_libelle,
                    code: profil.profilcode,
                    raw_data: profil
                }))
                : [];
            setToCache(cacheKey, processedProfils);
            setData(processedProfils);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedProfils.length,
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
        personnel: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Vide le cache des profils de personnel
 */
export const clearPersonnelCache = () => {
    clearCache();
};

// Configuration du tableau (identique à votre code)
export const profilsTableConfig = {
    columns: [
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
            title: 'ID',
            dataKey: 'id',
            flexGrow: 1,
            minWidth: 80,
            sortable: true
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
    searchableFields: ['libelle', 'code'],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir le profil',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier le profil',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer le profil',
            color: '#e74c3c'
        }
    ]
};