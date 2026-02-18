// src/services/dashboardService.js - Servicio optimizado para los endpoints de dashboard
import { ApiService } from './apiService';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = 'dashboard_cache_';

class DashboardService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached data if available and not expired
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Set data in cache
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Also store in localStorage as backup
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Could not store cache in localStorage:', error);
    }
  }

  /**
   * Get cached data from localStorage
   */
  getLocalStorageCache(key) {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if ((Date.now() - parsed.timestamp) < CACHE_DURATION) {
          return parsed.data;
        }
        localStorage.removeItem(CACHE_PREFIX + key);
      }
    } catch (error) {
      console.warn('Could not read cache from localStorage:', error);
    }
    return null;
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    // Clear localStorage cache
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Could not clear localStorage cache:', error);
    }
  }

  /**
   * Make cached API request
   */
  async makeCachedRequest(cacheKey, apiCall) {
    // Try memory cache first
    let cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Try localStorage cache
    cachedData = this.getLocalStorageCache(cacheKey);
    if (cachedData) {
      // Restore to memory cache
      this.setCachedData(cacheKey, cachedData);
      return cachedData;
    }

    // Make fresh API call
    try {
      const response = await apiCall();
      if (response.data) {
        this.setCachedData(cacheKey, response.data);
        return response.data;
      }
      return response;
    } catch (error) {
      // If we have stale cache, return it during errors
      const staleCache = this.getStaleCache(cacheKey);
      if (staleCache) {
        console.warn('Returning stale cache due to API error:', error);
        return staleCache;
      }
      throw error;
    }
  }

  /**
   * Get stale cache (ignore expiration)
   */
  getStaleCache(key) {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (cached) {
        return JSON.parse(cached).data;
      }
    } catch (error) {
      console.warn('Could not read stale cache:', error);
    }
    return null;
  }
  /**
   * Get admin dashboard data with caching
   */
  async getAdminDashboard() {
    try {
      // Parallel calls: main stats + optional enrichment endpoints
      const [statsResponse, actividadResult, alertasResult, rendimientoResult] = await Promise.allSettled([
        ApiService.get('/api/dashboard/estadisticas'),
        ApiService.get('/api/dashboard/actividad-reciente'),
        ApiService.get('/api/dashboard/alertas'),
        ApiService.get('/api/dashboard/rendimiento-semanal'),
      ]);

      if (statsResponse.status !== 'fulfilled' || !statsResponse.value?.data?.data) {
        console.error('No data in estadisticas response:', statsResponse);
        return { status: 'error', message: 'No data received' };
      }

      const statsData = statsResponse.value.data.data;

      const actividadReciente = actividadResult.status === 'fulfilled'
        ? (actividadResult.value?.data?.data || actividadResult.value?.data || [])
        : [];

      const alertas = alertasResult.status === 'fulfilled'
        ? (alertasResult.value?.data?.data || alertasResult.value?.data || [])
        : [];

      const rendimientoSemanal = rendimientoResult.status === 'fulfilled'
        ? (rendimientoResult.value?.data?.data || rendimientoResult.value?.data || [0,0,0,0,0,0,0])
        : [0,0,0,0,0,0,0];

      return {
        status: 'success',
        data: {
          usuarios: {
            total: statsData.usuarios_activos || 0,
            activos: statsData.usuarios_activos || 0,
            inactivos: 0,
            nuevos_este_mes: 0
          },
          pacientes: {
            total: statsData.total_pacientes || 0,
            activos: statsData.total_pacientes || 0,
            nuevos_este_mes: 0,
            por_edad: { '0-5': 0, '6-12': 0, '13-18': 0, '18+': 0 }
          },
          personal: {
            total: (statsData.terapeutas || 0) + (statsData.pedagogos || 0),
            terapeutas: statsData.terapeutas || 0,
            pedagogos: statsData.pedagogos || 0,
            administrativos: 0
          },
          especialidades: {
            total: statsData.especialidades || 0,
            terapeuticas: Math.floor((statsData.especialidades || 0) * 0.6),
            pedagogicas: Math.floor((statsData.especialidades || 0) * 0.4)
          },
          sesiones: {
            hoy: statsData.sesiones_hoy || 0,
            esta_semana: 0,
            completadas_mes: 0,
            canceladas_mes: 0
          },
          estadisticas: {
            asistencia_promedio: statsData.asistencia_promedio || 0,
            satisfaccion_promedio: 0,
            utilizacion_salas: 0
          },
          actividad_reciente: Array.isArray(actividadReciente) ? actividadReciente : [],
          alertas: Array.isArray(alertas) ? alertas : [],
          rendimiento_semanal: Array.isArray(rendimientoSemanal) ? rendimientoSemanal : [0,0,0,0,0,0,0],
        }
      };

    } catch (error) {
      console.error('Error in getAdminDashboard:', error);
      throw error;
    }
  }

  /**
   * Get therapist dashboard data with caching
   */
  async getTherapistDashboard() {
    try {
      const [statsResponse, sesionesResult, pacientesResult] = await Promise.allSettled([
        ApiService.get('/api/dashboard/estadisticas'),
        ApiService.get('/api/dashboard/mis-sesiones-hoy'),
        ApiService.get('/api/dashboard/mis-pacientes'),
      ]);

      if (statsResponse.status !== 'fulfilled' || !statsResponse.value?.data?.data) {
        return { status: 'error', message: 'No data received' };
      }

      const statsData = statsResponse.value.data.data;

      const agendaHoy = sesionesResult.status === 'fulfilled'
        ? (sesionesResult.value?.data?.data || sesionesResult.value?.data || [])
        : [];

      const misPacientesRaw = pacientesResult.status === 'fulfilled'
        ? (pacientesResult.value?.data?.data || pacientesResult.value?.data || null)
        : null;

      const totalPacientes = misPacientesRaw?.total
        ?? (Array.isArray(misPacientesRaw) ? misPacientesRaw.length : null)
        ?? Math.floor((statsData.total_pacientes || 0) / (statsData.terapeutas || 1));

      const activosPacientes = misPacientesRaw?.activos ?? totalPacientes;

      return {
        status: 'success',
        data: {
          mis_pacientes: {
            total: totalPacientes,
            activos: activosPacientes,
            dados_alta: misPacientesRaw?.dados_alta || 0,
            nuevos_este_mes: misPacientesRaw?.nuevos_este_mes || 0
          },
          sesiones: {
            hoy: Array.isArray(agendaHoy) ? agendaHoy.length : 0,
            esta_semana: 0,
            completadas_mes: 0,
            pendientes: Array.isArray(agendaHoy)
              ? agendaHoy.filter(s => s.estado === 'pendiente').length
              : 0
          },
          agenda_hoy: Array.isArray(agendaHoy) ? agendaHoy : [],
          estadisticas: {
            asistencia_promedio: statsData.asistencia_promedio || 0,
            horas_trabajadas_mes: 0,
            evaluaciones_pendientes: 0,
            objetivos_cumplidos: 0
          }
        }
      };
    } catch (error) {
      console.error('Error in getTherapistDashboard:', error);
      throw error;
    }
  }

  /**
   * Get pedagogue dashboard data with caching
   */
  async getPedagogueDashboard() {
    try {
      const [statsResponse, clasesResult, estudiantesResult] = await Promise.allSettled([
        ApiService.get('/api/dashboard/estadisticas'),
        ApiService.get('/api/dashboard/mis-clases-hoy'),
        ApiService.get('/api/dashboard/mis-estudiantes'),
      ]);

      if (statsResponse.status !== 'fulfilled' || !statsResponse.value?.data?.data) {
        return { status: 'error', message: 'No data received' };
      }

      const statsData = statsResponse.value.data.data;

      const horarioHoy = clasesResult.status === 'fulfilled'
        ? (clasesResult.value?.data?.data || clasesResult.value?.data || [])
        : [];

      const misEstudiantesRaw = estudiantesResult.status === 'fulfilled'
        ? (estudiantesResult.value?.data?.data || estudiantesResult.value?.data || null)
        : null;

      const totalEstudiantes = misEstudiantesRaw?.total
        ?? (Array.isArray(misEstudiantesRaw) ? misEstudiantesRaw.length : null)
        ?? Math.floor((statsData.total_pacientes || 0) / (statsData.pedagogos || 1));

      const activosEstudiantes = misEstudiantesRaw?.activos ?? totalEstudiantes;

      return {
        status: 'success',
        data: {
          mis_estudiantes: {
            total: totalEstudiantes,
            activos: activosEstudiantes,
            graduados: misEstudiantesRaw?.graduados || 0,
            nuevos_este_mes: misEstudiantesRaw?.nuevos_este_mes || 0
          },
          clases: {
            hoy: Array.isArray(horarioHoy) ? horarioHoy.length : 0,
            esta_semana: 0,
            completadas_mes: 0,
            canceladas_mes: 0
          },
          horario_hoy: Array.isArray(horarioHoy) ? horarioHoy : [],
          estadisticas: {
            asistencia_promedio: statsData.asistencia_promedio || 0,
            horas_clase_mes: 0,
            evaluaciones_pendientes: 0,
            rendimiento_promedio: 0
          }
        }
      };
    } catch (error) {
      console.error('Error in getPedagogueDashboard:', error);
      throw error;
    }
  }

  /**
   * Get general statistics with caching
   */
  async getGeneralStats() {
    return this.makeCachedRequest('general_stats', async () => {
      const response = await ApiService.get('/api/stats/general');
      return response.data;
    });
  }

  /**
   * Get personal agenda for current user with caching
   */
  async getPersonalAgenda(fecha = null) {
    const cacheKey = `personal_agenda_${fecha || 'today'}`;
    return this.makeCachedRequest(cacheKey, async () => {
      const params = fecha ? `?fecha=${fecha}` : '';
      const response = await ApiService.get(`/api/agenda/personal${params}`);
      return response.data;
    });
  }

  /**
   * Refresh specific dashboard data (force cache invalidation)
   */
  async refreshDashboard(dashboardType) {
    const cacheKeys = {
      'admin': 'admin_dashboard',
      'therapist': 'therapist_dashboard',
      'pedagogue': 'pedagogue_dashboard',
      'stats': 'general_stats'
    };

    const cacheKey = cacheKeys[dashboardType];
    if (cacheKey) {
      // Clear specific cache
      this.cache.delete(cacheKey);
      localStorage.removeItem(CACHE_PREFIX + cacheKey);

      // Reload data
      switch (dashboardType) {
        case 'admin':
          return this.getAdminDashboard();
        case 'therapist':
          return this.getTherapistDashboard();
        case 'pedagogue':
          return this.getPedagogueDashboard();
        case 'stats':
          return this.getGeneralStats();
        default:
          throw new Error(`Unknown dashboard type: ${dashboardType}`);
      }
    }
  }

  /**
   * Preload dashboard data
   */
  async preloadDashboards() {
    try {
      // Load general stats first as it's used by all dashboards
      await this.getGeneralStats();

      // Try to load other dashboards in background
      Promise.allSettled([
        this.getAdminDashboard(),
        this.getTherapistDashboard(),
        this.getPedagogueDashboard()
      ]);
    } catch (error) {
      console.warn('Dashboard preload failed:', error);
    }
  }

  /**
   * Handle API errors and return user-friendly messages
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
          return 'No tienes permisos para acceder a esta información.';
        case 404:
          return 'Los datos del dashboard no están disponibles.';
        case 500:
          return 'Error interno del servidor. Intenta nuevamente.';
        default:
          return `Error: ${message}`;
      }
    } else if (error.request) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    } else {
      return `Error: ${error.message}`;
    }
  }
}

// Export a singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;