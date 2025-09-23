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
} from 'react-icons/fi';
import {
    loadStores,
} from "../services/apiUtils";
import DataTable from '../DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import SelectPicker from "rsuite/SelectPicker";




/**
 * Composant QuestionsList - Gestion des questions avec DataTable optimisé
 * 
 * Ce composant gère la récupération des données depuis l'API et configure
 * le DataTable avec la structure spécifique aux questions.
 * 
 * Responsabilités :
 * - Récupération et gestion des données API
 * - Configuration des colonnes spécifiques aux questions
 * - Gestion des états de chargement et d'erreur
 * - Actions spécifiques aux questions (CRUD)
 * 
 * @component
 */
const SaveQuiz = () => {
    const toaster = useToaster();

    const [domaineData, setDomaineData] = useState([]);
    const [sousDomaineData, setSousDomaineData] = useState([]);
    const [typeQuestionData, setTypeQuestionData] = useState([]);
    const [languageData, setLanguageData] = useState([]);
    const [countryData, setCountryData] = useState([]);
    const [difficultyData, setDifficultyData] = useState([]);
    const [premiumLevels, setPremiumLevelsData] = useState([]);
    const [allCoursData, setAllCoursData] = useState([]);
    const [allLessonData, setAllLessonData] = useState([]);

    // États pour le formulaire
    const [formData, setFormData] = useState({
        content: "",
        explanation: "",
        domain_id: null,
        sub_domain_id: null,
        type_id: null,
        language_id: null,
        country_id: null,
        difficulty_level: null,
        points: 1,
        time_limit: null,
        tags: "",
        active: 1,
    });


    console.log("allCoursData");
    console.log(allCoursData);

    // ==================== ÉTATS DE GESTION DES DONNÉES ====================

    /** Données des questions récupérées de l'API */
    const [questionsData, setQuestionsData] = useState([]);
    /** État de chargement des données */
    const [loading, setLoading] = useState(true);
    /** Message d'erreur en cas d'échec de récupération */
    const [error, setError] = useState(null);

    // ==================== ÉTATS DE GESTION DES MODALS ====================

    /** Question sélectionnée pour les actions */
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    /** Affichage du modal de confirmation de suppression */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    /** Question à supprimer */
    const [questionToDelete, setQuestionToDelete] = useState(null);

    // ==================== CONFIGURATION API ====================

    /** URL de l'API pour récupérer les questions */
    const API_URL = "http://localhost/CRUDPHP/api/questions_api.php?action=get_all_questions";

    // ==================== FONCTIONS DE GESTION DES DONNÉES ====================

    /**
     * Récupère les données des questions depuis l'API
     * Gère les états de chargement et d'erreur
     * Applique les transformations nécessaires aux données
     */
    const fetchQuestionsData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

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

            // Vérification de la structure de réponse attendue
            if (!apiResponse.success || !apiResponse.data || !apiResponse.data.questions) {
                throw new Error('Format de réponse API invalide');
            }

            // Traitement direct des données sans dataTransformer
            const processedData = apiResponse.data.questions.map(question => ({
                ...question,
                // Ajout de champs calculés pour l'affichage
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
                media_types: question.media ?
                    [...new Set(question.media.map(m => m.media_type))].join(', ') : ''
            }));

            setQuestionsData(processedData);

            // Notification de succès
            toaster.push(
                <Message type="success" header="Succès">
                    {processedData.length} questions chargées avec succès
                </Message>,
                { duration: 3000 }
            );

        } catch (err) {
            console.error('Erreur lors du chargement des questions:', err);
            setError(err.message);

            // Notification d'erreur
            toaster.push(
                <Message type="error" header="Erreur">
                    Impossible de charger les questions: {err.message}
                </Message>,
                { duration: 5000 }
            );
        } finally {
            setLoading(false);
        }
    }, [toaster]);

    /**
     * Supprime une question via l'API
     * Gère la confirmation et la mise à jour de l'interface
     * 
     * @param {Object} question - La question à supprimer
     */
    const deleteQuestion = useCallback(async (question) => {
        try {
            const response = await fetch(
                `/api/questions.php?action=delete_question&id=${question.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const result = await response.json();

            if (result.success) {
                // Mise à jour locale des données
                setQuestionsData(prev => prev.filter(q => q.id !== question.id));

                toaster.push(
                    <Message type="success">
                        Question supprimée avec succès
                    </Message>,
                    { duration: 3000 }
                );
            } else {
                throw new Error(result.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            toaster.push(
                <Message type="error">
                    Erreur lors de la suppression: {error.message}
                </Message>,
                { duration: 5000 }
            );
        }
    }, [toaster]);

    // ==================== CONFIGURATION DES COLONNES ====================

    /**
     * Configuration des colonnes du tableau des questions
     * Définit l'apparence et le comportement de chaque colonne
     */
    const columns = [
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
            title: 'Réponses',
            dataKey: 'answers_summary',
            width: 100,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => {
                const [correct, total] = cellValue.split('/').map(Number);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiCheck style={{ color: '#27ae60', marginRight: '4px' }} />
                        <span style={{ fontWeight: '500' }}>{correct}</span>
                        <span style={{ margin: '0 2px', color: '#6c757d' }}>/</span>
                        <span>{total}</span>
                    </div>
                );
            }
        },
        {
            title: 'Médias',
            dataKey: 'media',
            width: 100,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData) => {
                const mediaCount = rowData.stats?.media_count || 0;
                if (mediaCount === 0) return <span style={{ color: '#6c757d' }}>-</span>;

                const mediaTypes = rowData.media || [];
                const icons = mediaTypes.slice(0, 3).map((media, index) => {
                    const iconProps = { key: index, size: 14 };
                    switch (media.media_type) {
                        case 'image': return <FiImage {...iconProps} style={{ color: '#3498db' }} />;
                        case 'video': return <FiVideo {...iconProps} style={{ color: '#e74c3c' }} />;
                        case 'audio': return <FiMusic {...iconProps} style={{ color: '#9b59b6' }} />;
                        default: return <FiFileText {...iconProps} style={{ color: '#95a5a6' }} />;
                    }
                });

                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                        {icons}
                        {mediaCount > 3 && (
                            <span style={{ fontSize: '11px', color: '#6c757d', marginLeft: '2px' }}>
                                +{mediaCount - 3}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Sources',
            dataKey: 'stats.sources_count',
            width: 80,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData) => {
                const sourcesCount = rowData.stats?.sources_count || 0;
                return (
                    <Badge
                        content={sourcesCount}
                        color={sourcesCount > 0 ? 'blue' : 'gray'}
                    />
                );
            }
        },
        {
            title: 'Créé le',
            dataKey: 'created_date',
            width: 100,
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            width: 150,
            cellType: 'actions',
            fixed: 'right'
        }
    ];

    // ==================== CONFIGURATION DES FILTRES ====================

    /**
     * Configuration des filtres pour le tableau
     * Permet le filtrage par type, domaine, difficulté et statut
     */
    const filterConfigs = [
        {
            field: 'type_display',
            label: 'Type',
            placeholder: 'Tous les types',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'domain_display',
            label: 'Domaine',
            placeholder: 'Tous les domaines',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'difficulty_display',
            label: 'Difficulté',
            placeholder: 'Toutes les difficultés',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'active',
            label: 'Statut',
            placeholder: 'Tous les statuts',
            options: [
                { label: 'Tous', value: '' },
                { label: 'Actif', value: '1' },
                { label: 'Inactif', value: '0' }
            ],
            tagColor: 'red'
        }
    ];

    // ==================== CONFIGURATION DE LA RECHERCHE ====================

    /**
     * Champs sur lesquels effectuer la recherche textuelle
     * Permet de rechercher dans le contenu, l'explication, les tags, etc.
     */
    const searchableFields = [
        'content',
        'explanation',
        'tags',
        'type_display',
        'domain_display'
    ];

    // ==================== CONFIGURATION DES ACTIONS ====================

    /**
     * Actions disponibles pour chaque question
     * Définit les boutons d'action dans la colonne Actions
     */
    const actions = [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer',
            color: '#e74c3c'
        }
    ];

    // ==================== RENDU DU CONTENU DU MODAL ====================

    /**
     * Génère le contenu du modal selon le type d'action
     * Gère l'affichage des détails de la question
     * 
     * @param {string} modalType - Type de modal (view, edit, etc.)
     * @param {Object} item - Question sélectionnée
     * @returns {JSX.Element} Contenu du modal
     */
    const renderModalContent = useCallback((modalType, item) => {
        if (!item) return null;

        switch (modalType) {
            case 'view':
                return (
                    <div>
                        {/* Informations générales */}
                        <Panel header="Informations générales" bordered style={{ marginBottom: '16px' }}>
                            <FlexboxGrid>
                                <FlexboxGrid.Item colspan={12}>
                                    <p><strong>Type:</strong> {item.type_display}</p>
                                    <p><strong>Domaine:</strong> {item.domain_display}</p>
                                    <p><strong>Difficulté:</strong> {item.difficulty_display}</p>
                                </FlexboxGrid.Item>
                                <FlexboxGrid.Item colspan={12}>
                                    <p><strong>Points:</strong> {item.points}</p>
                                    <p><strong>Auteur:</strong> {item.author_name || 'Non défini'}</p>
                                    <p><strong>Langue:</strong> {item.language_name || 'Non définie'}</p>
                                </FlexboxGrid.Item>
                            </FlexboxGrid>
                        </Panel>

                        {/* Contenu de la question */}
                        <Panel header="Contenu de la question" bordered style={{ marginBottom: '16px' }}>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                fontSize: '14px',
                                lineHeight: '1.6'
                            }}>
                                {item.content}
                            </div>
                            {item.explanation && (
                                <div style={{ marginTop: '12px' }}>
                                    <strong>Explication:</strong>
                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: '#fff3cd',
                                        borderRadius: '4px',
                                        marginTop: '4px',
                                        fontSize: '13px'
                                    }}>
                                        {item.explanation}
                                    </div>
                                </div>
                            )}
                        </Panel>

                        {/* Réponses */}
                        {item.answers && item.answers.length > 0 && (
                            <Panel header={`Réponses (${item.answers.length})`} bordered style={{ marginBottom: '16px' }}>
                                <List>
                                    {item.answers.map((answer, index) => (
                                        <List.Item key={answer.id || index}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                                <div style={{ marginRight: '8px', marginTop: '2px' }}>
                                                    {answer.is_correct ?
                                                        <FiCheck style={{ color: '#27ae60' }} /> :
                                                        <FiX style={{ color: '#e74c3c' }} />
                                                    }
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontWeight: answer.is_correct ? '600' : 'normal',
                                                        color: answer.is_correct ? '#27ae60' : 'inherit'
                                                    }}>
                                                        {answer.content}
                                                    </div>
                                                    {answer.explanation && (
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#6c757d',
                                                            marginTop: '4px',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            {answer.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </List.Item>
                                    ))}
                                </List>
                            </Panel>
                        )}

                        {/* Médias */}
                        {item.media && item.media.length > 0 && (
                            <Panel header={`Médias (${item.media.length})`} bordered style={{ marginBottom: '16px' }}>
                                <FlexboxGrid>
                                    {item.media.map((media, index) => (
                                        <FlexboxGrid.Item key={media.id || index} colspan={8}>
                                            <div style={{
                                                padding: '8px',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '4px',
                                                margin: '4px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                                    {media.media_type === 'image' && <FiImage style={{ color: '#3498db', marginRight: '4px' }} />}
                                                    {media.media_type === 'video' && <FiVideo style={{ color: '#e74c3c', marginRight: '4px' }} />}
                                                    {media.media_type === 'audio' && <FiMusic style={{ color: '#9b59b6', marginRight: '4px' }} />}
                                                    <span style={{ fontSize: '12px', fontWeight: '500' }}>
                                                        {media.media_type}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#6c757d' }}>
                                                    {media.resource_name || 'Sans titre'}
                                                </div>
                                                {media.alt_text && (
                                                    <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                                                        {media.alt_text}
                                                    </div>
                                                )}
                                            </div>
                                        </FlexboxGrid.Item>
                                    ))}
                                </FlexboxGrid>
                            </Panel>
                        )}

                        {/* Sources */}
                        {item.sources && item.sources.length > 0 && (
                            <Panel header={`Sources (${item.sources.length})`} bordered>
                                <List>
                                    {item.sources.map((source, index) => (
                                        <List.Item key={source.id || index}>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>
                                                    {source.source_title}
                                                </div>
                                                {source.source_author && (
                                                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                                        Par: {source.source_author}
                                                    </div>
                                                )}
                                                {source.source_url && (
                                                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                                        <a href={source.source_url} target="_blank" rel="noopener noreferrer">
                                                            Voir la source
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </List.Item>
                                    ))}
                                </List>
                            </Panel>
                        )}
                    </div>
                );

            case 'edit':
                return (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Message type="info">
                            La fonctionnalité d'édition sera implémentée dans le formulaire de gestion des questions.
                        </Message>
                    </div>
                );

            default:
                return null;
        }
    }, []);

    // ==================== CONFIGURATION DU MODAL ====================

    /**
     * Configuration du modal pour l'affichage des détails
     */
    const modalConfig = {
        size: 'lg',
        titles: {
            view: 'Détails de la question',
            edit: 'Modifier la question'
        },
        renderContent: renderModalContent,
        showSaveButton: false
    };

    // ==================== GESTIONNAIRES D'ACTIONS ====================

    /**
     * Gestionnaire principal des actions sur les questions
     * Route les actions vers les fonctions appropriées
     * 
     * @param {string} actionType - Type d'action (create, view, edit, delete)
     * @param {Object} item - Question concernée par l'action
     * @param {Object} context - Contexte avec fonctions utilitaires
     */
    const handleAction = useCallback((actionType, item, context = {}) => {
        const { openModal } = context;

        switch (actionType) {
            case 'create':
                // Redirection vers le formulaire de création
                window.location.href = '/questions/create';
                break;

            case 'view':
                setSelectedQuestion(item);
                if (openModal) {
                    openModal('view', item);
                }
                break;

            case 'edit':
                // Redirection vers le formulaire de modification
                window.location.href = `/questions/edit/${item.id}`;
                break;

            case 'delete':
                setQuestionToDelete(item);
                setShowDeleteModal(true);
                break;

            default:
                console.warn('Action non reconnue:', actionType);
        }
    }, []);

    /**
     * Confirme et exécute la suppression d'une question
     */
    const handleDeleteConfirm = useCallback(async () => {
        if (!questionToDelete) return;

        await deleteQuestion(questionToDelete);
        setShowDeleteModal(false);
        setQuestionToDelete(null);
    }, [questionToDelete, deleteQuestion]);

    /**
     * Annule la suppression d'une question
     */
    const handleDeleteCancel = useCallback(() => {
        setShowDeleteModal(false);
        setQuestionToDelete(null);
    }, []);

    // ==================== EFFET DE CHARGEMENT INITIAL ====================

    /**
     * Charge les données au montage du composant
     */
    useEffect(() => {
        fetchQuestionsData();
    }, [fetchQuestionsData]);

    // ==================== RENDU PRINCIPAL ====================

    // Gestionnaire pour les champs du formulaire principal
    const handleInputChange = (value, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    // Chargement des données des listes déroulantes
    useEffect(() => {
        const loadAllData = async () => {
            try {
                // Domaines
                await loadStores(
                    { action: "get_domains" },
                    "courses-api.php",
                    setDomaineData,
                    {
                        valueKey: "id",
                        labelKey: "name",
                    }
                );

                // Types de questions
                await loadStores(
                    { action: "get_question_types" },
                    "courses-api.php",
                    setTypeQuestionData,
                    {
                        valueKey: "id",
                        labelKey: "name",
                    }
                );

                await loadStores(
                    { action: "get_premium_levels" },
                    "courses-api.php",
                    setPremiumLevelsData,
                    {
                        valueKey: "id",
                        labelKey: "name",
                    }
                );

                await loadStores(
                    { action: "get_alllesson" },
                    "courses-api.php",
                    setAllCoursData,
                    {
                        valueKey: "id",
                        labelKey: "name",
                    }
                );

                await loadStores(
                    { action: "get_allcours" },
                    "courses-api.php",
                    setAllLessonData,
                    {
                        valueKey: "id",
                        labelKey: "name",
                    }
                );




                // Langues
                await loadStores(
                    { action: "get_languages" },
                    "courses-api.php",
                    setLanguageData,
                    {
                        valueKey: "id",
                        labelKey: "name",
                    }
                );

                // Pays
                await loadStores(
                    { action: "get_countries" },
                    "courses-api.php",
                    setCountryData,
                    {
                        valueKey: "id",
                        labelKey: "name",
                    }
                );

                // Niveaux de difficulté
                await loadStores(
                    { action: "get_difficulty_levels" },
                    "courses-api.php",
                    setDifficultyData,
                    {
                        valueKey: "id",
                        labelKey: "name",
                    }
                );
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
                setError("Erreur lors du chargement des données de référence");
            }
        };

        loadAllData();
    }, []);

    // Chargement des sous-domaines basé sur le domaine sélectionné
    useEffect(() => {
        if (formData.domain_id) {
            loadStores(
                { action: "get_sub_domains", domain_id: formData.domain_id },
                "courses-api.php",
                setSousDomaineData,
                {
                    valueKey: "id",
                    labelKey: "name",
                }
            );
        } else {
            setSousDomaineData([]);
        }
    }, [formData.domain_id]);

    const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("=== DÉBUT DE LA SOUMISSION ===");

    // Validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      console.log("Erreurs de validation:", validationErrors);
      
      setError(validationErrors.join(", "));
      
      // Notification d'erreur
      toaster.push(
        <Notification type="error" header="Erreurs de validation">
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Notification>,
        { duration: 5000 }
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Préparer les données à envoyer
      const dataToSend = {
        ...formData,
        answers: answers.filter(answer => answer.content.trim()),
        sources: sources.filter(source => source.title.trim()),
      };

      console.log("Données du formulaire:", dataToSend);

      // Créer FormData pour inclure les fichiers
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(dataToSend));

      // Ajouter les fichiers média
      mediaFiles.forEach((file, index) => {
        formDataToSend.append(`media_files[]`, file);
      });

      console.log("FormData préparé avec", mediaFiles.length, "fichiers");

      // Envoyer les données
      const result = await postData(formDataToSend);

      console.log("Réponse du serveur:", result);

      if (result.success) {
        // Notification de succès
        toaster.push(
          <Notification type="success" header="Succès">
            Question créée avec succès ! 
            <br />
            - {result.data.answers_count} réponses créées
            - {result.data.media_count} médias associés
            - {result.data.sources_count} sources associées
          </Notification>,
          { duration: 5000 }
        );

        // Réinitialiser le formulaire
        resetForm();
      } else {
        throw new Error(result.message || "Erreur lors de la création");
      }
    } catch (err) {
      console.error("Erreur lors de la soumission:", err);
      
      const errorMessage = err.message || "Erreur inconnue lors de la sauvegarde";
      setError(errorMessage);
      
      // Notification d'erreur
      toaster.push(
        <Notification type="error" header="Erreur">
          {errorMessage}
        </Notification>,
        { duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  };



    return (
        <>
            {/* Tableau principal des questions */}
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
                                {/* {title} */}
                            </h3>
                            <p style={{
                                margin: '4px 0 0 0',
                                color: '#6c757d',
                                fontSize: '14px'
                            }}>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {/* {enableRefresh && (
                                <Button
                                    appearance="ghost"
                                    onClick={onRefresh}
                                    disabled={loading}
                                    startIcon={<ReloadIcon />}
                                >
                                    Actualiser
                                </Button>
                            )} */}
                            {/* {enableCreate && (
                                <Button
                                    appearance="primary"
                                    startIcon={<PlusIcon />}
                                    //onClick={() => handleAction('create')}
                                    style={{ backgroundColor: '#667eea', border: 'none' }}
                                >
                                    {createButtonText}
                                </Button>
                            )} */}
                        </div>
                    </div>
                }
                bordered
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    //...customStyles.panel
                }}
            >
                <form onSubmit={handleSubmit} noValidate>
                    <div className='row'>
                        <div className='col-lg-6'>
                            <Grid fluid>
                                <Row gutter={16}>
                                    <Col xs={24} md={24}>
                                        <Panel header="Configuration du QUIZ" className="chart-panel">
                                            <div className="row">
                                                <div className="chart-placeholder">
                                                    <div className="row mt-3">
                                                        <div className="col-lg-4">
                                                            <div className="form-group mb-3">
                                                                <label className="required fs-6 form-label fw-bold text-gray-900">
                                                                    Domaine d'activité
                                                                </label>
                                                                <div className="w-100">
                                                                    <SelectPicker
                                                                        data={domaineData}
                                                                        style={{ width: "100%" }}
                                                                        size="lg"
                                                                        onChange={(value) => handleInputChange(value, 'domain_id')}
                                                                        value={formData.domain_id}
                                                                        placeholder="Sélectionnez un domaine"
                                                                        className="basic-multi-select"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4">
                                                            <div className="form-group mb-3">
                                                                <label className="fs-6 form-label fw-bold text-gray-900">
                                                                    Sous-domaine
                                                                </label>
                                                                <div className="w-100">
                                                                    <SelectPicker
                                                                        data={sousDomaineData}
                                                                        style={{ width: "100%" }}
                                                                        size="lg"
                                                                        onChange={(value) => handleInputChange(value, 'sub_domain_id')}
                                                                        value={formData.sub_domain_id}
                                                                        placeholder="Sélectionnez un sous-domaine"
                                                                        className="basic-multi-select"
                                                                        disabled={!formData.domain_id}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4">
                                                            <div className="form-group mb-3">
                                                                <label className="required fs-6 form-label fw-bold text-gray-900">
                                                                    Is premium
                                                                </label>
                                                                <div className="w-100">
                                                                    <SelectPicker
                                                                        data={premiumLevels}
                                                                        style={{ width: "100%" }}
                                                                        size="lg"
                                                                        onChange={(value) => handleInputChange(value, 'type_id')}
                                                                        value={formData.type_id}
                                                                        placeholder="Sélectionnez un type"
                                                                        className="basic-multi-select"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4">
                                                            <div className="form-group mb-3">
                                                                <label className="fs-6 form-label fw-bold text-gray-900">
                                                                    Niveau de difficulté
                                                                </label>
                                                                <div className="w-100">
                                                                    <SelectPicker
                                                                        data={difficultyData}
                                                                        style={{ width: "100%" }}
                                                                        size="lg"
                                                                        onChange={(value) => handleInputChange(value, 'difficulty_level')}
                                                                        value={formData.difficulty_level}
                                                                        placeholder="Sélectionnez un niveau"
                                                                        className="basic-multi-select"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4">
                                                            <div className="form-group mb-3">
                                                                <label className="fs-6 form-label fw-bold text-gray-900">
                                                                    Langue
                                                                </label>
                                                                <div className="w-100">
                                                                    <SelectPicker
                                                                        data={languageData}
                                                                        style={{ width: "100%" }}
                                                                        size="lg"
                                                                        onChange={(value) => handleInputChange(value, 'language_id')}
                                                                        value={formData.language_id}
                                                                        placeholder="Sélectionnez une langue"
                                                                        className="basic-multi-select"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4">
                                                            <div className="form-group mb-3">
                                                                <label className="fs-6 form-label fw-bold text-gray-900">
                                                                    Pays
                                                                </label>
                                                                <div className="w-100">
                                                                    <SelectPicker
                                                                        data={languageData}
                                                                        style={{ width: "100%" }}
                                                                        size="lg"
                                                                        onChange={(value) => handleInputChange(value, 'language_id')}
                                                                        value={formData.language_id}
                                                                        placeholder="Sélectionnez une langue"
                                                                        className="basic-multi-select"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4">
                                                            <div className="form-group mb-3">
                                                                <label className="fs-6 form-label fw-bold text-gray-900">
                                                                    Cours
                                                                </label>
                                                                <div className="w-100">
                                                                    <SelectPicker
                                                                        data={allCoursData}
                                                                        style={{ width: "100%" }}
                                                                        size="lg"
                                                                        onChange={(value) => handleInputChange(value, 'language_id')}
                                                                        value={formData.language_id}
                                                                        placeholder="Sélectionnez une langue"
                                                                        className="basic-multi-select"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4">
                                                            <div className="form-group mb-3">
                                                                <label className="fs-6 form-label fw-bold text-gray-900">
                                                                    Leçon
                                                                </label>
                                                                <div className="w-100">
                                                                    <SelectPicker
                                                                        data={allLessonData}
                                                                        style={{ width: "100%" }}
                                                                        size="lg"
                                                                        onChange={(value) => handleInputChange(value, 'language_id')}
                                                                        value={formData.language_id}
                                                                        placeholder="Sélectionnez une langue"
                                                                        className="basic-multi-select"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-4">
                                                            <div className="form-group mb-3">
                                                                <label className="required fs-6 form-label fw-bold text-gray-900">
                                                                    Points
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    min="1"
                                                                    value={formData.points}
                                                                    onChange={(e) => handleInputChange(parseInt(e.target.value) || 1, 'points')}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <div className="form-group mb-3">
                                                                <label className="fs-6 form-label fw-bold text-gray-900">
                                                                    Temps limite (secondes)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    min="10"
                                                                    value={formData.time_limit || ''}
                                                                    onChange={(e) => handleInputChange(parseInt(e.target.value) || null, 'time_limit')}
                                                                    placeholder="Optionnel"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <div className="form-group">
                                                                <label className="required fs-6 form-label fw-bold text-gray-900">
                                                                    Titre du quiz
                                                                </label>
                                                                <div className="input-group mb-3">
                                                                    <textarea
                                                                        className="form-control"
                                                                        rows="3"
                                                                        placeholder="Saisir le contenu de la question"
                                                                        value={formData.content}
                                                                        onChange={(e) => handleInputChange(e.target.value, 'content')}
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-lg-12">
                                                            <div className="form-group mb-3">
                                                                <label className="fs-6 form-label fw-bold text-gray-900">
                                                                    Description
                                                                </label>
                                                                <textarea
                                                                    className="form-control"
                                                                    rows="3"
                                                                    placeholder="Saisir l'explication de la question"
                                                                    value={formData.explanation}
                                                                    onChange={(e) => handleInputChange(e.target.value, 'explanation')}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Panel>
                                    </Col>
                                </Row>
                            </Grid>
                        </div>
                        <div className='col-lg-6'>
                            <DataTable
                                title="Gestion des Questions"
                                subtitle="questions trouvées"
                                data={questionsData}
                                loading={loading}
                                error={error}
                                columns={columns}
                                searchableFields={searchableFields}
                                filterConfigs={filterConfigs}
                                actions={actions}
                                onAction={handleAction}
                                onRefresh={fetchQuestionsData}
                                modalConfig={modalConfig}
                                defaultPageSize={20}
                                pageSizeOptions={[10, 20, 50, 100]}
                                tableHeight={600}
                                enableRefresh={true}
                                enableCreate={true}
                                createButtonText="Nouvelle Question"
                                customStyles={{
                                    container: { backgroundColor: '#f5f5f5' },
                                    panel: { minHeight: '700px' }
                                }}
                            />
                        </div>

                    </div>
                </form>
            </Panel>
            {/* Modal de confirmation de suppression */}
            {/* <Modal 
        open={showDeleteModal} 
        onClose={handleDeleteCancel} 
        size="xs"
      >
        <Modal.Header>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Message type="warning" header="Attention">
            Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.
          </Message>
          {questionToDelete && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px' 
            }}>
              <strong>Question à supprimer:</strong>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>
                {questionToDelete.content_preview}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleDeleteCancel} appearance="subtle">
            Annuler
          </Button>
          <Button onClick={handleDeleteConfirm} appearance="primary" color="red">
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal> */}
        </>
    );
};

export default SaveQuiz;