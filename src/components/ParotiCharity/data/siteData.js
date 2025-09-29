// ===========================
// DONNÉES DU SITE ÉDUCATIF SCOLAIRE
// ===========================

export const siteConfig = {
  title: "Accueil || EduCare || Plateforme Éducative Scolaire",
  logo: "/assets/images/logo-app.png",
  logoAlt: "EduCare Logo Éducatif"
};

// ===========================
// CONFIGURATION DES ROUTES
// ===========================

export const routeConfig = {
  home: "/",
  homeSecondary: "/accueil-secondaire",
  homePrimary: "/accueil-primaire",
  headerStyleOne: "/header-style-1",
  headerStyleTwo: "/header-style-2",
  headerStyleThree: "/header-style-3",
  about: "/a-propos",
  team: "/notre-equipe",
  programs: "/programmes",
  programDetails: "/programmes/:id",
  events: "/evenements",
  eventDetails: "/evenements/:id",
  news: "/actualites",
  newsDetails: "/actualites/:id",
  contact: "/contact",
  donations: "/dons",
  donationDetails: "/dons/:id",
  volunteers: "/benevoles"
};

// ===========================
// DONNÉES DE NAVIGATION AVEC ROUTES REACT
// ===========================

export const navigationData = {
  topbar: {
    info: [
      {
        id: 1,
        icon: "fa fa-map",
        text: "123 Avenue de l'Éducation, Paris",
        link: "#",
        type: "external"
      },
      {
        id: 2,
        icon: "fa fa-envelope-open",
        text: "contact@educare-ecole.fr",
        link: "mailto:contact@educare-ecole.fr",
        type: "external"
      },
      {
        id: 3,
        icon: "fa fa-mobile",
        text: "+ 33 (01) 23 45 67 89",
        link: "tel:+33123456789",
        type: "external"
      }
    ],
    social: [
      { id: 1, icon: "fab fa-twitter", link: "https://twitter.com/educare", type: "external" },
      { id: 2, icon: "fab fa-facebook", link: "https://facebook.com/educare", type: "external" },
      { id: 3, icon: "fab fa-pinterest", link: "https://pinterest.com/educare", type: "external" },
      { id: 4, icon: "fab fa-instagram", link: "https://instagram.com/educare", type: "external" }
    ],
    links: [
      { id: 1, text: "Connexion", link: "#", type: "modal", modalType: "login" },
      { id: 2, text: "Inscription", link: routeConfig.contact, type: "route" }
    ]
  },
  mainMenu: [
    {
      id: 1,
      text: "Accueil",
      link: routeConfig.home,
      type: "route"
    },
    // {
    //   id: 1,
    //   text: "Accueil",
    //   link: routeConfig.home,
    //   type: "route",
    //   current: true,
    //   hasChildren: true,
    //   children: [
    //     { 
    //       id: 11, 
    //       text: "Accueil principal", 
    //       link: routeConfig.home, 
    //       type: "route",
    //       current: true 
    //     },
    //     { 
    //       id: 12, 
    //       text: "Accueil secondaire", 
    //       link: routeConfig.homeSecondary, 
    //       type: "route"
    //     },
    //     { 
    //       id: 13, 
    //       text: "Accueil primaire", 
    //       link: routeConfig.homePrimary, 
    //       type: "route"
    //     },
    //     {
    //       id: 14,
    //       text: "Styles d'en-tête",
    //       link: "#",
    //       type: "dropdown",
    //       hasChildren: true,
    //       children: [
    //         { 
    //           id: 141, 
    //           text: "En-tête un", 
    //           link: routeConfig.headerStyleOne, 
    //           type: "route"
    //         },
    //         { 
    //           id: 142, 
    //           text: "En-tête deux", 
    //           link: routeConfig.headerStyleTwo, 
    //           type: "route"
    //         },
    //         { 
    //           id: 143, 
    //           text: "En-tête trois", 
    //           link: routeConfig.headerStyleThree, 
    //           type: "route"
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   id: 2,
    //   text: "Pages",
    //   link: "#",
    //   type: "dropdown",
    //   hasChildren: true,
    //   children: [
    //     { 
    //       id: 21, 
    //       text: "À propos", 
    //       link: routeConfig.about, 
    //       type: "route"
    //     },
    //     { 
    //       id: 22, 
    //       text: "Notre équipe", 
    //       link: routeConfig.team, 
    //       type: "route"
    //     }
    //   ]
    // },
    // {
    //   id: 3,
    //   text: "Programmes",
    //   link: routeConfig.programs,
    //   type: "route",
    //   hasChildren: true,
    //   children: [
    //     { 
    //       id: 31, 
    //       text: "Nos programmes", 
    //       link: routeConfig.programs, 
    //       type: "route"
    //     },
    //     { 
    //       id: 32, 
    //       text: "Soutien scolaire", 
    //       link: "/programmes/soutien-scolaire", 
    //       type: "route"
    //     },
    //     { 
    //       id: 33, 
    //       text: "Fournitures scolaires", 
    //       link: "/programmes/fournitures-scolaires", 
    //       type: "route"
    //     },
    //     { 
    //       id: 34, 
    //       text: "Bourses d'études", 
    //       link: "/programmes/bourses-etudes", 
    //       type: "route"
    //     }
    //   ]
    // },
    // {
    //   id: 4,
    //   text: "Événements",
    //   link: routeConfig.events,
    //   type: "route",
    //   hasChildren: true,
    //   children: [
    //     { 
    //       id: 41, 
    //       text: "Événements scolaires", 
    //       link: routeConfig.events, 
    //       type: "route"
    //     },
    //     { 
    //       id: 42, 
    //       text: "Calendrier académique", 
    //       link: "/evenements/calendrier", 
    //       type: "route"
    //     },
    //     { 
    //       id: 43, 
    //       text: "Conférences", 
    //       link: "/evenements/conferences", 
    //       type: "route"
    //     }
    //   ]
    // },
    // {
    //   id: 5,
    //   text: "Actualités",
    //   link: routeConfig.news,
    //   type: "route",
    //   hasChildren: true,
    //   children: [
    //     { 
    //       id: 51, 
    //       text: "Toutes les actualités", 
    //       link: routeConfig.news, 
    //       type: "route"
    //     },
    //     { 
    //       id: 52, 
    //       text: "Annonces importantes", 
    //       link: "/actualites/annonces", 
    //       type: "route"
    //     },
    //     { 
    //       id: 53, 
    //       text: "Success stories", 
    //       link: "/actualites/success-stories", 
    //       type: "route"
    //     }
    //   ]
    // },

    // {
    //   id: 6,
    //   text: "Contact",
    //   link: routeConfig.contact,
    //   type: "route"
    // }
  ],
  cta: {
    icon: "paroti-icon-volunteer",
    subtitle: "Rejoignez-nous",
    title: "Devenez Éducateur",
    link: routeConfig.contact,
    type: "route",
    button: {
      text: "S'inscrire",
      icon: "fa fa-graduation-cap",
      link: routeConfig.contact,
      type: "route"
    }
  }
};

