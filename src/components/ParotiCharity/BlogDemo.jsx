import React, { useState } from 'react';
import Blog from './components/Blog';
import BlogWithCustomArrows from './components/BlogWithCustomArrows';
import BlogAdvanced from './components/BlogAdvanced';

// ===========================
// COMPOSANT SÉLECTEUR DE VERSION
// ===========================
const VersionSelector = ({ currentVersion, onVersionChange }) => {
  const versions = [
    { id: 'splide', name: 'Splide Standard', component: 'Blog' },
    { id: 'custom', name: 'Flèches Personnalisées', component: 'BlogWithCustomArrows' },
    { id: 'advanced', name: 'Version Avancée', component: 'BlogAdvanced' }
  ];

  return (
    <div className="version-selector">
      <div className="container">
        <div className="version-selector__content">
          <h3 className="version-selector__title">
            🎛️ Choisissez la version du carrousel Blog
          </h3>
          <div className="version-selector__buttons">
            {versions.map((version) => (
              <button
                key={version.id}
                className={`version-btn ${currentVersion === version.id ? 'active' : ''}`}
                onClick={() => onVersionChange(version.id)}
              >
                <span className="version-btn__name">{version.name}</span>
                <span className="version-btn__component">{version.component}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .version-selector {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 30px 0;
          margin-bottom: 0;
        }
        
        .version-selector__content {
          text-align: center;
        }
        
        .version-selector__title {
          color: white;
          margin-bottom: 25px;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .version-selector__buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .version-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 15px 25px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          min-width: 180px;
        }
        
        .version-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        
        .version-btn.active {
          background: rgba(255, 255, 255, 0.9);
          border-color: white;
          color: #333;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .version-btn__name {
          display: block;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .version-btn__component {
          display: block;
          font-size: 12px;
          opacity: 0.8;
          font-family: 'Courier New', monospace;
        }
        
        @media (max-width: 768px) {
          .version-selector__buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .version-btn {
            min-width: 250px;
          }
        }
      `}</style>
    </div>
  );
};

// ===========================
// COMPOSANT INFORMATIONS VERSION
// ===========================
const VersionInfo = ({ version }) => {
  const versionDetails = {
    splide: {
      title: 'Splide Standard',
      description: 'Carrousel Splide avec flèches intégrées et styles personnalisés',
      features: [
        'Flèches Splide natives',
        'Responsive automatique',
        'Transitions fluides',
        'Styles Paroti personnalisés'
      ]
    },
    custom: {
      title: 'Flèches Personnalisées',
      description: 'Carrousel avec flèches externes personnalisées utilisant les icônes Paroti',
      features: [
        'Flèches externes personnalisées',
        'Icônes Paroti/FontAwesome',
        'Contrôle programmatique',
        'Design sur mesure'
      ]
    },
    advanced: {
      title: 'Version Avancée',
      description: 'Carrousel avec contrôles avancés, autoplay, compteur et barre de progression',
      features: [
        'Contrôles play/pause',
        'Compteur de slides',
        'Barre de progression',
        'Autoplay intelligent'
      ]
    }
  };

  const info = versionDetails[version];

  return (
    <div className="version-info">
      <div className="container">
        <div className="version-info__content">
          <h4 className="version-info__title">
            📋 {info.title}
          </h4>
          <p className="version-info__description">
            {info.description}
          </p>
          <ul className="version-info__features">
            {info.features.map((feature, index) => (
              <li key={index}>
                <i className="fa fa-check-circle"></i>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <style jsx>{`
        .version-info {
          background: #f8f9fa;
          padding: 20px 0;
          border-bottom: 3px solid #007bff;
        }
        
        .version-info__content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .version-info__title {
          color: #333;
          margin-bottom: 10px;
          font-size: 1.2rem;
        }
        
        .version-info__description {
          color: #666;
          margin-bottom: 15px;
          font-size: 14px;
        }
        
        .version-info__features {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .version-info__features li {
          color: #007bff;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .version-info__features i {
          color: #28a745;
        }
        
        @media (max-width: 768px) {
          .version-info__features {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

// ===========================
// COMPOSANT BLOG DEMO PRINCIPAL
// ===========================
const BlogDemo = () => {
  const [currentVersion, setCurrentVersion] = useState('splide');

  const renderBlogComponent = () => {
    switch (currentVersion) {
      case 'custom':
        return <BlogWithCustomArrows />;
      case 'advanced':
        return <BlogAdvanced />;
      default:
        return <Blog />;
    }
  };

  return (
    <div className="blog-demo">
      <VersionSelector 
        currentVersion={currentVersion}
        onVersionChange={setCurrentVersion}
      />
      <VersionInfo version={currentVersion} />
      {renderBlogComponent()}
    </div>
  );
};

export default BlogDemo;
