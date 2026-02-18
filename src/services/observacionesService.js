// src/services/observacionesService.js
import { ApiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

class ObservacionesService {
  /**
   * Obtener observaciones de una sesion especifica
   * @param {number} idSesion
   * @param {string} tipoSesion - 'terapeutica' | 'pedagogica'
   * @param {boolean} incluirPrivadas - solo admins
   */
  async getObservacionesSesion(idSesion, tipoSesion, incluirPrivadas = false) {
    const params = incluirPrivadas ? { incluir_privadas: true } : {};
    const response = await ApiService.get(
      API_ENDPOINTS.OBSERVACIONES.BY_SESION(idSesion, tipoSesion),
      { params }
    );
    return response.data;
  }

  /**
   * Obtener una observacion por ID
   */
  async getObservacion(idObservacion) {
    const response = await ApiService.get(API_ENDPOINTS.OBSERVACIONES.BY_ID(idObservacion));
    return response.data;
  }

  /**
   * Crear nueva observacion
   * @param {object} data - { id_sesion, tipo_sesion, observacion, tipo_observacion?, es_privada?, es_critica?, requiere_seguimiento?, fecha_seguimiento?, id_usuario_seguimiento?, id_cronograma? }
   */
  async createObservacion(data) {
    const response = await ApiService.post(API_ENDPOINTS.OBSERVACIONES.BASE, data);
    return response.data;
  }

  /**
   * Actualizar observacion existente
   * @param {number} idObservacion
   * @param {object} data - { observacion?, tipo_observacion?, es_privada?, es_critica?, requiere_seguimiento?, fecha_seguimiento?, id_usuario_seguimiento?, estado_seguimiento? }
   */
  async updateObservacion(idObservacion, data) {
    const response = await ApiService.put(API_ENDPOINTS.OBSERVACIONES.BY_ID(idObservacion), data);
    return response.data;
  }

  /**
   * Eliminar observacion (hard delete)
   */
  async deleteObservacion(idObservacion) {
    const response = await ApiService.delete(API_ENDPOINTS.OBSERVACIONES.BY_ID(idObservacion));
    return response.data;
  }

  /**
   * Obtener catalogo de tipos de observacion y estados de seguimiento
   */
  async getTipos() {
    const response = await ApiService.get(API_ENDPOINTS.OBSERVACIONES.TIPOS);
    return response.data;
  }

  /**
   * Manejo de errores con mensajes amigables
   */
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Error en el servidor';
      switch (status) {
        case 400:
          return `Datos inválidos: ${message}`;
        case 401:
          return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        case 403:
          return 'No tienes permisos para realizar esta acción.';
        case 404:
          return 'La observación no fue encontrada.';
        case 409:
          return `Conflicto: ${message}`;
        case 500:
          return 'Error interno del servidor. Intenta nuevamente.';
        default:
          return `Error: ${message}`;
      }
    } else if (error.request) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    } else {
      return error.message || 'Error inesperado.';
    }
  }
}

const observacionesService = new ObservacionesService();
export default observacionesService;
