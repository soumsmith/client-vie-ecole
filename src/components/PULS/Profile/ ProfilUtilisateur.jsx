import React, { useState, useEffect } from 'react';
import {
    Button,
    Avatar,
    Badge,
    Loader,
    Message,
    Row,
    Col,
    Notification
} from 'rsuite';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiBookOpen,
    FiAward,
    FiBriefcase,
    FiEdit3,
    FiDownload,
    FiFileText,
    FiCheck,
    FiMapPin,
    FiClock
} from 'react-icons/fi';
import getFullUrl from "../../hooks/urlUtils";
import axios from 'axios';

// ===========================
// SYSTÈME DE DESIGN MODERNE
// ===========================
const designSystem = {
    colors: {
        primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1'
        },
        neutral: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717'
        },
        success: {
            50: '#f0fdf4',
            500: '#22c55e',
            600: '#16a34a'
        },
        warning: {
            50: '#fffbeb',
            500: '#f59e0b',
            600: '#d97706'
        },
        danger: {
            50: '#fef2f2',
            500: '#ef4444',
            600: '#dc2626'
        }
    },
    spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px'
    },
    borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px'
    },
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    typography: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px'
    }
};

// ===========================
// COMPOSANTS UI MODERNES
// ===========================

const Card = ({ children, className = '', hover = false, ...props }) => {
    const baseStyle = {
        backgroundColor: 'white',
        borderRadius: designSystem.borderRadius.xl,
        border: `1px solid ${designSystem.colors.neutral[200]}`,
        boxShadow: designSystem.shadows.sm,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...props.style
    };

    const hoverStyle = hover ? {
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: designSystem.shadows.md,
            borderColor: designSystem.colors.neutral[300]
        }
    } : {};

    return (
        <div
            {...props}
            style={baseStyle}
            className={`modern-card ${hover ? 'hover-card' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

const ModernButton = ({ children, variant = 'primary', size = 'md', icon, loading, ...props }) => {
    const variants = {
        primary: {
            backgroundColor: designSystem.colors.primary[600],
            color: 'white',
            border: 'none',
            boxShadow: `0 1px 2px 0 rgba(14, 165, 233, 0.1)`,
            ':hover': {
                backgroundColor: designSystem.colors.primary[700],
                boxShadow: `0 4px 12px 0 rgba(14, 165, 233, 0.15)`
            }
        },
        secondary: {
            backgroundColor: 'white',
            color: designSystem.colors.neutral[700],
            border: `1px solid ${designSystem.colors.neutral[300]}`,
            boxShadow: designSystem.shadows.sm,
            ':hover': {
                backgroundColor: designSystem.colors.neutral[50],
                borderColor: designSystem.colors.neutral[400]
            }
        },
        ghost: {
            backgroundColor: 'transparent',
            color: designSystem.colors.neutral[600],
            border: 'none',
            ':hover': {
                backgroundColor: designSystem.colors.neutral[100]
            }
        }
    };

    const sizes = {
        sm: {
            padding: `${designSystem.spacing[2]} ${designSystem.spacing[3]}`,
            fontSize: designSystem.typography.sm,
            height: '36px'
        },
        md: {
            padding: `${designSystem.spacing[3]} ${designSystem.spacing[4]}`,
            fontSize: designSystem.typography.base,
            height: '44px'
        },
        lg: {
            padding: `${designSystem.spacing[4]} ${designSystem.spacing[6]}`,
            fontSize: designSystem.typography.lg,
            height: '52px'
        }
    };

    return (
        <Button
            {...props}
            style={{
                ...variants[variant],
                ...sizes[size],
                borderRadius: designSystem.borderRadius.lg,
                fontWeight: '500',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: icon ? designSystem.spacing[2] : '0',
                ...props.style
            }}
            startIcon={icon}
            loading={loading}
        >
            {children}
        </Button>
    );
};

const StatCard = ({ icon, value, label, trend }) => (
    <Card hover style={{ padding: designSystem.spacing[6], textAlign: 'center' }}>
        <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: designSystem.colors.primary[50],
            borderRadius: designSystem.borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto ${designSystem.spacing[4]} auto`,
            color: designSystem.colors.primary[600]
        }}>
            {icon}
        </div>
        <div style={{
            fontSize: designSystem.typography['2xl'],
            fontWeight: '700',
            color: designSystem.colors.neutral[900],
            marginBottom: designSystem.spacing[1],
            lineHeight: '1.2'
        }}>
            {value}
        </div>
        <div style={{
            fontSize: designSystem.typography.sm,
            color: designSystem.colors.neutral[600],
            fontWeight: '500'
        }}>
            {label}
        </div>
        {trend && (
            <div style={{
                marginTop: designSystem.spacing[2],
                fontSize: designSystem.typography.xs,
                color: designSystem.colors.success[600],
                fontWeight: '500'
            }}>
                {trend}
            </div>
        )}
    </Card>
);

