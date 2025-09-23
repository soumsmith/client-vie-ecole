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
    FiBookOpen,
    FiPlus,
    FiRefreshCw,
    FiDownload,
    FiCheckCircle,
    FiXCircle,
    FiPrinter
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { useListeElevesClasseData, listeElevesClasseTableConfig } from './ListeElevesClasseService';

// Import des modals d'InscriptionsAValider - EXACTEMENT LES MÊMES
import EleveDetailsModal from '../InscriptionsAValider/EleveDetailsModal';
import PrintModal from '../InscriptionsAValider/PrintModal';

// ===========================
// MODAL DE VALIDATION/REFUS - COPIÉ EXACTEMENT DEPUIS InscriptionsAValider
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
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES
// ===========================
const ElevesStatsHeader = ({ eleves, loading }) => {
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
                    <span>Chargement des données...</span>
                </div>
            </div>
        );
    }

    // Calcul des statistiques
    const totalEleves = eleves.length;
    const elevesValides = eleves.filter(e => e.inscription_statut === 'VALIDEE').length;
    const elevesEnAttente = eleves.filter(e => e.inscription_statut === 'EN_ATTENTE').length;
    const redoublants = eleves.filter(e => e.redoublant === 'OUI').length;
    const boursiers = eleves.filter(e => e.boursier).length;
    const demiPensionnaires = eleves.filter(e => e.demi_pension).length;

    // Répartition par genre
    const masculins = eleves.filter(e => e.genre === 'MASCULIN').length;
    const feminins = eleves.filter(e => e.genre === 'FEMININ').length;

    // Classes représentées
    const classesUniques = [...new Set(eleves.map(e => e.classe))].length;

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
                        Statistique de la liste des Élèves
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Année scolaire 2024-2025 • {totalEleves} élève(s) inscrits • {classesUniques} classe(s)
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
                            {totalEleves}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Élèves
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
                            {elevesValides}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            Validés
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
                            {elevesEnAttente}
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
                        backgroundColor: '#fdf2f8',
                        borderRadius: '8px',
                        border: '1px solid #fbcfe8'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ec4899' }}>
                            {feminins}
                        </div>
                        <div style={{ fontSize: '12px', color: '#ec4899', fontWeight: '500' }}>
                            Filles
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
                            {masculins}
                        </div>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>
                            Garçons
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
                            {redoublants}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '500' }}>
                            Redoublants
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge color="green" style={{ fontSize: '11px' }}>
                    {boursiers} Boursier(s)
                </Badge>
                <Badge color="blue" style={{ fontSize: '11px' }}>
                    {demiPensionnaires} Demi-pensionnaire(s)
                </Badge>
                <Badge color="violet" style={{ fontSize: '11px' }}>
                    {classesUniques} Classe(s) représentée(s)
                </Badge>
            </div>
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL DE LA LISTE DES ÉLÈVES
// ===========================
const ListeElevesClasse = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // ===========================
    // ÉTATS POUR LES MODALS - EXACTEMENT COMME InscriptionsAValider
    // ===========================
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
        eleves,
        loading,
        error,
        refetch
    } = useListeElevesClasseData(refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION - EXACTEMENT COMME InscriptionsAValider
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

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            navigate('/eleves/create');
            return;
        }

        // Gestion spécifique pour l'action "home" - informations familiales
        if (actionType === 'home' && item && item.id) {
            console.log('Affichage des informations familiales pour:', item);
            // Ici vous pouvez ajouter la logique pour afficher les infos familiales
            return;
        }

        // Pour les autres actions, utiliser le modal classique
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DE LA VALIDATION/REFUS - EXACTEMENT COMME InscriptionsAValider
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
                case 'delete':
                    console.log('Supprimer l\'inscription de l\'élève:', modalState.selectedItem);
                    // Ici vous pouvez ajouter la logique de suppression
                    // await deleteInscriptionEleve(modalState.selectedItem.id);

                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'download':
                    console.log('Télécharger la fiche élève:', modalState.selectedItem);
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
    const handleCreateEleve = useCallback(() => {
        navigate('/eleves/create');
    }, [navigate]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // GESTION DES ACTIONS EN MASSE - EXACTEMENT COMME InscriptionsAValider
    // ===========================
    const handleValidateAll = useCallback(() => {
        const pendingInscriptions = eleves.filter(i =>
            i.inscription_statut !== 'VALIDEE' && i.inscription_statut !== 'REFUSEE'
        );
        console.log('Validation en masse de', pendingInscriptions.length, 'inscriptions');
        // Ici vous pouvez implémenter la logique de validation en masse
    }, [eleves]);

    const handleExportAll = useCallback(() => {
        console.log('Export de toute la liste des élèves');
        // Ici vous pouvez ajouter la logique d'export
    }, []);

    // Configuration du tableau avec l'action d'impression - EXACTEMENT COMME InscriptionsAValider
    const tableConfigWithPrint = {
        ...listeElevesClasseTableConfig,
        actions: [
            ...listeElevesClasseTableConfig.actions,
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
                        <ElevesStatsHeader eleves={eleves} loading={loading} />
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
                                    title="Liste Complète des Élèves"
                                    subtitle="élève(s) inscrit(s)"

                                    data={eleves}
                                    loading={loading}
                                    error={null}

                                    columns={tableConfigWithPrint.columns}
                                    searchableFields={tableConfigWithPrint.searchableFields}
                                    filterConfigs={tableConfigWithPrint.filterConfigs}
                                    actions={tableConfigWithPrint.actions}

                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={handleCreateEleve}

                                    defaultPageSize={20}
                                    pageSizeOptions={[10, 20, 50, 100]}
                                    tableHeight={650}

                                    enableRefresh={true}
                                    enableCreate={false}
                                    createButtonText="Nouvel Élève"
                                    selectable={false}
                                    rowKey="id"

                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { minHeight: "650px", border: "none", boxShadow: "none" },
                                    }}

                                    // Boutons d'action supplémentaires - EXACTEMENT COMME InscriptionsAValider
                                    extraActions={[
                                        {
                                            key: 'validate-all',
                                            label: 'Valider Toutes',
                                            icon: <FiCheckCircle />,
                                            color: 'green',
                                            onClick: handleValidateAll,
                                            disabled: eleves.filter(i =>
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

                {/* Aucun élève - cas improbable mais à gérer */}
                {!loading && !error && eleves?.length === 0 && (
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
                                    Aucun élève inscrit
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Il n'y a actuellement aucun élève inscrit pour cette année scolaire.
                                </p>
                                <Button
                                    appearance="primary"
                                    style={{
                                        marginTop: 15,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                    startIcon={<FiPlus />}
                                    onClick={handleCreateEleve}
                                >
                                    Inscrire un nouvel élève
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ===========================
                MODALS - EXACTEMENT LES MÊMES QUE InscriptionsAValider
                =========================== */}

            {/* Modal de validation/refus */}
            <ValidationModal
                show={validationModal.show}
                type={validationModal.type}
                inscription={validationModal.inscription}
                onClose={() => setValidationModal({ show: false, type: null, inscription: null })}
                onConfirm={handleValidationConfirm}
            />

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

export default ListeElevesClasse;