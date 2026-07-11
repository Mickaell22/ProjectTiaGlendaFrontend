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
   * Get admin dashboard data with caching.
   * /api/dashboard/admin devuelve la estructura completa (usuarios, pacientes,
   * personal, especialidades, sesiones, estadisticas) con datos reales.
   */
  async getAdminDashboard() {
    return this.makeCachedRequest('admin_dashboard', () =>
      ApiService.get('/api/dashboard/admin')
    );
  }

  /**
   * Get therapist dashboard data with caching.
   * /api/dashboard/therapist deriva id_personal del token y devuelve
   * mis_pacientes, sesiones, agenda_hoy y estadisticas reales.
   */
  async getTherapistDashboard() {
    return this.makeCachedRequest('therapist_dashboard', () =>
      ApiService.get('/api/dashboard/therapist')
    );
  }

  /**
   * Get pedagogue dashboard data with caching.
   * /api/dashboard/pedagogue deriva id_personal del token y devuelve
   * mis_estudiantes, clases, horario_hoy y estadisticas reales.
   */
  async getPedagogueDashboard() {
    return this.makeCachedRequest('pedagogue_dashboard', () =>
      ApiService.get('/api/dashboard/pedagogue')
    );
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