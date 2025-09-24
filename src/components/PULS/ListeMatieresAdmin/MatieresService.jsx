/**
 * Service pour la gestion des Matières
 * VERSION COMPLÈTE avec DataTable optimisé
 * MISE À JOUR: Formatage basé sur le modèle de données réel de l'API
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiBookOpen, FiGrid, FiTag, FiPlus } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import getFullUrl from '../../hooks/urlUtils';
import axios from 'axios';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const MATIERES_ENDPOINT = 'matiere/list';
const CATEGORIES_ENDPOINT = 'categorie-matiere/list';
const NIVEAUX_ENDPOINT = 'niveau-enseignement/list';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ===========================
// HOOK POUR RÉCUPÉRER LA LISTE DES MATIÈRES
// ===========================
/**
 * Récupère la liste complète des matières
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useMatieresData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMatieres = useCallback(async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = 'liste-matieres';

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
            const response = await axios.get(`${getFullUrl()}${MATIERES_ENDPOINT}`);

            // Traitement des données de matières selon la vraie structure
            let processedMatieres = [];
            if (response.data && Array.isArray(response.data)) {
                processedMatieres = response.data.map((matiere, index) => {
                    const categorie = matiere.categorie || {};
                    const niveauEnseignement = matiere.niveauEnseignement || {};
                    const matiereParent = matiere.matiereParent || {};

                    // Détermination du type de matière basé sur la catégorie
                    const type = determineTypeMatiere(categorie.libelle);
                    const couleur = getCouleurMatiere(type);

                    return {
                        id: matiere.id || `matiere-${index}`,
                        code: matiere.code || `M${String(index + 1).padStart(2, '0')}`,
                        libelle: matiere.libelle || 'Matière sans nom',

                        // Informations numériques
                        bonus: matiere.bonus || 0,
                        pec: matiere.pec || 0,
                        numOrdre: matiere.numOrdre || (index + 1),

                        // Catégorie
                        categorie_id: categorie.id || null,
                        categorie_code: categorie.code || '',
                        categorie_libelle: categorie.libelle || 'Non classée',

                        // Niveau d'enseignement
                        niveau_id: niveauEnseignement.id || null,
                        niveau_code: niveauEnseignement.code || '',
                        niveau_libelle: niveauEnseignement.libelle || 'Non spécifié',

                        // Matière parent
                        parent_id: matiereParent.id || null,
                        parent_code: matiereParent.code || '',
                        parent_libelle: matiereParent.libelle || '',
                        has_parent: !!(matiereParent.id),

                        // Classification et métadonnées
                        type: type,
                        type_display: getTypeDisplay(type),
                        couleur: couleur,
                        couleur_fond: couleur.background,
                        couleur_texte: couleur.text,
                        couleur_bordure: couleur.border,

                        // Informations d'ordre et tri
                        ordre: matiere.numOrdre || (index + 1),
                        numeroOrdre: index + 1,

                        // Indicateurs
                        is_academic: ['SCIENTIFIQUE', 'LITTERAIRE', 'GENERAL'].includes(type),
                        is_technical: ['TECHNIQUE', 'PROFESSIONNEL'].includes(type),
                        is_special: ['SPORTIVE', 'ARTISTIQUE', 'AUTRES'].includes(type),
                        has_bonus: matiere.bonus > 0,
                        is_pec: matiere.pec > 0,

                        // Affichage optimisé
                        display_name: matiere.libelle,
                        display_code: `${matiere.code} - ${matiere.libelle}`,
                        display_categorie: categorie.libelle || 'Non classée',
                        display_niveau: niveauEnseignement.libelle || 'Non spécifié',
                        display_parent: matiereParent.libelle || 'Aucun parent',
                        display_bonus: matiere.bonus > 0 ? `+${matiere.bonus}` : '0',
                        display_pec: matiere.pec > 0 ? 'Oui' : 'Non',
                        badge_style: getBadgeStyle(type),

                        // Données brutes pour debug
                        raw_data: matiere
                    };
                });

                // Tri par numéro d'ordre puis par libellé
                processedMatieres.sort((a, b) => {
                    if (a.ordre !== b.ordre) {
                        return a.ordre - b.ordre;
                    }
                    return a.libelle.localeCompare(b.libelle);
                });
            }

            setToCache(cacheKey, processedMatieres, CACHE_DURATION);
            setData(processedMatieres);
        } catch (err) {
            console.error('Erreur lors de la récupération des matières:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des matières',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data,
                url: err.config?.url
            });
        } finally {
            setLoading(false);
        }
    }, []);

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
// HOOK POUR RÉCUPÉRER LES DONNÉES DE RÉFÉRENCE
// ===========================
/**
 * Récupère les données de référence pour le formulaire
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useReferenceData = (refreshTrigger = 0) => {
    const [categories, setCategories] = useState([]);
    const [niveaux, setNiveaux] = useState([]);
    const [matieresParent, setMatieresParent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReferenceData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Récupération parallèle des données de référence
            const [categoriesRes, niveauxRes, matieresRes] = await Promise.all([
                axios.get(`${getFullUrl()}${CATEGORIES_ENDPOINT}`),
                axios.get(`${getFullUrl()}${NIVEAUX_ENDPOINT}`),
                axios.get(`${getFullUrl()}${MATIERES_ENDPOINT}`)
            ]);

            // Traitement des catégories
            const processedCategories = categoriesRes.data?.map(cat => ({
                value: cat.id,
                label: `${cat.code} - ${cat.libelle}`,
                ...cat
            })) || [];

            // Traitement des niveaux
            const processedNiveaux = niveauxRes.data?.map(niveau => ({
                value: niveau.id,
                label: niveau.libelle,
                ...niveau
            })) || [];

            // Traitement des matières parent
            const processedMatieresParent = matieresRes.data?.map(matiere => ({
                value: matiere.id,
                label: `${matiere.code} - ${matiere.libelle}`,
                ...matiere
            })) || [];

            setCategories(processedCategories);
            setNiveaux(processedNiveaux);
            setMatieresParent(processedMatieresParent);

        } catch (err) {
            console.error('Erreur lors de la récupération des données de référence:', err);
            setError({
                message: 'Erreur lors du chargement des données de référence',
                type: 'ReferenceDataError'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferenceData();
    }, [refreshTrigger, fetchReferenceData]);

    return {
        categories,
        niveaux,
        matieresParent,
        loading,
        error,
        refetch: fetchReferenceData
    };
};

// ===========================
// FONCTIONS UTILITAIRES POUR LA CLASSIFICATION
// ===========================

/**
 * Détermine le type d'une matière basé sur la catégorie
 * @param {string} categorieLibelle
 * @returns {string}
 */
