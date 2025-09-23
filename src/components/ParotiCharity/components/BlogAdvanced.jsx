import React, { useRef, useState } from "react";
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
// COMPOSANT CONTRÔLES PERSONNALISÉS
// ===========================
const CarouselControls = ({ splideRef, isPlaying, setIsPlaying, currentSlide, totalSlides }) => {
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

  const toggleAutoplay = () => {
    if (splideRef.current) {
      if (isPlaying) {
        splideRef.current.Components.Autoplay.pause();
      } else {
        splideRef.current.Components.Autoplay.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="carousel-controls">
      <div className="carousel-controls__navigation">
        <button 
          className="control-btn control-btn--prev"
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          <i className="fa fa-chevron-left"></i>
        </button>
        
        <div className="carousel-controls__info">
          <span className="slide-counter">
            {currentSlide + 1} / {totalSlides}
          </span>
          <button 
            className={`control-btn control-btn--play ${isPlaying ? 'playing' : 'paused'}`}
            onClick={toggleAutoplay}
            aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
          >
            <i className={`fa ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
        </div>
        
        <button 
          className="control-btn control-btn--next"
          onClick={handleNext}
          aria-label="Next slide"
        >
          <i className="fa fa-chevron-right"></i>
        </button>
      </div>
      
      {/* Barre de progression */}
      <div className="progress-bar">
        <div 
          className="progress-bar__fill"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT BLOG CAROUSEL AVANCÉ
// ===========================
const BlogAdvancedCarousel = ({ posts }) => {
  const splideRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Configuration Splide
  const splideOptions = {
    type: 'loop',
    perPage: 3,
    perMove: 1,
    gap: '30px',
    pagination: false,
    arrows: false,
    autoplay: true,
    interval: 4000,
    pauseOnHover: true,
    pauseOnFocus: true,
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

  const handleSlideChange = (splide) => {
    setCurrentSlide(splide.index);
  };

  return (
    <div className="blog-carousel-advanced">
      <Splide 
        ref={splideRef}
        options={splideOptions} 
        className="blog-splide-advanced"
        aria-label="Blog Posts Carousel"
        onMoved={handleSlideChange}
      >
        {posts.map((post) => (
          <SplideSlide key={post.id}>
            <div className="blog-slide-item">
              <BlogCard post={post} />
            </div>
          </SplideSlide>
        ))}
      </Splide>
      
      {/* Contrôles personnalisés */}
      <CarouselControls 
        splideRef={splideRef}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentSlide={currentSlide}
        totalSlides={posts.length}
      />
      
      {/* Styles personnalisés */}
      <style jsx>{`
        .blog-carousel-advanced {
          position: relative;
          margin: 0 -15px;
        }
        
        .blog-splide-advanced {
          padding: 0 20px 60px 20px;
        }
        
        .blog-slide-item {
          height: 100%;
        }
        
        /* Contrôles personnalisés */
        .carousel-controls {
          margin-top: 40px;
          padding: 0 20px;
        }
        
        .carousel-controls__navigation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .carousel-controls__info {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 0 20px;
        }
        
        .slide-counter {
          font-size: 14px;
          color: #666;
          font-weight: 500;
          min-width: 50px;
          text-align: center;
        }
        
        .control-btn {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          color: #333;
          font-size: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .control-btn:hover {
          background: #007bff;
          border-color: #007bff;
          color: white;
          transform: scale(1.1);
        }
        
        .control-btn--play.playing {
          background: #28a745;
          border-color: #28a745;
          color: white;
        }
        
        .control-btn--play.paused {
          background: #dc3545;
          border-color: #dc3545;
          color: white;
        }
        
        /* Barre de progression */
        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e9ecef;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-bar__fill {
          height: 100%;
          background: linear-gradient(90deg, #007bff, #0056b3);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        
        /* Track et slides */
        .blog-splide-advanced .splide__track {
          overflow: visible;
        }
        
        .blog-splide-advanced .splide__slide {
          opacity: 0.7;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .blog-splide-advanced .splide__slide.is-active {
          opacity: 1;
        }
        
        .blog-splide-advanced .splide__slide.is-visible {
          opacity: 0.9;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .carousel-controls__navigation {
            gap: 15px;
          }
          
          .carousel-controls__info {
            gap: 10px;
            padding: 0 15px;
          }
          
          .control-btn {
            width: 40px;
            height: 40px;
            font-size: 14px;
          }
          
          .slide-counter {
            font-size: 12px;
            min-width: 40px;
          }
        }
        
        @media (max-width: 576px) {
          .blog-splide-advanced {
            padding: 0 10px 50px 10px;
          }
          
          .carousel-controls {
            padding: 0 10px;
          }
          
          .carousel-controls__navigation {
            gap: 10px;
          }
          
          .carousel-controls__info {
            gap: 8px;
            padding: 0 10px;
          }
        }
      `}</style>
    </div>
  );
};

// ===========================
// COMPOSANT BLOG PRINCIPAL AVANCÉ
// ===========================
const BlogAdvanced = () => {
  const { section, posts } = blogData;

  return (
    <section className="sec-pad-top sec-pad-bottom">
      <div className="container">
        <div className="sec-title text-center">
          <p className="sec-title__tagline">{section.tagline}</p>
          <h2 className="sec-title__title">{section.title}</h2>
        </div>
        
        <BlogAdvancedCarousel posts={posts} />
      </div>
    </section>
  );
};

export default BlogAdvanced;
