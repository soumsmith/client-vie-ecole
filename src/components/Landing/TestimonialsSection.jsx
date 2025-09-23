import React from 'react';

const TestimonialsSection = ({ testimonials }) => (
  <section style={{ padding: '100px 0', backgroundColor: '#f8f9fa' }}>
    <div className="container">
      <div className="row justify-content-center mb-5">
        <div className="col-lg-8 text-center">
          <div style={{
            display: 'inline-block',
            backgroundColor: '#388E3C',
            color: 'white',
            padding: '8px 25px',
            borderRadius: '25px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Témoignages
          </div>
          <h2 style={{ 
            fontSize: '42px', 
            fontWeight: '700', 
            marginBottom: '25px', 
            color: '#1B5E20',
            lineHeight: '1.2'
          }}>
            Paroles d'Étudiants
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#6c757d', 
            lineHeight: '1.7'
          }}>
            Découvrez comment notre approche pédagogique transforme la vie de nos étudiants 
            et les prépare à un avenir brillant.
          </p>
        </div>
      </div>
      <div className="row g-4">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="col-lg-4 col-md-6">
            <div style={{
              backgroundColor: '#ffffff',
              padding: '40px 30px',
              borderRadius: '15px',
              boxShadow: '0 5px 25px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '50px',
                height: '50px',
                backgroundColor: '#2E7D32',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px'
              }}>
                {testimonial.image}
              </div>
              <div style={{ marginTop: '20px' }}>
                <p style={{
                  fontSize: '16px',
                  fontStyle: 'italic',
                  lineHeight: '1.7',
                  color: '#495057',
                  marginBottom: '25px'
                }}>
                  "{testimonial.content}"
                </p>
                <div style={{
                  borderTop: '1px solid #e9ecef',
                  paddingTop: '20px'
                }}>
                  <h5 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1B5E20',
                    marginBottom: '5px'
                  }}>
                    {testimonial.name}
                  </h5>
                  <p style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    margin: '0'
                  }}>
                    {testimonial.role} • {testimonial.program}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;