// src/services/SesionTerapiaService.js
import { ApiService } from './apiService';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';

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
      throw error;
    }
  }

  /**
   * Add patients to therapy session (plural - for multiple patients)
   */
  async addPacientesToSesion(sesionId, pacientesIds) {
    try {
      const response = await ApiService.post(
        API_ENDPOINTS.SESIONES_TERAPIA.PACIENTES(sesionId),
        { pacientes_ids: pacientesIds }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add single patient to therapy session (singular - for single patient)
   */
  async addPacienteToSesion(sesionId, patientData) {
    try {
      const response = await ApiService.post(
        API_ENDPOINTS.SESIONES_TERAPIA.PACIENTES(sesionId),
        patientData
      );
      return response.data;
    } catch (error) {
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
      throw error;
    }
  }

  /**
   * Get retired patients from therapy session
   */
  async getPacientesRetirados(sesionId) {
    try {
      const response = await ApiService.get(
        API_ENDPOINTS.SESIONES_TERAPIA.PACIENTES_RETIRADOS(sesionId)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching retired patients from session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Reincorporate a retired patient to therapy session
   */
  async reincorporarPaciente(sesionId, pacienteId) {
    try {
      const response = await ApiService.put(
        API_ENDPOINTS.SESIONES_TERAPIA.REINCORPORAR_PACIENTE(sesionId, pacienteId)
      );
      return response.data;
    } catch (error) {
      console.error(`Error reincorporating patient ${pacienteId} to session ${sesionId}:`, error);
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
      throw error;
    }
  }

  /**
   * Mark a cronograma session as completed
   */
  async marcarSesionRealizada(cronogramaId, observaciones) {
    try {
      const response = await ApiService.put(
        `/api/sesiones-terapia/cronograma/${cronogramaId}/realizar`,
        { observaciones }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reschedule a cronograma session
   */
  async reprogramarSesion(cronogramaId, reprogramData) {
    try {
      const response = await ApiService.put(
        `/api/sesiones-terapia/cronograma/${cronogramaId}/reprogramar`,
        reprogramData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel a cronograma session
   */
  async cancelarSesionCronograma(cronogramaId, motivoCancelacion) {
    try {
      const response = await ApiService.put(
        `/api/sesiones-terapia/cronograma/${cronogramaId}/cancelar`,
        { motivo_cancelacion: motivoCancelacion }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Manually finalize a therapy session
   */
  async finalizarSesion(sesionId) {
    try {
      const response = await ApiService.put(
        `/api/sesiones-terapia/${sesionId}/finalizar`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel a therapy session
   */
  async cancelarSesion(sesionId) {
    try {
      const response = await ApiService.put(
        `/api/sesiones-terapia/${sesionId}/cancelar`
      );
      return response.data;
    } catch (error) {
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
      throw error;
    }
  }

  /**
   * Alias for getAsistencias (for backward compatibility)
   */
  async getAsistenciasSession(sesionId) {
    return this.getAsistencias(sesionId);
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
      throw error;
    }
  }

  /**
   * Update existing attendance for schedule and patient
   */
  async updateAsistencia(cronogramaId, pacienteId, asistenciaData) {
    try {
      const response = await ApiService.put(
        API_ENDPOINTS.SESIONES_TERAPIA.REGISTRAR_ASISTENCIA(cronogramaId, pacienteId),
        asistenciaData
      );
      return response.data;
    } catch (error) {
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
      throw error;
    }
  }

  /**
   * Get attendance control for a specific cronograma
   */
  async getAsistencia(cronogramaId) {
    try {
      const response = await ApiService.get(
        `/api/sesiones-terapia/cronograma/${cronogramaId}/control-asistencia`
      );
      return response.data;
    } catch (error) {
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
      throw error;
    }
  }

  // ==================== AUXILIARY DATA ====================

  /**
   * Get all therapeutic specialties
   */
  async getEspecialidades() {
    try {
      // Fetch all specialties and filter on frontend to avoid URL encoding issues
      const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.BASE);
      const allEspecialidades = response.data?.data || response.data || [];

      // Filter therapeutic specialties
      const terapeuticas = allEspecialidades.filter(esp =>
        esp.area === 'Especialidad terapeutica' ||
        esp.area === 'Especialidad terapeutica'
      );

      return { data: terapeuticas };
    } catch (error) {
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
      throw error;
    }
  }

  /**
   * Get therapeutic specialties, optionally filtered by center
   */
  async getEspecialidades(centroId = null) {
    try {
      // Construir URL con filtro de centro si se proporciona
      const url = centroId
        ? `${API_ENDPOINTS.ESPECIALIDADES.BASE}?centro=${centroId}`
        : API_ENDPOINTS.ESPECIALIDADES.BASE;

      const response = await ApiService.get(url);
      const allEspecialidades = response.data?.data || response.data || [];

      // Filtrar especialidades terapéuticas
      const terapeuticas = allEspecialidades.filter(esp =>
        esp.area === 'Especialidad terapeutica' ||
        esp.area === 'terapeutica' ||
        esp.area?.toLowerCase().includes('terap')
      );

      return { data: terapeuticas };
    } catch (error) {
      console.error('Error fetching therapeutic specialties:', error);
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
      throw error;
    }
  }

  // ==================== PUBLIC LINKS MANAGEMENT ====================

  /**
   * Generate public link for a therapy session
   */
  async generatePublicLink(sessionId, linkData) {
    try {
      const response = await ApiService.post(
        API_ENDPOINTS.SESIONES_TERAPIA.GENERAR_ENLACE_PUBLICO(sessionId),
        linkData
      );
      // Extract the actual data from the response
      return response.data?.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all public links for a therapy session
   */
  async getPublicLinks(sessionId) {
    try {
      const response = await ApiService.get(
        API_ENDPOINTS.SESIONES_TERAPIA.ENLACES_PUBLICOS(sessionId)
      );
      // Extract the actual data from the response
      return response.data?.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invalidate a public link (requires authentication)
   */
  async invalidatePublicLink(token) {
    try {
      const response = await ApiService.delete(
        API_ENDPOINTS.SESIONES_TERAPIA.INVALIDAR_ENLACE_PUBLICO(token)
      );
      // Extract the actual data from the response
      return response.data?.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * View public session information (no authentication required)
   */
  async viewPublicSession(token) {
    try {
      // Use API configuration for backend URL
      const fullUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.SESIONES_TERAPIA.SESION_PUBLICA(token)}`;
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener información de la sesión');
      }

      return await response.json();
    } catch (error) {
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