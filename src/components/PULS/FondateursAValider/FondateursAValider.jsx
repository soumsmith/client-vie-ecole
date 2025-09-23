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
    Modal,
    SelectPicker,
    Input,
    Form,
    DatePicker
} from 'rsuite';
import { 
    FiUsers, 
    FiCheckCircle, 
    FiXCircle,
    FiRefreshCw,
    FiDownload,
    FiClock,
    FiAlertTriangle,
    FiUserCheck,
    FiMail,
    FiPhone,
    FiCalendar
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { 
    useFondateursData,
    fondateursTableConfig
} from './FondateursService';

// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES DES FONDATEURS
// ===========================
const FondateursStatsHeader = ({typeValidation, fondateurs, loading }) => {
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
                    <span>Chargement des fondateurs à valider...</span>
                </div>
            </div>
        );
    }

    // Calcul des statistiques des fondateurs
    const totalFondateurs = fondateurs.length;
    const fondateursEnAttente = fondateurs.filter(f => f.statut === 'EN ATTENTE').length;
    const fondateursValides = fondateurs.filter(f => f.statut === 'VALIDEE').length;
    const fondateursRefuses = fondateurs.filter(f => f.statut === 'REFUSEE').length;

    // Qualité des données
    const fondateursCompletsInfo = fondateurs.filter(f => f.has_complete_info).length;
    const fondateursEmailValide = fondateurs.filter(f => f.email_valide).length;
    const fondateursMultiContacts = fondateurs.filter(f => f.contacts_count > 1).length;

    // Pourcentages
    const pourcentageCompletsInfo = totalFondateurs > 0 ? Math.round((fondateursCompletsInfo / totalFondateurs) * 100) : 0;
    const pourcentageEmailValide = totalFondateurs > 0 ? Math.round((fondateursEmailValide / totalFondateurs) * 100) : 0;

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
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
                        Fondateurs à Valider
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Candidatures de fondateurs • {totalFondateurs} demande(s) • {pourcentageCompletsInfo}% informations complètes
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
                            {totalFondateurs}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Fondateurs
                        </div>
                    </div>
                </Col>

                {/* {typeValidation === 'VALIDEE' && (
                    <Col xs={12} sm={8} md={4}>
                        <div style={{
                            textAlign: 'center',
                            padding: '15px',
                            backgroundColor: '#fffbeb',
                            borderRadius: '8px',
                            border: '1px solid #fed7aa'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                                {fondateursEnAttente}
                            </div>
                            <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '500' }}>
                                En Attente
                            </div>
                        </div>
                    </Col>
                )}

                {typeValidation.typeValidation === 'EN ATTENTE' && (
                    <Col xs={12} sm={8} md={4}>
                        <div style={{
                            textAlign: 'center',
                            padding: '15px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #bbf7d0'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                                {fondateursValides}
                            </div>
                            <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                                Validés
                            </div>
                        </div>
                    </Col>
                )} */}

                

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f5f3ff',
                        borderRadius: '8px',
                        border: '1px solid #d8b4fe'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#9333ea' }}>
                            {fondateursCompletsInfo}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '500' }}>
                            Infos Complètes
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#ecfdf5',
                        borderRadius: '8px',
                        border: '1px solid #a7f3d0'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                            {fondateursEmailValide}
                        </div>
                        <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
                            Emails Valides
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
                            {fondateursMultiContacts}
                        </div>
                        <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                            Multi-Contacts
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge color="green" style={{ fontSize: '11px' }}>
                    {pourcentageCompletsInfo}% Données complètes
                </Badge>
                <Badge color="blue" style={{ fontSize: '11px' }}>
                    {pourcentageEmailValide}% Emails valides
                </Badge>
                {fondateursRefuses > 0 && (
                    <Badge color="red" style={{ fontSize: '11px' }}>
                        {fondateursRefuses} Refusé(s)
                    </Badge>
                )}
            </div>

            {/* Alerte pour les fondateurs en attente */}
            {fondateursEnAttente > 0 && (
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
                        {fondateursEnAttente} fondateur(s) nécessitent une validation
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// MODAL DE VALIDATION/MODIFICATION DES FONDATEURS
// ===========================
const ValidationModal = ({ show, type, fondateur, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        statut: '',
        contact1: '',
        contact2: '',
        email: '',
        dateFinValidite: null,
        comment: ''
    });
    const [loading, setLoading] = useState(false);

    // Options pour les statuts
    const statutOptions = [
        { label: 'Validé', value: 'VALIDEE' },
        { label: 'Refusé', value: 'REFUSEE' },
        { label: 'En attente', value: 'EN ATTENTE' }
    ];

    useEffect(() => {
        if (fondateur && show) {
            setFormData({
                statut: fondateur.statut || '',
                contact1: fondateur.raw_data?.sous_attent_personn_contact || '',
                contact2: fondateur.raw_data?.sous_attent_personn_contact2 || '',
                email: fondateur.email || '',
                dateFinValidite: null,
                comment: ''
            });
        }
    }, [fondateur, show]);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm(fondateur, formData);
            setFormData({ 
                statut: '', 
                contact1: '', 
                contact2: '', 
                email: '', 
                dateFinValidite: null, 
                comment: '' 
            });
            onClose();
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
        } finally {
            setLoading(false);
        }
    };

    const isValidation = type === 'validate';
    const isEdit = type === 'edit';
    const title = isValidation ? 'Valider le fondateur' : 
                  type === 'reject' ? 'Refuser le fondateur' : 
                  'Modifier les informations du fondateur';
    const color = isValidation ? '#22c55e' : type === 'reject' ? '#ef4444' : '#f39c12';
    const icon = isValidation ? <FiCheckCircle /> : type === 'reject' ? <FiXCircle /> : <FiUserCheck />;

    return (
        <Modal open={show} onClose={onClose} size="md">
            <Modal.Header>
                <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color }}>{icon}</span>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {fondateur && (
                    <div>
                        {/* Informations du fondateur */}
                        <div style={{ 
                            marginBottom: 20,
                            padding: '15px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <Row gutter={16}>
                                <Col xs={12}>
                                    <strong>Candidat fondateur :</strong><br />
                                    <span>{fondateur.nomComplet}</span>
                                </Col>
                                <Col xs={12}>
                                    <strong>Statut actuel :</strong><br />
                                    <span style={{ color: fondateur.statut_color, fontWeight: '500' }}>
                                        {fondateur.statut}
                                    </span>
                                </Col>
                            </Row>
                            <Row gutter={16} style={{ marginTop: 10 }}>
                                <Col xs={12}>
                                    <strong>Contact principal :</strong><br />
                                    <span>{fondateur.contact1}</span>
                                </Col>
                                <Col xs={12}>
                                    <strong>Email :</strong><br />
                                    <span style={{ 
                                        color: fondateur.email_valide ? '#16a34a' : '#dc2626' 
                                    }}>
                                        {fondateur.email}
                                    </span>
                                </Col>
                            </Row>
                        </div>
                        
                        {/* Formulaire de modification */}
                        <Form layout="vertical">
                            {(isEdit || type === 'validate' || type === 'reject') && (
                                <Form.Group>
                                    <Form.ControlLabel>Statut du fondateur</Form.ControlLabel>
                                    <SelectPicker
                                        data={statutOptions}
                                        value={formData.statut}
                                        onChange={(value) => setFormData({...formData, statut: value})}
                                        placeholder="Sélectionner un statut"
                                        style={{ width: '100%' }}
                                        disabled={type === 'validate' || type === 'reject'}
                                    />
                                </Form.Group>
                            )}

                            {isEdit && (
                                <>
                                    <Row gutter={16}>
                                        <Col xs={12}>
                                            <Form.Group>
                                                <Form.ControlLabel>Contact principal</Form.ControlLabel>
                                                <Input
                                                    value={formData.contact1}
                                                    onChange={(value) => setFormData({...formData, contact1: value})}
                                                    placeholder="Numéro de téléphone principal"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12}>
                                            <Form.Group>
                                                <Form.ControlLabel>Contact secondaire</Form.ControlLabel>
                                                <Input
                                                    value={formData.contact2}
                                                    onChange={(value) => setFormData({...formData, contact2: value})}
                                                    placeholder="Numéro de téléphone secondaire (optionnel)"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group>
                                        <Form.ControlLabel>Adresse email</Form.ControlLabel>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(value) => setFormData({...formData, email: value})}
                                            placeholder="Adresse email du fondateur"
                                        />
                                    </Form.Group>
                                </>
                            )}

                            {type === 'validate' && (
                                <Form.Group>
                                    <Form.ControlLabel>Date fin de validité (optionnel)</Form.ControlLabel>
                                    <DatePicker
                                        value={formData.dateFinValidite}
                                        onChange={(value) => setFormData({...formData, dateFinValidite: value})}
                                        placeholder="Sélectionner une date de fin de validité"
                                        style={{ width: '100%' }}
                                        format="dd/MM/yyyy"
                                    />
                                </Form.Group>
                            )}

                            <Form.Group>
                                <Form.ControlLabel>
                                    Commentaire {!isEdit ? (type === 'reject' ? '(obligatoire)' : '(optionnel)') : '(optionnel)'}
                                </Form.ControlLabel>
                                <Input
                                    as="textarea"
                                    rows={4}
                                    value={formData.comment}
                                    onChange={(value) => setFormData({...formData, comment: value})}
                                    placeholder={
                                        type === 'validate' ? "Commentaire sur la validation du fondateur..." : 
                                        type === 'reject' ? "Motif du refus (obligatoire)..." :
                                        "Commentaire ou notes sur le fondateur..."
                                    }
                                />
                            </Form.Group>
                        </Form>
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
                    disabled={type === 'reject' && !formData.comment.trim()}
                    style={{ backgroundColor: color, borderColor: color }}
                >
                    {isValidation ? 'Valider' : type === 'reject' ? 'Refuser' : 'Enregistrer'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// ===========================
// COMPOSANT PRINCIPAL DES FONDATEURS À VALIDER
// ===========================
const FondateursAValider = (typeValidation) => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [validationModal, setValidationModal] = useState({
        show: false,
        type: null,
        fondateur: null
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
        fondateurs,
        loading,
        error,
        refetch
    } = useFondateursData(typeValidation, refreshTrigger);

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
                fondateur: item
            });
            return;
        }

        if (actionType === 'reject' && item && item.id) {
            setValidationModal({
                show: true,
                type: 'reject',
                fondateur: item
            });
            return;
        }

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            setValidationModal({
                show: true,
                type: 'edit',
                fondateur: item
            });
            return;
        }

        // Pour les autres actions (view, download, etc.), utiliser le modal
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DE LA VALIDATION/REFUS/MODIFICATION
    // ===========================
    const handleValidationConfirm = useCallback(async (fondateur, formData) => {
        const action = validationModal.type;
        
        console.log(`${action} du fondateur:`, {
            fondateur: fondateur.id,
            candidat: fondateur.nomComplet,
            formData: formData,
            action: action
        });

        // Ici vous pouvez ajouter l'appel API pour valider/refuser/modifier
        // await updateFondateurStatus(fondateur.id, formData);

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
                case 'view':
                    console.log('Voir les détails:', modalState.selectedItem);
                    break;

                case 'download':
                    console.log('Télécharger les informations:', modalState.selectedItem);
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
        const pendingFondateurs = fondateurs.filter(f => f.statut === 'EN ATTENTE');
        console.log('Validation en masse de', pendingFondateurs.length, 'fondateurs');
    }, [fondateurs]);

    const handleExportAll = useCallback(() => {
        console.log('Export de tous les fondateurs à valider');
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
                {/* En-tête avec statistiques */}
                <div className="row">
                    <div className="col-lg-12">
                        <FondateursStatsHeader typeValidation = {typeValidation} fondateurs={fondateurs} loading={loading} />
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
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
                                border: '1px solid rgba(139, 92, 246, 0.1)',
                                overflow: 'hidden'
                            }}>
                                <DataTable
                                    title="Fondateurs à Valider"
                                    subtitle="candidature(s) de fondateurs en attente de traitement"
                                    
                                    data={fondateurs}
                                    loading={loading}
                                    error={null}
                                    
                                    columns={fondateursTableConfig.columns}
                                    searchableFields={fondateursTableConfig.searchableFields}
                                    filterConfigs={fondateursTableConfig.filterConfigs}
                                    actions={fondateursTableConfig.actions}
                                    
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
                                            label: 'Valider Tous',
                                            icon: <FiCheckCircle />,
                                            color: 'green',
                                            onClick: handleValidateAll,
                                            disabled: fondateurs.filter(f => f.statut === 'EN ATTENTE').length === 0
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

                {/* Aucun fondateur - cas possible */}
                {!loading && !error && fondateurs?.length === 0 && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '40px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(139, 92, 246, 0.15)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
                                    Aucun fondateur à valider
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Tous les fondateurs ont été traités ou il n'y a pas de nouvelle candidature.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de validation/refus/modification */}
            <ValidationModal
                show={validationModal.show}
                type={validationModal.type}
                fondateur={validationModal.fondateur}
                onClose={() => setValidationModal({ show: false, type: null, fondateur: null })}
                onConfirm={handleValidationConfirm}
            />
        </div>
    );
};

export default FondateursAValider;