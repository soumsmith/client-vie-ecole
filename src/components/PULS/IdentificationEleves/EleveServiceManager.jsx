/**
 * Service pour la gestion des données d'élèves
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import { useAllApiUrls } from '../utils/apiConfig';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';

/**
 * Hook pour récupérer l'année scolaire principale
 * @param {number} ecoleId
 * @returns {object}
 */
export const useAnneeData = (ecoleId = 38) => {
    const [annee, setAnnee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchAnnee = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `annee-data-${ecoleId}`;

            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setAnnee(cachedData);
                setLoading(false);
                return;
            }

            const response = await axios.get(apiUrls.annees.getMainByEcole());
            setToCache(cacheKey, response.data);
            setAnnee(response.data);
        } catch (err) {
            setError({
                message: err.message || 'Erreur inconnue',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, [ecoleId]);

    useEffect(() => {
        fetchAnnee();
    }, [fetchAnnee]);

    return { annee, loading, error, refetch: fetchAnnee };
};

/**
 * Hook pour récupérer la liste des élèves inscrits - VERSION CORRIGÉE
 * @param {number} ecoleId
 * @param {number} anneeId
 * @param {string} statut
 * @param {string} typeInscription
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useElevesData = (statut = 'EN_ATTENTE', typeInscription = 'INSCRIPTION', refreshTrigger = 0) => {
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
            const cacheKey = `eleves-data-ecoleId-anneeId-statut-typeInscription`;

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

            const response = await axios.get(apiUrls.inscriptions.getByStatut(statut, typeInscription));
            const processedEleves = response.data && Array.isArray(response.data)
                ? response.data.map(eleve => ({
                    // Mapping corrigé selon la structure de votre API
                    id: eleve.inscriptionsidEleve || eleve.idEleveInscrit,
                    matricule: eleve.matriculeEleve,
                    nom: eleve.nomEleve,
                    prenom: eleve.prenomEleve,
                    sexe: eleve.sexeEleve,
                    statut: eleve.inscriptions_statut_eleve, // ou eleve.inscriptions_status selon ce que vous voulez afficher
                    branche: {
                        id: eleve.brancheid,
                        libelle: eleve.brancheLibelle,
                        serie: {
                            libelle: eleve.brancheLibelle // Si vous avez des infos sur la série
                        }
                    },
                    codeInterne: eleve.codeInterne || eleve.matriculeEleve, // Si pas de codeInterne, utilisez le matricule
                    contact1: eleve.contactEleve || 'N/A',
                    contact2: eleve.contact2 || 'N/A', // Ajustez selon votre structure
                    dateNaissance: eleve.date_naissanceEleve,
                    lieuNaissance: eleve.lieu_naissance,
                    nationalite: eleve.nationalite,
                    processus: eleve.inscriptions_processus,
                    dateCreation: eleve.dateCreation,
                    dateUpdate: eleve.dateUpdate,
                    raw_data: eleve
                }))
                : [];

            setToCache(cacheKey, processedEleves);
            setData(processedEleves);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedEleves.length,
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
    }, [statut, typeInscription, refreshTrigger]);

    const forceRefresh = () => {
        fetchData(true);
    };

    return {
        eleves: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Hook pour récupérer les branches par niveauEnseignement et école
 * @param {number} ecoleId
 * @returns {object}
 */
export const useBranchesData = (ecoleId = 38) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchBranches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const cacheKey = `branches-data-${ecoleId}`;
            const cachedData = getFromCache(cacheKey);

            if (cachedData) {
                setBranches(cachedData);
                setLoading(false);
                return;
            }

            const response = await axios.get(apiUrls.branches.getByNiveauEnseignement());
            const formattedBranches = (response.data || []).map(branche => ({
                label: `${branche.libelle} - ${branche.serie?.libelle || 'N/A'}`,
                value: branche.id,
                raw_data: branche
            }));

            setToCache(cacheKey, formattedBranches);
            setBranches(formattedBranches);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [ecoleId, apiUrls.branches]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    return { branches, loading, error, refetch: fetchBranches };
};

