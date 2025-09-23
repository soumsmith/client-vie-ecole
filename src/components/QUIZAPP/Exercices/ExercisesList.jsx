import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Ajout de useNavigate
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useExercisesData } from './exerciceService';
import { loadAllReferenceData } from '../../services/referenceDataService';
import { useFormUtils, initialReferenceData } from '../utils/formUtils';
import { exercisesTableConfig } from '../config/tableConfigs';
import ExerciseModal from '../modal/ExerciseModal';
import DataTable from "../../DataTable";

const ExercisesList = () => {
    const navigate = useNavigate(); // Hook pour la navigation
    
    // ===========================
    // ÉTATS - DONNÉES DE RÉFÉRENCE
    // ===========================
    const [referenceData, setReferenceData] = useState(initialReferenceData);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ===========================
    // ÉTATS - SÉLECTIONS ET MODAL
    // ===========================
    const [selectedExerciseIds, setSelectedExerciseIds] = useState([]);
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null,
        selectedExercise: null
    });

    // ===========================
    // ÉTATS - FORMULAIRE
    // ===========================
    const initialFormData = {
        title: "",
        description: "",
        exercise_type: "text",
        points: 10,
        estimated_duration: 30,
        is_mandatory: true,
        is_interactive: false,
        difficulty_id: null,
        author_name: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    
    const { exercices, loading, error, refetch } = useExercisesData(refreshTrigger);

    console.log("exercices=======>++++++>>>");
    console.log(exercices);

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
    // GESTION DES EXERCICES
    // ===========================
    
    const handleExerciseSelection = useCallback((exerciseIds) => {
        console.log('Exercices sélectionnés:', exerciseIds);
        setSelectedExerciseIds(exerciseIds);
    }, []);

    const handleRefreshExercises = useCallback(() => {
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
            navigate(`/exercises/edit/${item.id}`);
            return;
        }
        
        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            // Redirection vers l'écran de création
            navigate('/exercises/create');
            return;
        }
        
        // Pour les autres actions, continuer avec la logique du modal
        setModalState({
            isOpen: true,
            type: actionType,
            selectedExercise: item
        });
    }, [navigate]);

    const handleCloseModal = useCallback(() => {
        setModalState({
            isOpen: false,
            type: null,
            selectedExercise: null
        });
        resetForm();
    }, [resetForm]);

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer l\'exercice:', modalState.selectedExercise);
                    handleRefreshExercises();
                    break;

                case 'view':
                    console.log('Voir l\'exercice:', modalState.selectedExercise);
                    break;
                    
                default:
                    console.log('Action non gérée:', modalState.type);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedExercise, handleCloseModal, handleRefreshExercises]);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================
    
    const handleCreateExercise = useCallback(() => {
        navigate('/exercises/create');
    }, [navigate]);

    // ===========================
    // EFFETS (useEffect)
    // ===========================

    useEffect(() => {
        loadAllReferenceDataLocal();
    }, []);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            <div className="row mt-5">
                <div className="col-lg-12">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={(e) => e.stopPropagation()}
                        style={{ width: "100%" }}
                    >
                        <DataTable
                            title="Gestion des Exercices"
                            subtitle={`${exercices?.length || 0} exercice(s) disponible(s)`}
                            data={exercices || []}
                            loading={loading}
                            error={error}
                            columns={exercisesTableConfig.columns}
                            searchableFields={exercisesTableConfig.searchableFields}
                            filterConfigs={exercisesTableConfig.filterConfigs}
                            actions={exercisesTableConfig.actions}
                            onAction={handleTableAction}
                            onRefresh={handleRefreshExercises}
                            onCreateNew={handleCreateExercise} // Nouveau prop pour gérer la création
                            defaultPageSize={10}
                            pageSizeOptions={[10, 20, 50]}
                            tableHeight={600}
                            enableRefresh={true}
                            enableCreate={true}
                            createButtonText="Nouvel Exercice"
                            selectable={true}
                            selectedItems={selectedExerciseIds}
                            onSelectionChange={handleExerciseSelection}
                            rowKey="id"
                            customStyles={{
                                container: { backgroundColor: "#f8f9fa" },
                                panel: { minHeight: "600px" },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal pour les actions qui ne nécessitent pas de redirection */}
            <ExerciseModal
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

export default ExercisesList;