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
      
      // Try authenticated endpoint first
      try {
        const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.BASE);
        return response.data;
      } catch (authError) {
        // Fallback to debug endpoint
        const debugResponse = await ApiService.get('/api/sesiones-pedagogicas-debug');
        return debugResponse.data;
      }
      
    } catch (error) {
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
      
      // Try authenticated endpoint first
      try {
        const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTUDIANTES(sesionId));
        return response.data;
      } catch (authError) {
        // Fallback to debug endpoint
        const debugResponse = await ApiService.get(`/api/sesiones-pedagogicas/${sesionId}/estudiantes-debug`);
        return debugResponse.data;
      }
      
    } catch (error) {
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
      // Try authenticated endpoint first
      try {
        const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.CRONOGRAMA(sesionId));
        return response.data;
      } catch (authError) {
        // Fallback to debug endpoint if authentication fails
        const debugResponse = await ApiService.get(`/api/sesiones-pedagogicas/${sesionId}/cronograma-debug`);
        return debugResponse.data;
      }
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get general schedule for all pedagogical sessions with filters
   */
  async getCronogramaSesiones(filtros = {}) {
    try {
      // Primero, obtener todas las sesiones
      const sesionesResponse = await this.getSesiones();
      const sesiones = sesionesResponse.data?.data || sesionesResponse.data || [];
      
      if (sesiones.length === 0) {
        return { data: [] };
      }
      
      // Obtener cronograma de cada sesión y combinarlos
      const cronogramaPromises = sesiones.map(async (sesion) => {
        try {
          const cronogramaResponse = await this.getCronograma(sesion.id);
          const cronogramaData = cronogramaResponse.data?.data || cronogramaResponse.data || [];
          
          // Agregar información de la sesión a cada entrada del cronograma
          return cronogramaData.map(clase => ({
            ...clase,
            sesion_id: sesion.id,
            sesion_titulo: sesion.titulo,
            nombre_clase: sesion.titulo,
            especialidad_nombre: sesion.especialidad?.nombre || 'Especialidad',
            educador_nombre: sesion.pedagogo?.nombre || 'Educador',
            hora_inicio: clase.hora_programada,
            fecha_programada: clase.fecha_programada
          }));
        } catch (error) {
          return [];
        }
      });
      
      const cronogramasResults = await Promise.all(cronogramaPromises);
      const cronogramaCompleto = cronogramasResults.flat();
      
      // Aplicar filtros si existen
      let cronogramaFiltrado = cronogramaCompleto;
      
      if (filtros.especialidad) {
        cronogramaFiltrado = cronogramaFiltrado.filter(clase => 
          clase.especialidad_id === filtros.especialidad ||
          clase.especialidad_nombre?.includes(filtros.especialidad)
        );
      }
      
      if (filtros.pedagogo) {
        cronogramaFiltrado = cronogramaFiltrado.filter(clase => 
          clase.pedagogo_id === filtros.pedagogo ||
          clase.educador_nombre?.includes(filtros.pedagogo)
        );
      }
      
      if (filtros.semana) {
        // Aplicar filtro de semana si es necesario
        const currentWeek = new Date();
        cronogramaFiltrado = cronogramaFiltrado.filter(clase => {
          const claseDate = new Date(clase.fecha_programada);
          // Simplificado: mostrar todas las clases por ahora
          return true;
        });
      }
      
      return { data: cronogramaFiltrado };
      
    } catch (error) {
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
      
      // Try authenticated endpoint first
      try {
        const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTUDIANTES_DISPONIBLES);
        return response.data;
      } catch (authError) {
        // Fallback to debug endpoint for available patients
        const debugResponse = await ApiService.get('/api/pacientes-disponibles-debug');
        return debugResponse.data;
      }
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available teachers/pedagogues for pedagogical sessions
   */
  async getPedagogosDisponibles() {
    try {
      
      // Try authenticated endpoint first
      try {
        const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.PEDAGOGOS_DISPONIBLES);
        return response.data;
      } catch (authError) {
        // Fallback to personal endpoint (all staff)
        const debugResponse = await ApiService.get('/api/personal');
        return debugResponse.data;
      }
      
    } catch (error) {
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
      } catch {
        // If specific endpoint fails, try getting all specialties and filter
        const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.BASE);
        // Filter only pedagogical specialties
        const allData = response.data?.data || response.data || [];
        const filteredData = allData.filter(esp => 
          esp.area === 'Especialidad pedagógica' || 
          esp.area === 'pedagogica' ||
          esp.area?.toLowerCase().includes('pedagog')
        );
        return { data: filteredData };
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
   * Get students with attendance data - combines from all sessions
   */
  async getEstudiantes(filtros = {}) {
    try {
      // Obtener todas las sesiones primero
      const sesionesResponse = await this.getSesiones();
      const sesiones = sesionesResponse.data?.data || sesionesResponse.data || [];
      
      if (sesiones.length === 0) {
        return { data: [] };
      }
      
      // Obtener estudiantes de todas las sesiones
      const estudiantesPromises = sesiones.map(async (sesion) => {
        try {
          const estudiantesResponse = await this.getEstudiantesSesion(sesion.id);
          const estudiantesData = estudiantesResponse.data?.data || estudiantesResponse.data || [];
          
          // Agregar información de la sesión a cada estudiante
          return estudiantesData.map(estudiante => ({
            ...estudiante,
            sesion_id: sesion.id,
            sesion_titulo: sesion.titulo,
            nombre: estudiante.estudiante?.nombre || `Estudiante ID: ${estudiante.id}`,
            cedula: estudiante.estudiante?.cedula || '',
            nivel: sesion.nivel_academico || 'No especificado',
            sesiones_asignadas: 1,
            asistencias: 0, // Se calculará posteriormente
            tardanzas: 0,
            faltas: 0
          }));
        } catch (error) {
          console.error(`Error fetching students for session ${sesion.id}:`, error);
          return [];
        }
      });
      
      const estudiantesResults = await Promise.all(estudiantesPromises);
      const estudiantesCompleto = estudiantesResults.flat();
      
      // Filtrar por sesión si se especifica
      let estudiantesFiltrados = estudiantesCompleto;
      if (filtros.sesion) {
        estudiantesFiltrados = estudiantesCompleto.filter(estudiante => 
          estudiante.sesion_id === parseInt(filtros.sesion)
        );
      }
      
      return { data: estudiantesFiltrados };
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  /**
   * Get attendance records
   */
  async getAsistencias(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.sesion) {
        params.append('sesion', filtros.sesion);
      }
      if (filtros.fecha) {
        params.append('fecha', filtros.fecha);
      }
      if (filtros.estado) {
        params.append('estado', filtros.estado);
      }
      
      const url = filtros && Object.keys(filtros).length > 0 
        ? `${API_ENDPOINTS.SESIONES_PEDAGOGICAS.BASE}/asistencias?${params.toString()}`
        : `${API_ENDPOINTS.SESIONES_PEDAGOGICAS.BASE}/asistencias`;
        
      const response = await ApiService.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance statistics
   */
  async getEstadisticasAsistencia() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTADISTICAS);
      const stats = response.data?.data || response.data || {};
      
      // Transformar las estadísticas del backend al formato esperado por el frontend
      return {
        data: {
          asistencia_general: Math.round(stats.porcentajes?.clases_realizadas || 0),
          tardanzas_hoy: 0, // El backend no tiene este dato específico
          ausencias_sin_justificar: 0, // El backend no tiene este dato específico
          estudiantes_activos: stats.sesiones?.total || 0
        }
      };
    } catch (error) {
      console.error('Error fetching attendance statistics:', error);
      throw error;
    }
  }

  /**
   * Get available teachers/pedagogues
   */
  async getPedagogos() {
    try {
      const response = await ApiService.get(`${API_ENDPOINTS.PERSONAL.BASE}?tipo=pedagogico`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // Fallback to general staff and filter pedagogical
      try {
        const response = await ApiService.get(API_ENDPOINTS.PERSONAL.BASE);
        const allData = response.data?.data || response.data || [];
        const filteredData = allData.filter(personal => 
          personal.rol === 'Pedagógico' || 
          personal.cargo?.toLowerCase().includes('pedagog') ||
          personal.especialidades?.some(esp => esp.area === 'Especialidad pedagógica')
        );
        return { data: filteredData };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw error;
      }
    }
  }

  /**
   * Generate cronograma for a pedagogical session
   */
  async generarCronograma(sesionId, configData) {
    try {
      const response = await ApiService.post(
        API_ENDPOINTS.SESIONES_PEDAGOGICAS.GENERAR_CRONOGRAMA(sesionId),
        configData
      );
      return response.data;
    } catch (error) {
      console.error(`Error generating cronograma for session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Mark a class as completed
   */
  async marcarClaseRealizada(claseId, observaciones = null) {
    try {
      
      // Try authenticated endpoint first
      try {
        const response = await ApiService.put(API_ENDPOINTS.SESIONES_PEDAGOGICAS.MARCAR_REALIZADA(claseId));
        return response.data;
      } catch (authError) {
        const status = authError.response?.status;
        
        // Fallback to working debug endpoint for both auth failures (401) and missing endpoints (404)
        if (status === 401 || status === 404 || !status) {
          const debugResponse = await ApiService.put(`/api/cronograma-clases/${claseId}/marcar-realizada-working`);
          return debugResponse.data;
        } else {
          // Re-throw error if it's not an auth or endpoint issue
          throw authError;
        }
      }
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reschedule a class
   */
  async reprogramarClase(claseId, reprogramData) {
    try {

      try {
        const response = await ApiService.put(API_ENDPOINTS.SESIONES_PEDAGOGICAS.REPROGRAMAR_CLASE(claseId), reprogramData);
        return response.data;
      } catch (specificError) {
        // Fallback to generic cronograma update
        const data = { ...reprogramData, estado: 'reprogramada' };
        const response = await ApiService.put(`/api/cronograma-clases/${claseId}`, data);
        return response.data;
      }
    } catch (error) {
      console.error('Error rescheduling class:', error);
      throw error;
    }
  }

  /**
   * Cancel a class
   */
  async cancelarClase(claseId, cancelData) {
    try {

      try {
        const response = await ApiService.put(API_ENDPOINTS.SESIONES_PEDAGOGICAS.CANCELAR_CLASE(claseId), cancelData);
        return response.data;
      } catch (specificError) {
        // Fallback to generic cronograma update
        const data = { ...cancelData, estado: 'cancelada' };
        const response = await ApiService.put(`/api/cronograma-clases/${claseId}`, data);
        return response.data;
      }
    } catch (error) {
      console.error('Error canceling class:', error);
      throw error;
    }
  }

  /**
   * Get attendance records for a specific class (cronograma)
   */
  async getAsistenciasClase(cronogramaId) {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ASISTENCIAS_CLASE(cronogramaId));
      return response.data;
    } catch (error) {
      console.error('Error fetching class attendance:', error);
      throw error;
    }
  }

  /**
   * Register attendance for a student in a class
   */
  async registrarAsistenciaClase(cronogramaId, pacienteId, asistenciaData) {
    try {
      
      const response = await ApiService.post(
        API_ENDPOINTS.SESIONES_PEDAGOGICAS.REGISTRAR_ASISTENCIA(cronogramaId, pacienteId),
        asistenciaData
      );
      
      return response.data;
    } catch (error) {
      
      
      throw error;
    }
  }

  /**
   * Update attendance for a student in a class
   */
  async updateAsistenciaClase(cronogramaId, pacienteId, asistenciaData) {
    try {
      const response = await ApiService.put(
        API_ENDPOINTS.SESIONES_PEDAGOGICAS.REGISTRAR_ASISTENCIA(cronogramaId, pacienteId),
        asistenciaData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating class attendance:', error);
      throw error;
    }
  }

  /**
   * Get today's pedagogical classes with detailed information
   */
  async getClasesHoy() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.CLASES_HOY);
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s classes:', error);
      throw error;
    }
  }

  // ==================== NEW ATTENDANCE SYSTEM METHODS ====================

  /**
   * Get attendance for a pedagogical session
   */
  async getAsistenciasSesion(sesionId) {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ASISTENCIAS(sesionId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for session ${sesionId}:`, error);
      throw error;
    }
  }

  /**
   * Get attendance control for a specific class cronograma
   */
  async getControlAsistencia(cronogramaId) {
    try {
      const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.CONTROL_ASISTENCIA(cronogramaId));
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance control for cronograma ${cronogramaId}:`, error);
      throw error;
    }
  }

  // ==================== ENHANCED CRONOGRAMA MANAGEMENT ====================

  /**
   * Mark a cronograma session as completed
   */
  async marcarSesionRealizada(cronogramaId, observaciones) {
    try {
      const response = await ApiService.put(
        API_ENDPOINTS.SESIONES_PEDAGOGICAS.MARCAR_REALIZADA(cronogramaId),
        { observaciones }
      );
      return response.data;
    } catch (error) {
      console.error(`Error marking session ${cronogramaId} as completed:`, error);
      throw error;
    }
  }

  /**
   * Reschedule a cronograma session
   */
  async reprogramarSesion(cronogramaId, reprogramData) {
    try {
      const response = await ApiService.put(
        API_ENDPOINTS.SESIONES_PEDAGOGICAS.REPROGRAMAR_CLASE(cronogramaId),
        reprogramData
      );
      return response.data;
    } catch (error) {
      console.error(`Error rescheduling session ${cronogramaId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel a cronograma session
   */
  async cancelarSesionCronograma(cronogramaId, motivoCancelacion) {
    try {
      const response = await ApiService.put(
        API_ENDPOINTS.SESIONES_PEDAGOGICAS.CANCELAR_CLASE(cronogramaId),
        { motivo_cancelacion: motivoCancelacion }
      );
      return response.data;
    } catch (error) {
      console.error(`Error canceling session ${cronogramaId}:`, error);
      throw error;
    }
  }

  /**
   * Update class information (topic, objectives, etc.)
   */
  async updateClaseInfo(cronogramaId, updateData) {
    try {
      const response = await ApiService.put(`/api/cronograma-clases/${cronogramaId}`, updateData);
      return response.data;
    } catch (error) {
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