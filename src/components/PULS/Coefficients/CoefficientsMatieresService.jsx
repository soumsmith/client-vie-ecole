/**
 * Service pour la gestion des coefficients des matières par branche
 * VERSION COMPLÈTE avec API réelle et DataTable éditable
 * MISE À JOUR: API maj-coefficients et format données conforme
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, Input } from 'rsuite';
import { FiEye, FiEdit, FiSave, FiDownload, FiBookOpen, FiHash, FiLayers } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from '../../hooks/useDynamicParams';
import axios from 'axios';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

/**
 * Récupère la liste des coefficients des matières pour une branche donnée
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useCoefficientsMatieresData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [modifiedCoefficients, setModifiedCoefficients] = useState(new Map());
    const [selectedBrancheData, setSelectedBrancheData] = useState(null);
    const apiUrls = useAllApiUrls();

    const { ecoleId: dynamicEcoleId } = usePulsParams();

    const searchCoefficients = useCallback(async (brancheId, ecoleId = dynamicEcoleId) => {
        if (!brancheId) {
            setError({
                message: 'Veuillez sélectionner une branche',
                type: 'ValidationError',
                code: 'MISSING_BRANCHE'
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearchPerformed(false);
            setModifiedCoefficients(new Map());

            const cacheKey = `coefficients-branche-${brancheId}-${ecoleId}`;

            // Vérifier le cache
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setData(cachedData);
                setSearchPerformed(true);
                setLoading(false);
                return;
            }

            // Récupérer les informations complètes de la branche
            const brancheResponse = await axios.get(apiUrls.branches.getByNiveauEnseignement());
            const brancheInfo = brancheResponse.data?.find(b => b.id === brancheId);
            setSelectedBrancheData(brancheInfo);

            // Appel direct à l'API
            const response = await axios.get(apiUrls.coefficients.getByBranche(brancheId));

            // Traitement des coefficients selon la vraie structure de l'API
            let processedCoefficients = [];
            if (response.data && Array.isArray(response.data)) {
                processedCoefficients = response.data.map((item, index) => {
                    const matiere = item.matiere || {};
                    const categorieMatiere = matiere.categorie || {};

                    // Le coefficient est dans la propriété "coef" selon l'API
                    const coefficientValue = parseFloat(item.coef || 0);

                    return {
                        id: item.id || `coeff-${index}`,

                        // Informations de la matière
                        matiere_id: matiere.id || null,
                        matiere_code: matiere.code || '',
                        matiere_libelle: matiere.libelle || 'Matière inconnue',
                        matiere_abbreviation: matiere.abbreviation || '',
                        matiere_numOrdre: matiere.numOrdre || 0,

                        // Informations de la catégorie (dans matiere.categorie)
                        categorie_id: categorieMatiere.id || null,
                        categorie_code: categorieMatiere.code || '',
                        categorie_libelle: categorieMatiere.libelle || 'Catégorie inconnue',

                        // Coefficient (valeur principale depuis "coef")
                        coefficient: coefficientValue,
                        coefficient_original: coefficientValue,

                        // Informations de branche
                        branche_id: item.branche?.id || brancheId,
                        branche_libelle: item.branche?.libelle || '',

                        // Informations école
                        ecole_id: item.ecole?.id || null,
                        ecole_libelle: item.ecole?.libelle || '',
                        ecole_code: item.ecole?.code || '',

                        // Numéro d'ordre (utiliser celui de la matière pour un tri logique)
                        ordre: matiere.numOrdre || (index + 1),

                        // Statut de modification
                        isModified: false,
                        hasError: false,
                        errorMessage: '',

                        // Type de matière pour classification
                        type_matiere: determineTypeMatiere(categorieMatiere.libelle),
                        couleur_type: getCouleurTypeMatiere(determineTypeMatiere(categorieMatiere.libelle)),

                        // Informations d'affichage
                        display_matiere: `${matiere.code || ''} - ${matiere.libelle || 'Matière'}`,
                        display_categorie: categorieMatiere.libelle || 'Catégorie',
                        display_coefficient: formatCoefficient(coefficientValue),

                        // Métadonnées
                        dateCreation: item.dateCreation || '',
                        dateUpdate: item.dateUpdate || '',

                        // Données brutes pour debug
                        raw_data: item
                    };
                });

                // Tri par catégorie puis par nom de matière
                processedCoefficients.sort((a, b) => {
                    if (a.categorie_libelle !== b.categorie_libelle) {
                        return a.categorie_libelle.localeCompare(b.categorie_libelle);
                    }
                    return a.matiere_libelle.localeCompare(b.matiere_libelle);
                });
            }

            setToCache(cacheKey, processedCoefficients, CACHE_DURATION);
            setData(processedCoefficients);
            setSearchPerformed(true);
        } catch (err) {
            console.error('Erreur lors de la récupération des coefficients:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la recherche des coefficients',
                type: err.name || 'SearchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data,
                url: err.config?.url
            });
        } finally {
            setLoading(false);
        }
    }, [dynamicEcoleId, apiUrls.branches, apiUrls.coefficients]);

    // Fonction pour mettre à jour un coefficient
    const updateCoefficient = useCallback((itemId, newCoefficient) => {
        const numCoeff = parseFloat(newCoefficient);

        // Validation du coefficient
        if (isNaN(numCoeff) || numCoeff < 0 || numCoeff > 20) {
            setData(prevData =>
                prevData.map(item =>
                    item.id === itemId
                        ? {
                            ...item,
                            hasError: true,
                            errorMessage: 'Le coefficient doit être entre 0 et 20',
                            coefficient: newCoefficient
                        }
                        : item
                )
            );
            return;
        }

        setData(prevData => {
            const newData = prevData.map(item => {
                if (item.id === itemId) {
                    const isModified = numCoeff !== item.coefficient_original;
                    return {
                        ...item,
                        coefficient: numCoeff,
                        isModified,
                        hasError: false,
                        errorMessage: ''
                    };
                }
                return item;
            });

            // Mettre à jour la map des modifications
            const modifiedItem = newData.find(item => item.id === itemId);
            if (modifiedItem?.isModified) {
                setModifiedCoefficients(prev => new Map(prev.set(itemId, {
                    id: itemId,
                    coefficient: numCoeff,
                    coefficient_original: modifiedItem.coefficient_original,
                    raw_data: modifiedItem.raw_data
                })));
            } else {
                setModifiedCoefficients(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(itemId);
                    return newMap;
                });
            }

            return newData;
        });
    }, []);

    // Fonction pour sauvegarder les modifications selon l'API réelle
    const saveModifications = useCallback(async () => {
        if (modifiedCoefficients.size === 0) {
            return { success: true, message: 'Aucune modification à sauvegarder' };
        }

        try {
            setLoading(true);
            const modifications = Array.from(modifiedCoefficients.values());

            // Formater les données selon l'API maj-coefficients
            const apiData = modifications.map(mod => {
                const rawData = mod.raw_data;
                return {
                    id: mod.id,
                    coef: mod.coefficient,
                    branche: rawData.branche ? {
                        id: rawData.branche.id,
                        libelle: rawData.branche.libelle,
                        filiere: rawData.branche.filiere || null,
                        niveau: rawData.branche.niveau || null,
                        niveauEnseignement: rawData.branche.niveauEnseignement || null,
                        programme: rawData.branche.programme || null,
                        serie: rawData.branche.serie || null
                    } : selectedBrancheData,
                    ecole: {
                        id: dynamicEcoleId.toString()
                    },
                    matiere: rawData.matiere
                };
            });

            console.log('Données à envoyer à l\'API:', apiData);

            // Appel API pour sauvegarder
            const response = await axios.post(apiUrls.coefficients.majCoefficients(), apiData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            if (response.status === 200 || response.status === 201) {
                // Mettre à jour les données locales
                setData(prevData =>
                    prevData.map(item => ({
                        ...item,
                        coefficient_original: item.coefficient,
                        isModified: false
                    }))
                );

                setModifiedCoefficients(new Map());

                return { success: true, message: `${modifications.length} coefficient(s) mis à jour avec succès` };
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }
        } catch (err) {
            console.error('Erreur lors de la sauvegarde:', err);

            let errorMessage = 'Erreur lors de la sauvegarde';
            if (err.response) {
                errorMessage = err.response.data?.message || `Erreur serveur: ${err.response.status}`;
            } else if (err.request) {
                errorMessage = 'Impossible de contacter le serveur';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'La requête a expiré';
            }

            return {
                success: false,
                message: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, [modifiedCoefficients, selectedBrancheData, dynamicEcoleId, apiUrls.coefficients]);

    const clearResults = useCallback(() => {
        setData([]);
        setError(null);
        setSearchPerformed(false);
        setLoading(false);
        setModifiedCoefficients(new Map());
        setSelectedBrancheData(null);
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            // Possibilité de rafraîchir si besoin
        }
    }, [refreshTrigger]);

    return {
        coefficients: data,
        loading,
        error,
        searchPerformed,
        modifiedCoefficients,
        searchCoefficients,
        updateCoefficient,
        saveModifications,
        clearResults
    };
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Détermine le type de matière basé sur la catégorie
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
    if (libelle.includes('général')) return 'GENERAL';

    return 'AUTRES';
};

/**
 * Obtient les couleurs associées à un type de matière
 * @param {string} type
 * @returns {object}
 */
