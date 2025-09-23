import React from 'react';
import { Button } from 'rsuite';

const AboutSection = ({ impactStats }) => (
  <section style={{ padding: '100px 0', backgroundColor: '#f8f9fa' }}>
    <div className="container">
      <div className="row align-items-center">
        <div className="col-lg-6">
          <div style={{
            display: 'inline-block',
            backgroundColor: '#2E7D32',
            color: 'white',
            padding: '8px 25px',
            borderRadius: '25px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Notre Institution
          </div>
          <h2 style={{ 
            fontSize: '42px', 
            fontWeight: '700', 
            marginBottom: '25px', 
            color: '#1B5E20',
            lineHeight: '1.2'
          }}>
            Excellence Éducative Depuis 2008
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#6c757d',
            marginBottom: '25px'
          }}>
            Notre établissement d'enseignement secondaire s'engage à offrir une éducation de qualité supérieure 
            qui prépare nos étudiants aux défis du monde moderne. Nous cultivons l'excellence académique, 
            l'innovation pédagogique et l'épanouissement personnel de chaque élève.
          </p>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#6c757d',
            marginBottom: '35px'
          }}>
            Grâce à notre équipe pédagogique experte et nos infrastructures modernes, nous avons formé 
            des milliers d'étudiants qui excellent aujourd'hui dans leurs études supérieures et leurs 
            carrières professionnelles.
          </p>
          <Button 
            size="lg"
            style={{
              backgroundColor: '#FF9800',
              border: 'none',
              padding: '15px 35px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '30px',
              color: 'white'
            }}
          >
            Découvrir Notre Histoire
          </Button>
        </div>
        <div className="col-lg-6">
          <div className="row g-4">
            {impactStats.map((stat, index) => (
              <div key={index} className="col-6">
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '15px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '15px' }}>
                    {stat.icon}
                  </div>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    color: '#2E7D32',
                    marginBottom: '8px'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#6c757d',
                    fontWeight: '600'
                  }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;