import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
    Button, 
    Panel, 
    Row, 
    Col, 
    Message, 
    Loader, 
    Badge,
    Modal,
    Notification,
    toaster
} from 'rsuite';
import { 
    FiCalendar, 
    FiLock, 
    FiUnlock,
    FiPlus,
    FiRefreshCw,
    FiDownload,
    FiEye,
    FiEdit,
    FiTrash2,
    FiClock,
    FiSettings
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import EditAnneeModal from './EditAnneeModal'; // Nouveau modal pour les années scolaires
import { 
    useAnneesScolairesData, 
    anneesScolairesTableConfig
} from './AnneesScolairesService';

// ===========================
// COMPOSANT D'EN-TÊTE AVEC ANNÉE EN COURS
// ===========================
const AnneeEnCoursHeader = ({ anneeEnCours, loading, onCloturer, onNouvelle }) => {
    if (loading) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '15px',
                padding: '25px',
                marginBottom: '20px',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <Loader size="sm" style={{ color: 'white' }} />
                    <span>Chargement de l'année en cours...</span>
                </div>
            </div>
        );
    }

    if (!anneeEnCours) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '15px',
                padding: '25px',
                marginBottom: '20px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ fontSize: '24px' }}>⚠️</span>
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontWeight: '600' }}>
                            Aucune année scolaire ouverte
                        </h4>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                            Vous devez créer et ouvrir une nouvelle année scolaire pour commencer
                        </p>
                    </div>
                </div>
                <Button
                    appearance="primary"
                    style={{ 
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white'
                    }}
                    startIcon={<FiPlus />}
                    onClick={onNouvelle}
                >
                    Nouvelle Année
                </Button>
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.25)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiUnlock size={24} color="white" />
                </div>
                <div>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                        Année en cours :
                    </p>
                    <h3 style={{ margin: 0, fontWeight: '700', fontSize: '24px' }}>
                        {anneeEnCours.libelle}
                    </h3>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: 10 }}>
                <Button
                    style={{ 
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white'
                    }}
                    startIcon={<FiSettings />}
                    onClick={() => console.log('Configurer année')}
                >
                    Configurer
                </Button>
                <Button
                    style={{ 
                        background: 'rgba(239, 68, 68, 0.9)',
                        border: '1px solid rgba(239, 68, 68, 1)',
                        color: 'white'
                    }}
                    startIcon={<FiLock />}
                    onClick={() => onCloturer(anneeEnCours)}
                >
                    Clôturer Année
                </Button>
            </div>
        </div>
    );
};

// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES
// ===========================
const AnneesStatsHeader = ({ annees, loading }) => {
    if (loading) {
        return null; // Pas d'affichage pendant le chargement
    }

    // Calcul des statistiques
    const totalAnnees = annees.length;
    const anneesOuvertes = annees.filter(a => a.isOuverte).length;
    const anneesCloses = annees.filter(a => a.isCloturee).length;
    const dernièreAnnee = annees.length > 0 ? annees[0] : null;
    
    // Périodicités utilisées
    const periodicites = [...new Set(annees.map(a => a.periodicite_libelle))];

    return (
        <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginBottom: '20px'
        }}>
            {/* En-tête */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                marginBottom: 20,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiCalendar size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Liste des Années Scolaires
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Gestion et suivi des années scolaires • {totalAnnees} année(s) configurée(s)
                    </p>
                </div>
            </div>

            {/* Statistiques en grille */}
            <Row gutter={16}>
                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>
                            {totalAnnees}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Années
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                            {anneesOuvertes}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            Ouvertes
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#fee2e2',
                        borderRadius: '8px',
                        border: '1px solid #fecaca'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                            {anneesCloses}
                        </div>
                        <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                            Clôturées
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f5f3ff',
                        borderRadius: '8px',
                        border: '1px solid #d8b4fe'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#9333ea' }}>
                            {periodicites.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '500' }}>
                            Périodicités
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {periodicites.slice(0, 3).map((periodicite, index) => (
                    <Badge 
                        key={periodicite} 
                        color={['green', 'blue', 'orange'][index % 3]} 
                        style={{ fontSize: '11px' }}
                    >
                        {periodicite}
                    </Badge>
                ))}
                {dernièreAnnee && (
                    <span style={{ 
                        fontSize: '12px', 
                        color: '#64748b',
                        marginLeft: '10px'
                    }}>
                        Dernière création : {dernièreAnnee.dateCreation_display}
                    </span>
                )}
            </div>
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL DES ANNÉES SCOLAIRES
// ===========================
const AnneesScolaires = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showClotureModal, setShowClotureModal] = useState(false);
    const [selectedAnnee, setSelectedAnnee] = useState(null);

    // ===========================
    // ÉTAT DU MODAL DES ANNÉES SCOLAIRES
    // ===========================
    const [anneeModal, setAnneeModal] = useState({
        show: false,
        selectedAnnee: null
    });

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        annees,
        anneeEnCours,
        loading,
        error,
        refetch
    } = useAnneesScolairesData(139, refreshTrigger); // Utilisation de l'ecole ID 139

    // ===========================
    // GESTION DU MODAL DES ANNÉES SCOLAIRES
    // ===========================

    const openAnneeModal = useCallback((annee) => {
        setAnneeModal({
            show: true,
            selectedAnnee: annee
        });
    }, []);

    const closeAnneeModal = useCallback(() => {
        setAnneeModal({
            show: false,
            selectedAnnee: null
        });
    }, []);

    const handleAnneeModalSave = useCallback(async (data) => {
        try {
            console.log('Année sauvegardée:', data);
            
            // Actualiser les données après sauvegarde
            setRefreshTrigger(prev => prev + 1);
            
            // Fermer le modal
            closeAnneeModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [closeAnneeModal]);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        switch(actionType) {
            case 'edit':
                // Ouvrir le modal en mode modification
                if (item && item.id) {
                    openAnneeModal(item);
                }
                break;
                
            case 'view':
                if (item && item.id) {
                    navigate(`/annees/details/${item.id}`);
                }
                break;
                
            case 'toggle-status':
                setSelectedAnnee(item);
                if (item.isOuverte) {
                    setShowClotureModal(true);
                } else {
                    handleOuvrirAnnee(item);
                }
                break;
                
            case 'create':
                navigate('/annees/create');
                break;
                
            default:
                handleTableAction(actionType, item);
                break;
        }
    }, [navigate, handleTableAction, openAnneeModal]);

    // ===========================
    // GESTION DE LA CLÔTURE D'ANNÉE
    // ===========================
    const handleCloturer = useCallback((annee) => {
        setSelectedAnnee(annee);
        setShowClotureModal(true);
    }, []);

    const handleConfirmCloture = useCallback(async () => {
        try {
            // Ici vous pouvez ajouter la logique pour clôturer l'année
            console.log('Clôturer l\'année:', selectedAnnee);
            
            // Simulation d'un appel API
            // await axios.put(`${getFullUrl()}annee/cloturer/${selectedAnnee.id}`);
            
            toaster.push(
                <Notification type="success" header="Année clôturée">
                    L'année {selectedAnnee.libelle} a été clôturée avec succès
                </Notification>,
                { duration: 4000 }
            );
            
            setShowClotureModal(false);
            setSelectedAnnee(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Erreur lors de la clôture:', error);
            toaster.push(
                <Notification type="error" header="Erreur">
                    Impossible de clôturer l'année scolaire
                </Notification>,
                { duration: 5000 }
            );
        }
    }, [selectedAnnee]);

    const handleOuvrirAnnee = useCallback(async (annee) => {
        try {
            console.log('Ouvrir l\'année:', annee);
            
            // Simulation d'un appel API pour ouvrir l'année
            // await axios.put(`${getFullUrl()}annee/ouvrir/${annee.id}`);
            
            toaster.push(
                <Notification type="success" header="Année ouverte">
                    L'année {annee.libelle} a été ouverte avec succès
                </Notification>,
                { duration: 4000 }
            );
            
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Erreur lors de l\'ouverture:', error);
            toaster.push(
                <Notification type="error" header="Erreur">
                    Impossible d'ouvrir l'année scolaire
                </Notification>,
                { duration: 5000 }
            );
        }
    }, []);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================
    const handleCreateAnnee = useCallback(() => {
        navigate('/annees/create');
    }, [navigate]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // GESTION DE L'EXPORT
    // ===========================
    const handleExportAll = useCallback(() => {
        console.log('Export de toutes les années scolaires');
        toaster.push(
            <Notification type="info" header="Export">
                Fonctionnalité d'export en cours de développement
            </Notification>,
            { duration: 3000 }
        );
    }, []);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================
    return (
        <div style={{ 
             
            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                {/* En-tête avec année en cours */}
                <div className="row">
                    <div className="col-lg-12">
                        <AnneeEnCoursHeader 
                            anneeEnCours={anneeEnCours}
                            loading={loading}
                            onCloturer={handleCloturer}
                            onNouvelle={handleCreateAnnee}
                        />
                    </div>
                </div>

                {/* En-tête avec statistiques */}
                <div className="row">
                    <div className="col-lg-12">
                        <AnneesStatsHeader annees={annees} loading={loading} />
                    </div>
                </div>

                {/* Erreur de chargement */}
                {error && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 15
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '24px' }}>⚠️</span>
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#dc2626', fontWeight: '600' }}>
                                        Erreur de chargement
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        {error.message}
                                    </p>
                                </div>
                                <Button
                                    appearance="primary"
                                    style={{ 
                                        marginLeft: 'auto',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                    startIcon={<FiRefreshCw />}
                                    onClick={handleRefresh}
                                >
                                    Réessayer
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* DataTable avec style amélioré */}
                {!error && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                overflow: 'hidden'
                            }}>
                                <DataTable
                                    title="Années Scolaires"
                                    subtitle={`${annees?.length || 0} année(s) configurée(s)`}
                                    
                                    data={annees}
                                    loading={loading}
                                    error={null}
                                    
                                    columns={anneesScolairesTableConfig.columns}
                                    searchableFields={anneesScolairesTableConfig.searchableFields}
                                    filterConfigs={anneesScolairesTableConfig.filterConfigs}
                                    actions={anneesScolairesTableConfig.actions}
                                    
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={handleCreateAnnee}
                                    
                                    defaultPageSize={anneesScolairesTableConfig.pageSize}
                                    pageSizeOptions={[5, 10, 15, 25]}
                                    tableHeight={600}
                                    
                                    enableRefresh={true}
                                    enableCreate={false}
                                    createButtonText="Nouvelle Année"
                                    selectable={false}
                                    rowKey="id"
                                    
                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { minHeight: "600px", border: "none", boxShadow: "none" },
                                    }}
                                    
                                    // Boutons d'action supplémentaires
                                    extraActions={[
                                        {
                                            key: 'export-all',
                                            label: 'Exporter Tout',
                                            icon: <FiDownload />,
                                            color: 'green',
                                            onClick: handleExportAll
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Aucune année - cas improbable mais à gérer */}
                {!loading && !error && annees?.length === 0 && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '40px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(245, 158, 11, 0.15)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20
                                }}>
                                    <FiCalendar size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Aucune année scolaire configurée
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Commencez par créer votre première année scolaire pour utiliser le système.
                                </p>
                                <Button
                                    appearance="primary"
                                    style={{ 
                                        marginTop: 15,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                    startIcon={<FiPlus />}
                                    onClick={handleCreateAnnee}
                                >
                                    Créer la première année
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de modification des années scolaires */}
            <EditAnneeModal
                show={anneeModal.show}
                annee={anneeModal.selectedAnnee}
                onClose={closeAnneeModal}
                onSave={handleAnneeModalSave}
            />

            {/* Modal de confirmation de clôture */}
            <Modal 
                open={showClotureModal} 
                onClose={() => setShowClotureModal(false)}
                size="xl"
            >
                <Modal.Header>
                    <Modal.Title>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiLock color="#dc2626" />
                            Clôturer l'année scolaire
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ padding: '20px 0' }}>
                        <div style={{
                            padding: '15px',
                            backgroundColor: '#fef3c7',
                            border: '1px solid #fed7aa',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            <span style={{ fontSize: '20px' }}>⚠️</span>
                            <div>
                                <strong>Attention !</strong> Cette action est irréversible.
                            </div>
                        </div>
                        
                        <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
                            Vous êtes sur le point de clôturer l'année scolaire 
                            <strong> "{selectedAnnee?.libelle}"</strong>.
                        </p>
                        <p style={{ marginTop: 15, color: '#64748b', fontSize: '14px' }}>
                            Une fois clôturée, cette année ne pourra plus être modifiée et 
                            aucune nouvelle donnée ne pourra y être ajoutée.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        onClick={() => setShowClotureModal(false)} 
                        appearance="subtle"
                    >
                        Annuler
                    </Button>
                    <Button 
                        onClick={handleConfirmCloture} 
                        appearance="primary"
                        color="red"
                        startIcon={<FiLock />}
                    >
                        Confirmer la clôture
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AnneesScolaires;