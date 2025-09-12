// src/services/configuracionService.js
// Servicio para gestionar configuraciones del sistema

import { ApiService } from './apiService.js';

const ENDPOINTS = {
  GENERAL: '/api/configuracion/general',
  SESIONES: '/api/configuracion/sesiones',
  NOTIFICACIONES_GLOBAL: '/api/configuracion/notificaciones/global',
  NOTIFICACIONES_USUARIO: '/api/configuracion/notificaciones/usuario',
  SEGURIDAD: '/api/configuracion/seguridad',
  RESUMEN: '/api/configuracion/resumen',
  INICIALIZAR: '/api/configuracion/inicializar'
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
      const response = await ApiService.put(ENDPOINTS.GENERAL, configuracion);
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
  // CONFIGURACIÓN DE SESIONES
  // ============================================
  
  /**
   * Obtener configuración de sesiones
   */
  static async getConfiguracionSesiones() {
    try {
      const response = await ApiService.get(ENDPOINTS.SESIONES);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al obtener configuración de sesiones:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuración de sesiones',
        error
      };
    }
  }

  /**
   * Actualizar configuración de sesiones
   */
  static async updateConfiguracionSesiones(configuracion) {
    try {
      const response = await ApiService.put(ENDPOINTS.SESIONES, configuracion);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al actualizar configuración de sesiones:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar configuración de sesiones',
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
  // CONFIGURACIÓN DE SEGURIDAD
  // ============================================
  
  /**
   * Obtener configuración de seguridad (solo admin)
   */
  static async getConfiguracionSeguridad() {
    try {
      const response = await ApiService.get(ENDPOINTS.SEGURIDAD);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al obtener configuración de seguridad:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuración de seguridad',
        error
      };
    }
  }

  /**
   * Actualizar configuración de seguridad (solo admin)
   */
  static async updateConfiguracionSeguridad(configuracion) {
    try {
      const response = await ApiService.put(ENDPOINTS.SEGURIDAD, configuracion);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al actualizar configuración de seguridad:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar configuración de seguridad',
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

  /**
   * Inicializar sistema de configuración (solo admin)
   */
  static async inicializarSistemaConfiguracion() {
    try {
      const response = await ApiService.post(ENDPOINTS.INICIALIZAR);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error al inicializar sistema de configuración:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al inicializar sistema de configuración',
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
      logoUrl: backendData.logo_url || '',
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
      logo_url: frontendData.logoUrl,
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

  /**
   * Mapear datos del backend al formato del frontend para configuración de sesiones
   */
  static mapSesionesConfigToFrontend(backendData) {
    if (!backendData) return {};
    
    return {
      duracionSesionTerapia: backendData.duracion_sesion_terapia || 60,
      duracionClasePedagogica: backendData.duracion_clase_pedagogica || 45,
      toleranciaLlegadaTarde: backendData.tolerancia_llegada_tarde || 15,
      tiempoRecordatorio: backendData.tiempo_recordatorio || 15,
      permitirCancelacionHoras: backendData.permitir_cancelacion_horas || 24,
      permitirReprogramacionHoras: backendData.permitir_reprogramacion_horas || 24,
      capacidadMaximaClase: backendData.capacidad_maxima_clase || 12,
      sistemaCalificaciones: backendData.sistema_calificaciones || 'numerico',
      escalaCalificacionMin: backendData.escala_calificacion_min || 1,
      escalaCalificacionMax: backendData.escala_calificacion_max || 10
    };
  }

  /**
   * Mapear datos del frontend al formato del backend para configuración de sesiones
   */
  static mapSesionesConfigToBackend(frontendData) {
    return {
      duracion_sesion_terapia: frontendData.duracionSesionTerapia,
      duracion_clase_pedagogica: frontendData.duracionClasePedagogica,
      tolerancia_llegada_tarde: frontendData.toleranciaLlegadaTarde,
      tiempo_recordatorio: frontendData.tiempoRecordatorio,
      permitir_cancelacion_horas: frontendData.permitirCancelacionHoras,
      permitir_reprogramacion_horas: frontendData.permitirReprogramacionHoras,
      capacidad_maxima_clase: frontendData.capacidadMaximaClase,
      sistema_calificaciones: frontendData.sistemaCalificaciones,
      escala_calificacion_min: frontendData.escalaCalificacionMin,
      escala_calificacion_max: frontendData.escalaCalificacionMax
    };
  }
}

export default ConfiguracionService;