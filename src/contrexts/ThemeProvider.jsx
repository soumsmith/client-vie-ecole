import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Définition des thèmes selon le profil utilisateur
const themes = {
  admin: {
    light: {
      primary: '#7b1fa2',
      secondary: '#424242',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#212121',
      textSecondary: '#757575',
      border: '#e0e0e0',
      accent: '#9c27b0'
    },
    dark: {
      primary: '#ba68c8',
      secondary: '#616161',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#333333',
      accent: '#ce93d8'
    }
  },
  user: {
    light: {
      primary: '#1976d2',
      secondary: '#424242',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#212121',
      textSecondary: '#757575',
      border: '#e0e0e0',
      accent: '#2196f3'
    },
    dark: {
      primary: '#64b5f6',
      secondary: '#616161',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#333333',
      accent: '#90caf9'
    }
  },
  manager: {
    light: {
      primary: '#388e3c',
      secondary: '#424242',
      background: '#fafafa',
      surface: '#ffffff',
      text: '#212121',
      textSecondary: '#757575',
      border: '#e0e0e0',
      accent: '#4caf50'
    },
    dark: {
      primary: '#81c784',
      secondary: '#616161',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#333333',
      accent: '#a5d6a7'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // Simulé pour l'exemple

  // Charger les préférences depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedUserRole = localStorage.getItem('userRole') || 'admin';
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    setUserRole(savedUserRole);
  }, []);

  // Appliquer le thème au DOM
  useEffect(() => {
    const currentTheme = themes[userRole][isDarkMode ? 'dark' : 'light'];
    const root = document.documentElement;
    
    Object.entries(currentTheme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Sauvegarder dans localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('userRole', userRole);
  }, [isDarkMode, userRole]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getCurrentTheme = () => {
    return themes[userRole][isDarkMode ? 'dark' : 'light'];
  };

  const value = {
    isDarkMode,
    toggleTheme,
    userRole,
    setUserRole,
    getCurrentTheme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};