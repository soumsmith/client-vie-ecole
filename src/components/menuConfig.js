export const allMenuSections = [
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


  // {
  //   type: "section",
  //   title: "GUIZ APPS",
  //   profiles: ["admin", "manager", "user", ""],
  //   items: [
  //     {
  //       type: "item",
  //       eventKey: "save-questionnaire",
  //       icon: "DashboardIcon",
  //       title: "Save questionnaire",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //     },
  //     {
  //       type: "item",
  //       eventKey: "datatable",
  //       icon: "TableIcon",
  //       title: "Ajouter au panier",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //     },
  //     {
  //       type: "menu",
  //       eventKey: "admin-panel",
  //       icon: "SettingIcon",
  //       title: "Questionnaires",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //       children: [
  //         {
  //           eventKey: "listQuestionnaire",
  //           title: "Liste des questions",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //         {
  //           eventKey: "saveQuestionnaire",
  //           title: "Save questionnaire",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //       ],
  //     },
  //     {
  //       type: "menu",
  //       eventKey: "quiz-panel",
  //       icon: "SettingIcon",
  //       title: "Quizz",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //       children: [
  //         {
  //           eventKey: "listQuizz",
  //           title: "Liste des quizz",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //         {
  //           eventKey: "saveQuizz",
  //           title: "Save quizz",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //       ],
  //     },
  //     {
  //       type: "menu",
  //       eventKey: "lesson-panel",
  //       icon: "SettingIcon",
  //       title: "Leçon",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //       children: [
  //         {
  //           eventKey: "listLesson",
  //           title: "Liste des leçons",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //         {
  //           eventKey: "saveLesson",
  //           title: "Save leçons",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //       ],
  //     },
  //     {
  //       type: "menu",
  //       eventKey: "domaine-panel",
  //       icon: "SettingIcon",
  //       title: "Domaine",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //       children: [
  //         {
  //           eventKey: "listDomaine",
  //           title: "Liste domaine",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //         {
  //           eventKey: "listLevelDomaine",
  //           title: "Liste domaine / niveau",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //         {
  //           eventKey: "listSubDomaine",
  //           title: "Liste sous domaine",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //       ],
  //     },

  //     {
  //       type: "menu",
  //       eventKey: "courses-panel",
  //       icon: "SettingIcon",
  //       title: "Cours",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //       children: [
  //         {
  //           eventKey: "listCours",
  //           title: "Liste des cours",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //         {
  //           eventKey: "saveCours",
  //           title: "Save cours",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //       ],
  //     },
  //     {
  //       type: "menu",
  //       eventKey: "exercice-panel",
  //       icon: "SettingIcon",
  //       title: "Exercice",
  //       profiles: ["admin", "manager", "user", "Fondateur"],
  //       children: [
  //         {
  //           eventKey: "listExercice",
  //           title: "Liste des exercices",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //         {
  //           eventKey: "saveExercice",
  //           title: "Save exercice",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //       ],
  //     },
  //     {
  //       type: "menu",
  //       eventKey: "general",
  //       icon: "GroupIcon",
  //       title: "Ma Messagerie",
  //       profiles: ["admin", "manager", "Fondateur"],
  //       children: [
  //         {
  //           eventKey: "users",
  //           title: "Messages envoyés",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //         {
  //           eventKey: "teams",
  //           title: "Équipes",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //         {
  //           eventKey: "roles",
  //           title: "Rôles",
  //           profiles: ["admin", "manager", "user", "Fondateur"],
  //         },
  //       ],
  //     },

  //     {
  //       type: "item",
  //       eventKey: "RecrutementPersonnel",
  //       icon: "SettingIcon",
  //       title: "Recruté un Agent",
  //       profiles: ["admin", "Fondateur"],
  //     },
  //   ],
  // },

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
    profiles: ["Professeur"],
    items: [
      {
        type: "item",
        eventKey: "postulerOffre",
        icon: "TableIcon",
        title: "Postuler a une offre",
        profiles: ["Professeur"],
      },

      {
        type: "item",
        eventKey: "demandeOffre",
        icon: "TableIcon",
        title: "Mes demandes d'offres",
        profiles: ["Professeur"],
      },

      {
        type: "item",
        eventKey: "loginMotDePasse",
        icon: "TableIcon",
        title: "Login & mot de passe",
        profiles: ["Professeur"],
      },

      {
        type: "item",
        eventKey: "mesDocuments",
        icon: "TableIcon",
        title: "Mes documents",
        profiles: ["Professeur"],
      },

      // Professeur - Matiere
      {
        type: "item",
        eventKey: "profileUtilisateur",
        icon: "TableIcon",
        title: "Mon profil",
        profiles: ["Professeur"],
      },
      // Personnel - Classe
      {
        type: "item",
        eventKey: "miseAJoursInfo",
        icon: "TableIcon",
        title: "modifier mes infos personnelles ",
        profiles: ["Professeur"],
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
    profiles: ["Admin"],
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