import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import AnneesScolairesModal from './AnneesScolairesModal';
import DataTable from "../../DataTable";
import { useAnneesScolairesData, anneesScolairesTableConfig } from './AnneesScolairesServiceManager';

const AnneesScolaires = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ===========================
    // ÉTAT LOCAL DU MODAL
    // ===========================
    const [modalState, setModalState] = useState({
        open: false,
        type: null,
        selectedQuestion: null
    });

    // ===========================
    // GESTION DU MODAL
    // ===========================
    const handleTableAction = useCallback((actionType, item) => {
        setModalState({
            open: true,
            type: actionType,
            selectedQuestion: item
        });
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalState({
            open: false,
            type: null,
            selectedQuestion: null
        });
    }, []);

    // ===========================
    // DONNÉES DES ANNÉES SCOLAIRES
    // ===========================
    const { anneesScolaires, loading, error, refetch } = useAnneesScolairesData(refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "modifier" (ouvrir le modal)
        if (actionType === 'edit' && item && item.id) {
            handleTableAction(actionType, item);
            return;
        }

        // Gestion spécifique pour l'action "voir"
        if (actionType === 'view' && item && item.id) {
            navigate(`/annees-scolaires/view/${item.id}`);
            return;
        }

        // Gestion de la création
        if (actionType === 'create') {
            handleTableAction('create', {});
            return;
        }

        // Pour les autres actions, utiliser le modal
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU MODAL
    // ===========================

    const handleModalSave = useCallback(async (formData) => {
        try {
            switch (modalState.type) {
                case 'create':
                    console.log('Créer une nouvelle année scolaire:', formData);
                    
                    // Ici tu peux ajouter la logique de création
                    // await createAnneeScolaire(formData);

                    // Actualiser les données après création
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'edit':
                    console.log('Modifier l\'année scolaire:', modalState.selectedQuestion);
                    console.log('Données du formulaire:', formData);
                    
                    // Ici tu peux ajouter la logique de mise à jour
                    // await updateAnneeScolaire(modalState.selectedQuestion.id, formData);

                    // Actualiser les données après modification
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir les détails de l\'année scolaire:', modalState.selectedQuestion);
                    break;

                default:
                    console.log('Action non gérée:', modalState.type);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedQuestion, handleCloseModal]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                TABLEAU DES ANNÉES SCOLAIRES
                =========================== */}
            <div className="row mt-5">
                <div className="col-lg-12">
                    <DataTable
                        title="Liste des années scolaires"
                        subtitle={`Gestion des années scolaires - ${anneesScolaires.length} année(s) disponible(s)`}
                        data={anneesScolaires}
                        loading={loading}
                        error={error}
                        columns={anneesScolairesTableConfig.columns}
                        searchableFields={anneesScolairesTableConfig.searchableFields}
                        filterConfigs={anneesScolairesTableConfig.filterConfigs}
                        actions={anneesScolairesTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        tableHeight={600}
                        enableRefresh={true}
                        enableCreate={true}
                        createButtonText="Nouveau"
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
                MODAL DE GESTION DES ANNÉES SCOLAIRES
                =========================== */}
            <AnneesScolairesModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
            />
        </>
    );
};

export default AnneesScolaires;