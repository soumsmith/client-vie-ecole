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
    ButtonToolbar,
    IconButton,
    Tooltip,
    Whisper,
    Text,
    Badge,
    Avatar
} from 'rsuite';
import { 
    FiCopy, 
    FiBold, 
    FiItalic, 
    FiUnderline, 
    FiList, 
    FiMail, 
    FiPhone, 
    FiCalendar, 
    FiAward,
    FiSend,
    FiX
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useMessagesUrls, useAppParams } from '../utils/apiConfig';


const EditCandidatModal = ({ show, candidat, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        objet: '',
        message: ''
    });

    const [textareaRef, setTextareaRef] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Utilisation des configurations centralisées
    const appParams = useAppParams();
    const messagesUrls = useMessagesUrls();

    // Réinitialiser le formulaire quand le modal s'ouvre avec un nouveau candidat
    useEffect(() => {
        if (show && candidat) {
            setFormData({
                objet: `Candidature - ${candidat.nomComplet}`,
                message: `Bonjour cher candidat!\n\nNous avons bien reçu vos informations concernant votre candidature.\n\nCordialement,\nL'équipe RH`
            });
        }
    }, [show, candidat]);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        // Vérification des données nécessaires
        if (!candidat || !candidat.id) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Données du candidat manquantes. Impossible d\'envoyer le message.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        if (!formData.objet.trim() || !formData.message.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Champs requis',
                text: 'Veuillez remplir l\'objet et le message avant d\'envoyer.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Demande de confirmation avec SweetAlert
        const result = await Swal.fire({
            title: 'Confirmer l\'envoi du message',
            text: `Êtes-vous sûr de vouloir envoyer ce message à ${candidat.nomComplet} ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, envoyer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Conversion du message en HTML (basique)
            const htmlMessage = formData.message
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Gras
                .replace(/\*(.*?)\*/g, '<i>$1</i>') // Italique
                .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>') // Souligné (garde tel quel)
                .replace(/\n/g, '</div><div>') // Nouvelle ligne
                .replace(/^/, '<div>') // Début
                .replace(/$/, '</div>'); // Fin

            // Préparation des données pour l'API
            const apiData = {
                administrateur_gain_idadministrateur_gai: null,
                ecole_ecoleid: appParams.ecoleId,
                identifiant_personnel: candidat.id,
                message_personnel_emetteur: appParams.personnelInfo?.nom || "",
                message_personnel_id: null,
                message_personnel_message: htmlMessage,
                message_personnel_sujet: formData.objet,
                idEmetteur: appParams.userId || appParams.personnelId,
                idDestinataire: candidat.id
            };

            console.log('📤 Envoi du message vers le candidat:', apiData);

            // Utilisation de l'URL centralisée
            const url = messagesUrls.sendToPersonnel(candidat.id);
            console.log('🔗 URL d\'envoi:', url);

            const response = await axios.post(url, apiData);

            console.log('✅ Réponse du serveur:', response);

            if (response.status === 200 || response.status === 201) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Message envoyé !',
                    text: `Le message a été envoyé avec succès à ${candidat.nomComplet}.`,
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    showConfirmButton: true
                });

                if (onSave) {
                    onSave({
                        candidat,
                        emailData: formData,
                        apiResponse: response.data
                    });
                }

                onClose();
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi du message:', error);

            let errorMessage = 'Une erreur inattendue est survenue lors de l\'envoi du message.';
            
            if (error.response) {
                // Erreurs HTTP avec réponse du serveur
                const status = error.response.status;
                const serverMessage = error.response.data?.message || '';
                
                switch (status) {
                    case 400:
                        errorMessage = `Données invalides: ${serverMessage || 'Vérifiez le contenu du message et l\'objet.'}`;
                        break;
                    case 401:
                        errorMessage = 'Non autorisé. Vérifiez vos permissions.';
                        break;
                    case 403:
                        errorMessage = 'Accès interdit. Vous n\'avez pas les droits pour envoyer des messages.';
                        break;
                    case 404:
                        errorMessage = 'Candidat non trouvé ou service indisponible.';
                        break;
                    case 409:
                        errorMessage = 'Conflit: Un message similaire a peut-être déjà été envoyé.';
                        break;
                    case 422:
                        errorMessage = `Données non valides: ${serverMessage}`;
                        break;
                    case 500:
                        errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                        break;
                    case 503:
                        errorMessage = 'Service de messagerie temporairement indisponible.';
                        break;
                    default:
                        errorMessage = `Erreur serveur (${status}): ${serverMessage || 'Erreur inconnue'}`;
                }
            } else if (error.request) {
                // Erreur réseau - pas de réponse du serveur
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            } else if (error.code === 'ECONNABORTED') {
                // Timeout
                errorMessage = 'La requête a expiré. Le serveur met trop de temps à répondre.';
            } else {
                // Autres erreurs
                errorMessage = `Erreur technique: ${error.message}`;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Erreur d\'envoi',
                text: errorMessage,
                confirmButtonColor: '#ef4444',
                footer: error.response?.data?.details ? `Détails: ${error.response.data.details}` : null
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyInfo = (info) => {
        navigator.clipboard.writeText(info);
        Swal.fire({
            icon: 'success',
            title: 'Copié !',
            text: 'Information copiée dans le presse-papiers.',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    // Fonctions de formatage de texte
    const insertFormatting = (before, after = '') => {
        if (!textareaRef) return;

        const start = textareaRef.selectionStart;
        const end = textareaRef.selectionEnd;
        const selectedText = textareaRef.value.substring(start, end);
        const newText = before + selectedText + after;
        
        const newValue = 
            textareaRef.value.substring(0, start) + 
            newText + 
            textareaRef.value.substring(end);
        
        setFormData(prev => ({ ...prev, message: newValue }));
        
        setTimeout(() => {
            textareaRef.focus();
            textareaRef.setSelectionRange(
                start + before.length,
                start + before.length + selectedText.length
            );
        }, 0);
    };

    const handleBold = () => insertFormatting('**', '**');
    const handleItalic = () => insertFormatting('*', '*');
    const handleUnderline = () => insertFormatting('<u>', '</u>');
    const handleList = () => insertFormatting('\n- ', '');

    if (!candidat) return null;

    // Extraction du prénom et nom pour l'avatar
    const getInitials = (name) => {
        if (!name) return 'CD';
        const names = name.split(' ');
        return names.length > 1 
            ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
    };

    const InfoCard = ({ icon: Icon, title, value, color = '#6366f1', onCopy }) => (
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
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            position: 'relative'
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '14px',
                    lineHeight: '1.2'
                }}>
                    {value || 'Non renseigné'}
                </Text>
                <Whisper speaker={<Tooltip>Copier</Tooltip>}>
                    <IconButton 
                        icon={<FiCopy />} 
                        size="xs" 
                        appearance="subtle"
                        onClick={() => onCopy(value)}
                        style={{
                            opacity: 0.6,
                            transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = 1}
                        onMouseLeave={(e) => e.target.style.opacity = 0.6}
                    />
                </Whisper>
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
                        {getInitials(candidat?.nomComplet)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            {candidat?.nomComplet || 'Candidat'}
                        </Text>
                        <Badge style={{ 
                            background: '#f1f5f9', 
                            color: '#475569',
                            fontWeight: '500',
                            border: '1px solid #e2e8f0'
                        }}>
                            CANDIDAT
                        </Badge>
                        <div style={{ marginTop: '8px' }}>
                            <Text size="sm" style={{ color: '#94a3b8' }}>
                                ID: {candidat?.id || 'Non défini'}
                            </Text>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiMail size={20} style={{ color: '#6366f1' }} />
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Envoi de message
                        </Text>
                    </div>
                </div>
            </Modal.Header>
            
            <Modal.Body style={{ 
                padding: '32px 24px', 
                background: '#fafafa'
            }}>
                {/* Informations du candidat */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Informations du candidat
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
                                    value={candidat?.diplome || 'Non renseigné'}
                                    color="#f59e0b"
                                    onCopy={handleCopyInfo}
                                />
                            </Col>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiCalendar}
                                    title="Date de naissance"
                                    value={candidat?.dateNaissance || 'Non renseignée'}
                                    color="#ef4444"
                                    onCopy={handleCopyInfo}
                                />
                            </Col>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiPhone}
                                    title="Contact"
                                    value={candidat?.contact || 'Non renseigné'}
                                    color="#10b981"
                                    onCopy={handleCopyInfo}
                                />
                            </Col>
                        </Row>
                    </Grid>
                </Panel>

                {/* Formulaire d'email */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Composer le message
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
                        <Form.Group style={{ marginBottom: '24px' }}>
                            <Form.ControlLabel style={{ 
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Objet du message <span style={{color: '#ef4444'}}>*</span>
                            </Form.ControlLabel>
                            <Input 
                                value={formData.objet}
                                onChange={(value) => handleInputChange('objet', value)}
                                placeholder="Saisissez l'objet du message"
                                disabled={isSubmitting}
                                style={{
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    padding: '12px',
                                    fontSize: '14px'
                                }}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel style={{ 
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Message <span style={{color: '#ef4444'}}>*</span>
                            </Form.ControlLabel>
                            
                            {/* Barre d'outils de formatage */}
                            <div style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderBottom: 'none',
                                borderRadius: '8px 8px 0 0',
                                padding: '12px 16px',
                                display: 'flex',
                                gap: '8px'
                            }}>
                                <Whisper speaker={<Tooltip>Gras (**texte**)</Tooltip>}>
                                    <IconButton 
                                        icon={<FiBold />} 
                                        size="sm" 
                                        appearance="subtle"
                                        onClick={handleBold}
                                        disabled={isSubmitting}
                                        style={{
                                            borderRadius: '6px',
                                            background: 'white',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    />
                                </Whisper>
                                <Whisper speaker={<Tooltip>Italique (*texte*)</Tooltip>}>
                                    <IconButton 
                                        icon={<FiItalic />} 
                                        size="sm" 
                                        appearance="subtle"
                                        onClick={handleItalic}
                                        disabled={isSubmitting}
                                        style={{
                                            borderRadius: '6px',
                                            background: 'white',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    />
                                </Whisper>
                                <Whisper speaker={<Tooltip>Souligné</Tooltip>}>
                                    <IconButton 
                                        icon={<FiUnderline />} 
                                        size="sm" 
                                        appearance="subtle"
                                        onClick={handleUnderline}
                                        disabled={isSubmitting}
                                        style={{
                                            borderRadius: '6px',
                                            background: 'white',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    />
                                </Whisper>
                                <Whisper speaker={<Tooltip>Liste</Tooltip>}>
                                    <IconButton 
                                        icon={<FiList />} 
                                        size="sm" 
                                        appearance="subtle"
                                        onClick={handleList}
                                        disabled={isSubmitting}
                                        style={{
                                            borderRadius: '6px',
                                            background: 'white',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    />
                                </Whisper>
                            </div>

                            <Input
                                as="textarea"
                                rows={8}
                                ref={setTextareaRef}
                                value={formData.message}
                                onChange={(value) => handleInputChange('message', value)}
                                placeholder="Composez votre message..."
                                disabled={isSubmitting}
                                style={{
                                    borderRadius: '0 0 8px 8px',
                                    borderTop: 'none',
                                    border: '1px solid #e2e8f0',
                                    minHeight: '200px',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    resize: 'vertical',
                                    padding: '16px'
                                }}
                            />
                            
                            {/* Aide au formatage */}
                            <div style={{
                                background: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: '6px',
                                padding: '12px',
                                marginTop: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    background: '#0ea5e9',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Text style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>i</Text>
                                </div>
                                <Text size="sm" style={{ color: '#0c4a6e' }}>
                                    Utilisez **gras**, *italique*, &lt;u&gt;souligné&lt;/u&gt; pour formater le texte
                                </Text>
                            </div>
                        </Form.Group>
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
                        startIcon={<FiSend />}
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
                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default EditCandidatModal;