import React, { useState, useEffect, useCallback } from 'react';
import { Panel, Row, Col, Progress, Badge, Loader, Message, Button } from 'rsuite';
import {
    FiUsers,
    FiUserCheck,
    FiUser,
    FiHome,
    FiRefreshCw,
    FiTrendingUp,
    FiTrendingDown,
    FiMinus,
    FiBookOpen
} from 'react-icons/fi';
import axios from 'axios';
import { useDashboardUrls } from './PULS/utils/apiConfig';

/**
 * Hook pour récupérer les données du dashboard
 */
const useDashboardData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const dashboardUrls = useDashboardUrls();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                dashboardUrls.getEleveBlock()
            );
            setData(response.data);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }, [dashboardUrls]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};

/**
 * Composant de carte statistique
 */
const StatCard = ({
    title,
    value,
    icon,
    color = '#3498db',
    bgColor = '#ecf0f1',
    subtitle,
    trend,
    size = 'normal'
}) => {
    const cardStyle = {
        background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
        border: `1px solid ${color}30`,
        borderRadius: '15px',
        padding: size === 'large' ? '30px' : '20px',
        height: size === 'large' ? '180px' : '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    };

    const iconStyle = {
        fontSize: size === 'large' ? '32px' : '24px',
        color: color,
        marginBottom: '10px'
    };

    const valueStyle = {
        fontSize: size === 'large' ? '42px' : '28px',
        fontWeight: '700',
        color: color,
        lineHeight: 1,
        marginBottom: '5px'
    };

    const titleStyle = {
        fontSize: size === 'large' ? '16px' : '14px',
        color: '#64748b',
        fontWeight: '500',
        marginBottom: subtitle ? '5px' : '0'
    };

    return (
        <div
            style={cardStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${color}20`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div>
                <div style={iconStyle}>{icon}</div>
                <div style={valueStyle}>{value.toLocaleString()}</div>
                <div style={titleStyle}>{title}</div>
                {subtitle && (
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {subtitle}
                    </div>
                )}
            </div>
            {trend && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px',
                    color: trend > 0 ? '#16a34a' : trend < 0 ? '#dc2626' : '#64748b'
                }}>
                    {trend > 0 ? <FiTrendingUp /> : trend < 0 ? <FiTrendingDown /> : <FiMinus />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
    );
};

/**
 * Composant de barre de progression comparative
 */
const ComparisonBar = ({
    label,
    value1,
    value2,
    label1 = 'Garçons',
    label2 = 'Filles',
    color1 = '#3b82f6',
    color2 = '#ec4899'
}) => {
    const total = value1 + value2;
    const percentage1 = total > 0 ? (value1 / total) * 100 : 0;
    const percentage2 = total > 0 ? (value2 / total) * 100 : 0;

    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
            }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>{label}</span>
                <span style={{ fontSize: '14px', color: '#64748b' }}>
                    Total: {total.toLocaleString()}
                </span>
            </div>

            <div style={{
                display: 'flex',
                height: '8px',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#f1f5f9',
                marginBottom: '8px'
            }}>
                <div
                    style={{
                        width: `${percentage1}%`,
                        backgroundColor: color1,
                        transition: 'width 0.5s ease'
                    }}
                />
                <div
                    style={{
                        width: `${percentage2}%`,
                        backgroundColor: color2,
                        transition: 'width 0.5s ease'
                    }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: color1,
                        borderRadius: '2px'
                    }} />
                    <span style={{ color: '#64748b' }}>
                        {label1}: {value1.toLocaleString()} ({percentage1.toFixed(1)}%)
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: color2,
                        borderRadius: '2px'
                    }} />
                    <span style={{ color: '#64748b' }}>
                        {label2}: {value2.toLocaleString()} ({percentage2.toFixed(1)}%)
                    </span>
                </div>
            </div>
        </div>
    );
};

/**
 * Composant principal du tableau de bord
 */
const DashboardFondateur = ({ ecoleId = 38, anneeId = 226 }) => {
    const { data, loading, error, refetch } = useDashboardData(ecoleId, anneeId);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <Loader size="lg" />
                <span style={{ color: '#64748b' }}>Chargement du tableau de bord...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Message type="error" showIcon>
                    <strong>Erreur de chargement:</strong> {error}
                </Message>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div style={{
            
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div className="container-fluid">
                {/* En-tête */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px'
                }}>
                    <div>
                        <h2 style={{
                            margin: '0 0 5px 0',
                            color: '#1e293b',
                            fontWeight: '700'
                        }}>
                            Tableau de bord du Fondateur
                        </h2>
                        <p style={{
                            margin: 0,
                            color: '#64748b',
                            fontSize: '16px'
                        }}>
                            Vue d'ensemble des données de l'établissement
                        </p>
                    </div>
                    <Button
                        appearance="primary"
                        startIcon={<FiRefreshCw />}
                        onClick={refetch}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                        }}
                    >
                        Actualiser
                    </Button>
                </div>

                {/* Section principale - Élèves */}
                <Row gutter={20} style={{ marginBottom: '30px' }}>
                    <Col xs={24} sm={12} md={8}>
                        <StatCard
                            title="Nombre total des élèves"
                            value={data.nombreTotalEleve}
                            icon={<FiUsers />}
                            color="#6366f1"
                            size="large"
                            subtitle={`${data.nombreTotalEleveGarcons} garçons • ${data.nombreTotalEleveFilles} filles`}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <StatCard
                            title="Total élèves Garçons"
                            value={data.nombreTotalEleveGarcons}
                            icon={<FiUser />}
                            color="#3b82f6"
                            subtitle={`${((data.nombreTotalEleveGarcons / data.nombreTotalEleve) * 100).toFixed(1)}% du total`}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <StatCard
                            title="Total élèves Filles"
                            value={data.nombreTotalEleveFilles}
                            icon={<FiUser />}
                            color="#ec4899"
                            subtitle={`${((data.nombreTotalEleveFilles / data.nombreTotalEleve) * 100).toFixed(1)}% du total`}
                        />
                    </Col>
                </Row>

                {/* Section affectations élèves */}
                <Row gutter={20} style={{ marginBottom: '30px' }}>
                    <Col xs={24} md={12}>
                        <Panel
                            header="Répartition des élèves"
                            style={{
                                borderRadius: '15px',
                                border: '1px solid rgba(59, 130, 246, 0.1)',
                                background: 'white'
                            }}
                        >
                            <ComparisonBar
                                label="Élèves affectés"
                                value1={data.nombreEleveAffGarcons}
                                value2={data.nombreEleveAffFilles}
                                color1="#10b981"
                                color2="#f59e0b"
                            />
                            <ComparisonBar
                                label="Élèves non affectés"
                                value1={data.nombreEleveNonAffGarcons}
                                value2={data.nombreEleveNonAffFilles}
                                color1="#ef4444"
                                color2="#f97316"
                            />
                        </Panel>
                    </Col>
                    <Col xs={24} md={12}>
                        <Panel
                            header="Statistiques d'affectation"
                            style={{
                                borderRadius: '15px',
                                border: '1px solid rgba(34, 197, 94, 0.1)',
                                background: 'white'
                            }}
                        >
                            <Row gutter={15}>
                                <Col xs={12}>
                                    <StatCard
                                        title="Affectés"
                                        value={data.nombreEleveAff}
                                        icon={<FiUserCheck />}
                                        color="#10b981"
                                    />
                                </Col>
                                <Col xs={12}>
                                    <StatCard
                                        title="Non affectés"
                                        value={data.nombreEleveNonAff}
                                        icon={<FiUsers />}
                                        color="#ef4444"
                                    />
                                </Col>
                            </Row>
                        </Panel>
                    </Col>
                </Row>

                {/* Section Personnel */}
                <Row gutter={20} style={{ marginBottom: '30px' }}>
                    <Col xs={24}>
                        <Panel
                            header="Le Personnel de votre établissement"
                            style={{
                                borderRadius: '15px',
                                border: '1px solid rgba(168, 85, 247, 0.1)',
                                background: 'white'
                            }}
                        >
                            <Row gutter={20}>
                                <Col xs={24} sm={8} md={6}>
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 15px',
                                            color: 'white',
                                            fontSize: '24px'
                                        }}>
                                            <FiUsers />
                                        </div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Personnel administratif</h4>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                                            <Badge color="cyan">0 au Total</Badge>
                                            <Badge color="blue" style={{ marginLeft: '5px' }}>Homme</Badge>
                                            <Badge color="red" style={{ marginLeft: '5px' }}>Femme</Badge>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '600' }}>
                                            <span style={{ color: '#3b82f6' }}>{data.personnelAdmMasculin}</span>
                                            <span style={{ color: '#64748b' }}>—</span>
                                            <span style={{ color: '#ec4899' }}>{data.personnelAdmFeminin}</span>
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} sm={8} md={6}>
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 15px',
                                            color: 'white',
                                            fontSize: '24px'
                                        }}>
                                            <FiUser />
                                        </div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Personnel Educateur</h4>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                                            <Badge color="cyan">0 au Total</Badge>
                                            <Badge color="blue" style={{ marginLeft: '5px' }}>Homme</Badge>
                                            <Badge color="red" style={{ marginLeft: '5px' }}>Femme</Badge>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '600' }}>
                                            <span style={{ color: '#3b82f6' }}>{data.personnelEducateurMasculin}</span>
                                            <span style={{ color: '#64748b' }}>—</span>
                                            <span style={{ color: '#ec4899' }}>{data.personnelEducateurFeminin}</span>
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} sm={8} md={6}>
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 15px',
                                            color: 'white',
                                            fontSize: '24px'
                                        }}>
                                            <FiUsers />
                                        </div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Personnel enseignant</h4>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                                            <Badge color="cyan">0 au Total</Badge>
                                            <Badge color="blue" style={{ marginLeft: '5px' }}>Homme</Badge>
                                            <Badge color="red" style={{ marginLeft: '5px' }}>Femme</Badge>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '600' }}>
                                            <span style={{ color: '#3b82f6' }}>{data.personnelEnseignantMasculin}</span>
                                            <span style={{ color: '#64748b' }}>—</span>
                                            <span style={{ color: '#ec4899' }}>{data.personnelEnseignantFeminin}</span>
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} sm={8} md={6}>
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 15px',
                                            color: 'white',
                                            fontSize: '24px'
                                        }}>
                                            <FiBookOpen />
                                        </div>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Enseignant Permanent</h4>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                                            <Badge color="cyan">0 au Total</Badge>
                                            <Badge color="blue" style={{ marginLeft: '5px' }}>Homme</Badge>
                                            <Badge color="red" style={{ marginLeft: '5px' }}>Femme</Badge>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '600' }}>
                                            <span style={{ color: '#3b82f6' }}>{data.enseignantPermanentMasculin}</span>
                                            <span style={{ color: '#64748b' }}>—</span>
                                            <span style={{ color: '#ec4899' }}>{data.enseignantPermanentFeminin}</span>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Panel>
                    </Col>
                </Row>

                {/* Section catégories d'élèves */}
                <Row gutter={20} style={{ marginBottom: '30px' }}>
                    <Col xs={24} sm={8}>
                        <Panel
                            header={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: '#8b5cf6'
                                    }} />
                                    Ancien
                                </div>
                            }
                            style={{
                                borderRadius: '15px',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                background: 'white'
                            }}
                        >
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    color: '#8b5cf6',
                                    marginBottom: '10px'
                                }}>
                                    {data.nombreEleveAnc}
                                </div>
                                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>
                                    Total élèves
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                    color: '#64748b'
                                }}>
                                    <div>
                                        <div>Élève Affectés {data.nombreEleveAncAffGarcons + data.nombreEleveAncAffFilles} 90%</div>
                                        <div>Élève non Affectés {data.nombreEleveAncNonAffGarcons + data.nombreEleveAncNonAffFilles} 10%</div>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </Col>

                    <Col xs={24} sm={8}>
                        <Panel
                            header={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: '#ec4899'
                                    }} />
                                    Ancienne
                                </div>
                            }
                            style={{
                                borderRadius: '15px',
                                border: '1px solid rgba(236, 72, 153, 0.2)',
                                background: 'white'
                            }}
                        >
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    color: '#ec4899',
                                    marginBottom: '10px'
                                }}>
                                    {data.nombreEleveAncAffFilles + data.nombreEleveAncNonAffFilles}
                                </div>
                                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>
                                    Total Filles
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                    color: '#64748b'
                                }}>
                                    <div>
                                        <div>Élève Affectés {data.nombreEleveAncAffFilles} 46%</div>
                                        <div>Élève non Affectés {data.nombreEleveAncNonAffFilles} 54%</div>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </Col>

                    <Col xs={24} sm={8}>
                        <Panel
                            header={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: '#10b981'
                                    }} />
                                    Nouveau
                                </div>
                            }
                            style={{
                                borderRadius: '15px',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                background: 'white'
                            }}
                        >
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    color: '#10b981',
                                    marginBottom: '10px'
                                }}>
                                    {data.nombreEleveNouv}
                                </div>
                                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>
                                    Total élèves
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '12px',
                                    color: '#64748b'
                                }}>
                                    <div>
                                        <div>Élève Affectés {data.nombreEleveNouvAffGarcons + data.nombreEleveNouvAffFilles} 60%</div>
                                        <div>Élève non Affectés {data.nombreEleveNouvNonAffGarcons + data.nombreEleveNouvNonAffFilles} 40%</div>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </Col>
                </Row>

                {/* Section infrastructure */}
                <Row gutter={20}>
                    <Col xs={24} md={12}>
                        <Panel
                            header="Infrastructure - Salles"
                            style={{
                                borderRadius: '15px',
                                border: '1px solid rgba(245, 158, 11, 0.1)',
                                background: 'white'
                            }}
                        >
                            <Row gutter={15}>
                                <Col xs={12}>
                                    <StatCard
                                        title="Salles disponibles"
                                        value={data.sallesDispo}
                                        icon={<FiHome />}
                                        color="#10b981"
                                    />
                                </Col>
                                <Col xs={12}>
                                    <StatCard
                                        title="Salles utilisées"
                                        value={data.sallesUtilisees}
                                        icon={<FiHome />}
                                        color="#f59e0b"
                                    />
                                </Col>
                            </Row>
                        </Panel>
                    </Col>
                    <Col xs={24} md={12}>
                        <Panel
                            header="Autres statistiques"
                            style={{
                                borderRadius: '15px',
                                border: '1px solid rgba(139, 92, 246, 0.1)',
                                background: 'white'
                            }}
                        >
                            <Row gutter={15}>
                                <Col xs={12}>
                                    <StatCard
                                        title="Nombre de classes"
                                        value={data.nombreClasses}
                                        icon={<FiUsers />}
                                        color="#8b5cf6"
                                    />
                                </Col>
                                <Col xs={12}>
                                    <StatCard
                                        title="Personnel total"
                                        value={data.nombrePersonnel}
                                        icon={<FiUsers />}
                                        color="#06b6d4"
                                    />
                                </Col>
                            </Row>
                        </Panel>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default DashboardFondateur;