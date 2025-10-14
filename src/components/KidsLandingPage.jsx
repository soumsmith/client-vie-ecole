import React, { useState, useEffect } from 'react';
import { Button, Container, Header, Nav, Progress, Panel } from 'rsuite';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaStar, FaHeart, FaBolt, FaCircle, FaBook, FaGraduationCap, FaTrophy, FaUsers } from 'react-icons/fa';
import { FiMenu, FiSearch, FiChevronLeft, FiChevronRight, FiBookOpen, FiAward, FiTarget } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const KidsLandingPage = () => {
    const [activeSlide, setActiveSlide] = useState(0);

    const slides = [
        {
            title: "Apprendre à",
            subtitle: "Lire et Écrire",
            description: "Développe tes compétences en français avec des activités ludiques et interactives. Découvre le plaisir de la lecture et de l'écriture à travers des histoires captivantes !",
            buttonText: "Commencer à lire",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop"
        },
        {
            title: "Explorer les",
            subtitle: "Mathématiques",
            description: "Les chiffres deviennent tes amis ! Additions, soustractions, multiplications... Apprends en jouant avec des exercices adaptés à ton niveau.",
            buttonText: "Découvrir les maths",
            image: "https://images.unsplash.com/photo-1596496050827-8299e0220de1?w=800&h=600&fit=crop"
        },
        {
            title: "Découvrir le",
            subtitle: "Monde qui t'entoure",
            description: "Sciences, géographie, histoire... Pars à l'aventure et explore notre belle planète. Chaque jour, une nouvelle découverte t'attend !",
            buttonText: "Explorer le monde",
            image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop"
        }
    ];

    // Auto-play des slides
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change toutes les 5 secondes

        return () => clearInterval(interval);
    }, [slides.length]);

    const nextSlide = () => {
        setActiveSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // Données statistiques pour les graphiques
    const progressData = [
        { matiere: 'Français', progression: 85, color: '#667eea' },
        { matiere: 'Maths', progression: 78, color: '#f093fb' },
        { matiere: 'Sciences', progression: 92, color: '#4facfe' },
        { matiere: 'Histoire', progression: 88, color: '#43e97b' }
    ];

    const performanceData = [
        { mois: 'Sept', notes: 65 },
        { mois: 'Oct', notes: 72 },
        { mois: 'Nov', notes: 78 },
        { mois: 'Déc', notes: 85 },
        { mois: 'Jan', notes: 88 },
        { mois: 'Fév', notes: 92 }
    ];

    const activitiesData = [
        { name: 'Lecture', value: 35, color: '#667eea' },
        { name: 'Exercices', value: 30, color: '#f093fb' },
        { name: 'Jeux', value: 20, color: '#4facfe' },
        { name: 'Projets', value: 15, color: '#43e97b' }
    ];

    const statsCards = [
        {
            icon: FaBook,
            value: '156',
            label: 'Leçons complétées',
            color: '#667eea',
            bgColor: '#667eea15'
        },
        {
            icon: FaTrophy,
            value: '42',
            label: 'Badges gagnés',
            color: '#ffd700',
            bgColor: '#ffd70015'
        },
        {
            icon: FiAward,
            value: '89%',
            label: 'Taux de réussite',
            color: '#43e97b',
            bgColor: '#43e97b15'
        },
        {
            icon: FiTarget,
            value: '28',
            label: 'Objectifs atteints',
            color: '#f093fb',
            bgColor: '#f093fb15'
        }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fef9f0 0%, #fef5ff 50%, #f0f8ff 100%)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Éléments décoratifs flottants */}
            <div style={{
                position: 'absolute',
                top: '80px',
                left: '180px',
                animation: 'float 6s ease-in-out infinite'
            }}>
                <FaStar size={40} color="#7ed321" />
            </div>

            <div style={{
                position: 'absolute',
                top: '50px',
                left: '320px',
                animation: 'float 8s ease-in-out infinite'
            }}>
                <FaHeart size={45} color="#a78bce" />
            </div>

            <div style={{
                position: 'absolute',
                top: '100px',
                left: '460px',
                animation: 'float 7s ease-in-out infinite'
            }}>
                <FaCircle size={50} color="#4a9ff5" />
            </div>

            <div style={{
                position: 'absolute',
                bottom: '100px',
                left: '50px',
                animation: 'float 5s ease-in-out infinite'
            }}>
                <FaCircle size={60} color="#ffd700" />
            </div>

            <div style={{
                position: 'absolute',
                top: '40%',
                left: '5px',
                animation: 'float 9s ease-in-out infinite'
            }}>
                <FaCircle size={35} color="#ff69b4" />
            </div>

            <div style={{
                position: 'absolute',
                bottom: '200px',
                right: '100px',
                animation: 'float 6s ease-in-out infinite'
            }}>
                <FaStar size={30} color="#b8a0d6" opacity={0.6} />
            </div>

            <div style={{
                position: 'absolute',
                top: '200px',
                right: '50px',
                animation: 'float 7s ease-in-out infinite'
            }}>
                <FaStar size={25} color="#c8b8d8" opacity={0.7} />
            </div>

            <div style={{
                position: 'absolute',
                bottom: '350px',
                left: '100px',
                animation: 'float 8s ease-in-out infinite'
            }}>
                <FaStar size={20} color="#d8c8e8" opacity={0.5} />
            </div>

            <div style={{
                position: 'absolute',
                top: '50%',
                right: '80px',
                animation: 'float 5s ease-in-out infinite'
            }}>
                <FaStar size={35} color="#a88bce" opacity={0.6} />
            </div>

            <div style={{
                position: 'absolute',
                top: '120px',
                right: '200px',
                animation: 'float 10s ease-in-out infinite'
            }}>
                <FaBolt size={40} color="#4a9ff5" />
            </div>

            <style>
                {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .nav-item {
            transition: all 0.3s ease;
            cursor: pointer;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            color: #fff !important;
          }

          .nav-item:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
          }

          .social-icon {
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .social-icon:hover {
            transform: scale(1.2) rotate(5deg);
          }

          .step-number {
            animation: pulse 2s ease-in-out infinite;
          }

          .nav-button {
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .nav-button:hover {
            transform: scale(1.1);
            background: #6c5ce7 !important;
          }

          .stat-card {
            transition: all 0.3s ease;
            animation: fadeIn 0.6s ease-out;
          }

          .stat-card:hover {
            transform: translateY(-10px);
          }
        `}
            </style>

            {/* Header */}
            <Header style={{
                background: 'transparent',
                padding: '20px 50px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>

                </div>
            </Header>

            {/* Contenu Principal */}
            <Container style={{
                padding: '60px 80px',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '80px',
                    alignItems: 'center',
                    animation: 'slideIn 1s ease-out'
                }}>
                    {/* Colonne gauche - Texte */}
                    <div>
                        <h1 style={{
                            fontSize: '56px',
                            fontWeight: '800',
                            lineHeight: '1.2',
                            marginBottom: '20px',
                            color: '#a78bce'
                        }}>
                            {slides[activeSlide].title}
                        </h1>
                        <h2 style={{
                            fontSize: '72px',
                            fontWeight: '900',
                            lineHeight: '1.1',
                            marginBottom: '30px',
                            background: 'linear-gradient(135deg, #4a4c8f 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {slides[activeSlide].subtitle}
                        </h2>
                        <p style={{
                            fontSize: '18px',
                            lineHeight: '1.8',
                            color: '#7e8ba3',
                            marginBottom: '40px',
                            maxWidth: '500px'
                        }}>
                            {slides[activeSlide].description}
                        </p>
                        <Button
                            size="lg"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '18px 45px',
                                fontSize: '18px',
                                fontWeight: '700',
                                color: 'white',
                                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            {slides[activeSlide].buttonText}
                        </Button>

                        {/* <div style={{
                            display: 'flex',
                            gap: '20px',
                            marginTop: '50px'
                        }}>
                            {[
                                { Icon: FaFacebook, color: '#4267B2' },
                                { Icon: FaInstagram, color: '#E1306C' },
                                { Icon: FaLinkedin, color: '#0077B5' },
                                { Icon: FaTwitter, color: '#1DA1F2' }
                            ].map(({ Icon, color }, index) => (
                                <div
                                    key={index}
                                    className="social-icon"
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Icon size={22} color={color} />
                                </div>
                            ))}
                        </div> */}
                    </div>

                    {/* Colonne droite - Image */}
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            position: 'relative',
                            width: '520px',
                            height: '520px',
                            background: 'linear-gradient(135deg, #e0d5f5 0%, #b8a8d8 100%)',
                            borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
                            padding: '15px',
                            boxShadow: '0 20px 60px rgba(167, 139, 206, 0.3)',
                            animation: 'float 8s ease-in-out infinite'
                        }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
                                overflow: 'hidden',
                                background: 'white',
                                padding: '10px'
                            }}>
                                <img
                                    key={activeSlide}
                                    src={slides[activeSlide].image}
                                    alt="Kids learning"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
                                        animation: 'fadeIn 0.8s ease-out'
                                    }}
                                />
                            </div>

                            <div style={{
                                position: 'absolute',
                                bottom: '40px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: '25px'
                            }}>
                                {[
                                    { color: '#ffd700', size: '25px' },
                                    { color: '#4a9ff5', size: '30px' },
                                    { color: '#ff69b4', size: '25px' }
                                ].map((dot, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            width: dot.size,
                                            height: dot.size,
                                            borderRadius: '50%',
                                            background: dot.color,
                                            boxShadow: `0 4px 15px ${dot.color}80`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{
                            position: 'absolute',
                            right: '-80px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '30px'
                        }}>
                            {[1, 2, 3].map((num, index) => (
                                <div
                                    key={num}
                                    className="step-number"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: index === activeSlide ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        fontWeight: '800',
                                        color: index === activeSlide ? 'white' : '#667eea',
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        animationDelay: `${index * 0.3}s`
                                    }}
                                    onClick={() => setActiveSlide(index)}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    0{num}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Navigation des slides */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '30px',
                    marginTop: '80px'
                }}>
                    <div
                        className="nav-button"
                        onClick={prevSlide}
                        style={{
                            width: '55px',
                            height: '55px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                        }}
                    >
                        <FiChevronLeft size={28} color="white" />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        {slides.map((_, index) => (
                            <div
                                key={index}
                                onClick={() => setActiveSlide(index)}
                                style={{
                                    width: index === activeSlide ? '40px' : '12px',
                                    height: '12px',
                                    borderRadius: '10px',
                                    background: index === activeSlide
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : '#d0d5dd',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                            />
                        ))}
                    </div>

                    <div
                        className="nav-button"
                        onClick={nextSlide}
                        style={{
                            width: '55px',
                            height: '55px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                        }}
                    >
                        <FiChevronRight size={28} color="white" />
                    </div>
                </div>
            </Container>

            {/* Section Statistiques */}
            <div style={{
                padding: '80px 80px',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                <h2 style={{
                    fontSize: '42px',
                    fontWeight: '800',
                    textAlign: 'center',
                    marginBottom: '60px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Tes Progrès et Réussites
                </h2>

                {/* Cartes statistiques */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '30px',
                    marginBottom: '60px'
                }}>
                    {statsCards.map((stat, index) => (
                        <div
                            key={index}
                            className="stat-card"
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '30px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                background: stat.bgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}>
                                <stat.icon size={32} color={stat.color} />
                            </div>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '800',
                                color: stat.color,
                                marginBottom: '10px'
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#7e8ba3',
                                fontWeight: '600'
                            }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Graphiques */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '40px',
                    marginBottom: '60px'
                }}>
                    {/* Graphique de progression par matière */}
                    <Panel
                        bordered
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '30px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                            border: 'none'
                        }}
                    >
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FiBookOpen color="#667eea" />
                            Progression par Matière
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="matiere" stroke="#7e8ba3" />
                                <YAxis stroke="#7e8ba3" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar dataKey="progression" radius={[10, 10, 0, 0]}>
                                    {progressData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Panel>

                    {/* Graphique d'évolution des notes */}
                    <Panel
                        bordered
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '30px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                            border: 'none'
                        }}
                    >
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FiTarget color="#f093fb" />
                            Évolution des Notes
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="mois" stroke="#7e8ba3" />
                                <YAxis stroke="#7e8ba3" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="notes"
                                    stroke="#f093fb"
                                    strokeWidth={3}
                                    dot={{ fill: '#f093fb', r: 6 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Panel>
                </div>

                {/* Graphique en camembert et barres de progression */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '40px'
                }}>
                    {/* Répartition des activités */}
                    <Panel
                        bordered
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '30px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                            border: 'none'
                        }}
                    >
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FaGraduationCap color="#43e97b" />
                            Répartition des Activités
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={activitiesData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {activitiesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Panel>

                    {/* Objectifs mensuels */}
                    <Panel
                        bordered
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '30px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                            border: 'none'
                        }}
                    >
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FaTrophy color="#ffd700" />
                            Objectifs du Mois
                        </h3>
                        <div style={{ marginTop: '20px' }}>
                            {progressData.map((item, index) => (
                                <div key={index} style={{ marginBottom: '25px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '10px'
                                    }}>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#2c3e50'
                                        }}>
                                            {item.matiere}
                                        </span>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            color: item.color
                                        }}>
                                            {item.progression}%
                                        </span>
                                    </div>
                                    <Progress.Line
                                        percent={item.progression}
                                        strokeColor={item.color}
                                        strokeWidth={12}
                                        showInfo={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

export default KidsLandingPage;