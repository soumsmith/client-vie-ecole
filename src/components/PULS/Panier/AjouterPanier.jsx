import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import PersonnelDetailsModal from './PersonnelDetailsModal'; // Nouveau modal
import DataTable from "../../DataTable";
import { usePersonnelData, personnelTableConfig } from './PanierServiceManager';

const AjouterPanier = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // État pour le modal de détails personnel
    const [personnelModal, setPersonnelModal] = useState({
        open: false,
        selectedPersonnel: null
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
    // DONNÉES DES QUESTIONS
    // ===========================
    const { personnel, loading, error, refetch } = usePersonnelData('VALIDEE',refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "modifier" - ouvrir le modal de détails
        if (actionType === 'edit' && item && item.id) {
            setPersonnelModal({
                open: true,
                selectedPersonnel: item
            });
            return;
        }

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            navigate('/questions/create');
            return;
        }

        // Pour les autres actions (delete, view, etc.), utiliser le modal existant
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU MODAL PERSONNEL
    // ===========================

    const handleClosePersonnelModal = useCallback(() => {
        setPersonnelModal({
            open: false,
            selectedPersonnel: null
        });
    }, []);

    const handleSavePersonnelModal = useCallback(async (data) => {
        try {
            console.log('Données à sauvegarder:', data);
            
            // Ici vous pouvez ajouter la logique pour :
            // 1. Ajouter le personnel au panier sélectionné
            // 2. Envoyer les données à votre API
            // Exemple :
            // await addPersonnelToPanier(data.personnel.id, data.panier);

            // Notification de succès (vous pouvez utiliser une notification library)
            // alert(`${data.personnel.nom_complet} a été ajouté au panier ${data.panier}`);

            // Actualiser les données si nécessaire
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Erreur lors de l\'ajout au panier:', error);
            alert('Erreur lors de l\'ajout au panier');
        }
    }, []);

    // ===========================
    // GESTION DU MODAL EXISTANT (pour les autres actions)
    // ===========================

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer le personnel:', modalState.selectedQuestion);
                    // Ici tu peux ajouter la logique de suppression
                    // await deletePersonnel(modalState.selectedQuestion.id);

                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir le personnel:', modalState.selectedQuestion);
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

    const handleCreateQuestion = useCallback(() => {
        navigate('/questions/create');
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
                TABLEAU DES QUESTIONS
                =========================== */}
            <div className="row mt-5">
                <div className="col-lg-12">
                    <DataTable
                        title="Liste du personnel validé par GAIN SARL"
                        subtitle={`${personnel.length} personnel(s) disponible(s)`}
                        data={personnel}
                        loading={loading}
                        error={error}
                        columns={personnelTableConfig.columns}
                        searchableFields={personnelTableConfig.searchableFields}
                        filterConfigs={personnelTableConfig.filterConfigs}
                        actions={personnelTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleCreateQuestion}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        tableHeight={600}
                        enableRefresh={true}
                        enableCreate={false}
                        createButtonText="Nouvelle Question"
                        selectable={false} // Désactivé car on n'utilise plus la sélection multiple
                        rowKey="id"
                        customStyles={{
                            container: { backgroundColor: "#f8f9fa" },
                            panel: { minHeight: "600px" },
                        }}
                    />
                </div>
            </div>

            {/* ===========================
                MODAL DE DÉTAILS PERSONNEL
                =========================== */}
            <PersonnelDetailsModal
                open={personnelModal.open}
                onClose={handleClosePersonnelModal}
                personnelData={personnelModal.selectedPersonnel}
                onSave={handleSavePersonnelModal}
            />

            {/* ===========================
                MODAL DE GESTION DES AUTRES ACTIONS (si nécessaire)
                =========================== */}
            {modalState.isOpen && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {modalState.type === 'delete' ? 'Confirmer la suppression' : 'Détails'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {modalState.type === 'delete' && (
                                    <p>Êtes-vous sûr de vouloir supprimer ce personnel ?</p>
                                )}
                                {modalState.selectedQuestion && (
                                    <p>Personnel : {modalState.selectedQuestion.nom_complet}</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={handleCloseModal}
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={handleModalSave}
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AjouterPanier;