const InfoItem = ({ icon, label, value, highlight = false }) => (
    <div style={{
        padding: designSystem.spacing[4],
        backgroundColor: highlight ? designSystem.colors.primary[50] : designSystem.colors.neutral[50],
        borderRadius: designSystem.borderRadius.lg,
        border: `1px solid ${highlight ? designSystem.colors.primary[200] : designSystem.colors.neutral[200]}`,
        transition: 'all 0.2s ease'
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: designSystem.spacing[3],
            marginBottom: designSystem.spacing[2]
        }}>
            <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: highlight ? designSystem.colors.primary[100] : 'white',
                borderRadius: designSystem.borderRadius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: highlight ? designSystem.colors.primary[600] : designSystem.colors.neutral[600]
            }}>
                {icon}
            </div>
            <span style={{
                fontSize: designSystem.typography.xs,
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: designSystem.colors.neutral[500]
            }}>
                {label}
            </span>
        </div>
        <div style={{
            fontSize: designSystem.typography.base,
            fontWeight: '600',
            color: designSystem.colors.neutral[900],
            lineHeight: '1.4'
        }}>
            {value}
        </div>
    </div>
);

// ===========================
// COMPOSANT PRINCIPAL
// ===========================
const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);
                // Appel API réel
                const response = await axios.get(`${getFullUrl()}/api/souscription-personnel/personnelById/255`);

                if (response.data) {
                    setUserData(response.data);
                } else {
                    throw new Error('Aucune donnée reçue de l\'API');
                }

                setLoading(false);

            } catch (err) {
                console.error('Erreur lors du chargement du profil:', err);

                let errorMessage = 'Impossible de charger les informations du profil';

                if (err.code === 'ECONNABORTED') {
                    errorMessage = 'La requête a expiré. Veuillez réessayer.';
                } else if (err.response) {
                    // Erreur de réponse du serveur
                    switch (err.response.status) {
                        case 404:
                            errorMessage = 'Profil utilisateur introuvable.';
                            break;
                        case 401:
                            errorMessage = 'Accès non autorisé. Veuillez vous reconnecter.';
                            break;
                        case 403:
                            errorMessage = 'Accès interdit à ces informations.';
                            break;
                        case 500:
                            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                            break;
                        default:
                            errorMessage = `Erreur ${err.response.status}: ${err.response.data?.message || 'Erreur inconnue'}`;
                    }
                } else if (err.request) {
                    // Erreur de réseau
                    errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
                }

                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleEditProfile = () => {
        Notification.info({
            title: 'Navigation',
            description: 'Redirection vers la page de modification du profil'
        });
    };

    const handleDownloadCV = () => {
        Notification.success({
            title: 'Téléchargement',
            description: 'Téléchargement du CV en cours...'
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'VALIDEE':
                return {
                    color: 'green',
                    label: 'Profil validé',
                    bgColor: designSystem.colors.success[50],
                    textColor: designSystem.colors.success[700]
                };
            case 'EN_ATTENTE':
                return {
                    color: 'orange',
                    label: 'En attente de validation',
                    bgColor: designSystem.colors.warning[50],
                    textColor: designSystem.colors.warning[700]
                };
            case 'REFUSEE':
                return {
                    color: 'red',
                    label: 'Profil refusé',
                    bgColor: designSystem.colors.danger[50],
                    textColor: designSystem.colors.danger[700]
                };
            default:
                return {
                    color: 'blue',
                    label: status,
                    bgColor: designSystem.colors.primary[50],
                    textColor: designSystem.colors.primary[700]
                };
        }
    };

    if (loading) {
        return (
            <div style={{
                backgroundColor: designSystem.colors.neutral[50],
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: designSystem.spacing[8]
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader size="lg" />
                    <p style={{
                        marginTop: designSystem.spacing[4],
                        color: designSystem.colors.neutral[600],
                        fontSize: designSystem.typography.base
                    }}>
                        Chargement du profil...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                backgroundColor: designSystem.colors.neutral[50],
                minHeight: '100vh',
                padding: designSystem.spacing[8]
            }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: designSystem.spacing[16] }}>
                    <Message type="error" showIcon>
                        {error}
                    </Message>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(userData?.sous_attent_personn_statut);

    return (
        <div style={{
            backgroundColor: designSystem.colors.neutral[50],
            minHeight: '100vh',
            padding: designSystem.spacing[6]
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* En-tête du profil */}
                <Card style={{
                    padding: designSystem.spacing[8],
                    marginBottom: designSystem.spacing[8],
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                }}>
                    <Row gutter={32} style={{ alignItems: 'center' }}>
                        <Col xs={24} md={16}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing[6] }}>
                                {/* Avatar avec indicateur de statut */}
                                <div style={{ position: 'relative' }}>
                                    <Avatar
                                        size="xl"
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            backgroundColor: designSystem.colors.primary[500],
                                            fontSize: '32px',
                                            fontWeight: '600',
                                            border: `4px solid ${designSystem.colors.primary[100]}`
                                        }}
                                    >
                                        {userData?.sous_attent_personn_prenom?.[0]}{userData?.sous_attent_personn_nom?.[0]}
                                    </Avatar>
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        right: '4px',
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: designSystem.colors.success[500],
                                        borderRadius: designSystem.borderRadius.full,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '3px solid white',
                                        boxShadow: designSystem.shadows.sm
                                    }}>
                                        <FiCheck size={12} color="white" />
                                    </div>
                                </div>

                                {/* Informations principales */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: designSystem.spacing[2] }}>
                                        <h1 style={{
                                            margin: 0,
                                            fontSize: designSystem.typography['3xl'],
                                            fontWeight: '700',
                                            color: designSystem.colors.neutral[900],
                                            letterSpacing: '-0.025em',
                                            lineHeight: '1.2'
                                        }}>
                                            {userData?.sous_attent_personn_prenom} {userData?.sous_attent_personn_nom}
                                        </h1>
                                    </div>

                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        backgroundColor: statusConfig.bgColor,
                                        color: statusConfig.textColor,
                                        padding: `${designSystem.spacing[1]} ${designSystem.spacing[3]}`,
                                        borderRadius: designSystem.borderRadius.full,
                                        fontSize: designSystem.typography.sm,
                                        fontWeight: '600',
                                        marginBottom: designSystem.spacing[3]
                                    }}>
                                        <FiCheck size={14} style={{ marginRight: designSystem.spacing[1] }} />
                                        {statusConfig.label}
                                    </div>

                                    <p style={{
                                        margin: `0 0 ${designSystem.spacing[1]} 0`,
                                        fontSize: designSystem.typography.lg,
                                        color: designSystem.colors.neutral[700],
                                        fontWeight: '600'
                                    }}>
                                        {userData?.fonction?.fonctionlibelle}
                                    </p>
                                    <p style={{
                                        margin: 0,
                                        fontSize: designSystem.typography.base,
                                        color: designSystem.colors.neutral[600]
                                    }}>
                                        {userData?.domaine_formation?.domaine_formation_libelle}
                                    </p>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing[3] }}>
                                <ModernButton
                                    size="lg"
                                    icon={<FiEdit3 size={18} />}
                                    onClick={handleEditProfile}
                                >
                                    Modifier le profil
                                </ModernButton>
                                {userData?.sous_attent_personn_lien_cv && (
                                    <ModernButton
                                        size="md"
                                        variant="secondary"
                                        icon={<FiDownload size={16} />}
                                        onClick={handleDownloadCV}
                                    >
                                        Télécharger le CV
                                    </ModernButton>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Statistiques */}
                <Row gutter={24} style={{ marginBottom: designSystem.spacing[8] }}>
                    <Col xs={24} sm={8}>
                        <StatCard
                            icon={<FiAward size={20} />}
                            value={`${userData?.sous_attent_personn_nbre_annee_experience} ans`}
                            label="Expérience professionnelle"
                            trend="+2 ans cette année"
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <StatCard
                            icon={<FiBookOpen size={20} />}
                            value={userData?.niveau_etude?.niveau_etude_libelle}
                            label="Niveau d'études"
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <StatCard
                            icon={<FiCalendar size={20} />}
                            value="Mars 2023"
                            label="Date de validation"
                        />
                    </Col>
                </Row>

                {/* Sections d'informations */}
                <Row gutter={24}>
                    {/* Informations personnelles */}
                    <Col xs={24} lg={12}>
                        <Card style={{
                            padding: designSystem.spacing[6],
                            height: '100%'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: designSystem.spacing[3],
                                marginBottom: designSystem.spacing[6]
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: designSystem.colors.primary[100],
                                    borderRadius: designSystem.borderRadius.lg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: designSystem.colors.primary[600]
                                }}>
                                    <FiUser size={20} />
                                </div>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: designSystem.typography.xl,
                                    fontWeight: '600',
                                    color: designSystem.colors.neutral[900]
                                }}>
                                    Informations personnelles
                                </h3>
                            </div>

                            <div style={{
                                display: 'grid',
                                gap: designSystem.spacing[4]
                            }}>
                                <InfoItem
                                    icon={<FiMail size={16} />}
                                    label="Adresse e-mail"
                                    value={userData?.sous_attent_personn_email}
                                    highlight
                                />
                                <InfoItem
                                    icon={<FiPhone size={16} />}
                                    label="Numéro de téléphone"
                                    value={userData?.sous_attent_personn_contact}
                                />
                                <InfoItem
                                    icon={<FiCalendar size={16} />}
                                    label="Date de naissance"
                                    value={formatDate(userData?.sous_attent_personn_date_naissance)}
                                />
                                <InfoItem
                                    icon={<FiUser size={16} />}
                                    label="Genre"
                                    value={userData?.sous_attent_personn_sexe?.toLowerCase()}
                                />
                            </div>
                        </Card>
                    </Col>

                    {/* Informations professionnelles */}
                    <Col xs={24} lg={12}>
                        <Card style={{
                            padding: designSystem.spacing[6],
                            height: '100%'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: designSystem.spacing[3],
                                marginBottom: designSystem.spacing[6]
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: designSystem.colors.success[100],
                                    borderRadius: designSystem.borderRadius.lg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: designSystem.colors.success[600]
                                }}>
                                    <FiBriefcase size={20} />
                                </div>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: designSystem.typography.xl,
                                    fontWeight: '600',
                                    color: designSystem.colors.neutral[900]
                                }}>
                                    Parcours professionnel
                                </h3>
                            </div>

                            <div style={{
                                display: 'grid',
                                gap: designSystem.spacing[4]
                            }}>
                                <InfoItem
                                    icon={<FiBriefcase size={16} />}
                                    label="Fonction actuelle"
                                    value={userData?.fonction?.fonctionlibelle}
                                    highlight
                                />
                                <InfoItem
                                    icon={<FiBookOpen size={16} />}
                                    label="Domaine de formation"
                                    value={userData?.domaine_formation?.domaine_formation_libelle}
                                />
                                <InfoItem
                                    icon={<FiAward size={16} />}
                                    label="Dernier diplôme obtenu"
                                    value={userData?.sous_attent_personn_diplome_recent}
                                />
                                <InfoItem
                                    icon={<FiClock size={16} />}
                                    label="Années d'expérience"
                                    value={`${userData?.sous_attent_personn_nbre_annee_experience} années`}
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Documents */}
                {(userData?.sous_attent_personn_lien_cv || userData?.sous_attent_personn_lien_autorisation) && (
                    <Card style={{
                        padding: designSystem.spacing[6],
                        marginTop: designSystem.spacing[8]
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: designSystem.spacing[3],
                            marginBottom: designSystem.spacing[6]
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: designSystem.colors.warning[100],
                                borderRadius: designSystem.borderRadius.lg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: designSystem.colors.warning[600]
                            }}>
                                <FiFileText size={20} />
                            </div>
                            <h3 style={{
                                margin: 0,
                                fontSize: designSystem.typography.xl,
                                fontWeight: '600',
                                color: designSystem.colors.neutral[900]
                            }}>
                                Documents joints
                            </h3>
                        </div>

                        <Row gutter={24}>
                            {userData?.sous_attent_personn_lien_cv && (
                                <Col xs={24} sm={12}>
                                    <Card hover style={{
                                        padding: designSystem.spacing[6],
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: designSystem.colors.primary[50],
                                        border: `2px dashed ${designSystem.colors.primary[200]}`
                                    }} onClick={handleDownloadCV}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: designSystem.colors.primary[500],
                                            borderRadius: designSystem.borderRadius.lg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: `0 auto ${designSystem.spacing[3]} auto`,
                                            color: 'white'
                                        }}>
                                            <FiFileText size={20} />
                                        </div>
                                        <div style={{
                                            fontSize: designSystem.typography.base,
                                            fontWeight: '600',
                                            color: designSystem.colors.neutral[900],
                                            marginBottom: designSystem.spacing[1]
                                        }}>
                                            Curriculum Vitae
                                        </div>
                                        <div style={{
                                            fontSize: designSystem.typography.sm,
                                            color: designSystem.colors.neutral[600]
                                        }}>
                                            {userData.sous_attent_personn_lien_cv}
                                        </div>
                                    </Card>
                                </Col>
                            )}
                            {userData?.sous_attent_personn_lien_autorisation && (
                                <Col xs={24} sm={12}>
                                    <Card hover style={{
                                        padding: designSystem.spacing[6],
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: designSystem.colors.success[50],
                                        border: `2px dashed ${designSystem.colors.success[200]}`
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: designSystem.colors.success[500],
                                            borderRadius: designSystem.borderRadius.lg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: `0 auto ${designSystem.spacing[3]} auto`,
                                            color: 'white'
                                        }}>
                                            <FiFileText size={20} />
                                        </div>
                                        <div style={{
                                            fontSize: designSystem.typography.base,
                                            fontWeight: '600',
                                            color: designSystem.colors.neutral[900],
                                            marginBottom: designSystem.spacing[1]
                                        }}>
                                            Pièce d'identité
                                        </div>
                                        <div style={{
                                            fontSize: designSystem.typography.sm,
                                            color: designSystem.colors.neutral[600]
                                        }}>
                                            {userData.sous_attent_personn_lien_autorisation}
                                        </div>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    </Card>
                )}
            </div>

            {/* Styles CSS pour les animations */}
            <style jsx>{`
                .hover-card {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .hover-card:hover {
                    transform: translateY(-2px);
                    box-shadow: ${designSystem.shadows.md};
                    border-color: ${designSystem.colors.neutral[300]};
                }
                
                .rs-btn {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .rs-btn:hover {
                    transform: translateY(-1px);
                }
                
                .rs-avatar {
                    transition: all 0.3s ease;@
                }
            `}</style>
        </div>
    );
};

export default UserProfile;