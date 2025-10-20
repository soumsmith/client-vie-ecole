import React, { useState, useEffect } from 'react';
import { FaSearch, FaShareAlt, FaUsers, FaChalkboardTeacher, FaBook, FaGraduationCap, FaLightbulb, FaAtom, FaChartLine, FaUserGraduate } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ELearningDashboard = ({ niveau = 'EnseignementSecondaireTechnique' }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [themeColors, setThemeColors] = useState({
    chartPrimary: '#5ECFB1',
    chartSecondary: '#8B7355'
  });

  // Récupère les couleurs du thème depuis les variables CSS
  useEffect(() => {
    const rootElement = document.documentElement;
    const computedStyle = getComputedStyle(rootElement);
    
    setThemeColors({
      chartPrimary: computedStyle.getPropertyValue('--chart-primary-color').trim() || '#5ECFB1',
      chartSecondary: computedStyle.getPropertyValue('--chart-secondary-color').trim() || '#8B7355'
    });
  }, [niveau]);

  // Données statistiques
  const stats = {
    totalStudents: 1245,
    totalTeachers: 83,
    activeCourses: 156,
    successRate: 94,
    maleStudents: 678,
    femaleStudents: 567,
    newEnrollments: 353,
    staffMembers: 128
  };

  const slides = [
    {
      title: "Ensemble nous Réalisons Quelque Chose",
      highlight: "d'Extraordinaire",
      subtitle: "Améliorer l'Avenir de Vos Élèves",
      description: "Formation technique et professionnelle de qualité adaptée aux besoins du marché. Notre établissement offre un enseignement moderne dans tous les domaines techniques.",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=600&fit=crop"
    },
    {
      title: "Apprenez avec des Experts",
      highlight: "Qualifiés",
      subtitle: "Excellence en Enseignement Technique",
      description: "Notre équipe pédagogique expérimentée accompagne chaque élève vers la réussite professionnelle avec des formations pratiques et théoriques de haut niveau.",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=600&fit=crop"
    },
    {
      title: "Construisez Votre Avenir",
      highlight: "Professionnel",
      subtitle: "Formation Technique Flexible",
      description: "Accédez à des ressources pédagogiques modernes et à des équipements de pointe. Notre système de formation s'adapte aux exigences du secteur technique.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=600&fit=crop"
    }
  ];

  // Auto-play des slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const studentData = [
    { name: 'Garçons', value: stats.maleStudents, color: themeColors.chartSecondary },
    { name: 'Filles', value: stats.femaleStudents, color: themeColors.chartPrimary }
  ];

  const performanceData = [
    { category: 'Électrotechnique', score: 85 },
    { category: 'Mécanique', score: 92 },
    { category: 'Informatique', score: 88 },
    { category: 'Bâtiment', score: 78 },
    { category: 'Commerce', score: 81 }
  ];

  return (
    <div className={`dashboard-container ${niveau}`}>
      {/* Decorative dots top */}
      <div className="decorative-dots-top">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="dot" />
        ))}
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        {/* Left - Image Section */}
        <div className="hero-image-container">
          {/* Decorative atom icon */}
          <div className="decorative-icon-top">
            <FaAtom />
          </div>

          {/* Main image */}
          <div className="main-image">
            <img
              key={activeSlide}
              src={slides[activeSlide].image}
              alt="Education"
            />
          </div>

          {/* Decorative lightbulb icon */}
          <div className="decorative-icon-bottom">
            <FaLightbulb />
          </div>

          {/* Slide indicators */}
          <div className="slide-indicators">
            <span className="current">0{activeSlide + 1}</span>
            <div className="divider" />
            <span className="total">0{slides.length}</span>
          </div>
        </div>

        {/* Right - Content Section */}
        <div className="hero-content">
          <p className="subtitle">
            {slides[activeSlide].subtitle}
          </p>

          <h1 className="main-title">
            <span className="highlight">Ensemble</span> nous<br />
            Réalisons Quelque Chose<br />
            <span className="highlighted-text">
              {slides[activeSlide].highlight}
              <div className="underline" />
            </span>
          </h1>

          <p className="description">
            {slides[activeSlide].description}
          </p>
        </div>

        {/* Decorative dots right */}
        <div className="decorative-dots-right">
          {[...Array(56)].map((_, i) => (
            <div key={i} className="dot" />
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="pagination-dots">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`dot ${index === activeSlide ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Dashboard Section */}
      <div className="dashboard-stats-section">
        <div className="container">
          <h2 className="section-title">
            Tableau de Bord <span className="highlight">Statistiques</span> de l'Établissement
          </h2>

          {/* Main Stats Cards */}
          <div className="main-stats-grid">
            <div className="stat-card success">
              <FaUsers className="icon" />
              <div className="value">{stats.totalStudents}</div>
              <div className="label">Total Élèves</div>
            </div>

            <div className="stat-card primary">
              <FaChalkboardTeacher className="icon" />
              <div className="value">{stats.totalTeachers}</div>
              <div className="label">Enseignants</div>
            </div>

            <div className="stat-card info">
              <FaBook className="icon" />
              <div className="value">{stats.activeCourses}</div>
              <div className="label">Formations Actives</div>
            </div>

            <div className="stat-card warning">
              <FaChartLine className="icon" />
              <div className="value">{stats.successRate}%</div>
              <div className="label">Taux de Réussite</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            {/* Performance Chart */}
            <div className="chart-card">
              <h3 className="chart-title">
                <FaChartLine className="icon" />
                Performance par Matière
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="category" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="score" fill={themeColors.chartPrimary} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Student Distribution Pie */}
            <div className="chart-card">
              <h3 className="chart-title">
                <FaUserGraduate className="icon" />
                Répartition Élèves
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={studentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="additional-stats-grid">
            <div className="additional-stat-card">
              <div className="value">{stats.newEnrollments}</div>
              <div className="label">Nouvelles Inscriptions</div>
              <div className="sublabel">Cette année scolaire</div>
            </div>

            <div className="additional-stat-card">
              <div className="value">{stats.staffMembers}</div>
              <div className="label">Membres du Personnel</div>
              <div className="sublabel">Personnel total</div>
            </div>

            <div className="additional-stat-card">
              <div className="value">12</div>
              <div className="label">Filières Techniques</div>
              <div className="sublabel">Formations disponibles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>© 2025 E-Learning Academy. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ELearningDashboard;