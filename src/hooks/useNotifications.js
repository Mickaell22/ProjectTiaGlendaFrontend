// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';

const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Solicitar permisos de notificación
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  // Reproducir sonido de notificación
  const playNotificationSound = useCallback(() => {
    if (!audioEnabled) return;

    try {
      // Crear un AudioContext si no existe
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Generar un sonido simple usando osciladores
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar el sonido (tono agradable)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      // Configurar volumen con fade out
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      // Reproducir
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      // Limpiar después de reproducir
      setTimeout(() => {
        try {
          audioContext.close();
        } catch (e) {
          // Ignorar errores de cleanup
        }
      }, 500);
    } catch (error) {
      // Fallback: intentar reproducir un beep simple
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcCTuF1ero6wgUaZXp86xYFApCm9zyx2QdCDl+ztmOOgkTWK3n7qxdFAg');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Si falla, no hacer nada
        });
      } catch (e) {
        // Silenciar errores
      }
    }
  }, [audioEnabled]);

  // Mostrar notificación visual
  const showNotification = useCallback((title, options = {}) => {
    if (permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      } catch (error) {
        console.warn('Error showing notification:', error);
      }
    }
    return null;
  }, [permission]);

  // Notificación completa (sonido + visual)
  const notify = useCallback((title, message, options = {}) => {
    // Reproducir sonido
    playNotificationSound();

    // Mostrar notificación visual
    return showNotification(title, {
      body: message,
      tag: 'chat-message',
      requireInteraction: false,
      ...options,
    });
  }, [playNotificationSound, showNotification]);

  // Inicializar permisos al montar
  useEffect(() => {
    if (permission === 'default') {
      // No solicitar automáticamente, esperar a que el usuario interactúe
      console.log('Notifications: Permission not granted yet');
    }
  }, [permission]);

  return {
    permission,
    audioEnabled,
    setAudioEnabled,
    requestPermission,
    playNotificationSound,
    showNotification,
    notify,
    canNotify: permission === 'granted',
  };
};

export default useNotifications;