import React, { useMemo } from 'react';
import { Row, Col } from 'rsuite';
import { 
    FiUsers, 
    FiUserCheck, 
    FiAward, 
    FiBookOpen,
    FiPieChart,
    FiTarget,
    FiBriefcase,
    FiTrendingUp
} from 'react-icons/fi';
import StatCard from './StatCard.jsx';

/**
 * Composant de barre de statistique détaillée
 */
const StatBar = ({ label, value, total, color, icon: Icon }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 6 
            }}>
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
 * Composant principal des statistiques pour les affectations professeur-matière
 */
const StatistiquesProfesseurMatiere = ({ affectations = [], selectedMatiereInfo = null }) => {
    // Calcul des statistiques
    const stats = useMemo(() => {
        if (!affectations || affectations.length === 0) {
            return null;
        }

        const total = affectations.length;
        
        // Répartition par genre
        const masculins = affectations.filter(a => a.personnel_sexe === 'MASCULIN').length;
        const feminins = affectations.filter(a => a.personnel_sexe === 'FEMININ').length;
        
        // Répartition par fonction
        const professeurs = affectations.filter(a => a.isProfesseur).length;
        const autresPersonnels = total - professeurs;
        
        // Classes uniques affectées
        const classesUniques = [...new Set(affectations.map(a => a.classe_id))];
        const nombreClasses = classesUniques.length;
        
        // Fonctions représentées
        const fonctionsUniques = [...new Set(affectations.map(a => a.fonction_libelle))];
        const nombreFonctions = fonctionsUniques.length;
        
        // Répartition par fonction détaillée
        const fonctionsStats = affectations.reduce((acc, a) => {
            const fonction = a.fonction_libelle || 'Non défini';
            acc[fonction] = (acc[fonction] || 0) + 1;
            return acc;
        }, {});
        
        // Répartition par classe (top 5)
        const classesStats = affectations.reduce((acc, a) => {
            const classe = a.classe_libelle || 'Non défini';
            acc[classe] = (acc[classe] || 0) + 1;
            return acc;
        }, {});
        
        // Trier et prendre le top 5
        const topClasses = Object.entries(classesStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        // Statut des affectations (si disponible)
        const actives = affectations.filter(a => a.statut === 'ACTIF' || !a.statut).length;
        const inactives = total - actives;
        
        // Taux de couverture des professeurs
        const tauxProfesseurs = (professeurs / total) * 100;
        
        return {
            total,
            masculins,
            feminins,
            professeurs,
            autresPersonnels,
            nombreClasses,
            nombreFonctions,
            fonctionsStats,
            topClasses,
            actives,
            inactives,
            tauxProfesseurs,
            fonctionsUniques
        };
    }, [affectations, selectedMatiereInfo]);

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
                        Statistiques des Affectations
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Vue d'ensemble de la répartition pour la matière {selectedMatiereInfo?.libelle || ''}
                    </p>
                </div>
            </div>

            {/* Cartes statistiques principales */}
            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon={FiUsers}
                        title="Total Affectations"
                        value={stats.total}
                        subtitle={`${stats.nombreClasses} classe(s) concernée(s)`}
                        bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    />
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon={FiUserCheck}
                        title="Professeurs"
                        value={stats.professeurs}
                        subtitle={`${stats.autresPersonnels} autre(s) personnel(s)`}
                        bgGradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                        percentage={stats.tauxProfesseurs}
                    />
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon={FiBriefcase}
                        title="Fonctions"
                        value={stats.nombreFonctions}
                        subtitle={`${stats.fonctionsUniques.join(', ').substring(0, 30)}...`}
                        bgGradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                    />
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon={FiTarget}
                        title="Classes"
                        value={stats.nombreClasses}
                        subtitle={`Réparties dans ${stats.nombreClasses} classe(s)`}
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
                            label="Hommes"
                            value={stats.masculins}
                            total={stats.total}
                            color="#3b82f6"
                        />
                        
                        <StatBar
                            label="Femmes"
                            value={stats.feminins}
                            total={stats.total}
                            color="#ec4899"
                        />
                    </div>
                </Col>

                {/* Répartition par fonction */}
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
                            <FiBriefcase size={16} />
                            Répartition par Fonction
                        </h6>
                        
                        {Object.entries(stats.fonctionsStats)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 4)
                            .map(([fonction, count], index) => (
                                <StatBar
                                    key={fonction}
                                    label={fonction}
                                    value={count}
                                    total={stats.total}
                                    color={['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'][index % 4]}
                                    icon={FiAward}
                                />
                            ))
                        }
                    </div>
                </Col>
            </Row>

            {/* Top 5 des classes */}
            {stats.topClasses.length > 0 && (
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
                                Top 5 des Classes avec le Plus d'Affectations
                            </h6>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {stats.topClasses.map(([classe, count], index) => (
                                    <div
                                        key={classe}
                                        style={{
                                            padding: '10px 16px',
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                    >
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: ['#667eea', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'][index % 5],
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '11px',
                                            fontWeight: '700'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                                {classe}
                                            </span>
                                            {': '}
                                            <span style={{ color: '#64748b' }}>
                                                {count} affectation{count > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>
            )}

            {/* Statut des affectations */}
            {stats.inactives > 0 && (
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col xs={24}>
                        <div style={{
                            background: '#fffbeb',
                            borderRadius: '12px',
                            padding: '15px',
                            border: '1px solid #fed7aa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <FiTrendingUp size={20} color="#d97706" />
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                                    Attention : {stats.inactives} affectation(s) inactive(s)
                                </div>
                                <div style={{ fontSize: '12px', color: '#78350f', marginTop: 4 }}>
                                    {stats.actives} affectation(s) active(s) sur {stats.total} au total
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default StatistiquesProfesseurMatiere;