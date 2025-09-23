import React, { useState, useCallback, useEffect } from 'react';
import {
    Badge,
    Button,
    Panel
} from 'rsuite';
import {
    FiFileText,
    FiSave,
    FiCheckCircle
} from 'react-icons/fi';
import SelectPicker from "rsuite/SelectPicker";
import DataTable from '../../DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import usePostData from "../../hooks/usePostData";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import { fetchQuestions } from './quizzService';
import { loadAllReferenceData, loadSubDomains } from '../../services/referenceDataService';
import { useFormUtils, initialReferenceData, validateQuizForm, prepareQuizDataForSubmission } from '../utils/formUtils';
import { questionsTableConfig } from '../config/tableConfigs';
import QuestionModal from '../modal/QuestionModal';

const SaveCourses = () => {
    // ===========================
    // CONFIGURATION & CONSTANTES
    // ===========================
    const MySwal = withReactContent(Swal);
    const { postData, loadingPost, errorPost } = usePostData("quiz_api.php");

    // ===========================
    // ÉTATS - DONNÉES DE RÉFÉRENCE
    // ===========================
    const [referenceData, setReferenceData] = useState(initialReferenceData);

    // ===========================
    // ÉTATS - FORMULAIRE PRINCIPAL
    // ===========================
    const initialFormData = {
        // Informations de base
        title: "",
        description: "",
        color: "#3498db",

        // Catégorisation
        domain_id: null,
        sub_domain_id: null,
        country_id: null,
        course_id: null,
        lesson_id: null,
        difficulty_id: null,

        // Configuration
        time_limit: 600,
        total_points: 0,
        min_pass_points: 60,
        is_featured: 0,
        premium_level_id: null,
        active: 1
    };

    const [formData, setFormData] = useState(initialFormData);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        questionsState,
        modalState,
        uiState,
        updateQuestionsState,
        updateModalState,
        updateUiState,
        handleQuestionSelection,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        updateFormField,
        resetForm,
        updatePointsFromQuestions
    } = useFormUtils(initialFormData, setFormData);

    // ===========================
    // FONCTIONS UTILITAIRES
    // ===========================

    const resetFormComplete = useCallback(() => {
        resetForm();
        updateQuestionsState({
            selectedIds: [],
            selectedQuestions: [],
            error: null
        });
    }, [resetForm, updateQuestionsState]);

    // ===========================
    // GESTION DES DONNÉES
    // ===========================

    const loadAllReferenceDataLocal = useCallback(async () => {
        try {
            await loadAllReferenceData(setReferenceData, updateQuestionsState);
        } catch (error) {
            console.error("Erreur lors du chargement des données de référence:", error);
        }
    }, [updateQuestionsState]);

    const loadSubDomainsLocal = useCallback(async (domainId) => {
        try {
            await loadSubDomains(domainId, setReferenceData);
        } catch (error) {
            console.error("Erreur lors du chargement des sous-domaines:", error);
        }
    }, []);

    const fetchQuestionsLocal = useCallback(async (preventLoadingState = false) => {
        try {
            await fetchQuestions(updateQuestionsState, preventLoadingState);
        } catch (error) {
            console.error("Erreur lors du chargement des questions:", error);
        }
    }, [updateQuestionsState]);

    // ===========================
    // GESTION DES QUESTIONS
    // ===========================

    const handleQuestionSelectionLocal = useCallback((questionIds) => {
        handleQuestionSelection(questionIds, questionsState.data, updatePointsFromQuestions);
    }, [handleQuestionSelection, questionsState.data, updatePointsFromQuestions]);

    // ===========================
    // GESTION DU MODAL
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        handleTableAction(actionType, item);
    }, [handleTableAction]);

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'edit':
                    console.log('Modifier la question:', modalState.selectedQuestion);
                    break;

                case 'delete':
                    console.log('Supprimer la question:', modalState.selectedQuestion);
                    await fetchQuestionsLocal(true);
                    break;

                case 'create':
                    console.log('Créer une nouvelle question');
                    await fetchQuestionsLocal(true);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedQuestion, handleCloseModal, fetchQuestionsLocal]);

    // ===========================
    // SOUMISSION DU FORMULAIRE
    // ===========================

    const handleSubmitQuiz = useCallback(async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Validation
        const validationErrors = validateQuizForm(formData, questionsState.selectedIds);
        if (validationErrors.length > 0) {
            MySwal.fire({
                title: 'Erreurs de validation',
                html: validationErrors.map(error => `<p>• ${error}</p>`).join(''),
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Confirmation utilisateur
        const confirm = await MySwal.fire({
            title: 'Confirmer la création du quiz ?',
            text: `Voulez-vous créer le quiz "${formData.title}" avec ${questionsState.selectedIds.length} question(s) ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui, créer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        if (!confirm.isConfirmed) return;

        try {
            updateUiState({ submitLoading: true });

            const dataToSend = prepareQuizDataForSubmission(formData, questionsState.selectedIds);

            const result = await postData(dataToSend);

            if (result && result.success) {
                toast.success(`✅ Quiz "${result.data?.title || formData.title}" créé avec succès !`, {
                    position: "top-center"
                });
                resetFormComplete();
            } else {
                throw new Error(result?.message || "Erreur lors de la création du quiz");
            }
        } catch (err) {
            console.error("Erreur lors de la création du quiz:", err);
            toast.error(`❌ Erreur: ${err.message}`, {
                position: "top-center"
            });
        } finally {
            updateUiState({ submitLoading: false });
        }
    }, [formData, questionsState.selectedIds, postData, resetFormComplete, MySwal, updateUiState]);

    // ===========================
    // EFFETS (useEffect)
    // ===========================

    // Chargement initial des données de référence
    useEffect(() => {
        loadAllReferenceDataLocal();
    }, [loadAllReferenceDataLocal]);

    // Chargement des sous-domaines quand le domaine change
    useEffect(() => {
        loadSubDomainsLocal(formData.domain_id);
    }, [formData.domain_id, loadSubDomainsLocal]);

    // Chargement initial des questions
    useEffect(() => {
        fetchQuestionsLocal();
    }, [fetchQuestionsLocal]);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                PANNEAU PRINCIPAL
                =========================== */}
            <Panel
                header={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{
                                margin: 0,
                                color: '#2c3e50',
                                fontSize: '20px',
                                fontWeight: '600'
                            }}>
                                Création d'un Quiz
                            </h3>
                            <p style={{
                                margin: '4px 0 0 0',
                                color: '#6c757d',
                                fontSize: '14px'
                            }}>
                                Configurez votre quiz et sélectionnez les questions
                            </p>
                        </div>
                    </div>
                }
                bordered
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                <div className='row mt-5'>
                    {/* ===========================
                        COLONNE GAUCHE - FORMULAIRE
                        =========================== */}
                    <div className='col-lg-6'>
                        <div className="row">
                            {/* INFORMATIONS DE BASE */}
                            <div className="col-lg-12">
                                <h5 className="mb-3" style={{ color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                                    <FiFileText style={{ marginRight: '8px' }} />
                                    Informations de base
                                </h5>
                            </div>

                            {/* Titre */}
                            <div className="col-lg-8">
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Titre du quiz
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Saisir le titre du quiz"
                                        value={formData.title}
                                        onChange={(e) => updateFormField('title', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Couleur */}
                            <div className="col-lg-4">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Couleur du quiz
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="color"
                                            className="form-control"
                                            value={formData.color}
                                            onChange={(e) => updateFormField('color', e.target.value)}
                                            style={{ width: '60px', height: '38px', padding: '2px' }}
                                        />
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.color}
                                            onChange={(e) => updateFormField('color', e.target.value)}
                                            placeholder="#3498db"
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="col-lg-12">
                                <div className="form-group mb-4">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Description
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Saisir la description du quiz"
                                        value={formData.description}
                                        onChange={(e) => updateFormField('description', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* CATÉGORISATION */}
                            <div className="col-lg-12">
                                <h5 className="mb-3 mt-3" style={{ color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                                    Catégorisation
                                </h5>
                            </div>

                            {/* Domaine & Sous-domaine */}
                            <div className="col-lg-6">
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Domaine d'activité
                                    </label>
                                    <SelectPicker
                                        data={referenceData.domaines}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('domain_id', value)}
                                        value={formData.domain_id}
                                        placeholder="Sélectionnez un domaine"
                                    />
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Sous-domaine
                                    </label>
                                    <SelectPicker
                                        data={referenceData.sousdomaines}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('sub_domain_id', value)}
                                        value={formData.sub_domain_id}
                                        placeholder="Sélectionnez un sous-domaine"
                                        disabled={!formData.domain_id}
                                    />
                                </div>
                            </div>

                            {/* Niveau Premium & Difficulté */}
                            <div className="col-lg-6">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Niveau Premium
                                    </label>
                                    <SelectPicker
                                        data={referenceData.niveauxPremium}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('premium_level_id', value)}
                                        value={formData.premium_level_id}
                                        placeholder="Sélectionnez un niveau"
                                    />
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Niveau de difficulté
                                    </label>
                                    <SelectPicker
                                        data={referenceData.difficultes}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('difficulty_id', value)}
                                        value={formData.difficulty_id}
                                        placeholder="Sélectionnez un niveau"
                                    />
                                </div>
                            </div>

                            {/* Pays & Cours */}
                            <div className="col-lg-4">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Pays
                                    </label>
                                    <SelectPicker
                                        data={referenceData.pays}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('country_id', value)}
                                        value={formData.country_id}
                                        placeholder="Sélectionnez un pays"
                                    />
                                </div>
                            </div>

                            <div className="col-lg-4">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Cours
                                    </label>
                                    <SelectPicker
                                        data={referenceData.cours}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('course_id', value)}
                                        value={formData.course_id}
                                        placeholder="Sélectionnez un cours"
                                    />
                                </div>
                            </div>

                            <div className="col-lg-4">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Leçon
                                    </label>
                                    <SelectPicker
                                        data={referenceData.lecons}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('lesson_id', value)}
                                        value={formData.lesson_id}
                                        placeholder="Sélectionnez une leçon"
                                    />
                                </div>
                            </div>

                            {/* CONFIGURATION */}
                            <div className="col-lg-12">
                                <h5 className="mb-3 mt-3" style={{ color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                                    Configuration
                                </h5>
                            </div>

                            {/* Temps limite */}
                            <div className="col-lg-4">
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Temps limite (secondes)
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="60"
                                        value={formData.time_limit}
                                        onChange={(e) => updateFormField('time_limit', parseInt(e.target.value) || 600)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Points totaux */}
                            <div className="col-lg-4">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Points totaux
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        value={formData.total_points}
                                        onChange={(e) => updateFormField('total_points', parseInt(e.target.value) || 0)}
                                        disabled
                                    />
                                    <small className="text-muted">
                                        Calculé automatiquement selon les questions sélectionnées
                                    </small>
                                </div>
                            </div>

                            {/* Score minimum */}
                            <div className="col-lg-4">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Score minimum pour réussir
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        max={formData.total_points}
                                        value={formData.min_pass_points}
                                        onChange={(e) => updateFormField('min_pass_points', parseInt(e.target.value) || 60)}
                                    />
                                </div>
                            </div>

                            {/* RÉSUMÉ DE LA SÉLECTION */}
                            {questionsState.selectedQuestions.length > 0 && (
                                <div className="col-lg-12">
                                    <div className="mt-4 p-3 bg-light rounded">
                                        <h6 className="mb-2">
                                            <FiCheckCircle style={{ color: 'green', marginRight: '8px' }} />
                                            Questions sélectionnées: {questionsState.selectedQuestions.length}
                                        </h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {questionsState.selectedQuestions.slice(0, 5).map((q, index) => (
                                                <Badge key={q.id} color="blue">
                                                    Q{q.id}: {q.points} pts
                                                </Badge>
                                            ))}
                                            {questionsState.selectedQuestions.length > 5 && (
                                                <Badge color="gray">
                                                    +{questionsState.selectedQuestions.length - 5} autres...
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Total: <strong style={{ color: formData.color }}>{formData.total_points} points</strong>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BOUTONS D'ACTION */}
                            <div className="col-lg-12">
                                <div className="mt-4 d-flex justify-content-end gap-2">
                                    <Button
                                        type="button"
                                        appearance="subtle"
                                        onClick={resetFormComplete}
                                        disabled={uiState.submitLoading}
                                    >
                                        Réinitialiser
                                    </Button>
                                    <Button
                                        type="button"
                                        appearance="primary"
                                        loading={uiState.submitLoading}
                                        disabled={uiState.submitLoading || questionsState.selectedQuestions.length === 0}
                                        startIcon={<FiSave />}
                                        style={{ backgroundColor: formData.color, borderColor: formData.color }}
                                        onClick={handleSubmitQuiz}
                                    >
                                        {uiState.submitLoading ? 'Création en cours...' : 'Créer le Quiz'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===========================
                        COLONNE DROITE - TABLEAU DES QUESTIONS
                        =========================== */}
                    <div className='col-lg-6'>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={(e) => e.stopPropagation()}
                            style={{ width: '100%' }}
                        >
                            <DataTable
                                title="Sélection des Questions"
                                subtitle={`question(s) disponible(s)`}
                                data={questionsState.data}
                                loading={questionsState.loading}
                                error={questionsState.error}
                                columns={questionsTableConfig.columns}
                                searchableFields={questionsTableConfig.searchableFields}
                                filterConfigs={questionsTableConfig.filterConfigs}
                                actions={questionsTableConfig.actions}
                                onAction={handleTableActionLocal}
                                onRefresh={() => fetchQuestionsLocal(false)}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={600}
                                enableRefresh={true}
                                enableCreate={true}
                                createButtonText="Nouvelle Question"
                                selectable={true}
                                selectedItems={questionsState.selectedIds}
                                onSelectionChange={handleQuestionSelectionLocal}
                                rowKey="id"
                                customStyles={{
                                    container: { backgroundColor: '#f8f9fa' },
                                    panel: { minHeight: '600px' }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Panel>

            {/* ===========================
                MODAL DE GESTION DES QUESTIONS
                =========================== */}
            <QuestionModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
                referenceData={referenceData}
            />
        </>
    );
};

export default SaveCourses;