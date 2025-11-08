/**
 * Service pour la gestion des Fondateurs à Valider
 * Adapté pour les données de souscription-personnel fondateurs
 */

import { useState, useEffect, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiCheck, FiX, FiDownload, FiUser, FiPhone, FiMail, FiUsers, FiUserCheck } from 'react-icons/fi';
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
        return `${cleaned.slice(0, 2)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
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

// ===========================
// HOOK POUR RÉCUPÉRER LES FONDATEURS
// ===========================
export const useFondateursData = (typeValidation, refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchFondateurs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(apiUrls.souscriptions.getFondateursAttente(typeValidation.typeValidation));
            
            // Traitement des données de fondateurs
            let processedFondateurs = [];
            if (response.data && Array.isArray(response.data)) {
                processedFondateurs = response.data.map((fondateur, index) => {
                    // Nom complet
                    const nomComplet = `${fondateur.sous_attent_personn_nom} ${fondateur.sous_attent_personn_prenom}`;

                    // Statut avec couleur
                    const statutColor = fondateur.sous_attent_personn_statut === 'EN ATTENTE' ? '#f59e0b' : 
                                       fondateur.sous_attent_personn_statut === 'VALIDEE' ? '#10b981' : '#ef4444';

                    // Validation de l'email
                    const emailValide = isValidEmail(fondateur.sous_attent_personn_email);

                    // Contacts disponibles
                    const contactsDisponibles = [
                        fondateur.sous_attent_personn_contact,
                        fondateur.sous_attent_personn_contact2
                    ].filter(contact => contact && contact.trim() !== '').length;

                    return {
                        id: fondateur.sous_attent_personnid,
                        numeroOrdre: index + 1,

                        // Informations personnelles
                        nom: fondateur.sous_attent_personn_nom,
                        prenom: fondateur.sous_attent_personn_prenom,
                        nomComplet: nomComplet,
                        
                        // Contacts
                        contact1: formatPhone(fondateur.sous_attent_personn_contact),
                        contact2: formatPhone(fondateur.sous_attent_personn_contact2),
                        email: fondateur.sous_attent_personn_email,
                        email_valide: emailValide,
                        contacts_count: contactsDisponibles,

                        // Statut
                        statut: fondateur.sous_attent_personn_statut,
                        statut_color: statutColor,

                        // Fonction (toujours FONDATEUR)
                        fonction: fondateur.fonction?.fonctionlibelle || 'FONDATEUR',
                        fonction_code: fondateur.fonction?.fonctioncode || '03',
                        fonction_id: fondateur.fonction?.fonctionid || 3,

                        // Affichage optimisé
                        display_name: nomComplet,
                        display_contact: `📞 ${formatPhone(fondateur.sous_attent_personn_contact)}`,
                        display_email: `✉️ ${fondateur.sous_attent_personn_email}`,
                        display_contacts: `${contactsDisponibles} contact(s)`,
                        display_status: fondateur.sous_attent_personn_statut,

                        // Validation des données
                        has_complete_info: !!(fondateur.sous_attent_personn_nom && 
                                            fondateur.sous_attent_personn_prenom && 
                                            fondateur.sous_attent_personn_contact && 
                                            fondateur.sous_attent_personn_email),
                        
                        needs_validation: fondateur.sous_attent_personn_statut === 'EN ATTENTE',
                        can_validate: true, // Toujours validable pour les fondateurs

                        // Données brutes pour debug
                        raw_data: fondateur
                    };
                });
            }

            setData(processedFondateurs);
        } catch (err) {
            console.error('Erreur lors de la récupération des fondateurs:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des fondateurs',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, [typeValidation, apiUrls.souscriptions]);

    useEffect(() => {
        fetchFondateurs();
    }, [refreshTrigger, fetchFondateurs]);

    return {
        fondateurs: data,
        loading,
        error,
        refetch: fetchFondateurs
    };
};

// ===========================
// CONFIGURATION DU TABLEAU DES FONDATEURS
// ===========================
export const fondateursTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'numeroOrdre',
            flexGrow: 0.5,
            minWidth: 60,
            sortable: true
        },
        {
            title: 'Fondateur',
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
                        <FiUserCheck size={16} color="#8b5cf6" />
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
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                borderRadius: '3px',
                                fontSize: '10px'
                            }}>
                                {rowData.fonction}
                            </span>
                            <span style={{ 
                                padding: '1px 4px',
                                backgroundColor: rowData.has_complete_info ? '#dcfce7' : '#fee2e2',
                                color: rowData.has_complete_info ? '#16a34a' : '#dc2626',
                                borderRadius: '3px',
                                fontSize: '10px'
                            }}>
                                {rowData.has_complete_info ? 'Complet' : 'Incomplet'}
                            </span>
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Contact Principal',
            dataKey: 'contact1',
            flexGrow: 1.5,
            minWidth: 140,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '12px',
                        color: '#1e293b',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '500'
                    }}>
                        <FiPhone size={11} color="#10b981" />
                        <span>{rowData.contact1}</span>
                    </div>
                    {rowData.contact2 !== 'Non renseigné' && (
                        <div style={{ 
                            fontSize: '11px',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <FiPhone size={10} color="#6b7280" />
                            <span>{rowData.contact2}</span>
                        </div>
                    )}
                </div>
            ),
            sortable: false
        },
        {
            title: 'Email',
            dataKey: 'email',
            flexGrow: 2,
            minWidth: 180,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '12px',
                        color: '#1e293b',
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        <FiMail size={11} color="#3b82f6" />
                        <span style={{ fontWeight: '500' }}>{rowData.email}</span>
                    </div>
                    <div style={{ 
                        fontSize: '10px',
                        color: rowData.email_valide ? '#16a34a' : '#dc2626',
                        fontWeight: '500'
                    }}>
                        {rowData.email_valide ? '✓ Email valide' : '✗ Email invalide'}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'statut',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        padding: '4px 8px',
                        backgroundColor: rowData.statut === 'EN ATTENTE' ? '#fef3c7' : 
                                        rowData.statut === 'VALIDEE' ? '#dcfce7' : '#fee2e2',
                        color: rowData.statut_color,
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginBottom: '4px'
                    }}>
                        {rowData.statut}
                    </div>
                    <div style={{ 
                        fontSize: '10px',
                        color: '#64748b'
                    }}>
                        {rowData.display_contacts}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Validation',
            dataKey: 'validation',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        padding: '2px 6px',
                        backgroundColor: rowData.needs_validation ? '#fef3c7' : '#dcfce7',
                        color: rowData.needs_validation ? '#d97706' : '#16a34a',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500',
                        marginBottom: '2px'
                    }}>
                        {rowData.needs_validation ? 'À valider' : 'Traité'}
                    </div>
                    <div style={{
                        padding: '1px 4px',
                        backgroundColor: rowData.can_validate ? '#e0e7ff' : '#f3f4f6',
                        color: rowData.can_validate ? '#4f46e5' : '#6b7280',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: '500'
                    }}>
                        {rowData.can_validate ? 'Validable' : 'Bloqué'}
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
            field: 'statut',
            label: 'Statut',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'has_complete_info',
            label: 'Informations complètes',
            type: 'select',
            options: [
                { label: 'Oui', value: true },
                { label: 'Non', value: false }
            ],
            tagColor: 'green'
        },
        {
            field: 'email_valide',
            label: 'Email valide',
            type: 'select',
            options: [
                { label: 'Oui', value: true },
                { label: 'Non', value: false }
            ],
            tagColor: 'blue'
        },
        {
            field: 'contacts_count',
            label: 'Nombre de contacts',
            type: 'select',
            options: [
                { label: '1 contact', value: 1 },
                { label: '2 contacts', value: 2 }
            ],
            tagColor: 'purple'
        }
    ],
    searchableFields: [
        'nomComplet',
        'nom',
        'prenom',
        'email',
        'contact1',
        'contact2'
    ],
    actions: [
        // {
        //     type: 'validate',
        //     icon: <FiCheck size={17} />,
        //     tooltip: 'Valider le fondateur',
        //     color: '#22c55e'
        // },
        // {
        //     type: 'reject',
        //     icon: <FiX size={17} />,
        //     tooltip: 'Refuser le fondateur',
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
        {
            type: 'download',
            icon: <FiDownload size={17} />,
            tooltip: 'Télécharger les informations',
            color: '#9b59b6'
        }
    ],
    defaultSortField: 'numeroOrdre',
    defaultSortOrder: 'asc',
    pageSize: 15,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};