import React, { useState, useCallback, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCoursesData } from './courseService'; // Import du nouveau hook
import { loadAllReferenceData } from '../../services/referenceDataService';
import { useFormUtils, initialReferenceData } from '../utils/formUtils';
import { coursesTableConfig } from '../config/tableConfigs';
import CourseModal from '../modal/CourseModal'; // Modal pour les cours
import DataTable from "../../DataTable";

const ListCourses = () => {
    // ===========================
    // ÉTATS - DONNÉES DE RÉFÉRENCE
    // ===========================
    const [referenceData, setReferenceData] = useState(initialReferenceData);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ===========================
    // ÉTATS - SÉLECTIONS ET MODAL
    // ===========================
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null, // 'create', 'edit', 'delete', 'view'
        selectedCourse: null
    });

    // ===========================
    // ÉTATS - FORMULAIRE
    // ===========================
    const initialFormData = {
        title: "",
        description: "",
        instructor_name: "",
        domain_id: null,
        education_level_id: null,
        is_premium: 0,
        active: 1,
        estimated_duration: 0,
        price: 0,
        color: "#3498db",
    };

    const [formData, setFormData] = useState(initialFormData);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    
    // Hook pour récupérer les données des cours
    const { courses, loading, error, refetch } = useCoursesData(refreshTrigger);

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
    // GESTION DES COURS
    // ===========================
    
    const handleCourseSelection = useCallback((courseIds) => {
        console.log('Cours sélectionnés:', courseIds);
        setSelectedCourseIds(courseIds);
    }, []);

    const handleRefreshCourses = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // GESTION DU MODAL
    // ===========================
    
    const handleTableAction = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);
        setModalState({
            isOpen: true,
            type: actionType,
            selectedCourse: item
        });
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalState({
            isOpen: false,
            type: null,
            selectedCourse: null
        });
        resetForm();
    }, [resetForm]);

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'edit':
                    console.log('Modifier le cours:', modalState.selectedCourse);
                    break;

                case 'delete':
                    console.log('Supprimer le cours:', modalState.selectedCourse);
                    handleRefreshCourses();
                    break;

                case 'create':
                    console.log('Créer un nouveau cours');
                    handleRefreshCourses();
                    break;

                case 'view':
                    console.log('Voir le cours:', modalState.selectedCourse);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedCourse, handleCloseModal, handleRefreshCourses]);

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
                    TABLEAU DES COURS
                    =========================== */}
                <div className="col-lg-12">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={(e) => e.stopPropagation()}
                        style={{ width: "100%" }}
                    >
                        <DataTable
                            title="Liste des Cours"
                            subtitle={`${courses?.length || 0} cours disponible(s)`}
                            data={courses || []}
                            loading={loading}
                            error={error}
                            columns={coursesTableConfig.columns}
                            searchableFields={coursesTableConfig.searchableFields}
                            filterConfigs={coursesTableConfig.filterConfigs}
                            actions={coursesTableConfig.actions}
                            onAction={handleTableAction}
                            onRefresh={handleRefreshCourses}
                            defaultPageSize={10}
                            pageSizeOptions={[10, 20, 50]}
                            tableHeight={600}
                            enableRefresh={true}
                            enableCreate={true}
                            createButtonText="Nouveau Cours"
                            selectable={true}
                            selectedItems={selectedCourseIds}
                            onSelectionChange={handleCourseSelection}
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
                MODAL DE GESTION DES COURS
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

export default ListCourses;