import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationData, siteConfig } from '../data/siteData';
import { modalConfig } from '../../Menu/menuConfig';
import LoginModal from '../../Menu/LoginModal';

// ===========================
// UTILITAIRES DE NAVIGATION
// ===========================
const navigationUtils = {
  handleNavigation: (item, navigate, openModal) => {
    // Gestion des différents types de navigation
    if (item.type === 'modal' && item.modalType && openModal) {
      openModal(item.modalType);
    } else if (item.type === 'external' ||
      (item.link && (item.link.startsWith('http') ||
        item.link.startsWith('mailto:') ||
        item.link.startsWith('tel:')))) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    } else if (item.link && item.link !== '#' && navigate) {
      navigate(item.link);
    }
  }
};

// ===========================
// COMPOSANT TOPBAR
// ===========================
const Topbar = () => {
  const { topbar } = navigationData;
  const navigate = useNavigate();

  const handleTopbarClick = (item) => {
    navigationUtils.handleNavigation(item, navigate);
  };

  return (
    <div className="topbar">
      <div className="container">
        <div className="topbar__inner">
          <ul className="list-unstyled topbar__info">
            {topbar.info.map((item) => (
              <li key={item.id}>
                <i className={item.icon}></i>
                <a
                  href={item.link}
                  onClick={(e) => {
                    if (item.type !== 'external') {
                      e.preventDefault();
                      handleTopbarClick(item);
                    }
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>

          <div className="topbar__social">
            {topbar.social.map((social) => (
              <a
                key={social.id}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className={social.icon}></i>
              </a>
            ))}
          </div>

          <ul className="list-unstyled topbar__links">
            {topbar.links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.type === 'external' ? link.link : '#'}
                  onClick={(e) => {
                    if (link.type !== 'external') {
                      e.preventDefault();
                      handleTopbarClick(link);
                    }
                  }}
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT MENU ITEM AVEC NAVIGATION AVANCÉE
// ===========================
const MenuItem = ({ item, onDropdownToggle, openDropdowns, onModalOpen }) => {
  const navigate = useNavigate();
  const hasChildren = item.hasChildren && item.children;
  const isOpen = openDropdowns.includes(item.id);
  const itemClass = `${hasChildren ? 'menu-item-has-children' : ''} ${item.current ? 'current' : ''} ${isOpen ? 'dropdown-open' : ''}`.trim();

  const handleClick = (e) => {
    e.preventDefault();

    if (hasChildren) {
      onDropdownToggle(item.id);
    } else {
      navigationUtils.handleNavigation(item, navigate, onModalOpen);
    }
  };

  return (
    <li className={itemClass}>
      <a
        href={hasChildren ? '#' : item.link}
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: hasChildren ? 'space-between' : 'flex-start',
          width: '100%',
          gap: '8px'
        }}
      >
        <span style={{ flex: hasChildren ? 1 : 'none' }}>{item.text}</span>
        {hasChildren && (
          <i className={`fas fa-chevron-down dropdown-icon ${isOpen ? 'rotated' : ''}`}
            style={{
              fontSize: '10px',
              transition: 'transform 0.3s ease',
              flexShrink: 0
            }}
          ></i>
        )}
      </a>
      {hasChildren && (
        <ul className={`submenu ${isOpen ? 'show' : ''}`}>
          {item.children.map((child) => (
            <MenuItem
              key={child.id}
              item={child}
              onDropdownToggle={onDropdownToggle}
              openDropdowns={openDropdowns}
              onModalOpen={onModalOpen}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// ===========================
// COMPOSANT DROPDOWN DE CONNEXION
// ===========================
const LoginDropdown = ({ openModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (modalType) => {
    openModal(modalType);
    setIsOpen(false);
  };

  const loginOptions = [
    { key: 'admin', label: 'Administrateur', config: modalConfig.admin },
    { key: 'personnel', label: 'Personnel', config: modalConfig.personnel },
    { key: 'candidat', label: 'Candidat', config: modalConfig.candidat },
    { key: 'parent', label: 'Parent', config: modalConfig.parent },
    { key: 'eleve', label: 'Élève', config: modalConfig.eleve }
  ];

  return (
    <div className="auth-dropdown" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="thm-btn thm-btn--two mx-0"
        onClick={toggleDropdown}
        style={{
          color: isOpen ? 'white' : '#667eea',
          backgroundColor: isOpen ? '#667eea' : 'transparent',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span className={isOpen ? 'text-white' : 'text-white'}>Connexion</span>
        <i className={`fas fa-chevron-down ${isOpen ? 'rotated' : ''}`}
          style={{
            fontSize: '10px',
            color: isOpen ? 'white' : '#667eea',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
        </i>
      </button>

      <div
        className={`auth-dropdown-content ${isOpen ? 'show' : ''}`}
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          minWidth: '200px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          zIndex: 1001,
          borderRadius: '8px',
          top: '100%',
          right: '0',
          marginTop: '5px',
          border: '1px solid #e5e5e5',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.3s ease'
        }}
      >
        {loginOptions.map((option, index) => (
          <button
            key={option.key}
            onClick={() => handleOptionClick(option.key)}
            className={`dropdown-option ${index === loginOptions.length - 1 ? 'last' : ''}`}
          >
            <i className={option.config.icon}
              style={{
                marginRight: '8px',
                color: option.config.color
              }}
            ></i>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT DROPDOWN D'INSCRIPTION
// ===========================
const RegistrationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (route) => {
    navigate(route);
    setIsOpen(false);
  };

  // Configuration des options d'inscription avec routes
  const registrationOptions = [
    {
      key: 'etablissement',
      label: 'Etablissement',
      route: '/inscription/etablissement',
      icon: 'fas fa-user-graduate',
      color: '#667eea'
    },
    {
      key: 'profesionel',
      label: 'Profesionel',
      route: '/inscription/profesionel',
      icon: 'fas fa-users',
      color: '#48bb78'
    }
  ];

  return (
    <div className="auth-dropdown" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="thm-btn thm-btn--two mx-0"
        onClick={toggleDropdown}
        style={{
          color: isOpen ? 'white' : '#667eea',
          backgroundColor: isOpen ? '#667eea' : 'transparent',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span className={'text-white'}>S'inscrire</span>
        <i className={`fas fa-chevron-down ${isOpen ? 'rotated' : ''}`}
          style={{
            fontSize: '10px',
            color: isOpen ? 'white' : '#667eea',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
        </i>
      </button>

      <div
        className={`auth-dropdown-content ${isOpen ? 'show' : ''}`}
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          minWidth: '220px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          zIndex: 1001,
          borderRadius: '8px',
          top: '100%',
          right: '0',
          marginTop: '5px',
          border: '1px solid #e5e5e5',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.3s ease'
        }}
      >
        {registrationOptions.map((option, index) => (
          <button
            key={option.key}
            onClick={() => handleOptionClick(option.route)}
            className={`dropdown-option ${index === registrationOptions.length - 1 ? 'last' : ''}`}
          >
            {/* <i className={option.icon} 
               style={{ 
                 marginRight: '8px', 
                 color: option.color 
               }}
            ></i> */}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT MAIN MENU
// ===========================
const MainMenu = ({ isSticky = false }) => {
  const { mainMenu } = navigationData;
  const navigate = useNavigate();
  const menuClass = `main-menu ${isSticky ? 'sticky-header sticky-header--cloned' : 'sticky-header'}`;

  const [modalOpen, setModalOpen] = useState(false);
  const [currentModalType, setCurrentModalType] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState([]);

  const handleDropdownToggle = (itemId) => {
    setOpenDropdowns(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const openModal = (modalType) => {
    if (modalConfig[modalType]) {
      setCurrentModalType(modalType);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentModalType(null);
  };

  const handleLoginSuccess = (userData) => {
    console.log('Utilisateur connecté:', userData);
    const config = modalConfig[currentModalType];
    if (config && config.redirectPath) {
      navigate(config.redirectPath);
    }
    closeModal();
  };

  return (
    <>
      <nav className={menuClass}>
        <div className="container d-flex justify-content-between align-items-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="main-header__logo"
          >
            <img src={siteConfig.logo} height="80" alt={siteConfig.logoAlt} />
          </a>

          <ul className="main-menu__list">
            {mainMenu.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                onDropdownToggle={handleDropdownToggle}
                openDropdowns={openDropdowns}
                onModalOpen={openModal}
              />
            ))}
          </ul>

          <div className="main-menu__right">
            <div className="main-menu__auth-buttons" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginRight: '20px'
            }}>
              <LoginDropdown openModal={openModal} />
              <RegistrationDropdown />
            </div>

            <a href="#" className="main-header__toggler mobile-nav__toggler">
              <span></span>
              <span></span>
              <span></span>
            </a>
          </div>
        </div>
      </nav>

      {currentModalType && (
        <LoginModal
          open={modalOpen}
          onClose={closeModal}
          config={{
            ...modalConfig[currentModalType],
            modalType: currentModalType
          }}
          onSuccess={handleLoginSuccess}
        />
      )}

      <style>{`
        .dropdown-option {
          display: block;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          fontSize: 14px;
          color: #333;
          transition: background-color 0.2s ease;
        }
        
        .dropdown-option:first-child {
          border-radius: 8px 8px 0 0;
        }
        
        .dropdown-option.last {
          border-radius: 0 0 8px 8px;
        }
        
        .dropdown-option:hover {
          background-color: #f8f9fa !important;
        }
        
        .menu-item-has-children .submenu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          min-width: 200px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-radius: 8px;
          border: 1px solid #e5e5e5;
          z-index: 1000;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }
        
        .menu-item-has-children .submenu.show {
          display: block;
          opacity: 1;
          transform: translateY(0);
        }
        
        .menu-item-has-children .submenu li {
          border-bottom: 1px solid #f0f0f0;
        }
        
        .menu-item-has-children .submenu li:last-child {
          border-bottom: none;
        }
        
        .menu-item-has-children .submenu a {
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          color: #333;
          text-decoration: none;
          transition: background-color 0.2s ease;
          width: 100%;
        }
        
        .menu-item-has-children .submenu a:hover {
          background-color: #f8f9fa;
          color: #667eea;
        }
        
        .dropdown-icon {
          font-size: 10px;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }
        
        .dropdown-icon.rotated {
          transform: rotate(180deg);
        }
        
        .main-menu__list > li > a {
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        
        .menu-item-has-children {
          position: relative;
        }
        
        @media (max-width: 768px) {
          .main-menu__auth-buttons {
            display: none !important;
          }
          
          .menu-item-has-children .submenu {
            position: static;
            box-shadow: none;
            border: none;
            border-left: 2px solid #667eea;
            margin-left: 15px;
            background: transparent;
          }
        }
        
        .auth-dropdown button {
          transition: all 0.3s ease;
        }
        
        .dropdown-open > a {
          color: #667eea !important;
        }
      `}</style>
    </>
  );
};

// ===========================
// COMPOSANT HEADER PRINCIPAL
// ===========================
const Header = () => {
  return (
    <header className="main-header container">
      <Topbar />
      <MainMenu />
      <MainMenu isSticky={true} />
    </header>
  );
};

export default Header;