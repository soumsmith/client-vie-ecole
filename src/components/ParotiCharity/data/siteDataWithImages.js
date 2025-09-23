// ===========================
// DONNÉES DU SITE AVEC IMPORTS D'IMAGES
// ===========================

import { images } from './imageImports';

export const siteConfig = {
  title: "Home One || Paroti || Non Profit Charity HTML Template",
  logo: images.logo,
  logoAlt: "Paroti Charity Logo"
};

// ===========================
// DONNÉES DE NAVIGATION
// ===========================

export const navigationData = {
  topbar: {
    info: [
      {
        id: 1,
        icon: "fa fa-map",
        text: "88 broklyn golden street. New York",
        link: "#"
      },
      {
        id: 2,
        icon: "fa fa-envelope-open",
        text: "needhelp@company.com",
        link: "mailto:needhelp@company.com"
      },
      {
        id: 3,
        icon: "fa fa-mobile",
        text: "+ 1 (307) 776-0608",
        link: "tel:+1(307)776-0608"
      }
    ],
    social: [
      { id: 1, icon: "fab fa-twitter", link: "#" },
      { id: 2, icon: "fab fa-facebook", link: "#" },
      { id: 3, icon: "fab fa-pinterest", link: "#" },
      { id: 4, icon: "fab fa-instagram", link: "#" }
    ],
    links: [
      { id: 1, text: "Login", link: "#" },
      { id: 2, text: "Register", link: "#" }
    ]
  },
  mainMenu: [
    {
      id: 1,
      text: "Home",
      link: "index.html",
      current: true,
      hasChildren: true,
      children: [
        { id: 1, text: "Home one", link: "index.html", current: true },
        { id: 2, text: "Home two", link: "index-2.html" },
        { id: 3, text: "Home three", link: "index-3.html" },
        {
          id: 4,
          text: "Header styles",
          link: "index.html",
          current: true,
          hasChildren: true,
          children: [
            { id: 1, text: "Header one", link: "index.html", current: true },
            { id: 2, text: "Header two", link: "index-2.html" },
            { id: 3, text: "Header three", link: "index-3.html" }
          ]
        }
      ]
    },
    {
      id: 2,
      text: "Pages",
      link: "#",
      hasChildren: true,
      children: [
        { id: 1, text: "About us", link: "about.html" },
        { id: 2, text: "Our volunteer", link: "volunteers.html" }
      ]
    },
    {
      id: 3,
      text: "Donations",
      link: "donations.html",
      hasChildren: true,
      children: [
        { id: 1, text: "Donations", link: "donations.html" },
        { id: 2, text: "Donations details", link: "donations-details.html" }
      ]
    },
    {
      id: 4,
      text: "Events",
      link: "events.html",
      hasChildren: true,
      children: [
        { id: 1, text: "Events", link: "events.html" },
        { id: 2, text: "Events details", link: "event-details.html" }
      ]
    },
    {
      id: 5,
      text: "Blog",
      link: "blog.html",
      hasChildren: true,
      children: [
        { id: 1, text: "Blog", link: "blog.html" },
        { id: 2, text: "Blog details", link: "blog-details.html" }
      ]
    },
    {
      id: 6,
      text: "Contact",
      link: "contact.html"
    }
  ],
  cta: {
    icon: "paroti-icon-volunteer",
    subtitle: "Join us now",
    title: "Become a Volunteer",
    link: "contact.html",
    button: {
      text: "Donate Now",
      icon: "fa fa-heart",
      link: "donations-details.html"
    }
  }
};

// ===========================
// DONNÉES DU SLIDER
// ===========================

export const sliderData = [
  {
    id: 1,
    backgroundImage: images.slider.slide1,
    title: "Be a <span>voice</span> <br> for poor people",
    text: "We are here to support you every step of the way",
    button: {
      text: "Discover More",
      link: "about.html"
    }
  },
  {
    id: 2,
    backgroundImage: images.slider.slide2,
    title: "Be a <span>voice</span> <br> for poor people",
    text: "We are here to support you every step of the way",
    button: {
      text: "Discover More",
      link: "about.html"
    }
  },
  {
    id: 3,
    backgroundImage: images.slider.slide3,
    title: "Be a <span>voice</span> <br> for poor people",
    text: "We are here to support you every step of the way",
    button: {
      text: "Discover More",
      link: "about.html"
    }
  }
];

// ===========================
// DONNÉES DE LA SECTION ABOUT
// ===========================

export const aboutData = {
  shape: images.about.shape,
  image: images.about.image,
  caption: {
    count: "30",
    text: "Years of work expeirece"
  },
  content: {
    tagline: "Welcome to charity agency",
    title: "Make your goals to help people",
    text: "There are many variations of passages of lorem ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.",
    info: [
      {
        id: 1,
        icon: "paroti-icon-sponsor",
        title: "Let's sponsor an entire project",
        accentColor: null
      },
      {
        id: 2,
        icon: "paroti-icon-solidarity",
        title: "Donate to the new cause",
        accentColor: "#8139e7"
      }
    ],
    list: [
      "If you are going to use a passage of you need.",
      "Lorem ipsum available, but the majority have suffered."
    ],
    button: {
      text: "Discover More",
      link: "about.html"
    }
  }
};

// ===========================
// DONNÉES DES DONATIONS
// ===========================

export const donationData = {
  section: {
    tagline: "Change everything",
    title: "We're here to help them",
    text: "Man braid hell of edison bulb four brunch subway tile authentic, chillwave put a bird on it church-key try-hard ramps heirloom."
  },
  cards: [
    {
      id: 1,
      title: "Healthy food",
      text: "When nothing prevents our to we like best, every pleasure to be.",
      icon: "paroti-icon-organic-food",
      link: "donation-details.html",
      accentColor: null
    },
    {
      id: 2,
      title: "Kids education",
      text: "When nothing prevents our to we like best, every pleasure to be.",
      icon: "paroti-icon-education",
      link: "donation-details.html",
      accentColor: "#fdbe44"
    },
    {
      id: 3,
      title: "Medical care",
      text: "When nothing prevents our to we like best, every pleasure to be.",
      icon: "paroti-icon-patient",
      link: "donation-details.html",
      accentColor: "#8139e7"
    }
  ]
};

// ===========================
// DONNÉES CTA (Call to Action)
// ===========================

export const ctaData = {
  backgroundImage: images.cta.background,
  shapeImage: images.cta.shape,
  tagline: "We're here to support poor people",
  title: "Fundraising for the people and <br> <span>causes</span> you care about",
  button: {
    text: "Start donating thAem",
    link: "donations.html"
  }
};

// ===========================
// DONNÉES DES CAUSES POPULAIRES
// ===========================

export const causesData = {
  section: {
    tagline: "Start donating them",
    title: "Find popular causes"
  },
  donations: [
    {
      id: 1,
      image: images.donations.donation1,
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
      image: images.donations.donation2,
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
      image: images.donations.donation3,
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

// ===========================
// DONNÉES DU MOBILE NAV
// ===========================

export const mobileNavData = {
  contact: [
    {
      id: 1,
      icon: "fa fa-phone",
      text: "+ 88 ( 9800 ) 6802",
      link: "tel:+8898006802"
    },
    {
      id: 2,
      icon: "fa fa-envelope",
      text: "needhelp@company.com",
      link: "mailto:needhelp@company.com"
    },
    {
      id: 3,
      icon: "fa fa-map-marker-alt",
      text: "88 Broklyn Golden Road Street",
      subtext: "New York. USA",
      link: null
    }
  ],
  social: [
    { id: 1, icon: "fab fa-twitter", link: "#" },
    { id: 2, icon: "fab fa-facebook-f", link: "#" },
    { id: 3, icon: "fab fa-pinterest-p", link: "#" },
    { id: 4, icon: "fab fa-instagram", link: "#" }
  ]
};
