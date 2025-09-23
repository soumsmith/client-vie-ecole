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
    FiShield,
    FiPlus,
    FiRefreshCw,
    FiDownload,
    FiPhone,
    FiMail,
    FiKey,
    FiEye,
    FiEyeOff
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { 
    usePersonnelConnexionData,
    useEcolesConnexionData,
    personnelConnexionTableConfig
} from './PersonnelConnexionService';

// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE MODERNE
// ===========================
const PersonnelConnexionFilters = ({ 
    onSearch, 
    onClear, 
    loading = false, 
    error = null,
    selectedEcole,
    onEcoleChange
}) => {
    const [formError, setFormError] = useState(null);

    const { ecoles, loading: ecolesLoading, error: ecolesError, refetch } = useEcolesConnexionData();

    const handleSearch = useCallback(() => {
        if (!selectedEcole) {
            setFormError('Veuillez sélectionner une école');
            return;
        }

        setFormError(null);
        if (onSearch) {
            onSearch({ ecoleId: selectedEcole });
        }
    }, [selectedEcole, onSearch]);

    const handleClear = useCallback(() => {
        setFormError(null);
        if (onClear) onClear();
    }, [onClear]);

    const isDataLoading = ecolesLoading;
    const hasDataError = ecolesError;

    // Préparation des données pour SelectPicker
    const ecolesData = ecoles.map(ecole => ({
        value: ecole.id,
        label: ecole.label
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
                    <FiShield size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Informations de Connexion Personnel
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Sélectionnez une école pour consulter les informations de connexion du personnel
                    </p>
                </div>
            </div>

            {/* Messages d'erreur compacts */}
            {hasDataError && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="error" showIcon style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                        Erreur de chargement des écoles
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
                            École *
                        </label>
                        <SelectPicker
                            data={ecolesData}
                            value={selectedEcole}
                            onChange={(value) => {
                                onEcoleChange(value);
                            }}
                            placeholder="Choisir une école"
                            searchable
                            style={{ width: '100%' }}
                            loading={ecolesLoading}
                            disabled={ecolesLoading || loading}
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
                            <Button
                                appearance="primary"
                                onClick={handleSearch}
                                loading={loading}
                                disabled={isDataLoading || loading || !selectedEcole}
                                style={{ 
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '500'
                                }}
                                size="lg"
                            >
                                {loading ? 'Chargement...' : 'Rechercher'}
                            </Button>
                            
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
                    current={selectedEcole ? 1 : 0} 
                    size="small"
                    style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}
                >
                    <Steps.Item title="École" />
                    <Steps.Item title="Personnel" />
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
                        Chargement des écoles...
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES
// ===========================
const PersonnelConnexionStatsHeader = ({ connexions, loading, selectedEcoleInfo }) => {
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
                    <span>Chargement des informations de connexion...</span>
                </div>
            </div>
        );
    }

    // Calcul des statistiques
    const totalConnexions = connexions.length;
    const emailsValides = connexions.filter(c => c.has_valid_email).length;
    const motDePasseSecurises = connexions.filter(c => c.has_secure_password).length;
    const connexionsSecurisees = connexions.filter(c => c.security_score === 2).length;
    
    // Répartition par type d'email
    const typesEmail = connexions.reduce((acc, c) => {
        const type = c.email_analysis.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    
    // Répartition par force de mot de passe
    const forcesMotDePasse = connexions.reduce((acc, c) => {
        const force = c.password_analysis.strength;
        acc[force] = (acc[force] || 0) + 1;
        return acc;
    }, {});

    // Pourcentages
    const pourcentageEmailsValides = totalConnexions > 0 ? Math.round((emailsValides / totalConnexions) * 100) : 0;
    const pourcentageSecurises = totalConnexions > 0 ? Math.round((connexionsSecurisees / totalConnexions) * 100) : 0;

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
                    <FiShield size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Informations de Connexion - {selectedEcoleInfo?.display_short || 'École sélectionnée'}
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        {totalConnexions} compte(s) • {pourcentageEmailsValides}% emails valides • {pourcentageSecurises}% sécurisés
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
                            {totalConnexions}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Comptes
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
                            {emailsValides}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            Emails Valides
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#fffbeb',
                        borderRadius: '8px',
                        border: '1px solid #fed7aa'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                            {motDePasseSecurises}
                        </div>
                        <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '500' }}>
                            MDP Sécurisés
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
                            {connexionsSecurisees}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '500' }}>
                            Comptes Sécurisés
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(typesEmail).slice(0, 4).map(([type, count], index) => (
                    <Badge 
                        key={type} 
                        color={['green', 'blue', 'orange', 'violet'][index % 4]} 
                        style={{ fontSize: '11px' }}
                    >
                        {count} {type}
                    </Badge>
                ))}
                {Object.entries(forcesMotDePasse).slice(0, 3).map(([force, count], index) => (
                    <Badge 
                        key={force} 
                        color={force === 'FORTE' ? 'green' : force === 'MOYENNE' ? 'yellow' : 'red'} 
                        style={{ fontSize: '11px' }}
                    >
                        {count} {force.toLowerCase()}
                    </Badge>
                ))}
            </div>

            {/* Alerte de sécurité */}
            {(totalConnexions - connexionsSecurisees) > 0 && (
                <div style={{
                    marginTop: 15,
                    padding: '12px 16px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <FiShield size={16} color="#d97706" />
                    <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '500' }}>
                        {totalConnexions - connexionsSecurisees} compte(s) nécessitent une amélioration de la sécurité
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL PERSONNEL CONNEXION
// ===========================
const PersonnelConnexion = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedEcole, setSelectedEcole] = useState(null);
    const [selectedEcoleInfo, setSelectedEcoleInfo] = useState(null);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        connexions,
        loading: searchLoading,
        error: searchError,
        searchPerformed,
        searchConnexions,
        clearResults
    } = usePersonnelConnexionData();

    // Hook pour récupérer les écoles
    const { ecoles } = useEcolesConnexionData();

    // ===========================
    // GESTION DE LA RECHERCHE
    // ===========================
    const handleSearch = useCallback(async ({ ecoleId }) => {
        console.log('🔍 Lancement de la recherche des connexions:', { ecoleId });
        
        // Récupérer les infos de l'école sélectionnée
        const ecoleInfo = ecoles.find(e => e.id === ecoleId);
        setSelectedEcoleInfo(ecoleInfo);
        
        await searchConnexions(ecoleId);
    }, [searchConnexions, ecoles]);

    const handleClearSearch = useCallback(() => {
        console.log('🗑️ Effacement des résultats de recherche');
        setSelectedEcole(null);
        setSelectedEcoleInfo(null);
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
                    console.log('Modifier les informations de connexion:', item);
                    // navigate(`/personnel/connexion/edit/${item.id}`);
                }
                break;
                
            case 'view':
                console.log('Voir les détails de connexion:', item);
                break;
                
            case 'delete':
                console.log('Supprimer l\'accès:', item);
                break;
                
            default:
                handleTableAction(actionType, item);
                break;
        }
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        if (selectedEcole) {
            searchConnexions(selectedEcole);
        }
        setRefreshTrigger(prev => prev + 1);
    }, [selectedEcole, searchConnexions]);

    // ===========================
    // GESTION DE L'EXPORT
    // ===========================
    const handleExportAll = useCallback(() => {
        console.log('Export des informations de connexion');
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
                        <PersonnelConnexionFilters
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={searchLoading}
                            error={searchError}
                            selectedEcole={selectedEcole}
                            onEcoleChange={setSelectedEcole}
                        />
                    </div>
                </div>

                {/* En-tête avec statistiques */}
                {searchPerformed && (
                    <div className="row">
                        <div className="col-lg-12">
                            <PersonnelConnexionStatsHeader 
                                connexions={connexions}
                                loading={searchLoading}
                                selectedEcoleInfo={selectedEcoleInfo}
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
                                    <FiShield size={24} color="white" />
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                        Prêt à consulter les informations de connexion ?
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        Sélectionnez une école dans le formulaire ci-dessus pour voir les informations de connexion du personnel
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
                                    title="Informations de Connexion Personnel"
                                    subtitle="compte(s) trouvé(s)"
                                    
                                    data={connexions}
                                    loading={searchLoading}
                                    error={null}
                                    
                                    columns={personnelConnexionTableConfig.columns}
                                    searchableFields={personnelConnexionTableConfig.searchableFields}
                                    filterConfigs={personnelConnexionTableConfig.filterConfigs}
                                    actions={personnelConnexionTableConfig.actions}
                                    
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    
                                    defaultPageSize={personnelConnexionTableConfig.pageSize}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={650}
                                    
                                    enableRefresh={true}
                                    enableCreate={false}
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
                {searchPerformed && connexions?.length === 0 && !searchLoading && (
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
                                    <FiUsers size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Aucune information de connexion trouvée
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Cette école n'a aucun personnel avec des informations de connexion ou les données ne sont pas encore disponibles.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PersonnelConnexion;