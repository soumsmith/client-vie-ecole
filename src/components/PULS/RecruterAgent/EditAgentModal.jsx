import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    ButtonToolbar,
    Button,
    Input,
    SelectPicker,
    IconButton,
    Panel,
    Divider,
    Row,
    Col,
    Text,
    Badge,
    Avatar,
    Grid
} from 'rsuite';
import {
    FiFileText,
    FiX,
    FiCheck,
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiAward,
    FiUserCheck,
    FiDownload
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import getFullUrl from '../../hooks/urlUtils';
import { usePersonnelUrls, useAppParams } from '../utils/apiConfig';


const EditAgentModal = ({ open, onClose, agent, onSave }) => {
    // État du formulaire
    const [formData, setFormData] = useState({
        diplome: '',
        dateNaissance: null,
        contact: '',
        statutRecrutement: 'EN_ATTENTE'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const appParams = useAppParams();
    const personnelUrls = usePersonnelUrls();

    // Options pour le statut de recrutement
    const statutOptions = [
        { label: 'En attente', value: 'EN_ATTENTE' },
        { label: 'Validé', value: 'VALIDEE' },
        { label: 'Rejeté', value: 'REJETE' },
        { label: 'En cours d\'évaluation', value: 'EN_EVALUATION' }
    ];

    // Configuration EmailJS - CORRIGÉE
    const emailJSConfig = {
        service_id: 'service_p5b4z05',
        template_id: 'template_khmrq5i',
        user_id: 'rQ8B8i3jHyGwChdlj'
    };

    // Charger les données de l'agent quand le modal s'ouvre
    useEffect(() => {
        if (agent && open) {
            setFormData({
                diplome: agent.diplome || '',
                dateNaissance: agent.dateNaissance ? new Date(agent.dateNaissance) : null,
                contact: agent.contact || '',
                statutRecrutement: 'EN_ATTENTE'
            });
        }
    }, [agent, open]);

    // Gérer les changements de statut
    const handleStatutChange = (value) => {
        setFormData(prev => ({
            ...prev,
            statutRecrutement: value
        }));
    };

    // Fonction pour envoyer l'email via EmailJS - CORRIGÉE
    const sendEmailNotification = async () => {
        const emailData = {
            service_id: emailJSConfig.service_id,
            template_id: emailJSConfig.template_id,
            user_id: emailJSConfig.user_id,
            template_params: {
                user_name: 'GAIN SARL',
                to_name: agent.nomComplet || 'Agent',
                to_email: agent.email || 'soumsmith1@gmail.com',
                from_name: 'GAIN SARL',
                reply_to: 'soumsmith1@gmail.com',
                message: `Bonjour Monsieur/Madame ${agent.nomComplet || ''},\n\nVous avez été recruté(e) avec succès.\n\nVeuillez utiliser vos identifiants pour vous connecter à notre application.\n\nCordialement,\nL'équipe GAIN SARL`,
                agent_name: agent.nomComplet || '',
                agent_email: agent.email || '',
                statut: statutOptions.find(opt => opt.value === formData.statutRecrutement)?.label || ''
            }
        };

        console.log('📧 Envoi email avec les données:', emailData);

        const response = await axios.post(
            'https://api.emailjs.com/api/v1.0/email/send',
            emailData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return response;
    };

    // Fonction pour recruter l'agent via l'API interne
    const recruterAgent = async () => {
        if (!agent || !agent.id) {
            throw new Error('ID de l\'agent manquant');
        }

        const url = personnelUrls.saveRecutementSouscriptionRecruter(agent.id);
        console.log('🔗 URL API recrutement:', url);
        
        const response = await axios.post(url, {});

        return response;
    };

    // Gérer la sauvegarde avec appels API
    const handleSave = async () => {
        if (!agent || !agent.id) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Données de l\'agent manquantes. Impossible de sauvegarder.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Confirmer le recrutement',
            text: `Êtes-vous sûr de vouloir valider le recrutement de ${agent.nomComplet} avec le statut "${statutOptions.find(opt => opt.value === formData.statutRecrutement)?.label}" ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, valider',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            let emailSuccess = false;
            let apiSuccess = false;
            let emailError = null;
            let apiError = null;

            // Étape 1: Envoyer l'email de notification
            try {
                console.log('📤 Envoi de l\'email de notification...');
                const emailResponse = await sendEmailNotification();
                emailSuccess = true;
                console.log('✅ Email envoyé avec succès:', emailResponse.data);
            } catch (error) {
                console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
                console.error('Détails:', error.response?.data || error.message);
                emailError = error;
            }

            // Étape 2: Recruter l'agent via l'API interne
            try {
                console.log('🔄 Recrutement de l\'agent via API...');
                const response = await recruterAgent();
                apiSuccess = true;
                console.log('✅ Agent recruté avec succès:', response.data);
            } catch (error) {
                console.error('❌ Erreur lors du recrutement:', error);
                console.error('Détails:', error.response?.data || error.message);
                apiError = error;
            }

            // Analyse des résultats et affichage du message approprié
            if (emailSuccess && apiSuccess) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Recrutement validé !',
                    text: `${agent.nomComplet} a été recruté avec succès et l'email de notification a été envoyé.`,
                    confirmButtonColor: '#10b981',
                    timer: 4000,
                    showConfirmButton: true
                });

                if (onSave) {
                    const dataToSave = {
                        ...agent,
                        statutRecrutement: formData.statutRecrutement
                    };
                    onSave(dataToSave);
                }

                onClose();
            } else if (apiSuccess && !emailSuccess) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Recrutement validé avec avertissement',
                    text: `${agent.nomComplet} a été recruté avec succès, mais l'email de notification n'a pas pu être envoyé.`,
                    footer: `Erreur email: ${emailError?.response?.data?.message || emailError?.message || 'Erreur inconnue'}`,
                    confirmButtonColor: '#10b981'
                });

                if (onSave) {
                    const dataToSave = {
                        ...agent,
                        statutRecrutement: formData.statutRecrutement
                    };
                    onSave(dataToSave);
                }

                onClose();
            } else if (!apiSuccess && emailSuccess) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Erreur de recrutement',
                    text: `L'email a été envoyé mais le recrutement de ${agent.nomComplet} a échoué.`,
                    footer: `Erreur API: ${apiError?.response?.data?.message || apiError?.message || 'Erreur inconnue'}`,
                    confirmButtonColor: '#ef4444'
                });
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Échec complet',
                    text: `Le recrutement de ${agent.nomComplet} a échoué ainsi que l'envoi de l'email.`,
                    footer: `Erreurs: API - ${apiError?.response?.data?.message || apiError?.message || 'Erreur inconnue'}, Email - ${emailError?.response?.data?.message || emailError?.message || 'Erreur inconnue'}`,
                    confirmButtonColor: '#ef4444'
                });
            }

        } catch (error) {
            console.error('❌ Erreur inattendue:', error);

            await Swal.fire({
                icon: 'error',
                title: 'Erreur inattendue',
                text: 'Une erreur inattendue est survenue lors du traitement.',
                footer: error.message,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Gérer l'annulation
    const handleCancel = () => {
        setFormData({
            diplome: '',
            dateNaissance: null,
            contact: '',
            statutRecrutement: 'EN_ATTENTE'
        });
        onClose();
    };

    if (!agent) return null;

    // Extraction du prénom et nom pour l'avatar
    const getInitials = (name) => {
        if (!name) return 'AG';
        const names = name.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
    };

    const InfoCard = ({ icon: Icon, title, value, color = '#6366f1', disabled = true }) => (
        <div style={{
            background: disabled ? '#f8fafc' : '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '12px',
            padding: '16px',
            height: '85px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            opacity: disabled ? 0.7 : 1
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={14} style={{ color: disabled ? '#9ca3af' : color }} />
                <Text size="sm" style={{
                    color: disabled ? '#9ca3af' : '#64748b',
                    fontWeight: '500'
                }}>
                    {title}
                </Text>
            </div>
            <Text style={{
                color: disabled ? '#9ca3af' : '#0f172a',
                fontWeight: '600',
                fontSize: '14px',
                lineHeight: '1.2'
            }}>
                {value || 'Non spécifié'}
            </Text>
        </div>
    );

    const DocumentCard = ({ hasDoc = false, onClick, title }) => {
        const iconColor = hasDoc ? '#10b981' : '#cbd5e1';
        const bgColor = hasDoc ? '#f0fdf4' : '#f8fafc';
        const borderColor = hasDoc ? '#bbf7d0' : '#e2e8f0';

        return (
            <div
                onClick={hasDoc ? onClick : undefined}
                style={{
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: hasDoc ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    minHeight: '80px',
                    justifyContent: 'center',
                    opacity: hasDoc ? 1 : 0.6
                }}
            >
                <FiFileText size={20} style={{ color: iconColor }} />
                <Text size="xs" style={{
                    color: hasDoc ? '#059669' : '#64748b',
                    textAlign: 'center',
                    fontWeight: '500'
                }}>
                    {title}
                </Text>
                {hasDoc && (
                    <Badge style={{
                        background: '#10b981',
                        color: 'white',
                        fontSize: '10px'
                    }}>
                        Disponible
                    </Badge>
                )}
            </div>
        );
    };

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
            {/* Header épuré */}
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
                        {getInitials(agent?.nomComplet)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            {agent?.nomComplet || 'Agent'}
                        </Text>
                        <Badge style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: '500',
                            border: '1px solid #e2e8f0'
                        }}>
                            {agent?.fonction || 'PERSONNEL'}
                        </Badge>
                        <div style={{ marginTop: '8px' }}>
                            <Text size="sm" style={{ color: '#94a3b8' }}>
                                ID: {agent?.id || 'Non défini'}
                            </Text>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiUserCheck size={20} style={{ color: '#6366f1' }} />
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Validation recrutement
                        </Text>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{
                padding: '32px 24px',
                background: '#fafafa'
            }}>
                {/* Contact rapide */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FiMail size={16} style={{ color: '#6366f1' }} />
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            {agent?.email || 'Email non disponible'}
                        </Text>
                    </div>
                </div>

                {/* Informations personnelles */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Informations personnelles
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
                                    icon={FiAward}
                                    title="Diplôme récent"
                                    value={formData.diplome || 'Non spécifié'}
                                    color="#f59e0b"
                                    disabled={false}
                                />
                            </Col>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiCalendar}
                                    title="Date de naissance"
                                    value={formData.dateNaissance ?
                                        formData.dateNaissance.toLocaleDateString('fr-CA') :
                                        'Non spécifiée'
                                    }
                                    color="#ef4444"
                                    disabled={false}
                                />
                            </Col>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiPhone}
                                    title="Contact"
                                    value={formData.contact || 'Non spécifié'}
                                    color="#10b981"
                                    disabled={false}
                                />
                            </Col>
                        </Row>
                    </Grid>
                </Panel>

                {/* Validation du recrutement */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Validation du recrutement
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
                    <Form fluid>
                        <Form.Group>
                            <Form.ControlLabel style={{
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }} className='mt-3'>
                                Statut de recrutement <span style={{ color: '#ef4444' }}>*</span>
                            </Form.ControlLabel>
                            <SelectPicker
                                data={statutOptions}
                                value={formData.statutRecrutement}
                                onChange={handleStatutChange}
                                placeholder="Choisir un statut"
                                cleanable={false}
                                disabled={isSubmitting}
                                style={{ width: '100%' }}
                            />

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
                                    Ce champ détermine le statut final du recrutement de cet agent. Un email de notification sera envoyé automatiquement.
                                </Text>
                            </div>
                        </Form.Group>
                    </Form>
                </Panel>

                {/* Documents */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Documents disponibles
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
                    <Grid fluid className='mt-3'>
                        <Row gutter={12}>
                            <Col xs={6}>
                                <DocumentCard
                                    title="CV"
                                    hasDoc={agent?.has_cv || false}
                                    onClick={() => console.log('Ouvrir CV')}
                                />
                            </Col>
                            <Col xs={6}>
                                <DocumentCard
                                    title="Autorisation"
                                    hasDoc={agent?.has_autorisation || false}
                                    onClick={() => console.log('Ouvrir autorisation')}
                                />
                            </Col>
                            <Col xs={6}>
                                <DocumentCard
                                    title="Pièce d'identité"
                                    hasDoc={agent?.has_piece || false}
                                    onClick={() => console.log('Ouvrir pièce')}
                                />
                            </Col>
                        </Row>
                    </Grid>
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
                        onClick={handleSave}
                        startIcon={<FiCheck />}
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
                        {isSubmitting ? 'Traitement en cours...' : 'Valider le recrutement'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default EditAgentModal;