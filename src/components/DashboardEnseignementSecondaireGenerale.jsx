import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserCheck, FaUser, FaChartLine } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DashboardEnseignementSecondaireGenerale = ({ niveau = 'EnseignementSecondaireGénérale' }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [chartColors, setChartColors] = useState({ male: '#4f9bff', female: '#b24ce3' });

  useEffect(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    setChartColors({
      male: style.getPropertyValue('--chart-primary-color').trim() || '#4f9bff',
      female: style.getPropertyValue('--chart-secondary-color').trim() || '#b24ce3'
    });
  }, [niveau]);

  const dashboardData = {
    nombreTotalEleve: 1245,
    nombreTotalEleveGarcons: 678,
    nombreTotalEleveFilles: 567,
    nombreEleveAff: 1120,
    nombreEleveNonAff: 125,
    nombreEleveAffGarcons: 610,
    nombreEleveAffFilles: 510,
    nombreEleveNonAffGarcons: 68,
    nombreEleveNonAffFilles: 57,
    personnelAdmMasculin: 15,
    personnelAdmFeminin: 12,
    personnelEducateurMasculin: 8,
    personnelEducateurFeminin: 10,
    personnelEnseignantMasculin: 45,
    personnelEnseignantFeminin: 38,
    enseignantPermanentMasculin: 32,
    enseignantPermanentFeminin: 28,
    nombreEleveAnc: 892,
    nombreEleveAncAffGarcons: 420,
    nombreEleveAncAffFilles: 380,
    nombreEleveAncNonAffGarcons: 52,
    nombreEleveAncNonAffFilles: 40,
    nombreEleveNouv: 353,
    nombreEleveNouvAffGarcons: 190,
    nombreEleveNouvAffFilles: 130,
    nombreEleveNouvNonAffGarcons: 16,
    nombreEleveNouvNonAffFilles: 17,
    sallesDispo: 45,
    sallesUtilisees: 38,
    nombreClasses: 24,
    nombrePersonnel: 128
  };

  const slides = [
    {
      title: "Meilleure Plateforme d'Éducation Pour Apprendre",
      subtitle: "Commencez votre parcours aujourd'hui",
      description: "Découvrez une expérience d'apprentissage unique avec notre plateforme éducative innovante. Nous offrons un enseignement de qualité adapté à tous les niveaux.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=700&fit=crop"
    },
    {
      title: "Apprenez Avec Des Enseignants Experts",
      subtitle: "Une éducation de qualité pour tous",
      description: "Notre équipe pédagogique qualifiée accompagne chaque élève. Des cours interactifs, un suivi personnalisé et des résultats garantis.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=700&fit=crop"
    },
    {
      title: "Enseignement Flexible et Accessible",
      subtitle: "Étudiez à votre propre rythme",
      description: "Accédez à des ressources pédagogiques de qualité. Notre système d'apprentissage flexible s'adapte aux besoins de chaque élève.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=700&fit=crop"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const studentDistribution = [
    { name: 'Garçons', value: dashboardData.nombreTotalEleveGarcons },
    { name: 'Filles', value: dashboardData.nombreTotalEleveFilles }
  ];

  const staffData = [
    { category: 'Administratif', masculin: dashboardData.personnelAdmMasculin, feminin: dashboardData.personnelAdmFeminin },
    { category: 'Educateur', masculin: dashboardData.personnelEducateurMasculin, feminin: dashboardData.personnelEducateurFeminin },
    { category: 'Enseignant', masculin: dashboardData.personnelEnseignantMasculin, feminin: dashboardData.personnelEnseignantFeminin },
    { category: 'Permanent', masculin: dashboardData.enseignantPermanentMasculin, feminin: dashboardData.enseignantPermanentFeminin }
  ];

  return (
    <div className={niveau} style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff 0%, #fff 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideInImage {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes slideInContent {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }

          .stat-card {
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
          }
        `}
      </style>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
        padding: '80px 60px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '650px'
      }}>
        {/* Decorative stars */}
        <div style={{ position: 'absolute', top: '100px', left: '100px' }}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <path d="M30 0 L35 25 L60 30 L35 35 L30 60 L25 35 L0 30 L25 25 Z" fill="none" stroke="#666" strokeWidth="2" />
          </svg>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, var(--success-color) 0%, var(--success-dark-color) 100%)`,
          opacity: 0.6
        }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          maxWidth: '1200px',
          margin: '0 auto',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Left - Image */}
          <div style={{ position: 'relative' }}>
            {/* Yellow circle */}
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: '-40px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'var(--warning-color)',
              zIndex: 0
            }} />

            {/* Blue circle */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '200px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'var(--chart-primary-color)',
              zIndex: 0
            }} />

            {/* Gray circle */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '0px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: '#E0E0E0',
              zIndex: 0
            }} />

            {/* Main image container */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              borderRadius: '80px',
              overflow: 'hidden',
              width: '250px',
              height: '520px',
              border: '3px solid #1a1a1a',
              background: 'white',
              transform: 'rotate(-15deg)',
              animation: 'slideInImage 0.8s ease-out'
            }}>
              <img
                key={activeSlide}
                src={slides[activeSlide].image}
                alt="Learning"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            <div style={{
              position: 'absolute',
              zIndex: -100,
              borderRadius: '80px',
              width: '250px',
              height: '520px',
              border: '2px solid #1a1a1a',
              background: 'white',
              transform: 'rotate(-15deg)',
              right: '270px',
              top: '0px'
            }} />

            {/* Arrow decoration */}
            <div style={{
              position: 'absolute',
              bottom: '50px',
              right: '-50px',
              zIndex: 2
            }}>
              <svg width="100" height="60" viewBox="0 0 100 60">
                <path d="M10 30 Q 50 10, 90 30" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                <path d="M85 25 L95 30 L85 35" fill="none" stroke="#1a1a1a" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Right - Content */}
          <div key={activeSlide} style={{ animation: 'slideInContent 1s ease-out' }}>
            <h1 style={{
              fontSize: '58px',
              fontWeight: '900',
              color: '#1a1a1a',
              marginBottom: '30px',
              lineHeight: '1.2'
            }}>
              {slides[activeSlide].title}
            </h1>

            <p style={{
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.8',
              marginBottom: '50px',
              maxWidth: '550px'
            }}>
              {slides[activeSlide].description}
            </p>

            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button style={{
                background: `linear-gradient(135deg, var(--success-color) 0%, var(--success-dark-color) 100%)`,
                border: 'none',
                padding: '20px 60px',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                }}
              >
                COMMENCER MAINTENANT
              </button>

              {/* Arrow pointing to button */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-80px'
              }}>
                <svg width="120" height="80" viewBox="0 0 120 80">
                  <path d="M20 20 Q 80 10, 100 50" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                  <path d="M95 45 L105 50 L97 55" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Slide indicators */}
            <div style={{
              display: 'flex',
              gap: '15px',
              marginTop: '60px'
            }}>
              {slides.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  style={{
                    width: index === activeSlide ? '40px' : '15px',
                    height: '15px',
                    borderRadius: '10px',
                    background: index === activeSlide ? 'var(--success-color)' : '#E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Section */}
      <div style={{
        padding: '80px 60px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '42px',
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: '60px',
          background: `linear-gradient(135deg, var(--success-color) 0%, var(--warning-color) 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Tableau de Bord - Statistiques de l'Établissement
        </h2>

        {/* Main Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px',
          marginBottom: '50px'
        }}>
          {[
            { Icon: FaUsers, value: dashboardData.nombreTotalEleve, label: 'Total Élèves', sublabel: `${dashboardData.nombreTotalEleveGarcons} garçons • ${dashboardData.nombreTotalEleveFilles} filles`, colorVar: '--success-color' },
            { Icon: FaUserCheck, value: dashboardData.nombreEleveAff, label: 'Élèves Affectés', sublabel: `${((dashboardData.nombreEleveAff / dashboardData.nombreTotalEleve) * 100).toFixed(1)}% du total`, colorVar: '--info-color' },
            { Icon: FaUser, value: dashboardData.nombrePersonnel, label: 'Personnel Total', sublabel: 'Tous les membres du personnel', colorVar: '--warning-color' }
          ].map((stat, idx) => (
            <div key={idx} className="stat-card" style={{
              background: `color-mix(in srgb, var(${stat.colorVar}) 10%, transparent)`,
              border: `1px solid color-mix(in srgb, var(${stat.colorVar}) 30%, transparent)`,
              borderRadius: '20px',
              padding: '35px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, var(${stat.colorVar}), var(${stat.colorVar}))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px',
                color: 'white',
                fontSize: '36px'
              }}>
                <stat.Icon />
              </div>
              <div style={{
                fontSize: '42px',
                fontWeight: '800',
                color: `var(${stat.colorVar})`,
                marginBottom: '10px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '16px',
                color: '#64748b',
                fontWeight: '600',
                marginBottom: '10px'
              }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                {stat.sublabel}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '30px',
          marginBottom: '50px'
        }}>
          {/* Staff Chart */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '35px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaChartLine style={{ color: 'var(--success-color)' }} />
              Répartition du Personnel
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#7e8ba3" />
                <YAxis stroke="#7e8ba3" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="masculin" fill={chartColors.male} radius={[10, 10, 0, 0]} name="Hommes" />
                <Bar dataKey="feminin" fill={chartColors.female} radius={[10, 10, 0, 0]} name="Femmes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Student Distribution Pie */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '35px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaUsers style={{ color: 'var(--info-color)' }} />
              Répartition Élèves
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {studentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? chartColors.male : chartColors.female} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px',
          marginBottom: '50px'
        }}>
          {[
            { label: 'Élèves Anciens', value: dashboardData.nombreEleveAnc, aff: dashboardData.nombreEleveAncAffGarcons + dashboardData.nombreEleveAncAffFilles, nonAff: dashboardData.nombreEleveAncNonAffGarcons + dashboardData.nombreEleveAncNonAffFilles, colorVar: '--success-color' },
            { label: 'Élèves Nouveaux', value: dashboardData.nombreEleveNouv, aff: dashboardData.nombreEleveNouvAffGarcons + dashboardData.nombreEleveNouvAffFilles, nonAff: dashboardData.nombreEleveNouvNonAffGarcons + dashboardData.nombreEleveNouvNonAffFilles, colorVar: '--info-color' },
            { label: 'Infrastructure', salles: dashboardData.sallesDispo, classes: dashboardData.nombreClasses, colorVar: '--warning-color' }
          ].map((item, idx) => (
            <div key={idx} className="stat-card" style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: `2px solid var(${item.colorVar})`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  background: `var(${item.colorVar})`
                }} />
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#2c3e50' }}>
                  {item.label}
                </h4>
              </div>
              {item.value !== undefined ? (
                <>
                  <div style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    color: `var(${item.colorVar})`,
                    marginBottom: '15px'
                  }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Affectés: {item.aff}
                    <span style={{ margin: '0 10px' }}>•</span>
                    Non affectés: {item.nonAff}
                  </div>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>Salles dispo</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--info-color)' }}>
                      {item.salles}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>Classes</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--chart-primary-color)' }}>
                      {item.classes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Personnel Details */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            Personnel de l'Établissement - Vue Détaillée
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '30px'
          }}>
            {[
              { label: 'Administratif', masculin: dashboardData.personnelAdmMasculin, feminin: dashboardData.personnelAdmFeminin, colorVar: '--success-color' },
              { label: 'Educateur', masculin: dashboardData.personnelEducateurMasculin, feminin: dashboardData.personnelEducateurFeminin, colorVar: '--info-color' },
              { label: 'Enseignant', masculin: dashboardData.personnelEnseignantMasculin, feminin: dashboardData.personnelEnseignantFeminin, colorVar: '--warning-color' },
              { label: 'Permanent', masculin: dashboardData.enseignantPermanentMasculin, feminin: dashboardData.enseignantPermanentFeminin, colorVar: '--chart-primary-color' }
            ].map((item, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '25px',
                background: `color-mix(in srgb, var(${item.colorVar}) 10%, transparent)`,
                borderRadius: '15px',
                border: `2px solid color-mix(in srgb, var(${item.colorVar}) 30%, transparent)`
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: `var(${item.colorVar})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: 'white',
                  fontSize: '24px'
                }}>
                  <FaUsers />
                </div>
                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '16px' }}>
                  {item.label}
                </h4>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  fontSize: '20px',
                  fontWeight: '700'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Hommes</div>
                    <div style={{ color: chartColors.male }}>{item.masculin}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Femmes</div>
                    <div style={{ color: chartColors.female }}>{item.feminin}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEnseignementSecondaireGenerale;