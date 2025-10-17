import React, { useState } from 'react';
import { FaSearch, FaShareAlt, FaUsers, FaChalkboardTeacher, FaBook, FaGraduationCap, FaLightbulb, FaAtom, FaChartLine, FaUserGraduate } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ELearningLandingPage = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Données statistiques
  const stats = {
    totalStudents: 1245,
    totalTeachers: 83,
    activeCourses: 156,
    successRate: 94,
    maleStudents: 678,
    femaleStudents: 567,
    newEnrollments: 353,
    staffMembers: 128
  };

  const slides = [
    {
      title: "Ensemble nous Réalisons Quelque Chose",
      highlight: "d'Extraordinaire",
      subtitle: "Améliorer l'Avenir de Vos Élèves",
      description: "Formation technique et professionnelle de qualité adaptée aux besoins du marché. Notre établissement offre un enseignement moderne dans tous les domaines techniques.",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=600&fit=crop"
    },
    {
      title: "Apprenez avec des Experts",
      highlight: "Qualifiés",
      subtitle: "Excellence en Enseignement Technique",
      description: "Notre équipe pédagogique expérimentée accompagne chaque élève vers la réussite professionnelle avec des formations pratiques et théoriques de haut niveau.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=600&fit=crop"
    },
    {
      title: "Construisez Votre Avenir",
      highlight: "Professionnel",
      subtitle: "Formation Technique Flexible",
      description: "Accédez à des ressources pédagogiques modernes et à des équipements de pointe. Notre système de formation s'adapte aux exigences du secteur technique.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=600&fit=crop"
    }
  ];

  // Auto-play des slides
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change toutes les 5 secondes

    return () => clearInterval(interval);
  }, [slides.length]);

  const studentData = [
    { name: 'Garçons', value: stats.maleStudents, color: '#8B7355' },
    { name: 'Filles', value: stats.femaleStudents, color: '#5ECFB1' }
  ];

  const performanceData = [
    { category: 'Électrotechnique', score: 85 },
    { category: 'Mécanique', score: 92 },
    { category: 'Informatique', score: 88 },
    { category: 'Bâtiment', score: 78 },
    { category: 'Commerce', score: 81 }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAF7F5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          .nav-link {
            transition: color 0.3s ease;
            cursor: pointer;
          }

          .nav-link:hover {
            color: #5ECFB1 !important;
          }

          .stat-card {
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.12);
          }

          .btn-primary {
            transition: all 0.3s ease;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(94, 207, 177, 0.4);
          }

          .btn-secondary {
            transition: all 0.3s ease;
          }

          .btn-secondary:hover {
            background: #f0f0f0;
          }
        `}
      </style>

   
      {/* Decorative dots top */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 4px)',
        gap: '8px',
        padding: '15px'
      }}>
        {[...Array(30)].map((_, i) => (
          <div key={i} style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: i % 3 === 0 ? '#5ECFB1' : i % 3 === 1 ? '#8B7355' : '#B8A99A',
            opacity: 0.4
          }} />
        ))}
      </div>

      {/* Hero Section */}
      <div style={{
        padding: '60px 60px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '80px',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Left - Image Section */}
        <div style={{ position: 'relative' }}>
          {/* Decorative atom icon */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '-40px',
            width: '80px',
            height: '80px',
            background: '#5ECFB1',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '36px',
            animation: 'float 3s ease-in-out infinite',
            zIndex: 2
          }}>
            <FaAtom />
          </div>

          {/* Main image - Books and Apple */}
          <div style={{
            position: 'relative',
            width: '480px',
            height: '480px',
            borderTopLeftRadius : '50%',
            borderTopRightRadius : '50%',
            borderBottomLeftRadius : '50%',
            overflow: 'hidden',
            border: '12px solid #F5F1ED',
            boxShadow: '0 25px 70px rgba(0,0,0,0.2)',
            margin: '0 auto',
            background: 'white'
          }}>
            <img
              key={activeSlide}
              src={slides[activeSlide].image}
              alt="Education"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity 0.5s ease'
              }}
            />
          </div>

          {/* Decorative lightbulb icon */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            right: '-20px',
            width: '90px',
            height: '90px',
            background: '#6C63FF',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '40px',
            animation: 'pulse 2s ease-in-out infinite',
            zIndex: 2,
            boxShadow: '0 10px 30px rgba(108, 99, 255, 0.4)'
          }}>
            <FaLightbulb />
          </div>

          {/* Slide indicators */}
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            left: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <span style={{ fontSize: '32px', fontWeight: '700', color: '#333' }}>0{activeSlide + 1}</span>
            <div style={{ width: '60px', height: '3px', background: '#333' }} />
            <span style={{ fontSize: '24px', fontWeight: '400', color: '#999' }}>0{slides.length}</span>
          </div>
        </div>

        {/* Right - Content Section */}
        <div>
          <p style={{
            fontSize: '18px',
            color: '#8B7355',
            fontWeight: '600',
            marginBottom: '15px'
          }}>
            {slides[activeSlide].subtitle}
          </p>

          <h1 style={{
            fontSize: '56px',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '25px',
            color: '#333'
          }}>
            <span style={{ color: '#8B7355' }}>Ensemble</span> nous<br />
            Réalisons Quelque Chose<br />
            <span style={{
              color: '#8B7355',
              fontStyle: 'italic',
              position: 'relative'
            }}>
              {slides[activeSlide].highlight}
              <div style={{
                position: 'absolute',
                bottom: '5px',
                left: '0',
                right: '0',
                height: '3px',
                background: '#8B7355',
                borderRadius: '2px'
              }} />
            </span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#666',
            lineHeight: '1.8',
            marginBottom: '30px',
            maxWidth: '500px'
          }}>
            {slides[activeSlide].description}
          </p>

          {/* <p style={{
            fontSize: '18px',
            color: '#8B7355',
            fontWeight: '600',
            marginBottom: '30px'
          }}>
            Réservez votre place avant le 20 juin
          </p>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="btn-secondary" style={{
              padding: '16px 40px',
              border: '2px solid #333',
              background: 'transparent',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              cursor: 'pointer'
            }}>
              Télécharger
            </button>
            <button className="btn-primary" style={{
              padding: '16px 40px',
              border: 'none',
              background: '#5ECFB1',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(94, 207, 177, 0.3)'
            }}>
              Commencer
            </button>
          </div> */}
        </div>

        {/* Decorative dots right */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '-30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 4px)',
          gap: '6px'
        }}>
          {[...Array(56)].map((_, i) => (
            <div key={i} style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#CCC',
              opacity: 0.4
            }} />
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '0 60px 40px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setActiveSlide(index)}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: index === 0 ? '#5ECFB1' : index === 1 ? '#8B7355' : index === 2 ? '#D4A574' : index === 3 ? '#B8A99A' : '#E8C4A0',
              cursor: 'pointer',
              opacity: index === activeSlide ? 1 : 0.4,
              transition: 'all 0.3s ease',
              transform: index === activeSlide ? 'scale(1.2)' : 'scale(1)'
            }}
          />
        ))}
      </div>

      {/* Dashboard Section */}
      <div style={{
        padding: '80px 60px',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '60px',
            color: '#333'
          }}>
            Tableau de Bord <span style={{ color: '#5ECFB1' }}>Statistiques</span> de l'Établissement
          </h2>

          {/* Main Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '25px',
            marginBottom: '50px'
          }}>
            <div className="stat-card" style={{
              background: 'linear-gradient(135deg, #5ECFB1 0%, #4AB89C 100%)',
              borderRadius: '20px',
              padding: '30px',
              color: 'white',
              textAlign: 'center'
            }}>
              <FaUsers style={{ fontSize: '42px', marginBottom: '15px' }} />
              <div style={{ fontSize: '38px', fontWeight: '800', marginBottom: '8px' }}>
                {stats.totalStudents}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Élèves</div>
            </div>

            <div className="stat-card" style={{
              background: 'linear-gradient(135deg, #8B7355 0%, #A68968 100%)',
              borderRadius: '20px',
              padding: '30px',
              color: 'white',
              textAlign: 'center'
            }}>
              <FaChalkboardTeacher style={{ fontSize: '42px', marginBottom: '15px' }} />
              <div style={{ fontSize: '38px', fontWeight: '800', marginBottom: '8px' }}>
                {stats.totalTeachers}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Enseignants</div>
            </div>

            <div className="stat-card" style={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #5A52E0 100%)',
              borderRadius: '20px',
              padding: '30px',
              color: 'white',
              textAlign: 'center'
            }}>
              <FaBook style={{ fontSize: '42px', marginBottom: '15px' }} />
              <div style={{ fontSize: '38px', fontWeight: '800', marginBottom: '8px' }}>
                {stats.activeCourses}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Formations Actives</div>
            </div>

            <div className="stat-card" style={{
              background: 'linear-gradient(135deg, #FF6B9D 0%, #E55A8A 100%)',
              borderRadius: '20px',
              padding: '30px',
              color: 'white',
              textAlign: 'center'
            }}>
              <FaChartLine style={{ fontSize: '42px', marginBottom: '15px' }} />
              <div style={{ fontSize: '38px', fontWeight: '800', marginBottom: '8px' }}>
                {stats.successRate}%
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Taux de Réussite</div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '30px',
            marginBottom: '50px'
          }}>
            {/* Performance Chart */}
            <div style={{
              background: '#FAF7F5',
              borderRadius: '20px',
              padding: '35px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#333',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaChartLine color="#5ECFB1" />
                Subject Performance
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="category" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="score" fill="#5ECFB1" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Student Distribution Pie */}
            <div style={{
              background: '#FAF7F5',
              borderRadius: '20px',
              padding: '35px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#333',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaUserGraduate color="#8B7355" />
                Students
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={studentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '25px'
          }}>
            <div className="stat-card" style={{
              background: '#FAF7F5',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center',
              border: '2px solid #5ECFB1'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                color: '#5ECFB1',
                marginBottom: '10px'
              }}>
                {stats.newEnrollments}
              </div>
              <div style={{ fontSize: '16px', color: '#666', fontWeight: '600' }}>
                Nouvelles Inscriptions
              </div>
              <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
                Cette année scolaire
              </div>
            </div>

            <div className="stat-card" style={{
              background: '#FAF7F5',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center',
              border: '2px solid #8B7355'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                color: '#8B7355',
                marginBottom: '10px'
              }}>
                {stats.staffMembers}
              </div>
              <div style={{ fontSize: '16px', color: '#666', fontWeight: '600' }}>
                Membres du Personnel
              </div>
              <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
                Personnel total
              </div>
            </div>

            <div className="stat-card" style={{
              background: '#FAF7F5',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'center',
              border: '2px solid #6C63FF'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                color: '#6C63FF',
                marginBottom: '10px'
              }}>
                12
              </div>
              <div style={{ fontSize: '16px', color: '#666', fontWeight: '600' }}>
                Filières Techniques
              </div>
              <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
                Formations disponibles
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '40px 60px',
        background: '#F5F1ED',
        textAlign: 'center',
        color: '#666'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          © 2025 E-Learning Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ELearningLandingPage;