import React, { useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';

// Import des fonctions externalisées
import DataTable from "../../DataTable";
import SeancesSaisiesModal from './SeancesSaisiesModal';
import { 
    useSeancesSaisiesData, 
    seancesSaisiesTableConfig,
    deleteSeance,
    clearSeancesSaisiesCache
} from './SeancesSaisiesServiceManager';
import { usePulsParams } from '../../hooks/useDynamicParams';

const ListeSeancesSaisies = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { ecoleId: dynamicEcoleId } = usePulsParams();

    // ===========================
    // ÉTAT DU MODAL
    // ===========================
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null,
        selectedQuestion: null
    });

    // ===========================
    // GESTION DU MODAL
    // ===========================
    const handleTableAction = useCallback((actionType, item) => {
        console.log('Action déclenchée:', actionType, 'Item:', item);
        setModalState({
            isOpen: true,
            type: actionType,
            selectedQuestion: item
        });
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalState({
            isOpen: false,
            type: null,
            selectedQuestion: null
        });
    }, []);

    // ===========================
    // DONNÉES DES SÉANCES SAISIES
    // ===========================
    const { seancesSaisies, loading, error, refetch } = useSeancesSaisiesData(refreshTrigger);

    // ===========================
    // GESTION DES ACTIONS DU TABLEAU
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action reçue:', actionType, 'Item:', item);

        // Gestion des actions qui nécessitent un modal
        if (actionType === 'create') {
            console.log('Ouverture du modal de création');
            handleTableAction('create', null);
            return;
        }

        if (actionType === 'edit' && item) {
            console.log('Ouverture du modal de modification pour:', item);
            handleTableAction('edit', item);
            return;
        }

        if (actionType === 'view' && item) {
            console.log('Ouverture du modal de visualisation pour:', item);
            handleTableAction('view', item);
            return;
        }

        // Gestion de la suppression directe
        if (actionType === 'delete' && item && item.id) {
            handleDeleteSeance(item);
            return;
        }

        console.warn('Action non gérée:', actionType);
    }, [handleTableAction]);

    // ===========================
    // GESTION DE LA SUPPRESSION
    // ===========================

    const handleDeleteSeance = async (seance) => {
        const result = await Swal.fire({
            title: 'Confirmer la suppression',
            html: `
                <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <div style="width: 40px; height: 40px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
                                ⚠️
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #1f2937; font-size: 16px;">
                                    Suppression de séance
                                </div>
                                <div style="color: #6b7280; font-size: 14px;">
                                    Cette action est irréversible
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                        <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">Détails de la séance :</div>
                        <div style="color: #6b7280; line-height: 1.6;">
                            <strong>Classe :</strong> ${seance.classe}<br>
                            <strong>Date :</strong> ${new Date(seance.dateSeance).toLocaleDateString('fr-FR')}<br>
                            <strong>Horaires :</strong> ${seance.creneauHoraire}<br>
                            <strong>Matière :</strong> ${seance.matiere}<br>
                            <strong>Type :</strong> ${seance.typeActivite}<br>
                            <strong>Professeur :</strong> ${seance.professeur}
                        </div>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            reverseButtons: true,
            width: '500px',
            customClass: {
                popup: 'swal-custom-popup'
            }
        });

        if (!result.isConfirmed) return;

        try {
            await deleteSeance(seance.id);
            
            await Swal.fire({
                icon: 'success',
                title: 'Séance supprimée !',
                text: 'La séance a été supprimée avec succès.',
                confirmButtonColor: '#10b981',
                timer: 3000,
                showConfirmButton: true
            });

            // Actualiser les données
            setRefreshTrigger(prev => prev + 1);
            
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            
            let errorMessage = 'Une erreur est survenue lors de la suppression.';
            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = 'Séance non trouvée.';
                } else if (error.response.status === 409) {
                    errorMessage = 'Impossible de supprimer cette séance car elle est liée à d\'autres données.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                }
            } else if (error.request) {
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            }

            await Swal.fire({
                icon: 'error',
                title: 'Erreur de suppression',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });
        }
    };

    // ===========================
    // GESTION DU MODAL
    // ===========================

    const handleModalSave = useCallback(async (savedData) => {
        try {
            console.log('Séance sauvegardée:', savedData);
            
            // Actualiser les données après la sauvegarde
            setRefreshTrigger(prev => prev + 1);
            
            // Vider le cache pour forcer un refresh complet
            clearSeancesSaisiesCache();
            
        } catch (error) {
            console.error('Erreur lors de la mise à jour des données:', error);
        }
    }, []);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================

    const handleCreateSeance = useCallback(() => {
        handleTableAction('create', null);
    }, [handleTableAction]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================

    const handleRefresh = useCallback(() => {
        clearSeancesSaisiesCache();
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // CONFIGURATION DE L'AFFICHAGE
    // ===========================

    const getSubtitle = () => {
        const count = seancesSaisies.length;
        if (count === 0) return "Aucune séance saisie";
        if (count === 1) return "1 séance saisie";
        return `${count} séances saisies`;
    };

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                TABLEAU DES SÉANCES SAISIES
                =========================== */}
            <div className="row mt-5">
                <div className="col-lg-12">
                    <DataTable
                        title="Liste des séances saisies"
                        subtitle={getSubtitle()}
                        data={seancesSaisies}
                        loading={loading}
                        error={error}
                        columns={seancesSaisiesTableConfig.columns}
                        searchableFields={seancesSaisiesTableConfig.searchableFields}
                        filterConfigs={seancesSaisiesTableConfig.filterConfigs}
                        actions={seancesSaisiesTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleCreateSeance}
                        defaultPageSize={15}
                        pageSizeOptions={[10, 15, 25, 50]}
                        tableHeight={650}
                        enableRefresh={true}
                        enableCreate={true}
                        createButtonText="Nouvelle Séance"
                        selectable={true}
                        rowKey="id"
                        customStyles={{
                            container: { 
                                backgroundColor: "#f8f9fa",
                                borderRadius: "12px",
                                padding: "20px"
                            },
                            panel: { 
                                minHeight: "650px",
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            },
                        }}
                        noDataMessage="Aucune séance trouvée"
                        errorMessage="Erreur lors du chargement des séances saisies"
                    />
                </div>
            </div>

            {/* ===========================
                MODAL DE GESTION DES SÉANCES
                =========================== */}
            <SeancesSaisiesModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
            />
        </>
    );
};

export default ListeSeancesSaisies;