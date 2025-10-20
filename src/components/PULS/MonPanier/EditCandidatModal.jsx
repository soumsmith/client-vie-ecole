import React, { useState, useEffect, useRef } from 'react';
import { 
    Modal, 
    Button, 
    Form, 
    Input, 
    Panel, 
    Grid, 
    Row, 
    Col,
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
    FiAlignLeft,
    FiAlignCenter,
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const editorRef = useRef(null);

    const appParams = useAppParams();
    const messagesUrls = useMessagesUrls();

    useEffect(() => {
        if (show && candidat) {
            const defaultMessage = `<p>Bonjour cher candidat!</p><p><br></p><p>Nous avons bien reçu vos informations concernant votre candidature.</p><p><br></p><p>Cordialement,<br>L'équipe RH</p>`;
            
            setFormData({
                objet: `Candidature - ${candidat.nomComplet}`,
                message: defaultMessage
            });

            if (editorRef.current) {
                editorRef.current.innerHTML = defaultMessage;
            }
        }
    }, [show, candidat]);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditorChange = () => {
        if (editorRef.current) {
            const htmlContent = editorRef.current.innerHTML;
            setFormData(prev => ({ ...prev, message: htmlContent }));
        }
    };

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleEditorChange();
    };

    const handleBold = () => execCommand('bold');
    const handleItalic = () => execCommand('italic');
    const handleUnderline = () => execCommand('underline');
    const handleUnorderedList = () => execCommand('insertUnorderedList');
    const handleOrderedList = () => execCommand('insertOrderedList');
    const handleAlignLeft = () => execCommand('justifyLeft');
    const handleAlignCenter = () => execCommand('justifyCenter');
    const handleAlignRight = () => execCommand('justifyRight');

    const handleSave = async () => {
        if (!candidat || !candidat.id) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Données du candidat manquantes. Impossible d\'envoyer le message.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formData.message;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        if (!formData.objet.trim() || !textContent.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Champs requis',
                text: 'Veuillez remplir l\'objet et le message avant d\'envoyer.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

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
            const apiData = {
                administrateur_gain_idadministrateur_gai: null,
                ecole_ecoleid: appParams.ecoleId,
                identifiant_personnel: candidat.id,
                message_personnel_emetteur: appParams.personnelInfo?.nom || "",
                message_personnel_id: null,
                message_personnel_message: formData.message,
                message_personnel_sujet: formData.objet,
                idEmetteur: appParams.userId || appParams.personnelId,
                idDestinataire: candidat.id
            };

            console.log('📤 Envoi du message vers le candidat:', apiData);

            const url = messagesUrls.sendToPersonnel(candidat.id);
            console.log('🔗 URL d\'envoi:', url);

            const response = await axios.post(url, apiData);

            console.log('✅ Réponse du serveur:', response);

            if (response.status === 200 || response.status === 201) {

                const message = response.data + ` à ${candidat.nomComplet}.` || `Le message a été envoyé avec succès à ${candidat.nomComplet}.`
                await Swal.fire({
                    icon: 'success',
                    title: 'Message envoyé !',
                    text: message,
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
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'La requête a expiré. Le serveur met trop de temps à répondre.';
            } else {
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

    if (!candidat) return null;

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
                >
                    <div style={{ padding: '20px' }}>
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
                    </div>
                </Panel>

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
                >
                    <div style={{ padding: '20px' }}>
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
                                
                                <div style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    background: 'white'
                                }}>
                                    {/* Barre d'outils */}
                                    <div style={{
                                        background: '#f8fafc',
                                        borderBottom: '1px solid #e2e8f0',
                                        padding: '8px 12px',
                                        display: 'flex',
                                        gap: '4px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <Whisper speaker={<Tooltip>Gras</Tooltip>}>
                                            <IconButton 
                                                icon={<FiBold />} 
                                                size="sm" 
                                                appearance="subtle"
                                                onClick={handleBold}
                                                disabled={isSubmitting}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </Whisper>
                                        <Whisper speaker={<Tooltip>Italique</Tooltip>}>
                                            <IconButton 
                                                icon={<FiItalic />} 
                                                size="sm" 
                                                appearance="subtle"
                                                onClick={handleItalic}
                                                disabled={isSubmitting}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '4px'
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
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </Whisper>
                                        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 4px' }} />
                                        <Whisper speaker={<Tooltip>Liste à puces</Tooltip>}>
                                            <IconButton 
                                                icon={<FiList />} 
                                                size="sm" 
                                                appearance="subtle"
                                                onClick={handleUnorderedList}
                                                disabled={isSubmitting}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </Whisper>
                                        <Whisper speaker={<Tooltip>Liste numérotée</Tooltip>}>
                                            <IconButton 
                                                icon={<FiList />} 
                                                size="sm" 
                                                appearance="subtle"
                                                onClick={handleOrderedList}
                                                disabled={isSubmitting}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </Whisper>
                                        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 4px' }} />
                                        <Whisper speaker={<Tooltip>Aligner à gauche</Tooltip>}>
                                            <IconButton 
                                                icon={<FiAlignLeft />} 
                                                size="sm" 
                                                appearance="subtle"
                                                onClick={handleAlignLeft}
                                                disabled={isSubmitting}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </Whisper>
                                        <Whisper speaker={<Tooltip>Centrer</Tooltip>}>
                                            <IconButton 
                                                icon={<FiAlignCenter />} 
                                                size="sm" 
                                                appearance="subtle"
                                                onClick={handleAlignCenter}
                                                disabled={isSubmitting}
                                                style={{
                                                    background: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </Whisper>
                                    </div>

                                    {/* Zone d'édition */}
                                    <div
                                        ref={editorRef}
                                        contentEditable={!isSubmitting}
                                        onInput={handleEditorChange}
                                        style={{
                                            minHeight: '250px',
                                            padding: '16px',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '14px',
                                            lineHeight: '1.6',
                                            outline: 'none',
                                            color: '#1e293b',
                                            cursor: isSubmitting ? 'not-allowed' : 'text'
                                        }}
                                    />
                                </div>
                                
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
                                        Utilisez la barre d'outils pour formater votre texte. Sélectionnez le texte puis cliquez sur un bouton de formatage.
                                    </Text>
                                </div>
                            </Form.Group>
                        </Form>
                    </div>
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