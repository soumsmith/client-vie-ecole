/**
 * Composant ClassCard réutilisable - Design Light et Moderne
 * Permet de personnaliser la couleur de contour et autres styles
 */

import React from 'react';
import { Card, FlexboxGrid } from 'rsuite';
import { FiBook, FiUsers, FiChevronRight } from 'react-icons/fi';

const ClassCard = ({ 
    classe, 
    onClick, 
    borderColor = '#e2e8f0',
    accentColor = '#3b82f6',
    size = 'medium', // 'small', 'medium', 'large'
    showArrow = true,
    customStyle = {},
    hoverable = true 
}) => {
    // Configuration des tailles
    const sizeConfig = {
        small: {
            padding: '16px',
            titleSize: '16px',
            metaSize: '12px',
            iconSize: 12,
            badgePadding: '2px 6px',
            badgeSize: '10px'
        },
        medium: {
            padding: '20px',
            titleSize: '18px',
            metaSize: '14px',
            iconSize: 14,
            badgePadding: '4px 8px',
            badgeSize: '12px'
        },
        large: {
            padding: '24px',
            titleSize: '20px',
            metaSize: '16px',
            iconSize: 16,
            badgePadding: '6px 10px',
            badgeSize: '14px'
        }
    };

    const config = sizeConfig[size];

    // Styles de base du card
    const cardBaseStyle = {
        marginBottom: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '16px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        position: 'relative',
        overflow: 'hidden',
        ...customStyle
    };

    // Animation au hover
    const handleMouseEnter = (e) => {
        if (!hoverable) return;
        
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
        e.currentTarget.style.boxShadow = `0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px ${accentColor}15`;
        e.currentTarget.style.borderColor = accentColor;
        
        // Animation de l'accent bar
        const accentBar = e.currentTarget.querySelector('.accent-bar');
        if (accentBar) {
            accentBar.style.width = '100%';
        }
    };

    const handleMouseLeave = (e) => {
        if (!hoverable) return;
        
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.borderColor = borderColor;
        
        // Animation de l'accent bar
        const accentBar = e.currentTarget.querySelector('.accent-bar');
        if (accentBar) {
            accentBar.style.width = '60px';
        }
    };

    return (
        <Card
            style={cardBaseStyle}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Accent Bar animée */}
            <div 
                className="accent-bar"
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    height: '3px',
                    width: '60px',
                    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '0 0 3px 0'
                }}
            />

            {/* Contenu principal */}
            <div style={{ padding: config.padding, paddingTop: `${parseInt(config.padding) + 8}px` }}>
                <FlexboxGrid justify="space-between" align="middle">
                    <FlexboxGrid.Item flex={1}>
                        <div>
                            {/* Titre de la classe */}
                            <h4 style={{
                                margin: '0 0 12px 0',
                                fontSize: config.titleSize,
                                fontWeight: '700',
                                color: '#1e293b',
                                lineHeight: '1.3',
                                letterSpacing: '-0.025em'
                            }}>
                                {classe.libelle}
                            </h4>
                            
                            {/* Métadonnées */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '20px', 
                                marginBottom: '16px' 
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px',
                                    color: '#64748b' 
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        background: `${accentColor}10`,
                                    }}>
                                        <FiBook size={config.iconSize} style={{ color: accentColor }} />
                                    </div>
                                    <span style={{ 
                                        fontSize: config.metaSize, 
                                        fontWeight: '500' 
                                    }}>
                                        {classe.niveau}
                                    </span>
                                </div>
                                
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px',
                                    color: '#64748b' 
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        background: '#f1f5f9',
                                    }}>
                                        <FiUsers size={config.iconSize} style={{ color: '#64748b' }} />
                                    </div>
                                    <span style={{ 
                                        fontSize: config.metaSize, 
                                        fontWeight: '500' 
                                    }}>
                                        {classe.effectif} élèves
                                    </span>
                                </div>
                            </div>
                            
                            {/* Badge programme */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}12)`,
                                color: '#374151',
                                padding: config.badgePadding,
                                borderRadius: '8px',
                                fontSize: config.badgeSize,
                                fontWeight: '600',
                                border: `1px solid ${accentColor}20`,
                                letterSpacing: '0.025em'
                            }}>
                                {classe.programme}
                            </div>
                        </div>
                    </FlexboxGrid.Item>
                    
                    {/* Flèche indicatrice */}
                    {/* {showArrow && onClick && (
                        <FlexboxGrid.Item>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiChevronRight 
                                    size={16} 
                                    style={{ 
                                        color: '#64748b',
                                        transition: 'transform 0.3s ease' 
                                    }} 
                                />
                            </div>
                        </FlexboxGrid.Item>
                    )} */}
                </FlexboxGrid>
            </div>

            {/* Effet de brillance au hover */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                transition: 'left 0.6s ease',
                pointerEvents: 'none',
                zIndex: 1
            }} className="shine-effect" />
        </Card>
    );
};

export default ClassCard;