/**
 * Configuration du menu dynamique
 * Définit la structure et le comportement de chaque élément du menu
 */

export const menuItems = [
  {
    label: "Accueil",
    key: "home",
    type: "redirect", // redirect ou modal
    path: "/", // pour les redirections
    icon: "🏠"
  },
  {
    label: "À propos",
    key: "about",
    type: "redirect",
    path: "/about",
    icon: "ℹ️"
  },
  {
    label: "Se connecter",
    key: "login",
    type: "dropdown", // type spécial pour menu déroulant
    icon: "👤",
    children: [
      {
        label: "Administrateur",
        key: "admin",
        type: "modal",
        modalType: "admin",
        icon: "👨‍💼"
      },
      {
        label: "Personnel",
        key: "personnel",
        type: "modal",
        modalType: "personnel",
        icon: "👨‍💼"
      },
      {
        label: "Candidat",
        key: "candidat",
        type: "modal",
        modalType: "candidat",
        icon: "🎓"
      },
      {
        label: "Parent",
        key: "parent",
        type: "modal",
        modalType: "parent",
        icon: "👨‍👩‍👧‍👦"
      },
      {
        label: "Élève",
        key: "eleve",
        type: "modal",
        modalType: "eleve",
        icon: "🎒"
      }
    ]
  },
  {
    label: "Services",
    key: "services",
    type: "redirect",
    path: "/services",
    icon: "⚙️"
  },
  {
    label: "Contact",
    key: "contact",
    type: "redirect",
    path: "/contact",
    icon: "📞"
  },
  {
    label: "Classe-Elèves",
    key: "classe-eleves",
    type: "redirect",
    path: "/classe-eleves",
    icon: "👨‍🎓"
  }
];

/**
 * Configuration des APIs pour chaque type de modal
 */
export const modalConfig = {
  admin: {
    title: "Connexion admin",
    description: "Connectez-vous à votre espace personnel",
    icon: "👨‍💼",
    apis: {
      schools: "/connecte/ecole",
      profiles: "/profil",
      login: "connexion/se-connecter-admin"
    },
    // Nouvelle configuration pour la méthode HTTP
    method: "POST", // ou "GET"
    // Configuration des champs de connexion
    loginFields: {
      email: "email",      // formData.email -> username
      login: "login", 
      password: "motdePasse", // formData.password -> motdePasse
      schoolId: "ecoleid",    // formData.schoolId -> ecoleid
      profileId: "profilid"   // formData.profileId -> profilid
    },
    redirectPath: "/dashboard/personnel",
    fields: {
      showSchoolSelector: false,
      showProfileSelector: false,
      emailLabel: "Nom d'utilisateur",
      passwordLabel: "Mot de passe"
    }
  },
  personnel: {
    title: "Connexion Personnel",
    description: "Connectez-vous à votre espace personnel",
    icon: "👨‍💼",
    apis: {
      schools: "/connecte/ecole",
      profiles: "/profil",
      login: "connexion/se-connecter"
    },
    method: "POST",
    loginFields: {
      email: "email",
      password: "motdePasse",
      schoolId: "ecoleid",
      profileId: "profilid",
      // Champ supplémentaire pour certains cas
      login: "login" // sera mappé avec formData.email
    },
    redirectPath: "/dashboard/personnel",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: true,
      emailLabel: "Nom d'utilisateur",
      passwordLabel: "Mot de passe"
    }
  },
  candidat: {
    title: "Connexion Candidat",
    description: "Accédez à votre espace candidat",
    icon: "🎓",
    apis: {
      schools: "/connecte/ecole",
      profiles: "/profil",
      login: "connexion/checkPassword"
    },
    method: "GET", // Exemple d'utilisation de GET
    loginFields: {
      email: "login",
      password: "motDepasse", // Nom différent pour les candidats
      //schoolId: "school_id", // Nom différent
      //profileId: "profile_id"
    },
    redirectPath: "/dashboard/candidat",
    fields: {
      showSchoolSelector: false,
      showProfileSelector: false,
      emailLabel: "Email",
      passwordLabel: "Mot de passe"
    }
  },
  parent: {
    title: "Connexion Parent",
    description: "Suivez la scolarité de votre enfant",
    icon: "👨‍👩‍👧‍👦",
    apis: {
      schools: "/connecte/ecole",
      profiles: "/profil",
      login: "connexion/se-connecter"
    },
    method: "POST",
    loginFields: {
      email: "parent_email",
      password: "parent_password",
      schoolId: "ecoleid",
      profileId: "profilid"
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
    icon: "🎒",
    apis: {
      schools: "/connecte/ecole",
      profiles: "/profil",
      login: "connexion/se-connecter"
    },
    method: "POST",
    loginFields: {
      email: "student_email",
      password: "student_password",
      schoolId: "ecoleid",
      profileId: "profilid"
    },
    redirectPath: "/dashboard/eleve",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: false,
      emailLabel: "Email",
      passwordLabel: "Mot de passe"
    }
  }
};

export default { menuItems, modalConfig };