// ===========================
// CONFIGURATION DES MODALS DE CONNEXION
// ===========================

export const modalConfi_asuprimer = {
  admin: {
    title: "Connexion Administrateur",
    description: "Connectez-vous à votre espace administrateur",
    icon: "fas fa-user-shield",
    color: "#f59e0b",
    apis: {
      schools: "connecte/ecole",
      profiles: "profil",
      login: "connexion/se-connecter-admin"
    },
    redirectPath: "/dashboard/admin",
    fields: {
      showSchoolSelector: false,
      showProfileSelector: false,
      emailLabel: "Email administrateur",
      passwordLabel: "Mot de passe"
    }
  },
  personnel: {
    title: "Connexion Personnel",
    description: "Connectez-vous à votre espace personnel",
    icon: "fas fa-user-tie",
    color: "#8b5cf6",
    apis: {
      schools: "connecte/ecole",
      profiles: "profil",
      login: "connexion/se-connecter"
    },
    redirectPath: "/dashboard/personnel",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: true,
      emailLabel: "Login",
      passwordLabel: "Mot de passe"
    }
  },
  candidat: {
    title: "Connexion Candidat",
    description: "Accédez à votre espace candidat",
    icon: "fas fa-graduation-cap",
    color: "#374151",
    apis: {
      schools: "connecte/ecole",
      profiles: "profil",
      login: "connexion/se-connecter"
    },
    redirectPath: "/dashboard/candidat",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: false,
      emailLabel: "Email",
      passwordLabel: "Mot de passe"
    }
  },
  parent: {
    title: "Connexion Parent",
    description: "Suivez la scolarité de votre enfant",
    icon: "fas fa-users",
    color: "#06b6d4",
    apis: {
      schools: "connecte/ecole",
      profiles: "profil",
      login: "connexion/se-connecter"
    },
    redirectPath: "/dashboard/parent",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: false,
      emailLabel: "Email",
      passwordLabel: "Mot de passe"
    }
  },
  eleve: {
    title: "Connexion Élève",
    description: "Accédez à votre espace étudiant",
    icon: "fas fa-backpack",
    color: "#dc2626",
    apis: {
      schools: "connecte/ecole",
      profiles: "profil",
      login: "connexion/se-connecter"
    },
    redirectPath: "/dashboard/eleve",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: false,
      emailLabel: "Email",
      passwordLabel: "Mot de passe"
    }
  },
  registration: {
    title: "Inscription",
    description: "Créez votre compte pour accéder à la plateforme",
    icon: "fas fa-user-plus",
    color: "#10b981",
    apis: {
      schools: "connecte/ecole",
      register: "inscription/creer-compte"
    },
    redirectPath: "/dashboard/nouveau-compte",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: true,
      emailLabel: "Email",
      passwordLabel: "Mot de passe",
      showConfirmPassword: true,
      showFirstName: true,
      showLastName: true
    }
  },
  obtenirMotdePasse: {
    title: "Récupére mot de passe",
    description: "Créez votre compte pour accéder à la plateforme",
    icon: "fas fa-user-plus",
    color: "#10b981",
    apis: {
      schools: "connecte/ecole",
      register: "inscription/creer-compte"
    },
    redirectPath: "/dashboard/nouveau-compte",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: true,
      emailLabel: "Email",
      showConfirmPassword: true,
      showFirstName: true,
      showLastName: true
    }
  },
  
};

