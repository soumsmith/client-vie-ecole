/**
 * Service pour la gestion de la Liste des Matières d'École
 * VERSION MISE À JOUR: Utilise l'API des matières d'école avec DataTable optimisé
 * MISE À JOUR: Formatage basé sur le modèle de données réel de l'API
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiBookOpen, FiGrid, FiTag, FiPlus, FiAward } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_ECOLE_ID = 38; // ID par défaut de l'école

// ===========================
// HOOK POUR RÉCUPÉRER LA LISTE DES MATIÈRES D'ÉCOLE
// ===========================
/**
 * Récupère la liste complète des matières d'école
 * @param {number} refreshTrigger
 * @param {number} ecoleId - ID de l'école (optionnel, utilise 38 par défaut)
 * @returns {object}
 */
export const useListeMatieresData = (refreshTrigger = 0, ecoleId = DEFAULT_ECOLE_ID) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchMatieres = useCallback(async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `liste-matieres-ecole-${ecoleId}`;
            
            // Vérifier le cache
            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            // Appel direct à l'API des matières d'école
            const response = await axios.get(apiUrls.matieres.listByEcole());
            
            // Traitement des données de matières selon la vraie structure
            let processedMatieres = [];
            if (response.data && Array.isArray(response.data)) {
                processedMatieres = response.data.map((matiereEcole, index) => {
                    // Détermination du type de catégorie
                    const type = determineCategoriePrimaire(matiereEcole.categorie?.libelle || '');
                    const couleur = getCouleurCategorie(type);
                    
                    return {
                        // Données principales de la matière d'école
                        id: matiereEcole.id || `matiere-${index}`,
                        code: matiereEcole.code || `M${String(index + 1).padStart(2, '0')}`,
                        libelle: matiereEcole.libelle || 'Matière sans nom',
                        numOrdre: matiereEcole.numOrdre || 1,
                        pec: matiereEcole.pec || 0,
                        bonus: matiereEcole.bonus || 0,
                        
                        // Informations de catégorie
                        categorie: matiereEcole.categorie,
                        type: type,
                        type_display: getTypeDisplay(type),
                        couleur: couleur,
                        couleur_fond: couleur.background,
                        couleur_texte: couleur.text,
                        couleur_bordure: couleur.border,
                        
                        // Informations d'école
                        ecole: matiereEcole.ecole,
                        ecole_nom: matiereEcole.ecole?.libelle || '',
                        
                        // Informations de la matière de base
                        matiere: matiereEcole.matiere,
                        matiere_parent_libelle: matiereEcole.matiere?.parentMatiereLibelle || 'Aucune',
                        
                        // Indicateurs
                        is_pec_active: matiereEcole.pec === 1,
                        is_bonus_active: matiereEcole.bonus === 1,
                        is_academic: ['SCIENTIFIQUE', 'LITTERAIRE', 'GENERAL'].includes(type),
                        is_technical: ['TECHNIQUE', 'PROFESSIONNEL', 'UEG', 'UEP', 'UF'].includes(type),
                        is_special: ['SPORTIVE', 'ARTISTIQUE', 'RELIGION', 'AUTRES'].includes(type),
                        
                        // Affichage optimisé
                        display_name: matiereEcole.libelle,
                        display_code: `${matiereEcole.code} - ${matiereEcole.libelle}`,
                        display_type: getTypeDisplay(type),
                        display_statut: `PEC: ${matiereEcole.pec === 1 ? 'Oui' : 'Non'} | Bonus: ${matiereEcole.bonus === 1 ? 'Oui' : 'Non'}`,
                        badge_style: getBadgeStyle(type),
                        
                        // Informations d'ordre et tri
                        ordre: matiereEcole.numOrdre || (index + 1),
                        numeroOrdre: index + 1,
                        
                        // Données brutes pour debug et API
                        raw_data: matiereEcole
                    };
                });

                // Tri par ordre numérique
                processedMatieres.sort((a, b) => a.ordre - b.ordre);
            }

            setToCache(cacheKey, processedMatieres, CACHE_DURATION);
            setData(processedMatieres);
        } catch (err) {
            console.error('Erreur lors de la récupération des matières d\'école:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des matières d\'école',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data,
                url: err.config?.url
            });
        } finally {
            setLoading(false);
        }
    }, [ecoleId, apiUrls.matieres]);

    useEffect(() => {
        fetchMatieres(false);
    }, [refreshTrigger, fetchMatieres]);

    return {
        matieres: data,
        loading,
        error,
        refetch: () => fetchMatieres(true)
    };
};

