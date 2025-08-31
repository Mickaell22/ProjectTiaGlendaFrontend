// src/services/SesionTerapiaService.js
import { ApiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

class SesionTerapiaService {
  // ==================== CRUD OPERATIONS ====================
  
  /**
   * Get all therapy sessions
   */
  async getSesiones() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.BASE);
      return response.data;
    } catch (error) {
      console.error('Error fetching therapy sessions:', error);
      throw error;
    }
  }

  /**
   * Get therapy session by ID
   */
  async getSesionById(id) {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching therapy session ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new therapy session
   */
  async createSesion(sessionData) {
    try {
      const response = await ApiService.post(API_ENDPOINTS.SESIONES_TERAPIA.BASE, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating therapy session:', error);
      throw error;
    }
  }

  /**
   * Update therapy session
   */
  async updateSesion(id, sessionData) {
    try {
      const response = await ApiService.put(API_ENDPOINTS.SESIONES_TERAPIA.BY_ID(id), sessionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating therapy session ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete therapy session
   */
  async deleteSesion(id) {
    try {
      const response = await ApiService.delete(API_ENDPOINTS.SESIONES_TERAPIA.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error deleting therapy session ${id}:`, error);
      throw error;
    }
  }

  // ==================== SPECIALIZED OPERATIONS ====================

  /**
   * Get patients for a therapy session
   */
  async getPacientesSesion(sesionId) {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.PACIENTES(sesionId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching patients for session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Add patients to therapy session
   */
  async addPacientesToSesion(sesionId, pacientesIds) {
    try {
      const response = await ApiService.post(
        API_ENDPOINTS.SESIONES_TERAPIA.PACIENTES(sesionId),
        { pacientes_ids: pacientesIds }
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding patients to session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Remove patient from therapy session
   */
  async removePacienteFromSesion(sesionId, pacienteId) {
    try {
      const response = await ApiService.delete(
        `${API_ENDPOINTS.SESIONES_TERAPIA.PACIENTES(sesionId)}/${pacienteId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error removing patient ${pacienteId} from session ${sesionId}:`, error);
      throw error;
    }
  }

  // ==================== CRONOGRAMA OPERATIONS ====================

  /**
   * Get schedule for a therapy session
   */
  async getCronograma(sesionId) {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.CRONOGRAMA(sesionId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule for session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Generate schedule for a therapy session
   */
  async generarCronograma(sesionId, configData) {
    try {
      const response = await ApiService.post(
        API_ENDPOINTS.SESIONES_TERAPIA.GENERAR_CRONOGRAMA(sesionId),
        configData
      );
      return response.data;
    } catch (error) {
      console.error(`Error generating schedule for session ${sesionId}:`, error);
      throw error;
    }
  }

  // ==================== ATTENDANCE OPERATIONS ====================

  /**
   * Get attendance for a therapy session
   */
  async getAsistencias(sesionId) {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.ASISTENCIAS(sesionId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Register attendance for schedule and patient
   */
  async registrarAsistencia(cronogramaId, pacienteId, asistenciaData) {
    try {
      const response = await ApiService.post(
        API_ENDPOINTS.SESIONES_TERAPIA.REGISTRAR_ASISTENCIA(cronogramaId, pacienteId),
        asistenciaData
      );
      return response.data;
    } catch (error) {
      console.error(`Error registering attendance for patient ${pacienteId} in schedule ${cronogramaId}:`, error);
      throw error;
    }
  }

  /**
   * Get attendance for a specific schedule
   */
  async getAsistenciasCronograma(cronogramaId) {
    try {
      const response = await ApiService.get(
        API_ENDPOINTS.SESIONES_TERAPIA.ASISTENCIAS_CRONOGRAMA(cronogramaId)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for schedule ${cronogramaId}:`, error);
      throw error;
    }
  }

  /**
   * Get attendance history for a patient
   */
  async getAsistenciasPaciente(pacienteId) {
    try {
      const response = await ApiService.get(
        API_ENDPOINTS.SESIONES_TERAPIA.ASISTENCIAS_PACIENTE(pacienteId)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for patient ${pacienteId}:`, error);
      throw error;
    }
  }

  // ==================== QUERY OPERATIONS ====================

  /**
   * Get therapy sessions by therapist
   */
  async getSesionesByTerapeuta(terapeutaId) {
    try {
      const response = await ApiService.get(
        API_ENDPOINTS.SESIONES_TERAPIA.BY_TERAPEUTA(terapeutaId)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for therapist ${terapeutaId}:`, error);
      throw error;
    }
  }

  /**
   * Get today's therapy sessions
   */
  async getSesionesHoy() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.HOY);
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s therapy sessions:', error);
      throw error;
    }
  }

  /**
   * Get therapy sessions statistics
   */
  async getEstadisticas() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.ESTADISTICAS);
      return response.data;
    } catch (error) {
      console.error('Error fetching therapy sessions statistics:', error);
      throw error;
    }
  }

  /**
   * Get attendance statistics for a session
   */
  async getEstadisticasAsistencia(sesionId) {
    try {
      const response = await ApiService.get(
        API_ENDPOINTS.SESIONES_TERAPIA.ESTADISTICAS_ASISTENCIA(sesionId)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance statistics for session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Get available patients for therapy sessions
   */
  async getPacientesDisponibles() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.PACIENTES_DISPONIBLES);
      return response.data;
    } catch (error) {
      console.error('Error fetching available patients:', error);
      throw error;
    }
  }

  /**
   * Get available therapists for therapy sessions
   */
  async getTerapeutasDisponibles() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.TERAPEUTAS_DISPONIBLES);
      return response.data;
    } catch (error) {
      console.error('Error fetching available therapists:', error);
      throw error;
    }
  }

  // ==================== AUXILIARY DATA ====================

  /**
   * Get all therapeutic specialties
   */
  async getEspecialidades() {
    try {
      // Try to get therapeutic specialties first
      try {
        const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.TERAPEUTICAS);
        return response.data;
      } catch (specificError) {
        // If specific endpoint fails, try getting all specialties
        console.warn('Therapeutic specialties endpoint not available, fetching all specialties');
        const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.BASE);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching therapeutic specialties:', error);
      throw error;
    }
  }

  /**
   * Get all patients
   */
  async getPacientes() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.PACIENTES.BASE);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  /**
   * Get all personal (staff)
   */
  async getPersonal() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.PERSONAL.BASE);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  }

  /**
   * Handle API errors and return user-friendly messages
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
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
          return 'El recurso solicitado no fue encontrado.';
        case 409:
          return `Conflicto: ${message}`;
        case 500:
          return 'Error interno del servidor. Intenta nuevamente.';
        default:
          return `Error: ${message}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      return 'Error de conexión. Verifica tu conexión a internet.';
    } else {
      // Something else happened
      return `Error: ${error.message}`;
    }
  }
}

// Export a singleton instance
const sesionTerapiaService = new SesionTerapiaService();
export default sesionTerapiaService;