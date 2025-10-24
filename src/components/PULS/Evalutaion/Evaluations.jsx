import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    SelectPicker,
    Button,
    Panel,
    Row,
    Col,
    Message,
    Loader,
    Badge,
    Steps,
    Modal,
    Input,
    DatePicker,
    InputNumber
} from 'rsuite';
import {
    FiSearch,
    FiRotateCcw,
    FiCalendar,
    FiBookOpen,
    FiBarChart,
    FiPlus,
    FiEye,
    FiEdit,
    FiTrash2
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import {
    useEvaluationsData,
    getEvaluationsTableConfig
} from './EvaluationService';
import {
    useClassesData,
    useMatieresData,
    usePeriodesData
} from "../utils/CommonDataService";
import { useAllApiUrls } from "../utils/apiConfig";
import { usePulsParams } from "../../hooks/useDynamicParams";
import IconBox from "../Composant/IconBox";
import GradientButton from '../../GradientButton';


// ===========================
// 🎨 CONFIGURATION SWEETALERT2 PERSONNALISÉE
// ===========================
const showConfirmDialog = (options) => {
    return Swal.fire({
        title: options.title || 'Êtes-vous sûr?',
        text: options.text || '',
        icon: options.icon || 'warning',
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: options.confirmButtonText || 'Oui, confirmer',
        cancelButtonText: 'Annuler',
        reverseButtons: true,
        ...options
    });
};

const showSuccessAlert = (message) => {
    return Swal.fire({
        icon: 'success',
        title: 'Succès!',
        text: message,
        confirmButtonColor: '#667eea',
        timer: 2000,
        timerProgressBar: true
    });
};

const showErrorAlert = (message) => {
    return Swal.fire({
        icon: 'error',
        title: 'Erreur!',
        text: message,
        confirmButtonColor: '#ef4444'
    });
};

// ===========================
// 🆕 MODAL UNIFIÉ CRÉATION/MODIFICATION
// ===========================
const EvaluationModal = ({
    open,
    onClose,
    evaluation = null,
    onSave,
    mode = 'create', // 'create' ou 'edit'
    currentClasseId = null,
    currentUserId = null,
    currentAnneeId = null
}) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { periodes } = usePeriodesData();
    const { classes } = useClassesData();




    const {
        matieres,
        loading: matieresLoading,
        fetchMatieres
    } = useMatieresData();

    // Charger les matières quand une classe est sélectionnée
    useEffect(() => {
        const classeId = formData.classeId || evaluation?.classe_id || currentClasseId;
        if (classeId && open) {
            console.log('📚 Chargement des matières pour la classe:', classeId);
            fetchMatieres(classeId, currentAnneeId || 38);
        }
    }, [formData.classeId, evaluation?.classe_id, currentClasseId, open, fetchMatieres, currentAnneeId]);

    // Initialiser le formulaire
    useEffect(() => {
        if (open) {
            if (mode === 'edit' && evaluation) {
                // Mode modification
                console.log('🔧 Mode MODIFICATION - Initialisation avec:', evaluation);

                let dureeDate = null;
                if (evaluation.duree_raw) {
                    const [hours, minutes] = evaluation.duree_raw.split('-');
                    dureeDate = new Date();
                    dureeDate.setHours(parseInt(hours) || 0);
                    dureeDate.setMinutes(parseInt(minutes) || 0);
                    dureeDate.setSeconds(0);
                }

                let evaluationDate = new Date();
                if (evaluation.date) {
                    try {
                        evaluationDate = new Date(evaluation.date);
                        if (isNaN(evaluationDate.getTime())) {
                            evaluationDate = new Date();
                        }
                    } catch (error) {
                        evaluationDate = new Date();
                    }
                }

                setFormData({
                    typeId: evaluation.type_id,
                    periodeId: evaluation.periode_id,
                    classeId: evaluation.classe_id,
                    matiereId: evaluation.matiere_id,
                    noteSur: evaluation.noteSur,
                    date: evaluationDate,
                    duree: dureeDate
                });
            } else {
                // Mode création
                console.log('✨ Mode CRÉATION - Initialisation avec classe:', currentClasseId);

                const now = new Date();
                const defaultDuree = new Date();
                defaultDuree.setHours(2);
                defaultDuree.setMinutes(0);
                defaultDuree.setSeconds(0);

                setFormData({
                    typeId: 2, // Devoir par défaut
                    periodeId: null,
                    classeId: currentClasseId,
                    matiereId: null,
                    noteSur: 20,
                    date: now,
                    duree: defaultDuree
                });
            }
            setErrors({});
        }
    }, [evaluation, open, mode, currentClasseId]);

    // Validation du formulaire
    const validateForm = () => {
        const newErrors = {};

        if (!formData.typeId) {
            newErrors.typeId = 'Le type est requis';
        }
        if (!formData.periodeId) {
            newErrors.periodeId = 'La période est requise';
        }
        if (!formData.classeId) {
            newErrors.classeId = 'La classe est requise';
        }
        if (!formData.matiereId) {
            newErrors.matiereId = 'La matière est requise';
        }
        if (!formData.noteSur) {
            newErrors.noteSur = 'La note sur est requise';
        }
        if (!formData.date) {
            newErrors.date = 'La date est requise';
        }
        if (!formData.duree) {
            newErrors.duree = 'La durée est requise';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            showErrorAlert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            setLoading(true);

            // Convertir la durée
            let dureeFormatted = '';
            if (formData.duree) {
                const hours = formData.duree.getHours().toString().padStart(2, '0');
                const minutes = formData.duree.getMinutes().toString().padStart(2, '0');
                dureeFormatted = `${hours}-${minutes}`;
            }

            const dataToSave = {
                ...formData,
                duree: dureeFormatted
            };

            if (onSave) {
                await onSave(dataToSave);
            }
            onClose();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setLoading(false);
        }
    };

    const typesData = [
        { label: 'Composition', value: 1 },
        { label: 'Devoir', value: 2 },
        { label: 'Interrogation', value: 3 }
    ];

    return (
        <Modal open={open} onClose={onClose} size="lg">
            <Modal.Header>
                <Modal.Title style={{ color: '#1e293b', fontWeight: '600' }}>
                    {mode === 'create' ? '✨ Créer une évaluation' : '✏️ Modifier une évaluation'}
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
                                Type d'évaluation *
                            </label>
                            <SelectPicker
                                data={typesData}
                                value={formData.typeId}
                                onChange={(value) => setFormData(prev => ({ ...prev, typeId: value }))}
                                placeholder="Sélectionner le type"
                                style={{ width: '100%' }}
                                cleanable={false}
                            />
                            {errors.typeId && (
                                <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.typeId}</span>
                            )}
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Période *
                            </label>
                            <SelectPicker
                                data={periodes}
                                value={formData.periodeId}
                                onChange={(value) => setFormData(prev => ({ ...prev, periodeId: value }))}
                                placeholder="Sélectionner la période"
                                style={{ width: '100%' }}
                                cleanable={false}
                            />
                            {errors.periodeId && (
                                <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.periodeId}</span>
                            )}
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Classe *
                            </label>
                            {mode === 'edit' ? (
                                <Input
                                    value={evaluation?.classe || ''}
                                    disabled
                                    style={{ width: '100%', backgroundColor: '#f8fafc' }}
                                />
                            ) : (
                                <SelectPicker
                                    data={classes}
                                    value={formData.classeId}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, classeId: value, matiereId: null }));
                                    }}
                                    placeholder="Sélectionner la classe"
                                    style={{ width: '100%' }}
                                    cleanable={false}
                                    searchable
                                />
                            )}
                            {errors.classeId && (
                                <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.classeId}</span>
                            )}
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Matière *
                            </label>
                            <SelectPicker
                                data={matieres.map(matiere => ({
                                    value: matiere.id,
                                    label: matiere.libelle,
                                    id: matiere.id
                                }))}
                                value={formData.matiereId}
                                onChange={(value) => setFormData(prev => ({ ...prev, matiereId: value }))}
                                placeholder="Sélectionner la matière"
                                style={{ width: '100%' }}
                                loading={matieresLoading}
                                cleanable={false}
                                searchable
                                disabled={!formData.classeId}
                                renderMenu={menu => {
                                    if (matieres.length === 0 && !matieresLoading) {
                                        return (
                                            <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                                                {formData.classeId ? 'Aucune matière disponible' : 'Sélectionnez d\'abord une classe'}
                                            </div>
                                        );
                                    }
                                    return menu;
                                }}
                            />
                            {errors.matiereId && (
                                <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.matiereId}</span>
                            )}
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
                                Noté sur *
                            </label>
                            <InputNumber
                                value={formData.noteSur}
                                onChange={(value) => setFormData(prev => ({ ...prev, noteSur: value }))}
                                placeholder="Entrer la note maximale"
                                style={{ width: '100%' }}
                                min={1}
                                max={1000}
                                step={1}
                            />
                            {errors.noteSur && (
                                <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.noteSur}</span>
                            )}
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Date et heure *
                            </label>
                            <DatePicker
                                value={formData.date || new Date()}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev, date: value }));
                                }}
                                format="dd/MM/yyyy HH:mm"
                                style={{ width: '100%' }}
                                placeholder="Sélectionner date et heure"
                                cleanable={false}
                                showMeridian={false}
                                ranges={[
                                    {
                                        label: 'Maintenant',
                                        value: new Date()
                                    }
                                ]}
                            />
                            {errors.date && (
                                <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.date}</span>
                            )}
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569'
                            }}>
                                Durée *
                            </label>
                            <DatePicker
                                format="HH:mm"
                                value={formData.duree}
                                onChange={(value) => setFormData(prev => ({ ...prev, duree: value }))}
                                placeholder="HH:mm"
                                style={{ width: '100%' }}
                                ranges={[]}
                                hideMinutes={minute => minute % 5 !== 0}
                                cleanable={false}
                            />
                            {errors.duree && (
                                <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.duree}</span>
                            )}
                        </div>
                    </Col>
                </Row>

                <div style={{
                    marginTop: 20,
                    padding: '15px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#0369a1' }}>
                        <strong>Note :</strong> Les champs marqués d'un astérisque (*) sont obligatoires
                    </p>
                </div>
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
                    {mode === 'create' ? 'Créer' : 'Modifier'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE MODERNE
// ===========================
const EvaluationFilters = ({
    onSearch,
    onClear,
    loading = false,
    error = null,
    selectedClasse,
    selectedMatiere,
    selectedPeriode,
    onClasseChange,
    onMatiereChange,
    onPeriodeChange
}) => {
    const [formError, setFormError] = useState(null);
    const { classes, classesLoading, classesError, refetch } = useClassesData();

    const {
        matieres,
        loading: matieresLoading,
        error: matieresError,
        fetchMatieres,
        clearMatieres
    } = useMatieresData();

    const {
        periodes,
        loading: periodesLoading,
        error: periodesError
    } = usePeriodesData();

    useEffect(() => {
        if (selectedClasse) {
            fetchMatieres(selectedClasse, 38);
        } else {
            clearMatieres();
        }
    }, [selectedClasse, fetchMatieres, clearMatieres]);

    const handleSearch = useCallback(() => {
        if (!selectedClasse) {
            setFormError('Veuillez sélectionner une classe');
            return;
        }

        setFormError(null);
        if (onSearch) {
            onSearch({
                classeId: selectedClasse,
                matiereId: selectedMatiere,
                periodeId: selectedPeriode
            });
        }
    }, [selectedClasse, selectedMatiere, selectedPeriode, onSearch]);

    const handleClear = useCallback(() => {
        setFormError(null);
        if (onClear) onClear();
    }, [onClear]);

    const isDataLoading = classesLoading || periodesLoading || matieresLoading;
    const hasDataError = classesError || periodesError || matieresError;

    return (
        <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginBottom: '20px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 25,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <IconBox icon={FiCalendar} />
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Recherche des Évaluations
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Sélectionnez les critères pour filtrer les évaluations
                    </p>
                </div>
            </div>

            {hasDataError && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="error" showIcon style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                        Erreur de chargement des données
                    </Message>
                </div>
            )}

            {(formError || error) && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="warning" showIcon style={{ background: '#fffbeb', border: '1px solid #fed7aa' }}>
                        {formError || error?.message}
                    </Message>
                </div>
            )}

            <Row gutter={20}>
                <Col xs={24} sm={12} md={8}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Classe *
                        </label>
                        <SelectPicker
                            data={classes}
                            value={selectedClasse}
                            onChange={(value) => {
                                onClasseChange(value);
                                if (onMatiereChange) onMatiereChange(null);
                            }}
                            placeholder="Choisir une classe"
                            searchable
                            style={{ width: '100%' }}
                            loading={classesLoading}
                            disabled={classesLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={8}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Matière *
                        </label>
                        <SelectPicker
                            data={matieres.map(matiere => ({
                                value: matiere.id,
                                label: matiere.libelle,
                                id: matiere.id
                            }))}
                            value={selectedMatiere}
                            onChange={onMatiereChange}
                            placeholder={matieresLoading ? "Chargement..." : matieres.length === 0 ? "Sélectionnez d'abord une classe" : "Toutes les matières"}
                            searchable
                            style={{ width: '100%' }}
                            loading={matieresLoading}
                            disabled={!selectedClasse || matieresLoading || loading}
                            cleanable={true}
                            size="lg"
                            renderMenu={menu => {
                                if (matieres.length === 0 && !matieresLoading) {
                                    return (
                                        <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                                            {selectedClasse ? 'Aucune matière trouvée pour cette classe' : 'Sélectionnez d\'abord une classe'}
                                        </div>
                                    );
                                }
                                return menu;
                            }}
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={4}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Période *
                        </label>
                        <SelectPicker
                            data={periodes}
                            value={selectedPeriode}
                            onChange={onPeriodeChange}
                            placeholder="Toutes"
                            searchable
                            style={{ width: '100%' }}
                            loading={periodesLoading}
                            disabled={periodesLoading || loading}
                            cleanable={true}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={4}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: 'transparent',
                            fontSize: '14px'
                        }}>
                            Action
                        </label>
                        <div style={{ display: 'flex', gap: 8, height: '40px' }}>
                            <GradientButton
                                icon={<FiSearch size={16} />}
                                text="Rechercher"
                                loadingText="Chargement..."
                                loading={loading}
                                disabled={isDataLoading || loading}
                                onClick={handleSearch}
                                variant="primary"
                                style={{ flex: 1 }}
                            />

                            <Button
                                onClick={handleClear}
                                disabled={loading}
                                style={{
                                    minWidth: '45px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}
                                size="lg"
                            >
                                <FiRotateCcw size={16} />
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            <div style={{ marginTop: 15 }}>
                <Steps
                    current={selectedClasse ? (selectedMatiere || selectedPeriode ? 2 : 1) : 0}
                    size="small"
                    style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}
                >
                    <Steps.Item title="Classe" />
                    <Steps.Item title="Filtres" />
                    <Steps.Item title="Résultats" />
                </Steps>
            </div>

            {isDataLoading && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 15,
                    padding: '10px 15px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <Loader size="xs" />
                    <span style={{ fontSize: '14px', color: '#0369a1' }}>
                        Chargement des données...
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL DES ÉVALUATIONS
// ===========================
const Evaluations = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [selectedPeriode, setSelectedPeriode] = useState(null);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const apiUrls = useAllApiUrls();

    // ⚠️ TODO: Récupérer ces valeurs depuis le contexte utilisateur

    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        evaluations,
        loading: searchLoading,
        error: searchError,
        searchPerformed,
        searchEvaluations,
        clearResults
    } = useEvaluationsData();

    const {
        ecoleId: dynamicEcoleId,
        personnelInfo,
        academicYearId: dynamicAcademicYearId,
        periodicitieId: dynamicPeriodicitieId,
        profileId,
        userId: dynamicUserId,
        email,
        isAuthenticated,
        isInitialized,
        isReady,
    } = usePulsParams();


    // ===========================
    // ✅ GESTION CRÉATION D'ÉVALUATION
    // ===========================
    const handleCreateSave = useCallback(async (formData) => {
        const result = await showConfirmDialog({
            title: 'Créer l\'évaluation',
            text: 'Voulez-vous vraiment créer cette évaluation?',
            icon: 'question',
            confirmButtonText: 'Oui, créer'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            console.log('💾 Création de l\'évaluation:', formData);

            const payload = {
                id: null,
                code: "",
                date: formData.date ? formData.date.toISOString() : new Date().toISOString(),
                eleve: null,
                heure: "",
                duree: formData.duree || "02-00",
                etat: "",
                note: "",
                noteSur: parseInt(formData.noteSur) || 20,
                dateLimite: "",
                type: {
                    id: formData.typeId,
                    code: "",
                    libelle: ""
                },
                matiereEcole: {
                    id: formData.matiereId,
                    code: "",
                    libelle: ""
                },
                classe: {
                    id: formData.classeId,
                    code: "",
                    libelle: ""
                },
                periode: {
                    id: formData.periodeId,
                    code: "",
                    libelle: ""
                },
                annee: {
                    id: dynamicAcademicYearId
                },
                user: dynamicUserId
            };

            console.log('📤 Payload envoyé:', payload);

            const response = await axios.post(
                apiUrls.evaluations.saveAndDisplayEvaluation(),
                payload
            );

            console.log('✅ Création réussie:', response.data);

            await showSuccessAlert('L\'évaluation a été créée avec succès!');

            // Rafraîchir les données
            if (selectedClasse) {
                await searchEvaluations(selectedClasse, selectedMatiere, selectedPeriode);
            }

            setShowEvaluationModal(false);
            setSelectedEvaluation(null);

        } catch (error) {
            console.error('❌ Erreur lors de la création:', error);
            await showErrorAlert(
                error.response?.data?.message ||
                'Une erreur est survenue lors de la création de l\'évaluation'
            );
        }
    }, [selectedClasse, selectedMatiere, selectedPeriode, searchEvaluations, apiUrls.evaluations, dynamicUserId, dynamicAcademicYearId]);

    // ===========================
    // ✅ GESTION MODIFICATION D'ÉVALUATION
    // ===========================
    const handleModificationSave = useCallback(async (formData) => {
        const result = await showConfirmDialog({
            title: 'Confirmer la modification',
            text: 'Voulez-vous vraiment modifier cette évaluation?',
            icon: 'question',
            confirmButtonText: 'Oui, modifier'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            console.log('💾 Sauvegarde des modifications:', formData);

            const payload = {
                id: selectedEvaluation.id,
                code: selectedEvaluation.code,
                numero: selectedEvaluation.numero,
                date: formData.date ? formData.date.toISOString() : selectedEvaluation.date,
                noteSur: formData.noteSur || selectedEvaluation.noteSur,
                duree: formData.duree || selectedEvaluation.duree_raw,
                pec: selectedEvaluation.pec,
                type: {
                    id: formData.typeId || selectedEvaluation.type_id
                },
                periode: {
                    id: formData.periodeId || selectedEvaluation.periode_id
                },
                classe: {
                    id: formData.classeId || selectedEvaluation.classe_id
                },
                matiereEcole: {
                    id: formData.matiereId || selectedEvaluation.matiere_id
                },
                annee: {
                    id: selectedEvaluation.annee_id
                }
            };

            console.log('📤 Payload envoyé:', payload);

            const response = await axios.post(
                apiUrls.evaluations.updateDisplayEvaluation(),
                payload
            );

            console.log('✅ Modification réussie:', response.data);

            await showSuccessAlert('L\'évaluation a été modifiée avec succès!');

            if (selectedClasse) {
                await searchEvaluations(selectedClasse, selectedMatiere, selectedPeriode);
            }

            setShowEvaluationModal(false);
            setSelectedEvaluation(null);

        } catch (error) {
            console.error('❌ Erreur lors de la modification:', error);
            await showErrorAlert(
                error.response?.data?.message ||
                'Une erreur est survenue lors de la modification de l\'évaluation'
            );
        }
    }, [selectedEvaluation, selectedClasse, selectedMatiere, selectedPeriode, searchEvaluations, apiUrls.evaluations]);

    // ===========================
    // ✅ GESTION SUPPRESSION D'ÉVALUATION
    // ===========================
    const handleDeleteEvaluation = useCallback(async (evaluationId) => {
        const result = await showConfirmDialog({
            title: 'Confirmer la suppression',
            text: 'Cette action est irréversible. Voulez-vous vraiment supprimer cette évaluation?',
            icon: 'warning',
            confirmButtonText: 'Oui, supprimer',
            confirmButtonColor: '#ef4444'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            console.log('🗑️ Suppression de l\'évaluation:', evaluationId);

            // Appel DELETE à l'API
            const response = await axios.delete(
                `${apiUrls.evaluations.deleteEvaluation(evaluationId, dynamicUserId)}`
            );

            console.log('✅ Suppression réussie:', response.data);

            await showSuccessAlert('L\'évaluation a été supprimée avec succès!');

            // Rafraîchir les données
            if (selectedClasse) {
                await searchEvaluations(selectedClasse, selectedMatiere, selectedPeriode);
            }

        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            await showErrorAlert(
                error.response?.data?.message ||
                'Une erreur est survenue lors de la suppression de l\'évaluation'
            );
        }
    }, [selectedClasse, selectedMatiere, selectedPeriode, searchEvaluations, apiUrls.evaluations, dynamicUserId]);

    // ===========================
    // ✅ TOGGLE PEC AVEC CONFIRMATION
    // ===========================
    const handlePecToggle = useCallback(async (rowData, checked) => {
        const result = await showConfirmDialog({
            title: checked ? 'Activer PEC' : 'Désactiver PEC',
            text: `Voulez-vous vraiment ${checked ? 'activer' : 'désactiver'} le PEC pour cette évaluation?`,
            icon: 'question',
            confirmButtonText: checked ? 'Oui, activer' : 'Oui, désactiver'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const payload = {
                id: rowData.id,
                code: rowData.code,
                numero: rowData.numero,
                date: rowData.date,
                noteSur: rowData.noteSur,
                duree: rowData.duree_raw,
                pec: checked ? 1 : 0,
                type: {
                    id: rowData.type_id
                },
                periode: {
                    id: rowData.periode_id
                },
                classe: {
                    id: rowData.classe_id
                },
                matiereEcole: {
                    id: rowData.matiere_id
                },
                annee: {
                    id: rowData.annee_id
                }
            };

            const response = await axios.post(
                apiUrls.evaluations.updateDisplayEvaluation(),
                payload
            );

            await showSuccessAlert(
                `Le PEC a été ${checked ? 'activé' : 'désactivé'} avec succès!`
            );

            if (selectedClasse) {
                await searchEvaluations(selectedClasse, selectedMatiere, selectedPeriode);
            }

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour PEC:', error);
            await showErrorAlert(
                error.response?.data?.message ||
                'Une erreur est survenue lors de la mise à jour du PEC'
            );
        }
    }, [selectedClasse, selectedMatiere, selectedPeriode, searchEvaluations, apiUrls.evaluations]);

    const tableConfig = useMemo(() =>
        getEvaluationsTableConfig({
            onPecToggle: handlePecToggle
        }),
        [handlePecToggle]
    );

    const handleSearch = useCallback(async ({ classeId, matiereId, periodeId }) => {
        await searchEvaluations(classeId, matiereId, periodeId);
    }, [searchEvaluations]);

    const handleClearSearch = useCallback(() => {
        setSelectedClasse(null);
        setSelectedMatiere(null);
        setSelectedPeriode(null);
        clearResults();
    }, [clearResults]);

    const handleTableActionLocal = useCallback((actionType, item) => {
        if (actionType === 'view' && item && item.code) {
            navigate(`/evaluations/detail/${item.code}`);
            return;
        }

        if (actionType === 'edit' && item) {
            setSelectedEvaluation(item);
            setModalMode('edit');
            setShowEvaluationModal(true);
            return;
        }

        if (actionType === 'delete' && item) {
            handleDeleteEvaluation(item.id);
            return;
        }

        if (actionType === 'create') {
            setSelectedEvaluation(null);
            setModalMode('create');
            setShowEvaluationModal(true);
            return;
        }

        handleTableAction(actionType, item);
    }, [navigate, handleTableAction, handleDeleteEvaluation]);

    const handleModalSave = useCallback(async () => {
        try {
            if (modalState.type === 'delete') {
                await handleDeleteEvaluation(modalState.selectedItem.id);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedItem, handleCloseModal, handleDeleteEvaluation]);

    const handleCreateEvaluation = useCallback(() => {
        if (!selectedClasse) {
            showErrorAlert('Veuillez d\'abord sélectionner une classe avant de créer une évaluation');
            return;
        }
        setSelectedEvaluation(null);
        setModalMode('create');
        setShowEvaluationModal(true);
    }, [selectedClasse]);

    const handleRefresh = useCallback(() => {
        if (selectedClasse) {
            searchEvaluations(selectedClasse, selectedMatiere, selectedPeriode);
        }
    }, [selectedClasse, selectedMatiere, selectedPeriode, searchEvaluations]);

    return (
        <div style={{
            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-12">
                        <EvaluationFilters
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={searchLoading}
                            error={searchError}
                            selectedClasse={selectedClasse}
                            selectedMatiere={selectedMatiere}
                            selectedPeriode={selectedPeriode}
                            onClasseChange={setSelectedClasse}
                            onMatiereChange={setSelectedMatiere}
                            onPeriodeChange={setSelectedPeriode}
                        />
                    </div>
                </div>

                {!searchPerformed && !searchLoading && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(59, 130, 246, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 15
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FiCalendar size={24} color="white" />
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                        Prêt à consulter les évaluations ?
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        Sélectionnez au minimum une classe dans le formulaire ci-dessus pour démarrer
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {searchError && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 15
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '24px' }}>⚠️</span>
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#dc2626', fontWeight: '600' }}>
                                        Erreur de recherche
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        {searchError.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {searchPerformed && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                overflow: 'hidden'
                            }}>
                                <DataTable
                                    title="Liste des Évaluations"
                                    subtitle="évaluation(s) trouvée(s)"
                                    data={evaluations}
                                    loading={searchLoading}
                                    error={null}
                                    columns={tableConfig.columns}
                                    searchableFields={tableConfig.searchableFields}
                                    filterConfigs={tableConfig.filterConfigs}
                                    actions={tableConfig.actions}
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={handleCreateEvaluation}
                                    defaultPageSize={15}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={600}
                                    enableRefresh={true}
                                    enableCreate={true}
                                    createButtonText="Nouvelle Évaluation"
                                    selectable={false}
                                    rowKey="id"
                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { minHeight: "600px", border: "none", boxShadow: "none" },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {searchPerformed && evaluations?.length === 0 && !searchLoading && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '40px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(245, 158, 11, 0.15)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20
                                }}>
                                    <FiCalendar size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Aucune évaluation trouvée
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Aucun résultat pour ces critères de recherche. Essayez d'élargir vos filtres.
                                </p>
                                <Button
                                    appearance="primary"
                                    style={{
                                        marginTop: 15,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                    startIcon={<FiPlus />}
                                    onClick={handleCreateEvaluation}
                                >
                                    Créer une nouvelle évaluation
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 🆕 MODAL UNIFIÉ CRÉATION/MODIFICATION */}
            <EvaluationModal
                open={showEvaluationModal}
                onClose={() => {
                    setShowEvaluationModal(false);
                    setSelectedEvaluation(null);
                }}
                evaluation={selectedEvaluation}
                onSave={modalMode === 'create' ? handleCreateSave : handleModificationSave}
                mode={modalMode}
                currentClasseId={selectedClasse}
                currentUserId={dynamicUserId}
                currentAnneeId={dynamicAcademicYearId}
            />

            {modalState.isOpen && (
                <Modal open={modalState.isOpen} onClose={handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {modalState.type === 'delete' ? 'Supprimer l\'évaluation' : 'Action'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {modalState.type === 'delete' && (
                            <p>Êtes-vous sûr de vouloir supprimer cette évaluation ?</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleCloseModal} appearance="subtle">
                            Annuler
                        </Button>
                        <Button onClick={handleModalSave} appearance="primary" color="red">
                            {modalState.type === 'delete' ? 'Supprimer' : 'Confirmer'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default Evaluations;