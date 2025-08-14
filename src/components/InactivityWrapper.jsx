// src/components/InactivityWrapper.jsx
// Wrapper para manejar la inactividad del usuario

import React from 'react';
import useInactivityTimer from '../hooks/useInactivityTimer.js';

const InactivityWrapper = ({ children }) => {
  // Inicializar el hook de inactividad
  useInactivityTimer();

  return children;
};

export default InactivityWrapper;