// src/config/moduleThemes.js
// Configuración de temas y colores para módulos

export const MODULE_THEMES = {
  personas: {
    colors: ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0'],
    primaryColor: '#2196F3'
  },
  pacientes: {
    colors: ['#2196F3', '#4CAF50', '#FF9800', '#E91E63'],
    primaryColor: '#2196F3'
  },
  personal: {
    colors: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'],
    primaryColor: '#4CAF50'
  },
  especialidades: {
    colors: ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0'],
    primaryColor: '#FF9800'
  },
  usuarios: {
    colors: ['#673AB7', '#E91E63', '#FF9800', '#4CAF50'],
    primaryColor: '#673AB7'
  },
  tutores: {
    colors: ['#FF5722', '#4CAF50', '#2196F3', '#9C27B0'],
    primaryColor: '#FF5722'
  },
  terapeutico: {
    colors: ['#00BCD4', '#4CAF50', '#FF9800', '#9C27B0'],
    primaryColor: '#00BCD4'
  },
  pedagogico: {
    colors: ['#3F51B5', '#4CAF50', '#FF9800', '#E91E63'],
    primaryColor: '#3F51B5'
  }
};

export const getModuleTheme = (moduleName) => {
  return MODULE_THEMES[moduleName] || MODULE_THEMES.personas;
};