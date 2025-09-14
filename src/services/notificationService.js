// src/services/notificationService.js
import { apiClient } from './apiConfig';

class NotificationService {
  constructor() {
    this.baseURL = '/api/notificaciones';
    this.pollingInterval = null;
    this.lastNotificationCount = 0;
    this.callbacks = {
      onNewNotification: [],
      onCountUpdate: [],
    };
  }

  /**
   * Obtener notificaciones del usuario actual
   * @param {boolean} incluirLeidas - Incluir notificaciones ya leídas (default: false)
   * @param {number} limite - Límite de notificaciones a obtener (default: 50)
   */
  async getNotificaciones(incluirLeidas = false, limite = 50) {
    try {
      const response = await apiClient.get(
        `${this.baseURL}?incluir_leidas=${incluirLeidas}&limite=${limite}`
      );
      return {
        success: true,
        data: response.data,
        notificaciones: response.data.notificaciones || [],
        total: response.data.total || 0,
      };
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener notificaciones',
        notificaciones: [],
        total: 0,
      };
    }
  }

  /**
   * Marcar una notificación como leída
   * @param {number} idNotificacion - ID de la notificación
   */
  async marcarComoLeida(idNotificacion) {
    try {
      const response = await apiClient.put(`${this.baseURL}/${idNotificacion}/leer`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al marcar notificación como leída',
      };
    }
  }

  /**
   * Obtener estadísticas de notificaciones del usuario
   */
  async getEstadisticas() {
    try {
      const response = await apiClient.get(`${this.baseURL}/estadisticas`);
      return {
        success: true,
        data: response.data,
        estadisticas: response.data.estadisticas || {},
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de notificaciones:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas',
        estadisticas: {},
      };
    }
  }

  /**
   * Obtener solo el conteo de notificaciones no leídas
   */
  async getUnreadCount() {
    try {
      const result = await this.getNotificaciones(false, 1);
      return {
        success: result.success,
        count: result.total || 0,
      };
    } catch (error) {
      console.error('Error obteniendo conteo de notificaciones:', error);
      return {
        success: false,
        count: 0,
      };
    }
  }

  // ============================================
  // POLLING Y NOTIFICACIONES EN TIEMPO REAL
  // ============================================

  /**
   * Iniciar polling de notificaciones
   * @param {number} intervalMs - Intervalo en milisegundos (default: 30000 = 30s)
   */
  startPolling(intervalMs = 30000) {
    this.stopPolling(); // Detener polling anterior si existe

    this.pollingInterval = setInterval(async () => {
      try {
        const result = await this.getUnreadCount();
        if (result.success) {
          const newCount = result.count;
          
          // Si hay más notificaciones que antes, disparar callback
          if (newCount > this.lastNotificationCount) {
            this.callbacks.onNewNotification.forEach(callback => {
              callback(newCount - this.lastNotificationCount);
            });
          }

          // Siempre actualizar el conteo
          this.callbacks.onCountUpdate.forEach(callback => {
            callback(newCount);
          });

          this.lastNotificationCount = newCount;
        }
      } catch (error) {
        console.error('Error en polling de notificaciones:', error);
      }
    }, intervalMs);
  }

  /**
   * Detener polling de notificaciones
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Registrar callback para nuevas notificaciones
   * @param {Function} callback - Función a ejecutar cuando lleguen nuevas notificaciones
   */
  onNewNotification(callback) {
    this.callbacks.onNewNotification.push(callback);
    return () => {
      this.callbacks.onNewNotification = this.callbacks.onNewNotification.filter(
        cb => cb !== callback
      );
    };
  }

  /**
   * Registrar callback para actualización de conteo
   * @param {Function} callback - Función a ejecutar cuando se actualice el conteo
   */
  onCountUpdate(callback) {
    this.callbacks.onCountUpdate.push(callback);
    return () => {
      this.callbacks.onCountUpdate = this.callbacks.onCountUpdate.filter(
        cb => cb !== callback
      );
    };
  }

  // ============================================
  // NOTIFICACIONES DEL NAVEGADOR
  // ============================================

  /**
   * Solicitar permiso para mostrar notificaciones del navegador
   */
  async requestBrowserPermission() {
    if (!('Notification' in window)) {
      return 'not-supported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Mostrar notificación del navegador
   * @param {string} title - Título de la notificación
   * @param {string} message - Mensaje de la notificación
   * @param {Object} options - Opciones adicionales
   */
  showBrowserNotification(title, message, options = {}) {
    if (Notification.permission === 'granted') {
      const defaultOptions = {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'tia-glenda-notification',
        requireInteraction: false,
        ...options,
      };

      const notification = new Notification(title, defaultOptions);

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
    return null;
  }

  /**
   * Configurar notificaciones automáticas del navegador
   */
  enableBrowserNotifications() {
    this.onNewNotification((newCount) => {
      const title = 'Centro Tía Glenda';
      const message = newCount === 1 
        ? 'Tienes 1 nueva notificación'
        : `Tienes ${newCount} nuevas notificaciones`;
      
      this.showBrowserNotification(title, message);
    });
  }

  // ============================================
  // CONFIGURACIÓN DE NOTIFICACIONES
  // ============================================

  /**
   * Obtener configuración de notificaciones del usuario
   */
  async getConfiguracion() {
    try {
      const response = await apiClient.get('/api/configuracion/notificaciones/usuario');
      return {
        success: true,
        data: response.data,
        configuracion: response.data.configuracion || {},
      };
    } catch (error) {
      console.error('Error obteniendo configuración de notificaciones:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener configuración',
        configuracion: {},
      };
    }
  }

  /**
   * Actualizar configuración de notificaciones del usuario
   * @param {Object} configuracion - Nueva configuración
   */
  async updateConfiguracion(configuracion) {
    try {
      const response = await apiClient.put('/api/configuracion/notificaciones/usuario', configuracion);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error actualizando configuración de notificaciones:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar configuración',
      };
    }
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Limpiar recursos (detener polling, etc.)
   */
  cleanup() {
    this.stopPolling();
    this.callbacks.onNewNotification = [];
    this.callbacks.onCountUpdate = [];
  }
}

// Exportar instancia singleton
export default new NotificationService();