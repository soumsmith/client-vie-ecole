import React from 'react';
import Header from './components/Header';
import Slider from './components/Slider';
import About from './components/About';
import Donation from './components/Donation';
import CTA from './components/CTA';
import Causes from './components/Causes';
import Testimonials from './components/Testimonials';
import Gallery from './components/Gallery';
import Video from './components/Video';
import Sponsors from './components/Sponsors';
import Funfact from './components/Funfact';
import Blog from './components/Blog';
import Newsletter from './components/Newsletter';
import MobileNav from './components/MobileNav';

// Import des styles CSS SANS FontAwesome local
import '../assets/vendors/bootstrap/css/bootstrap.min.css';
import '../assets/vendors/animate/animate.min.css';
import '../assets/vendors/owl-carousel/owl.carousel.min.css';
import '../assets/vendors/owl-carousel/owl.theme.default.min.css';
import '../assets/vendors/jquery-magnific-popup/jquery.magnific-popup.css';
import '../assets/vendors/paroti-icons/style.css';
import '../assets/vendors/tiny-slider/dist/tiny-slider.css';
import '../assets/css/paroti.css';

// ===========================
// COMPOSANT SEARCH POPUP
// ===========================
const SearchPopup = () => {
  return (
    <div className="search-popup">
      <div className="search-popup__overlay search-toggler"></div>
      <div className="search-popup__content">
        <form action="#">
          <label htmlFor="search" className="sr-only">search here</label>
          <input type="text" id="search" placeholder="Search Here..." />
          <button type="submit" aria-label="search submit" className="thm-btn">
            <i className="fa fa-search"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT PAROTI CHARITY SIMPLE (SANS PRELOADER)
// ===========================
const ParotiCharitySimple = () => {
  return (
    <>
      {/* FontAwesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
        crossOrigin="anonymous"
      />
      
      {/* Styles personnalisés */}
      <style>{`
        .page-wrapper {
          position: relative;
          overflow-x: hidden;
          min-height: 100vh;
        }

        .main-header {
          position: relative;
          z-index: 99;
        }

        .sticky-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 999;
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .mobile-nav__wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 999;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .mobile-nav__wrapper.expanded {
          pointer-events: auto;
          opacity: 1;
        }

        .search-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9998;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-popup.active {
          pointer-events: auto;
          opacity: 1;
        }

        @media (max-width: 991px) {
          .main-menu__list {
            display: none;
          }
          
          .main-header__toggler {
            display: flex !important;
          }
        }

        @media (min-width: 992px) {
          .main-header__toggler {
            display: none !important;
          }
        }

        /* Fallback pour icônes Paroti */
        .paroti-icon-volunteer:before { content: '\\f4c0'; font-family: 'Font Awesome 6 Free'; font-weight: 900; }
        .paroti-icon-sponsor:before { content: '\\f4b9'; font-family: 'Font Awesome 6 Free'; font-weight: 900; }
        .paroti-icon-solidarity:before { content: '\\f4c4'; font-family: 'Font Awesome 6 Free'; font-weight: 900; }
        .paroti-icon-organic-food:before { content: '\\f5d1'; font-family: 'Font Awesome 6 Free'; font-weight: 900; }
        .paroti-icon-education:before { content: '\\f19d'; font-family: 'Font Awesome 6 Free'; font-weight: 900; }
        .paroti-icon-patient:before { content: '\\f7fd'; font-family: 'Font Awesome 6 Free'; font-weight: 900; }
        .paroti-icon-magnifying-glass:before { content: '\\f002'; font-family: 'Font Awesome 6 Free'; font-weight: 900; }
        .paroti-icon-shopping-cart:before { content: '\\f07a'; font-family: 'Font Awesome 6 Free'; font-weight: 900; }
        .paroti-icon-left-arrow:before { content: '\\f104'; font-family: 'Font Awesome 6 Free'; font-weight: 900; }
        .paroti-icon-right-arrow:before { content: '\\f105'; font-family: 'Font Awesome 6 Free'; font-weight: 900; }

        /* Animations pour les éléments */
        .count-box.counted .count-text {
          animation: countUp 2s ease-in-out;
        }

        @keyframes countUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .progress-box__bar__inner.counted {
          transition: width 2s ease-in-out;
        }

        .donation-card:hover,
        .donation-card-two:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .thm-btn:hover {
          transform: translateY(-2px);
          transition: transform 0.3s ease;
        }
      `}</style>

      <div className="page-wrapper">
        {/* PAS DE PRELOADER - Chargement direct */}

        {/* Header */}
        <Header />

        {/* Slider */}
        <Slider />

        {/* About Section */}
        <About />

        {/* Donation Section */}
        <Donation />

        {/* CTA Section */}
        <CTA />

        {/* Causes Section */}
        <Causes />

        {/* Testimonials Section */}
        <Testimonials />

        {/* Gallery Section */}
        <Gallery />

        {/* Video Section */}
        <Video />

        {/* Sponsors Section */}
        <Sponsors />

        {/* Funfact/Statistics Section */}
        <Funfact />

        {/* Blog Section */}
        <Blog />

        {/* Newsletter Section */}
        <Newsletter />

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Search Popup */}
        <SearchPopup />
      </div>
    </>
  );
};

export default ParotiCharitySimple;
