/**
 * Service pour l'importation d'élèves via fichier CSV/Excel
 * VERSION COMPLÈTE avec toutes les colonnes internes
 */

import { useState, useCallback } from 'react';
import { FiEye, FiCheck, FiX, FiUser, FiCalendar, FiMapPin, FiPhone, FiMail, FiHome, FiUsers } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const DEFAULT_ECOLE_ID = 38;
const DEFAULT_ANNEE_ID = 226;
const DEFAULT_TYPE_ACTION = 'INSCRIPTION';

// Liste complète des colonnes internes
const COLONNES_ELEVE = [
    'matricule',
    'nom', 
    'prenoms',
    'statut',
    'nationalite',
    'ivoirien',
    'etranger_africain',
    'etranger_non_africain',
    'sexe',
    'lv2',
    'datenaissance',
    'branche',
    'lieun',
    'adresse',
    'mobile',
    'mobile2',
    'pere',
    'mere',
    'tuteur',
    'redoublant',
    'regime',
    'decision_ant',
    'extrait_numero',
    'extrait_date',
    'extrait_lieu',
    'decision_aff'
];

// Regroupement des colonnes par catégorie pour une meilleure organisation
const CATEGORIES_COLONNES = {
    'Identification': ['matricule', 'nom', 'prenoms', 'statut'],
    'Nationalité': ['nationalite', 'ivoirien', 'etranger_africain', 'etranger_non_africain'],
    'Informations personnelles': ['sexe', 'datenaissance', 'lieun', 'adresse'],
    'Scolarité': ['branche', 'lv2', 'redoublant', 'regime', 'decision_ant'],
    'Contact': ['mobile', 'mobile2'],
    'Famille': ['pere', 'mere', 'tuteur'],
    'État civil': ['extrait_numero', 'extrait_date', 'extrait_lieu', 'decision_aff']
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Formate une date pour l'affichage
 */
const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    try {
        let date;
        if (typeof dateString === 'string') {
            // Format DD/MM/YYYY ou DD-MM-YYYY
            if (dateString.includes('/') || dateString.includes('-')) {
                const separator = dateString.includes('/') ? '/' : '-';
                const parts = dateString.split(separator);
                if (parts.length === 3) {
                    // Supposer DD/MM/YYYY
                    date = new Date(parts[2], parts[1] - 1, parts[0]);
                }
            } else {
                date = new Date(dateString);
            }
        } else {
            date = new Date(dateString);
        }
        
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

/**
 * Nettoie et normalise une chaîne de caractères
 */
const cleanString = (str) => {
    if (!str) return '';
    return String(str).trim().replace(/\s+/g, ' ');
};

/**
 * Normalise le sexe
 */
const normalizeSexe = (sexe) => {
    if (!sexe) return '';
    const s = cleanString(sexe).toLowerCase();
    if (['m', 'masculin', 'male'].includes(s)) return 'MASCULIN';
    if (['f', 'feminin', 'female'].includes(s)) return 'FEMININ';
    return s.toUpperCase();
};

/**
 * Normalise les valeurs booléennes (Oui/Non, 1/0, true/false)
 */
const normalizeBoolean = (value) => {
    if (!value) return '';
    const v = cleanString(value).toLowerCase();
    if (['oui', 'yes', '1', 'true', 'vrai'].includes(v)) return 'OUI';
    if (['non', 'no', '0', 'false', 'faux'].includes(v)) return 'NON';
    return value;
};

/**
 * Valide une ligne d'élève importée
 */
const validateEleveRow = (row, rowIndex) => {
    const errors = [];
    const warnings = [];
    
    // Champs obligatoires
    if (!cleanString(row.nom)) {
        errors.push('Nom requis');
    }
    if (!cleanString(row.prenoms)) {
        errors.push('Prénoms requis');
    }
    if (!cleanString(row.matricule)) {
        errors.push('Matricule requis');
    }
    if (!cleanString(row.sexe)) {
        errors.push('Sexe requis');
    }
    
    // Validation du sexe
    const sexe = cleanString(row.sexe).toLowerCase();
    if (sexe && !['masculin', 'feminin', 'm', 'f', 'male', 'female'].includes(sexe)) {
        errors.push('Sexe invalide (M/F ou Masculin/Féminin)');
    }
    
    // Validation de la date de naissance
    if (row.datenaissance && formatDate(row.datenaissance) === 'Date invalide') {
        errors.push('Date de naissance invalide');
    }
    
    // Validation de l'extrait de naissance si date fournie
    if (row.extrait_date && formatDate(row.extrait_date) === 'Date invalide') {
        errors.push('Date extrait de naissance invalide');
    }
    
    // Vérifications optionnelles avec warnings
    if (!row.datenaissance) {
        warnings.push('Date de naissance non fournie');
    }
    if (!row.lieun) {
        warnings.push('Lieu de naissance non fourni');
    }
    if (!row.mobile && !row.mobile2) {
        warnings.push('Aucun numéro de téléphone fourni');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
};

/**
 * Obtient la catégorie d'une colonne
 */
const getCategorieFromColumn = (columnName) => {
    for (const [categorie, columns] of Object.entries(CATEGORIES_COLONNES)) {
        if (columns.includes(columnName)) {
            return categorie;
        }
    }
    return 'Autre';
};

// ===========================
// HOOK POUR L'IMPORTATION D'ÉLÈVES
// ===========================
export const useImportElevesData = () => {
    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [importing, setImporting] = useState(false);
    const apiUrls = useAllApiUrls();

    /**
     * Parse un fichier CSV
     */
    const parseCSV = useCallback((file) => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                encoding: 'UTF-8',
                dynamicTyping: false,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error(`Erreur CSV: ${results.errors[0].message}`));
                    } else {
                        resolve(results.data);
                    }
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }, []);

    /**
     * Parse un fichier Excel
     */
    const parseExcel = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Prendre la première feuille
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // Convertir en JSON avec header
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                        header: 1,
                        defval: ''
                    });
                    
                    if (jsonData.length < 2) {
                        reject(new Error('Le fichier doit contenir au moins une ligne d\'en-tête et une ligne de données'));
                        return;
                    }
                    
                    // Première ligne = headers
                    const headers = jsonData[0];
                    const rows = jsonData.slice(1);
                    
                    // Convertir en objets
                    const parsedData = rows.map(row => {
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index] || '';
                        });
                        return obj;
                    });
                    
                    resolve(parsedData);
                } catch (error) {
                    reject(new Error(`Erreur Excel: ${error.message}`));
                }
            };
            reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
            reader.readAsArrayBuffer(file);
        });
    }, []);

    /**
     * Traite et formate les données importées
     */
    const processImportedData = useCallback((rawData) => {
        return rawData.map((row, index) => {
            // Normalisation des données selon les colonnes internes
            const normalizedRow = {};
            
            // Traitement direct des colonnes connues
            COLONNES_ELEVE.forEach(col => {
                if (row[col] !== undefined) {
                    normalizedRow[col] = cleanString(row[col]);
                }
            });
            
            // Normalisation des noms de colonnes pour les variations possibles
            Object.keys(row).forEach(key => {
                const lowerKey = key.toLowerCase().trim();
                
                // Mappings spéciaux pour les variations de noms de colonnes
                if ((lowerKey.includes('nom') && !lowerKey.includes('prenom')) || lowerKey === 'nom') {
                    normalizedRow.nom = cleanString(row[key]);
                } else if (lowerKey.includes('prenom') || lowerKey === 'prenoms') {
                    normalizedRow.prenoms = cleanString(row[key]);
                } else if (lowerKey.includes('matricule')) {
                    normalizedRow.matricule = cleanString(row[key]);
                } else if (lowerKey.includes('sexe') || lowerKey.includes('genre')) {
                    normalizedRow.sexe = cleanString(row[key]);
                } else if ((lowerKey.includes('naissance') && lowerKey.includes('date')) || lowerKey === 'datenaissance') {
                    normalizedRow.datenaissance = cleanString(row[key]);
                } else if ((lowerKey.includes('lieu') && lowerKey.includes('naissance')) || lowerKey === 'lieun') {
                    normalizedRow.lieun = cleanString(row[key]);
                } else if (lowerKey.includes('nationalite')) {
                    normalizedRow.nationalite = cleanString(row[key]);
                } else if (lowerKey.includes('telephone') || lowerKey.includes('mobile')) {
                    if (!normalizedRow.mobile) {
                        normalizedRow.mobile = cleanString(row[key]);
                    } else {
                        normalizedRow.mobile2 = cleanString(row[key]);
                    }
                } else if (lowerKey.includes('adresse')) {
                    normalizedRow.adresse = cleanString(row[key]);
                }
                
                // Si la colonne correspond exactement à une colonne interne, la garder
                if (COLONNES_ELEVE.includes(key)) {
                    normalizedRow[key] = cleanString(row[key]);
                }
            });

            // Normalisation des valeurs spéciales
            if (normalizedRow.sexe) {
                normalizedRow.sexe = normalizeSexe(normalizedRow.sexe);
            }
            
            // Normaliser les booléens
            ['ivoirien', 'etranger_africain', 'etranger_non_africain', 'redoublant'].forEach(col => {
                if (normalizedRow[col]) {
                    normalizedRow[col] = normalizeBoolean(normalizedRow[col]);
                }
            });

            // Validation
            const validation = validateEleveRow(normalizedRow, index);
            
            // Compter les colonnes renseignées
            const colonnesRenseignees = COLONNES_ELEVE.filter(col => 
                normalizedRow[col] && normalizedRow[col] !== ''
            ).length;

            // Compter les catégories représentées
            const categoriesRepresentees = new Set();
            COLONNES_ELEVE.forEach(col => {
                if (normalizedRow[col] && normalizedRow[col] !== '') {
                    categoriesRepresentees.add(getCategorieFromColumn(col));
                }
            });

            return {
                id: `import-${index + 1}`,
                numeroLigne: index + 1,
                
                // Toutes les colonnes internes
                ...COLONNES_ELEVE.reduce((acc, col) => {
                    acc[col] = normalizedRow[col] || '';
                    return acc;
                }, {}),
                
                // Champs calculés pour l'affichage
                nomComplet: `${normalizedRow.nom || ''} ${normalizedRow.prenoms || ''}`.trim(),
                sexe_display: normalizedRow.sexe || 'Non spécifié',
                datenaissance_display: formatDate(normalizedRow.datenaissance),
                extrait_date_display: formatDate(normalizedRow.extrait_date),
                lieun_display: normalizedRow.lieun || 'Non renseigné',
                nationalite_display: normalizedRow.nationalite || 'Non renseignée',
                
                // Statistiques
                colonnesRenseignees,
                categoriesRepresentees: categoriesRepresentees.size,
                
                // Statut de validation
                isValid: validation.isValid,
                errors: validation.errors,
                warnings: validation.warnings,
                status: validation.isValid ? 'valid' : 'error',
                status_display: validation.isValid ? 'Valide' : 'Erreur',
                
                // Données brutes pour envoi API
                rawData: normalizedRow,
                
                // Sélection pour import
                selected: validation.isValid
            };
        });
    }, []);

    /**
     * Charge un fichier CSV/Excel
     */
    const loadFile = useCallback(async (file) => {
        try {
            setLoading(true);
            setError(null);
            setData([]);
            setOriginalData([]);
            setSelectedRows([]);

            // Validation du fichier
            const allowedTypes = [
                'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.csv'
            ];
            
            const fileExtension = file.name.toLowerCase().split('.').pop();
            const isValidType = allowedTypes.includes(file.type) || 
                              ['csv', 'xls', 'xlsx'].includes(fileExtension);
            
            if (!isValidType) {
                throw new Error('Format de fichier non supporté. Utilisez CSV ou Excel (.xls, .xlsx)');
            }

            // Info fichier
            setFileInfo({
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            });

            let rawData;
            
            // Parse selon le type
            if (file.type === 'text/csv' || fileExtension === 'csv') {
                rawData = await parseCSV(file);
            } else {
                rawData = await parseExcel(file);
            }

            if (!rawData || rawData.length === 0) {
                throw new Error('Le fichier est vide ou ne contient pas de données');
            }

            // Traitement des données
            const processedData = processImportedData(rawData);
            
            setOriginalData(rawData);
            setData(processedData);
            
            // Sélectionner automatiquement les lignes valides
            const validIds = processedData
                .filter(row => row.isValid)
                .map(row => row.id);
            setSelectedRows(validIds);

        } catch (err) {
            console.error('Erreur lors du chargement:', err);
            setError({
                message: err.message || 'Erreur lors du chargement du fichier',
                type: 'FileLoadError'
            });
        } finally {
            setLoading(false);
        }
    }, [parseCSV, parseExcel, processImportedData]);

    /**
     * Importe les élèves sélectionnés
     */
    const importSelectedEleves = useCallback(async (brancheId, ecoleId = DEFAULT_ECOLE_ID, anneeId = DEFAULT_ANNEE_ID) => {
        try {
            setImporting(true);
            setError(null);

            if (!brancheId) {
                throw new Error('Veuillez sélectionner une branche');
            }

            if (selectedRows.length === 0) {
                throw new Error('Veuillez sélectionner au moins un élève à importer');
            }

            // Récupérer les données sélectionnées
            const selectedData = data.filter(row => selectedRows.includes(row.id));
            
            // Filtrer seulement les lignes valides
            const validData = selectedData.filter(row => row.isValid);
            
            if (validData.length === 0) {
                throw new Error('Aucune ligne valide sélectionnée pour l\'importation');
            }

            // Formater pour l'API avec toutes les colonnes
            const importData = validData.map(row => ({
                // Inclure toutes les colonnes internes
                ...COLONNES_ELEVE.reduce((acc, col) => {
                    if (row[col] && row[col] !== '') {
                        acc[col] = row[col];
                    }
                    return acc;
                }, {})
            }));

            // Appel API
            const url = apiUrls.imports.importElevesComplet(DEFAULT_TYPE_ACTION, brancheId);
            
            const response = await axios.post(url, importData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                imported: validData.length,
                response: response.data
            };

        } catch (err) {
            console.error('Erreur lors de l\'importation:', err);
            const error = {
                message: err.response?.data?.message || err.message || 'Erreur lors de l\'importation',
                type: 'ImportError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data
            };
            setError(error);
            throw error;
        } finally {
            setImporting(false);
        }
    }, [data, selectedRows, apiUrls.imports]);

    /**
     * Gestion de la sélection
     */
    const toggleRowSelection = useCallback((rowId) => {
        setSelectedRows(prev => 
            prev.includes(rowId) 
                ? prev.filter(id => id !== rowId)
                : [...prev, rowId]
        );
    }, []);

    const selectAll = useCallback(() => {
        const allValidIds = data.filter(row => row.isValid).map(row => row.id);
        setSelectedRows(allValidIds);
    }, [data]);

    const unselectAll = useCallback(() => {
        setSelectedRows([]);
    }, []);

    /**
     * Reset
     */
    const clearData = useCallback(() => {
        setData([]);
        setOriginalData([]);
        setSelectedRows([]);
        setFileInfo(null);
        setError(null);
        setLoading(false);
        setImporting(false);
    }, []);

    return {
        data,
        originalData,
        loading,
        error,
        fileInfo,
        selectedRows,
        importing,
        loadFile,
        importSelectedEleves,
        toggleRowSelection,
        selectAll,
        unselectAll,
        clearData
    };
};

