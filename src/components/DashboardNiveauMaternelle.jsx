import React, { useState, useEffect } from 'react';
import { FaInstagram, FaFacebookF, FaUsers, FaUserCheck, FaChalkboardTeacher, FaBook, FaStar, FaClock, FaChild } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DashboardMaternelle = ({ niveau = 'EnseignementMaternelle' }) => {
  const [chartColors, setChartColors] = useState({ primary: '#FF6AB4', secondary: '#4FC3F7' });

  // Récupère les couleurs du thème
  useEffect(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    setChartColors({
      primary: style.getPropertyValue('--chart-primary-color').trim() || '#FF6AB4',
      secondary: style.getPropertyValue('--chart-secondary-color').trim() || '#4FC3F7'
    });
  }, [niveau]);

  const dashboardData = {
    totalEnfants: 156,
    garcons: 82,
    filles: 74,
    enfantsInscrits: 142,
    listeAttente: 14,
    personnel: 24,
    enseignants: 15,
    assistants: 9,
    classes: 8,
    salles: 12,
    capaciteMax: 180
  };

  const ageDistribution = [
    { age: '2-3 ans', nombre: 38 },
    { age: '3-4 ans', nombre: 52 },
    { age: '4-5 ans', nombre: 45 },
    { age: '5-6 ans', nombre: 21 }
  ];

  const genreData = [
    { name: 'Garçons', value: dashboardData.garcons },
    { name: 'Filles', value: dashboardData.filles }
  ];

  const activitesData = [
    { activite: 'Arts', participants: 45 },
    { activite: 'Musique', participants: 38 },
    { activite: 'Sports', participants: 52 },
    { activite: 'Lecture', participants: 63 }
  ];

  return (
    <div className={niveau} style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#F5F7FA' }}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .stat-card {
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
          }

          .social-icon {
            transition: all 0.3s ease;
          }

          .social-icon:hover {
            transform: scale(1.2);
          }
        `}
      </style>

      {/* Hero Section - Landing Page */}
      <div style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F4F8 100%)',
        minHeight: '100vh',
        padding: '40px 60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative bunting flags */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '60px',
          display: 'flex',
          gap: '5px'
        }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              width: '0',
              height: '0',
              borderLeft: '20px solid transparent',
              borderRight: '20px solid transparent',
              borderTop: `35px solid var(${i % 2 === 0 ? '--active-color' : '--primary-color'})`,
              margin: '0 2px'
            }} />
          ))}
        </div>

        {/* Stars decoration */}
        {[
          { top: '80px', left: '150px', size: '30px' },
          { top: '450px', left: '250px', size: '25px' },
          { top: '200px', right: '400px', size: '35px' },
          { top: '500px', right: '200px', size: '28px' }
        ].map((star, i) => (
          <div key={i} style={{
            position: 'absolute',
            ...star,
            color: 'var(--warning-color)',
            fontSize: star.size,
            animation: `float ${2 + i * 0.5}s ease-in-out infinite`
          }}>
            <FaStar />
          </div>
        ))}

        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
          minHeight: '80vh'
        }}>
          {/* Left Content */}
          <div>
            <h3 style={{
              fontSize: '24px',
              color: '#5B6B8C',
              fontWeight: '600',
              marginBottom: '20px',
              letterSpacing: '1px'
            }}>
              Nursery School
            </h3>

            <h1 style={{
              fontSize: '80px',
              fontWeight: '900',
              color: 'var(--primary-color)',
              lineHeight: '1',
              marginBottom: '30px',
              textTransform: 'uppercase',
              letterSpacing: '-2px'
            }}>
              LEARN<br />AND PLAY
            </h1>

            <div style={{
              fontSize: '28px',
              color: '#5B6B8C',
              fontWeight: '600',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <span>22 July</span>
              <span style={{ color: 'var(--warning-color)' }}>|</span>
              <span>At 10:00 am</span>
            </div>

            <p style={{
              fontSize: '16px',
              color: '#7B8BA3',
              lineHeight: '1.8',
              marginBottom: '40px',
              maxWidth: '500px'
            }}>
              Découvrez un environnement d'apprentissage ludique et sécurisé pour votre enfant. 
              Notre école maternelle offre des programmes éducatifs adaptés à chaque âge, 
              avec des activités créatives et des jeux pédagogiques.
            </p>

            <button style={{
              background: 'var(--active-color)',
              border: 'none',
              padding: '18px 45px',
              borderRadius: '8px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              marginBottom: '50px'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }}
            >
              Register now!
            </button>

            {/* Social Media */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div className="social-icon" style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E1306C, #C13584)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}>
                <FaInstagram />
              </div>

              <div className="social-icon" style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1877F2, #0C63D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}>
                <FaFacebookF />
              </div>

              <span style={{
                fontSize: '18px',
                color: '#5B6B8C',
                fontWeight: '600'
              }}>
                @NurserySchool
              </span>
            </div>
          </div>

          {/* Right Illustration - Simplifié */}
          <div style={{ position: 'relative', height: '600px' }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: `radial-gradient(circle at center, var(--primary-color)20 0%, transparent 70%)`,
              animation: 'float 8s ease-in-out infinite'
            }} />
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
          fontSize: '48px',
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: '60px',
          background: `linear-gradient(135deg, var(--primary-color) 0%, var(--info-color) 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Tableau de Bord - Statistiques de l'École
        </h2>

        {/* Main Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '25px',
          marginBottom: '50px'
        }}>
          {[
            { Icon: FaChild, value: dashboardData.totalEnfants, label: 'Total Enfants', colorVar: '--primary-color' },
            { Icon: FaUserCheck, value: dashboardData.enfantsInscrits, label: 'Inscrits', colorVar: '--active-color' },
            { Icon: FaChalkboardTeacher, value: dashboardData.personnel, label: 'Personnel Total', colorVar: '--info-color' },
            { Icon: FaBook, value: dashboardData.classes, label: 'Classes', colorVar: '--warning-color' }
          ].map((stat, idx) => (
            <div key={idx} className="stat-card" style={{
              background: `color-mix(in srgb, var(${stat.colorVar}) 10%, transparent)`,
              border: `2px solid color-mix(in srgb, var(${stat.colorVar}) 30%, transparent)`,
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, var(${stat.colorVar}), var(${stat.colorVar}))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: 'white',
                fontSize: '32px'
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
                fontWeight: '600'
              }}>
                {stat.label}
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
          {/* Activities Chart */}
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
              marginBottom: '30px'
            }}>
              Participation aux Activités
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activitesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="activite" stroke="#7e8ba3" />
                <YAxis stroke="#7e8ba3" />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="participants" fill={chartColors.primary} radius={[10, 10, 0, 0]} name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Pie */}
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
              marginBottom: '30px'
            }}>
              Répartition Genre
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? chartColors.secondary : chartColors.primary} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution */}
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
            Répartition par Tranche d'Âge
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '25px'
          }}>
            {ageDistribution.map((item, index) => {
              const colors = ['--primary-color', '--active-color', '--info-color', '--warning-color'];
              const colorVar = colors[index % colors.length];
              
              return (
                <div key={index} className="stat-card" style={{
                  textAlign: 'center',
                  padding: '30px',
                  background: `color-mix(in srgb, var(${colorVar}) 10%, transparent)`,
                  borderRadius: '15px',
                  border: `2px solid color-mix(in srgb, var(${colorVar}) 30%, transparent)`
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: `var(${colorVar})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    <FaChild />
                  </div>
                  <h4 style={{
                    margin: '0 0 15px 0',
                    color: '#2c3e50',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {item.age}
                  </h4>
                  <div style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    color: `var(${colorVar})`
                  }}>
                    {item.nombre}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personnel Details */}
        <div style={{
          marginTop: '50px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '25px'
        }}>
          <div className="stat-card" style={{
            background: 'white',
            borderRadius: '20px',
            padding: '35px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
          }}>
            <h4 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FaUsers style={{ color: 'var(--info-color)' }} />
              Personnel Éducatif
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
                  Enseignants
                </div>
                <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--info-color)' }}>
                  {dashboardData.enseignants}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
                  Assistants
                </div>
                <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--primary-color)' }}>
                  {dashboardData.assistants}
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{
            background: 'white',
            borderRadius: '20px',
            padding: '35px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
          }}>
            <h4 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FaBook style={{ color: 'var(--active-color)' }} />
              Infrastructure
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
                  Salles Total
                </div>
                <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--active-color)' }}>
                  {dashboardData.salles}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
                  Capacité Max
                </div>
                <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--warning-color)' }}>
                  {dashboardData.capaciteMax}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMaternelle;