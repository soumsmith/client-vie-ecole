import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { Container, Header, Content, Drawer, IconButton, Nav, Navbar, Sidebar as RSuiteSidebar, FlexboxGrid } from 'rsuite';
import MenuIcon from '@rsuite/icons/Menu';
import { allMenuSections } from './menuConfig';


// Import du nouveau TopBar
import LightTopBar from './LightTopBar';

import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Dashboard2 from './Dashboard2';
import DataTable from './DataTable';
import RecrutementPersonnel from './RecrutementPersonnel';
import ThemeToggle from '../contrexts/ThemeToggle';
import UserMenu from '../menu/UserMenu';

// ===========================
// FONDATEUR
// ===========================  
import AjouterPanier from './PULS/Panier/AjouterPanier';
import RecruterAgent from './PULS/RecruterAgent/RecruterAgent';
import ListeProfils from './PULS/Profile/ListeProfils';
import NoteEtMoyenne from './PULS/NoteEtMoyenne/NoteEtMoyenne';
import BulletinScolaire from './PULS/Bulletin/BulletinScolaire';
import Evaluation from './PULS/Evalutaion/Evaluations';
import ListeSalles from './PULS/Salles/ListeSalles';
import ListeClasses from './PULS/Classes/ListeClasses';
import ListeEmploiDuTemps from './PULS/Emploi_du_temps/ListeEmploiDuTemps';
import ListeMessages from './PULS/Messages/ListeMessages';
import Eleves from './PULS/Eleves/Eleves';
import PvEvaluations from './PULS/PvEvaluation/PvEvaluations';
import EvaluationProfesseur from './PULS/EvaluationProfesseur/EvaluationsProfesseur';
import MonPanier from './PULS/MonPanier/MonPanier';
import ListeOffresEmploi from './PULS/OffreEmploi/ListeOffresEmploi';

import ListePersonnel from './PULS/MonPersonnelAffectation/ListePersonnel';
import ListeSeancesSaisies from './PULS/SeancesSaisies/ListeSeancesSaisies';

import CertificatTravail from './PULS/CertificatTravail/CertificatTravail';

// ===========================
// INSCRIPTION
// ===========================

import ImportEleves from './PULS/ImportEleves/ImportEleves';
import IdentificationEleves from './PULS/IdentificationEleves/IdentificationEleves';
import InscriptionsAValider from './PULS/InscriptionsAValider/InscriptionsAValider';
import ListeElevesParClasse from './PULS/ElevesParClasse/ListeElevesParClasse';
import ListeMatieres from './PULS/Matieres/ListeMatieres';
import CoefficientsMatieres from './PULS/Coefficients/CoefficientsMatieres';

import AnneesScolaires from './PULS/AnneesScolaires/AnneesScolaires';
import ProfesseurMatiere from './PULS/ProfesseurMatiere/ProfesseurMatiere';

import PersonnelFonction from './PULS/PersonnelClasse/PersonnelFonction';
import CommonDataExample from './PULS/utils/CommonDataExample';

// ===========================
// ENQUETE RAPIDE
// ===========================
import EnqueteRapideRentree from './PULS/EnqueteRapideRentree/EnqueteRapideRentree';
import EcranRapports from './PULS/Rapport/EcranRapports';
import { usePulsParams } from './hooks/useDynamicParams';

import EvaluationDetail from './PULS/Evalutaion/detail/EvaluationDetail';
import ImportNotes from './PULS/Evalutaion/ImportNotes/ImportNotes'

//=========
// ADMIN
//==========

import DesactiverProfil from './PULS/DesactiverProfil/DesactiverProfil';
import InitialisationAnneesScolaires from './PULS/InitialisationAnneesScolaires/InitialisationAnneesScolaires';
import SouscriptionsAValider from './PULS/SouscriptionsAValider/SouscriptionsAValider';
import FondateursAValider from './PULS/FondateursAValider/FondateursAValider';
import EcolesAValider from './PULS/ValidationEcole/EcolesAValider'
import PersonnelConnexion from './PULS/PersonnelConnexion/PersonnelConnexion'
import ListeMatieresAdmin from './PULS/ListeMatieresAdmin/ListeMatieresAdmin'
import EcranSeances from './PULS/SeancesSaisies/EcranSeances';
import ProgressionPedagogique from './PULS/ProgressionPedagogique/ProgressionPedagogique';

import ProfilUtilisateur from './PULS/Profile/ ProfilUtilisateur';
import CahierDeTexte from './PULS/CahierDeTexte/CahierDeTexte'
import ModifierMotDePasse from './PULS/GestionMoTdePasse/ModifierMotDePasse';
import ModifierInfoPersonnelles from './PULS/GestionUserInfos/ModifierInfoPersonnelles';
import ListeEcoles from './PULS/MesEcoles/ListeEcoles';
import ConsultationEcoles from './PULS/MesEcoles/ConsultationEcoles';

import { getUserProfile } from "./hooks/userUtils";





const Layout = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDrawer, setShowDrawer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Liste des eventKeys qui correspondent à des menus déroulants (ne doivent pas naviguer)
  const dropdownMenuKeys = [
    'admin-panel',
    'quiz-panel',
    'courses-panel',
    'exercice-panel',
    'general'
  ];

  const { ecoleId: dynamicEcoleId, academicYearId: dynamicAcademicYearId, personnelInfo: personnelInfo } = usePulsParams();
  console.log('dynamicEcoleId', dynamicEcoleId);
  console.log('dynamicAcademicYearId', dynamicAcademicYearId);
  console.log('personnelInfo==>', personnelInfo);


  const hideFilterFor = ["Professeur", "SuperAdmin"];
  const showMatiereFilter = hideFilterFor.includes(getUserProfile()); // true si Fondateur ou SuperAdmin
  console.log('showMatiereFilter', showMatiereFilter);

  // Détecter la taille de l'écran
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  // Fonction pour gérer la navigation avec React Router
  const handlePageChange = (pageKey) => {
    console.log('Layout - handlePageChange appelé avec:', pageKey);

    // Ignorer les clics sur les menus déroulants
    if (dropdownMenuKeys.includes(pageKey)) {
      console.log('Layout - Menu déroulant ignoré:', pageKey);
      return;
    }

    // Ignorer la déconnexion (géré ailleurs)
    if (pageKey === 'logout') {
      console.log('Layout - Déconnexion ignorée');
      return;
    }

    const routeMap = {
      'dashboard': '/dashboard',
      'saveQuestionnaire': '/questions/create',
      'listQuestionnaire': '/questions',
      'saveQuizz': '/quiz/create',
      'listQuizz': '/quiz',
      'listDomaine': '/domaine',
      'listSubDomaine': '/listSubDomaine',
      'listLevelDomaine': '/levelDomaine',
      'listLesson': '/lesson',
      'saveLesson': '/lesson/create',
      'saveCours': '/courses/create',
      'listCours': '/courses',
      'saveExercice': '/exercises/create',
      'listExercice': '/exercises',
      'users': '/datatable',
      'RecrutementPersonnel': '/recrutement',
      'analytics': '/analytics',
      'reports': '/reports',
      'projects': '/projects',
      'documents': '/documents',
      'archives': '/archives',
      'calendar': '/calendar',
      'messages': '/messages',
      'notifications': '/notifications',
      'activity': '/activity',
      'my-profile': '/profile',
      'settings': '/settings',
      'teams': '/teams',
      'roles': '/roles',

      // ===========================
      // FONDATEUR
      // ===========================  
      'listeAjouterPanier': '/listeAjouterPanier',
      'listeProfils': '/listeProfils',
      'noteEtMoyenne': '/noteEtMoyenne',
      'bulletinScolaire': '/bulletinScolaire',
      'evaluation': '/evaluation',
      'importEvaluations': '/importEvaluations',
      'listeSalles': '/listeSalles',
      'listeClasses': '/listeClasses',
      'emploiDuTemps': '/emploiDuTemps',
      'messagesRecus': '/messagesRecus',
      'messagesEnvoye': '/messagesEnvoye',
      'classe-eleves': '/classe-eleves',
      'pv-evaluation': '/pv-evaluation',
      'evaluation-professeur': '/evaluation-professeur',
      'RecrutementAgent': '/RecrutementAgent',
      'MonPanier': '/MonPanier',
      'OffreEmploi': '/OffreEmploi',
      'enqueteRapideRentree': '/enqueteRapideRentree',
      'rapport': '/rapport',

      'monPersonel': '/monPersonel',
      'affectationProfilPersonel': '/affectationProfilPersonel',
      'saisirSeances': '/saisirSeances',
      'listeSeances': '/listeSeances',


      // ===========================
      // INSCRIPTION
      // ===========================
      'importerEleves': '/importerEleves',
      'identificationEleves': '/identificationEleves',
      'inscriptionAValider': '/inscriptionAValider',
      'listeElevesParClasse': '/listeElevesParClasse',
      'listeMatieres': '/listeMatieres',

      'listeCoefficients': '/listeCoefficients',
      'OvertureCloture': '/OvertureCloture',
      'professeur-matiere': '/professeur-matiere',
      'personnel-classe': '/personnel-classe',

      'desctiveUtilisaterur': '/desctiveUtilisaterur',
      'initialiserAnnee': '/initialiserAnnee',
      'validerPersonnels': '/validerPersonnels',

      'validerFondateur': '/validerFondateur',
      'listeFondateurvalider': '/listeFondateurvalider',
      'listeEcolesValidee': '/listeEcolesValidee',
      'listeEcolesAValidee': '/listeEcolesAValidee',
      'infosConnexion': '/infosConnexion',
      'listeMatiere': '/listeMatiere',

      'cartificatTravail': '/cartificatTravail',
      'ConsultationDesSeances': '/ConsultationDesSeances',
      'progressionPedagogique': '/progressionPedagogique',
      'profileUtilisateur': '/profileUtilisateur',
      'loginMotDePasse': '/loginMotDePasse',
      'miseAJoursInfo': '/miseAJoursInfo',
      'creerEcole': '/creerEcole',
      'consultationEcoles': '/consultationEcoles',
      
      'cahierDeTexte': '/cahierDeTexte',

    };

    const route = routeMap[pageKey];

    if (route) {
      console.log('Layout - Navigation vers:', route);
      navigate(route);
    } else {
      console.log('Layout - Route non trouvée pour:', pageKey, '- navigation vers dashboard');
      navigate('/dashboard');
    }

    if (isMobile) {
      closeDrawer();
    }
  };

  // Fonction pour déterminer la page active basée sur l'URL
  const getCurrentPageKey = () => {
    const path = location.pathname;

    if (path.includes('/exercises')) return 'listExercice';
    if (path.includes('/questions')) return 'listQuestionnaire';
    if (path.includes('/quiz')) return 'listQuizz';
    if (path.includes('/courses')) return 'listCours';
    if (path.includes('/datatable')) return 'users';
    if (path.includes('/recrutement')) return 'RecrutementPersonnel';

    return 'dashboard';
  };

  // Fonction pour obtenir le titre de la page
  const getPageTitle = () => {
    const path = location.pathname;


    const titles = {
      '/dashboard': 'Tableau de Bord',
      '/datatable': 'Gestion des Utilisateurs',
      '/recrutement': 'Recrutement Personnel',
      '/analytics': 'Analyses',
      '/reports': 'Rapports',
      '/projects': 'Projets',
      '/documents': 'Documents',
      '/archives': 'Archives',
      '/calendar': 'Calendrier',
      '/messages': 'Messages',
      '/notifications': 'Notifications',
      '/activity': 'Activité',
      '/profile': 'Mon Profil',
      '/profileUtilisateur': 'Mon Profil',
      '/loginMotDePasse': 'Modifier le mot de Passe',
      '/miseAJoursInfo': 'Modifier mes informations',
      '/creerEcole': 'Mes écoles',
      '/consultationEcoles': 'Consultation écoles',
      '/settings': 'Paramètres',
      '/teams': 'Équipes',
      '/roles': 'Rôles',
      '/listeSalles': 'Liste des Salles',
      '/listeClasses': 'Liste des Classes',
      '/emploiDuTemps': 'Emploi du Temps',
      '/messagesRecus': 'Messages Reçus',
      '/messagesEnvoye': 'Messages Envoyés',
      '/classe-eleves': 'Classe Elèves',
      '/pv-evaluation': 'PV Evaluation',
      '/evaluation-professeur': 'Evaluation Professeur',
      '/RecrutementAgent': 'Recrutement Agent',
      '/MonPanier': 'Mon Panier',
      '/OffreEmploi': 'Offre Emploi',
      '/enqueteRapideRentree': 'Enquête Rapide Rentrée',
      '/rapport': 'Rapport',
      '/monPersonel': 'Mon Personnel',
      '/affectationProfilPersonel': 'Affectation Profil',
      '/importEvaluations': 'Importation d\'Evaluations',
      '/saisirSeances': 'Saisir Séances',
      '/listeSeances': 'Liste des Séances',
      '/importerEleves': 'Importer des Elèves',
      '/identificationEleves': 'Identification Elèves',
      '/inscriptionAValider': 'Inscription à Valider',
      '/listeElevesParClasse': 'Liste des Elèves',
      '/listeMatieres': 'Liste des Matières',
      '/listeCoefficients': 'Liste des Coefficients',
      '/OvertureCloture': 'Ouverture / Clôture Année Scolaire',
      '/professeur-matiere': 'Liste des Professeurs par Matière',
      '/personnel-classe': 'Liste des Classes par Personnel',
      '/desctiveUtilisaterur': 'Désactivation de Profil',
      '/initialiserAnnee': 'Initialiser Année Scolaire',
      '/validerPersonnels': 'Valider Personnels',
      '/validerFondateur': 'Valider Fondateur',
      '/listeFondateurvalider': 'Liste Fondateurs Validés',
      '/listeEcolesValidee': 'Écoles Validées',
      '/listeEcolesAValidee': 'Écoles à Valider',
      '/infosConnexion': 'Informations de Connexion',
      '/listeMatiere': 'Liste des Matières',
      '/cartificatTravail': 'Certificats de Travail',
      '/ConsultationDesSeances': 'Consultation des Séances',
      '/progressionPedagogique': 'Progression Pédagogique',
      '/cahierDeTexte': 'Cahier de texte',


    };

    return titles[path] || 'Mon Dashboard Moderne';
  };

  // Fonction pour générer les breadcrumbs intelligents
  const getBreadcrumbItems = () => {
    const path = location.pathname;
    const items = [];


    // PULS - Section Fondateur
    if (path.includes('/listeProfils')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Profils", active: true });
    }
    else if (path.includes('/evaluation')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Évaluations", active: true });
    }
    else if (path.includes('/noteEtMoyenne')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Notes et Moyennes", active: true });
    }
    else if (path.includes('/bulletinScolaire')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Bulletins Scolaires", active: true });
    }
    else if (path.includes('/listeClasses')) {
      // items.push({ label: "PULS", href: "#" });
      items.push({ label: "Gestion des Classes", href: "#" });
      items.push({ label: "Liste des classes", active: true });
    }
    else if (path.includes('/listeSalles')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Salles", active: true });
    }
    else if (path.includes('/emploiDuTemps')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Emploi du Temps", active: true });
    }
    else if (path.includes('/messagesRecus')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Communication", href: "#" });
      items.push({ label: "Messages Reçus", active: true });
    }
    else if (path.includes('/messagesEnvoye')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Communication", href: "#" });
      items.push({ label: "Messages Envoyés", active: true });
    }
    else if (path.includes('/classe-eleves')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Élèves", active: true });
    }
    else if (path.includes('/pv-evaluation')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "PV Évaluations", active: true });
    }
    else if (path.includes('/evaluation-professeur')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Évaluation Professeurs", active: true });
    }
    else if (path.includes('/monPersonel')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Mon Personnel", active: true });
    }
    else if (path.includes('/saisirSeances')) {
      //items.push({ label: "PULS", href: "#" });
      //items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Séances", active: true });
    }

    else if (path.includes('/listeSeances')) {
      //items.push({ label: "PULS", href: "#" });
      //items.push({ label: "Fondateur", href: "#" });
      items.push({ label: "Liste Séances", active: true });
    }



    // PULS - Section Inscription
    else if (path.includes('/importerEleves')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Inscription", href: "#" });
      items.push({ label: "Import Élèves", active: true });
    }
    else if (path.includes('/identificationEleves')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Inscription", href: "#" });
      items.push({ label: "Identification", active: true });
    }
    else if (path.includes('/inscriptionAValider')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Inscription", href: "#" });
      items.push({ label: "À Valider", active: true });
    }
    else if (path.includes('/listeElevesParClasse')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Inscription", href: "#" });
      items.push({ label: "Élèves par Classe", active: true });
    }

    // PULS - Section Paramétrage
    else if (path.includes('/listeMatieres')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Paramétrage", href: "#" });
      items.push({ label: "Matières", active: true });
    }
    else if (path.includes('/listeCoefficients')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Paramétrage", href: "#" });
      items.push({ label: "Coefficients", active: true });
    }
    else if (path.includes('/professeur-matiere')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Paramétrage", href: "#" });
      items.push({ label: "Professeurs-Matières", active: true });
    }
    else if (path.includes('/personnel-classe')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Paramétrage", href: "#" });
      items.push({ label: "Personnel-Classes", active: true });
    }
    else if (path.includes('/OvertureCloture')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Paramétrage", href: "#" });
      items.push({ label: "Années Scolaires", active: true });
    }

    // PULS - Section Administration
    else if (path.includes('/desctiveUtilisaterur')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Administration", href: "#" });
      items.push({ label: "Désactiver Profils", active: true });
    }
    else if (path.includes('/validerPersonnels')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Administration", href: "#" });
      items.push({ label: "Valider Personnels", active: true });
    }
    else if (path.includes('/validerFondateur')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Administration", href: "#" });
      items.push({ label: "Valider Fondateurs", active: true });
    }
    else if (path.includes('/listeEcolesValidee') || path.includes('/listeEcolesAValidee')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Administration", href: "#" });
      items.push({ label: "Validation Écoles", active: true });
    }
    else if (path.includes('/infosConnexion')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Administration", href: "#" });
      items.push({ label: "Connexions", active: true });
    }
    else if (path.includes('/listeMatiere')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Administration", href: "#" });
      items.push({ label: "Matières Admin", active: true });
    }
    else if (path.includes('/cartificatTravail')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Administration", href: "#" });
      items.push({ label: "Certificats", active: true });
    }
    else if (path.includes('/ConsultationDesSeances')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Administration", href: "#" });
      items.push({ label: "Consultation Séances", active: true });
    }

    // Autres routes générales
    else if (path.includes('/datatable')) {
      items.push({ label: "Gestion", href: "#" });
      items.push({ label: "Utilisateurs", active: true });
    }
    else if (path.includes('/recrutement')) {
      items.push({ label: "RH", href: "#" });
      items.push({ label: "Recrutement", active: true });
    }
    else if (path.includes('/enqueteRapideRentree')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Enquêtes", href: "#" });
      items.push({ label: "Rentrée Rapide", active: true });
    }
    else if (path.includes('/rapport')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Rapports", active: true });
    }

    else if (path.includes('/progressionPedagogique')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Progression Pédagogique", active: true });
    }

    else if (path.includes('/profileUtilisateur')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Profile Utilisateur", active: true });
    }

    else if (path.includes('/loginMotDePasse')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Modifier le mot dee Passe", active: true });
    }

    else if (path.includes('/miseAJoursInfo')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Modifier mes informations", active: true });
    }

    else if (path.includes('/creerEcole')) {
      items.push({ label: "Ajouter écoles", active: true });
    }

    else if (path.includes('/consultationEcoles')) {
      items.push({ label: "Consultation écoles", active: true });
    }


    else if (path.includes('/cahierDeTexte')) {
      items.push({ label: "PULS", href: "#" });
      items.push({ label: "Cahier de texte", active: true });
    }






    return items;
  };


  const userProfil = localStorage.getItem("userProfil");

  return (
    <Container className="dashboard-container">
      {/* Header avec menu hamburger pour mobile */}
      {isMobile && (
        <Header className="mobile-header">
          <Navbar
            appearance="inverse"
            className="navbar-custom"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderBottom: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Nav>
              <Nav.Item>
                <IconButton
                  icon={<MenuIcon />}
                  onClick={toggleDrawer}
                  appearance="subtle"
                  size="lg"
                  className="menu-button text-primary"
                />
              </Nav.Item>
            </Nav>
            <Nav pullRight>
              <Nav.Item
                className="brand-mobile fw-bold text-dark"
                style={{ fontSize: '16px' }}
              >
                {getPageTitle()}
              </Nav.Item>
              <Nav.Item>
                <FlexboxGrid align="middle" justify="end">
                  <FlexboxGrid.Item>
                    <ThemeToggle size="sm" />
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={{ marginLeft: '12px' }}>
                    <UserMenu onLogout={onLogout} />
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              </Nav.Item>
            </Nav>
          </Navbar>
        </Header>
      )}

      <Container className="main-container">
        {/* Sidebar permanente pour desktop */}
        {!isMobile && (
          <RSuiteSidebar className="desktop-sidebar" id={userProfil} >
            <Sidebar
              onItemClick={handlePageChange}
              activeKey={getCurrentPageKey()}
            />
          </RSuiteSidebar>
        )}

        {/* Drawer pour mobile */}
        <Drawer
          open={showDrawer}
          onClose={closeDrawer}
          placement="left"
          size="xs"
          className="mobile-drawer"
        >
          <Drawer.Header>
            <Drawer.Title>Menu Navigation</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="drawer-body">
            <Sidebar
              onItemClick={handlePageChange}
              activeKey={getCurrentPageKey()}
            //allMenuSections={allMenuSections}
            />
          </Drawer.Body>
        </Drawer>

        {/* Contenu principal */}
        <Content className="main-content">
          {/* Nouveau TopBar pour desktop */}
          {!isMobile && (
            <LightTopBar
              pageTitle={getPageTitle()}
              onLogout={onLogout}
              userInfo={{
                name: personnelInfo?.nom || personnelInfo?.name || "Utilisateur",
                role: userProfil || "Membre",
                email: personnelInfo?.email || "user@example.com",
                avatar: personnelInfo?.avatar || ""
              }}
              breadcrumbItems={getBreadcrumbItems()}
            />
          )}

          <div className="content-body">
            <Routes>
              {/* Route par défaut vers Dashboard */}

              {/* <Route path="/dashboard" element={<Dashboard />} /> */}
              {/* <Route path="/" element={<Dashboard />} /> */}

              {userProfil === "Fondateur" && (
                <Route path="/dashboard" element={<Dashboard2 />} />
              )}
              {userProfil === "Professeur" && (
                <Route path="/dashboard" element={<Dashboard />} />
              )}

              {/* Autres routes */}
              <Route path="/datatable" element={<DataTable />} />
              <Route path="/recrutement" element={<RecrutementPersonnel />} />

              {/* ===========================
                   FONDATEUR
                   =========================== */}
              <Route path="/listeAjouterPanier" element={<AjouterPanier />} />
              <Route path="/listeProfils" element={<ListeProfils />} />
              <Route path="/RecrutementAgent" element={<RecruterAgent />} />
              <Route path="/noteEtMoyenne" element={<NoteEtMoyenne profil={getUserProfile()} showMatiereFilter={showMatiereFilter} />} />
              <Route path="/evaluation" element={<Evaluation />} />
              <Route path="/importEvaluations/" element={<ImportNotes />} />
              <Route path="/listeSalles" element={<ListeSalles />} />
              <Route path="/listeClasses" element={<ListeClasses />} />
              <Route path="/emploiDuTemps" element={<ListeEmploiDuTemps primaryColor="#8b5cf6" />} />
              <Route path="/messagesRecus" element={<ListeMessages typeMessage="reception" />} />
              <Route path="/messagesEnvoye" element={<ListeMessages typeMessage="envoie" />} />
              <Route path="/OffreEmploi" element={<ListeOffresEmploi />} />

              <Route path="/cahierDeTexte" element={<CahierDeTexte primaryColor="#f59e0b" />} />

              <Route path="/bulletinScolaire" element={<BulletinScolaire />} />

              <Route path="/classe-eleves" element={<Eleves />} />
              <Route path="/pv-evaluation" element={<PvEvaluations />} />
              <Route path="/evaluation-professeur" element={<EvaluationProfesseur profProfilId={8} />} />
              <Route path="/MonPanier" element={<MonPanier />} />

              <Route path="/monPersonel" element={<ListePersonnel typeDeListe="listePersonnel" />} />
              <Route path="/affectationProfilPersonel" element={<ListePersonnel typeDeListe="affectationPersonel" />} />

              <Route path="/saisirSeances" element={<ListeSeancesSaisies />} />
              <Route path="/listeSeances" element={<ListeSeancesSaisies />} />
              <Route path="/evaluations/detail/:evaluationCode" element={<EvaluationDetail />} />

              {/* ===========================
                   INSCRIPTION
                   =========================== */}
              <Route path="/importerEleves" element={<ImportEleves />} />
              <Route path="/inscriptionAValider" element={<InscriptionsAValider />} />
              <Route path="/listeElevesParClasse" element={<ListeElevesParClasse />} />
              <Route path="/identificationEleves" element={<IdentificationEleves />} />

              {/* ===========================
                   PARAMETRAGE
                   =========================== */}
              <Route path="/listeMatieres" element={<ListeMatieres />} />
              <Route path="/listeCoefficients" element={<CoefficientsMatieres />} />
              <Route path="/OvertureCloture" element={<AnneesScolaires />} />

              <Route path="/professeur-matiere" element={<ProfesseurMatiere />} />
              <Route path="/personnel-classe" element={<PersonnelFonction />} />

              {/* ===========================
                   ENQUETE RAPIDE
                   =========================== */}
              <Route path="/enqueteRapideRentree" element={<EnqueteRapideRentree AcademicYearId={dynamicAcademicYearId} />} />
              <Route path="/rapport" element={<EcranRapports />} />

              {/* ===========================
                   ESPACE CANDIDAT
                   =========================== */}
              <Route path="/profileUtilisateur" element={< ProfilUtilisateur userId={personnelInfo?.candidatDetails.candidatid} />} />
              <Route path="/loginMotDePasse" element={< ModifierMotDePasse />} />
              <Route path="/miseAJoursInfo" element={< ModifierInfoPersonnelles  mode="edit"  userId={personnelInfo?.candidatDetails.candidatid} />} />
              <Route path="/creerEcole" element={< ListeEcoles mode={"candidatEcoleInscription"} />} />
              <Route path="/consultationEcoles" element={<ConsultationEcoles />} />

              {/* ===========================
                   ADMIN
                   =========================== */}
              <Route path="/desctiveUtilisaterur" element={<DesactiverProfil />} />
              <Route path="/InitialiserAnnee" element={<InitialisationAnneesScolaires />} />
              <Route path="/validerPersonnels" element={<SouscriptionsAValider />} />
              <Route path="/validerFondateur" element={<FondateursAValider typeValidation="EN ATTENTE" />} />
              <Route path="/listeFondateurvalider" element={<FondateursAValider typeValidation="VALIDEE" />} />
              <Route path="/listeEcolesValidee" element={<EcolesAValider typeValidation="VALIDEE" />} />
              <Route path="/listeEcolesAValidee" element={<EcolesAValider typeValidation="EN_ATTENTE" />} />
              <Route path="/infosConnexion" element={<PersonnelConnexion />} />
              <Route path="/listeMatiere" element={<ListeMatieresAdmin />} />
              <Route path="/cartificatTravail" element={<CertificatTravail />} />
              <Route path="/ConsultationDesSeances" element={<EcranSeances />} />
              <Route path="/progressionPedagogique" element={<ProgressionPedagogique />} />

            </Routes>
          </div>
        </Content>
      </Container>
    </Container>
  );
};

export default Layout;