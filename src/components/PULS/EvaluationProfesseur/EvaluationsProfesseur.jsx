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
    Steps
} from 'rsuite';
import {
    FiSearch,
    FiRotateCcw,
    FiCalendar,
    FiUser,
    FiBarChart,
    FiPlus,
    FiTrendingUp
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import {
    useStatistiquesProfesseurData,
    statistiquesProfesseurTableConfig
} from './EvaluationProfesseurService';

import {
    usePeriodesData,
    useEnseignantsData
} from "../utils/CommonDataService";
import GradientButton from '../../GradientButton';
import IconBox from "../Composant/IconBox";

// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE MODERNE
// ===========================
const EvaluationProfesseurFilters = ({
    onSearch,
    onClear,
    loading = false,
    error = null,
    selectedEnseignant,
    selectedPeriode,
    onEnseignantChange,
    onPeriodeChange,
    profProfilId
}) => {
    const [formError, setFormError] = useState(null);

    const { enseignants, enseignantsLoading, enseignantsError, refetch } = useEnseignantsData(profProfilId);

    const {
        periodes,
        loading: periodesLoading,
        error: periodesError
    } = usePeriodesData();


    const handleSearch = useCallback(() => {
        if (!selectedEnseignant) {
            setFormError('Veuillez sélectionner un enseignant');
            return;
        }

        if (!selectedPeriode) {
            setFormError('Veuillez sélectionner une période');
            return;
        }

        setFormError(null);
        if (onSearch) {
            onSearch({
                enseignantId: selectedEnseignant,
                periodeId: selectedPeriode
            });
        }
    }, [selectedEnseignant, selectedPeriode, onSearch]);

    const handleClear = useCallback(() => {
        setFormError(null);
        if (onClear) onClear();
    }, [onClear]);

    const isDataLoading = enseignantsLoading || periodesLoading;
    const hasDataError = enseignantsError || periodesError;

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
                <IconBox icon={FiBarChart} />
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Statistiques des évaluations par professeur
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Sélectionnez un enseignant et une période pour voir les statistiques
                    </p>
                </div>
            </div>

            {/* Messages d'erreur compacts */}
            {hasDataError && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="error" showIcon style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                        Erreur de chargement des données
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
                <Col xs={24} sm={12} md={8}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Enseignant *
                        </label>
                        <SelectPicker
                            data={enseignants}
                            value={selectedEnseignant}
                            onChange={(value) => {
                                onEnseignantChange(value);
                            }}
                            placeholder="Choisir un enseignant"
                            searchable
                            style={{ width: '100%' }}
                            loading={enseignantsLoading}
                            disabled={enseignantsLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={10}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Période *
                        </label>
                        <SelectPicker
                            data={periodes}
                            value={selectedPeriode}
                            onChange={onPeriodeChange}
                            placeholder="Choisir une période"
                            searchable
                            style={{ width: '100%' }}
                            loading={periodesLoading}
                            disabled={periodesLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={6} md={6}>
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

                            <GradientButton
                                icon={<FiSearch size={16} />}
                                text="Recherche"
                                loadingText="Chargement..."
                                loading={loading}
                                disabled={isDataLoading || loading || !selectedEnseignant || !selectedPeriode}
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
                    current={selectedEnseignant ? (selectedPeriode ? 2 : 1) : 0}
                    size="small"
                    style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}
                >
                    <Steps.Item title="Enseignant" />
                    <Steps.Item title="Période" />
                    <Steps.Item title="Statistiques" />
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
                        Chargement des données...
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT D'INFORMATION PROFESSEUR
// ===========================
const ProfesseurInfoCard = ({ professeurInfo, selectedEnseignantName, selectedPeriodeName }) => {
    if (!professeurInfo) return null;

    return (
        <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.15)',
            marginBottom: '20px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                marginBottom: 15
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiUser size={20} color="white" />
                </div>
                <div>
                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                        {professeurInfo.nomPrenoms}
                    </h6>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        {selectedPeriodeName} • Maximum d'évaluations: {professeurInfo.max}
                    </p>
                </div>
            </div>

            {/* Badge récapitulatif */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Badge color="blue" style={{ fontSize: '12px' }}>
                    ID: {professeurInfo.profPersonnelId}
                </Badge>
                <Badge color="green" style={{ fontSize: '12px' }}>
                    Max: {professeurInfo.max} évaluation(s)
                </Badge>
            </div>
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL DES ÉVALUATIONS PROFESSEUR
// ===========================
const EvaluationsProfesseur = ({ profProfilId }) => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedEnseignant, setSelectedEnseignant] = useState(null);
    const [selectedPeriode, setSelectedPeriode] = useState(null);
    const [selectedEnseignantName, setSelectedEnseignantName] = useState('');
    const [selectedPeriodeName, setSelectedPeriodeName] = useState('');

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        statistiques,
        professeurInfo,
        loading: searchLoading,
        error: searchError,
        searchPerformed,
        searchStatistiques,
        clearResults
    } = useStatistiquesProfesseurData();



    // Hook pour récupérer les noms des sélections
    const { enseignants } = useEnseignantsData(profProfilId);

    const { periodes } = usePeriodesData();

    // ===========================
    // GESTION DE LA RECHERCHE
    // ===========================
    const handleSearch = useCallback(async ({ enseignantId, periodeId }) => {

        // Récupérer les noms pour l'affichage
        const enseignant = enseignants.find(e => e.id === enseignantId);
        const periode = periodes.find(p => p.id === periodeId);

        setSelectedEnseignantName(enseignant?.nomComplet || 'Enseignant inconnu');
        setSelectedPeriodeName(periode?.libelle || 'Période inconnue');

        await searchStatistiques(enseignantId, periodeId);
    }, [searchStatistiques, enseignants, periodes]);

    const handleClearSearch = useCallback(() => {
        console.log('🗑️ Effacement des résultats de recherche');
        setSelectedEnseignant(null);
        setSelectedPeriode(null);
        setSelectedEnseignantName('');
        setSelectedPeriodeName('');
        clearResults();
    }, [clearResults]);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "chart"
        if (actionType === 'chart' && item && item.id) {
            console.log('Affichage des graphiques pour:', item);
            // Ici vous pouvez ajouter la logique pour afficher les graphiques
            return;
        }

        // Pour les autres actions (view, download, etc.), utiliser le modal
        handleTableAction(actionType, item);
    }, [handleTableAction]);

    // ===========================
    // GESTION DU MODAL
    // ===========================
    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'view':
                    console.log('Voir les détails des statistiques:', modalState.selectedItem);
                    break;

                case 'download':
                    console.log('Télécharger le rapport:', modalState.selectedItem);
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
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
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
                        <EvaluationProfesseurFilters
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={searchLoading}
                            error={searchError}
                            profProfilId={profProfilId}
                            selectedEnseignant={selectedEnseignant}
                            selectedPeriode={selectedPeriode}
                            onEnseignantChange={setSelectedEnseignant}
                            onPeriodeChange={setSelectedPeriode}
                        />
                    </div>
                </div>

                {/* Information du professeur */}
                {searchPerformed && professeurInfo && (
                    <div className="row">
                        <div className="col-lg-12">
                            <ProfesseurInfoCard
                                professeurInfo={professeurInfo}
                                selectedEnseignantName={selectedEnseignantName}
                                selectedPeriodeName={selectedPeriodeName}
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
                                    <FiTrendingUp size={24} color="white" />
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                        Prêt à analyser les statistiques d'un professeur ?
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        Sélectionnez un enseignant et une période dans le formulaire ci-dessus
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
                                    title="Statistiques des évaluations par professeur"
                                    subtitle="classe(s) avec statistiques"

                                    data={statistiques}
                                    loading={searchLoading}
                                    error={null}

                                    columns={statistiquesProfesseurTableConfig.columns}
                                    searchableFields={statistiquesProfesseurTableConfig.searchableFields}
                                    filterConfigs={statistiquesProfesseurTableConfig.filterConfigs}
                                    actions={statistiquesProfesseurTableConfig.actions}

                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}

                                    defaultPageSize={15}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={600}

                                    enableRefresh={true}
                                    enableCreate={false}
                                    selectable={false}
                                    rowKey="id"

                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { minHeight: "600px", border: "none", boxShadow: "none" },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Aucun résultat - style moderne */}
                {searchPerformed && statistiques?.length === 0 && !searchLoading && (
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
                                    <FiBarChart size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Aucune statistique trouvée
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Aucune donnée d'évaluation pour cet enseignant durant cette période.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvaluationsProfesseur;