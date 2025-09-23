/**
 * Service pour la gestion des années scolaires
 * VERSION COMPLÈTE avec DataTable optimisé
 * MISE À JOUR: Formatage basé sur le modèle de données réel de l'API
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiLock, FiUnlock, FiCalendar, FiClock, FiUsers } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const DEFAULT_ECOLE_ID = 38;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
// FONCTION UTILITAIRE POUR EXTRACTION DES PÉRIODES
// ===========================
/**
 * Extrait et formate les informations des périodes
 * @param {Array} anneePeriodes
 * @returns {Object}
 */
const extractPeriodesInfo = (anneePeriodes) => {
    if (!anneePeriodes || !Array.isArray(anneePeriodes)) {
        return {
            nombrePeriodes: 0,
            periodes: [],
            totalEvaluations: 0
        };
    }

    const periodes = [];
    let totalEvaluations = 0;
    
    // Regrouper les données par période
    const periodesMap = {};
    
    anneePeriodes.forEach(item => {
        const match = item.id.match(/(.+)_(\d+)/);
        if (match) {
            const [, type, numero] = match;
            const periodeKey = `periode_${numero}`;
            
            if (!periodesMap[periodeKey]) {
                periodesMap[periodeKey] = {
                    numero: parseInt(numero),
                    debut: null,
                    fin: null,
                    limite: null,
                    nbEvaluations: 0
                };
            }
            
            switch (type) {
                case 'deb':
                    periodesMap[periodeKey].debut = formatDate(item.value);
                    break;
                case 'fin':
                    periodesMap[periodeKey].fin = formatDate(item.value);
                    break;
                case 'limite':
                    periodesMap[periodeKey].limite = formatDate(item.value);
                    break;
                case 'nbeval':
                    periodesMap[periodeKey].nbEvaluations = item.nbEval || 0;
                    totalEvaluations += item.nbEval || 0;
                    break;
            }
        }
    });
    
    // Convertir en tableau et trier
    const periodesArray = Object.values(periodesMap)
        .sort((a, b) => a.numero - b.numero)
        .map(periode => ({
            ...periode,
            libelle: `Période ${periode.numero}`,
            duree: `${periode.debut} → ${periode.fin}`
        }));
    
    return {
        nombrePeriodes: periodesArray.length,
        periodes: periodesArray,
        totalEvaluations
    };
};

// ===========================
// HOOK POUR RÉCUPÉRER LA LISTE DES ANNÉES SCOLAIRES
// ===========================
/**
 * Récupère la liste complète des années scolaires pour une école
 * @param {number} ecoleId
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useAnneesScolairesData = (ecoleId = DEFAULT_ECOLE_ID, refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anneeEnCours, setAnneeEnCours] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchAnnees = useCallback(async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `annees-scolaires-data-${ecoleId}`;
            
            // Vérifier le cache
            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setData(cachedData.annees);
                    setAnneeEnCours(cachedData.anneeEnCours);
                    setLoading(false);
                    return;
                }
            }

            // Appel direct à l'API
            const response = await axios.get(apiUrls.annees.listByEcole());
            
            // Traitement des données d'années selon la vraie structure
            let processedAnnees = [];
            let currentYear = null;
            
            if (response.data && Array.isArray(response.data)) {
                processedAnnees = response.data.map((annee, index) => {
                    // Extraction des informations de périodes
                    const periodesInfo = extractPeriodesInfo(annee.anneePeriodes);
                    
                    // Détermination du statut
                    const statut = annee.statut || 'INCONNU';
                    const isOuverte = statut === 'OUVERT';
                    const isCloturee = statut === 'CLOTURE';
                    
                    // Si c'est l'année ouverte, c'est l'année en cours
                    if (isOuverte) {
                        currentYear = {
                            id: annee.id,
                            libelle: annee.libelle || annee.customLibelle,
                            anneeDebut: annee.anneeDebut,
                            anneeFin: annee.anneeFin,
                            statut: statut
                        };
                    }
                    
                    return {
                        id: annee.id || `annee-${index}`,
                        libelle: annee.libelle || annee.customLibelle || `Année ${annee.anneeDebut}-${annee.anneeFin}`,
                        customLibelle: annee.customLibelle || '',
                        
                        // Période de l'année
                        anneeDebut: annee.anneeDebut || 0,
                        anneeFin: annee.anneeFin || 0,
                        periodeComplete: `${annee.anneeDebut || '?'} - ${annee.anneeFin || '?'}`,
                        
                        // Statut et état
                        statut: statut,
                        statut_display: isOuverte ? 'Ouvert' : isCloturee ? 'Clôturé' : 'Inconnu',
                        statut_color: isOuverte ? 'violet' : isCloturee ? 'red' : 'gray',
                        statut_bg: isOuverte ? '#f3e8ff' : isCloturee ? '#fee2e2' : '#f8fafc',
                        statut_text: isOuverte ? '#9333ea' : isCloturee ? '#dc2626' : '#64748b',
                        statut_border: isOuverte ? '#a855f7' : isCloturee ? '#ef4444' : '#94a3b8',
                        
                        isOuverte: isOuverte,
                        isCloturee: isCloturee,
                        isEnCours: isOuverte,
                        
                        // Périodicité
                        periodicite_id: annee.periodicite?.id || null,
                        periodicite_libelle: annee.periodicite?.libelle || 'Non définie',
                        periodicite_code: annee.periodicite?.code || '',
                        periodicite_isDefault: annee.periodicite?.isDefault === 'DEFAULT',
                        
                        // Informations sur les périodes
                        nombrePeriodes: periodesInfo.nombrePeriodes,
                        periodes: periodesInfo.periodes,
                        totalEvaluations: periodesInfo.totalEvaluations,
                        nbreEval: annee.nbreEval || 0,
                        
                        // Paramètres de l'année
                        delaiNotes: annee.delaiNotes || 0,
                        niveau: annee.niveau || '',
                        
                        // Informations d'école
                        ecole_id: annee.ecole?.id || ecoleId,
                        ecole_libelle: annee.ecole?.libelle || '',
                        ecole_code: annee.ecole?.code || '',
                        ecole_signataire: annee.ecole?.nomSignataire || '',
                        
                        // Informations de niveau d'enseignement
                        niveauEnseignement_id: annee.niveauEnseignement?.id || null,
                        niveauEnseignement_libelle: annee.niveauEnseignement?.libelle || '',
                        
                        // Métadonnées
                        dateCreation: annee.dateCreation || '',
                        dateCreation_display: formatDate(annee.dateCreation),
                        dateUpdate: annee.dateUpdate || '',
                        dateUpdate_display: formatDate(annee.dateUpdate),
                        user: annee.user || '',
                        
                        // Affichage optimisé
                        display_name: annee.libelle || annee.customLibelle,
                        display_periode: `${annee.anneeDebut}-${annee.anneeFin}`,
                        display_periodicite: annee.periodicite?.libelle || 'Non définie',
                        display_statut: isOuverte ? '🟢 Ouvert' : isCloturee ? '🔴 Clôturé' : '⚪ Inconnu',
                        
                        // Indicateurs
                        hasPeriodes: periodesInfo.nombrePeriodes > 0,
                        hasEvaluations: periodesInfo.totalEvaluations > 0,
                        
                        // Données brutes pour debug
                        anneePeriodes: annee.anneePeriodes || [],
                        raw_data: annee
                    };
                });

                // Tri par année de début décroissante (plus récente en premier)
                processedAnnees.sort((a, b) => b.anneeDebut - a.anneeDebut);
            }

            const cacheData = {
                annees: processedAnnees,
                anneeEnCours: currentYear
            };
            
            setToCache(cacheKey, cacheData, CACHE_DURATION);
            setData(processedAnnees);
            setAnneeEnCours(currentYear);
        } catch (err) {
            console.error('Erreur lors de la récupération des années scolaires:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des années scolaires',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data,
                url: err.config?.url
            });
        } finally {
            setLoading(false);
        }
    }, [ecoleId, apiUrls.annees]);

    useEffect(() => {
        if (ecoleId) {
            fetchAnnees(false);
        }
    }, [ecoleId, refreshTrigger, fetchAnnees]);

    return {
        annees: data,
        anneeEnCours,
        loading,
        error,
        refetch: () => fetchAnnees(true)
    };
};

// ===========================
// CONFIGURATION DU TABLEAU DES ANNÉES SCOLAIRES
// ===========================
export const anneesScolairesTableConfig = {
    columns: [
        {
            title: 'Libellé',
            dataKey: 'libelle',
            flexGrow: 2.5,
            minWidth: 200,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: rowData.isEnCours ? '#f3e8ff' : '#f1f5f9',
                        border: `2px solid ${rowData.isEnCours ? '#a855f7' : '#e2e8f0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <FiCalendar size={18} color={rowData.isEnCours ? '#9333ea' : '#64748b'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                            fontWeight: '600', 
                            color: '#1e293b',
                            fontSize: '14px',
                            marginBottom: '2px'
                        }}>
                            {rowData.display_name}
                        </div>
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>📅 {rowData.display_periode}</span>
                            {rowData.isEnCours && (
                                <span style={{
                                    padding: '2px 6px',
                                    backgroundColor: '#dcfce7',
                                    color: '#16a34a',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '500'
                                }}>
                                    EN COURS
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Périodicité',
            dataKey: 'periodicite_libelle',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#475569',
                        marginBottom: '4px'
                    }}>
                        {rowData.periodicite_libelle}
                    </div>
                    <div style={{ 
                        fontSize: '11px',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <FiClock size={10} />
                        {rowData.nombrePeriodes} période(s)
                        {rowData.periodicite_isDefault && (
                            <span style={{
                                padding: '1px 4px',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                borderRadius: '3px',
                                fontSize: '9px'
                            }}>
                                Par défaut
                            </span>
                        )}
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
            customRenderer: (rowData) => (
                <div style={{
                    padding: '6px 12px',
                    backgroundColor: rowData.statut_bg,
                    color: rowData.statut_text,
                    border: `1px solid ${rowData.statut_border}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    {rowData.isOuverte ? <FiUnlock size={12} /> : <FiLock size={12} />}
                    {rowData.statut_display.toUpperCase()}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Informations',
            dataKey: 'totalEvaluations',
            flexGrow: 1.3,
            minWidth: 130,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ fontSize: '12px' }}>
                    <div style={{ 
                        marginBottom: '4px',
                        color: '#475569',
                        fontWeight: '500'
                    }}>
                        📊 {rowData.totalEvaluations} évaluation(s)
                    </div>
                    <div style={{ 
                        color: '#64748b',
                        fontSize: '11px'
                    }}>
                        ⏱️ Délai notes: {rowData.delaiNotes} jour(s)
                    </div>
                    {/* {rowData.user && (
                        <div style={{ 
                            color: '#64748b',
                            fontSize: '11px',
                            marginTop: '2px'
                        }}>
                            👤 Utilisateur: {rowData.user}
                        </div>
                    )} */}
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
            field: 'statut_display',
            label: 'Statut',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'periodicite_libelle',
            label: 'Périodicité',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'isEnCours',
            label: 'Année en cours',
            type: 'boolean',
            tagColor: 'violet'
        },
        {
            field: 'nombrePeriodes',
            label: 'Nombre de périodes',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        }
    ],
    searchableFields: [
        'libelle',
        'customLibelle',
        'display_periode',
        'periodicite_libelle',
        'statut_display',
        'ecole_libelle'
    ],
    actions: [
        // {
        //     type: 'view',
        //     icon: <FiEye />,
        //     tooltip: 'Voir les détails de l\'année',
        //     color: '#3498db'
        // },
        {
            type: 'edit',
            icon: <FiEdit size={17} />,
            tooltip: 'Modifier l\'année scolaire',
            color: '#f39c12'
        },
        // {
        //     type: 'toggle-status',
        //     icon: <FiLock />,
        //     tooltip: 'Basculer le statut (Ouvrir/Clôturer)',
        //     color: '#e67e22',
        //     conditional: (rowData) => rowData.isOuverte ? 'Clôturer' : 'Ouvrir'
        // },
        // {
        //     type: 'delete',
        //     icon: <FiTrash2 />,
        //     tooltip: 'Supprimer l\'année scolaire',
        //     color: '#e74c3c'
        // }
    ],
    // Configuration supplémentaire pour le tableau
    defaultSortField: 'anneeDebut',
    defaultSortOrder: 'desc',
    pageSize: 10,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};