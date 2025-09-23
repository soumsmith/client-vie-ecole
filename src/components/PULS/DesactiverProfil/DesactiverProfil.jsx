import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import ProfilModal from './ProfilModal';
import DataTable from "../../DataTable";
import { usePersonnelData, personnelTableConfig } from './PersonnelServiceManager';

const DesactiverProfil = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    // ===========================
    // DONNÉES DU PERSONNEL
    // ===========================
    const { personnel, loading, error, refetch } = usePersonnelData(refreshTrigger);

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
            navigate(`/personnel/view/${item.id}`);
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
                case 'edit':
                    console.log('Modifier le profil du personnel:', modalState.selectedQuestion);
                    console.log('Données du formulaire:', formData);
                    
                    // Ici tu peux ajouter la logique de mise à jour du profil
                    // await updatePersonnelProfil(modalState.selectedQuestion.id, formData);

                    // Actualiser les données après modification
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir les détails du personnel:', modalState.selectedQuestion);
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
                TABLEAU DU PERSONNEL
                =========================== */}
            <div className="row mt-5">
                <div className="col-lg-12">
                    <DataTable
                        title="Désactiver le profil d'un utilisateur"
                        subtitle={`Liste du personnel - ${personnel.length} personnel(s) disponible(s)`}
                        data={personnel}
                        loading={loading}
                        error={error}
                        columns={personnelTableConfig.columns}
                        searchableFields={personnelTableConfig.searchableFields}
                        filterConfigs={personnelTableConfig.filterConfigs}
                        actions={personnelTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        tableHeight={600}
                        enableRefresh={true}
                        enableCreate={false}
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
                MODAL DE GESTION DU PROFIL
                =========================== */}
            <ProfilModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
            />
        </>
    );
};

export default DesactiverProfil;