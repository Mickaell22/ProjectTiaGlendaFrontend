// src/services/SesionPedagogicaService.js
import { ApiService } from './apiService';
import { API_ENDPOINTS } from '../config/api';

class SesionPedagogicaService {
  // ==================== CRUD OPERATIONS ====================
  
  /**
   * Get all pedagogical sessions
   */
  async getSesiones() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.BASE);
      return response.data;
    } catch (error) {
      console.error('Error fetching pedagogical sessions:', error);
      throw error;
    }
  }

  /**
   * Get pedagogical session by ID
   */
  async getSesionById(id) {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching pedagogical session ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new pedagogical session
   */
  async createSesion(sessionData) {
    try {
      const response = await ApiService.post(API_ENDPOINTS.SESIONES_PEDAGOGICAS.BASE, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating pedagogical session:', error);
      throw error;
    }
  }

  /**
   * Update pedagogical session
   */
  async updateSesion(id, sessionData) {
    try {
      const response = await ApiService.put(API_ENDPOINTS.SESIONES_PEDAGOGICAS.BY_ID(id), sessionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating pedagogical session ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete pedagogical session
   */
  async deleteSesion(id) {
    try {
      const response = await ApiService.delete(API_ENDPOINTS.SESIONES_PEDAGOGICAS.BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error deleting pedagogical session ${id}:`, error);
      throw error;
    }
  }

  // ==================== SPECIALIZED OPERATIONS ====================

  /**
   * Get students for a pedagogical session
   */
  async getEstudiantesSesion(sesionId) {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTUDIANTES(sesionId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching students for session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Add student to pedagogical session
   */
  async addEstudianteToSesion(sesionId, estudianteData) {
    try {
      const response = await ApiService.post(
        API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTUDIANTES(sesionId),
        estudianteData
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding student to session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Remove student from pedagogical session
   */
  async removeEstudianteFromSesion(sesionId, pacienteId) {
    try {
      const response = await ApiService.delete(
        `${API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTUDIANTES(sesionId)}/${pacienteId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error removing student ${pacienteId} from session ${sesionId}:`, error);
      throw error;
    }
  }

  // ==================== CRONOGRAMA OPERATIONS ====================

  /**
   * Get schedule for a pedagogical session
   */
  async getCronograma(sesionId) {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.CRONOGRAMA(sesionId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule for session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Get general schedule for all pedagogical sessions with filters
   */
  async getCronogramaSesiones(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.especialidad) {
        params.append('especialidad', filtros.especialidad);
      }
      if (filtros.pedagogo) {
        params.append('pedagogo', filtros.pedagogo);
      }
      if (filtros.semana) {
        params.append('semana', filtros.semana);
      }
      
      const url = filtros && Object.keys(filtros).length > 0 
        ? `${API_ENDPOINTS.SESIONES_PEDAGOGICAS.CRONOGRAMA_GENERAL}?${params.toString()}`
        : API_ENDPOINTS.SESIONES_PEDAGOGICAS.CRONOGRAMA_GENERAL;
        
      const response = await ApiService.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions schedule:', error);
      throw error;
    }
  }

  // ==================== QUERY OPERATIONS ====================

  /**
   * Get pedagogical sessions by teacher/pedagogue
   */
  async getSesionesByPedagogo(pedagogoId) {
    try {
      const response = await ApiService.get(
        API_ENDPOINTS.SESIONES_PEDAGOGICAS.BY_PEDAGOGO(pedagogoId)
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for teacher ${pedagogoId}:`, error);
      throw error;
    }
  }

  /**
   * Get today's pedagogical sessions
   */
  async getSesionesHoy() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.HOY);
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s pedagogical sessions:', error);
      throw error;
    }
  }

  /**
   * Get pedagogical sessions statistics
   */
  async getEstadisticas() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTADISTICAS);
      return response.data;
    } catch (error) {
      console.error('Error fetching pedagogical sessions statistics:', error);
      throw error;
    }
  }

  /**
   * Get available students for pedagogical sessions
   */
  async getEstudiantesDisponibles() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTUDIANTES_DISPONIBLES);
      return response.data;
    } catch (error) {
      console.error('Error fetching available students:', error);
      throw error;
    }
  }

  /**
   * Get available teachers/pedagogues for pedagogical sessions
   */
  async getPedagogosDisponibles() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.PEDAGOGOS_DISPONIBLES);
      return response.data;
    } catch (error) {
      console.error('Error fetching available teachers:', error);
      throw error;
    }
  }

  // ==================== AUXILIARY DATA ====================

  /**
   * Get all pedagogical specialties
   */
  async getEspecialidades() {
    try {
      // Try to get pedagogical specialties first
      try {
        const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.PEDAGOGICAS);
        return response.data;
      } catch (specificError) {
        // If specific endpoint fails, try getting all specialties
        console.warn('Pedagogical specialties endpoint not available, fetching all specialties');
        const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.BASE);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching pedagogical specialties:', error);
      throw error;
    }
  }

  /**
   * Get all patients (students)
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
const sesionPedagogicaService = new SesionPedagogicaService();
export default sesionPedagogicaService;