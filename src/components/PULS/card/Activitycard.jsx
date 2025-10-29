import React from 'react';
import { Panel, Row, Col, Tag, Button } from 'rsuite';
import {
    FiClock,
    FiHome,
    FiUsers,
    FiBook,
    FiCheckCircle,
    FiAlertCircle,
    FiLock
} from 'react-icons/fi';

/**
 * Composant de carte d'activité (séance) avec design moderne et attrayant
 */
/**
 * Composant de carte d'activité (séance)
 */
const ActivityCard = ({ seance, onOpenCahier }) => {
    const getStatusColor = () => {
        return seance.isEnded ? '#6c757d' : '#28a745';
    };

    const getStatusText = () => {
        return seance.isEnded ? 'Terminé' : 'En cours / À venir';
    };

    const getStatusIcon = () => {
        return seance.isEnded ? <FiCheckCircle /> : <FiAlertCircle />;
    };

    return (
        <Panel
            bordered
            style={{
                borderRadius: '12px',
                border: `2px solid ${seance.isEnded ? '#e9ecef' : '#28a74520'}`,
                background: seance.isEnded ? '#f8f9fa' : 'white',
                marginBottom: '16px',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ padding: '20px' }}>
                <Row gutter={16}>
                    <Col xs={24} sm={6}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: getStatusColor() + '15',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '12px'
                        }}>
                            <FiClock size={24} color={getStatusColor()} />
                            <div style={{ marginLeft: '8px', textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: getStatusColor()
                                }}>
                                    {seance.heureDeb} - {seance.heureFin}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                                    {seance.duree} min
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12}>
                        <div style={{ marginBottom: '8px' }}>
                            <Tag color="blue" style={{ marginRight: '8px' }}>
                                {seance.matiere.libelle}
                            </Tag>
                            <Tag color="green">
                                {seance.classe.libelle}
                            </Tag>
                            {seance.isTextBookLocked && (
                                <Tag color="orange" style={{ marginLeft: '8px' }}>
                                    🔒 Verrouillé
                                </Tag>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            color: '#6c757d'
                        }}>
                            <FiHome size={16} style={{ marginRight: '6px' }} />
                            <span>{seance.salle.libelle}</span>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            color: '#6c757d'
                        }}>
                            <FiUsers size={16} style={{ marginRight: '6px' }} />
                            <span>{seance.classe.effectif} élèves</span>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: getStatusColor()
                        }}>
                            {getStatusIcon()}
                            <span style={{ fontSize: '14px', fontWeight: '500', marginLeft: '6px' }}>
                                {getStatusText()}
                            </span>
                        </div>
                    </Col>

                    <Col xs={24} sm={6}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            justifyContent: 'center',
                            height: '100%'
                        }}>
                            <Button
                                size="sm"
                                appearance="primary"
                                style={{
                                    background: '#007bff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    width: '100%'
                                }}
                                onClick={() => onOpenCahier(seance)}
                                disabled={!seance.isEnded}
                            >
                                <FiBook style={{ marginRight: '4px' }} />
                                Cahier de texte
                            </Button>
                            <Button
                                size="sm"
                                appearance={seance.appelAlreadyExist ? "default" : "ghost"}
                                style={{
                                    borderRadius: '6px',
                                    width: '100%',
                                    borderColor: seance.appelAlreadyExist ? '#28a745' : '#6c757d'
                                }}
                            >
                                {seance.appelAlreadyExist ? '✓ Appel effectué' : 'Faire l\'appel'}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        </Panel>
    );
};


export default ActivityCard;