import React, { useState, useCallback, useEffect } from 'react';
import {
    Badge,
    Button,
    Panel,
    Progress,
    Message
} from 'rsuite';
import {
    FiFileText,
    FiSave,
    FiCheckCircle,
    FiEdit,
    FiPlus
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom'; // Ajout des hooks de navigation
import SelectPicker from "rsuite/SelectPicker";
import DataTable from '../../DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import usePostData from "../../hooks/usePostData";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';

// Import des fonctions externalisées
import { loadAllReferenceData, loadSubDomains } from '../../services/referenceDataService';
import { useFormUtils, initialReferenceData, validateQuizForm, prepareQuizDataForSubmission } from '../utils/formUtils';
import { questionsTableConfig } from '../config/tableConfigs';
import QuestionModal from '../modal/QuestionModal';
import { useQuestionsData } from '../utils/DataServiceManager';

const SaveQuiz = () => {
    // ===========================
    // CONFIGURATION & CONSTANTES
    // ===========================
    const MySwal = withReactContent(Swal);
    const { postData, loadingPost, errorPost } = usePostData("quiz_api.php");
    const { quizId } = useParams(); // Récupération de l'ID du quiz depuis l'URL
    const navigate = useNavigate(); // Hook pour la navigation

    // Déterminer le mode (création ou modification)
    const isEditMode = Boolean(quizId);

    //alert(isEditMode);

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
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ===========================
    // ÉTATS - CHARGEMENT
    // ===========================
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [originalQuizData, setOriginalQuizData] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // ===========================
    // ÉTATS - GESTION DES QUESTIONS
    // ===========================
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    // ===========================
    // ÉTATS - GESTION DES MODALES
    // ===========================
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null, // 'create', 'edit', 'delete'
        selectedQuestion: null
    });

    // ===========================
    // ÉTATS - UI
    // ===========================
    const [uiState, setUiState] = useState({
        submitLoading: false
    });

    // ===========================
    // DONNÉES DES QUESTIONS
    // ===========================
    const { questionData, loading, error, refetch } = useQuestionsData(refreshTrigger);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        updateFormField,
        resetForm
    } = useFormUtils(initialFormData, setFormData);

    // ===========================
    // FONCTIONS UTILITAIRES
    // ===========================

    const resetFormComplete = useCallback(() => {
        resetForm();
        setSelectedQuestionIds([]);
        setSelectedQuestions([]);
        setOriginalQuizData(null);
        setIsInitialized(false);
    }, [resetForm]);

    const updateUiState = useCallback((updates) => {
        setUiState(prev => ({ ...prev, ...updates }));
    }, []);

    // ===========================
    // FONCTION DE CHARGEMENT DU QUIZ EXISTANT
    // ===========================
    const loadQuizData = async (id) => {

        if (!id) return;

        setIsLoadingQuiz(true);
        setLoadError(null);
        try {
            const response = await fetch('http://localhost/CRUDPHP/api/quiz_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_quiz',
                    quiz_id: id
                })
            });

            const result = await response.json();
            console.log("Données du quiz chargées:", result);

            if (result.success && result.data) {
                const { quiz, questions, associations } = result.data;

                // Pré-remplir le formulaire
                setFormData({
                    title: quiz.title || '',
                    description: quiz.description || '',
                    color: quiz.color || '#3498db',
                    domain_id: quiz.domain_id,
                    sub_domain_id: quiz.sub_domain_id,
                    country_id: quiz.country_id,
                    course_id: quiz.course_id,
                    lesson_id: quiz.lesson_id,
                    difficulty_id: quiz.difficulty_id,
                    time_limit: quiz.time_limit || 600,
                    total_points: quiz.total_points || 0,
                    min_pass_points: quiz.min_pass_points || 60,
                    is_featured: quiz.is_featured || 0,
                    premium_level_id: quiz.premium_level_id,
                    active: quiz.active !== undefined ? quiz.active : 1
                });

                // Sauvegarder les données originales
                setOriginalQuizData(result.data);

                // Pré-sélectionner les questions associées
                const questionIds = questions.map(q => q.id) || [];
                setSelectedQuestionIds(questionIds);
                setSelectedQuestions(questions || []);

                // Charger les sous-domaines si un domaine est sélectionné
                if (quiz.domain_id) {
                    try {
                        await loadSubDomains(quiz.domain_id, setReferenceData);
                    } catch (error) {
                        console.error("Erreur lors du chargement des sous-domaines:", error);
                    }
                }

                setIsInitialized(true);
            } else {
                throw new Error(result.error || 'Erreur lors du chargement du quiz');
            }

        } catch (error) {
            console.error('Erreur lors du chargement du quiz:', error);
            setLoadError(error.message);
            MySwal.fire({
                title: 'Erreur',
                text: `Impossible de charger le quiz: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Retour'
            }).then(() => {
                navigate('/quiz');
            });
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    // ===========================
    // GESTION DES DONNÉES
    // ===========================

    const loadAllReferenceDataLocal = useCallback(async () => {
        try {
            await loadAllReferenceData(setReferenceData);
        } catch (error) {
            console.error("Erreur lors du chargement des données de référence:", error);
        }
    }, []);

    const loadSubDomainsLocal = useCallback(async (domainId) => {
        try {
            await loadSubDomains(domainId, setReferenceData);
        } catch (error) {
            console.error("Erreur lors du chargement des sous-domaines:", error);
        }
    }, []);

    // ===========================
    // GESTION DES QUESTIONS
    // ===========================

    const updatePointsFromQuestions = useCallback((questions) => {
        const totalPoints = questions.reduce((sum, question) => sum + (question.points || 0), 0);
        setFormData(prev => ({ ...prev, total_points: totalPoints }));
    }, []);

    const handleQuestionSelection = useCallback((questionIds) => {
        console.log("Sélection des questions:", questionIds);
        
        // Mettre à jour les IDs sélectionnés
        setSelectedQuestionIds(questionIds);
        
        // Trouver les objets questions correspondants
        const selectedQuestionsObjects = questionData.filter(question => 
            questionIds.includes(question.id)
        );
        
        console.log("Questions sélectionnées:", selectedQuestionsObjects);
        setSelectedQuestions(selectedQuestionsObjects);
        
        // Mettre à jour les points totaux
        updatePointsFromQuestions(selectedQuestionsObjects);
    }, [questionData, updatePointsFromQuestions]);

    // ===========================
    // GESTION DES MODALES
    // ===========================

    const handleTableAction = useCallback((actionType, item) => {
        console.log("Action tableau:", actionType, item);
        
        setModalState({
            isOpen: true,
            type: actionType,
            selectedQuestion: item
        });
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalState({
            isOpen: false,
            type: null,
            selectedQuestion: null
        });
    }, []);

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'edit':
                    console.log('Modifier la question:', modalState.selectedQuestion);
                    break;

                case 'delete':
                    console.log('Supprimer la question:', modalState.selectedQuestion);
                    // Recharger les questions après suppression
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'create':
                    console.log('Créer une nouvelle question');
                    // Recharger les questions après création
                    setRefreshTrigger(prev => prev + 1);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedQuestion, handleCloseModal]);

    // ===========================
    // GESTION DU DOMAINE
    // ===========================

    const handleDomainChange = useCallback(async (domainId) => {
        updateFormField('domain_id', domainId);
        updateFormField('sub_domain_id', null);

        if (domainId) {
            await loadSubDomainsLocal(domainId);
        }
    }, [updateFormField, loadSubDomainsLocal]);

    // ===========================
    // PRÉPARATION DES DONNÉES POUR SOUMISSION
    // ===========================
    const prepareSubmissionData = useCallback(() => {
        const baseData = prepareQuizDataForSubmission(formData, selectedQuestionIds);
        
        if (isEditMode) {
            return {
                action: 'update_quiz',
                quiz_id: quizId,
                ...baseData
            };
        } else {
            return {
                action: 'create_quiz',
                ...baseData
            };
        }
    }, [formData, selectedQuestionIds, isEditMode, quizId]);

    // ===========================
    // SOUMISSION DU FORMULAIRE
    // ===========================

    const handleSubmitQuiz = useCallback(async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Validation
        const validationErrors = validateQuizForm(formData, selectedQuestionIds);
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
        const actionText = isEditMode ? 'modifier' : 'créer';
        const confirm = await MySwal.fire({
            title: `Confirmer la ${actionText === 'créer' ? 'création' : 'modification'} du quiz ?`,
            text: `Voulez-vous ${actionText} le quiz "${formData.title}" avec ${selectedQuestionIds.length} question(s) ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Oui, ${actionText}`,
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        if (!confirm.isConfirmed) return;

        try {
            updateUiState({ submitLoading: true });

            const dataToSend = prepareSubmissionData();

            const result = await postData(dataToSend);

            if (result && result.success) {
                const successMessage = isEditMode
                    ? `Quiz "${result.data?.title || formData.title}" modifié avec succès !`
                    : `Quiz "${result.data?.title || formData.title}" créé avec succès !`;

                toast.success(`✅ ${successMessage}`, {
                    position: "top-center"
                });

                if (isEditMode) {
                    // Recharger les données après modification
                    loadQuizData(quizId);
                } else {
                    resetFormComplete();
                }
            } else {
                throw new Error(result?.message || result?.error || `Erreur lors de ${actionText === 'créer' ? 'la création' : 'la modification'} du quiz`);
            }
        } catch (err) {
            console.error(`Erreur lors de ${actionText === 'créer' ? 'la création' : 'la modification'} du quiz:`, err);
            toast.error(`❌ Erreur: ${err.message}`, {
                position: "top-center"
            });
        } finally {
            updateUiState({ submitLoading: false });
        }
    }, [formData, selectedQuestionIds, postData, resetFormComplete, MySwal, updateUiState, prepareSubmissionData, isEditMode, quizId]);

    // ===========================
    // EFFETS (useEffect)
    // ===========================

    // Chargement initial des données de référence
    useEffect(() => {
        const initializeData = async () => {
            if (!isInitialized) {
                await loadAllReferenceDataLocal();
                
                if (!isEditMode) {
                    setIsInitialized(true);
                }
            }
        };

        initializeData();
    }, [isInitialized, isEditMode, loadAllReferenceDataLocal]);

    // Chargement des données du quiz en mode édition
    useEffect(() => {
        if (isEditMode && quizId && !isInitialized) {
            loadQuizData(quizId);
        }
    }, [isEditMode, quizId, isInitialized]);

    // Chargement des sous-domaines quand le domaine change
    useEffect(() => {
        if (formData.domain_id) {
            loadSubDomainsLocal(formData.domain_id);
        }
    }, [formData.domain_id, loadSubDomainsLocal]);

    // ===========================
    // AFFICHAGE DES ÉTATS DE CHARGEMENT/ERREUR
    // ===========================

    // Affichage du loader pendant le chargement du quiz
    if (isEditMode && isLoadingQuiz) {
        return (
            <Panel bordered style={{ margin: '20px', textAlign: 'center', padding: '50px' }}>
                <h4>Chargement du quiz...</h4>
                <Progress.Circle percent={50} />
            </Panel>
        );
    }

    // Affichage de l'erreur si le chargement a échoué
    if (isEditMode && loadError) {
        return (
            <Panel bordered style={{ margin: '20px' }}>
                <Message type="error" showIcon>
                    <strong>Erreur de chargement:</strong> {loadError}
                </Message>
            </Panel>
        );
    }

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
                                {isEditMode ? (
                                    <>
                                        <FiEdit style={{ marginRight: '8px' }} />
                                        Modification d'un Quiz
                                    </>
                                ) : (
                                    <>
                                        <FiPlus style={{ marginRight: '8px' }} />
                                        Création d'un Quiz
                                    </>
                                )}
                            </h3>
                            <p style={{
                                margin: '4px 0 0 0',
                                color: '#6c757d',
                                fontSize: '14px'
                            }}>
                                {isEditMode 
                                    ? 'Modifiez votre quiz et sélectionnez les questions'
                                    : 'Configurez votre quiz et sélectionnez les questions'
                                }
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
                    <div className='col-lg-12'>
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
                                        onChange={handleDomainChange}
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
                            {selectedQuestions.length > 0 && (
                                <div className="col-lg-12">
                                    <div className="mt-4 p-3 bg-light rounded">
                                        <h6 className="mb-2">
                                            <FiCheckCircle style={{ color: 'green', marginRight: '8px' }} />
                                            Questions sélectionnées: {selectedQuestions.length}
                                        </h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {selectedQuestions.slice(0, 5).map((q, index) => (
                                                <Badge key={q.id} color="blue">
                                                    Q{q.id}: {q.points} pts
                                                </Badge>
                                            ))}
                                            {selectedQuestions.length > 5 && (
                                                <Badge color="gray">
                                                    +{selectedQuestions.length - 5} autres...
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
                                        {isEditMode ? 'Annuler les modifications' : 'Réinitialiser'}
                                    </Button>
                                    <Button
                                        type="button"
                                        appearance="primary"
                                        loading={uiState.submitLoading}
                                        disabled={uiState.submitLoading || selectedQuestions.length === 0}
                                        startIcon={<FiSave />}
                                        style={{ backgroundColor: formData.color, borderColor: formData.color }}
                                        onClick={handleSubmitQuiz}
                                    >
                                        {uiState.submitLoading 
                                            ? (isEditMode ? 'Modification en cours...' : 'Création en cours...') 
                                            : (isEditMode ? 'Modifier le Quiz' : 'Créer le Quiz')
                                        }
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===========================
                        COLONNE DROITE - TABLEAU DES QUESTIONS
                        =========================== */}
                    <div className='col-lg-12'>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={(e) => e.stopPropagation()}
                            style={{ width: '100%' }}
                        >
                            <DataTable
                                title="Sélection des Questions"
                                subtitle={`${questionData.length} question(s) disponible(s)`}
                                data={questionData}
                                loading={loading}
                                error={error}
                                columns={questionsTableConfig.columns}
                                searchableFields={questionsTableConfig.searchableFields}
                                filterConfigs={questionsTableConfig.filterConfigs}
                                actions={questionsTableConfig.actions}
                                onAction={handleTableAction}
                                onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={600}
                                enableRefresh={true}
                                enableCreate={true}
                                createButtonText="Nouvelle Question"
                                selectable={true}
                                selectedItems={selectedQuestionIds}
                                onSelectionChange={handleQuestionSelection}
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

export default SaveQuiz;