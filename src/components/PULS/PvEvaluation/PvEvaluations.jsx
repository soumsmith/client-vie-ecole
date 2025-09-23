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
    Notification,
    toaster
} from 'rsuite';
import { 
    FiSearch, 
    FiRotateCcw, 
    FiCalendar, 
    FiBookOpen, 
    FiFileText,
    FiPlus,
    FiDownload
} from 'react-icons/fi';
import './PvEvaluations.css';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import {  
    usePvEvaluationsData,
    pvEvaluationsTableConfig,
    downloadPvEvaluation
} from './PvEvaluationService';
import { usePeriodesData, useClassesData, useMatieresData } from "../utils/CommonDataService";

// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE MODERNE
// ===========================
const PvEvaluationFilters = ({ 
    onSearch, 
    onClear, 
    loading = false, 
    error = null,
    selectedClasse,
    selectedMatiere,
    selectedPeriode,
    onClasseChange,
    onMatiereChange,
    onPeriodeChange
}) => {
    const [formError, setFormError] = useState(null);

    const { 
        classes, 
        loading: classesLoading, 
        error: classesError 
    } = useClassesData(38);

    const {
        matieres,
        loading: matieresLoading,
        error: matieresError,
        fetchMatieres,
        clearMatieres
    } = useMatieresData();

    const { 
        periodes, 
        loading: periodesLoading, 
        error: periodesError 
    } = usePeriodesData(2);

    // Charger les matières quand une classe est sélectionnée
    useEffect(() => {
        console.log('🔄 Effect déclenché pour classe:', selectedClasse);
        if (selectedClasse) {
            console.log('📚 Chargement des matières pour classe ID:', selectedClasse);
            fetchMatieres(selectedClasse, 38);
        } else {
            console.log('🗑️ Nettoyage des matières (pas de classe sélectionnée)');
            clearMatieres();
        }
    }, [selectedClasse]);

    const handleSearch = useCallback(() => {
        if (!selectedClasse) {
            setFormError('Veuillez sélectionner une classe');
            return;
        }

        if (!selectedMatiere) {
            setFormError('Veuillez sélectionner une matière');
            return;
        }

        if (!selectedPeriode) {
            setFormError('Veuillez sélectionner une période');
            return;
        }

        setFormError(null);
        if (onSearch) {
            onSearch({ 
                classeId: selectedClasse, 
                matiereId: selectedMatiere,
                periodeId: selectedPeriode
            });
        }
    }, [selectedClasse, selectedMatiere, selectedPeriode, onSearch]);

    const handleClear = useCallback(() => {
        setFormError(null);
        if (onClear) onClear();
    }, [onClear]);

    const isDataLoading = classesLoading || periodesLoading || matieresLoading;
    const hasDataError = classesError || periodesError || matieresError;

    return (
        <div className="pv-filters-container">
            {/* En-tête moderne */}
            <div className="pv-filters-header">
                <div className="pv-filters-icon">
                    <FiFileText size={18} color="white" />
                </div>
                <div>
                    <h5 className="pv-filters-title">
                        Recherche des PV Évaluations
                    </h5>
                    <p className="pv-filters-subtitle">
                        Sélectionnez une classe, une matière et une période pour afficher les PV
                    </p>
                </div>
            </div>

            {/* Messages d'erreur compacts */}
            {hasDataError && (
                <div className="pv-error-message">
                    <Message type="error" showIcon className="pv-error-data">
                        Erreur de chargement des données
                    </Message>
                </div>
            )}

            {(formError || error) && (
                <div className="pv-error-message">
                    <Message type="warning" showIcon className="pv-error-form">
                        {formError || error?.message}
                    </Message>
                </div>
            )}

            {/* Formulaire de filtres */}
            <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                    <div className="pv-form-group">
                        <label className="pv-form-label">
                            Classe *
                        </label>
                        <SelectPicker
                            data={classes}
                            value={selectedClasse}
                            onChange={(value) => {
                                console.log('🏫 Classe sélectionnée:', value);
                                onClasseChange(value);
                                // Réinitialiser la matière quand on change de classe
                                if (onMatiereChange) onMatiereChange(null);
                            }}
                            placeholder="Choisir une classe"
                            searchable
                            className="pv-select-picker"
                            loading={classesLoading}
                            disabled={classesLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div className="pv-form-group">
                        <label className="pv-form-label">
                            Matière *
                        </label>
                        <SelectPicker
                            data={matieres.map(matiere => {
                                console.log('🏷️ Formatage matière pour dropdown:', matiere);
                                return {
                                    value: matiere.id,
                                    label: matiere.libelle,
                                    id: matiere.id
                                };
                            })}
                            value={selectedMatiere}
                            onChange={(value) => {
                                console.log('📚 Matière sélectionnée:', value);
                                onMatiereChange(value);
                            }}
                            placeholder={matieresLoading ? "Chargement..." : matieres.length === 0 ? "Sélectionnez d'abord une classe" : "Choisir une matière"}
                            searchable
                            className="pv-select-picker"
                            loading={matieresLoading}
                            disabled={!selectedClasse || matieresLoading || loading}
                            cleanable={false}
                            size="lg"
                            renderMenu={menu => {
                                if (matieres.length === 0 && !matieresLoading) {
                                    return (
                                        <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                                            {selectedClasse ? 'Aucune matière trouvée pour cette classe' : 'Sélectionnez d\'abord une classe'}
                                        </div>
                                    );
                                }
                                return menu;
                            }}
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div className="pv-form-group">
                        <label className="pv-form-label">
                            Période *
                        </label>
                        <SelectPicker
                            data={periodes}
                            value={selectedPeriode}
                            onChange={onPeriodeChange}
                            placeholder="Choisir une période"
                            searchable
                            className="pv-select-picker"
                            loading={periodesLoading}
                            disabled={periodesLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div className="pv-form-group">
                        <label className="pv-form-label-transparent">
                            Action
                        </label>
                        <div className="pv-actions-container">
                            <Button
                                appearance="primary"
                                onClick={handleSearch}
                                loading={loading}
                                disabled={isDataLoading || loading || !selectedClasse || !selectedMatiere || !selectedPeriode}
                                className="pv-search-button"
                                size="lg"
                            >
                                {loading ? 'Recherche...' : 'Rechercher'}
                            </Button>
                            
                            <Button
                                onClick={handleClear}
                                disabled={loading}
                                className="pv-clear-button"
                                size="lg"
                            >
                                <FiRotateCcw size={16} />
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Indicateur de progression */}
            <div className="pv-steps-container">
                <Steps 
                    current={selectedClasse ? (selectedMatiere ? (selectedPeriode ? 3 : 2) : 1) : 0} 
                    size="small"
                    className="pv-steps-background"
                >
                    <Steps.Item title="Classe" />
                    <Steps.Item title="Matière" />
                    <Steps.Item title="Période" />
                    <Steps.Item title="PV" />
                </Steps>
            </div>

            {/* Loading indicator discret */}
            {isDataLoading && (
                <div className="pv-loading-indicator">
                    <Loader size="xs" />
                    <span className="pv-loading-text">
                        Chargement des données...
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL DES PV ÉVALUATIONS
// ===========================
const PvEvaluations = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [selectedPeriode, setSelectedPeriode] = useState(null);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        evaluations,
        loading: searchLoading,
        error: searchError,
        searchPerformed,
        searchEvaluations,
        clearResults
    } = usePvEvaluationsData();

    // ===========================
    // FONCTION DE TÉLÉCHARGEMENT
    // ===========================
    const handleDownloadPv = useCallback(async (evaluation) => {
        if (!evaluation || !evaluation.id) {
            toaster.push(
                <Notification type="warning" header="Erreur">
                    Impossible de télécharger : évaluation non valide
                </Notification>,
                { placement: 'topEnd', duration: 4000 }
            );
            return;
        }

        if (!selectedClasse) {
            toaster.push(
                <Notification type="warning" header="Erreur">
                    Impossible de télécharger : classe non sélectionnée
                </Notification>,
                { placement: 'topEnd', duration: 4000 }
            );
            return;
        }
        
        try {
            console.log('🔽 Téléchargement du PV pour classe:', selectedClasse, 'évaluation:', evaluation);
            
            await downloadPvEvaluation(selectedClasse, evaluation.id);
            
            toaster.push(
                <Notification type="success" header="Téléchargement initié">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiDownload />
                        <span>Le téléchargement du PV a été lancé !</span>
                    </div>
                </Notification>,
                { placement: 'topEnd', duration: 3000 }
            );
            
        } catch (error) {
            console.error('❌ Erreur lors du téléchargement:', error);
            
            toaster.push(
                <Notification type="error" header="Erreur de téléchargement">
                    {error.message || 'Impossible de télécharger le PV'}
                </Notification>,
                { placement: 'topEnd', duration: 5000 }
            );
        }
    }, [selectedClasse]);

    // ===========================
    // GESTION DE LA RECHERCHE
    // ===========================
    const handleSearch = useCallback(async ({ classeId, matiereId, periodeId }) => {
        console.log('🔍 Lancement de la recherche des PV évaluations:', { classeId, matiereId, periodeId });
        await searchEvaluations(classeId, matiereId, periodeId);
    }, [searchEvaluations]);

    const handleClearSearch = useCallback(() => {
        console.log('🗑️ Effacement des résultats de recherche');
        setSelectedClasse(null);
        setSelectedMatiere(null);
        setSelectedPeriode(null);
        clearResults();
    }, [clearResults]);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "télécharger"
        if (actionType === 'download') {
            handleDownloadPv(item);
            return;
        }

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            navigate(`/evaluations/edit/${item.id}`);
            return;
        }

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            navigate('/evaluations/create');
            return;
        }

        // Gestion spécifique pour l'action "pv" - générer le PV complet
        if (actionType === 'pv' && item && item.id) {
            console.log('Génération du PV pour évaluation:', item.id);
            // Ici vous pouvez ajouter la logique pour générer le PV complet
            // navigate(`/pv-evaluations/generate/${item.id}`);
            return;
        }

        // Pour les autres actions (delete, view, etc.), utiliser le modal
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction, handleDownloadPv]);

    // ===========================
    // GESTION DU MODAL
    // ===========================
    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer l\'évaluation:', modalState.selectedItem);
                    // Ici vous pouvez ajouter la logique de suppression
                    // await deleteEvaluation(modalState.selectedItem.id);

                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir le PV de l\'évaluation:', modalState.selectedItem);
                    break;

                case 'download':
                    console.log('Télécharger le PV:', modalState.selectedItem);
                    // Cette action est maintenant gérée directement dans handleTableActionLocal
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
    const handleCreateEvaluation = useCallback(() => {
        navigate('/evaluations/create');
    }, [navigate]);

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
        <div className="pv-evaluations-container">
            <div className="container-fluid">
                {/* Formulaire de recherche */}
                <div className="row">
                    <div className="col-lg-12">
                        <PvEvaluationFilters
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={searchLoading}
                            error={searchError}
                            selectedClasse={selectedClasse}
                            selectedMatiere={selectedMatiere}
                            selectedPeriode={selectedPeriode}
                            onClasseChange={setSelectedClasse}
                            onMatiereChange={setSelectedMatiere}
                            onPeriodeChange={setSelectedPeriode}
                        />
                    </div>
                </div>

                {/* Message d'information moderne */}
                {!searchPerformed && !searchLoading && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div className="pv-info-card">
                                <div className="pv-info-icon">
                                    <FiFileText size={24} color="white" />
                                </div>
                                <div>
                                    <h6 className="pv-info-title">
                                        Prêt à consulter les PV d'évaluation ?
                                    </h6>
                                    <p className="pv-info-description">
                                        Sélectionnez une classe, une matière et une période dans le formulaire ci-dessus
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
                            <div className="pv-error-card">
                                <div className="pv-error-icon">
                                    <span style={{ fontSize: '24px' }}>⚠️</span>
                                </div>
                                <div>
                                    <h6 className="pv-error-title">
                                        Erreur de recherche
                                    </h6>
                                    <p className="pv-error-description">
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
                            <div className="pv-datatable-container">
                                <DataTable
                                    title="PV des Évaluations"
                                    subtitle="évaluation(s) trouvée(s)"
                                    
                                    data={evaluations}
                                    loading={searchLoading}
                                    error={null}
                                    
                                    columns={pvEvaluationsTableConfig.columns}
                                    searchableFields={pvEvaluationsTableConfig.searchableFields}
                                    filterConfigs={pvEvaluationsTableConfig.filterConfigs}
                                    actions={pvEvaluationsTableConfig.actions}
                                    
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={handleCreateEvaluation}
                                    
                                    defaultPageSize={15}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={600}
                                    
                                    enableRefresh={true}
                                    enableCreate={false}
                                    createButtonText="Nouvelle Évaluation"
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
                {searchPerformed && evaluations?.length === 0 && !searchLoading && (
                    <div className="row mt-3">
                        <div className="col-lg-12">
                            <div className="pv-no-results-card">
                                <div className="pv-no-results-icon">
                                    <FiFileText size={40} color="white" />
                                </div>
                                <h5 className="pv-no-results-title">
                                    Aucune évaluation trouvée
                                </h5>
                                <p className="pv-no-results-description">
                                    Aucun PV d'évaluation pour ces critères de recherche. Vérifiez vos filtres.
                                </p>
                                {/* <Button
                                    appearance="primary"
                                    className="pv-create-button"
                                    startIcon={<FiPlus />}
                                    onClick={handleCreateEvaluation}
                                >
                                    Créer une nouvelle évaluation
                                </Button> */}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal pour les actions (à implémenter selon vos besoins) */}
            {/* Vous pouvez ajouter ici un modal similaire aux autres composants */}
        </div>
    );
};

export default PvEvaluations;