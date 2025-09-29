/**
 * Configuration du menu dynamique
 * Définit la structure et le comportement de chaque élément du menu
 */

export const menuItems = [
  {
    label: "Accueil",
    key: "home",
    type: "redirect",
    path: "/",
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
    type: "dropdown",
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
      },
      {
        label: "Récupérer mot de passe",
        key: "obtenirMotdePasse",
        type: "modal",
        modalType: "obtenir-mot-de-passe",
        icon: "🔑"
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
    method: "POST",
    loginFields: {
      email: "email",
      login: "login",
      password: "motdePasse",
      schoolId: "ecoleid",
      profileId: "profilid"
    },
    redirectPath: "/dashboard/",
    fields: {
      showSchoolSelector: false,
      showProfileSelector: false,
      emailLabel: "Nom d'utilisateur",
      passwordLabel: "Mot de passe"
    },
    buttons: {
      submitText: "Se connecter",
      loadingText: "Connexion...",
      cancelText: "Annuler",
      submitColor: "#667eea"
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
      login: "login"
    },
    redirectPath: "/dashboard/",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: true,
      emailLabel: "Nom d'utilisateur",
      passwordLabel: "Mot de passe"
    },
    buttons: {
      submitText: "Se connecter",
      loadingText: "Connexion...",
      cancelText: "Annuler",
      submitColor: "#667eea"
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
    method: "GET",
    loginFields: {
      email: "login",
      password: "motDepasse"
    },
    redirectPath: "/dashboard/",
    fields: {
      showSchoolSelector: false,
      showProfileSelector: false,
      emailLabel: "Email",
      passwordLabel: "Mot de passe"
    },
    buttons: {
      submitText: "Se connecter",
      loadingText: "Vérification...",
      cancelText: "Annuler",
      submitColor: "#667eea"
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
    redirectPath: "/dashboard/",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: false,
      emailLabel: "Email",
      passwordLabel: "Mot de passe"
    },
    buttons: {
      submitText: "Se connecter",
      loadingText: "Connexion...",
      cancelText: "Annuler",
      submitColor: "#667eea"
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
    redirectPath: "/dashboard/",
    fields: {
      showSchoolSelector: true,
      showProfileSelector: false,
      emailLabel: "Email",
      passwordLabel: "Mot de passe"
    },
    buttons: {
      submitText: "Se connecter",
      loadingText: "Connexion...",
      cancelText: "Annuler",
      submitColor: "#667eea"
    }
  },
  obtenirMotdePasse: {
    title: "Récupérer mot de passe",
    description: "Entrez votre email pour recevoir un lien de réinitialisation",
    icon: "🔑",
    apis: {
      login: "connexion/parametreLogin",
      sendMail: "connexion/send-email"
    },
    method: "GET",
    loginFields: {
      email: "student_email"
    },
    redirectPath: "/",
    fields: {
      showSchoolSelector: false,
      showProfileSelector: false,
      emailLabel: "Email"
    },
    buttons: {
      submitText: "Envoyer le lien",
      loadingText: "Envoi en cours...",
      cancelText: "Retour",
      submitColor: "#28a745" // Couleur verte pour différencier
    }
  }
};

export default { menuItems, modalConfig };