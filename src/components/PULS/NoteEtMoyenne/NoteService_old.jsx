/**
 * Service unifié pour la gestion des notes, classes et périodes
 * VERSION CORRIGÉE pour gérer les deux formats de données
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import getFullUrl from '../../hooks/urlUtils';
import { usePulsParams } from '../../hooks/useDynamicParams';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
// ===========================
// HOOK POUR RÉCUPÉRER LES CLASSES
// ===========================
// export const useClassesData = (ecoleId = DEFAULT_ECOLE_ID, refreshTrigger = 0) => {
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     const fetchClasses = async (skipCache = false) => {
//         try {
//             setLoading(true);
//             setError(null);
//             const cacheKey = `classes-data-${ecoleId}`;
//             if (!skipCache) {
//                 const cachedData = getFromCache(cacheKey);
//                 if (cachedData) {
//                     setData(cachedData);
//                     setLoading(false);
//                     return;
//                 }
//             }
//             const response = await axios.get(`${getFullUrl()}/api/classes/list-by-ecole?ecole=${ecoleId}`);
//             const processedClasses = response.data && Array.isArray(response.data)
//                 ? response.data.map(classe => ({
//                     value: classe.id || classe.classeid,
//                     label: classe.libelle || classe.classe_libelle || classe.nom,
//                     id: classe.id || classe.classeid,
//                     raw_data: classe
//                 }))
//                 : [];
//             setToCache(cacheKey, processedClasses);
//             setData(processedClasses);
//         } catch (err) {
//             setError({
//                 message: err.message || 'Erreur lors du chargement des classes',
//                 type: err.name || 'FetchError',
//                 code: err.code || 'UNKNOWN'
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (ecoleId) {
//             fetchClasses(false);
//         }
//     }, [ecoleId, refreshTrigger]);

//     return {
//         classes: data,
//         loading,
//         error,
//         refetch: () => fetchClasses(true)
//     };
// };

// ===========================
// HOOK POUR RÉCUPÉRER LES PÉRIODES
// ===========================
// export const usePeriodesData = (periodicitieId = DEFAULT_PERIODICITE_ID, refreshTrigger = 0) => {
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     const fetchPeriodes = async (skipCache = false) => {
//         try {
//             setLoading(true);
//             setError(null);
//             const cacheKey = `periodes-data-${periodicitieId}`;
//             if (!skipCache) {
//                 const cachedData = getFromCache(cacheKey);
//                 if (cachedData) {
//                     setData(cachedData);
//                     setLoading(false);
//                     return;
//                 }
//             }
//             const response = await axios.get(`${getFullUrl()}/api/periodes/list-by-periodicite?id=${periodicitieId}`);
//             const processedPeriodes = response.data && Array.isArray(response.data)
//                 ? response.data.map(periode => ({
//                     value: periode.id || periode.periodeid,
//                     label: periode.libelle || periode.periode_libelle || periode.nom,
//                     id: periode.id || periode.periodeid,
//                     raw_data: periode
//                 }))
//                 : [];
//             setToCache(cacheKey, processedPeriodes);
//             setData(processedPeriodes);
//         } catch (err) {
//             setError({
//                 message: err.message || 'Erreur lors du chargement des périodes',
//                 type: err.name || 'FetchError',
//                 code: err.code || 'UNKNOWN'
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (periodicitieId) {
//             fetchPeriodes(false);
//         }
//     }, [periodicitieId, refreshTrigger]);

//     return {
//         periodes: data,
//         loading,
//         error,
//         refetch: () => fetchPeriodes(true)
//     };
// };

// ===========================
// FONCTIONS UTILITAIRES POUR DÉTECTER ET TRAITER LES FORMATS
// ===========================

/**
 * Détecte le format des données retournées par l'API
 * @param {*} data - Données retournées par l'API
 * @returns {string} - 'single_student' | 'multiple_students' | 'unknown'
 */
const detectDataFormat = (data) => {
    if (!data) return 'unknown';
    
    // Format single_student : objet unique avec un élève
    if (data.eleve && data.notesMatiereMap && !Array.isArray(data)) {
        return 'single_student';
    }
    
    // Format multiple_students : tableau d'objets avec des élèves
    if (Array.isArray(data) && data.length > 0 && data[0].eleve) {
        return 'multiple_students';
    }
    
    return 'unknown';
};

/**
 * Traite les données au format single_student (showMatiereFilter = true)
 * @param {Object} data - Données au format single_student
 * @returns {Array} - Tableau d'étudiants normalisé
 */
