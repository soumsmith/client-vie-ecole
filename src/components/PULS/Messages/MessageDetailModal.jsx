import React from 'react';
import { Modal, Button, ButtonGroup } from 'rsuite';
import { 
    FiUser, 
    FiMail, 
    FiCalendar, 
    FiClock, 
    FiX,
    FiPaperclip 
} from 'react-icons/fi';

const MessageDetailModal = ({ open, onClose, message, onReply, onDelete }) => {
    if (!message) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Modal 
            open={open} 
            onClose={onClose} 
            size="lg"
            className="message-detail-modal"
            backdrop="static"
            centered
        >
            <Modal.Header closeButton={false}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    // width: '100%',
                    // paddingRight: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                            className="avatar-circle"
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                backgroundColor: '#007bff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                marginRight: '15px'
                            }}
                        >
                            {getInitials(message.fullName || 'Inconnu')}
                        </div>
                        <div>
                            <h5 style={{ 
                                margin: '0 0 5px 0', 
                                color: '#212529', 
                                fontWeight: 'bold',
                                fontSize: '18px'
                            }}>
                                {message.fullName || 'Expéditeur inconnu'}
                            </h5>
                            <div style={{ 
                                color: '#6c757d', 
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <FiMail style={{ marginRight: '5px' }} size={14} />
                                {message.email || 'email@example.com'}
                            </div>
                        </div>
                    </div>
                    <Button
                        appearance="subtle"
                        onClick={onClose}
                        style={{ 
                            color: '#6c757d',
                            border: 'none',
                            background: 'none',
                            padding: '8px'
                        }}
                    >
                        <FiX size={20} />
                    </Button>
                </div>
            </Modal.Header>

            <Modal.Body style={{ padding: '0 24px 24px 24px' }}>
                {/* Sujet du message */}
                <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ 
                        color: '#212529', 
                        fontWeight: 'bold', 
                        marginBottom: '15px',
                        fontSize: '24px'
                    }}>
                        {message.sujet || 'Sans sujet'}
                    </h4>
                    
                    {/* Informations de date */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: '#6c757d',
                        marginBottom: '15px',
                        fontSize: '14px'
                    }}>
                        <FiCalendar style={{ marginRight: '8px' }} size={16} />
                        <span style={{ marginRight: '20px' }}>{formatDate(message.date)}</span>
                        <FiClock style={{ marginRight: '8px' }} size={16} />
                        <span>ID: {message.id}</span>
                    </div>

                    {/* Ligne de séparation */}
                    <hr style={{ 
                        border: 'none', 
                        height: '1px', 
                        backgroundColor: '#e9ecef',
                        margin: '20px 0'
                    }} />
                </div>

                {/* Corps du message */}
                <div 
                    className="message-content"
                    style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '24px',
                        minHeight: '200px',
                        lineHeight: '1.6',
                        fontSize: '15px',
                        color: '#212529'
                    }}
                >
                    <div dangerouslySetInnerHTML={{ __html: message.message }} />
                </div>

                {/* Pièces jointes (si applicable) */}
                {message.attachments && message.attachments.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            marginBottom: '10px'
                        }}>
                            <FiPaperclip style={{ marginRight: '8px' }} size={16} />
                            <span style={{ fontWeight: '600' }}>Pièces jointes</span>
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '8px'
                        }}>
                            {message.attachments.map((attachment, index) => (
                                <div 
                                    key={index}
                                    className="attachment-item"
                                    style={{
                                        backgroundColor: '#e9ecef',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        color: '#495057',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {attachment.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer style={{ padding: '0 24px 24px 24px' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    width: '100%',
                    alignItems: 'center'
                }}>
                    {/* <ButtonGroup>
                        <Button
                            appearance="primary"
                            onClick={() => onReply && onReply(message)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px'
                            }}
                        >
                            <FiReply size={16} />
                            Répondre
                        </Button>
                        
                        <Button
                            appearance="primary"
                            color="red"
                            onClick={() => onDelete && onDelete(message)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px'
                            }}
                        >
                            <FiTrash2 size={16} />
                            Supprimer
                        </Button>
                    </ButtonGroup> */}
                    
                    <Button
                        appearance="subtle"
                        onClick={onClose}
                        style={{
                            padding: '8px 16px'
                        }}
                    >
                        Fermer
                    </Button>
                </div>
            </Modal.Footer>

            <style jsx>{`
                .rs-modal .rs-modal-dialog {
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    max-width: 800px;
                }
                
                .rs-modal .rs-modal-content {
                    border-radius: 12px;
                }
                
                .rs-modal .rs-modal-header {
                    border-bottom: none;
                    padding: 24px 24px 0 24px;
                }
                
                .rs-modal .rs-modal-body {
                    padding: 0 24px 24px 24px;
                }
                
                .rs-modal .rs-modal-footer {
                    border-top: none;
                    padding: 0 24px 24px 24px;
                }
                
                .message-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                    margin: 10px 0;
                }
                
                .message-content p {
                    margin-bottom: 16px;
                }
                
                .message-content ul, .message-content ol {
                    padding-left: 20px;
                    margin-bottom: 16px;
                }
                
                .attachment-item:hover {
                    background-color: #dee2e6 !important;
                    cursor: pointer;
                }
                
                .avatar-circle:hover {
                    transform: scale(1.05);
                    transition: transform 0.2s ease;
                }
            `}</style>
        </Modal>
    );
};

export default MessageDetailModal;