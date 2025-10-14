/**
 * Service pour la gestion des données des agents à recruter
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiUser, FiPhone, FiMail, FiCalendar, FiBookOpen } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import getFullUrl from '../../hooks/urlUtils';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { usePulsParams } from '../../hooks/useDynamicParams';
import { usePersonnelUrls } from '../utils/apiConfig';


/**
 * Hook pour récupérer la liste des agents à recruter
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useAgentsData = (statut = 'VALIDEE', refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);
    // Utilisation des URLs centralisées
    const personnelUrls = usePersonnelUrls();


    const fetchData = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const startTime = Date.now();
            const cacheKey = 'agents-recruter-data';

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

            // URL de l'API fournie
            const url = personnelUrls.getAgentByStatut(statut);
            const response = await axios.get(url);

            const processedAgents = response.data && Array.isArray(response.data)
                ? response.data.map(agent => ({
                    id: agent.idPersonnel,
                    nom: agent.nomPersonnel,
                    prenom: agent.prenomPersonnel,
                    nomComplet: `${agent.prenomPersonnel} ${agent.nomPersonnel}`,
                    email: agent.email,
                    contact: agent.contact,
                    fonction: agent.libelle_fonction,
                    diplome: agent.diplome_recent,
                    domaine: agent.domaine_formation,
                    experience: agent.nombreAnneeExperience,
                    dateNaissance: agent.dateNaissance,
                    dateCreation: agent.panier_personnel_date_creation,
                    ecole: agent.libelleEcole,
                    lienAutorisation: agent.lien_autorisation,
                    lienPiece: agent.lien_piece,
                    idPanier: agent.idpanier_personnel_id,
                    raw_data: agent
                }))
                : [];

            setToCache(cacheKey, processedAgents);
            setData(processedAgents);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedAgents.length,
                dataSize: JSON.stringify(response.data).length
            });
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des agents',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
            console.error('Erreur API agents:', err);
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
        agents: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Vide le cache des agents à recruter
 */
export const clearAgentsCache = () => {
    clearCache();
};

/**
 * Formateur pour l'expérience
 */
const formatExperience = (experience) => {
    if (!experience) return 'Non spécifiée';
    const annees = parseInt(experience);
    return annees > 1 ? `${annees} ans` : `${annees} an`;
};

/**
 * Formateur pour la date de naissance
 */
const formatAge = (dateNaissance) => {
    if (!dateNaissance) return 'Non spécifiée';
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return `${age - 1} ans`;
    }
    return `${age} ans`;
};

/**
 * Badge pour le niveau de diplôme
 */
const getDiplomeBadge = (diplome) => {
    const colors = {
        'Master': '#28a745',
        'Licence': '#007bff',
        'BTS': '#ffc107',
        'BAC': '#fd7e14',
        'CAP': '#6c757d'
    };

    const color = colors[diplome] || '#6c757d';
    return <Badge style={{ backgroundColor: color, color: 'white' }}>{diplome}</Badge>;
};

// Configuration du tableau des agents à recruter
export const agentsTableConfig = {
    columns: [
        {
            title: 'Nom Complet',
            dataKey: 'nomComplet',
            flexGrow: 2,
            minWidth: 200,
            sortable: true,
            cell: (rowData) => (
                <div>
                    <strong>{rowData.nomComplet}</strong>
                    <br />
                    <small className="text-muted">{rowData.fonction}</small>
                </div>
            )
        },
        {
            title: 'Contact',
            dataKey: 'contact',
            flexGrow: 1.5,
            minWidth: 180,
            cell: (rowData) => (
                <div>
                    <div><FiPhone className="me-1" />{rowData.contact}</div>
                    <div><FiMail className="me-1" />{rowData.email}</div>
                </div>
            )
        },
        {
            title: 'Formation',
            dataKey: 'diplome',
            flexGrow: 1.5,
            minWidth: 150,
            cell: (rowData) => (
                <div>
                    {getDiplomeBadge(rowData.diplome)}
                    <br />
                    <small className="text-muted">{rowData.domaine}</small>
                </div>
            )
        },
        {
            title: 'Expérience',
            dataKey: 'experience',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cell: (rowData) => (
                <div>
                    <strong>{formatExperience(rowData.experience)}</strong>
                    <br />
                    <small className="text-muted">{formatAge(rowData.dateNaissance)}</small>
                </div>
            )
        },
        {
            title: 'École',
            dataKey: 'ecole',
            flexGrow: 1.5,
            minWidth: 180,
            cell: (rowData) => (
                <div>
                    <small className="text-muted">{rowData.ecole}</small>
                </div>
            )
        },
        {
            title: 'Date Création',
            dataKey: 'dateCreation',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cell: (rowData) => {
                const date = new Date(rowData.dateCreation);
                return date.toLocaleDateString('fr-FR');
            }
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 0.7,
            minWidth: 50,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['nomComplet', 'email', 'contact', 'fonction', 'diplome', 'domaine', 'ecole'],
    filterConfigs: [
        {
            field: 'fonction',
            label: 'Fonction',
            placeholder: 'Toutes les fonctions',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'diplome',
            label: 'Diplôme',
            placeholder: 'Tous les diplômes',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'domaine',
            label: 'Domaine de formation',
            placeholder: 'Tous les domaines',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'ecole',
            label: 'École',
            placeholder: 'Toutes les écoles',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'experience',
            label: 'Années d\'expérience',
            placeholder: 'Toutes les expériences',
            type: 'range',
            min: 0,
            max: 20,
            tagColor: 'cyan'
        },
        {
            field: 'dateCreation',
            label: 'Date de création',
            placeholder: 'Sélectionner une date',
            type: 'date',
            tagColor: 'pink'
        }
    ],
    actions: [
        // {
        //     type: 'view',
        //     icon: <FiEye />,
        //     tooltip: 'Voir le profil de l\'agent',
        //     color: '#3498db'
        // },
        {
            type: 'edit',
            icon: <FiEdit size={17} />,
            tooltip: 'Modifier les informations',
            color: '#f39c12'
        },
        // {
        //     type: 'download',
        //     icon: <FiDownload />,
        //     tooltip: 'Télécharger les documents',
        //     color: '#27ae60'
        // },
        // {
        //     type: 'delete',
        //     icon: <FiTrash2 />,
        //     tooltip: 'Retirer de la liste',
        //     color: '#e74c3c'
        // }
    ]
};