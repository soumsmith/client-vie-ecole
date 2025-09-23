import React from 'react';
import { testimonialsData } from '../data/siteData';

// ===========================
// COMPOSANT TESTIMONIAL ITEM
// ===========================
const TestimonialItem = ({ testimonial }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i 
        key={index} 
        className={`fa fa-star ${index < rating ? '' : 'far'}`}
      ></i>
    ));
  };

  return (
    <div className="item">
      <div className="testimonials-one__item">
        <p className="testimonials-one__item__text">
          {testimonial.text}
        </p>
        <div className="testimonials-one__item__meta">
          <h4 className="testimonials-one__item__meta__name">
            {testimonial.author}
          </h4>
          <p className="testimonials-one__item__meta__designation">
            {testimonial.designation}
          </p>
          <div className="testimonials-one__item__meta__rating">
            {renderStars(testimonial.rating)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT TESTIMONIALS GALLERY
// ===========================
const TestimonialsGallery = ({ gallery }) => {
  return (
    <div className="testimonials-one__gallery">
      {gallery.map((item, index) => (
        <div 
          key={item.id} 
          className={`testimonials-one__gallery__item ${index === 2 ? 'testimonials-one__gallery__item--big' : ''}`}
        >
          <img src={item.image} alt={`Testimonial ${item.id}`} />
        </div>
      ))}
    </div>
  );
};

// ===========================
// COMPOSANT TESTIMONIALS CAROUSEL
// ===========================
const TestimonialsCarousel = ({ testimonials }) => {
  const owlOptions = {
    items: 1,
    margin: 0,
    loop: true,
    nav: false,
    dots: true,
    autoplay: true,
    autoplayTimeout: 5000
  };

  const owlStageStyle = {
    transform: 'translate3d(0px, 0px, 0px)',
    transition: 'all',
    width: '3000px'
  };

  return (
    <div 
      className="thm-owl__carousel owl-carousel owl-theme testimonials-one__carousel owl-loaded owl-drag"
      data-owl-options={JSON.stringify(owlOptions)}
    >
      <div className="owl-stage-outer">
        <div className="owl-stage" style={owlStageStyle}>
          {testimonials.map((testimonial, index) => {
            const itemStyle = { 
              width: '1000px',
              marginRight: index < testimonials.length - 1 ? '0px' : '0px'
            };
            const isActive = index === 0; // Premier élément actif
            
            return (
              <div 
                key={testimonial.id} 
                className={`owl-item ${isActive ? 'active' : ''}`} 
                style={itemStyle}
              >
                <TestimonialItem testimonial={testimonial} />
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="owl-nav disabled">
        <button type="button" role="presentation" className="owl-prev">
          <span aria-label="Previous">‹</span>
        </button>
        <button type="button" role="presentation" className="owl-next">
          <span aria-label="Next">›</span>
        </button>
      </div>
      
      <div className="owl-dots">
        {testimonials.map((_, index) => (
          <button 
            key={index} 
            role="button" 
            className={`owl-dot ${index === 0 ? 'active' : ''}`}
          >
            <span></span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT TESTIMONIALS PRINCIPAL
// ===========================
const Testimonials = () => {
  const { backgroundImage, gallery, testimonials } = testimonialsData;

  return (
    <section className="sec-pad-top testimonials-one testimonials-one--bottom-pd-lg">
      <div 
        className="testimonials-one__bg"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      
      <TestimonialsGallery gallery={gallery} />
      
      <div className="container">
        <div className="row">
          <div className="col-lg-5"></div>
          <div className="col-lg-7">
            <TestimonialsCarousel testimonials={testimonials} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
