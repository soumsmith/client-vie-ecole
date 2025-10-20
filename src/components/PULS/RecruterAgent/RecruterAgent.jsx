import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import QuestionModal from '../Panier/QuestionModal';
import EditAgentModal from './EditAgentModal'; // Import du nouveau modal
import DataTable from "../../DataTable";
import { useAgentsData, agentsTableConfig } from './AgentServiceManager';

const RecruterAgent = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // État pour le modal d'édition
    const [editModal, setEditModal] = useState({
        open: false,
        selectedAgent: null
    });

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    // ===========================
    // DONNÉES DES AGENTS
    // ===========================
    const { agents, loading, error, refetch } = useAgentsData("VALIDEE", refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            setEditModal({
                open: true,
                selectedAgent: item
            });
            return;
        }

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            navigate('/agents/create');
            return;
        }

        // Pour les autres actions (delete, view, etc.), utiliser le modal existant
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU MODAL D'ÉDITION
    // ===========================

    const handleCloseEditModal = useCallback(() => {
        setEditModal({
            open: false,
            selectedAgent: null
        });
    }, []);

    const handleSaveAgent = useCallback(async (updatedAgent) => {
        try {
            console.log('Sauvegarder l\'agent modifié:', updatedAgent);

            // Ici tu peux ajouter la logique pour sauvegarder les modifications
            //await updateAgent(updatedAgent.id, updatedAgent);

            // Actualiser les données après sauvegarde
            setRefreshTrigger(prev => prev + 1);

            // Optionnel : Afficher un message de succès
            console.log('Agent mis à jour avec succès');

        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'agent:', error);
            // Gérer l'erreur (afficher un toast, etc.)
        }
    }, []);

    // ===========================
    // GESTION DU MODAL EXISTANT (pour delete, view, etc.)
    // ===========================

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer l\'agent:', modalState.selectedQuestion);
                    // Ici tu peux ajouter la logique de suppression
                    // await deleteAgent(modalState.selectedQuestion.id);

                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir l\'agent:', modalState.selectedQuestion);
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
    // GESTION DU BOUTON CRÉER
    // ===========================

    const handleCreateAgent = useCallback(() => {
        navigate('/agents/create');
    }, [navigate]);

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
                TABLEAU DES AGENTS À RECRUTER
                =========================== */}
            <div className="row mt-5">
                <div className="col-lg-12">
                    <DataTable
                        title="Liste des Agents à Recruter"
                        subtitle={`agent(s) disponible(s)`}
                        data={agents}
                        loading={loading}
                        error={error}
                        columns={agentsTableConfig.columns}
                        searchableFields={agentsTableConfig.searchableFields}
                        filterConfigs={agentsTableConfig.filterConfigs}
                        actions={agentsTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleCreateAgent}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        tableHeight={600}
                        enableRefresh={true}
                        enableCreate={false}
                        createButtonText="Nouvel Agent"
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
                MODAL D'ÉDITION D'AGENT
                =========================== */}
            <EditAgentModal
                open={editModal.open}
                agent={editModal.selectedAgent}
                onClose={handleCloseEditModal}
                onSave={handleSaveAgent}
            />
        </>
    );
};

export default RecruterAgent;