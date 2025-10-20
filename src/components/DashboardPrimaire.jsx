import React, { useState, useEffect } from 'react';
import { Button, Progress } from 'rsuite';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaStar, FaHeart, FaBolt, FaCircle, FaBook, FaGraduationCap, FaTrophy } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiBookOpen, FiAward, FiTarget } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardPrimaire = ({ niveau = 'EnseignementPrimaire' }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [chartColors, setChartColors] = useState({});

    useEffect(() => {
        const root = document.documentElement;
        const style = getComputedStyle(root);
        
        setChartColors({
            primary: style.getPropertyValue('--chart-primary-color').trim() || '#667eea',
            secondary: style.getPropertyValue('--chart-secondary-color').trim() || '#f093fb',
            activity1: style.getPropertyValue('--primary-color').trim() || '#667eea',
            activity2: style.getPropertyValue('--chart-secondary-color').trim() || '#f093fb',
            activity3: style.getPropertyValue('--info-color').trim() || '#4facfe',
            activity4: style.getPropertyValue('--success-color').trim() || '#43e97b'
        });
    }, [niveau]);

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

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const progressData = [
        { matiere: 'Français', progression: 85 },
        { matiere: 'Maths', progression: 78 },
        { matiere: 'Sciences', progression: 92 },
        { matiere: 'Histoire', progression: 88 }
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
        { name: 'Lecture', value: 35 },
        { name: 'Exercices', value: 30 },
        { name: 'Jeux', value: 20 },
        { name: 'Projets', value: 15 }
    ];

    const statsCards = [
        { icon: FaBook, value: '156', label: 'Leçons complétées' },
        { icon: FaTrophy, value: '42', label: 'Badges gagnés' },
        { icon: FiAward, value: '89%', label: 'Taux de réussite' },
        { icon: FiTarget, value: '28', label: 'Objectifs atteints' }
    ];

    return (
        <div className={niveau} style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fef9f0 0%, #fef5ff 50%, #f0f8ff 100%)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Éléments décoratifs flottants */}
            {[
                { Icon: FaStar, top: '80px', left: '180px', color: 'var(--success-color)', animation: 'float 6s ease-in-out infinite' },
                { Icon: FaHeart, top: '50px', left: '320px', color: 'var(--primary-color)', animation: 'float 8s ease-in-out infinite' },
                { Icon: FaCircle, top: '100px', left: '460px', color: 'var(--info-color)', animation: 'float 7s ease-in-out infinite' },
                { Icon: FaCircle, bottom: '100px', left: '50px', color: 'var(--warning-color)', animation: 'float 5s ease-in-out infinite' },
                { Icon: FaBolt, top: '120px', right: '200px', color: 'var(--info-color)', animation: 'float 10s ease-in-out infinite' }
            ].map((item, idx) => (
                <div key={idx} style={{ position: 'absolute', ...item, fontSize: idx === 3 ? '60px' : '40px' }}>
                    <item.Icon />
                </div>
            ))}

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

          .social-icon {
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .social-icon:hover {
            transform: scale(1.2) rotate(5deg);
          }

          .nav-button {
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .nav-button:hover {
            transform: scale(1.1);
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

            {/* Contenu Principal */}
            <div style={{
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
                            color: 'var(--primary-color)'
                        }}>
                            {slides[activeSlide].title}
                        </h1>
                        <h2 style={{
                            fontSize: '72px',
                            fontWeight: '900',
                            lineHeight: '1.1',
                            marginBottom: '30px',
                            background: `linear-gradient(135deg, var(--primary-color) 0%, var(--chart-secondary-color) 100%)`,
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
                                background: `linear-gradient(135deg, var(--primary-color) 0%, var(--chart-secondary-color) 100%)`,
                                border: 'none',
                                borderRadius: '50px',
                                padding: '18px 45px',
                                fontSize: '18px',
                                fontWeight: '700',
                                color: 'white',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
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
                            {slides[activeSlide].buttonText}
                        </Button>
                    </div>

                    {/* Colonne droite - Image */}
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            position: 'relative',
                            width: '520px',
                            height: '520px',
                            background: `linear-gradient(135deg, var(--bg-light-color) 0%, var(--primary-color)40 100%)`,
                            borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
                            padding: '15px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
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
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        background: index === activeSlide ? `linear-gradient(135deg, var(--primary-color) 0%, var(--chart-secondary-color) 100%)` : 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        fontWeight: '800',
                                        color: index === activeSlide ? 'white' : 'var(--primary-color)',
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        animation: 'pulse 2s ease-in-out infinite'
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
                            background: `linear-gradient(135deg, var(--primary-color) 0%, var(--chart-secondary-color) 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
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
                                        ? `linear-gradient(135deg, var(--primary-color) 0%, var(--chart-secondary-color) 100%)`
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
                            background: `linear-gradient(135deg, var(--primary-color) 0%, var(--chart-secondary-color) 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                        }}
                    >
                        <FiChevronRight size={28} color="white" />
                    </div>
                </div>
            </div>

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
                    background: `linear-gradient(135deg, var(--primary-color) 0%, var(--chart-secondary-color) 100%)`,
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
                    {statsCards.map((stat, index) => {
                        const colors = ['--primary-color', '--warning-color', '--success-color', '--chart-secondary-color'];
                        const colorVar = colors[index % colors.length];
                        
                        return (
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
                                    background: `color-mix(in srgb, var(${colorVar}) 15%, transparent)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px'
                                }}>
                                    <stat.icon size={32} style={{ color: `var(${colorVar})` }} />
                                </div>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: '800',
                                    color: `var(${colorVar})`,
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
                        );
                    })}
                </div>

                {/* Graphiques */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '40px',
                    marginBottom: '60px'
                }}>
                    {/* Graphique de progression par matière */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '30px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        border: 'none'
                    }}>
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FiBookOpen style={{ color: 'var(--primary-color)' }} />
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
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? chartColors.primary : chartColors.secondary} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Graphique d'évolution des notes */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '30px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        border: 'none'
                    }}>
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FiTarget style={{ color: 'var(--chart-secondary-color)' }} />
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
                                    stroke={chartColors.secondary}
                                    strokeWidth={3}
                                    dot={{ fill: chartColors.secondary, r: 6 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Graphique en camembert et barres de progression */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '40px'
                }}>
                    {/* Répartition des activités */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '30px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        border: 'none'
                    }}>
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FaGraduationCap style={{ color: 'var(--success-color)' }} />
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
                                        <Cell key={`cell-${index}`} fill={Object.values(chartColors)[index] || chartColors.primary} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Objectifs mensuels */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '30px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        border: 'none'
                    }}>
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <FaTrophy style={{ color: 'var(--warning-color)' }} />
                            Objectifs du Mois
                        </h3>
                        <div style={{ marginTop: '20px' }}>
                            {progressData.map((item, index) => {
                                const colors = ['--primary-color', '--chart-secondary-color', '--success-color', '--info-color'];
                                const colorVar = colors[index % colors.length];
                                
                                return (
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
                                                color: `var(${colorVar})`
                                            }}>
                                                {item.progression}%
                                            </span>
                                        </div>
                                        <Progress.Line
                                            percent={item.progression}
                                            strokeColor={`var(${colorVar})`}
                                            strokeWidth={12}
                                            showInfo={false}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPrimaire;