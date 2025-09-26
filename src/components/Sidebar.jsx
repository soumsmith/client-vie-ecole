import React, { useState, useEffect, useMemo } from "react";
import { Sidenav, Nav, Divider } from "rsuite";
import { useLocation } from 'react-router-dom';
import DashboardIcon from "@rsuite/icons/Dashboard";
import GroupIcon from "@rsuite/icons/Peoples";
import SettingIcon from "@rsuite/icons/Setting";
import BarChartIcon from "@rsuite/icons/BarChart";
import DocPassIcon from "@rsuite/icons/DocPass";
import CalendarIcon from "@rsuite/icons/Calendar";
import MessageIcon from "@rsuite/icons/Message";
import ExitIcon from "@rsuite/icons/Exit";
import TableIcon from "@rsuite/icons/Table";



const sidebarStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '260px',
    backgroundColor: '#fff',
    borderRight: '1px solid #e5e5e7',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000,
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: '8px 20px',
    borderBottom: '1px solid #e5e5e7',
    flexShrink: 0,
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'thin',
    scrollbarColor: '#ccc transparent',
  },
  footer: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e5e7',
    padding: '16px 20px',
    flexShrink: 0,
    zIndex: 10,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    flexShrink: 0,
  },
  userName: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#333',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '12px',
    color: '#6c757d',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileIndicator: {
    //backgroundColor: '#f8f9fa',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
    marginBottom: '12px',
  },
};

// Configuration JSON des menus avec sections et profils
const allMenuSections = [
  {
    type: "section",
    title: "Tableau de Bord",
    profiles: ["Admin", "Professeur", "user", "Fondateur"],
    items: [
      {
        type: "item",
        eventKey: "dashboard",
        icon: "DashboardIcon",
        title: "Tableau de bord",
        profiles: ["Admin", "Professeur", "user", "Fondateur"],
      },
    ],
  },



  // ===========================
  // FONDATEUR
  // ===========================
  {
    type: "section",
    title: localStorage.getItem("userProfil"),
    profiles: ["admin", "Fondateur", "Professeur"],
    items: [
      {
        type: "item",
        eventKey: "listeAjouterPanier",
        icon: "TableIcon",
        title: "Ajouter au panier",
        profiles: ["admin", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "MonPanier",
        icon: "SettingIcon",
        title: "Mon panier",
        profiles: ["admin", "Fondateur"],
      },

      {
        type: "item",
        eventKey: "HeureAbsences",
        icon: "SettingIcon",
        title: "Heure Absences",
        profiles: ["admin", "Professeur"],
      },

      {
        type: "menu",
        eventKey: "general",
        icon: "GroupIcon",
        title: "Ma Messagerie",
        profiles: ["admin", "Professeur", "Fondateur"],
        children: [
          {
            type: "item",
            eventKey: "messagesRecus",
            icon: "MessageIcon",
            title: "Messages reçus",
            profiles: ["admin", "Professeur", "Fondateur"],
          },
          {
            eventKey: "messagesEnvoye",
            title: "Messages envoyés",
            profiles: ["admin", "Fondateur", "Professeur"],
          },
        ],
      },
      // {
      //   type: "item",
      //   eventKey: "OffreEmploi",
      //   icon: "GroupIcon",
      //   title: "Liste des offres d'emploi",
      //   profiles: ["admin", "manager", "Fondateur"],
      // },
      // {
      //   type: "item",
      //   eventKey: "listeCandidat",
      //   icon: "GroupIcon",
      //   title: "Liste des candidat par publication",
      //   profiles: ["admin", "manager", "Fondateur"],
      // },
      {
        type: "item",
        eventKey: "RecrutementAgent",
        icon: "SettingIcon",
        title: "Recruté un Agent",
        profiles: ["admin", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "monPersonel",
        icon: "GroupIcon",
        title: "Mon personnel",
        profiles: ["admin", "manager", "Fondateur"],
      },

      {
        type: "item",
        eventKey: "affectationProfilPersonel",
        icon: "GroupIcon",
        title: "Affecter un profil",
        profiles: ["admin", "manager", "Fondateur"],
      },

      {
        type: "item",
        eventKey: "emploiDuTemps",
        icon: "CalendarIcon",
        title: "Emploi du temps",
        profiles: ["admin", "Professeur"],
      },
    ],
  },


  /* AVOIR ET DECOMMENTER*/
  //Affecter un profil 
  // {
  //   type: "item",
  //   eventKey: "listeProfils",
  //   icon: "GroupIcon",
  //   title: "Liste des profils",
  //   profiles: ["admin", "manager", "Fondateur"],
  // },

  // ===========================
  // GESTION DES CLASSES ET MOYENNES
  // ===========================

  {
    type: "section",
    title: "Gestion des classes et moyennes",
    profiles: ["admin", "Professeur", "user", "Fondateur"],
    items: [
      {
        type: "menu",
        eventKey: "classe-panel",
        icon: "GroupIcon",
        title: "Gestion des classes",
        profiles: ["admin", "Professeur", "Fondateur"],
        children: [
          {
            eventKey: "listeClasses",
            title: "Liste des classes",
            profiles: ["admin", "manager", "Fondateur"],
          },
          {
            eventKey: "listeSeances",
            title: "Liste des Séances",
            profiles: ["admin", "Professeur", "Fondateur"],
          },
          {
            eventKey: "saisirSeances",
            title: "Saisir séances",
            profiles: ["admin", "manager", "Fondateur"],
          },
          {
            eventKey: "ouvertureSeances",
            title: "Ouverture de seances",
            profiles: ["admin", "manager", "Fondateur"],
          },

          // Emploi du temps
          {
            eventKey: "emploiDuTemps",
            title: "Emploi du temps",
            profiles: ["admin", "manager", "Fondateur"],
          },
          {
            eventKey: "cahierDeTexte",
            title: "Cahier de texte",
            profiles: ["admin", "manager", "Fondateur"],
          },
          // Journal pointage Badgeuse
          {
            eventKey: "journalPointage",
            title: "Journal pointage",
            profiles: ["admin", "manager", "Fondateur"],
          },
          // Enrollement Badgeuse
          {
            eventKey: "enrollementBadgeuse",
            title: "Enrollement Badgeuse",
            profiles: ["admin", "manager", "Fondateur"],
          },
        ],
      },
      // ===========================
      // Evaluation
      // ===========================

      {
        type: "menu",
        eventKey: "evaluation-panel",
        icon: "GroupIcon",
        title: "Evaluation",
        profiles: ["admin", "Professeur", "Fondateur"],
        children: [
          {
            type: "item",
            eventKey: "evaluation",
            icon: "BarChartIcon",
            title: "Evaluation",
            profiles: ["admin", "Professeur", "Fondateur"],
          },

          // { eventKey: 'definirEvaluations', title: 'Définir évaluations', profiles: ['admin', 'manager', 'Fondateur'] },
          {
            type: "item",
            eventKey: "evaluation-professeur",
            icon: "TableIcon",
            title: "Statistiques exécution",
            profiles: ["admin", "manager", "Fondateur"],
          },
          {
            eventKey: "definirPeriodeEvaluation",
            title: "Définir période d'évaluation",
            profiles: ["admin", "manager", "Fondateur"],
          },
          // PV Evaluation
          {
            type: "item",
            eventKey: "pv-evaluation",
            icon: "TableIcon",
            title: "PV Evaluation",
            profiles: ["admin", "Professeur", "Fondateur"],
          },
        ],
      },

      {
        type: "menu",
        eventKey: "moyenne-et-note-panel",
        icon: "GroupIcon",
        title: "Note et Moyenne",
        profiles: ["admin", "Professeur", "Fondateur"],
        children: [
          // {
          //   type: "item",
          //   eventKey: "evaluation",
          //   icon: "BarChartIcon",
          //   title: "Evaluation",
          //   profiles: ["admin", "manager", "Fondateur"],
          // },

          // { eventKey: 'definirEvaluations', title: 'Définir évaluations', profiles: ['admin', 'manager', 'Fondateur'] },
          // {
          //   type: "item",
          //   eventKey: "evaluation-professeur",
          //   icon: "TableIcon",
          //   title: "Statistiques exécution",
          //   profiles: ["admin", "manager", "Fondateur"],
          // },
          // {
          //   eventKey: "definirPeriodeEvaluation",
          //   title: "Définir période d'évaluation",
          //   profiles: ["admin", "manager", "Fondateur"],
          // },
          // PV Evaluation
          // {
          //   type: "item",
          //   eventKey: "pv-evaluation",
          //   icon: "TableIcon",
          //   title: "PV Evaluation",
          //   profiles: ["admin", "manager", "Fondateur"],
          // },
          {
            type: "item",
            eventKey: "noteEtMoyenne",
            icon: "BarChartIcon",
            title: "Note et moyenne",
            profiles: ["admin", "Professeur", "Fondateur"],
          },
        ],
      },



      // Importer Evaluation
      {
        type: "item",
        eventKey: "importEvaluations",
        icon: "BarChartIcon",
        title: "Importer Evaluation",
        profiles: ["admin", "manager", "Fondateur"],
      },
      // {
      //   type: 'item',
      //   eventKey: 'noteEtMoyenne',
      //   icon: 'BarChartIcon',
      //   title: 'Note et moyenne',
      //   profiles: ['admin', 'manager', 'Fondateur']
      // },
      {
        type: "item",
        eventKey: "bulletinScolaire",
        icon: "BarChartIcon",
        title: "Ajuster moyennes",
        profiles: ["admin", "manager", "Fondateur"],
      },
    ],
  },

  // Menu spécial prof
  //=======================
  //MENU PROFESSEURE
  //=======================

  // {
  //   type: "item",
  //   eventKey: "evaluation",
  //   icon: "BarChartIcon",
  //   title: "Evaluation",
  //   profiles: ["Professeur"],
  // },

  // {
  //   type: "item",
  //   eventKey: "pv-evaluation",
  //   icon: "TableIcon",
  //   title: "PV Evaluation",
  //   profiles: ["admin", "Professeur"],
  // },

  // ===========================
  // AFFECTATIONS
  // ===========================

  {
    type: "section",
    title: "Affectations",
    profiles: ["admin", "manager", "user", "Fondateur"],
    items: [
      {
        type: "item",
        eventKey: "classe-eleves",
        icon: "TableIcon",
        title: "Classe Elèves",
        profiles: ["admin", "manager", "Fondateur"],
      },

      // Professeur - Matiere
      {
        type: "item",
        eventKey: "professeur-matiere",
        icon: "TableIcon",
        title: "Professeur - Matiere",
        profiles: ["admin", "manager", "Fondateur"],
      },
      // Personnel - Classe
      {
        type: "item",
        eventKey: "personnel-classe",
        icon: "TableIcon",
        title: "Personnel - Classe",
        profiles: ["admin", "manager", "Fondateur"],
      },
    ],
  },

  //====================
  //CANDIDAT
  //====================

  {
    type: "section",
    title: "Espace Candidat",
    profiles: ["Candidat", "Candidat-Fondateur", "Candidat-Professeur"],
    items: [
      {
        type: "item",
        eventKey: "postulerOffre",
        icon: "TableIcon",
        title: "Postuler a une offre",
        profiles: [""],
      },

      {
        type: "item",
        eventKey: "demandeOffre",
        icon: "TableIcon",
        title: "Mes demandes d'offres",
        profiles: [""],
      },

      {
        type: "item",
        eventKey: "loginMotDePasse",
        icon: "TableIcon",
        title: "Login & mot de passe",
        profiles: ["Candidat", "Candidat-Fondateur", "Candidat-Professeur"],
      },

      {
        type: "item",
        eventKey: "mesEcoles",
        icon: "TableIcon",
        title: "Mes écoles",
        profiles: ["Candidat-Fondateur"],
      },

      {
        type: "item",
        eventKey: "mesDocuments",
        icon: "TableIcon",
        title: "Mes documents",
        profiles: [""],
      },

      // Professeur - Matiere
      {
        type: "item",
        eventKey: "profileUtilisateur",
        icon: "TableIcon",
        title: "Mon profil",
        profiles: ["Candidat", "Candidat-Fondateur", "Candidat-Professeur"],
      },
      // Personnel - Classe
      {
        type: "item",
        eventKey: "miseAJoursInfo",
        icon: "TableIcon",
        title: "modifier mes infos personnelles ",
        profiles: ["Candidat", "Candidat-Fondateur", "Candidat-Professeur"],
      },
    ],
  },

  // ===========================
  // INSCRIPTION
  // ===========================

  {
    type: "section",
    title: "Inscription",
    profiles: ["admin", "manager", "user", "Fondateur"],
    items: [
      // Importer des Elèves
      {
        type: "item",
        eventKey: "importerEleves",
        icon: "DocPassIcon",
        title: "Importer des Elèves",
        profiles: ["admin", "manager", "user", "Fondateur"],
      },
      // Identification Elèves
      {
        type: "item",
        eventKey: "identificationEleves",
        icon: "DocPassIcon",
        title: "Identification Elèves",
        profiles: ["admin", "manager", "user", "Fondateur"],
      },
      // Inscription à Valider
      {
        type: "item",
        eventKey: "inscriptionAValider",
        icon: "DocPassIcon",
        title: "Inscription à Valider",
        profiles: ["admin", "manager", "user", "Fondateur"],
      },
      // Liste des Elèves
      {
        type: "item",
        eventKey: "listeElevesParClasse",
        icon: "DocPassIcon",
        title: "Liste des Elèves",
        profiles: ["admin", "manager", "user", "Fondateur"],
      },
    ],
  },

  // ===========================
  // PARAMETRAGE
  // ===========================

  {
    type: "section",
    title: "Parametrage",
    profiles: ["admin", "manager", "user", "Fondateur"],
    items: [
      {
        type: "item",
        eventKey: "OvertureCloture",
        icon: "DocPassIcon",
        title: "Overture / Clôture année",
        profiles: ["admin", "manager", "user", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "listeSalles",
        icon: "TableIcon",
        title: "Salles",
        profiles: ["admin", "manager", "Fondateur"],
      },

      // Inscription à Valider
      {
        type: "item",
        eventKey: "listeCoefficients",
        icon: "DocPassIcon",
        title: "Coefficients des matières",
        profiles: ["admin", "manager", "user", "Fondateur"],
      },
      // Liste des Elèves
      {
        type: "item",
        eventKey: "listeMatieres",
        icon: "DocPassIcon",
        title: "Liste des Matières",
        profiles: ["admin", "manager", "user", "Fondateur"],
      },


    ],
  },

  {
    type: "section",
    title: "Gestion des cours",
    profiles: ["admin", "manager", "user", "Fondateur"],
    items: [
      {
        type: "item",
        eventKey: "ConsultationDesSeances",
        icon: "DocPassIcon",
        title: "Consultation des séances",
        profiles: ["admin", "manager", "user", "Fondateur"],
      },
    ],
  },

  {
    type: "section",
    title: "Rapport",
    profiles: ["admin", "manager", "user", "Fondateur"],
    items: [
      {
        type: "item",
        eventKey: "rapport",
        icon: "DocPassIcon",
        title: "Rapport",
        profiles: ["admin", "manager", "user", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "enqueteRapideRentree",
        icon: "DocPassIcon",
        title: "Enquête Rapide Rentrée",
        profiles: ["admin", "manager", "user", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "cartificatTravail",
        icon: "DocPassIcon",
        title: "Certificat de travail",
        profiles: ["admin", "manager", "Fondateur"],
      },
    ],
  },

  {
    type: "section",
    title: "Admlinistration",
    profiles: ["Admin", "Fondateur"],
    items: [
      {
        type: "item",
        eventKey: "listeEcolesAValidee",
        icon: "DocPassIcon",
        title: "Valider une ecoles",
        profiles: ["Admin", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "listeEcolesValidee",
        icon: "DocPassIcon",
        title: "Liste des ecoles validées",
        profiles: ["Admin", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "initialiserAnnee",
        icon: "DocPassIcon",
        title: "Initialiser année",
        profiles: ["Admin", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "validerPersonnels",
        icon: "DocPassIcon",
        title: "Valider personnels",
        profiles: ["Admin", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "validerFondateur",
        icon: "DocPassIcon",
        title: "Valider Fondateur",
        profiles: ["Admin", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "listeFondateurvalider",
        icon: "DocPassIcon",
        title: "Liste Fondateur validé",
        profiles: ["Admin", "Fondateur"],
      },
      {
        type: "item",
        eventKey: "infosConnexion",
        icon: "DocPassIcon",
        title: "Informations de connexion",
        profiles: ["Admin", "Fondateur"],
      },
      {
        type: "menu",
        eventKey: "general",
        icon: "GroupIcon",
        title: "Ma Messagerie",
        profiles: ["Admin", "Professeur", "Fondateur"],
        children: [
          {
            type: "item",
            eventKey: "messagesRecus",
            icon: "MessageIcon",
            title: "Messages reçus",
            profiles: ["Admin", "Professeur", "Fondateur"],
          },
          {
            eventKey: "messagesEnvoye",
            title: "Messages envoyés",
            profiles: ["Admin", "Fondateur", "Professeur"],
          },
        ],
      },

      {
        type: "item",
        eventKey: "desctiveUtilisaterur",
        icon: "DocPassIcon",
        title: "Désactiver profil utilisateur",
        profiles: ["Admin"],
      },

      {
        type: "item",
        eventKey: "listeMatiere",
        icon: "DocPassIcon",
        title: "Liste Matières",
        profiles: ["Admin"],
      },

      {
        type: "item",
        eventKey: "progressionPedagogique",
        icon: "DocPassIcon",
        title: "Progression pédagogique",
        profiles: ["Admin"],
      },

    ],
  },

  // {
  //   type: "section",
  //   title: "Contenu et Projets",
  //   profiles: ["admin", "manager", "user"],
  //   items: [
  //     {
  //       type: "item",
  //       eventKey: "projects",
  //       icon: "DocPassIcon",
  //       title: "Projets",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //     },
  //     {
  //       type: "item",
  //       eventKey: "documents",
  //       icon: "DocPassIcon",
  //       title: "Documents",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //     },
  //     {
  //       type: "item",
  //       eventKey: "archives",
  //       icon: "DocPassIcon",
  //       title: "Archives",
  //       profiles: ["admin", "manager", "Fondateur"],
  //     },
  //   ],
  // },
  // {
  //   type: "section",
  //   title: "Communication",
  //   profiles: ["admin", "manager", "user", "Fondateur"],
  //   items: [
  //     {
  //       type: "item",
  //       eventKey: "calendar",
  //       icon: "CalendarIcon",
  //       title: "Calendrier",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //     },
  //     {
  //       type: "item",
  //       eventKey: "messages",
  //       icon: "MessageIcon",
  //       title: "Messages",
  //       badge: "3",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //     },
  //     {
  //       type: "item",
  //       eventKey: "notifications",
  //       icon: "MessageIcon",
  //       title: "Notifications",
  //       badge: "5",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //     },
  //     {
  //       type: "item",
  //       eventKey: "activity",
  //       icon: "DashboardIcon",
  //       title: "Activité",
  //       profiles: ["admin", "manager", "Fondateur"],
  //     },
  //   ],
  // },
  // {
  //   type: "section",
  //   title: "Paramètres",
  //   profiles: ["admin", "manager", "user", "Fondateur"],
  //   items: [
  //     {
  //       type: "item",
  //       eventKey: "my-profile",
  //       icon: "GroupIcon",
  //       title: "Mon Profil",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //     },
  //     {
  //       type: "item",
  //       eventKey: "settings",
  //       icon: "SettingIcon",
  //       title: "Paramètres",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //     },
  //     {
  //       type: "item",
  //       eventKey: "logout",
  //       icon: "ExitIcon",
  //       title: "Déconnexion",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //     },
  //   ],
  // },
];

// Fonction pour normaliser le profil utilisateur
// Fonction pour normaliser le profil utilisateur
const normalizeUserProfile = (profile) => {
  if (!profile) return "user";

  const normalizedProfile = profile.toLowerCase();

  const profileMap = {
    fondateur: "Fondateur",
    admin: "admin",
    administrator: "admin",
    manager: "manager",
    gestionnaire: "manager",
    user: "user",
    utilisateur: "user",
  };

  return profileMap[normalizedProfile] || "user";
};

// Fonction pour obtenir le profil utilisateur
const getUserProfile = () => {
  try {
    const userProfil = localStorage.getItem("userProfil");
    if (userProfil) {
      return userProfil;
    }

    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
      if (parsedData.profileId) {
        return normalizeUserProfile(parsedData.profileId);
      }
    }

    return "user";
  } catch (error) {
    console.error("Erreur lors de la lecture du profil utilisateur:", error);
    return "user";
  }
};

// Fonction corrigée pour filtrer les sections selon le profil
const filterSectionsByProfile = (sections, userProfile) => {
  return sections.filter((section) => {
    // Vérifier si la section est autorisée pour ce profil
    if (section.profiles && !section.profiles.includes(userProfile)) {
      return false;
    }

    // Filtrer les items de la section
    const filteredItems = section.items.filter((item) => {
      // CORRECTION PRINCIPALE : Si l'item a une propriété profiles définie,
      // il doit contenir le profil de l'utilisateur pour être affiché
      if (item.profiles) {
        const isItemAllowed = item.profiles.includes(userProfile);

        if (!isItemAllowed) {
          return false;
        }

        // Gérer les sous-menus (items de type "menu" avec des children)
        if (item.type === "menu" && item.children) {
          const filteredChildren = item.children.filter((child) => {
            // Même logique pour les enfants : si profiles existe, vérifier l'inclusion
            if (child.profiles) {
              return child.profiles.includes(userProfile);
            }
            // Si pas de profiles défini pour l'enfant, l'afficher (comportement par défaut)
            return true;
          });

          // Mettre à jour les children filtrés
          item.children = filteredChildren;

          // Ne garder le menu que s'il a au moins un enfant visible
          return filteredChildren.length > 0;
        }

        return true;
      }

      // Si l'item n'a pas de propriété profiles, l'afficher par défaut
      // OPTION : Vous pouvez changer cette logique selon vos besoins
      return true;
    });

    // Mettre à jour les items filtrés de la section
    section.items = filteredItems;

    // Ne garder la section que si elle a au moins un item visible
    return filteredItems.length > 0;
  });
};

// NOUVELLE FONCTION : Mapping des URLs vers les eventKeys
const getEventKeyFromPath = (pathname) => {
  // Mapping complet de toutes les routes vers leurs eventKeys correspondants
  const routeToEventKeyMap = {
    '/dashboard': 'dashboard',
    '/': 'dashboard',

    // Autres
    '/datatable': 'users',
    '/recrutement': 'RecrutementPersonnel',

    // FONDATEUR
    '/listeAjouterPanier': 'listeAjouterPanier',
    '/listeProfils': 'listeProfils',
    '/RecrutementAgent': 'RecrutementAgent',
    '/noteEtMoyenne': 'noteEtMoyenne',
    '/evaluation': 'evaluation',
    '/importEvaluations': 'importEvaluations',
    '/listeSalles': 'listeSalles',
    '/listeClasses': 'listeClasses',
    '/emploiDuTemps': 'emploiDuTemps',
    '/messagesRecus': 'messagesRecus',
    '/messagesEnvoye': 'messagesEnvoye',
    '/OffreEmploi': 'OffreEmploi',
    '/bulletinScolaire': 'bulletinScolaire',
    '/classe-eleves': 'classe-eleves',
    '/pv-evaluation': 'pv-evaluation',
    '/evaluation-professeur': 'evaluation-professeur',
    '/MonPanier': 'MonPanier',
    '/monPersonel': 'monPersonel',
    '/affectationProfilPersonel': 'affectationProfilPersonel',

    // INSCRIPTION
    '/importerEleves': 'importerEleves',
    '/inscriptionAValider': 'inscriptionAValider',
    '/listeElevesParClasse': 'listeElevesParClasse',
    '/identificationEleves': 'identificationEleves',

    // PARAMETRAGE
    '/listeMatieres': 'listeMatieres',
    '/listeCoefficients': 'listeCoefficients',
    '/OvertureCloture': 'OvertureCloture',
    '/professeur-matiere': 'professeur-matiere',
    '/personnel-classe': 'personnel-classe',

    // CANDIDAT
    '/postulerOffre': 'postulerOffre',
    '/demandeOffre': 'demandeOffre',

    '/loginMotDePasse': 'loginMotDePasse',
    '/mesDocuments': 'mesDocuments',
    '/profileUtilisateur': 'profileUtilisateur',
    '/miseAJoursInfo': 'miseAJoursInfo',

    // EMPLOI DU TEMPS
    '/ConsultationDesSeances': 'ConsultationDesSeances',


    // ENQUETE RAPIDE
    '/enqueteRapideRentree': 'enqueteRapideRentree',
    '/rapport': 'rapport',

    // ADMIN
    '/desctiveUtilisaterur': 'desctiveUtilisaterur',
    '/InitialiserAnnee': 'initialiserAnnee',
    '/validerPersonnels': 'validerPersonnels',
    '/validerFondateur': 'validerFondateur',
    '/listeFondateurvalider': 'listeFondateurvalider',
    '/listeEcolesValidee': 'listeEcolesValidee',
    '/listeEcolesAValidee': 'listeEcolesAValidee',
    '/infosConnexion': 'infosConnexion',
    '/listeMatiere': 'listeMatiere'
  };

  // Recherche exacte d'abord
  if (routeToEventKeyMap[pathname]) {
    return routeToEventKeyMap[pathname];
  }

  // Recherche pour les routes avec paramètres (ex: /exercises/edit/123)
  for (const [route, eventKey] of Object.entries(routeToEventKeyMap)) {
    if (route.includes('/edit') || route.includes('/create')) {
      const baseRoute = route.split('/').slice(0, -1).join('/');
      if (pathname.startsWith(baseRoute)) {
        return eventKey;
      }
    }
  }

  // Recherche par segments d'URL
  if (pathname.includes('/exercises')) return 'listExercice';
  if (pathname.includes('/questions')) return 'listQuestionnaire';
  if (pathname.includes('/quiz')) return 'listQuizz';
  if (pathname.includes('/courses')) return 'listCours';
  if (pathname.includes('/lesson')) return 'listLesson';
  if (pathname.includes('/domaine')) return 'listDomaine';
  if (pathname.includes('/datatable')) return 'users';
  if (pathname.includes('/recrutement')) return 'RecrutementPersonnel';

  // Route par défaut
  return 'dashboard';
};

const Sidebar = ({
  onItemClick,
  activeKey: externalActiveKey, // Si fourni depuis le parent
}) => {
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState(["general"]);

  // Déterminer l'activeKey basé sur l'URL actuelle
  const currentActiveKey = useMemo(() => {
    return externalActiveKey || getEventKeyFromPath(location.pathname);
  }, [location.pathname, externalActiveKey]);

  // État local pour l'activeKey avec synchronisation avec l'URL
  const [activeKey, setActiveKey] = useState(currentActiveKey);

  // Synchroniser l'activeKey avec les changements d'URL
  useEffect(() => {
    const newActiveKey = getEventKeyFromPath(location.pathname);
    setActiveKey(newActiveKey);
    console.log('🔄 URL changée:', location.pathname, '-> activeKey:', newActiveKey);
  }, [location.pathname]);

  const userProfile = getUserProfile();
  const menuSections = useMemo(() => {
    const sectionsClone = JSON.parse(JSON.stringify(allMenuSections));
    return filterSectionsByProfile(sectionsClone, userProfile);
  }, [userProfile]);

  console.log("Profil utilisateur:", userProfile);
  console.log("URL actuelle:", location.pathname);
  console.log("Élément actif:", activeKey);

  // Mapping des icônes
  const iconMap = {
    DashboardIcon: <DashboardIcon />,
    GroupIcon: <GroupIcon />,
    SettingIcon: <SettingIcon />,
    BarChartIcon: <BarChartIcon />,
    DocPassIcon: <DocPassIcon />,
    CalendarIcon: <CalendarIcon />,
    MessageIcon: <MessageIcon />,
    ExitIcon: <ExitIcon />,
    TableIcon: <TableIcon />,
  };

  // Fonction modifiée pour gérer les clics
  const handleMenuItemClick = (eventKey, event) => {
    console.log("🔸 Clic sur élément de menu:", eventKey);

    if (event) {
      event.stopPropagation();
    }

    // Mettre à jour l'état actif immédiatement
    setActiveKey(eventKey);

    // Gestion spéciale pour la déconnexion
    if (eventKey === "logout") {
      console.log("Déconnexion...");
      return;
    }

    // Navigation
    if (onItemClick) {
      console.log("🔸 Navigation vers:", eventKey);
      onItemClick(eventKey);
    }
  };

  // Fonction pour gérer l'ouverture/fermeture des menus déroulants
  const handleToggle = (openKeys) => {
    console.log("🔸 Toggle menus:", openKeys);
    setOpenKeys(openKeys);
  };

  const getProfileDisplayName = (profile) => {
    const profileNames = {
      admin: "Administrateur",
      manager: "Manager",
      user: "Utilisateur",
      Fondateur: "Fondateur",
    };
    return profileNames[profile] || profile;
  };

  const renderSectionHeader = (title, index) => {
    const headerStyle = {
      padding: "12px 20px 8px 20px",
      marginTop: index === 0 ? "8px" : "16px",
    };

    const titleStyle = {
      fontSize: "11px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      color: "#8e8e93",
      opacity: "0.8",
    };

    return (
      <div key={`section-header-${index}`} style={headerStyle}>
        <span style={titleStyle}>{title}</span>
      </div>
    );
  };

  const renderMenuItem = (item, sectionIndex, itemIndex) => {
    const { type, eventKey, icon, title, children, badge } = item;
    const key = `${sectionIndex}-${itemIndex}-${eventKey || itemIndex}`;

    const badgeStyle = {
      background: "#ff6b6b",
      color: "white",
      borderRadius: "10px",
      padding: "2px 6px",
      fontSize: "10px",
      marginLeft: "8px",
      fontWeight: "600",
    };

    const iconElement = icon ? iconMap[icon] : null;

    switch (type) {
      case "item":
        return (
          <Nav.Item
            key={key}
            eventKey={eventKey}
            icon={iconElement}
            onClick={(event) => handleMenuItemClick(eventKey, event)}
            className={activeKey === eventKey ? "rs-sidenav-item-active" : ""}
          >
            {title}
            {badge && <span style={badgeStyle}>{badge}</span>}
          </Nav.Item>
        );

      case "menu":
        return (
          <Nav.Menu
            key={key}
            eventKey={eventKey}
            title={title}
            icon={iconElement}
            placement="rightStart"
            className="custom-dropdown-menu"
          >
            {children &&
              children.map((child, childIndex) => (
                <Nav.Item
                  key={`${key}-child-${childIndex}`}
                  eventKey={child.eventKey}
                  onClick={(event) =>
                    handleMenuItemClick(child.eventKey, event)
                  }
                  className={`custom-dropdown-item ${activeKey === child.eventKey ? "rs-sidenav-item-active" : ""
                    }`}
                >
                  {child.title}
                  {child.badge && <span style={badgeStyle}>{child.badge}</span>}
                </Nav.Item>
              ))}
          </Nav.Menu>
        );

      default:
        return null;
    }
  };

  const getUserInfo = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      return {
        name:
          userData.name ||
          (userData.firstName && userData.lastName
            ? userData.firstName + " " + userData.lastName
            : "Utilisateur"),
        initials:
          userData.initials ||
          (userData.firstName && userData.lastName
            ? userData.firstName[0] + userData.lastName[0]
            : "U"),
        role: getProfileDisplayName(userProfile),
      };
    } catch (error) {
      return {
        name: "Utilisateur",
        initials: "U",
        role: getProfileDisplayName(userProfile),
      };
    }
  };

  const userInfo = getUserInfo();

  const dividerStyle = {
    margin: "16px 20px",
    borderColor: "#e5e5e7",
  };

  const userProfil = localStorage.getItem("userProfil");

  return (
    <div style={sidebarStyles.container} className="sidebar-container" id={userProfil}>
      <div style={sidebarStyles.header} className="sidebar-header">
        <div className="d-flex align-items-center">
          <img
            src="/logo-app.png"
            alt="logo"
            className="logo"
            style={{ width: "60px", height: "60px" }}
          />
          <h4 className="brand-title m-0 ms-2 fs-5">Pouls Scolaire</h4>
        </div>
      </div>

      <div style={sidebarStyles.nav}>
        <Sidenav
          appearance="subtle"
          openKeys={openKeys}
          onOpenChange={handleToggle}
          activeKey={activeKey}
          className="sidebar-nav"
        >
          <Sidenav.Body>
            <Nav>
              {menuSections.map((section, sectionIndex) => {
                const elements = [];

                elements.push(renderSectionHeader(section.title, sectionIndex));

                section.items.forEach((item, itemIndex) => {
                  const menuItem = renderMenuItem(item, sectionIndex, itemIndex);
                  if (menuItem) {
                    elements.push(menuItem);
                  }
                });

                if (sectionIndex < menuSections.length - 1) {
                  elements.push(
                    <Divider
                      key={`section-divider-${sectionIndex}`}
                      style={dividerStyle}
                    />
                  );
                }

                return elements;
              })}
            </Nav>
          </Sidenav.Body>
        </Sidenav>
      </div>

      <div style={sidebarStyles.footer} className="sidebar-footer">
        <div style={sidebarStyles.userInfo} className="user-info">
          <div style={sidebarStyles.userAvatar} className="user-avatar">
            <span>{userInfo.initials}</span>
          </div>
          <div className="user-details">
            <div style={sidebarStyles.userName} className="user-name">{userInfo.name}</div>
            <div style={sidebarStyles.userRole} className="user-role">{userInfo.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;