import React, { useState } from 'react';
import { FaInstagram, FaFacebookF, FaUsers, FaUserCheck, FaChalkboardTeacher, FaBook, FaStar, FaClock, FaChild } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DashboardMaternelle = () => {
  // Données statistiques du tableau de bord
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
    { age: '2-3 ans', nombre: 38, color: '#FF6B9D' },
    { age: '3-4 ans', nombre: 52, color: '#FFA07A' },
    { age: '4-5 ans', nombre: 45, color: '#98D8C8' },
    { age: '5-6 ans', nombre: 21, color: '#6C63FF' }
  ];

  const genreData = [
    { name: 'Garçons', value: dashboardData.garcons, color: '#4FC3F7' },
    { name: 'Filles', value: dashboardData.filles, color: '#FF6B9D' }
  ];

  const activitesData = [
    { activite: 'Arts', participants: 45 },
    { activite: 'Musique', participants: 38 },
    { activite: 'Sports', participants: 52 },
    { activite: 'Lecture', participants: 63 }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#F5F7FA' }}>
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
          {['#9BCF53', '#FF69B4', '#4FC3F7', '#FFB84D'].map((color, i) => (
            <div key={i} style={{
              width: '0',
              height: '0',
              borderLeft: '20px solid transparent',
              borderRight: '20px solid transparent',
              borderTop: `35px solid ${color}`,
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
            color: '#FFD93D',
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
              color: '#FF69B4',
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
              <span style={{ color: '#FFB84D' }}>|</span>
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
              background: '#9BCF53',
              border: 'none',
              padding: '18px 45px',
              borderRadius: '8px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(155, 207, 83, 0.3)',
              transition: 'all 0.3s ease',
              marginBottom: '50px'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(155, 207, 83, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(155, 207, 83, 0.3)';
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

          {/* Right Illustration Area */}
          <div style={{ position: 'relative', height: '600px' }}>
            {/* Shelves Background */}
            <div style={{
              position: 'absolute',
              top: '50px',
              left: '50px',
              right: '200px'
            }}>
              {/* Top shelf with toys */}
              <div style={{
                background: '#F4A460',
                height: '10px',
                borderRadius: '5px',
                marginBottom: '80px',
                position: 'relative'
              }}>
                {/* Toy blocks on shelf */}
                <div style={{ position: 'absolute', top: '-50px', left: '20px', display: 'flex', gap: '5px' }}>
                  <div style={{ width: '45px', height: '30px', background: '#FFD93D', borderRadius: '3px' }} />
                  <div style={{ width: '35px', height: '45px', background: '#FF69B4', borderRadius: '3px' }} />
                  <div style={{ width: '40px', height: '35px', background: '#4FC3F7', borderRadius: '3px' }} />
                </div>
              </div>

              {/* Second shelf with books */}
              <div style={{
                background: '#F4A460',
                height: '10px',
                borderRadius: '5px',
                position: 'relative'
              }}>
                {/* Books on shelf */}
                <div style={{ position: 'absolute', top: '-60px', left: '30px', display: 'flex', gap: '3px' }}>
                  {['#FF69B4', '#9BCF53', '#4FC3F7', '#FFB84D', '#B388FF'].map((color, i) => (
                    <div key={i} style={{
                      width: '25px',
                      height: '65px',
                      background: color,
                      borderRadius: '2px',
                      border: '2px solid #333'
                    }} />
                  ))}
                </div>

                {/* Pencil holder */}
                <div style={{
                  position: 'absolute',
                  top: '-55px',
                  right: '40px',
                  width: '35px',
                  height: '50px',
                  background: '#6C63FF',
                  borderRadius: '5px',
                  border: '2px solid #333'
                }} />
              </div>
            </div>

            {/* Wall decorations */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '280px',
              width: '90px',
              height: '90px',
              background: '#E8E8FF',
              borderRadius: '8px',
              border: '3px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              transform: 'rotate(-5deg)'
            }}>
              🚗
            </div>

            <div style={{
              position: 'absolute',
              top: '20px',
              right: '150px',
              width: '90px',
              height: '90px',
              background: '#FFE8FF',
              borderRadius: '8px',
              border: '3px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              transform: 'rotate(5deg)'
            }}>
              🌸
            </div>

            {/* Clock */}
            <div style={{
              position: 'absolute',
              top: '180px',
              right: '80px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '8px solid #9BCF53',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '3px',
                height: '30px',
                background: '#333',
                position: 'absolute',
                transformOrigin: 'bottom',
                transform: 'rotate(90deg)'
              }} />
              <div style={{
                width: '2px',
                height: '25px',
                background: '#FF69B4',
                position: 'absolute',
                transformOrigin: 'bottom',
                transform: 'rotate(180deg)'
              }} />
            </div>

            {/* Number blocks */}
            <div style={{
              position: 'absolute',
              bottom: '180px',
              left: '80px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 70px)',
              gap: '5px'
            }}>
              {[
                { num: '1', bg: '#4FC3F7' },
                { num: '2', bg: '#4FC3F7' },
                { num: '3', bg: '#FFD93D' },
                { num: '4', bg: '#FFD93D' },
                { num: '5', bg: '#9BCF53' },
                { num: '6', bg: '#9BCF53' }
              ].map((block, i) => (
                <div key={i} style={{
                  width: '70px',
                  height: '70px',
                  background: block.bg,
                  border: '3px solid #333',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  fontWeight: '900',
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {block.num}
                </div>
              ))}
            </div>

            {/* Children illustrations */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              left: '280px',
              width: '120px',
              height: '200px',
              background: '#FF69B4',
              borderRadius: '60px 60px 0 0',
              position: 'relative'
            }}>
              {/* Girl character */}
              <div style={{
                position: 'absolute',
                top: '-60px',
                left: '20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#8B4513'
              }}>
                {/* Eyes */}
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  left: '15px',
                  width: '15px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  border: '2px solid #333'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#333',
                    borderRadius: '50%',
                    margin: '6px auto 0'
                  }} />
                </div>
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  right: '15px',
                  width: '15px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  border: '2px solid #333'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#333',
                    borderRadius: '50%',
                    margin: '6px auto 0'
                  }} />
                </div>
              </div>
              {/* Arm */}
              <div style={{
                position: 'absolute',
                top: '50px',
                left: '-35px',
                width: '40px',
                height: '80px',
                background: '#8B4513',
                borderRadius: '20px',
                transform: 'rotate(-45deg)'
              }} />
              {/* Yellow shoes */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '10px',
                width: '40px',
                height: '20px',
                background: '#FFD93D',
                borderRadius: '20px'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '10px',
                width: '40px',
                height: '20px',
                background: '#FFD93D',
                borderRadius: '20px'
              }} />
            </div>

            {/* Boy character */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              right: '100px',
              width: '110px',
              height: '180px',
              background: '#4FC3F7',
              borderRadius: '50px 50px 0 0'
            }}>
              <div style={{
                position: 'absolute',
                top: '-60px',
                left: '15px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#FFD4A3'
              }}>
                {/* Eyes */}
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  left: '15px',
                  width: '15px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  border: '2px solid #333'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#333',
                    borderRadius: '50%',
                    margin: '6px auto 0'
                  }} />
                </div>
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  right: '15px',
                  width: '15px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  border: '2px solid #333'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#333',
                    borderRadius: '50%',
                    margin: '6px auto 0'
                  }} />
                </div>
                {/* Hair */}
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  left: '10px',
                  right: '10px',
                  height: '30px',
                  background: '#FF8C42',
                  borderRadius: '30px 30px 0 0'
                }} />
              </div>
              {/* Pants */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '90px',
                background: '#4A4A8C',
                borderRadius: '50px 50px 0 0'
              }} />
            </div>

            {/* Stacking rings toy */}
            <div style={{
              position: 'absolute',
              bottom: '40px',
              right: '250px'
            }}>
              <div style={{ width: '60px', height: '8px', background: '#6C63FF', borderRadius: '4px', margin: '2px auto' }} />
              <div style={{ width: '50px', height: '8px', background: '#4FC3F7', borderRadius: '4px', margin: '2px auto' }} />
              <div style={{ width: '40px', height: '8px', background: '#9BCF53', borderRadius: '4px', margin: '2px auto' }} />
              <div style={{ width: '30px', height: '8px', background: '#FFD93D', borderRadius: '4px', margin: '2px auto' }} />
              <div style={{ width: '20px', height: '8px', background: '#FF69B4', borderRadius: '4px', margin: '2px auto' }} />
              <div style={{
                width: '4px',
                height: '60px',
                background: '#8B7355',
                margin: '0 auto',
                borderRadius: '2px'
              }} />
              <div style={{
                width: '40px',
                height: '8px',
                background: '#8B7355',
                borderRadius: '4px',
                margin: '0 auto'
              }} />
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
          fontSize: '48px',
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: '60px',
          background: 'linear-gradient(135deg, #FF69B4 0%, #4FC3F7 100%)',
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
          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #FF69B415 0%, #FF69B425 100%)',
            border: '2px solid #FF69B430',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF69B4, #FF1493)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '32px'
            }}>
              <FaChild />
            </div>
            <div style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#FF69B4',
              marginBottom: '10px'
            }}>
              {dashboardData.totalEnfants}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#64748b',
              fontWeight: '600'
            }}>
              Total Enfants
            </div>
          </div>

          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #9BCF5315 0%, #9BCF5325 100%)',
            border: '2px solid #9BCF5330',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #9BCF53, #7AB93D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '32px'
            }}>
              <FaUserCheck />
            </div>
            <div style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#9BCF53',
              marginBottom: '10px'
            }}>
              {dashboardData.enfantsInscrits}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#64748b',
              fontWeight: '600'
            }}>
              Inscrits
            </div>
          </div>

          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #4FC3F715 0%, #4FC3F725 100%)',
            border: '2px solid #4FC3F730',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '32px'
            }}>
              <FaChalkboardTeacher />
            </div>
            <div style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#4FC3F7',
              marginBottom: '10px'
            }}>
              {dashboardData.personnel}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#64748b',
              fontWeight: '600'
            }}>
              Personnel Total
            </div>
          </div>

          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #FFB84D15 0%, #FFB84D25 100%)',
            border: '2px solid #FFB84D30',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFB84D, #FFA726)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '32px'
            }}>
              <FaBook />
            </div>
            <div style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#FFB84D',
              marginBottom: '10px'
            }}>
              {dashboardData.classes}
            </div>
            <div style={{
              fontSize: '16px',
              color: '#64748b',
              fontWeight: '600'
            }}>
              Classes
            </div>
          </div>
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
                <Bar dataKey="participants" fill="#FF69B4" radius={[10, 10, 0, 0]} name="Participants" />
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
            {ageDistribution.map((item, index) => (
              <div key={index} className="stat-card" style={{
                textAlign: 'center',
                padding: '30px',
                background: `${item.color}15`,
                borderRadius: '15px',
                border: `2px solid ${item.color}30`
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: item.color,
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
                  color: item.color
                }}>
                  {item.nombre}
                </div>
              </div>
            ))}
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
              <FaUsers color="#4FC3F7" />
              Personnel Éducatif
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
                  Enseignants
                </div>
                <div style={{ fontSize: '42px', fontWeight: '800', color: '#4FC3F7' }}>
                  {dashboardData.enseignants}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
                  Assistants
                </div>
                <div style={{ fontSize: '42px', fontWeight: '800', color: '#FF69B4' }}>
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
              <FaBook color="#9BCF53" />
              Infrastructure
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
                  Salles Total
                </div>
                <div style={{ fontSize: '42px', fontWeight: '800', color: '#9BCF53' }}>
                  {dashboardData.salles}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
                  Capacité Max
                </div>
                <div style={{ fontSize: '42px', fontWeight: '800', color: '#FFB84D' }}>
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