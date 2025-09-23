import React, { useState } from 'react';
import { Navbar, Nav, Button } from 'rsuite';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import { menuItems, modalConfig } from './menuConfig';

/**
 * Composant Menu Dynamique
 * Génère automatiquement le menu basé sur la configuration et gère les modals/redirections
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.customMenuItems - Items de menu personnalisés (optionnel)
 * @param {Object} props.customModalConfig - Configuration de modal personnalisée (optionnel)
 * @param {Function} props.onLoginSuccess - Callback appelé après une connexion réussie
 * @param {Object} props.branding - Configuration de la marque (logo, nom, etc.)
 * @param {Object} props.style - Styles personnalisés pour le header
 */
const DynamicMenu = ({
  customMenuItems = menuItems,
  customModalConfig = modalConfig,
  onLoginSuccess,
  branding = {},
  style = {}
}) => {
  const navigate = useNavigate();

  // États pour la gestion des modals
  const [modalOpen, setModalOpen] = useState(false);
  const [currentModalType, setCurrentModalType] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);

  /**
   * Gère le clic sur un élément de menu
   * @param {Object} item - Élément de menu cliqué
   */
  const handleMenuClick = (item) => {
    setSelectedKey(item.key); // Ajoute la sélection
    switch (item.type) {
      case 'redirect':
        if (item.path) {
          navigate(item.path);
        }
        break;

      case 'modal':
        if (item.modalType && customModalConfig[item.modalType]) {
          setCurrentModalType(item.modalType);
          setModalOpen(true);
        }
        break;

      default:
        console.warn(`Type de menu non géré: ${item.type}`);
    }
  };

  /**
   * Ferme le modal actuel
   */
  const closeModal = () => {
    setModalOpen(false);
    setCurrentModalType(null);
  };

  /**
   * Gère le succès de connexion
   * @param {Object} userData - Données de l'utilisateur connecté
   */
  const handleLoginSuccess = (userData) => {
    if (onLoginSuccess) {
      onLoginSuccess(userData);
    }
  };

  /**
   * Génère les éléments de navigation récursivement
   * @param {Array} items - Liste des éléments de menu
   * @returns {Array} - Éléments JSX pour la navigation
   */
  const renderNavItems = (items) => {
    return items.map((item) => {
      // Élément avec sous-menu (dropdown)
      if (item.type === 'dropdown' && item.children) {
        return (
          <Nav.Menu
            key={item.key}
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </span>
            }
            className={selectedKey === item.key ? 'selected' : ''}
          >
            {item.children.map((child) => (
              <Nav.Item
                key={child.key}
                onClick={() => handleMenuClick(child)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                className={selectedKey === child.key ? 'selected' : ''}
              >
                {child.icon && <span>{child.icon}</span>}
                {child.label}
              </Nav.Item>
            ))}
          </Nav.Menu>
        );
      }

      // Élément de menu simple
      return (
        <Nav.Item
          key={item.key}
          onClick={() => handleMenuClick(item)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          className={selectedKey === item.key ? 'selected' : ''}
        >
          {/* {item.icon && <span>{item.icon}</span>} */}
          {item.label}
        </Nav.Item>
      );
    });
  };

  // Configuration par défaut du header
  const defaultHeaderStyle = {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e5e5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    ...style
  };

  // Configuration par défaut de la marque
  const defaultBranding = {
    name: 'MonApp',
    logo: null,
    style: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#667eea'
    },
    ...branding
  };

  return (
    <>
      {/* Header avec navigation */}
      <header style={defaultHeaderStyle}>
        <div className="container-fluid">
          <Navbar appearance="subtle">
            {/* Marque/Logo */}
            <Navbar.Brand>
              <div style={{
                display: 'flex',
                alignItems: 'center', // aligne verticalement
                ...defaultBranding.style // garde ton style existant
              }}>
                <img src="logo-app.png" width={30} alt="logo" />
                <span style={{
                  marginLeft: '10px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#667eea'
                }}>
                  {defaultBranding.name}
                </span>
              </div>

            </Navbar.Brand>

            {/* Menu principal */}
            <Nav>
              {renderNavItems(customMenuItems)}
            </Nav>

            {/* Actions côté droit */}
            <Nav pullRight>
              <Nav.Item>
                <Button
                  appearance="subtle"
                  style={{ marginRight: '10px' }}
                  onClick={() => navigate('/help')}
                >
                  Aide
                </Button>
                <Button
                  appearance="primary"
                  style={{
                    backgroundColor: '#667eea',
                    border: 'none'
                  }}
                  onClick={() => navigate('/register')}
                >
                  S'inscrire
                </Button>
              </Nav.Item>
            </Nav>
          </Navbar>
        </div>
      </header>

      {/* Modal de connexion */}
      {currentModalType && (
        <LoginModal
          open={modalOpen}
          onClose={closeModal}
          config={{
            ...customModalConfig[currentModalType],
            modalType: currentModalType
          }}
          onSuccess={handleLoginSuccess}
        />
      )}
      <style>{`
  .selected {
    background: #e0e7ff !important;
    color: #3730a3 !important;
    font-weight: bold;
    border-radius: 6px;
  }
`}</style>
    </>
  );
};

export default DynamicMenu;