// ===========================
// TYPES DE NAVIGATION
// ===========================

export const navigationTypes = {
  ROUTE: "route",           // Navigation React Router
  EXTERNAL: "external",     // Lien externe (nouvelle fenêtre)
  MODAL: "modal",           // Ouvre un modal
  DROPDOWN: "dropdown",     // Élément avec sous-menu
  ANCHOR: "anchor"          // Ancrage sur la même page
};

// ===========================
// DONNÉES DU SLIDER
// ===========================

export const sliderData = [
  {
    id: 1,
    backgroundImage: "/assets/images/backgrounds/slider-1-1.jpg",
    title: "Donnez une <span>éducation</span> <br> aux enfants défavorisés",
    text: "Nous accompagnons chaque élève vers la réussite scolaire",
    button: {
      text: "En savoir plus",
      link: routeConfig.about,
      type: "route"
    }
  },
  {
    id: 2,
    backgroundImage: "/assets/images/backgrounds/slider-1-2.jpg",
    title: "Construisons <span>l'avenir</span> <br> par l'éducation",
    text: "Chaque enfant mérite d'avoir accès à une éducation de qualité",
    button: {
      text: "Découvrir nos actions",
      link: routeConfig.programs,
      type: "route"
    }
  },
  {
    id: 3,
    backgroundImage: "/assets/images/backgrounds/slider-1-3.jpg",
    title: "L'<span>école</span> pour tous <br> sans exception",
    text: "Ensemble, brisons les barrières à l'éducation",
    button: {
      text: "Nous rejoindre",
      link: routeConfig.contact,
      type: "route"
    }
  }
];

// ===========================
// DONNÉES DE LA SECTION À PROPOS
// ===========================

export const aboutData = {
  shape: "/assets/images/shapes/about-2-1.png",
  image: "/assets/images/resources/about-2-1.png",
  caption: {
    count: "15",
    text: "Années d'expérience éducative"
  },
  content: {
    tagline: "Bienvenue chez EduCare",
    title: "Transformons l'éducation ensemble",
    text: "Notre mission est de garantir un accès équitable à une éducation de qualité pour tous les enfants, peu importe leur origine sociale ou géographique.",
    info: [
      {
        id: 1,
        icon: "paroti-icon-sponsor",
        title: "Parrainez une classe entière",
        accentColor: null
      },
      {
        id: 2,
        icon: "paroti-icon-solidarity",
        title: "Soutenez nos projets éducatifs",
        accentColor: "#8139e7"
      }
    ],
    list: [
      "Matériel scolaire fourni à chaque élève inscrit.",
      "Accompagnement personnalisé pour les élèves en difficulté."
    ],
    button: {
      text: "Découvrir nos actions",
      link: routeConfig.programs,
      type: "route"
    }
  }
};

