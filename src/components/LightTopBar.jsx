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
  Tooltip
} from 'rsuite';

// Icônes basiques qui existent dans toutes les versions de @rsuite/icons
import SearchIcon from '@rsuite/icons/Search';
import NoticeIcon from '@rsuite/icons/Notice';
import MessageIcon from '@rsuite/icons/Message';
import ExitIcon from '@rsuite/icons/Exit';
import MoreIcon from '@rsuite/icons/More';

// Composant InfoCard réutilisable
const InfoCard = ({ 
  icon, 
  label, 
  value, 
  bgColor = 'primary',
  onClick,
  className = ''
}) => {
  const bgColorMap = {
    primary: 'bg-primary-light',
    success: 'bg-success-light',
    info: 'bg-info-light',
    warning: 'bg-warning-light',
    danger: 'bg-danger-light'
  };

  return (
    <div 
      className={`info-card ${className} ${onClick ? 'info-card-clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={`icon-wrapper ${bgColorMap[bgColor] || bgColorMap.primary}`}>
        <span className="icon-emoji">{icon}</span>
      </div>
      <div className="info-content">
        <div className="info-label">{label}</div>
        <div className="info-value fs-8">{value}</div>
      </div>
    </div>
  );
};

const LightTopBar = ({
  pageTitle = "Tableau de Bord",
  onLogout,
  userInfo = { name: "John Doe", role: "Administrateur", avatar: "", email: "john.doe@example.com" },
  breadcrumbItems = []
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAllCards, setShowAllCards] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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

  // Récupération des données académiques
  const [academicData, setAcademicData] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  React.useEffect(() => {
    // Gérer le resize pour le responsive
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    // Récupérer les données de localStorage (pour démo, on utilise des données fictives)
    const mockData = {
      "anneeDebut": 2024,
      "customLibelle": "Année 2024 - 2025",
      "libelle": "Année 2024 - 2025",
      "nbreEval": 9,
      "niveau": "CENTRAL",
      "niveauEnseignement": {
        "code": "5",
        "id": 5,
        "libelle": "Enseignement Secondaire Technique"
      },
      "periodicite": {
        "code": "3",
        "id": 3,
        "libelle": "Semestrielle",
        "ordre": "3"
      },
      "statut": "DIFFUSE"
    };
    
    // Essayer de récupérer depuis localStorage, sinon utiliser les données de démo
    const academicYear = sessionStorage.getItem('academicYearMain');
    if (academicYear) {
      setAcademicData(JSON.parse(academicYear));
    } else {
      setAcademicData(mockData);
    }

    // Mettre à jour l'heure toutes les secondes
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formater la date et l'heure
  const formatDateTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit',
      month: 'short'
    });
  };

  const timeStr = formatDateTime(currentDateTime);

  // Menu utilisateur avec icônes unicode (pas de dépendance externe)
  const userMenuItems = [
    { divider: true },
    {
      label: "Déconnexion",
      icon: <ExitIcon className="text-danger" />,
      action: onLogout || (() => console.log('Déconnexion')),
      danger: true,
      description: "Fermer la session"
    }
  ];

  // Déterminer le nombre de cartes à afficher selon la largeur d'écran
  const getMaxVisibleCards = () => {
    if (screenWidth <= 1331) return 2;
    if (screenWidth <= 1370) return 3;
    if (screenWidth <= 1570) return 4;
    if (screenWidth <= 1730) return 5;
    return allCards.length; // Afficher toutes les cartes sur grand écran
  };

  // Préparer toutes les cartes
  const allCards = [
    {
      icon: "🏫",
      label: "École",
      value: sessionStorage.getItem('schoolLabel') || "Lycée Moderne",
      bgColor: "primary"
    },
    academicData && {
      icon: "📅",
      label: "Année scolaire",
      value: academicData.customLibelle || academicData.libelle,
      bgColor: "success"
    },
    academicData?.niveauEnseignement && {
      icon: "🎓",
      label: "Niveau",
      value: academicData.niveauEnseignement.libelle,
      bgColor: "info"
    },
    academicData?.periodicite && {
      icon: "⏱️",
      label: "Périodicité",
      value: academicData.periodicite.libelle,
      bgColor: "warning"
    },
    {
      icon: "🕐",
      label: formatDate(currentDateTime),
      value: timeStr,
      bgColor: "danger",
      className: "datetime-card"
    }
  ].filter(Boolean);

  const maxVisibleCards = getMaxVisibleCards();

  // Cartes à afficher (selon largeur écran ou toutes)
  const visibleCards = showAllCards ? allCards : allCards.slice(0, maxVisibleCards);
  const hasHiddenCards = allCards.length > maxVisibleCards;

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
    <>
      <style>{`
        /* TOP BAR CSS */
        .modern-light-topbar {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
          transition: all 0.3s ease;
        }

        /* Container principal pour éviter le wrap */
        .topbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          gap: 16px;
          min-height: 70px;
        }

        .nav-left {
          flex: 1;
          min-width: 0;
        }

        .nav-right {
          flex-shrink: 0;
        }

        /* Container des cartes d'information */
        .academic-info-container {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: nowrap;
          overflow-x: visible;
          overflow-y: hidden;
        }

        /* Styles pour InfoCard */
        .info-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
          min-width: fit-content;
          max-width: 220px;
          flex-shrink: 0;
          animation: cardSlideIn 0.3s ease-out;
        }

        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: rgba(0, 123, 255, 0.15);
        }

        .icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .info-card:hover .icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .bg-primary-light {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        }

        .bg-success-light {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        }

        .bg-info-light {
          background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
        }

        .bg-warning-light {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        }

        .bg-danger-light {
          background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
        }

        .icon-emoji {
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1));
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .info-label {
          font-size: 10px;
          font-weight: 500;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .info-value {
          font-size: 13px;
          font-weight: 600;
          color: #212529;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Style spécial pour la carte date/heure */
        .datetime-card .info-value {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #dc3545;
          letter-spacing: 0.5px;
        }

        /* Bouton toggle pour afficher plus/moins */
        .toggle-cards-btn {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: white;
          border: 2px solid #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
          color: #6c757d;
          font-weight: 600;
          position: relative;
        }

        .toggle-cards-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #007bff;
          color: #007bff;
        }

        .toggle-cards-btn.active {
          border-color: #007bff;
          color: #007bff;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        }

        /* Badge de compteur sur le bouton */
        .toggle-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #007bff;
          color: white;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
        }

        /* Section actions à droite */
        .actions-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-item {
          position: relative;
        }

        /* Boutons d'action améliorés */
        .action-btn {
          width: 42px;
          height: 42px;
          border-radius: 12px !important;
          background: white !important;
          border: 2px solid #e9ecef !important;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .search-btn {
          border-color: #007bff !important;
        }

        .search-btn:hover {
          background: #007bff !important;
          border-color: #007bff !important;
        }

        .search-btn:hover .rs-icon {
          color: white !important;
        }

        .notification-btn {
          border-color: #17a2b8 !important;
        }

        .notification-btn:hover {
          background: #17a2b8 !important;
          border-color: #17a2b8 !important;
        }

        .notification-btn:hover .rs-icon {
          color: white !important;
        }

        .message-btn {
          border-color: #28a745 !important;
        }

        .message-btn:hover {
          background: #28a745 !important;
          border-color: #28a745 !important;
        }

        .message-btn:hover .rs-icon {
          color: white !important;
        }

        /* Barre de recherche animée */
        .search-input-group {
          width: 260px;
          animation: searchExpand 0.3s ease-out;
        }

        .search-input-group .rs-input {
          border: 2px solid #007bff !important;
          border-radius: 12px 0 0 12px !important;
          padding: 10px 14px !important;
          font-size: 14px !important;
        }

        .search-input-group .rs-input-group-btn {
          background: #007bff !important;
          border: 2px solid #007bff !important;
          border-radius: 0 12px 12px 0 !important;
          padding: 0 14px !important;
        }

        .search-input-group .rs-input-group-btn .rs-icon {
          color: white !important;
        }

        @keyframes searchExpand {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 260px;
            opacity: 1;
          }
        }

        /* Badges personnalisés */
        .custom-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #dc3545 !important;
          color: white !important;
          border: 2px solid white;
          border-radius: 10px;
          font-size: 10px !important;
          font-weight: 600;
          min-width: 20px !important;
          height: 20px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
          animation: badgePulse 2s infinite;
        }

        .badge-success {
          background: #28a745 !important;
          box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3);
        }

        @keyframes badgePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* Séparateur */
        .action-separator {
          width: 1px;
          height: 32px;
          background: linear-gradient(180deg, transparent 0%, #dee2e6 50%, transparent 100%);
          margin: 0 4px;
        }

        /* Profil utilisateur */
        .user-profile-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px 6px 6px;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-profile-toggle:hover {
          border-color: #007bff;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
          transform: translateY(-2px);
        }

        .user-info {
          text-align: right;
        }

        .user-role {
          font-size: 11px;
          color: #6c757d;
          font-weight: 500;
          line-height: 1.2;
        }

        .user-avatar {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
          border: 2px solid white !important;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3) !important;
        }

        /* Popovers personnalisés */
        .custom-popover {
          border: 0 !important;
          padding: 0 !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }

        .notification-panel,
        .message-panel {
          width: 380px;
          max-width: 90vw;
        }

        /* Dropdown utilisateur */
        .user-dropdown .rs-dropdown-menu {
          min-width: 280px !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
          border: 0 !important;
          overflow: hidden;
        }

        .rs-dropdown-item:hover {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          transform: translateX(4px);
          transition: all 0.2s ease;
        }

        @media (max-width: 768px) {
          .info-card {
            padding: 6px 10px;
            gap: 8px;
          }
          .icon-wrapper {
            width: 32px;
            height: 32px;
            font-size: 16px;
          }
          .info-value {
            font-size: 12px;
          }
          .info-label {
            font-size: 9px;
          }
          .action-btn, .toggle-cards-btn {
            width: 38px;
            height: 38px;
          }
          .search-input-group {
            width: 180px;
          }
        }
      `}</style>
      
      <Header className="modern-light-topbar shadow-sm border-bottom">
        <Navbar appearance="subtle" className="bg-white">
          <div className="topbar-container">
            {/* Section gauche - Infos académiques */}
            <Nav className="flex-grow-1 nav-left">
              <FlexboxGrid align="middle" className="h-100">
                <FlexboxGrid.Item colspan={24}>
                  <div className="academic-info-container d-flex flex-wrap align-items-center gap-3">
                    
                    {/* Cartes visibles */}
                    {visibleCards.map((card, index) => (
                      <InfoCard
                        key={index}
                        icon={card.icon}
                        label={card.label}
                        value={card.value}
                        bgColor={card.bgColor}
                        className={card.className}
                      />
                    ))}

                    {/* Bouton toggle si plus de 3 cartes */}
                    {hasHiddenCards && (
                      <Whisper
                        trigger="hover"
                        speaker={
                          <Tooltip>
                            {showAllCards ? 'Voir moins' : `Voir ${allCards.length - maxVisibleCards} de plus`}
                          </Tooltip>
                        }
                        placement="bottom"
                      >
                        <div
                          className={`toggle-cards-btn ${showAllCards ? 'active' : ''}`}
                          onClick={() => setShowAllCards(!showAllCards)}
                        >
                          {showAllCards ? '−' : '+'}
                          {!showAllCards && (
                            <span className="toggle-badge">{allCards.length - maxVisibleCards}</span>
                          )}
                        </div>
                      </Whisper>
                    )}
                    
                  </div>
                </FlexboxGrid.Item>
              </FlexboxGrid>
            </Nav>

            {/* Section droite - Actions et menus */}
            <Nav pullRight className="nav-right">
              <div className="actions-wrapper">

                {/* Barre de recherche */}
                {/* <div className="action-item">
                  {showSearch ? (
                    <InputGroup inside className="search-input-group">
                      <Input
                        placeholder="Rechercher..."
                        value={searchValue}
                        onChange={setSearchValue}
                        onBlur={() => !searchValue && setShowSearch(false)}
                        autoFocus
                      />
                      <InputGroup.Button>
                        <SearchIcon />
                      </InputGroup.Button>
                    </InputGroup>
                  ) : (
                    <Whisper
                      trigger="hover"
                      speaker={<Tooltip>Rechercher</Tooltip>}
                      placement="bottom"
                    >
                      <IconButton
                        icon={<SearchIcon />}
                        circle
                        size="md"
                        appearance="subtle"
                        className="action-btn search-btn"
                        onClick={() => setShowSearch(true)}
                      />
                    </Whisper>
                  )}
                </div> */}

                {/* Notifications */}
                <div className="action-item position-relative">
                  <Whisper
                    trigger="click"
                    speaker={
                      <Popover className="custom-popover">
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
                      className="action-btn notification-btn"
                    />
                  </Whisper>
                  {unreadNotifications > 0 && (
                    <Badge
                      content={unreadNotifications}
                      className="custom-badge"
                    />
                  )}
                </div>

                {/* Messages */}
                <div className="action-item position-relative">
                  <Whisper
                    trigger="click"
                    speaker={
                      <Popover className="custom-popover">
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
                      className="action-btn message-btn"
                    />
                  </Whisper>
                  {unreadMessages > 0 && (
                    <Badge
                      content={unreadMessages}
                      className="custom-badge badge-success"
                    />
                  )}
                </div>

                {/* Séparateur */}
                <div className="action-separator"></div>

                {/* Menu utilisateur */}
                <div className="action-item">
                  <Dropdown
                    placement="bottomEnd"
                    className="user-dropdown"
                    trigger="click"
                    renderToggle={(props, ref) => (
                      <div
                        {...props}
                        ref={ref}
                        className="user-profile-toggle"
                      >
                        <div className="user-info d-none d-lg-block">
                          <div className="user-role">{userInfo.role}</div>
                        </div>
                        <Avatar
                          circle
                          size="sm"
                          src={userInfo.avatar}
                          alt={userInfo.name}
                          className="user-avatar"
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
                </div>

              </div>
            </Nav>
          </div>
        </Navbar>
      </Header>
    </>
  );
};

export default LightTopBar;