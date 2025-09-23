import React from 'react';

const EventsSection = ({ upcomingEvents }) => (
  <section style={{ padding: '100px 0', backgroundColor: '#ffffff' }}>
    <div className="container">
      <div className="row">
        <div className="col-lg-6">
          <div style={{
            display: 'inline-block',
            backgroundColor: '#7B1FA2',
            color: 'white',
            padding: '8px 25px',
            borderRadius: '25px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Actualités
          </div>
          <h2 style={{ 
            fontSize: '42px', 
            fontWeight: '700', 
            marginBottom: '25px', 
            color: '#1B5E20',
            lineHeight: '1.2'
          }}>
            Événements & Activités
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.7',
            color: '#6c757d',
            marginBottom: '40px'
          }}>
            Participez à la vie dynamique de notre établissement à travers nos événements 
            éducatifs et nos activités enrichissantes.
          </p>
        </div>
      </div>
      <div className="row g-4">
        {upcomingEvents.map((event, index) => (
          <div key={index} className="col-lg-4 col-md-6">
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e9ecef',
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 5px 25px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2E7D32';
              e.currentTarget.style.boxShadow = '0 10px 35px rgba(46, 125, 50, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e9ecef';
              e.currentTarget.style.boxShadow = '0 5px 25px rgba(0,0,0,0.08)';
            }}>
              <div className="d-flex">
                <div style={{
                  width: '80px',
                  backgroundColor: '#2E7D32',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  padding: '20px 0'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>
                    {event.date.day}
                  </div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                    {event.date.month}
                  </div>
                </div>
                <div style={{ padding: '25px', flex: 1 }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '10px',
                    color: '#1B5E20'
                  }}>
                    {event.title}
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginBottom: '15px',
                    lineHeight: '1.6'
                  }}>
                    {event.description}
                  </p>
                  <div style={{
                    fontSize: '14px',
                    color: '#2E7D32',
                    fontWeight: '600'
                  }}>
                    📍 {event.location}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default EventsSection;