// ===========================
// DONNÉES DES PROGRAMMES ÉDUCATIFS
// ===========================

export const donationData = {
  section: {
    tagline: "Niveaux Scolaires",
    title: "Nous sommes là pour les accompagner",
    text: "Chaque enfant a le droit d'apprendre et de s'épanouir dans un environnement éducatif bienveillant et stimulant."
  },
  cards: [
    {
      id: 1,
      title: "Niveau CM2",
      text: "Aide aux devoirs et cours de rattrapage pour les élèves en difficulté.",
      icon: "paroti-icon-organic-food",
      link: "/programmes/soutien-scolaire",
      type: "route",
      accentColor: null
    },
    {
      id: 2,
      title: "Niveau CM2",
      text: "Distribution de matériel éducatif et de manuels scolaires aux familles.",
      icon: "paroti-icon-education",
      link: "/programmes/fournitures-scolaires",
      type: "route",
      accentColor: "#fdbe44"
    },
    {
      id: 3,
      title: "Niveau CM2",
      text: "Programme de bourses pour permettre l'accès aux études supérieures.",
      icon: "paroti-icon-patient",
      link: "/programmes/bourses-etudes",
      type: "route",
      accentColor: "#8139e7"
    }
  ]
};

// ===========================
// UTILITAIRES DE NAVIGATION
// ===========================

