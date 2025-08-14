// src/services/especialidadService.js
// Servicio específico para el manejo de especialidades

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class EspecialidadService {
  // Obtener todas las especialidades
  static async getAll() {
    const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.BASE);
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

  // Eliminar especialidad
  static async delete(id) {
    const response = await ApiService.delete(API_ENDPOINTS.ESPECIALIDADES.BY_ID(id));
    return extractData(response);
  }

  // Validar datos de especialidad
  static validateEspecialidadData(data) {
    const errors = {};

    if (!data.nombre?.trim()) {
      errors.nombre = 'El nombre de la especialidad es requerido';
    } else if (data.nombre.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!data.area) {
      errors.area = 'Debe seleccionar un área';
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
      estado: frontendData.estado || 'activo'
    };
  }

  // Buscar especialidades por término
  static filterEspecialidades(especialidades, searchTerm) {
    if (!searchTerm?.trim()) return especialidades;

    const term = searchTerm.toLowerCase();
    return especialidades.filter(item =>
      item.nombre?.toLowerCase().includes(term) ||
      item.area?.toLowerCase().includes(term)
    );
  }

  // Filtrar por área
  static filterByArea(especialidades, area) {
    if (!area) return especialidades;
    return especialidades.filter(item => item.area === area);
  }

  // Obtener áreas disponibles
  static getAreas() {
    return [
      { value: 'terapeutico', label: 'Terapéutico' },
      { value: 'pedagogico', label: 'Pedagógico' }
    ];
  }

  // Obtener icono por área
  static getAreaIcon(area) {
    const iconMap = {
      terapeutico: 'LocalHospital',
      pedagogico: 'School'
    };
    return iconMap[area] || 'Work';
  }

  // Obtener color por área
  static getAreaColor(area) {
    const colorMap = {
      terapeutico: 'primary',
      pedagogico: 'secondary'
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

  // Obtener áreas disponibles
  static getAreas() {
    return [
      { value: 'terapeutico', label: 'Terapéutico' },
      { value: 'pedagogico', label: 'Pedagógico' }
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
      terapeutico: 'Terapéutico',
      pedagogico: 'Pedagógico'
    };
    return labelMap[area] || area;
  }

  // Obtener información completa del área con icono y color
  static getAreaInfo(area) {
    const areaMap = {
      terapeutico: { 
        label: 'Terapéutico', 
        color: 'primary',
        icon: 'LocalHospital'
      },
      pedagogico: { 
        label: 'Pedagógico', 
        color: 'secondary',
        icon: 'School'
      }
    };
    return areaMap[area] || { label: area, color: 'default', icon: 'Work' };
  }

  // Verificar si un nombre ya existe
  static checkNombreExists(especialidades, nombre, excludeId = null) {
    return especialidades.some(esp => 
      esp.nombre?.toLowerCase() === nombre?.toLowerCase() && esp.id !== excludeId
    );
  }

  // Filtrar especialidades por término de búsqueda
  static filterEspecialidades(especialidades, searchTerm) {
    if (!searchTerm?.trim()) return especialidades;

    const term = searchTerm.toLowerCase();
    return especialidades.filter(esp =>
      esp.nombre?.toLowerCase().includes(term) ||
      esp.descripcion?.toLowerCase().includes(term) ||
      esp.area?.toLowerCase().includes(term)
    );
  }

  // Formatear fecha para mostrar
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Estadísticas de especialidades
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

  // Obtener especialidades activas por área
  static getActivasByArea(especialidades, area) {
    return especialidades.filter(esp => 
      esp.area === area && esp.estado === 'activo'
    );
  }

  // Validar antes de eliminar (verificar si está en uso)
  static validateBeforeDelete(especialidad) {
    // Esta lógica se puede expandir para verificar si la especialidad
    // está siendo usada por personal, pacientes, etc.
    return {
      canDelete: true,
      message: '',
      warnings: []
    };
  }
}

export default EspecialidadService;