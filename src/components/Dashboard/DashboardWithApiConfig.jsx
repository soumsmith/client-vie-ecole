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
    FiBookOpen,
    FiDollarSign
} from 'react-icons/fi';
import axios from 'axios';
import { useDashboardUrls, useAppParams } from '../PULS/utils/apiConfig';

/**
 * Hook pour récupérer toutes les données du dashboard
 * Utilise les URLs centralisées depuis apiConfig.jsx
 */
const useCompleteDashboardData = () => {
    const [data, setData] = useState({
        eleves: null,
        personnel: null,
        financier: null,
        academique: null,
        statistiques: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const dashboardUrls = useDashboardUrls();
    const params = useAppParams();

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Récupération de toutes les données en parallèle
            const [
                elevesResponse,
                personnelResponse,
                financierResponse,
                academiqueResponse,
                statistiquesResponse
            ] = await Promise.all([
                axios.get(dashboardUrls.getEleveBlock()),
                axios.get(dashboardUrls.getPersonnelBlock()),
                axios.get(dashboardUrls.getFinancierBlock()),
                axios.get(dashboardUrls.getAcademiqueBlock()),
                axios.get(dashboardUrls.getStatistiques())
            ]);

            setData({
                eleves: elevesResponse.data,
                personnel: personnelResponse.data,
                financier: financierResponse.data,
                academique: academiqueResponse.data,
                statistiques: statistiquesResponse.data
            });
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors du chargement des données du dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, [dashboardUrls]);

    useEffect(() => {
        if (params.ecoleId && params.academicYearId) {
            fetchAllData();
        }
    }, [fetchAllData, params.ecoleId, params.academicYearId]);

    return { data, loading, error, refetch: fetchAllData };
};

/**
 * Composant StatCard pour afficher les statistiques
 */
const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = '#3498db', 
    subtitle,
    trend,
    size = 'normal'
}) => {
    const cardHeight = size === 'large' ? '200px' : '150px';
    
    return (
        <Panel 
            bordered 
            style={{ 
                height: cardHeight,
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                border: `1px solid ${color}20`,
                borderLeft: `4px solid ${color}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}
            className="stat-card"
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${color}20`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <h6 style={{ 
                            margin: '0 0 10px 0', 
                            color: '#666', 
                            fontSize: '14px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {title}
                        </h6>
                        <h2 style={{ 
                            margin: '0', 
                            color: color, 
                            fontSize: size === 'large' ? '2.5rem' : '2rem',
                            fontWeight: 'bold',
                            lineHeight: '1'
                        }}>
                            {value}
                        </h2>
                        {subtitle && (
                            <p style={{ 
                                margin: '5px 0 0 0', 
                                color: '#999', 
                                fontSize: '12px' 
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div style={{ 
                        background: `${color}15`, 
                        borderRadius: '50%', 
                        width: '50px', 
                        height: '50px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginLeft: '15px'
                    }}>
                        {React.cloneElement(icon, { 
                            size: 24, 
                            color: color 
                        })}
                    </div>
                </div>
                
                {trend && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginTop: '15px',
                        padding: '8px 12px',
                        background: trend.type === 'up' ? '#d4edda' : trend.type === 'down' ? '#f8d7da' : '#e2e3e5',
                        borderRadius: '20px',
                        fontSize: '12px'
                    }}>
                        {trend.type === 'up' && <FiTrendingUp size={14} color="#28a745" style={{ marginRight: '5px' }} />}
                        {trend.type === 'down' && <FiTrendingDown size={14} color="#dc3545" style={{ marginRight: '5px' }} />}
                        {trend.type === 'stable' && <FiMinus size={14} color="#6c757d" style={{ marginRight: '5px' }} />}
                        <span style={{ 
                            color: trend.type === 'up' ? '#28a745' : trend.type === 'down' ? '#dc3545' : '#6c757d',
                            fontWeight: '500'
                        }}>
                            {trend.value} {trend.label}
                        </span>
                    </div>
                )}
            </div>
        </Panel>
    );
};

/**
 * Composant Dashboard principal utilisant les URLs centralisées
 */
const DashboardWithApiConfig = () => {
    const { data, loading, error, refetch } = useCompleteDashboardData();
    const params = useAppParams();

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                flexDirection: 'column'
            }}>
                <Loader size="lg" content="Chargement du dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <Message type="error" style={{ margin: '20px' }}>
                <strong>Erreur:</strong> {error}
                <Button 
                    appearance="primary" 
                    size="sm" 
                    onClick={refetch}
                    style={{ marginLeft: '10px' }}
                >
                    <FiRefreshCw /> Réessayer
                </Button>
            </Message>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '10px',
                color: 'white'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 5px 0', fontSize: '2rem' }}>
                        Dashboard Fondateur
                    </h1>
                    <p style={{ margin: 0, opacity: 0.9 }}>
                        École ID: {params.ecoleId} | Année: {params.academicYearId}
                    </p>
                </div>
                <Button 
                    appearance="ghost" 
                    onClick={refetch}
                    style={{ color: 'white', borderColor: 'white' }}
                >
                    <FiRefreshCw /> Actualiser
                </Button>
            </div>

            {/* Statistiques principales */}
            <Row gutter={20} style={{ marginBottom: '30px' }}>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        title="Total Élèves"
                        value={data.eleves?.total || '0'}
                        icon={<FiUsers />}
                        color="#3498db"
                        subtitle="Élèves inscrits"
                        trend={{
                            type: 'up',
                            value: '+5%',
                            label: 'vs mois dernier'
                        }}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        title="Personnel"
                        value={data.personnel?.total || '0'}
                        icon={<FiUserCheck />}
                        color="#2ecc71"
                        subtitle="Membres actifs"
                        trend={{
                            type: 'stable',
                            value: '0%',
                            label: 'aucun changement'
                        }}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        title="Revenus"
                        value={data.financier?.revenus || '0 FCFA'}
                        icon={<FiDollarSign />}
                        color="#f39c12"
                        subtitle="Ce mois"
                        trend={{
                            type: 'up',
                            value: '+12%',
                            label: 'vs mois dernier'
                        }}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        title="Cours"
                        value={data.academique?.totalCours || '0'}
                        icon={<FiBookOpen />}
                        color="#9b59b6"
                        subtitle="Cours programmés"
                        trend={{
                            type: 'up',
                            value: '+3',
                            label: 'nouveaux cours'
                        }}
                    />
                </Col>
            </Row>

            {/* Informations détaillées */}
            <Row gutter={20}>
                <Col xs={24} md={12}>
                    <Panel header="Répartition des élèves" bordered>
                        {data.eleves && (
                            <div style={{ padding: '20px' }}>
                                <p>Garçons: {data.eleves.garcons || 0}</p>
                                <p>Filles: {data.eleves.filles || 0}</p>
                                <Progress.Line 
                                    percent={((data.eleves.garcons || 0) / (data.eleves.total || 1)) * 100} 
                                    strokeColor="#3498db"
                                    showInfo={false}
                                />
                            </div>
                        )}
                    </Panel>
                </Col>
                <Col xs={24} md={12}>
                    <Panel header="Statistiques académiques" bordered>
                        {data.academique && (
                            <div style={{ padding: '20px' }}>
                                <p>Classes: {data.academique.totalClasses || 0}</p>
                                <p>Matières: {data.academique.totalMatieres || 0}</p>
                                <p>Évaluations: {data.academique.totalEvaluations || 0}</p>
                            </div>
                        )}
                    </Panel>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardWithApiConfig;