const processSingleStudentData = (data) => {
    if (!data || !data.eleve) return [];
    
    console.log('📊 Traitement du format single_student:', data);
    console.log('🔍 moyenneMatiereToSort:', data.moyenneMatiereToSort);
    console.log('🔍 notesMatiereMap:', data.notesMatiereMap);
    
    // Extraction correcte des informations principales
    let moyenneGenerale = data.moyenneMatiereToSort || 0;
    let rang = '';
    let appreciation = '';
    let matiereInfo = null;
    
    // Extraction depuis notesMatiereMap si disponible
    if (data.notesMatiereMap && data.notesMatiereMap.length > 0 && data.notesMatiereMap[0].key) {
        matiereInfo = data.notesMatiereMap[0].key;
        rang = matiereInfo.rang || '';
        appreciation = matiereInfo.appreciation || '';
        
        console.log('📋 Informations extraites:', {
            moyenne: moyenneGenerale,
            rang: rang,
            appreciation: appreciation,
            matiereLibelle: matiereInfo.libelle
        });
    }
    
    const processedStudent = {
        id: data.eleve.id,
        matricule: data.eleve.matricule || '',
        nom: data.eleve.nom || '',
        prenom: data.eleve.prenom || '',
        sexe: data.eleve.sexe || '',
        urlPhoto: data.eleve.urlPhoto || '',
        // Utilisation de moyenneMatiereToSort comme moyenne principale
        moyenneGenerale: moyenneGenerale,
        moyenneReligion: 0, // Pas disponible dans ce format
        rang: rang,
        isClassed: data.isClassed || 'N',
        appreciation: appreciation,
        appreciationReli: '',
        absencesJustifiees: 0, // Pas disponible dans ce format
        absencesNonJustifiees: 0, // Pas disponible dans ce format
        matieres: data.notesMatiereMap ? data.notesMatiereMap.map(matiereMap => ({
            id: matiereMap.key?.id || 0,
            code: matiereMap.key?.code || '',
            libelle: matiereMap.key?.libelle || '',
            coefficient: parseFloat(matiereMap.key?.coef || 1),
            moyenne: matiereMap.key?.moyenne || 0,
            rang: matiereMap.key?.rang || '',
            appreciation: matiereMap.key?.appreciation || '',
            numOrdre: matiereMap.key?.numOrdre || 0,
            pec: matiereMap.key?.pec || 1,
            testLourdNote: matiereMap.key?.testLourdNote || 0,
            testLourdNoteSur: matiereMap.key?.testLourdNoteSur || 20,
            notes: matiereMap.value ? matiereMap.value.map(noteDetail => ({
                id: noteDetail.id || 0,
                note: noteDetail.note || 0,
                noteSur: noteDetail.evaluation?.noteSur || 20,
                evaluation: {
                    id: noteDetail.evaluation?.id || 0,
                    code: noteDetail.evaluation?.code || '',
                    duree: noteDetail.evaluation?.duree || '',
                    dateLimite: noteDetail.evaluation?.dateLimite || '',
                    matiereLibelle: noteDetail.evaluation?.matiereEcole?.libelle || '',
                    type: {
                        id: noteDetail.evaluation?.type?.id,
                        libelle: noteDetail.evaluation?.type?.libelle || ''
                    },
                    date: noteDetail.evaluation?.date || '',
                    numero: noteDetail.evaluation?.numero || 0
                },
                pec: noteDetail.pec || 1
            })) : []
        })) : [],
        searchContext: {
            dataFormat: 'single_student',
            matiereInfo: matiereInfo,
            originalData: data
        },
        raw_data: data
    };
    
    // Validation et nettoyage des données
    const validatedStudent = validateStudentData(processedStudent);
    
    console.log('✅ Étudiant traité (single_student) - FINAL:', {
        id: validatedStudent.id,
        nom: validatedStudent.nom,
        prenom: validatedStudent.prenom,
        moyenneGenerale: validatedStudent.moyenneGenerale,
        rang: validatedStudent.rang,
        appreciation: validatedStudent.appreciation,
        nombreMatieres: validatedStudent.matieres.length
    });
    
    return [validatedStudent];
};

/**
 * Traite les données au format multiple_students (showMatiereFilter = false)
 * @param {Array} data - Données au format multiple_students
 * @returns {Array} - Tableau d'étudiants normalisé
 */