// ===========================
// CONFIGURATION DU TABLEAU D'IMPORTATION D'ÉLÈVES
// ===========================
export const importElevesTableConfig = {
    columns: [
        {
            title: 'Ligne',
            dataKey: 'numeroLigne',
            flexGrow: 0.3,
            minWidth: 60,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '6px 8px',
                    backgroundColor: rowData.isValid ? '#10b981' : '#ef4444',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    {rowData.numeroLigne}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'status_display',
            flexGrow: 0.5,
            minWidth: 80,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const isValid = rowData.isValid;
                return (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        {isValid ? <FiCheck size={12} color="#16a34a" /> : <FiX size={12} color="#dc2626" />}
                        <span style={{ fontSize: '11px', color: isValid ? '#16a34a' : '#dc2626' }}>
                            {isValid ? 'OK' : 'ERR'}
                        </span>
                    </div>
                );
            },
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
                    color: rowData.matricule ? '#1e293b' : '#ef4444',
                    padding: '2px 6px',
                    backgroundColor: rowData.matricule ? '#f1f5f9' : '#fee2e2',
                    borderRadius: '4px'
                }}>
                    {rowData.matricule || 'REQUIS'}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Nom',
            dataKey: 'nom',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Prénoms',
            dataKey: 'prenoms',
            flexGrow: 1.5,
            minWidth: 140,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'statut',
            flexGrow: 0.8,
            minWidth: 80,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Sexe',
            dataKey: 'sexe_display',
            flexGrow: 0.6,
            minWidth: 70,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <span style={{ 
                    padding: '2px 6px',
                    backgroundColor: rowData.sexe ? 
                        (rowData.sexe === 'MASCULIN' ? '#dbeafe' : '#fce7f3') : '#fee2e2',
                    color: rowData.sexe ? 
                        (rowData.sexe === 'MASCULIN' ? '#2563eb' : '#ec4899') : '#dc2626',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '500'
                }}>
                    {rowData.sexe_display}
                </span>
            ),
            sortable: true
        },
        {
            title: 'Nationalité',
            dataKey: 'nationalite',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Ivoirien',
            dataKey: 'ivoirien',
            flexGrow: 0.6,
            minWidth: 70,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <span style={{ fontSize: '11px', color: rowData.ivoirien === 'OUI' ? '#059669' : '#6b7280' }}>
                    {rowData.ivoirien || '-'}
                </span>
            ),
            sortable: true
        },
        {
            title: 'Étr. Africain',
            dataKey: 'etranger_africain',
            flexGrow: 0.7,
            minWidth: 80,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <span style={{ fontSize: '11px', color: rowData.etranger_africain === 'OUI' ? '#059669' : '#6b7280' }}>
                    {rowData.etranger_africain || '-'}
                </span>
            ),
            sortable: true
        },
        {
            title: 'Étr. Non-Africain',
            dataKey: 'etranger_non_africain',
            flexGrow: 0.8,
            minWidth: 90,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <span style={{ fontSize: '11px', color: rowData.etranger_non_africain === 'OUI' ? '#059669' : '#6b7280' }}>
                    {rowData.etranger_non_africain || '-'}
                </span>
            ),
            sortable: true
        },
        {
            title: 'LV2',
            dataKey: 'lv2',
            flexGrow: 0.6,
            minWidth: 60,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Date Naissance',
            dataKey: 'datenaissance_display',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontSize: '11px',
                    color: rowData.datenaissance ? '#475569' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <FiCalendar size={12} />
                    {rowData.datenaissance_display}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Branche',
            dataKey: 'branche',
            flexGrow: 0.8,
            minWidth: 80,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Lieu Naissance',
            dataKey: 'lieun',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontSize: '11px',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <FiMapPin size={12} />
                    {rowData.lieun || 'Non renseigné'}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Adresse',
            dataKey: 'adresse',
            flexGrow: 1.5,
            minWidth: 130,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontSize: '11px',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <FiHome size={12} />
                    {rowData.adresse || 'Non renseignée'}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Mobile 1',
            dataKey: 'mobile',
            flexGrow: 0.8,
            minWidth: 90,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontSize: '11px',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {rowData.mobile && <FiPhone size={12} />}
                    {rowData.mobile || '-'}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Mobile 2',
            dataKey: 'mobile2',
            flexGrow: 0.8,
            minWidth: 90,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontSize: '11px',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {rowData.mobile2 && <FiPhone size={12} />}
                    {rowData.mobile2 || '-'}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Père',
            dataKey: 'pere',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Mère',
            dataKey: 'mere',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Tuteur',
            dataKey: 'tuteur',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Redoublant',
            dataKey: 'redoublant',
            flexGrow: 0.7,
            minWidth: 80,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <span style={{ 
                    fontSize: '11px', 
                    color: rowData.redoublant === 'OUI' ? '#dc2626' : '#059669',
                    fontWeight: rowData.redoublant === 'OUI' ? '600' : 'normal'
                }}>
                    {rowData.redoublant || '-'}
                </span>
            ),
            sortable: true
        },
        {
            title: 'Régime',
            dataKey: 'regime',
            flexGrow: 0.8,
            minWidth: 80,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Décision Ant.',
            dataKey: 'decision_ant',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'N° Extrait',
            dataKey: 'extrait_numero',
            flexGrow: 0.8,
            minWidth: 80,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Date Extrait',
            dataKey: 'extrait_date_display',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontSize: '11px',
                    color: rowData.extrait_date ? '#475569' : '#64748b'
                }}>
                    {rowData.extrait_date_display}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Lieu Extrait',
            dataKey: 'extrait_lieu',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Décision Aff.',
            dataKey: 'decision_aff',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Erreurs',
            dataKey: 'errors',
            flexGrow: 1.5,
            minWidth: 150,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    {rowData.errors.length > 0 ? (
                        <div>
                            {rowData.errors.slice(0, 2).map((error, index) => (
                                <div key={index} style={{
                                    fontSize: '10px',
                                    color: '#dc2626',
                                    backgroundColor: '#fee2e2',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                    marginBottom: '1px'
                                }}>
                                    {error}
                                </div>
                            ))}
                            {rowData.errors.length > 2 && (
                                <div style={{
                                    fontSize: '9px',
                                    color: '#64748b'
                                }}>
                                    +{rowData.errors.length - 2} erreur(s)
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            fontSize: '11px',
                            color: '#16a34a',
                            fontWeight: '500'
                        }}>
                            ✓ Valide
                        </div>
                    )}
                    {rowData.warnings.length > 0 && (
                        <div style={{
                            fontSize: '9px',
                            color: '#f59e0b',
                            marginTop: '2px'
                        }}>
                            ⚠ {rowData.warnings.length} alerte(s)
                        </div>
                    )}
                </div>
            ),
            sortable: false
        }
    ],
    filterConfigs: [
        {
            field: 'status_display',
            label: 'Statut',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'sexe_display',
            label: 'Sexe',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'nationalite',
            label: 'Nationalité',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'ivoirien',
            label: 'Ivoirien',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'redoublant',
            label: 'Redoublant',
            type: 'select',
            dynamic: true,
            tagColor: 'red'
        },
        {
            field: 'regime',
            label: 'Régime',
            type: 'select',
            dynamic: true,
            tagColor: 'cyan'
        }
    ],
    searchableFields: [
        'matricule',
        'nom',
        'prenoms',
        'nomComplet',
        'nationalite',
        'lieun',
        'adresse',
        'mobile',
        'mobile2',
        'pere',
        'mere',
        'tuteur'
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails',
            color: '#3498db'
        }
    ]
};