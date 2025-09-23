/**
 * Service pour la gestion des PV Évaluations
 * VERSION COMPLÈTE avec filtres classe/matière/période et DataTable
 * MISE À JOUR: Formatage basé sur le modèle de données réel de l'API + Téléchargement PV
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiCalendar, FiBookOpen, FiClock, FiUser, FiUsers, FiFileText } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const DEFAULT_ECOLE_ID = 38;
const DEFAULT_PERIODICITE_ID = 2;
const DEFAULT_ANNEE_ID = 226;

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
// FONCTION UTILITAIRE POUR FORMATAGE DE LA DURÉE
// ===========================
/**
 * Formate une durée de type "02-00" en "2h00"
 * @param {string} duration
 * @returns {string}
 */
const formatDuration = (duration) => {
    if (!duration) return '2h00';
    if (typeof duration === 'string' && duration.includes('-')) {
        const [hours, minutes] = duration.split('-');
        return `${hours}h${minutes}`;
    }
    if (typeof duration === 'string' && duration.includes('h')) {
        return duration;
    }
    return duration || '2h00';
};

// ===========================
// FONCTION UTILITAIRE POUR DÉTERMINER LE STATUT D'UNE ÉVALUATION
// ===========================
/**
 * Détermine le statut d'une évaluation selon la date et l'état
 * @param {object} evaluation
 * @returns {string}
 */
const determineStatut = (evaluation) => {
    if (evaluation.etat && evaluation.etat.trim() !== '') {
        return evaluation.etat;
    }
    const now = new Date();
    const evalDate = new Date(evaluation.date);
    if (evalDate > now) {
        return 'Programmée';
    } else if (evalDate.toDateString() === now.toDateString()) {
        return 'En cours';
    } else {
        return 'Terminée';
    }
};

// ===========================
// FONCTION POUR TÉLÉCHARGER LE PV
// ===========================
/**
 * Télécharge le PV d'une évaluation
 * @param {string|number} classeId - ID de la classe sélectionnée
 * @param {string|number} evaluationId - ID de l'évaluation/item
 * @returns {Promise<boolean>}
 */
export const downloadPvEvaluation = async (classeId, evaluationId) => {
    try {
        console.log('🔽 Téléchargement du PV pour classe:', classeId, 'évaluation:', evaluationId);
        
        // Construction de l'URL de l'API avec le bon format
        const apiUrls = useAllApiUrls();
        const downloadUrl = apiUrls.evaluations.imprimerProcesVerbal(classeId, evaluationId);

        console.log('📥 URL de téléchargement:', downloadUrl);

        // Lancer simplement l'API - elle va télécharger automatiquement
        window.open(downloadUrl, '_blank');
        
        console.log('✅ Téléchargement initié avec succès');
        return true;

    } catch (error) {
        console.error('❌ Erreur lors du téléchargement du PV:', error);
        throw new Error(error.message || 'Erreur lors du téléchargement');
    }
};

