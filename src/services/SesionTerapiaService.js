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
      const response = await this.api.get(`/api/sesiones-terapia/cronograma/${cronogramaId}/asistencia`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for cronograma ${cronogramaId}:`, error);
      throw error;
    }
  }

  /**
   * Register attendance for a patient in a specific session
   */
  async registrarAsistencia(cronogramaId, patientId, attendanceData) {
    try {
      const response = await this.api.post(
        `/api/sesiones-terapia/cronograma/${cronogramaId}/pacientes/${patientId}/asistencia`,
        attendanceData
      );
      return response.data;
    } catch (error) {
      console.error(`Error registering attendance for patient ${patientId}:`, error);
      throw error;
    }
  }

  /**
   * Update attendance for a patient in a specific session
   */
  async updateAsistencia(cronogramaId, patientId, attendanceData) {
    try {
      const response = await this.api.put(
        `/api/sesiones-terapia/cronograma/${cronogramaId}/pacientes/${patientId}/asistencia`,
        attendanceData
      );
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
      const response = await this.api.get('/api/sesiones-terapia/pacientes-disponibles');
      return response.data;
    } catch (error) {
      console.error('Error fetching available patients:', error);
      throw error;
    }
  }

  /**
   * Get available therapists
   */
  async getTerapeutasDisponibles() {
    try {
      const response = await this.api.get('/api/sesiones-terapia/terapeutas-disponibles');
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
      const response = await this.api.get('/api/especialidades');
      return response.data;
    } catch (error) {
      console.error('Error fetching specialties:', error);
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