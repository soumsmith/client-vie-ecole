import React, { useState } from 'react';
import { Button, Container, Nav, Navbar, Panel, Progress, Badge } from 'rsuite';
import { 
  FaStar, 
  FaHeart, 
  FaCircle, 
  FaBook, 
  FaGamepad, 
  FaTrophy, 
  FaPalette,
  FaMusic,
  FaFutbol,
  FaCalculator,
  FaGlobe
} from 'react-icons/fa';

const KidsDashboard = () => {
  const [activeTab, setActiveTab] = useState('accueil');

  const activities = [
    {
      id: 1,
      title: 'Mathématiques',
      icon: FaCalculator,
      color: '#FF6B6B',
      progress: 75,
      points: 450,
      description: 'Additions et soustractions'
    },
    {
      id: 2,
      title: 'Français',
      icon: FaBook,
      color: '#4ECDC4',
      progress: 85,
      points: 520,
      description: 'Lecture et écriture'
    },
    {
      id: 3,
      title: 'Arts Créatifs',
      icon: FaPalette,
      color: '#FFD93D',
      progress: 60,
      points: 380,
      description: 'Dessin et peinture'
    },
    {
      id: 4,
      title: 'Musique',
      icon: FaMusic,
      color: '#A8E6CF',
      progress: 70,
      points: 410,
      description: 'Chants et instruments'
    },
    {
      id: 5,
      title: 'Sport',
      icon: FaFutbol,
      color: '#FF8B94',
      progress: 90,
      points: 580,
      description: 'Jeux et activités'
    },
    {
      id: 6,
      title: 'Sciences',
      icon: FaGlobe,
      color: '#B4A7D6',
      progress: 55,
      points: 340,
      description: 'Découvertes du monde'
    }
  ];

  const achievements = [
    { icon: '🏆', title: 'Champion de Maths', color: '#FFD700' },
    { icon: '📚', title: 'Grand Lecteur', color: '#4ECDC4' },
    { icon: '🎨', title: 'Artiste en Herbe', color: '#FF6B6B' },
    { icon: '⭐', title: 'Élève Modèle', color: '#FFD93D' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFEAA7 50%, #FFD93D 100%)',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: "'Poppins', sans-serif"
    }}>
      {/* Éléments décoratifs flottants */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '10%',
        animation: 'float 6s ease-in-out infinite'
      }}>
        <FaStar size={40} color="#FF6B6B" opacity={0.6} />
      </div>
      
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '15%',
        animation: 'float 8s ease-in-out infinite 1s'
      }}>
        <FaHeart size={50} color="#FF8B94" opacity={0.5} />
      </div>

      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '5%',
        animation: 'float 7s ease-in-out infinite 2s'
      }}>
        <FaCircle size={60} color="#4ECDC4" opacity={0.4} />
      </div>

      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        animation: 'float 9s ease-in-out infinite 1.5s'
      }}>
        <div style={{
          fontSize: '50px',
          animation: 'spin 20s linear infinite'
        }}>⚽</div>
      </div>

      <div style={{
        position: 'absolute',
        top: '40%',
        right: '5%',
        animation: 'float 10s ease-in-out infinite'
      }}>
        <div style={{ fontSize: '45px' }}>🎨</div>
      </div>

      <div style={{
        position: 'absolute',
        top: '60%',
        left: '15%',
        animation: 'float 8s ease-in-out infinite 3s'
      }}>
        <div style={{ fontSize: '40px' }}>🎵</div>
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(10deg); }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .activity-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
          }

          .activity-card:hover {
            transform: translateY(-15px) scale(1.03);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
          }

          .badge-item {
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .badge-item:hover {
            transform: scale(1.15) rotate(5deg);
          }
        `}
      </style>

      {/* Header */}
      {/* <Navbar 
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '15px 40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: '0 0 30px 30px'
        }}
      >
        <Navbar.Brand style={{
          fontSize: '28px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🎓 Mon École
        </Navbar.Brand>
        
        <Nav pullRight>
          <Nav.Item 
            active={activeTab === 'accueil'}
            onClick={() => setActiveTab('accueil')}
            style={{
              fontWeight: '600',
              fontSize: '16px',
              margin: '0 10px',
              borderRadius: '20px'
            }}
          >
            Accueil
          </Nav.Item>
          <Nav.Item 
            active={activeTab === 'activites'}
            onClick={() => setActiveTab('activites')}
            style={{
              fontWeight: '600',
              fontSize: '16px',
              margin: '0 10px',
              borderRadius: '20px'
            }}
          >
            Activités
          </Nav.Item>
          <Nav.Item 
            active={activeTab === 'trophees'}
            onClick={() => setActiveTab('trophees')}
            style={{
              fontWeight: '600',
              fontSize: '16px',
              margin: '0 10px',
              borderRadius: '20px'
            }}
          >
            Mes Trophées
          </Nav.Item>
          <Button
            style={{
              background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
              border: 'none',
              borderRadius: '25px',
              padding: '10px 30px',
              fontWeight: '700',
              color: 'white',
              marginLeft: '20px'
            }}
          >
            Se Connecter
          </Button>
        </Nav>
      </Navbar> */}

      <Container style={{ padding: '60px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Section Hero */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          marginBottom: '80px',
          animation: 'slideIn 1s ease-out'
        }}>
          {/* Colonne gauche - Texte */}
          <div style={{ textAlign: 'left' }}>
           
            
            <h1 style={{
              fontSize: '64px',
              fontWeight: '900',
              lineHeight: '1.2',
              marginBottom: '20px',
              color: '#2C3E50'
            }}>
              Activités Après
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                L'École
              </span>
            </h1>
            
            <p style={{
              fontSize: '20px',
              color: '#7F8C8D',
              maxWidth: '500px',
              marginBottom: '40px',
              lineHeight: '1.6'
            }}>
              Apprends, joue et découvre de nouvelles choses chaque jour ! 
              Rejoins tes camarades pour des activités amusantes et enrichissantes.
            </p>

            <Button
              size="lg"
              style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8B94 100%)',
                border: 'none',
                borderRadius: '50px',
                padding: '20px 50px',
                fontSize: '20px',
                fontWeight: '700',
                color: 'white',
                boxShadow: '0 10px 30px rgba(255,107,107,0.4)',
                transition: 'all 0.3s ease',
                animation: 'bounce 2s ease-in-out infinite'
              }}
            >
              🚀 Commencer Maintenant
            </Button>
          </div>

          {/* Colonne droite - Illustration */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '600px',
              animation: 'float 6s ease-in-out infinite'
            }}>
              {/* Remplacez l'URL ci-dessous par le chemin de votre image */}
              <img
                src="assets/images/illustrationkids.svg"
                alt="Enfants faisant des activités"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))'
                }}
              />
              
              {/* Éléments décoratifs autour de l'image */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                fontSize: '50px',
                animation: 'spin 20s linear infinite'
              }}>
                ⚽
              </div>
              
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '-30px',
                fontSize: '45px',
                animation: 'bounce 2s ease-in-out infinite'
              }}>
                🎨
              </div>
              
              <div style={{
                position: 'absolute',
                top: '30px',
                left: '-20px',
                fontSize: '40px',
                animation: 'float 7s ease-in-out infinite'
              }}>
                🎵
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '25px',
          marginBottom: '70px'
        }}>
          {[
            { icon: '🎯', value: '1,234', label: 'Points', color: '#FF6B6B' },
            { icon: '🏆', value: '12', label: 'Trophées', color: '#FFD93D' },
            { icon: '⭐', value: '45', label: 'Étoiles', color: '#4ECDC4' },
            { icon: '🔥', value: '7', label: 'Jours', color: '#FF8B94' }
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                borderRadius: '25px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                animation: `slideIn 0.8s ease-out ${idx * 0.1}s backwards`,
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>{stat.icon}</div>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                color: stat.color,
                marginBottom: '8px'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#7F8C8D',
                fontWeight: '600'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mes Activités */}
        <h2 style={{
          fontSize: '42px',
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: '50px',
          color: '#2C3E50'
        }}>
          📚 Mes Activités
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '30px',
          marginBottom: '70px'
        }}>
          {activities.map((activity, idx) => (
            <div
              key={activity.id}
              className="activity-card"
              style={{
                background: 'white',
                borderRadius: '30px',
                padding: '35px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                animation: `slideIn 0.8s ease-out ${idx * 0.1}s backwards`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `${activity.color}20`,
                filter: 'blur(30px)'
              }} />
              
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `${activity.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                position: 'relative'
              }}>
                <activity.icon size={40} color={activity.color} />
              </div>

              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#2C3E50',
                marginBottom: '10px'
              }}>
                {activity.title}
              </h3>

              <p style={{
                fontSize: '14px',
                color: '#7F8C8D',
                marginBottom: '20px'
              }}>
                {activity.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2C3E50'
                }}>
                  Progression
                </span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: activity.color
                }}>
                  {activity.progress}%
                </span>
              </div>

              <Progress.Line
                percent={activity.progress}
                strokeColor={activity.color}
                strokeWidth={10}
                showInfo={false}
                style={{ marginBottom: '15px' }}
              />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '20px'
              }}>
                <div style={{
                  background: `${activity.color}15`,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: activity.color
                }}>
                  🌟 {activity.points} points
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mes Badges */}
        <Panel
          bordered
          style={{
            background: 'white',
            borderRadius: '30px',
            padding: '50px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            border: 'none'
          }}
        >
          <h2 style={{
            fontSize: '36px',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '40px',
            color: '#2C3E50'
          }}>
            🏅 Mes Badges et Récompenses
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap'
          }}>
            {achievements.map((badge, idx) => (
              <div
                key={idx}
                className="badge-item"
                style={{
                  textAlign: 'center',
                  animation: `slideIn 0.8s ease-out ${idx * 0.15}s backwards`
                }}
              >
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${badge.color} 0%, ${badge.color}80 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '60px',
                  marginBottom: '15px',
                  boxShadow: `0 10px 30px ${badge.color}40`
                }}>
                  {badge.icon}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#2C3E50'
                }}>
                  {badge.title}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </Container>

      {/* Footer */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '30px',
        marginTop: '60px',
        textAlign: 'center',
        borderRadius: '30px 30px 0 0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {['📘', '📷', 'ℹ️'].map((icon, idx) => (
            <div
              key={idx}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                boxShadow: '0 4px 15px rgba(78,205,196,0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2) rotate(10deg)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
            >
              {icon}
            </div>
          ))}
        </div>
        <p style={{
          fontSize: '14px',
          color: '#7F8C8D',
          fontWeight: '600'
        }}>
          © 2025 Mon École - Tous droits réservés
        </p>
      </div>
    </div>
  );
};

export default KidsDashboard;