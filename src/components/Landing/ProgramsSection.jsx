import React from 'react';
import { Button } from 'rsuite';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';

const ProgramsSection = ({ programs }) => (
  <section style={{ padding: '100px 0', backgroundColor: '#f8f9fa' }}>
    <div className="container">
      <div className="row justify-content-center mb-5">
        <div className="col-lg-8 text-center">
          <div style={{
            display: 'inline-block',
            backgroundColor: '#8B5CF6',
            color: 'white',
            padding: '8px 25px',
            borderRadius: '25px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Nos Programmes Médicaux
          </div>
          <h2 style={{ 
            fontSize: '42px', 
            fontWeight: '700', 
            marginBottom: '25px', 
            color: '#1f2937',
            lineHeight: '1.2'
          }}>
            Aidez à Sauver des Vies
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            lineHeight: '1.7',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Découvrez nos programmes d'aide médicale qui changent des vies et apportent 
            l'espoir aux communautés les plus vulnérables.
          </p>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-12">
          <Splide
            options={{
              type: 'loop',
              perPage: 4,
              gap: '1rem',
              autoplay: true,
              pagination: false,
              breakpoints: {
                992: { perPage: 2 },
                600: { perPage: 1 }
              }
            }}
            aria-label="Programmes Médicaux"
          >
            {programs.map((program, index) => (
              <SplideSlide key={index}>
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  height: '100%',
                  position: 'relative'
                }}>
                  {/* Image de la carte */}
                  <div style={{
                    height: '150px',
                    backgroundImage: `url(${program.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    {/* Badge catégorie */}
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      backgroundColor: '#8B5CF6',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {program.category}
                    </div>
                  </div>
                  
                  {/* Contenu de la carte */}
                  <div style={{ padding: '30px' }}>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: '600',
                    //   marginBottom: '15px',
                      color: '#1f2937',
                      lineHeight: '1.3'
                    }}>
                      {program.title}
                    </h3>
                    
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#6b7280',
                      marginBottom: '0px'
                    }}>
                      {program.description}
                    </p>
                    
                    {/* Barre de progression */}
                    {/* <div style={{ marginBottom: '20px' }}>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '10px'
                      }}>
                        <div style={{
                          width: `${program.progressPercentage}%`,
                          height: '100%',
                          backgroundColor: '#8B5CF6',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#8B5CF6',
                        marginBottom: '8px'
                      }}>
                        {program.progressPercentage}%
                      </div>
                    </div> */}
                    
                    {/* Montants */}
                    {/* <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '25px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: '#1f2937'
                        }}>
                          ${program.raised.toLocaleString()}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          textTransform: 'uppercase'
                        }}>
                          Raised
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: '#6b7280'
                        }}>
                          ${program.goal.toLocaleString()}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          textTransform: 'uppercase'
                        }}>
                          Goal
                        </div>
                      </div>
                    </div> */}
                    
                    {/* Bouton de don */}
                    {/* <Button 
                      block
                      style={{
                        backgroundColor: '#8B5CF6',
                        border: 'none',
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        borderRadius: '8px',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Faire un Don
                    </Button> */}
                  </div>
                </div>
              </SplideSlide>
            ))}
          </Splide>
        </div>
      </div>
    </div>
  </section>
);

export default ProgramsSection;