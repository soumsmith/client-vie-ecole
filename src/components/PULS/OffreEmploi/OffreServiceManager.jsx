/**
 * Service pour la gestion des données des offres d'emploi
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiCalendar, FiMapPin, FiUser, FiBriefcase, FiClock } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';

/**
 * Hook pour récupérer la liste des offres d'emploi
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useOffresData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchData = useCallback(async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const startTime = Date.now();
            const cacheKey = 'offres-emploi-data';
            
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

            // Pour l'instant, on utilise des données simulées car vous n'avez pas encore fourni l'API des offres
            // Vous pouvez remplacer par votre vraie API quand elle sera disponible
            // const response = await axios.get(`${getFullUrl()}/api/offres-emploi`);
            
            const simulatedOffres = [
                {
                    id: 1,
                    code: 'PROF-001',
                    description: 'Recherche professeur de mathématiques expérimenté pour lycée privé. Candidat dynamique avec excellentes capacités pédagogiques.',
                    experience: '3 ans minimum',
                    lieu: 'Abidjan, Cocody',
                    dateLimite: '2025-08-15',
                    dateCreation: '2025-07-01',
                    niveau: 'Licence',
                    profil: 'PROFESSEUR',
                    typeOffre: 'Emploi',
                    statut: 'ACTIVE',
                    raw_data: {
                        niveauId: 1,
                        profilId: 1,
                        typeOffreId: 1
                    }
                },
                {
                    id: 2,
                    code: 'EDU-002',
                    description: 'Éducateur pour encadrement des élèves du primaire. Personne responsable et à l\'écoute des enfants.',
                    experience: '2 ans minimum',
                    lieu: 'Abidjan, Plateau',
                    dateLimite: '2025-08-30',
                    dateCreation: '2025-07-10',
                    niveau: 'BTS',
                    profil: 'EDUCATEUR',
                    typeOffre: 'Stage',
                    statut: 'ACTIVE',
                    raw_data: {
                        niveauId: 1,
                        profilId: 2,
                        typeOffreId: 2
                    }
                },
                {
                    id: 3,
                    code: 'CONS-003',
                    description: 'Consultant en gestion scolaire pour mission temporaire d\'audit et d\'amélioration des processus.',
                    experience: '5 ans minimum',
                    lieu: 'Abidjan, Marcory',
                    dateLimite: '2025-07-25',
                    dateCreation: '2025-06-15',
                    niveau: 'Master',
                    profil: 'AUTRES',
                    typeOffre: 'Consultance',
                    statut: 'EXPIREE',
                    raw_data: {
                        niveauId: 1,
                        profilId: 4,
                        typeOffreId: 5
                    }
                }
            ];

            // Si vous voulez utiliser une vraie API, décommentez cette ligne et commentez les données simulées
            // const processedOffres = response.data && Array.isArray(response.data)
            //     ? response.data.map(offre => ({
            //         id: offre.id,
            //         code: offre.code,
            //         description: offre.description,
            //         experience: offre.experience,
            //         lieu: offre.lieu,
            //         dateLimite: offre.dateLimite,
            //         dateCreation: offre.dateCreation,
            //         niveau: offre.niveau?.libelle || 'Non spécifié',
            //         profil: offre.profil?.libelle || 'Non spécifié',
            //         typeOffre: offre.typeOffre?.libelle || 'Non spécifié',
            //         statut: offre.statut || 'ACTIVE',
            //         raw_data: offre
            //     }))
            //     : [];

            setToCache(cacheKey, simulatedOffres);
            setData(simulatedOffres);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'simulated',
                itemCount: simulatedOffres.length,
                dataSize: JSON.stringify(simulatedOffres).length
            });

        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des offres',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
            console.error('Erreur API offres:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(false);
    }, [fetchData, refreshTrigger]);

    const forceRefresh = useCallback(() => {
        fetchData(true);
    }, [fetchData]);

    return {
        offres: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Hook pour récupérer les données de référence (utilisées dans d'autres composants)
 */
export const useReferentielData = () => {
    const [niveaux, setNiveaux] = useState([]);
    const [profils, setProfils] = useState([]);
    const [typesOffre, setTypesOffre] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReferentielData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Vérifier le cache pour chaque type de données
            const cachedNiveaux = getFromCache('niveaux-etude');
            const cachedProfils = getFromCache('profils-fonctions');
            const cachedTypesOffre = getFromCache('types-offre');

            // Préparer les requêtes nécessaires
            const requests = [];
            
            if (!cachedNiveaux) {
                requests.push(
                    axios.get(apiUrls.offres.getNiveauxEtude())
                        .then(response => ({ type: 'niveaux', data: response.data }))
                );
            } else {
                setNiveaux(cachedNiveaux);
            }

            if (!cachedProfils) {
                requests.push(
                    axios.get(apiUrls.fonctions.listByEcole())
                        .then(response => ({ type: 'profils', data: response.data }))
                );
            } else {
                setProfils(cachedProfils);
            }

            if (!cachedTypesOffre) {
                requests.push(
                    axios.get(apiUrls.offres.getTypesOffre())
                        .then(response => ({ type: 'typesOffre', data: response.data }))
                );
            } else {
                setTypesOffre(cachedTypesOffre);
            }

            // Exécuter les requêtes nécessaires
            if (requests.length > 0) {
                const responses = await Promise.all(requests);
                
                responses.forEach(response => {
                    const { type, data } = response;
                    
                    switch (type) {
                        case 'niveaux':
                            // L'API retourne un objet unique selon votre exemple, on le met dans un array
                            const niveauxArray = Array.isArray(data) ? data : [data];
                            setToCache('niveaux-etude', niveauxArray);
                            setNiveaux(niveauxArray);
                            break;
                            
                        case 'profils':
                            setToCache('profils-fonctions', data);
                            setProfils(data);
                            break;
                            
                        case 'typesOffre':
                            setToCache('types-offre', data);
                            setTypesOffre(data);
                            break;
                    }
                });
            }

        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des données de référence',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
            console.error('Erreur API référentiel:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferentielData();
    }, [fetchReferentielData]);

    return {
        niveaux,
        profils,
        typesOffre,
        loading,
        error
    };
};

