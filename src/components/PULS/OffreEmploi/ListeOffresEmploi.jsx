import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import OffreCardGrid from './OffreCardGrid'; // ✅ NOUVEAU COMPOSANT
import CreateOffreModal from './CreateOffreModal';
import { useOffresData, offresTableConfig } from './OffreServiceManager';

const ListeOffresEmploi = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // ===========================
    // NOUVEL ÉTAT - MODE D'AFFICHAGE
    // ===========================
    const [viewMode, setViewMode] = useState('cards'); // 'table' ou 'cards'

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    // ===========================
    // DONNÉES DES OFFRES
    // ===========================
    const { offres, loading, error, refetch } = useOffresData(refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            navigate(`/offres/edit/${item.id}`);
            return;
        }

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            setShowCreateModal(true);
            return;
        }

        // Pour les autres actions (delete, view, etc.), utiliser le modal
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU MODAL PRINCIPAL
    // ===========================

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer l\'offre:', modalState.selectedQuestion);
                    // Ici tu peux ajouter la logique de suppression
                    // await deleteOffre(modalState.selectedQuestion.id);

                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir l\'offre:', modalState.selectedQuestion);
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
    // GESTION DU MODAL DE CRÉATION
    // ===========================

    const handleCreateOffre = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleSaveOffre = useCallback(async (offreData) => {
        try {
            console.log('Création d\'une nouvelle offre:', offreData);
            // Ici tu peux ajouter la logique de création
            // await createOffre(offreData);

            // Actualiser les données après création
            setRefreshTrigger(prev => prev + 1);
            setShowCreateModal(false);
        } catch (error) {
            console.error('Erreur lors de la création de l\'offre:', error);
        }
    }, []);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // PROPS COMMUNES POUR LES DEUX COMPOSANTS
    // ===========================
    const commonProps = {
        title: "Gestion des Offres d'Emploi",
        subtitle: `offre(s) disponible(s)`,
        data: offres,
        loading: loading,
        error: error,
        columns: offresTableConfig.columns,
        searchableFields: offresTableConfig.searchableFields,
        filterConfigs: offresTableConfig.filterConfigs,
        actions: offresTableConfig.actions,
        onAction: handleTableActionLocal,
        onRefresh: handleRefresh,
        onCreateNew: handleCreateOffre,
        defaultPageSize: viewMode === 'cards' ? 12 : 10, // Adapté pour les cartes
        pageSizeOptions: viewMode === 'cards' ? [8, 12, 20, 32] : [10, 20, 50],
        tableHeight: 600,
        enableRefresh: true,
        enableCreate: true,
        createButtonText: "Nouvelle Offre",
        selectable: false,
        rowKey: "id",
        customStyles: {
            container: { backgroundColor: "#f8f9fa" },
            panel: { minHeight: "600px" },
        }
    };

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                NOUVEAU - SÉLECTEUR DE MODE D'AFFICHAGE
                =========================== */}
            <div className="row mb-4">
                <div className="col-12">
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        padding: '16px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div>
                            <h5 style={{ 
                                margin: '0 0 4px 0', 
                                fontSize: '16px', 
                                fontWeight: '600',
                                color: '#2c3e50'
                            }}>
                                Mode d'affichage des offres d'emploi
                            </h5>
                            <p style={{ 
                                margin: 0, 
                                fontSize: '12px', 
                                color: '#6c757d' 
                            }}>
                                Choisissez entre l'affichage en tableau ou en cartes
                            </p>
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px' 
                        }}>
                            <span style={{ 
                                fontSize: '14px', 
                                color: viewMode === 'table' ? '#667eea' : '#6c757d',
                                fontWeight: viewMode === 'table' ? '600' : '400'
                            }}>
                                📊 Tableau
                            </span>
                            
                            {/* Toggle Switch personnalisé sans antd */}
                            <label style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: '50px',
                                height: '24px',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={viewMode === 'cards'}
                                    onChange={(e) => setViewMode(e.target.checked ? 'cards' : 'table')}
                                    style={{ display: 'none' }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: viewMode === 'cards' ? '#667eea' : '#ccc',
                                    transition: '0.3s',
                                    borderRadius: '24px',
                                    cursor: 'pointer'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        content: '',
                                        height: '18px',
                                        width: '18px',
                                        left: viewMode === 'cards' ? '26px' : '3px',
                                        bottom: '3px',
                                        backgroundColor: 'white',
                                        transition: '0.3s',
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} />
                                </span>
                            </label>
                            
                            <span style={{ 
                                fontSize: '14px', 
                                color: viewMode === 'cards' ? '#667eea' : '#6c757d',
                                fontWeight: viewMode === 'cards' ? '600' : '400'
                            }}>
                                🃏 Cartes
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===========================
                AFFICHAGE CONDITIONNEL - TABLEAU OU CARTES
                =========================== */}
            <div className="row mt-3">
                <div className="col-lg-12">
                    {viewMode === 'table' ? (
                        <DataTable {...commonProps} />
                    ) : (
                        <OffreCardGrid {...commonProps} />
                    )}
                </div>
            </div>

            {/* ===========================
                MODAL DE CRÉATION D'OFFRE
                =========================== */}
            <CreateOffreModal
                show={showCreateModal}
                onClose={handleCloseCreateModal}
                onSave={handleSaveOffre}
            />

            {/* ===========================
                MODAL DE GESTION DES OFFRES (pour view, delete, etc.)
                =========================== */}
            {modalState.isOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {modalState.type === 'view' ? 'Détails de l\'offre' : 
                                     modalState.type === 'delete' ? 'Supprimer l\'offre' : 'Action'}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                {modalState.type === 'view' && modalState.selectedQuestion && (
                                    <div>
                                        <p><strong>Code:</strong> {modalState.selectedQuestion.code}</p>
                                        <p><strong>Description:</strong> {modalState.selectedQuestion.description}</p>
                                        <p><strong>Type:</strong> {modalState.selectedQuestion.typeOffre}</p>
                                        <p><strong>Profil:</strong> {modalState.selectedQuestion.profil}</p>
                                    </div>
                                )}
                                {modalState.type === 'delete' && (
                                    <p>Êtes-vous sûr de vouloir supprimer cette offre ?</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Annuler
                                </button>
                                {modalState.type === 'delete' && (
                                    <button type="button" className="btn btn-danger" onClick={handleModalSave}>
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===========================
                INFORMATIONS DE DÉVELOPPEMENT
                =========================== */}
            {process.env.NODE_ENV === "development" && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    zIndex: 9999
                }}>
                    <div><strong>Debug Info:</strong></div>
                    <div>Mode: {viewMode}</div>
                    <div>Offres chargées: {offres?.length || 0}</div>
                    <div>Loading: {loading ? 'Oui' : 'Non'}</div>
                </div>
            )}
        </>
    );
};

export default ListeOffresEmploi;