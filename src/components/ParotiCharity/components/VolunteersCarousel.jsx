import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

const VolunteersCarousel = ({
  volunteers = [],
  title = "Happy volunteers",
  subtitle = "Ready to help you"
}) => {
  // Configuration du carrousel Splide
  const splideOptions = {
    type: 'loop',
    perPage: 3,
    perMove: 1,
    gap: '30px',
    autoplay: true,
    interval: 4500,
    pauseOnHover: true,
    arrows: true,
    pagination: false,
    breakpoints: {
      1024: {
        perPage: 3,
      },
      768: {
        perPage: 2,
      },
      640: {
        perPage: 2,
      },
      480: {
        perPage: 1,
      },
    },
  };

  // Styles CSS inline pour les cartes colorées
  const cardStyles = `
    .gsc-team-item .team-content {
      padding: 30px 20px;
      position: relative;
      border-radius: 8px 8px 0 0;
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .gsc-team-item .team-name {
      color: white;
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 8px 0;
      /*text-align: center;*/
    }
    
    .gsc-team-item .team-job {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      /*text-align: center;*/
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .gsc-team-item {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    
    .gsc-team-item:hover {
      transform: translateY(-5px);
    }
    
    .gsc-team-item .team-image {
      overflow: hidden;
    }
    
    .gsc-team-item .team-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .gsc-team-item .socials-team {
      padding: 20px;
      text-align: center;
    }
    
    .gsc-team-item .socials-team a {
      display: inline-block;
      margin: 0 8px;
      color: #666;
      font-size: 18px;
      transition: color 0.3s ease;
    }
    
    .gsc-team-item .socials-team a:hover {
      color: #333;
    }


    //

    .gsc-team-item.style-1 {
    position: relative;
    max-width: 400px;
    margin: 0 auto 30px;
    padding-left: 40px;
    padding-top: 40px;
    background: var(--e-global-color-secondary);

    .gsc-team-item {
    height: 100% !important;
}
}
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cardStyles }} />
      <section
        className="container elementor-section elementor-top-section elementor-element elementor-element-7acf724 elementor-section-boxed elementor-section-height-default elementor-section-height-default py-5"
        data-id="7acf724"
        data-element_type="section"
      >
        <div className="elementor-container elementor-column-gap-default">
          <div
            className="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-37efb14"
            data-id="37efb14"
            data-element_type="column"
          >
            <div className="elementor-widget-wrap elementor-element-populated">
              {/* En-tête avec titre */}
              <div
                className="elementor-element elementor-element-07ca709 elementor-widget elementor-widget-gva-heading-block"
                data-id="07ca709"
                data-element_type="widget"
                data-widget_type="gva-heading-block.default"
              >
                <div className="elementor-widget-container">
                  <div className="gva-element-gva-heading-block gva-element">
                    <div className="align-center style-1 widget gsc-heading box-align-center auto-responsive">
                      <div className="content-inner">
                        <div className="sec-title">
                          <p className="sec-title__tagline">{subtitle}</p>
                          <h2 className="sec-title__title">{title}</h2>
                        </div>
                        {/* <div className="sub-title">
                          <span className="tagline">{subtitle}</span>
                        </div>
                        <h2 className="title">
                          <span>{title}</span>
                        </h2> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carrousel des volontaires */}
              <div
                className="elementor-element elementor-element-0df5547 elementor-widget elementor-widget-gva-team"
                data-id="0df5547"
                data-element_type="widget"
                data-widget_type="gva-team.default"
              >
                <div className="elementor-widget-container">
                  <div className="gva-element-gva-team gva-element">
                    <div className="swiper-slider-wrapper gsc-team layout-carousel">
                      <div className="swiper-content-inner">
                        <Splide options={splideOptions} className="init-carousel-swiper">
                          {volunteers.map((volunteer, index) => (
                            <SplideSlide key={`volunteer-${index}`}>
                              <div className="gsc-team-item style-1" style={{ backgroundColor: volunteer.color || '#f0f0f0' }}>
                                <div
                                  className=""
                                  style={{ backgroundColor: volunteer.color || '#f0f0f0' }}
                                >
                                  <div className="content-inner px-5 pb-2 pt-3">
                                    <h3 className="team-name text-left m-0">{volunteer.name}</h3>
                                    <div className="team-job text-left m-0">{volunteer.job || 'Volunteers'}</div>
                                  </div>
                                </div>
                                <div className="team-image" style={{ paddingLeft: '40px' }}>
                                  <img
                                    decoding="async"
                                    src={volunteer.image}
                                    alt={volunteer.name}
                                  />
                                </div>
                                {/* <div className="socials-team">
                                  {volunteer.socialLinks?.facebook && (
                                    <a href={volunteer.socialLinks.facebook}>
                                      <i className="fa fa-facebook" />
                                    </a>
                                  )}
                                  {volunteer.socialLinks?.twitter && (
                                    <a href={volunteer.socialLinks.twitter}>
                                      <i className="fa fa-twitter" />
                                    </a>
                                  )}
                                  {volunteer.socialLinks?.instagram && (
                                    <a href={volunteer.socialLinks.instagram}>
                                      <i className="fa fa-instagram" />
                                    </a>
                                  )}
                                  {volunteer.socialLinks?.pinterest && (
                                    <a href={volunteer.socialLinks.pinterest}>
                                      <i className="fa fa-pinterest" />
                                    </a>
                                  )}
                                </div> */}
                              </div>
                            </SplideSlide>
                          ))}
                        </Splide>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default VolunteersCarousel;
