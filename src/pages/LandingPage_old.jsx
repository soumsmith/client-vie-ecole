import React, { useState } from 'react';
import {
  Container,
  Content,
  Footer,
  Button,
  Panel,
  Rate,
  Modal,
  List
} from 'rsuite';
import 'bootstrap/dist/css/bootstrap.min.css';
import DynamicMenu from '../components/Menu/DynamicMenu';

// Composant Carrousel (inchangé)
const CarouselSlider = ({ slides, autoPlay = true, interval = 4000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  React.useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const carouselStyle = {
    position: 'relative',
    width: '100%',
    height: '500px',
    overflow: 'hidden',
    borderRadius: '16px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff'
  };

  const slideContainerStyle = {
    display: 'flex',
    width: `${slides.length * 100}%`,
    height: '100%',
    transform: `translateX(-${(currentSlide * 100) / slides.length}%)`,
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const slideStyle = {
    width: `${100 / slides.length}%`,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '60px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    position: 'relative'
  };

  const navigationStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#667eea',
    transition: 'all 0.3s ease',
    zIndex: 3
  };

  return (
    <div style={carouselStyle}>
      <div style={slideContainerStyle}>
        {slides.map((slide, index) => (
          <div key={index} style={slideStyle}>
            <div style={{ width: '100%', textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <span style={{ fontSize: '64px', marginBottom: '24px', display: 'block' }}>{slide.icon}</span>
              <h3 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', lineHeight: '1.2' }}>
                {slide.title}
              </h3>
              <p style={{ fontSize: '18px', lineHeight: '1.6', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        style={{ ...navigationStyle, left: '20px' }}
        onClick={prevSlide}
      >
        ←
      </button>

      <button
        style={{ ...navigationStyle, right: '20px' }}
        onClick={nextSlide}
      >
        →
      </button>

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        zIndex: 3
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: currentSlide === index ? '#ffffff' : 'rgba(255,255,255,0.5)',
              boxShadow: currentSlide === index ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
            }}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Données pour le carrousel
  const carouselSlides = [
    {
      icon: '🚀',
      title: 'Performance Maximale',
      description: 'Optimisez vos performances avec des outils d\'analyse avancés et des tableaux de bord personnalisables qui vous donnent une vision claire de vos résultats.'
    },
    {
      icon: '🤝',
      title: 'Collaboration Simplifiée',
      description: 'Travaillez en équipe de manière fluide avec des espaces partagés, des notifications intelligentes et des workflows automatisés.'
    },
    {
      icon: '📊',
      title: 'Analyses Approfondies',
      description: 'Prenez des décisions éclairées grâce à nos rapports détaillés et nos métriques en temps réel qui révèlent les insights cachés de vos données.'
    },
    {
      icon: '🔐',
      title: 'Sécurité Enterprise',
      description: 'Protégez vos données sensibles avec nos protocoles de sécurité de niveau bancaire et nos systèmes de sauvegarde redondants.'
    }
  ];

  // Contenu des modals pour chaque fonctionnalité
  const modalContents = {
    'tableaux': {
      title: 'Tableaux de Bord Intelligents',
      icon: '📊',
      description: 'Créez des tableaux de bord personnalisés qui s\'adaptent à vos besoins spécifiques.',
      features: [
        'Widgets personnalisables en drag & drop',
        'Métriques en temps réel',
        'Alertes et notifications automatiques',
        'Export vers Excel, PDF et PowerPoint',
        'Partage sécurisé avec votre équipe'
      ],
      benefits: 'Visualisez instantanément les performances de votre entreprise et identifiez les opportunités d\'amélioration.'
    },
    'analyses': {
      title: 'Analyses Avancées',
      icon: '📈',
      description: 'Exploitez la puissance de l\'intelligence artificielle pour analyser vos données.',
      features: [
        'Algorithmes de machine learning intégrés',
        'Prédictions et tendances automatiques',
        'Segmentation avancée des données',
        'Corrélations et insights cachés',
        'Rapports automatisés programmables'
      ],
      benefits: 'Découvrez des patterns invisibles dans vos données et anticipez les tendances futures.'
    },
    'collaboration': {
      title: 'Outils de Collaboration',
      icon: '👥',
      description: 'Synchronisez votre équipe avec des outils de collaboration modernes.',
      features: [
        'Espaces de travail partagés',
        'Messagerie intégrée et vidéoconférence',
        'Gestion de tâches collaborative',
        'Historique et versioning des documents',
        'Permissions granulaires par projet'
      ],
      benefits: 'Éliminez les silos et créez une synergie d\'équipe qui démultiplie votre productivité.'
    },
    'automatisation': {
      title: 'Automatisation Intelligente',
      icon: '⚡',
      description: 'Automatisez vos processus répétitifs pour vous concentrer sur l\'essentiel.',
      features: [
        'Workflows personnalisables sans code',
        'Intégrations avec 200+ applications',
        'Déclencheurs basés sur des conditions',
        'Notifications et actions automatiques',
        'Intelligence artificielle prédictive'
      ],
      benefits: 'Réduisez les tâches manuelles de 80% et concentrez-vous sur la stratégie et l\'innovation.'
    }
  };

  const openModal = (contentKey) => {
    setModalContent(modalContents[contentKey]);
    setModalOpen(true);
  };

  /**
   * Gestionnaire de succès de connexion pour la landing page
   * @param {Object} userData - Données de l'utilisateur connecté
   */
  const handleLoginSuccess = (userData) => {
    // Logique spécifique à la landing page après connexion
    console.log('Utilisateur connecté depuis la landing page:', userData);
    
    // Optionnel: afficher une notification ou rediriger
    // Cela sera géré automatiquement par le DynamicMenu
  };

  /**
   * Configuration personnalisée de la marque pour la landing page
   */
  const brandingConfig = {
    name: 'EduConnect',
    style: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#667eea'
    }
  };

  const features = [
    {
      icon: '👥',
      title: 'Collaboration d\'équipe',
      description: 'Travaillez ensemble efficacement avec des outils de gestion de projet intégrés et des espaces de travail partagés.'
    },
    {
      icon: '⚙️',
      title: 'Automatisation intelligente',
      description: 'Automatisez vos tâches répétitives et concentrez-vous sur ce qui compte vraiment pour votre business.'
    },
    {
      icon: '🛡️',
      title: 'Sécurité renforcée',
      description: 'Vos données sont protégées par des protocoles de sécurité de niveau entreprise et des sauvegardes automatiques.'
    }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Directrice Marketing',
      company: 'TechCorp',
      content: 'Cette plateforme a révolutionné notre façon de gérer les projets. L\'interface est intuitive et les fonctionnalités sont exactement ce dont nous avions besoin.',
      rating: 5
    },
    {
      name: 'Jean Martin',
      role: 'Chef de Projet',
      company: 'InnovateLab',
      content: 'Un outil indispensable pour notre équipe. Les tableaux de bord nous permettent de suivre nos performances en temps réel.',
      rating: 5
    },
    {
      name: 'Sophie Laurent',
      role: 'CEO',
      company: 'StartupXYZ',
      content: 'Excellent rapport qualité-prix. L\'équipe support est réactive et les mises à jour régulières apportent constamment de nouvelles fonctionnalités.',
      rating: 4
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '29€',
      period: '/mois',
      description: 'Parfait pour les petites équipes',
      features: ['Jusqu\'à 5 utilisateurs', 'Tableaux de bord de base', 'Support email', '10 Go de stockage'],
      recommended: false
    },
    {
      name: 'Professional',
      price: '79€',
      period: '/mois',
      description: 'Idéal pour les équipes en croissance',
      features: ['Jusqu\'à 25 utilisateurs', 'Analyses avancées', 'Support prioritaire', '100 Go de stockage', 'Intégrations API'],
      recommended: true
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      period: '',
      description: 'Solution complète pour les grandes organisations',
      features: ['Utilisateurs illimités', 'Fonctionnalités premium', 'Support dédié', 'Stockage illimité', 'SLA personnalisé'],
      recommended: false
    }
  ];

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '120px 0',
    textAlign: 'center'
  };

  const sectionStyle = {
    padding: '80px 0',
    backgroundColor: '#ffffff'
  };

  const alternateSection = {
    padding: '80px 0',
    backgroundColor: '#f8f9fa'
  };

  return (
    <div style={containerStyle}>
      {/* Menu Dynamique remplace l'ancien header */}
      <DynamicMenu 
        onLoginSuccess={handleLoginSuccess}
        branding={brandingConfig}
      />

      <Content>
        {/* Hero Section */}
        <section style={heroStyle}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-md-10">
                <div style={{ fontSize: '56px', marginBottom: '20px' }}>🚀</div>
                <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '24px', lineHeight: '1.2' }}>
                  Gérez vos projets avec une efficacité remarquable
                </h1>
                <p style={{ fontSize: '20px', marginBottom: '40px', opacity: '0.9', lineHeight: '1.6' }}>
                  Une plateforme tout-en-un qui transforme la façon dont votre équipe collabore, 
                  analyse les performances et atteint ses objectifs. Découvrez des tableaux de bord 
                  intuitifs et des outils d'automatisation puissants.
                </p>
                <div className="d-flex justify-content-center gap-3 mb-5">
                  <Button 
                    size="lg" 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      color: '#667eea', 
                      border: 'none',
                      padding: '15px 30px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    Essayer gratuitement →
                  </Button>
                  <Button 
                    size="lg" 
                    appearance="subtle"
                    style={{ 
                      color: '#ffffff', 
                      border: '2px solid rgba(255,255,255,0.3)',
                      padding: '15px 30px',
                      fontSize: '16px'
                    }}
                  >
                    Découvrir plus
                  </Button>
                </div>
                <div className="row text-center mt-5">
                  <div className="col-md-4">
                    <div style={{ fontSize: '32px', fontWeight: '700' }}>10,000+</div>
                    <div style={{ opacity: '0.8' }}>Entreprises</div>
                  </div>
                  <div className="col-md-4">
                    <div style={{ fontSize: '32px', fontWeight: '700' }}>500,000+</div>
                    <div style={{ opacity: '0.8' }}>Utilisateurs</div>
                  </div>
                  <div className="col-md-4">
                    <div style={{ fontSize: '32px', fontWeight: '700' }}>99.9%</div>
                    <div style={{ opacity: '0.8' }}>Disponibilité</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Carrousel */}
        <section style={sectionStyle}>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h2 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '20px', color: '#2c3e50' }}>
                  Découvrez Nos Solutions Avancées
                </h2>
                <p style={{ fontSize: '18px', color: '#6c757d', lineHeight: '1.6' }}>
                  Explorez les fonctionnalités qui transformeront votre façon de travailler et 
                  propulseront votre entreprise vers de nouveaux sommets de performance.
                </p>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <CarouselSlider slides={carouselSlides} />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={alternateSection}>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h2 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '20px', color: '#2c3e50' }}>
                  Fonctionnalités qui font la différence
                </h2>
                <p style={{ fontSize: '18px', color: '#6c757d', lineHeight: '1.6' }}>
                  Découvrez comment notre plateforme peut transformer votre productivité 
                  et optimiser les performances de votre équipe.
                </p>
              </div>
            </div>
            <div className="row g-4">
              {features.map((feature, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div 
                    style={{
                      height: '100%',
                      textAlign: 'center',
                      padding: '40px 30px',
                      border: '1px solid #e9ecef',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      backgroundColor: '#ffffff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>{feature.icon}</div>
                    <h4 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#2c3e50' }}>
                      {feature.title}
                    </h4>
                    <p style={{ fontSize: '16px', color: '#6c757d', lineHeight: '1.6' }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section style={sectionStyle}>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h2 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '20px', color: '#2c3e50' }}>
                  Ce que disent nos clients
                </h2>
                <p style={{ fontSize: '18px', color: '#6c757d', lineHeight: '1.6' }}>
                  Découvrez pourquoi des milliers d'entreprises font confiance à notre plateforme 
                  pour optimiser leur gestion de projet et leurs performances.
                </p>
              </div>
            </div>
            <div className="row g-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div style={{
                    height: '100%',
                    padding: '30px',
                    border: '1px solid #e9ecef',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
                  }}>
                    <Rate 
                      value={testimonial.rating} 
                      readOnly 
                      size="sm"
                      style={{ marginBottom: '20px' }}
                    />
                    <p style={{ fontSize: '16px', fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.6' }}>
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2c3e50' }}>{testimonial.name}</div>
                      <div style={{ fontSize: '14px', color: '#6c757d' }}>
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section style={alternateSection}>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h2 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '20px', color: '#2c3e50' }}>
                  Des tarifs adaptés à vos besoins
                </h2>
                <p style={{ fontSize: '18px', color: '#6c757d', lineHeight: '1.6' }}>
                  Choisissez l'offre qui correspond à la taille de votre équipe et à vos ambitions. 
                  Tous nos plans incluent un support client dédié et des mises à jour régulières.
                </p>
              </div>
            </div>
            <div className="row g-4 justify-content-center">
              {pricingPlans.map((plan, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div style={{
                    height: '100%',
                    padding: '40px 30px',
                    border: plan.recommended ? '2px solid #667eea' : '2px solid #e9ecef',
                    borderRadius: '16px',
                    textAlign: 'center',
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.3s ease',
                    transform: plan.recommended ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: plan.recommended ? '0 10px 30px rgba(102, 126, 234, 0.2)' : 'none'
                  }}>
                    {plan.recommended && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#667eea',
                        color: 'white',
                        padding: '5px 20px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Recommandé
                      </div>
                    )}
                    <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px', color: '#2c3e50' }}>
                      {plan.name}
                    </h3>
                    <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '20px' }}>
                      {plan.description}
                    </p>
                    <div style={{ marginBottom: '30px' }}>
                      <span style={{ fontSize: '36px', fontWeight: '700', color: '#2c3e50' }}>
                        {plan.price}
                      </span>
                      <span style={{ fontSize: '16px', color: '#6c757d' }}>
                        {plan.period}
                      </span>
                    </div>
                    <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                      {plan.features.map((feature, fIndex) => (
                        <div key={fIndex} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: '#28a745', marginRight: '10px' }}>✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      appearance={plan.recommended ? 'primary' : 'default'}
                      size="lg"
                      block
                      style={{
                        backgroundColor: plan.recommended ? '#667eea' : '#ffffff',
                        border: plan.recommended ? 'none' : '2px solid #667eea',
                        color: plan.recommended ? '#ffffff' : '#667eea',
                        padding: '15px',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                    >
                      {plan.name === 'Enterprise' ? 'Nous contacter' : 'Commencer'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ ...heroStyle, padding: '100px 0' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '24px' }}>
                  Prêt à transformer votre productivité ?
                </h2>
                <p style={{ fontSize: '20px', marginBottom: '40px', opacity: '0.9', lineHeight: '1.6' }}>
                  Rejoignez des milliers d'entreprises qui ont déjà optimisé leur gestion 
                  de projet avec notre plateforme. Commencez votre essai gratuit dès aujourd'hui.
                </p>
                <Button 
                  size="lg" 
                  style={{ 
                    backgroundColor: '#ffffff', 
                    color: '#667eea', 
                    border: 'none',
                    padding: '20px 40px',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}
                >
                  Démarrer l'essai gratuit
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Content>

      {/* Footer */}
      <Footer style={{
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        padding: '60px 0 30px'
      }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                EduConnect
              </div>
              <p style={{ lineHeight: '1.6', opacity: '0.8' }}>
                La plateforme de gestion de projet qui propulse votre équipe vers l'excellence.
              </p>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4 style={{ marginBottom: '20px', fontWeight: '600' }}>Produit</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Fonctionnalités</a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Tarifs</a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Intégrations</a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>API</a>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4 style={{ marginBottom: '20px', fontWeight: '600' }}>Entreprise</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>À propos</a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Carrières</a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Blog</a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Presse</a>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4 style={{ marginBottom: '20px', fontWeight: '600' }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Centre d'aide</a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Documentation</a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Statut système</a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Nous contacter</a>
              </div>
            </div>
          </div>
          <hr style={{ margin: '40px 0 20px', borderColor: '#34495e' }} />
          <div className="row align-items-center">
            <div className="col-md-6">
              <p style={{ margin: '0', opacity: '0.7' }}>
                © 2025 EduConnect. Tous droits réservés.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end' }}>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '14px' }}>
                  Mentions légales
                </a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '14px' }}>
                  Politique de confidentialité
                </a>
                <a href="#" style={{ color: '#bdc3c7', textDecoration: 'none', fontSize: '14px' }}>
                  Conditions d'utilisation
                </a>
              </div>
            </div>
          </div>
        </div>
      </Footer>

      {/* Modal pour les fonctionnalités (conservé pour la compatibilité) */}
      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        size="md"
        style={{ zIndex: 2000 }}
      >
        <Modal.Header>
          <Modal.Title style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            color: '#2c3e50'
          }}>
            {modalContent?.icon && <span style={{ fontSize: '32px' }}>{modalContent.icon}</span>}
            {modalContent?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalContent && (
            <div>
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.6', 
                marginBottom: '24px',
                color: '#6c757d'
              }}>
                {modalContent.description}
              </p>
              
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: '#2c3e50'
              }}>
                Fonctionnalités incluses :
              </h4>
              
              <List style={{ marginBottom: '24px' }}>
                {modalContent.features.map((feature, index) => (
                  <List.Item key={index} style={{ 
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '15px'
                  }}>
                    <span style={{ color: '#28a745', marginRight: '8px' }}>✓</span>
                    {feature}
                  </List.Item>
                ))}
              </List>
              
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h5 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#2c3e50'
                }}>
                  Bénéfice principal :
                </h5>
                <p style={{ 
                  fontSize: '15px', 
                  lineHeight: '1.5', 
                  margin: '0',
                  color: '#495057'
                }}>
                  {modalContent.benefits}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            onClick={() => setModalOpen(false)} 
            appearance="subtle"
            style={{ marginRight: '10px' }}
          >
            Fermer
          </Button>
          <Button 
            appearance="primary" 
            style={{ backgroundColor: '#667eea', border: 'none' }}
          >
            Essayer cette fonctionnalité
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LandingPage;