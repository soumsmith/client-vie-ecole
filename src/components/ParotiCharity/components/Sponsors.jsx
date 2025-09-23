import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
// import '@splidejs/react-splide/css';
import { sponsorsData } from '../data/siteData';

// ===========================
// COMPOSANT SPONSOR ITEM
// ===========================
const SponsorItem = ({ sponsor }) => {
  return (
    <div className="item">
      <div className="sponsor-carousel__item">
        <img src={sponsor.image} alt={sponsor.name} />
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT SPONSORS CAROUSEL AVEC SPLIDE
// ===========================
const SponsorsCarousel = ({ sponsors }) => {
  // Configuration Splide pour sponsors
  const splideOptions = {
    type: 'loop',
    perPage: 8,
    perMove: 1,
    gap: '10px',
    pagination: false,
    arrows: false,
    autoplay: true,
    interval: 3000,
    speed: 1000,
    easing: 'linear',
    pauseOnHover: true,
    breakpoints: {
      992: {
        perPage: 4,
        gap: '25px',
      },
      768: {
        perPage: 3,
        gap: '20px',
      },
      576: {
        perPage: 2,
        gap: '15px',
      },
    },
  };

  return (
    <div className="sponsors-carousel-wrapper container">
      <Splide
        options={splideOptions}
        className="sponsors-splide-carousel"
        aria-label="Sponsors Carousel"
      >
        {sponsors.map((sponsor) => (
          <SplideSlide key={sponsor.id}>
            <div className="sponsors-slide-item">
              <SponsorItem sponsor={sponsor} />
            </div>
          </SplideSlide>
        ))}
      </Splide>

      {/* Styles personnalisés pour Sponsors Splide */}
      <style jsx>{`
        .sponsors-carousel-wrapper {
          position: relative;
          padding: 20px 0;
        }

        .sponsors-splide-carousel {
          padding: 0;
        }

        .sponsors-slide-item {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        /* Track et slides */
        // .sponsors-splide-carousel .splide__track {
        //   overflow: visible;
        // }

        .sponsors-splide-carousel .splide__slide {
          opacity: 0.7;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .sponsors-splide-carousel .splide__slide.is-active {
          opacity: 1;
        }

        .sponsors-splide-carousel .splide__slide.is-visible {
          opacity: 0.9;
        }

        /* Style des items sponsors */
        .sponsors-slide-item img {
          max-width: 150px;
          max-height: 80px;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: grayscale(100%);
          transition: all 0.3s ease;
        }

        .sponsors-splide-carousel .splide__slide:hover img {
          filter: grayscale(0%);
          transform: scale(1.1);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sponsors-slide-item {
            padding: 15px;
          }

          .sponsors-slide-item img {
            max-width: 120px;
            max-height: 60px;
          }
        }

        @media (max-width: 576px) {
          .sponsors-slide-item {
            padding: 10px;
          }

          .sponsors-slide-item img {
            max-width: 100px;
            max-height: 50px;
          }
        }


        .sponsor-carousel .splide__slide {
            height: inherit !important;
        }
      `}</style>
    </div>
  );
};

// ===========================
// COMPOSANT SPONSORS PRINCIPAL
// ===========================
const Sponsors = () => {
  return (
    <section className="sec-pad-top sec-pad-bottom sponsor-carousel py-1">
      <div className="container">
        <SponsorsCarousel sponsors={sponsorsData} />
      </div>
    </section>
  );
};

export default Sponsors;
