// src/services/SesionTerapiaService.js
import axios from 'axios';

// Base URL for the API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SesionTerapiaService {
  constructor() {
    // Create axios instance with base configuration
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });

    // Add request interceptor to include auth headers
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['Content-Type'] = 'application/json';
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('jwt_token');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== CRUD OPERATIONS ====================
  
  /**
   * Get all therapy sessions
   */
  async getSesiones() {
    try {
      const response = await this.api.get('/api/sesiones-terapia');
      return response.data;
    } catch (error) {
      console.error('Error fetching sesiones:', error);
      throw error;
    }
  }

  /**
   * Get therapy session by ID
   */
  async getSesionById(id) {
    try {
      const response = await this.api.get(`/api/sesiones-terapia/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sesion ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new therapy session
   */
  async createSesion(sessionData) {
    try {
      const response = await this.api.post('/api/sesiones-terapia', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating sesion:', error);
      throw error;
    }
  }

  /**
   * Update therapy session
   */
  async updateSesion(id, sessionData) {
    try {
      const response = await this.api.put(`/api/sesiones-terapia/${id}`, sessionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating sesion ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete therapy session (soft delete - change status to cancelled)
   */
  async deleteSesion(id) {
    try {
      const response = await this.api.delete(`/api/sesiones-terapia/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting sesion ${id}:`, error);
      throw error;
    }
  }

  // ==================== CRONOGRAMA OPERATIONS ====================

  /**
   * Get cronograma for a specific session
   */
  async getCronograma(sessionId) {
    try {
      const response = await this.api.get(`/api/sesiones-terapia/${sessionId}/cronograma`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cronograma for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Generate cronograma for a session
   */
  async generarCronograma(sessionId) {
    try {
      const response = await this.api.post(`/api/sesiones-terapia/${sessionId}/cronograma/generar`);
      return response.data;
    } catch (error) {
      console.error(`Error generating cronograma for session ${sessionId}:`, error);
      throw error;
    }
  }

  // ==================== PATIENT OPERATIONS ====================

  /**
   * Get patients assigned to a session
   */
  async getPacientesSesion(sessionId) {
    try {
      const response = await this.api.get(`/api/sesiones-terapia/${sessionId}/pacientes`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patients for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Add patient to session
   */
  async addPacienteToSesion(sessionId, patientData) {
    try {
      const response = await this.api.post(`/api/sesiones-terapia/${sessionId}/pacientes`, patientData);
      return response.data;
    } catch (error) {
      console.error(`Error adding patient to session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Remove patient from session
   */
  async removePacienteFromSesion(sessionId, patientId) {
    try {
      const response = await this.api.delete(`/api/sesiones-terapia/${sessionId}/pacientes/${patientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing patient ${patientId} from session ${sessionId}:`, error);
      throw error;
    }
  }

  // ==================== ATTENDANCE OPERATIONS ====================

  /**
   * Get attendance for a specific cronograma session
   */
  async getAsistencia(cronogramaId) {
    try {
      console.log('Getting asistencias for cronograma:', cronogramaId);
      
      // Use the actual backend endpoint that exists
      const response = await this.api.get(`/api/sesiones-terapia/cronograma/${cronogramaId}/asistencia`);
      console.log('Cronograma asistencias received:', response.data);
      
      // Ensure we always return data in the expected format
      return {
        data: response.data?.data || response.data || [],
        message: response.data?.message || 'Asistencias obtenidas exitosamente',
        status: response.data?.status || 'success'
      };
      
    } catch (error) {
      console.error(`Error fetching attendance for cronograma ${cronogramaId}:`, error);
      
      // Try alternative endpoint format if main fails
      try {
        console.log('Trying alternative endpoint for cronograma:', cronogramaId);
        const altResponse = await this.api.get(`/api/cronograma-sesiones/${cronogramaId}/asistencias`);
        console.log('Alternative endpoint success:', altResponse.data);
        return {
          data: altResponse.data?.data || altResponse.data || [],
          message: 'Asistencias obtenidas (endpoint alternativo)',
          status: 'success'
        };
      } catch (altError) {
        console.error('Alternative endpoint also failed:', altError);
        return { 
          data: [], 
          message: 'No se pudieron cargar las asistencias',
          status: 'error'
        };
      }
    }
  }

  /**
   * Register attendance for a patient in a specific session
   */
  async registrarAsistencia(cronogramaId, patientId, attendanceData) {
    console.log('Registering attendance:', { cronogramaId, patientId, attendanceData });
    
    // Use the actual backend endpoints that exist
    const endpointsToTry = [
      // Main endpoint from backend routes
      {
        url: `/api/sesiones-terapia/cronograma/${cronogramaId}/pacientes/${patientId}/asistencia`,
        data: attendanceData
      },
      // Alternative endpoint format if the first fails
      {
        url: `/api/cronograma-sesiones/${cronogramaId}/asistencias/${patientId}`,
        data: attendanceData
      }
    ];
    
    for (let i = 0; i < endpointsToTry.length; i++) {
      const attempt = endpointsToTry[i];
      try {
        console.log(`Trying endpoint ${i + 1}:`, attempt.url, 'with data:', attempt.data);
        const response = await this.api.post(attempt.url, attempt.data);
        console.log('Attendance registration success:', response.data);
        return response.data;
      } catch (error) {
        console.error(`Endpoint ${i + 1} failed (${attempt.url}):`, error.response?.status, error.response?.data?.message || error.message);
        
        // If this is the last attempt, throw the error
        if (i === endpointsToTry.length - 1) {
          throw error;
        }
      }
    }
  }

  /**
   * Update attendance for a patient in a specific session
   */
  async updateAsistencia(cronogramaId, patientId, attendanceData) {
    try {
      // Use the actual PUT endpoint from backend routes
      const response = await this.api.put(
        `/api/sesiones-terapia/cronograma/${cronogramaId}/pacientes/${patientId}/asistencia`,
        attendanceData
      );
      console.log('Attendance update success:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating attendance for patient ${patientId}:`, error);
      throw error;
    }
  }

  /**
   * Get attendance for all sessions of a patient
   */
  async getAsistenciaPaciente(patientId) {
    try {
      const response = await this.api.get(`/api/sesiones-terapia/asistencias/paciente/${patientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for patient ${patientId}:`, error);
      throw error;
    }
  }

  /**
   * Get all asistencias for a session
   */
  async getAsistenciasSession(sessionId) {
    try {
      console.log('Getting asistencias for session:', sessionId);
      const response = await this.api.get(`/api/sesiones-terapia/${sessionId}/asistencias`);
      console.log('Session asistencias received:', response.data);
      
      // Ensure we always return data in the expected format
      return {
        data: response.data?.data || response.data || [],
        message: response.data?.message || 'Asistencias de sesión obtenidas exitosamente',
        status: response.data?.status || 'success'
      };
    } catch (error) {
      console.error(`Error fetching asistencias for session ${sessionId}:`, error);
      
      // Return empty array instead of throwing to avoid breaking the UI
      return { 
        data: [], 
        message: `No se pudieron cargar las asistencias de la sesión ${sessionId}`,
        status: 'error'
      };
    }
  }

  /**
   * Get attendance statistics for a session
   */
  async getEstadisticasAsistencia(sessionId) {
    try {
      const response = await this.api.get(`/api/sesiones-terapia/${sessionId}/estadisticas-asistencia`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance statistics for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Reschedule a specific cronograma session
   */
  async reprogramarSesion(cronogramaId, reprogramData) {
    try {
      console.log('Rescheduling session:', { cronogramaId, reprogramData });
      const response = await this.api.put(`/api/cronograma-sesiones/${cronogramaId}/reprogramar`, reprogramData);
      console.log('Session rescheduled successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error rescheduling session ${cronogramaId}:`, error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  /**
   * Cancel a specific cronograma session
   */
  async cancelarSesion(cronogramaId, cancelData) {
    try {
      console.log('Canceling session:', { cronogramaId, cancelData });
      const response = await this.api.put(`/api/cronograma-sesiones/${cronogramaId}/cancelar`, cancelData);
      console.log('Session canceled successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error canceling session ${cronogramaId}:`, error);
      throw error;
    }
  }

  // ==================== QUERY OPERATIONS ====================

  /**
   * Get today's therapy sessions
   */
  async getSesionesHoy() {
    try {
      const response = await this.api.get('/api/sesiones-terapia/hoy');
      return response.data;
    } catch (error) {
      console.error('Error fetching today sessions:', error);
      throw error;
    }
  }

  /**
   * Get sessions by therapist
   */
  async getSesionesByTerapeuta(terapeutaId) {
    try {
      const response = await this.api.get(`/api/sesiones-terapia/terapeuta/${terapeutaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for therapist ${terapeutaId}:`, error);
      throw error;
    }
  }

  /**
   * Get therapy statistics
   */
  async getEstadisticas() {
    try {
      const response = await this.api.get('/api/sesiones-terapia/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Get available patients
   */
  async getPacientesDisponibles() {
    try {
      console.log('Fetching pacientes from /api/sesiones-terapia/pacientes-disponibles');
      const response = await this.api.get('/api/sesiones-terapia/pacientes-disponibles');
      console.log('Pacientes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching available patients:', error);
      console.error('Trying alternative endpoint /api/pacientes...');
      
      // Intentar endpoint alternativo
      try {
        const altResponse = await this.api.get('/api/pacientes');
        console.log('Alternative pacientes response:', altResponse.data);
        return altResponse.data;
      } catch (altError) {
        console.error('Alternative endpoint also failed:', altError);
        throw error; // Throw original error
      }
    }
  }

  /**
   * Get available therapists
   */
  async getTerapeutasDisponibles() {
    try {
      console.log('Fetching terapeutas from /api/sesiones-terapia/terapeutas-disponibles');
      const response = await this.api.get('/api/sesiones-terapia/terapeutas-disponibles');
      console.log('Terapeutas response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching available therapists:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get all specialties
   */
  async getEspecialidades() {
    try {
      // Get only therapeutic specialties for therapy session creation
      const response = await this.api.get('/api/especialidades/area/Especialidad%20terapéutica');
      return response.data;
    } catch (error) {
      console.error('Error fetching therapeutic specialties:', error);
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
          return 'Datos inválidos. Verifique la información ingresada.';
        case 401:
          return 'Sesión expirada. Por favor, inicie sesión nuevamente.';
        case 403:
          return 'No tiene permisos para realizar esta acción.';
        case 404:
          return 'El recurso solicitado no fue encontrado.';
        case 500:
          return 'Error interno del servidor. Intente nuevamente más tarde.';
        default:
          return message;
      }
    } else if (error.request) {
      // Network error
      return 'Error de conexión. Verifique su conexión a internet.';
    } else {
      // Other error
      return error.message || 'Error inesperado. Intente nuevamente.';
    }
  }
}

// Export singleton instance
const sesionTerapiaService = new SesionTerapiaService();
export default sesionTerapiaService;