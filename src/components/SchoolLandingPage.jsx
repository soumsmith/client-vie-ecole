import React, { useState } from 'react';
import { Progress } from 'rsuite';
import { 
  FaBook, 
  FaCalculator, 
  FaPalette, 
  FaMusic, 
  FaFutbol,
  FaGlobe,
  FaTrophy,
  FaStar,
  FaFire,
  FaChartLine,
  FaCrown,
  FaRocket,
  FaArrowRight
} from 'react-icons/fa';

const SchoolDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('semaine');

  const stats = [
    { 
      icon: FaStar, 
      value: '1,234', 
      label: 'Points Totaux', 
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
    },
    { 
      icon: FaTrophy, 
      value: '12', 
      label: 'Trophées', 
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
    },
    { 
      icon: FaFire, 
      value: '7 jours', 
      label: 'Série Active', 
      color: '#EF4444',
      bgColor: '#FEF2F2',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
    },
    { 
      icon: FaChartLine, 
      value: '85%', 
      label: 'Progression', 
      color: '#10B981',
      bgColor: '#F0FDF4',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    }
  ];

  const activities = [
    {
      id: 1,
      title: 'Mathématiques',
      icon: FaCalculator,
      color: '#3B82F6',
      progress: 75,
      points: 450,
      lessons: 12,
      completed: 9,
      nextLesson: 'Addition à 3 chiffres'
    },
    {
      id: 2,
      title: 'Français',
      icon: FaBook,
      color: '#8B5CF6',
      progress: 85,
      points: 520,
      lessons: 15,
      completed: 13,
      nextLesson: 'Les verbes du 2ème groupe'
    },
    {
      id: 3,
      title: 'Arts Créatifs',
      icon: FaPalette,
      color: '#EC4899',
      progress: 60,
      points: 380,
      lessons: 10,
      completed: 6,
      nextLesson: 'Peinture à l\'aquarelle'
    },
    {
      id: 4,
      title: 'Musique',
      icon: FaMusic,
      color: '#10B981',
      progress: 70,
      points: 410,
      lessons: 8,
      completed: 6,
      nextLesson: 'Notes de la gamme'
    },
    {
      id: 5,
      title: 'Sport',
      icon: FaFutbol,
      color: '#F59E0B',
      progress: 90,
      points: 580,
      lessons: 10,
      completed: 9,
      nextLesson: 'Football - Règles du jeu'
    },
    {
      id: 6,
      title: 'Sciences',
      icon: FaGlobe,
      color: '#06B6D4',
      progress: 55,
      points: 340,
      lessons: 12,
      completed: 7,
      nextLesson: 'Le système solaire'
    }
  ];

  const weeklyData = [
    { day: 'Lun', points: 120, color: '#3B82F6' },
    { day: 'Mar', points: 180, color: '#8B5CF6' },
    { day: 'Mer', points: 150, color: '#EC4899' },
    { day: 'Jeu', points: 200, color: '#10B981' },
    { day: 'Ven', points: 170, color: '#F59E0B' },
    { day: 'Sam', points: 90, color: '#06B6D4' },
    { day: 'Dim', points: 60, color: '#EF4444' }
  ];

  const recentAchievements = [
    { emoji: '🏆', title: 'Champion de Maths', date: 'Il y a 2 jours', color: '#F59E0B' },
    { emoji: '📚', title: 'Grand Lecteur', date: 'Il y a 3 jours', color: '#8B5CF6' },
    { emoji: '🎨', title: 'Artiste en Herbe', date: 'Il y a 5 jours', color: '#EC4899' },
    { emoji: '⭐', title: 'Élève Modèle', date: 'Il y a 1 semaine', color: '#3B82F6' }
  ];

  const maxPoints = Math.max(...weeklyData.map(d => d.points));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 30%, #7DD3FC 60%, #38BDF8 100%)',
      fontFamily: "'Poppins', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-25px) rotate(5deg); }
          }

          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes fadeInUp {
            from { 
              opacity: 0; 
              transform: translateY(40px);
            }
            to { 
              opacity: 1; 
              transform: translateY(0);
            }
          }

          @keyframes slideInLeft {
            from { 
              opacity: 0; 
              transform: translateX(-60px);
            }
            to { 
              opacity: 1; 
              transform: translateX(0);
            }
          }

          @keyframes slideInRight {
            from { 
              opacity: 0; 
              transform: translateX(60px);
            }
            to { 
              opacity: 1; 
              transform: translateX(0);
            }
          }

          @keyframes scaleIn {
            from { 
              opacity: 0; 
              transform: scale(0.9);
            }
            to { 
              opacity: 1; 
              transform: scale(1);
            }
          }

          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .card-hover {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .card-hover:hover {
            transform: translateY(-12px);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12);
          }

          .stat-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }

          .stat-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          }

          .btn-primary {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }

          .btn-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
          }

          .btn-primary:hover::before {
            left: 100%;
          }

          * {
            scrollbar-width: thin;
            scrollbar-color: rgba(59, 130, 246, 0.5) rgba(191, 219, 254, 0.3);
          }

          *::-webkit-scrollbar {
            width: 12px;
          }

          *::-webkit-scrollbar-track {
            background: rgba(191, 219, 254, 0.3);
            border-radius: 10px;
          }

          *::-webkit-scrollbar-thumb {
            background: rgba(59, 130, 246, 0.6);
            border-radius: 10px;
            border: 2px solid rgba(191, 219, 254, 0.3);
          }

          *::-webkit-scrollbar-thumb:hover {
            background: rgba(59, 130, 246, 0.8);
          }
        `}
      </style>

      {/* Animated Background Shapes */}
      <div style={{
        position: 'fixed',
        top: '5%',
        right: '8%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'floatSlow 15s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        bottom: '5%',
        left: '5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'floatSlow 20s ease-in-out infinite',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Landing Page Section */}
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '60px 60px 80px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '100px',
            alignItems: 'center',
            minHeight: '90vh'
          }}>
            
            {/* Left Content */}
            <div style={{ 
              animation: 'slideInLeft 1s ease-out'
            }}>
                {/* Header avec filtres */}
          <div className="glass-card" style={{
            borderRadius: '35px',
            padding: '45px 55px',
            marginBottom: '50px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            animation: 'scaleIn 0.6s ease-out'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(251, 191, 36, 0.3)'
                  }}>
                    <FaCrown size={24} color="white" />
                  </div>
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: '900',
                    background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0
                  }}>
                    Mon Tableau de Bord
                  </h2>
                </div>
                <p style={{
                  fontSize: '16px',
                  color: '#64748B',
                  fontWeight: '600',
                  margin: 0
                }}>
                  Suis ta progression et tes activités quotidiennes
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                background: 'rgba(59, 130, 246, 0.08)',
                padding: '8px',
                borderRadius: '20px'
              }}>
                {/* {['Aujourd\'hui', 'Semaine', 'Mois'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period.toLowerCase())}
                    className="btn-primary"
                    style={{
                      padding: '12px 30px',
                      background: selectedPeriod === period.toLowerCase() 
                        ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                        : 'transparent',
                      color: selectedPeriod === period.toLowerCase() ? 'white' : '#64748B',
                      border: 'none',
                      borderRadius: '15px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: selectedPeriod === period.toLowerCase() 
                        ? '0 8px 20px rgba(59, 130, 246, 0.3)' 
                        : 'none'
                    }}
                  >
                    {period}
                  </button>
                ))} */}
              </div>
            </div>
          </div>
              {/* <div style={{
                display: 'inline-block',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '12px 30px',
                borderRadius: '50px',
                marginBottom: '30px',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}>
                <span style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  ✨ Bienvenue à l'Excellence
                </span>
              </div> */}

              <h1 style={{
                fontSize: '72px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.1',
                marginBottom: '25px',
                letterSpacing: '-2px'
              }}>
                CLASSE<br/>
                INTERNATIONALE
              </h1>

              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1E3A8A',
                lineHeight: '1.4',
                marginBottom: '30px',
                textShadow: '0 2px 4px rgba(30, 58, 138, 0.1)'
              }}>
                Rejoins Tes Amis Pour Des<br/>
                Activités Enrichissantes
              </h2>

              <p style={{
                fontSize: '18px',
                color: '#334155',
                lineHeight: '1.8',
                marginBottom: '40px',
                maxWidth: '520px',
                fontWeight: '500'
              }}>
                Apprends, joue et découvre de nouvelles choses chaque jour avec tes camarades. Des activités amusantes et éducatives t'attendent après l'école.
              </p>

              <button className="btn-primary" style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: 'white',
                border: 'none',
                padding: '18px 45px',
                borderRadius: '50px',
                fontSize: '17px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
              }}>
                Commencer l'Aventure
                <FaArrowRight size={16} />
              </button>
            </div>

            {/* Right Content - Decorative */}
            <div style={{
              position: 'relative',
              height: '700px',
              animation: 'slideInRight 1s ease-out'
            }}>
              {/* Badge École */}
              <div style={{
                position: 'absolute',
                top: '30px',
                right: '60px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: '60px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                boxShadow: '0 15px 40px rgba(16, 185, 129, 0.35)',
                zIndex: 10,
                animation: 'float 5s ease-in-out infinite',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=150&h=150&fit=crop"
                    alt="Student"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'white',
                  lineHeight: '1.3'
                }}>
                  Meilleure<br/>
                  École<br/>
                  Agréée
                </div>
              </div>

              {/* Circles colorés */}
              <div style={{
                position: 'absolute',
                width: '380px',
                height: '380px',
                background: 'rgba(191, 219, 254, 0.5)',
                borderRadius: '50%',
                top: '60px',
                right: '90px',
                zIndex: 1,
                backdropFilter: 'blur(5px)'
              }} />

              <div style={{
                position: 'absolute',
                width: '280px',
                height: '280px',
                background: 'rgba(147, 197, 253, 0.6)',
                borderRadius: '50%',
                top: '10px',
                right: '-60px',
                zIndex: 2,
                backdropFilter: 'blur(5px)'
              }} />

              {/* Badge Adresse */}
              <div style={{
                position: 'absolute',
                width: '220px',
                height: '220px',
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                borderRadius: '50%',
                top: '110px',
                right: '-50px',
                zIndex: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px',
                boxShadow: '0 15px 40px rgba(245, 158, 11, 0.4)',
                animation: 'float 6s ease-in-out infinite 1s',
                border: '4px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '700',
                  lineHeight: '1.6'
                }}>
                  Empire Polo Club<br/>
                  81-800 Avenue 51,<br/>
                  Indio U.S.A
                </div>
              </div>

              {/* Badge 200+ */}
              <div style={{
                position: 'absolute',
                top: '280px',
                left: '-30px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                borderRadius: '60px',
                padding: '30px 45px',
                boxShadow: '0 15px 40px rgba(59, 130, 246, 0.4)',
                zIndex: 8,
                animation: 'float 5.5s ease-in-out infinite 0.5s',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{
                  fontSize: '42px',
                  fontWeight: '900',
                  color: 'white',
                  marginBottom: '5px',
                  textAlign: 'center'
                }}>
                  200+
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  Diplômés
                </div>
              </div>

              {/* Photo circulaire petite */}
              <div style={{
                position: 'absolute',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '5px solid white',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
                top: '400px',
                left: '40px',
                zIndex: 7,
                animation: 'float 7s ease-in-out infinite 2s'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=200&h=200&fit=crop"
                  alt="Student"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Photo principale grande */}
              <div style={{
                position: 'absolute',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '8px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
                top: '290px',
                right: '40px',
                zIndex: 6,
                animation: 'float 8s ease-in-out infinite 1.5s'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop"
                  alt="Students"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Étoile décorative rose */}
              <div style={{
                position: 'absolute',
                width: '130px',
                height: '130px',
                background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                borderRadius: '50%',
                bottom: '60px',
                right: '170px',
                zIndex: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 15px 35px rgba(236, 72, 153, 0.4)',
                animation: 'float 6.5s ease-in-out infinite 3s',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{
                  fontSize: '50px',
                  color: 'white',
                  animation: 'spin 25s linear infinite'
                }}>
                  ✦
                </div>
              </div>

              {/* Étoile dorée */}
              <div style={{
                position: 'absolute',
                bottom: '30px',
                right: '80px',
                fontSize: '60px',
                color: '#FBBF24',
                zIndex: 7,
                animation: 'float 7.5s ease-in-out infinite 2.5s',
                filter: 'drop-shadow(0 8px 16px rgba(251, 191, 36, 0.4))'
              }}>
                ✦
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        <div style={{
          padding: '100px 60px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          

          {/* Statistics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '25px',
            marginBottom: '50px'
          }}>
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="stat-card glass-card"
                style={{
                  borderRadius: '28px',
                  padding: '32px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                  animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s backwards`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '140px',
                  height: '140px',
                  background: stat.bgColor,
                  borderRadius: '50%',
                  opacity: 0.7
                }} />
                
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: stat.gradient,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '22px',
                  position: 'relative',
                  boxShadow: `0 10px 25px ${stat.color}30`
                }}>
                  <stat.icon size={32} color="white" />
                </div>

                <div style={{
                  fontSize: '38px',
                  fontWeight: '900',
                  color: '#0F172A',
                  marginBottom: '8px'
                }}>
                  {stat.value}
                </div>

                <div style={{
                  fontSize: '14px',
                  color: '#64748B',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '30px'
          }}>
            {/* Activities */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '25px'
              }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)'
                }}>
                  <FaRocket size={22} color="white" />
                </div>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#0F172A',
                  margin: 0
                }}>
                  Mes Matières
                </h3>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '22px'
              }}>
                {activities.map((activity, idx) => (
                  <div
                    key={activity.id}
                    className="card-hover glass-card"
                    style={{
                      borderRadius: '28px',
                      padding: '30px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                      animation: `fadeInUp 0.6s ease-out ${0.3 + idx * 0.08}s backwards`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '22px'
                    }}>
                      <div style={{
                        width: '62px',
                        height: '62px',
                        background: `${activity.color}15`,
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${activity.color}20`,
                        border: `2px solid ${activity.color}20`
                      }}>
                        <activity.icon size={30} color={activity.color} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: '800',
                          color: '#0F172A',
                          marginBottom: '6px'
                        }}>
                          {activity.title}
                        </h4>
                        <div style={{
                          fontSize: '13px',
                          color: '#64748B',
                          fontWeight: '600'
                        }}>
                          {activity.completed}/{activity.lessons} leçons complétées
                        </div>
                      </div>

                      <div style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: activity.color
                      }}>
                        {activity.progress}%
                      </div>
                    </div>

                    <Progress.Line
                      percent={activity.progress}
                      strokeColor={activity.color}
                      strokeWidth={11}
                      showInfo={false}
                      style={{ marginBottom: '20px' }}
                    />

                    <div style={{
                      fontSize: '13px',
                      color: '#64748B',
                      marginBottom: '18px',
                      fontWeight: '600',
                      background: '#F8FAFC',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0'
                    }}>
                      📖 À venir : <strong style={{ color: '#0F172A' }}>{activity.nextLesson}</strong>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        background: `${activity.color}15`,
                        padding: '10px 18px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '800',
                        color: activity.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: `2px solid ${activity.color}20`
                      }}>
                        <FaStar size={15} />
                        {activity.points} pts
                      </div>

                      <button className="btn-primary" style={{
                        background: activity.color,
                        color: 'white',
                        border: 'none',
                        padding: '11px 22px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        Continuer
                        <FaArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Weekly Chart */}
              <div className="glass-card" style={{
                borderRadius: '28px',
                padding: '30px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                marginBottom: '25px',
                animation: 'fadeInUp 0.6s ease-out 0.4s backwards'
              }}>
                <h4 style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#0F172A',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  📊 Points Cette Semaine
                </h4>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '10px',
                  height: '200px',
                  justifyContent: 'space-between',
                  background: '#F8FAFC',
                  padding: '20px 15px',
                  borderRadius: '20px',
                  border: '1px solid #E2E8F0'
                }}>
                  {weeklyData.map((data, idx) => (
                    <div key={idx} style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '800',
                        color: data.color,
                        background: 'white',
                        padding: '5px 10px',
                        borderRadius: '10px',
                        boxShadow: `0 4px 12px ${data.color}25`,
                        border: `2px solid ${data.color}30`
                      }}>
                        {data.points}
                      </div>
                      <div style={{
                        width: '100%',
                        height: `${(data.points / maxPoints) * 140}px`,
                        background: `linear-gradient(180deg, ${data.color} 0%, ${data.color}95 100%)`,
                        borderRadius: '12px 12px 0 0',
                        transition: 'all 0.4s ease',
                        animation: `scaleIn 0.8s ease-out ${idx * 0.1}s backwards`,
                        boxShadow: `0 -6px 16px ${data.color}35`
                      }} />
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        color: '#64748B'
                      }}>
                        {data.day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="glass-card" style={{
                borderRadius: '28px',
                padding: '30px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                animation: 'fadeInUp 0.6s ease-out 0.5s backwards'
              }}>
                <h4 style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#0F172A',
                  marginBottom: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  🏆 Récompenses Récentes
                </h4>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {recentAchievements.map((achievement, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: `${achievement.color}08`,
                      borderRadius: '20px',
                      animation: `fadeInUp 0.6s ease-out ${0.6 + idx * 0.1}s backwards`,
                      border: `2px solid ${achievement.color}20`,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(8px)';
                      e.currentTarget.style.boxShadow = `0 10px 25px ${achievement.color}35`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <div style={{
                        width: '58px',
                        height: '58px',
                        background: achievement.color,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        boxShadow: `0 8px 20px ${achievement.color}45`,
                        flexShrink: 0,
                        border: '3px solid white'
                      }}>
                        {achievement.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '800',
                          color: '#0F172A',
                          marginBottom: '5px'
                        }}>
                          {achievement.title}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748B',
                          fontWeight: '600'
                        }}>
                          {achievement.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;