const determineTypeMatiere = (categorieLibelle) => {
    if (!categorieLibelle) return 'AUTRES';

    const libelle = categorieLibelle.toLowerCase();

    if (libelle.includes('scientifique') || libelle.includes('sciences')) return 'SCIENTIFIQUE';
    if (libelle.includes('littéraire') || libelle.includes('lettres')) return 'LITTERAIRE';
    if (libelle.includes('technique')) return 'TECHNIQUE';
    if (libelle.includes('sportive') || libelle.includes('sport')) return 'SPORTIVE';
    if (libelle.includes('artistique') || libelle.includes('arts')) return 'ARTISTIQUE';
    if (libelle.includes('professionnel')) return 'PROFESSIONNEL';
    if (libelle.includes('général') || libelle.includes('general')) return 'GENERAL';

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
        'GENERAL': 'Général',
        'AUTRES': 'Autres'
    };

    return mapping[type] || type;
};

/**
 * Obtient les couleurs associées à un type de matière
 * @param {string} type
 * @returns {object}
 */
const getCouleurMatiere = (type) => {
    const couleurs = {
        'SCIENTIFIQUE': { background: '#dcfce7', text: '#16a34a', border: '#22c55e' },
        'LITTERAIRE': { background: '#fef3c7', text: '#d97706', border: '#f59e0b' },
        'SPORTIVE': { background: '#dbeafe', text: '#2563eb', border: '#3b82f6' },
        'TECHNIQUE': { background: '#f3e8ff', text: '#9333ea', border: '#a855f7' },
        'PROFESSIONNEL': { background: '#fce7f3', text: '#ec4899', border: '#f472b6' },
        'ARTISTIQUE': { background: '#fef2f2', text: '#dc2626', border: '#ef4444' },
        'GENERAL': { background: '#f1f5f9', text: '#475569', border: '#64748b' },
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
        'GENERAL': 'gray',
        'AUTRES': 'gray'
    };

    return styles[type] || 'gray';
};

