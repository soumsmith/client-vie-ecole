import React, { useState, useCallback, useEffect } from 'react';
import {
    Badge,
    Button,
    Panel,
    Tabs,
    Progress,
    Message,
    IconButton,
    Modal
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
    FiPlus,
    FiTrash2,
    FiMove,
    FiTag,
    FiLink
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
import { useFormUtils, initialReferenceData, validateLessonForm } from '../utils/formUtils';
import { useExercisesData } from '../Exercices/exerciceService';


import {
    questionsTableConfig,
    coursesTableConfig,
    exercisesTableConfig
} from '../config/tableConfigs';
import QuestionModal from '../modal/QuestionModal';
import { useCoursesData } from '../Course/courseService';

// Composant pour gérer une section de leçon
const SectionEditor = ({ section, sectionIndex, onUpdateSection, onDeleteSection, contentTypes, mediaResources, tags }) => {
    const [expanded, setExpanded] = useState(true);

    const updateSection = (field, value) => {
        onUpdateSection(sectionIndex, { ...section, [field]: value });
    };

    const addContentBlock = () => {
        const newBlock = {
            id: `temp_${Date.now()}_${Math.random()}`,
            title: '',
            content: '',
            formatted_content: '',
            content_type_id: contentTypes[0]?.value || 1,
            metadata: {},
            order_index: section.content_blocks?.length || 0,
            is_interactive: false,
            is_important: false,
            media_links: [],
            tags: []
        };

        updateSection('content_blocks', [...(section.content_blocks || []), newBlock]);
    };

    const updateContentBlock = (blockIndex, updatedBlock) => {
        const blocks = [...(section.content_blocks || [])];
        blocks[blockIndex] = updatedBlock;
        updateSection('content_blocks', blocks);
    };

    const deleteContentBlock = (blockIndex) => {
        const blocks = [...(section.content_blocks || [])];
        blocks.splice(blockIndex, 1);
        updateSection('content_blocks', blocks);
    };

    const addMediaLinkToBlock = (blockIndex) => {
        const blocks = [...(section.content_blocks || [])];
        const newMediaLink = {
            media_resource_id: null,
            display_order: blocks[blockIndex].media_links?.length || 0,
            is_primary: false
        };
        blocks[blockIndex].media_links = [...(blocks[blockIndex].media_links || []), newMediaLink];
        updateSection('content_blocks', blocks);
    };

    return (
        <Panel
            header={
                <div className="d-flex justify-content-between align-items-center">
                    <span>
                        <FiFileText className="me-2" />
                        {section.title || `Section ${sectionIndex + 1}`}
                    </span>
                    <div>
                        <IconButton
                            icon={<FiEdit />}
                            size="sm"
                            appearance="subtle"
                            onClick={() => setExpanded(!expanded)}
                        />
                        <IconButton
                            icon={<FiTrash2 />}
                            size="sm"
                            color="red"
                            appearance="subtle"
                            onClick={() => onDeleteSection(sectionIndex)}
                        />
                    </div>
                </div>
            }
            collapsible
            expanded={expanded}
            bordered
            className="mb-3"
        >
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="form-label fw-bold">Titre de la section</label>
                        <input
                            type="text"
                            className="form-control"
                            value={section.title || ''}
                            onChange={(e) => updateSection('title', e.target.value)}
                            placeholder="Titre de la section"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label className="form-label fw-bold">Type de section</label>
                        <SelectPicker
                            data={[
                                { label: 'Contenu', value: 'content' },
                                { label: 'Exercices', value: 'exercises' },
                                { label: 'Évaluation', value: 'assessment' },
                                { label: 'Résumé', value: 'summary' }
                            ]}
                            style={{ width: '100%' }}
                            value={section.section_type || 'content'}
                            onChange={(value) => updateSection('section_type', value)}
                        />
                    </div>
                </div>
            </div>

            <div className="form-group mb-3">
                <label className="form-label fw-bold">Description</label>
                <textarea
                    className="form-control"
                    rows="2"
                    value={section.description || ''}
                    onChange={(e) => updateSection('description', e.target.value)}
                    placeholder="Description de la section"
                />
            </div>

            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="form-label fw-bold">Ordre d'affichage</label>
                        <input
                            type="number"
                            className="form-control"
                            value={section.order_index || 0}
                            onChange={(e) => updateSection('order_index', parseInt(e.target.value) || 0)}
                            min="0"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-check mt-4">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={section.is_collapsed || false}
                            onChange={(e) => updateSection('is_collapsed', e.target.checked)}
                        />
                        <label className="form-check-label">Section repliée par défaut</label>
                    </div>
                </div>
            </div>

            {/* Gestion des blocs de contenu */}
            <div className="content-blocks-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                        <FiBook className="me-2" />
                        Blocs de contenu ({section.content_blocks?.length || 0})
                    </h6>
                    <Button
                        size="sm"
                        appearance="ghost"
                        startIcon={<FiPlus />}
                        onClick={addContentBlock}
                    >
                        Ajouter un bloc
                    </Button>
                </div>

                {section.content_blocks?.map((block, blockIndex) => (
                    <Panel key={block.id} bordered className="mb-2" style={{ marginLeft: '20px' }}>
                        <div className="row">
                            <div className="col-md-8">
                                <div className="form-group mb-2">
                                    <label className="form-label">Titre du bloc</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={block.title || ''}
                                        onChange={(e) => updateContentBlock(blockIndex, { ...block, title: e.target.value })}
                                        placeholder="Titre du bloc de contenu"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-2">
                                    <label className="form-label">Type de contenu</label>
                                    <SelectPicker
                                        data={contentTypes}
                                        style={{ width: '100%' }}
                                        size="sm"
                                        value={block.content_type_id}
                                        onChange={(value) => updateContentBlock(blockIndex, { ...block, content_type_id: value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group mb-2">
                            <label className="form-label">Contenu</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={block.content || ''}
                                onChange={(e) => updateContentBlock(blockIndex, { ...block, content: e.target.value })}
                                placeholder="Contenu du bloc"
                            />
                        </div>

                        <div className="row mb-2">
                            <div className="col-md-6">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={block.is_interactive || false}
                                        onChange={(e) => updateContentBlock(blockIndex, { ...block, is_interactive: e.target.checked })}
                                    />
                                    <label className="form-check-label">Contenu interactif</label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={block.is_important || false}
                                        onChange={(e) => updateContentBlock(blockIndex, { ...block, is_important: e.target.checked })}
                                    />
                                    <label className="form-check-label">Contenu important</label>
                                </div>
                            </div>
                        </div>

                        {/* Gestion des liens média */}
                        <div className="media-links-section mb-2">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">
                                    <FiLink className="me-1" />
                                    Liens média ({block.media_links?.length || 0})
                                </small>
                                <Button
                                    size="xs"
                                    appearance="subtle"
                                    startIcon={<FiPlus />}
                                    onClick={() => addMediaLinkToBlock(blockIndex)}
                                >
                                    Ajouter média
                                </Button>
                            </div>

                            {block.media_links?.map((mediaLink, linkIndex) => (
                                <div key={linkIndex} className="d-flex align-items-center mb-1" style={{ marginLeft: '10px' }}>
                                    <SelectPicker
                                        data={mediaResources}
                                        style={{ width: '200px' }}
                                        size="xs"
                                        value={mediaLink.media_resource_id}
                                        onChange={(value) => {
                                            const blocks = [...(section.content_blocks || [])];
                                            blocks[blockIndex].media_links[linkIndex].media_resource_id = value;
                                            updateSection('content_blocks', blocks);
                                        }}
                                        placeholder="Sélectionner média"
                                    />
                                    <div className="form-check ms-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={mediaLink.is_primary || false}
                                            onChange={(e) => {
                                                const blocks = [...(section.content_blocks || [])];
                                                blocks[blockIndex].media_links[linkIndex].is_primary = e.target.checked;
                                                updateSection('content_blocks', blocks);
                                            }}
                                        />
                                        <label className="form-check-label">Principal</label>
                                    </div>
                                    <IconButton
                                        icon={<FiX />}
                                        size="xs"
                                        color="red"
                                        appearance="subtle"
                                        className="ms-2"
                                        onClick={() => {
                                            const blocks = [...(section.content_blocks || [])];
                                            blocks[blockIndex].media_links.splice(linkIndex, 1);
                                            updateSection('content_blocks', blocks);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Gestion des tags */}
                        <div className="tags-section mb-2">
                            <small className="text-muted">
                                <FiTag className="me-1" />
                                Tags:
                            </small>
                            <SelectPicker
                                data={tags}
                                style={{ width: '100%' }}
                                size="sm"
                                value={block.tags || []}
                                onChange={(value) => updateContentBlock(blockIndex, { ...block, tags: value })}
                                placeholder="Sélectionner des tags"
                                multiple
                                className="mt-1"
                            />
                        </div>

                        <div className="d-flex justify-content-end">
                            <Button
                                size="xs"
                                color="red"
                                appearance="subtle"
                                startIcon={<FiTrash2 />}
                                onClick={() => deleteContentBlock(blockIndex)}
                            >
                                Supprimer le bloc
                            </Button>
                        </div>
                    </Panel>
                ))}
            </div>
        </Panel>
    );
};

const SaveLesson = () => {
    const MySwal = withReactContent(Swal);
    const { postData, loadingPost, errorPost } = usePostData("lesson_complete_api.php", "multipart-form-data");
    const { lessonId } = useParams();
    const navigate = useNavigate();

    // Déterminer le mode (création ou modification)
    const isEditMode = Boolean(lessonId);

    // États des données de référence et de chargement
    const [referenceData, setReferenceData] = useState(initialReferenceData);
    const [activeTab, setActiveTab] = useState('basic');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [isLoadingLesson, setIsLoadingLesson] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const { courses, loading, error, refetch } = useCoursesData(refreshTrigger);

    // Données du formulaire principal pour les leçons
    const initialLessonFormData = {
        title: "",
        description: "",
        learning_objectives: "",
        learning_situation: "",
        key_concepts: [],
        estimated_duration: 60,
        lesson_type: "mixed",
        premium_level_id: 0,
        order_index: 0,
        is_mandatory: true,
        // Nouveaux champs pour la gestion complexe
        sections: [],
        exercises: []
    };

    const [formData, setFormData] = useState(initialLessonFormData);
    const [originalLessonData, setOriginalLessonData] = useState(null);
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
    } = useFormUtils(initialLessonFormData, setFormData);

    // États pour les options de sélection
    const [contentTypes, setContentTypes] = useState([]);
    const [mediaResources, setMediaResources] = useState([]);
    const [tags, setTags] = useState([]);

    // Hook pour les exercices avec la nouvelle source de données
    const { exercices, loadings, errors, refetchs } = useExercisesData(refreshTrigger);


    // Fonction pour charger les données d'une leçon existante
    const loadLessonData = async (id) => {
        if (!id) return;
        
        setIsLoadingLesson(true);
        setLoadError(null);

        try {
            // Nouvelle API et payload
            const response = await fetch('http://localhost/CRUDPHP/api/lesson_complete_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_lesson_complete_extended',
                    lesson_id: id,
                    user_id: 1 // À adapter dynamiquement si besoin
                })
            });

            const result = await response.json();
            console.log("Données de la leçon chargées:", result);

            if (result.success && result.data) {
                const { lesson, sections, exercises, associated_courses } = result.data;

                // Mapping des sections et content_blocks
                const mappedSections = (sections || []).map(section => ({
                    ...section,
                    content_blocks: (section.content_blocks || []).map(block => ({
                        ...block,
                        content_type_id: block.content_type?.id || block.content_type_id || 1,
                        media_links: (block.media_resources || []).map((media, idx) => ({
                            media_resource_id: media.id,
                            display_order: media.display_order ?? idx,
                            is_primary: media.is_primary ?? false
                        })),
                        tags: block.tags || []
                    }))
                }));

                // Mapping des exercices
                const mappedExercises = (exercises || []).map(ex => {
                    const exData = ex.exercise || {};
                    return {
                        ...ex,
                        exercise_id: exData.id || ex.id,
                        title: exData.title || ex.title,
                        instructions: exData.description || ex.instructions || '',
                        solution_explanation: exData.solution || ex.solution_explanation || '',
                        hints: exData.hints || ex.hints || [],
                        exercise_type: exData.exercise_type || ex.exercise_type || 'practice',
                        order_index: ex.order_index,
                        is_mandatory: ex.is_mandatory,
                        difficulty_level: exData.difficulty_level || 'medium',
                        points: exData.points || 1,
                        estimated_time: exData.estimated_duration || 5
                    };
                });

                // Pré-remplir le formulaire
                setFormData({
                    title: lesson.title || '',
                    description: lesson.description || '',
                    learning_objectives: lesson.learning_objectives || '',
                    learning_situation: lesson.learning_situation || '',
                    key_concepts: lesson.key_concepts || [],
                    estimated_duration: lesson.estimated_duration || 60,
                    lesson_type: lesson.lesson_type || 'mixed',
                    premium_level_id: lesson.premium_level_id || 0,
                    order_index: lesson.order_index || 0,
                    is_mandatory: Boolean(lesson.is_mandatory),
                    sections: mappedSections,
                    exercises: mappedExercises
                });

                // Sauvegarder les données originales
                setOriginalLessonData(result.data);

                // Pré-sélectionner les cours associés
                const courseIds = associated_courses?.map(course => course.id) || [];
                updateContextState('courses', { selectedIds: courseIds });

                setIsInitialized(true);
            } else {
                throw new Error(result.error || 'Erreur lors du chargement de la leçon');
            }

        } catch (error) {
            console.error('Erreur lors du chargement de la leçon:', error);
            setLoadError(error.message);
            MySwal.fire({
                title: 'Erreur',
                text: `Impossible de charger la leçon: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Retour'
            }).then(() => {
                navigate('/lessons');
            });
        } finally {
            setIsLoadingLesson(false);
        }
    };

    // Fonction de réinitialisation complète
    const resetFormComplete = useCallback(() => {
        resetForm();
        resetAllContexts();
        setOriginalLessonData(null);
        setIsInitialized(false);
    }, [resetForm, resetAllContexts]);

    // Gestion des sélections de cours
    const handleCourseSelectionLocal = useCallback((selectedIds) => {
        handleContextSelection('courses', selectedIds, updateFormField);
    }, [handleContextSelection, updateFormField]);

    // Gestion des sections
    const addSection = () => {
        const newSection = {
            id: `temp_${Date.now()}_${Math.random()}`,
            title: `Section ${formData.sections.length + 1}`,
            description: '',
            section_type: 'content',
            order_index: formData.sections.length,
            is_collapsed: false,
            content_blocks: []
        };

        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
    };

    const updateSection = (sectionIndex, updatedSection) => {
        setFormData(prev => {
            const sections = [...prev.sections];
            sections[sectionIndex] = updatedSection;
            return { ...prev, sections };
        });
    };

    const deleteSection = (sectionIndex) => {
        MySwal.fire({
            title: 'Confirmer la suppression',
            text: 'Êtes-vous sûr de vouloir supprimer cette section ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                setFormData(prev => {
                    const sections = [...prev.sections];
                    sections.splice(sectionIndex, 1);
                    return { ...prev, sections };
                });
            }
        });
    };

    // Gestion des exercices - MISE À JOUR POUR UTILISER LA NOUVELLE SOURCE
    const handleExerciseSelection = useCallback((selectedIds) => {
        // Utiliser directement les données de exercices au lieu de availableExercises
        const selectedExercises = selectedIds.map(id => {
            const exercise = exercices?.find(ex => ex.id === id || ex.exercise_id === id || ex.question_id === id);
            return {
                question_id: exercise?.question_id || null,
                exercise_id: exercise?.exercise_id || exercise?.id || id,
                title: exercise?.title || exercise?.question_text || `Exercice ${id}`,
                instructions: exercise?.instructions || exercise?.content || '',
                solution_explanation: exercise?.solution_explanation || exercise?.explanation || '',
                hints: exercise?.hints || [],
                exercise_type: exercise?.exercise_type || exercise?.type || 'practice',
                order_index: selectedIds.indexOf(id),
                is_mandatory: exercise?.is_mandatory || true,
                // Propriétés additionnelles qui peuvent être utiles
                difficulty_level: exercise?.difficulty_level || 'medium',
                points: exercise?.points || 1,
                estimated_time: exercise?.estimated_time || 5
            };
        });

        setFormData(prev => ({
            ...prev,
            exercises: selectedExercises
        }));
    }, [exercices]);

    // Préparer les données pour l'envoi
    const prepareSubmissionData = useCallback(() => {
        const baseData = {
            title: formData.title,
            description: formData.description,
            learning_objectives: formData.learning_objectives,
            learning_situation: formData.learning_situation,
            key_concepts: formData.key_concepts,
            estimated_duration: formData.estimated_duration,
            lesson_type: formData.lesson_type,
            premium_level_id: formData.premium_level_id,
            order_index: formData.order_index,
            is_mandatory: formData.is_mandatory,

            // Associations
            selected_courses: contextsState.courses.selectedIds,
            sections: formData.sections,
            exercises: formData.exercises,

            // Métadonnées
            metadata: {
                created_via: 'web_interface',
                version: '1.0',
                mode: isEditMode ? 'edit' : 'create',
                total_sections: formData.sections.length,
                total_exercises: formData.exercises.length,
                total_courses: contextsState.courses.selectedIds.length
            }
        };

        if (isEditMode) {
            return {
                action: 'update_lesson_complete',
                lesson_id: lessonId,
                ...baseData
            };
        } else {
            return {
                action: 'create_lesson_complete',
                ...baseData
            };
        }
    }, [formData, contextsState, isEditMode, lessonId]);

    // Soumission du formulaire
    const handleSubmitLesson = useCallback(async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Validation
        if (!formData.title.trim()) {
            MySwal.fire({
                title: 'Erreur de validation',
                text: 'Le titre de la leçon est requis.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        const actionText = isEditMode ? 'modifier' : 'créer';
        const confirm = await MySwal.fire({
            title: `Confirmer la ${actionText === 'créer' ? 'création' : 'modification'} de la leçon ?`,
            text: `Voulez-vous ${actionText} la leçon "${formData.title}" avec ${formData.sections.length} section(s) et ${formData.exercises.length} exercice(s) ?`,
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

            const lessonData = prepareSubmissionData();
            console.log('Données à envoyer:', lessonData);

            const result = await postData(lessonData);

            if (result && result.success) {
                const successMessage = isEditMode
                    ? `Leçon "${result.data?.lesson_data?.title || formData.title}" modifiée avec succès !`
                    : `Leçon "${result.data?.lesson_data?.title || formData.title}" créée avec succès !`;

                MySwal.fire({
                    title: 'Succès !',
                    text: successMessage,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    if (isEditMode) {
                        // Recharger les données après modification
                        loadLessonData(lessonId);
                    } else {
                        resetFormComplete();
                    }
                });
            } else {
                throw new Error(result?.error || `Erreur lors de ${actionText === 'créer' ? 'la création' : 'la modification'} de la leçon`);
            }
        } catch (err) {
            console.error(`Erreur lors de ${actionText === 'créer' ? 'la création' : 'la modification'} de la leçon:`, err);
            MySwal.fire({
                title: 'Erreur !',
                text: err.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            updateUiState({ submitLoading: false });
        }
    }, [formData, contextsState, MySwal, updateUiState, prepareSubmissionData, isEditMode, lessonId, resetFormComplete, postData]);

    // Actions du tableau
    const handleTableActionLocal = useCallback((actionType, item, context) => {
        handleTableAction(actionType, item, context);
    }, [handleTableAction]);

    // Chargement des données de référence
    const loadReferenceDataLocal = useCallback(async () => {
        try {
            await loadAllReferenceData(setReferenceData);

            // Charger les types de contenu
            const contentTypesResponse = await fetch('http://localhost/CRUDPHP/api/courses-api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_content_types' })
            });
            const contentTypesResult = await contentTypesResponse.json();
            if (contentTypesResult.success) {
                setContentTypes(contentTypesResult.data.map(type => ({
                    label: type.name,
                    value: type.id
                })));
            }

            // Charger les ressources média
            const mediaResponse = await fetch('http://localhost/CRUDPHP/api/courses-api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_media_resources' })
            });
            const mediaResult = await mediaResponse.json();
            if (mediaResult.success) {
                setMediaResources(mediaResult.data.map(media => ({
                    label: `${media.name} (${media.file_type})`,
                    value: media.id
                })));
            }

            // Charger les tags
            const tagsResponse = await fetch('http://localhost/CRUDPHP/api/courses-api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_tags' })
            });
            const tagsResult = await tagsResponse.json();
            if (tagsResult.success) {
                setTags(tagsResult.data.map(tag => ({
                    label: tag.name,
                    value: tag.id
                })));
            }

        } catch (error) {
            console.error("Erreur lors du chargement des données de référence:", error);
        }
    }, []);

    const fetchContextDataLocal = useCallback(async (contextType) => {
        try {
            if (contextType === 'courses') {
                await loadContextData(contextType, fetchContextData);
            }
        } catch (error) {
            console.error(`Erreur lors du chargement de ${contextType}:`, error);
        }
    }, []);

    // Chargement initial des données
    useEffect(() => {
        const initializeData = async () => {
            if (!isInitialized) {
                await Promise.all([
                    loadReferenceDataLocal(),
                    fetchContextDataLocal('courses')
                ]);

                if (!isEditMode) {
                    setIsInitialized(true);
                }
            }
        };

        initializeData();
    }, [isInitialized, isEditMode, loadReferenceDataLocal, fetchContextDataLocal]);

    // Chargement des données de la leçon en mode édition
    useEffect(() => {
        if (isEditMode && lessonId && !isInitialized) {
            loadLessonData(lessonId);
        }
    }, [isEditMode, lessonId, isInitialized]);

    const lessonTypes = [
        { label: "Théorie", value: "theory" },
        { label: "Pratique", value: "practice" },
        { label: "Mixte", value: "mixed" },
        { label: "Évaluation", value: "assessment" },
        { label: "Résumé", value: "summary" }
    ];

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
                                {isEditMode ? 'Modification d\'une Leçon' : 'Création d\'une Leçon'}
                            </h3>
                            <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                                {isEditMode
                                    ? 'Modifiez votre leçon avec ses sections et contenus'
                                    : 'Configurez votre leçon avec ses sections, contenus et associations'
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
                                {/* Titre */}
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Titre de la leçon
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Saisir le titre de la leçon"
                                        value={formData.title}
                                        onChange={(e) => updateFormField('title', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Description
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder="Description détaillée de la leçon"
                                        value={formData.description}
                                        onChange={(e) => updateFormField('description', e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Objectifs pédagogiques */}
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Objectifs pédagogiques
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Objectifs d'apprentissage de cette leçon"
                                        value={formData.learning_objectives}
                                        onChange={(e) => updateFormField('learning_objectives', e.target.value)}
                                    />
                                </div>

                                {/* Situation d'apprentissage */}
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Situation d'apprentissage
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Contexte pédagogique et mise en situation"
                                        value={formData.learning_situation}
                                        onChange={(e) => updateFormField('learning_situation', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-lg-4">
                                {/* Configuration */}
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Type de leçon
                                    </label>
                                    <SelectPicker
                                        data={lessonTypes}
                                        style={{ width: "100%" }}
                                        value={formData.lesson_type}
                                        onChange={(value) => updateFormField('lesson_type', value)}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Niveau premium
                                    </label>
                                    <SelectPicker
                                        data={referenceData.niveauxPremium}
                                        style={{ width: "100%" }}
                                        value={formData.premium_level_id}
                                        onChange={(value) => updateFormField('premium_level_id', value)}
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
                                        onChange={(e) => updateFormField('estimated_duration', parseInt(e.target.value) || 60)}
                                    />
                                </div>

                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Ordre d'affichage
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        value={formData.order_index}
                                        onChange={(e) => updateFormField('order_index', parseInt(e.target.value) || 0)}
                                    />
                                </div>

                                {/* Options */}
                                <div className="form-group mb-3">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={formData.is_mandatory}
                                            onChange={(e) => updateFormField('is_mandatory', e.target.checked)}
                                        />
                                        <label className="form-check-label">Leçon obligatoire</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Résumé des sélections */}
                        {(contextsState.courses.selectedIds.length > 0 || formData.sections.length > 0) && (
                            <div className="mt-4 p-3 bg-light rounded">
                                <h6>
                                    <FiCheckCircle style={{ color: 'green', marginRight: '8px' }} />
                                    Résumé
                                </h6>

                                {contextsState.courses.selectedIds.length > 0 && (
                                    <div className="mb-1">
                                        <Badge color="green" style={{ marginRight: '8px' }}>
                                            Cours: {contextsState.courses.selectedIds.length}
                                        </Badge>
                                    </div>
                                )}

                                {formData.sections.length > 0 && (
                                    <div className="mb-1">
                                        <Badge color="blue" style={{ marginRight: '8px' }}>
                                            Sections: {formData.sections.length}
                                        </Badge>
                                    </div>
                                )}

                                {formData.exercises.length > 0 && (
                                    <div className="mb-1">
                                        <Badge color="orange" style={{ marginRight: '8px' }}>
                                            Exercices: {formData.exercises.length}
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
                                onSelectionChange={handleCourseSelectionLocal}
                                rowKey="id"
                                customStyles={{
                                    container: { backgroundColor: '#f8f9fa' },
                                    panel: { minHeight: '500px' }
                                }}
                            />
                        </div>
                    </Tabs.Tab>

                    {/* ONGLET - SECTIONS */}
                    <Tabs.Tab eventKey="sections" title={
                        <span><FiBook style={{ marginRight: '5px' }} />
                            Sections ({formData.sections.length})
                        </span>
                    }>
                        <div className="mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5>Gestion des Sections</h5>
                                <Button
                                    appearance="primary"
                                    startIcon={<FiPlus />}
                                    onClick={addSection}
                                >
                                    Ajouter une section
                                </Button>
                            </div>

                            {formData.sections.length === 0 ? (
                                <Panel bordered style={{ textAlign: 'center', padding: '40px' }}>
                                    <FiBook size={48} color="#ccc" />
                                    <h6 className="mt-3 text-muted">Aucune section créée</h6>
                                    <p className="text-muted">Cliquez sur "Ajouter une section" pour commencer</p>
                                </Panel>
                            ) : (
                                <div className="sections-container">
                                    {formData.sections.map((section, index) => (
                                        <SectionEditor
                                            key={section.id}
                                            section={section}
                                            sectionIndex={index}
                                            onUpdateSection={updateSection}
                                            onDeleteSection={deleteSection}
                                            contentTypes={contentTypes}
                                            mediaResources={mediaResources}
                                            tags={tags}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </Tabs.Tab>

                    {/* ONGLET - EXERCICES - MISE À JOUR */}
                    <Tabs.Tab eventKey="exercises" title={
                        <span><FiUsers style={{ marginRight: '5px' }} />
                            Exercices ({formData.exercises.length})
                        </span>
                    }>
                        <div className="mt-3">
                            <DataTable
                                title="Sélection des Exercices"
                                subtitle={`${exercices?.length || 0} exercice(s) disponible(s)`}
                                data={exercices || []}
                                loading={loadings}
                                error={errors}
                                columns={exercisesTableConfig?.columns || []}
                                searchableFields={exercisesTableConfig?.searchableFields || []}
                                filterConfigs={exercisesTableConfig?.filterConfigs || []}
                                actions={exercisesTableConfig?.actions || []}
                                onAction={(actionType, item) => handleTableActionLocal(actionType, item, 'exercises')}
                                onRefresh={() => refetchs()}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={500}
                                enableRefresh={true}
                                selectable={true}
                                selectedItems={formData.exercises.map(ex => ex.exercise_id || ex.question_id || ex.id)}
                                onSelectionChange={handleExerciseSelection}
                                rowKey="id"
                                customStyles={{
                                    container: { backgroundColor: '#f8f9fa' },
                                    panel: { minHeight: '500px' }
                                }}
                            />

                            {/* Aperçu des exercices sélectionnés */}
                            {formData.exercises.length > 0 && (
                                <Panel header="Exercices sélectionnés" bordered className="mt-3">
                                    <div className="row">
                                        {formData.exercises.map((exercise, index) => (
                                            <div key={index} className="col-md-6 mb-2">
                                                <div className="p-2 border rounded bg-light">
                                                    <strong>{exercise.title}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        Type: {exercise.exercise_type} |
                                                        Points: {exercise.points || 1} |
                                                        Temps: {exercise.estimated_time || 5}min
                                                    </small>
                                                    {exercise.instructions && (
                                                        <div className="mt-1">
                                                            <small>{exercise.instructions.substring(0, 100)}...</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Panel>
                            )}
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
                        onClick={handleSubmitLesson}
                    >
                        {uiState.submitLoading
                            ? (isEditMode ? 'Modification en cours...' : 'Création en cours...')
                            : (isEditMode ? 'Modifier la Leçon' : 'Créer la Leçon')
                        }
                    </Button>
                </div>
            </Panel>

            {/* MODAL DE GESTION DES QUESTIONS (si nécessaire) */}
            <QuestionModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={() => { }}
                referenceData={referenceData}
            />
        </>
    );
};

export default SaveLesson;