const getCouleurTypeMatiere = (type) => {
    const couleurs = {
        'SCIENTIFIQUE': { background: '#dcfce7', text: '#16a34a', border: '#22c55e' },
        'LITTERAIRE': { background: '#fef3c7', text: '#d97706', border: '#f59e0b' },
        'TECHNIQUE': { background: '#f3e8ff', text: '#9333ea', border: '#a855f7' },
        'SPORTIVE': { background: '#dbeafe', text: '#2563eb', border: '#3b82f6' },
        'ARTISTIQUE': { background: '#fef2f2', text: '#dc2626', border: '#ef4444' },
        'PROFESSIONNEL': { background: '#fce7f3', text: '#ec4899', border: '#f472b6' },
        'GENERAL': { background: '#f1f5f9', text: '#475569', border: '#64748b' },
        'AUTRES': { background: '#f8fafc', text: '#64748b', border: '#94a3b8' }
    };

    return couleurs[type] || couleurs['AUTRES'];
};

/**
 * Formate l'affichage d'un coefficient
 * @param {number|string} coefficient
 * @returns {string}
 */
const formatCoefficient = (coefficient) => {
    const num = parseFloat(coefficient);
    if (isNaN(num)) return '0';
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
};

// ===========================
// CONFIGURATION DU TABLEAU DES COEFFICIENTS
// ===========================
export const coefficientsTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'ordre',
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
                    {rowData.ordre}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Code',
            dataKey: 'matiere_code',
            flexGrow: 0.5,
            minWidth: 80,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '4px 8px',
                    backgroundColor: rowData.couleur_type.background,
                    color: rowData.couleur_type.text,
                    border: `1px solid ${rowData.couleur_type.border}`,
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textAlign: 'center',
                    fontFamily: 'monospace'
                }}>
                    {rowData.matiere_code || 'N/A'}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Matière',
            dataKey: 'matiere_libelle',
            flexGrow: 2.5,
            minWidth: 200,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '8px',
                        backgroundColor: rowData.couleur_type.background,
                        border: `2px solid ${rowData.couleur_type.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <FiBookOpen size={16} color={rowData.couleur_type.text} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontWeight: '600',
                            color: '#1e293b',
                            fontSize: '14px',
                            marginBottom: '2px'
                        }}>
                            {rowData.matiere_libelle}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#64748b'
                        }}>
                            {rowData.matiere_abbreviation && `Abrév: ${rowData.matiere_abbreviation}`}
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Catégorie',
            dataKey: 'categorie_libelle',
            flexGrow: 1.5,
            minWidth: 140,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    {rowData.display_categorie}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Coefficient',
            dataKey: 'coefficient',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData, updateCallback) => (
                <CoefficientEditableCell
                    rowData={rowData}
                    onUpdate={updateCallback}
                />
            ),
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'isModified',
            flexGrow: 0.8,
            minWidth: 80,
            cellType: 'custom',
            customRenderer: (rowData) => {
                if (rowData.hasError) {
                    return (
                        <div style={{
                            padding: '3px 6px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #ef4444',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '500',
                            textAlign: 'center'
                        }}>
                            Erreur
                        </div>
                    );
                }

                if (rowData.isModified) {
                    return (
                        <div style={{
                            padding: '3px 6px',
                            backgroundColor: '#fef3c7',
                            color: '#d97706',
                            border: '1px solid #f59e0b',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '500',
                            textAlign: 'center'
                        }}>
                            Modifié
                        </div>
                    );
                }

                return (
                    <div style={{
                        padding: '3px 6px',
                        backgroundColor: '#dcfce7',
                        color: '#16a34a',
                        border: '1px solid #22c55e',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}>
                        Normal
                    </div>
                );
            },
            sortable: false
        },
        // {
        //     title: 'Actions',
        //     dataKey: 'actions',
        //     flexGrow: 1,
        //     minWidth: 100,
        //     cellType: 'actions',
        //     fixed: 'right'
        // }
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
            field: 'type_matiere',
            label: 'Type de matière',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'isModified',
            label: 'Statut modification',
            type: 'boolean',
            tagColor: 'orange'
        }
    ],
    searchableFields: [
        'matiere_code',
        'matiere_libelle',
        'matiere_abbreviation',
        'categorie_libelle',
        'categorie_code'
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails de la matière',
            color: '#3498db'
        },
        {
            type: 'download',
            icon: <FiDownload />,
            tooltip: 'Exporter les données',
            color: '#9b59b6'
        }
    ],
    // Configuration supplémentaire pour le tableau
    defaultSortField: 'ordre',
    defaultSortOrder: 'asc',
    pageSize: 20,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};

// ===========================
// COMPOSANT POUR CELLULE COEFFICIENT ÉDITABLE
// ===========================
const CoefficientEditableCell = ({ rowData, onUpdate }) => {
    const [value, setValue] = useState(rowData.coefficient.toString());
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setValue(rowData.coefficient.toString());
    }, [rowData.coefficient]);

    const handleChange = (newValue) => {
        setValue(newValue);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onUpdate && value !== rowData.coefficient.toString()) {
            onUpdate(rowData.id, value);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <Input
                value={value}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                size="sm"
                style={{
                    width: '80px',
                    textAlign: 'center',
                    fontWeight: '600',
                    backgroundColor: rowData.hasError ? '#fee2e2' :
                        rowData.isModified ? '#fef3c7' :
                            isFocused ? '#f0f9ff' : 'white',
                    border: rowData.hasError ? '2px solid #ef4444' :
                        rowData.isModified ? '2px solid #f59e0b' :
                            isFocused ? '2px solid #3b82f6' : '1px solid #e2e8f0'
                }}
                placeholder="0"
            />
            {rowData.hasError && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    fontSize: '10px',
                    color: '#dc2626',
                    backgroundColor: 'white',
                    border: '1px solid #ef4444',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    zIndex: 10,
                    marginTop: '2px'
                }}>
                    {rowData.errorMessage}
                </div>
            )}
        </div>
    );
};

// ===========================
// FONCTION UTILITAIRE POUR COULEUR DE BADGE
// ===========================
const getBadgeColorFromType = (type) => {
    const colorMap = {
        'SCIENTIFIQUE': 'green',
        'LITTERAIRE': 'orange',
        'TECHNIQUE': 'violet',
        'SPORTIVE': 'blue',
        'ARTISTIQUE': 'red',
        'PROFESSIONNEL': 'pink',
        'GENERAL': 'gray',
        'AUTRES': 'gray'
    };

    return colorMap[type] || 'gray';
};