// ===========================
// CONFIGURATION DU TABLEAU DES MATIÈRES
// ===========================
export const matieresTableConfig = {
    columns: [
        {
            title: 'Code',
            dataKey: 'code',
            flexGrow: 0.8,
            minWidth: 80,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '6px 10px',
                    backgroundColor: rowData.couleur_fond,
                    color: rowData.couleur_texte,
                    border: `1px solid ${rowData.couleur_bordure}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textAlign: 'center',
                    fontFamily: 'monospace'
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
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>{rowData.type_display}</span>
                            {rowData.has_parent && (
                                <span style={{
                                    padding: '1px 4px',
                                    backgroundColor: '#e0f2fe',
                                    color: '#0369a1',
                                    borderRadius: '3px',
                                    fontSize: '9px'
                                }}>
                                    Sous-matière
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Enseignement',
            dataKey: 'niveau_libelle',
            flexGrow: 1.5,
            minWidth: 140,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#475569',
                        marginBottom: '2px'
                    }}>
                        {rowData.niveau_libelle}
                    </div>
                    {/* <div style={{ 
                        fontSize: '10px',
                        color: '#64748b'
                    }}>
                        Code: {rowData.niveau_code}
                    </div> */}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Catégorie',
            dataKey: 'categorie_libelle',
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
                    > */}
                    {rowData.categorie_libelle}
                    {/* </Badge> */}
                    {/* <div style={{ 
                        fontSize: '10px', 
                        color: '#64748b'
                    }}>
                        Code: {rowData.categorie_code}
                    </div> */}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Parent',
            dataKey: 'parent_libelle',
            flexGrow: 1.3,
            minWidth: 130,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    {rowData.has_parent ? (
                        <div>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '2px'
                            }}>
                                {rowData.parent_libelle}
                            </div>
                            {/* <div style={{ 
                                fontSize: '10px',
                                color: '#64748b'
                            }}>
                                Code: {rowData.parent_code}
                            </div> */}
                        </div>
                    ) : (
                        <div style={{
                            padding: '4px 8px',
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            borderRadius: '4px',
                            fontSize: '11px',
                            textAlign: 'center'
                        }}>
                            Matière principale
                        </div>
                    )}
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
            title: 'P.E.C / Bonus',
            dataKey: 'pec_bonus',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '12px',
                        marginBottom: '4px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            padding: '2px 6px',
                            backgroundColor: rowData.is_pec ? '#dcfce7' : '#f1f5f9',
                            color: rowData.is_pec ? '#16a34a' : '#64748b',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '500'
                        }}>
                            P.E.C
                        </div>
                        {rowData.has_bonus && (
                            <div style={{
                                padding: '2px 6px',
                                backgroundColor: '#fef3c7',
                                color: '#d97706',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '500'
                            }}>
                                {rowData.display_bonus}
                            </div>
                        )}
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
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'categorie_libelle',
            label: 'Catégorie',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'niveau_libelle',
            label: 'Niveau d\'enseignement',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'type_display',
            label: 'Type de matière',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'has_parent',
            label: 'A un parent',
            type: 'boolean',
            tagColor: 'orange'
        },
        {
            field: 'is_pec',
            label: 'P.E.C activé',
            type: 'boolean',
            tagColor: 'cyan'
        },
        {
            field: 'has_bonus',
            label: 'A un bonus',
            type: 'boolean',
            tagColor: 'yellow'
        }
    ],
    searchableFields: [
        'code',
        'libelle',
        'categorie_libelle',
        'niveau_libelle',
        'parent_libelle',
        'type_display'
    ],
    actions: [
        // {
        //     type: 'view',
        //     icon: <FiEye />,
        //     tooltip: 'Voir les détails de la matière',
        //     color: '#3498db'
        // },
        {
            type: 'edit',
            icon: <FiEdit size={17} />,
            tooltip: 'Modifier la matière',
            color: '#f39c12'
        },
        // {
        //     type: 'download',
        //     icon: <FiDownload />,
        //     tooltip: 'Exporter les données',
        //     color: '#9b59b6'
        // },
        // {
        //     type: 'delete',
        //     icon: <FiTrash2 />,
        //     tooltip: 'Supprimer la matière',
        //     color: '#e74c3c'
        // }
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