import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import Swal from 'sweetalert2';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import QuestionModal from '../Panier/QuestionModal';
import EditSalleModal from './EditSalleModal'; // Nouveau modal pour les salles
import DataTable from "../../DataTable";
import { useSallesData, sallesTableConfig } from './SalleServiceManager';
import { useAllApiUrls } from '../utils/apiConfig';

const ListeSalles = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const apiUrls = useAllApiUrls();

    // ===========================
    // ÉTAT DES SÉLECTIONS
    // ===========================
    const [selectedItems, setSelectedItems] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);

    // ===========================
    // ÉTAT DU MODAL DES SALLES
    // ===========================
    const [salleModal, setSalleModal] = useState({
        show: false,
        mode: 'edit', // 'edit' ou 'create'
        selectedSalle: null
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
    // DONNÉES DES SALLES
    // ===========================
    const { salles, loading, error, refetch } = useSallesData(refreshTrigger);

    // ===========================
    // GESTION DES SÉLECTIONS
    // ===========================

    const handleSelectionChange = useCallback((selectedIds) => {
        setSelectedItems(selectedIds);
        setIsAllSelected(selectedIds.length === salles?.length && salles?.length > 0);
    }, [salles?.length]);

    const handleSelectAll = useCallback((checked) => {
        if (checked && salles) {
            const allIds = salles.map(salle => salle.id);
            setSelectedItems(allIds);
            setIsAllSelected(true);
        } else {
            setSelectedItems([]);
            setIsAllSelected(false);
        }
    }, [salles]);

    const clearSelection = useCallback(() => {
        setSelectedItems([]);
        setIsAllSelected(false);
    }, []);

    // ===========================
    // GESTION DU MODAL DES SALLES
    // ===========================

    const openSalleModal = useCallback((mode, salle = null) => {
        setSalleModal({
            show: true,
            mode,
            selectedSalle: salle
        });
    }, []);

    const closeSalleModal = useCallback(() => {
        setSalleModal({
            show: false,
            mode: 'edit',
            selectedSalle: null
        });
    }, []);

    const handleSalleModalSave = useCallback(async (data) => {
        try {
            console.log('Salle sauvegardée:', data);

            // Actualiser les données après sauvegarde
            setRefreshTrigger(prev => prev + 1);

            // Fermer le modal
            closeSalleModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [closeSalleModal]);

    // ===========================
    // GESTION DE LA SUPPRESSION UNITAIRE
    // ===========================

    const handleDeleteSalle = useCallback(async (salle) => {
        try {
            // Demande de confirmation
            const result = await Swal.fire({
                title: 'Confirmer la suppression',
                text: `Êtes-vous sûr de vouloir supprimer la salle "${salle.libelle}" ?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Oui, supprimer',
                cancelButtonText: 'Annuler',
                reverseButtons: true
            });

            if (!result.isConfirmed) {
                return;
            }

            // Affichage du loading pendant la suppression
            Swal.fire({
                title: 'Suppression en cours...',
                text: `Suppression de la salle "${salle.libelle}"`,
                icon: 'info',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Appel API pour supprimer
            const response = await axios.delete(apiUrls.salles.delete(salle.id));


            if (response.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Salle supprimée !',
                    text: `La salle "${salle.libelle}" a été supprimée avec succès.`,
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    showConfirmButton: true
                });

                // Actualiser les données et nettoyer les sélections
                setRefreshTrigger(prev => prev + 1);
                clearSelection();
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error('Erreur lors de la suppression de la salle:', error);

            let errorMessage = 'Une erreur inattendue est survenue lors de la suppression.';

            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Impossible de supprimer cette salle. Elle est peut-être utilisée ailleurs.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Non autorisé. Vérifiez vos permissions.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Salle non trouvée ou déjà supprimée.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                } else {
                    errorMessage = `Erreur serveur: ${error.response.status} - ${error.response.data?.message || 'Erreur inconnue'}`;
                }
            } else if (error.request) {
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'La requête a expiré. Le serveur met trop de temps à répondre.';
            }

            await Swal.fire({
                icon: 'error',
                title: 'Erreur de suppression',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });
        }
    }, [apiUrls.salles, clearSelection]);

    // ===========================
    // GESTION DE LA SUPPRESSION EN LOT
    // ===========================

    const handleDeleteSelected = useCallback(async () => {
        if (selectedItems.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Aucune sélection',
                text: 'Veuillez sélectionner au moins une salle à supprimer.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        // Récupérer les salles sélectionnées
        const selectedSalles = salles?.filter(salle => selectedItems.includes(salle.id)) || [];

        if (selectedSalles.length === 0) {
            return;
        }

        try {
            // Demande de confirmation
            const result = await Swal.fire({
                title: 'Confirmer la suppression en lot',
                html: `
                    <p>Êtes-vous sûr de vouloir supprimer les <strong>${selectedSalles.length}</strong> salle(s) suivante(s) ?</p>
                    <div style="max-height: 200px; overflow-y: auto; margin-top: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                        ${selectedSalles.map(salle => `<div>• ${salle.libelle}</div>`).join('')}
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: `Oui, supprimer ${selectedSalles.length} salle(s)`,
                cancelButtonText: 'Annuler',
                reverseButtons: true,
                customClass: {
                    popup: 'swal2-popup-large'
                }
            });

            if (!result.isConfirmed) {
                return;
            }

            // Affichage du loading pendant la suppression
            Swal.fire({
                title: 'Suppression en cours...',
                html: `Suppression de <strong>${selectedSalles.length}</strong> salle(s)...<br><small>Veuillez patienter</small>`,
                icon: 'info',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Supprimer les salles une par une (ou en lot selon votre API)
            const deletePromises = selectedSalles.map(salle =>
                axios.delete(apiUrls.salles.delete(salle.id), { timeout: 10000 })
            );

            // Attendre que toutes les suppressions soient terminées
            const responses = await Promise.allSettled(deletePromises);

            // Analyser les résultats
            const successes = responses.filter(result => result.status === 'fulfilled' && result.value.status === 200);
            const failures = responses.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && result.value.status !== 200));

            let message = '';
            let icon = 'success';

            if (successes.length === selectedSalles.length) {
                // Toutes les suppressions ont réussi
                message = `Les ${selectedSalles.length} salle(s) ont été supprimée(s) avec succès.`;
                icon = 'success';
            } else if (successes.length > 0) {
                // Succès partiel
                message = `${successes.length} sur ${selectedSalles.length} salle(s) ont été supprimée(s). ${failures.length} échec(s).`;
                icon = 'warning';
            } else {
                // Tous les échecs
                message = `Échec de la suppression. Aucune des ${selectedSalles.length} salle(s) n'a pu être supprimée.`;
                icon = 'error';
            }

            await Swal.fire({
                icon: icon,
                title: 'Résultat de la suppression',
                text: message,
                confirmButtonColor: icon === 'success' ? '#10b981' : (icon === 'warning' ? '#f59e0b' : '#ef4444'),
                timer: icon === 'success' ? 3000 : undefined,
                showConfirmButton: true
            });

            // Actualiser les données et nettoyer les sélections
            setRefreshTrigger(prev => prev + 1);
            clearSelection();

        } catch (error) {
            console.error('Erreur lors de la suppression en lot:', error);

            await Swal.fire({
                icon: 'error',
                title: 'Erreur de suppression',
                text: 'Une erreur inattendue est survenue lors de la suppression en lot.',
                confirmButtonColor: '#ef4444'
            });
        }
    }, [selectedItems, salles, apiUrls.salles, clearSelection]);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        switch (actionType) {
            case 'edit':
                // Ouvrir le modal en mode modification
                if (item && item.id) {
                    openSalleModal('edit', item);
                }
                break;

            case 'delete':
                // Supprimer la salle
                if (item && item.id) {
                    handleDeleteSalle(item);
                }
                break;

            case 'view':
                // Pour la visualisation, utiliser le modal existant ou naviguer
                if (item && item.id) {
                    console.log('Voir la salle:', item);
                    // Vous pouvez implémenter la visualisation ici
                }
                break;

            case 'create':
                // Ouvrir le modal en mode création
                openSalleModal('create', null);
                break;

            default:
                // Pour les autres actions, utiliser le modal par défaut
                handleTableAction(actionType, item);
                break;
        }
    }, [openSalleModal, handleDeleteSalle, handleTableAction]);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================

    const handleCreateSalle = useCallback(() => {
        openSalleModal('create', null);
    }, [openSalleModal]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
        clearSelection();
    }, [clearSelection]);

    // ===========================
    // GESTION DU MODAL EXISTANT (pour compatibilité)
    // ===========================

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer la salle (modal existant):', modalState.selectedQuestion);
                    // Cette logique pourrait être déplacée vers handleDeleteSalle
                    break;

                case 'view':
                    console.log('Voir la salle (modal existant):', modalState.selectedQuestion);
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
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                BARRE D'ACTIONS POUR LES SÉLECTIONS
                =========================== */}
            {selectedItems.length > 0 && (
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="card border-primary">
                            <div className="card-body py-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-check-circle text-primary me-2"></i>
                                        <span className="fw-bold text-primary">
                                            {selectedItems.length} salle(s) sélectionnée(s)
                                        </span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={handleDeleteSelected}
                                            title="Supprimer les salles sélectionnées"
                                        >
                                            <i className="fas fa-trash me-1"></i>
                                            Supprimer ({selectedItems.length})
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={clearSelection}
                                            title="Annuler la sélection"
                                        >
                                            <i className="fas fa-times me-1"></i>
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===========================
                TABLEAU DES SALLES
                =========================== */}
            <div className="row mt-3">
                <div className="col-lg-12">
                    <DataTable
                        title="Liste des Salles"
                        subtitle={`salle(s) disponible(s)`}
                        data={salles}
                        loading={loading}
                        error={error}
                        columns={sallesTableConfig.columns}
                        searchableFields={sallesTableConfig.searchableFields}
                        filterConfigs={sallesTableConfig.filterConfigs}
                        actions={sallesTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleCreateSalle}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        tableHeight={600}
                        enableRefresh={true}
                        enableCreate={true}
                        createButtonText="Nouvelle Salle"
                        selectable={true}
                        rowKey="id"
                        selectedItems={selectedItems}
                        isAllSelected={isAllSelected}
                        onSelectionChange={handleSelectionChange}
                        onSelectAll={handleSelectAll}
                        customStyles={{
                            container: { backgroundColor: "#f8f9fa" },
                            panel: { minHeight: "600px" },
                        }}
                    />
                </div>
            </div>

            {/* ===========================
                MODAL DE GESTION DES SALLES
                =========================== */}
            <EditSalleModal
                show={salleModal.show}
                salle={salleModal.selectedSalle}
                mode={salleModal.mode}
                onClose={closeSalleModal}
                onSave={handleSalleModalSave}
            />

            {/* ===========================
                MODAL EXISTANT (pour compatibilité)
                =========================== */}
            <QuestionModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
            />

            {/* ===========================
                STYLES PERSONNALISÉS
                =========================== */}
            <style jsx>{`
                .swal2-popup-large {
                    width: 600px !important;
                    max-width: 90vw !important;
                }
                
                .card.border-primary {
                    border-width: 2px !important;
                    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.1);
                }
                
                .btn-outline-danger:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
                }
                
                .btn-outline-secondary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(107, 114, 128, 0.2);
                }
            `}</style>
        </>
    );
};

export default ListeSalles;