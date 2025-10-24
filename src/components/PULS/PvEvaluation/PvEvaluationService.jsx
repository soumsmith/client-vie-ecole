/**
 * Service pour la gestion des PV Évaluations
 * VERSION COMPLÈTE avec téléchargement corrigé
 */

import { useState, useEffect, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiCalendar, FiBookOpen, FiDownload, FiFileText } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';
import { useAppParams } from '../utils/apiConfig';
import getFullUrl from "../../hooks/urlUtils";


// ===========================
// FONCTIONS UTILITAIRES
// ===========================
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
// FONCTION DE TÉLÉCHARGEMENT DU PV
// ===========================
/**
 * Télécharge le PV d'une évaluation
 * @param {string|number} classeId - ID de la classe
 * @param {string} code - Code de l'évaluation
 * @returns {Promise<boolean>}
 */
export const downloadPvEvaluation = async (classeId, code) => {
    try {
        if (!classeId) {
            throw new Error('ID de classe manquant');
        }
        
        if (!code) {
            throw new Error('Code de l\'évaluation manquant');
        }

        console.log('🔽 Téléchargement du PV - Classe:', classeId, 'Code:', code);
        
        // Construction de l'URL complète
        const downloadUrl = `${getFullUrl()}imprimer-proces-verbal/imprimer-proces-verbal/${classeId}/${code}`;
        console.log('📥 URL de téléchargement:', downloadUrl);

        // Appel API avec axios
        const response = await axios.get(downloadUrl, {
            responseType: 'blob',
            timeout: 30000,
        });

        console.log('✅ Réponse reçue:', response);

        // Vérifier si la réponse contient des données
        if (!response.data || response.data.size === 0) {
            throw new Error('Le fichier téléchargé est vide');
        }

        // Récupérer le nom du fichier
        let fileName = `PV_Evaluation_${code}.pdf`;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (fileNameMatch && fileNameMatch[1]) {
                fileName = fileNameMatch[1].replace(/['"]/g, '');
            }
        }

        console.log('📄 Nom du fichier:', fileName);

        // Créer un blob URL et déclencher le téléchargement
        const blob = new Blob([response.data], { 
            type: response.headers['content-type'] || 'application/pdf' 
        });
        const blobUrl = window.URL.createObjectURL(blob);

        // Créer un lien de téléchargement
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Libérer l'URL blob
        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 100);

        console.log('✅ Téléchargement réussi !');
        return true;

    } catch (error) {
        console.error('❌ Erreur lors du téléchargement du PV:', error);
        
        if (error.response) {
            if (error.response.status === 404) {
                throw new Error('PV non trouvé. Vérifiez que l\'évaluation existe.');
            } else if (error.response.status === 500) {
                throw new Error('Erreur serveur lors de la génération du PV.');
            } else {
                throw new Error(`Erreur ${error.response.status}: ${error.response.statusText}`);
            }
        } else if (error.request) {
            throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
        } else {
            throw new Error(error.message || 'Erreur lors du téléchargement');
        }
    }
};

// ===========================
// HOOK POUR RÉCUPÉRER LES ÉVALUATIONS
// ===========================
export const usePvEvaluationsData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const apiUrls = useAllApiUrls();
    const params = useAppParams();

    const searchEvaluations = useCallback(async (classeId, matiereId, periodeId) => {
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

            // Appel API
            const response = await axios.get(
                apiUrls.evaluations.getClasseMatierePeriodie({ 
                    classeId, 
                    matiereId, 
                    periodeId, 
                    annee: params.academicYearId 
                })
            );
            
            // Traitement des évaluations
            let processedEvaluations = [];
            if (response.data && Array.isArray(response.data)) {
                processedEvaluations = response.data.map((evaluation, index) => {
                    const statut = determineStatut(evaluation);
                    
                    return {
                        id: evaluation.id || `eval-${index}`,
                        code: evaluation.code || `eval-${index}`,
                        uuid: evaluation.uuid || evaluation.code || null,
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
                        
                        matiere: evaluation.matiereEcole?.libelle || 'Matière inconnue',
                        matiere_id: evaluation.matiereEcole?.id || matiereId,
                        matiere_code: evaluation.matiereEcole?.code || '',
                        matiere_categorie: evaluation.matiereEcole?.categorie?.libelle || '',
                        matiere_numOrdre: evaluation.matiereEcole?.numOrdre || 0,
                        matiere_pec: evaluation.matiereEcole?.pec || 0,
                        matiere_bonus: evaluation.matiereEcole?.bonus || 0,
                        
                        periode: evaluation.periode?.libelle || 'Période inconnue',
                        periode_id: evaluation.periode?.id || periodeId,
                        periode_coef: parseFloat(evaluation.periode?.coef || '1.0'),
                        periode_niveau: evaluation.periode?.niveau || 1,
                        periode_isfinal: evaluation.periode?.isfinal || '',
                        
                        classe: evaluation.classe?.libelle || 'Classe inconnue',
                        classe_id: evaluation.classe?.id || classeId,
                        classe_code: evaluation.classe?.code || '',
                        classe_effectif: evaluation.classe?.effectif || 0,
                        
                        ecole: evaluation.classe?.ecole?.libelle || 'École inconnue',
                        ecole_id: evaluation.classe?.ecole?.id,
                        ecole_code: evaluation.classe?.ecole?.code || '',
                        ecole_tel: evaluation.classe?.ecole?.tel || '',
                        ecole_signataire: evaluation.classe?.ecole?.nomSignataire || '',
                        
                        serie: evaluation.classe?.branche?.serie?.libelle || '',
                        filiere: evaluation.classe?.branche?.filiere?.libelle || '',
                        niveau: evaluation.classe?.branche?.niveau?.libelle || '',
                        
                        annee: evaluation.annee?.libelle || 'Année inconnue',
                        annee_id: evaluation.annee?.id,
                        annee_debut: evaluation.annee?.anneeDebut || 2024,
                        annee_statut: evaluation.annee?.statut || 'DIFFUSE',
                        
                        statut: statut,
                        statut_display: statut,
                        etat_original: evaluation.etat || '',
                        
                        heure: evaluation.heure || '',
                        dateLimite: evaluation.dateLimite || '',
                        user: evaluation.user || '',
                        dateCreation: evaluation.dateCreation || new Date().toISOString(),
                        dateUpdate: evaluation.dateUpdate || '',
                        pec: evaluation.pec || 0,
                        coefficient: parseFloat(evaluation.periode?.coef || '1.0'),
                        nombreEleves: evaluation.classe?.effectif || 0,
                        
                        evaluation_display: `${evaluation.type?.libelle || 'Devoir'} N°${evaluation.numero || (index + 1)}`,
                        description_complete: `${evaluation.type?.libelle || 'Devoir'} de ${evaluation.matiereEcole?.libelle || 'Matière'} - ${evaluation.periode?.libelle || 'Période'}`,
                        details_display: `${formatDuration(evaluation.duree)} • /${evaluation.noteSur || '20'} • ${evaluation.classe?.effectif || 0} élèves`,
                        
                        raw_data: evaluation
                    };
                });
            }

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
    }, [apiUrls, params]);

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
// CONFIGURATION DU TABLEAU
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
        {
            type: 'download',
            icon: <FiDownload size={17} />,
            tooltip: 'Télécharger le PV',
            color: '#9b59b6'
        }
    ],
    defaultSortField: 'date_display',
    defaultSortOrder: 'desc',
    pageSize: 10,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};