// src/hooks/useInactivityTimer.js
// Hook personalizado para manejar el cierre automático por inactividad

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth.js';
import logger from '../utils/logger';

const useInactivityTimer = () => {
  const { logout, isAuthenticated } = useAuth();
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Obtener tiempo de inactividad desde configuración
  const getInactivityTimeout = useCallback(() => {
    try {
      const savedTimeout = localStorage.getItem('inactivity_timeout');
      const configuraciones = JSON.parse(localStorage.getItem('sistema_configuraciones') || '{}');
      
      // Priorizar configuración específica, luego configuración general, luego default
      const timeoutMinutes = savedTimeout 
        ? parseInt(savedTimeout)
        : configuraciones.seguridad?.tiempoInactividad || 30;
      
      // Si es 0, significa que el cierre automático está deshabilitado
      return timeoutMinutes === 0 ? null : timeoutMinutes * 60 * 1000; // convertir a millisegundos
    } catch (error) {
      logger.warn('Error getting inactivity timeout', error);
      return 30 * 60 * 1000; // default 30 minutos
    }
  }, []);

  // Mostrar advertencia antes del cierre
  const showWarning = useCallback(() => {
    const remainingTime = 60; // 1 minuto de advertencia
    
    // Mostrar notificación de advertencia
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⚠️ Sesión por expirar', {
        body: `Tu sesión se cerrará automáticamente en ${remainingTime} segundos por inactividad.`,
        icon: '/favicon.ico',
        requireInteraction: true
      });
    }

    // También mostrar alerta en la página
    const userConfirmed = window.confirm(
      `Tu sesión se cerrará automáticamente en ${remainingTime} segundos por inactividad.\n\n¿Deseas continuar con tu sesión?`
    );

    if (userConfirmed) {
      // El usuario quiere continuar, reiniciar el timer
      resetTimer();
    } else {
      // El usuario no respondió o eligió cerrar, proceder con logout
      logout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, [logout]);

  // Función para hacer logout por inactividad
  const logoutDueToInactivity = useCallback(() => {
    // Mostrar notificación si es posible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔒 Sesión cerrada', {
        body: 'Tu sesión se ha cerrado automáticamente por inactividad.',
        icon: '/favicon.ico'
      });
    }
    
    // Guardar el motivo del logout
    localStorage.setItem('logout_reason', 'inactivity');
    
    logout();
  }, [logout]);

  // Reiniciar el timer de inactividad
  const resetTimer = useCallback(() => {
    const timeout = getInactivityTimeout();
    
    if (!timeout || !isAuthenticated) {
      return;
    }

    // Limpiar timers existentes
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    lastActivityRef.current = Date.now();

    // Timer de advertencia (1 minuto antes del timeout)
    const warningTime = Math.max(timeout - 60000, timeout * 0.8); // Advertencia con 1 min de anticipación o 80% del tiempo
    
    timerRef.current = setTimeout(() => {
      showWarning();
    }, warningTime);

    // Timer final de logout
    timeoutRef.current = setTimeout(() => {
      logoutDueToInactivity();
    }, timeout);
  }, [getInactivityTimeout, isAuthenticated, showWarning, logoutDueToInactivity]);

  // Manejar actividad del usuario
  const handleActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Solo reiniciar si ha pasado al menos 1 minuto desde la última actividad
    // Esto evita reiniciar el timer constantemente
    if (timeSinceLastActivity > 60000) {
      resetTimer();
    } else {
      lastActivityRef.current = now;
    }
  }, [resetTimer]);

  // Configurar event listeners para detectar actividad
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ];

    // Throttle para evitar demasiadas llamadas
    let throttleTimer = null;
    const throttledHandleActivity = () => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        handleActivity();
        throttleTimer = null;
      }, 1000); // Throttle de 1 segundo
    };

    // Agregar listeners
    events.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, true);
    });

    // Inicializar timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity, true);
      });
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
    };
  }, [isAuthenticated, handleActivity, resetTimer]);

  // Escuchar cambios en la configuración de inactividad
  useEffect(() => {
    const handleConfigChange = (_event) => {
      resetTimer();
    };

    window.addEventListener('inactivity-config-changed', handleConfigChange);

    return () => {
      window.removeEventListener('inactivity-config-changed', handleConfigChange);
    };
  }, [resetTimer]);

  // Limpiar al cambiar el estado de autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isAuthenticated]);

  return {
    resetTimer,
    getInactivityTimeout: () => getInactivityTimeout() / (1000 * 60), // retornar en minutos
    isActive: !!timerRef.current
  };
};

export default useInactivityTimer;