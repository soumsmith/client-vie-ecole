import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
    SelectPicker, 
    Button, 
    Panel, 
    Row, 
    Col, 
    Message, 
    Loader, 
    Badge,
    Steps,
    Modal,
    Notification,
    toaster
} from 'rsuite';
import { 
    FiSearch, 
    FiRotateCcw, 
    FiUser, 
    FiUsers,
    FiBookOpen,
    FiPlus,
    FiRefreshCw,
    FiDownload,
    FiPhone,
    FiMail,
    FiUserCheck
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import AffecterClassePersonnelModal from './AffecterClassePersonnelModal'; // Nouveau modal
import { 
    useFonctionsData, 
    usePersonnelFonctionData,
    personnelFonctionTableConfig
} from './PersonnelFonctionService';
import GradientButton from '../../GradientButton';

// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE MODERNE
// ===========================
const PersonnelFonctionFilters = ({ 
    onSearch, 
    onClear, 
    loading = false, 
    error = null,
    selectedFonction,
    onFonctionChange
}) => {
    const [formError, setFormError] = useState(null);

    const { 
        fonctions, 
        loading: fonctionsLoading, 
        error: fonctionsError 
    } = useFonctionsData();

    const handleSearch = useCallback(() => {
        if (!selectedFonction) {
            setFormError('Veuillez sélectionner une fonction');
            return;
        }

        setFormError(null);
        if (onSearch) {
            onSearch({ fonctionId: selectedFonction });
        }
    }, [selectedFonction, onSearch]);

    const handleClear = useCallback(() => {
        setFormError(null);
        if (onClear) onClear();
    }, [onClear]);

    const isDataLoading = fonctionsLoading;
    const hasDataError = fonctionsError;

    const fonctionsData = fonctions.map(fonction => ({
        value: fonction.id,
        label: fonction.libelle
    }));

    return (
        <div style={{ 
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginBottom: '20px'
        }}>
            {/* En-tête moderne */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                marginBottom: 25,
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
                    <FiUserCheck size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Affectations Personnel par Fonction
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Sélectionnez une fonction pour voir les personnels et leurs classes assignées
                    </p>
                </div>
            </div>

            {/* Messages d'erreur compacts */}
            {hasDataError && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="error" showIcon style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                        Erreur de chargement des fonctions
                    </Message>
                </div>
            )}

            {(formError || error) && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="warning" showIcon style={{ background: '#fffbeb', border: '1px solid #fed7aa' }}>
                        {formError || error?.message}
                    </Message>
                </div>
            )}

            {/* Formulaire de filtres */}
            <Row gutter={20}>
                <Col xs={24} sm={16} md={14}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: 8, 
                            fontWeight: '500', 
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Fonction *
                        </label>
                        <SelectPicker
                            data={fonctionsData}
                            value={selectedFonction}
                            onChange={(value) => {
                                onFonctionChange(value);
                            }}
                            placeholder="Choisir une fonction"
                            searchable
                            style={{ width: '100%' }}
                            loading={fonctionsLoading}
                            disabled={fonctionsLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={8} md={6}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: 8, 
                            fontWeight: '500', 
                            color: 'transparent',
                            fontSize: '14px'
                        }}>
                            Action
                        </label>
                        <div style={{ display: 'flex', gap: 8, height: '40px' }}>
                            {/* ✨ NOUVEAU : Utilisation de GradientButton */}
                            <GradientButton
                                icon={<FiSearch size={16} />}
                                text="Afficher"
                                loadingText="Chargement..."
                                loading={loading}
                                disabled={isDataLoading || loading || !selectedFonction}
                                onClick={handleSearch}
                                variant="primary"
                                style={{ flex: 1 }}
                            />
                            
                            <Button
                                onClick={handleClear}
                                disabled={loading}
                                style={{ 
                                    minWidth: '45px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}
                                size="lg"
                            >
                                <FiRotateCcw size={16} />
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Indicateur de progression */}
            <div style={{ marginTop: 15 }}>
                <Steps 
                    current={selectedFonction ? 1 : 0} 
                    size="small"
                    style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}
                >
                    <Steps.Item title="Fonction" />
                    <Steps.Item title="Personnel & Classes" />
                </Steps>
            </div>

            {/* Loading indicator discret */}
            {isDataLoading && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 10, 
                    marginTop: 15,
                    padding: '10px 15px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <Loader size="xs" />
                    <span style={{ fontSize: '14px', color: '#0369a1' }}>
                        Chargement des fonctions...
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES
// ===========================
const PersonnelFonctionStatsHeader = ({ affectations, loading, selectedFonctionInfo }) => {
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
                    <span>Chargement des affectations...</span>
                </div>
            </div>
        );
    }

    // Calcul des statistiques
    const totalAffectations = affectations.length;
    const personnelsUniques = [...new Set(affectations.map(a => a.personnel_id))].length;
    const classesAffectees = [...new Set(affectations.map(a => a.classe_id))].length;
    
    // Répartition par genre
    const masculins = affectations.filter(a => a.personnel_sexe === 'MASCULIN').length;
    const feminins = affectations.filter(a => a.personnel_sexe === 'FEMININ').length;
    
    // Types de fonctions représentés
    const typesFonctions = [...new Set(affectations.map(a => a.typeFonction).filter(Boolean))];
    
    // Niveaux d'enseignement
    const niveauxEnseignement = [...new Set(affectations.map(a => a.niveauEnseignement_libelle).filter(Boolean))];

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
                    <FiUsers size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Affectations - {selectedFonctionInfo?.libelle || 'Fonction'}
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        {totalAffectations} affectation(s) • {personnelsUniques} personnel(s) • {classesAffectees} classe(s)
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
                            {totalAffectations}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Affectations
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
                            {personnelsUniques}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            Personnel(s)
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#fdf2f8',
                        borderRadius: '8px',
                        border: '1px solid #fbcfe8'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ec4899' }}>
                            {feminins}
                        </div>
                        <div style={{ fontSize: '12px', color: '#ec4899', fontWeight: '500' }}>
                            Femmes
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '8px',
                        border: '1px solid #c7d2fe'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                            {masculins}
                        </div>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>
                            Hommes
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {typesFonctions.slice(0, 3).map((type, index) => (
                    <Badge 
                        key={type} 
                        color={['green', 'blue', 'orange'][index % 3]} 
                        style={{ fontSize: '11px' }}
                    >
                        {type}
                    </Badge>
                ))}
                {typesFonctions.length > 3 && (
                    <Badge color="gray" style={{ fontSize: '11px' }}>
                        +{typesFonctions.length - 3} autres types
                    </Badge>
                )}
                <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>
                    {classesAffectees} classe(s) • {niveauxEnseignement.length} niveau(x)
                </div>
            </div>
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL PERSONNEL-FONCTION
// ===========================
const PersonnelFonction = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedFonction, setSelectedFonction] = useState(null);
    const [selectedFonctionInfo, setSelectedFonctionInfo] = useState(null);
    const [affectationModalVisible, setAffectationModalVisible] = useState(false);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        affectations,
        loading: searchLoading,
        error: searchError,
        searchPerformed,
        searchAffectations,
        clearResults
    } = usePersonnelFonctionData();

    // Hook pour récupérer les fonctions
    const { fonctions } = useFonctionsData();

    // ===========================
    // GESTION DE LA RECHERCHE
    // ===========================
    const handleSearch = useCallback(async ({ fonctionId }) => {
        console.log('🔍 Lancement de la recherche des affectations:', { fonctionId });
        
        // Récupérer les infos de la fonction sélectionnée
        const fonctionInfo = fonctions.find(f => f.id === fonctionId);
        setSelectedFonctionInfo(fonctionInfo);
        
        await searchAffectations(fonctionId);
    }, [searchAffectations, fonctions]);

    const handleClearSearch = useCallback(() => {
        console.log('🗑️ Effacement des résultats de recherche');
        setSelectedFonction(null);
        setSelectedFonctionInfo(null);
        clearResults();
    }, [clearResults]);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        switch(actionType) {
            case 'edit':
                if (item && item.id) {
                    navigate(`/personnel/affectations/edit/${item.id}`);
                }
                break;
                
            case 'view':
                if (item && item.personnel_id) {
                    navigate(`/personnel/profile/${item.personnel_id}`);
                }
                break;
                
            case 'create':
                setAffectationModalVisible(true);
                break;
                
            default:
                handleTableAction(actionType, item);
                break;
        }
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU MODAL D'AFFECTATION
    // ===========================
    const handleCreateAffectation = useCallback(() => {
        setAffectationModalVisible(true);
    }, []);

    const handleAffectationModalClose = useCallback(() => {
        setAffectationModalVisible(false);
    }, []);

    const handleAffectationSuccess = useCallback((newAffectation) => {
        // Actualiser les données si une recherche est en cours
        if (selectedFonction && searchPerformed) {
            searchAffectations(selectedFonction);
        }
        
        // Notification de succès
        Notification.success({
            title: 'Affectation créée avec succès',
            description: 'La nouvelle affectation classe-personnel a été enregistrée.',
            placement: 'topEnd',
            duration: 4500,
        });
    }, [selectedFonction, searchPerformed, searchAffectations]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        if (selectedFonction) {
            searchAffectations(selectedFonction);
        }
        setRefreshTrigger(prev => prev + 1);
    }, [selectedFonction, searchAffectations]);

    // ===========================
    // GESTION DE L'EXPORT
    // ===========================
    const handleExportAll = useCallback(() => {
        console.log('Export des affectations personnel-fonction');
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
                {/* Formulaire de recherche */}
                <div className="row">
                    <div className="col-lg-12">
                        <PersonnelFonctionFilters
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={searchLoading}
                            error={searchError}
                            selectedFonction={selectedFonction}
                            onFonctionChange={setSelectedFonction}
                        />
                    </div>
                </div>

                {/* En-tête avec statistiques */}
                {searchPerformed && (
                    <div className="row">
                        <div className="col-lg-12">
                            <PersonnelFonctionStatsHeader 
                                affectations={affectations}
                                loading={searchLoading}
                                selectedFonctionInfo={selectedFonctionInfo}
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
                                    <FiUserCheck size={24} color="white" />
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                        Prêt à consulter les affectations ?
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        Sélectionnez une fonction dans le formulaire ci-dessus pour voir le personnel et leurs classes assignées
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
                                    title="Affectations Personnel par Fonction"
                                    subtitle="affectation(s) trouvée(s)"
                                    
                                    data={affectations}
                                    loading={searchLoading}
                                    error={null}
                                    
                                    columns={personnelFonctionTableConfig.columns}
                                    searchableFields={personnelFonctionTableConfig.searchableFields}
                                    filterConfigs={personnelFonctionTableConfig.filterConfigs}
                                    actions={personnelFonctionTableConfig.actions}
                                    
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={handleCreateAffectation}
                                    
                                    defaultPageSize={personnelFonctionTableConfig.pageSize}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={650}
                                    
                                    enableRefresh={true}
                                    enableCreate={true}
                                    createButtonText="Nouvelle Affectation"
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
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Aucun résultat - style moderne */}
                {searchPerformed && affectations?.length === 0 && !searchLoading && (
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
                                    <FiUserCheck size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Aucune affectation trouvée
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Cette fonction n'a aucun personnel affecté ou les données ne sont pas encore disponibles.
                                </p>
                                <Button
                                    appearance="primary"
                                    style={{ 
                                        marginTop: 15,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                    startIcon={<FiPlus />}
                                    onClick={handleCreateAffectation}
                                >
                                    Créer une nouvelle affectation
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ===========================
                MODAL D'AFFECTATION CLASSE-PERSONNEL
                =========================== */}
            <AffecterClassePersonnelModal
                visible={affectationModalVisible}
                onClose={handleAffectationModalClose}
                onSuccess={handleAffectationSuccess}
            />
        </div>
    );
};

export default PersonnelFonction;