import React from 'react';
import { Button } from 'rsuite';

/**
 * Composant bouton réutilisable avec icône et texte
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.icon - L'icône à afficher (composant React)
 * @param {string} props.text - Le texte du bouton
 * @param {string} props.loadingText - Le texte pendant le chargement (optionnel)
 * @param {boolean} props.loading - État de chargement
 * @param {boolean} props.disabled - État désactivé
 * @param {Function} props.onClick - Fonction appelée au clic
 * @param {string} props.appearance - Apparence du bouton (default: "primary")
 * @param {string} props.size - Taille du bouton (default: "lg")
 * @param {Object} props.style - Styles personnalisés (optionnel)
 * @param {string} props.gradient - Gradient CSS (optionnel)
 * @param {string} props.className - Classes CSS additionnelles
 */
const GradientButton = ({
    icon,
    text,
    loadingText = 'Chargement...',
    loading = false,
    disabled = false,
    onClick,
    appearance = 'primary',
    size = 'lg',
    style = {},
    gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    className = '',
    ...otherProps
}) => {

    const academicYear = JSON.parse(localStorage.getItem('academicYearMain'));
    const defaultStyle = {
        //background: gradient,
        border: 'none',
        borderRadius: '8px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        ...style
    };

    return (
        <Button
            appearance={appearance}
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            style={defaultStyle}
            size={size}
            className={`btn-action-${academicYear.niveauEnseignement?.libelle.replace(/[\s()]/g, '')}`}
            {...otherProps}
        >
            {!loading && icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
            <span>{loading ? loadingText : text}</span>
        </Button>
    );
};

export default GradientButton;