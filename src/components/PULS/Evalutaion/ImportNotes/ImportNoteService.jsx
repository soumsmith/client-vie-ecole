/**
 * Service pour l'importation de notes d'évaluation via fichier CSV/Excel
 * VERSION AMÉLIORÉE avec API spécifique et confirmation
 */

import { useState, useCallback } from 'react';
import { FiEye, FiCheck, FiX, FiUser, FiBarChart, FiTrendingUp, FiBookOpen } from 'react-icons/fi';
import { getFromCache, setToCache } from '../../utils/cacheUtils';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const DEFAULT_ECOLE_ID = 38;
const DEFAULT_ANNEE_ID = 226;

// Liste complète de toutes les colonnes de notes possibles
const NOTES_COLUMNS = [
    // Français
    'noteFran1', 'noteFran2', 'noteFran3', 'noteFran4', 'noteFran5',
    
    // Expression Orale
    'noteExpreOral1', 'noteExpreOral2', 'noteExpreOral3', 'noteExpreOral4', 'noteExpreOral5',
    
    // Composition Français
    'noteCompoFr1', 'noteCompoFr2', 'noteCompoFr3', 'noteCompoFr4', 'noteCompoFr5',
    
    // Orthographe/Grammaire
    'noteOrthoGram1', 'noteOrthoGram2', 'noteOrthoGram3', 'noteOrthoGram4', 'noteOrthoGram5',
    
    // Philosophie
    'notephiloso1', 'notephiloso2', 'notephiloso3', 'notephiloso4', 'notephiloso5',
    
    // Anglais
    'noteAng1', 'noteAng2', 'noteAng3', 'noteAng4', 'noteAng5',
    
    // Mathématiques
    'noteMath1', 'noteMath2', 'noteMath3', 'noteMath4', 'noteMath5',
    
    // Physique
    'notePhysiq1', 'notePhysiq2', 'notePhysiq3', 'notePhysiq4', 'notePhysiq5',
    
    // Sciences de la Vie et de la Terre
    'noteSVT1', 'noteSVT2', 'noteSVT3', 'noteSVT4', 'noteSVT5',
    
    // Espagnol
    'noteEsp1', 'noteEsp2', 'noteEsp3', 'noteEsp4', 'noteEsp5',
    
    // Allemand
    'noteAll1', 'noteAll2', 'noteAll3', 'noteAll4', 'noteAll5',
    
    // Arts Plastiques
    'noteArplat1', 'noteArplat2', 'noteArplat3', 'noteArplat4', 'noteArplat5',
    
    // TIC (Technologies de l'Information)
    'noteTic1', 'noteTic2', 'noteTic3', 'noteTic4', 'noteTic5',
    
    // Informatique
    'noteInfor1', 'noteInfor2', 'noteInfor3', 'noteInfor4', 'noteInfor5',
    
    // Conduite
    'noteConduite1', 'noteConduite2', 'noteConduite3', 'noteConduite4', 'noteConduite5',
    
    // EPS (Éducation Physique et Sportive)
    'noteEps1', 'noteEps2', 'noteEps3', 'noteEps4', 'noteEps5',
    
    // Histoire-Géographie
    'noteHg1', 'noteHg2', 'noteHg3', 'noteHg4', 'noteHg5',
    
    // EDHC (Éducation aux Droits de l'Homme et à la Citoyenneté)
    'noteEdhc1', 'noteEdhc2', 'noteEdhc3', 'noteEdhc4', 'noteEdhc5',
    
    // Arabe
    'noteArabe1', 'noteArabe2', 'noteArabe3', 'noteArabe4', 'noteArabe5',
    
    // Arts Visuels
    'noteArtVisu1', 'noteArtVisu2', 'noteArtVisu3', 'noteArtVisu4', 'noteArtVisu5',
    
    // EMR
    'noteEmr1', 'noteEmr2', 'noteEmr3', 'noteEmr4', 'noteEmr5',
    
    // Fiqh (Jurisprudence islamique)
    'noteFiq1', 'noteFiq2', 'noteFiq3', 'noteFiq4', 'noteFiq5',
    
    // Assirah (Histoire du Prophète)
    'noteAssirah1', 'noteAssirah2', 'noteAssirah3', 'noteAssirah4', 'noteAssirah5',
    
    // Alquidah (Doctrine islamique)
    'noteAlquidah1', 'noteAlquidah2', 'noteAlquidah3', 'noteAlquidah4', 'noteAlquidah5',
    
    // Al Akhlaq (Morale islamique)
    'noteAlAklaq1', 'noteAlAklaq2', 'noteAlAklaq3', 'noteAlAklaq4', 'noteAlAklaq5',
    
    // Mémorisation
    'noteMemo1', 'noteMemo2', 'noteMemo3', 'noteMemo4', 'noteMemo5'
];

