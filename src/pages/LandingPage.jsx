import React, { useState } from 'react';
import {
  Container,
  Content,
  Footer,
  Button,
  Panel,
  Rate,
  Modal,
  List,
  Progress
} from 'rsuite';
import 'bootstrap/dist/css/bootstrap.min.css';
import DynamicMenu from '../components/Menu/DynamicMenu';
import AboutSection from '../components/Landing/AboutSection';
import ProgramsSection from '../components/Landing/ProgramsSection';
import TestimonialsSection from '../components/Landing/TestimonialsSection';
import EventsSection from '../components/Landing/EventsSection';
import CTASection from '../components/Landing/CTASection';
import FooterSection from '../components/Landing/FooterSection';

// Composant Carrousel avec style éducatif
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
    height: '700px',
    overflow: 'hidden',
    backgroundColor: '#f8f9fa'
  };

  const slideContainerStyle = {
    display: 'flex',
    width: `${slides.length * 100}%`,
    height: '100%',
    transform: `translateX(-${(currentSlide * 100) / slides.length}%)`,
    transition: 'transform 0.8s ease-in-out'
  };

  const slideStyle = {
    width: `${100 / slides.length}%`,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '80px',
    backgroundImage: 'linear-gradient(135deg, rgba(52, 152, 219, 0.9) 0%, rgba(46, 204, 113, 0.8) 100%), url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cg fill-opacity=\'0.03\'%3E%3Cpolygon fill=\'%23ffffff\' points=\'50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40\'/%3E%3C/g%3E%3C/svg%3E")',
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
    color: '#2E7D32',
    transition: 'all 0.3s ease',
    zIndex: 3,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  return (
    <div style={carouselStyle}>
      <div style={slideContainerStyle}>
        {slides.map((slide, index) => (
          <div key={index} style={slideStyle}>
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-7">
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '6px 20px',
                    borderRadius: '25px',
                    marginBottom: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {slide.category}
                  </div>
                  <h1 style={{ 
                    fontSize: '48px', 
                    fontWeight: '700', 
                    marginBottom: '24px', 
                    lineHeight: '1.1',
                    color: '#ffffff'
                  }}>
                    {slide.title}
                  </h1>
                  <p style={{ 
                    fontSize: '18px', 
                    lineHeight: '1.7', 
                    opacity: '0.95', 
                    marginBottom: '35px',
                    maxWidth: '500px'
                  }}>
                    {slide.description}
                  </p>
                  <div className="d-flex gap-3">
                    <Button 
                      size="lg"
                      style={{
                        backgroundColor: '#FF9800',
                        border: 'none',
                        padding: '15px 30px',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderRadius: '30px',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      S'inscrire Maintenant
                    </Button>
                    <Button 
                      size="lg"
                      style={{
                        backgroundColor: 'transparent',
                        border: '2px solid rgba(255,255,255,0.8)',
                        padding: '15px 30px',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderRadius: '30px',
                        color: 'white'
                      }}
                    >
                      Découvrir Plus
                    </Button>
                  </div>
                </div>
                <div className="col-lg-5 text-center">
                  <div style={{
                    width: '350px',
                    height: '350px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    border: '2px solid rgba(255,255,255,0.2)',
                    position: 'relative'
                  }}>
                    <div style={{ fontSize: '120px', opacity: '0.9' }}>{slide.icon}</div>
                    <div style={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '20px',
                      backgroundColor: '#FF9800',
                      borderRadius: '50%',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      🎓
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        style={{ ...navigationStyle, left: '30px' }}
        onClick={prevSlide}
      >
        ←
      </button>

      <button
        style={{ ...navigationStyle, right: '30px' }}
        onClick={nextSlide}
      >
        →
      </button>

      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 3
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            style={{
              width: currentSlide === index ? '25px' : '10px',
              height: '10px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: currentSlide === index ? '#FF9800' : 'rgba(255,255,255,0.5)'
            }}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

const EducationalLandingPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Données carrousel éducatif
  const carouselSlides = [
    {
      category: 'Excellence Académique',
      title: 'Façonnons les Leaders de Demain',
      description: 'Rejoignez notre établissement d\'excellence où chaque étudiant développe son potentiel unique grâce à une pédagogie innovante et un accompagnement personnalisé.',
      icon: '🎓'
    },
    {
      category: 'Innovation Pédagogique',
      title: 'Apprentissage du 21ème Siècle',
      description: 'Découvrez notre approche éducative moderne alliant technologies numériques, méthodes interactives et développement des compétences essentielles pour réussir.',
      icon: '💡'
    },
    {
      category: 'Épanouissement Personnel',
      title: 'Développer Talents et Passions',
      description: 'Notre écosystème éducatif encourage l\'épanouissement de chaque élève à travers des activités parascolaires, des projets créatifs et un suivi individualisé.',
      icon: '🌟'
    }
  ];

  const handleLoginSuccess = (userData) => {
    console.log('Utilisateur connecté:', userData);
  };

  const brandingConfig = {
    name: 'Pouls Scolaire',
    style: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#2E7D32'
    }
  };

  // Programmes éducatifs
  // Données mises à jour pour les programmes médicaux/caritatifs
const programs = [
  {
    title: 'Your little help can heal their pains',
    description: 'Aellentesque porttitor lacus quis enim varius sed efficitur lorem ornare. Mauris vehicula nisi eget massa convallis.',
    category: 'MEDICAL',
    image: 'https://images.unsplash.com/photo-1594608661623-aa0bd6214fad?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
    progressPercentage: 36,
    raised: 25270,
    goal: 30000
  },
  {
    title: 'Clean water saves children lives',
    description: 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Sed dignissim lacinia nunc.',
    category: 'WATER',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
    progressPercentage: 68,
    raised: 42800,
    goal: 63000
  },
  {
    title: 'Education opens doors to future',
    description: 'Curabitur aliquet quam id dui posuere blandit. Praesent sapien massa, convallis a pellentesque nec.',
    category: 'EDUCATION',
    image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
    progressPercentage: 89,
    raised: 67500,
    goal: 75000
  },
  {
    title: 'Food security for rural families',
    description: 'Donec rutrum congue leo eget malesuada. Vivamus suscipit tortor eget felis porttitor volutpat.',
    category: 'NUTRITION',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
    progressPercentage: 45,
    raised: 18900,
    goal: 42000
  },
  {
    title: 'Emergency shelter for displaced',
    description: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
    category: 'SHELTER',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
    progressPercentage: 72,
    raised: 54300,
    goal: 75000
  },
  {
    title: 'Medical supplies for remote areas',
    description: 'Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Cras ultricies ligula sed magna dictum porta.',
    category: 'MEDICAL',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300',
    progressPercentage: 58,
    raised: 29000,
    goal: 50000
  }
];

  // Statistiques d'impact éducatif
  const impactStats = [
    { number: '2,847', label: 'Étudiants Actifs', icon: '👨‍🎓' },
    { number: '97%', label: 'Taux de Réussite', icon: '🏆' },
    { number: '15', label: 'Programmes Offerts', icon: '📖' },
    { number: '124', label: 'Enseignants Experts', icon: '👩‍🏫' }
  ];

  // Témoignages d'étudiants
  const testimonials = [
    {
      name: 'Fatou Diallo',
      role: 'Étudiante en Sciences',
      program: 'Terminale S',
      content: 'Les laboratoires modernes et l\'accompagnement personnalisé m\'ont permis de développer ma passion pour la recherche. Je me prépare maintenant pour des études d\'ingénieur.',
      image: '👩‍🔬'
    },
    {
      name: 'Kofi Asante',
      role: 'Ancien Élève',
      program: 'Promotion 2023',
      content: 'L\'école m\'a donné les clés pour réussir mes études supérieures. Les méthodes d\'apprentissage innovantes et l\'ouverture sur le monde ont fait la différence.',
      image: '👨‍🎓'
    },
    {
      name: 'Aminata Touré',
      role: 'Étudiante en Arts',
      program: 'Première L',
      content: 'Ici, on encourage notre créativité tout en nous donnant une solide formation académique. Les projets artistiques m\'ont révélé ma vocation pour le design.',
      image: '👩‍🎨'
    }
  ];

  // Événements et actualités
  const upcomingEvents = [
    {
      date: { day: '22', month: 'Mar' },
      title: 'Journée Portes Ouvertes',
      location: 'Campus Principal',
      description: 'Découvrez nos installations et rencontrez l\'équipe pédagogique'
    },
    {
      date: { day: '05', month: 'Avr' },
      title: 'Concours de Sciences',
      location: 'Amphithéâtre',
      description: 'Compétition inter-classes en mathématiques et physique'
    },
    {
      date: { day: '18', month: 'Avr' },
      title: 'Spectacle de Fin d\'Année',
      location: 'Salle des Arts',
      description: 'Représentation théâtrale et musicale des étudiants'
    }
  ];

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: "'Open Sans', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
  };

  return (
    <div style={containerStyle}>
      {/* Menu Dynamique - Conservé exactement tel quel */}
      <div style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div className="container">
          <DynamicMenu 
            onLoginSuccess={handleLoginSuccess}
            branding={brandingConfig}
          />
        </div>
      </div>

      <Content>
        {/* Hero Carousel Section */}
        <section>
          <CarouselSlider slides={carouselSlides} />
        </section>

        {/* About School Section */}
        <AboutSection impactStats={impactStats} />

        {/* Programs Section */}
        <ProgramsSection programs={programs} />

        {/* Testimonials Section */}
        <TestimonialsSection testimonials={testimonials} />

        {/* Events Section */}
        <EventsSection upcomingEvents={upcomingEvents} />

        {/* CTA Section */}
        <CTASection />
      </Content>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default EducationalLandingPage;