import React from 'react';
import 'rsuite/dist/rsuite.min.css';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import { ThemeProvider } from './contrexts/ThemeContext';
import { UserProvider } from './contrexts/UserContext';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePulsParams } from './hooks/useDynamicParams';

import Paroti from './components/ParotiCharity/ParotiCharity';
import './Theme.css';
import { getUserProfile } from "./components/hooks/userUtils";

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppContent />
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </UserProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { 
    ecoleId: dynamicEcoleId, 
    personnelInfo, 
    academicYearId: dynamicAcademicYearId,
    profileId,
    userId,
    email,
    isAuthenticated,
    isInitialized,
    isReady
  } = usePulsParams();
  const userProfile = getUserProfile();

  console.log('=== DONNÉES UTILISATEUR ===');
  console.log('dynamicEcoleId', dynamicEcoleId);
  console.log('personnelInfo', personnelInfo);
  console.log('dynamicAcademicYearId', dynamicAcademicYearId);
  console.log('profileId', profileId);
  console.log('userId', userId);
  console.log('email', email);
  console.log('isAuthenticated', isAuthenticated);
  console.log('isInitialized', isInitialized);
  console.log('isReady', isReady);
  console.log('========================');


  const hideFilterFor = ['Fondateur', 'SuperAdmin'];
  const showMatiereFilter = !hideFilterFor.includes(userProfile || '');

  // Afficher un loader si les données ne sont pas encore initialisées
  if (!isInitialized) {
    return (
      <div className="App loading-state">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Initialisation des données utilisateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div id={`AppPage-${userProfile}`} className={`App ${showMatiereFilter ? 'show-filter' : 'hide-filter'}`}>
      <Router>
        <Routes>
          <Route path="/" element={<Paroti />} />

          {/* <Route path="/" element={<LandingWrapper />} />*/}
          <Route path="/*" element={
            <LayoutWrapper 
              profileId={profileId} 
              userId={userId} 
              email={email}
              personnelInfo={personnelInfo}
              isAuthenticated={isAuthenticated}
            />
          } /> 
        </Routes>
      </Router>
    </div>
  );
}

function LandingWrapper() {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate('/dashboard');
  };

  const handleNavigateToSignup = () => {
    navigate('/dashboard');
  };

  return (
    <LandingPage
      onNavigateToLogin={handleNavigateToLogin}
      onNavigateToSignup={handleNavigateToSignup}
    />
  );
}

function LayoutWrapper({ profileId, userId }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <Layout 
      onLogout={handleLogout} 
      profileId={profileId} 
      userId={userId} 
    />
  );
}

export default App;