/**
 * Service pour la gestion des Inscriptions à Valider
 * VERSION COMPLÈTE avec DataTable optimisé
 * MISE À JOUR: Formatage basé sur le modèle de données réel de l'API
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiUser, FiUsers, FiPhone, FiMail, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const DEFAULT_ECOLE_ID = 38;
const DEFAULT_ANNEE_ID = 226;
const DEFAULT_TYPE_INSCRIPTION = 'INSCRIPTION';

// ===========================
// FONCTION UTILITAIRE POUR FORMATAGE DES DATES
// ===========================
/**
 * Formate une date ISO en format français JJ/MM/AAAA
 * @param {string} dateString
 * @returns {string}
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

// ===========================
// FONCTION UTILITAIRE POUR FORMATAGE DU TÉLÉPHONE
// ===========================
/**
 * Formate un numéro de téléphone
 * @param {string} phone
 * @returns {string}
 */
const formatPhone = (phone) => {
    if (!phone) return 'Non renseigné';
    // Supprimer tous les caractères non numériques
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }
    return phone;
};

// ===========================
// HOOK POUR RÉCUPÉRER LES INSCRIPTIONS À VALIDER
// ===========================
/**
 * Récupère la liste des inscriptions à valider
 * @param {number} ecoleId
 * @param {number} anneeId
 * @param {string} typeInscription
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useInscriptionsAValiderData = (
    ecoleId = DEFAULT_ECOLE_ID, 
    anneeId = DEFAULT_ANNEE_ID, 
    typeInscription = DEFAULT_TYPE_INSCRIPTION,
    refreshTrigger = 0
) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchInscriptions = useCallback(async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `inscriptions-a-valider-${ecoleId}-${anneeId}-${typeInscription}`;
            
            // Vérifier le cache
            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            // Appel direct à l'API
            const response = await axios.get(apiUrls.inscriptions.getAllInscriptions(ecoleId, anneeId, typeInscription));
            
            // Traitement des données d'inscriptions selon la vraie structure
            let processedInscriptions = [];
            if (response.data && Array.isArray(response.data)) {
                processedInscriptions = response.data.map((inscription, index) => {
                    // Formatage du genre
                    const genre = inscription.sexeEleve || 'Non spécifié';
                    const genre_display = genre === 'MASCULIN' ? 'Masculin' : genre === 'FEMININ' ? 'Féminin' : 'Non spécifié';
                    const genre_short = genre === 'MASCULIN' ? 'M' : genre === 'FEMININ' ? 'F' : '?';

                    // Formatage du statut d'inscription
                    const statutInscription = inscription.inscriptions_status || 'INCONNU';
                    const statutDisplay = statutInscription === 'VALIDEE' ? 'Validée' : 
                                         statutInscription === 'EN_ATTENTE' ? 'En attente' : 
                                         statutInscription === 'REFUSEE' ? 'Refusée' : 
                                         statutInscription === 'EN_COURS' ? 'En cours' : statutInscription;

                    // Déterminer la priorité de traitement
                    const priorite = inscription.inscriptions_processus === 'EN_COURS' && inscription.inscriptions_status !== 'VALIDEE' ? 'HAUTE' : 'NORMALE';

                    // Calculer le temps d'attente (simulation)
                    const joursAttente = Math.floor(Math.random() * 30) + 1;

                    return {
                        id: inscription.idEleveInscrit || `inscription-${index}`,
                        eleve_id: inscription.inscriptionsidEleve || `inscr-${index}`,
                        matricule: inscription.matriculeEleve || `MAT${String(index + 1).padStart(4, '0')}`,
                        nom: inscription.nomEleve || 'Nom inconnu',
                        prenom: inscription.prenomEleve || 'Prénom inconnu',
                        nomComplet: `${inscription.nomEleve || 'Nom'} ${inscription.prenomEleve || 'Prénom'}`,
                        
                        // Informations personnelles
                        genre: genre,
                        genre_display: genre_display,
                        genre_short: genre_short,
                        dateNaissance: inscription.date_naissanceEleve || '',
                        dateNaissance_display: formatDate(inscription.date_naissanceEleve),
                        lieuNaissance: inscription.lieu_naissance || 'Non renseigné',
                        nationalite: inscription.nationalite || 'Non renseignée',
                        
                        // Photo
                        urlPhoto: inscription.cheminphoto || '',
                        hasPhoto: !!(inscription.cheminphoto),
                        
                        // Informations de classe/branche
                        classe: inscription.brancheLibelle || 'Classe inconnue',
                        branche_id: inscription.brancheid || null,
                        
                        // Informations d'inscription - FOCUS PRINCIPAL
                        inscription_id: inscription.idEleveInscrit || null,
                        inscription_statut: statutInscription,
                        inscription_statut_display: statutDisplay,
                        inscription_type: inscription.inscriptions_type || 'INSCRIPTION',
                        inscription_processus: inscription.inscriptions_processus || 'EN_COURS',
                        inscription_statut_eleve: inscription.inscriptions_statut_eleve || 'NON_AFFECTE',
                        
                        // Spécifique à la validation
                        priorite: priorite,
                        priorite_display: priorite === 'HAUTE' ? 'Haute' : 'Normale',
                        jours_attente: joursAttente,
                        jours_attente_display: `${joursAttente} jour(s)`,
                        
                        // Informations académiques
                        redoublant: inscription.inscriptions_redoublant || 'NON',
                        redoublant_display: inscription.inscriptions_redoublant === 'OUI' ? 'Redoublant' : 'Non redoublant',
                        boursier: inscription.inscriptions_boursier || '',
                        boursier_display: inscription.inscriptions_boursier ? 'Boursier' : 'Non boursier',
                        langue_vivante: inscription.inscriptions_langue_vivante || '',
                        
                        // Régime
                        demi_pension: inscription.demi_pension || false,
                        demi_pension_display: inscription.demi_pension ? 'Demi-pensionnaire' : 'Externe',
                        internes: inscription.internes || false,
                        externes: inscription.externes || true,
                        
                        // Origine et statuts
                        ecole_origine: inscription.ecole_origine || 'Non renseignée',
                        ivoirien: inscription.ivoirien || false,
                        etranger_africain: inscription.etranger_africain || false,
                        etranger_non_africain: inscription.etranger_non_africain || false,
                        
                        // Handicap
                        autre_handicap: inscription.autre_handicap || 'NON',
                        handicap_display: inscription.autre_handicap === 'OUI' ? 'Oui' : 'Non',
                        
                        // Prise en charge
                        prise_en_charge: inscription.prise_en_charge || false,
                        prise_en_charge_display: inscription.prise_en_charge ? 'Oui' : 'Non',
                        origine_prise_en_charge: inscription.origine_prise_en_charge || '',
                        nom_prenom_pers_en_charge: inscription.nom_prenom_pers_en_charge || '',
                        profession_pers_en_charge: inscription.profession_pers_en_charge || '',
                        tel_pers_en_charge: formatPhone(inscription.tel1_pers_en_charge),
                        
                        // Informations des parents
                        nom_prenoms_pere: inscription.nom_prenoms_pere || 'Non renseigné',
                        profession_pere: inscription.profession_pere || 'Non renseignée',
                        tel_pere: formatPhone(inscription.tel1_pere),
                        nom_prenoms_mere: inscription.nom_prenoms_mere || 'Non renseigné',
                        profession_mere: inscription.profession_mere || 'Non renseignée',
                        tel_mere: formatPhone(inscription.tel1_mere),
                        
                        // Contact principal (priorité : père, mère, personne en charge)
                        contact_principal: inscription.tel1_pere || inscription.tel1_mere || inscription.tel1_pers_en_charge || 'Non renseigné',
                        contact_principal_format: formatPhone(inscription.tel1_pere || inscription.tel1_mere || inscription.tel1_pers_en_charge),
                        
                        // Numéro d'ordre
                        numeroOrdre: index + 1,
                        
                        // Affichage optimisé pour validation
                        display_name: `${inscription.nomEleve || 'Nom'} ${inscription.prenomEleve || 'Prénom'}`,
                        display_details: `${inscription.matriculeEleve || 'MAT'} • ${genre_short} • ${formatDate(inscription.date_naissanceEleve)}`,
                        display_status: `${statutDisplay} • ${inscription.inscriptions_processus || 'EN_COURS'}`,
                        display_validation: `${statutDisplay} • ${joursAttente}j d'attente`,
                        display_parents: `👨 ${inscription.nom_prenoms_pere || 'N/A'} • 👩 ${inscription.nom_prenoms_mere || 'N/A'}`,
                        
                        // Indicateurs de validation
                        needs_validation: statutInscription !== 'VALIDEE' && statutInscription !== 'REFUSEE',
                        can_validate: inscription.inscriptions_processus === 'EN_COURS',
                        is_complete: !!(inscription.nomEleve && inscription.prenomEleve && inscription.date_naissanceEleve),
                        
                        // Données brutes pour debug
                        raw_data: inscription
                    };
                });
            }

            setToCache(cacheKey, processedInscriptions);
            setData(processedInscriptions);
        } catch (err) {
            console.error('Erreur lors de la récupération des inscriptions à valider:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des inscriptions à valider',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data,
                url: err.config?.url
            });
        } finally {
            setLoading(false);
        }
    }, [ecoleId, anneeId, typeInscription]);

    useEffect(() => {
        fetchInscriptions(false);
    }, [ecoleId, anneeId, typeInscription, refreshTrigger, fetchInscriptions]);

    return {
        inscriptions: data,
        loading,
        error,
        refetch: () => fetchInscriptions(true)
    };
};

// ===========================
// CONFIGURATION DU TABLEAU DES INSCRIPTIONS À VALIDER
// ===========================
export const inscriptionsAValiderTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'numeroOrdre',
            flexGrow: 0.5,
            minWidth: 60,
            // cellType: 'custom',
            // customRenderer: (rowData) => (
            //     <div style={{
            //         padding: '6px 8px',
            //         backgroundColor: rowData.priorite === 'HAUTE' ? '#ef4444' : '#667eea',
            //         color: 'white',
            //         borderRadius: '8px',
            //         fontSize: '12px',
            //         fontWeight: 'bold',
            //         textAlign: 'center',
            //         minWidth: '35px',
            //     }}>
            //         {rowData.numeroOrdre}
            //     </div>
            // ),
            sortable: true
        },
        
        {
            title: 'Matricule',
            dataKey: 'matricule',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#1e293b',
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px'
                }}>
                    {rowData.matricule}
                </div>
            ),
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
                    {/* Photo du candidat si disponible */}
                    {rowData.hasPhoto && (
                        <img 
                            src={rowData.urlPhoto} 
                            alt={rowData.nomComplet}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #e2e8f0',
                                flexShrink: 0
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    {!rowData.hasPhoto && (
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
                    )}
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
                            <span>📍 {rowData.lieuNaissance}</span>
                            <span>🎂 {rowData.dateNaissance_display}</span>
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Classe Demandée',
            dataKey: 'classe',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontWeight: '600', 
                        color: '#1e293b',
                        fontSize: '13px',
                        marginBottom: '2px'
                    }}>
                        {rowData.classe}
                    </div>
                    {rowData.langue_vivante && (
                        <div style={{ 
                            fontSize: '10px', 
                            color: '#64748b',
                            padding: '1px 4px',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '3px',
                            display: 'inline-block'
                        }}>
                            LV: {rowData.langue_vivante}
                        </div>
                    )}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Statut & Processus',
            dataKey: 'inscription_statut_display',
            flexGrow: 1.5,
            minWidth: 140,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{
                        padding: '3px 6px',
                        backgroundColor: rowData.inscription_statut === 'VALIDEE' ? '#dcfce7' : 
                                        rowData.inscription_statut === 'EN_ATTENTE' ? '#fef3c7' : 
                                        rowData.inscription_statut === 'EN_COURS' ? '#dbeafe' : '#fee2e2',
                        color: rowData.inscription_statut === 'VALIDEE' ? '#16a34a' : 
                               rowData.inscription_statut === 'EN_ATTENTE' ? '#d97706' : 
                               rowData.inscription_statut === 'EN_COURS' ? '#2563eb' : '#dc2626',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500',
                        marginBottom: '4px',
                        display: 'inline-block'
                    }}>
                        {rowData.inscription_statut_display}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '1px 4px',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            borderRadius: '3px',
                            fontSize: '9px'
                        }}>
                            {rowData.inscription_processus}
                        </span>
                        
                        <span style={{
                            padding: '1px 4px',
                            backgroundColor: '#fef3c7',
                            color: '#d97706',
                            borderRadius: '3px',
                            fontSize: '9px'
                        }}>
                            {rowData.jours_attente_display}
                        </span>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Priorité',
            dataKey: 'priorite_display',
            flexGrow: 1.2,
            minWidth: 80,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '4px 8px',
                    backgroundColor: rowData.priorite === 'HAUTE' ? '#fef2f2' : '#f0f9ff',
                    color: rowData.priorite === 'HAUTE' ? '#dc2626' : '#2563eb',
                    border: `1px solid ${rowData.priorite === 'HAUTE' ? '#fecaca' : '#bfdbfe'}`,
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textAlign: 'center'
                }}>
                    {rowData.priorite_display}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Contact Parents',
            dataKey: 'contact_principal',
            flexGrow: 1.8,
            minWidth: 160,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    {/* Contact principal */}
                    <div style={{ 
                        fontSize: '12px',
                        color: '#1e293b',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <FiPhone size={11} color="#10b981" />
                        <span style={{ fontWeight: '500' }}>{rowData.contact_principal_format}</span>
                    </div>
                    
                    {/* Informations parents condensées */}
                    <div style={{ fontSize: '10px', color: '#64748b' }} className='d-flex gap-2'>
                        {rowData.tel_pere !== 'Non renseigné' && (
                            <div> {rowData.tel_pere}</div>
                        )}
                        {rowData.tel_mere !== 'Non renseigné' && (
                            <div> - {rowData.tel_mere}</div>
                        )}
                    </div>
                </div>
            ),
            sortable: false
        },
        {
            title: 'Informations',
            dataKey: 'ecole_origine',
            flexGrow: 1.5,
            minWidth: 140,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#1e293b',
                        marginBottom: '2px'
                    }}>
                        {rowData.ecole_origine}
                    </div>
                    <div style={{ 
                        fontSize: '10px',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap'
                    }}>
                        <span>🏳️ {rowData.nationalite}</span>
                        {rowData.redoublant === 'OUI' && (
                            <span style={{
                                padding: '1px 3px',
                                backgroundColor: '#fef3c7',
                                color: '#d97706',
                                borderRadius: '2px',
                                fontSize: '9px'
                            }}>
                                Redoublant
                            </span>
                        )}
                        {rowData.prise_en_charge && (
                            <span style={{
                                padding: '1px 3px',
                                backgroundColor: '#e0e7ff',
                                color: '#4f46e5',
                                borderRadius: '2px',
                                fontSize: '9px'
                            }}>
                                PEC
                            </span>
                        )}
                    </div>
                </div>
            ),
            sortable: true
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
            field: 'inscription_statut_display',
            label: 'Statut inscription',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'priorite_display',
            label: 'Priorité',
            type: 'select',
            dynamic: true,
            tagColor: 'red'
        },
        {
            field: 'inscription_processus',
            label: 'Processus',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'classe',
            label: 'Classe demandée',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'genre_display',
            label: 'Genre',
            type: 'select',
            dynamic: true,
            tagColor: 'cyan'
        },
        {
            field: 'redoublant_display',
            label: 'Redoublement',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'nationalite',
            label: 'Nationalité',
            type: 'select',
            dynamic: true,
            tagColor: 'violet'
        },
        {
            field: 'ecole_origine',
            label: 'École d\'origine',
            type: 'select',
            dynamic: true,
            tagColor: 'pink'
        }
    ],
    searchableFields: [
        'matricule',
        'nomComplet',
        'nom',
        'prenom',
        'classe',
        'lieuNaissance',
        'nationalite',
        'ecole_origine',
        'nom_prenoms_pere',
        'nom_prenoms_mere',
        'tel_pere',
        'tel_mere',
        'contact_principal'
    ],
    actions: [
        // {
        //     type: 'validate',
        //     icon: <FiCheck size={17}  />,
        //     tooltip: 'Valider l\'inscription',
        //     color: '#22c55e'
        // },
        // {
        //     type: 'reject',
        //     icon: <FiX size={17}  />,
        //     tooltip: 'Refuser l\'inscription',
        //     color: '#ef4444'
        // },
        {
            type: 'view',
            icon: <FiEye size={17}  />,
            tooltip: 'Voir le dossier complet',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit size={17} />,
            tooltip: 'Modifier les informations',
            color: '#f39c12'
        },
        // {
        //     type: 'download',
        //     icon: <FiDownload size={17}  />,
        //     tooltip: 'Télécharger le dossier',
        //     color: '#9b59b6'
        // }
    ],
    // Configuration supplémentaire pour le tableau
    defaultSortField: 'priorite',
    defaultSortOrder: 'desc',
    pageSize: 15,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};