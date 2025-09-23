import React from 'react';
import Header from './components/Header';
import Slider from './components/Slider';
import About from './components/About';
import Donation from './components/Donation';
import CTA from './components/CTA';
import Causes from './components/Causes';
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
// COMPOSANT PRELOADER
// ===========================
const Preloader = () => {
  return (
    <div className="preloader">
      <div className="preloader__image" style={{ backgroundImage: 'url(assets/images/loader.png)' }}></div>
    </div>
  );
};

// ===========================
// COMPOSANT PAROTI CHARITY CLEAN
// ===========================
const ParotiCharityClean = () => {
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

        .preloader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preloader__image {
          width: 100px;
          height: 100px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
      `}</style>

      <div className="page-wrapper">
        {/* Preloader */}
        <Preloader />

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

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Search Popup */}
        <SearchPopup />
      </div>
    </>
  );
};

export default ParotiCharityClean;
