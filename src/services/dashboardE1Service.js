// src/services/dashboardE1Service.js
// Phase E1 - Clean dashboard service for role-based data

import ApiService from './apiService';
import { DASHBOARD_E1_ENDPOINTS } from '../config/dashboardE1Api';

class DashboardE1Service {
  
  /**
   * Get today's therapy sessions for the authenticated therapist
   * Falls back to general sessions if role-based endpoint fails
   * @returns {Promise} API response with sessions data
   */
  async getTodayTherapySessions() {
    try {
      console.log('[E1] Fetching today therapy sessions...');
      
      // Try role-based endpoint first
      try {
        const response = await ApiService.get(DASHBOARD_E1_ENDPOINTS.MIS_SESIONES_HOY);
        console.log('[E1] Therapy sessions (role-based):', response.data?.length || 0, 'sessions');
        return response;
      } catch (roleError) {
        console.log('[E1] Role-based endpoint failed, falling back to general endpoint');
        
        // Fallback to general sessions endpoint
        const response = await ApiService.get('/api/sesiones-terapia');
        
        // Filter for today's sessions (basic filtering)
        const today = new Date().toDateString();
        const todaySessions = response.data?.filter(session => {
          try {
            return session.fecha_creacion && new Date(session.fecha_creacion).toDateString() === today;
          } catch {
            return false;
          }
        }) || [];
        
        console.log('[E1] Therapy sessions (fallback):', todaySessions.length, 'sessions for today');
        return { data: todaySessions, source: 'fallback' };
      }
    } catch (error) {
      console.error('[E1] Error fetching therapy sessions:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get today's pedagogical classes for the authenticated pedagogue
   * Falls back to general classes if role-based endpoint fails
   * @returns {Promise} API response with classes data
   */
  async getTodayPedagogicalClasses() {
    try {
      console.log('[E1] Fetching today pedagogical classes...');
      
      // Try role-based endpoint first
      try {
        const response = await ApiService.get(DASHBOARD_E1_ENDPOINTS.MIS_CLASES_HOY);
        console.log('[E1] Pedagogical classes (role-based):', response.data?.length || 0, 'classes');
        return response;
      } catch (roleError) {
        console.log('[E1] Role-based endpoint failed, falling back to general endpoint');
        
        // Fallback to general pedagogical sessions endpoint
        const response = await ApiService.get('/api/sesiones-pedagogicas');
        
        // Filter for today's classes (basic filtering)
        const today = new Date().toDateString();
        const todayClasses = response.data?.filter(clase => {
          try {
            return clase.fecha_creacion && new Date(clase.fecha_creacion).toDateString() === today;
          } catch {
            return false;
          }
        }) || [];
        
        console.log('[E1] Pedagogical classes (fallback):', todayClasses.length, 'classes for today');
        return { data: todayClasses, source: 'fallback' };
      }
    } catch (error) {
      console.error('[E1] Error fetching pedagogical classes:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get assigned patients for the authenticated therapist
   * Falls back to all patients if role-based endpoint fails
   * @returns {Promise} API response with patients data
   */
  async getAssignedPatients() {
    try {
      console.log('[E1] Fetching assigned patients...');
      
      // Try role-based endpoint first
      try {
        const response = await ApiService.get(DASHBOARD_E1_ENDPOINTS.MIS_PACIENTES);
        console.log('[E1] Assigned patients (role-based):', response.data?.length || 0, 'patients');
        return response;
      } catch (roleError) {
        console.log('[E1] Role-based endpoint failed, falling back to general endpoint');
        
        // Fallback to general patients endpoint
        const response = await ApiService.get('/api/pacientes');
        console.log('[E1] Patients (fallback):', response.data?.length || 0, 'total patients');
        return { data: response.data || [], source: 'fallback' };
      }
    } catch (error) {
      console.error('[E1] Error fetching assigned patients:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get assigned students for the authenticated pedagogue
   * Falls back to all patients as students if role-based endpoint fails
   * @returns {Promise} API response with students data
   */
  async getAssignedStudents() {
    try {
      console.log('[E1] Fetching assigned students...');
      
      // Try role-based endpoint first
      try {
        const response = await ApiService.get(DASHBOARD_E1_ENDPOINTS.MIS_ESTUDIANTES);
        console.log('[E1] Assigned students (role-based):', response.data?.length || 0, 'students');
        return response;
      } catch (roleError) {
        console.log('[E1] Role-based endpoint failed, falling back to general endpoint');
        
        // Fallback to general patients endpoint (patients can be students in pedagogical context)
        const response = await ApiService.get('/api/pacientes');
        console.log('[E1] Students (fallback from patients):', response.data?.length || 0, 'total students');
        return { data: response.data || [], source: 'fallback' };
      }
    } catch (error) {
      console.error('[E1] Error fetching assigned students:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get comprehensive role-based dashboard data
   * This method safely calls all endpoints and returns organized data
   * @param {string} userRole - User's detected role
   * @returns {Promise} Organized dashboard data
   */
  async getRoleBasedDashboardData(userRole) {
    try {
      console.log('[E1] Fetching role-based dashboard data for role:', userRole);
      
      const dashboardData = {
        role: userRole,
        sessions: { data: [], error: null },
        classes: { data: [], error: null },
        patients: { data: [], error: null },
        students: { data: [], error: null },
        timestamp: new Date().toISOString()
      };

      // Fetch data based on user role
      const promises = [];

      // Always try to fetch sessions and classes (backend will filter by role)
      promises.push(
        this.getTodayTherapySessions().then(result => {
          dashboardData.sessions = result;
        }).catch(error => {
          dashboardData.sessions.error = error.message;
        })
      );

      promises.push(
        this.getTodayPedagogicalClasses().then(result => {
          dashboardData.classes = result;
        }).catch(error => {
          dashboardData.classes.error = error.message;
        })
      );

      promises.push(
        this.getAssignedPatients().then(result => {
          dashboardData.patients = result;
        }).catch(error => {
          dashboardData.patients.error = error.message;
        })
      );

      promises.push(
        this.getAssignedStudents().then(result => {
          dashboardData.students = result;
        }).catch(error => {
          dashboardData.students.error = error.message;
        })
      );

      // Wait for all promises to complete
      await Promise.all(promises);

      console.log('[E1] Role-based dashboard data fetched successfully');
      console.log('[E1] Data summary:', {
        sessions: dashboardData.sessions.data?.length || 0,
        classes: dashboardData.classes.data?.length || 0,
        patients: dashboardData.patients.data?.length || 0,
        students: dashboardData.students.data?.length || 0
      });

      return dashboardData;

    } catch (error) {
      console.error('[E1] Error fetching role-based dashboard data:', error);
      return {
        role: userRole,
        sessions: { data: [], error: error.message },
        classes: { data: [], error: error.message },
        patients: { data: [], error: error.message },
        students: { data: [], error: error.message },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get quick stats for admin dashboard
   * @returns {Promise} Quick statistics
   */
  async getQuickStats() {
    try {
      console.log('[E1] Fetching quick stats for admin...');
      const data = await this.getRoleBasedDashboardData('admin');
      
      return {
        totalSessions: data.sessions.data?.length || 0,
        totalClasses: data.classes.data?.length || 0,
        totalPatients: data.patients.data?.length || 0,
        totalStudents: data.students.data?.length || 0,
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('[E1] Error fetching quick stats:', error);
      return {
        totalSessions: 0,
        totalClasses: 0,
        totalPatients: 0,
        totalStudents: 0,
        error: error.message
      };
    }
  }

  /**
   * Health check for E1 dashboard endpoints
   * @returns {Promise} Health status
   */
  async healthCheck() {
    try {
      console.log('[E1] Running health check...');
      const startTime = Date.now();
      
      // Test basic connectivity
      await Promise.all([
        this.getTodayTherapySessions(),
        this.getTodayPedagogicalClasses(),
        this.getAssignedPatients(),
        this.getAssignedStudents()
      ]);
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        endpoints: Object.keys(DASHBOARD_E1_ENDPOINTS).length
      };
    } catch (error) {
      console.error('[E1] Health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create and export singleton instance
const dashboardE1Service = new DashboardE1Service();
export default dashboardE1Service;