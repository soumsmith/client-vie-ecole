import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { Container, Header, Content, Drawer, IconButton, Nav, Navbar, Sidebar as RSuiteSidebar, FlexboxGrid } from 'rsuite';
import MenuIcon from '@rsuite/icons/Menu';
import { allMenuSections } from './menuConfig';
import useLoginData from './Menu/useLoginData';

// ⭐ Import du composant de protection des routes
import ProtectedRoute from './ProtectedRoute';

// ⭐ Import de la page 404
import NotFound from './NotFound';

// Import du nouveau TopBar
import LightTopBar from './LightTopBar';

import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import DashboardEnseignementSecondaireGenerale from './DashboardEnseignementSecondaireGenerale';
import DashboardPrimaire from './DashboardPrimaire';
import BREVETDETECHNICIENBT from './BREVETDETECHNICIENBT';
import EnseignementSuperieur from './EnseignementSuperieur';
import EnseignementSecondaireTechnique from './EnseignementSecondaireTechnique';

import KidsSchoolDashboard from './KidsSchoolDashboard';
import DashboardNiveauMaternelle from './DashboardNiveauMaternelle';
import DefaultDashboard from './DefaultDashboard';


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
import EvaluationsPeriodes from './PULS/PeriodesEvaluations/EvaluationsPeriodes';
import ListeOffresEmploi from './PULS/OffreEmploi/ListeOffresEmploi';

import ListePersonnel from './PULS/MonPersonnelAffectation/ListePersonnel';
import ListeSeancesSaisies from './PULS/SeancesSaisies/ListeSeancesSaisies';

