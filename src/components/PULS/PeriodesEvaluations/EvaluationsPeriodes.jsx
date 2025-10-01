import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    Button,
    Row,
    Col,
    Message,
    Loader,
    Badge,
    Notification,
    toaster
} from 'rsuite';
import {
    FiCalendar,
    FiPlus,
    FiRefreshCw,
    FiDownload,
    FiEdit,
    FiTrash2,
    FiSettings,
    FiCheckCircle
} from 'react-icons/fi';
import Swal from 'sweetalert2';

// Import des composants
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import EvaluationPeriodeModal from './EvaluationPeriodeModal';
import {
    useEvaluationsPeriodesData,
    evaluationsPeriodesTableConfig
} from './EvaluationsPeriodesService';

// ===========================
// EN-TÊTE AVEC STATISTIQUES
// ===========================
const EvaluationsStatsHeader = ({ evaluations, anneeEnCours, loading }) => {
    if (loading) {
        return null;
    }

    const totalEvaluations = evaluations.length;
    const periodesAvecEval = [...new Set(evaluations.map(e => e.periode_libelle))].length;
    const niveauxConcernes = [...new Set(evaluations.map(e => e.niveau_libelle))].length;
    const typesEvaluations = [...new Set(evaluations.map(e => e.typeEvaluation_libelle))].length;

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
                    <FiCheckCircle size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Définition des Évaluations par Période
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        {anneeEnCours ? `Année ${anneeEnCours.libelle}` : 'Aucune année ouverte'} • {totalEvaluations} évaluation(s) configurée(s)
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
                            {totalEvaluations}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Évaluations
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
                            {periodesAvecEval}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            Périodes
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '8px',
                        border: '1px solid #fde68a'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                            {niveauxConcernes}
                        </div>
                        <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '500' }}>
                            Niveaux
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
                            {typesEvaluations}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '500' }}>
                            Types
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL
// ===========================
const EvaluationsPeriodes = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);

    const ECOLE_ID = 139; // ID de l'école
    const ANNEE_ID = 385; // ID de l'année en cours

    // ===========================
    // HOOKS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        evaluations,
        anneeEnCours,
        loading,
        error,
        refetch
    } = useEvaluationsPeriodesData(ANNEE_ID, ECOLE_ID, refreshTrigger);

    // ===========================
    // GESTION DU MODAL
    // ===========================
    const openModal = useCallback((evaluation = null) => {
        setSelectedEvaluation(evaluation);
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setSelectedEvaluation(null);
    }, []);

    const handleModalSave = useCallback(async (data) => {
        try {
            closeModal();

            // Afficher SweetAlert de confirmation
            const result = await Swal.fire({
                title: 'Confirmer l\'ajout',
                html: `
                    <div style="text-align: left; padding: 10px;">
                        <p><strong>Période :</strong> ${data.periodeLibelle}</p>
                        <p><strong>Niveau :</strong> ${data.niveauLibelle}</p>
                        <p><strong>Type d'évaluation :</strong> ${data.typeEvaluationLibelle}</p>
                        <p><strong>Numéro :</strong> ${data.numero}</p>
                    </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#667eea',
                cancelButtonColor: '#64748b',
                confirmButtonText: 'Confirmer',
                cancelButtonText: 'Annuler',
                customClass: {
                    container: 'swal-custom-container',
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    htmlContainer: 'swal-custom-html'
                }
            });

            if (result.isConfirmed) {
                // Effectuer l'enregistrement
                console.log('Données à enregistrer:', data);

                // Simuler l'appel API
                // await axios.post('http://46.105.52.105:8889/api/evaluation-periode/save-handle', data.payload);

                // Afficher le succès
                await Swal.fire({
                    title: 'Succès !',
                    text: 'L\'évaluation a été enregistrée avec succès',
                    icon: 'success',
                    confirmButtonColor: '#16a34a',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Rafraîchir les données
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);

            await Swal.fire({
                title: 'Erreur',
                text: 'Une erreur est survenue lors de l\'enregistrement',
                icon: 'error',
                confirmButtonColor: '#dc2626'
            });
        }
    }, [closeModal]);

    // ===========================
    // GESTION DES ACTIONS DU TABLEAU
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        switch (actionType) {
            case 'edit':
                openModal(item);
                break;

            case 'delete':
                handleDelete(item);
                break;

            case 'create':
                openModal();
                break;

            default:
                handleTableAction(actionType, item);
                break;
        }
    }, [openModal, handleTableAction]);

    // ===========================
    // GESTION DE LA SUPPRESSION
    // ===========================
    const handleDelete = useCallback(async (evaluation) => {
        const result = await Swal.fire({
            title: 'Confirmer la suppression',
            html: `
                <div style="text-align: left; padding: 10px;">
                    <p>Êtes-vous sûr de vouloir supprimer cette évaluation ?</p>
                    <p><strong>Période :</strong> ${evaluation.periode_libelle}</p>
                    <p><strong>Niveau :</strong> ${evaluation.niveau_libelle}</p>
                    <p><strong>Type :</strong> ${evaluation.typeEvaluation_libelle}</p>
                    <p><strong>Numéro :</strong> ${evaluation.numero}</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                // Simuler l'appel API de suppression
                console.log('Supprimer évaluation:', evaluation);

                await Swal.fire({
                    title: 'Supprimé !',
                    text: 'L\'évaluation a été supprimée avec succès',
                    icon: 'success',
                    confirmButtonColor: '#16a34a',
                    timer: 2000,
                    showConfirmButton: false
                });

                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);

                await Swal.fire({
                    title: 'Erreur',
                    text: 'Une erreur est survenue lors de la suppression',
                    icon: 'error',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    }, []);

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
        console.log('Export des évaluations');
        toaster.push(
            <Notification type="info" header="Export">
                Fonctionnalité d'export en cours de développement
            </Notification>,
            { duration: 3000 }
        );
    }, []);

    // ===========================
    // RENDU
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
                        <EvaluationsStatsHeader
                            evaluations={evaluations}
                            anneeEnCours={anneeEnCours}
                            loading={loading}
                        />
                    </div>
                </div>


                {/* DataTable */}
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
                                title="Évaluations par Période"
                                subtitle={`${evaluations?.length || 0} évaluation(s) configurée(s)`}

                                data={evaluations}
                                loading={loading}
                                error={null}

                                columns={evaluationsPeriodesTableConfig.columns}
                                searchableFields={evaluationsPeriodesTableConfig.searchableFields}
                                filterConfigs={evaluationsPeriodesTableConfig.filterConfigs}
                                actions={evaluationsPeriodesTableConfig.actions}

                                onAction={handleTableActionLocal}
                                onRefresh={handleRefresh}
                                onCreateNew={() => openModal()}

                                defaultPageSize={evaluationsPeriodesTableConfig.pageSize}
                                pageSizeOptions={[5, 10, 15, 25]}
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

                                extraActions={[
                                    {
                                        key: 'export-all',
                                        label: 'Exporter',
                                        icon: <FiDownload />,
                                        color: 'green',
                                        onClick: handleExportAll
                                    }
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Message si aucune évaluation */}
                {!loading && !error && evaluations?.length === 0 && (
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
                                    <FiCheckCircle size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Aucune évaluation configurée
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Commencez par définir les évaluations pour les différentes périodes.
                                </p>
                                <Button
                                    appearance="primary"
                                    style={{
                                        marginTop: 15,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                    startIcon={<FiPlus />}
                                    onClick={() => openModal()}
                                >
                                    Créer la première évaluation
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal d'ajout/modification */}
            <EvaluationPeriodeModal
                show={showModal}
                evaluation={selectedEvaluation}
                anneeId={ANNEE_ID}
                ecoleId={ECOLE_ID}
                onClose={closeModal}
                onSave={handleModalSave}
            />
        </div>
    );
};

export default EvaluationsPeriodes;