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
import getFullUrl from "../../hooks/urlUtils";

/**
 * Hook pour récupérer les données d'un profil utilisateur spécifique
 * @param {number|string} userId - ID de l'utilisateur
 * @param {number} refreshTrigger - Déclencheur de rafraîchissement
 * @param {object} options - Options de configuration
 * @returns {object}
 */
export const useUserProfile = (userId, refreshTrigger = 0, options = {}) => {
    const {
        useCache = true,
        cacheTimeout = 300000, // 5 minutes par défaut
        onSuccess = null,
        onError = null
    } = options;

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);

    const fetchUserData = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const startTime = Date.now();
            const cacheKey = `user-profile-${userId}`;

            // Vérifier le cache si activé
            if (useCache && !skipCache) {
                const cachedData = getFromCache(cacheKey, cacheTimeout);
                if (cachedData) {
                    setUserData(cachedData);
                    setLoading(false);
                    setPerformance({
                        duration: Date.now() - startTime,
                        source: 'cache',
                        userId
                    });
                    if (onSuccess) onSuccess(cachedData);
                    return;
                }
            }

            // Appel API
            const response = await axios.get(
                `${getFullUrl()}souscription-personnel/personnelById/${userId}`,
                {
                    timeout: 10000 // Timeout de 10 secondes
                }
            );

            if (response.data) {
                const processedData = {
                    ...response.data,
                    // Ajout de métadonnées utiles
                    _metadata: {
                        fetchedAt: new Date().toISOString(),
                        source: 'api'
                    }
                };

                // Mise en cache
                if (useCache) {
                    setToCache(cacheKey, processedData);
                }

                setUserData(processedData);
                setPerformance({
                    duration: Date.now() - startTime,
                    source: 'api',
                    userId,
                    dataSize: JSON.stringify(response.data).length
                });

                if (onSuccess) onSuccess(processedData);
            } else {
                throw new Error('Aucune donnée reçue de l\'API');
            }

        } catch (err) {
            console.error('Erreur lors du chargement du profil:', err);

            let errorMessage = 'Impossible de charger les informations du profil';
            let errorCode = 'UNKNOWN';

            if (err.code === 'ECONNABORTED') {
                errorMessage = 'La requête a expiré. Veuillez réessayer.';
                errorCode = 'TIMEOUT';
            } else if (err.response) {
                // Erreur de réponse du serveur
                errorCode = err.response.status.toString();
                switch (err.response.status) {
                    case 404:
                        errorMessage = 'Profil utilisateur introuvable.';
                        break;
                    case 401:
                        errorMessage = 'Accès non autorisé. Veuillez vous reconnecter.';
                        break;
                    case 403:
                        errorMessage = 'Accès interdit à ces informations.';
                        break;
                    case 500:
                        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                        break;
                    default:
                        errorMessage = `Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur inconnue'}`;
                }
            } else if (err.request) {
                // Erreur de réseau
                errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
                errorCode = 'NETWORK_ERROR';
            }

            const errorObj = {
                message: errorMessage,
                code: errorCode,
                type: err.name || 'FetchError',
                originalError: err
            };

            setError(errorObj);
            if (onError) onError(errorObj);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserData(false);
        }
    }, [userId, refreshTrigger]);

    // Fonction pour forcer le refresh sans cache
    const forceRefresh = () => {
        fetchUserData(true);
    };

    // Fonction pour vider le cache de cet utilisateur spécifique
    const clearUserCache = () => {
        const cacheKey = `user-profile-${userId}`;
        clearCache(cacheKey);
    };

    return {
        userData,
        loading,
        error,
        refetch: forceRefresh,
        clearCache: clearUserCache,
        performance
    };
};

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

/**
 * Utilitaires pour le formatage des données utilisateur
 */
export const userProfileUtils = {
    /**
     * Formate une date au format français
     */
    formatDate: (dateString) => {
        if (!dateString) return 'Date non disponible';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    /**
     * Retourne la configuration du statut
     */
    getStatusConfig: (status) => {
        const configs = {
            'VALIDEE': {
                color: 'green',
                label: 'Profil validé',
                bgColor: '#f0fdf4',
                textColor: '#15803d'
            },
            'EN_ATTENTE': {
                color: 'orange',
                label: 'En attente de validation',
                bgColor: '#fffbeb',
                textColor: '#a16207'
            },
            'REFUSEE': {
                color: 'red',
                label: 'Profil refusé',
                bgColor: '#fef2f2',
                textColor: '#b91c1c'
            }
        };

        return configs[status] || {
            color: 'blue',
            label: status,
            bgColor: '#f0f9ff',
            textColor: '#0369a1'
        };
    },

    /**
     * Retourne les initiales d'un utilisateur
     */
    getUserInitials: (prenom, nom) => {
        const prenomInitial = prenom?.[0]?.toUpperCase() || '';
        const nomInitial = nom?.[0]?.toUpperCase() || '';
        return `${prenomInitial}${nomInitial}`;
    }
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