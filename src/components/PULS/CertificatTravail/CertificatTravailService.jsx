/**
 * Service pour la gestion des certificats de travail
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { usePulsParams } from '../../hooks/useDynamicParams';
import { useAllApiUrls } from '../utils/apiConfig';


/**
 * Hook pour récupérer la liste du personnel pour les certificats de travail
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useCertificatPersonnelData = (refreshTrigger = 0) => {
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
            const cacheKey = 'certificat-personnel-data';
            
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

            // URL de l'API pour récupérer le personnel
            const response = await axios.get(apiUrls.personnel.getForCertificat());
            
            const processedPersonnel = response.data && Array.isArray(response.data)
                ? response.data.map(person => ({
                    id: person.personnelid,
                    nom: person.personnelnom,
                    prenom: person.personnelprenom,
                    nomComplet: `${person.personnelprenom} ${person.personnelnom}`,
                    contact: person.personnel_contact,
                    sexe: person.personnel_sexe,
                    dateNaissance: person.personneldatenaissance,
                    fonction: person.fonction?.fonctionlibelle || 'Non définie',
                    fonctionCode: person.fonction?.fonctioncode,
                    niveauEtude: person.niveau_etude?.niveau_etude_libelle || 'Non défini',
                    domaineFormation: person.domaine_formation_domaine_formationid?.domaine_formation_libelle || 'Non défini',
                    diplome: person.sous_attent_personn?.sous_attent_personn_diplome_recent || 'Non spécifié',
                    experience: person.sous_attent_personn?.sous_attent_personn_nbre_annee_experience || 0,
                    email: person.sous_attent_personn?.sous_attent_personn_email || '',
                    dateCreation: person.sous_attent_personn?.sous_attent_personn_date_creation,
                    statut: person.sous_attent_personn?.sous_attent_personn_statut || 'EN_ATTENTE',
                    ecole: person.ecole?.ecoleclibelle || '',
                    nomSignataire: person.ecole?.nom_signataire || '',
                    raw_data: person
                }))
                : [];

            setToCache(cacheKey, processedPersonnel);
            setData(processedPersonnel);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedPersonnel.length,
                dataSize: JSON.stringify(response.data).length
            });
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement du personnel',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
            console.error('Erreur API personnel:', err);
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
 * Fonction pour générer un certificat de travail
 * @param {number} ecoleId - ID de l'école
 * @param {number} personnelId - ID du personnel
 * @param {string} nomSignataire - Nom du signataire
 * @param {string} fonctionSignataire - Fonction du signataire
 * @returns {Promise}
 */
// Alternative plus propre avec une fonction utilitaire
export const telechargerFichier = (blob, nomFichier) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomFichier;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
};

// Version avec la fonction utilitaire
export const genererCertificatTravail = async (ecoleId, personnelId, nomSignataire, fonctionSignataire, apiUrls) => {
    try {
        const apiUrl = apiUrls.personnel.imprimerCertificatTravail(ecoleId, personnelId, nomSignataire, fonctionSignataire);
        
        const response = await axios.get(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
            },
            responseType: 'blob',
            timeout: 15000
        });

        // Utiliser la fonction utilitaire
        const filename = `certificat_travail_${personnelId}_${Date.now()}.docx`;
        telechargerFichier(response.data, filename);
        
        return response;
    } catch (error) {
        console.error('Erreur lors de la génération du certificat:', error);
        throw error;
    }
};

/**
 * Vide le cache du personnel
 */
export const clearCertificatPersonnelCache = () => {
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
 * Formateur pour la date
 */
const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
};

/**
 * Badge pour le statut
 */
const getStatutBadge = (statut) => {
    const colors = {
        'VALIDEE': '#28a745',
        'EN_ATTENTE': '#ffc107',
        'REJETE': '#dc3545'
    };
    
    const labels = {
        'VALIDEE': 'Validé',
        'EN_ATTENTE': 'En attente',
        'REJETE': 'Rejeté'
    };
    
    const color = colors[statut] || '#6c757d';
    const label = labels[statut] || statut;
    
    return <Badge style={{ backgroundColor: color, color: 'white' }}>{label}</Badge>;
};

// Configuration du tableau des certificats de travail
export const certificatPersonnelTableConfig = {
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
                    <div><FiPhone className="me-1" />{rowData.contact || 'Non renseigné'}</div>
                    <div><FiMail className="me-1" />{rowData.email || 'Non renseigné'}</div>
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
                    <div><strong>{rowData.niveauEtude}</strong></div>
                    <small className="text-muted">{rowData.domaineFormation}</small>
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
                    <small className="text-muted">{rowData.sexe}</small>
                </div>
            )
        },
        {
            title: 'Statut',
            dataKey: 'statut',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cell: (rowData) => (
                <div>
                    {getStatutBadge(rowData.statut)}
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
                return formatDate(rowData.dateCreation);
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
    searchableFields: ['nomComplet', 'email', 'contact', 'fonction', 'diplome', 'domaineFormation'],
    filterConfigs: [
        {
            field: 'fonction',
            label: 'Fonction',
            type: 'select'
        },
        {
            field: 'statut',
            label: 'Statut',
            type: 'select'
        },
        {
            field: 'niveauEtude',
            label: 'Niveau d\'étude',
            type: 'select'
        },
        {
            field: 'sexe',
            label: 'Sexe',
            type: 'select'
        },
        {
            field: 'experience',
            label: 'Années d\'expérience',
            type: 'range',
            min: 0,
            max: 20
        }
    ],
    actions: [
        {
            type: 'print',
            icon: <FiUser size={17}/>,
            tooltip: 'Imprimer certificat de travail',
            color: '#28a745'
        }
    ]
};