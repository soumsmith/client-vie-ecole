import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/css';

// ===========================
// DONNÉES DU SLIDER
// ===========================
const sliderData = [
  {
    id: 1,
    backgroundImage: "/assets/images/backgrounds/slider-1-1.jpg",
    title: "Donnez une <span style='color: #fdbe44;'>éducation</span> <br> aux enfants défavorisés",
    text: "Nous accompagnons chaque élève vers la réussite scolaire",
    button: {
      text: "En savoir plus",
      link: "/a-propos",
      type: "route"
    }
  },
  {
    id: 2,
    backgroundImage: "/assets/images/backgrounds/slider-1-2.jpg",
    title: "Construisons <span style='color: #fdbe44;'>l'avenir</span> <br> par l'éducation",
    text: "Chaque enfant mérite d'avoir accès à une éducation de qualité",
    button: {
      text: "Découvrir nos actions",
      link: "/programmes",
      type: "route"
    }
  },
  {
    id: 3,
    backgroundImage: "/assets/images/backgrounds/slider-1-3.jpg",
    title: "L'<span style='color: #fdbe44;'>école</span> pour tous <br> sans exception",
    text: "Ensemble, brisons les barrières à l'éducation",
    button: {
      text: "Nous rejoindre",
      link: "/contact",
      type: "route"
    }
  },
  {
    id: 4,
    backgroundImage: "/assets/images/backgrounds/slider-1-1.jpg",
    title: "Développons les <span style='color: #fdbe44;'>talents</span> <br> de chaque enfant",
    text: "Accompagnement personnalisé pour révéler le potentiel de tous",
    button: {
      text: "Voir nos méthodes",
      link: "/programmes",
      type: "route"
    }
  },
  {
    id: 5,
    backgroundImage: "/assets/images/backgrounds/slider-1-2.jpg",
    title: "Une <span style='color: #fdbe44;'>formation</span> <br> d'excellence pour tous",
    text: "Des outils modernes au service de l'apprentissage",
    button: {
      text: "Découvrir",
      link: "/about",
      type: "route"
    }
  }
];

// ===========================
// STYLES INLINE
// ===========================
const styles = {
  sliderContainer: {
    position: 'relative',
    height: '500px', // Hauteur réduite
    overflow: 'hidden'
  },
  slideItem: {
    position: 'relative',
    height: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 1
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2
  },
  content: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    color: '#ffffff'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '20px',
    lineHeight: '1.2',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
  },
  text: {
    fontSize: '1.1rem',
    color: '#ffffff',
    marginBottom: '30px',
    maxWidth: '600px',
    lineHeight: '1.6',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
  },
  // button: {
  //   display: 'inline-block',
  //   background: '#8139e7',
  //   color: '#ffffff',
  //   padding: '15px 35px',
  //   fontSize: '1rem',
  //   fontWeight: '600',
  //   textDecoration: 'none',
  //   borderRadius: '5px',
  //   transition: 'all 0.3s ease',
  //   border: 'none',
  //   cursor: 'pointer',
  //   textTransform: 'uppercase',
  //   letterSpacing: '1px'
  // }
};

// ===========================
// COMPOSANT SLIDE ITEM
// ===========================
const SlideItem = ({ slide }) => {
  const handleButtonClick = () => {
    if (slide.button.type === 'route') {
      console.log(`Navigation vers: ${slide.button.link}`);
      // Intégrez votre logique de navigation React Router ici
    }
  };

  return (
    <div style={styles.slideItem}>
      {/* Image de fond */}
      <div 
        style={{
          ...styles.backgroundImage,
          backgroundImage: `url(${slide.backgroundImage})`
        }}
      ></div>
      
      {/* Overlay sombre */}
      <div style={styles.overlay}></div>
      
      {/* Contenu textuel */}
      <div style={styles.content}>
        <h2 
          style={styles.title}
          dangerouslySetInnerHTML={{ __html: slide.title }}
        ></h2>
        <p style={styles.text}>{slide.text}</p>
        <div style={{ marginTop: '40px' }}>
          <button 
          className='thm-btn about-two__btn'
            onClick={handleButtonClick}
            style={styles.button}
            onMouseEnter={(e) => {
              // e.target.style.background = '#6c2bd9';
              e.target.style.transform = 'translateY(-2px)';
              // e.target.style.boxShadow = '0 5px 15px rgba(129, 57, 231, 0.4)';
            }}
            onMouseLeave={(e) => {
              // e.target.style.background = '#8139e7';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span>{slide.button.text}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT SLIDER PRINCIPAL
// ===========================
const SplideSlider = () => {
  const splideOptions = {
    type: 'loop',
    autoplay: true,
    interval: 7000,
    pauseOnHover: true,
    pauseOnFocus: false,
    arrows: true,
    pagination: true,
    speed: 1000,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    height: '500px',
    fixedHeight: '500px'
  };

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={styles.sliderContainer}>
        <Splide options={splideOptions}>
          {sliderData.map((slide) => (
            <SplideSlide key={slide.id}>
              <SlideItem slide={slide} />
            </SplideSlide>
          ))}
        </Splide>
      </div>
      
      {/* CSS pour les contrôles Splide */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .splide__arrow {
            background: rgba(255, 255, 255, 0.1) !important;
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 50% !important;
            width: 50px !important;
            height: 50px !important;
            transition: all 0.3s ease !important;
          }
          
          .splide__arrow:hover {
            background: #8139e7 !important;
            border-color: #8139e7 !important;
            transform: scale(1.1) !important;
          }
          
          .splide__arrow svg {
            fill: #ffffff !important;
            width: 16px !important;
            height: 16px !important;
          }
          
          .splide__pagination {
            bottom: 20px !important;
          }
          
          .splide__pagination__page {
            width: 12px !important;
            height: 12px !important;
            border-radius: 50% !important;
            background: rgba(255, 255, 255, 0.5) !important;
            margin: 0 5px !important;
            transition: all 0.3s ease !important;
          }
          
          .splide__pagination__page.is-active {
            background: #fdbe44 !important;
            transform: scale(1.3) !important;
          }
          
          .splide__slide {
            height: 500px !important;
          }
          
          @media (max-width: 768px) {
            .splide__slide {
              height: 400px !important;
            }
          }
          
          @media (max-width: 480px) {
            .splide__slide {
              height: 350px !important;
            }
            
            .splide__arrow {
              width: 40px !important;
              height: 40px !important;
            }
          }
        `
      }} />
    </section>
  );
};

export default SplideSlider;