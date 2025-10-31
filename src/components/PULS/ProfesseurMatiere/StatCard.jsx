import React from 'react';

/**
 * Composant de carte statistique moderne réutilisable
 * @param {React.Component} icon - Icône à afficher (composant React Icons)
 * @param {string} title - Titre de la statistique
 * @param {string|number} value - Valeur principale à afficher
 * @param {string} subtitle - Sous-titre optionnel
 * @param {string} color - Couleur de l'icône (pour compatibilité)
 * @param {string} bgGradient - Gradient de fond pour l'icône
 * @param {number} percentage - Pourcentage optionnel à afficher
 * @param {object} style - Styles personnalisés additionnels
 */
const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color, 
    bgGradient, 
    percentage,
    style = {}
}) => {
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
            transition: 'all 0.3s ease',
            ...style
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
                {/* Icône et pourcentage */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between', 
                    marginBottom: 12 
                }}>
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

export default StatCard;