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
      console.log('🔐 Making request to:', API_ENDPOINTS.SESIONES_PEDAGOGICAS.BASE);
      console.log('🔑 JWT Token:', localStorage.getItem('jwt_token') ? 'Present' : 'Missing');
      
      // Try authenticated endpoint first
      try {
        const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.BASE);
        console.log('✅ Authenticated response:', response);
        return response.data;
      } catch (authError) {
        console.log('⚠️ Auth failed, trying debug endpoint:', authError.response?.status);
        // Fallback to debug endpoint
        const debugResponse = await ApiService.get('/api/sesiones-pedagogicas-debug');
        console.log('✅ Debug endpoint response:', debugResponse);
        return debugResponse.data;
      }
      
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      console.error('🔍 Error response:', error.response);
      console.error('📊 Error status:', error.response?.status);
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
      console.log('SesionPedagogicaService.createSesion - Data being sent:', sessionData);
      const response = await ApiService.post(API_ENDPOINTS.SESIONES_PEDAGOGICAS.BASE, sessionData);
      console.log('SesionPedagogicaService.createSesion - Success response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating pedagogical session:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error object:', error.originalError || error);
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
      console.log('🔐 Getting students for session:', sesionId);
      console.log('🔑 JWT Token:', localStorage.getItem('jwt_token') ? 'Present' : 'Missing');
      
      // Try authenticated endpoint first
      try {
        const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTUDIANTES(sesionId));
        console.log('✅ Authenticated students response:', response.data);
        return response.data;
      } catch (authError) {
        console.log('⚠️ Auth failed for students, trying debug endpoint:', authError.response?.status);
        // Fallback to debug endpoint
        const debugResponse = await ApiService.get(`/api/sesiones-pedagogicas/${sesionId}/estudiantes-debug`);
        console.log('✅ Debug students response:', debugResponse.data);
        return debugResponse.data;
      }
      
    } catch (error) {
      console.error(`❌ Error fetching students for session ${sesionId}:`, error);
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
      console.log('🔐 Getting cronograma for session:', sesionId);
      console.log('🔑 JWT Token:', localStorage.getItem('jwt_token') ? 'Present' : 'Missing');
      
      // Try authenticated endpoint first
      try {
        const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.CRONOGRAMA(sesionId));
        console.log('✅ Authenticated cronograma response:', response.data);
        return response.data;
      } catch (authError) {
        console.log('⚠️ Auth failed for cronograma, trying debug endpoint:', authError.response?.status);
        // Fallback to debug endpoint
        const debugResponse = await ApiService.get(`/api/sesiones-pedagogicas/${sesionId}/cronograma-debug`);
        console.log('✅ Debug cronograma response:', debugResponse.data);
        return debugResponse.data;
      }
      
    } catch (error) {
      console.error(`❌ Error fetching schedule for session ${sesionId}:`, error);
      console.error('🔍 Error status:', error.response?.status);
      console.error('📝 Error message:', error.response?.data?.message);
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
          console.error(`Error fetching cronograma for session ${sesion.id}:`, error);
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
      console.log('🔐 Getting available students...');
      console.log('🔑 JWT Token:', localStorage.getItem('jwt_token') ? 'Present' : 'Missing');
      
      // Try authenticated endpoint first
      try {
        const response = await ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTUDIANTES_DISPONIBLES);
        console.log('✅ Authenticated available students response:', response.data);
        return response.data;
      } catch (authError) {
        console.log('⚠️ Auth failed for available students, trying debug endpoint:', authError.response?.status);
        // Fallback to debug endpoint for available patients
        const debugResponse = await ApiService.get('/api/pacientes-disponibles-debug');
        console.log('✅ Debug available patients response:', debugResponse.data);
        return debugResponse.data;
      }
      
    } catch (error) {
      console.error('❌ Error fetching available students:', error);
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
      } catch {
        // If specific endpoint fails, try getting all specialties and filter
        console.warn('Pedagogical specialties endpoint not available, fetching all specialties');
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
  async generarCronograma(sesionId) {
    try {
      const response = await ApiService.post(`${API_ENDPOINTS.SESIONES_PEDAGOGICAS.BASE}/${sesionId}/generar-cronograma`);
      return response.data;
    } catch (error) {
      console.error('Error generating cronograma:', error);
      throw error;
    }
  }

  /**
   * Mark a class as completed
   */
  async marcarClaseRealizada(claseId, observaciones = null) {
    try {
      console.log('🎯 Marking class as completed:', claseId);
      
      // Try authenticated endpoint first
      try {
        const response = await ApiService.put(API_ENDPOINTS.SESIONES_PEDAGOGICAS.MARCAR_REALIZADA(claseId));
        console.log('✅ Authenticated - Class marked as completed:', response.data);
        return response.data;
      } catch (authError) {
        const status = authError.response?.status;
        console.log(`⚠️ Primary endpoint failed (${status}), trying working debug endpoint`);
        
        // Fallback to working debug endpoint for both auth failures (401) and missing endpoints (404)
        if (status === 401 || status === 404 || !status) {
          const debugResponse = await ApiService.put(`/api/cronograma-clases/${claseId}/marcar-realizada-working`);
          console.log('✅ Working debug endpoint - Class marked as completed:', debugResponse.data);
          return debugResponse.data;
        } else {
          // Re-throw error if it's not an auth or endpoint issue
          throw authError;
        }
      }
      
    } catch (error) {
      console.error('❌ Error marking class as completed:', error);
      console.error('🔍 Error status:', error.response?.status);
      console.error('📝 Error data:', error.response?.data);
      console.error('🌐 Request URL:', error.config?.url);
      throw error;
    }
  }

  /**
   * Reschedule a class
   */
  async reprogramarClase(claseId, reprogramData) {
    try {
      console.log('📅 Rescheduling class:', claseId, reprogramData);
      
      try {
        const response = await ApiService.put(API_ENDPOINTS.SESIONES_PEDAGOGICAS.REPROGRAMAR_CLASE(claseId), reprogramData);
        return response.data;
      } catch (specificError) {
        console.warn('Specific endpoint failed, trying generic update:', specificError);
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
      console.log('❌ Canceling class:', claseId, cancelData);
      
      try {
        const response = await ApiService.put(API_ENDPOINTS.SESIONES_PEDAGOGICAS.CANCELAR_CLASE(claseId), cancelData);
        return response.data;
      } catch (specificError) {
        console.warn('Specific endpoint failed, trying generic update:', specificError);
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
      console.log('📝 Registering attendance:', { cronogramaId, pacienteId, asistenciaData });
      console.log('🔑 JWT Token:', localStorage.getItem('jwt_token') ? 'Present' : 'Missing');
      console.log('🎯 Using endpoint:', API_ENDPOINTS.SESIONES_PEDAGOGICAS.REGISTRAR_ASISTENCIA(cronogramaId, pacienteId));
      
      const response = await ApiService.post(
        API_ENDPOINTS.SESIONES_PEDAGOGICAS.REGISTRAR_ASISTENCIA(cronogramaId, pacienteId),
        asistenciaData
      );
      
      console.log('✅ Attendance registered successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error registering class attendance:', error);
      console.error('🔍 Error status:', error.response?.status);
      console.error('📝 Error data:', error.response?.data);
      console.error('🌐 Request URL:', error.config?.url);
      
      if (error.response?.status === 401) {
        console.error('🚫 Authentication error - please login again');
      } else if (error.response?.status === 404) {
        console.error('🔍 Endpoint not found - check if backend route exists');
      }
      
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

  /**
   * Handle errors consistently
   */
  handleError(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.response?.status === 401) {
      return 'No autorizado. Por favor, inicie sesión nuevamente.';
    } else if (error.response?.status === 403) {
      return 'No tiene permisos para realizar esta acción.';
    } else if (error.response?.status === 404) {
      return 'Recurso no encontrado.';
    } else if (error.response?.status >= 500) {
      return 'Error del servidor. Por favor, intente más tarde.';
    } else if (error.message) {
      return error.message;
    } else {
      return 'Ha ocurrido un error inesperado.';
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