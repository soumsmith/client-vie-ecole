import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { galleryData } from '../data/siteData';

// ===========================
// COMPOSANT GALLERY ITEM
// ===========================
const GalleryItem = ({ item }) => {
  return (
    <div className="item">
      <div className="gallery-one__item">
        <img src={item.image} alt={item.title} />
        <div className="gallery-one__item__content">
          <a href={item.image} className="gallery-one__item__btn img-popup">
            <i className="fa fa-plus"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT GALLERY CAROUSEL AVEC SPLIDE
// ===========================
const GalleryCarousel = ({ items }) => {
  // Configuration Splide pour galerie
  const splideOptions = {
    type: 'loop',
    perPage: 5,
    perMove: 1,
    gap: '30px',
    pagination: false,
    arrows: true,
    autoplay: true,
    interval: 4000,
    pauseOnHover: true,
    speed: 800,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    breakpoints: {
      1200: {
        perPage: 4,
        gap: '25px',
      },
      992: {
        perPage: 3,
        gap: '20px',
      },
      768: {
        perPage: 2,
        gap: '15px',
      },
      576: {
        perPage: 1,
        gap: '10px',
      },
    },
  };

  return (
    <div className="gallery-carousel-wrapper">
      <Splide
        options={splideOptions}
        className="gallery-splide-carousel"
        aria-label="Gallery Images Carousel"
      >
        {items.map((item) => (
          <SplideSlide key={item.id}>
            <div className="gallery-slide-item">
              <GalleryItem item={item} />
            </div>
          </SplideSlide>
        ))}
      </Splide>

      {/* Styles personnalisés pour Gallery Splide */}
      <style jsx>{`
        .gallery-carousel-wrapper {
          position: relative;
          margin: 0 -15px;
        }

        .gallery-splide-carousel {
          padding: 0 60px;
        }

        .gallery-slide-item {
          height: 100%;
        }

        /* Personnalisation des flèches Splide - Style Gallery */
        .gallery-splide-carousel .splide__arrow {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #e9ecef;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          color: #333;
          font-size: 18px;
          transition: all 0.3s ease;
          opacity: 1;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
        }

        .gallery-splide-carousel .splide__arrow:hover {
          background: #007bff;
          border-color: #007bff;
          color: white;
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
        }

        .gallery-splide-carousel .splide__arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .gallery-splide-carousel .splide__arrow--prev {
          left: 10px;
        }

        .gallery-splide-carousel .splide__arrow--next {
          right: 10px;
        }

        .gallery-splide-carousel .splide__arrow svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }

        /* Track et slides */
        .gallery-splide-carousel .splide__track {
          overflow: visible;
        }

        .gallery-splide-carousel .splide__slide {
          opacity: 0.8;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .gallery-splide-carousel .splide__slide.is-active {
          opacity: 1;
          transform: scale(1.02);
        }

        .gallery-splide-carousel .splide__slide.is-visible {
          opacity: 0.9;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .gallery-splide-carousel {
            padding: 0 55px;
          }
        }

        @media (max-width: 992px) {
          .gallery-splide-carousel {
            padding: 0 50px;
          }
        }

        @media (max-width: 768px) {
          .gallery-splide-carousel {
            padding: 0 40px;
          }

          .gallery-splide-carousel .splide__arrow {
            width: 40px;
            height: 40px;
            font-size: 14px;
          }

          .gallery-splide-carousel .splide__arrow--prev {
            left: 5px;
          }

          .gallery-splide-carousel .splide__arrow--next {
            right: 5px;
          }
        }

        @media (max-width: 576px) {
          .gallery-splide-carousel {
            padding: 0 30px;
          }

          .gallery-splide-carousel .splide__arrow {
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
// COMPOSANT GALLERY PRINCIPAL
// ===========================
const Gallery = () => {
  return (
    <section className="gallery-one">
      <div className="container">
        <GalleryCarousel items={galleryData} />
      </div>
    </section>
  );
};

export default Gallery;
