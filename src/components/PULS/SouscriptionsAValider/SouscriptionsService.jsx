/**
 * Service pour la gestion des Souscriptions à Valider
 * Adapté pour les données de souscription-personnel
 */

import { useState, useEffect, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiCheck, FiX, FiDownload, FiUser, FiPhone, FiMail, FiCalendar, FiFileText } from 'react-icons/fi';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';
// ===========================
// CONFIGURATION GLOBALE
// ===========================

// ===========================
// FONCTIONS UTILITAIRES
// ===========================
/**
 * Formate une date ISO en format français JJ/MM/AAAA
 */
const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date invalide';
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return 'Date invalide';
    }
};

/**
 * Formate un numéro de téléphone
 */
const formatPhone = (phone) => {
    if (!phone) return 'Non renseigné';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }
    return phone;
};

/**
 * Calcule l'âge à partir de la date de naissance
 */
const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

// ===========================
// HOOK POUR RÉCUPÉRER LES SOUSCRIPTIONS
// ===========================
export const useSouscriptionsData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchSouscriptions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            //const response = await axios.get(`${getFullUrl}${SOUSCRIPTIONS_ENDPOINT}`);
            const response = await axios.get(apiUrls.souscriptions.getEnAttente());
            
            // Traitement des données de souscription
            let processedSouscriptions = [];
            if (response.data && Array.isArray(response.data)) {
                processedSouscriptions = response.data.map((souscription, index) => {
                    // Calcul de l'âge
                    const age = calculateAge(souscription.sous_attent_personn_date_naissance);
                    
                    // Formatage du genre
                    const genre_short = souscription.sous_attent_personn_sexe === 'MASCULIN' ? 'M' : 
                                       souscription.sous_attent_personn_sexe === 'FEMININ' ? 'F' : '?';

                    // Nom complet
                    const nomComplet = `${souscription.sous_attent_personn_nom} ${souscription.sous_attent_personn_prenom}`;

                    // Statut avec couleur
                    const statutColor = souscription.sous_attent_personn_statut === 'EN ATTENTE' ? '#f59e0b' : 
                                       souscription.sous_attent_personn_statut === 'VALIDEE' ? '#10b981' : '#ef4444';

                    // Expérience formatée
                    const experienceText = souscription.sous_attent_personn_nbre_annee_experience > 1 ? 
                        `${souscription.sous_attent_personn_nbre_annee_experience} ans` : 
                        `${souscription.sous_attent_personn_nbre_annee_experience} an`;

                    return {
                        id: souscription.sous_attent_personnid,
                        numeroOrdre: index + 1,

                        // Informations personnelles
                        nom: souscription.sous_attent_personn_nom,
                        prenom: souscription.sous_attent_personn_prenom,
                        nomComplet: nomComplet,
                        sexe: souscription.sous_attent_personn_sexe,
                        genre_short: genre_short,
                        dateNaissance: souscription.sous_attent_personn_date_naissance,
                        dateNaissance_display: formatDate(souscription.sous_attent_personn_date_naissance),
                        age: age,
                        contact: formatPhone(souscription.sous_attent_personn_contact),
                        email: souscription.sous_attent_personn_email,

                        // Statut et dates
                        statut: souscription.sous_attent_personn_statut,
                        statut_color: statutColor,
                        dateCreation: souscription.sous_attent_personn_date_creation,
                        dateCreation_display: formatDate(souscription.sous_attent_personn_date_creation),

                        // Formation et fonction
                        fonction: souscription.fonction?.fonctionlibelle || 'Non spécifiée',
                        fonction_code: souscription.fonction?.fonctioncode || '',
                        domaine_formation: souscription.domaine_formation?.domaine_formation_libelle || 'Non spécifié',
                        domaine_formation_code: souscription.domaine_formation?.domaine_formation_code || '',
                        niveau_etude: souscription.niveau_etude?.niveau_etude_libelle || 'Non spécifié',
                        niveau_etude_code: souscription.niveau_etude?.niveau_etude_code || '',

                        // Expérience et qualifications
                        experience: souscription.sous_attent_personn_nbre_annee_experience,
                        experience_display: experienceText,
                        diplome_recent: souscription.sous_attent_personn_diplome_recent || 'Non renseigné',

                        // Documents
                        lien_cv: souscription.sous_attent_personn_lien_cv,
                        lien_autorisation: souscription.sous_attent_personn_lien_autorisation,
                        lien_piece: souscription.sous_attent_personn_lien_piece,
                        has_cv: !!(souscription.sous_attent_personn_lien_cv),
                        has_autorisation: !!(souscription.sous_attent_personn_lien_autorisation),
                        has_piece: !!(souscription.sous_attent_personn_lien_piece),

                        // Identifiants techniques
                        type_autorisation_id: souscription.type_autorisation_idtype_autorisationid,
                        fonction_id: souscription.fonction?.fonctionid,
                        domaine_formation_id: souscription.domaine_formation?.domaine_formationid,
                        niveau_etude_id: souscription.niveau_etude?.niveau_etudeid,

                        // Affichage optimisé
                        display_name: nomComplet,
                        display_details: `${genre_short} • ${age} ans • ${formatDate(souscription.sous_attent_personn_date_naissance)}`,
                        display_formation: `${souscription.niveau_etude?.niveau_etude_libelle || 'N/A'} - ${souscription.domaine_formation?.domaine_formation_libelle || 'N/A'}`,
                        display_experience: `${experienceText} d'expérience`,
                        display_contact: `📞 ${formatPhone(souscription.sous_attent_personn_contact)} • ✉️ ${souscription.sous_attent_personn_email}`,

                        // Données brutes pour debug
                        raw_data: souscription
                    };
                });
            }

            setData(processedSouscriptions);
        } catch (err) {
            console.error('Erreur lors de la récupération des souscriptions:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des souscriptions',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSouscriptions();
    }, [refreshTrigger, fetchSouscriptions]);

    return {
        souscriptions: data,
        loading,
        error,
        refetch: fetchSouscriptions
    };
};

