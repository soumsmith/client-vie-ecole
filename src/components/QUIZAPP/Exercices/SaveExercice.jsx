import React, { useState, useCallback, useEffect } from 'react';
import {
    Badge,
    Button,
    Panel,
    Tabs,
    Progress,
    Message
} from 'rsuite';
import {
    FiFileText,
    FiSave,
    FiCheckCircle,
    FiTarget,
    FiBookOpen,
    FiBook,
    FiUsers,
    FiUpload,
    FiX,
    FiFile,
    FiImage,
    FiVideo,
    FiEdit,
    FiPlus
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import SelectPicker from "rsuite/SelectPicker";
import DataTable from '../../DataTable';
import usePostData from "../../hooks/usePostData";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Imports des services et utilitaires
import { useCommonState } from '../../hooks/useCommonState';
import { useContextState } from '../../hooks/useContextState';
import { fetchQuestions } from '../../services/questionsService';
import { loadAllReferenceData, fetchContextData, loadSubDomains } from '../../services/referenceDataService';
import { useFormUtils, initialReferenceData, validateExerciseForm } from '../utils/formUtils';

import {
    questionsTableConfig,
    coursesTableConfig,
    lessonsTableConfig
} from '../config/tableConfigs';
import QuestionModal from '../modal/QuestionModal';
import { useCoursesData } from '../Course/courseService';
import { useLessonsData } from '../Lesson/lessonService';

// Composant d'upload de fichiers
const FileUploadComponent = ({ exerciseType, onFileSelect, currentFile, onFileRemove, existingFileUrl }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const getAcceptedTypes = () => {
        switch (exerciseType) {
            case 'pdf':
                return '.pdf';
            case 'image':
                return '.jpg,.jpeg,.png,.gif,.webp';
            case 'video':
                return '.mp4,.avi,.mov,.wmv';
            default:
                return '';
        }
    };

    const getMaxSize = () => {
        switch (exerciseType) {
            case 'video':
                return 50 * 1024 * 1024; // 50MB pour vidéos
            case 'image':
                return 10 * 1024 * 1024; // 10MB pour images
            case 'pdf':
                return 20 * 1024 * 1024; // 20MB pour PDF
            default:
                return 10 * 1024 * 1024;
        }
    };

    const validateFile = (file) => {
        const maxSize = getMaxSize();

        if (file.size > maxSize) {
            throw new Error(`Fichier trop volumineux. Taille maximum: ${Math.round(maxSize / (1024 * 1024))}MB`);
        }

        const allowedTypes = {
            'pdf': ['application/pdf'],
            'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            'video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
        };

        if (!allowedTypes[exerciseType]?.includes(file.type)) {
            throw new Error(`Type de fichier non supporté pour ${exerciseType}`);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    };

    const handleFileSelection = async (file) => {
        try {
            validateFile(file);
            setIsUploading(true);
            setUploadProgress(0);

            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            const fileUrl = URL.createObjectURL(file);

            setTimeout(() => {
                setUploadProgress(100);
                setIsUploading(false);
                onFileSelect({
                    file: file,
                    url: fileUrl,
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
            }, 1000);

        } catch (error) {
            setIsUploading(false);
            setUploadProgress(0);
            Swal.fire({
                title: 'Erreur',
                text: error.message,
                icon: 'error'
            });
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragOver(false);

        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const getFileIcon = () => {
        switch (exerciseType) {
            case 'pdf':
                return <FiFile size={24} />;
            case 'image':
                return <FiImage size={24} />;
            case 'video':
                return <FiVideo size={24} />;
            default:
                return <FiFile size={24} />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Affichage du fichier existant ou nouveau
    if (currentFile || existingFileUrl) {
        const displayFile = currentFile || { name: 'Fichier existant', url: existingFileUrl };
        return (
            <div className="file-upload-preview p-3 border rounded">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        {getFileIcon()}
                        <div className="ms-2">
                            <div className="fw-bold">{displayFile.name}</div>
                            {displayFile.size && (
                                <small className="text-muted">{formatFileSize(displayFile.size)}</small>
                            )}
                            {existingFileUrl && !currentFile && (
                                <small className="text-muted">Fichier actuel</small>
                            )}
                        </div>
                    </div>
                    <Button
                        appearance="subtle"
                        size="sm"
                        onClick={onFileRemove}
                        startIcon={<FiX />}
                    >
                        Supprimer
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="file-upload-zone">
            {isUploading && (
                <div className="mb-3">
                    <Progress.Line
                        percent={uploadProgress}
                        status={uploadProgress === 100 ? 'success' : 'active'}
                    />
                    <small className="text-muted">Upload en cours...</small>
                </div>
            )}

            <div
                className={`file-drop-zone p-4 border-2 border-dashed rounded text-center ${dragOver ? 'border-primary bg-light' : 'border-secondary'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{ cursor: 'pointer' }}
            >
                <input
                    type="file"
                    accept={getAcceptedTypes()}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-input"
                />

                <label htmlFor="file-input" style={{ cursor: 'pointer', width: '100%' }}>
                    <FiUpload size={32} className="text-muted mb-2" />
                    <div className="fw-bold">
                        Cliquez pour sélectionner ou glissez un fichier {exerciseType}
                    </div>
                    <small className="text-muted">
                        Types acceptés: {getAcceptedTypes().replace(/\./g, '').toUpperCase()}
                        <br />
                        Taille maximum: {Math.round(getMaxSize() / (1024 * 1024))}MB
                    </small>
                </label>
            </div>
        </div>
    );
};

const SaveExercise = () => {
    const MySwal = withReactContent(Swal);
    const { postData, loadingPost, errorPost } = usePostData("courses-api.php", "multipart-form-data");
    const { exerciseId } = useParams();
    const navigate = useNavigate();

    // Déterminer le mode (création ou modification)
    const isEditMode = Boolean(exerciseId);

    // États des données de référence et de chargement
    const [referenceData, setReferenceData] = useState(initialReferenceData);
    const [activeTab, setActiveTab] = useState('basic');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isLoadingExercise, setIsLoadingExercise] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const { courses, loading, error, refetch } = useCoursesData(refreshTrigger);
    const { lessons, loading: lessonsLoading, error: lessonsError, refetch: refetchLessons } = useLessonsData(refreshTrigger);

    console.log("lessonslessonslessonslessonslessons");
    console.log(lessons);

    // Données du formulaire principal
    const initialFormData = {
        title: "",
        description: "",
        instructions: "",
        content: "",
        exercise_type: "text",
        file_url: "",
        uploaded_file: null,
        external_link: "",
        solution: "",
        hints: [],
        difficulty_level_id: null,
        estimated_duration: 30,
        points: 10,
        is_mandatory: false,
        is_interactive: false,
        domain_id: null,
        sub_domain_id: null,
        course_id: null,
        lesson_id: null
    };

    const [formData, setFormData] = useState(initialFormData);
    const [originalExerciseData, setOriginalExerciseData] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Hooks personnalisés
    const {
        contextsState,
        updateContextState,
        handleContextSelection,
        resetAllContexts,
        loadContextData
    } = useContextState();

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

    // Fonction pour charger les données d'un exercice existant (sans useCallback pour éviter les boucles)
    const loadExerciseData = async (id) => {
        if (!id) return;

        setIsLoadingExercise(true);
        setLoadError(null);

        try {
            const response = await fetch('http://localhost/CRUDPHP/api/courses-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_exercise_complete',
                    exercise_id: id
                })
            });

            const result = await response.json();
            console.log("Données de l'exercice chargées:", result);

            if (result.success && result.data) {
                const { exercise, associations, details } = result.data;

                // Pré-remplir le formulaire
                setFormData({
                    title: exercise.title || '',
                    description: exercise.description || '',
                    instructions: exercise.instructions || '',
                    content: exercise.content || '',
                    exercise_type: exercise.exercise_type || 'text',
                    file_url: exercise.file_url || '',
                    uploaded_file: null,
                    external_link: exercise.external_link || '',
                    solution: exercise.solution || '',
                    hints: Array.isArray(exercise.hints) ? exercise.hints : [],
                    difficulty_level_id: exercise.difficulty_level_id,
                    estimated_duration: exercise.estimated_duration || 30,
                    points: exercise.points || 10,
                    is_mandatory: Boolean(exercise.is_mandatory),
                    is_interactive: Boolean(exercise.is_interactive),
                    domain_id: associations.domains?.[0] || null,
                    sub_domain_id: associations.sub_domains?.[0] || null,
                    course_id: null,
                    lesson_id: null
                });

                // Sauvegarder les données originales
                setOriginalExerciseData(result.data);

                // Pré-sélectionner les éléments dans les tableaux
                updateContextState('courses', { selectedIds: associations.courses || [] });
                updateContextState('lessons', { selectedIds: associations.lessons || [] });
                updateQuestionsState({ selectedIds: associations.questions || [] });

                // Charger les sous-domaines si un domaine est sélectionné
                if (associations.domains?.[0]) {
                    try {
                        await loadSubDomains(associations.domains[0], setReferenceData);
                    } catch (error) {
                        console.error("Erreur lors du chargement des sous-domaines:", error);
                    }
                }

                setIsInitialized(true);
            } else {
                throw new Error(result.error || 'Erreur lors du chargement de l\'exercice');
            }

        } catch (error) {
            console.error('Erreur lors du chargement de l\'exercice:', error);
            setLoadError(error.message);
            MySwal.fire({
                title: 'Erreur',
                text: `Impossible de charger l'exercice: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Retour'
            }).then(() => {
                navigate('/exercises');
            });
        } finally {
            setIsLoadingExercise(false);
        }
    };

    // Fonction de réinitialisation complète
    const resetFormComplete = useCallback(() => {
        resetForm();
        updateQuestionsState({
            selectedIds: [],
            selectedQuestions: [],
            error: null
        });
        resetAllContexts();
        setOriginalExerciseData(null);
        setIsInitialized(false);
    }, [resetForm, updateQuestionsState, resetAllContexts]);

    // Gestion des sélections
    const handleQuestionSelectionLocal = useCallback((questionIds) => {
        handleQuestionSelection(questionIds, questionsState.data, updatePointsFromQuestions);
    }, [handleQuestionSelection, questionsState.data, updatePointsFromQuestions]);

    const handleContextSelectionLocal = useCallback((contextType, selectedIds) => {
        handleContextSelection(contextType, selectedIds, updateFormField);
    }, [handleContextSelection, updateFormField]);

    // Gestion des fichiers
    const handleFileSelect = useCallback((fileData) => {
        updateFormField('uploaded_file', fileData.file);
        updateFormField('file_url', fileData.url);
    }, [updateFormField]);

    const handleFileRemove = useCallback(() => {
        updateFormField('uploaded_file', null);
        updateFormField('file_url', '');
    }, [updateFormField]);

    // Gestion du changement de domaine
    const handleDomainChange = useCallback(async (domainId) => {
        updateFormField('domain_id', domainId);
        updateFormField('sub_domain_id', null);

        if (domainId) {
            try {
                await loadSubDomains(domainId, setReferenceData);
            } catch (error) {
                console.error("Erreur lors du chargement des sous-domaines:", error);
            }
        }
    }, [updateFormField]);

    // Préparer les données pour l'envoi
    // Préparer les données pour l'envoi
    const prepareSubmissionData = useCallback(() => {
        const baseData = {
            title: formData.title,
            description: formData.description,
            instructions: formData.instructions,
            content: formData.content,
            exercise_type: formData.exercise_type,
            external_link: formData.external_link,
            solution: formData.solution,
            hints: formData.hints,
            difficulty_level_id: formData.difficulty_level_id,
            estimated_duration: formData.estimated_duration,
            points: formData.points,
            is_mandatory: formData.is_mandatory,
            is_interactive: formData.is_interactive,
            domain_id: formData.domain_id,
            sub_domain_id: formData.sub_domain_id,

            // Associations - CORRECTION: Décommenter les lessons
            selected_courses: contextsState.courses.selectedIds,
            selected_lessons: contextsState.lessons.selectedIds, // LIGNE CORRIGÉE
            selected_questions: questionsState.selectedIds,
            selected_domains: formData.domain_id ? [formData.domain_id] : [],
            selected_sub_domains: formData.sub_domain_id ? [formData.sub_domain_id] : [],

            // Métadonnées - CORRECTION: Inclure les lessons dans le comptage
            metadata: {
                created_via: 'web_interface',
                version: '1.0',
                mode: isEditMode ? 'edit' : 'create',
                total_selections: {
                    courses: contextsState.courses.selectedIds.length,
                    lessons: contextsState.lessons.selectedIds.length, // LIGNE CORRIGÉE
                    questions: questionsState.selectedIds.length
                }
            }
        };

        if (isEditMode) {
            return {
                action: 'update_exercise_complete',
                exercise_id: exerciseId,
                ...baseData
            };
        } else {
            return {
                action: 'create_exercise_complete',
                ...baseData
            };
        }
    }, [formData, contextsState, questionsState, isEditMode, exerciseId]);

    // Soumission avec gestion de fichier
    const handleSubmitExercise = useCallback(async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Validation
        const validationErrors = validateExerciseForm(formData, questionsState.selectedIds);
        if (validationErrors.length > 0) {
            MySwal.fire({
                title: 'Erreurs de validation',
                html: validationErrors.map(error => `<p>• ${error}</p>`).join(''),
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        const actionText = isEditMode ? 'modifier' : 'créer';
        const confirm = await MySwal.fire({
            title: `Confirmer la ${actionText === 'créer' ? 'création' : 'modification'} de l'exercice ?`,
            text: `Voulez-vous ${actionText} l'exercice "${formData.title}" avec ${questionsState.selectedIds.length} question(s) ?`,
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

            // Préparer FormData pour l'upload de fichier
            const formDataToSend = new FormData();
            const exerciseData = prepareSubmissionData();

            // Ajouter toutes les données de l'exercice
            Object.keys(exerciseData).forEach(key => {
                if (exerciseData[key] !== null && exerciseData[key] !== undefined) {
                    if (typeof exerciseData[key] === 'object') {
                        formDataToSend.append(key, JSON.stringify(exerciseData[key]));
                    } else {
                        formDataToSend.append(key, exerciseData[key]);
                    }
                }
            });

            // Ajouter le fichier si présent
            if (formData.uploaded_file) {
                formDataToSend.append('exercise_file', formData.uploaded_file);
            }

            const result = await postData(formDataToSend);

            if (result && result.success) {
                const successMessage = isEditMode
                    ? `Exercice "${result.data?.exercise_data?.title || formData.title}" modifié avec succès !`
                    : `Exercice "${result.data?.exercise_data?.title || formData.title}" créé avec succès !`;

                MySwal.fire({
                    title: 'Succès !',
                    text: successMessage,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    if (isEditMode) {
                        // Recharger les données après modification
                        loadExerciseData(exerciseId);
                    } else {
                        resetFormComplete();
                    }
                });
            } else {
                throw new Error(result?.error || `Erreur lors de ${actionText === 'créer' ? 'la création' : 'la modification'} de l'exercice`);
            }
        } catch (err) {
            console.error(`Erreur lors de ${actionText === 'créer' ? 'la création' : 'la modification'} de l'exercice:`, err);
            MySwal.fire({
                title: 'Erreur !',
                text: err.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            updateUiState({ submitLoading: false });
        }
    }, [formData, questionsState.selectedIds, contextsState, MySwal, updateUiState, prepareSubmissionData, isEditMode, exerciseId, resetFormComplete, postData]);

    // Actions du tableau
    const handleTableActionLocal = useCallback((actionType, item, context) => {
        handleTableAction(actionType, item, context);
    }, [handleTableAction]);

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'edit':
                    console.log('Modifier:', modalState.selectedQuestion);
                    break;
                case 'delete':
                    console.log('Supprimer:', modalState.selectedQuestion);
                    await fetchQuestions(updateQuestionsState, true);
                    break;
                case 'create':
                    console.log('Créer une nouvelle question');
                    await fetchQuestions(updateQuestionsState, true);
                    break;
            }
            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedQuestion, handleCloseModal, updateQuestionsState]);

    // Fonctions de chargement avec useCallback stable
    const loadReferenceDataLocal = useCallback(async () => {
        try {
            await loadAllReferenceData(setReferenceData, updateQuestionsState);
        } catch (error) {
            console.error("Erreur lors du chargement des données de référence:", error);
        }
    }, []); // Pas de dépendances pour éviter les boucles

    const fetchQuestionsLocal = useCallback(async () => {
        try {
            await fetchQuestions(updateQuestionsState);
        } catch (error) {
            console.error("Erreur lors du chargement des questions:", error);
        }
    }, []); // Pas de dépendances pour éviter les boucles

    const fetchContextDataLocal = useCallback(async (contextType) => {
        try {
            // Ne charger que les cours via loadContextData, les leçons sont gérées par le hook
            if (contextType === 'courses') {
                await loadContextData(contextType, fetchContextData);
            }
        } catch (error) {
            console.error(`Erreur lors du chargement de ${contextType}:`, error);
        }
    }, []); // Pas de dépendances pour éviter les boucles

    // Chargement initial des données (une seule fois)
    useEffect(() => {
        const initializeData = async () => {
            if (!isInitialized) {
                await Promise.all([
                    loadReferenceDataLocal(),
                    fetchQuestionsLocal(),
                    fetchContextDataLocal('courses')
                    // Les leçons sont chargées par le hook useLessonsData
                ]);

                if (!isEditMode) {
                    setIsInitialized(true);
                }
            }
        };

        initializeData();
    }, [isInitialized, isEditMode, loadReferenceDataLocal, fetchQuestionsLocal, fetchContextDataLocal]);

    // Chargement des données de l'exercice en mode édition (séparé pour éviter les boucles)
    useEffect(() => {
        if (isEditMode && exerciseId && !isInitialized) {
            loadExerciseData(exerciseId);
        }
    }, [isEditMode, exerciseId, isInitialized]); // Dépendances stables

    // Filtrer les cours selon le domaine/sous-domaine sélectionné
    const filteredCourses = contextsState.courses.data.filter(course => {
        if (formData.domain_id && course.domain_id !== formData.domain_id) {
            return false;
        }
        if (formData.sub_domain_id && course.sub_domain_id !== formData.sub_domain_id) {
            return false;
        }
        return true;
    });

    const exerciseTypes = [
        { label: "Texte", value: "text" },
        { label: "PDF", value: "pdf" },
        { label: "Image", value: "image" },
        { label: "Vidéo", value: "video" },
        { label: "Lien externe", value: "link" },
        { label: "Interactif", value: "interactive" },
        { label: "Mixte", value: "mixed" }
    ];

    // Affichage du loader pendant le chargement de l'exercice
    // if (isEditMode && isLoadingExercise) {
    //     return (
    //         <Panel bordered style={{ margin: '20px', textAlign: 'center', padding: '50px' }}>
    //             <h4>Chargement de l'exercice...</h4>
    //             <Progress.Circle percent={50} />
    //         </Panel>
    //     );
    // }

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

    return (
        <>
            <Panel
                header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '20px', fontWeight: '600' }}>
                                {isEditMode ? <FiEdit style={{ marginRight: '8px' }} /> : <FiPlus style={{ marginRight: '8px' }} />}
                                {isEditMode ? 'Modification d\'un Exercice' : 'Création d\'un Exercice'}
                            </h3>
                            <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                                {isEditMode
                                    ? 'Modifiez votre exercice et ses associations'
                                    : 'Configurez votre exercice et associez des questions et contextes'
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
                <Tabs activeKey={activeTab} onSelect={setActiveTab} style={{ marginTop: '20px' }}>

                    {/* ONGLET - INFORMATIONS DE BASE */}
                    <Tabs.Tab eventKey="basic" title={
                        <span><FiFileText style={{ marginRight: '5px' }} />Informations de base</span>
                    }>
                        <div className="row mt-3">
                            <div className="col-lg-8">
                                {/* Sélection Domaine/Sous-domaine */}
                                <div className='row mb-4'>
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
                                </div>

                                {/* Titre */}
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Titre de l'exercice
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Saisir le titre de l'exercice"
                                        value={formData.title}
                                        onChange={(e) => updateFormField('title', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Description et Instructions */}
                                <div className='row'>
                                    <div className="col-lg-6">
                                        <div className="form-group mb-3">
                                            <label className="fs-6 form-label fw-bold text-gray-900">
                                                Description
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                placeholder="Description de l'exercice"
                                                value={formData.description}
                                                onChange={(e) => updateFormField('description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group mb-3">
                                            <label className="fs-6 form-label fw-bold text-gray-900">
                                                Instructions
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                placeholder="Instructions pour réaliser l'exercice"
                                                value={formData.instructions}
                                                onChange={(e) => updateFormField('instructions', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contenu */}
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Contenu de l'exercice
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder="Contenu détaillé de l'exercice"
                                        value={formData.content}
                                        onChange={(e) => updateFormField('content', e.target.value)}
                                    />
                                </div>

                                {/* Solution */}
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Solution / Correction
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Solution détaillée de l'exercice"
                                        value={formData.solution}
                                        onChange={(e) => updateFormField('solution', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-lg-4">
                                {/* Configuration */}
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Type d'exercice
                                    </label>
                                    <SelectPicker
                                        data={exerciseTypes}
                                        style={{ width: "100%" }}
                                        value={formData.exercise_type}
                                        onChange={(value) => updateFormField('exercise_type', value)}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Niveau de difficulté
                                    </label>
                                    <SelectPicker
                                        data={referenceData.difficultes}
                                        style={{ width: "100%" }}
                                        value={formData.difficulty_level_id}
                                        onChange={(value) => updateFormField('difficulty_level_id', value)}
                                        placeholder="Sélectionnez un niveau"
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Durée estimée (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        value={formData.estimated_duration}
                                        onChange={(e) => updateFormField('estimated_duration', parseInt(e.target.value) || 30)}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Points
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        value={formData.points}
                                        onChange={(e) => updateFormField('points', parseInt(e.target.value) || 10)}
                                    />
                                    <small className="text-muted">
                                        Mis à jour selon les questions sélectionnées
                                    </small>
                                </div>

                                {/* Options */}
                                <div className="form-group mb-3">
                                    <div className="form-check mb-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={formData.is_mandatory}
                                            onChange={(e) => updateFormField('is_mandatory', e.target.checked)}
                                        />
                                        <label className="form-check-label">Exercice obligatoire</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={formData.is_interactive}
                                            onChange={(e) => updateFormField('is_interactive', e.target.checked)}
                                        />
                                        <label className="form-check-label">Exercice interactif</label>
                                    </div>
                                </div>

                                {/* Upload de fichiers */}
                                {['pdf', 'image', 'video'].includes(formData.exercise_type) && (
                                    <div className="form-group mb-3">
                                        <label className="fs-6 form-label fw-bold text-gray-900">
                                            Fichier de l'exercice
                                        </label>
                                        <FileUploadComponent
                                            exerciseType={formData.exercise_type}
                                            onFileSelect={handleFileSelect}
                                            currentFile={formData.uploaded_file}
                                            onFileRemove={handleFileRemove}
                                            existingFileUrl={originalExerciseData?.exercise?.file_url}
                                        />
                                    </div>
                                )}

                                {/* Lien externe */}
                                {formData.exercise_type === 'link' && (
                                    <div className="form-group mb-3">
                                        <label className="fs-6 form-label fw-bold text-gray-900">
                                            Lien externe
                                        </label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            placeholder="https://example.com"
                                            value={formData.external_link}
                                            onChange={(e) => updateFormField('external_link', e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Résumé des sélections */}
                        {(questionsState.selectedIds.length > 0 ||
                            contextsState.courses.selectedIds.length > 0 ||
                            contextsState.lessons.selectedIds.length > 0) && (
                                <div className="mt-4 p-3 bg-light rounded">
                                    <h6>
                                        <FiCheckCircle style={{ color: 'green', marginRight: '8px' }} />
                                        Résumé des sélections
                                    </h6>

                                    {questionsState.selectedIds.length > 0 && (
                                        <div className="mb-2">
                                            <Badge color="blue" style={{ marginRight: '8px' }}>
                                                Questions: {questionsState.selectedIds.length}
                                            </Badge>
                                            <small className="text-muted">
                                                Total points: {formData.points}
                                            </small>
                                        </div>
                                    )}

                                    {contextsState.courses.selectedIds.length > 0 && (
                                        <div className="mb-1">
                                            <Badge color="green" style={{ marginRight: '8px' }}>
                                                Cours: {contextsState.courses.selectedIds.length}
                                            </Badge>
                                        </div>
                                    )}

                                    {contextsState.lessons.selectedIds.length > 0 && (
                                        <div className="mb-1">
                                            <Badge color="orange" style={{ marginRight: '8px' }}>
                                                Leçons: {contextsState.lessons.selectedIds.length}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            )}
                    </Tabs.Tab>

                    {/* ONGLET - COURS */}
                    <Tabs.Tab eventKey="courses" title={
                        <span><FiBookOpen style={{ marginRight: '5px' }} />
                            Cours ({contextsState.courses.selectedIds.length})
                        </span>
                    }>
                        <div className="mt-3">
                            <DataTable
                                title="Sélection des Cours"
                                subtitle={`${courses?.length || 0} cours disponible(s)`}
                                data={courses || []}
                                loading={contextsState.courses.loading}
                                error={contextsState.courses.error}
                                columns={coursesTableConfig.columns}
                                searchableFields={coursesTableConfig.searchableFields}
                                filterConfigs={coursesTableConfig.filterConfigs}
                                actions={coursesTableConfig.actions}
                                onAction={(actionType, item) => handleTableActionLocal(actionType, item, 'courses')}
                                onRefresh={() => fetchContextDataLocal('courses')}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={500}
                                enableRefresh={true}
                                selectable={true}
                                selectedItems={contextsState.courses.selectedIds}
                                onSelectionChange={(selectedIds) => handleContextSelectionLocal('courses', selectedIds)}
                                rowKey="id"
                                customStyles={{
                                    container: { backgroundColor: '#f8f9fa' },
                                    panel: { minHeight: '500px' }
                                }}
                            />
                        </div>
                    </Tabs.Tab>

                    {/* ONGLET - LEÇONS */}
                    <Tabs.Tab eventKey="lessons" title={
                        <span><FiBook style={{ marginRight: '5px' }} />
                            Leçons ({contextsState.lessons.selectedIds.length})
                        </span>
                    }>
                        <div className="mt-3">
                            <DataTable
                                title="Sélection des Leçons"
                                subtitle={`${lessons.length} leçon(s) disponible(s)${contextsState.courses.selectedIds.length > 0 ? ' (filtrées par cours sélectionnés)' : ''}`}
                                data={lessons}
                                loading={contextsState.lessons.loading}
                                error={contextsState.lessons.error}
                                columns={lessonsTableConfig.columns}
                                searchableFields={lessonsTableConfig.searchableFields}
                                filterConfigs={lessonsTableConfig.filterConfigs}
                                actions={lessonsTableConfig.actions}
                                onAction={(actionType, item) => handleTableActionLocal(actionType, item, 'lessons')}
                                onRefresh={() => fetchContextDataLocal('lessons')}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={500}
                                enableRefresh={true}
                                selectable={true}
                                selectedItems={contextsState.lessons.selectedIds}
                                onSelectionChange={(selectedIds) => handleContextSelectionLocal('lessons', selectedIds)}
                                rowKey="id"
                                customStyles={{
                                    container: { backgroundColor: '#f8f9fa' },
                                    panel: { minHeight: '500px' }
                                }}
                            />
                        </div>
                    </Tabs.Tab>

                    {/* ONGLET - QUESTIONS */}
                    <Tabs.Tab eventKey="questions" title={
                        <span><FiUsers style={{ marginRight: '5px' }} />
                            Questions ({questionsState.selectedIds.length})
                        </span>
                    }>
                        <div className="mt-3">
                            <DataTable
                                title="Sélection des Questions"
                                subtitle={`${questionsState.data.length} question(s) disponible(s)`}
                                data={questionsState.data}
                                loading={questionsState.loading}
                                error={questionsState.error}
                                columns={questionsTableConfig.columns}
                                searchableFields={questionsTableConfig.searchableFields}
                                filterConfigs={questionsTableConfig.filterConfigs}
                                actions={questionsTableConfig.actions}
                                onAction={(actionType, item) => handleTableActionLocal(actionType, item, 'questions')}
                                onRefresh={fetchQuestionsLocal}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={500}
                                enableRefresh={true}
                                selectable={true}
                                selectedItems={questionsState.selectedIds}
                                onSelectionChange={handleQuestionSelectionLocal}
                                rowKey="id"
                                customStyles={{
                                    container: { backgroundColor: '#f8f9fa' },
                                    panel: { minHeight: '500px' }
                                }}
                            />
                        </div>
                    </Tabs.Tab>
                </Tabs>

                {/* BOUTONS D'ACTION */}
                <div className="mt-4 d-flex justify-content-end gap-2">
                    <Button
                        appearance="subtle"
                        onClick={resetFormComplete}
                        disabled={uiState.submitLoading}
                    >
                        {isEditMode ? 'Annuler les modifications' : 'Réinitialiser'}
                    </Button>
                    <Button
                        appearance="primary"
                        loading={uiState.submitLoading}
                        disabled={uiState.submitLoading || !formData.title.trim()}
                        startIcon={<FiSave />}
                        onClick={handleSubmitExercise}
                    >
                        {uiState.submitLoading
                            ? (isEditMode ? 'Modification en cours...' : 'Création en cours...')
                            : (isEditMode ? 'Modifier l\'Exercice' : 'Créer l\'Exercice')
                        }
                    </Button>
                </div>
            </Panel>

            {/* MODAL DE GESTION DES QUESTIONS */}
            <QuestionModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
                referenceData={referenceData}
            />
        </>
    );
};

export default SaveExercise;