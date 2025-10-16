import React from 'react';
import { FaArrowRight, FaSchool, FaChalkboardTeacher, FaUsers, FaGraduationCap, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SchoolWelcomePage = () => {
    const navigate = useNavigate();
    // Fonction pour gérer la redirection
    const handleRedirect = () => {
        // Option 1: Si vous utilisez React Router
        navigate('/OvertureCloture');

        // Option 2: Redirection simple
        //window.location.href = '/OvertureCloture';
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #F8F9FA 0%, #E9ECEF 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative'
        }}>
            <style>
                {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }

          .btn-hover {
            transition: all 0.3s ease;
          }

          .btn-hover:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          }

          .card-hover {
            transition: all 0.4s ease;
            cursor: pointer;
          }

          .card-hover:hover {
            transform: translateY(-10px) scale(1.02);
          }

          .scroll-indicator {
            animation: bounce 2s infinite;
          }
        `}
            </style>


            {/* Hero Section */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '60px 60px 40px',
                textAlign: 'center',
                animation: 'slideIn 1s ease-out'
            }}>
                {/* Subtitle with line */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        width: '60px',
                        height: '4px',
                        background: '#212529',
                        borderRadius: '2px'
                    }} />
                    <h3 style={{
                        fontSize: '20px',
                        color: '#495057',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        margin: 0
                    }}>
                        Votre Établissement est encore fermé
                    </h3>
                </div>

                {/* Main Title */}
                <h1 style={{
                    fontSize: '50px',
                    fontWeight: '900',
                    color: '#212529',
                    margin: '0 0 40px 0',
                    lineHeight: '1.1',
                    letterSpacing: '-2px'
                }}>
                    Année scolaire non ouverte.
                </h1>

                {/* CTA Button */}
                <button
                    className="btn-hover"
                    onClick={handleRedirect}
                    style={{
                        background: 'linear-gradient(135deg, #0D6EFD 0%, #0B5ED7 100%)',
                        border: 'none',
                        padding: '22px 70px',
                        borderRadius: '20px',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 10px 30px rgba(13, 110, 253, 0.3)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '80px'
                    }}
                >
                    Ouvrir l'année scolaire
                </button>

                {/* Cards Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.5fr 1fr',
                    gap: '30px',
                    marginBottom: '60px'
                }}>
                    {/* Card 1 - Image */}
                    <div className="card-hover" style={{
                        borderRadius: '25px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        height: '300px',
                        background: 'url(/assets/images/ecole.svg?w=600&h=300&fit=crop) center/cover'
                    }}>
                    </div>

                    {/* Card 2 - Image */}
                    <div className="card-hover" style={{
                        borderRadius: '25px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        height: '300px',
                        background: 'url(/assets/images/ecole.svg?w=600&h=300&fit=crop) center/cover'
                    }}>
                    </div>

                    {/* Card 3 - Learn More */}
                    <div
                        className="card-hover"
                        onClick={handleRedirect}
                        style={{
                            background: 'linear-gradient(135deg, #0D6EFD 0%, #0B5ED7 100%)',
                            borderRadius: '25px',
                            padding: '40px 30px',
                            boxShadow: '0 10px 40px rgba(13, 110, 253, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            height: '300px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                        {/* Decorative circles */}
                        <div style={{
                            position: 'absolute',
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            top: '-80px',
                            right: '-80px'
                        }} />
                        <div style={{
                            position: 'absolute',
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            bottom: '-60px',
                            left: '-60px'
                        }} />

                        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                            <h3 style={{
                                fontSize: '26px',
                                fontWeight: '900',
                                margin: '0 0 20px 0',
                                lineHeight: '1.2'
                            }}>
                                En Savoir Plus<br />Sur l'ouverture d'une école.
                            </h3>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: '30px'
                            }}>
                                <FaArrowRight style={{ fontSize: '40px' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Down Indicator */}
                {/* <div className="scroll-indicator" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '40px'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '3px solid #212529',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FaChevronDown style={{ fontSize: '24px', color: '#212529' }} />
                    </div>
                    <span style={{
                        fontSize: '16px',
                        color: '#495057',
                        fontWeight: '600'
                    }}>
                        Scroll Down
                    </span>
                </div> */}
            </div>

            {/* Features Section Below */}
            <div style={{
                background: 'white',
                padding: '80px 60px',
                marginTop: '60px'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '48px',
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '60px',
                        color: '#212529'
                    }}>
                        Pourquoi Ouvrir Votre École Avec Nous?
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '30px'
                    }}>
                        {[
                            {
                                icon: <FaSchool />,
                                title: 'Plateforme Complète',
                                description: 'Tous les outils nécessaires pour gérer votre école en un seul endroit',
                                color: '#0D6EFD'
                            },
                            {
                                icon: <FaChalkboardTeacher />,
                                title: 'Gestion Facile',
                                description: 'Interface intuitive pour gérer les enseignants, élèves et classes',
                                color: '#198754'
                            },
                            {
                                icon: <FaUsers />,
                                title: 'Communauté Active',
                                description: 'Rejoignez des milliers d\'établissements qui nous font confiance',
                                color: '#FFC107'
                            },
                            {
                                icon: <FaGraduationCap />,
                                title: 'Suivi Académique',
                                description: 'Tableaux de bord détaillés pour suivre les performances',
                                color: '#DC3545'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="card-hover" style={{
                                background: 'white',
                                padding: '35px',
                                borderRadius: '20px',
                                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                                textAlign: 'center',
                                border: '2px solid #F8F9FA'
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: `${feature.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 25px',
                                    fontSize: '36px',
                                    color: feature.color
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#212529',
                                    marginBottom: '15px'
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    fontSize: '15px',
                                    color: '#6C757D',
                                    lineHeight: '1.6',
                                    margin: 0
                                }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolWelcomePage;