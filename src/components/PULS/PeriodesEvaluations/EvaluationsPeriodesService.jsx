/**
 * Service pour la gestion des évaluations par période
 * VERSION COMPLÈTE avec DataTable optimisé
 */

import { useState, useEffect, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEdit, FiTrash2, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import axios from 'axios';
import getFullUrl from "../../hooks/urlUtils";

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ===========================
// HOOK POUR RÉCUPÉRER LES DONNÉES
// ===========================
export const useEvaluationsPeriodesData = (anneeId, ecoleId, refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anneeEnCours, setAnneeEnCours] = useState(null);

    const fetchEvaluations = useCallback(async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `evaluations-periodes-data-${anneeId}-${ecoleId}`;
            
            // Vérifier le cache
            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setData(cachedData.evaluations);
                    setAnneeEnCours(cachedData.anneeEnCours);
                    setLoading(false);
                    return;
                }
            }

            // Récupérer d'abord les périodes pour connaître les IDs
            const periodesResponse = await axios.get(
                `${getFullUrl()}/periodes/list-by-periodicite?id=2`
            );
            
            // Récupérer les niveaux
            const niveauxResponse = await axios.get(
                `${getFullUrl()}/branche/get-by-niveau-enseignement?ecole=${ecoleId}`
            );

            // Extraire les IDs uniques de niveaux
            const niveauxUniques = {};
            niveauxResponse.data.forEach(branche => {
                if (!niveauxUniques[branche.niveau.id]) {
                    niveauxUniques[branche.niveau.id] = {
                        id: branche.niveau.id,
                        libelle: branche.niveau.libelle
                    };
                }
            });

            // Récupérer toutes les évaluations pour chaque combinaison période/niveau
            const allEvaluations = [];
            
            for (const periode of periodesResponse.data) {
                for (const niveauId in niveauxUniques) {
                    try {
                        const response = await axios.get(
                            `${getFullUrl()}/evaluation-periode/get-by-annee-ecole-periode-niveau/${anneeId}/${ecoleId}/${periode.id}/${niveauId}`
                        );
                        
                        if (response.data && Array.isArray(response.data)) {
                            allEvaluations.push(...response.data);
                        }
                    } catch (err) {
                        // Si pas de données pour cette combinaison, continuer
                        console.log(`Pas de données pour période ${periode.id} et niveau ${niveauId}`);
                    }
                }
            }

            // Traitement des données
            const processedEvaluations = allEvaluations.map((evaluation, index) => {
                return {
                    id: evaluation.id || `eval-${index}`,
                    
                    // Année
                    annee_id: evaluation.annee?.id || anneeId,
                    annee_libelle: evaluation.annee?.libelle || '',
                    
                    // Période
                    periode_id: evaluation.periode?.id || null,
                    periode_libelle: evaluation.periode?.libelle || 'Non définie',
                    periode_niveau: evaluation.periode?.niveau || 0,
                    periode_coef: evaluation.periode?.coef || '1.0',
                    
                    // Niveau
                    niveau_id: evaluation.niveau?.id || null,
                    niveau_libelle: evaluation.niveau?.libelle || 'Non défini',
                    niveau_code: evaluation.niveau?.code || '',
                    niveau_ordre: evaluation.niveau?.ordre || 0,
                    
                    // Type d'évaluation
                    typeEvaluation_id: evaluation.typeEvaluation?.id || null,
                    typeEvaluation_libelle: evaluation.typeEvaluation?.libelle || 'Non défini',
                    
                    // Numéro de l'évaluation
                    numero: evaluation.numero || 0,
                    
                    // École
                    ecole_id: evaluation.ecole?.id || ecoleId,
                    ecole_libelle: evaluation.ecole?.libelle || '',
                    
                    // Utilisateur
                    user: evaluation.user || '',
                    
                    // Affichage optimisé
                    display_periode: evaluation.periode?.libelle || 'Non définie',
                    display_niveau: evaluation.niveau?.libelle || 'Non défini',
                    display_type: evaluation.typeEvaluation?.libelle || 'Non défini',
                    display_numero: `#${evaluation.numero || 0}`,
                    display_full: `${evaluation.periode?.libelle || 'N/A'} - ${evaluation.niveau?.libelle || 'N/A'} - ${evaluation.typeEvaluation?.libelle || 'N/A'} #${evaluation.numero || 0}`,
                    
                    // Données brutes
                    raw_data: evaluation
                };
            });

            // Tri par période, puis niveau, puis numéro
            processedEvaluations.sort((a, b) => {
                if (a.periode_niveau !== b.periode_niveau) {
                    return a.periode_niveau - b.periode_niveau;
                }
                if (a.niveau_ordre !== b.niveau_ordre) {
                    return a.niveau_ordre - b.niveau_ordre;
                }
                return a.numero - b.numero;
            });

            // Déterminer l'année en cours (mock - à adapter selon vos besoins)
            const currentYear = {
                id: anneeId,
                libelle: '2024-2025' // À récupérer depuis l'API si nécessaire
            };

            const cacheData = {
                evaluations: processedEvaluations,
                anneeEnCours: currentYear
            };
            
            setToCache(cacheKey, cacheData, CACHE_DURATION);
            setData(processedEvaluations);
            setAnneeEnCours(currentYear);
        } catch (err) {
            console.error('Erreur lors de la récupération des évaluations:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des évaluations',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data
            });
        } finally {
            setLoading(false);
        }
    }, [anneeId, ecoleId]);

    useEffect(() => {
        if (anneeId && ecoleId) {
            fetchEvaluations(false);
        }
    }, [anneeId, ecoleId, refreshTrigger, fetchEvaluations]);

    return {
        evaluations: data,
        anneeEnCours,
        loading,
        error,
        refetch: () => fetchEvaluations(true)
    };
};

// ===========================
// CONFIGURATION DU TABLEAU
// ===========================
export const evaluationsPeriodesTableConfig = {
    columns: [
        {
            title: 'Période',
            dataKey: 'periode_libelle',
            flexGrow: 1.5,
            minWidth: 150,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '8px',
                        backgroundColor: '#f0f9ff',
                        border: '2px solid #bae6fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <FiCalendar size={16} color="#0369a1" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                            fontWeight: '600', 
                            color: '#1e293b',
                            fontSize: '13px'
                        }}>
                            {rowData.periode_libelle}
                        </div>
                        <div style={{ 
                            fontSize: '11px', 
                            color: '#64748b'
                        }}>
                            Niveau {rowData.periode_niveau} • Coef. {rowData.periode_coef}
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Niveau',
            dataKey: 'niveau_libelle',
            flexGrow: 1.8,
            minWidth: 180,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#475569',
                        marginBottom: '3px'
                    }}>
                        {rowData.niveau_libelle}
                    </div>
                    <div style={{ 
                        fontSize: '11px',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span style={{
                            padding: '1px 5px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '3px',
                            fontSize: '10px',
                            fontWeight: '500'
                        }}>
                            {rowData.niveau_code}
                        </span>
                        <span>Ordre: {rowData.niveau_ordre}</span>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Type d\'évaluation',
            dataKey: 'typeEvaluation_libelle',
            flexGrow: 1.3,
            minWidth: 140,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '6px 12px',
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <FiCheckCircle size={12} />
                    {rowData.typeEvaluation_libelle}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Numéro',
            dataKey: 'numero',
            flexGrow: 0.8,
            minWidth: 90,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    textAlign: 'center'
                }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '5px 15px',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '700',
                        border: '2px solid #bae6fd'
                    }}>
                        #{rowData.numero}
                    </span>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 0.5,
            minWidth: 50,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    
    filterConfigs: [
        {
            field: 'periode_libelle',
            label: 'Période',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'niveau_libelle',
            label: 'Niveau',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'typeEvaluation_libelle',
            label: 'Type d\'évaluation',
            type: 'select',
            dynamic: true,
            tagColor: 'violet'
        },
        {
            field: 'numero',
            label: 'Numéro',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        }
    ],
    
    searchableFields: [
        'periode_libelle',
        'niveau_libelle',
        'typeEvaluation_libelle',
        'niveau_code',
        'display_full'
    ],
    
    actions: [
        {
            type: 'edit',
            icon: <FiEdit size={17} />,
            tooltip: 'Modifier l\'évaluation',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 size={17} />,
            tooltip: 'Supprimer l\'évaluation',
            color: '#e74c3c'
        }
    ],
    
    // Configuration supplémentaire
    defaultSortField: 'periode_niveau',
    defaultSortOrder: 'asc',
    pageSize: 10,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};