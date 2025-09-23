import React from 'react';
import { Footer } from 'rsuite';

const FooterSection = () => (
  <Footer style={{
    backgroundColor: '#1B5E20',
    color: '#ecf0f1',
    padding: '80px 0 30px'
  }}>
    <div className="container">
      <div className="row g-5 mb-5">
        <div className="col-lg-4 col-md-6">
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '25px',
            color: '#4CAF50'
          }}>
            <img src='logo-app.png' width={100}/>
          </div>
          <p style={{
            lineHeight: '1.7',
            opacity: '0.8',
            marginBottom: '25px',
            fontSize: '16px'
          }}>
            Établissement d'enseignement secondaire d'excellence offrant une formation 
            complète et moderne pour préparer les leaders de demain.
          </p>
          <div>
            <div style={{ marginBottom: '10px' }}>
              📍 Avenue de l'Éducation, Cocody, Abidjan
            </div>
            <div style={{ marginBottom: '10px' }}>
              📞 +225 27 22 45 67 89
            </div>
            <div>
              ✉️ contact@poulsscolaire.edu.ci
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-6">
          <h4 style={{
            marginBottom: '25px',
            fontWeight: '700',
            fontSize: '18px',
            color: '#4CAF50'
          }}>
            Programmes
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Sciences & Technologies</a>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Lettres & Humanités</a>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Arts & Créativité</a>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Sports & Bien-être</a>
          </div>
        </div>
        <div className="col-lg-2 col-md-6">
          <h4 style={{
            marginBottom: '25px',
            fontWeight: '700',
            fontSize: '18px',
            color: '#4CAF50'
          }}>
            Admissions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Processus d'inscription</a>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Frais de scolarité</a>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Bourses d'études</a>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Calendrier scolaire</a>
          </div>
        </div>
        <div className="col-lg-2 col-md-6">
          <h4 style={{
            marginBottom: '25px',
            fontWeight: '700',
            fontSize: '18px',
            color: '#4CAF50'
          }}>
            École
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>À propos</a>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Équipe enseignante</a>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Installations</a>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '15px' }}>Résultats scolaires</a>
          </div>
        </div>
        <div className="col-lg-2 col-md-6">
          <h4 style={{
            marginBottom: '25px',
            fontWeight: '700',
            fontSize: '18px',
            color: '#4CAF50'
          }}>
            Suivez-nous
          </h4>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            {['📘', '🐦', '📷', '📺'].map((icon, index) => (
              <div key={index} style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '18px'
              }}>
                {icon}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '14px', opacity: '0.8' }}>
            Bulletin d'informations
          </div>
        </div>
      </div>
      <hr style={{ margin: '0 0 30px', borderColor: '#2E7D32' }} />
      <div className="row align-items-center">
        <div className="col-md-6">
          <p style={{ margin: '0', opacity: '0.7', fontSize: '14px' }}>
            © 2025 Pouls Scolaire. Tous droits réservés. Établissement d'enseignement privé.
          </p>
        </div>
        <div className="col-md-6 text-md-end">
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end' }}>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '14px' }}>
              Politique de confidentialité
            </a>
            <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '14px' }}>
              Règlement intérieur
            </a>
          </div>
        </div>
      </div>
    </div>
  </Footer>
);

export default FooterSection;