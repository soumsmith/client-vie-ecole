import React, { useRef } from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { blogData } from "../data/siteData";

// ===========================
// COMPOSANT BLOG CARD
// ===========================
const BlogCard = ({ post }) => {
  return (
    <div className="blog-card">
      <div className="blog-card__image">
        <img src={post.image} alt={post.title} />
        <div className="blog-card__image__content">
          <a href={post.link} className="blog-card__image__content__link">
            <i className="fa fa-link"></i>
          </a>
        </div>
      </div>

      <div className="blog-card__content">
        <div className="blog-card__meta">
          <div className="blog-card__meta__item">
            <i className="fa fa-calendar"></i>
            <span>{post.date}</span>
          </div>
          <div className="blog-card__meta__item">
            <i className="fa fa-user"></i>
            <span>By {post.author}</span>
          </div>
          <div className="blog-card__meta__item">
            <i className="fa fa-tag"></i>
            <span>{post.category}</span>
          </div>
        </div>

        <h3 className="blog-card__title">
          <a href={post.link}>{post.title}</a>
        </h3>

        <p className="blog-card__text">{post.text}</p>

        <div className="blog-card__bottom">
          <a href={post.link} className="blog-card__link">
            Read More
            <i className="fa fa-angle-double-right"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT FLÈCHES PERSONNALISÉES
// ===========================
const CustomArrows = ({ splideRef }) => {
  const handlePrev = () => {
    if (splideRef.current) {
      splideRef.current.go('<');
    }
  };

  const handleNext = () => {
    if (splideRef.current) {
      splideRef.current.go('>');
    }
  };

  return (
    <>
      <button 
        className="custom-arrow custom-arrow--prev"
        onClick={handlePrev}
        aria-label="Previous slide"
      >
        <i className="paroti-icon-left-arrow"></i>
      </button>
      <button 
        className="custom-arrow custom-arrow--next"
        onClick={handleNext}
        aria-label="Next slide"
      >
        <i className="paroti-icon-right-arrow"></i>
      </button>
    </>
  );
};

// ===========================
// COMPOSANT BLOG CAROUSEL AVEC FLÈCHES PERSONNALISÉES
// ===========================
const BlogCarouselWithCustomArrows = ({ posts }) => {
  const splideRef = useRef(null);

  // Configuration Splide sans flèches par défaut
  const splideOptions = {
    type: 'loop',
    perPage: 3,
    perMove: 1,
    gap: '30px',
    pagination: false,
    arrows: false, // Désactiver les flèches par défaut
    autoplay: false,
    speed: 800,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    breakpoints: {
      992: {
        perPage: 2,
        gap: '20px',
      },
      768: {
        perPage: 1,
        gap: '15px',
      },
    },
  };

  return (
    <div className="blog-carousel-wrapper-custom">
      <Splide 
        ref={splideRef}
        options={splideOptions} 
        className="blog-splide-carousel-custom"
        aria-label="Blog Posts Carousel"
      >
        {posts.map((post) => (
          <SplideSlide key={post.id}>
            <div className="blog-slide-item">
              <BlogCard post={post} />
            </div>
          </SplideSlide>
        ))}
      </Splide>
      
      {/* Flèches personnalisées */}
      <CustomArrows splideRef={splideRef} />
      
      {/* Styles personnalisés */}
      <style jsx>{`
        .blog-carousel-wrapper-custom {
          position: relative;
          margin: 0 -15px;
        }
        
        .blog-splide-carousel-custom {
          padding: 0 60px;
        }
        
        .blog-slide-item {
          height: 100%;
        }
        
        /* Flèches personnalisées */
        .custom-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #e9ecef;
          width: 55px;
          height: 55px;
          border-radius: 50%;
          color: #333;
          font-size: 20px;
          transition: all 0.3s ease;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .custom-arrow:hover {
          background: #007bff;
          border-color: #007bff;
          color: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
        }
        
        .custom-arrow--prev {
          left: 10px;
        }
        
        .custom-arrow--next {
          right: 10px;
        }
        
        .custom-arrow i {
          font-size: 18px;
        }
        
        /* Track et slides */
        .blog-splide-carousel-custom .splide__track {
          overflow: visible;
        }
        
        .blog-splide-carousel-custom .splide__slide {
          opacity: 0.8;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .blog-splide-carousel-custom .splide__slide.is-active {
          opacity: 1;
          transform: scale(1.02);
        }
        
        /* Responsive */
        @media (max-width: 992px) {
          .blog-splide-carousel-custom {
            padding: 0 50px;
          }
        }
        
        @media (max-width: 768px) {
          .blog-splide-carousel-custom {
            padding: 0 40px;
          }
          
          .custom-arrow {
            width: 45px;
            height: 45px;
            font-size: 16px;
          }
          
          .custom-arrow--prev {
            left: 5px;
          }
          
          .custom-arrow--next {
            right: 5px;
          }
        }
        
        @media (max-width: 576px) {
          .blog-splide-carousel-custom {
            padding: 0 35px;
          }
          
          .custom-arrow {
            width: 40px;
            height: 40px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

// ===========================
// COMPOSANT BLOG GRID (Alternative)
// ===========================
const BlogGrid = ({ posts }) => {
  return (
    <div className="row gutter-y-30">
      {posts.map((post) => (
        <div key={post.id} className="col-md-12 col-lg-4">
          <BlogCard post={post} />
        </div>
      ))}
    </div>
  );
};

// ===========================
// COMPOSANT BLOG PRINCIPAL AVEC FLÈCHES PERSONNALISÉES
// ===========================
const BlogWithCustomArrows = ({ useCarousel = true }) => {
  const { section, posts } = blogData;

  return (
    <section className="sec-pad-top sec-pad-bottom">
      <div className="container">
        <div className="sec-title text-center">
          <p className="sec-title__tagline">{section.tagline}</p>
          <h2 className="sec-title__title">{section.title}</h2>
        </div>
        
        {useCarousel ? (
          <BlogCarouselWithCustomArrows posts={posts} />
        ) : (
          <BlogGrid posts={posts} />
        )}
      </div>
    </section>
  );
};

export default BlogWithCustomArrows;
