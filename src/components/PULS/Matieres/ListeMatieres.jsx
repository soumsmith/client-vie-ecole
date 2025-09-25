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
    Badge
} from 'rsuite';
import { 
    FiBookOpen, 
    FiGrid, 
    FiPlus,
    FiRefreshCw,
    FiDownload,
    FiTag,
    FiLayers
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { useListeMatieresData, listematieresTableConfig } from './ListeMatieresService';

// Import du modal de modification
import EditMatiereModal from './EditMatiereModal';
import IconBox from "../Composant/IconBox";


// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES
// ===========================
const MatieresStatsHeader = ({ matieres, loading }) => {
    if (loading) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Loader size="sm" />
                    <span>Chargement des matières d'école...</span>
                </div>
            </div>
        );
    }

    // Calcul des statistiques
    const totalMatieres = matieres.length;
    const matieresPEC = matieres.filter(m => m.is_pec_active).length;
    const matieresBonus = matieres.filter(m => m.is_bonus_active).length;
    const matieresAcademiques = matieres.filter(m => m.is_academic).length;
    
    // Répartition par type
    const typesUniques = [...new Set(matieres.map(m => m.type))];
    const typeStats = typesUniques.map(type => ({
        type,
        count: matieres.filter(m => m.type === type).length,
        display: matieres.find(m => m.type === type)?.type_display || type
    }));

    // Statistiques d'utilisation
    const moyenneOrdre = totalMatieres > 0 ? Math.round(matieres.reduce((sum, m) => sum + m.ordre, 0) / totalMatieres) : 0;

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
                
                <IconBox icon={FiBookOpen} />
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Statistiques des Matières d'École
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Année scolaire 2024-2025 • {totalMatieres} matière(s) configurée(s) • {matieresPEC + matieresBonus} avec statut spécial
                    </p>
                </div>
            </div>

            {/* Statistiques en grille */}
            <Row gutter={16}>
                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>
                            {totalMatieres}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Matières
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                            {matieresPEC}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            Avec PEC
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#fffbeb',
                        borderRadius: '8px',
                        border: '1px solid #fed7aa'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                            {matieresBonus}
                        </div>
                        <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '500' }}>
                            Avec Bonus
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '8px',
                        border: '1px solid #c7d2fe'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                            {matieresAcademiques}
                        </div>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>
                            Académiques
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#fdf2f8',
                        borderRadius: '8px',
                        border: '1px solid #fbcfe8'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ec4899' }}>
                            {typesUniques.length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#ec4899', fontWeight: '500' }}>
                            Types Différents
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f5f3ff',
                        borderRadius: '8px',
                        border: '1px solid #d8b4fe'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#9333ea' }}>
                            {moyenneOrdre}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '500' }}>
                            Ordre Moyen
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs des types */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {typeStats.slice(0, 6).map((typeStat, index) => (
                    <Badge 
                        key={typeStat.type} 
                        color={['green', 'blue', 'orange', 'violet', 'cyan', 'red'][index % 6]} 
                        style={{ fontSize: '11px' }}
                    >
                        {typeStat.count} {typeStat.display}
                    </Badge>
                ))}
                {typeStats.length > 6 && (
                    <Badge color="gray" style={{ fontSize: '11px' }}>
                        +{typeStats.length - 6} autres types
                    </Badge>
                )}
            </div>
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL DE LA LISTE DES MATIÈRES
// ===========================
const ListeMatieres = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // États pour le modal de modification
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMatiere, setSelectedMatiere] = useState(null);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        matieres,
        loading,
        error,
        refetch
    } = useListeMatieresData(refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            setSelectedMatiere(item);
            setShowEditModal(true);
            return;
        }

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            navigate('/matieres/create');
            return;
        }

        // Gestion spécifique pour l'action "matieres" - voir les matières de cette catégorie
        if (actionType === 'matieres' && item && item.id) {
            navigate(`/matieres/categories/${item.id}/matieres`);
            return;
        }

        // Pour les autres actions (delete, view, download, etc.), utiliser le modal
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU MODAL DE MODIFICATION
    // ===========================
    const handleCloseEditModal = useCallback(() => {
        setShowEditModal(false);
        setSelectedMatiere(null);
    }, []);

    const handleSaveEditModal = useCallback(async (data) => {
        console.log('Matière modifiée:', data);
        
        // Actualiser les données après modification
        setRefreshTrigger(prev => prev + 1);
        
        // Fermer le modal
        handleCloseEditModal();
    }, [handleCloseEditModal]);

    // ===========================
    // GESTION DU MODAL PRINCIPAL
    // ===========================
    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer la catégorie de matière:', modalState.selectedItem);
                    // Ici vous pouvez ajouter la logique de suppression
                    // await deleteCategorieMatiere(modalState.selectedItem.id);

                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir les détails de la catégorie:', modalState.selectedItem);
                    break;

                case 'download':
                    console.log('Télécharger les données de la catégorie:', modalState.selectedItem);
                    break;

                default:
                    console.log('Action non gérée:', modalState.type);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedItem, handleCloseModal]);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================
    const handleCreateMatiere = useCallback(() => {
        navigate('/matieres/create');
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
        console.log('Export de toutes les catégories de matières');
        // Ici vous pouvez ajouter la logique d'export
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
                {/* En-tête avec statistiques */}
                <div className="row">
                    <div className="col-lg-12">
                        <MatieresStatsHeader matieres={matieres} loading={loading} />
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
                                    title="Liste des Matières d'École"
                                    subtitle="matière(s) configurée(s)"
                                    
                                    data={matieres}
                                    loading={loading}
                                    error={null}
                                    
                                    columns={listematieresTableConfig.columns}
                                    searchableFields={listematieresTableConfig.searchableFields}
                                    filterConfigs={listematieresTableConfig.filterConfigs}
                                    actions={listematieresTableConfig.actions}
                                    
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={handleCreateMatiere}
                                    
                                    defaultPageSize={listematieresTableConfig.pageSize}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={650}
                                    
                                    enableRefresh={true}
                                    enableCreate={false}
                                    createButtonText="Nouvelle Matière"
                                    selectable={false}
                                    rowKey="id"
                                    
                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { minHeight: "650px", border: "none", boxShadow: "none" },
                                    }}
                                    
                                    // Boutons d'action supplémentaires
                                    extraActions={[
                                        {
                                            key: 'export-all',
                                            label: 'Exporter Tout',
                                            icon: <FiDownload />,
                                            color: 'green',
                                            onClick: handleExportAll
                                        },
                                        {
                                            key: 'manage-categories',
                                            label: 'Gérer Catégories',
                                            icon: <FiTag />,
                                            color: 'blue',
                                            onClick: () => navigate('/matieres/categories')
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Aucune catégorie - cas improbable mais à gérer */}
                {!loading && !error && matieres?.length === 0 && (
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
                                    <FiBookOpen size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Aucune matière d'école configurée
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Il n'y a actuellement aucune matière d'école configurée dans le système.
                                </p>
                                <Button
                                    appearance="primary"
                                    style={{ 
                                        marginTop: 15,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                    startIcon={<FiPlus />}
                                    onClick={handleCreateMatiere}
                                >
                                    Créer une nouvelle matière
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de modification des matières */}
            <EditMatiereModal
                show={showEditModal}
                matiere={selectedMatiere}
                onClose={handleCloseEditModal}
                onSave={handleSaveEditModal}
            />

            {/* Modal pour les autres actions (à implémenter selon vos besoins) */}
            {/* Vous pouvez ajouter ici un modal similaire aux autres composants */}
        </div>
    );
};

export default ListeMatieres;