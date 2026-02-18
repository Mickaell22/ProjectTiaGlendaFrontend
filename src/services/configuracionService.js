// src/services/configuracionService.js
// Servicio para gestionar configuraciones del sistema

import { ApiService } from './apiService.js';

const ENDPOINTS = {
  GENERAL: '/api/configuracion/general',
  NOTIFICACIONES: '/api/configuracion/notificaciones',
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
   * Obtener configuración de notificaciones (requiere token)
   */
  static async getConfiguracionNotificaciones() {
    try {
      const response = await ApiService.get(ENDPOINTS.NOTIFICACIONES);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al obtener configuración de notificaciones:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuración de notificaciones',
        error
      };
    }
  }

  /**
   * Actualizar configuración de notificaciones (requiere admin)
   */
  static async updateConfiguracionNotificaciones(configuracion) {
    try {
      const response = await ApiService.put(ENDPOINTS.NOTIFICACIONES, configuracion);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al actualizar configuración de notificaciones:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar configuración de notificaciones',
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
      codigo: backendData.codigo || '',
      direccion: backendData.direccion || '',
      telefono: backendData.telefono || '',
      email: backendData.email || '',
      horarioInicio: backendData.horario_apertura || '',
      horarioFin: backendData.horario_cierre || '',
      turnoPrincipal: backendData.turno_principal || '',
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
      horario_apertura: frontendData.horarioInicio,
      horario_cierre: frontendData.horarioFin,
      turno_principal: frontendData.turnoPrincipal,
      descripcion: frontendData.descripcion
    };
  }

}

export default ConfiguracionService;