// ===========================
// FONCTIONS UTILITAIRES POUR LA CLASSIFICATION
// ===========================

/**
 * Détermine le type primaire d'une catégorie
 * @param {string} libelle
 * @returns {string}
 */
const determineCategoriePrimaire = (libelle) => {
    const libelleLower = libelle.toLowerCase();
    
    if (libelleLower.includes('scientifique')) return 'SCIENTIFIQUE';
    if (libelleLower.includes('littéraire')) return 'LITTERAIRE';
    if (libelleLower.includes('sportive')) return 'SPORTIVE';
    if (libelleLower.includes('technique')) return 'TECHNIQUE';
    if (libelleLower.includes('professionnel')) return 'PROFESSIONNEL';
    if (libelleLower.includes('artistique')) return 'ARTISTIQUE';
    if (libelleLower.includes('religion')) return 'RELIGION';
    if (libelleLower.includes('general')) return 'GENERAL';
    if (libelleLower.includes('ueg')) return 'UEG';
    if (libelleLower.includes('uep')) return 'UEP';
    if (libelleLower.includes('uf')) return 'UF';
    if (libelleLower.includes('ueq')) return 'UEQ';
    
    return 'AUTRES';
};

/**
 * Obtient l'affichage formaté du type
 * @param {string} type
 * @returns {string}
 */
const getTypeDisplay = (type) => {
    const mapping = {
        'SCIENTIFIQUE': 'Sciences',
        'LITTERAIRE': 'Lettres',
        'SPORTIVE': 'Sport',
        'TECHNIQUE': 'Technique',
        'PROFESSIONNEL': 'Professionnel',
        'ARTISTIQUE': 'Arts',
        'RELIGION': 'Religion',
        'GENERAL': 'Général',
        'UEG': 'UE Générale',
        'UEP': 'UE Professionnelle',
        'UF': 'UE Formation',
        'UEQ': 'UE Qualifiante',
        'AUTRES': 'Autres'
    };
    
    return mapping[type] || type;
};

/**
 * Obtient les couleurs associées à un type de catégorie
 * @param {string} type
 * @returns {object}
 */
const getCouleurCategorie = (type) => {
    const couleurs = {
        'SCIENTIFIQUE': { background: '#dcfce7', text: '#16a34a', border: '#22c55e' },
        'LITTERAIRE': { background: '#fef3c7', text: '#d97706', border: '#f59e0b' },
        'SPORTIVE': { background: '#dbeafe', text: '#2563eb', border: '#3b82f6' },
        'TECHNIQUE': { background: '#f3e8ff', text: '#9333ea', border: '#a855f7' },
        'PROFESSIONNEL': { background: '#fce7f3', text: '#ec4899', border: '#f472b6' },
        'ARTISTIQUE': { background: '#fef2f2', text: '#dc2626', border: '#ef4444' },
        'RELIGION': { background: '#f0f9ff', text: '#0369a1', border: '#0284c7' },
        'GENERAL': { background: '#f1f5f9', text: '#475569', border: '#64748b' },
        'UEG': { background: '#ecfdf5', text: '#059669', border: '#10b981' },
        'UEP': { background: '#eff6ff', text: '#2563eb', border: '#3b82f6' },
        'UF': { background: '#fdf4ff', text: '#c026d3', border: '#d946ef' },
        'UEQ': { background: '#fff7ed', text: '#ea580c', border: '#f97316' },
        'AUTRES': { background: '#f8fafc', text: '#64748b', border: '#94a3b8' }
    };
    
    return couleurs[type] || couleurs['AUTRES'];
};

/**
 * Obtient le style de badge pour un type
 * @param {string} type
 * @returns {string}
 */
const getBadgeStyle = (type) => {
    const styles = {
        'SCIENTIFIQUE': 'green',
        'LITTERAIRE': 'orange',
        'SPORTIVE': 'blue',
        'TECHNIQUE': 'violet',
        'PROFESSIONNEL': 'pink',
        'ARTISTIQUE': 'red',
        'RELIGION': 'cyan',
        'GENERAL': 'gray',
        'UEG': 'green',
        'UEP': 'blue',
        'UF': 'purple',
        'UEQ': 'orange',
        'AUTRES': 'gray'
    };
    
    return styles[type] || 'gray';
};

