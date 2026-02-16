// src/services/tutorService.js
// Servicio específico para el manejo de tutores

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

// Parentescos válidos aceptados por el backend
const PARENTESCOS_VALIDOS = [
  { value: 'padre', label: 'Padre' },
  { value: 'madre', label: 'Madre' },
  { value: 'abuelo', label: 'Abuelo' },
  { value: 'abuela', label: 'Abuela' },
  { value: 'tio', label: 'Tío' },
  { value: 'tia', label: 'Tía' },
  { value: 'hermano', label: 'Hermano' },
  { value: 'hermana', label: 'Hermana' },
  { value: 'tutor_legal', label: 'Tutor Legal' }
];

const PARENTESCOS_VALUES = PARENTESCOS_VALIDOS.map(p => p.value);

export class TutorService {
  // ==================== API CALLS ====================

  // Obtener todos los tutores
  static async getAll() {
    const response = await ApiService.get(API_ENDPOINTS.TUTORES.BASE);
    return extractData(response);
  }

  // Obtener tutor por ID (incluye pacientes)
  static async getById(id) {
    const response = await ApiService.get(API_ENDPOINTS.TUTORES.BY_ID(id));
    return extractData(response);
  }

  // Crear nuevo tutor
  static async create(tutorData) {
    const response = await ApiService.post(API_ENDPOINTS.TUTORES.BASE, tutorData);
    return extractData(response);
  }

  // Actualizar tutor
  static async update(id, tutorData) {
    const response = await ApiService.put(API_ENDPOINTS.TUTORES.BY_ID(id), tutorData);
    return extractData(response);
  }

  // Desactivar tutor (soft delete)
  static async delete(id) {
    const response = await ApiService.delete(API_ENDPOINTS.TUTORES.BY_ID(id));
    return extractData(response);
  }

  // Reactivar tutor (PATCH)
  static async reactivar(id) {
    const response = await ApiService.patch(API_ENDPOINTS.TUTORES.REACTIVAR(id));
    return extractData(response);
  }

  // Obtener tutores activos (para combos/selects)
  static async getActivos() {
    const response = await ApiService.get(API_ENDPOINTS.TUTORES.ACTIVOS);
    return extractData(response);
  }

  // Obtener estadísticas de tutores
  static async getEstadisticas() {
    const response = await ApiService.get(API_ENDPOINTS.TUTORES.ESTADISTICAS);
    return extractData(response);
  }

  // Obtener personas disponibles para ser tutor
  static async getPersonasDisponibles() {
    const response = await ApiService.get(API_ENDPOINTS.TUTORES.PERSONAS_DISPONIBLES);
    return extractData(response);
  }

  // ==================== VALIDACIONES ====================

  // Validar datos de tutor
  static validateTutorData(data, isEditing = false) {
    const errors = {};

    // Validar ID de persona (requerido solo en creación)
    if (!isEditing) {
      if (!data.id_persona) {
        errors.id_persona = 'Debe seleccionar una persona';
      } else if (isNaN(parseInt(data.id_persona)) || parseInt(data.id_persona) <= 0) {
        errors.id_persona = 'El ID de persona debe ser un número válido';
      }
    }

    // Validar parentesco (requerido)
    if (!data.parentesco?.trim()) {
      errors.parentesco = 'El parentesco es requerido';
    } else if (!PARENTESCOS_VALUES.includes(data.parentesco.trim())) {
      errors.parentesco = 'Seleccione un parentesco válido';
    }

    // Validar teléfono de empresa si se proporciona
    if (data.telefono_empresa && data.telefono_empresa.trim()) {
      const telefonoRegex = /^[0-9+\-\s()]+$/;
      if (!telefonoRegex.test(data.telefono_empresa.trim())) {
        errors.telefono_empresa = 'El teléfono de empresa no es válido';
      }
    }

    // Validar dirección de empresa (max 255 - alineado con backend)
    if (data.direccion_empresa && data.direccion_empresa.trim().length > 255) {
      errors.direccion_empresa = 'La dirección de empresa no puede superar los 255 caracteres';
    }

    // Validar nombre de empresa (max 150 - alineado con backend)
    if (data.nombre_empresa && data.nombre_empresa.trim().length > 150) {
      errors.nombre_empresa = 'El nombre de empresa no puede superar los 150 caracteres';
    }

    // Validar ocupación (max 100)
    if (data.ocupacion && data.ocupacion.trim().length > 100) {
      errors.ocupacion = 'La ocupación no puede superar los 100 caracteres';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Formatear datos para el backend
  static formatForBackend(frontendData, selectedPerson = null, isEditing = false) {
    const payload = {
      parentesco: frontendData.parentesco?.trim(),
      ocupacion: frontendData.ocupacion?.trim() || '',
      direccion_empresa: frontendData.direccion_empresa?.trim() || '',
      telefono_empresa: frontendData.telefono_empresa?.trim() || '',
      nombre_empresa: frontendData.nombre_empresa?.trim() || '',
    };

    // En creación, incluir id_persona (requerido)
    // En edición, NO enviar id_persona (no se puede cambiar)
    if (!isEditing) {
      payload.id_persona = frontendData.id_persona || (selectedPerson ? selectedPerson.id : null);
    }

    return payload;
  }

  // ==================== FILTROS Y UTILIDADES ====================

  // Buscar tutores por término
  static filterTutores(tutores, searchTerm) {
    if (!searchTerm?.trim()) return tutores;

    const term = searchTerm.toLowerCase();
    return tutores.filter(item =>
      item.nombre_completo?.toLowerCase().includes(term) ||
      item.nombre?.toLowerCase().includes(term) ||
      item.apellido?.toLowerCase().includes(term) ||
      item.cedula?.includes(term) ||
      item.parentesco?.toLowerCase().includes(term) ||
      item.nombre_empresa?.toLowerCase().includes(term) ||
      item.ocupacion?.toLowerCase().includes(term)
    );
  }

  // Filtrar por estado
  static filterByEstado(tutores, estado) {
    if (!estado) return tutores;
    return tutores.filter(item => item.estado === estado);
  }

  // Filtrar por parentesco
  static filterByParentesco(tutores, parentesco) {
    if (!parentesco) return tutores;
    return tutores.filter(item => item.parentesco?.toLowerCase().includes(parentesco.toLowerCase()));
  }

  // Obtener estados disponibles (solo activo/inactivo, alineado con backend)
  static getEstados() {
    return [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' }
    ];
  }

  // Obtener parentescos válidos
  static getParentescosComunes() {
    return PARENTESCOS_VALIDOS;
  }

  // Obtener estado con color para UI
  static getEstadoInfo(estado) {
    const estadoMap = {
      activo: { label: 'Activo', color: 'success' },
      inactivo: { label: 'Inactivo', color: 'warning' }
    };

    return estadoMap[estado] || { label: estado, color: 'default' };
  }

  // Obtener color por parentesco para UI
  static getParentescoColor(parentesco) {
    const colorMap = {
      'padre': 'primary',
      'madre': 'secondary',
      'abuelo': 'info',
      'abuela': 'info',
      'tio': 'warning',
      'tia': 'warning',
      'hermano': 'success',
      'hermana': 'success',
      'tutor_legal': 'error'
    };

    const parentescoKey = parentesco?.toLowerCase().replace(/\s+/g, '_');
    return colorMap[parentescoKey] || 'default';
  }

  // Generar nombre completo
  static getFullName(tutor) {
    return tutor.nombre_completo ||
           `${tutor.nombre || ''} ${tutor.apellido || ''}`.trim();
  }

  // Verificar si una persona ya está registrada como tutor
  static checkPersonaExists(tutores, personaId, excludeId = null) {
    return tutores.some(t =>
      t.id_persona === parseInt(personaId) && t.id !== excludeId
    );
  }

  // Formatear fecha para mostrar
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Obtener información de contacto (campos alineados con backend)
  static getContactInfo(tutor) {
    return {
      telefono: tutor.telefono || 'Sin teléfono',
      telefonoEmpresa: tutor.telefono_empresa || 'Sin teléfono de empresa',
      email: tutor.email || 'Sin correo',
      direccion: tutor.direccion || 'Sin dirección'
    };
  }

  // Obtener información laboral (campos alineados con backend)
  static getLaboralInfo(tutor) {
    return {
      empresa: tutor.nombre_empresa || 'Sin empresa',
      ocupacion: tutor.ocupacion || 'Sin ocupación',
      direccionEmpresa: tutor.direccion_empresa || 'Sin dirección de empresa'
    };
  }

  // Calcular edad si tiene fecha de nacimiento
  static calculateAge(fechaNacimiento) {
    if (!fechaNacimiento) return 'N/A';

    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return `${age} años`;
  }

  // Obtener tutores por parentesco
  static getTutoresByParentesco(tutores) {
    const grupos = {};
    tutores.forEach(tutor => {
      const parentesco = tutor.parentesco || 'sin_parentesco';
      if (!grupos[parentesco]) {
        grupos[parentesco] = [];
      }
      grupos[parentesco].push(tutor);
    });
    return grupos;
  }

  // Estadísticas de tutores (client-side, campos alineados con backend)
  static getStats(tutores) {
    const total = tutores.length;
    const activos = tutores.filter(t => t.estado === 'activo').length;

    const porParentesco = {};
    tutores.forEach(t => {
      if (t.parentesco) {
        porParentesco[t.parentesco] = (porParentesco[t.parentesco] || 0) + 1;
      }
    });

    const conTrabajoRegistrado = tutores.filter(t =>
      t.nombre_empresa || t.ocupacion
    ).length;

    return {
      total,
      activos,
      inactivos: total - activos,
      porParentesco,
      conTrabajoRegistrado,
      porcentajeConTrabajo: total > 0 ? Math.round((conTrabajoRegistrado / total) * 100) : 0
    };
  }

  // Obtener tutores activos (filtrado client-side)
  static getTutoresActivosList(tutores) {
    return tutores.filter(t => t.estado === 'activo');
  }

  // Formatear parentesco para mostrar
  static formatParentesco(parentesco) {
    if (!parentesco) return 'Sin especificar';

    const parentescoMap = {};
    PARENTESCOS_VALIDOS.forEach(p => {
      parentescoMap[p.value] = p.label;
    });

    return parentescoMap[parentesco.toLowerCase()] ||
           parentesco.charAt(0).toUpperCase() + parentesco.slice(1).toLowerCase();
  }

  // Generar resumen de contacto para emergencias
  static getEmergencyContactSummary(tutor) {
    const summary = [];

    summary.push(`${this.getFullName(tutor)} (${this.formatParentesco(tutor.parentesco)})`);

    if (tutor.telefono) {
      summary.push(`Tel: ${tutor.telefono}`);
    }

    if (tutor.telefono_empresa && tutor.telefono_empresa !== tutor.telefono) {
      summary.push(`Empresa: ${tutor.telefono_empresa}`);
    }

    return summary.join(' • ');
  }

  // Obtener información completa del tutor
  static getFullTutorInfo(tutor) {
    return {
      personal: {
        nombre: this.getFullName(tutor),
        cedula: tutor.cedula,
        parentesco: this.formatParentesco(tutor.parentesco)
      },
      contacto: this.getContactInfo(tutor),
      laboral: this.getLaboralInfo(tutor),
      estado: this.getEstadoInfo(tutor.estado),
      fechas: {
        creacion: this.formatDate(tutor.fecha_creacion),
        modificacion: this.formatDate(tutor.fecha_modificacion)
      }
    };
  }
}

export default TutorService;
