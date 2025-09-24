import React, { useState, useEffect } from 'react';
import { 
    Modal, 
    Button, 
    Form, 
    Input, 
    Panel, 
    Grid, 
    Row, 
    Col,
    SelectPicker,
    Text,
    Badge,
    Avatar
} from 'rsuite';
import { 
    FiHome,
    FiEdit,
    FiSave,
    FiX,
    FiHash,
    FiType,
    FiLayers,
    FiPlus
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from "../../hooks/useDynamicParams";


const EditSalleModal = ({ show, salle, onClose, onSave, mode = 'edit' }) => {
    const [formData, setFormData] = useState({
        code: '',
        libelle: '',
        niveauEtage: null
    });

    const {
        ecoleId: dynamicEcoleId,
        personnelInfo,
        academicYearId: dynamicAcademicYearId,
        periodicitieId: dynamicPeriodicitieId,
        profileId,
        userId,
        email,
        isAuthenticated,
        isInitialized,
        isReady,
    } = usePulsParams();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrls = useAllApiUrls();

    // Options pour les niveaux d'étage
    const niveauxEtage = [
        { label: 'Niveau 0', value: 0 },
        { label: '1er Etage', value: 1 },
        { label: '2ème Etage', value: 2 },
        { label: '3ème Etage', value: 3 },
        { label: '4ème Etage', value: 4 },
        { label: '5ème Etage', value: 5 }
    ];

    // Réinitialiser le formulaire quand le modal s'ouvre
    useEffect(() => {
        if (show) {
            if (mode === 'edit' && salle) {
                // Mode modification : préremplir avec les données de la salle
                setFormData({
                    code: salle.code || '',
                    libelle: salle.libelle || '',
                    niveauEtage: salle.niveauEtage || null
                });
            } else {
                // Mode création : formulaire vide
                setFormData({
                    code: '',
                    libelle: '',
                    niveauEtage: null
                });
            }
        }
    }, [show, salle, mode]);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        // Validation des champs requis
        if (!formData.code.trim() || !formData.libelle.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Champs requis',
                text: 'Veuillez remplir le code et le libellé avant de sauvegarder.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Demande de confirmation
        const actionText = mode === 'edit' ? 'modifier' : 'créer';
        const result = await Swal.fire({
            title: `Confirmer ${mode === 'edit' ? 'la modification' : 'la création'}`,
            text: `Êtes-vous sûr de vouloir ${actionText} la salle "${formData.libelle}" ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Oui, ${actionText}`,
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            let apiData;
            let apiUrl;

            if (mode === 'edit') {
                // Mode modification
                apiData = {
                    ...salle, // Garder toutes les données originales
                    code: formData.code,
                    libelle: formData.libelle,
                    niveauEtage: formData.niveauEtage
                };
                apiUrl = apiUrls.salles.updateDisplay();
            } else {
                // Mode création
                apiData = {
                    code: formData.code,
                    libelle: formData.libelle,
                    ecole: {
                        id: dynamicEcoleId // ID de l'école par défaut
                    },
                    niveauEtage: null, //formData.niveauEtage
                };
                apiUrl = apiUrls.salles.saveAndDisplay();
            }

            const response = await axios.post(apiUrl, apiData);

            if (response.status === 200 || response.status === 201) {
                await Swal.fire({
                    icon: 'success',
                    title: `Salle ${mode === 'edit' ? 'modifiée' : 'créée'} !`,
                    text: `La salle "${formData.libelle}" a été ${mode === 'edit' ? 'modifiée' : 'créée'} avec succès.`,
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    showConfirmButton: true
                });

                if (onSave) {
                    onSave({
                        salle: apiData,
                        formData,
                        apiResponse: response.data,
                        mode
                    });
                }

                onClose();
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error(`Erreur lors de ${mode === 'edit' ? 'la modification' : 'la création'} de la salle:`, error);

            let errorMessage = `Une erreur inattendue est survenue lors de ${mode === 'edit' ? 'la modification' : 'la création'}.`;
            
            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Données invalides. Vérifiez les informations saisies.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Non autorisé. Vérifiez vos permissions.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Salle non trouvée ou service indisponible.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                } else {
                    errorMessage = `Erreur serveur: ${error.response.status} - ${error.response.data?.message || 'Erreur inconnue'}`;
                }
            } else if (error.request) {
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'La requête a expiré. Le serveur met trop de temps à répondre.';
            }

            await Swal.fire({
                icon: 'error',
                title: `Erreur ${mode === 'edit' ? 'de modification' : 'de création'}`,
                text: errorMessage,
                confirmButtonColor: '#ef4444',
                footer: error.response?.data?.details ? `Détails: ${error.response.data.details}` : null
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Extraction du code et libellé pour l'avatar
    const getInitials = (code, libelle) => {
        if (code && code.length >= 2) return code.slice(0, 2).toUpperCase();
        if (libelle) return libelle.slice(0, 2).toUpperCase();
        return mode === 'edit' ? 'SL' : 'NS';
    };

    const InfoCard = ({ icon: Icon, title, value, color = '#6366f1' }) => (
        <div style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '12px',
            padding: '16px',
            height: '85px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={14} style={{ color }} />
                <Text size="sm" style={{
                    color: '#64748b',
                    fontWeight: '500'
                }}>
                    {title}
                </Text>
            </div>
            <div>
                <Text style={{
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '14px',
                    lineHeight: '1.2'
                }}>
                    {value || 'Non renseigné'}
                </Text>
            </div>
        </div>
    );

    return (
        <Modal 
            open={show} 
            onClose={onClose}
            size="lg"
            backdrop="static"
            style={{
                borderRadius: '16px',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Modal.Header style={{
                background: '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                padding: '24px',
                borderRadius: '16px 16px 0 0'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <Avatar
                        size="lg"
                        style={{
                            background: '#f8fafc',
                            color: '#64748b',
                            fontWeight: '600',
                            fontSize: '18px',
                            border: '2px solid #e2e8f0'
                        }}
                    >
                        {getInitials(salle?.code || formData.code, salle?.libelle || formData.libelle)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            {mode === 'edit' ? (salle?.libelle || 'Salle') : 'Nouvelle Salle'}
                        </Text>
                        {mode === 'edit' && (
                            <>
                                <Badge style={{ 
                                    background: '#f1f5f9', 
                                    color: '#475569',
                                    fontWeight: '500',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    {salle?.code || 'CODE'}
                                </Badge>
                                <div style={{ marginTop: '8px' }}>
                                    <Text size="sm" style={{ color: '#94a3b8' }}>
                                        ID: {salle?.id || 'Non défini'}
                                    </Text>
                                </div>
                            </>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {mode === 'edit' ? <FiEdit size={20} style={{ color: '#6366f1' }} /> : <FiPlus size={20} style={{ color: '#10b981' }} />}
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            {mode === 'edit' ? 'Modifier une Salle' : 'Créer une Salle'}
                        </Text>
                    </div>
                </div>
            </Modal.Header>
            
            <Modal.Body style={{ 
                padding: '32px 24px', 
                background: '#fafafa'
            }}>
                {/* Informations actuelles (mode modification uniquement) */}
                {mode === 'edit' && salle && (
                    <Panel
                        header={
                            <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                                Informations actuelles
                            </Text>
                        }
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            border: '1px solid #f1f5f9',
                            marginBottom: '24px',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                        }}
                        bodyStyle={{ padding: '20px' }}
                    >
                        <Grid fluid className='mt-3'>
                            <Row gutter={16}>
                                <Col xs={8}>
                                    <InfoCard
                                        icon={FiHash}
                                        title="Code"
                                        value={salle?.code || 'Non défini'}
                                        color="#f59e0b"
                                    />
                                </Col>
                                <Col xs={8}>
                                    <InfoCard
                                        icon={FiLayers}
                                        title="Étage"
                                        value={salle?.niveauEtage !== null && salle?.niveauEtage !== undefined 
                                            ? `Niveau ${salle.niveauEtage}` 
                                            : 'Non défini'}
                                        color="#ef4444"
                                    />
                                </Col>
                                <Col xs={8}>
                                    <InfoCard
                                        icon={FiHome}
                                        title="École"
                                        value={salle?.ecole?.libelle || 'Non définie'}
                                        color="#6366f1"
                                    />
                                </Col>
                            </Row>
                        </Grid>
                    </Panel>
                )}

                {/* Formulaire */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            {mode === 'edit' ? 'Modifier les informations' : 'Informations de la salle'}
                        </Text>
                    }
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <Form fluid className='mt-3'>
                        <Grid fluid>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{ 
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiHash size={14} style={{ marginRight: '6px' }} />
                                            Code <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <Input 
                                            value={formData.code}
                                            onChange={(value) => handleInputChange('code', value)}
                                            placeholder="Ex: S01"
                                            disabled={isSubmitting}
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                padding: '12px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{ 
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiType size={14} style={{ marginRight: '6px' }} />
                                            Libellé <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <Input 
                                            value={formData.libelle}
                                            onChange={(value) => handleInputChange('libelle', value)}
                                            placeholder="Ex: SALLE 1"
                                            disabled={isSubmitting}
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                padding: '12px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{ 
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiLayers size={14} style={{ marginRight: '6px' }} />
                                            Étage
                                        </Form.ControlLabel>
                                        <SelectPicker 
                                            data={niveauxEtage}
                                            value={formData.niveauEtage}
                                            onChange={(value) => handleInputChange('niveauEtage', value)}
                                            placeholder="Sélectionner le niveau"
                                            disabled={isSubmitting}
                                            style={{ width: '100%' }}
                                            cleanable={true}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Grid>
                    </Form>
                </Panel>
            </Modal.Body>

            <Modal.Footer style={{
                padding: '20px 24px',
                borderTop: '1px solid #f1f5f9',
                background: 'white',
                borderRadius: '0 0 16px 16px'
            }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button 
                        appearance="subtle" 
                        onClick={onClose}
                        startIcon={<FiX />}
                        disabled={isSubmitting}
                        style={{
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 16px'
                        }}
                    >
                        Annuler
                    </Button>
                    <Button 
                        appearance="primary" 
                        onClick={handleSave}
                        startIcon={<FiSave />}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={{
                            background: isSubmitting ? '#94a3b8' : (mode === 'edit' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'),
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontWeight: '600'
                        }}
                    >
                        {isSubmitting ? (mode === 'edit' ? 'Modification en cours...' : 'Création en cours...') : (mode === 'edit' ? 'Modifier' : 'Créer')}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default EditSalleModal;