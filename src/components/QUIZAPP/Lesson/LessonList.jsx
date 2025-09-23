import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useLessonsData, lessonsTableConfig, updateLessonActiveStatus } from './lessonService';
import { loadAllReferenceData } from '../../services/referenceDataService';
import { useFormUtils, initialReferenceData } from '../utils/formUtils';
import CourseModal from '../modal/CourseModal';
import DataTable from "../../DataTable";

const ListLessons = () => {
    const navigate = useNavigate();

    // ===========================
    // ÉTATS - DONNÉES DE RÉFÉRENCE
    // ===========================
    const [referenceData, setReferenceData] = useState(initialReferenceData);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ===========================
    // ÉTATS - SÉLECTIONS ET MODAL
    // ===========================
    const [selectedLessonIds, setSelectedLessonIds] = useState([]);
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null, // 'create', 'edit', 'delete', 'view'
        selectedLesson: null
    });

    // ===========================
    // ÉTATS - FORMULAIRE
    // ===========================
    const initialFormData = {
        title: "",
        description: "",
        color: "#3498db",
        domain_id: null,
        sub_domain_id: null,
        country_id: null,
        course_id: null,
        difficulty_id: null,
        duration: 0,
        is_featured: 0,
        premium_level_id: null,
        active: 1
    };

    const [formData, setFormData] = useState(initialFormData);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================

    // Hook pour récupérer les données des leçons
    const { lessons, loading, error, refetch } = useLessonsData(refreshTrigger);

    const {
        updateFormField,
        resetForm
    } = useFormUtils(initialFormData, setFormData);

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

    // ===========================
    // GESTION DES LEÇONS
    // ===========================

    const handleLessonSelection = useCallback((lessonIds) => {
        console.log('Leçons sélectionnées:', lessonIds);
        setSelectedLessonIds(lessonIds);
    }, []);

    const handleRefreshLessons = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // GESTION DU TOGGLE ACTIF
    // ===========================
    const [loadingActiveId, setLoadingActiveId] = useState(null);

    const handleToggleActive = useCallback(async (rowData) => {
        setLoadingActiveId(rowData.id);
        try {
            await updateLessonActiveStatus(rowData.id, !rowData.active);
            handleRefreshLessons();
        } catch (error) {
            // Optionnel: afficher une notification d'erreur
            console.error('Erreur lors du changement de statut:', error);
        } finally {
            setLoadingActiveId(null);
        }
    }, [handleRefreshLessons]);

    // Préparer les données pour injecter la fonction de toggle et l'état de chargement
    const lessonsWithToggle = (lessons || []).map(lesson => ({
        ...lesson,
        onToggleActive: handleToggleActive,
        loadingActive: loadingActiveId === lesson.id
    }));

    // ===========================
    // GESTION DU MODAL ET NAVIGATION
    // ===========================

    const handleTableAction = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            // Redirection vers l'écran de modification avec l'ID
            navigate(`/lesson/edit/${item.id}`);
            return;
        }

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            // Redirection vers l'écran de création
            navigate('/lesson/create');
            return;
        }

        // Pour les autres actions, continuer avec la logique du modal
        setModalState({
            isOpen: true,
            type: actionType,
            selectedLesson: item
        });
    }, [navigate]);

    const handleCloseModal = useCallback(() => {
        setModalState({
            isOpen: false,
            type: null,
            selectedLesson: null
        });
        resetForm();
    }, [resetForm]);

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer la leçon:', modalState.selectedLesson);
                    handleRefreshLessons();
                    break;

                case 'view':
                    console.log('Voir la leçon:', modalState.selectedLesson);
                    break;

                default:
                    console.log('Action non gérée:', modalState.type);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedLesson, handleCloseModal, handleRefreshLessons]);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================

    const handleCreateLesson = useCallback(() => {
        navigate('/lesson/create');
    }, [navigate]);

    // ===========================
    // EFFETS (useEffect)
    // ===========================

    // Chargement initial des données de référence (une seule fois)
    useEffect(() => {
        loadAllReferenceDataLocal();
    }, [loadAllReferenceDataLocal]);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                PANNEAU PRINCIPAL
                =========================== */}
            <div className="row mt-5">
                {/* ===========================
                    TABLEAU DES LEÇONS
                    =========================== */}
                <div className="col-lg-12">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={(e) => e.stopPropagation()}
                        style={{ width: "100%" }}
                    >
                        <DataTable
                            title="Liste des Leçons"
                            subtitle={`${lessons?.length || 0} leçon(s) disponible(s)`}
                            data={lessonsWithToggle}
                            loading={loading}
                            error={error}
                            columns={lessonsTableConfig.columns}
                            searchableFields={lessonsTableConfig.searchableFields}
                            filterConfigs={lessonsTableConfig.filterConfigs}
                            actions={lessonsTableConfig.actions}
                            onAction={handleTableAction}
                            onRefresh={handleRefreshLessons}
                            onCreateNew={handleCreateLesson}
                            defaultPageSize={10}
                            pageSizeOptions={[10, 20, 50]}
                            tableHeight={600}
                            enableRefresh={true}
                            enableCreate={true}
                            createButtonText="Nouvelle Leçon"
                            selectable={true}
                            selectedItems={selectedLessonIds}
                            onSelectionChange={handleLessonSelection}
                            rowKey="id"
                            customStyles={{
                                container: { backgroundColor: "#f8f9fa" },
                                panel: { minHeight: "600px" },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ===========================
                MODAL DE GESTION DES LEÇONS (pour actions autres que edit/create)
                =========================== */}
            <CourseModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
                referenceData={referenceData}
                formData={formData}
                updateFormField={updateFormField}
            />
        </>
    );
};

export default ListLessons;