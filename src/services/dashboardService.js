// src/services/dashboardService.js
import ApiService from './apiService';
import { API_ENDPOINTS } from 'src/config/api';

class DashboardService {
  // Obtener estadísticas generales del dashboard
  async getEstadisticasGenerales() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.DASHBOARD.ESTADISTICAS);
      return response;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  // Obtener usuarios activos
  async getUsuariosActivos() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.DASHBOARD.USUARIOS_ACTIVOS);
      return response;
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }
  }

  // Obtener actividad reciente
  async getActividadReciente(limite = 10) {
    try {
      const response = await ApiService.get(`${API_ENDPOINTS.DASHBOARD.ACTIVIDAD_RECIENTE}?limite=${limite}`);
      return response;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  // Obtener alertas del sistema
  async getAlertasSistema() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.DASHBOARD.ALERTAS);
      return response;
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      throw error;
    }
  }

  // Obtener estadísticas de sesiones
  async getEstadisticasSesiones() {
    try {
      const [terapeuticas, pedagogicas] = await Promise.all([
        ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.ESTADISTICAS),
        ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.ESTADISTICAS)
      ]);
      return {
        terapeuticas: terapeuticas.data,
        pedagogicas: pedagogicas.data
      };
    } catch (error) {
      console.error('Error fetching sessions statistics:', error);
      throw error;
    }
  }

  // Obtener sesiones de hoy
  async getSesionesHoy() {
    try {
      const [terapeuticas, pedagogicas] = await Promise.all([
        ApiService.get(API_ENDPOINTS.SESIONES_TERAPIA.HOY),
        ApiService.get(API_ENDPOINTS.SESIONES_PEDAGOGICAS.HOY)
      ]);
      return {
        terapeuticas: terapeuticas.data || [],
        pedagogicas: pedagogicas.data || [],
        total: (terapeuticas.data || []).length + (pedagogicas.data || []).length
      };
    } catch (error) {
      console.error('Error fetching today sessions:', error);
      throw error;
    }
  }

  // Obtener conteo de pacientes
  async getContadorPacientes() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.DASHBOARD.CONTADOR_PACIENTES);
      return response;
    } catch (error) {
      console.error('Error fetching patients count:', error);
      throw error;
    }
  }

  // Obtener resumen del personal
  async getResumenPersonal() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.DASHBOARD.RESUMEN_PERSONAL);
      return response;
    } catch (error) {
      console.error('Error fetching staff summary:', error);
      throw error;
    }
  }

  // Obtener rendimiento semanal
  async getRendimientoSemanal() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.DASHBOARD.RENDIMIENTO_SEMANAL);
      return response;
    } catch (error) {
      console.error('Error fetching weekly performance:', error);
      throw error;
    }
  }

  // Obtener métricas de asistencia
  async getMetricasAsistencia() {
    try {
      const response = await ApiService.get(API_ENDPOINTS.DASHBOARD.METRICAS_ASISTENCIA);
      return response;
    } catch (error) {
      console.error('Error fetching attendance metrics:', error);
      throw error;
    }
  }
}

export default new DashboardService();