// ===========================
// CONFIGURATION DU TABLEAU DES SOUSCRIPTIONS
// ===========================
export const souscriptionsTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'numeroOrdre',
            flexGrow: 0.5,
            minWidth: 60,
            sortable: true
        },
        {
            title: 'Candidat',
            dataKey: 'nomComplet',
            flexGrow: 2.5,
            minWidth: 220,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #e2e8f0',
                        flexShrink: 0
                    }}>
                        <FiUser size={16} color="#64748b" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ 
                            fontWeight: '600', 
                            color: '#1e293b',
                            fontSize: '14px',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {rowData.nomComplet}
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '11px', 
                            color: '#64748b',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{ 
                                padding: '1px 4px',
                                backgroundColor: rowData.genre_short === 'M' ? '#dbeafe' : '#fce7f3',
                                color: rowData.genre_short === 'M' ? '#2563eb' : '#ec4899',
                                borderRadius: '3px',
                                fontSize: '10px'
                            }}>
                                {rowData.genre_short}
                            </span>
                            <span>🎂 {rowData.age} ans</span>
                            <span>📅 {rowData.dateNaissance_display}</span>
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Fonction demandée',
            dataKey: 'fonction',
            flexGrow: 1.5,
            minWidth: 140,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontWeight: '600', 
                        color: '#1e293b',
                        fontSize: '13px',
                        marginBottom: '2px'
                    }}>
                        {rowData.fonction}
                    </div>
                    <div style={{ 
                        fontSize: '10px', 
                        color: '#64748b',
                        padding: '1px 4px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '3px',
                        display: 'inline-block'
                    }}>
                        Code: {rowData.fonction_code}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Formation & Niveau',
            dataKey: 'niveau_etude',
            flexGrow: 2,
            minWidth: 180,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontWeight: '600', 
                        color: '#1e293b',
                        fontSize: '12px',
                        marginBottom: '2px'
                    }}>
                        {rowData.niveau_etude}
                    </div>
                    <div style={{ 
                        fontSize: '11px', 
                        color: '#64748b',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {rowData.domaine_formation}
                    </div>
                    <div style={{ 
                        fontSize: '10px', 
                        color: '#10b981',
                        fontWeight: '500'
                    }}>
                        {rowData.experience_display}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Contact',
            dataKey: 'contact',
            flexGrow: 1.5,
            minWidth: 160,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '12px',
                        color: '#1e293b',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <FiPhone size={11} color="#10b981" />
                        <span style={{ fontWeight: '500' }}>{rowData.contact}</span>
                    </div>
                    <div style={{ 
                        fontSize: '11px',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        <FiMail size={10} />
                        <span>{rowData.email}</span>
                    </div>
                </div>
            ),
            sortable: false
        },
        {
            title: 'Statut',
            dataKey: 'statut',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{
                        padding: '4px 8px',
                        backgroundColor: rowData.statut === 'EN ATTENTE' ? '#fef3c7' : 
                                        rowData.statut === 'VALIDEE' ? '#dcfce7' : '#fee2e2',
                        color: rowData.statut_color,
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textAlign: 'center',
                        marginBottom: '4px'
                    }}>
                        {rowData.statut}
                    </div>
                    <div style={{ 
                        fontSize: '10px',
                        color: '#64748b',
                        textAlign: 'center'
                    }}>
                        {rowData.dateCreation_display}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Documents',
            dataKey: 'documents',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <div style={{
                        padding: '2px 4px',
                        backgroundColor: rowData.has_cv ? '#dcfce7' : '#fee2e2',
                        color: rowData.has_cv ? '#16a34a' : '#dc2626',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: '500'
                    }}>
                        CV
                    </div>
                    <div style={{
                        padding: '2px 4px',
                        backgroundColor: rowData.has_autorisation ? '#dcfce7' : '#fee2e2',
                        color: rowData.has_autorisation ? '#16a34a' : '#dc2626',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: '500'
                    }}>
                        AUTH
                    </div>
                    {rowData.has_piece && (
                        <div style={{
                            padding: '2px 4px',
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            borderRadius: '3px',
                            fontSize: '9px',
                            fontWeight: '500'
                        }}>
                            PIECE
                        </div>
                    )}
                </div>
            ),
            sortable: false
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
    filterConfigs: [
        {
            field: 'statut',
            label: 'Statut',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'fonction',
            label: 'Fonction',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'niveau_etude',
            label: 'Niveau d\'étude',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'domaine_formation',
            label: 'Domaine de formation',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'sexe',
            label: 'Genre',
            type: 'select',
            dynamic: true,
            tagColor: 'pink'
        }
    ],
    searchableFields: [
        'nomComplet',
        'nom',
        'prenom',
        'email',
        'contact',
        'fonction',
        'domaine_formation',
        'niveau_etude',
        'diplome_recent'
    ],
    actions: [
        {
            type: 'validate',
            icon: <FiCheck size={17}/>,
            tooltip: 'Valider la souscription',
            color: '#22c55e'
        },
        // {
        //     type: 'reject',
        //     icon: <FiX />,
        //     tooltip: 'Refuser la souscription',
        //     color: '#ef4444'
        // },
        // {
        //     type: 'view',
        //     icon: <FiEye />,
        //     tooltip: 'Voir le dossier complet',
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
        //     color: '#9b59b6'
        // }
    ],
    defaultSortField: 'dateCreation',
    defaultSortOrder: 'desc',
    pageSize: 15,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};