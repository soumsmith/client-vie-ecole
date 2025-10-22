import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    Panel,
    Row,
    Col,
    Message,
    Loader,
    Badge,
    Button,
    Input,
    Toggle,
    Modal,
    SelectPicker,
    DatePicker,
    InputNumber,
    Avatar,
    Divider,
    IconButton,
    Tooltip,
    Whisper
} from 'rsuite';
import {
    FiArrowLeft,
    FiEdit,
    FiSave,
    FiLock,
    FiUnlock,
    FiUser,
    FiCalendar,
    FiClock,
    FiBookOpen,
    FiUsers,
    FiMapPin,
    FiPhone,
    FiMail,
    FiBarChart,
    FiRefreshCw,
    FiCheck,
    FiX,
    FiDownload
} from 'react-icons/fi';

// Import des services
import {
    useEvaluationDetail,
    useEvaluationNotes,
    useEvaluationLock,
    useProfesseurDetails,
    notesTableConfig
} from './EvaluationDetailService';

// Import du DataTable
import DataTable from "../../../DataTable";

// Import des hooks pour les données communes
import {
    usePeriodesData
} from "../../utils/CommonDataService";

import { useAllApiUrls } from "../../utils/apiConfig";
import * as XLSX from 'xlsx';

// ===========================
// 🎨 CONFIGURATION SWEETALERT2 PERSONNALISÉE
// ===========================
const showSuccessToast = (message) => {
    return Swal.fire({
        icon: 'success',
        title: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
};

const showErrorToast = (message) => {
    return Swal.fire({
        icon: 'error',
        title: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
    });
};

const showLoadingToast = (message) => {
    return Swal.fire({
        title: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

// ===========================
// COMPOSANT POUR LES CELLULES ÉDITABLES - INPUT NUMBER POUR NOTES
// ✅ CORRECTION: Ajout de modifiedNotes pour surbrillance
// ===========================
const EditableNoteCell = ({ rowData, onNoteChange, isLocked, noteSur, modifiedNotes }) => {
    const [value, setValue] = useState(rowData.note || 0);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [previousValue, setPreviousValue] = useState(rowData.note || 0);
    const inputRef = React.useRef(null);

    // ✅ Vérifier si cette note a été modifiée
    const isModified = modifiedNotes && modifiedNotes.has(rowData.id);

    // Mettre à jour l'état local quand les données changent
    React.useEffect(() => {
        console.log('🔄 Mise à jour note pour:', rowData.eleve?.nomComplet, 'Note:', rowData.note);
        setValue(rowData.note || 0);
        setPreviousValue(rowData.note || 0);
    }, [rowData.note, rowData.eleve]);

    const handleChange = (e) => {
        const newValue = e.target.value === '' ? '' : e.target.value;
        console.log('✏️ Changement dans input:', { 
            ancien: value, 
            nouveau: newValue,
            eleve: rowData.eleve?.nomComplet 
        });
        setValue(newValue);
    };

    const handleFocus = (e) => {
        console.log('🎯 Focus sur input pour:', rowData.eleve?.nomComplet);
        setIsFocused(true);
        setPreviousValue(value);
        e.target.select();
    };

    const handleBlur = async () => {
        setIsFocused(false);
        
        if (value === '' || value === null || value === undefined) {
            console.log('⏭️ Input vide, restauration de la valeur précédente:', previousValue);
            setValue(previousValue);
            return;
        }

        const newValue = parseFloat(value) || 0;
        
        console.log('🔍 Blur détecté:', {
            valeurActuelle: value,
            valeurParsée: newValue,
            noteOriginal: rowData.note,
            estIdentique: newValue === (rowData.note || 0),
            eleve: rowData.eleve?.nomComplet
        });
        
        if (newValue === (rowData.note || 0)) {
            console.log('⏭️ Valeur identique, pas de stockage');
            return;
        }

        setIsLoading(true);
        console.log('📝 Stockage de la modification...');

        try {
            // ✅ Activer automatiquement le PEC si une note est saisie
            const newPec = newValue > 0 ? 1 : rowData.pec;

            console.log('📝 Paramètres de stockage:', {
                noteId: rowData.id,
                newValue,
                newPec,
                type: 'note'
            });

            if (onNoteChange) {
                await onNoteChange(rowData.id, newValue, newPec, 'note');
            }

            console.log('✅ Modification stockée en attente de sauvegarde');

        } catch (error) {
            console.error('❌ Erreur lors du stockage:', error);
            showErrorToast('Erreur lors du stockage de la modification');
            setValue(previousValue);
        } finally {
            setIsLoading(false);
            console.log('✅ Fin du processus de stockage');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        } else if (e.key === 'Escape') {
            console.log('🚫 Annulation - Restauration de:', previousValue);
            setValue(previousValue);
            e.target.blur();
        }
    };

    const maxNote = parseFloat(noteSur) || 20;

    console.log('🎯 EditableNoteCell rendu:', {
        eleve: rowData.eleve?.nomComplet,
        note: value,
        isLocked,
        isLoading,
        noteSur,
        maxNote,
        isModified
    });

    if (isLocked) {
        console.log('🔒 Champ verrouillé pour:', rowData.eleve?.nomComplet);
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                backgroundColor: '#f8fafc',
                color: '#475569',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '14px',
                border: '1px solid #e2e8f0'
            }}>
                {value}/{noteSur}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            gap: '4px',
            position: 'relative'
        }}>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onKeyPress={handleKeyPress}
                min={0}
                max={maxNote}
                step="0.25"
                disabled={isLoading}
                style={{
                    width: '70px',
                    padding: '6px 8px',
                    // ✅ CORRECTION: Ajout du style pour les notes modifiées
                    border: isModified 
                        ? '2px solid #f59e0b' 
                        : isFocused 
                            ? '2px solid #3b82f6' 
                            : '1px solid #d1d5db',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: '500',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    // ✅ CORRECTION: Surbrillance orange pour les notes modifiées
                    backgroundColor: isModified 
                        ? '#fef3c7' 
                        : isLoading 
                            ? '#f1f5f9' 
                            : 'white',
                    boxShadow: isModified 
                        ? '0 0 0 3px rgba(245, 158, 11, 0.15)' 
                        : isFocused 
                            ? '0 0 0 3px rgba(59, 130, 246, 0.1)' 
                            : 'none'
                }}
            />
            <span style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '500'
            }}>
                /{noteSur}
            </span>
            
            {/* Indicateur de chargement */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    right: '-20px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Loader size="xs" />
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT SWITCH PEC - AFFICHAGE SELON VALEUR
// ✅ CORRECTION: Ajout du badge "M" quand le switch est activé
// ===========================
const EditablePecCell = ({ rowData, onPecChange, isLocked }) => {
    const [isActive, setIsActive] = useState(rowData.pec === 1);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        setIsActive(rowData.pec === 1);
    }, [rowData.pec]);

    const handleToggle = async () => {
        if (isLocked || isLoading) return;

        const newValue = !isActive;
        setIsLoading(true);

        try {
            setIsActive(newValue);

            if (onPecChange) {
                await onPecChange(rowData.id, rowData.note, newValue ? 1 : 0, 'pec');
            }

            console.log('✅ Modification PEC stockée en attente de sauvegarde');

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour PEC:', error);
            setIsActive(!newValue);
            await showErrorToast('Erreur lors de la mise à jour du PEC');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            gap: '8px',
            position: 'relative'
        }}>
            {/* Switch personnalisé */}
            <div
                onClick={handleToggle}
                style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: isActive ? '#22c55e' : '#e5e7eb',
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: isLocked || isLoading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                    opacity: isLocked || isLoading ? 0.6 : 1,
                    border: `2px solid ${isActive ? '#16a34a' : '#d1d5db'}`
                }}
            >
                <div
                    style={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '1px',
                        left: isActive ? '22px' : '2px',
                        transition: 'left 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}
                />
            </div>

            {/* Texte indicateur */}
            <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: isActive ? '#16a34a' : '#6b7280',
                minWidth: '30px',
                textAlign: 'center'
            }}>
                {isActive ? 'OUI' : 'NON'}
            </span>

            {/* ✅ CORRECTION: Badge "M" affiché uniquement si le switch est activé */}
            {isActive && (
                <Badge 
                    color="cyan" 
                    style={{ 
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginLeft: '4px'
                    }}
                >
                    M
                </Badge>
            )}

            {/* Indicateur de chargement */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    right: '-20px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Loader size="xs" />
                </div>
            )}
        </div>
    );
};

// ===========================
// MODAL DE MODIFICATION D'ÉVALUATION
// ===========================
const ModificationModal = ({
    open,
    onClose,
    evaluation,
    onSave
}) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const { periodes } = usePeriodesData();

    useEffect(() => {
        if (evaluation && open) {
            setFormData({
                typeId: evaluation.type?.id,
                periodeId: evaluation.periode?.id,
                classeId: evaluation.classe?.id,
                matiereId: evaluation.matiereEcole?.id,
                noteSur: evaluation.noteSur,
                date: evaluation.date ? new Date(evaluation.date) : new Date(),
                duree: evaluation.duree
            });
        }
    }, [evaluation, open]);

    const handleSave = async () => {
        try {
            setLoading(true);
            if (onSave) {
                await onSave(formData);
            }
            onClose();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setLoading(false);
        }
    };

    const typesData = [
        { label: 'Interrogation', value: 3 },
        { label: 'Devoir', value: 2 },
        { label: 'Composition', value: 1 }
    ];

    const notesSurData = [
        { label: '/10', value: '10' },
        { label: '/20', value: '20' },
        { label: '/100', value: '100' }
    ];

    return (
        <Modal open={open} onClose={onClose} size="lg">
            <Modal.Header>
                <Modal.Title style={{ color: '#1e293b', fontWeight: '600' }}>
                    Modifier une évaluation
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Row gutter={20}>
                    <Col xs={24} sm={12}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Type d'évaluation
                            </label>
                            <SelectPicker
                                data={typesData}
                                value={formData.typeId}
                                onChange={(value) => setFormData(prev => ({ ...prev, typeId: value }))}
                                placeholder="Sélectionner le type"
                                style={{ width: '100%' }}
                                cleanable={false}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Période
                            </label>
                            <SelectPicker
                                data={periodes}
                                value={formData.periodeId}
                                onChange={(value) => setFormData(prev => ({ ...prev, periodeId: value }))}
                                placeholder="Sélectionner la période"
                                style={{ width: '100%' }}
                                cleanable={false}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Classe
                            </label>
                            <Input
                                value={evaluation?.classe?.libelle || ''}
                                disabled
                                style={{ width: '100%', backgroundColor: '#f8fafc' }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Matière
                            </label>
                            <Input
                                value={evaluation?.matiereEcole?.libelle || ''}
                                disabled
                                style={{ width: '100%', backgroundColor: '#f8fafc' }}
                            />
                        </div>
                    </Col>

                    <Col xs={24} sm={12}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Noté sur
                            </label>
                            <SelectPicker
                                data={notesSurData}
                                value={formData.noteSur}
                                onChange={(value) => setFormData(prev => ({ ...prev, noteSur: value }))}
                                placeholder="Sélectionner la note sur"
                                style={{ width: '100%' }}
                                cleanable={false}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Date
                            </label>
                            <DatePicker
                                value={formData.date}
                                onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
                                format="dd/MM/yyyy HH:mm"
                                style={{ width: '100%' }}
                                showMeridian
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Durée
                            </label>
                            <Input
                                value={formData.duree}
                                onChange={(value) => setFormData(prev => ({ ...prev, duree: value }))}
                                placeholder="00-15"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </Col>
                </Row>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={onClose} appearance="subtle">
                    Annuler
                </Button>
                <Button
                    onClick={handleSave}
                    appearance="primary"
                    loading={loading}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                    }}
                >
                    Modifier
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// ===========================
// COMPOSANT PRINCIPAL - DÉTAIL D'ÉVALUATION
// ===========================
const EvaluationDetail = () => {
    const { evaluationCode } = useParams();
    const navigate = useNavigate();
    const apiUrls = useAllApiUrls();

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [modifiedNotes, setModifiedNotes] = useState(new Map());
    const [isSaving, setIsSaving] = useState(false);

    // ===========================
    // HOOKS POUR LES DONNÉES
    // ===========================
    const {
        evaluation,
        loading: evaluationLoading,
        error: evaluationError,
        refetch: refetchEvaluation
    } = useEvaluationDetail(evaluationCode);

    const {
        notes,
        loading: notesLoading,
        error: notesError,
        updateNote,
        refetch: refetchNotes
    } = useEvaluationNotes(evaluationCode);

    const {
        lockInfo,
        loading: lockLoading,
        refetch: refetchLock
    } = useEvaluationLock(evaluation?.id);

    const {
        professeur,
        loading: professeurLoading
    } = useProfesseurDetails();

    // ===========================
    // DÉTERMINER SI L'ÉVALUATION EST VERROUILLÉE
    // ===========================
    const isLocked = lockInfo?.isLocked || false;

    useEffect(() => {
        if (evaluation) {
            console.log('📊 Évaluation chargée:', {
                id: evaluation.id,
                code: evaluation.code,
                matiereId: evaluation.matiereEcole?.id,
                matiereLibelle: evaluation.matiereEcole?.libelle,
                classeId: evaluation.classe?.id,
                classeLibelle: evaluation.classe?.libelle,
                isLocked,
                lockInfo
            });
        }
    }, [evaluation, isLocked, lockInfo]);

    // ===========================
    // 🎯 FONCTION POUR SAUVEGARDER UNE NOTE (APPEL API)
    // ===========================
    const saveNoteToAPI = useCallback(async (noteId, newNote, newPec, changeType) => {
        try {
            console.log('💾 Sauvegarde de la note - Début:', { noteId, newNote, newPec, changeType });
            console.log('📊 Évaluation disponible:', evaluation);

            const matiereId = evaluation?.matiereEcole?.id;
            const classeId = evaluation?.classe?.id;

            console.log('🔍 IDs extraits:', { 
                matiereId, 
                classeId,
                matiereEcole: evaluation?.matiereEcole,
                classe: evaluation?.classe
            });

            if (!matiereId || !classeId) {
                const errorMsg = `Matière ou Classe introuvable dans l'évaluation - matiereId: ${matiereId}, classeId: ${classeId}`;
                console.error('❌', errorMsg);
                throw new Error(errorMsg);
            }

            const payload = {
                id: noteId,
                note: parseFloat(newNote) || 0,
                pec: newPec
            };

            const apiUrl = apiUrls.notes.update(matiereId, classeId);
            
            console.log('📤 Envoi vers API:', {
                url: apiUrl,
                payload,
                method: 'PUT'
            });

            const response = await axios.put(apiUrl, payload);

            console.log('✅ Note sauvegardée avec succès:', response.data);

            await updateNote(noteId, newNote, newPec);

            return response.data;

        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde de la note:', error);
            console.error('📋 Détails complets de l\'erreur:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url,
                method: error.config?.method
            });
            throw error;
        }
    }, [apiUrls.notes, updateNote, evaluation]);

    // ===========================
    // GESTION DES CHANGEMENTS DE NOTES ET PEC (STOCKAGE LOCAL)
    // ===========================
    const handleNoteChange = useCallback(async (noteId, newNote, newPec, changeType = 'note') => {
        try {
            console.log('🔄 Changement détecté:', { noteId, newNote, newPec, changeType });

            setModifiedNotes(prev => {
                const updated = new Map(prev);
                updated.set(noteId, {
                    noteId,
                    note: newNote,
                    pec: newPec,
                    changeType
                });
                return updated;
            });

            await updateNote(noteId, newNote, newPec);

            console.log('✅ Modification stockée localement');

        } catch (error) {
            console.error('❌ Erreur lors du stockage de la modification:', error);
            throw error;
        }
    }, [updateNote]);

    // ===========================
    // TRANSFORMATION DES DONNÉES POUR LA RECHERCHE ET FILTRES
    // ===========================
    const processedNotes = React.useMemo(() => {
        return notes.map(note => ({
            ...note,
            matricule: note.eleve?.matricule || '',
            nom: note.eleve?.nom || '',
            prenom: note.eleve?.prenom || '',
            nomComplet: note.eleve?.nomComplet || '',
            sexe: note.eleve?.sexe || '',
            urlPhoto: note.eleve?.urlPhoto || '',
            redoublant: note.inscription?.redoublant || 'NON',
            boursier: note.inscription?.boursier || '',
            pecStatus: note.pec === 1 ? 'ACTIVE' : 'INACTIVE',
            pecLabel: note.pec === 1 ? 'Activé (OUI)' : 'Désactivé (NON)',
            eleve: note.eleve,
            inscription: note.inscription
        }));
    }, [notes]);

    // ===========================
    // 📊 FONCTION POUR EXPORTER EN EXCEL
    // ===========================
    const handleExportExcel = useCallback(() => {
        try {
            const exportData = processedNotes.map((note, index) => ({
                'N°': index + 1,
                'Matricule': note.matricule,
                'Nom complet': note.nomComplet,
                'Sexe': note.sexe,
                'Note': note.note,
                'Note sur': evaluation?.noteSur,
                'PEC': note.pec === 1 ? 'OUI' : 'NON',
                'Redoublant': note.redoublant
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Notes");

            const fileName = `Notes_${evaluation?.classe?.libelle}_${evaluation?.matiereEcole?.libelle}_${evaluation?.type?.libelle}.xlsx`;
            XLSX.writeFile(wb, fileName);

            showSuccessToast('Export Excel réussi !');
        } catch (error) {
            console.error('Erreur lors de l\'export Excel:', error);
            showErrorToast('Erreur lors de l\'export Excel');
        }
    }, [processedNotes, evaluation]);

    // ===========================
    // 💾 FONCTION POUR SAUVEGARDER TOUTES LES MODIFICATIONS
    // ✅ CORRECTION: Structure correcte avec id, note, pec, statut dans le bon ordre
    // ===========================
    const handleSaveAll = useCallback(async () => {
        if (modifiedNotes.size === 0) {
            await showErrorToast('Aucune modification à enregistrer');
            return;
        }

        try {
            setIsSaving(true);
            showLoadingToast('Enregistrement des notes en cours...');

            console.log('💾 Début de l\'enregistrement de toutes les notes');
            console.log('📝 Nombre de modifications:', modifiedNotes.size);
            console.log('📝 Modifications:', Array.from(modifiedNotes.entries()));

            const currentDateUTC = new Date().toISOString().replace('.000Z', 'Z[UTC]');
            console.log('🕐 Date de sauvegarde:', currentDateUTC);

            // ✅ CORRECTION: Construction du payload avec la bonne structure
            const payload = notes.map(noteData => {
                const modification = modifiedNotes.get(noteData.id);
                
                const finalNote = modification ? modification.note : (noteData.note || 0);
                const finalPec = modification ? modification.pec : (noteData.pec || 0);

                console.log(`📝 Note pour ${noteData.eleve?.nomComplet}:`, {
                    id: noteData.id,
                    original: { note: noteData.note, pec: noteData.pec },
                    modified: modification,
                    final: { note: finalNote, pec: finalPec }
                });

                // ✅ SOLUTION CORRIGÉE: Construction avec le bon ordre des éléments
                if (noteData.raw_data) {
                    const noteCopy = JSON.parse(JSON.stringify(noteData.raw_data));
                    
                    noteCopy.note = finalNote;
                    noteCopy.pec = finalPec;
                    noteCopy.statut = "M";  // ✅ Ajout du statut
                    // noteCopy.dateCreation = currentDateUTC;
                    // noteCopy.dateUpdate = currentDateUTC;
                    
                    return noteCopy;
                }

                // ✅ CORRECTION du Fallback: Structure correcte avec le bon ordre
                console.warn('⚠️ Pas de raw_data pour:', noteData.eleve?.nomComplet);
                return {
                    classeEleve: noteData.classeEleve,
                    evaluation: evaluation,
                    id: noteData.id || 0,
                    // ✅ Après l'id, on ajoute note, pec, statut dans le bon ordre
                    note: finalNote,
                    pec: finalPec,
                    statut: "M",  // ✅ Ajout du statut "M"
                    dateCreation: currentDateUTC,
                    dateUpdate: currentDateUTC
                };
            });

            console.log('📤 Payload complet à envoyer:', {
                nombreElements: payload.length,
                dateEnregistrement: currentDateUTC,
                premierElement: payload[0],
                deuxiemeElement: payload[1] || null,
                structureVerifiee: {
                    hasId: payload[0]?.id !== undefined,
                    hasNote: payload[0]?.note !== undefined,
                    hasPec: payload[0]?.pec !== undefined,
                    hasStatut: payload[0]?.statut !== undefined,
                    ordreCorrect: Object.keys(payload[0] || {})
                }
            });

            const response = await axios.post(
                apiUrls.notes.handleNotes(),
                payload
            );

            console.log('✅ Réponse de l\'API:', response.data);

            Swal.close();
            await showSuccessToast(`Toutes les notes ont été enregistrées avec succès !`);

            setModifiedNotes(new Map());

            await refetchNotes();
            await refetchEvaluation();

        } catch (error) {
            console.error('❌ Erreur lors de l\'enregistrement:', error);
            console.error('📋 Détails complets:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url,
                payloadEnvoye: error.config?.data ? JSON.parse(error.config.data) : null
            });

            Swal.close();
            await showErrorToast(
                error.response?.data?.message || 
                'Erreur lors de l\'enregistrement des notes'
            );
        } finally {
            setIsSaving(false);
        }
    }, [modifiedNotes, notes, processedNotes, evaluation, apiUrls, refetchNotes, refetchEvaluation]);

    // Configuration DataTable avec customRenderer intégrés
    // ✅ CORRECTION: Passer modifiedNotes au composant EditableNoteCell
    const tableConfig = React.useMemo(() => {
        return {
            columns: [
                {
                    title: 'Matricule',
                    dataKey: 'matricule',
                    flexGrow: 0.8,
                    minWidth: 120,
                    cellType: 'custom',
                    customRenderer: (rowData) => (
                        <div style={{
                            fontWeight: '600',
                            color: '#1e293b',
                            fontSize: '13px',
                            padding: '8px 0'
                        }}>
                            {rowData.matricule || 'N/A'}
                        </div>
                    ),
                    sortable: true,
                    fixed: 'left'
                },
                {
                    title: 'Élève',
                    dataKey: 'nomComplet',
                    flexGrow: 2,
                    minWidth: 250,
                    cellType: 'custom',
                    customRenderer: (rowData) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: rowData.sexe === 'FEMININ'
                                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '700',
                                flexShrink: 0,
                                backgroundImage: rowData.urlPhoto ? `url(${rowData.urlPhoto})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '2px solid white',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                            }}>
                                {!rowData.urlPhoto && (rowData.prenom?.charAt(0) || '?')}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontWeight: '700',
                                    color: '#1e293b',
                                    fontSize: '14px',
                                    marginBottom: '2px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {rowData.nomComplet || 'Nom non disponible'}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>{rowData.sexe || 'N/A'}</span>
                                    {rowData.redoublant === 'OUI' && (
                                        <span style={{
                                            background: '#fef3c7',
                                            color: '#d97706',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '9px',
                                            fontWeight: '600'
                                        }}>
                                            REDOUBLANT
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
                    customRenderer: (rowData) => {
                        return (
                            <EditableNoteCell
                                rowData={rowData}
                                onNoteChange={handleNoteChange}
                                isLocked={isLocked}
                                noteSur={evaluation?.noteSur}
                                modifiedNotes={modifiedNotes}  // ✅ CORRECTION: Passage de modifiedNotes
                            />
                        );
                    },
                    sortable: true
                },
                {
                    title: 'PEC',
                    dataKey: 'pec',
                    flexGrow: 1,
                    minWidth: 120,
                    cellType: 'custom',
                    align: 'center',
                    customRenderer: (rowData) => {
                        return (
                            <EditablePecCell
                                rowData={rowData}
                                onPecChange={handleNoteChange}
                                isLocked={isLocked}
                            />
                        );
                    },
                    sortable: true
                },
                {
                    title: 'Statut',
                    dataKey: 'status_display',
                    flexGrow: 0.8,
                    minWidth: 100,
                    cellType: 'custom',
                    customRenderer: (rowData) => {
                        const note = parseFloat(rowData.note);
                        const noteSur = parseFloat(evaluation?.noteSur || '10');
                        let status = 'Non noté';
                        let colors = { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };

                        if (!isNaN(note)) {
                            const pourcentage = (note / noteSur) * 100;

                            if (pourcentage >= 85) {
                                status = 'Excellent';
                                colors = { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' };
                            } else if (pourcentage >= 70) {
                                status = 'Bien';
                                colors = { bg: '#fefce8', text: '#ca8a04', border: '#eab308' };
                            } else if (pourcentage >= 50) {
                                status = 'Passable';
                                colors = { bg: '#fff7ed', text: '#ea580c', border: '#f97316' };
                            } else {
                                status = 'Insuffisant';
                                colors = { bg: '#fef2f2', text: '#dc2626', border: '#ef4444' };
                            }
                        }

                        return (
                            <div style={{
                                padding: '4px 8px',
                                backgroundColor: colors.bg,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '500',
                                textAlign: 'center'
                            }}>
                                {status}
                            </div>
                        );
                    },
                    sortable: true
                }
            ],
            searchableFields: [
                'matricule',
                'nom',
                'prenom',
                'nomComplet'
            ],
            filterConfigs: [
                {
                    field: 'sexe',
                    label: 'Sexe',
                    type: 'select',
                    options: [
                        { label: 'Masculin', value: 'MASCULIN' },
                        { label: 'Féminin', value: 'FEMININ' }
                    ],
                    tagColor: 'blue'
                },
                {
                    field: 'pec',
                    label: 'PEC',
                    type: 'select',
                    options: [
                        { label: 'Activé (OUI)', value: 1 },
                        { label: 'Désactivé (NON)', value: 0 }
                    ],
                    tagColor: 'green'
                },
                {
                    field: 'redoublant',
                    label: 'Redoublant',
                    type: 'select',
                    options: [
                        { label: 'Oui', value: 'OUI' },
                        { label: 'Non', value: 'NON' }
                    ],
                    tagColor: 'orange'
                }
            ],
            defaultSortField: 'nomComplet',
            defaultSortOrder: 'asc',
            pageSize: 20,
            showPagination: true,
            showSearch: true,
            showFilters: true,
            tableHeight: 500
        };
    }, [handleNoteChange, isLocked, evaluation?.noteSur, modifiedNotes]);  // ✅ CORRECTION: Ajout de modifiedNotes dans les dépendances

    const [showModificationModal, setShowModificationModal] = useState(false);

    const handleModificationSave = useCallback(async (formData) => {
        console.log('Sauvegarde des modifications:', formData);
        refetchEvaluation();
    }, [evaluation, refetchEvaluation]);

    const handleRefresh = useCallback(() => {
        refetchEvaluation();
        refetchNotes();
        refetchLock();
    }, [refetchEvaluation, refetchNotes, refetchLock]);

    // ===========================
    // CALCULS STATISTIQUES
    // ===========================
    const stats = React.useMemo(() => {
        if (notes.length === 0) return { moyenne: 0, noteMax: 0, noteMin: 0, nombreNotes: 0 };

        const notesValides = notes.filter(n => n.note !== null && n.note !== undefined);
        if (notesValides.length === 0) return { moyenne: 0, noteMax: 0, noteMin: 0, nombreNotes: 0 };

        const notesValues = notesValides.map(n => parseFloat(n.note));
        const somme = notesValues.reduce((acc, note) => acc + note, 0);

        return {
            moyenne: (somme / notesValues.length).toFixed(2),
            noteMax: Math.max(...notesValues),
            noteMin: Math.min(...notesValues),
            nombreNotes: notesValues.length
        };
    }, [notes]);

    // ===========================
    // LOADING ET ERROR STATES
    // ===========================
    if (evaluationLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh'
            }}>
                <Loader size="lg" content="Chargement des détails..." />
            </div>
        );
    }

    if (evaluationError || !evaluation) {
        return (
            <div className="container-fluid" style={{ padding: '20px' }}>
                <Message type="error" showIcon>
                    {evaluationError?.message || 'Évaluation introuvable'}
                </Message>
            </div>
        );
    }

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================
    return (
        <div style={{
            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                {/* Header avec navigation */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div style={{
                            background: 'white',
                            borderRadius: '15px',
                            padding: '20px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            border: '1px solid rgba(102, 126, 234, 0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                                    <Button
                                        appearance="subtle"
                                        startIcon={<FiArrowLeft />}
                                        onClick={() => navigate(-1)}
                                        style={{ borderRadius: '8px' }}
                                    >
                                        Retour
                                    </Button>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#1e293b', fontWeight: '700' }}>
                                            📝 {evaluation.type?.libelle} - {evaluation.matiereEcole?.libelle}
                                        </h4>
                                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                                            {evaluation.classe?.libelle} • Code: {evaluation.code}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Button
                                        appearance="ghost"
                                        startIcon={<FiRefreshCw />}
                                        onClick={handleRefresh}
                                        style={{ borderRadius: '8px' }}
                                    >
                                        Actualiser
                                    </Button>
                                    {/* <Button
                                        appearance="primary"
                                        startIcon={<FiEdit />}
                                        onClick={() => setShowModificationModal(true)}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        Modifier l'évaluation
                                    </Button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informations de l'évaluation */}
                <div className="row mb-4">
                    <div className="col-md-8">
                        <Panel
                            header={
                                <span style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#1e293b'
                                }}>
                                    ℹ️ Informations générales
                                </span>
                            }
                            shaded
                            style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                height: '100%'
                            }}
                        >
                            <div className="mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Type
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                        {evaluation.type?.libelle}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Période
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                        {evaluation.periode?.libelle}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Matière
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                        {evaluation.matiereEcole?.libelle}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Classe
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                        {evaluation.classe?.libelle}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Date limite de saisie
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                        {lockInfo?.dateLimiteFormatted}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                                        Noté sur
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                        {evaluation.noteSur}
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <div className="col-md-4">
                        <Panel
                            header={
                                <span style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#1e293b'
                                }}>
                                    📊 Statistiques
                                </span>
                            }
                            shaded
                            style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                height: '100%'
                            }}
                        >
                            <div className="mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                <div style={{ textAlign: 'center', padding: '10px', background: '#eff6ff', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#3b82f6' }}>
                                        {stats.moyenne}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Moyenne</div>
                                </div>

                                <div style={{ textAlign: 'center', padding: '10px', background: '#f0fdf4', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#22c55e' }}>
                                        {stats.nombreNotes}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Notes saisies</div>
                                </div>

                                <div style={{ textAlign: 'center', padding: '10px', background: '#fefce8', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#ca8a04' }}>
                                        {stats.noteMax}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Note max</div>
                                </div>

                                <div style={{ textAlign: 'center', padding: '10px', background: '#fef2f2', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>
                                        {stats.noteMin}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Note min</div>
                                </div>
                            </div>
                        </Panel>
                    </div>
                </div>

                {/* Tableau des notes avec DataTable */}
                <div className="row">
                    <div className="col-12">
                        <Panel
                            header={
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        📝 Saisie des Notes de l'évaluation
                                        {isLocked && (
                                            <Badge color="red" style={{ fontSize: '11px' }}>
                                                <FiLock size={10} style={{ marginRight: '4px' }} />
                                                Verrouillé
                                            </Badge>
                                        )}
                                        {modifiedNotes.size > 0 && !isLocked && (
                                            <Badge color="orange" style={{ fontSize: '11px' }}>
                                                {modifiedNotes.size} modification(s) en attente
                                            </Badge>
                                        )}
                                    </span>
                                    
                                    {/* Boutons d'action */}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {/* Bouton Export Excel */}
                                        <Button
                                            appearance="ghost"
                                            style={{
                                                border: '1px solid #10b981',
                                                color: '#10b981',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                            onClick={handleExportExcel}
                                            disabled={processedNotes.length === 0}
                                        >
                                            <FiDownload size={16} />
                                            Exporter Excel
                                        </Button>

                                        {/* Bouton Enregistrer */}
                                        {!isLocked && (
                                            <Button
                                                appearance="primary"
                                                style={{
                                                    background: modifiedNotes.size > 0 
                                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                                        : '#94a3b8',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}
                                                onClick={handleSaveAll}
                                                disabled={modifiedNotes.size === 0 || isSaving}
                                                loading={isSaving}
                                            >
                                                <FiSave size={16} />
                                                {isSaving ? 'Enregistrement...' : `Enregistrer ${modifiedNotes.size > 0 ? `(${modifiedNotes.size})` : ''}`}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            }
                            shaded
                            style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                opacity: isLocked ? 0.8 : 1
                            }}
                        >
                            {notesLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader size="lg" content="Chargement des notes..." />
                                </div>
                            ) : notesError ? (
                                <Message type="error" showIcon>
                                    {notesError.message}
                                </Message>
                            ) : (
                                <DataTable
                                    title=""
                                    subtitle={`élève(s)`}
                                    data={processedNotes}
                                    loading={notesLoading}
                                    error={null}
                                    columns={tableConfig.columns}
                                    searchableFields={tableConfig.searchableFields}
                                    filterConfigs={tableConfig.filterConfigs}
                                    onAction={() => { }}
                                    onRefresh={refetchNotes}
                                    defaultPageSize={tableConfig.pageSize}
                                    pageSizeOptions={[10, 20, 50, 100]}
                                    tableHeight={tableConfig.tableHeight}
                                    enableRefresh={true}
                                    enableCreate={false}
                                    selectable={false}
                                    rowKey="id"
                                    showSearch={true}
                                    showFilters={true}
                                    showPagination={true}
                                    customStyles={{
                                        container: {
                                            backgroundColor: "transparent"
                                        },
                                        panel: {
                                            border: "none",
                                            boxShadow: "none"
                                        },
                                        table: {
                                            opacity: isLocked ? 0.75 : 1,
                                            overflow: 'auto'
                                        }
                                    }}
                                    scrollable={true}
                                />
                            )}

                            {/* Message d'information sur le verrouillage */}
                            {isLocked && lockInfo && (
                                <div style={{
                                    marginTop: '15px',
                                    padding: '15px',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <FiLock color="#dc2626" size={18} />
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
                                            📋 Évaluation verrouillée - Mode lecture seule
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#7f1d1d' }}>
                                            Date limite de saisie dépassée : <strong>{lockInfo.dateLimiteFormatted}</strong>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>
                                            ℹ️ Vous pouvez consulter et faire défiler les notes, mais pas les modifier.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Panel>
                    </div>
                </div>
            </div>

            {/* Modal de modification */}
            <ModificationModal
                open={showModificationModal}
                onClose={() => setShowModificationModal(false)}
                evaluation={evaluation}
                onSave={handleModificationSave}
            />
        </div>
    );
};

export default EvaluationDetail;