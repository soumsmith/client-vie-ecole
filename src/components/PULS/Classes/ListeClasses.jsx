import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Notification } from 'rsuite';
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import QuestionModal from '../Panier/QuestionModal';
import ClassModal from './ClassModal.jsx'; // Modal unifié
import DataTable from "../../DataTable";
import { useClassesData, classesTableConfig, clearClassesCache } from './ClasseServiceManager';

const ListeClasses = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [classModalVisible, setClassModalVisible] = useState(false);
    const [selectedClassForEdit, setSelectedClassForEdit] = useState(null);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    // ===========================
    // DONNÉES DES CLASSES
    // ===========================
    const { classes, loading, error, refetch } = useClassesData(refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            setSelectedClassForEdit(item);
            setClassModalVisible(true);
            return;
        }

        // Gestion spécifique pour l'action "créer" - ouvrir le modal
        if (actionType === 'create') {
            setSelectedClassForEdit(null); // Important: null pour mode création
            setClassModalVisible(true);
            return;
        }

        handleTableAction(actionType, item);
    }, [handleTableAction]);

    // ===========================
    // GESTION DU MODAL UNIFIÉ
    // ===========================

    const handleClassModalSuccess = useCallback((classData) => {
        // Vider le cache pour forcer le rechargement
        clearClassesCache();

        // Actualiser les données
        setRefreshTrigger(prev => prev + 1);

        // Réinitialiser la sélection
        setSelectedClassForEdit(null);
    }, []);

    const handleClassModalClose = useCallback(() => {
        setClassModalVisible(false);
        setSelectedClassForEdit(null);
    }, []);

    // ===========================
    // GESTION DU MODAL DE SUPPRESSION/VISUALISATION
    // ===========================

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer la classe:', modalState.selectedQuestion);
                    // Ici tu peux ajouter la logique de suppression
                    // await deleteClasse(modalState.selectedQuestion.id);

                    // Vider le cache
                    clearClassesCache();

                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
                    break;

                default:
                    console.log('Action non gérée:', modalState.type);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);

            // Notification d'erreur
            Notification.error({
                title: 'Erreur',
                description: error.message || 'Une erreur est survenue lors de l\'opération.',
                placement: 'topEnd',
                duration: 5000,
            });
        }
    }, [modalState.type, modalState.selectedQuestion, handleCloseModal]);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================

    const handleCreateClasse = useCallback(() => {
        setSelectedClassForEdit(null); // null = mode création
        setClassModalVisible(true);
    }, []);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================

    const handleRefresh = useCallback(() => {
        // Vider le cache pour forcer le rechargement depuis l'API
        clearClassesCache();
        setRefreshTrigger(prev => prev + 1);

        // Notification de rafraîchissement
        Notification.info({
            title: 'Données actualisées',
            description: 'La liste des classes a été mise à jour.',
            placement: 'topEnd',
            duration: 2000,
        });
    }, []);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                TABLEAU DES CLASSES
                =========================== */}
            <div className="row mt-5">
                <div className="col-lg-12">
                    <DataTable
                        title="Liste des Classes"
                        subtitle={`classe(s) disponible(s)`}
                        data={classes}
                        loading={loading}
                        error={error}
                        columns={classesTableConfig.columns}
                        searchableFields={classesTableConfig.searchableFields}
                        filterConfigs={classesTableConfig.filterConfigs}
                        actions={classesTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleCreateClasse}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        tableHeight={600}
                        enableRefresh={true}
                        enableCreate={true}
                        createButtonText="Nouvelle Classe"
                        selectable={false}
                        rowKey="id"
                        customStyles={{
                            container: { backgroundColor: "#f8f9fa" },
                            panel: { minHeight: "600px" },
                        }}
                    />
                </div>
            </div>

            {/* ===========================
                MODAL UNIFIÉ (Création ET Modification)
                =========================== */}
            <ClassModal
                visible={classModalVisible}
                onClose={handleClassModalClose}
                onSuccess={handleClassModalSuccess}
                selectedClass={selectedClassForEdit}
            />

            {/* ===========================
                MODAL DE GESTION DES CLASSES (Suppression/Visualisation)
                =========================== */}
            <QuestionModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
            />
        </>
    );
};

export default ListeClasses;