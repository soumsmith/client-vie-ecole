import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import EditCandidatModal from './EditCandidatModal'; // Nouveau modal
import DataTable from "../../DataTable";
import { usePanierData, panierTableConfig } from './PanierServiceManager';

const MonPanier = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // État pour le modal d'édition
    const [editModal, setEditModal] = useState({
        show: false,
        candidat: null
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
    // DONNÉES DU PANIER
    // ===========================
    const { panierItems, loading, error, refetch } = usePanierData('EN_ATTENTE', refreshTrigger);

    // ===========================
    // GESTION DU MODAL D'ÉDITION
    // ===========================
    const handleShowEditModal = useCallback((candidat) => {
        setEditModal({
            show: true,
            candidat: candidat
        });
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setEditModal({
            show: false,
            candidat: null
        });
    }, []);

    const handleSaveEditModal = useCallback(async (data) => {
        try {
            console.log('Données à sauvegarder:', data);

            // Ici tu peux ajouter la logique pour envoyer l'email
            // await sendEmailToCandidat(data.candidat.id, data.emailData);

            // Fermer le modal
            handleCloseEditModal();

            // Optionnel: rafraîchir les données
            setRefreshTrigger(prev => prev + 1);

            // Optionnel: afficher une notification de succès
            console.log('Email envoyé avec succès à:', data.candidat.nomComplet);

        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
        }
    }, [handleCloseEditModal]);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "modifier" - Nouveau modal
        if (actionType === 'edit' && item && item.id) {
            handleShowEditModal(item);
            return;
        }

        // Gestion spécifique pour l'action "valider"
        if (actionType === 'validate' && item && item.id) {
            // Logique de validation directe ou via modal
            handleTableAction('validate', item);
            return;
        }

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            navigate('/panier/add');
            return;
        }

        // Pour les autres actions (delete, view, etc.), utiliser le modal existant
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction, handleShowEditModal]);

    // ===========================
    // GESTION DU MODAL EXISTANT
    // ===========================

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Retirer du panier:', modalState.selectedQuestion);
                    // Ici tu peux ajouter la logique de suppression du panier
                    // await removeFromPanier(modalState.selectedQuestion.id);

                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'validate':
                    console.log('Valider l\'agent:', modalState.selectedQuestion);
                    // Ici tu peux ajouter la logique de validation
                    // await validateAgent(modalState.selectedQuestion.id);

                    // Actualiser les données après validation
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir l\'agent du panier:', modalState.selectedQuestion);
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
    // GESTION DU BOUTON AJOUTER
    // ===========================

    const handleAddToPanier = useCallback(() => {
        navigate('/panier/add');
    }, [navigate]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // ACTIONS DE VALIDATION EN MASSE
    // ===========================

    const handleValidateAll = useCallback(async () => {
        try {
            console.log('Validation de tous les agents du panier');
            // Ici tu peux ajouter la logique de validation en masse
            // await validateAllAgents();

            // Actualiser les données après validation
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Erreur lors de la validation en masse:', error);
        }
    }, []);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                EN-TÊTE AVEC ACTIONS GLOBALES
                =========================== */}
            <div className="row mb-3">
                <div className="col-lg-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="mb-1">Mon Panier</h4>
                            <p className="text-muted mb-0">
                                Agents en attente de validation
                            </p>
                        </div>
                        {panierItems.length > 0 && (
                            <div>
                                <button
                                    className="btn btn-success me-2"
                                    onClick={handleValidateAll}
                                    disabled={loading}
                                >
                                    Valider tous les agents
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===========================
                TABLEAU DU PANIER
                =========================== */}
            <div className="row">
                <div className="col-lg-12">
                    <DataTable
                        title="Agents en Attente"
                        subtitle={`${panierItems.length} agent(s) dans votre panier`}
                        data={panierItems}
                        loading={loading}
                        error={error}
                        columns={panierTableConfig.columns}
                        searchableFields={panierTableConfig.searchableFields}
                        filterConfigs={panierTableConfig.filterConfigs}
                        actions={panierTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleAddToPanier}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        tableHeight={600}
                        enableRefresh={true}
                        enableCreate={false}
                        createButtonText="Ajouter au Panier"
                        selectable={false}
                        rowKey="id"
                        customStyles={{
                            container: { backgroundColor: "#f8f9fa" },
                            panel: { minHeight: "600px" },
                        }}
                        emptyStateMessage={
                            <div className="text-center py-5">
                                <h5 className="text-muted">Votre panier est vide</h5>
                                <p className="text-muted">Ajoutez des agents pour commencer la validation</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddToPanier}
                                >
                                    Ajouter des agents
                                </button>
                            </div>
                        }
                    />
                </div>
            </div>


            {/* ===========================
                MODAL D'ÉDITION CANDIDAT (nouveau)
                =========================== */}
            <EditCandidatModal
                show={editModal.show}
                candidat={editModal.candidat}
                onClose={handleCloseEditModal}
                onSave={handleSaveEditModal}
            />
        </>
    );
};

export default MonPanier;