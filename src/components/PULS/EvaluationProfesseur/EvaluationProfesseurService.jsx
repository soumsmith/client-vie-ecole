/**
 * Service pour la gestion des statistiques d'évaluations par professeur
 * VERSION COMPLÈTE avec filtres enseignant/période et DataTable
 * MISE À JOUR: Formatage basé sur le modèle de données réel de l'API
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiCalendar, FiBookOpen, FiClock, FiUser, FiUsers, FiBarChart } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';
import { usePulsParams } from '../../hooks/useDynamicParams';

// ===========================
// HOOK POUR RÉCUPÉRER LES ENSEIGNANTS D'UNE ÉCOLE
// ===========================

/**
 * Récupère les statistiques d'évaluations pour un professeur donné
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useStatistiquesProfesseurData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [professeurInfo, setProfesseurInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const apiUrls = useAllApiUrls();
    const {
        ecoleId: dynamicEcoleId,
        personnelInfo,
        academicYearId: dynamicAcademicYearId,
        profileId,
        userId,
        email,
        isAuthenticated,
        isInitialized,
        isReady,
      } = usePulsParams();

    const searchStatistiques = useCallback(async (professeurId, periodeId ) => {
        if (!professeurId) {
            setError({
                message: 'Veuillez sélectionner un enseignant',
                type: 'ValidationError',
                code: 'MISSING_PROFESSEUR'
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
            
            const cacheKey = `statistiques-prof-${professeurId}-${periodeId}-${dynamicEcoleId}-${dynamicAcademicYearId}`;
            
            // Vérifier le cache
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setData(cachedData.details || []);
                setProfesseurInfo(cachedData.professeurInfo || null);
                setSearchPerformed(true);
                setLoading(false);
                return;
            }

            // Appel direct à l'API
            const response = await axios.get(apiUrls.evaluations.statistiqueProf(dynamicEcoleId, dynamicAcademicYearId, periodeId, professeurId));
            
            // Traitement des statistiques selon la vraie structure
            let processedStatistiques = [];
            let profInfo = null;
            
            if (response.data) {
                const apiData = response.data;
                
                // Informations du professeur
                profInfo = {
                    nomPrenoms: apiData.nomPrenoms || 'Professeur inconnu',
                    profPersonnelId: apiData.profPersonnelId || professeurId,
                    max: apiData.max || 0
                };

                // Traitement des détails (statistiques par classe/matière)
                if (apiData.details && Array.isArray(apiData.details)) {
                    processedStatistiques = apiData.details.map((detail, index) => ({
                        id: `stat-${index + 1}`,
                        numero: index + 1,
                        classe: detail.classe || 'Classe inconnue',
                        classeId: detail.classeId || null,
                        matiere: detail.matiere || 'Matière inconnue',
                        matiereId: detail.matiereId || null,
                        
                        // Statistiques devoirs
                        nbreDevoirExec: detail.nbreDevoirExec || 0,
                        nbreDevoirNonExec: detail.nbreDevoirNonExec || 0,
                        totalDevoirs: (detail.nbreDevoirExec || 0) + (detail.nbreDevoirNonExec || 0),
                        pourcentageDevoirExec: ((detail.nbreDevoirExec || 0) + (detail.nbreDevoirNonExec || 0)) > 0 
                            ? Math.round(((detail.nbreDevoirExec || 0) / ((detail.nbreDevoirExec || 0) + (detail.nbreDevoirNonExec || 0))) * 100)
                            : 0,
                        
                        // Statistiques interrogations
                        nbreInterroExec: detail.nbreInterroExec || 0,
                        nbreInterroNonExec: detail.nbreInterroNonExec || 0,
                        totalInterrogations: (detail.nbreInterroExec || 0) + (detail.nbreInterroNonExec || 0),
                        pourcentageInterroExec: ((detail.nbreInterroExec || 0) + (detail.nbreInterroNonExec || 0)) > 0 
                            ? Math.round(((detail.nbreInterroExec || 0) / ((detail.nbreInterroExec || 0) + (detail.nbreInterroNonExec || 0))) * 100)
                            : 0,
                        
                        // Statistiques totales
                        nbreTotalExec: detail.nbreTotalExec || 0,
                        nbreTotalNonExec: detail.nbreTotalNonExec || 0,
                        grandTotal: (detail.nbreTotalExec || 0) + (detail.nbreTotalNonExec || 0),
                        pourcentageTotalExec: ((detail.nbreTotalExec || 0) + (detail.nbreTotalNonExec || 0)) > 0 
                            ? Math.round(((detail.nbreTotalExec || 0) / ((detail.nbreTotalExec || 0) + (detail.nbreTotalNonExec || 0))) * 100)
                            : 0,
                        
                        // Max (nombre maximum d'évaluations attendues)
                        max: apiData.max || 0,
                        maxDisplay: apiData.max || 'N/A',
                        
                        // Affichage optimisé
                        classeMatiere: `${detail.classe || 'Classe'} - ${detail.matiere || 'Matière'}`,
                        statistiques_resumé: `${detail.nbreTotalExec || 0}/${(detail.nbreTotalExec || 0) + (detail.nbreTotalNonExec || 0)} (${
                            ((detail.nbreTotalExec || 0) + (detail.nbreTotalNonExec || 0)) > 0 
                                ? Math.round(((detail.nbreTotalExec || 0) / ((detail.nbreTotalExec || 0) + (detail.nbreTotalNonExec || 0))) * 100)
                                : 0
                        }%)`,
                        
                        // Données brutes pour debug
                        raw_data: detail
                    }));
                }
            }

            const dataToCache = {
                details: processedStatistiques,
                professeurInfo: profInfo
            };
            
            setToCache(cacheKey, dataToCache);
            setData(processedStatistiques);
            setProfesseurInfo(profInfo);
            setSearchPerformed(true);
        } catch (err) {
            console.error('Erreur lors de la récupération des statistiques professeur:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la recherche des statistiques',
                type: err.name || 'SearchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data,
                url: err.config?.url
            });
        } finally {
            setLoading(false);
        }
    }, [apiUrls.evaluations, dynamicAcademicYearId, dynamicEcoleId]);

    const clearResults = useCallback(() => {
        setData([]);
        setProfesseurInfo(null);
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
        statistiques: data,
        professeurInfo,
        loading,
        error,
        searchPerformed,
        searchStatistiques,
        clearResults
    };
};

// ===========================
// CONFIGURATION DU TABLEAU DES STATISTIQUES PROFESSEUR
// ===========================
export const statistiquesProfesseurTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'numero',
            flexGrow: 0.5,
            minWidth: 60,
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
                    minWidth: '35px'
                }}>
                    {rowData.numero}
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
                <div style={{ 
                    fontWeight: '600', 
                    color: '#1e293b',
                    fontSize: '13px'
                }}>
                    {rowData.classe}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Matière',
            dataKey: 'matiere',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px'
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
            ),
            sortable: true
        },
        {
            title: 'Max',
            dataKey: 'maxDisplay',
            flexGrow: 0.7,
            minWidth: 80,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center'
                }}>
                    {rowData.maxDisplay}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Devoir',
            dataKey: 'devoirs',
            flexGrow: 1.5,
            minWidth: 150,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Exécuté */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        <div style={{
                            padding: '4px 10px',
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            minWidth: '35px',
                            textAlign: 'center'
                        }}>
                            {rowData.nbreDevoirExec}
                        </div>
                        <span style={{
                            fontSize: '9px',
                            color: '#16a34a',
                            fontWeight: '500',
                            textAlign: 'center'
                        }}>
                            Exécuté
                        </span>
                    </div>
                    
                    {/* Non exécuté */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        <div style={{
                            padding: '4px 10px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            minWidth: '35px',
                            textAlign: 'center'
                        }}>
                            {rowData.nbreDevoirNonExec}
                        </div>
                        <span style={{
                            fontSize: '9px',
                            color: '#dc2626',
                            fontWeight: '500',
                            textAlign: 'center'
                        }}>
                            Non exécuté
                        </span>
                    </div>
                </div>
            ),
            sortable: false
        },
        {
            title: 'Interrogation',
            dataKey: 'interrogations',
            flexGrow: 1.5,
            minWidth: 150,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Exécuté */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        <div style={{
                            padding: '4px 10px',
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            minWidth: '35px',
                            textAlign: 'center'
                        }}>
                            {rowData.nbreInterroExec}
                        </div>
                        <span style={{
                            fontSize: '9px',
                            color: '#16a34a',
                            fontWeight: '500',
                            textAlign: 'center'
                        }}>
                            Exécuté
                        </span>
                    </div>
                    
                    {/* Non exécuté */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        <div style={{
                            padding: '4px 10px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            minWidth: '35px',
                            textAlign: 'center'
                        }}>
                            {rowData.nbreInterroNonExec}
                        </div>
                        <span style={{
                            fontSize: '9px',
                            color: '#dc2626',
                            fontWeight: '500',
                            textAlign: 'center'
                        }}>
                            Non exécuté
                        </span>
                    </div>
                </div>
            ),
            sortable: false
        },
        {
            title: 'Totaux',
            dataKey: 'totaux',
            flexGrow: 1.5,
            minWidth: 150,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Exécuté */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        <div style={{
                            padding: '5px 12px',
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '700',
                            minWidth: '40px',
                            textAlign: 'center',
                            border: '1px solid #22c55e'
                        }}>
                            {rowData.nbreTotalExec}
                        </div>
                        <span style={{
                            fontSize: '9px',
                            color: '#16a34a',
                            fontWeight: '600',
                            textAlign: 'center'
                        }}>
                            Exécuté
                        </span>
                    </div>
                    
                    {/* Non exécuté */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        <div style={{
                            padding: '5px 12px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '700',
                            minWidth: '40px',
                            textAlign: 'center',
                            border: '1px solid #ef4444'
                        }}>
                            {rowData.nbreTotalNonExec}
                        </div>
                        <span style={{
                            fontSize: '9px',
                            color: '#dc2626',
                            fontWeight: '600',
                            textAlign: 'center'
                        }}>
                            Non exécuté
                        </span>
                    </div>
                </div>
            ),
            sortable: false
        },
        // {
        //     title: 'Actions',
        //     dataKey: 'actions',
        //     flexGrow: 1,
        //     minWidth: 120,
        //     cellType: 'actions',
        //     fixed: 'right'
        // }
    ],
    filterConfigs: [
        {
            field: 'classe',
            label: 'Classe',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'matiere',
            label: 'Matière',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'pourcentageTotalExec',
            label: 'Taux d\'exécution',
            type: 'range',
            tagColor: 'purple'
        }
    ],
    searchableFields: [
        'classe',
        'matiere',
        'classeMatiere'
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails',
            color: '#3498db'
        },
        {
            type: 'download',
            icon: <FiDownload />,
            tooltip: 'Télécharger le rapport',
            color: '#9b59b6'
        },
        {
            type: 'chart',
            icon: <FiBarChart />,
            tooltip: 'Voir les graphiques',
            color: '#2ecc71'
        }
    ],
    // Configuration supplémentaire pour le tableau
    defaultSortField: 'numero',
    defaultSortOrder: 'asc',
    pageSize: 15,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};