import CertificatTravail from './PULS/CertificatTravail/CertificatTravail';
import SeanceManagement from './PULS/SeancesSaisies/OuvertureSeance/SeanceManagement';

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

  const { handleLogout } = useLoginData();

  // Liste des eventKeys qui correspondent à des menus déroulants (ne doivent pas naviguer)
  const dropdownMenuKeys = [
    'admin-panel',
    'quiz-panel',
    'courses-panel',
    'exercice-panel',
    'general'
  ];

  const { ecoleId: dynamicEcoleId, academicYearId: dynamicAcademicYearId, personnelInfo: personnelInfo } = usePulsParams();
  const academicYear = JSON.parse(localStorage.getItem('academicYearMain'));

  console.log('dynamicEcoleId', dynamicEcoleId);
  console.log('dynamicAcademicYearId', dynamicAcademicYearId);
  console.log('personnelInfo==>', personnelInfo);

  const hideFilterFor = ["Professeur", "SuperAdmin"];
  const showMatiereFilter = hideFilterFor.includes(getUserProfile());
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

  // [Le reste des fonctions handlePageChange, getCurrentPageKey, getPageTitle, getBreadcrumbItems, getDashboardComponent restent identiques]
  // ... (je les ai omises pour la clarté, mais elles sont dans le code original)

  const userProfil = getUserProfile();

  return (
    <Container className="layout-container">
      <Container className="main-container">
        {/* Barre de navigation mobile */}
        {isMobile && (
          <Navbar className="mobile-navbar">
            <Nav>
              <Nav.Item icon={<MenuIcon />} onClick={toggleDrawer}>Menu</Nav.Item>
            </Nav>
            <Nav pullRight>
              <UserMenu onLogout={handleLogout} />
              <ThemeToggle />
            </Nav>
          </Navbar>
        )}

        {/* Sidebar fixe pour desktop */}
        {!isMobile && (
          <RSuiteSidebar className="desktop-sidebar" id={userProfil} >
            <Sidebar
              onItemClick={handlePageChange}
              activeKey={getCurrentPageKey()}
            />
          </RSuiteSidebar>
        )}

        {/* Drawer pour mobile */}
        <Drawer open={showDrawer} onClose={closeDrawer} placement="left" size="xs" className="mobile-drawer">
          <Drawer.Header>
            <Drawer.Title>Menu Navigation</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="drawer-body">
            <Sidebar onItemClick={handlePageChange} activeKey={getCurrentPageKey()} />
          </Drawer.Body>
        </Drawer>

        {/* Contenu principal */}
        <Content className="main-content">
          {!isMobile && (
            <LightTopBar
              pageTitle={getPageTitle()}
              onLogout={handleLogout}
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
              {/* ⭐ TOUTES LES ROUTES SONT MAINTENANT PROTÉGÉES */}
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    {getDashboardComponent(academicYear?.niveauEnseignement?.id)}
                  </ProtectedRoute>
                } 
              />

              <Route path="/listeAjouterPanier" element={<ProtectedRoute><AjouterPanier /></ProtectedRoute>} />
              <Route path="/listeProfils" element={<ProtectedRoute><ListeProfils /></ProtectedRoute>} />
              <Route path="/RecrutementAgent" element={<ProtectedRoute><RecruterAgent /></ProtectedRoute>} />
              <Route path="/noteEtMoyenne" element={<ProtectedRoute><NoteEtMoyenne profil={getUserProfile()} showMatiereFilter={showMatiereFilter} /></ProtectedRoute>} />
              <Route path="/evaluation" element={<ProtectedRoute><Evaluation /></ProtectedRoute>} />
              <Route path="/importEvaluations/" element={<ProtectedRoute><ImportNotes /></ProtectedRoute>} />
              <Route path="/listeSalles" element={<ProtectedRoute><ListeSalles /></ProtectedRoute>} />
              <Route path="/listeClasses" element={<ProtectedRoute><ListeClasses /></ProtectedRoute>} />
              <Route path="/emploiDuTemps" element={<ProtectedRoute><ListeEmploiDuTemps primaryColor="#8b5cf6" /></ProtectedRoute>} />
              <Route path="/messagesRecus" element={<ProtectedRoute><ListeMessages typeMessage="reception" /></ProtectedRoute>} />
              <Route path="/messagesEnvoye" element={<ProtectedRoute><ListeMessages typeMessage="envoie" /></ProtectedRoute>} />
              <Route path="/OffreEmploi" element={<ProtectedRoute><ListeOffresEmploi /></ProtectedRoute>} />
              <Route path="/cahierDeTexte" element={<ProtectedRoute><CahierDeTexte primaryColor="#f59e0b" /></ProtectedRoute>} />
              <Route path="/bulletinScolaire" element={<ProtectedRoute><BulletinScolaire /></ProtectedRoute>} />
              <Route path="/classe-eleves" element={<ProtectedRoute><Eleves /></ProtectedRoute>} />
              <Route path="/pv-evaluation" element={<ProtectedRoute><PvEvaluations /></ProtectedRoute>} />
              <Route path="/evaluation-professeur" element={<ProtectedRoute><EvaluationProfesseur profProfilId={8} /></ProtectedRoute>} />
              <Route path="/MonPanier" element={<ProtectedRoute><MonPanier /></ProtectedRoute>} />
              <Route path="/definirPeriodeEvaluation" element={<ProtectedRoute><EvaluationsPeriodes /></ProtectedRoute>} />
              <Route path="/ouvertureSeances" element={<ProtectedRoute><SeanceManagement /></ProtectedRoute>} />
              <Route path="/monPersonel" element={<ProtectedRoute><ListePersonnel typeDeListe="listePersonnel" tableTitle="Liste du personel" /></ProtectedRoute>} />
              <Route path="/affectationProfilPersonel" element={<ProtectedRoute><ListePersonnel typeDeListe="affectationPersonel" tableTitle="Liste du personel à affecter à un profil" /></ProtectedRoute>} />
              <Route path="/saisirSeances" element={<ProtectedRoute><ListeSeancesSaisies /></ProtectedRoute>} />
              <Route path="/listeSeances" element={<ProtectedRoute><ListeSeancesSaisies /></ProtectedRoute>} />
              <Route path="/evaluations/detail/:evaluationCode" element={<ProtectedRoute><EvaluationDetail /></ProtectedRoute>} />
              
              <Route path="/importerEleves" element={<ProtectedRoute><ImportEleves /></ProtectedRoute>} />
              <Route path="/inscriptionAValider" element={<ProtectedRoute><InscriptionsAValider /></ProtectedRoute>} />
              <Route path="/listeElevesParClasse" element={<ProtectedRoute><ListeElevesParClasse /></ProtectedRoute>} />
              <Route path="/identificationEleves" element={<ProtectedRoute><IdentificationEleves /></ProtectedRoute>} />
              
              <Route path="/listeMatieres" element={<ProtectedRoute><ListeMatieres /></ProtectedRoute>} />
              <Route path="/listeCoefficients" element={<ProtectedRoute><CoefficientsMatieres /></ProtectedRoute>} />
              <Route path="/OvertureCloture" element={<ProtectedRoute><AnneesScolaires /></ProtectedRoute>} />
              <Route path="/professeur-matiere" element={<ProtectedRoute><ProfesseurMatiere /></ProtectedRoute>} />
              <Route path="/personnel-classe" element={<ProtectedRoute><PersonnelFonction /></ProtectedRoute>} />
              
              <Route path="/enqueteRapideRentree" element={<ProtectedRoute><EnqueteRapideRentree AcademicYearId={dynamicAcademicYearId} /></ProtectedRoute>} />
              <Route path="/rapport" element={<ProtectedRoute><EcranRapports /></ProtectedRoute>} />
              
              <Route path="/profileUtilisateur" element={<ProtectedRoute><ProfilUtilisateur userId={personnelInfo?.candidatDetails.candidatid} /></ProtectedRoute>} />
              <Route path="/loginMotDePasse" element={<ProtectedRoute><ModifierMotDePasse /></ProtectedRoute>} />
              <Route path="/miseAJoursInfo" element={<ProtectedRoute><ModifierInfoPersonnelles mode="edit" userId={personnelInfo?.candidatDetails.candidatid} /></ProtectedRoute>} />
              <Route path="/creerEcole" element={<ProtectedRoute><ListeEcoles mode={"candidatEcoleInscription"} /></ProtectedRoute>} />
              <Route path="/consultationEcoles" element={<ProtectedRoute><ConsultationEcoles /></ProtectedRoute>} />
              
              <Route path="/desctiveUtilisaterur" element={<ProtectedRoute><DesactiverProfil /></ProtectedRoute>} />
              <Route path="/InitialiserAnnee" element={<ProtectedRoute><InitialisationAnneesScolaires /></ProtectedRoute>} />
              <Route path="/validerPersonnels" element={<ProtectedRoute><SouscriptionsAValider /></ProtectedRoute>} />
              <Route path="/validerFondateur" element={<ProtectedRoute><FondateursAValider typeValidation="EN ATTENTE" /></ProtectedRoute>} />
              <Route path="/listeFondateurvalider" element={<ProtectedRoute><FondateursAValider typeValidation="VALIDEE" /></ProtectedRoute>} />
              <Route path="/listeEcolesValidee" element={<ProtectedRoute><EcolesAValider typeValidation="VALIDEE" /></ProtectedRoute>} />
              <Route path="/listeEcolesAValidee" element={<ProtectedRoute><EcolesAValider typeValidation="EN_ATTENTE" /></ProtectedRoute>} />
              <Route path="/infosConnexion" element={<ProtectedRoute><PersonnelConnexion /></ProtectedRoute>} />
              <Route path="/listeMatiere" element={<ProtectedRoute><ListeMatieresAdmin /></ProtectedRoute>} />
              <Route path="/cartificatTravail" element={<ProtectedRoute><CertificatTravail /></ProtectedRoute>} />
              <Route path="/ConsultationDesSeances" element={<ProtectedRoute><EcranSeances /></ProtectedRoute>} />
              <Route path="/progressionPedagogique" element={<ProtectedRoute><ProgressionPedagogique /></ProtectedRoute>} />

              {/* ⭐ ROUTE 404 - PAGE NON TROUVÉE (DOIT ÊTRE LA DERNIÈRE) */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Content>
      </Container>
    </Container>
  );
};

export default Layout;