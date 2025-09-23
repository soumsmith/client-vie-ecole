import React from 'react';
import { useNavigate } from 'react-router-dom';

// ===========================
// DONNÉES CTA LOCALES (temporaire)
// ===========================
const ctaData = {
  backgroundImage: "/assets/images/backgrounds/cta-bg-1-1.jpg",
  shapeImage: "/assets/images/shapes/cta-s-1-1.png",
  tagline: "Nous sommes là pour soutenir l'éducation",
  title: "Investissez dans l'éducation des enfants et <br> <span>construisons</span> leur avenir ensemble",
  button: {
    text: "Soutenir nos programmes",
    link: "/programmes",
    type: "route"
  }
};

// ===========================
// COMPOSANT CTA (Call to Action)
// ===========================
const CTA = () => {
  const navigate = useNavigate();

  // Fonction locale pour gérer la navigation
  const handleNavigation = (buttonData) => {
    if (buttonData.type === 'external' || 
        (buttonData.link && (buttonData.link.startsWith('http') || 
                            buttonData.link.startsWith('mailto:') || 
                            buttonData.link.startsWith('tel:')))) {
      // Lien externe - ouvrir dans un nouvel onglet
      window.open(buttonData.link, '_blank', 'noopener,noreferrer');
    } else if (buttonData.link && buttonData.link !== '#') {
      // Navigation interne avec React Router
      navigate(buttonData.link);
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    handleNavigation(ctaData.button);
  };

  return (
    <section 
      className="cta-one"
      style={{ backgroundImage: `url(${ctaData.backgroundImage})` }}
    >
      <img 
        src={ctaData.shapeImage} 
        className="cta-one__shape-1 float-bob-y" 
        alt="CTA Shape decoration" 
      />
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="cta-one__content">
              <p className="cta-one__tagline">{ctaData.tagline}</p>
              <h2 
                className="cta-one__title"
                dangerouslySetInnerHTML={{ __html: ctaData.title }}
              ></h2>
              <div className="cta-one__btns">
                <a 
                  href={ctaData.button.type === 'external' ? ctaData.button.link : '#'} 
                  className="thm-btn cta-one__btn"
                  onClick={handleButtonClick}
                  target={ctaData.button.type === 'external' ? '_blank' : undefined}
                  rel={ctaData.button.type === 'external' ? 'noopener noreferrer' : undefined}
                >
                  <span>{ctaData.button.text}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;