// src/services/especialidadService.js
// Servicio específico para el manejo de especialidades

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class EspecialidadService {
  // Obtener todas las especialidades, opcionalmente filtradas por centro
  static async getAll(centroId = null) {
    const url = centroId ?
      `${API_ENDPOINTS.ESPECIALIDADES.BASE}?centro=${centroId}` :
      API_ENDPOINTS.ESPECIALIDADES.BASE;
    const response = await ApiService.get(url);
    return extractData(response);
  }

  // Obtener especialidad por ID
  static async getById(id) {
    const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.BY_ID(id));
    return extractData(response);
  }

  // Crear nueva especialidad
  static async create(especialidadData) {
    const response = await ApiService.post(API_ENDPOINTS.ESPECIALIDADES.BASE, especialidadData);
    return extractData(response);
  }

  // Actualizar especialidad
  static async update(id, especialidadData) {
    const response = await ApiService.put(API_ENDPOINTS.ESPECIALIDADES.BY_ID(id), especialidadData);
    return extractData(response);
  }

  // Eliminar (desactivar) especialidad
  static async delete(id) {
    const response = await ApiService.delete(API_ENDPOINTS.ESPECIALIDADES.BY_ID(id));
    return extractData(response);
  }

  // Reactivar especialidad inactiva
  static async reactivar(id) {
    const response = await ApiService.put(API_ENDPOINTS.ESPECIALIDADES.REACTIVAR(id));
    return extractData(response);
  }

  // Obtener especialidades por área y centro
  static async getByArea(area, centroId = null) {
    const url = centroId ?
      `${API_ENDPOINTS.ESPECIALIDADES.BY_AREA(area)}?centro=${centroId}` :
      API_ENDPOINTS.ESPECIALIDADES.BY_AREA(area);
    const response = await ApiService.get(url);
    return extractData(response);
  }

  // Obtener especialidades activas (para combos/selects)
  static async getActivas(centroId = null) {
    const url = centroId ?
      `${API_ENDPOINTS.ESPECIALIDADES.ACTIVAS}?centro=${centroId}` :
      API_ENDPOINTS.ESPECIALIDADES.ACTIVAS;
    const response = await ApiService.get(url);
    return extractData(response);
  }

  // Obtener estadísticas agrupadas por área
  static async getEstadisticas() {
    const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.ESTADISTICAS);
    return extractData(response);
  }

  // Verificar compatibilidad entre personal y paciente
  static async getCompatibilidad(personalId, pacienteId) {
    const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.COMPATIBILIDAD(personalId, pacienteId));
    return extractData(response);
  }

  // Obtener estadísticas de asignaciones múltiples
  static async getEstadisticasMultiples() {
    const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.ESTADISTICAS_MULTIPLES);
    return extractData(response);
  }

  // Validar datos de especialidad
  static validateEspecialidadData(data) {
    const errors = {};
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s()\-,]+$/;

    if (!data.nombre?.trim()) {
      errors.nombre = 'El nombre de la especialidad es requerido';
    } else if (data.nombre.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (data.nombre.trim().length > 150) {
      errors.nombre = 'El nombre no puede exceder 150 caracteres';
    } else if (!nombreRegex.test(data.nombre.trim())) {
      errors.nombre = 'El nombre solo permite letras, numeros, espacios, parentesis, guiones y comas';
    }

    if (!data.area) {
      errors.area = 'Debe seleccionar un area';
    }

    if (!data.id_centro && !data.centro_id) {
      errors.centro = 'Debe seleccionar un centro';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Formatear datos para el backend
  static formatForBackend(frontendData) {
    return {
      nombre: frontendData.nombre?.trim(),
      area: frontendData.area,
      id_centro: frontendData.id_centro || frontendData.centro_id,
      estado: frontendData.estado || 'activo'
    };
  }

  // Buscar especialidades por término
  static filterEspecialidades(especialidades, searchTerm) {
    if (!searchTerm?.trim()) return especialidades;

    const term = searchTerm.toLowerCase();
    return especialidades.filter(item =>
      item.nombre?.toLowerCase().includes(term) ||
      item.area?.toLowerCase().includes(term) ||
      item.centro_nombre?.toLowerCase().includes(term) ||
      item.centro_codigo?.toLowerCase().includes(term)
    );
  }

  // Filtrar por área
  static filterByArea(especialidades, area) {
    if (!area) return especialidades;
    return especialidades.filter(item => item.area === area);
  }

  // Filtrar por centro
  static filterByCentro(especialidades, centroId) {
    if (!centroId) return especialidades;
    return especialidades.filter(item => item.id_centro === parseInt(centroId));
  }

  // Obtener áreas disponibles (sin tildes, alineado con backend)
  static getAreas() {
    return [
      { value: 'Especialidad terapeutica', label: 'Especialidad terapeutica' },
      { value: 'Especialidad pedagogica', label: 'Especialidad pedagogica' }
    ];
  }

  // Obtener icono por área
  static getAreaIcon(area) {
    const iconMap = {
      'Especialidad terapeutica': 'LocalHospital',
      'Especialidad pedagogica': 'School'
    };
    return iconMap[area] || 'Work';
  }

  // Obtener color por área
  static getAreaColor(area) {
    const colorMap = {
      'Especialidad terapeutica': 'primary',
      'Especialidad pedagogica': 'secondary'
    };
    return colorMap[area] || 'default';
  }

  // Obtener estados disponibles
  static getEstados() {
    return [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' }
    ];
  }

  // Obtener estado con color para UI
  static getEstadoInfo(estado) {
    const estadoMap = {
      activo: { label: 'Activo', color: 'success' },
      inactivo: { label: 'Inactivo', color: 'error' }
    };

    return estadoMap[estado] || { label: estado, color: 'default' };
  }

  // Obtener label del área
  static getAreaLabel(area) {
    const labelMap = {
      'Especialidad terapeutica': 'Especialidad terapeutica',
      'Especialidad pedagogica': 'Especialidad pedagogica'
    };
    return labelMap[area] || area;
  }

  // Obtener información completa del área con icono y color
  static getAreaInfo(area) {
    const areaMap = {
      'Especialidad terapeutica': {
        label: 'Especialidad terapeutica',
        color: 'primary',
        icon: 'LocalHospital'
      },
      'Especialidad pedagogica': {
        label: 'Especialidad pedagogica',
        color: 'secondary',
        icon: 'School'
      }
    };
    return areaMap[area] || { label: area, color: 'default', icon: 'Work' };
  }

  // Verificar si un nombre ya existe en el mismo centro
  static checkNombreExists(especialidades, nombre, centroId, excludeId = null) {
    return especialidades.some(esp =>
      esp.nombre?.toLowerCase() === nombre?.toLowerCase() &&
      esp.id_centro === parseInt(centroId) &&
      esp.id !== excludeId
    );
  }

  // Formatear fecha para mostrar
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Estadísticas de especialidades (locales, para UI)
  static getStats(especialidades) {
    const total = especialidades.length;
    const activas = especialidades.filter(e => e.estado === 'activo').length;
    const porArea = {};

    especialidades.forEach(e => {
      if (e.area) {
        porArea[e.area] = (porArea[e.area] || 0) + 1;
      }
    });

    return {
      total,
      activas,
      inactivas: total - activas,
      porArea
    };
  }

  // Agrupar especialidades por área
  static groupByArea(especialidades) {
    const grupos = {};
    especialidades.forEach(esp => {
      const area = esp.area || 'sin_area';
      if (!grupos[area]) {
        grupos[area] = [];
      }
      grupos[area].push(esp);
    });
    return grupos;
  }

  // Obtener especialidades activas por área (filtro local)
  static getActivasByArea(especialidades, area) {
    return especialidades.filter(esp =>
      esp.area === area && esp.estado === 'activo'
    );
  }
}

export default EspecialidadService;
