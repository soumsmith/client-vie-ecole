import React, { useState, useCallback } from "react";
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
    Steps,
    Notification,
    toaster
} from 'rsuite';
import { 
    FiBookOpen, 
    FiHash,
    FiSave,
    FiDownload,
    FiRefreshCw,
    FiPlus
} from 'react-icons/fi';

// Import des composants et services
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { 
    useCoefficientsMatieresData,
    coefficientsTableConfig
} from './CoefficientsMatieresService';
import CoefficientsFilters from './CoefficientsFilters'; // Import du composant mis à jour
import AddCoefficientModal from './AddCoefficientModal'; // Import du modal mis à jour avec useMatieresEcoleData
import IconBox from "../Composant/IconBox";


// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES ET ACTIONS AMÉLIORÉ
// ===========================
const CoefficientsStatsHeader = ({ 
    coefficients, 
    loading, 
    modifiedCoefficients, 
    onSave, 
    onExport,
    showSaveButton = false
}) => {
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
                    <span>Chargement des coefficients...</span>
                </div>
            </div>
        );
    }

    // Calcul des statistiques
    const totalMatieres = coefficients.length;
    const matieresModifiees = modifiedCoefficients.size;
    const matieresAvecErreur = coefficients.filter(c => c.hasError).length;
    
    // Répartition par catégorie
    const categories = [...new Set(coefficients.map(c => c.categorie_libelle))];
    const categoriesStats = categories.map(cat => ({
        category: cat,
        count: coefficients.filter(c => c.categorie_libelle === cat).length
    })).slice(0, 4);

    // Moyenne des coefficients
    const moyenneCoeff = totalMatieres > 0 ? 
        (coefficients.reduce((sum, c) => sum + c.coefficient, 0) / totalMatieres).toFixed(1) : 0;

    const hasModifications = matieresModifiees > 0;

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
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 20,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <IconBox icon={FiBookOpen} />
                    <div>
                        <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                            Coefficients des Matières
                        </h5>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            {totalMatieres} matière(s) • {categories.length} catégorie(s) • Moyenne: {moyenneCoeff}
                        </p>
                    </div>
                </div>

                {/* Boutons d'action */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {(hasModifications || showSaveButton) && (
                        <Button
                            appearance="primary"
                            style={{ 
                                background: 'linear-gradient(135deg, #059669 0%, #16a34a 100%)',
                                border: 'none',
                                borderRadius: '8px'
                            }}
                            startIcon={<FiSave />}
                            onClick={onSave}
                            loading={loading}
                        >
                            Enregistrer {hasModifications ? `(${matieresModifiees})` : ''}
                        </Button>
                    )}
                    
                    {/* <Button
                        appearance="ghost"
                        style={{ 
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}
                        startIcon={<FiDownload />}
                        onClick={onExport}
                        disabled={loading}
                    >
                        Exporter
                    </Button> */}
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
                            {totalMatieres}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Matières
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: matieresModifiees > 0 ? '#fef3c7' : '#f0fdf4',
                        borderRadius: '8px',
                        border: `1px solid ${matieresModifiees > 0 ? '#fed7aa' : '#bbf7d0'}`
                    }}>
                        <div style={{ 
                            fontSize: '24px', 
                            fontWeight: '700', 
                            color: matieresModifiees > 0 ? '#d97706' : '#16a34a'
                        }}>
                            {matieresModifiees}
                        </div>
                        <div style={{ 
                            fontSize: '12px', 
                            color: matieresModifiees > 0 ? '#d97706' : '#16a34a',
                            fontWeight: '500' 
                        }}>
                            Modifiées
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: matieresAvecErreur > 0 ? '#fee2e2' : '#f1f5f9',
                        borderRadius: '8px',
                        border: `1px solid ${matieresAvecErreur > 0 ? '#fecaca' : '#e2e8f0'}`
                    }}>
                        <div style={{ 
                            fontSize: '24px', 
                            fontWeight: '700', 
                            color: matieresAvecErreur > 0 ? '#dc2626' : '#64748b'
                        }}>
                            {matieresAvecErreur}
                        </div>
                        <div style={{ 
                            fontSize: '12px', 
                            color: matieresAvecErreur > 0 ? '#dc2626' : '#64748b',
                            fontWeight: '500' 
                        }}>
                            Erreurs
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
                            {moyenneCoeff}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '500' }}>
                            Moyenne
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs des catégories */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categoriesStats.map((catStat, index) => (
                    <Badge 
                        key={catStat.category} 
                        color={['green', 'blue', 'orange', 'violet'][index % 4]} 
                        style={{ fontSize: '11px' }}
                    >
                        {catStat.count} {catStat.category}
                    </Badge>
                ))}
                {categories.length > 4 && (
                    <Badge color="gray" style={{ fontSize: '11px' }}>
                        +{categories.length - 4} autres catégories
                    </Badge>
                )}
            </div>

            {/* Alerte modifications */}
            {hasModifications && (
                <div style={{
                    marginTop: 15,
                    padding: '12px 15px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fed7aa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <span style={{ fontSize: '18px' }}>⚠️</span>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>
                            Vous avez {matieresModifiees} modification(s) non sauvegardée(s)
                        </div>
                        <div style={{ fontSize: '12px', color: '#b45309' }}>
                            N'oubliez pas d'enregistrer vos changements
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL DES COEFFICIENTS AMÉLIORÉ
// ===========================
const CoefficientsMatieres = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedBranche, setSelectedBranche] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedBrancheData, setSelectedBrancheData] = useState(null);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        coefficients,
        loading: searchLoading,
        error: searchError,
        searchPerformed,
        modifiedCoefficients,
        searchCoefficients,
        updateCoefficient,
        saveModifications,
        clearResults
    } = useCoefficientsMatieresData();

    // ===========================
    // GESTION DE LA RECHERCHE
    // ===========================
    const handleSearch = useCallback(async ({ brancheId }) => {
        console.log('🔍 Lancement de la recherche des coefficients:', { brancheId });
        await searchCoefficients(brancheId);
    }, [searchCoefficients]);

    const handleClearSearch = useCallback(() => {
        console.log('🗑️ Effacement des résultats de recherche');
        setSelectedBranche(null);
        setSelectedBrancheData(null);
        clearResults();
    }, [clearResults]);

    // ===========================
    // GESTION DU MODAL D'AJOUT
    // ===========================
    const handleAdd = useCallback((brancheData) => {
        console.log('➕ Ouverture du modal d\'ajout pour la branche:', brancheData);
        setSelectedBrancheData(brancheData);
        setShowAddModal(true);
    }, []);

    const handleCloseAddModal = useCallback(() => {
        setShowAddModal(false);
        setSelectedBrancheData(null);
    }, []);

    const handleSaveAdd = useCallback(async (result) => {
        console.log('✅ Nouvelle matière ajoutée:', result);
        
        toaster.push(
            <Notification type="success" header="Matière ajoutée">
                La matière a été ajoutée avec succès à la branche.
            </Notification>,
            { duration: 4000 }
        );

        // Rafraîchir la liste des coefficients
        if (selectedBranche) {
            await searchCoefficients(selectedBranche);
        }
    }, [selectedBranche, searchCoefficients]);

    // ===========================
    // GESTION DE LA SAUVEGARDE
    // ===========================
    const handleSave = useCallback(async () => {
        const result = await saveModifications();
        
        if (result.success) {
            toaster.push(
                <Notification type="success" header="Sauvegarde réussie">
                    {result.message}
                </Notification>,
                { duration: 4000 }
            );
        } else {
            toaster.push(
                <Notification type="error" header="Erreur de sauvegarde">
                    {result.message}
                </Notification>,
                { duration: 6000 }
            );
        }
    }, [saveModifications]);

    // ===========================
    // GESTION DE L'EXPORT
    // ===========================
    const handleExport = useCallback(() => {
        console.log('Export des coefficients des matières');
        // Ici vous pouvez ajouter la logique d'export
        toaster.push(
            <Notification type="info" header="Export">
                Fonctionnalité d'export en cours de développement
            </Notification>,
            { duration: 3000 }
        );
    }, []);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "view"
        if (actionType === 'view' && item && item.id) {
            console.log('Voir les détails de la matière:', item);
            // navigate(`/matieres/details/${item.matiere_id}`);
            return;
        }

        // Pour les autres actions, utiliser le modal
        handleTableAction(actionType, item);
    }, [handleTableAction]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        if (selectedBranche) {
            searchCoefficients(selectedBranche);
        }
        setRefreshTrigger(prev => prev + 1);
    }, [selectedBranche, searchCoefficients]);

    // ===========================
    // CONFIGURATION DU TABLEAU AVEC CALLBACK
    // ===========================
    const tableConfigWithCallbacks = {
        ...coefficientsTableConfig,
        columns: coefficientsTableConfig.columns.map(col => {
            if (col.dataKey === 'coefficient') {
                return {
                    ...col,
                    customRenderer: (rowData) => col.customRenderer(rowData, updateCoefficient)
                };
            }
            return col;
        })
    };

    // ===========================
    // VÉRIFIER SI LE BOUTON ENREGISTRER DOIT ÊTRE AFFICHÉ
    // ===========================
    const shouldShowSaveButton = modifiedCoefficients.size > 0;

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================
    return (
        <div style={{ 
             
            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                {/* Formulaire de recherche avec bouton ajouter */}
                <div className="row">
                    <div className="col-lg-12">
                        <CoefficientsFilters
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            onAdd={handleAdd}
                            loading={searchLoading}
                            error={searchError}
                            selectedBranche={selectedBranche}
                            onBrancheChange={setSelectedBranche}
                        />
                    </div>
                </div>

                {/* En-tête avec statistiques et actions */}
                {searchPerformed && (
                    <div className="row">
                        <div className="col-lg-12">
                            <CoefficientsStatsHeader 
                                coefficients={coefficients}
                                loading={searchLoading}
                                modifiedCoefficients={modifiedCoefficients}
                                onSave={handleSave}
                                onExport={handleExport}
                                showSaveButton={shouldShowSaveButton}
                            />
                        </div>
                    </div>
                )}

                {/* Message d'information moderne */}
                {!searchPerformed && !searchLoading && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(59, 130, 246, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 15
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FiHash size={24} color="white" />
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                        Prêt à gérer les coefficients ?
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        Sélectionnez une branche dans le formulaire ci-dessus pour démarrer
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Erreur de recherche moderne */}
                {searchError && (
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
                                        Erreur de recherche
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        {searchError.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DataTable avec style amélioré */}
                {searchPerformed && (
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
                                    title="Coefficients des Matières"
                                    subtitle="matière(s) trouvée(s)"
                                    
                                    data={coefficients}
                                    loading={searchLoading}
                                    error={null}
                                    
                                    columns={tableConfigWithCallbacks.columns}
                                    searchableFields={tableConfigWithCallbacks.searchableFields}
                                    filterConfigs={tableConfigWithCallbacks.filterConfigs}
                                    actions={tableConfigWithCallbacks.actions}
                                    
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    
                                    defaultPageSize={20}
                                    pageSizeOptions={[10, 20, 30, 50]}
                                    tableHeight={650}
                                    
                                    enableRefresh={true}
                                    enableCreate={false}
                                    selectable={false}
                                    rowKey="id"
                                    
                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { minHeight: "650px", border: "none", boxShadow: "none" },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal d'ajout de coefficient */}
            <AddCoefficientModal
                show={showAddModal}
                selectedBranche={selectedBrancheData}
                onClose={handleCloseAddModal}
                onSave={handleSaveAdd}
            />
        </div>
    );
};

export default CoefficientsMatieres;