// ===========================
// HOOK POUR RÉCUPÉRER LES ÉVALUATIONS D'UNE CLASSE/MATIÈRE/PÉRIODE
// ===========================
/**
 * Récupère la liste des évaluations selon la classe, la matière, la période et l'année
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const usePvEvaluationsData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const apiUrls = useAllApiUrls();

    const searchEvaluations = useCallback(async (classeId, matiereId, periodeId, anneeId = DEFAULT_ANNEE_ID) => {
        if (!classeId) {
            setError({
                message: 'Veuillez sélectionner une classe',
                type: 'ValidationError',
                code: 'MISSING_CLASSE'
            });
            return;
        }

        if (!matiereId) {
            setError({
                message: 'Veuillez sélectionner une matière',
                type: 'ValidationError',
                code: 'MISSING_MATIERE'
            });
            return;
        }

        if (!periodeId) {
            setError({
                message: 'Veuillez sélectionner une période',
                type: 'ValidationError',
                code: 'MISSING_PERIODE'
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearchPerformed(false);
            
            // Construction des paramètres de query
            const params = new URLSearchParams();
            params.append('classeId', classeId);
            params.append('matiereId', matiereId);
            params.append('periodeId', periodeId);
            params.append('annee', anneeId);

            const cacheKey = `pv-evaluations-${classeId}-${matiereId}-${periodeId}-${anneeId}`;
            
            // Vérifier le cache
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setData(cachedData);
                setSearchPerformed(true);
                setLoading(false);
                return;
            }

            // Appel direct à l'API
            const response = await axios.get(apiUrls.evaluations.getClasseMatierePeriodie({ classe: classeId, matiere: matiereId, periode: periodeId, annee: anneeId }));
            
            // Traitement des évaluations selon la vraie structure
            let processedEvaluations = [];
            if (response.data && Array.isArray(response.data)) {
                processedEvaluations = response.data.map((evaluation, index) => {
                    const statut = determineStatut(evaluation);
                    
                    return {
                        id: evaluation.id || `eval-${index}`,
                        code: evaluation.code || `eval-${index}`,
                        uuid: evaluation.uuid || evaluation.code || null, // Ajout du champ UUID pour le téléchargement
                        numero: evaluation.numero || `${index + 1}`,
                        date: evaluation.date || evaluation.dateCreation || new Date().toISOString(),
                        date_display: evaluation.dateToFilter || formatDate(evaluation.date || evaluation.dateCreation),
                        dateToFilter: evaluation.dateToFilter || formatDate(evaluation.date),
                        type: evaluation.type?.libelle || 'Devoir',
                        type_id: evaluation.type?.id || 1,
                        type_seance: evaluation.type?.typeSeance || 'EVAL',
                        duree: formatDuration(evaluation.duree),
                        duree_raw: evaluation.duree || '02-00',
                        noteSur: evaluation.noteSur || '20',
                        note_sur_display: `/${evaluation.noteSur || '20'}`,
                        
                        // Informations matière
                        matiere: evaluation.matiereEcole?.libelle || 'Matière inconnue',
                        matiere_id: evaluation.matiereEcole?.id || matiereId,
                        matiere_code: evaluation.matiereEcole?.code || '',
                        matiere_categorie: evaluation.matiereEcole?.categorie?.libelle || '',
                        matiere_numOrdre: evaluation.matiereEcole?.numOrdre || 0,
                        matiere_pec: evaluation.matiereEcole?.pec || 0,
                        matiere_bonus: evaluation.matiereEcole?.bonus || 0,
                        
                        // Informations période
                        periode: evaluation.periode?.libelle || 'Période inconnue',
                        periode_id: evaluation.periode?.id || periodeId,
                        periode_coef: parseFloat(evaluation.periode?.coef || '1.0'),
                        periode_niveau: evaluation.periode?.niveau || 1,
                        periode_isfinal: evaluation.periode?.isfinal || '',
                        
                        // Informations classe
                        classe: evaluation.classe?.libelle || 'Classe inconnue',
                        classe_id: evaluation.classe?.id || classeId,
                        classe_code: evaluation.classe?.code || '',
                        classe_effectif: evaluation.classe?.effectif || 0,
                        
                        // Informations école
                        ecole: evaluation.classe?.ecole?.libelle || 'École inconnue',
                        ecole_id: evaluation.classe?.ecole?.id || DEFAULT_ECOLE_ID,
                        ecole_code: evaluation.classe?.ecole?.code || '',
                        ecole_tel: evaluation.classe?.ecole?.tel || '',
                        ecole_signataire: evaluation.classe?.ecole?.nomSignataire || '',
                        
                        // Informations de branche
                        serie: evaluation.classe?.branche?.serie?.libelle || '',
                        filiere: evaluation.classe?.branche?.filiere?.libelle || '',
                        niveau: evaluation.classe?.branche?.niveau?.libelle || '',
                        
                        // Informations année
                        annee: evaluation.annee?.libelle || 'Année inconnue',
                        annee_id: evaluation.annee?.id || anneeId,
                        annee_debut: evaluation.annee?.anneeDebut || 2024,
                        annee_statut: evaluation.annee?.statut || 'DIFFUSE',
                        
                        // Statut et état
                        statut: statut,
                        statut_display: statut,
                        etat_original: evaluation.etat || '',
                        
                        // Informations supplémentaires
                        heure: evaluation.heure || '',
                        dateLimite: evaluation.dateLimite || '',
                        user: evaluation.user || '',
                        dateCreation: evaluation.dateCreation || new Date().toISOString(),
                        dateUpdate: evaluation.dateUpdate || '',
                        pec: evaluation.pec || 0,
                        coefficient: parseFloat(evaluation.periode?.coef || '1.0'),
                        nombreEleves: evaluation.classe?.effectif || 0,
                        
                        // Affichage optimisé
                        evaluation_display: `${evaluation.type?.libelle || 'Devoir'} N°${evaluation.numero || (index + 1)}`,
                        description_complete: `${evaluation.type?.libelle || 'Devoir'} de ${evaluation.matiereEcole?.libelle || 'Matière'} - ${evaluation.periode?.libelle || 'Période'}`,
                        details_display: `${formatDuration(evaluation.duree)} • /${evaluation.noteSur || '20'} • ${evaluation.classe?.effectif || 0} élèves`,
                        
                        // Données brutes pour debug
                        raw_data: evaluation
                    };
                });
            }

            setToCache(cacheKey, processedEvaluations);
            setData(processedEvaluations);
            setSearchPerformed(true);
        } catch (err) {
            console.error('Erreur lors de la récupération des évaluations PV:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la recherche des évaluations',
                type: err.name || 'SearchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data,
                url: err.config?.url
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setData([]);
        setError(null);
        setSearchPerformed(false);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            // Possibilité de rafraîchir si besoin
        }
    }, [refreshTrigger]);

    return {
        evaluations: data,
        loading,
        error,
        searchPerformed,
        searchEvaluations,
        clearResults
    };
};

// ===========================
// CONFIGURATION DU TABLEAU DES PV ÉVALUATIONS
// ===========================
export const pvEvaluationsTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'numero',
            flexGrow: 1,
            minWidth: 70,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '6px 8px',
                    // backgroundColor: '#667eea',
                    // color: 'white',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minWidth: '45px'
                }}>
                    {rowData.numero}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Date',
            dataKey: 'date_display',
            flexGrow: 1,
            minWidth: 110,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCalendar size={14} color="#667eea" />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>
                        {rowData.date_display}
                    </span>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Type & Détails',
            dataKey: 'evaluation_display',
            flexGrow: 2.5,
            minWidth: 200,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontWeight: '600', 
                        color: '#1e293b',
                        fontSize: '14px',
                        marginBottom: '2px'
                    }}>
                        {rowData.evaluation_display}
                    </div>
                    <div style={{ 
                        fontSize: '11px', 
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>🕒 {rowData.duree}</span>
                        <span>📊 {rowData.note_sur_display}</span>
                        <span>👥 {rowData.nombreEleves} élèves</span>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Matière',
            dataKey: 'matiere',
            flexGrow: 1.5,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        marginBottom: '2px'
                    }}>
                        <FiBookOpen size={12} color="#10b981" />
                        <span style={{ 
                            fontSize: '13px', 
                            color: '#059669',
                            fontWeight: '500'
                        }}>
                            {rowData.matiere}
                        </span>
                    </div>
                    {rowData.matiere_categorie && (
                        <div style={{ 
                            fontSize: '11px', 
                            color: '#64748b'
                        }}>
                            {rowData.matiere_categorie}
                        </div>
                    )}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Période',
            dataKey: 'periode',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <Badge color="blue" style={{ fontSize: '12px', marginBottom: '4px' }}>
                        {rowData.periode}
                    </Badge>
                    <div style={{ 
                        fontSize: '11px', 
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span>Coef: {rowData.coefficient}</span>
                        {rowData.periode_isfinal && (
                            <span style={{
                                padding: '1px 4px',
                                backgroundColor: '#fef3c7',
                                color: '#d97706',
                                borderRadius: '3px',
                                fontSize: '10px'
                            }}>
                                Final
                            </span>
                        )}
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
                    <div style={{ 
                        fontSize: '11px', 
                        color: '#64748b'
                    }}>
                        {rowData.serie} {rowData.filiere}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'statut_display',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const colorMap = {
                    'Programmée': { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
                    'En cours': { bg: '#dbeafe', text: '#2563eb', border: '#3b82f6' },
                    'Terminée': { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' },
                    'Annulée': { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' }
                };
                
                const colors = colorMap[rowData.statut_display] || colorMap['Programmée'];
                
                return (
                    <div style={{
                        padding: '4px 8px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}>
                        {rowData.statut_display}
                    </div>
                );
            },
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 0.7,
            minWidth: 120,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'type',
            label: 'Type d\'évaluation',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'statut_display',
            label: 'Statut',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'matiere_categorie',
            label: 'Catégorie matière',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'date_display',
            label: 'Date',
            type: 'date',
            tagColor: 'cyan'
        }
    ],
    searchableFields: [
        'numero',
        'evaluation_display',
        'type',
        'matiere',
        'periode',
        'classe',
        'description_complete'
    ],
    actions: [
        // {
        //     type: 'view',
        //     icon: <FiEye />,
        //     tooltip: 'Voir les détails du PV',
        //     color: '#3498db'
        // },
        // {
        //     type: 'edit',
        //     icon: <FiEdit />,
        //     tooltip: 'Modifier l\'évaluation',
        //     color: '#f39c12'
        // },
        {
            type: 'download',
            icon: <FiDownload size={17} />,
            tooltip: 'Télécharger le PV',
            color: '#9b59b6'
        },
        // {
        //     type: 'pv',
        //     icon: <FiFileText />,
        //     tooltip: 'Générer le PV complet',
        //     color: '#2ecc71'
        // },
        // {
        //     type: 'delete',
        //     icon: <FiTrash2 />,
        //     tooltip: 'Supprimer l\'évaluation',
        //     color: '#e74c3c'
        // }
    ],
    // Configuration supplémentaire pour le tableau
    defaultSortField: 'date_display',
    defaultSortOrder: 'desc',
    pageSize: 10,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};