/**
 * Vide le cache des élèves
 */
export const clearElevesCache = () => {
    clearCache();
};

// Configuration du tableau pour les élèves
export const elevesTableConfig = {
    columns: [
        {
            title: 'Matricule',
            dataKey: 'matricule',
            flexGrow: 1,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value) => {
                return (
                    <div style={{ fontWeight: 'bold', color: '#2c5aa0' }}>
                        {value || 'N/A'}
                    </div>
                );
            }
        },
        {
            title: 'Nom',
            dataKey: 'nom',
            flexGrow: 2,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value) => {
                return (
                    <div style={{ fontWeight: 'bold' }}>
                        {value || 'N/A'}
                    </div>
                );
            }
        },
        {
            title: 'Prénom',
            dataKey: 'prenom',
            flexGrow: 2,
            minWidth: 150,
            sortable: true
        },
        {
            title: 'Sexe',
            dataKey: 'sexe',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cellRenderer: (value) => {
                const color = value === 'MASCULIN' ? 'blue' : value === 'FEMININ' ? 'pink' : 'gray';
                return (
                    <Badge color={color}>
                        {value || 'N/A'}
                    </Badge>
                );
            }
        },
        {
            title: 'Statut',
            dataKey: 'statut',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellRenderer: (value) => {
                let color = 'gray';
                switch (value) {
                    case 'AFFECTE':
                        color = 'green';
                        break;
                    case 'NON_AFFECTE':
                        color = 'orange';
                        break;
                    case 'EN_ATTENTE':
                        color = 'yellow';
                        break;
                }
                return (
                    <Badge color={color}>
                        {value?.replace('_', ' ') || 'N/A'}
                    </Badge>
                );
            }
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
                                {value.serie?.libelle || 'N/A'}
                            </div>
                        </div>
                    );
                }
                return 'N/A';
            }
        },
        {
            title: 'Code Interne',
            dataKey: 'codeInterne',
            flexGrow: 1,
            minWidth: 120,
            sortable: true
        },
        // {
        //     title: 'Contact 1',
        //     dataKey: 'contact1',
        //     flexGrow: 1,
        //     minWidth: 120,
        //     sortable: true,
        //     cellRenderer: (value) => {
        //         return value ? (
        //             <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        //                 <FiPhone size={12} />
        //                 {value}
        //             </div>
        //         ) : 'N/A';
        //     }
        // },
        // {
        //     title: 'Contact 2',
        //     dataKey: 'contact2',
        //     flexGrow: 1,
        //     minWidth: 120,
        //     sortable: true,
        //     cellRenderer: (value) => {
        //         return value ? (
        //             <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        //                 <FiPhone size={12} />
        //                 {value}
        //             </div>
        //         ) : 'N/A';
        //     }
        // },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 160,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['matricule', 'nom', 'prenom', 'codeInterne', 'contact1', 'contact2'],
    filterConfigs: [
        {
            key: 'sexe',
            label: 'Sexe',
            type: 'select',
            options: [
                { label: 'Masculin', value: 'MASCULIN' },
                { label: 'Féminin', value: 'FEMININ' }
            ],
            placeholder: 'Filtrer par sexe'
        },
        {
            key: 'statut',
            label: 'Statut',
            type: 'select',
            options: [
                { label: 'Affecté', value: 'AFFECTE' },
                { label: 'Non Affecté', value: 'NON_AFFECTE' },
                { label: 'En Attente', value: 'EN_ATTENTE' }
            ],
            placeholder: 'Filtrer par statut'
        },
        {
            key: 'branche',
            label: 'Branche',
            type: 'select',
            options: [], // Sera rempli dynamiquement
            placeholder: 'Filtrer par branche'
        }
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir l\'élève',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier l\'élève',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer l\'élève',
            color: '#e74c3c'
        }
    ]
};