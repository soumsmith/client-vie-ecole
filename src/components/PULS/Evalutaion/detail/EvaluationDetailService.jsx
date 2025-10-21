/**
 * Service pour la gestion des détails d'évaluation
 * VERSION COMPLÈTE avec toutes les API endpoints
 * Gestion des notes, verrouillage, et détails professeur
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getFromCache, setToCache } from '../../utils/cacheUtils';
import { useAllApiUrls } from '../../utils/apiConfig';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const DEFAULT_ANNEE_ID = 226;

// ===========================
// FONCTIONS UTILITAIRES
// ===========================
function formatDate(dateStr) {
  if (!dateStr) return "";

  // Supprimer les crochets [UTC] et espaces éventuels
  const cleanDate = dateStr.replace(/\[.*\]/, "");

  const date = new Date(cleanDate);
  if (isNaN(date)) return "Date invalide";

  return date.toLocaleDateString("fr-FR", {
    year: "2-digit",//"numeric",
    month: "2-digit", //"long",
    day: "numeric",
  });
}


const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return '';
    }
};

const formatDuration = (duration) => {
    if (!duration) return '2h00';
    if (typeof duration === 'string' && duration.includes('-')) {
        const [hours, minutes] = duration.split('-');
        return `${hours}h${minutes}`;
    }
    return duration || '2h00';
};

/**
 * Sauvegarde une note d'évaluation
 */
export const saveNote = async (noteId, note, pec, apiUrls) => {
    try {
        const payload = {
            id: noteId,
            note: parseFloat(note) || 0,
            pec: pec ? 1 : 0
        };

        const response = await axios.put(
            apiUrls.notes.update(noteId),
            payload
        );

        return response.data;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde de la note:', error);
        throw error;
    }
};

