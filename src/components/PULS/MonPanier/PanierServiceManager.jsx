/**
 * Service pour la gestion des données du panier personnel
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiCheck, FiClock, FiUser, FiPhone, FiMail, FiCalendar, FiBookOpen } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { usePersonnelUrls } from '../utils/apiConfig';


/**
 * Hook pour récupérer la liste des agents du panier
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const usePanierData = (statut = 'EN_ATTENTE', refreshTrigger = 0) => {
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
            const cacheKey = 'panier-personnel-data';

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

            // URL de l'API pour les agents en attente
            const url = personnelUrls.getPanierByStatut(statut);
            const response = await axios.get(url);

            const processedPanierItems = response.data && Array.isArray(response.data)
                ? response.data.map(agent => ({
                    id: agent.idPersonnel,
                    nom: agent.nomPersonnel,
                    prenom: agent.prenomPersonnel,
                    nomComplet: `${agent.prenomPersonnel} ${agent.nomPersonnel}`,
                    email: agent.email,
                    contact: agent.contact,
                    fonction: agent.libelle_fonction,
                    diplome: agent.diplome_recent || 'Non spécifié',
                    domaine: agent.domaine_formation,
                    experience: agent.nombreAnneeExperience,
                    dateNaissance: agent.dateNaissance,
                    dateCreation: agent.panier_personnel_date_creation,
                    ecole: agent.libelleEcole,
                    lienAutorisation: agent.lien_autorisation,
                    lienPiece: agent.lien_piece,
                    idPanier: agent.idpanier_personnel_id,
                    statut: 'EN_ATTENTE',
                    raw_data: agent
                }))
                : [];

            setToCache(cacheKey, processedPanierItems);
            setData(processedPanierItems);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedPanierItems.length,
                dataSize: JSON.stringify(response.data).length
            });
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement du panier',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
            console.error('Erreur API panier:', err);
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
        panierItems: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Vide le cache du panier personnel
 */
export const clearPanierCache = () => {
    clearCache();
};

/**
 * Formateur pour l'expérience
 */
const formatExperience = (experience) => {
    if (!experience || experience === 0) return 'Débutant';
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
    if (!diplome || diplome === 'Non spécifié') {
        return <Badge style={{ backgroundColor: '#6c757d', color: 'white' }}>Non spécifié</Badge>;
    }

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

/**
 * Badge pour le statut en attente
 */
const getStatutBadge = () => {
    return (
        <Badge style={{ backgroundColor: '#ffc107', color: '#212529' }}>
            <FiClock className="me-1" />
            En attente
        </Badge>
    );
};

/**
 * Calcul du temps en attente
 */
const getTempsAttente = (dateCreation) => {
    if (!dateCreation) return 'Non défini';

    const creation = new Date(dateCreation);
    const maintenant = new Date();
    const diffTime = Math.abs(maintenant - creation);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 jour';
    if (diffDays < 7) return `${diffDays} jours`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semaines`;
    return `${Math.floor(diffDays / 30)} mois`;
};

// Configuration du tableau du panier personnel
export const panierTableConfig = {
    columns: [
        {
            title: 'Agent',
            dataKey: 'nomComplet',
            flexGrow: 2,
            minWidth: 220,
            sortable: true,
            cell: (rowData) => (
                <div>
                    <div className="d-flex align-items-center mb-1">
                        <strong>{rowData.nomComplet}</strong>
                        {getStatutBadge()}
                    </div>
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
                    <div className="mb-1"><FiPhone className="me-1" />{rowData.contact}</div>
                    <div><FiMail className="me-1" style={{ fontSize: '12px' }} /><small>{rowData.email}</small></div>
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
            title: 'Expérience & Âge',
            dataKey: 'experience',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cell: (rowData) => (
                <div>
                    <div><strong>{formatExperience(rowData.experience)}</strong></div>
                    <small className="text-muted">{formatAge(rowData.dateNaissance)}</small>
                </div>
            )
        },
        {
            title: 'Temps d\'attente',
            dataKey: 'dateCreation',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cell: (rowData) => (
                <div>
                    <div className="text-warning">
                        <FiClock className="me-1" />
                        <strong>{getTempsAttente(rowData.dateCreation)}</strong>
                    </div>
                    <small className="text-muted">
                        Ajouté le {new Date(rowData.dateCreation).toLocaleDateString('fr-FR')}
                    </small>
                </div>
            )
        },
        {
            title: 'École',
            dataKey: 'ecole',
            flexGrow: 1.5,
            minWidth: 160,
            cell: (rowData) => (
                <small className="text-muted">{rowData.ecole}</small>
            )
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 180,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['nomComplet', 'email', 'contact', 'fonction', 'diplome', 'domaine', 'ecole'],
    filterConfigs: [
        {
            field: 'fonction',
            label: 'Fonction',
            type: 'select'
        },
        {
            field: 'diplome',
            label: 'Diplôme',
            type: 'select'
        },
        {
            field: 'domaine',
            label: 'Domaine de formation',
            type: 'select'
        },
        {
            field: 'experience',
            label: 'Années d\'expérience',
            type: 'range',
            min: 0,
            max: 20
        },
        {
            field: 'tempsAttente',
            label: 'Temps d\'attente',
            type: 'select',
            options: [
                { value: 'recent', label: 'Moins de 7 jours' },
                { value: 'moyen', label: '1-4 semaines' },
                { value: 'ancien', label: 'Plus d\'1 mois' }
            ]
        }
    ],
    actions: [
        // {
        //     type: 'view',
        //     icon: <FiEye />,
        //     tooltip: 'Voir le profil détaillé',
        //     color: '#3498db'
        // },
        // {
        //     type: 'validate',
        //     icon: <FiCheck />,
        //     tooltip: 'Valider cet agent',
        //     color: '#27ae60'
        // },
        {
            type: 'edit',
            icon: <FiEdit size={17} />,
            tooltip: 'Modifier les informations',
            color: '#f39c12'
        },
        // {
        //     type: 'delete',
        //     icon: <FiTrash2 />,
        //     tooltip: 'Retirer du panier',
        //     color: '#e74c3c'
        // }
    ]
};