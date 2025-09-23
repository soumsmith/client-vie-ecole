import React from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { causesData } from "../data/siteData";

// ===========================
// COMPOSANT DONATION CARD
// ===========================
const DonationCard = ({ donation }) => {
  const cardStyle = donation.accentColor
    ? { "--accent-color": donation.accentColor }
    : {};

  return (
    <>
      <div
        className="item tns-item tns-slide-cloned"
        aria-hidden="true"
        tabIndex={-1}
      >
        <div className="donations-card">
          <div className="donations-card__image">
            <img src={donation.image} alt={donation.title} />{" "}
            <div className="donations-card__category">
              <a href={donation.link}>{donation.category}</a>
            </div>
            {/* /.donations-card__category */}
          </div>
          {/* /.donations-card__image */}
          <div className="donations-card__content">
            <h3 className="donations-card__title">
              <a href={donation.link}>{donation.title}</a>
            </h3>
            {/* /.donations-card__title */}
            <p className="donations-card__text">{donation.text}</p>
            {/* <div className="bar">
              <div
                className="bar-inner count-bar--no-appear counted"
                data-percent="36%"
                style={{ width: "36%" }}
              >
                <div className="count-text">36%</div>
              </div>
            </div>
            <div className="donations-card__amount">
              <p>
                <span>$25,270</span> Raised
              </p>
              <p>
                <span>$30,000</span> Goal
              </p>
            </div> */}
            {/* /.donations-card__amount */}
          </div>
          {/* /.donations-card__content */}
        </div>
        {/* /.donations-card */}
      </div>
    </>
  );
};

// ===========================
// COMPOSANT CAUSES CAROUSEL AVEC SPLIDE
// ===========================
const CausesCarousel = ({ donations }) => {
  // Configuration Splide pour causes
  const splideOptions = {
    type: "slide",
    perPage: 3,
    perMove: 1,
    gap: "30px",
    pagination: false,
    arrows: true,
    autoplay: false,
    speed: 800,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    breakpoints: {
      992: {
        perPage: 2,
        gap: "20px",
      },
      576: {
        perPage: 1,
        gap: "15px",
      },
    },
  };

  return (
    <div className="causes-carousel-wrapper">
      <Splide
        options={splideOptions}
        className="causes-splide-carousel"
        aria-label="Causes Carousel"
      >
        {donations.map((donation) => (
          <SplideSlide key={donation.id}>
            <div className="causes-slide-item">
              <DonationCard donation={donation} />
            </div>
          </SplideSlide>
        ))}
      </Splide>

      {/* Styles personnalisés pour Causes Splide */}
      <style jsx>{`
        .causes-carousel-wrapper {
          position: relative;
          margin: 0 -15px;
        }

        .causes-splide-carousel {
          padding: 0 60px;
        }

        .causes-slide-item {
          height: 100%;
        }

        /* Personnalisation des flèches Splide - Style Causes */
        .causes-splide-carousel .splide__arrow {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #e9ecef;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          color: #333;
          font-size: 18px;
          transition: all 0.3s ease;
          opacity: 1;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .causes-splide-carousel .splide__arrow:hover {
          background: #007bff;
          border-color: #007bff;
          color: white;
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
        }

        .causes-splide-carousel .splide__arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .causes-splide-carousel .splide__arrow--prev {
          left: 10px;
        }

        .causes-splide-carousel .splide__arrow--next {
          right: 10px;
        }

        .causes-splide-carousel .splide__arrow svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }

        /* Track et slides */
        .causes-splide-carousel .splide__track {
          overflow: visible;
        }

        .causes-splide-carousel .splide__slide {
          opacity: 0.8;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .causes-splide-carousel .splide__slide.is-active {
          opacity: 1;
        }

        .causes-splide-carousel .splide__slide.is-visible {
          opacity: 0.9;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .causes-splide-carousel {
            padding: 0 50px;
          }
        }

        @media (max-width: 768px) {
          .causes-splide-carousel {
            padding: 0 40px;
          }

          .causes-splide-carousel .splide__arrow {
            width: 40px;
            height: 40px;
            font-size: 14px;
          }

          .causes-splide-carousel .splide__arrow--prev {
            left: 5px;
          }

          .causes-splide-carousel .splide__arrow--next {
            right: 5px;
          }
        }

        @media (max-width: 576px) {
          .causes-splide-carousel {
            padding: 0 30px;
          }

          .causes-splide-carousel .splide__arrow {
            width: 35px;
            height: 35px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

// ===========================
// COMPOSANT CAUSES PRINCIPAL
// ===========================
const Causes = () => {
  const { section, donations } = causesData;

  return (
    <section className="sec-pad-top sec-pad-bottom donation-one">
      <div className="container">
        <div className="sec-title text-center">
          <p className="sec-title__tagline">{section.tagline}</p>
          <h2 className="sec-title__title">{section.title}</h2>
        </div>
        <CausesCarousel donations={donations} />
      </div>
    </section>
  );
};

export default Causes;
