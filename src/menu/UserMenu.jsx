import React from 'react';
import { Nav, Avatar, Divider, Whisper, Tooltip } from 'rsuite';
import UserInfoIcon from '@rsuite/icons/UserInfo';
import SettingIcon from '@rsuite/icons/Setting';
import ExitIcon from '@rsuite/icons/Exit';
import { useUserContext } from '../hooks/useUserContext';

const UserMenu = () => {
  const { 
    personnelInfo,
    email,
    clearUserParams
  } = useUserContext();

  // Fonctions utilitaires pour l'affichage
  const getUserName = () => {
    if (personnelInfo?.nom) return personnelInfo.nom;
    if (personnelInfo?.prenom) return personnelInfo.prenom;
    if (email) return email.split('@')[0];
    return 'Utilisateur';
  };

  const getUserRole = () => {
    if (personnelInfo?.fonction) return personnelInfo.fonction;
    if (personnelInfo?.poste) return personnelInfo.poste;
    return 'Personnel';
  };

  const getUserInitials = () => {
    const name = getUserName();
    if (name === 'Utilisateur') return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMenuSelect = (eventKey) => {
    switch (eventKey) {
      case 'profile':
        console.log('Redirection vers le profil');
        break;
      case 'settings':
        console.log('Redirection vers les paramètres');
        break;
      case 'logout':
        clearUserParams();
        console.log('Déconnexion effectuée');
        break;
      default:
        break;
    }
  };

  const renderToggle = (props, ref) => (
    <Whisper
      trigger="hover"
      placement="bottomEnd"
      speaker={
        <Tooltip>
          <div className="user-tooltip">
            <div className="user-tooltip-name">{getUserName()}</div>
            <div className="user-tooltip-role">{getUserRole()}</div>
          </div>
        </Tooltip>
      }
    >
      <div className="user-menu-trigger" {...props} ref={ref}>
        <Avatar
          circle
          size="sm"
          className="user-avatar-menu"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {getUserInitials()}
        </Avatar>
      </div>
    </Whisper>
  );

  return (
    <Nav.Menu
      title={renderToggle}
      placement="bottomEnd"
      className="user-dropdown"
    >
      <Nav.Item className="user-info-item" disabled>
        <div className="dropdown-user-info">
          <div className="dropdown-user-name">{getUserName()}</div>
          <div className="dropdown-user-role">{getUserRole()}</div>
          <div className="dropdown-user-email">{email || 'Email non disponible'}</div>
        </div>
      </Nav.Item>
      
      <Divider />
      
      <Nav.Item eventKey="profile" icon={<UserInfoIcon />} onClick={() => handleMenuSelect('profile')}>
        Voir le profil
      </Nav.Item>
      
      <Nav.Item eventKey="settings" icon={<SettingIcon />} onClick={() => handleMenuSelect('settings')}>
        Paramètres
      </Nav.Item>
      
      <Divider />
      
      <Nav.Item eventKey="logout" icon={<ExitIcon />} onClick={() => handleMenuSelect('logout')}>
        Se déconnecter
      </Nav.Item>
    </Nav.Menu>
  );
};

export default UserMenu;