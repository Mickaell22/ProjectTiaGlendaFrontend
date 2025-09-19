// src/services/dashboardService.js - Servicio limpio para los nuevos endpoints de dashboard
import { ApiService } from './apiService';

class DashboardService {
  /**
   * Get admin dashboard data
   */
  async getAdminDashboard() {
    try {
      const response = await ApiService.get('/api/dashboard/admin');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      throw error;
    }
  }

  /**
   * Get therapist dashboard data
   */
  async getTherapistDashboard() {
    try {
      const response = await ApiService.get('/api/dashboard/therapist');
      return response.data;
    } catch (error) {
      console.error('Error fetching therapist dashboard:', error);
      throw error;
    }
  }

  /**
   * Get pedagogue dashboard data
   */
  async getPedagogueDashboard() {
    try {
      const response = await ApiService.get('/api/dashboard/pedagogue');
      return response.data;
    } catch (error) {
      console.error('Error fetching pedagogue dashboard:', error);
      throw error;
    }
  }

  /**
   * Get general statistics
   */
  async getGeneralStats() {
    try {
      const response = await ApiService.get('/api/stats/general');
      return response.data;
    } catch (error) {
      console.error('Error fetching general stats:', error);
      throw error;
    }
  }

  /**
   * Get personal agenda for current user
   */
  async getPersonalAgenda(fecha = null) {
    try {
      const params = fecha ? `?fecha=${fecha}` : '';
      const response = await ApiService.get(`/api/agenda/personal${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching personal agenda:', error);
      throw error;
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