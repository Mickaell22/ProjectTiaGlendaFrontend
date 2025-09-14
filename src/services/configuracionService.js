// src/services/configuracionService.js
// Servicio para gestionar configuraciones del sistema

import { ApiService } from './apiService.js';

const ENDPOINTS = {
  GENERAL: '/api/configuracion/general',
  NOTIFICACIONES_GLOBAL: '/api/configuracion/notificaciones/global',
  NOTIFICACIONES_USUARIO: '/api/configuracion/notificaciones/usuario',
  RESUMEN: '/api/configuracion/resumen'
};

class ConfiguracionService {
  
  // ============================================
  // CONFIGURACIÓN GENERAL
  // ============================================
  
  /**
   * Obtener configuración general del sistema
   */
  static async getConfiguracionGeneral() {
    try {
      const response = await ApiService.get(ENDPOINTS.GENERAL);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al obtener configuración general:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuración general',
        error
      };
    }
  }

  /**
   * Actualizar configuración general del sistema
   */
  static async updateConfiguracionGeneral(configuracion) {
    try {
      
      // Mapear datos del frontend al formato del backend
      const backendData = ConfiguracionService.mapGeneralConfigToBackend(configuracion);
      
      const response = await ApiService.put(ENDPOINTS.GENERAL, backendData);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al actualizar configuración general:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar configuración general',
        error
      };
    }
  }


  // ============================================
  // CONFIGURACIÓN DE NOTIFICACIONES
  // ============================================
  
  /**
   * Obtener configuración global de notificaciones (solo admin)
   */
  static async getConfiguracionNotificacionesGlobal() {
    try {
      const response = await ApiService.get(ENDPOINTS.NOTIFICACIONES_GLOBAL);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al obtener configuración de notificaciones globales:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuración de notificaciones globales',
        error
      };
    }
  }

  /**
   * Actualizar configuración global de notificaciones (solo admin)
   */
  static async updateConfiguracionNotificacionesGlobal(configuracion) {
    try {
      const response = await ApiService.put(ENDPOINTS.NOTIFICACIONES_GLOBAL, configuracion);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al actualizar configuración de notificaciones globales:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar configuración de notificaciones globales',
        error
      };
    }
  }

  /**
   * Obtener configuración de notificaciones del usuario actual
   */
  static async getConfiguracionNotificacionesUsuario() {
    try {
      const response = await ApiService.get(ENDPOINTS.NOTIFICACIONES_USUARIO);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al obtener configuración de notificaciones de usuario:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuración de notificaciones de usuario',
        error
      };
    }
  }

  /**
   * Actualizar configuración de notificaciones del usuario actual
   */
  static async updateConfiguracionNotificacionesUsuario(configuracion) {
    try {
      const response = await ApiService.put(ENDPOINTS.NOTIFICACIONES_USUARIO, configuracion);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al actualizar configuración de notificaciones de usuario:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar configuración de notificaciones de usuario',
        error
      };
    }
  }

  /**
   * Obtener configuración de notificaciones de un usuario específico (solo admin)
   */
  static async getConfiguracionNotificacionesUsuarioEspecifico(userId) {
    try {
      const response = await ApiService.get(`${ENDPOINTS.NOTIFICACIONES_USUARIO}/${userId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al obtener configuración de notificaciones de usuario específico:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuración de notificaciones de usuario específico',
        error
      };
    }
  }

  /**
   * Actualizar configuración de notificaciones de un usuario específico (solo admin)
   */
  static async updateConfiguracionNotificacionesUsuarioEspecifico(userId, configuracion) {
    try {
      const response = await ApiService.put(`${ENDPOINTS.NOTIFICACIONES_USUARIO}/${userId}`, configuracion);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al actualizar configuración de notificaciones de usuario específico:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar configuración de notificaciones de usuario específico',
        error
      };
    }
  }


  // ============================================
  // UTILIDADES Y ADMINISTRACIÓN
  // ============================================
  
  /**
   * Obtener resumen de todas las configuraciones
   */
  static async getResumenConfiguracion() {
    try {
      const response = await ApiService.get(ENDPOINTS.RESUMEN);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al obtener resumen de configuración:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener resumen de configuración',
        error
      };
    }
  }


  // ============================================
  // MÉTODOS DE UTILIDAD
  // ============================================

  /**
   * Mapear datos del backend al formato del frontend para configuración general
   */
  static mapGeneralConfigToFrontend(backendData) {
    if (!backendData) return {};
    
    return {
      nombreCentro: backendData.nombre_centro || '',
      direccion: backendData.direccion || '',
      telefono: backendData.telefono || '',
      email: backendData.email || '',
      horarioInicio: backendData.horario_inicio || '',
      horarioFin: backendData.horario_fin || '',
      zonaHoraria: backendData.zona_horaria || 'America/Guayaquil',
      formatoFecha: backendData.formato_fecha || 'DD/MM/YYYY',
      formatoHora: backendData.formato_hora || '24h',
      moneda: backendData.moneda || 'USD',
      idioma: backendData.idioma || 'es',
      descripcion: backendData.descripcion || ''
    };
  }

  /**
   * Mapear datos del frontend al formato del backend para configuración general
   */
  static mapGeneralConfigToBackend(frontendData) {
    return {
      nombre_centro: frontendData.nombreCentro,
      direccion: frontendData.direccion,
      telefono: frontendData.telefono,
      email: frontendData.email,
      logo_url: null, // Simplificado - sin logo por ahora
      horario_inicio: frontendData.horarioInicio,
      horario_fin: frontendData.horarioFin,
      zona_horaria: frontendData.zonaHoraria,
      formato_fecha: frontendData.formatoFecha,
      formato_hora: frontendData.formatoHora,
      moneda: frontendData.moneda,
      idioma: frontendData.idioma,
      descripcion: frontendData.descripcion
    };
  }

}

export default ConfiguracionService;