// ===========================
// CONFIGURATION DU TABLEAU DES MATIÈRES D'ÉCOLE
// ===========================
export const listematieresTableConfig = {
    columns: [
        {
            title: 'Code',
            dataKey: 'code',
            flexGrow: 0.5,
            minWidth: 80,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '6px 10px',
                    // backgroundColor: rowData.couleur_fond,
                    // color: rowData.couleur_texte,
                    // border: `1px solid ${rowData.couleur_bordure}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textAlign: 'center',
                    // fontFamily: 'monospace'
                }}>
                    {rowData.code}
                </div>
            ),
            sortable: true
        },
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
                        borderRadius: '8px',
                        backgroundColor: rowData.couleur_fond,
                        border: `2px solid ${rowData.couleur_bordure}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <FiBookOpen size={18} color={rowData.couleur_texte} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                            fontWeight: '600', 
                            color: '#1e293b',
                            fontSize: '14px',
                            marginBottom: '2px'
                        }}>
                            {rowData.libelle}
                        </div>
                        <div style={{ 
                            fontSize: '11px', 
                            color: '#64748b'
                        }}>
                            {rowData.categorie?.libelle || 'Aucune catégorie'}
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Catégorie',
            dataKey: 'type_display',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    {/* <Badge 
                        color={rowData.badge_style} 
                        style={{ 
                            fontSize: '11px',
                            marginBottom: '4px'
                        }}
                    >
                       
                    </Badge> */}
                     {rowData.categorie?.libelle || 'Aucune'}
                    <div style={{ 
                        fontSize: '10px', 
                        color: '#64748b',
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{
                            padding: '1px 4px',
                            backgroundColor: rowData.is_academic ? '#ecfdf5' : '#f1f5f9',
                            color: rowData.is_academic ? '#059669' : '#64748b',
                            borderRadius: '3px',
                            fontSize: '9px'
                        }}>
                            {rowData.type_display}
                        </span>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Ordre',
            dataKey: 'ordre',
            flexGrow: 0.7,
            minWidth: 70,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center'
                }}>
                    {rowData.ordre}
                </div>
            ),
            sortable: true
        },
        {
            title: 'PEC / Bonus',
            dataKey: 'display_statut',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{
                        padding: '2px 6px',
                        backgroundColor: rowData.is_pec_active ? '#dcfce7' : '#fef2f2',
                        color: rowData.is_pec_active ? '#16a34a' : '#dc2626',
                        border: `1px solid ${rowData.is_pec_active ? '#22c55e' : '#fca5a5'}`,
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500'
                    }}>
                        PEC
                    </div>
                    <div style={{
                        padding: '2px 6px',
                        backgroundColor: rowData.is_bonus_active ? '#fef3c7' : '#f1f5f9',
                        color: rowData.is_bonus_active ? '#d97706' : '#64748b',
                        border: `1px solid ${rowData.is_bonus_active ? '#fed7aa' : '#e2e8f0'}`,
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500'
                    }}>
                        BONUS
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Matière parent',
            dataKey: 'matiere_parent_libelle',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontSize: '12px',
                    color: rowData.matiere_parent_libelle !== 'Aucune' ? '#1e293b' : '#94a3b8',
                    fontStyle: rowData.matiere_parent_libelle === 'Aucune' ? 'italic' : 'normal'
                }}>
                    {rowData.matiere_parent_libelle}
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
            field: 'type_display',
            label: 'Type de catégorie',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'is_pec_active',
            label: 'PEC Activé',
            type: 'boolean',
            tagColor: 'green'
        },
        {
            field: 'is_bonus_active',
            label: 'Bonus Activé',
            type: 'boolean',
            tagColor: 'orange'
        },
        {
            field: 'is_academic',
            label: 'Académique',
            type: 'boolean',
            tagColor: 'green'
        },
        {
            field: 'is_technical',
            label: 'Technique',
            type: 'boolean',
            tagColor: 'purple'
        }
    ],
    searchableFields: [
        'code',
        'libelle',
        'display_name',
        'categorie.libelle',
        'matiere_parent_libelle'
    ],
    actions: [
        {
            type: 'edit',
            icon: <FiEdit size={17} />,
            tooltip: 'Modifier la matière',
            color: '#f39c12'
        }
    ],
    // Configuration supplémentaire pour le tableau
    defaultSortField: 'ordre',
    defaultSortOrder: 'asc',
    pageSize: 15,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};