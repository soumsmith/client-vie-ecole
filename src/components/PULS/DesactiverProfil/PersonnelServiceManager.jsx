/**
 * Service pour la gestion des données du personnel
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiUser, FiPhone, FiMail, FiCalendar, FiBookOpen } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { usePulsParams } from '../../hooks/useDynamicParams';
import { useAllApiUrls } from '../utils/apiConfig';

/**
 * Hook pour récupérer la liste du personnel
 * @param {number} refreshTrigger
 * @returns {object}
 */

export const usePersonnelData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);
    const apiUrls = useAllApiUrls();

    const { ecoleId: dynamicEcoleId, personnelInfo: personnelInfo, academicYearId: dynamicAcademicYearId, periodicitieId: dynamicPeriodicitieId } = usePulsParams();


    console.log("=====> personnelInfo.profileId");
    // console.log(personnelInfo.personnelid);


    

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

            // URL de l'API fournie
            const response = await axios.get(apiUrls.personnel.getForCertificat()); //${personnelInfo.personnelid}
            
            const processedPersonnel = response.data && Array.isArray(response.data)
                ? response.data.map(person => ({
                    id: person.personnelid,
                    nom: person.personnelnom,
                    prenom: person.personnelprenom,
                    nomComplet: `${person.personnelprenom} ${person.personnelnom}`,
                    email: person.sous_attent_personn?.sous_attent_personn_email || '',
                    contact: person.personnel_contact,
                    fonction: person.fonction?.fonctionlibelle || '',
                    diplome: person.niveau_etude?.niveau_etude_libelle || '',
                    domaine: person.domaine_formation_domaine_formationid?.domaine_formation_libelle || '',
                    experience: person.sous_attent_personn?.sous_attent_personn_nbre_annee_experience || 0,
                    dateNaissance: person.personneldatenaissance,
                    dateCreation: person.sous_attent_personn?.sous_attent_personn_date_creation,
                    ecole: person.ecole?.ecoleclibelle || '',
                    statut: person.sous_attent_personn?.sous_attent_personn_statut || '',
                    sexe: person.sous_attent_personn?.sous_attent_personn_sexe || '',
                    diplomeRecent: person.sous_attent_personn?.sous_attent_personn_diplome_recent || '',
                    lienCV: person.sous_attent_personn?.sous_attent_personn_lien_cv || '',
                    lienAutorisation: person.sous_attent_personn?.sous_attent_personn_lien_autorisation || '',
                    lienPiece: person.sous_attent_personn?.sous_attent_personn_lien_piece || '',
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
 * Hook pour récupérer la liste des profils
 * @returns {object}
 */
export const useProfilsData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    useEffect(() => {
        const fetchProfils = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get(apiUrls.profils.getProfilVisible());
                
                const processedProfils = response.data && Array.isArray(response.data)
                    ? response.data.map(profil => ({
                        value: profil.profilid,
                        label: profil.profil_libelle,
                        code: profil.profilcode
                    }))
                    : [];

                setData(processedProfils);
            } catch (err) {
                setError({
                    message: err.message || 'Erreur lors du chargement des profils',
                    type: err.name || 'FetchError'
                });
                console.error('Erreur API profils:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfils();
    }, [apiUrls.profils]);

    return {
        profils: data,
        loading,
        error
    };
};

/**
 * Vide le cache du personnel
 */
export const clearPersonnelCache = () => {
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
 * Badge pour le statut
 */
const getStatutBadge = (statut) => {
    const colors = {
        'VALIDEE': '#28a745',
        'EN_ATTENTE': '#ffc107',
        'REFUSEE': '#dc3545',
        'ACTIVE': '#28a745',
        'INACTIVE': '#6c757d'
    };
    
    const color = colors[statut] || '#6c757d';
    return <Badge style={{ backgroundColor: color, color: 'white' }}>{statut}</Badge>;
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

// Configuration du tableau du personnel
export const personnelTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'id',
            flexGrow: 0.5,
            minWidth: 60,
            sortable: true,
            cell: (rowData, rowIndex) => rowIndex + 1
        },
        {
            title: 'Nom',
            dataKey: 'nom',
            flexGrow: 1.5,
            minWidth: 120,
            sortable: true
        },
        {
            title: 'Prénom',
            dataKey: 'prenom',
            flexGrow: 1.5,
            minWidth: 120,
            sortable: true
        },
        {
            title: 'Domaine de formation',
            dataKey: 'domaine',
            flexGrow: 2,
            minWidth: 180,
            cell: (rowData) => (
                <div>
                    <div>{rowData.domaine}</div>
                    <small className="text-muted">{getDiplomeBadge(rowData.diplome)}</small>
                </div>
            )
        },
        {
            title: 'Année d\'expérience',
            dataKey: 'experience',
            flexGrow: 1.5,
            minWidth: 140,
            sortable: true,
            cell: (rowData) => formatExperience(rowData.experience)
        },
        {
            title: 'Fonction',
            dataKey: 'fonction',
            flexGrow: 1.5,
            minWidth: 120,
            cell: (rowData) => (
                <div>
                    <strong>{rowData.fonction}</strong>
                    <br />
                    <small className="text-muted">{rowData.ecole}</small>
                </div>
            )
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['nomComplet', 'nom', 'prenom', 'email', 'contact', 'fonction', 'diplome', 'domaine', 'ecole'],
    filterConfigs: [
        {
            field: 'fonction',
            label: 'Fonction',
            placeholder: 'Sélectionner une fonction',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'diplome',
            label: 'Diplôme',
            placeholder: 'Sélectionner un diplôme',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'domaine',
            label: 'Domaine de formation',
            placeholder: 'Sélectionner un domaine',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'statut',
            label: 'Statut',
            placeholder: 'Sélectionner un statut',
            type: 'select',
            dynamic: true,
            tagColor: 'red'
        },
        {
            field: 'ecole',
            label: 'École',
            placeholder: 'Sélectionner une école',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'sexe',
            label: 'Sexe',
            placeholder: 'Sélectionner le sexe',
            type: 'select',
            dynamic: true,
            tagColor: 'cyan'
        },
        {
            field: 'experience',
            label: 'Années d\'expérience',
            placeholder: 'Filtrer par expérience',
            type: 'range',
            min: 0,
            max: 20,
            tagColor: 'violet'
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
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir le profil du personnel',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier le profil',
            color: '#f39c12'
        }
    ]
};