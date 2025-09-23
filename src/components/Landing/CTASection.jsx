import React from 'react';
import { Button } from 'rsuite';

const CTASection = () => (
  <section style={{
    padding: '100px 0',
    background: 'linear-gradient(135deg, #FF9800 0%, #FF8F00 100%)',
    color: 'white'
  }}>
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8 text-center">
          <h2 style={{
            fontSize: '42px',
            fontWeight: '700',
            marginBottom: '25px',
            lineHeight: '1.2'
          }}>
            Rejoignez Notre Communauté Éducative
          </h2>
          <p style={{
            fontSize: '18px',
            marginBottom: '40px',
            opacity: '0.95',
            lineHeight: '1.7'
          }}>
            Donnez à votre enfant les meilleures chances de réussite grâce à notre approche 
            pédagogique innovante et notre environnement d'apprentissage stimulant.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button 
              size="lg"
              style={{
                backgroundColor: '#ffffff',
                color: '#FF9800',
                border: 'none',
                padding: '18px 40px',
                fontSize: '16px',
                fontWeight: '700',
                borderRadius: '30px',
                textTransform: 'uppercase'
              }}
            >
              Inscription 2025
            </Button>
            <Button 
              size="lg"
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '2px solid rgba(255,255,255,0.8)',
                padding: '18px 40px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '30px'
              }}
            >
              Visite Guidée
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;