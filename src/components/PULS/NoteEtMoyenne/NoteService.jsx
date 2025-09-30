/**
 * Service unifié pour la gestion des notes, classes et périodes
 * VERSION CORRIGÉE - Avec mise à jour des données locales pour les absences
 */

import { useState } from 'react';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from '../../hooks/useDynamicParams';
import getFullUrl from '../../hooks/urlUtils';
import { getUserProfile } from "../../hooks/userUtils";

// ===========================
// HOOK POUR LA RECHERCHE DES NOTES (VERSION CORRIGÉE)
// ===========================
export const useNoteSearch = (profil, showMatiereFilter = false) => {
    const [data, setData] = useState([]);
    const [classeInfo, setClasseInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const apiUrls = useAllApiUrls();

    const { 
        periodicitieId: dynamicPeriodicitieId, 
        personnelInfo: personnelInfo, 
        academicYearId: dynamicAcademicYearId, 
        ecoleId: dynamicEcoleId 
    } = usePulsParams();

    /**
     * NOUVELLE FONCTION : Met à jour les données d'un étudiant spécifique
     */
    const updateStudentData = (etudiantId, updatedFields) => {
        setData(currentData => {
            return currentData.map(etudiant => {
                if (etudiant.id === etudiantId) {
                    const updatedEtudiant = { ...etudiant, ...updatedFields };
                    console.log('🔄 Mise à jour étudiant local:', etudiantId, updatedFields);
                    return updatedEtudiant;
                }
                return etudiant;
            });
        });
    };

    /**
     * Génère l'URL appropriée selon le mode de filtrage
     */
    const buildApiUrl = (classeId, periodeId, academicYearId, matiereId = null) => {
        const baseUrl = getFullUrl();
        console.log('🎓 getUserProfile===', getUserProfile());
        
        if (showMatiereFilter) {
            if (matiereId && matiereId !== null) {
                return `${baseUrl}notes/list-classe-matiere-notes/${classeId}/${matiereId}/${academicYearId}/${periodeId}`;
            } else {
                return `${baseUrl}notes/list-classe-notes-all-matieres/${classeId}/${periodeId}`;
            }
        } else {
            return `${baseUrl}notes/list-classe-notes/${classeId}/${academicYearId}/${periodeId}`;
        }
    };

    /**
     * Valide et nettoie les données d'un étudiant
     */
    const validateStudent = (student) => ({
        ...student,
        moyenneGenerale: parseFloat(student.moyenneGenerale) || 0,
        rang: student.rang ? String(student.rang) : '0',
        appreciation: student.appreciation || '',
        absencesJustifiees: parseInt(student.absencesJustifiees) || 0,
        absencesNonJustifiees: parseInt(student.absencesNonJustifiees) || 0
    });

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

            const notesUrl = buildApiUrl(classeId, periodeId, dynamicAcademicYearId, matiereId);
            console.log('🔗 URL API:', notesUrl);
            console.log('🔍 Profil:', profil);

            // Requêtes parallèles
            const [notesResponse, classeResponse] = await Promise.all([
                axios.get(notesUrl),
                axios.get(apiUrls.classes.getById(classeId))
            ]);
            
            console.log('📥 Données API:', notesResponse.data);

            let processedEtudiants = [];
            let selectedMatiereInfo = null;
            const rawData = notesResponse.data;



            // ===========================
            // TRAITEMENT DIRECT SELON LE PROFIL
            // ===========================
            
            if (profil === 'Professeur') {
                
                
                const dataArray = Array.isArray(rawData) ? rawData : [rawData];
                
                processedEtudiants = dataArray.map((data, index) => {
                    if (!data || !data.eleve) {
                        console.warn('⚠️ Données élève manquantes pour index:', index);
                        return null;
                    }

                    // Extraction des infos principales
                    const moyenneGenerale = data.moyenneMatiereToSort || 0;
                    let rang = '';
                    let appreciation = '';
                    let matiereInfo = null;

                    // Extraction depuis notesMatiereMap
                    if (data.notesMatiereMap?.[0]?.key) {
                        matiereInfo = data.notesMatiereMap[0].key;
                        rang = matiereInfo.rang || '';
                        appreciation = matiereInfo.appreciation || '';
                        
                        // Sauvegarde des infos matière (première occurrence)
                        if (!selectedMatiereInfo) {
                            selectedMatiereInfo = {
                                id: matiereInfo.id,
                                libelle: matiereInfo.libelle,
                                code: matiereInfo.code,
                                coefficient: matiereInfo.coef
                            };
                        }
                    }

                    return validateStudent({
                        id: data.eleve.id,
                        matricule: data.eleve.matricule || '',
                        nom: data.eleve.nom || '',
                        prenom: data.eleve.prenom || '',
                        sexe: data.eleve.sexe || '',
                        urlPhoto: data.eleve.urlPhoto || '',
                        moyenneGenerale,
                        moyenneReligion: data.moyReli || 0,
                        rang,
                        isClassed: data.isClassed || 'N',
                        appreciation,
                        appreciationReli: data.appreciationReli || '',
                        absencesJustifiees: data.absJust || 0,
                        absencesNonJustifiees: data.absNonJust || 0,
                        matieres: data.notesMatiereMap?.map(matiereMap => ({
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
                            notes: matiereMap.value?.map(noteDetail => ({
                                id: noteDetail.id || 0,
                                note: noteDetail.note || 0,
                                noteSur: parseFloat(noteDetail.evaluation?.noteSur) || 20,
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
                            })) || []
                        })) || [],
                        searchContext: {
                            dataFormat: 'professeur',
                            profil: 'Professeur',
                            matiereInfo,
                            originalData: data
                        },
                        raw_data: data
                    });
                }).filter(Boolean); // Retire les éléments null

            } else {
                console.log('👥 Traitement Autres profils');
                
                const dataArray = Array.isArray(rawData) ? rawData : [rawData];
                
                processedEtudiants = dataArray.map((etudiantData, index) => {
                    if (!etudiantData?.eleve) {
                        console.warn('⚠️ Données élève manquantes pour index:', index);
                        return null;
                    }

                    // Extraction des infos depuis notesMatiereMap si présent
                    let moyenneGenerale = etudiantData.moyenneMatiereToSort || etudiantData.moyenne || 0;
                    let rang = etudiantData.rang || '0';
                    let appreciation = etudiantData.appreciation || '';

                    // Mise à jour depuis notesMatiereMap si disponible
                    if (etudiantData.notesMatiereMap?.[0]?.key) {
                        const matiereInfo = etudiantData.notesMatiereMap[0].key;
                        rang = matiereInfo.rang || rang;
                        appreciation = matiereInfo.appreciation || appreciation;
                    }

                    return validateStudent({
                        id: etudiantData.eleve.id || `etudiant-${index}`,
                        matricule: etudiantData.eleve.matricule || '',
                        nom: etudiantData.eleve.nom || '',
                        prenom: etudiantData.eleve.prenom || '',
                        sexe: etudiantData.eleve.sexe || '',
                        urlPhoto: etudiantData.eleve.urlPhoto || '',
                        moyenneGenerale,
                        moyenneReligion: etudiantData.moyReli || 0,
                        rang,
                        isClassed: etudiantData.isClassed || 'N',
                        appreciation,
                        appreciationReli: etudiantData.appreciationReli || '',
                        absencesJustifiees: etudiantData.absJust || 0,
                        absencesNonJustifiees: etudiantData.absNonJust || 0,
                        matieres: etudiantData.notesMatiereMap?.map(matiereMap => ({
                            id: matiereMap.key?.id || 0,
                            code: matiereMap.key?.code || '',
                            libelle: matiereMap.key?.libelle || '',
                            coefficient: parseFloat(matiereMap.key?.coef || 1),
                            moyenne: matiereMap.key?.moyenne || 0,
                            rang: matiereMap.key?.rang || '',
                            appreciation: matiereMap.key?.appreciation || '',
                            numOrdre: matiereMap.key?.numOrdre || 0,
                            pec: matiereMap.key?.pec || 1,
                            notes: matiereMap.value?.map(noteDetail => ({
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
                            })) || []
                        })) || [],
                        searchContext: {
                            dataFormat: 'autres_profils',
                            profil,
                            originalData: etudiantData
                        },
                        raw_data: etudiantData
                    });
                }).filter(Boolean); // Retire les éléments null
            }
            
            console.log('✅ Étudiants traités:', processedEtudiants.length);
            
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
                    profil,
                    dataFormat: profil === 'Professeur' ? 'professeur' : 'autres_profils',
                    apiUrl: notesUrl
                },
                raw_data: classeResponse.data
            } : null;
            
            setData(processedEtudiants);
            setClasseInfo(processedClasseInfo);
            setSearchPerformed(true);

        } catch (err) {
            console.error('❌ Erreur:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la recherche des notes',
                type: err.name || 'SearchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data || null,
                context: {
                    profil,
                    showMatiereFilter,
                    matiereId
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
        updateStudentData, // NOUVELLE FONCTION EXPOSÉE
        searchContext: {
            profil,
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