export const navigationUtils = {
  /**
   * Détermine le type de navigation en fonction de l'élément de menu
   * @param {Object} item - Élément de menu
   * @returns {string} - Type de navigation
   */
  getNavigationType: (item) => {
    if (item.type) return item.type;
    if (item.hasChildren) return navigationTypes.DROPDOWN;
    if (item.link && item.link.startsWith('http')) return navigationTypes.EXTERNAL;
    if (item.link && item.link.startsWith('mailto:')) return navigationTypes.EXTERNAL;
    if (item.link && item.link.startsWith('tel:')) return navigationTypes.EXTERNAL;
    if (item.link && item.link.startsWith('#')) return navigationTypes.ANCHOR;
    return navigationTypes.ROUTE;
  },

  /**
   * Gère la navigation en fonction du type d'élément
   * @param {Object} item - Élément de menu
   * @param {Function} navigate - Fonction de navigation React Router
   * @param {Function} openModal - Fonction d'ouverture de modal
   */
  handleNavigation: (item, navigate, openModal) => {
    const type = navigationUtils.getNavigationType(item);

    switch (type) {
      case navigationTypes.ROUTE:
        if (item.link && item.link !== '#') {
          navigate(item.link);
        }
        break;

      case navigationTypes.EXTERNAL:
        if (item.link) {
          window.open(item.link, '_blank', 'noopener,noreferrer');
        }
        break;

      case navigationTypes.MODAL:
        if (item.modalType && openModal) {
          openModal(item.modalType);
        }
        break;

      case navigationTypes.ANCHOR:
        if (item.link) {
          const element = document.querySelector(item.link);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
        break;

      default:
        console.warn(`Type de navigation non géré: ${type}`);
    }
  }
};


export const causesData = {
  section: {
    tagline: "Start donating them",
    title: "Find popular causes"
  },
  donations: [
    {
      id: 1,
      image: "/assets/images/donations/donations-1-1.jpg",
      category: "Medical",
      title: "Your little help can heal their pains",
      text: "Aellentesque porttitor lacus quis enim varius sed efficitur...",
      progress: 36,
      raised: 25270,
      goal: 30000,
      accentColor: "#8139e7",
      link: "donations-details.html"
    },
    {
      id: 2,
      image: "/assets/images/donations/donations-1-2.jpg",
      category: "education",
      title: "Give african childrens a good education",
      text: "Aellentesque porttitor lacus quis enim varius sed efficitur...",
      progress: 36,
      raised: 25270,
      goal: 30000,
      accentColor: null,
      link: "donations-details.html"
    },
    {
      id: 3,
      image: "/assets/images/donations/donations-1-3.jpg",
      category: "Food",
      title: "Raise funds for healthy food",
      text: "Aellentesque porttitor lacus quis enim varius sed efficitur...",
      progress: 36,
      raised: 25270,
      goal: 30000,
      accentColor: null,
      link: "donations-details.html"
    }
    ,
    {
      id: 4,
      image: "/assets/images/donations/donations-1-3.jpg",
      category: "Food",
      title: "Raise funds for healthy food",
      text: "Aellentesque porttitor lacus quis enim varius sed efficitur...",
      progress: 36,
      raised: 25270,
      goal: 30000,
      accentColor: null,
      link: "donations-details.html"
    }
    ,
    {
      id: 5,
      image: "/assets/images/donations/donations-1-3.jpg",
      category: "Food",
      title: "Raise funds for healthy food",
      text: "Aellentesque porttitor lacus quis enim varius sed efficitur...",
      progress: 36,
      raised: 25270,
      goal: 30000,
      accentColor: null,
      link: "donations-details.html"
    }
  ]
};


export const testimonialsData = {
  backgroundImage: "https://via.placeholder.com/1920x800/f8f9fa/6c757d?text=Testimonials+Background",
  gallery: [
    { id: 1, image: "https://via.placeholder.com/150x150/007bff/ffffff?text=T1" },
    { id: 2, image: "https://via.placeholder.com/150x150/28a745/ffffff?text=T2" },
    { id: 3, image: "https://via.placeholder.com/150x150/dc3545/ffffff?text=T3" },
    { id: 4, image: "https://via.placeholder.com/150x150/ffc107/000000?text=T4" },
    { id: 5, image: "https://via.placeholder.com/150x150/6f42c1/ffffff?text=T5" }
  ],
  testimonials: [
    {
      id: 1,
      text: "There are many variations of passages of lorem ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
      author: "Kevin martin",
      designation: "Customer",
      rating: 5
    },
    {
      id: 2,
      text: "There are many variations of passages of lorem ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
      author: "Sarah Johnson",
      designation: "Volunteer",
      rating: 5
    },
    {
      id: 3,
      text: "There are many variations of passages of lorem ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
      author: "Mike Wilson",
      designation: "Donor",
      rating: 5
    }
  ]
};

export const galleryData = [
  { id: 1, image: "/assets/images/donations/donations-1-3.jpg", title: "Charity Event 1" },
  { id: 2, image: "/assets/images/donations/donations-1-3.jpg", title: "Charity Event 2" },
  { id: 3, image: "/assets/images/donations/donations-1-3.jpg", title: "Charity Event 3" },
  { id: 4, image: "/assets/images/donations/donations-1-3.jpg", title: "Charity Event 4" },
  { id: 5, image: "/assets/images/donations/donations-1-3.jpg", title: "Charity Event 5" }
];


export const videoData = {
  backgroundImage: "https://via.placeholder.com/800x600/343a40/ffffff?text=Video+Background",
  content: {
    tagline: "Watch our latest videos",
    title: "We're here to help them don't hesitate to give us a call",
    text: "There are many variations of passages of lorem ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
    videoUrl: "https://www.youtube.com/watch?v=Get7rqXYrbQ",
    button: {
      text: "Learn More",
      link: "about.html"
    }
  }
};


// ===========================
// DONNÉES SPONSORS
// ===========================

export const sponsorsData = [
  { id: 1, image: "/assets/images/schools/academie_elite.jpg", name: "Academie Elite" },
  { id: 2, image: "/assets/images/schools/adam_marshall.png", name: "Adam Marshall" },
  { id: 3, image: "/assets/images/schools/ale_ahin.jpeg", name: "Ale Ahin" },
  { id: 4, image: "/assets/images/schools/anador.jpeg", name: "Anador" },
  { id: 5, image: "/assets/images/schools/anouanze.jpeg", name: "Anouanze" },
  { id: 6, image: "/assets/images/schools/bagnon.jpeg", name: "Bagnon" },
  { id: 7, image: "/assets/images/schools/bel_air.jpeg", name: "Bel Air" },
  { id: 8, image: "/assets/images/schools/cnps.png", name: "CNPS" },
  { id: 9, image: "/assets/images/schools/cofe_cesa.jpg", name: "Cofe Cesa" },
  { id: 10, image: "/assets/images/schools/couronne.jpeg", name: "Couronne" },
  { id: 11, image: "/assets/images/schools/cp_tanda.jpeg", name: "CP Tanda" },
  { id: 12, image: "/assets/images/schools/cpmte.jpeg", name: "CPMTE" },
  { id: 13, image: "/assets/images/schools/csm_koumassi.jpeg", name: "CSM Koumassi" },
  { id: 14, image: "/assets/images/schools/csm_niangon.png", name: "CSM Niangon" },
  { id: 15, image: "/assets/images/schools/degre.jpeg", name: "Degre" },
  { id: 16, image: "/assets/images/schools/ecole.png", name: "Ecole" },
  { id: 17, image: "/assets/images/schools/essect.png", name: "ESSECT" },
  { id: 18, image: "/assets/images/schools/etabaz.jpg", name: "Etabaz" },
  { id: 19, image: "/assets/images/schools/faidherbe.jpeg", name: "Faidherbe" },
  { id: 20, image: "/assets/images/schools/fontaine.jpeg", name: "Fontaine" },
  { id: 21, image: "/assets/images/schools/gadouan.jpeg", name: "Gadouan" },
  { id: 22, image: "/assets/images/schools/gaston_angbonon.jpeg", name: "Gaston Angbonon" },
  { id: 23, image: "/assets/images/schools/gnakan.jpeg", name: "Gnakan" },
  { id: 24, image: "/assets/images/schools/gs_marie_oceane.jpeg", name: "GS Marie Oceane" },
  { id: 25, image: "/assets/images/schools/gue_pascal.jpeg", name: "Gue Pascal" },
  { id: 26, image: "/assets/images/schools/horeb_elites.jpeg", name: "Horeb Elites" },
  { id: 27, image: "/assets/images/schools/igon.jpeg", name: "Igon" },
  { id: 28, image: "/assets/images/schools/issa_traore.jpeg", name: "Issa Traore" },
  { id: 29, image: "/assets/images/schools/kadje.jpeg", name: "Kadje" },
  { id: 30, image: "/assets/images/schools/kahouli.jpeg", name: "Kahouli" },
  { id: 31, image: "/assets/images/schools/kavoetcheva.jpeg", name: "Kavoetcheva" },
  { id: 32, image: "/assets/images/schools/kouadio_adja.jpeg", name: "Kouadio Adja" },
  { id: 33, image: "/assets/images/schools/logo_tech_tanda.jpeg", name: "Logo Tech Tanda" },
  { id: 34, image: "/assets/images/schools/makinde.jpeg", name: "Makinde" },
  { id: 35, image: "/assets/images/schools/marie_adiake.jpeg", name: "Marie Adiake" },
  { id: 36, image: "/assets/images/schools/marie_elibou.png", name: "Marie Elibou" },
  { id: 37, image: "/assets/images/schools/memel_fote.png", name: "Memel Fote" },
  { id: 38, image: "/assets/images/schools/nid_fatima.jpeg", name: "Nid Fatima" },
  { id: 39, image: "/assets/images/schools/olympique.jpg", name: "Olympique" },
  { id: 40, image: "/assets/images/schools/oyofo.bmp", name: "Oyofo" },
  { id: 41, image: "/assets/images/schools/paradis.jpeg", name: "Paradis" },
  { id: 42, image: "/assets/images/schools/pierre_marie.jpeg", name: "Pierre Marie" },
  { id: 43, image: "/assets/images/schools/racine_divo.jpeg", name: "Racine Divo" },
  { id: 44, image: "/assets/images/schools/racine_technique.jpeg", name: "Racine Technique" },
  { id: 45, image: "/assets/images/schools/savant_1.jpeg", name: "Savant 1" },
  { id: 46, image: "/assets/images/schools/semailles.jpeg", name: "Semailles" },
  { id: 47, image: "/assets/images/schools/sinai.jpeg", name: "Sinai" },
  { id: 48, image: "/assets/images/schools/toutia.jpeg", name: "Toutia" },
  { id: 49, image: "/assets/images/schools/visio.jpeg", name: "Visio" }
];



// ===========================
// DONNÉES FUNFACTS/STATISTIQUES
// ===========================

export const funfactData = {
  backgroundImage: "https://via.placeholder.com/1920x600/007bff/ffffff?text=Statistics+Background",
  section: {
    tagline: "Let's support us to help them",
    title: "We've funded 12,503 charity projects for 25M people around the world"
  },
  stats: [
    {
      id: 1,
      icon: "paroti-icon-charity",
      count: 4789,
      title: "Total donations",
      accentColor: null
    },
    {
      id: 2,
      icon: "paroti-icon-solidarity",
      count: 6626,
      title: "Projects funded",
      accentColor: "#fdbe44"
    },
    {
      id: 3,
      icon: "paroti-icon-help",
      count: 9626,
      title: "Kids need help",
      accentColor: "#8139e7"
    },
    {
      id: 4,
      icon: "paroti-icon-heart",
      count: 1056,
      title: "Our volunteers",
      accentColor: "#ff6b35"
    }
  ]
};

// ===========================
// DONNÉES NEWSLETTER
// ===========================

export const newsletterData = {
  backgroundImage: "https://via.placeholder.com/1920x400/343a40/ffffff?text=Newsletter+Background",
  content: {
    tagline: "Subscribe newsletter",
    title: "Get latest updates and deals",
    text: "There are many variations of passages of lorem ipsum available, but the majority have suffered alteration.",
    placeholder: "Enter your email",
    buttonText: "Subscribe"
  }
};


// ===========================
// DONNÉES BLOG/NEWS
// ===========================

export const blogData = {
  section: {
    tagline: "Dernières nouvelles",
    title: "Actualités & Articles"
  },
  posts: [
    {
      id: 1,
      image: "/assets/images/cafop-daloa.png",
      category: "Charity",
      date: "23 Dec, 2022",
      author: "Admin",
      title: "Daloa / CAFOP: ce qui s'est passé hier dans ce centre de formation",
      text: "Hier, samedi 11 mai 2024, le centre d'animation et de formation pédagogique (CAFOP) de Daloa a abrité une cérémonie spéciale.",
      link: "#"
    },
    {
      id: 2,
      image: "/assets/images/drena-seguela.png",
      category: "Donation",
      date: "23 Dec, 2022",
      author: "Admin",
      title: "Séguéla : la DRENA récompense les filles majors des classes d'examens primaire et du secondaire",
      text: "La direction régionale de l'éducation nationale et de l'alphabétisation (DRENA) de Séguéla, dirigée par Mme Assié, a organisé une cérémonie pour récompenser les filles majors des classes de CM2, de Troisième et de Terminale.",
      link: "#"
    },
    {
      id: 3,
      image: "/assets/images/aip.png",
      category: "Volunteer",
      date: "23 Dec, 2022",
      author: "Admin",
      title: "Côte d’Ivoire – AIP / Des élèves de Bocanda instruits sur les valeurs du civisme et de la citoyenneté",
      text: "Les élèves du lycée moderne de Bocanda ont été instruits sur les valeurs du civisme et de la citoyenneté par le directeur départemental de la Promotion de la jeunesse et de l’Emploi des jeunes.",
      link: "blog-details.html"
    }
  ]
};


// Garder toutes les autres données existantes...
export const mobileNavData = {
  contact: [
    {
      id: 1,
      icon: "fa fa-phone",
      text: "+ 33 (01) 23 45 67 89",
      link: "tel:+33123456789",
      type: "external"
    },
    {
      id: 2,
      icon: "fa fa-envelope",
      text: "contact@educare-ecole.fr",
      link: "mailto:contact@educare-ecole.fr",
      type: "external"
    },
    {
      id: 3,
      icon: "fa fa-map-marker-alt",
      text: "123 Avenue de l'Éducation",
      subtext: "Paris, France",
      link: null,
      type: null
    }
  ],
  social: [
    { id: 1, icon: "fab fa-twitter", link: "https://twitter.com/educare", type: "external" },
    { id: 2, icon: "fab fa-facebook-f", link: "https://facebook.com/educare", type: "external" },
    { id: 3, icon: "fab fa-pinterest-p", link: "https://pinterest.com/educare", type: "external" },
    { id: 4, icon: "fab fa-instagram", link: "https://instagram.com/educare", type: "external" }
  ]
};