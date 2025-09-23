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
    Input,
    DatePicker,
    InputNumber
} from 'rsuite';
import { 
    FiSearch, 
    FiRotateCcw, 
    FiCalendar, 
    FiBookOpen, 
    FiBarChart,
    FiPlus,
    FiEye,
    FiEdit,
    FiTrash2
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { 
    useEvaluationsData,
    evaluationsTableConfig
} from './EvaluationService';
// Import des hooks unifiés depuis CommonDataService
import { 
    useClassesData, 
    useMatieresData,
    usePeriodesData
} from "../utils/CommonDataService";

// ===========================
// MODAL DE MODIFICATION D'ÉVALUATION
// ===========================
const ModificationModal = ({ 
    open, 
    onClose, 
    evaluation, 
    onSave 
}) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const { periodes } = usePeriodesData();

    useEffect(() => {
        if (evaluation && open) {
            setFormData({
                typeId: evaluation.type_id,
                periodeId: evaluation.periode_id,
                classeId: evaluation.classe_id,
                matiereId: evaluation.matiere_id,
                noteSur: evaluation.noteSur,
                date: evaluation.date ? new Date(evaluation.date) : new Date(),
                duree: evaluation.duree_raw
            });
        }
    }, [evaluation, open]);

    const handleSave = async () => {
        try {
            setLoading(true);
            if (onSave) {
                await onSave(formData);
            }
            onClose();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setLoading(false);
        }
    };

    const typesData = [
        { label: 'Interrogation', value: 3 },
        { label: 'Devoir', value: 2 },
        { label: 'Composition', value: 1 }
    ];

    const notesSurData = [
        { label: '/10', value: '10' },
        { label: '/20', value: '20' },
        { label: '/100', value: '100' }
    ];

    return (
        <Modal open={open} onClose={onClose} size="lg">
            <Modal.Header>
                <Modal.Title style={{ color: '#1e293b', fontWeight: '600' }}>
                    Modifier une évaluation
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                <Row gutter={20}>
                    <Col xs={24} sm={12}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: 8, 
                                fontWeight: '500', 
                                color: '#475569'
                            }}>
                                Type d'évaluation
                            </label>
                            <SelectPicker
                                data={typesData}
                                value={formData.typeId}
                                onChange={(value) => setFormData(prev => ({ ...prev, typeId: value }))}
                                placeholder="Sélectionner le type"
                                style={{ width: '100%' }}
                                cleanable={false}
                            />
                        </div>
                        
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: 8, 
                                fontWeight: '500', 
                                color: '#475569'
                            }}>
                                Période
                            </label>
                            <SelectPicker
                                data={periodes}
                                value={formData.periodeId}
                                onChange={(value) => setFormData(prev => ({ ...prev, periodeId: value }))}
                                placeholder="Sélectionner la période"
                                style={{ width: '100%' }}
                                cleanable={false}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: 8, 
                                fontWeight: '500', 
                                color: '#475569'
                            }}>
                                Classe
                            </label>
                            <Input
                                value={evaluation?.classe || ''}
                                disabled
                                style={{ width: '100%', backgroundColor: '#f8fafc' }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: 8, 
                                fontWeight: '500', 
                                color: '#475569'
                            }}>
                                Matière
                            </label>
                            <Input
                                value={evaluation?.matiere || ''}
                                disabled
                                style={{ width: '100%', backgroundColor: '#f8fafc' }}
                            />
                        </div>
                    </Col>

                    <Col xs={24} sm={12}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: 8, 
                                fontWeight: '500', 
                                color: '#475569'
                            }}>
                                Noté sur
                            </label>
                            <SelectPicker
                                data={notesSurData}
                                value={formData.noteSur}
                                onChange={(value) => setFormData(prev => ({ ...prev, noteSur: value }))}
                                placeholder="Sélectionner la note sur"
                                style={{ width: '100%' }}
                                cleanable={false}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: 8, 
                                fontWeight: '500', 
                                color: '#475569'
                            }}>
                                Date
                            </label>
                            <DatePicker
                                value={formData.date}
                                onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
                                format="dd/MM/yyyy HH:mm"
                                style={{ width: '100%' }}
                                showMeridian
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: 8, 
                                fontWeight: '500', 
                                color: '#475569'
                            }}>
                                Durée
                            </label>
                            <Input
                                value={formData.duree}
                                onChange={(value) => setFormData(prev => ({ ...prev, duree: value }))}
                                placeholder="00-15"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </Col>
                </Row>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={onClose} appearance="subtle">
                    Annuler
                </Button>
                <Button 
                    onClick={handleSave} 
                    appearance="primary" 
                    loading={loading}
                    style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                    }}
                >
                    Modifier
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE MODERNE
// ===========================
const EvaluationFilters = ({ 
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
    const { classes, classesLoading, classesError, refetch } = useClassesData();

    // Utilisation du hook unifié useMatieresData depuis CommonDataService
    const {
        matieres,
        loading: matieresLoading,
        error: matieresError,
        fetchMatieres,
        clearMatieres
    } = useMatieresData(); // Mode manuel : pas de paramètres automatiques

    const { 
        periodes, 
        loading: periodesLoading, 
        error: periodesError 
    } = usePeriodesData();

    // Charger les matières quand une classe est sélectionnée
    useEffect(() => {
        console.log('🔄 Effect déclenché pour classe:', selectedClasse);
        if (selectedClasse) {
            console.log('📚 Chargement des matières pour classe ID:', selectedClasse);
            fetchMatieres(selectedClasse, 38); // Utilisation manuelle du hook unifié
        } else {
            console.log('🗑️ Nettoyage des matières (pas de classe sélectionnée)');
            clearMatieres();
        }
    }, [selectedClasse, fetchMatieres, clearMatieres]);

    const handleSearch = useCallback(() => {
        if (!selectedClasse) {
            setFormError('Veuillez sélectionner une classe');
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
                    <FiCalendar size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Recherche des Évaluations
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Sélectionnez les critères pour filtrer les évaluations
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
                            style={{ width: '100%' }}
                            loading={classesLoading}
                            disabled={classesLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={8}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: 8, 
                            fontWeight: '500', 
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Matière (optionnel)
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
                            placeholder={matieresLoading ? "Chargement..." : matieres.length === 0 ? "Sélectionnez d'abord une classe" : "Toutes les matières"}
                            searchable
                            style={{ width: '100%' }}
                            loading={matieresLoading}
                            disabled={!selectedClasse || matieresLoading || loading}
                            cleanable={true}
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

                <Col xs={24} sm={12} md={4}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: 8, 
                            fontWeight: '500', 
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Période (optionnel)
                        </label>
                        <SelectPicker
                            data={periodes}
                            value={selectedPeriode}
                            onChange={onPeriodeChange}
                            placeholder="Toutes"
                            searchable
                            style={{ width: '100%' }}
                            loading={periodesLoading}
                            disabled={periodesLoading || loading}
                            cleanable={true}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={4}>
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
                                disabled={isDataLoading || loading}
                                style={{ 
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '500'
                                }}
                                size="lg"
                            >
                                {loading ? 'Recherche...' : 'Rechercher'}
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
                    current={selectedClasse ? (selectedMatiere || selectedPeriode ? 2 : 1) : 0} 
                    size="small"
                    style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}
                >
                    <Steps.Item title="Classe" />
                    <Steps.Item title="Filtres" />
                    <Steps.Item title="Résultats" />
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
// COMPOSANT PRINCIPAL DES ÉVALUATIONS
// ===========================
const Evaluations = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [selectedPeriode, setSelectedPeriode] = useState(null);
    const [showModificationModal, setShowModificationModal] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);

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
    } = useEvaluationsData();

    // ===========================
    // GESTION DE LA RECHERCHE
    // ===========================
    const handleSearch = useCallback(async ({ classeId, matiereId, periodeId }) => {
        console.log('🔍 Lancement de la recherche des évaluations:', { classeId, matiereId, periodeId });
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

        // Gestion spécifique pour l'action "voir" - Navigation vers le détail
        if (actionType === 'view' && item && item.code) {
            navigate(`/evaluations/detail/${item.code}`);
            return;
        }

        // Gestion spécifique pour l'action "modifier" - Ouvrir le modal
        if (actionType === 'edit' && item) {
            setSelectedEvaluation(item);
            setShowModificationModal(true);
            return;
        }

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            navigate('/evaluations/create');
            return;
        }

        // Pour les autres actions (delete, download, etc.), utiliser le modal par défaut
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU MODAL DE MODIFICATION
    // ===========================
    const handleModificationSave = useCallback(async (formData) => {
        try {
            console.log('Sauvegarde des modifications:', formData);
            // Ici vous pouvez ajouter l'appel API pour modifier l'évaluation
            // await updateEvaluation(selectedEvaluation.id, formData);

            // Actualiser les données après modification
            if (selectedClasse) {
                await searchEvaluations(selectedClasse, selectedMatiere, selectedPeriode);
            }
            
            setShowModificationModal(false);
            setSelectedEvaluation(null);
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
        }
    }, [selectedEvaluation, selectedClasse, selectedMatiere, selectedPeriode, searchEvaluations]);

    // ===========================
    // GESTION DU MODAL PAR DÉFAUT
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
        if (selectedClasse) {
            searchEvaluations(selectedClasse, selectedMatiere, selectedPeriode);
        }
    }, [selectedClasse, selectedMatiere, selectedPeriode, searchEvaluations]);

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
                        <EvaluationFilters
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
                                    <FiCalendar size={24} color="white" />
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                        Prêt à consulter les évaluations ?
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        Sélectionnez au minimum une classe dans le formulaire ci-dessus pour démarrer
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
                                    title="Liste des Évaluations"
                                    subtitle="évaluation(s) trouvée(s)"
                                    
                                    data={evaluations}
                                    loading={searchLoading}
                                    error={null}
                                    
                                    columns={evaluationsTableConfig.columns}
                                    searchableFields={evaluationsTableConfig.searchableFields}
                                    filterConfigs={evaluationsTableConfig.filterConfigs}
                                    actions={evaluationsTableConfig.actions}
                                    
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={handleCreateEvaluation}
                                    
                                    defaultPageSize={15}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={600}
                                    
                                    enableRefresh={true}
                                    enableCreate={true}
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
                                    Aucune évaluation trouvée
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Aucun résultat pour ces critères de recherche. Essayez d'élargir vos filtres.
                                </p>
                                <Button
                                    appearance="primary"
                                    style={{ 
                                        marginTop: 15,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                    startIcon={<FiPlus />}
                                    onClick={handleCreateEvaluation}
                                >
                                    Créer une nouvelle évaluation
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de modification */}
            <ModificationModal
                open={showModificationModal}
                onClose={() => {
                    setShowModificationModal(false);
                    setSelectedEvaluation(null);
                }}
                evaluation={selectedEvaluation}
                onSave={handleModificationSave}
            />

            {/* Modal pour les autres actions (delete, etc.) */}
            {modalState.isOpen && (
                <Modal open={modalState.isOpen} onClose={handleCloseModal}>
                    <Modal.Header>
                        <Modal.Title>
                            {modalState.type === 'delete' ? 'Supprimer l\'évaluation' : 'Action'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {modalState.type === 'delete' && (
                            <p>Êtes-vous sûr de vouloir supprimer cette évaluation ?</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleCloseModal} appearance="subtle">
                            Annuler
                        </Button>
                        <Button onClick={handleModalSave} appearance="primary" color="red">
                            {modalState.type === 'delete' ? 'Supprimer' : 'Confirmer'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
};

export default Evaluations;