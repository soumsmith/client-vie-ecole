import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
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
    FiRefreshCw
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

// ===========================
// COMPOSANT POUR LES CELLULES ÉDITABLES - INPUT NUMBER POUR NOTES
// ===========================
const EditableNoteCell = ({ rowData, onNoteChange, isLocked, noteSur }) => {
    const [value, setValue] = useState(rowData.note || 0);

    // Mettre à jour l'état local quand les données changent
    React.useEffect(() => {
        setValue(rowData.note || 0);
    }, [rowData.note]);

    const handleChange = (e) => {
        const newValue = parseFloat(e.target.value) || 0;
        setValue(newValue);
        if (onNoteChange) {
            onNoteChange(rowData.id, newValue, rowData.pec);
        }
    };

    const maxNote = parseFloat(noteSur) || 20;

    if (isLocked) {
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
            gap: '4px'
        }}>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                min={0}
                max={maxNote}
                step="0.25"
                style={{
                    width: '70px',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: '500',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                }}
            />
            <span style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '500'
            }}>
                /{noteSur}
            </span>
        </div>
    );
};

// ===========================
// COMPOSANT SWITCH PEC - AFFICHAGE SELON VALEUR
// ===========================
const EditablePecCell = ({ rowData, onPecChange, isLocked }) => {
    const [isActive, setIsActive] = useState(rowData.pec === 1);

    // Mettre à jour l'état local quand les données changent
    React.useEffect(() => {
        setIsActive(rowData.pec === 1);
    }, [rowData.pec]);

    const handleToggle = () => {
        if (isLocked) return; // Empêcher la modification si verrouillé

        const newValue = !isActive;
        setIsActive(newValue);
        if (onPecChange) {
            onPecChange(rowData.id, rowData.note, newValue ? 1 : 0);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            gap: '8px'
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
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                    opacity: isLocked ? 0.6 : 1,
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
    // const { typesEvaluation } = useTypesEvaluationData(); // À implémenter si nécessaire

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

    const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    } = useProfesseurDetails(
            // evaluation?.matiereEcole?.id,
            // evaluation?.classe?.id,
            // evaluation?.annee?.id
        );


    console.log("======= je suis ========");
    console.log(professeur);

    // ===========================
    // DÉTERMINER SI L'ÉVALUATION EST VERROUILLÉE
    // ===========================
    const isLocked = lockInfo?.isLocked || false;

    // ===========================
    // GESTION DES ACTIONS DATATABLE
    // ===========================
    const handleNoteChange = useCallback(async (noteId, newNote, newPec) => {
        try {
            await updateNote(noteId, newNote, newPec);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la note:', error);
        }
    }, [updateNote]);

    // ===========================
    // TRANSFORMATION DES DONNÉES POUR LA RECHERCHE ET FILTRES
    // ===========================
    const processedNotes = React.useMemo(() => {
        console.log('🔄 Traitement des données pour DataTable:', notes.length, 'notes');

        return notes.map(note => ({
            // Données originales
            ...note,

            // Propriétés aplaties pour la recherche et filtres
            matricule: note.eleve?.matricule || '',
            nom: note.eleve?.nom || '',
            prenom: note.eleve?.prenom || '',
            nomComplet: note.eleve?.nomComplet || '',
            sexe: note.eleve?.sexe || '',
            urlPhoto: note.eleve?.urlPhoto || '',
            redoublant: note.inscription?.redoublant || 'NON',
            boursier: note.inscription?.boursier || '',

            // Propriétés calculées pour les filtres
            pecStatus: note.pec === 1 ? 'ACTIVE' : 'INACTIVE',
            pecLabel: note.pec === 1 ? 'Activé (OUI)' : 'Désactivé (NON)',

            // Garder les objets originaux pour les renderers
            eleve: note.eleve,
            inscription: note.inscription
        }));
    }, [notes]);

    // Configuration DataTable avec customRenderer intégrés directement
    const tableConfig = React.useMemo(() => {
        console.log('🔧 Configuration DataTable:', { isLocked, noteSur: evaluation?.noteSur });

        return {
            columns: [
                {
                    title: 'Matricule',
                    dataKey: 'matricule', // ← Utiliser la propriété aplatie
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
                    dataKey: 'nomComplet', // ← Utiliser la propriété aplatie
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
                        console.log('🎯 Rendu Note pour:', rowData.nomComplet, 'Note:', rowData.note);
                        return (
                            <EditableNoteCell
                                rowData={rowData}
                                onNoteChange={handleNoteChange}
                                isLocked={isLocked}
                                noteSur={evaluation?.noteSur}
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
                        console.log('🔄 Rendu PEC pour:', rowData.nomComplet, 'PEC:', rowData.pec);
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
            // ← Champs de recherche avec propriétés aplaties
            searchableFields: [
                'matricule',
                'nom',
                'prenom',
                'nomComplet'
            ],
            // ← Configuration des filtres avec valeurs correctes
            filterConfigs: [
                {
                    field: 'sexe', // ← Propriété aplatie
                    label: 'Sexe',
                    type: 'select',
                    options: [
                        { label: 'Masculin', value: 'MASCULIN' },
                        { label: 'Féminin', value: 'FEMININ' }
                    ],
                    tagColor: 'blue'
                },
                {
                    field: 'pec', // ← Valeur numérique directe
                    label: 'PEC',
                    type: 'select',
                    options: [
                        { label: 'Activé (OUI)', value: 1 },
                        { label: 'Désactivé (NON)', value: 0 }
                    ],
                    tagColor: 'green'
                },
                {
                    field: 'redoublant', // ← Propriété aplatie
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
    }, [handleNoteChange, isLocked, evaluation?.noteSur]);

    const [showModificationModal, setShowModificationModal] = useState(false);

    const handleModificationSave = useCallback(async (formData) => {
        console.log('Sauvegarde des modifications:', formData);
        // Ici vous pouvez implémenter l'appel API pour modifier l'évaluation
        // await updateEvaluation(evaluation.id, formData);
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
                                        Précédent
                                    </Button>
                                    <Divider vertical />
                                    <div>
                                        <h4 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                            Évaluation N° {evaluation.numero} du {evaluation.dateFormatted}
                                        </h4>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                            {evaluation.type?.libelle} • {evaluation.matiereEcole?.libelle} • {evaluation.classe?.libelle}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {isLocked ? (
                                        <Badge color="red" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <FiLock size={14} /> Verrouillé
                                        </Badge>
                                    ) : (
                                        <Badge color="green" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <FiUnlock size={14} /> Modifiable
                                        </Badge>
                                    )}

                                    <Whisper
                                        placement="top"
                                        speaker={<Tooltip>Actualiser les données</Tooltip>}
                                    >
                                        <IconButton
                                            icon={<FiRefreshCw />}
                                            onClick={handleRefresh}
                                            size="sm"
                                            style={{ borderRadius: '6px' }}
                                        />
                                    </Whisper>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informations détaillées */}
                <div className="row mb-4">
                    <div className="col-lg-8">
                        {/* Détails de l'évaluation */}
                        <Panel
                            header="Détails de l'évaluation"
                            shaded
                            style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                marginBottom: '20px'
                            }}
                        >
                            <Row gutter={20}>
                                <Col xs={24} sm={12}>
                                    <div style={{ marginBottom: 15 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                            <FiBookOpen color="#3b82f6" />
                                            <strong>Classe :</strong>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                                            {evaluation.classe?.libelle}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 15 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                            <FiCalendar color="#10b981" />
                                            <strong>Période :</strong>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                                            {evaluation.periode?.libelle}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 15 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                            <FiClock color="#f59e0b" />
                                            <strong>Durée :</strong>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                                            {evaluation.dureeFormatted}
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <div style={{ marginBottom: 15 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                            <FiCalendar color="#8b5cf6" />
                                            <strong>Date de l'évaluation :</strong>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                                            {evaluation.dateFormatted} • {evaluation.timeFormatted}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 15 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                            <FiBarChart color="#ef4444" />
                                            <strong>Heure :</strong>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '14px' }}>
                                            {evaluation.heure || evaluation.timeFormatted}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 15 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                            <strong>Date limite de saisie :</strong>
                                        </div>
                                        <div style={{
                                            color: isLocked ? '#ef4444' : '#22c55e',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}>
                                            {evaluation.dateLimiteFormatted || 'Non définie'}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Panel>
                    </div>

                    <div className="col-lg-4">
                        {/* Professeur et statistiques */}
                        <Panel
                            header="Professeur"
                            shaded
                            style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                marginBottom: '20px'
                            }}
                        >
                            {professeurLoading ? (
                                <Loader size="sm" content="Chargement..." />
                            ) : professeur ? (
                                <div style={{ textAlign: 'center' }}>
                                    <Avatar
                                        size="lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            marginBottom: 10
                                        }}
                                    >
                                        <FiUser size={24} color="white" />
                                    </Avatar>
                                    <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: 5 }}>
                                        {professeur.nomComplet}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '12px', marginBottom: 10 }}>
                                        {professeur.fonction?.libelle}
                                    </div>
                                    {professeur.contact && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 5,
                                            color: '#64748b',
                                            fontSize: '12px'
                                        }}>
                                            <FiPhone size={12} />
                                            {professeur.contact}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#64748b' }}>
                                    Professeur non trouvé
                                </div>
                            )}
                        </Panel>

                        {/* Statistiques */}
                        <Panel
                            header="Statistiques"
                            shaded
                            style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)'
                            }}
                        >
                            <div className="mt-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                                <div style={{ textAlign: 'center', padding: '10px', background: '#f0f9ff', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#0369a1' }}>
                                        {stats.moyenne}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Moyenne</div>
                                </div>

                                <div style={{ textAlign: 'center', padding: '10px', background: '#f0fdf4', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#16a34a' }}>
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
                                    </span>
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
                                    subtitle={`${processedNotes.length} élève(s)`}

                                    data={processedNotes}
                                    loading={notesLoading}
                                    error={null}

                                    columns={tableConfig.columns}
                                    searchableFields={tableConfig.searchableFields}
                                    filterConfigs={tableConfig.filterConfigs}

                                    onAction={() => { }} // Pas d'actions sur les lignes
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
                                            // Garder le scroll fonctionnel même si verrouillé
                                            opacity: isLocked ? 0.75 : 1,
                                            // NE PAS utiliser pointer-events: none pour garder le scroll
                                            overflow: 'auto'
                                        }
                                    }}

                                    // Message personnalisé si verrouillé
                                    emptyMessage={
                                        processedNotes.length === 0
                                            ? (isLocked
                                                ? "Évaluation verrouillée - Aucun élève trouvé"
                                                : "Aucun élève trouvé")
                                            : undefined
                                    }

                                    // Permettre le scroll même si verrouillé
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