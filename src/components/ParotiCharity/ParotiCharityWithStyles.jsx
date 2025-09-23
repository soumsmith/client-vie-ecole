import React from 'react';
import Header from './components/Header';
import Slider from './components/Slider';
import About from './components/About';
import Donation from './components/Donation';
import CTA from './components/CTA';
import Causes from './components/Causes';
import MobileNav from './components/MobileNav';

// Import direct des styles CSS
import '../assets/vendors/bootstrap/css/bootstrap.min.css';
import '../assets/vendors/animate/animate.min.css';
import '../assets/vendors/fontawesome/css/all.min.css';
import '../assets/vendors/owl-carousel/owl.carousel.min.css';
import '../assets/vendors/owl-carousel/owl.theme.default.min.css';
import '../assets/vendors/jquery-magnific-popup/jquery.magnific-popup.css';
import '../assets/vendors/paroti-icons/style.css';
import '../assets/vendors/tiny-slider/tiny-slider.min.css';
import '../assets/css/paroti.css';

// Styles spécifiques React
const reactStyles = `
  .page-wrapper {
    position: relative;
    overflow-x: hidden;
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

  .mobile-nav__wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    pointer-events: none;
  }

  .mobile-nav__wrapper.expanded {
    pointer-events: auto;
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
  }

  .search-popup.active {
    pointer-events: auto;
    opacity: 1;
  }

  .owl-carousel .owl-item {
    -webkit-tap-highlight-color: transparent;
    position: relative;
  }

  .owl-carousel .owl-item img {
    display: block;
    width: 100%;
  }

  .count-box.counted .count-text {
    animation: countUp 2s ease-in-out;
  }

  @keyframes countUp {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .progress-box__bar__inner.counted {
    transition: width 2s ease-in-out;
  }

  .donation-card:hover,
  .donation-card-two:hover {
    transform: translateY(-5px);
    transition: transform 0.3s ease;
  }

  @media (max-width: 768px) {
    .main-menu__list {
      display: none;
    }
    
    .main-header__toggler {
      display: block;
    }
  }

  @media (min-width: 769px) {
    .main-header__toggler {
      display: none;
    }
  }
`;

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
// COMPOSANT PAROTI CHARITY PRINCIPAL
// ===========================
const ParotiCharityWithStyles = () => {
  return (
    <>
      {/* Injection des styles React */}
      <style>{reactStyles}</style>
      
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

export default ParotiCharityWithStyles;
