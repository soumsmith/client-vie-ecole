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
    FiUser,
    FiUsers,
    FiBookOpen,
    FiPlus
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import {
    useElevesData,
    elevesTableConfig
} from './EleveService';
import { useNiveauxBranchesData, useClassesByBrancheData } from "../utils/CommonDataService";

// Import du modal d'affectation
import ModalAffectationEleves from './ModalAffectationEleves';
import GradientButton from '../../GradientButton';
import IconBox from "../Composant/IconBox";
import StatistiquesEleves from './Statistiqueseleves';


// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE MODERNE
// ===========================
const EleveFilters = ({
    onSearch,
    onClear,
    loading = false,
    error = null,
    selectedBranche,
    selectedClasse,
    onBrancheChange,
    onClasseChange
}) => {
    const [formError, setFormError] = useState(null);

    const { branches, loading: branchesLoading, error: branchesError } = useNiveauxBranchesData();

    const {
        classes,
        loading: classesLoading,
        error: classesError,
        fetchClasses,
        clearClasses
    } = useClassesByBrancheData();

    // Charger les classes quand une branche est sélectionnée
    useEffect(() => {
        console.log('🔄 Effect déclenché pour branche:', selectedBranche);
        if (selectedBranche) {
            console.log('🏫 Chargement des classes pour branche ID:', selectedBranche);
            fetchClasses(selectedBranche, 139);
        } else {
            console.log('🗑️ Nettoyage des classes (pas de branche sélectionnée)');
            clearClasses();
        }
    }, [selectedBranche]);

    const handleSearch = useCallback(() => {
        if (!selectedBranche) {
            setFormError('Veuillez sélectionner une branche');
            return;
        }

        if (!selectedClasse) {
            setFormError('Veuillez sélectionner une classe');
            return;
        }

        setFormError(null);
        if (onSearch) {
            onSearch({
                brancheId: selectedBranche,
                classeId: selectedClasse
            });
        }
    }, [selectedBranche, selectedClasse, onSearch]);

    const handleClear = useCallback(() => {
        setFormError(null);
        if (onClear) onClear();
    }, [onClear]);

    const isDataLoading = branchesLoading || classesLoading;
    const hasDataError = branchesError || classesError;

    const branchesData = branches.map(branche => ({
        value: branche.id,
        label: branche.label
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
                <IconBox icon={FiUsers} />
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Liste des Élèves par Classe
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Sélectionnez une branche et une classe pour afficher les élèves
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
                <Col xs={24} sm={12} md={10}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Branche *
                        </label>

                        <SelectPicker
                            data={branchesData}
                            autoFocus
                            value={selectedBranche}
                            onChange={(value) => {
                                console.log('🌿 Branche sélectionnée:', value);
                                onBrancheChange(value);
                                // Réinitialiser la classe quand on change de branche
                                if (onClasseChange) onClasseChange(null);
                            }}
                            placeholder="Choisir une branche"
                            searchable
                            style={{ width: '100%' }}
                            loading={branchesLoading}
                            disabled={branchesLoading || loading}
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
                            Classe *
                        </label>
                        <SelectPicker
                            data={classes.map(classe => {
                                console.log('🏫 Formatage classe pour dropdown:', classe);
                                return {
                                    value: classe.id,
                                    label: classe.display_text,
                                    id: classe.id
                                };
                            })}
                            value={selectedClasse}
                            onChange={(value) => {
                                console.log('🏫 Classe sélectionnée:', value);
                                onClasseChange(value);
                            }}
                            placeholder={classesLoading ? "Chargement..." : classes.length === 0 ? "Sélectionnez d'abord une branche" : "Choisir une classe"}
                            searchable
                            style={{ width: '100%' }}
                            loading={classesLoading}
                            disabled={!selectedBranche || classesLoading || loading}
                            cleanable={false}
                            size="lg"
                            renderMenu={menu => {
                                if (classes.length === 0 && !classesLoading) {
                                    return (
                                        <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                                            {selectedBranche ? 'Aucune classe trouvée pour cette branche' : 'Sélectionnez d\'abord une branche'}
                                        </div>
                                    );
                                }
                                return menu;
                            }}
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
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
                                disabled={isDataLoading || loading || !selectedBranche || !selectedClasse}
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
                    current={selectedBranche ? (selectedClasse ? 2 : 1) : 0}
                    size="small"
                    style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}
                >
                    <Steps.Item title="Branche" />
                    <Steps.Item title="Classe" />
                    <Steps.Item title="Élèves" />
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
// COMPOSANT PRINCIPAL DES ÉLÈVES
// ===========================
const Eleves = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedBranche, setSelectedBranche] = useState(null);
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedClasseInfo, setSelectedClasseInfo] = useState(null);
    const [showModalAffectation, setShowModalAffectation] = useState(false);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        eleves,
        loading: searchLoading,
        error: searchError,
        searchPerformed,
        searchEleves,
        clearResults
    } = useElevesData();
    const apiUrls = useAllApiUrls();

    const { classes } = useClassesByBrancheData();

    // ===========================
    // GESTION DE LA RECHERCHE
    // ===========================
    const handleSearch = useCallback(async ({ brancheId, classeId }) => {
        console.log('🔍 Lancement de la recherche des élèves:', { brancheId, classeId });

        // Récupérer les infos de la classe sélectionnée
        const selectedClasseData = classes.find(c => c.id === classeId);
        if (selectedClasseData) {
            setSelectedClasseInfo({
                id: selectedClasseData.id,
                libelle: selectedClasseData.libelle,
                branche: selectedClasseData.branche_libelle,
                effectifMax: selectedClasseData.effectif,
                effectifActuel: 0 // Sera mis à jour après le chargement
            });
        }

        await searchEleves(classeId);
    }, [searchEleves, classes]);

    const handleClearSearch = useCallback(() => {
        console.log('🗑️ Effacement des résultats de recherche');
        setSelectedBranche(null);
        setSelectedClasse(null);
        setSelectedClasseInfo(null);
        clearResults();
    }, [clearResults]);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback(async (actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "retirer"
        if (actionType === 'remove' && item && item.id) {
            const result = await Swal.fire({
                title: 'Confirmer la suppression',
                text: `Voulez-vous vraiment retirer l'élève ${item.nomComplet} de la classe ?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Oui, retirer',
                cancelButtonText: 'Annuler',
                reverseButtons: true
            });

            if (!result.isConfirmed) {
                return;
            }

            try {
                // Afficher un loader
                Swal.fire({
                    title: 'Suppression en cours...',
                    text: 'Veuillez patienter',
                    allowOutsideClick: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Appel API pour supprimer l'élève
                const response = await axios.delete(
                    apiUrls.eleves.delete(item.id),
                    {
                        timeout: 10000
                    }
                );

                if (response.status === 200) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Élève retiré !',
                        text: `${item.nomComplet} a été retiré de la classe avec succès.`,
                        confirmButtonColor: '#10b981',
                        timer: 3000,
                        showConfirmButton: true
                    });

                    // Rafraîchir la liste
                    if (selectedClasse) {
                        await searchEleves(selectedClasse);
                    }
                } else {
                    throw new Error(`Réponse inattendue du serveur: ${response.status}`);
                }

            } catch (error) {
                console.error('Erreur lors de la suppression:', error);

                let errorMessage = 'Une erreur inattendue est survenue lors de la suppression.';

                if (error.response) {
                    if (error.response.status === 404) {
                        errorMessage = 'Élève non trouvé. Il a peut-être déjà été retiré.';
                    } else if (error.response.status === 403) {
                        errorMessage = 'Vous n\'avez pas les permissions pour retirer cet élève.';
                    } else if (error.response.status === 500) {
                        errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                    } else {
                        errorMessage = `Erreur serveur: ${error.response.status}`;
                    }
                } else if (error.request) {
                    errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
                } else if (error.code === 'ECONNABORTED') {
                    errorMessage = 'La requête a expiré. Le serveur met trop de temps à répondre.';
                }

                await Swal.fire({
                    icon: 'error',
                    title: 'Erreur de suppression',
                    text: errorMessage,
                    confirmButtonColor: '#ef4444'
                });
            }
            return;
        }

        // Gestion spécifique pour l'action "créer" - Ouvrir le modal d'affectation
        if (actionType === 'create') {
            if (!selectedBranche || !selectedClasse) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Sélection requise',
                    text: 'Veuillez d\'abord sélectionner une branche et une classe.',
                    confirmButtonColor: '#f59e0b'
                });
                return;
            }
            setShowModalAffectation(true);
            return;
        }

        // Pour les autres actions, utiliser le comportement par défaut
        handleTableAction(actionType, item);
    }, [selectedBranche, selectedClasse, searchEleves, handleTableAction, apiUrls.eleves]);

    // ===========================
    // GESTION DU MODAL D'AFFECTATION
    // ===========================
    const handleAffectationSuccess = useCallback(async (newAffectations) => {
        console.log('Nouvelles affectations créées:', newAffectations);

        // Rafraîchir la liste des élèves
        if (selectedClasse) {
            await searchEleves(selectedClasse);
        }

        setRefreshTrigger(prev => prev + 1);
    }, [selectedClasse, searchEleves]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        if (selectedClasse) {
            searchEleves(selectedClasse);
        }
        setRefreshTrigger(prev => prev + 1);
    }, [selectedClasse, searchEleves]);

    // Mettre à jour l'effectif actuel quand les élèves sont chargés
    useEffect(() => {
        if (selectedClasseInfo && eleves) {
            setSelectedClasseInfo(prev => ({
                ...prev,
                effectifActuel: eleves.length
            }));
        }
    }, [eleves, selectedClasseInfo]);

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
                        <EleveFilters
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={searchLoading}
                            error={searchError}
                            selectedBranche={selectedBranche}
                            selectedClasse={selectedClasse}
                            onBrancheChange={setSelectedBranche}
                            onClasseChange={setSelectedClasse}
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
                                    <FiUsers size={24} color="white" />
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                        Prêt à consulter la liste des élèves ?
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        Sélectionnez une branche et une classe dans le formulaire ci-dessus pour démarrer
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

                {searchPerformed && eleves?.length > 0 && (
    <div className="row mb-4">
        <div className="col-lg-12">
            <StatistiquesEleves 
                eleves={eleves} 
                classeInfo={selectedClasseInfo}
            />
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
                                    title={`Liste des Élèves - ${selectedClasseInfo?.libelle || 'Classe'}`}
                                    subtitle={`élève(s) • Capacité: ${selectedClasseInfo?.effectifActuel || 0}/${selectedClasseInfo?.effectifMax || 0}`}

                                    data={eleves}
                                    loading={searchLoading}
                                    error={null}

                                    columns={elevesTableConfig.columns}
                                    searchableFields={elevesTableConfig.searchableFields}
                                    filterConfigs={elevesTableConfig.filterConfigs}
                                    actions={elevesTableConfig.actions}

                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={() => handleTableActionLocal('create')}

                                    defaultPageSize={15}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={600}

                                    enableRefresh={true}
                                    enableCreate={true}
                                    createButtonText="Affecter des Élèves"
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
                {searchPerformed && eleves?.length === 0 && !searchLoading && (
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
                                    Aucun élève trouvé
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                                    Cette classe ne contient aucun élève ou les données ne sont pas encore disponibles.
                                </p>
                                <Button
                                    appearance="primary"
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                    startIcon={<FiPlus />}
                                    onClick={() => handleTableActionLocal('create')}
                                    disabled={!selectedBranche || !selectedClasse}
                                >
                                    Affecter des élèves
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal d'affectation d'élèves */}
            <ModalAffectationEleves
                visible={showModalAffectation}
                onClose={() => setShowModalAffectation(false)}
                onSuccess={handleAffectationSuccess}
                selectedBranche={selectedBranche}
                selectedClasse={selectedClasse}
                classeInfo={selectedClasseInfo}
            />
        </div>
    );
};

export default Eleves;