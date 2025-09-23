import React, { useState, useCallback, useEffect } from 'react';
import {
    Badge,
    Button,
    Modal,
    Panel,
    FlexboxGrid,
    Message,
    useToaster,
    Grid,
    Row,
    Col,
    List,
    Checkbox,
    Notification
} from 'rsuite';
import {
    FiEdit,
    FiTrash2,
    FiEye,
    FiCheck,
    FiX,
    FiFileText,
    FiImage,
    FiVideo,
    FiMusic,
    FiSave,
    FiRefreshCw,
    FiPlus,
    FiAlertCircle,
    FiCheckCircle,
    
} from 'react-icons/fi';
import {
    loadStores,
} from "../services/apiUtils";
import DataTable from '../DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import SelectPicker from "rsuite/SelectPicker";
import usePostData from "../hooks/usePostData";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';

const SaveQuiz = () => {
    // ===========================
    // CONFIGURATION & CONSTANTES
    // ===========================
    const API_URL = "http://localhost/CRUDPHP/api/questions_api.php?action=get_all_questions";
    const MySwal = withReactContent(Swal);
    const { postData, loadingPost, errorPost } = usePostData("quiz_api.php");

    // ===========================
    // ÉTATS - DONNÉES DE RÉFÉRENCE
    // ===========================
    const [referenceData, setReferenceData] = useState({
        domaines: [],
        sousdomaines: [],
        typesQuestion: [],
        langues: [],
        pays: [],
        difficultes: [],
        niveauxPremium: [],
        cours: [],
        lecons: []
    });

    // ===========================
    // ÉTATS - FORMULAIRE PRINCIPAL
    // ===========================
    const [formData, setFormData] = useState({
        // Informations de base
        title: "",
        description: "",
        color: "#3498db", // Nouveau champ couleur
        
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
    });

    // ===========================
    // ÉTATS - GESTION DES QUESTIONS
    // ===========================
    const [questionsState, setQuestionsState] = useState({
        data: [],
        selectedIds: [],
        selectedQuestions: [],
        loading: false,
        error: null
    });

    // ===========================
    // ÉTATS - GESTION DU MODAL
    // ===========================
    const [modalState, setModalState] = useState({
        show: false,
        type: 'view', // 'view', 'edit', 'delete', 'create'
        selectedQuestion: null
    });

    // ===========================
    // ÉTATS - INTERFACE UTILISATEUR
    // ===========================
    const [uiState, setUiState] = useState({
        submitLoading: false
    });

    // ===========================
    // CONFIGURATION DU TABLEAU
    // ===========================
    
    // Configuration des colonnes
    const tableColumns = [
        {
            title: 'Question',
            dataKey: 'content_preview',
            width: 300,
            cellType: 'avatar',
            avatarGenerator: (rowData) => `Q${rowData.id}`,
            avatarColor: '#667eea',
            subField: 'type_display',
            sortable: true
        },
        {
            title: 'Type',
            dataKey: 'type_display',
            width: 120,
            cellType: 'badge',
            badgeColorMap: (value) => {
                const colorMap = {
                    'QCM': 'blue',
                    'Vrai/Faux': 'green',
                    'Texte libre': 'orange',
                    'Numérique': 'red'
                };
                return colorMap[value] || 'gray';
            },
            sortable: true
        },
        {
            title: 'Domaine',
            dataKey: 'domain_display',
            width: 150,
            sortable: true
        },
        {
            title: 'Difficulté',
            dataKey: 'difficulty_display',
            width: 100,
            cellType: 'badge',
            badgeColorMap: (value) => {
                const colorMap = {
                    'Facile': 'green',
                    'Moyen': 'orange',
                    'Difficile': 'red',
                    'Expert': 'violet'
                };
                return colorMap[value] || 'gray';
            },
            sortable: true
        },
        {
            title: 'Date de création',
            dataKey: 'created_at',
            width: 120,
            cellType: 'date',
            sortable: true
        },
        {
            title: 'Points',
            dataKey: 'points',
            width: 80,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <div style={{
                    fontWeight: 'bold',
                    color: cellValue > 10 ? '#e74c3c' : cellValue > 5 ? '#f39c12' : '#27ae60'
                }}>
                    {cellValue || 0}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            width: 200,
            cellType: 'actions',
            fixed: 'right'
        }
    ];

    // Configuration des filtres
    const filterConfigs = [
        {
            field: 'type_display',
            label: 'Type',
            placeholder: 'Tous les types',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'domain_display',
            label: 'Domaine',
            placeholder: 'Tous les domaines',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'difficulty_display',
            label: 'Difficulté',
            placeholder: 'Toutes les difficultés',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'created_at',
            label: 'Date de création',
            placeholder: 'Sélectionner une date',
            type: 'date',
            tagColor: 'purple'
        },
        {
            field: 'last_modified',
            label: 'Période de modification',
            placeholder: 'Sélectionner une période',
            type: 'dateRange',
            tagColor: 'cyan'
        }
    ];

    // Champs de recherche
    const searchableFields = [
        'content',
        'explanation',
        'tags',
        'type_display',
        'domain_display'
    ];

    // Actions disponibles
    const tableActions = [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier la question',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer la question',
            color: '#e74c3c'
        }
    ];

    // ===========================
    // FONCTIONS UTILITAIRES
    // ===========================
    
    /**
     * Met à jour un champ spécifique du formulaire
     */
    const updateFormField = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    /**
     * Met à jour l'état des questions
     */
    const updateQuestionsState = useCallback((updates) => {
        setQuestionsState(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    /**
     * Met à jour l'état du modal
     */
    const updateModalState = useCallback((updates) => {
        setModalState(prev => ({
            ...prev,
            ...updates
        }));
    }, []);

    /**
     * Réinitialise le formulaire à son état initial
     */
    const resetForm = useCallback(() => {
        setFormData({
            title: "",
            description: "",
            color: "#3498db",
            domain_id: null,
            sub_domain_id: null,
            country_id: null,
            course_id: null,
            lesson_id: null,
            difficulty_id: null,
            time_limit: 600,
            total_points: 0,
            min_pass_points: 60,
            is_featured: 0,
            premium_level_id: null,
            active: 1
        });
        
        updateQuestionsState({
            selectedIds: [],
            selectedQuestions: [],
            error: null
        });
    }, [updateQuestionsState]);

    // ===========================
    // GESTION DES DONNÉES
    // ===========================
    
    /**
     * Charge toutes les données de référence nécessaires
     */
    const loadAllReferenceData = useCallback(async () => {
        try {
            const dataPromises = [
                // Domaines
                loadStores(
                    { action: "get_domains" },
                    "courses-api.php",
                    (data) => setReferenceData(prev => ({ ...prev, domaines: data })),
                    { valueKey: "id", labelKey: "name" }
                ),
                // Types de questions
                loadStores(
                    { action: "get_question_types" },
                    "courses-api.php",
                    (data) => setReferenceData(prev => ({ ...prev, typesQuestion: data })),
                    { valueKey: "id", labelKey: "name" }
                ),
                // Niveaux premium
                loadStores(
                    { action: "get_premium_levels" },
                    "courses-api.php",
                    (data) => setReferenceData(prev => ({ ...prev, niveauxPremium: data })),
                    { valueKey: "id", labelKey: "name" }
                ),
                // Cours
                loadStores(
                    { action: "get_alllesson" },
                    "courses-api.php",
                    (data) => setReferenceData(prev => ({ ...prev, cours: data })),
                    { valueKey: "id", labelKey: "name" }
                ),
                // Leçons
                loadStores(
                    { action: "get_allcours" },
                    "courses-api.php",
                    (data) => setReferenceData(prev => ({ ...prev, lecons: data })),
                    { valueKey: "id", labelKey: "name" }
                ),
                // Langues
                loadStores(
                    { action: "get_languages" },
                    "courses-api.php",
                    (data) => setReferenceData(prev => ({ ...prev, langues: data })),
                    { valueKey: "id", labelKey: "name" }
                ),
                // Pays
                loadStores(
                    { action: "get_countries" },
                    "courses-api.php",
                    (data) => setReferenceData(prev => ({ ...prev, pays: data })),
                    { valueKey: "id", labelKey: "name" }
                ),
                // Difficultés
                loadStores(
                    { action: "get_difficulty_levels" },
                    "courses-api.php",
                    (data) => setReferenceData(prev => ({ ...prev, difficultes: data })),
                    { valueKey: "id", labelKey: "name" }
                )
            ];

            await Promise.all(dataPromises);
        } catch (error) {
            console.error("Erreur lors du chargement des données de référence:", error);
            updateQuestionsState({ error: "Erreur lors du chargement des données de référence" });
        }
    }, [updateQuestionsState]);

    /**
     * Charge les sous-domaines basés sur le domaine sélectionné
     */
    const loadSubDomains = useCallback(async (domainId) => {
        if (domainId) {
            try {
                await loadStores(
                    { action: "get_sub_domains", domain_id: domainId },
                    "courses-api.php",
                    (data) => setReferenceData(prev => ({ ...prev, sousdomaines: data })),
                    { valueKey: "id", labelKey: "name" }
                );
            } catch (error) {
                console.error("Erreur lors du chargement des sous-domaines:", error);
            }
        } else {
            setReferenceData(prev => ({ ...prev, sousdomaines: [] }));
        }
    }, []);

    /**
     * Récupère les questions depuis l'API
     */
    const fetchQuestions = useCallback(async (preventLoadingState = false) => {
        try {
            if (!preventLoadingState) {
                updateQuestionsState({ loading: true, error: null });
            }

            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }

            const apiResponse = await response.json();

            if (!apiResponse.success || !apiResponse.data || !apiResponse.data.questions) {
                throw new Error('Format de réponse API invalide');
            }

            // Traitement et formatage des données
            const processedData = apiResponse.data.questions.map(question => ({
                ...question,
                difficulty_display: question.difficulty_name || 'Non défini',
                type_display: question.type_name || 'Non défini',
                domain_display: question.domain_name || 'Non défini',
                answers_summary: `${question.stats?.correct_answers_count || 0}/${question.stats?.answers_count || 0}`,
                content_preview: question.content ?
                    (question.content.length > 100 ?
                        question.content.substring(0, 100) + '...' :
                        question.content) : 'Contenu non disponible',
                created_date: question.created_at ?
                    new Date(question.created_at).toLocaleDateString('fr-FR') : '',
                last_modified: question.updated_at || question.created_at,
                media_types: question.media ?
                    [...new Set(question.media.map(m => m.media_type))].join(', ') : ''
            }));

            updateQuestionsState({ data: processedData, loading: false });

        } catch (err) {
            console.error('Erreur lors du chargement des questions:', err);
            updateQuestionsState({ 
                error: err.message, 
                loading: false 
            });
        }
    }, [updateQuestionsState]);

    // ===========================
    // GESTION DES QUESTIONS
    // ===========================
    
    /**
     * Gère la sélection/désélection des questions
     */
    const handleQuestionSelection = useCallback((questionIds) => {
        const selectedQuestionsData = questionsState.data.filter(q => questionIds.includes(q.id));
        
        // Calcul automatique des points totaux
        const totalPoints = selectedQuestionsData.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0);
        
        // Mise à jour des états
        updateQuestionsState({
            selectedIds: questionIds,
            selectedQuestions: selectedQuestionsData
        });

        // Mise à jour du formulaire
        setFormData(prev => ({
            ...prev,
            total_points: totalPoints,
            // Ajustement automatique du score minimum si nécessaire
            min_pass_points: prev.min_pass_points > totalPoints ? 
                Math.floor(totalPoints * 0.6) : prev.min_pass_points
        }));
    }, [questionsState.data, updateQuestionsState]);

    // ===========================
    // GESTION DU MODAL
    // ===========================
    
    /**
     * Gère les actions du tableau (view, edit, delete, create)
     */
    const handleTableAction = useCallback((actionType, item) => {
        switch (actionType) {
            case 'view':
                updateModalState({
                    selectedQuestion: item,
                    type: 'view',
                    show: true
                });
                break;

            case 'edit':
                updateModalState({
                    selectedQuestion: item,
                    type: 'edit',
                    show: true
                });
                break;

            case 'delete':
                updateModalState({
                    selectedQuestion: item,
                    type: 'delete',
                    show: true
                });
                break;

            case 'create':
                updateModalState({
                    selectedQuestion: null,
                    type: 'create',
                    show: true
                });
                break;

            default:
                console.warn('Action non reconnue:', actionType);
        }
    }, [updateModalState]);

    /**
     * Ferme le modal et remet à zéro l'état
     */
    const handleCloseModal = useCallback(() => {
        updateModalState({
            show: false,
            selectedQuestion: null,
            type: 'view'
        });
    }, [updateModalState]);

    /**
     * Gère la sauvegarde depuis le modal
     */
    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'edit':
                    console.log('Modifier la question:', modalState.selectedQuestion);
                    break;

                case 'delete':
                    console.log('Supprimer la question:', modalState.selectedQuestion);
                    await fetchQuestions(true);
                    break;

                case 'create':
                    console.log('Créer une nouvelle question');
                    await fetchQuestions(true);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedQuestion, handleCloseModal, fetchQuestions]);

    // ===========================
    // RENDU DU MODAL
    // ===========================
    
    /**
     * Rendu du contenu du modal selon le type
     */
    const renderModalContent = useCallback(() => {
        if (!modalState.selectedQuestion && modalState.type !== 'create') return null;

        switch (modalState.type) {
            case 'view':
                return (
                    <div>
                        <Panel header="Informations générales" bordered style={{ marginBottom: '16px' }}>
                            <FlexboxGrid>
                                <FlexboxGrid.Item colspan={12}>
                                    <p><strong>Type:</strong> {modalState.selectedQuestion.type_display}</p>
                                    <p><strong>Domaine:</strong> {modalState.selectedQuestion.domain_display}</p>
                                    <p><strong>Difficulté:</strong> {modalState.selectedQuestion.difficulty_display}</p>
                                </FlexboxGrid.Item>
                                <FlexboxGrid.Item colspan={12}>
                                    <p><strong>Points:</strong> {modalState.selectedQuestion.points}</p>
                                    <p><strong>Réponses:</strong> {modalState.selectedQuestion.answers_summary}</p>
                                    <p><strong>Date de création:</strong> {modalState.selectedQuestion.created_date}</p>
                                </FlexboxGrid.Item>
                            </FlexboxGrid>
                        </Panel>

                        <Panel header="Contenu de la question" bordered>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                fontSize: '14px',
                                lineHeight: '1.6'
                            }}>
                                {modalState.selectedQuestion.content}
                            </div>
                            {modalState.selectedQuestion.explanation && (
                                <div style={{ marginTop: '12px' }}>
                                    <strong>Explication:</strong>
                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: '#fff3cd',
                                        borderRadius: '4px',
                                        marginTop: '4px',
                                        fontSize: '13px'
                                    }}>
                                        {modalState.selectedQuestion.explanation}
                                    </div>
                                </div>
                            )}
                        </Panel>
                    </div>
                );

            case 'edit':
                return (
                    <div>
                        <h5>Modifier la question #{modalState.selectedQuestion.id}</h5>
                        <div className="form-group mb-3">
                            <label>Contenu de la question</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                defaultValue={modalState.selectedQuestion.content}
                            />
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label>Points</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        defaultValue={modalState.selectedQuestion.points}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label>Difficulté</label>
                                    <SelectPicker
                                        data={referenceData.difficultes}
                                        style={{ width: "100%" }}
                                        defaultValue={modalState.selectedQuestion.difficulty_id}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'delete':
                return (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <FiAlertCircle size={48} style={{ color: '#e74c3c', marginBottom: '16px' }} />
                        <h5>Confirmer la suppression</h5>
                        <p>Êtes-vous sûr de vouloir supprimer cette question ?</p>
                        <div style={{
                            backgroundColor: '#f8d7da',
                            padding: '12px',
                            borderRadius: '4px',
                            marginTop: '16px'
                        }}>
                            <strong>Question #{modalState.selectedQuestion.id}:</strong><br />
                            {modalState.selectedQuestion.content_preview}
                        </div>
                        <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '12px' }}>
                            Cette action est irréversible.
                        </p>
                    </div>
                );

            case 'create':
                return (
                    <div>
                        <h5>Créer une nouvelle question</h5>
                        <div className="form-group mb-3">
                            <label>Contenu de la question</label>
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Saisissez le contenu de la question..."
                            />
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label>Type</label>
                                    <SelectPicker
                                        data={referenceData.typesQuestion}
                                        style={{ width: "100%" }}
                                        placeholder="Sélectionnez le type"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label>Domaine</label>
                                    <SelectPicker
                                        data={referenceData.domaines}
                                        style={{ width: "100%" }}
                                        placeholder="Sélectionnez le domaine"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label>Points</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Points"
                                        min="1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Type de modal non reconnu</div>;
        }
    }, [modalState.selectedQuestion, modalState.type, referenceData.difficultes, referenceData.typesQuestion, referenceData.domaines]);

    /**
     * Retourne le titre du modal selon le type
     */
    const getModalTitle = useCallback(() => {
        switch (modalState.type) {
            case 'view': return 'Détails de la question';
            case 'edit': return 'Modifier la question';
            case 'delete': return 'Supprimer la question';
            case 'create': return 'Créer une question';
            default: return 'Question';
        }
    }, [modalState.type]);

    /**
     * Retourne les boutons du modal selon le type
     */
    const getModalButtons = useCallback(() => {
        const baseButtons = [
            <Button key="cancel" onClick={handleCloseModal} appearance="subtle">
                Annuler
            </Button>
        ];

        switch (modalState.type) {
            case 'view':
                return baseButtons;

            case 'edit':
                return [
                    ...baseButtons,
                    <Button
                        key="save"
                        onClick={handleModalSave}
                        appearance="primary"
                        startIcon={<FiSave />}
                    >
                        Sauvegarder
                    </Button>
                ];

            case 'delete':
                return [
                    ...baseButtons,
                    <Button
                        key="delete"
                        onClick={handleModalSave}
                        appearance="primary"
                        color="red"
                        startIcon={<FiTrash2 />}
                    >
                        Supprimer
                    </Button>
                ];

            case 'create':
                return [
                    ...baseButtons,
                    <Button
                        key="create"
                        onClick={handleModalSave}
                        appearance="primary"
                        startIcon={<FiPlus />}
                    >
                        Créer
                    </Button>
                ];

            default:
                return baseButtons;
        }
    }, [modalState.type, handleCloseModal, handleModalSave]);

    // ===========================
    // SOUMISSION DU FORMULAIRE
    // ===========================
    
    /**
     * Gère la soumission du formulaire de création de quiz
     */
    const handleSubmitQuiz = useCallback(async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Confirmation utilisateur
        const confirm = await MySwal.fire({
            title: 'Confirmer la création du quiz ?',
            text: "Voulez-vous vraiment créer ce quiz ?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui, créer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        if (!confirm.isConfirmed) return;

        try {
            setUiState({ submitLoading: true });

            // Préparation des données à envoyer
            const dataToSend = {
                action: "create_quiz",
                title: formData.title.trim(),
                description: formData.description ? formData.description.trim() : '',
                color: formData.color, // Nouveau champ couleur
                domain_id: parseInt(formData.domain_id),
                sub_domain_id: formData.sub_domain_id ? parseInt(formData.sub_domain_id) : null,
                country_id: formData.country_id ? parseInt(formData.country_id) : null,
                course_id: formData.course_id ? parseInt(formData.course_id) : null,
                lesson_id: formData.lesson_id ? parseInt(formData.lesson_id) : null,
                difficulty_id: formData.difficulty_id ? parseInt(formData.difficulty_id) : null,
                time_limit: parseInt(formData.time_limit),
                total_points: parseInt(formData.total_points),
                min_pass_points: parseInt(formData.min_pass_points),
                is_featured: parseInt(formData.is_featured),
                premium_level_id: formData.premium_level_id ? parseInt(formData.premium_level_id) : null,
                active: parseInt(formData.active),
                selected_questions: questionsState.selectedIds.map(id => ({ id: parseInt(id) }))
            };

            const result = await postData(dataToSend);

            if (result && result.success) {
                toast.success(`✅ Quiz "${result.data?.title || formData.title}" créé avec succès !`, {
                    position: "top-center"
                });
                resetForm();
            } else {
                throw new Error(result?.message || "Erreur lors de la création du quiz");
            }
        } catch (err) {
            console.error("Erreur lors de la création du quiz:", err);
            toast.error(`❌ Erreur: ${err.message}`, {
                position: "top-center"
            });
        } finally {
            setUiState({ submitLoading: false });
        }
    }, [formData, questionsState.selectedIds, postData, resetForm, MySwal]);

    // ===========================
    // EFFETS (useEffect)
    // ===========================
    
    // Chargement initial des données de référence
    useEffect(() => {
        loadAllReferenceData();
    }, [loadAllReferenceData]);

    // Chargement des sous-domaines quand le domaine change
    useEffect(() => {
        loadSubDomains(formData.domain_id);
    }, [formData.domain_id, loadSubDomains]);

    // Chargement initial des questions
    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

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
                                        {/* <FiPalette style={{ marginRight: '8px' }} /> */}
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
                                        onClick={resetForm}
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
                                columns={tableColumns}
                                searchableFields={searchableFields}
                                filterConfigs={filterConfigs}
                                actions={tableActions}
                                onAction={handleTableAction}
                                onRefresh={() => fetchQuestions(false)}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={600}
                                enableRefresh={true}
                                enableCreate={true}
                                createButtonText="Nouvelle Question"
                                selectable={true}
                                selectedItems={questionsState.selectedIds}
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
            <Modal
                open={modalState.show}
                onClose={handleCloseModal}
                size={modalState.type === 'view' ? "lg" : "md"}
            >
                <Modal.Header>
                    <Modal.Title>{getModalTitle()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {renderModalContent()}
                </Modal.Body>
                <Modal.Footer>
                    {getModalButtons()}
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SaveQuiz;