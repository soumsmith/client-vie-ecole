import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Ajout de useNavigate
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useQuizData } from './quizzService'; // Import du nouveau hook
import { loadAllReferenceData } from '../../services/referenceDataService';
import { useFormUtils, initialReferenceData } from '../utils/formUtils';
import { quizTableConfig } from './quizzService';
import CourseModal from '../modal/CourseModal'; // Modal pour les cours
import DataTable from "../../DataTable";

const ListQuiz = () => {
    const navigate = useNavigate(); // Hook pour la navigation
    
    // ===========================
    // ÉTATS - DONNÉES DE RÉFÉRENCE
    // ===========================
    const [referenceData, setReferenceData] = useState(initialReferenceData);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ===========================
    // ÉTATS - SÉLECTIONS ET MODAL
    // ===========================
    const [selectedQuizIds, setSelectedQuizIds] = useState([]);
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null, // 'create', 'edit', 'delete', 'view'
        selectedQuiz: null
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
        lesson_id: null,
        difficulty_id: null,
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
    
    // Hook pour récupérer les données des quiz
    const { quizzes, loading, error, refetch } = useQuizData(refreshTrigger);

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
    // GESTION DES QUIZ
    // ===========================
    
    const handleQuizSelection = useCallback((quizIds) => {
        console.log('Quiz sélectionnés:', quizIds);
        setSelectedQuizIds(quizIds);
    }, []);

    const handleRefreshQuizzes = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // GESTION DU MODAL ET NAVIGATION
    // ===========================
    
    const handleTableAction = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);
        
        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            // Redirection vers l'écran de modification avec l'ID
            navigate(`/quiz/edit/${item.id}`);
            return;
        }
        
        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            // Redirection vers l'écran de création
            navigate('/quiz/create');
            return;
        }
        
        // Pour les autres actions, continuer avec la logique du modal
        setModalState({
            isOpen: true,
            type: actionType,
            selectedQuiz: item
        });
    }, [navigate]);

    const handleCloseModal = useCallback(() => {
        setModalState({
            isOpen: false,
            type: null,
            selectedQuiz: null
        });
        resetForm();
    }, [resetForm]);

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer le quiz:', modalState.selectedQuiz);
                    handleRefreshQuizzes();
                    break;

                case 'view':
                    console.log('Voir le quiz:', modalState.selectedQuiz);
                    break;
                    
                default:
                    console.log('Action non gérée:', modalState.type);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedQuiz, handleCloseModal, handleRefreshQuizzes]);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================
    
    const handleCreateQuiz = useCallback(() => {
        navigate('/quiz/create');
    }, [navigate]);

    // ===========================
    // EFFETS (useEffect)
    // ===========================

    // Chargement initial des données de référence (une seule fois)
    useEffect(() => {
        loadAllReferenceDataLocal();
    }, []); // Pas de dépendances pour éviter la boucle

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
                    TABLEAU DES QUIZ
                    =========================== */}
                <div className="col-lg-12">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={(e) => e.stopPropagation()}
                        style={{ width: "100%" }}
                    >
                        <DataTable
                            title="Liste des Quiz"
                            subtitle={`${quizzes?.length || 0} quiz disponible(s)`}
                            data={quizzes || []}
                            loading={loading}
                            error={error}
                            columns={quizTableConfig.columns}
                            searchableFields={quizTableConfig.searchableFields}
                            filterConfigs={quizTableConfig.filterConfigs}
                            actions={quizTableConfig.actions}
                            onAction={handleTableAction}
                            onRefresh={handleRefreshQuizzes}
                            onCreateNew={handleCreateQuiz} // Nouveau prop pour gérer la création
                            defaultPageSize={10}
                            pageSizeOptions={[10, 20, 50]}
                            tableHeight={600}
                            enableRefresh={true}
                            enableCreate={true}
                            createButtonText="Nouveau Quiz"
                            selectable={true}
                            selectedItems={selectedQuizIds}
                            onSelectionChange={handleQuizSelection}
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
                MODAL DE GESTION DES QUIZ (pour actions autres que edit/create)
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

export default ListQuiz;