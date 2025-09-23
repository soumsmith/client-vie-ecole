import React, { useState } from 'react';
import {
  Header,
  Navbar,
  Nav,
  FlexboxGrid,
  IconButton,
  Input,
  InputGroup,
  Badge,
  Avatar,
  Dropdown,
  Popover,
  Whisper,
  List,
  Panel,
  Breadcrumb,
  Tooltip
} from 'rsuite';

// Icônes basiques qui existent dans toutes les versions de @rsuite/icons
import SearchIcon from '@rsuite/icons/Search';
import NoticeIcon from '@rsuite/icons/Notice';
import MessageIcon from '@rsuite/icons/Message';
import SettingIcon from '@rsuite/icons/Setting';
import AdminIcon from '@rsuite/icons/Admin';
import ExitIcon from '@rsuite/icons/Exit';
import UserInfoIcon from '@rsuite/icons/UserInfo';

const LightTopBar = ({
  pageTitle = "Tableau de Bord",
  onLogout,
  userInfo = { name: "John Doe", role: "Administrateur", avatar: "", email: "john.doe@example.com" },
  breadcrumbItems = []
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Données de test pour les notifications
  const [notifications] = useState([
    { id: 1, title: "Nouvelle inscription", message: "5 nouvelles inscriptions en attente", time: "5 min", type: "info", unread: true },
    { id: 2, title: "Évaluation terminée", message: "L'évaluation de Math est complète", time: "1h", type: "success", unread: true },
    { id: 3, title: "Maintenance système", message: "Maintenance prévue ce soir à 23h", time: "2h", type: "warning", unread: false }
  ]);

  const [messages] = useState([
    { id: 1, from: "Marie Dupont", message: "Réunion reportée à demain", time: "10 min", avatar: "", unread: true },
    { id: 2, from: "Pierre Martin", message: "Rapport d'évaluation prêt", time: "30 min", avatar: "", unread: true },
    { id: 3, from: "Sophie Bernard", message: "Question sur les coefficients", time: "1h", avatar: "", unread: false }
  ]);

  const unreadNotifications = notifications.filter(n => n.unread).length;
  const unreadMessages = messages.filter(m => m.unread).length;

  // Menu utilisateur avec icônes unicode (pas de dépendance externe)
  const userMenuItems = [
    {
      label: "Mon Profil",
      icon: <UserInfoIcon className="text-primary" />,
      action: () => console.log('Profil'),
      description: "Gérer mes informations"
    },
    {
      label: "Modifier le profil",
      icon: <span className="text-info fs-6">✏️</span>,
      action: () => console.log('Modifier profil'),
      description: "Changer photo et infos"
    },
    { divider: true },
    {
      label: "Paramètres",
      icon: <SettingIcon className="text-secondary" />,
      action: () => console.log('Paramètres'),
      description: "Préférences système"
    },
    {
      label: "Sécurité",
      icon: <span className="text-warning fs-6">🔒</span>,
      action: () => console.log('Sécurité'),
      description: "Mot de passe et 2FA"
    },
    {
      label: "Administration",
      icon: <AdminIcon className="text-success" />,
      action: () => console.log('Admin'),
      description: "Panneau d'administration"
    },
    { divider: true },
    {
      label: "Déconnexion",
      icon: <ExitIcon className="text-danger" />,
      action: onLogout,
      danger: true,
      description: "Fermer la session"
    }
  ];

  // Rendu des notifications
  const NotificationPanel = () => (
    <Panel className="notification-panel p-0 border-0">
      <div className="p-3 bg-light border-bottom">
        <h6 className="mb-1 fw-bold text-dark">Notifications</h6>
        <small className="text-muted">Vous avez {unreadNotifications} nouvelles notifications</small>
      </div>
      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        <List>
          {notifications.map((notif) => (
            <List.Item key={notif.id} className={`p-3 border-0 ${notif.unread ? 'bg-light' : ''}`}>
              <FlexboxGrid align="middle">
                <FlexboxGrid.Item colspan={2}>
                  <div className={`rounded-circle p-2 text-white ${notif.type === 'info' ? 'bg-primary' :
                      notif.type === 'success' ? 'bg-success' : 'bg-warning'
                    }`}>
                    <NoticeIcon size="sm" />
                  </div>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={20}>
                  <div className="ms-2">
                    <div className="fw-semibold text-dark">{notif.title}</div>
                    <div className="text-muted small">{notif.message}</div>
                    <small className="text-secondary">{notif.time}</small>
                  </div>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={2}>
                  {notif.unread && <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>}
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </List.Item>
          ))}
        </List>
      </div>
      <div className="p-3 bg-light border-top text-center">
        <a href="#" className="text-primary text-decoration-none fw-semibold">
          Voir toutes les notifications
        </a>
      </div>
    </Panel>
  );

  // Rendu des messages
  const MessagePanel = () => (
    <Panel className="message-panel p-0 border-0">
      <div className="p-3 bg-light border-bottom">
        <h6 className="mb-1 fw-bold text-dark">Messages</h6>
        <small className="text-muted">{unreadMessages} messages non lus</small>
      </div>
      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        <List>
          {messages.map((msg) => (
            <List.Item key={msg.id} className={`p-3 border-0 ${msg.unread ? 'bg-light' : ''}`}>
              <FlexboxGrid align="middle">
                <FlexboxGrid.Item colspan={4}>
                  <Avatar
                    circle
                    size="sm"
                    src={msg.avatar}
                    alt={msg.from}
                    className="bg-gradient bg-primary text-white"
                  >
                    {msg.from.charAt(0)}
                  </Avatar>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={18}>
                  <div>
                    <div className="fw-semibold text-dark">{msg.from}</div>
                    <div className="text-muted small">{msg.message}</div>
                    <small className="text-secondary">{msg.time}</small>
                  </div>
                </FlexboxGrid.Item>
                <FlexboxGrid.Item colspan={2}>
                  {msg.unread && <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>}
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </List.Item>
          ))}
        </List>
      </div>
      <div className="p-3 bg-light border-top text-center">
        <a href="#" className="text-primary text-decoration-none fw-semibold">
          Voir tous les messages
        </a>
      </div>
    </Panel>
  );

  return (
    <Header className="modern-light-topbar shadow-sm border-bottom">
      <Navbar appearance="subtle" className="bg-white px-4 py-2">
        {/* Section gauche - Titre et Breadcrumb */}
        <Nav className="flex-grow-1">
          <div className="d-flex flex-column justify-content-center">
            <h4 className="mb-1 fw-bold text-dark">{pageTitle}</h4>
            {breadcrumbItems.length > 0 && (
              <Breadcrumb className="mb-0">
                <Breadcrumb.Item href="/" className="text-muted">
                  <span className="me-1">🏠</span>
                  Accueil
                </Breadcrumb.Item>
                {breadcrumbItems.map((item, index) => (
                  <Breadcrumb.Item
                    key={index}
                    href={item.href}
                    active={item.active}
                    className={item.active ? "text-primary fw-semibold" : "text-muted"}
                  >
                    {item.label}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
            )}
          </div>
        </Nav>

        {/* Section droite - Actions et menus */}
        <Nav pullRight>
          <FlexboxGrid align="middle" justify="end" className="gap-2">

            {/* Barre de recherche */}
            <FlexboxGrid.Item>
              <div className="me-3">
                {showSearch ? (
                  <InputGroup inside style={{ width: '280px' }} className="search-animated">
                    <Input
                      placeholder="Rechercher..."
                      value={searchValue}
                      onChange={setSearchValue}
                      className="border-primary"
                      onBlur={() => !searchValue && setShowSearch(false)}
                      autoFocus
                    />
                    <InputGroup.Button className="bg-primary border-primary">
                      <SearchIcon className="text-white" />
                    </InputGroup.Button>
                  </InputGroup>
                ) : (
                  <Whisper
                    trigger="hover"
                    speaker={<Tooltip>Rechercher</Tooltip>}
                  >
                    <IconButton
                      icon={<SearchIcon />}
                      circle
                      size="md"
                      appearance="subtle"
                      className="text-primary border border-primary bg-light hover-lift"
                      onClick={() => setShowSearch(true)}
                    />
                  </Whisper>
                )}
              </div>
            </FlexboxGrid.Item>

            {/* Notifications */}
            <FlexboxGrid.Item>
              <div className="position-relative me-2">
                <Whisper
                  trigger="click"
                  speaker={
                    <Popover className="border-0 p-0">
                      <NotificationPanel />
                    </Popover>
                  }
                  placement="bottomEnd"
                >
                  <IconButton
                    icon={<NoticeIcon />}
                    circle
                    size="md"
                    appearance="subtle"
                    className="text-info border border-info bg-light hover-lift"
                  />
                </Whisper>
                {unreadNotifications > 0 && (
                  <Badge
                    content={unreadNotifications}
                    className="position-absolute top-0 start-100 translate-middle bg-danger border border-white"
                    style={{ fontSize: '10px' }}
                  />
                )}
              </div>
            </FlexboxGrid.Item>

            {/* Messages */}
            <FlexboxGrid.Item>
              <div className="position-relative me-3">
                <Whisper
                  trigger="click"
                  speaker={
                    <Popover className="border-0 p-0">
                      <MessagePanel />
                    </Popover>
                  }
                  placement="bottomEnd"
                >
                  <IconButton
                    icon={<MessageIcon />}
                    circle
                    size="md"
                    appearance="subtle"
                    className="text-success border border-success bg-light hover-lift"
                  />
                </Whisper>
                {unreadMessages > 0 && (
                  <Badge
                    content={unreadMessages}
                    className="position-absolute top-0 start-100 translate-middle bg-success border border-white"
                    style={{ fontSize: '10px' }}
                  />
                )}
              </div>
            </FlexboxGrid.Item>

            {/* Menu utilisateur */}
            <FlexboxGrid.Item>
              <Dropdown
                placement="bottomEnd"
                className="user-dropdown"
                trigger="click"
                renderToggle={(props, ref) => (
                  <div
                    {...props}
                    ref={ref}
                    className="d-flex align-items-center p-2 hover-lift cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="me-2 text-end d-none d-md-block">
                      {/* <div className="fw-semibold text-dark small">{userInfo.name}</div> */}
                      <div className="text-muted" style={{ fontSize: '11px' }}>{userInfo.role}</div>
                    </div>
                    <Avatar
                      circle
                      size="sm"
                      src={userInfo.avatar}
                      alt={userInfo.name}
                      className="bg-gradient bg-primary text-white border border-white"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    >
                      {userInfo.name.charAt(0)}
                    </Avatar>
                  </div>
                )}
              >
                {/* En-tête du menu */}
                <div className="p-3 bg-light border-bottom">
                  <FlexboxGrid align="middle">
                    <FlexboxGrid.Item colspan={6}>
                      <Avatar
                        circle
                        size="md"
                        src={userInfo.avatar}
                        alt={userInfo.name}
                        className="bg-gradient bg-primary text-white"
                      >
                        {userInfo.name.charAt(0)}
                      </Avatar>
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item colspan={18}>
                      <div className="ms-2">
                        <div className="fw-bold text-dark">{userInfo.name}</div>
                        <div className="text-muted small">{userInfo.email}</div>
                        <span className="badge bg-primary rounded-pill mt-1" style={{ fontSize: '10px' }}>
                          {userInfo.role}
                        </span>
                      </div>
                    </FlexboxGrid.Item>
                  </FlexboxGrid>
                </div>

                {/* Items du menu */}
                {userMenuItems.map((item, index) => (
                  item.divider ? (
                    <Dropdown.Item key={index} divider />
                  ) : (
                    <Dropdown.Item
                      key={index}
                      onSelect={item.action}
                      className={`p-3 ${item.danger ? 'text-danger' : ''}`}
                    >
                      <FlexboxGrid align="middle">
                        <FlexboxGrid.Item colspan={4}>
                          {item.icon}
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={20}>
                          <div className="ms-2">
                            <div className="fw-semibold">{item.label}</div>
                            {item.description && (
                              <small className="text-muted">{item.description}</small>
                            )}
                          </div>
                        </FlexboxGrid.Item>
                      </FlexboxGrid>
                    </Dropdown.Item>
                  )
                ))}
              </Dropdown>
            </FlexboxGrid.Item>

          </FlexboxGrid>
        </Nav>
      </Navbar>

      <style jsx>{`
        .modern-light-topbar {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
          min-height: 70px;
          transition: all 0.3s ease;
        }

        .hover-lift {
          transition: all 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        .search-animated {
          animation: searchExpand 0.3s ease-out;
        }

        @keyframes searchExpand {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 280px;
            opacity: 1;
          }
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .notification-panel,
        .message-panel {
          width: 380px;
          max-width: 90vw;
        }

        .bg-gradient {
          background: linear-gradient(45deg, var(--bs-primary), var(--bs-info)) !important;
        }

        .gap-2 {
          gap: 0.5rem;
        }

        /* Badge personnalisé */
        .rs-badge {
          font-size: 10px !important;
          min-width: 18px !important;
          height: 18px !important;
          line-height: 16px !important;
        }

        /* Effet de survol pour les items du dropdown */
        .rs-dropdown-item:hover {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          transform: translateX(4px);
          transition: all 0.2s ease;
        }

        /* Animation pour les notifications */
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .rs-badge {
          animation: pulse 2s infinite;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .search-animated {
            width: 200px !important;
          }

          .modern-light-topbar .navbar {
            padding: 8px 16px !important;
          }
        }

        @media (max-width: 576px) {
          .notification-panel,
          .message-panel {
            width: 300px;
          }
        }
        .user-dropdown .rs-dropdown-menu {
          min-width: 280px !important; /* largeur plus grande */
        }
          .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: none !important;
        }
      `}</style>
    </Header>
  );
};

export default LightTopBar;