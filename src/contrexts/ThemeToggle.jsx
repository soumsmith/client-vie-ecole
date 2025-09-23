import React from 'react';
import { IconButton } from 'rsuite';
import { useTheme } from './ThemeContext';

const ThemeToggle = () => {
  const { toggleTheme } = useTheme();
  
  return (
    <IconButton
      onClick={toggleTheme}
      appearance="subtle"
    >
      🌙
    </IconButton>
  );
};

export default ThemeToggle;