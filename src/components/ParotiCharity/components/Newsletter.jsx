import React, { useState } from 'react';
import { newsletterData } from '../data/siteData';

// ===========================
// COMPOSANT NEWSLETTER FORM
// ===========================
const NewsletterForm = ({ content }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi
    setTimeout(() => {
      setMessage('Thank you for subscribing!');
      setEmail('');
      setIsSubmitting(false);
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="newsletter-one__content">
      <div className="sec-title">
        <p className="sec-title__tagline">{content.tagline}</p>
        <h2 className="sec-title__title">{content.title}</h2>
      </div>
      
      <p className="newsletter-one__text">{content.text}</p>
      
      <form onSubmit={handleSubmit} className="newsletter-one__form">
        <div className="newsletter-one__form__input">
          <input 
            type="email" 
            placeholder={content.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <button 
          type="submit" 
          className="thm-btn newsletter-one__btn"
          disabled={isSubmitting}
        >
          <span>
            {isSubmitting ? 'Subscribing...' : content.buttonText}
          </span>
        </button>
      </form>
      
      {message && (
        <div className="newsletter-one__message">
          <p className="newsletter-one__success">{message}</p>
        </div>
      )}
    </div>
  );
};

// ===========================
// COMPOSANT NEWSLETTER PRINCIPAL
// ===========================
const Newsletter = () => {
  const { backgroundImage, content } = newsletterData;

  return (
    <section className="newsletter-one">
  <div
    className="newsletter-one__bg"
    style={{
      backgroundImage: "url(./assets/images/backgrounds/newsletter-1-1.png)"
    }}
  ></div>
  {/* /.newsletter-one__bg */}
  <div className="newsletter-one__shape float-bob-x">
    <img src="./assets/images/shapes/newsletter-1-1.png" alt="" />
  </div>
  {/* /.newsletter-one__shape */}
  <div className="container">
    <div className="newsletter-one__icon float-bob-y">
      <img src="./assets/images/shapes/newsletter-1-2.png" alt="" />
    </div>
    {/* /.newsletter-one__icon */}
    <div className="row">
      <div className="col-lg-7">
        <div className="sec-title">
          <p className="sec-title__tagline">Wordwide non-profit charity</p>
          {/* /.sec-title__tagline */}
          <h2 className="sec-title__title">
            Give a helping hand for <br /> needy People
          </h2>
        </div>
        {/* /.sec-title */}
        <form
          action="#"
          className="mc-form newsletter-one__form"
          noValidate="true"
        >
          <input type="email" placeholder="Your email" name="EMAIL" />
          <button type="submit" className="newsletter-one__form__btn">
            Subscribe
          </button>
        </form>
        <div className="mc-response" />
        {/* /.mc-response */}
      </div>
      {/* /.col-lg-7 */}
    </div>
    {/* /.row */}
  </div>
  {/* /.container */}
</section>

  );
};

export default Newsletter;
