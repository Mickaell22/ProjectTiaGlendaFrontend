// src/hooks/useSnackbar.js
// Hook customizado para manejar notificaciones snackbar de forma consistente

import { useState } from 'react';

export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // success, error, warning, info
  });

  const mostrarMensaje = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const showSuccess = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  const showError = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error'
    });
  };

  const showWarning = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'warning'
    });
  };

  const showInfo = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'info'
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  return {
    snackbar,
    mostrarMensaje,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideSnackbar
  };
};

export default useSnackbar;