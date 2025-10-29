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
    Modal
} from 'rsuite';
import { 
    FiUsers, 
    FiCheckCircle, 
    FiXCircle,
    FiRefreshCw,
    FiDownload,
    FiClock,
    FiAlertTriangle,
    FiPrinter
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { 
    useInscriptionsAValiderData,
    inscriptionsAValiderTableConfig
} from './InscriptionsAValiderService';

// Import des composants modaux séparés
import EleveDetailsModal from './EleveDetailsModal';
import PrintModal from './PrintModal';
import IconBox from "../Composant/IconBox";

// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES DE VALIDATION
// ===========================
const InscriptionsStatsHeader = ({ inscriptions, loading }) => {
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
                    <span>Chargement des inscriptions à valider...</span>
                </div>
            </div>
        );
    }

    // Calcul des statistiques de validation
    const totalInscriptions = inscriptions.length;
    const inscriptionsValidees = inscriptions.filter(i => i.inscription_statut === 'VALIDEE').length;
    const inscriptionsEnAttente = inscriptions.filter(i => i.inscription_statut === 'EN_ATTENTE').length;
    const inscriptionsEnCours = inscriptions.filter(i => i.inscription_statut === 'EN_COURS' || i.inscription_processus === 'EN_COURS').length;
    const inscriptionsRefusees = inscriptions.filter(i => i.inscription_statut === 'REFUSEE').length;
    const inscriptionsPrioriteHaute = inscriptions.filter(i => i.priorite === 'HAUTE').length;

    // Répartition par genre
    const candidatsMasculins = inscriptions.filter(i => i.genre === 'MASCULIN').length;
    const candidatesFeminins = inscriptions.filter(i => i.genre === 'FEMININ').length;

    // Classes les plus demandées
    const classesUniques = [...new Set(inscriptions.map(i => i.classe))].length;

    // Calcul du temps d'attente moyen
    const tempsAttenteTotal = inscriptions.reduce((sum, i) => sum + (i.jours_attente || 0), 0);
    const tempsAttenteMoyen = totalInscriptions > 0 ? Math.round(tempsAttenteTotal / totalInscriptions) : 0;

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
                {/* <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiCheckCircle size={18} color="white" />
                </div> */}
                <IconBox icon={FiCheckCircle} />
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Inscriptions à Valider
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Année scolaire 2024-2025 • {totalInscriptions} inscription(s) • Temps d'attente moyen: {tempsAttenteMoyen} jours
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
                            {totalInscriptions}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Inscriptions
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
                            {inscriptionsValidees}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            Validées
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
                            {inscriptionsEnCours}
                        </div>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>
                            En Cours
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
                            {inscriptionsEnAttente}
                        </div>
                        <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '500' }}>
                            En Attente
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '8px',
                        border: '1px solid #fecaca'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>
                            {inscriptionsPrioriteHaute}
                        </div>
                        <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                            Priorité Haute
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
                            {tempsAttenteMoyen}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '500' }}>
                            Jours d'attente
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge color="blue" style={{ fontSize: '11px' }}>
                    {candidatsMasculins} Garçons
                </Badge>
                <Badge color="pink" style={{ fontSize: '11px' }}>
                    {candidatesFeminins} Filles
                </Badge>
                <Badge color="violet" style={{ fontSize: '11px' }}>
                    {classesUniques} Classes demandées
                </Badge>
                {inscriptionsRefusees > 0 && (
                    <Badge color="red" style={{ fontSize: '11px' }}>
                        {inscriptionsRefusees} Refusée(s)
                    </Badge>
                )}
            </div>

            {/* Alerte pour les priorités hautes */}
            {inscriptionsPrioriteHaute > 0 && (
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
                    <FiAlertTriangle size={16} color="#d97706" />
                    <span style={{ fontSize: '13px', color: '#92400e', fontWeight: '500' }}>
                        {inscriptionsPrioriteHaute} inscription(s) nécessitent une attention prioritaire
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// MODAL DE VALIDATION/REFUS
// ===========================
const ValidationModal = ({ show, type, inscription, onClose, onConfirm }) => {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm(inscription, comment);
            setComment('');
            onClose();
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
        } finally {
            setLoading(false);
        }
    };

    const isValidation = type === 'validate';
    const title = isValidation ? 'Valider l\'inscription' : 'Refuser l\'inscription';
    const color = isValidation ? '#22c55e' : '#ef4444';
    const icon = isValidation ? <FiCheckCircle /> : <FiXCircle />;

    return (
        <Modal open={show} onClose={onClose} size="md">
            <Modal.Header>
                <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color }}>{icon}</span>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {inscription && (
                    <div>
                        <div style={{ marginBottom: 20 }}>
                            <strong>Candidat:</strong> {inscription.nomComplet}<br />
                            <strong>Matricule:</strong> {inscription.matricule}<br />
                            <strong>Classe demandée:</strong> {inscription.classe}<br />
                            <strong>Statut actuel:</strong> {inscription.inscription_statut_display}
                        </div>
                        
                        <div style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                Commentaire {isValidation ? '(optionnel)' : '*'}
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={isValidation ? 
                                    "Commentaire sur la validation..." : 
                                    "Motif du refus (obligatoire)..."
                                }
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose} appearance="subtle">
                    Annuler
                </Button>
                <Button 
                    onClick={handleConfirm}
                    appearance="primary"
                    loading={loading}
                    disabled={!isValidation && !comment.trim()}
                    style={{ backgroundColor: color, borderColor: color }}
                >
                    {isValidation ? 'Valider' : 'Refuser'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};



// ===========================
// COMPOSANT PRINCIPAL DES INSCRIPTIONS À VALIDER
// ===========================
const InscriptionsAValider = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [validationModal, setValidationModal] = useState({
        show: false,
        type: null,
        inscription: null
    });
    const [detailsModal, setDetailsModal] = useState({
        show: false,
        inscription: null
    });
    const [printModal, setPrintModal] = useState({
        show: false,
        inscription: null
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
        inscriptions,
        loading,
        error,
        refetch
    } = useInscriptionsAValiderData('INSCRIPTION', refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour les actions de validation
        if (actionType === 'validate' && item && item.id) {
            setValidationModal({
                show: true,
                type: 'validate',
                inscription: item
            });
            return;
        }

        if (actionType === 'reject' && item && item.id) {
            setValidationModal({
                show: true,
                type: 'reject',
                inscription: item
            });
            return;
        }

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            setDetailsModal({
                show: true,
                inscription: item
            });
            return;
        }

        // Gestion spécifique pour l'action "voir"
        if (actionType === 'view' && item && item.id) {
            setDetailsModal({
                show: true,
                inscription: item
            });
            return;
        }

        // Gestion spécifique pour l'action "imprimer"
        if (actionType === 'print' && item && item.id) {
            setPrintModal({
                show: true,
                inscription: item
            });
            return;
        }

        // Pour les autres actions, utiliser le modal classique
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DE LA VALIDATION/REFUS
    // ===========================
    const handleValidationConfirm = useCallback(async (inscription, comment) => {
        const isValidation = validationModal.type === 'validate';
        
        console.log(`${isValidation ? 'Validation' : 'Refus'} de l'inscription:`, {
            inscription: inscription.id,
            candidat: inscription.nomComplet,
            comment: comment,
            action: isValidation ? 'VALIDER' : 'REFUSER'
        });

        // Ici vous pouvez ajouter l'appel API pour valider/refuser
        // await updateInscriptionStatus(inscription.id, isValidation ? 'VALIDEE' : 'REFUSEE', comment);

        // Simulation d'un délai d'API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Actualiser les données
        setRefreshTrigger(prev => prev + 1);
    }, [validationModal.type]);

    // ===========================
    // GESTION DU MODAL CLASSIQUE
    // ===========================
    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'download':
                    console.log('Télécharger le dossier:', modalState.selectedItem);
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
    // GESTION DES ACTIONS EN MASSE
    // ===========================
    const handleValidateAll = useCallback(() => {
        const pendingInscriptions = inscriptions.filter(i => 
            i.inscription_statut !== 'VALIDEE' && i.inscription_statut !== 'REFUSEE'
        );
        console.log('Validation en masse de', pendingInscriptions.length, 'inscriptions');
        // Ici vous pouvez implémenter la logique de validation en masse
    }, [inscriptions]);

    const handleExportAll = useCallback(() => {
        console.log('Export de toutes les inscriptions à valider');
        // Ici vous pouvez ajouter la logique d'export
    }, []);

    // Configuration du tableau avec l'action d'impression
    const tableConfigWithPrint = {
        ...inscriptionsAValiderTableConfig,
        actions: [
            ...inscriptionsAValiderTableConfig.actions,
            {
                type: 'print',
                icon: <FiPrinter size={17} />,
                tooltip: 'Imprimer la fiche élève',
                color: '#8b5cf6'
            }
        ]
    };

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
                        <InscriptionsStatsHeader inscriptions={inscriptions} loading={loading} />
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
                                    title="Inscriptions à Valider"
                                    subtitle="inscription(s) en attente de traitement"
                                    
                                    data={inscriptions}
                                    loading={loading}
                                    error={null}
                                    
                                    columns={tableConfigWithPrint.columns}
                                    searchableFields={tableConfigWithPrint.searchableFields}
                                    filterConfigs={tableConfigWithPrint.filterConfigs}
                                    actions={tableConfigWithPrint.actions}
                                    
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    
                                    defaultPageSize={15}
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
                                            key: 'validate-all',
                                            label: 'Valider Toutes',
                                            icon: <FiCheckCircle />,
                                            color: 'green',
                                            onClick: handleValidateAll,
                                            disabled: inscriptions.filter(i => 
                                                i.inscription_statut !== 'VALIDEE' && i.inscription_statut !== 'REFUSEE'
                                            ).length === 0
                                        },
                                        {
                                            key: 'export-all',
                                            label: 'Exporter Tout',
                                            icon: <FiDownload />,
                                            color: 'blue',
                                            onClick: handleExportAll
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Aucune inscription - cas possible */}
                {!loading && !error && inscriptions?.length === 0 && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '40px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(34, 197, 94, 0.15)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
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
                                    Aucune inscription à valider
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Toutes les inscriptions ont été traitées ou il n'y a pas de nouvelle demande.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de validation/refus */}
            {/* <ValidationModal
                show={validationModal.show}
                type={validationModal.type}
                inscription={validationModal.inscription}
                onClose={() => setValidationModal({ show: false, type: null, inscription: null })}
                onConfirm={handleValidationConfirm}
            /> */}

            {/* Modal de détails de l'élève */}
            <EleveDetailsModal
                show={detailsModal.show}
                inscription={detailsModal.inscription}
                onClose={() => setDetailsModal({ show: false, inscription: null })}
            />

            {/* Modal d'impression */}
            <PrintModal
                show={printModal.show}
                inscription={printModal.inscription}
                onClose={() => setPrintModal({ show: false, inscription: null })}
            />
        </div>
    );
};

export default InscriptionsAValider;