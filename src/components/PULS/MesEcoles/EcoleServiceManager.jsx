/**
 * Service pour la gestion des données d'écoles
 * VERSION OPTIMISÉE avec axios et cache
 */
import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiUser, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { useAppParams } from '../utils/apiConfig';
import getFullUrl from "../../hooks/urlUtils";

/**
 * Hook pour récupérer la liste des écoles
 * @param {number} refreshTrigger
 * @param {number} fondateurId - ID du fondateur pour filtrer les écoles
 * @returns {object}
 */
export const useEcolesData = (refreshTrigger = 0, fondateurId = 419) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);

    const fetchData = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const startTime = Date.now();
            
            const cacheKey = `ecoles-data-${fondateurId}`;
            
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

            const url = `${getFullUrl()}souscription-ecole/souscri-etabliss-a-modifier-fondateur/${fondateurId}`;
            const response = await axios.get(url);
            
            const processedEcoles = response.data && Array.isArray(response.data)
                ? response.data.map(ecole => ({
                    id: ecole.sousc_atten_etablissid,
                    nom: ecole.sousc_atten_etabliss_nom,
                    code: ecole.sousc_atten_etablisscode,
                    email: ecole.sousc_atten_etabliss_email || '',
                    telephone: ecole.sousc_atten_etabliss_tel || '',
                    indication: ecole.sousc_atten_etabliss_indication,
                    status: ecole.sousc_atten_etabliss_status,
                    lienLogo: ecole.sousc_atten_etabliss_lien_logo,
                    lienAutorisation: ecole.sousc_atten_etabliss_lien_autorisa,
                    
                    // Informations géographiques
                    pays: ecole.pays,
                    ville: ecole.ville_ville,
                    commune: ecole.commune_commune,
                    zone: ecole.zone_zone,
                    directionRegionale: ecole.myDirection_regionale,
                    
                    // Niveau d'enseignement
                    niveauEnseignement: ecole.niveau_Enseignement_obj,
                    
                    // Données brutes pour référence
                    raw_data: ecole
                }))
                : [];

            setToCache(cacheKey, processedEcoles);
            setData(processedEcoles);
            
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedEcoles.length,
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
    }, [refreshTrigger, fondateurId]);

    // Fonction pour forcer le refresh sans cache
    const forceRefresh = () => {
        fetchData(true);
    };

    return {
        ecoles: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Vide le cache des écoles
 */
export const clearEcolesCache = () => {
    clearCache();
};

/**
 * Fonction pour obtenir la couleur du badge de statut
 * @param {string} status 
 * @returns {string}
 */
const getStatusBadgeColor = (status) => {
    switch (status) {
        case 'ACTIVE':
        case 'APPROUVE':
            return 'green';
        case 'EN_ATTENTE':
            return 'orange';
        case 'REJETE':
        case 'SUSPENDU':
            return 'red';
        case 'BROUILLON':
            return 'gray';
        default:
            return 'blue';
    }
};

/**
 * Fonction pour obtenir le libellé du statut en français
 * @param {string} status 
 * @returns {string}
 */
const getStatusLabel = (status) => {
    switch (status) {
        case 'ACTIVE':
            return 'Actif';
        case 'EN_ATTENTE':
            return 'En attente';
        case 'APPROUVE':
            return 'Approuvé';
        case 'REJETE':
            return 'Rejeté';
        case 'SUSPENDU':
            return 'Suspendu';
        case 'BROUILLON':
            return 'Brouillon';
        default:
            return status || 'Inconnu';
    }
};

// Configuration du tableau pour les écoles
export const ecolesTableConfig = {
    columns: [
        {
            title: 'ID',
            dataKey: 'id',
            flexGrow: 0.5,
            minWidth: 80,
            sortable: true
        },
        {
            title: 'Nom de l\'École',
            dataKey: 'nom',
            flexGrow: 2,
            minWidth: 200,
            sortable: true,
            // cellRenderer: (value, rowData) => {
            //     return (
            //         <div>
            //             <div><strong>{value}</strong></div>
            //             <div style={{ fontSize: '0.8em', color: '#666' }}>
            //                 Code: {rowData.code}
            //             </div>
            //         </div>
            //     );
            // }
        },
        {
            title: 'Téléphone',
            dataKey: 'telephone',
            flexGrow: 2,
            minWidth: 200,
            // cellRenderer: (value, rowData) => {
            //     return (
            //         <div>
            //             <div style={{ display: 'flex', alignItems: 'center' }}>
            //                 <FiPhone size={12} style={{ marginRight: '6px', color: '#666' }} />
            //                 <span style={{ fontSize: '0.85em' }}>{rowData.telephone || 'N/A'}</span>
            //             </div>
            //         </div>
            //     );
            // }
        },
        {
            title: 'Email',
            dataKey: 'email',
            flexGrow: 2,
            minWidth: 200,
            cellRenderer: (value, rowData) => {
                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <FiMail size={12} style={{ marginRight: '6px', color: '#666' }} />
                            <span style={{ fontSize: '0.85em' }}>{value || 'N/A'}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Localisation',
            dataKey: 'ville',
            flexGrow: 2,
            minWidth: 180,
            sortable: true,
            cellRenderer: (value, rowData) => {
                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                            <FiMapPin size={12} style={{ marginRight: '6px', color: '#666' }} />
                            <span style={{ fontSize: '0.85em', fontWeight: '500' }}>
                                {value?.villelibelle || 'N/A'}
                            </span>
                        </div>
                        {/* <div style={{ fontSize: '0.8em', color: '#666', marginLeft: '18px' }}>
                            {rowData.commune?.communelibelle || ''}
                        </div>
                        {rowData.zone?.zonelibelle && (
                            <div style={{ fontSize: '0.75em', color: '#999', marginLeft: '18px' }}>
                                {rowData.zone.zonelibelle}
                            </div>
                        )} */}
                    </div>
                );
            }
        },
        {
            title: 'Niveau d\'Enseignement',
            dataKey: 'niveauEnseignement',
            flexGrow: 1.5,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value) => {
                if (value && value.libelle) {
                    return (
                        <Badge color="blue" style={{ fontSize: '0.8em' }}>
                            {value.libelle}
                        </Badge>
                    );
                }
                return 'N/A';
            }
        },
        {
            title: 'Direction Régionale',
            dataKey: 'directionRegionale',
            flexGrow: 1.5,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value) => {
                if (value && value.libelle) {
                    return (
                        <div style={{ fontSize: '0.85em' }}>
                            {value.libelle}
                        </div>
                    );
                }
                return 'N/A';
            }
        },
        {
            title: 'Statut',
            dataKey: 'status',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellRenderer: (value) => {
                return (
                    <Badge color={getStatusBadgeColor(value)}>
                        {getStatusLabel(value)}
                    </Badge>
                );
            }
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 0.8,
            minWidth: 120,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    
    searchableFields: [
        'nom', 
        'code', 
        'email', 
        'telephone',
        'ville.villelibelle',
        'commune.communelibelle',
        'zone.zonelibelle',
        'niveauEnseignement.libelle',
        'directionRegionale.libelle'
    ],
    
    filterConfigs: [
        {
            key: 'status',
            label: 'Statut',
            type: 'select',
            options: [
                { label: 'Actif', value: 'ACTIVE' },
                { label: 'En attente', value: 'EN_ATTENTE' },
                { label: 'Approuvé', value: 'APPROUVE' },
                { label: 'Rejeté', value: 'REJETE' },
                { label: 'Suspendu', value: 'SUSPENDU' },
                { label: 'Brouillon', value: 'BROUILLON' }
            ],
            placeholder: 'Filtrer par statut'
        },
        {
            key: 'niveauEnseignement',
            label: 'Niveau d\'Enseignement',
            type: 'select',
            options: [], // Sera rempli dynamiquement
            placeholder: 'Filtrer par niveau'
        },
        {
            key: 'ville',
            label: 'Ville',
            type: 'select',
            options: [], // Sera rempli dynamiquement
            placeholder: 'Filtrer par ville'
        },
        {
            key: 'directionRegionale',
            label: 'Direction Régionale',
            type: 'select',
            options: [], // Sera rempli dynamiquement
            placeholder: 'Filtrer par DREN'
        }
    ],
    
    actions: [
        {
            type: 'view',
            icon: <FiEye size={16} />,
            tooltip: 'Voir les détails de l\'école',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit size={16} />,
            tooltip: 'Modifier l\'école',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 size={16} />,
            tooltip: 'Supprimer l\'école',
            color: '#e74c3c'
        }
    ]
};