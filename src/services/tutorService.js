// src/services/tutorService.js
// Servicio específico para el manejo de tutores

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class TutorService {
  // Obtener todos los tutores
  static async getAll() {
    const response = await ApiService.get(API_ENDPOINTS.TUTORES.BASE);
    return extractData(response);
  }

  // Obtener tutor por ID
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

  // Eliminar tutor
  static async delete(id) {
    const response = await ApiService.delete(API_ENDPOINTS.TUTORES.BY_ID(id));
    return extractData(response);
  }

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
    } else if (data.parentesco.trim().length < 2) {
      errors.parentesco = 'El parentesco debe tener al menos 2 caracteres';
    }

    // Validar teléfono de emergencia si se proporciona
    if (data.telefono_empresa && data.telefono_empresa.trim()) {
      const telefonoRegex = /^[0-9+\-\s()]+$/;
      if (!telefonoRegex.test(data.telefono_empresa.trim())) {
        errors.telefono_empresa = 'El teléfono de emergencia no es válido';
      }
    }

    // Validar dirección de trabajo si se proporciona
    if (data.direccion_empresa && data.direccion_empresa.trim().length > 500) {
      errors.direccion_empresa = 'La dirección de trabajo no puede superar los 500 caracteres';
    }

    // Validar nombre de empresa si se proporciona
    if (data.nombre_empresa && data.nombre_empresa.trim().length > 100) {
      errors.nombre_empresa = 'El nombre de empresa no puede superar los 100 caracteres';
    }

    // Validar ocupación si se proporciona
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
      // Campos específicos del tutor
      parentesco: frontendData.parentesco?.trim(),
      ocupacion: frontendData.ocupacion?.trim() || '',
      direccion_empresa: frontendData.direccion_empresa?.trim() || '',
      telefono_empresa: frontendData.telefono_empresa?.trim() || '',
      nombre_empresa: frontendData.nombre_empresa?.trim() || '',
      estado: frontendData.estado || 'activo'
    };

    // En creación, incluir id_persona (requerido)
    // En edición, NO enviar id_persona (no se puede cambiar)
    if (!isEditing) {
      payload.id_persona = frontendData.id_persona || (selectedPerson ? selectedPerson.id : null);
    }

    return payload;
  }

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
      item.empresa_trabajo?.toLowerCase().includes(term) ||
      item.cargo_trabajo?.toLowerCase().includes(term)
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

  // Obtener estados disponibles
  static getEstados() {
    return [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' },
      { value: 'eliminado', label: 'Eliminado' }
    ];
  }

  // Obtener parentescos comunes
  static getParentescosComunes() {
    return [
      { value: 'padre', label: 'Padre' },
      { value: 'madre', label: 'Madre' },
      { value: 'abuelo', label: 'Abuelo' },
      { value: 'abuela', label: 'Abuela' },
      { value: 'tio', label: 'Tío' },
      { value: 'tia', label: 'Tía' },
      { value: 'hermano', label: 'Hermano' },
      { value: 'hermana', label: 'Hermana' },
      { value: 'primo', label: 'Primo' },
      { value: 'prima', label: 'Prima' },
      { value: 'tutor_legal', label: 'Tutor Legal' },
      { value: 'cuidador', label: 'Cuidador' },
      { value: 'otro', label: 'Otro' }
    ];
  }

  // Obtener estado con color para UI
  static getEstadoInfo(estado) {
    const estadoMap = {
      activo: { label: 'Activo', color: 'success' },
      inactivo: { label: 'Inactivo', color: 'warning' },
      eliminado: { label: 'Eliminado', color: 'error' }
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
      'tutor_legal': 'error',
      'cuidador': 'default',
      'otro': 'default'
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
      t.persona_id === parseInt(personaId) && t.id !== excludeId
    );
  }

  // Formatear fecha para mostrar
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Obtener información de contacto
  static getContactInfo(tutor) {
    return {
      telefono: tutor.telefono || 'Sin teléfono',
      telefonoEmergencia: tutor.telefono_emergencia || 'Sin teléfono de emergencia',
      correo: tutor.correo || 'Sin correo',
      direccion: tutor.direccion || 'Sin dirección'
    };
  }

  // Obtener información laboral
  static getLaboralInfo(tutor) {
    return {
      empresa: tutor.empresa_trabajo || 'Sin empresa',
      cargo: tutor.cargo_trabajo || 'Sin cargo',
      direccionTrabajo: tutor.direccion_trabajo || 'Sin dirección de trabajo'
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

  // Estadísticas de tutores
  static getStats(tutores) {
    const total = tutores.length;
    const activos = tutores.filter(t => t.estado === 'activo').length;
    
    const porParentesco = {};
    tutores.forEach(t => {
      if (t.parentesco) {
        porParentesco[t.parentesco] = (porParentesco[t.parentesco] || 0) + 1;
      }
    });

    // Contar tutores con información laboral
    const conTrabajoRegistrado = tutores.filter(t => 
      t.empresa_trabajo || t.cargo_trabajo
    ).length;

    // Contar tutores con teléfono de emergencia
    const conTelefonoEmergencia = tutores.filter(t => t.telefono_emergencia).length;

    return {
      total,
      activos,
      inactivos: total - activos,
      porParentesco,
      conTrabajoRegistrado,
      conTelefonoEmergencia,
      porcentajeConTrabajo: total > 0 ? Math.round((conTrabajoRegistrado / total) * 100) : 0,
      porcentajeConEmergencia: total > 0 ? Math.round((conTelefonoEmergencia / total) * 100) : 0
    };
  }

  // Obtener tutores activos
  static getTutoresActivos(tutores) {
    return tutores.filter(t => t.estado === 'activo');
  }

  // Buscar tutores disponibles (activos sin asignaciones específicas si es necesario)
  static getTutoresDisponibles(tutores) {
    return this.getTutoresActivos(tutores);
  }

  // Validar antes de eliminar (verificar si tiene pacientes asignados)
  static validateBeforeDelete(tutor, pacientes = []) {
    const warnings = [];
    
    // Verificar si el tutor tiene pacientes asignados
    const pacientesAsignados = pacientes.filter(p => p.tutor_id === tutor.id);
    
    if (pacientesAsignados.length > 0) {
      warnings.push(`Este tutor tiene ${pacientesAsignados.length} paciente(s) asignado(s)`);
    }

    return {
      canDelete: pacientesAsignados.length === 0,
      message: warnings.length > 0 ? 
        'No se puede eliminar este tutor por las siguientes razones:' : 
        '',
      warnings
    };
  }

  // Formatear parentesco para mostrar
  static formatParentesco(parentesco) {
    if (!parentesco) return 'Sin especificar';
    
    const parentescoMap = {
      'padre': 'Padre',
      'madre': 'Madre',
      'abuelo': 'Abuelo',
      'abuela': 'Abuela',
      'tio': 'Tío',
      'tia': 'Tía',
      'hermano': 'Hermano',
      'hermana': 'Hermana',
      'primo': 'Primo',
      'prima': 'Prima',
      'tutor_legal': 'Tutor Legal',
      'cuidador': 'Cuidador',
      'otro': 'Otro'
    };

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
    
    if (tutor.telefono_emergencia && tutor.telefono_emergencia !== tutor.telefono) {
      summary.push(`Emergencia: ${tutor.telefono_emergencia}`);
    }

    return summary.join(' • ');
  }

  // Obtener información completa del tutor
  static getFullTutorInfo(tutor) {
    return {
      personal: {
        nombre: this.getFullName(tutor),
        cedula: tutor.cedula,
        edad: this.calculateAge(tutor.fecha_nacimiento),
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