const processMultipleStudentsData = (data) => {
    if (!Array.isArray(data)) return [];
    
    console.log('📊 Traitement du format multiple_students:', data.length, 'étudiants');
    
    return data.map((etudiantData, index) => {
        // CORRECTION: Utiliser etudiantData au lieu de data
        let moyenneGenerale = etudiantData.moyenneMatiereToSort || 0;
        let rang = '';
        let appreciation = '';
        let matiereInfo = null;
        
        // CORRECTION: Tester etudiantData.notesMatiereMap au lieu de data.notesMatiereMap
        if (etudiantData.notesMatiereMap && etudiantData.notesMatiereMap.length > 0 && etudiantData.notesMatiereMap[0].key) {
            console.log("✅ Maintenant je rentre ici pour l'étudiant:", etudiantData.eleve?.nom);
            matiereInfo = etudiantData.notesMatiereMap[0].key;
            rang = matiereInfo.rang || '';
            appreciation = matiereInfo.appreciation || '';
            
            console.log('📋 Informations extraites pour', etudiantData.eleve?.nom, ':', {
                moyenne: moyenneGenerale,
                rang: rang,
                appreciation: appreciation,
                matiereLibelle: matiereInfo.libelle
            });
        }

        const processedStudent = {
            id: etudiantData.eleve?.id || `etudiant-${index}`,
            matricule: etudiantData.eleve?.matricule || '',
            nom: etudiantData.eleve?.nom || '',
            prenom: etudiantData.eleve?.prenom || '',
            sexe: etudiantData.eleve?.sexe || '',
            urlPhoto: etudiantData.eleve?.urlPhoto || '',
            // CORRECTION: Utiliser moyenneGenerale calculée précédemment
            //moyenneGenerale: moyenneGenerale,
            moyenneGenerale: etudiantData.moyenne,
            moyenneReligion: etudiantData.moyReli || 0,
            //rang: rang || '0', // Utiliser le rang extrait
            rang: etudiantData.rang || '0', // Utiliser le rang extrait
            isClassed: etudiantData.isClassed || 'N',
            //appreciation: appreciation || etudiantData.appreciation || '',
            appreciation: etudiantData.appreciation || '', // Utiliser l'appréciation extraite en priorité
            appreciationReli: etudiantData.appreciationReli || '',
            absencesJustifiees: etudiantData.absJust || 0,
            absencesNonJustifiees: etudiantData.absNonJust || 0,
            matieres: etudiantData.notesMatiereMap ? etudiantData.notesMatiereMap.map(matiereMap => ({
                id: matiereMap.key?.id || 0,
                code: matiereMap.key?.code || '',
                libelle: matiereMap.key?.libelle || '',
                coefficient: parseFloat(matiereMap.key?.coef || 1),
                moyenne: matiereMap.key?.moyenne || 0,
                rang: matiereMap.key?.rang || '',
                appreciation: matiereMap.key?.appreciation || '',
                numOrdre: matiereMap.key?.numOrdre || 0,
                pec: matiereMap.key?.pec || 1,
                notes: matiereMap.value ? matiereMap.value.map(noteDetail => ({
                    id: noteDetail.id || 0,
                    note: noteDetail.note || 0,
                    noteSur: noteDetail.evaluation?.noteSur || 20,
                    evaluation: {
                        id: noteDetail.evaluation?.id || 0,
                        code: noteDetail.evaluation?.code || '',
                        duree: noteDetail.evaluation?.duree || '',
                        dateLimite: noteDetail.evaluation?.dateLimite || '',
                        matiereLibelle: noteDetail.evaluation?.matiereEcole?.libelle || '',
                        type: noteDetail.evaluation?.type?.libelle || ''
                    },
                    pec: noteDetail.pec || 1
                })) : []
            })) : [],
            searchContext: {
                dataFormat: 'multiple_students',
                originalData: etudiantData
            },
            raw_data: etudiantData
        };
        
        console.log("Mes notes");
        console.log(processedStudent.raw_data.notesMatiereMap[0].value)
        // Validation et nettoyage des données
        return validateStudentData(processedStudent);
    });
};
/**
 * Valide et nettoie les données d'un étudiant après traitement
 * @param {Object} student - Données de l'étudiant à valider
 * @returns {Object} - Étudiant avec données validées
 */
