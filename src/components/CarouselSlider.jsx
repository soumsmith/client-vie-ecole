import React, { useState, useEffect } from 'react';
import { Panel, Button, FlexboxGrid } from 'rsuite';

const CarouselSlider = ({ slides, autoPlay = true, interval = 4000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const carouselStyle = {
    position: 'relative',
    width: '100%',
    height: '500px',
    overflow: 'hidden',
    borderRadius: '16px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff'
  };

  const slideContainerStyle = {
    display: 'flex',
    width: `${slides.length * 100}%`,
    height: '100%',
    transform: `translateX(-${(currentSlide * 100) / slides.length}%)`,
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const slideStyle = {
    width: `${100 / slides.length}%`,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '60px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    position: 'relative'
  };

  const contentStyle = {
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2
  };

  const iconStyle = {
    fontSize: '64px',
    marginBottom: '24px',
    display: 'block'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '16px',
    lineHeight: '1.2'
  };

  const descriptionStyle = {
    fontSize: '18px',
    lineHeight: '1.6',
    opacity: '0.9',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const navigationStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#667eea',
    transition: 'all 0.3s ease',
    zIndex: 3
  };

  const prevButtonStyle = {
    ...navigationStyle,
    left: '20px'
  };

  const nextButtonStyle = {
    ...navigationStyle,
    right: '20px'
  };

  const indicatorsStyle = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '12px',
    zIndex: 3
  };

  const indicatorStyle = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const activeIndicatorStyle = {
    ...indicatorStyle,
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  };

  const inactiveIndicatorStyle = {
    ...indicatorStyle,
    backgroundColor: 'rgba(255,255,255,0.5)'
  };

  return (
    <div style={carouselStyle}>
      <div style={slideContainerStyle}>
        {slides.map((slide, index) => (
          <div key={index} style={slideStyle}>
            <div style={contentStyle}>
              <span style={iconStyle}>{slide.icon}</span>
              <h3 style={titleStyle}>{slide.title}</h3>
              <p style={descriptionStyle}>{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        style={prevButtonStyle}
        onClick={prevSlide}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
          e.target.style.boxShadow = 'none';
        }}
      >
        ←
      </button>

      <button
        style={nextButtonStyle}
        onClick={nextSlide}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
          e.target.style.boxShadow = 'none';
        }}
      >
        →
      </button>

      <div style={indicatorsStyle}>
        {slides.map((_, index) => (
          <button
            key={index}
            style={currentSlide === index ? activeIndicatorStyle : inactiveIndicatorStyle}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselSlider;