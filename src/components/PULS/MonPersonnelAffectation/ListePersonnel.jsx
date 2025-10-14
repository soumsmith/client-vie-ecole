import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import PersonnelModal from './PersonnelModal';
import DataTable from "../../DataTable";
import { usePersonnelData, getPersonnelTableConfig } from './PersonnelServiceManager';
import getFullUrl from "../../hooks/urlUtils";

const ListePersonnel = ({typeDeListe}) => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // État des modals - Gestion directe
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null,
        selectedQuestion: null
    });

    // ===========================
    // DONNÉES DU PERSONNEL
    // ===========================
    const { personnel, loading, error, refetch, performance } = usePersonnelData(typeDeListe, refreshTrigger);

    // ===========================
    // CONFIGURATION DU TABLEAU
    // ===========================
    const tableConfig = useMemo(() => {
        const config = getPersonnelTableConfig(typeDeListe);
        // Générer les filtres dynamiquement basés sur les données actuelles
        const filterConfigs = config.getFilterConfigs ? config.getFilterConfigs(personnel) : [];
        return {
            ...config,
            filterConfigs
        };
    }, [typeDeListe, personnel]);

    // ===========================
    // GESTION DES MODALS
    // ===========================
    const handleTableAction = useCallback((actionType, item) => {
        console.log('Action déclenchée:', actionType, 'Élément:', item);
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
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action locale:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            navigate('/personnel/create');
            return;
        }

        // Gestion spécifique pour l'action "télécharger"
        if (actionType === 'download' && item) {
            handleDownloadDocuments(item);
            return;
        }

        // Pour les autres actions (view, edit, delete), utiliser le modal
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU TÉLÉCHARGEMENT
    // ===========================
    const handleDownloadDocuments = useCallback((personnel) => {
        const documents = [];
        
        if (personnel.cvLien) {
            documents.push({ name: 'CV', url: personnel.cvLien });
        }
        if (personnel.pieceIdentiteLien) {
            documents.push({ name: 'Pièce d\'identité', url: personnel.pieceIdentiteLien });
        }
        if (personnel.autorisationLien) {
            documents.push({ name: 'Autorisation', url: personnel.autorisationLien });
        }

        if (documents.length === 0) {
            alert('Aucun document disponible pour ce personnel');
            return;
        }

        // Ouvrir chaque document dans un nouvel onglet
        documents.forEach(doc => {
            if (doc.url && doc.url.trim() !== '') {
                const fullUrl = doc.url.startsWith('http') ? doc.url : `${getFullUrl()}uploads/${doc.url}`;
                window.open(fullUrl, '_blank');
            }
        });
    }, []);

    // ===========================
    // GESTION DU MODAL
    // ===========================
    const handleModalSave = useCallback(async () => {
        try {
            console.log('Sauvegarde modal - Type:', modalState.type, 'Données:', modalState.selectedQuestion);
            
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer le personnel:', modalState.selectedQuestion);
                    // Ici tu peux ajouter la logique de suppression
                    // await deletePersonnel(modalState.selectedQuestion.id);
                    alert('Personnel supprimé avec succès !');
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir le personnel:', modalState.selectedQuestion);
                    // Pas d'action spécifique pour la vue
                    break;

                case 'edit':
                    console.log('Profils affectés au personnel:', modalState.selectedQuestion);
                    // L'affectation des profils est gérée dans le PersonnelModal
                    // Cette fonction sera appelée depuis le modal lors de la réussite
                    setRefreshTrigger(prev => prev + 1);
                    break;

                default:
                    console.log('Action non gérée:', modalState.type);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            alert('Une erreur est survenue lors de l\'opération');
        }
    }, [modalState.type, modalState.selectedQuestion, handleCloseModal]);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================
    const handleCreatePersonnel = useCallback(() => {
        navigate('/personnel/create');
    }, [navigate]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
        refetch();
    }, [refetch]);

    // ===========================
    // STATS RAPIDES
    // ===========================
    const getStatsPersonnel = useCallback(() => {
        if (!personnel || personnel.length === 0) return null;

        const stats = {
            total: personnel.length,
            hommes: personnel.filter(p => p.sexe === 'MASCULIN').length,
            femmes: personnel.filter(p => p.sexe === 'FEMININ').length,
            valides: personnel.filter(p => p.statut === 'VALIDEE').length,
            enAttente: personnel.filter(p => p.statut === 'EN_ATTENTE').length,
            experienceMoyenne: Math.round(
                personnel.reduce((sum, p) => sum + (p.experienceAnnees || 0), 0) / personnel.length
            )
        };

        return stats;
    }, [personnel]);

    const stats = getStatsPersonnel();

    // Debug - Vérifier les données
    console.log('Personnel data:', personnel);
    console.log('Modal state:', modalState);
    console.log('Table config actions:', tableConfig.actions);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                STATISTIQUES RAPIDES
                =========================== */}
            {stats && (
                <div className="row mb-4">
                    <div className="col-lg-12">
                        <div className="row">
                            <div className="col-md-2">
                                <div className="card text-center" style={{ backgroundColor: '#3498db', color: 'white' }}>
                                    <div className="card-body py-2">
                                        <h5 className="mb-0">{stats.total}</h5>
                                        <small>Total Personnel</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="card text-center" style={{ backgroundColor: '#2980b9', color: 'white' }}>
                                    <div className="card-body py-2">
                                        <h5 className="mb-0">{stats.hommes}</h5>
                                        <small>Hommes</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="card text-center" style={{ backgroundColor: '#e91e63', color: 'white' }}>
                                    <div className="card-body py-2">
                                        <h5 className="mb-0">{stats.femmes}</h5>
                                        <small>Femmes</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="card text-center" style={{ backgroundColor: '#27ae60', color: 'white' }}>
                                    <div className="card-body py-2">
                                        <h5 className="mb-0">{stats.valides}</h5>
                                        <small>Validés</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="card text-center" style={{ backgroundColor: '#f39c12', color: 'white' }}>
                                    <div className="card-body py-2">
                                        <h5 className="mb-0">{stats.enAttente}</h5>
                                        <small>En Attente</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2">
                                <div className="card text-center" style={{ backgroundColor: '#9b59b6', color: 'white' }}>
                                    <div className="card-body py-2">
                                        <h5 className="mb-0">{stats.experienceMoyenne}</h5>
                                        <small>Exp. Moyenne (ans)</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===========================
                TABLEAU DU PERSONNEL
                =========================== */}
            <div className="row mt-3">
                <div className="col-lg-12">
                    <DataTable
                        title="Liste du Personnel"
                        subtitle={`membre${personnel.length > 1 ? 's' : ''} du personnel`}
                        data={personnel}
                        loading={loading}
                        error={error}
                        columns={tableConfig.columns}
                        searchableFields={tableConfig.searchableFields}
                        filterConfigs={tableConfig.filterConfigs}
                        actions={tableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleCreatePersonnel}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50, 100]}
                        tableHeight={650}
                        enableRefresh={true}
                        enableCreate={false}
                        createButtonText="Nouveau Personnel"
                        selectable={false}
                        rowKey="id"
                        customStyles={{
                            container: { backgroundColor: "#f8f9fa" },
                            panel: { minHeight: "650px" },
                        }}
                        // Informations de performance
                        performanceInfo={performance && (
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                                Chargé en {performance.duration}ms depuis {performance.source === 'cache' ? 'cache' : 'API'}
                                {performance.dataSize && ` • ${Math.round(performance.dataSize / 1024)}KB`}
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* ===========================
                MODAL DE GESTION DU PERSONNEL
                =========================== */}
            <PersonnelModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
            />

            {/* Debug : Affichage des informations de débogage en développement */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{ 
                    position: 'fixed', 
                    bottom: '10px', 
                    right: '10px', 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    color: 'white', 
                    padding: '10px', 
                    borderRadius: '5px',
                    fontSize: '12px',
                    maxWidth: '300px',
                    zIndex: 9999
                }}>
                    <div><strong>Debug Info:</strong></div>
                    <div>Personnel count: {personnel.length}</div>
                    <div>Modal open: {modalState.isOpen ? 'Yes' : 'No'}</div>
                    <div>Modal type: {modalState.type || 'None'}</div>
                    <div>Selected: {modalState.selectedQuestion?.nomComplet || 'None'}</div>
                    <div>Actions: {tableConfig.actions?.length || 0}</div>
                </div>
            )}
        </>
    );
};

export default ListePersonnel;