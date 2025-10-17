import React, { useState, useEffect } from 'react';
import { Progress } from 'rsuite';
import { 
  FaBook, FaCalculator, FaPalette, FaMusic, FaFutbol, FaGlobe,
  FaTrophy, FaStar, FaFire, FaChartLine, FaCrown, FaRocket, FaArrowRight
} from 'react-icons/fa';

const BREVETDETECHNICIENBT = ({ niveau = 'BREVETDETECHNICIENBT' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('semaine');
  const [activityColors, setActivityColors] = useState([]);
  const [weeklyColors, setWeeklyColors] = useState([]);
  const [achievementColors, setAchievementColors] = useState([]);

  // Récupère les couleurs du thème depuis les variables CSS
  useEffect(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    setActivityColors([
      style.getPropertyValue('--activity-1-color').trim() || '#3B82F6',
      style.getPropertyValue('--activity-2-color').trim() || '#8B5CF6',
      style.getPropertyValue('--activity-3-color').trim() || '#EC4899',
      style.getPropertyValue('--activity-4-color').trim() || '#10B981',
      style.getPropertyValue('--activity-5-color').trim() || '#F59E0B',
      style.getPropertyValue('--activity-6-color').trim() || '#06B6D4',
    ]);
    
    setWeeklyColors([
      style.getPropertyValue('--weekly-1-color').trim() || '#3B82F6',
      style.getPropertyValue('--weekly-2-color').trim() || '#8B5CF6',
      style.getPropertyValue('--weekly-3-color').trim() || '#EC4899',
      style.getPropertyValue('--weekly-4-color').trim() || '#10B981',
      style.getPropertyValue('--weekly-5-color').trim() || '#F59E0B',
      style.getPropertyValue('--weekly-6-color').trim() || '#06B6D4',
      style.getPropertyValue('--weekly-7-color').trim() || '#EF4444',
    ]);
    
    setAchievementColors([
      style.getPropertyValue('--achievement-1-color').trim() || '#F59E0B',
      style.getPropertyValue('--achievement-2-color').trim() || '#8B5CF6',
      style.getPropertyValue('--achievement-3-color').trim() || '#EC4899',
      style.getPropertyValue('--achievement-4-color').trim() || '#3B82F6',
    ]);
  }, [niveau]);

  const stats = [
    { icon: FaStar, value: '1,234', label: 'Points Totaux' },
    { icon: FaTrophy, value: '12', label: 'Trophées' },
    { icon: FaFire, value: '7 jours', label: 'Série Active' },
    { icon: FaChartLine, value: '85%', label: 'Progression' }
  ];

  const activities = [
    {
      id: 1,
      title: 'Mathématiques',
      icon: FaCalculator,
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
      progress: 55,
      points: 340,
      lessons: 12,
      completed: 7,
      nextLesson: 'Le système solaire'
    }
  ];

  const weeklyData = [
    { day: 'Lun', points: 120 },
    { day: 'Mar', points: 180 },
    { day: 'Mer', points: 150 },
    { day: 'Jeu', points: 200 },
    { day: 'Ven', points: 170 },
    { day: 'Sam', points: 90 },
    { day: 'Dim', points: 60 }
  ];

  const recentAchievements = [
    { emoji: '🏆', title: 'Champion de Maths', date: 'Il y a 2 jours' },
    { emoji: '📚', title: 'Grand Lecteur', date: 'Il y a 3 jours' },
    { emoji: '🎨', title: 'Artiste en Herbe', date: 'Il y a 5 jours' },
    { emoji: '⭐', title: 'Élève Modèle', date: 'Il y a 1 semaine' }
  ];

  const maxPoints = Math.max(...weeklyData.map(d => d.points));

  return (
    <div className={`landing-dashboard-container_ ${niveau}`}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
          
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-60px); }
            to { opacity: 1; transform: translateX(0); }
          }

          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(60px); }
            to { opacity: 1; transform: translateX(0); }
          }

          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
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
      <div className="bg-shape-1" />
      <div className="bg-shape-2" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Landing Page Section */}
        <div className="landing-section py-0">
          <div className="landing-grid">
            
            {/* Left Content */}
            <div className="landing-left">
              {/* Header avec filtres */}
              <div className="dashboard-header-card glass-card">
                <div className="header-content">
                  <div className="header-left">
                    <div className="title-wrapper">
                      <div className="icon-box">
                        <FaCrown size={24} color="white" />
                      </div>
                      <h2>Mon Tableau de Bord</h2>
                    </div>
                    <p>Suis ta progression et tes activités quotidiennes</p>
                  </div>
                </div>
              </div>

              <h1 className="main-title">
                CLASSE<br/>
                INTERNATIONALE
              </h1>

              <h2 className="subtitle">
                Rejoins Tes Amis Pour Des<br/>
                Activités Enrichissantes
              </h2>

              <p className="description">
                Apprends, joue et découvre de nouvelles choses chaque jour avec tes camarades. Des activités amusantes et éducatives t'attendent après l'école.
              </p>

              {/* <button className="btn-primary" style={{
                background: `linear-gradient(135deg, var(--info-color) 0%, var(--info-dark-color) 100%)`,
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
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
              }}>
                Commencer l'Aventure
                <FaArrowRight size={16} />
              </button> */}
            </div>

            {/* Right Content - Decorative */}
            <div className="landing-right">
              {/* Badge École */}
              <div className="badge-school">
                <div className="avatar">
                  <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=150&h=150&fit=crop" alt="Student" />
                </div>
                <div className="text">
                  Meilleure<br/>École<br/>Agréée
                </div>
              </div>

              {/* Circles colorés */}
              <div className="circle-1" />
              <div className="circle-2" />

              {/* Badge Adresse */}
              <div className="badge-address">
                <div className="text">
                  Empire Polo Club<br/>
                  81-800 Avenue 51,<br/>
                  Indio U.S.A
                </div>
              </div>

              {/* Badge 200+ */}
              <div className="badge-count">
                <div className="number">200+</div>
                <div className="label">Diplômés</div>
              </div>

              {/* Photo circulaire petite */}
              <div className="photo-small">
                <img src="https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=200&h=200&fit=crop" alt="Student" />
              </div>

              {/* Photo principale grande */}
              <div className="photo-large">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop" alt="Students" />
              </div>

              {/* Étoile décorative */}
              <div className="star-circle">
                <div className="star">✦</div>
              </div>

              {/* Étoile dorée */}
              <div className="star-gold">✦</div>
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        <div style={{ padding: '100px 60px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Statistics Cards */}
          <div className="landing-stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="landing-stat-card glass-card"
                style={{ animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s backwards` }}>
                <div className="bg-decoration" />
                <div className="icon-wrapper">
                  <stat.icon size={32} color="white" />
                </div>
                <div className="value">{stat.value}</div>
                <div className="label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="activities-sidebar-grid">
            {/* Activities */}
            <div className="activities-section">
              <div className="section-header">
                <div className="icon-box">
                  <FaRocket size={22} color="white" />
                </div>
                <h3>Mes Matières</h3>
              </div>

              <div className="activities-grid">
                {activities.map((activity, idx) => {
                  const color = activityColors[idx] || '#3B82F6';
                  return (
                    <div key={activity.id} className="activity-card glass-card"
                      style={{ animation: `fadeInUp 0.6s ease-out ${0.3 + idx * 0.08}s backwards` }}>
                      <div className="activity-header">
                        <div className="activity-icon" style={{
                          background: `${color}15`,
                          boxShadow: `0 8px 24px ${color}20`,
                          border: `2px solid ${color}20`
                        }}>
                          <activity.icon size={30} color={color} />
                        </div>

                        <div className="activity-info">
                          <h4>{activity.title}</h4>
                          <div className="completion">
                            {activity.completed}/{activity.lessons} leçons complétées
                          </div>
                        </div>

                        <div className="percentage" style={{ color }}>{activity.progress}%</div>
                      </div>

                      <Progress.Line
                        percent={activity.progress}
                        strokeColor={color}
                        strokeWidth={11}
                        showInfo={false}
                        style={{ marginBottom: '20px' }}
                      />

                      <div className="next-lesson">
                        📖 À venir : <strong>{activity.nextLesson}</strong>
                      </div>

                      <div className="activity-footer">
                        <div className="points-badge" style={{
                          background: `${color}15`,
                          color,
                          border: `2px solid ${color}20`
                        }}>
                          <FaStar size={15} />
                          {activity.points} pts
                        </div>

                        <button className="continue-btn" style={{ background: color }}>
                          Continuer
                          <FaArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Weekly Chart */}
              <div className="weekly-chart-card glass-card"
                style={{ animation: 'fadeInUp 0.6s ease-out 0.4s backwards' }}>
                <h4>📊 Points Cette Semaine</h4>

                <div className="chart-container">
                  {weeklyData.map((data, idx) => {
                    const color = weeklyColors[idx] || '#3B82F6';
                    return (
                      <div key={idx} className="chart-bar">
                        <div className="bar-value" style={{
                          color,
                          boxShadow: `0 4px 12px ${color}25`,
                          border: `2px solid ${color}30`
                        }}>
                          {data.points}
                        </div>
                        <div className="bar-fill" style={{
                          height: `${(data.points / maxPoints) * 140}px`,
                          background: `linear-gradient(180deg, ${color} 0%, ${color}95 100%)`,
                          boxShadow: `0 -6px 16px ${color}35`,
                          animation: `scaleIn 0.8s ease-out ${idx * 0.1}s backwards`
                        }} />
                        <div className="bar-day">{data.day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Achievements */}
              <div className="achievements-card glass-card"
                style={{ animation: 'fadeInUp 0.6s ease-out 0.5s backwards' }}>
                <h4>🏆 Récompenses Récentes</h4>

                <div className="achievements-list">
                  {recentAchievements.map((achievement, idx) => {
                    const color = achievementColors[idx] || '#3B82F6';
                    return (
                      <div key={idx} className="achievement-item" style={{
                        background: `${color}08`,
                        border: `2px solid ${color}20`,
                        animation: `fadeInUp 0.6s ease-out ${0.6 + idx * 0.1}s backwards`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 10px 25px ${color}35`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <div className="achievement-emoji" style={{
                          background: color,
                          boxShadow: `0 8px 20px ${color}45`
                        }}>
                          {achievement.emoji}
                        </div>
                        <div className="achievement-info">
                          <div className="achievement-title">{achievement.title}</div>
                          <div className="achievement-date">{achievement.date}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BREVETDETECHNICIENBT;