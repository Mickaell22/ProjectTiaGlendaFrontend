// src/services/personalService.js
// Servicio específico para el manejo de personal

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class PersonalService {
  // Obtener todo el personal
  static async getAll() {
    const response = await ApiService.get(API_ENDPOINTS.PERSONAL.BASE);
    return extractData(response);
  }

  // Obtener personal por ID
  static async getById(id) {
    const response = await ApiService.get(API_ENDPOINTS.PERSONAL.BY_ID(id));
    return extractData(response);
  }

  // Crear nuevo personal
  static async create(personalData) {
    const response = await ApiService.post(API_ENDPOINTS.PERSONAL.BASE, personalData);
    return extractData(response);
  }

  // Actualizar personal
  static async update(id, personalData) {
    const response = await ApiService.put(API_ENDPOINTS.PERSONAL.BY_ID(id), personalData);
    return extractData(response);
  }

  // Eliminar personal
  static async delete(id) {
    const response = await ApiService.delete(API_ENDPOINTS.PERSONAL.BY_ID(id));
    return extractData(response);
  }

  // Validar datos de personal
  static validatePersonalData(data) {
    const errors = {};

    if (!data.persona_id) {
      errors.persona_id = 'Debe seleccionar una persona';
    }

    if (!data.id_especialidad) {
      errors.id_especialidad = 'Debe seleccionar una especialidad principal';
    }

    if (!data.fecha_ingreso) {
      errors.fecha_ingreso = 'La fecha de ingreso es requerida';
    }

    if (!data.titulo_profesional?.trim()) {
      errors.titulo_profesional = 'El título profesional es requerido';
    } else if (data.titulo_profesional.trim().length < 3) {
      errors.titulo_profesional = 'El título profesional debe tener al menos 3 caracteres';
    }

    if (!data.cargo?.trim()) {
      errors.cargo = 'El cargo es requerido';
    } else if (data.cargo.trim().length < 3) {
      errors.cargo = 'El cargo debe tener al menos 3 caracteres';
    }

    if (!data.tipo_contrato) {
      errors.tipo_contrato = 'Debe seleccionar un tipo de contrato';
    }

    if (!data.id_centro) {
      errors.id_centro = 'Debe seleccionar un centro';
    }

    // Validar que fecha_salida sea posterior a fecha_ingreso si existe
    if (data.fecha_salida && data.fecha_ingreso) {
      const fechaIngreso = new Date(data.fecha_ingreso);
      const fechaSalida = new Date(data.fecha_salida);
      if (fechaSalida <= fechaIngreso) {
        errors.fecha_salida = 'La fecha de salida debe ser posterior a la fecha de ingreso';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Formatear datos para el backend
  static formatForBackend(frontendData) {
    const backendData = {
      id_persona: parseInt(frontendData.persona_id),
      id_especialidad: parseInt(frontendData.id_especialidad),
      fecha_ingreso: frontendData.fecha_ingreso,
      cargo: frontendData.titulo_profesional?.trim() || frontendData.cargo?.trim(),
      tipo_contrato: frontendData.tipo_contrato,
      id_centro: parseInt(frontendData.id_centro)
    };

    // Campos opcionales
    if (frontendData.fecha_salida) {
      backendData.fecha_salida = frontendData.fecha_salida;
    }
    
    if (frontendData.observaciones?.trim()) {
      backendData.observaciones = frontendData.observaciones.trim();
    }

    return backendData;
  }

  // Buscar personal por término
  static filterPersonal(personal, searchTerm) {
    if (!searchTerm?.trim()) return personal;

    const term = searchTerm.toLowerCase();
    return personal.filter(item =>
      item.nombre_completo?.toLowerCase().includes(term) ||
      item.nombre?.toLowerCase().includes(term) ||
      item.apellido?.toLowerCase().includes(term) ||
      item.titulo_profesional?.toLowerCase().includes(term) ||
      item.cedula?.includes(term) ||
      item.especialidades?.some(e => e.nombre?.toLowerCase().includes(term))
    );
  }

  // Filtrar por área
  static filterByArea(personal, area) {
    if (!area) return personal;
    return personal.filter(item => 
      item.especialidades?.some(e => e.area === area)
    );
  }

  // Obtener áreas únicas
  static getUniqueAreas(personal) {
    const areas = new Set();
    personal.forEach(p => {
      p.especialidades?.forEach(e => {
        if (e.area) areas.add(e.area);
      });
    });
    return Array.from(areas);
  }

  // Obtener estado de personal con color para UI
  static getEstadoInfo(estado) {
    const estadoMap = {
      activo: { label: 'Activo', color: 'success' },
      inactivo: { label: 'Inactivo', color: 'error' },
      suspendido: { label: 'Suspendido', color: 'warning' },
      vacaciones: { label: 'Vacaciones', color: 'info' },
    };

    return estadoMap[estado] || { label: estado, color: 'default' };
  }

  // Generar nombre completo
  static getFullName(personal) {
    return personal.nombre_completo || 
           `${personal.nombre || ''} ${personal.apellido || ''}`.trim();
  }

  // Obtener especialidades como string
  static getEspecialidadesString(especialidades) {
    if (!especialidades || especialidades.length === 0) {
      return 'Sin especialidades asignadas';
    }
    return especialidades.map(e => e.nombre).join(', ');
  }

  // Verificar si una persona ya está registrada como personal
  static checkPersonaExists(personal, personaId, excludeId = null) {
    return personal.some(p => 
      p.persona_id === parseInt(personaId) && p.id !== excludeId
    );
  }

  // Obtener colores para especialidades por área
  static getEspecialidadColor(area) {
    const colorMap = {
      terapeutico: 'primary',
      pedagogico: 'secondary',
    };
    return colorMap[area] || 'default';
  }

  // Formatear fecha para mostrar
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }


  // Obtener estados disponibles
  static getEstados() {
    return [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' },
      { value: 'suspendido', label: 'Suspendido' },
      { value: 'vacaciones', label: 'Vacaciones' }
    ];
  }

  // Obtener información de contacto
  static getContactInfo(personal) {
    return {
      telefono: personal.telefono || 'Sin teléfono',
      correo: personal.correo || 'Sin correo'
    };
  }

  // Estadísticas del personal
  static getStats(personal) {
    const total = personal.length;
    const activos = personal.filter(p => p.estado === 'activo').length;
    const porArea = {};
    
    personal.forEach(p => {
      p.especialidades?.forEach(e => {
        if (e.area) {
          porArea[e.area] = (porArea[e.area] || 0) + 1;
        }
      });
    });

    return {
      total,
      activos,
      inactivos: total - activos,
      porArea
    };
  }
}

export default PersonalService;