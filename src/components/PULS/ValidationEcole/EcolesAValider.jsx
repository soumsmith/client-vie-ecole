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
    FiHome,
    FiMapPin,
    FiBook,
    FiCalendar,
    FiFileText
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { 
    useEcolesData,
    ecolesTableConfig
} from './EcolesService';

// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES DES ÉCOLES
// ===========================
const EcolesStatsHeader = ({ ecoles, loading }) => {
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
                    <span>Chargement des écoles à valider...</span>
                </div>
            </div>
        );
    }

    // Calcul des statistiques des écoles
    const totalEcoles = ecoles.length;
    const ecolesCompletes = ecoles.filter(e => e.completeness.status === 'COMPLET').length;
    const ecolesPartiellementCompletes = ecoles.filter(e => e.completeness.status === 'PARTIELLEMENT_COMPLET').length;
    const ecolesIncompletes = ecoles.filter(e => e.completeness.status === 'INCOMPLET').length;

    // Analyse par niveau d'enseignement
    const niveauxEnseignement = [...new Set(ecoles.map(e => e.niveauEnseignement))].length;
    
    // Analyse géographique
    const communesUniques = [...new Set(ecoles.map(e => e.commune))].length;
    const directionsRegionales = [...new Set(ecoles.map(e => e.directionRegionale))].length;

    // Qualité des données
    const ecolesEmailsValides = ecoles.filter(e => e.email_valide).length;
    const ecolesValidables = ecoles.filter(e => e.can_validate).length;

    // Pourcentages
    const pourcentageCompletes = totalEcoles > 0 ? Math.round((ecolesCompletes / totalEcoles) * 100) : 0;
    const pourcentageEmailsValides = totalEcoles > 0 ? Math.round((ecolesEmailsValides / totalEcoles) * 100) : 0;

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
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiHome size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Établissements Scolaires à Valider
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Demandes de souscription d'écoles • {totalEcoles} établissement(s) • {pourcentageCompletes}% informations complètes
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
                            {totalEcoles}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Écoles
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
                            {ecolesCompletes}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            Complètes
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
                            {ecolesPartiellementCompletes}
                        </div>
                        <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '500' }}>
                            Partielles
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
                            {ecolesIncompletes}
                        </div>
                        <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
                            Incomplètes
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
                            {niveauxEnseignement}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '500' }}>
                            Niveaux
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
                            {communesUniques}
                        </div>
                        <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
                            Communes
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge color="green" style={{ fontSize: '11px' }}>
                    {pourcentageCompletes}% Données complètes
                </Badge>
                <Badge color="blue" style={{ fontSize: '11px' }}>
                    {pourcentageEmailsValides}% Emails valides
                </Badge>
                <Badge color="violet" style={{ fontSize: '11px' }}>
                    {directionsRegionales} Direction(s) régionale(s)
                </Badge>
                <Badge color="orange" style={{ fontSize: '11px' }}>
                    {ecolesValidables} Validable(s)
                </Badge>
            </div>

            {/* Alerte pour les écoles nécessitant attention */}
            {ecolesIncompletes > 0 && (
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
                        {ecolesIncompletes} école(s) ont des informations incomplètes nécessitant une attention particulière
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// MODAL DE VALIDATION/MODIFICATION DES ÉCOLES
// ===========================
const ValidationModal = ({ show, type, ecole, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        statut: '',
        nom: '',
        email: '',
        telephone: '',
        indication: '',
        dateFinValidite: null,
        comment: ''
    });
    const [loading, setLoading] = useState(false);

    // Options pour les statuts
    const statutOptions = [
        { label: 'Validée', value: 'VALIDEE' },
        { label: 'Refusée', value: 'REFUSEE' },
        { label: 'En attente', value: 'EN_ATTENTE' }
    ];

    useEffect(() => {
        if (ecole && show) {
            setFormData({
                statut: ecole.statut || 'EN_ATTENTE',
                nom: ecole.nom || '',
                email: ecole.email || '',
                telephone: ecole.raw_data?.sousc_atten_etabliss_tel || '',
                indication: ecole.indication || '',
                dateFinValidite: null,
                comment: ''
            });
        }
    }, [ecole, show]);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm(ecole, formData);
            setFormData({ 
                statut: '', 
                nom: '', 
                email: '', 
                telephone: '', 
                indication: '', 
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
    const title = isValidation ? 'Valider l\'établissement scolaire' : 
                  type === 'reject' ? 'Refuser l\'établissement scolaire' : 
                  'Modifier les informations de l\'établissement';
    const color = isValidation ? '#22c55e' : type === 'reject' ? '#ef4444' : '#f39c12';
    const icon = isValidation ? <FiCheckCircle /> : type === 'reject' ? <FiXCircle /> : <FiHome />;

    return (
        <Modal open={show} onClose={onClose} size="lg">
            <Modal.Header>
                <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color }}>{icon}</span>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {ecole && (
                    <div>
                        {/* Informations de l'établissement */}
                        <div style={{ 
                            marginBottom: 20,
                            padding: '15px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <Row gutter={16}>
                                <Col xs={12}>
                                    <strong>Établissement :</strong><br />
                                    <span>{ecole.nom}</span>
                                </Col>
                                <Col xs={12}>
                                    <strong>Code :</strong><br />
                                    <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                                        {ecole.code || 'Non généré'}
                                    </span>
                                </Col>
                            </Row>
                            <Row gutter={16} style={{ marginTop: 10 }}>
                                <Col xs={8}>
                                    <strong>Fondateur :</strong><br />
                                    <span>{ecole.nomCompletFondateur}</span>
                                </Col>
                                <Col xs={8}>
                                    <strong>Niveau d'enseignement :</strong><br />
                                    <span>{ecole.niveauEnseignement}</span>
                                </Col>
                                <Col xs={8}>
                                    <strong>Complétude :</strong><br />
                                    <span style={{ 
                                        color: ecole.completeness.status === 'COMPLET' ? '#16a34a' : 
                                               ecole.completeness.status === 'PARTIELLEMENT_COMPLET' ? '#d97706' : '#dc2626',
                                        fontWeight: '500'
                                    }}>
                                        {ecole.completeness.percentage}% complété
                                    </span>
                                </Col>
                            </Row>
                            <Row gutter={16} style={{ marginTop: 10 }}>
                                <Col xs={12}>
                                    <strong>Localisation :</strong><br />
                                    <span>{ecole.localisation}</span>
                                </Col>
                                <Col xs={12}>
                                    <strong>Direction régionale :</strong><br />
                                    <span>{ecole.directionRegionale}</span>
                                </Col>
                            </Row>
                        </div>
                        
                        {/* Formulaire de modification */}
                        <Form layout="vertical">
                            {(isEdit || type === 'validate' || type === 'reject') && (
                                <Form.Group>
                                    <Form.ControlLabel>Statut de l'établissement</Form.ControlLabel>
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
                                    <Form.Group>
                                        <Form.ControlLabel>Nom de l'établissement</Form.ControlLabel>
                                        <Input
                                            value={formData.nom}
                                            onChange={(value) => setFormData({...formData, nom: value})}
                                            placeholder="Nom complet de l'établissement"
                                        />
                                    </Form.Group>

                                    <Row gutter={16}>
                                        <Col xs={12}>
                                            <Form.Group>
                                                <Form.ControlLabel>Adresse email</Form.ControlLabel>
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(value) => setFormData({...formData, email: value})}
                                                    placeholder="Adresse email de l'établissement"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12}>
                                            <Form.Group>
                                                <Form.ControlLabel>Numéro de téléphone</Form.ControlLabel>
                                                <Input
                                                    value={formData.telephone}
                                                    onChange={(value) => setFormData({...formData, telephone: value})}
                                                    placeholder="Numéro de téléphone de l'établissement"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group>
                                        <Form.ControlLabel>Indication/Description</Form.ControlLabel>
                                        <Input
                                            as="textarea"
                                            rows={3}
                                            value={formData.indication}
                                            onChange={(value) => setFormData({...formData, indication: value})}
                                            placeholder="Description ou indication particulière de l'établissement"
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
                                        type === 'validate' ? "Commentaire sur la validation de l'établissement..." : 
                                        type === 'reject' ? "Motif du refus (obligatoire)..." :
                                        "Commentaire ou notes sur l'établissement..."
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
// COMPOSANT PRINCIPAL DES ÉCOLES À VALIDER
// ===========================
const EcolesAValider = (typeValidation) => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [validationModal, setValidationModal] = useState({
        show: false,
        type: null,
        ecole: null
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
        ecoles,
        loading,
        error,
        refetch
    } = useEcolesData(typeValidation, refreshTrigger);

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
                ecole: item
            });
            return;
        }

        if (actionType === 'reject' && item && item.id) {
            setValidationModal({
                show: true,
                type: 'reject',
                ecole: item
            });
            return;
        }

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            setValidationModal({
                show: true,
                type: 'edit',
                ecole: item
            });
            return;
        }

        // Pour les autres actions (view, download, etc.), utiliser le modal
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DE LA VALIDATION/REFUS/MODIFICATION
    // ===========================
    const handleValidationConfirm = useCallback(async (ecole, formData) => {
        const action = validationModal.type;
        
        console.log(`${action} de l'école:`, {
            ecole: ecole.id,
            etablissement: ecole.nom,
            formData: formData,
            action: action
        });

        // Ici vous pouvez ajouter l'appel API pour valider/refuser/modifier
        // await updateEcoleStatus(ecole.id, formData);

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
                    console.log('Télécharger les documents:', modalState.selectedItem);
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
        const validableEcoles = ecoles.filter(e => e.can_validate);
        console.log('Validation en masse de', validableEcoles.length, 'écoles validables');
    }, [ecoles]);

    const handleExportAll = useCallback(() => {
        console.log('Export de toutes les écoles à valider');
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
                        <EcolesStatsHeader ecoles={ecoles} loading={loading} />
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
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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
                                border: '1px solid rgba(59, 130, 246, 0.1)',
                                overflow: 'hidden'
                            }}>
                                <DataTable
                                    title="Établissements Scolaires à Valider"
                                    subtitle="école(s) en attente de validation"
                                    
                                    data={ecoles}
                                    loading={loading}
                                    error={null}
                                    
                                    columns={ecolesTableConfig.columns}
                                    searchableFields={ecolesTableConfig.searchableFields}
                                    filterConfigs={ecolesTableConfig.filterConfigs}
                                    actions={ecolesTableConfig.actions}
                                    
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
                                            label: 'Valider Validables',
                                            icon: <FiCheckCircle />,
                                            color: 'green',
                                            onClick: handleValidateAll,
                                            disabled: ecoles.filter(e => e.can_validate).length === 0
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

                {/* Aucune école - cas possible */}
                {!loading && !error && ecoles?.length === 0 && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '40px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(59, 130, 246, 0.15)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20
                                }}>
                                    <FiHome size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Aucun établissement à valider
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Tous les établissements scolaires ont été traités ou il n'y a pas de nouvelle demande de souscription.
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
                ecole={validationModal.ecole}
                onClose={() => setValidationModal({ show: false, type: null, ecole: null })}
                onConfirm={handleValidationConfirm}
            />
        </div>
    );
};

export default EcolesAValider;