const validateStudentData = (student) => {
    return {
        ...student,
        moyenneGenerale: parseFloat(student.moyenneGenerale) || 0,
        rang: student.rang ? String(student.rang) : '0',
        appreciation: student.appreciation || '', // Ne pas forcer "Non définie"
        absencesJustifiees: parseInt(student.absencesJustifiees) || 0,
        absencesNonJustifiees: parseInt(student.absencesNonJustifiees) || 0
    };
};

// ===========================
// HOOK POUR LA RECHERCHE DES NOTES (VERSION CORRIGÉE)
// ===========================
export const useNoteSearch = (profil, showMatiereFilter = false) => {
    const [data, setData] = useState([]);
    const [classeInfo, setClasseInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);


     const { periodicitieId: dynamicPeriodicitieId, personnelInfo: personnelInfo, academicYearId: dynamicAcademicYearId, ecoleId: dynamicEcoleId } = usePulsParams();
     console.log('dynamicPeriodicitieId', dynamicPeriodicitieId);
     console.log('personnelInfo', personnelInfo);
     console.log('dynamicAcademicYearId', dynamicAcademicYearId);
     console.log('dynamicEcoleId', dynamicEcoleId);
    /**
     * Génère l'URL appropriée selon le mode de filtrage (VERSION CORRIGÉE)
     */
    const buildApiUrl = (classeId, periodeId, academicYearId, matiereId = null) => {
        const baseUrl = getFullUrl();
        
        if (showMatiereFilter) {
            if (matiereId && matiereId !== null) {
                //if (profil === 'Professeur') {}
                return `${baseUrl}/api/notes/list-classe-matiere-notes/${classeId}/${matiereId}/${academicYearId}/${periodeId}`;
            } else {
                // Mode toutes matières
                return `${baseUrl}/api/notes/list-classe-notes-all-matieres/${classeId}/${periodeId}`;
            }
        } else {
            // Mode classique
            return `${baseUrl}/api/notes/list-classe-notes/${classeId}/${academicYearId}/${periodeId}`;
        }
    };

    const searchNotes = async (classeId, periodeId, matiereId = null) => {
        if (!classeId || !periodeId) {
            setError({
                message: 'Veuillez sélectionner une classe et une période',
                type: 'ValidationError',
                code: 'MISSING_PARAMS'
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearchPerformed(false);

            // Construction de l'URL
            const notesUrl = buildApiUrl(classeId, periodeId, dynamicAcademicYearId, matiereId);
            console.log('🔗 URL API générée:', notesUrl);
            console.log('🔍 Paramètres de recherche:', { classeId, periodeId, matiereId, showMatiereFilter });

            // Requêtes parallèles
            const notesPromise = axios.get(notesUrl);
            const classePromise = axios.get(`${getFullUrl()}/api/classes/${classeId}`);
            
            const [notesResponse, classeResponse] = await Promise.all([notesPromise, classePromise]);
            
            console.log('📥 Données reçues de l\'API:', notesResponse.data);
            
            // Détection et traitement automatique du format
            const dataFormat = detectDataFormat(notesResponse.data);
            console.log('🔍 Format détecté:', dataFormat);

            

            
            let processedEtudiants = [];
            let selectedMatiereInfo = null;

            if( profil == "Professeur"){
            }
            

            switch (dataFormat) {
                case 'single_student':
                    // Format single_student (showMatiereFilter = true avec matière spécifique)
                    processedEtudiants = processSingleStudentData(notesResponse.data);
                    
                    // Extraction des informations de la matière
                    if (notesResponse.data.notesMatiereMap && notesResponse.data.notesMatiereMap.length > 0) {
                        const matiereData = notesResponse.data.notesMatiereMap[0].key;
                        selectedMatiereInfo = {
                            id: matiereData.id,
                            libelle: matiereData.libelle,
                            code: matiereData.code,
                            coefficient: matiereData.coef
                        };
                    }
                    break;
                    
                case 'multiple_students':
                    // Format multiple_students (showMatiereFilter = false ou toutes matières)
                    processedEtudiants = processMultipleStudentsData(notesResponse.data);
                    break;
                    
                default:
                    console.warn('⚠️ Format de données non reconnu:', notesResponse.data);
                    processedEtudiants = [];
            }
            
            // Traitement des informations de classe
            const processedClasseInfo = classeResponse.data ? {
                id: classeResponse.data.id || classeResponse.data.classeid,
                libelle: classeResponse.data.libelle || classeResponse.data.classe_libelle || classeResponse.data.nom,
                niveau: classeResponse.data.niveau || '',
                effectif: classeResponse.data.effectif || processedEtudiants.length,
                professeur_principal: classeResponse.data.professeur_principal || '',
                searchContext: {
                    showMatiereFilter,
                    matiereId,
                    selectedMatiereLabel: selectedMatiereInfo?.libelle || (matiereId ? 'Matière spécifique' : 'Toutes les matières'),
                    selectedMatiereInfo,
                    dataFormat,
                    apiUrl: notesUrl
                },
                raw_data: classeResponse.data
            } : null;

            
            
            setData(processedEtudiants);
            setClasseInfo(processedClasseInfo);
            setSearchPerformed(true);
            
            console.log('✅ Recherche terminée avec succès:', {
                etudiants: processedEtudiants.length,
                classeInfo: processedClasseInfo?.libelle,
                showMatiereFilter,
                matiereId,
                selectedMatiereInfo,
                dataFormat
            });

            
        } catch (err) {
            console.error('❌ Erreur lors de la recherche:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la recherche des notes',
                type: err.name || 'SearchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data || null,
                context: {
                    showMatiereFilter,
                    matiereId,
                    apiUrl: buildApiUrl(classeId, periodeId, matiereId),
                    dataFormat: 'error'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setData([]);
        setClasseInfo(null);
        setError(null);
        setSearchPerformed(false);
    };

    const cancelSearch = () => {
        setLoading(false);
    };

    return {
        etudiants: data,
        classeInfo,
        loading,
        error,
        searchPerformed,
        searchNotes,
        clearResults,
        cancelSearch,
        searchContext: {
            showMatiereFilter,
            buildApiUrl
        }
    };
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Retourne une couleur selon la note
 */
export const getNoteColor = (note, noteSur = 20) => {
    const pourcentage = (note / noteSur) * 100;
    if (pourcentage >= 90) return 'green';
    if (pourcentage >= 75) return 'blue';
    if (pourcentage >= 60) return 'orange';
    if (pourcentage >= 50) return 'yellow';
    return 'red';
};

/**
 * Retourne une couleur selon l'appréciation
 */
export const getAppreciationColor = (appreciation) => {
    const appreciationLower = appreciation?.toLowerCase() || '';
    if (appreciationLower.includes('excellent')) return 'green';
    if (appreciationLower.includes('très bien')) return 'blue';
    if (appreciationLower.includes('bien')) return 'cyan';
    if (appreciationLower.includes('assez bien')) return 'orange';
    if (appreciationLower.includes('passable')) return 'yellow';
    return 'red';
};

/**
 * Formate une note sur 20
 */
export const formatNote = (note, noteSur = 20) => {
    return `${parseFloat(note).toFixed(2)}/${noteSur}`;
};

// ===========================
// CONFIGURATION DU TABLEAU POUR LES NOTES
// ===========================
export const notesTableConfig = {
    columns: [
        {
            title: 'Matricule',
            dataKey: 'etudiant_matricule',
            flexGrow: 1,
            minWidth: 100,
            sortable: true
        },
        {
            title: 'Nom',
            dataKey: 'etudiant_nom',
            flexGrow: 2,
            minWidth: 150,
            sortable: true
        },
        {
            title: 'Prénom',
            dataKey: 'etudiant_prenom',
            flexGrow: 2,
            minWidth: 150,
            sortable: true
        },
        {
            title: 'Note',
            dataKey: 'note_valeur',
            flexGrow: 1,
            minWidth: 80,
            sortable: true,
            cellType: 'note'
        },
        {
            title: 'Note sur',
            dataKey: 'note_sur',
            flexGrow: 1,
            minWidth: 80,
            sortable: true
        },
        {
            title: 'Moyenne',
            dataKey: 'moyenne',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cellType: 'moyenne'
        },
        {
            title: 'Rang',
            dataKey: 'rang',
            flexGrow: 1,
            minWidth: 80,
            sortable: true
        },
        {
            title: 'Appréciation',
            dataKey: 'appreciation',
            flexGrow: 2,
            minWidth: 200,
            sortable: false
        }
    ],
    searchableFields: ['etudiant_nom', 'etudiant_prenom', 'etudiant_matricule'],
    actions: [],
    filterConfigs: [
        {
            key: 'note_range',
            label: 'Plage de notes',
            type: 'range',
            min: 0,
            max: 20
        },
        {
            key: 'rang_range',
            label: 'Plage de rang',
            type: 'range',
            min: 1,
            max: 50
        }
    ]
};