// ===========================
// HOOK POUR RÉCUPÉRER LES DÉTAILS D'UNE ÉVALUATION
// ===========================
export const useEvaluationDetail = (evaluationCode) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchEvaluationDetail = useCallback(async (code) => {
        if (!code) return;

        try {
            setLoading(true);
            setError(null);

            const cacheKey = `evaluation-detail-${code}`;
            const cachedData = getFromCache(cacheKey);

            if (cachedData) {
                setData(cachedData);
                setLoading(false);
                return;
            }

            const response = await axios.get(apiUrls.evaluations.getByCode(code));

            if (response.data) {
                const processedData = {
                    id: response.data.id,
                    code: response.data.code,
                    numero: response.data.numero,
                    date: response.data.date,
                    dateFormatted: formatDate(response.data.date),
                    timeFormatted: formatTime(response.data.date),
                    dateCreation: response.data.dateCreation,
                    dateUpdate: response.data.dateUpdate,
                    dateLimite: response.data.dateLimite,
                    dateLimiteFormatted: response.data.dateLimite,  //formatDate(response.data.dateLimite),
                    type: {
                        id: response.data.type?.id,
                        libelle: response.data.type?.libelle,
                        typeSeance: response.data.type?.typeSeance
                    },
                    duree: response.data.duree,
                    dureeFormatted: formatDuration(response.data.duree),
                    noteSur: response.data.noteSur || '10',
                    etat: response.data.etat,
                    heure: response.data.heure,
                    pec: response.data.pec,
                    user: response.data.user,
                    // Informations sur la classe
                    classe: {
                        id: response.data.classe?.id,
                        code: response.data.classe?.code,
                        libelle: response.data.classe?.libelle,
                        effectif: response.data.classe?.effectif,
                        ecole: {
                            id: response.data.classe?.ecole?.id,
                            code: response.data.classe?.ecole?.code,
                            libelle: response.data.classe?.ecole?.libelle,
                            tel: response.data.classe?.ecole?.tel,
                            nomSignataire: response.data.classe?.ecole?.nomSignataire
                        },
                        branche: {
                            id: response.data.classe?.branche?.id,
                            libelle: response.data.classe?.branche?.libelle,
                            niveau: response.data.classe?.branche?.niveau,
                            filiere: response.data.classe?.branche?.filiere,
                            programme: response.data.classe?.branche?.programme
                        },
                        langueVivante: response.data.classe?.langueVivante
                    },
                    // Informations sur la matière
                    matiereEcole: {
                        id: response.data.matiereEcole?.id,
                        code: response.data.matiereEcole?.code,
                        libelle: response.data.matiereEcole?.libelle,
                        numOrdre: response.data.matiereEcole?.numOrdre,
                        bonus: response.data.matiereEcole?.bonus,
                        pec: response.data.matiereEcole?.pec,
                        categorie: response.data.matiereEcole?.categorie,
                        matiere: response.data.matiereEcole?.matiere
                    },
                    // Informations sur la période
                    periode: {
                        id: response.data.periode?.id,
                        libelle: response.data.periode?.libelle,
                        niveau: response.data.periode?.niveau,
                        coef: parseFloat(response.data.periode?.coef || '1.0'),
                        periodicite: response.data.periode?.periodicite
                    },
                    // Informations sur l'année
                    annee: {
                        id: response.data.annee?.id,
                        libelle: response.data.annee?.libelle,
                        anneeDebut: response.data.annee?.anneeDebut,
                        statut: response.data.annee?.statut,
                        nbreEval: response.data.annee?.nbreEval
                    },
                    raw_data: response.data
                };

                setToCache(cacheKey, processedData, 5); // Cache pendant 5 minutes
                setData(processedData);
            }
        } catch (err) {
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des détails',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, [apiUrls.evaluations]);

    useEffect(() => {
        if (evaluationCode) {
            fetchEvaluationDetail(evaluationCode);
        }
    }, [evaluationCode, fetchEvaluationDetail]);

    return {
        evaluation: data,
        loading,
        error,
        refetch: () => fetchEvaluationDetail(evaluationCode)
    };
};

// ===========================
// HOOK POUR RÉCUPÉRER LA LISTE DES NOTES
// ===========================
export const useEvaluationNotes = (evaluationCode) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchNotes = useCallback(async (code) => {
        if (!code) return;

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(apiUrls.notes.listAboutEvaluation(code));

            if (response.data && Array.isArray(response.data)) {
                const processedNotes = response.data.map((noteItem, index) => ({
                    id: noteItem.id || `note-${index}`,
                    note: noteItem.note || 0,
                    pec: noteItem.pec || 0,
                    dateCreation: noteItem.dateCreation,
                    dateUpdate: noteItem.dateUpdate,
                    // Informations sur l'élève
                    eleve: {
                        id: noteItem.classeEleve?.inscription?.eleve?.id,
                        matricule: noteItem.classeEleve?.inscription?.eleve?.matricule,
                        nom: noteItem.classeEleve?.inscription?.eleve?.nom,
                        prenom: noteItem.classeEleve?.inscription?.eleve?.prenom,
                        nomComplet: `${noteItem.classeEleve?.inscription?.eleve?.prenom} ${noteItem.classeEleve?.inscription?.eleve?.nom}`,
                        sexe: noteItem.classeEleve?.inscription?.eleve?.sexe,
                        dateNaissance: noteItem.classeEleve?.inscription?.eleve?.dateNaissance,
                        lieuNaissance: noteItem.classeEleve?.inscription?.eleve?.lieuNaissance,
                        nationalite: noteItem.classeEleve?.inscription?.eleve?.nationalite,
                        urlPhoto: noteItem.classeEleve?.inscription?.eleve?.urlPhoto
                    },
                    // Informations sur l'inscription
                    inscription: {
                        id: noteItem.classeEleve?.inscription?.id,
                        statut: noteItem.classeEleve?.inscription?.statut,
                        redoublant: noteItem.classeEleve?.inscription?.redoublant,
                        boursier: noteItem.classeEleve?.inscription?.boursier,
                        ecoleOrigine: noteItem.classeEleve?.inscription?.ecoleOrigine
                    },
                    // Informations sur la classe de l'élève
                    classeEleve: {
                        id: noteItem.classeEleve?.id,
                        statut: noteItem.classeEleve?.statut,
                        dateCreation: noteItem.classeEleve?.dateCreation
                    },
                    // ✅ IMPORTANT : Conserver les données brutes
                    raw_data: noteItem
                }));

                // Trier par nom
                processedNotes.sort((a, b) => {
                    const nomA = a.eleve.nom?.toLowerCase() || '';
                    const nomB = b.eleve.nom?.toLowerCase() || '';
                    if (nomA !== nomB) return nomA.localeCompare(nomB);
                    const prenomA = a.eleve.prenom?.toLowerCase() || '';
                    const prenomB = b.eleve.prenom?.toLowerCase() || '';
                    return prenomA.localeCompare(prenomB);
                });

                setData(processedNotes);
            }
        } catch (err) {
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des notes',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, [apiUrls.notes]);

    const updateNote = useCallback(async (noteId, newNote, newPec) => {
        try {
            // Mettre à jour localement d'abord pour une meilleure UX
            setData(prevData =>
                prevData.map(item =>
                    item.id === noteId
                        ? { ...item, note: newNote, pec: newPec }
                        : item
                )
            );

            // Appel API pour sauvegarder (à implémenter selon votre backend)
            // await axios.put(`${getFullUrl()}notes/${noteId}`, { note: newNote, pec: newPec });

        } catch (err) {
            // En cas d'erreur, restaurer les données précédentes
            fetchNotes(evaluationCode);
            throw err;
        }
    }, [evaluationCode, fetchNotes]);

    useEffect(() => {
        if (evaluationCode) {
            fetchNotes(evaluationCode);
        }
    }, [evaluationCode, fetchNotes]);

    return {
        notes: data,
        loading,
        error,
        refetch: () => fetchNotes(evaluationCode),
        updateNote
    };
};

// ===========================
// HOOK POUR VÉRIFIER LE VERROUILLAGE
// ===========================
export const useEvaluationLock = (evaluationId) => {
    const [lockInfo, setLockInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const checkLock = useCallback(async (id) => {
        if (!id) return;
        
        try {
            setLoading(true);
            setError(null);
           

            const response = await axios.get(apiUrls.evaluations.isLocked(id));

            if (response.data) {
                setLockInfo({
                    isLocked: response.data.isLocked,
                    dateLimite: response.data.dateLimite,
                    dateLimiteFormatted: formatDate(response.data.dateLimite)
                });
            }
        } catch (err) {
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la vérification du verrouillage',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, [apiUrls.evaluations]);

    useEffect(() => {
        if (evaluationId) {
            checkLock(evaluationId);
        }
    }, [evaluationId, checkLock]);

    return {
        lockInfo,
        loading,
        error,
        refetch: () => checkLock(evaluationId)
    };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES DÉTAILS DU PROFESSEUR
// ===========================
export const useProfesseurDetails = (matiereId, classeId, anneeId = DEFAULT_ANNEE_ID) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchProfesseur = useCallback(async (matiere, classe, annee) => {
        if (!matiere || !classe) return;

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                annee: annee,
                matiere: matiere,
                classe: classe
            });

            const response = await axios.get(apiUrls.personnel.getProfesseurByMatiere(annee, matiere, classe));


            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                const profData = response.data[0]; // Prendre le premier professeur
                setData({
                    id: profData.personnel?.id,
                    nom: profData.personnel?.nom,
                    prenom: profData.personnel?.prenom,
                    nomComplet: `${profData.personnel?.prenom} ${profData.personnel?.nom}`,
                    contact: profData.personnel?.contact,
                    sexe: profData.personnel?.sexe,
                    niveauEtude: profData.personnel?.niveauEtude,
                    fonction: profData.personnel?.fonction,
                    raw_data: profData
                });
            }
        } catch (err) {
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des détails du professeur',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (matiereId && classeId) {
            fetchProfesseur(matiereId, classeId, anneeId);
        }
    }, [matiereId, classeId, anneeId, fetchProfesseur]);

    return {
        professeur: data,
        loading,
        error,
        refetch: () => fetchProfesseur(matiereId, classeId, anneeId)
    };
};

// ===========================
// CONFIGURATION DU DATATABLE POUR LES NOTES
// ===========================
export const notesTableConfig = {
    columns: [
        {
            title: 'Matricule',
            dataKey: 'eleve.matricule',
            flexGrow: 0.8,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    fontWeight: '500',
                    color: '#1e293b',
                    fontSize: '13px',
                    padding: '8px 0'
                }}>
                    {rowData.eleve?.matricule || 'N/A'}
                </div>
            ),
            sortable: true,
            fixed: 'left'
        },
        {
            title: 'Élève',
            dataKey: 'eleve.nomComplet',
            flexGrow: 2,
            minWidth: 250,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: rowData.eleve?.sexe === 'FEMININ'
                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        flexShrink: 0,
                        backgroundImage: rowData.eleve?.urlPhoto ? `url(${rowData.eleve.urlPhoto})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}>
                        {!rowData.eleve?.urlPhoto && (rowData.eleve?.prenom?.charAt(0) || '?')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontWeight: '600',
                            color: '#1e293b',
                            fontSize: '14px',
                            marginBottom: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {rowData.eleve?.nomComplet || 'Nom non disponible'}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>{rowData.eleve?.sexe || 'N/A'}</span>
                            {rowData.inscription?.redoublant === 'OUI' && (
                                <span style={{
                                    background: '#fef3c7',
                                    color: '#d97706',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '500'
                                }}>
                                    Redoublant
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
            sortable: true,
            fixed: 'left'
        },
        {
            title: 'Note',
            dataKey: 'note',
            flexGrow: 1,
            minWidth: 130,
            cellType: 'custom',
            align: 'center',
            sortable: true,
            customRenderer: null // Sera défini dans le composant
        },
        {
            title: 'PEC',
            dataKey: 'pec',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'custom',
            align: 'center',
            sortable: true,
            customRenderer: null // Sera défini dans le composant
        },
        {
            title: 'Statut',
            dataKey: 'status_display',
            flexGrow: 0.8,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: null, // Sera défini dans le composant avec le bon noteSur
            sortable: true
        }
    ],
    searchableFields: [
        'eleve.matricule',
        'eleve.nom',
        'eleve.prenom',
        'eleve.nomComplet'
    ],
    filterConfigs: [
        {
            field: 'eleve.sexe',
            label: 'Sexe',
            type: 'select',
            options: [
                { label: 'Masculin', value: 'MASCULIN' },
                { label: 'Féminin', value: 'FEMININ' }
            ],
            tagColor: 'blue'
        },
        {
            field: 'inscription.redoublant',
            label: 'Redoublant',
            type: 'select',
            options: [
                { label: 'Oui', value: 'OUI' },
                { label: 'Non', value: 'NON' }
            ],
            tagColor: 'orange'
        },
        {
            field: 'pec',
            label: 'PEC',
            type: 'select',
            options: [
                { label: 'Activé (Oui)', value: 1 },
                { label: 'Désactivé (Non)', value: 0 }
            ],
            tagColor: 'green'
        }
    ],
    // Configuration pour la saisie
    editable: {
        noteField: 'note',
        pecField: 'pec',
        onNoteChange: null, // Sera défini dans le composant
        onPecChange: null   // Sera défini dans le composant
    },
    // Configuration du tableau
    defaultSortField: 'eleve.nomComplet',
    defaultSortOrder: 'asc',
    pageSize: 20,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: false, // Pas d'export depuis la saisie
    tableHeight: 500
};