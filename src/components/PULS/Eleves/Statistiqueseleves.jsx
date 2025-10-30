import React, { useMemo } from 'react';
import { Row, Col, Panel } from 'rsuite';
import { 
    FiUsers, 
    FiUserCheck, 
    FiAward, 
    FiTrendingUp,
    FiPieChart,
    FiBookOpen,
    FiCalendar
} from 'react-icons/fi';

/**
 * Composant de carte statistique moderne
 */
const StatCard = ({ icon: Icon, title, value, subtitle, color, bgGradient, percentage }) => {
    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        }}>
            {/* Fond gradient décoratif */}
            <div style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                background: bgGradient,
                borderRadius: '50%',
                opacity: 0.1,
                pointerEvents: 'none'
            }} />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Icône et titre */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{
                        background: bgGradient,
                        borderRadius: '10px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Icon size={20} color="white" />
                    </div>
                    
                    {percentage !== undefined && (
                        <div style={{
                            padding: '4px 8px',
                            backgroundColor: percentage >= 80 ? '#dcfce7' : percentage >= 50 ? '#fef3c7' : '#fee2e2',
                            color: percentage >= 80 ? '#16a34a' : percentage >= 50 ? '#d97706' : '#dc2626',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {percentage.toFixed(0)}%
                        </div>
                    )}
                </div>
                
                {/* Valeur principale */}
                <div style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: 4
                }}>
                    {value}
                </div>
                
                {/* Titre */}
                <div style={{
                    fontSize: '13px',
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: 4
                }}>
                    {title}
                </div>
                
                {/* Sous-titre optionnel */}
                {subtitle && (
                    <div style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        marginTop: 6
                    }}>
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Composant de statistiques détaillées en barres
 */
const StatBar = ({ label, value, total, color, icon: Icon }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {Icon && <Icon size={14} color={color} />}
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                        {label}
                    </span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                    {value} <span style={{ fontSize: '12px', color: '#94a3b8' }}>({percentage.toFixed(1)}%)</span>
                </span>
            </div>
            <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                }} />
            </div>
        </div>
    );
};

/**
 * Composant principal des statistiques
 */
const StatistiquesEleves = ({ eleves = [], classeInfo = null }) => {
    // Calcul des statistiques
    const stats = useMemo(() => {
        if (!eleves || eleves.length === 0) {
            return null;
        }

        const total = eleves.length;
        
        // Répartition par genre
        const masculins = eleves.filter(e => e.genre === 'MASCULIN').length;
        const feminins = eleves.filter(e => e.genre === 'FEMININ').length;
        
        // Statuts spéciaux
        const redoublants = eleves.filter(e => e.redoublant === 'OUI').length;
        const boursiers = eleves.filter(e => e.boursier).length;
        const demiPensionnaires = eleves.filter(e => e.demi_pension).length;
        
        // Répartition par statut
        const actifs = eleves.filter(e => e.statut === 'ACTIF').length;
        const inactifs = eleves.filter(e => e.statut === 'INACTIF').length;
        const suspendus = eleves.filter(e => e.statut === 'SUSPENDU').length;
        
        // Calcul de l'âge moyen
        const agesValides = eleves
            .filter(e => e.dateNaissance)
            .map(e => {
                const birthDate = new Date(e.dateNaissance);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age;
            })
            .filter(age => age > 0 && age < 100);
        
        const ageMoyen = agesValides.length > 0 
            ? (agesValides.reduce((sum, age) => sum + age, 0) / agesValides.length).toFixed(1)
            : 0;
        
        // Taux de remplissage
        const effectifMax = classeInfo?.effectifMax || 0;
        const tauxRemplissage = effectifMax > 0 ? (total / effectifMax) * 100 : 0;
        
        // Langues LV2
        const lv2Stats = eleves
            .filter(e => e.lv2)
            .reduce((acc, e) => {
                acc[e.lv2] = (acc[e.lv2] || 0) + 1;
                return acc;
            }, {});
        
        return {
            total,
            masculins,
            feminins,
            redoublants,
            boursiers,
            demiPensionnaires,
            actifs,
            inactifs,
            suspendus,
            ageMoyen,
            tauxRemplissage,
            effectifMax,
            lv2Stats
        };
    }, [eleves, classeInfo]);

    // Si pas de données
    if (!stats) {
        return null;
    }

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
                marginBottom: 25,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiPieChart size={20} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Statistiques de la Classe
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Vue d'ensemble des données de la classe
                    </p>
                </div>
            </div>

            {/* Cartes statistiques principales */}
            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon={FiUsers}
                        title="Effectif Total"
                        value={stats.total}
                        subtitle={`Sur ${stats.effectifMax} places`}
                        bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        percentage={stats.tauxRemplissage}
                    />
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon={FiUserCheck}
                        title="Élèves Actifs"
                        value={stats.actifs}
                        subtitle={`${((stats.actifs / stats.total) * 100).toFixed(1)}% de la classe`}
                        bgGradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    />
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon={FiAward}
                        title="Boursiers"
                        value={stats.boursiers}
                        subtitle={`${((stats.boursiers / stats.total) * 100).toFixed(1)}% des élèves`}
                        bgGradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                    />
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon={FiCalendar}
                        title="Âge Moyen"
                        value={`${stats.ageMoyen} ans`}
                        subtitle="Moyenne de la classe"
                        bgGradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                    />
                </Col>
            </Row>

            {/* Statistiques détaillées */}
            <Row gutter={16}>
                {/* Répartition par genre */}
                <Col xs={24} md={12}>
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h6 style={{
                            margin: '0 0 16px 0',
                            color: '#334155',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <FiUsers size={16} />
                            Répartition par Genre
                        </h6>
                        
                        <StatBar
                            label="Garçons"
                            value={stats.masculins}
                            total={stats.total}
                            color="#3b82f6"
                        />
                        
                        <StatBar
                            label="Filles"
                            value={stats.feminins}
                            total={stats.total}
                            color="#ec4899"
                        />
                    </div>
                </Col>

                {/* Informations particulières */}
                <Col xs={24} md={12}>
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h6 style={{
                            margin: '0 0 16px 0',
                            color: '#334155',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <FiBookOpen size={16} />
                            Informations Particulières
                        </h6>
                        
                        <StatBar
                            label="Redoublants"
                            value={stats.redoublants}
                            total={stats.total}
                            color="#f59e0b"
                            icon={FiTrendingUp}
                        />
                        
                        <StatBar
                            label="Boursiers"
                            value={stats.boursiers}
                            total={stats.total}
                            color="#10b981"
                            icon={FiAward}
                        />
                        
                        {/* <StatBar
                            label="Demi-pensionnaires"
                            value={stats.demiPensionnaires}
                            total={stats.total}
                            color="#8b5cf6"
                        /> */}
                    </div>
                </Col>
            </Row>

            {/* Langues LV2 (si disponible) */}
            {Object.keys(stats.lv2Stats).length > 0 && (
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col xs={24}>
                        <div style={{
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h6 style={{
                                margin: '0 0 16px 0',
                                color: '#334155',
                                fontWeight: '600',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}>
                                <FiBookOpen size={16} />
                                Langues Vivantes 2 (LV2)
                            </h6>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {Object.entries(stats.lv2Stats).map(([langue, count]) => (
                                    <div
                                        key={langue}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '13px'
                                        }}
                                    >
                                        <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                            {langue}
                                        </span>
                                        {': '}
                                        <span style={{ color: '#64748b' }}>
                                            {count} élève{count > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default StatistiquesEleves;