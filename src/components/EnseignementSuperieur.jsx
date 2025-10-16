import React, { useState } from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp, FaGraduationCap, FaBook, FaTrophy, FaUsers, FaChartLine, FaCertificate } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AblazeAcademy = () => {
    const [activeTab, setActiveTab] = useState('home');

    // Données statistiques
    const studentStats = [
        { icon: FaUsers, value: '2 456', label: 'Étudiants Total', color: '#ff9500', bgColor: '#fff5e6' },
        { icon: FaBook, value: '156', label: 'Cours Disponibles', color: '#8e44ad', bgColor: '#f3e5f5' },
        { icon: FaTrophy, value: '89%', label: 'Taux de Réussite', color: '#ff9500', bgColor: '#fff5e6' },
        { icon: FaCertificate, value: '1 234', label: 'Certificats Délivrés', color: '#8e44ad', bgColor: '#f3e5f5' }
    ];

    const performanceData = [
        { month: 'Jan', students: 320, courses: 45 },
        { month: 'Fév', students: 450, courses: 52 },
        { month: 'Mar', students: 580, courses: 61 },
        { month: 'Avr', students: 720, courses: 68 },
        { month: 'Mai', students: 890, courses: 75 },
        { month: 'Jun', students: 1050, courses: 82 }
    ];

    const coursesData = [
        { name: 'Sciences', value: 35, color: '#ff9500' },
        { name: 'Mathématiques', value: 25, color: '#8e44ad' },
        { name: 'Langues', value: 20, color: '#e74c3c' },
        { name: 'Arts', value: 20, color: '#3498db' }
    ];

    const departmentProgress = [
        { dept: 'Ingénierie', progress: 92, color: '#ff9500' },
        { dept: 'Commerce', progress: 87, color: '#8e44ad' },
        { dept: 'Médecine', progress: 95, color: '#e74c3c' },
        { dept: 'Arts', progress: 83, color: '#3498db' }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
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

          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }

          .nav-link {
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 8px 16px;
            border-radius: 8px;
          }

          .nav-link:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .stat-card {
            transition: all 0.3s ease;
            animation: fadeIn 0.6s ease-out;
          }

          .stat-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
          }

          .social-icon {
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .social-icon:hover {
            transform: scale(1.2);
          }

          .button-primary {
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .button-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 149, 0, 0.4);
          }
        `}
            </style>

            {/* Hero Section */}
            <div style={{ position: 'relative' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    minHeight: '600px'
                }}>
                    {/* Left Side - Orange */}
                    <div style={{
                        borderTopLeftRadius :'30px',
                        borderBottomLeftRadius :'30px',
                        padding: '80px 60px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative circles */}
                        <div style={{
                            position: 'absolute',
                            top: '50px',
                            left: '50px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 8px)',
                            gap: '15px'
                        }}>
                            {[...Array(20)].map((_, i) => (
                                <div key={i} style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.15)'
                                }} />
                            ))}
                        </div>

                        {/* Large decorative shape */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-100px',
                            left: '-100px',
                            width: '400px',
                            height: '400px',
                            opacity: 0.1
                        }}>
                            <FaGraduationCap size={400} color="#c690ce" />
                        </div>

                        {/* Social Icons */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            marginBottom: '60px'
                        }}>
                            {[
                                { Icon: FaInstagram, color: '#E1306C' },
                                { Icon: FaFacebook, color: '#1877F2' },
                                { Icon: FaTwitter, color: '#1DA1F2' },
                                { Icon: FaWhatsapp, color: '#25D366' }
                            ].map(({ Icon, color }, index) => (
                                <div
                                    key={index}
                                    className="social-icon"
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        borderRadius: '50%',
                                        background: '#8e44ad',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        animation: `slideIn 0.6s ease-out ${index * 0.1}s both`
                                    }}
                                >
                                </div>
                            ))}
                        </div>

                        <div style={{
                            position: 'relative',
                            zIndex: 2,
                            animation: 'slideIn 1s ease-out'
                        }}>
                            <h1 style={{
                                fontSize: '48px',
                                fontWeight: '700',
                                color: '#ff9500',
                                marginBottom: '30px',
                                lineHeight: '1.2'
                            }}>
                                Le Meilleur Choix Pour<br />Votre Éducation
                            </h1>

                            <p style={{
                                fontSize: '16px',
                                lineHeight: '1.8',
                                marginBottom: '40px',
                                maxWidth: '500px'
                            }}>
                                Découvrez une expérience éducative exceptionnelle qui transforme l'apprentissage en une aventure passionnante. Notre académie offre un environnement stimulant où chaque étudiant peut s'épanouir et atteindre son plein potentiel.
                            </p>

                   
                        </div>

                        {/* Bottom decorative dots */}
                        <div style={{
                            position: 'absolute',
                            bottom: '50px',
                            right: '50px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 8px)',
                            gap: '15px'
                        }}>
                            {[...Array(20)].map((_, i) => (
                                <div key={i} style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.15)'
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Purple */}
                    <div style={{
                        background: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
                        padding: '80px 60px',
                        display: 'flex',
                        borderTopRightRadius :'30px',
                        borderBottomRightRadius :'30px',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative triangle */}
                        <div style={{
                            position: 'absolute',
                            bottom: '100px',
                            left: '-50px',
                            width: '200px',
                            height: '200px',
                            background: 'rgba(255, 149, 0, 0.2)',
                            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                        }} />

                        <div style={{
                            textAlign: 'center',
                            animation: 'fadeIn 1s ease-out',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            <h2 style={{
                                fontSize: '72px',
                                fontWeight: '900',
                                color: '#ff9500',
                                marginBottom: '20px',
                                lineHeight: '1.1',
                                textAlign: 'right',
                                textShadow: '0 4px 20px rgba(0,0,0,0.2)'
                            }}>
                                Un Lieu<br />Exceptionnel<br />D'Éducation
                            </h2>

                            <p style={{
                                fontSize: '32px',
                                fontWeight: '600',
                                color: 'white',
                                marginTop: '30px'
                            }}>
                                Rejoignez nous
                            </p>
                        </div>

                        {/* Bottom right decorative dots */}
                        <div style={{
                            position: 'absolute',
                            bottom: '50px',
                            right: '50px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 8px)',
                            gap: '15px'
                        }}>
                            {[...Array(20)].map((_, i) => (
                                <div key={i} style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.2)'
                                }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Student Image - Positioned in the middle */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                }}>
                    <img
                        src="assets/images/etudiant.png"
                        alt="Étudiant Diplômé"
                        style={{
                            width: '450px',
                            height: '750px',
                            objectFit: 'cover',
                            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                            animation: 'float 6s ease-in-out infinite'
                        }}
                    />
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
                    background: 'linear-gradient(135deg, #8e44ad 0%, #ff9500 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Tableau de Bord et Statistiques
                </h2>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '30px',
                    marginBottom: '60px'
                }}>
                    {studentStats.map((stat, index) => (
                        <div
                            key={index}
                            className="stat-card"
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '35px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: stat.bgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 25px'
                            }}>
                                <stat.icon size={36} color={stat.color} />
                            </div>
                            <div style={{
                                fontSize: '38px',
                                fontWeight: '800',
                                color: stat.color,
                                marginBottom: '12px'
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                fontSize: '15px',
                                color: '#7e8ba3',
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
                    gap: '40px',
                    marginBottom: '40px'
                }}>
                    {/* Performance Chart */}
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
                            <FaChartLine color="#8e44ad" />
                            Croissance des Inscriptions
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" stroke="#7e8ba3" />
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
                                <Line
                                    type="monotone"
                                    dataKey="students"
                                    stroke="#ff9500"
                                    strokeWidth={3}
                                    dot={{ fill: '#ff9500', r: 6 }}
                                    name="Étudiants"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="courses"
                                    stroke="#8e44ad"
                                    strokeWidth={3}
                                    dot={{ fill: '#8e44ad', r: 6 }}
                                    name="Cours"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
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
                            <FaBook color="#ff9500" />
                            Répartition des Cours
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={coursesData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {coursesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Department Progress & Bar Chart */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '40px'
                }}>
                    {/* Department Progress */}
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
                            <FaTrophy color="#ffd700" />
                            Performance des Départements
                        </h3>
                        <div style={{ marginTop: '25px' }}>
                            {departmentProgress.map((item, index) => (
                                <div key={index} style={{ marginBottom: '30px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '12px'
                                    }}>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#2c3e50'
                                        }}>
                                            {item.dept}
                                        </span>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            color: item.color
                                        }}>
                                            {item.progress}%
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '12px',
                                        background: '#f0f0f0',
                                        borderRadius: '10px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${item.progress}%`,
                                            height: '100%',
                                            background: item.color,
                                            borderRadius: '10px',
                                            transition: 'width 1s ease-out'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bar Chart */}
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
                            <FaGraduationCap color="#8e44ad" />
                            Comparaison des Départements
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={departmentProgress}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="dept" stroke="#7e8ba3" />
                                <YAxis stroke="#7e8ba3" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar dataKey="progress" radius={[10, 10, 0, 0]}>
                                    {departmentProgress.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AblazeAcademy;