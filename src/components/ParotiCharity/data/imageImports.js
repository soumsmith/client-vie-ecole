// ===========================
// IMPORTS D'IMAGES POUR REACT
// ===========================

// Images de fond pour le slider
import slider1 from '../../assets/images/backgrounds/slider-1-1.jpg';
import slider2 from '../../assets/images/backgrounds/slider-1-2.jpg';
import slider3 from '../../assets/images/backgrounds/slider-1-3.jpg';

// Images pour la section About
import aboutShape from '../../assets/images/shapes/about-2-1.png';
import aboutImage from '../../assets/images/resources/about-2-1.png';

// Images pour CTA
import ctaBackground from '../../assets/images/backgrounds/cta-bg-1-1.jpg';
import ctaShape from '../../assets/images/shapes/cta-s-1-1.png';

// Images pour les donations
import donation1 from '../../assets/images/donations/donations-1-1.jpg';
import donation2 from '../../assets/images/donations/donations-1-2.jpg';
import donation3 from '../../assets/images/donations/donations-1-3.jpg';

// Logo
import logo from '../../assets/images/logo-dark.png';

// ===========================
// EXPORTS DES IMAGES
// ===========================

export const images = {
  // Logo
  logo,
  
  // Slider backgrounds
  slider: {
    slide1: slider1,
    slide2: slider2,
    slide3: slider3
  },
  
  // About section
  about: {
    shape: aboutShape,
    image: aboutImage
  },
  
  // CTA section
  cta: {
    background: ctaBackground,
    shape: ctaShape
  },
  
  // Donations
  donations: {
    donation1,
    donation2,
    donation3
  }
};

// Export par défaut
export default images;
