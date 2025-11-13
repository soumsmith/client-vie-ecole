/**
 * Service pour la gestion des Écoles à Valider
 * Adapté pour les données de souscription-ecole
 */

import { useState, useEffect, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiCheck, FiX, FiDownload, FiHome, FiPhone, FiMail, FiMapPin, FiBook, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';

// ===========================
// CONFIGURATION GLOBALE
// ===========================

// ===========================
// FONCTIONS UTILITAIRES
// ===========================
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
 * Valide une adresse email
 */
const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Nettoie et formate les noms de lieux
 */
const formatLocation = (location) => {
    if (!location) return 'Non spécifié';
    return location.trim().replace(/\s+/g, ' ');
};

/**
 * Génère un statut basé sur la complétude des informations
 */
const getCompletenessStatus = (ecole) => {
    const requiredFields = [
        ecole.sousc_atten_etabliss_nom,
        ecole.sousc_atten_etabliss_email,
        ecole.sousc_atten_etabliss_tel,
        ecole.nomFondateur,
        ecole.prenomFondateur,
        ecole.commune_commune,
        ecole.niveau_Enseignement_obj
    ];
    
    const filledFields = requiredFields.filter(field => field && field.trim() !== '').length;
    const completionPercentage = Math.round((filledFields / requiredFields.length) * 100);
    
    return {
        percentage: completionPercentage,
        status: completionPercentage >= 90 ? 'COMPLET' : 
                completionPercentage >= 70 ? 'PARTIELLEMENT_COMPLET' : 'INCOMPLET',
        missingFields: requiredFields.length - filledFields
    };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES ÉCOLES
// ===========================
export const useEcolesData = (typeValidation, refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchEcoles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(apiUrls.souscriptions.getAllSouscriptionEcoles(typeValidation.typeValidation));
            
            // Traitement des données d'écoles
            let processedEcoles = [];
            if (response.data && Array.isArray(response.data)) {
                processedEcoles = response.data.map((ecole, index) => {
                    // Informations du fondateur
                    const nomCompletFondateur = `${ecole.nomFondateur || ''} ${ecole.prenomFondateur || ''}`.trim();
                    
                    // Localisation complète
                    const localisationComplete = `${formatLocation(ecole.ville_ville)}, ${formatLocation(ecole.commune_commune)}`;
                    
                    // Validation de l'email
                    const emailValide = isValidEmail(ecole.sousc_atten_etabliss_email);
                    
                    // Analyse de complétude
                    const completeness = getCompletenessStatus(ecole);
                    
                    // Documents disponibles
                    const hasAutorisation = !!(ecole.sousc_atten_etabliss_lien_autorisa && ecole.sousc_atten_etabliss_lien_autorisa.trim() !== '');
                    const hasLogo = !!(ecole.sousc_atten_etabliss_lien_logo && ecole.sousc_atten_etabliss_lien_logo.trim() !== '');
                    
                    return {
                        id: ecole.sousc_atten_etablissid,
                        numeroOrdre: index + 1,

                        // Informations de l'établissement
                        nom: ecole.sousc_atten_etabliss_nom || 'Nom non spécifié',
                        code: ecole.sousc_atten_etablisscode || '',
                        email: ecole.sousc_atten_etabliss_email || '',
                        telephone: formatPhone(ecole.sousc_atten_etabliss_tel),
                        indication: ecole.sousc_atten_etabliss_indication || '',
                        
                        // Validation des données
                        email_valide: emailValide,
                        completeness: completeness,
                        
                        // Fondateur
                        nomFondateur: ecole.nomFondateur || '',
                        prenomFondateur: ecole.prenomFondateur || '',
                        nomCompletFondateur: nomCompletFondateur || 'Fondateur non spécifié',
                        
                        // Localisation
                        commune: formatLocation(ecole.commune_commune),
                        ville: formatLocation(ecole.ville_ville),
                        pays: formatLocation(ecole.pays),
                        localisation: localisationComplete,
                        directionRegionale: ecole.myDirection_regionale || 'Non spécifiée',
                        
                        // Éducation
                        niveauEnseignement: ecole.niveau_Enseignement_obj || 'Non spécifié',
                        
                        // Documents
                        lienAutorisation: ecole.sousc_atten_etabliss_lien_autorisa || '',
                        lienLogo: ecole.sousc_atten_etabliss_lien_logo || '',
                        hasAutorisation: hasAutorisation,
                        hasLogo: hasLogo,
                        documentsCount: (hasAutorisation ? 1 : 0) + (hasLogo ? 1 : 0),
                        
                        // Statut (par défaut EN_ATTENTE puisque c'est le filtre de l'API)
                        statut: 'EN_ATTENTE',
                        statut_color: '#f59e0b',
                        
                        // Affichage optimisé
                        display_name: ecole.sousc_atten_etabliss_nom || 'Nom non spécifié',
                        display_location: localisationComplete,
                        display_contact: `📞 ${formatPhone(ecole.sousc_atten_etabliss_tel)}`,
                        display_email: `✉️ ${ecole.sousc_atten_etabliss_email || 'Non spécifié'}`,
                        display_fondateur: nomCompletFondateur || 'Non spécifié',
                        display_completeness: `${completeness.percentage}% complété`,
                        display_documents: `${hasAutorisation ? 1 : 0 + hasLogo ? 1 : 0} document(s)`,
                        
                        // Indicateurs de validation
                        needs_validation: true, // Toutes les écoles récupérées sont EN_ATTENTE
                        can_validate: completeness.percentage >= 70, // Seuil minimum pour validation
                        priority: completeness.percentage >= 90 ? 'NORMALE' : 'BASSE',
                        
                        // Données brutes pour debug
                        raw_data: ecole
                    };
                });
            }

            setData(processedEcoles);
        } catch (err) {
            console.error('Erreur lors de la récupération des écoles:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des écoles',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, [typeValidation, apiUrls.souscriptions]);

    useEffect(() => {
        fetchEcoles();
    }, [refreshTrigger, fetchEcoles]);

    return {
        ecoles: data,
        loading,
        error,
        refetch: fetchEcoles
    };
};

// ===========================
// CONFIGURATION DU TABLEAU DES ÉCOLES
// ===========================
export const ecolesTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'numeroOrdre',
            flexGrow: 0.5,
            minWidth: 60,
            sortable: true
        },
        {
            title: 'Établissement',
            dataKey: 'nom',
            flexGrow: 2.5,
            minWidth: 220,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #e2e8f0',
                        flexShrink: 0
                    }}>
                        <FiHome size={16} color="#3b82f6" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ 
                            fontWeight: '600', 
                            color: '#1e293b',
                            fontSize: '12px',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {rowData.nom}
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '11px', 
                            color: '#64748b',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ 
                                fontSize: '11px',
                                color: '#64748b'
                            }}>
                                {rowData.directionRegionale}
                            </div>
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Fondateur',
            dataKey: 'nomCompletFondateur',
            flexGrow: 3.5,
            minWidth: 140,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '12px',
                        color: '#1e293b',
                        marginBottom: '2px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <FiUser size={11} color="#8b5cf6" />
                        <span>{rowData.nomCompletFondateur}</span>
                    </div>
                    
                </div>
            ),
            sortable: true
        },
        {
            title: 'Localisation',
            dataKey: 'localisation',
            flexGrow: 1.8,
            minWidth: 160,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '12px',
                        color: '#1e293b',
                        marginBottom: '2px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <FiMapPin size={11} color="#10b981" />
                        <span>{rowData.ville}</span>
                    </div>
                    {/* <div style={{ 
                        fontSize: '11px',
                        color: '#64748b',
                        marginBottom: '2px'
                    }}>
                        {rowData.commune}
                    </div> */}
                    <div style={{ 
                        fontSize: '12px',
                        color: '#9ca3af'
                    }}>
                        {rowData.pays}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Niveau',
            dataKey: 'niveauEnseignement',
            flexGrow: 3.5,
            minWidth: 180,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '12px',
                        color: '#1e293b',
                        marginBottom: '4px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <FiBook size={11} color="#f59e0b" />
                        <span>{rowData.niveauEnseignement}</span>
                    </div>
                    
                </div>
            ),
            sortable: true
        },

        {
            title: 'Contact',
            dataKey: 'niveauEnseignement',
            flexGrow: 2,
            minWidth: 180,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '12px',
                        color: '#64748b',
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <FiPhone size={10} color="#10b981" />
                        <span>{rowData.telephone}</span>
                    </div>
                    <div style={{ 
                        fontSize: '11px',
                        color: rowData.email_valide ? '#16a34a' : '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        <FiMail size={9} />
                        <span>{rowData.email || 'Email non spécifié'}</span>
                    </div>
                </div>
            ),
            sortable: true
        },

        {
            title: 'Complétude',
            dataKey: 'completeness',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        padding: '4px 8px',
                        backgroundColor: rowData.completeness.status === 'COMPLET' ? '#dcfce7' : 
                                        rowData.completeness.status === 'PARTIELLEMENT_COMPLET' ? '#fef3c7' : '#fee2e2',
                        color: rowData.completeness.status === 'COMPLET' ? '#16a34a' : 
                               rowData.completeness.status === 'PARTIELLEMENT_COMPLET' ? '#d97706' : '#dc2626',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginBottom: '4px'
                    }}>
                        {rowData.completeness.percentage}%
                    </div>
                    <div style={{ 
                        fontSize: '10px',
                        color: '#64748b'
                    }}>
                        {rowData.completeness.missingFields > 0 ? 
                            `${rowData.completeness.missingFields} champ(s) manquant(s)` : 
                            'Informations complètes'
                        }
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{
                            padding: '2px 4px',
                            backgroundColor: rowData.hasAutorisation ? '#dcfce7' : '#fee2e2',
                            color: rowData.hasAutorisation ? '#16a34a' : '#dc2626',
                            borderRadius: '3px',
                            fontSize: '9px',
                            fontWeight: '500'
                        }}>
                            AUTH
                        </div>
                        <div style={{
                            padding: '2px 4px',
                            backgroundColor: rowData.hasLogo ? '#dcfce7' : '#fee2e2',
                            color: rowData.hasLogo ? '#16a34a' : '#dc2626',
                            borderRadius: '3px',
                            fontSize: '9px',
                            fontWeight: '500'
                        }}>
                            LOGO
                        </div>
                    </div>
                    <div style={{ 
                        fontSize: '10px',
                        color: '#64748b'
                    }}>
                        {rowData.documentsCount}/2
                    </div>
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
            // fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'completeness.status',
            label: 'Complétude',
            type: 'select',
            options: [
                { label: 'Complet', value: 'COMPLET' },
                { label: 'Partiellement complet', value: 'PARTIELLEMENT_COMPLET' },
                { label: 'Incomplet', value: 'INCOMPLET' }
            ],
            tagColor: 'green'
        },
        {
            field: 'niveauEnseignement',
            label: 'Niveau d\'enseignement',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'commune',
            label: 'Commune',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'directionRegionale',
            label: 'Direction régionale',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'email_valide',
            label: 'Email valide',
            type: 'select',
            options: [
                { label: 'Oui', value: true },
                { label: 'Non', value: false }
            ],
            tagColor: 'red'
        },
        {
            field: 'can_validate',
            label: 'Validable',
            type: 'select',
            options: [
                { label: 'Oui', value: true },
                { label: 'Non', value: false }
            ],
            tagColor: 'green'
        }
    ],
    searchableFields: [
        'nom',
        'code',
        'email',
        'telephone',
        'nomCompletFondateur',
        'nomFondateur',
        'prenomFondateur',
        'commune',
        'ville',
        'pays',
        'niveauEnseignement',
        'directionRegionale',
        'indication'
    ],
    actions: [
        {
            type: 'validate',
            icon: <FiCheck size={17} />,
            tooltip: 'Valider l\'école',
            color: '#22c55e'
        },
        // {
        //     type: 'reject',
        //     icon: <FiX />,
        //     tooltip: 'Refuser l\'école',
        //     color: '#ef4444'
        // },
        // {
        //     type: 'view',
        //     icon: <FiEye size={17} />,
        //     tooltip: 'Voir les détails',
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
    defaultSortField: 'completeness.percentage',
    defaultSortOrder: 'desc',
    pageSize: 15,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};