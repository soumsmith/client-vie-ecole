/**
 * Composant MatiereCard réutilisable - Design Light et Moderne
 * Même style que ClassCard mais adapté pour les matières
 */

import React, { useState } from 'react';
import { Card, FlexboxGrid, Button } from 'rsuite';
import { FiBook, FiUser, FiExternalLink, FiLock, FiUnlock } from 'react-icons/fi';

const MatiereCard = ({ 
    matiere, 
    onOuvrirCahier,
    onVerrouillerCahier,
    borderColor = '#e2e8f0',
    accentColor = '#3b82f6',
    size = 'medium',
    customStyle = {},
    hoverable = true 
}) => {
    const [estVerrouille, setEstVerrouille] = useState(Math.random() > 0.7);
    const [animateIcon, setAnimateIcon] = useState(false);

    // Configuration des tailles
    const sizeConfig = {
        small: {
            padding: '14px',
            titleSize: '14px',
            metaSize: '11px',
            iconSize: 12,
            buttonHeight: '30px',
            buttonFontSize: '10px'
        },
        medium: {
            padding: '18px',
            titleSize: '15px',
            metaSize: '12px',
            iconSize: 14,
            buttonHeight: '34px',
            buttonFontSize: '12px'
        },
        large: {
            padding: '22px',
            titleSize: '16px',
            metaSize: '13px',
            iconSize: 16,
            buttonHeight: '38px',
            buttonFontSize: '13px'
        }
    };

    const config = sizeConfig[size];

    const handleVerrouillerCahier = () => {
        // Animation de l'icône
        setAnimateIcon(true);
        setTimeout(() => setAnimateIcon(false), 300);

        // Changer l'état après un petit délai pour l'animation
        setTimeout(() => {
            setEstVerrouille(!estVerrouille);
        }, 150);

        // Appeler la fonction callback si fournie
        if (onVerrouillerCahier) {
            onVerrouillerCahier(matiere, !estVerrouille);
        }
    };

    // Styles de base du card
    const cardBaseStyle = {
        marginBottom: '16px',
        background: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '16px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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

            {/* Header */}
            <div style={{
                padding: `${config.padding} ${config.padding} ${parseInt(config.padding) - 4}px ${config.padding}`,
                paddingTop: `${parseInt(config.padding) + 8}px`,
                textAlign: 'center',
                position: 'relative',
                borderBottom: '1px solid #f1f5f9'
            }}>
                {/* Icône matière */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `${accentColor}10`,
                    border: `1px solid ${accentColor}20`,
                    marginBottom: '10px'
                }}>
                    <FiBook size={18} style={{ color: accentColor }} />
                </div>

                {/* Nom de la matière */}
                <h3 style={{
                    fontSize: config.titleSize,
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: '0 0 8px 0',
                    lineHeight: '1.3',
                    letterSpacing: '-0.025em'
                }}>
                    {matiere.matiere?.libelle || matiere.matiereLibelle}
                </h3>

                {/* Nom du professeur */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: '#64748b',
                    fontSize: config.metaSize,
                    fontWeight: '500'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: '#f1f5f9',
                    }}>
                        <FiUser size={config.iconSize - 2} style={{ color: '#64748b' }} />
                    </div>
                    <span>{matiere.personel?.libelle || matiere.professorLibelle || 'Non assigné'}</span>
                </div>

                {/* Badge de statut en position absolue avec animation */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '10px',
                    background: estVerrouille ? '#fef7f7' : '#f7fef7',
                    color: estVerrouille ? '#dc2626' : '#16a34a',
                    fontSize: '10px',
                    fontWeight: '600',
                    border: `1px solid ${estVerrouille ? '#fee2e2' : '#dcfce7'}`,
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.025em'
                }}>
                    <div style={{
                        transform: animateIcon ? 'scale(1.2) rotate(10deg)' : 'scale(1) rotate(0deg)',
                        transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                    }}>
                        {estVerrouille ? <FiLock size={10} /> : <FiUnlock size={10} />}
                    </div>
                    <span>{estVerrouille ? 'Verrouillé' : 'Libre'}</span>
                </div>
            </div>

            {/* Zone des boutons */}
            <div style={{ padding: `${parseInt(config.padding) - 4}px ${config.padding} ${config.padding} ${config.padding}` }}>
                <div style={{
                    display: 'flex',
                    gap: '8px'
                }}>
                    <Button
                        size="sm"
                        appearance="subtle"
                        startIcon={<FiExternalLink size={13} />}
                        onClick={() => onOuvrirCahier && onOuvrirCahier(matiere)}
                        style={{
                            flex: 2,
                            borderRadius: '10px',
                            height: config.buttonHeight,
                            fontSize: config.buttonFontSize,
                            fontWeight: '600',
                            color: '#475569',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s ease',
                            letterSpacing: '0.025em'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = accentColor;
                            e.target.style.color = 'white';
                            e.target.style.borderColor = accentColor;
                            e.target.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#f8fafc';
                            e.target.style.color = '#475569';
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        OUVRIR
                    </Button>

                    <Button
                        size="sm"
                        appearance="subtle"
                        startIcon={
                            <div style={{
                                transform: animateIcon ? 'scale(1.15) rotate(15deg)' : 'scale(1) rotate(0deg)',
                                transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                            }}>
                                {estVerrouille ? <FiUnlock size={12} /> : <FiLock size={12} />}
                            </div>
                        }
                        onClick={handleVerrouillerCahier}
                        style={{
                            flex: 1,
                            borderRadius: '10px',
                            height: config.buttonHeight,
                            fontSize: config.buttonFontSize,
                            fontWeight: '600',
                            color: estVerrouille ? '#059669' : '#dc2626',
                            background: estVerrouille ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${estVerrouille ? '#bbf7d0' : '#fecaca'}`,
                            transition: 'all 0.2s ease',
                            letterSpacing: '0.025em'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        {estVerrouille ? 'LIBRE' : 'VERROU'}
                    </Button>
                </div>
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

export default MatiereCard;