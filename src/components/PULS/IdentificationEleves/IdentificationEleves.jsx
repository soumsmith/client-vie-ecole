import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Notification } from 'rsuite';
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import QuestionModal from '../Panier/QuestionModal';
import CreateEleveModal from './CreateEleveModal';
import DataTable from "../../DataTable";
import { 
    useElevesData, 
    useAnneeData,
    elevesTableConfig, 
    clearElevesCache 
} from './EleveServiceManager';

const IdentificationEleves = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editingEleve, setEditingEleve] = useState(null);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    // ===========================
    // DONNÉES DE BASE
    // ===========================
    const { annee, loading: anneeLoading } = useAnneeData();
    const { eleves, loading, error, refetch } = useElevesData(
        'EN_ATTENTE', // statut
        'INSCRIPTION', // typeInscription
        refreshTrigger
    );

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            setEditingEleve(item);
            setCreateModalVisible(true);
            return;
        }

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            setEditingEleve(null);
            setCreateModalVisible(true);
            return;
        }

        // Pour les autres actions (delete, view, etc.), utiliser le modal existant
        handleTableAction(actionType, item);
    }, [handleTableAction]);

    // ===========================
    // GESTION DU MODAL DE CRÉATION/MODIFICATION
    // ===========================

    const handleCreateSuccess = useCallback((newEleve) => {
        // Vider le cache pour forcer le rechargement
        clearElevesCache();
        
        // Actualiser les données
        setRefreshTrigger(prev => prev + 1);
        
        // Afficher une notification de succès
        const actionText = editingEleve ? 'modifié' : 'créé';
        Notification.success({
            title: `Élève ${actionText} avec succès`,
            description: `L'élève "${newEleve.nom} ${newEleve.prenom}" a été ${actionText} avec succès.`,
            placement: 'topEnd',
            duration: 4500,
        });
    }, [editingEleve]);

    const handleCreateModalClose = useCallback(() => {
        setCreateModalVisible(false);
        setEditingEleve(null);
    }, []);

    // ===========================
    // GESTION DU MODAL DE SUPPRESSION/VISUALISATION
    // ===========================

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer l\'élève:', modalState.selectedQuestion);
                    // Ici tu peux ajouter la logique de suppression
                    // await deleteEleve(modalState.selectedQuestion.id);

                    // Vider le cache
                    clearElevesCache();
                    
                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
                    
                    // Notification de succès
                    Notification.success({
                        title: 'Élève supprimé',
                        description: 'L\'élève a été supprimé avec succès.',
                        placement: 'topEnd',
                        duration: 3000,
                    });
                    break;

                case 'view':
                    console.log('Voir l\'élève:', modalState.selectedQuestion);
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

    const handleCreateEleve = useCallback(() => {
        setEditingEleve(null);
        setCreateModalVisible(true);
    }, []);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================

    const handleRefresh = useCallback(() => {
        // Vider le cache pour forcer le rechargement depuis l'API
        clearElevesCache();
        setRefreshTrigger(prev => prev + 1);
        
        // Notification de rafraîchissement
        Notification.info({
            title: 'Données actualisées',
            description: 'La liste des élèves a été mise à jour.',
            placement: 'topEnd',
            duration: 2000,
        });
    }, []);

    // ===========================
    // CALCUL DU SOUS-TITRE DYNAMIQUE
    // ===========================
    const getSubtitle = () => {
        const count = eleves.length;
        const pluriel = count > 1 ? 's' : '';
        return `${count} élève${pluriel} inscrit${pluriel}`;
    };

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    if (anneeLoading) {
        return (
            <div className="row mt-5">
                <div className="col-lg-12 text-center">
                    <div style={{ padding: '50px' }}>
                        <div>Chargement de l'année scolaire...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ===========================
                EN-TÊTE AVEC INFORMATIONS DE L'ANNÉE
                =========================== */}
            {annee && (
                <div className="row mt-3">
                    <div className="col-lg-12">
                        <div style={{ 
                            backgroundColor: '#f8f9fa',
                            padding: '15px 20px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid #dee2e6'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h5 style={{ margin: 0, color: '#495057' }}>
                                        Identification des Élèves - {annee.customLibelle || annee.libelle}
                                    </h5>
                                    <small style={{ color: '#6c757d' }}>
                                        Gestion des inscriptions en attente
                                    </small>
                                </div>
                                <div style={{ 
                                    backgroundColor: '#007bff', 
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    ANNÉE ACTIVE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===========================
                TABLEAU DES ÉLÈVES
                =========================== */}
            <div className="row">
                <div className="col-lg-12">
                    <DataTable
                        title="Liste des Élèves"
                        subtitle={getSubtitle()}
                        data={eleves}
                        loading={loading}
                        error={error}
                        columns={elevesTableConfig.columns}
                        searchableFields={elevesTableConfig.searchableFields}
                        filterConfigs={elevesTableConfig.filterConfigs}
                        actions={elevesTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleCreateEleve}
                        defaultPageSize={15}
                        pageSizeOptions={[10, 15, 25, 50]}
                        tableHeight={650}
                        enableRefresh={true}
                        enableCreate={true}
                        createButtonText="Nouvel Élève"
                        selectable={false}
                        rowKey="id"
                        customStyles={{
                            container: { backgroundColor: "#f8f9fa" },
                            panel: { minHeight: "650px" },
                        }}
                        // Personnalisation pour les élèves
                        emptyMessage="Aucun élève trouvé pour cette année scolaire"
                        noDataImage="/images/empty-students.svg"
                    />
                </div>
            </div>

            {/* ===========================
                MODAL DE CRÉATION/MODIFICATION D'ÉLÈVE
                =========================== */}
            <CreateEleveModal
                visible={createModalVisible}
                onClose={handleCreateModalClose}
                onSuccess={handleCreateSuccess}
                editingEleve={editingEleve}
            />

            {/* ===========================
                MODAL DE GESTION DES ÉLÈVES (Suppression/Visualisation)
                =========================== */}
            <QuestionModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
            />
        </>
    );
};

export default IdentificationEleves;