/**
 * Vide le cache des offres d'emploi
 */
export const clearOffresCache = () => {
    clearCache();
};

/**
 * Formateur pour la date limite
 */
const formatDateLimite = (dateLimite) => {
    if (!dateLimite) return 'Non définie';
    
    const date = new Date(dateLimite);
    const aujourd = new Date();
    const diffTime = date.getTime() - aujourd.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = date.toLocaleDateString('fr-FR');
    
    if (diffDays < 0) {
        return <span className="text-danger">{formattedDate} (Expirée)</span>;
    } else if (diffDays <= 7) {
        return <span className="text-warning">{formattedDate} ({diffDays} jours)</span>;
    } else {
        return <span className="text-success">{formattedDate} ({diffDays} jours)</span>;
    }
};

/**
 * Badge pour le type d'offre
 */
const getTypeOffreBadge = (typeOffre) => {
    const colors = {
        'Emploi': '#28a745',
        'Stage': '#007bff',
        'Intérim': '#ffc107',
        'Freelance': '#fd7e14',
        'Consultance': '#6f42c1'
    };
    
    const color = colors[typeOffre] || '#6c757d';
    return <Badge style={{ backgroundColor: color, color: 'white' }}>{typeOffre}</Badge>;
};

/**
 * Badge pour le statut de l'offre
 */
const getStatutBadge = (statut) => {
    const colors = {
        'ACTIVE': '#28a745',
        'SUSPENDUE': '#ffc107',
        'EXPIREE': '#dc3545',
        'POURVUE': '#6c757d'
    };
    
    const labels = {
        'ACTIVE': 'Active',
        'SUSPENDUE': 'Suspendue',
        'EXPIREE': 'Expirée',
        'POURVUE': 'Pourvue'
    };
    
    const color = colors[statut] || '#6c757d';
    const label = labels[statut] || statut;
    return <Badge style={{ backgroundColor: color, color: 'white' }}>{label}</Badge>;
};

// Configuration du tableau des offres d'emploi
export const offresTableConfig = {
    columns: [
        {
            title: 'Offre',
            dataKey: 'code',
            flexGrow: 2,
            minWidth: 250,
            sortable: true,
            cell: (rowData) => (
                <div>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                        <strong>{rowData.code}</strong>
                        {getStatutBadge(rowData.statut)}
                    </div>
                    <div className="mb-1">
                        <FiUser className="me-1" style={{ fontSize: '12px' }} />
                        <small>{rowData.profil}</small>
                    </div>
                    <small className="text-muted">{rowData.description.length > 80 ? `${rowData.description.substring(0, 80)}...` : rowData.description}</small>
                </div>
            )
        },
        {
            title: 'Détails',
            dataKey: 'experience',
            flexGrow: 1.5,
            minWidth: 180,
            cell: (rowData) => (
                <div>
                    <div className="mb-1">
                        <FiBriefcase className="me-1" style={{ fontSize: '12px' }} />
                        <small>{rowData.experience}</small>
                    </div>
                    <div className="mb-1">
                        <FiMapPin className="me-1" style={{ fontSize: '12px' }} />
                        <small>{rowData.lieu}</small>
                    </div>
                    <div>
                        <small className="text-muted">Niveau: {rowData.niveau}</small>
                    </div>
                </div>
            )
        },
        {
            title: 'Type & Date limite',
            dataKey: 'typeOffre',
            flexGrow: 1.5,
            minWidth: 180,
            sortable: true,
            cell: (rowData) => (
                <div>
                    <div className="mb-2">
                        {getTypeOffreBadge(rowData.typeOffre)}
                    </div>
                    <div>
                        <FiCalendar className="me-1" style={{ fontSize: '12px' }} />
                        <small>{formatDateLimite(rowData.dateLimite)}</small>
                    </div>
                </div>
            )
        },
        {
            title: 'Création',
            dataKey: 'dateCreation',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cell: (rowData) => {
                const date = new Date(rowData.dateCreation);
                return (
                    <div>
                        <small>{date.toLocaleDateString('fr-FR')}</small>
                        <br />
                        <small className="text-muted">
                            {Math.ceil((new Date() - date) / (1000 * 60 * 60 * 24))} jours
                        </small>
                    </div>
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
    searchableFields: ['code', 'description', 'profil', 'lieu', 'typeOffre', 'niveau'],
    filterConfigs: [
        {
            field: 'profil',
            label: 'Profil recherché',
            type: 'select'
        },
        {
            field: 'typeOffre',
            label: 'Type d\'offre',
            type: 'select'
        },
        {
            field: 'niveau',
            label: 'Niveau requis',
            type: 'select'
        },
        {
            field: 'statut',
            label: 'Statut',
            type: 'select',
            options: [
                { value: 'ACTIVE', label: 'Active' },
                { value: 'SUSPENDUE', label: 'Suspendue' },
                { value: 'EXPIREE', label: 'Expirée' },
                { value: 'POURVUE', label: 'Pourvue' }
            ]
        },
        {
            field: 'lieu',
            label: 'Lieu',
            type: 'select'
        }
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails de l\'offre',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier l\'offre',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer l\'offre',
            color: '#e74c3c'
        }
    ]
};