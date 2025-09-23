import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { donationData } from '../data/siteData';

// ===========================
// COMPOSANT DONATION CARD
// ===========================
const DonationCard = ({ card }) => {
  const cardStyle = card.accentColor ? { '--accent-color': card.accentColor } : {};
  
  return (
    <div className="item h-100">
      <div className="donation-card-two h-100 d-flex flex-column p-4" style={cardStyle}>
        <div className="donation-card-two__bg"></div>
        <h3 className="donation-card-two__title">
          <a href={card.link}>{card.title}</a>
        </h3>
        <p className="donation-card-two__text flex-grow-1">{card.text}</p>
        <i className={`${card.icon} donation-card-two__icon`}></i>
        <a href={card.link}>
          <i className="fa fa-angle-double-right donation-card-two__link"></i>
        </a>
        <div className="donation-card-two__shape"></div>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT DONATION CAROUSEL AVEC SPLIDE
// ===========================
const DonationCarousel = ({ cards }) => {
  // Configuration Splide pour donation
  const splideOptions = {
    type: 'slide',
    perPage: 3,
    perMove: 1,
    gap: '10px',
    pagination: false,
    arrows: true,
    autoplay: false,
    speed: 800,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    breakpoints: {
      576: {
        perPage: 1,
        gap: '15px',
      },
    },
  };

  return (
    <div className="donation-carousel-wrapper">
      <Splide
        options={splideOptions}
        className="donation-splide-carousel"
        aria-label="Donation Cards Carousel"
      >
        {cards.map((card) => (
          <SplideSlide key={card.id}>
            <div className="donation-slide-item d-flex align-items-stretch">
              <DonationCard card={card} />
            </div>
          </SplideSlide>
        ))}
      </Splide>

      {/* Styles personnalisés pour Donation Splide */}
      <style jsx>{`
        .donation-carousel-wrapper {
          position: relative;
          margin: 0 -15px;
        }

        .donation-splide-carousel {
          padding: 0 50px;
        }

        .donation-slide-item {
          height: 100%;
        }

        /* Personnalisation des flèches Splide - Style Donation */
        .donation-splide-carousel .splide__arrow {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #e9ecef;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          color: #333;
          font-size: 16px;
          transition: all 0.3s ease;
          opacity: 1;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .donation-splide-carousel .splide__arrow:hover {
          background: #007bff;
          border-color: #007bff;
          color: white;
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
        }

      `}</style>
    </div>
  );
};

// ===========================
// COMPOSANT DONATION SECTION
// ===========================
const DonationSection = ({ section }) => {
  return (
    <div className="col-md-12 col-lg-4">
      <div className="sec-title">
        <p className="sec-title__tagline">{section.tagline}</p>
        <h2 className="sec-title__title">{section.title}</h2>
      </div>
      <p className="donation-two__text">{section.text}</p>
    </div>
  );
};

// ===========================
// COMPOSANT DONATION PRINCIPAL
// ===========================
const Donation = () => {
  const { section, cards } = donationData;

  return (
    <section id='Niveau' className="sec-pad-top sec-pad-bottom donation-two">
      <div className="container">
        <div className="row gutter-y-60">
          <DonationSection section={section} />
          <div className="col-md-12 col-lg-8">
            <DonationCarousel cards={cards} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Donation;
