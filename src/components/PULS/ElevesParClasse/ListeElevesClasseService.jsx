/**
 * Service pour la gestion de la Liste des Élèves par classe
 * VERSION COMPLÈTE avec DataTable optimisé
 * MISE À JOUR: Formatage basé sur le modèle de données réel de l'API
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiUser, FiUsers, FiPhone, FiMail, FiHome } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';
import { usePulsParams } from "../../hooks/useDynamicParams";

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
// HOOK POUR RÉCUPÉRER LA LISTE DES ÉLÈVES PAR CLASSE
// ===========================
/**
 * Récupère la liste complète des élèves par classe
 * @param {number} ecoleId
 * @param {number} anneeId
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useListeElevesClasseData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const {
        ecoleId: dynamicEcoleId,
        academicYearId: dynamicAcademicYearId
    } = usePulsParams();

    const fetchEleves = useCallback(async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
          

            // Appel direct à l'API
            const response = await axios.get(apiUrls.inscriptions.listEleveClasse());

            // Traitement des données d'élèves selon la vraie structure
            let processedEleves = [];
            if (response.data && Array.isArray(response.data)) {
                processedEleves = response.data.map((eleve, index) => {
                    // Formatage du genre
                    const genre = eleve.sexeEleve || 'Non spécifié';
                    const genre_display = genre === 'MASCULIN' ? 'Masculin' : genre === 'FEMININ' ? 'Féminin' : 'Non spécifié';
                    const genre_short = genre === 'MASCULIN' ? 'M' : genre === 'FEMININ' ? 'F' : '?';

                    // Formatage du statut d'inscription
                    const statutInscription = eleve.inscriptions_status || 'INCONNU';
                    const statutDisplay = statutInscription === 'VALIDEE' ? 'Validée' :
                        statutInscription === 'EN_ATTENTE' ? 'En attente' :
                            statutInscription === 'REFUSEE' ? 'Refusée' : statutInscription;

                    return {
                        id: eleve.idEleveInscrit || `eleve-${index}`,
                        eleve_id: eleve.inscriptionsidEleve || `inscr-${index}`,
                        matricule: eleve.matriculeEleve || `MAT${String(index + 1).padStart(4, '0')}`,
                        nom: eleve.nomEleve || 'Nom inconnu',
                        prenom: eleve.prenomEleve || 'Prénom inconnu',
                        nomComplet: `${eleve.nomEleve || 'Nom'} ${eleve.prenomEleve || 'Prénom'}`,

                        // Informations personnelles
                        genre: genre,
                        genre_display: genre_display,
                        genre_short: genre_short,
                        dateNaissance: eleve.date_naissanceEleve || '',
                        dateNaissance_display: formatDate(eleve.date_naissanceEleve),
                        lieuNaissance: eleve.lieu_naissance || 'Non renseigné',
                        nationalite: eleve.nationalite || 'Non renseignée',

                        // Photo
                        urlPhoto: eleve.cheminphoto || '',
                        hasPhoto: !!(eleve.cheminphoto),

                        // Informations de classe/branche
                        classe: eleve.brancheLibelle || 'Classe inconnue',
                        branche_id: eleve.brancheid || null,

                        // Informations d'inscription
                        inscription_id: eleve.idEleveInscrit || null,
                        inscription_statut: statutInscription,
                        inscription_statut_display: statutDisplay,
                        inscription_type: eleve.inscriptions_type || 'INSCRIPTION',
                        inscription_processus: eleve.inscriptions_processus || 'EN_COURS',
                        redoublant: eleve.inscriptions_redoublant || 'NON',
                        redoublant_display: eleve.inscriptions_redoublant === 'OUI' ? 'Redoublant' : 'Non redoublant',
                        boursier: eleve.inscriptions_boursier || '',
                        boursier_display: eleve.inscriptions_boursier ? 'Boursier' : 'Non boursier',
                        langue_vivante: eleve.inscriptions_langue_vivante || '',

                        // Régime
                        demi_pension: eleve.demi_pension || false,
                        demi_pension_display: eleve.demi_pension ? 'Demi-pensionnaire' : 'Externe',
                        internes: eleve.internes || false,
                        externes: eleve.externes || true,

                        // Origine et statuts
                        ecole_origine: eleve.ecole_origine || 'Non renseignée',
                        ivoirien: eleve.ivoirien || false,
                        etranger_africain: eleve.etranger_africain || false,
                        etranger_non_africain: eleve.etranger_non_africain || false,

                        // Handicap
                        autre_handicap: eleve.autre_handicap || 'NON',
                        handicap_display: eleve.autre_handicap === 'OUI' ? 'Oui' : 'Non',

                        // Prise en charge
                        prise_en_charge: eleve.prise_en_charge || false,
                        prise_en_charge_display: eleve.prise_en_charge ? 'Oui' : 'Non',
                        origine_prise_en_charge: eleve.origine_prise_en_charge || '',
                        nom_prenom_pers_en_charge: eleve.nom_prenom_pers_en_charge || '',
                        profession_pers_en_charge: eleve.profession_pers_en_charge || '',
                        tel_pers_en_charge: formatPhone(eleve.tel1_pers_en_charge),

                        // Informations des parents
                        nom_prenoms_pere: eleve.nom_prenoms_pere || 'Non renseigné',
                        profession_pere: eleve.profession_pere || 'Non renseignée',
                        tel_pere: formatPhone(eleve.tel1_pere),
                        nom_prenoms_mere: eleve.nom_prenoms_mere || 'Non renseigné',
                        profession_mere: eleve.profession_mere || 'Non renseignée',
                        tel_mere: formatPhone(eleve.tel1_mere),

                        // Contact principal (priorité : père, mère, personne en charge)
                        contact_principal: eleve.tel1_pere || eleve.tel1_mere || eleve.tel1_pers_en_charge || 'Non renseigné',
                        contact_principal_format: formatPhone(eleve.tel1_pere || eleve.tel1_mere || eleve.tel1_pers_en_charge),

                        // Numéro d'ordre
                        numeroOrdre: index + 1,

                        // Affichage optimisé
                        display_name: `${eleve.nomEleve || 'Nom'} ${eleve.prenomEleve || 'Prénom'}`,
                        display_details: `${eleve.matriculeEleve || 'MAT'} • ${genre_short} • ${formatDate(eleve.date_naissanceEleve)}`,
                        display_status: `${statutDisplay} • ${eleve.brancheLibelle || 'Classe'}`,
                        display_parents: `👨 ${eleve.nom_prenoms_pere || 'N/A'} • 👩 ${eleve.nom_prenoms_mere || 'N/A'}`,

                        // Données brutes pour debug
                        raw_data: eleve
                    };
                });
            }

            setData(processedEleves);
        } catch (err) {
            console.error('Erreur lors de la récupération de la liste des élèves:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement de la liste des élèves',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data,
                url: err.config?.url
            });
        } finally {
            setLoading(false);
        }
    }, [apiUrls.inscriptions]);

    useEffect(() => {
        fetchEleves(false);
    }, [dynamicEcoleId, dynamicAcademicYearId, refreshTrigger, fetchEleves]);

    return {
        eleves: data,
        loading,
        error,
        refetch: () => fetchEleves(true)
    };
};

// ===========================
// CONFIGURATION DU TABLEAU DE LA LISTE DES ÉLÈVES
// ===========================
export const listeElevesClasseTableConfig = {
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
            //         backgroundColor: '#667eea',
            //         color: 'white',
            //         borderRadius: '8px',
            //         fontSize: '12px',
            //         fontWeight: 'bold',
            //         textAlign: 'center',
            //         minWidth: '35px'
            //     }}>
            //         {rowData.numeroOrdre}
            //     </div>
            // ),
            sortable: true
        },
        {
            title: 'Matricule',
            dataKey: 'matricule',
            flexGrow: 0.8,
            minWidth: 60,
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
            title: 'Élève',
            dataKey: 'nomComplet',
            flexGrow: 2.5,
            minWidth: 220,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Photo de l'élève si disponible */}
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
                            <span>🏳️ {rowData.nationalite}</span>
                            <span>🎂 {rowData.dateNaissance_display}</span>
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Classe',
            dataKey: 'classe',
            flexGrow: 1,
            minWidth: 100,
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
            title: 'Statut & Infos',
            dataKey: 'inscription_statut_display',
            flexGrow: 1,
            minWidth: 140,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{
                        padding: '3px 6px',
                        backgroundColor: rowData.inscription_statut === 'VALIDEE' ? '#dcfce7' :
                            rowData.inscription_statut === 'EN_ATTENTE' ? '#fef3c7' : '#fee2e2',
                        color: rowData.inscription_statut === 'VALIDEE' ? '#16a34a' :
                            rowData.inscription_statut === 'EN_ATTENTE' ? '#d97706' : '#dc2626',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500',
                        marginBottom: '4px',
                        display: 'inline-block'
                    }}>
                        {rowData.inscription_statut_display}
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {rowData.redoublant === 'OUI' && (
                            <span style={{
                                padding: '1px 4px',
                                backgroundColor: '#fef3c7',
                                color: '#d97706',
                                borderRadius: '3px',
                                fontSize: '9px'
                            }}>
                                Redoublant
                            </span>
                        )}
                        {rowData.boursier && (
                            <span style={{
                                padding: '1px 4px',
                                backgroundColor: '#d1fae5',
                                color: '#059669',
                                borderRadius: '3px',
                                fontSize: '9px'
                            }}>
                                Boursier
                            </span>
                        )}
                        <span style={{
                            padding: '1px 4px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            borderRadius: '3px',
                            fontSize: '9px'
                        }}>
                            {rowData.demi_pension_display}
                        </span>
                    </div>
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
                    <div style={{ fontSize: '10px', color: '#64748b' }} className='d-flex gap-3'>
                        {rowData.tel_pere !== 'Non renseigné' && (
                            <div> {rowData.tel_pere} </div>
                        )}
                        {rowData.tel_mere !== 'Non renseigné' && (
                            <div> {rowData.tel_mere} </div>
                        )}
                        {rowData.tel_pers_en_charge !== 'Non renseigné' && rowData.tel_pers_en_charge !== rowData.tel_pere && (
                            <div> {rowData.tel_pers_en_charge}</div>
                        )}
                    </div>
                </div>
            ),
            sortable: false
        },
        {
            title: 'Origine',
            dataKey: 'ecole_origine',
            flexGrow: 1.2,
            minWidth: 120,
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
                        gap: '6px'
                    }}>
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
            flexGrow: 0.8,
            minWidth: 100,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'genre_display',
            label: 'Genre',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'inscription_statut_display',
            label: 'Statut inscription',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'classe',
            label: 'Classe',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'redoublant_display',
            label: 'Redoublement',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'demi_pension_display',
            label: 'Régime',
            type: 'select',
            dynamic: true,
            tagColor: 'cyan'
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
        },
        {
            field: 'dateNaissance_display',
            label: 'Date de naissance',
            type: 'date',
            tagColor: 'indigo'
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
        {
            type: 'view',
            icon: <FiEye size={17} />,
            tooltip: 'Voir le profil complet de l\'élève',
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
        //     icon: <FiDownload size={17} />,
        //     tooltip: 'Télécharger la fiche élève',
        //     color: '#9b59b6'
        // },
        // {
        //     type: 'home',
        //     icon: <FiHome size={17} />,
        //     tooltip: 'Informations familiales',
        //     color: '#2ecc71'
        // },
        // {
        //     type: 'delete',
        //     icon: <FiTrash2 size={17} />,
        //     tooltip: 'Supprimer l\'inscription',
        //     color: '#e74c3c'
        // }
    ],
    // Configuration supplémentaire pour le tableau
    defaultSortField: 'numeroOrdre',
    defaultSortOrder: 'asc',
    pageSize: 20,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};