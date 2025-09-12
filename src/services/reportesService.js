// src/services/reportesService.js
// Servicio para manejo de reportes del sistema

import { ApiService } from './apiService.js';

export const reportesService = {
  // ============================================
  // OBTENER REPORTES DISPONIBLES
  // ============================================
  
  /**
   * Obtener lista de reportes disponibles según el rol del usuario
   * @returns {Promise} Promise con los reportes disponibles
   */
  async getReportesDisponibles() {
    try {
      const response = await ApiService.get('/api/reportes/disponibles');
      return {
        success: true,
        data: response.data.data.data,
        totalReportes: response.data.data.total_reportes
      };
    } catch (error) {
      console.error('Error obteniendo reportes disponibles:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error obteniendo reportes disponibles'
      };
    }
  },

  // ============================================
  // REPORTES TERAPÉUTICOS
  // ============================================

  /**
   * Generar reporte de asistencia por paciente
   * @param {Object} filtros - Filtros para el reporte
   * @param {string} filtros.fecha_inicio - Fecha inicio (YYYY-MM-DD)
   * @param {string} filtros.fecha_fin - Fecha fin (YYYY-MM-DD)
   * @param {number} [filtros.id_paciente] - ID del paciente específico
   * @param {number} [filtros.id_terapeuta] - ID del terapeuta específico
   * @returns {Promise} Promise con el reporte generado
   */
  async getReporteAsistenciaPaciente(filtros) {
    try {
      const response = await ApiService.post('/api/reportes/asistencia-paciente', filtros);
      return {
        success: true,
        data: response.data.data.data,
        metadata: response.data.data.metadata
      };
    } catch (error) {
      console.error('Error generando reporte de asistencia:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error generando reporte de asistencia'
      };
    }
  },

  /**
   * Generar reporte de progreso terapéutico
   * @param {Object} filtros - Filtros para el reporte
   * @param {number} [filtros.id_paciente] - ID del paciente específico
   * @param {number} [filtros.id_terapeuta] - ID del terapeuta específico
   * @param {string} [filtros.fecha_inicio] - Fecha inicio (YYYY-MM-DD)
   * @param {string} [filtros.fecha_fin] - Fecha fin (YYYY-MM-DD)
   * @returns {Promise} Promise con el reporte generado
   */
  async getReporteProgresoTerapeutico(filtros) {
    try {
      const response = await ApiService.post('/api/reportes/progreso-terapeutico', filtros);
      return {
        success: true,
        data: response.data.data.data,
        metadata: response.data.data.metadata
      };
    } catch (error) {
      console.error('Error generando reporte de progreso:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error generando reporte de progreso'
      };
    }
  },

  // ============================================
  // REPORTES PEDAGÓGICOS
  // ============================================

  /**
   * Generar reporte académico por estudiante
   * @param {Object} filtros - Filtros para el reporte
   * @param {number} [filtros.id_estudiante] - ID del estudiante específico
   * @param {number} [filtros.id_educador] - ID del educador específico
   * @param {string} [filtros.fecha_inicio] - Fecha inicio (YYYY-MM-DD)
   * @param {string} [filtros.fecha_fin] - Fecha fin (YYYY-MM-DD)
   * @returns {Promise} Promise con el reporte generado
   */
  async getReporteAcademicoEstudiante(filtros) {
    try {
      const response = await ApiService.post('/api/reportes/academico-estudiante', filtros);
      return {
        success: true,
        data: response.data.data.data,
        metadata: response.data.data.metadata
      };
    } catch (error) {
      console.error('Error generando reporte académico:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error generando reporte académico'
      };
    }
  },

  /**
   * Generar reporte de rendimiento por clase
   * @param {Object} filtros - Filtros para el reporte
   * @param {number} [filtros.id_sesion] - ID de la sesión específica
   * @param {number} [filtros.id_especialidad] - ID de la especialidad
   * @param {string} [filtros.fecha_inicio] - Fecha inicio (YYYY-MM-DD)
   * @param {string} [filtros.fecha_fin] - Fecha fin (YYYY-MM-DD)
   * @returns {Promise} Promise con el reporte generado
   */
  async getReporteRendimientoClase(filtros) {
    try {
      const response = await ApiService.post('/api/reportes/rendimiento-clase', filtros);
      return {
        success: true,
        data: response.data.data.data,
        metadata: response.data.data.metadata
      };
    } catch (error) {
      console.error('Error generando reporte de rendimiento:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error generando reporte de rendimiento'
      };
    }
  },

  // ============================================
  // REPORTES ADMINISTRATIVOS (Solo Administradores)
  // ============================================

  /**
   * Generar reporte de carga de trabajo del personal
   * @param {Object} filtros - Filtros para el reporte
   * @param {string} [filtros.fecha_inicio] - Fecha inicio (YYYY-MM-DD)
   * @param {string} [filtros.fecha_fin] - Fecha fin (YYYY-MM-DD)
   * @param {number} [filtros.id_especialidad] - ID de la especialidad
   * @returns {Promise} Promise con el reporte generado
   */
  async getReporteCargaTrabajoPersonal(filtros) {
    try {
      const response = await ApiService.post('/api/reportes/carga-trabajo-personal', filtros);
      return {
        success: true,
        data: response.data.data.data,
        metadata: response.data.data.metadata
      };
    } catch (error) {
      console.error('Error generando reporte de carga de trabajo:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error generando reporte de carga de trabajo'
      };
    }
  },

  /**
   * Generar reporte de utilización de recursos
   * @param {Object} filtros - Filtros para el reporte
   * @param {string} [filtros.fecha_inicio] - Fecha inicio (YYYY-MM-DD)
   * @param {string} [filtros.fecha_fin] - Fecha fin (YYYY-MM-DD)
   * @returns {Promise} Promise con el reporte generado
   */
  async getReporteUtilizacionRecursos(filtros) {
    try {
      const response = await ApiService.post('/api/reportes/utilizacion-recursos', filtros);
      return {
        success: true,
        data: response.data.data.data,
        metadata: response.data.data.metadata
      };
    } catch (error) {
      console.error('Error generando reporte de utilización:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error generando reporte de utilización'
      };
    }
  },

  /**
   * Generar estadísticas generales del centro
   * @param {Object} filtros - Filtros para el reporte
   * @param {string} [filtros.fecha_inicio] - Fecha inicio (YYYY-MM-DD)
   * @param {string} [filtros.fecha_fin] - Fecha fin (YYYY-MM-DD)
   * @returns {Promise} Promise con el reporte generado
   */
  async getEstadisticasGenerales(filtros) {
    try {
      const response = await ApiService.post('/api/reportes/estadisticas-generales', filtros);
      return {
        success: true,
        data: response.data.data.data,
        metadata: response.data.data.metadata
      };
    } catch (error) {
      console.error('Error generando estadísticas generales:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error generando estadísticas generales'
      };
    }
  },

  // ============================================
  // EXPORTACIÓN DE REPORTES
  // ============================================

  /**
   * Exportar reporte a PDF
   * @param {Object} exportData - Datos para exportar
   * @param {Array} exportData.data - Datos del reporte
   * @param {Object} exportData.metadata - Metadatos del reporte
   * @param {string} [exportData.formato] - Formato del PDF ('portrait' o 'landscape')
   * @returns {Promise} Promise con el archivo PDF
   */
  async exportarPDF(exportData) {
    try {
      console.log('Exportando PDF con datos:', exportData);
      
      const response = await ApiService.post('/api/reportes/export/pdf', exportData, {
        responseType: 'blob', // Importante para archivos binarios
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos de timeout
      });

      console.log('Respuesta PDF recibida:', response);

      // Verificar que la respuesta sea un blob
      if (!response.data || response.data.size === 0) {
        throw new Error('El servidor devolvió un archivo PDF vacío');
      }

      // Crear URL para descarga del archivo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Generar nombre del archivo
      const tipoReporte = exportData.metadata?.tipo_reporte || 'reporte';
      const fechaActual = new Date().toISOString().slice(0, 10);
      const fileName = `${tipoReporte}_${fechaActual}.pdf`;
      
      console.log(`PDF generado exitosamente: ${fileName}, tamaño: ${blob.size} bytes`);
      
      return {
        success: true,
        blob: blob,
        url: url,
        fileName: fileName
      };
    } catch (error) {
      console.error('Error exportando PDF:', error);
      console.error('Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error exportando a PDF'
      };
    }
  },

  /**
   * Exportar reporte a Excel
   * @param {Object} exportData - Datos para exportar
   * @param {Array} exportData.data - Datos del reporte
   * @param {Object} exportData.metadata - Metadatos del reporte
   * @returns {Promise} Promise con el archivo Excel
   */
  async exportarExcel(exportData) {
    try {
      const response = await ApiService.post('/api/reportes/export/excel', exportData, {
        responseType: 'blob', // Importante para archivos binarios
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      // Crear URL para descarga del archivo
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      
      // Generar nombre del archivo
      const tipoReporte = exportData.metadata?.tipo_reporte || 'reporte';
      const fechaActual = new Date().toISOString().slice(0, 10);
      const fileName = `${tipoReporte}_${fechaActual}.xlsx`;
      
      return {
        success: true,
        blob: blob,
        url: url,
        fileName: fileName
      };
    } catch (error) {
      console.error('Error exportando Excel:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error exportando a Excel'
      };
    }
  },

  // ============================================
  // SERVICIOS AUXILIARES PARA UX
  // ============================================

  /**
   * Obtener lista de pacientes para selectors
   * @returns {Promise} Promise con lista de pacientes
   */
  async getPacientesParaSelector() {
    try {
      const response = await ApiService.get('/api/pacientes');
      console.log('Response pacientes:', response.data);
      
      if (response.data.status === 'success' && response.data.data) {
        return {
          success: true,
          data: response.data.data.map(paciente => ({
            id: paciente.id,
            label: `${paciente.nombre} ${paciente.apellido}`,
            cedula: paciente.cedula,
            nombre_completo: paciente.nombre_completo
          }))
        };
      }
      return { success: false, data: [], error: 'No se pudieron obtener los pacientes' };
    } catch (error) {
      console.error('Error obteniendo pacientes:', error);
      return { 
        success: false, 
        data: [], 
        error: error.response?.data?.message || 'Error de conexión con el servidor' 
      };
    }
  },

  /**
   * Obtener lista de personal (terapeutas/educadores) para selectors
   * @returns {Promise} Promise con lista de personal
   */
  async getPersonalParaSelector() {
    try {
      const response = await ApiService.get('/api/personal');
      console.log('Response personal:', response.data);
      
      if (response.data.status === 'success' && response.data.data) {
        return {
          success: true,
          data: response.data.data.map(personal => ({
            id: personal.id,
            label: `${personal.nombre} ${personal.apellido}`,
            cedula: personal.cedula,
            nombre_completo: personal.nombre_completo,
            titulo_profesional: personal.titulo_profesional,
            especialidades: personal.especialidades || []
          }))
        };
      }
      return { success: false, data: [], error: 'No se pudo obtener el personal' };
    } catch (error) {
      console.error('Error obteniendo personal:', error);
      return { 
        success: false, 
        data: [], 
        error: error.response?.data?.message || 'Error de conexión con el servidor' 
      };
    }
  },

  /**
   * Obtener lista de especialidades para selectors
   * @returns {Promise} Promise con lista de especialidades
   */
  async getEspecialidadesParaSelector() {
    try {
      const response = await ApiService.get('/api/especialidades');
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data.map(especialidad => ({
            id: especialidad.id,
            label: especialidad.nombre,
            area: especialidad.area
          }))
        };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error('Error obteniendo especialidades:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Obtener lista de sesiones activas para selectors
   * @param {string} tipo - 'terapeutica' o 'pedagogica'
   * @returns {Promise} Promise con lista de sesiones
   */
  async getSesionesParaSelector(tipo = 'pedagogica') {
    try {
      const endpoint = tipo === 'terapeutica' ? '/api/sesiones-terapia' : '/api/sesiones-pedagogicas';
      const response = await ApiService.get(endpoint);
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data.map(sesion => ({
            id: sesion.id,
            label: sesion.titulo || sesion.nombre_clase,
            codigo: sesion.codigo_sesion,
            estado: sesion.estado
          })).filter(sesion => sesion.estado === 'en_curso' || sesion.estado === 'activa')
        };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error(`Error obteniendo sesiones ${tipo}:`, error);
      return { success: false, data: [] };
    }
  },

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Descargar archivo generado
   * @param {string} url - URL del blob
   * @param {string} fileName - Nombre del archivo
   */
  descargarArchivo(url, fileName) {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL del blob después de la descarga
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      return { success: true };
    } catch (error) {
      console.error('Error descargando archivo:', error);
      return { 
        success: false, 
        error: 'Error al descargar el archivo' 
      };
    }
  },

  /**
   * Formatear fechas para filtros
   * @param {Date} fecha - Fecha a formatear
   * @returns {string} Fecha en formato YYYY-MM-DD
   */
  formatearFecha(fecha) {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha;
    return fecha.toISOString().slice(0, 10);
  },

  /**
   * Validar filtros de fechas
   * @param {Object} filtros - Filtros a validar
   * @returns {Object} Resultado de la validación
   */
  validarFiltros(filtros) {
    const errores = [];

    if (filtros.fecha_inicio && filtros.fecha_fin) {
      const fechaInicio = new Date(filtros.fecha_inicio);
      const fechaFin = new Date(filtros.fecha_fin);
      
      if (fechaInicio > fechaFin) {
        errores.push('La fecha de inicio no puede ser mayor a la fecha de fin');
      }
    }

    if (filtros.id_paciente && (typeof filtros.id_paciente !== 'number' || filtros.id_paciente <= 0)) {
      errores.push('El ID del paciente debe ser un número válido');
    }

    if (filtros.id_terapeuta && (typeof filtros.id_terapeuta !== 'number' || filtros.id_terapeuta <= 0)) {
      errores.push('El ID del terapeuta debe ser un número válido');
    }

    return {
      valido: errores.length === 0,
      errores: errores
    };
  }
};