// Regroupement des matières pour une meilleure organisation
const MATIERES_GROUPS = {
    'Français': ['noteFran1', 'noteFran2', 'noteFran3', 'noteFran4', 'noteFran5'],
    'Expression Orale': ['noteExpreOral1', 'noteExpreOral2', 'noteExpreOral3', 'noteExpreOral4', 'noteExpreOral5'],
    'Composition Français': ['noteCompoFr1', 'noteCompoFr2', 'noteCompoFr3', 'noteCompoFr4', 'noteCompoFr5'],
    'Orthographe/Grammaire': ['noteOrthoGram1', 'noteOrthoGram2', 'noteOrthoGram3', 'noteOrthoGram4', 'noteOrthoGram5'],
    'Philosophie': ['notephiloso1', 'notephiloso2', 'notephiloso3', 'notephiloso4', 'notephiloso5'],
    'Anglais': ['noteAng1', 'noteAng2', 'noteAng3', 'noteAng4', 'noteAng5'],
    'Mathématiques': ['noteMath1', 'noteMath2', 'noteMath3', 'noteMath4', 'noteMath5'],
    'Physique': ['notePhysiq1', 'notePhysiq2', 'notePhysiq3', 'notePhysiq4', 'notePhysiq5'],
    'SVT': ['noteSVT1', 'noteSVT2', 'noteSVT3', 'noteSVT4', 'noteSVT5'],
    'Espagnol': ['noteEsp1', 'noteEsp2', 'noteEsp3', 'noteEsp4', 'noteEsp5'],
    'Allemand': ['noteAll1', 'noteAll2', 'noteAll3', 'noteAll4', 'noteAll5'],
    'Arts Plastiques': ['noteArplat1', 'noteArplat2', 'noteArplat3', 'noteArplat4', 'noteArplat5'],
    'TIC': ['noteTic1', 'noteTic2', 'noteTic3', 'noteTic4', 'noteTic5'],
    'Informatique': ['noteInfor1', 'noteInfor2', 'noteInfor3', 'noteInfor4', 'noteInfor5'],
    'Conduite': ['noteConduite1', 'noteConduite2', 'noteConduite3', 'noteConduite4', 'noteConduite5'],
    'EPS': ['noteEps1', 'noteEps2', 'noteEps3', 'noteEps4', 'noteEps5'],
    'Histoire-Géo': ['noteHg1', 'noteHg2', 'noteHg3', 'noteHg4', 'noteHg5'],
    'EDHC': ['noteEdhc1', 'noteEdhc2', 'noteEdhc3', 'noteEdhc4', 'noteEdhc5'],
    'Arabe': ['noteArabe1', 'noteArabe2', 'noteArabe3', 'noteArabe4', 'noteArabe5'],
    'Arts Visuels': ['noteArtVisu1', 'noteArtVisu2', 'noteArtVisu3', 'noteArtVisu4', 'noteArtVisu5'],
    'EMR': ['noteEmr1', 'noteEmr2', 'noteEmr3', 'noteEmr4', 'noteEmr5'],
    'Fiqh': ['noteFiq1', 'noteFiq2', 'noteFiq3', 'noteFiq4', 'noteFiq5'],
    'Assirah': ['noteAssirah1', 'noteAssirah2', 'noteAssirah3', 'noteAssirah4', 'noteAssirah5'],
    'Alquidah': ['noteAlquidah1', 'noteAlquidah2', 'noteAlquidah3', 'noteAlquidah4', 'noteAlquidah5'],
    'Al Akhlaq': ['noteAlAklaq1', 'noteAlAklaq2', 'noteAlAklaq3', 'noteAlAklaq4', 'noteAlAklaq5'],
    'Mémorisation': ['noteMemo1', 'noteMemo2', 'noteMemo3', 'noteMemo4', 'noteMemo5']
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Valide une note (doit être entre 0 et 20 ou vide)
 */
const validateNote = (note) => {
    if (!note || note === '') return { isValid: true, value: null };
    
    const numNote = parseFloat(note);
    if (isNaN(numNote)) return { isValid: false, error: 'Note invalide' };
    if (numNote < 0 || numNote > 20) return { isValid: false, error: 'Note doit être entre 0 et 20' };
    
    return { isValid: true, value: numNote };
};

/**
 * Nettoie et normalise une chaîne de caractères
 */
const cleanString = (str) => {
    if (!str) return '';
    return String(str).trim().replace(/\s+/g, ' ');
};

/**
 * Obtient le nom de la matière à partir du nom de la colonne
 */
const getMatiereFromColumn = (columnName) => {
    for (const [matiere, columns] of Object.entries(MATIERES_GROUPS)) {
        if (columns.includes(columnName)) {
            return matiere;
        }
    }
    return 'Autre';
};

/**
 * Valide une ligne de notes importée
 */
const validateNotesRow = (row, rowIndex) => {
    const errors = [];
    const warnings = [];
    
    // Champ obligatoire
    if (!cleanString(row.matricule)) {
        errors.push('Matricule requis');
    }
    
    // Vérifier qu'il y a au moins une note
    const hasNotes = NOTES_COLUMNS.some(col => row[col] && row[col] !== '');
    if (!hasNotes) {
        warnings.push('Aucune note saisie');
    }
    
    // Valider chaque note présente
    let validNotesCount = 0;
    let invalidNotesCount = 0;
    const notesByMatiere = {};
    
    NOTES_COLUMNS.forEach(col => {
        if (row[col] && row[col] !== '') {
            const validation = validateNote(row[col]);
            const matiere = getMatiereFromColumn(col);
            
            if (!notesByMatiere[matiere]) {
                notesByMatiere[matiere] = { valid: 0, invalid: 0, total: 0 };
            }
            notesByMatiere[matiere].total++;
            
            if (validation.isValid) {
                validNotesCount++;
                notesByMatiere[matiere].valid++;
            } else {
                invalidNotesCount++;
                notesByMatiere[matiere].invalid++;
                errors.push(`${col} (${matiere}): ${validation.error}`);
            }
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings,
        validNotesCount,
        invalidNotesCount,
        notesByMatiere
    };
};

// ===========================
// HOOK POUR L'IMPORTATION DE NOTES
// ===========================
export const useImportNotesData = () => {
    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [importing, setImporting] = useState(false);

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
            // Normalisation des noms de colonnes
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                const lowerKey = key.toLowerCase().trim();
                if (lowerKey.includes('matricule')) {
                    normalizedRow.matricule = cleanString(row[key]);
                } else if (NOTES_COLUMNS.includes(key)) {
                    normalizedRow[key] = cleanString(row[key]);
                } else {
                    // Garder les colonnes non reconnues
                    normalizedRow[key] = cleanString(row[key]);
                }
            });

            // Validation
            const validation = validateNotesRow(normalizedRow, index);
            
            // Compter les notes saisies
            const notesSaisies = NOTES_COLUMNS.filter(col => 
                normalizedRow[col] && normalizedRow[col] !== ''
            ).length;

            // Calculer des statistiques sur les notes
            const notes = NOTES_COLUMNS
                .filter(col => normalizedRow[col] && normalizedRow[col] !== '')
                .map(col => parseFloat(normalizedRow[col]))
                .filter(n => !isNaN(n));
            
            const moyenneNotes = notes.length > 0 ? 
                (notes.reduce((sum, n) => sum + n, 0) / notes.length).toFixed(2) : 0;

            const minNote = notes.length > 0 ? Math.min(...notes) : 0;
            const maxNote = notes.length > 0 ? Math.max(...notes) : 0;

            // Compter les matières avec notes
            const matieresAvecNotes = Object.keys(validation.notesByMatiere || {}).length;

            return {
                id: `import-${index + 1}`,
                numeroLigne: index + 1,
                matricule: normalizedRow.matricule || '',
                
                // Notes par colonnes (gardées pour l'envoi)
                ...NOTES_COLUMNS.reduce((acc, col) => {
                    acc[col] = normalizedRow[col] || '';
                    return acc;
                }, {}),
                
                // Statistiques
                notesSaisies,
                moyenneNotes: parseFloat(moyenneNotes),
                minNote,
                maxNote,
                matieresAvecNotes,
                validNotesCount: validation.validNotesCount,
                invalidNotesCount: validation.invalidNotesCount,
                notesByMatiere: validation.notesByMatiere,
                
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
        toggleRowSelection,
        selectAll,
        unselectAll,
        clearData
    };
};

// ===========================
// CONFIGURATION DU TABLEAU D'IMPORTATION AVEC TOUTES LES COLONNES DE NOTES
// ===========================

// Fonction pour créer les colonnes de notes dynamiquement
const createNotesColumns = () => {
    const noteColumns = [];
    
    // Grouper les colonnes par matière
    Object.entries(MATIERES_GROUPS).forEach(([matiereName, columns]) => {
        columns.forEach((col, index) => {
            noteColumns.push({
                title: `${matiereName} ${index + 1}`,
                dataKey: col,
                flexGrow: 0.8,
                minWidth: 80,
                cellType: 'custom',
                customRenderer: (rowData) => {
                    const value = rowData[col];
                    if (!value || value === '') {
                        return (
                            <div style={{
                                color: '#9ca3af',
                                fontSize: '12px',
                                fontStyle: 'italic',
                                textAlign: 'center'
                            }}>
                                -
                            </div>
                        );
                    }
                    
                    const numValue = parseFloat(value);
                    const isValid = !isNaN(numValue) && numValue >= 0 && numValue <= 20;
                    
                    return (
                        <div style={{
                            padding: '4px 8px',
                            backgroundColor: isValid 
                                ? (numValue >= 10 ? '#dcfce7' : '#fef3c7')
                                : '#fee2e2',
                            color: isValid 
                                ? (numValue >= 10 ? '#16a34a' : '#d97706')
                                : '#dc2626',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textAlign: 'center',
                            fontFamily: 'monospace'
                        }}>
                            {isValid ? numValue.toFixed(1) : value}
                        </div>
                    );
                },
                sortable: true
            });
        });
    });
    
    return noteColumns;
};

export const importNotesTableConfig = {
    columns: [
        {
            title: 'Ligne',
            dataKey: 'numeroLigne',
            flexGrow: 0.5,
            minWidth: 70,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '6px 8px',
                    backgroundColor: rowData.isValid ? '#10b981' : '#ef4444',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minWidth: '45px'
                }}>
                    {rowData.numeroLigne}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'status_display',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const isValid = rowData.isValid;
                return (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <div style={{
                            padding: '4px 8px',
                            backgroundColor: isValid ? '#dcfce7' : '#fee2e2',
                            color: isValid ? '#16a34a' : '#dc2626',
                            border: `1px solid ${isValid ? '#22c55e' : '#ef4444'}`,
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            textAlign: 'center'
                        }}>
                            {isValid ? <FiCheck size={14} /> : <FiX size={14} />}
                        </div>
                        <span style={{ fontSize: '12px' }}>
                            {isValid ? 'Valide' : 'Erreur'}
                        </span>
                    </div>
                );
            },
            sortable: true
        },
        {
            title: 'Matricule',
            dataKey: 'matricule',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: rowData.matricule ? '#1e293b' : '#ef4444',
                    padding: '4px 8px',
                    backgroundColor: rowData.matricule ? '#f1f5f9' : '#fee2e2',
                    borderRadius: '4px'
                }}>
                    {rowData.matricule || 'REQUIS'}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Notes Saisies',
            dataKey: 'notesSaisies',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <FiBarChart size={16} color="#667eea" />
                    <span style={{
                        fontWeight: '600',
                        color: rowData.notesSaisies > 0 ? '#1e293b' : '#6b7280'
                    }}>
                        {rowData.notesSaisies} note(s)
                    </span>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Matières',
            dataKey: 'matieresAvecNotes',
            flexGrow: 1,
            minWidth: 150,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <FiBookOpen size={16} color="#8b5cf6" />
                    <span style={{
                        fontWeight: '600',
                        color: rowData.matieresAvecNotes > 0 ? '#1e293b' : '#6b7280'
                    }}>
                        {rowData.matieresAvecNotes} matière(s)
                    </span>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Statistiques',
            dataKey: 'moyenneNotes',
            flexGrow: 1.5,
            minWidth: 150,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    {rowData.notesSaisies > 0 ? (
                        <div>
                            <div style={{ 
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#1e293b',
                                marginBottom: '2px'
                            }}>
                                📊 Moy: {rowData.moyenneNotes}/20
                            </div>
                            <div style={{ 
                                fontSize: '11px',
                                color: '#64748b',
                                display: 'flex',
                                gap: '8px'
                            }}>
                                <span>Min: {rowData.minNote}</span>
                                <span>Max: {rowData.maxNote}</span>
                            </div>
                        </div>
                    ) : (
                        <span style={{ 
                            fontSize: '12px', 
                            color: '#9ca3af',
                            fontStyle: 'italic'
                        }}>
                            Aucune note
                        </span>
                    )}
                </div>
            ),
            sortable: true
        },
        // Ajouter toutes les colonnes de notes
        ...createNotesColumns(),
        {
            title: 'Validation',
            dataKey: 'validNotesCount',
            flexGrow: 1.2,
            minWidth: 130,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', gap: '4px' }}>
                    {rowData.validNotesCount > 0 && (
                        <span style={{
                            padding: '2px 6px',
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                            ✓ {rowData.validNotesCount}
                        </span>
                    )}
                    {rowData.invalidNotesCount > 0 && (
                        <span style={{
                            padding: '2px 6px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                            ✗ {rowData.invalidNotesCount}
                        </span>
                    )}
                    {rowData.notesSaisies === 0 && (
                        <span style={{
                            padding: '2px 6px',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            borderRadius: '4px',
                            fontSize: '11px'
                        }}>
                            Vide
                        </span>
                    )}
                </div>
            ),
            sortable: false
        },
        {
            title: 'Erreurs',
            dataKey: 'errors',
            flexGrow: 2,
            minWidth: 200,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    {rowData.errors.length > 0 ? (
                        <div>
                            {rowData.errors.slice(0, 2).map((error, index) => (
                                <div key={index} style={{
                                    fontSize: '11px',
                                    color: '#dc2626',
                                    backgroundColor: '#fee2e2',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    marginBottom: '2px'
                                }}>
                                    {error}
                                </div>
                            ))}
                            {rowData.errors.length > 2 && (
                                <div style={{
                                    fontSize: '10px',
                                    color: '#64748b'
                                }}>
                                    +{rowData.errors.length - 2} erreur(s)
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div style={{
                                fontSize: '12px',
                                color: '#16a34a',
                                fontWeight: '500',
                                marginBottom: '2px'
                            }}>
                                ✓ Valide
                            </div>
                            {rowData.warnings.length > 0 && (
                                <div style={{
                                    fontSize: '10px',
                                    color: '#f59e0b'
                                }}>
                                    ⚠ {rowData.warnings[0]}
                                </div>
                            )}
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
            field: 'notesSaisies',
            label: 'Nb Notes',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'matieresAvecNotes',
            label: 'Nb Matières',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'moyenneNotes',
            label: 'Moyenne',
            type: 'number',
            tagColor: 'orange'
        }
    ],
    searchableFields: [
        'matricule'
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