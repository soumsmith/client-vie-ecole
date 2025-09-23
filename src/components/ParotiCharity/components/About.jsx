import React from 'react';
import { aboutData } from '../data/siteData';

// ===========================
// COMPOSANT ABOUT IMAGE
// ===========================
const AboutImage = ({ data }) => {
  return (
    <div className="about-two__image">
      <div className="about-two__image__shape-1"></div>
      <div className="about-two__image__shape-2"></div>
      <div className="about-two__image__shape-3"></div>
      <img 
        src={data.image} 
        className="wow fadeInLeft animated" 
        data-wow-duration="1500ms" 
        alt="About us"
        style={{
          visibility: 'visible',
          animationDuration: '1500ms',
          animationName: 'fadeInLeft'
        }}
      />
      <div className="about-two__image__caption">
        <h3 className="about-two__image__caption__count count-box counted">
          <span className="count-text" data-stop={data.caption.count} data-speed="1500">
            {data.caption.count}
          </span>+
        </h3>
        <p className="about-two__image__caption__text">
          {data.caption.text}
        </p>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT ABOUT INFO ITEM
// ===========================
const AboutInfoItem = ({ item }) => {
  const itemStyle = item.accentColor ? { '--accent-color': item.accentColor } : {};
  
  return (
    <li className="about-two__info__item" style={itemStyle}>
      <i className={item.icon}></i>
      <h3 className="about-two__info__title">{item.title}</h3>
    </li>
  );
};

// ===========================
// COMPOSANT ABOUT CONTENT
// ===========================
const AboutContent = ({ content }) => {
  return (
    <div className="about-two__content">
      <div className="sec-title">
        <p className="sec-title__tagline">{content.tagline}</p>
        <h2 className="sec-title__title">{content.title}</h2>
      </div>
      
      <p className="about-two__text">{content.text}</p>
      
      <ul className="list-unstyled about-two__info">
        {content.info.map((item) => (
          <AboutInfoItem key={item.id} item={item} />
        ))}
      </ul>
      
      <ul className="list-unstyled about-two__list">
        {content.list.map((item, index) => (
          <li key={index}>
            <i className="fa fa-check-circle"></i>
            {item}
          </li>
        ))}
      </ul>
      
      <div className="about-two__btns">
        <a href={content.button.link} className="thm-btn about-two__btn">
          <span>{content.button.text}</span>
        </a>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT ABOUT PRINCIPAL
// ===========================
const About = () => {
  return (
    <section className="sec-pad-top sec-pad-bottom about-two">
      <img 
        src={aboutData.shape} 
        className="about-two__shape-1 float-bob-x" 
        alt="Shape decoration" 
      />
      <div className="container">
        <div className="row gutter-y-60">
          <div className="col-md-12 col-lg-6">
            <AboutImage data={aboutData} />
          </div>
          <div className="col-md-12 col-lg-6">
            <AboutContent content={aboutData.content} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
