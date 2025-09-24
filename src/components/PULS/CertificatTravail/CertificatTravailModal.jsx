import React, { useState, useEffect } from 'react';
import { 
    Modal, 
    Form, 
    Button, 
    Input, 
    Avatar,
    Text,
    Grid,
    Row,
    Col,
    Divider,
    Panel
} from 'rsuite';
import { 
    FiX, 
    // FiPrint, 
    FiUser, 
    FiUserCheck,
    FiFileText,
    FiEdit
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { genererCertificatTravail } from './CertificatTravailService';
import { useCertificatTravailGenerator } from './CertificatTravailService';
import { usePulsParams } from '../../hooks/useDynamicParams';
import { useAllApiUrls } from '../utils/apiConfig';

const CertificatTravailModal = ({ open, onClose, personnel, onSuccess }) => {
    // État du formulaire pour les informations du signataire
    const [formData, setFormData] = useState({
        nomSignataire: '',
        fonctionSignataire: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { generer, isGenerating, error: generationError } = useCertificatTravailGenerator();
    const { ecoleId: dynamicEcoleId } = usePulsParams();
    const apiUrls = useAllApiUrls();


    // Charger les données du personnel quand le modal s'ouvre
    useEffect(() => {
        if (personnel && open) {
            setFormData({
                nomSignataire: personnel.nomSignataire || '',
                fonctionSignataire: personnel.fonction || ''
            });
        }
    }, [personnel, open]);

    // Gérer les changements dans le formulaire
    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Fonction pour générer et imprimer le certificat
    const handleGenererCertificat = async () => {
        // Validation des champs
        if (!formData.nomSignataire.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Champ requis',
                text: 'Veuillez saisir le nom du signataire.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        if (!formData.fonctionSignataire.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Champ requis',
                text: 'Veuillez saisir la fonction du signataire.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Générer le certificat',
            text: `Voulez-vous générer le certificat de travail pour ${personnel.nomComplet} ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, générer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            console.log('Génération du certificat de travail...');
            
            // Construire l'URL dans le composant (où les hooks sont autorisés)
            const certificatUrl = apiUrls.personnel.imprimerCertificatTravail(
                dynamicEcoleId || apiUrls.params.ecoleId,
                personnel.id,
                formData.nomSignataire.trim(),
                formData.fonctionSignataire.trim()
            );

            console.log('URL générée:', certificatUrl);
            
            // Appel à la fonction utilitaire avec l'URL construite
            const response = await generer(certificatUrl, personnel.id);

            console.log('Certificat généré avec succès:', response);

            await Swal.fire({
                icon: 'success',
                title: 'Certificat généré !',
                text: `Le certificat de travail pour ${personnel.nomComplet} a été généré avec succès.`,
                confirmButtonColor: '#10b981',
                timer: 4000,
                showConfirmButton: true
            });

            if (onSuccess) {
                onSuccess(personnel, response.data);
            }

            onClose();

        } catch (error) {
            console.error('Erreur lors de la génération du certificat:', error);
            
            await Swal.fire({
                icon: 'error',
                title: 'Erreur de génération',
                text: `Impossible de générer le certificat pour ${personnel.nomComplet}.`,
                footer: error.message || 'Erreur inconnue',
                confirmButtonColor: '#ef4444'
            });
        }
    };

    // Gérer l'annulation
    const handleCancel = () => {
        setFormData({
            nomSignataire: '',
            fonctionSignataire: ''
        });
        onClose();
    };

    if (!personnel) return null;

    // Extraction du prénom et nom pour l'avatar
    const getInitials = (name) => {
        if (!name) return 'PE';
        const names = name.split(' ');
        return names.length > 1 
            ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
    };

    const InfoItem = ({ label, value, icon: Icon }) => (
        <div style={{
            background: '#f8fafc',
            border: '1px solid #f1f5f9',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }}>
            <Icon size={14} style={{ color: '#6366f1' }} />
            <div style={{ flex: 1 }}>
                <Text size="xs" style={{ color: '#64748b', fontWeight: '500' }}>
                    {label}
                </Text>
                <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: '13px' }}>
                    {value || 'Non spécifié'}
                </Text>
            </div>
        </div>
    );

    return (
        <Modal 
            open={open} 
            onClose={onClose}
            size="md"
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
                        {getInitials(personnel?.nomComplet)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            {personnel?.nomComplet || 'Personnel'}
                        </Text>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px'
                        }}>
                            <div style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                border: '1px solid #e2e8f0'
                            }}>
                                {personnel?.fonction || 'PERSONNEL'}
                            </div>
                        </div>
                        <Text size="sm" style={{ color: '#94a3b8' }}>
                            ID: {personnel?.id || 'Non défini'}
                        </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiFileText size={20} style={{ color: '#6366f1' }} />
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Certificat de travail
                        </Text>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{ 
                padding: '32px 24px', 
                background: '#fafafa'
            }}>
                {/* Informations du personnel */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Informations du personnel
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
                        <Row gutter={12}>
                            <Col xs={12}>
                                <InfoItem
                                    icon={FiUser}
                                    label="Nom complet"
                                    value={personnel?.nomComplet}
                                />
                            </Col>
                            <Col xs={12}>
                                <InfoItem
                                    icon={FiUserCheck}
                                    label="Fonction"
                                    value={personnel?.fonction}
                                />
                            </Col>
                        </Row>
                        <div style={{ height: '12px' }} />
                        <Row gutter={12}>
                            <Col xs={12}>
                                <InfoItem
                                    icon={FiEdit}
                                    label="Formation"
                                    value={personnel?.niveauEtude}
                                />
                            </Col>
                            <Col xs={12}>
                                <InfoItem
                                    icon={FiEdit}
                                    label="Domaine"
                                    value={personnel?.domaineFormation}
                                />
                            </Col>
                        </Row>
                    </Grid>
                </Panel>

                {/* Formulaire des informations du signataire */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Informations du signataire
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
                    <Form fluid>
                        <Grid fluid className='mt-3'>
                            <Row gutter={16}>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.ControlLabel style={{ 
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            Nom signataire <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <Input
                                            placeholder="Saisir le nom du signataire"
                                            value={formData.nomSignataire}
                                            onChange={(value) => handleChange('nomSignataire', value)}
                                            disabled={isSubmitting}
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.ControlLabel style={{ 
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            Fonction signataire <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <Input
                                            placeholder="Saisir la fonction du signataire"
                                            value={formData.fonctionSignataire}
                                            onChange={(value) => handleChange('fonctionSignataire', value)}
                                            disabled={isSubmitting}
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Grid>
                        
                        <div style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '8px',
                            padding: '16px',
                            marginTop: '16px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                background: '#0ea5e9',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: '2px'
                            }}>
                                <Text style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>i</Text>
                            </div>
                            <Text size="sm" style={{ color: '#0c4a6e', lineHeight: '1.5' }}>
                                Ces informations apparaîtront sur le certificat de travail généré. Assurez-vous qu'elles sont correctes avant de procéder à l'impression.
                            </Text>
                        </div>
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
                        onClick={handleCancel}
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
                        onClick={handleGenererCertificat}
                        startIcon={<FiUserCheck />}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={{
                            background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontWeight: '600'
                        }}
                    >
                        {isSubmitting ? 'Génération en cours...' : 'Imprimer'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default CertificatTravailModal;