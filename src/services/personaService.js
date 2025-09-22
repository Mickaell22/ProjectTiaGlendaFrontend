// src/services/personaService.js
// Servicio específico para el manejo de personas

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class PersonaService {
  // Obtener todas las personas
  static async getAll() {
    const response = await ApiService.get(API_ENDPOINTS.PERSONAS.BASE);
    return extractData(response);
  }

  // Obtener persona por ID
  static async getById(id) {
    const response = await ApiService.get(API_ENDPOINTS.PERSONAS.BY_ID(id));
    return extractData(response);
  }

  // Crear nueva persona
  static async create(personaData) {
    const response = await ApiService.post(API_ENDPOINTS.PERSONAS.BASE, personaData);
    return extractData(response);
  }

  // Actualizar persona
  static async update(id, personaData) {
    const response = await ApiService.put(API_ENDPOINTS.PERSONAS.BY_ID(id), personaData);
    return extractData(response);
  }

  // Eliminar persona
  static async delete(id) {
    const response = await ApiService.delete(API_ENDPOINTS.PERSONAS.BY_ID(id));
    return extractData(response);
  }

  // Obtener personas disponibles para crear usuarios
  static async getAvailableForUsers() {
    const response = await ApiService.get(API_ENDPOINTS.PERSONAS.DISPONIBLES);
    return extractData(response);
  }

  // Validar datos de persona
  static validatePersonaData(data) {
    const errors = {};

    if (!data.nombre?.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!data.apellido?.trim()) {
      errors.apellido = 'El apellido es requerido';
    }

    if (!data.cedula?.trim()) {
      errors.cedula = 'La cédula es requerida';
    } else if (data.cedula.trim().length < 6) {
      errors.cedula = 'La cédula debe tener al menos 6 caracteres';
    }

    if (data.telefono && data.telefono.trim() && data.telefono.trim().length < 7) {
      errors.telefono = 'El teléfono debe tener al menos 7 caracteres';
    }

    if (data.correo && data.correo.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(data.correo.trim())) {
        errors.correo = 'El formato del correo no es válido';
      }
    }

    // La dirección es opcional

    // La fecha de nacimiento es opcional

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Formatear datos para el backend
  static formatForBackend(frontendData) {
    return {
      nombre: frontendData.nombre?.trim(),
      apellido: frontendData.apellido?.trim(),
      cedula: frontendData.cedula?.trim(),
      telefono: frontendData.telefono?.trim(),
      correo: frontendData.correo?.trim(),
      direccion: frontendData.direccion?.trim(),
      fecha_nacimiento: PersonaService.formatDateForBackend(frontendData.fecha_nacimiento),
      estado: frontendData.estado || 'activo'
    };
  }

  // Formatear datos para el frontend
  static formatForFrontend(backendData) {
    return {
      ...backendData,
      fechaNacimiento: backendData.fecha_nacimiento
    };
  }

  // Buscar personas por término
  static filterPersonas(personas, searchTerm) {
    if (!searchTerm?.trim()) return personas;

    const term = searchTerm.toLowerCase();
    return personas.filter(persona =>
      persona.nombre?.toLowerCase().includes(term) ||
      persona.apellido?.toLowerCase().includes(term) ||
      persona.cedula?.includes(term) ||
      persona.correo?.toLowerCase().includes(term)
    );
  }

  // Verificar si una cédula ya existe
  static checkCedulaExists(personas, cedula, excludeId = null) {
    return personas.some(persona => 
      persona.cedula === cedula && persona.id !== excludeId
    );
  }

  // Verificar si un email ya existe
  static checkEmailExists(personas, email, excludeId = null) {
    if (!email) return false;
    return personas.some(persona => 
      persona.correo?.toLowerCase() === email.toLowerCase() && persona.id !== excludeId
    );
  }

  // Filtrar por estado
  static filterByEstado(personas, estado) {
    if (!estado) return personas;
    return personas.filter(persona => persona.estado === estado);
  }

  // Generar nombre completo
  static getFullName(persona) {
    return `${persona.nombre || ''} ${persona.apellido || ''}`.trim();
  }

  // Calcular edad
  static calculateAge(fechaNacimiento) {
    if (!fechaNacimiento) return 'N/A';
    const birth = new Date(fechaNacimiento);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // Formatear fecha
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Formatear fecha para input de tipo date (evita problemas de zona horaria)
  static formatDateForInput(dateString) {
    if (!dateString) {
      return '';
    }
    
    // Si ya está en formato YYYY-MM-DD, devolverla tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Si viene del backend como timestamp (formato GMT), usar split('T')[0]
    if (dateString.includes('T')) {
      const result = dateString.split('T')[0];
      return result;
    }
    
    // Si viene en formato "Wed, 06 Aug 2025 00:00:00 GMT", convertir
    if (dateString.includes('GMT') || dateString.includes(',')) {
      try {
        const date = new Date(dateString);
        // Usar getFullYear, getMonth, getDate para evitar zona horaria
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const result = `${year}-${month}-${day}`;
        return result;
      } catch (error) {
        return '';
      }
    }
    
    // Si es una fecha completa, convertirla
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      return result;
    } catch (error) {
      return '';
    }
  }

  // Formatear fecha para enviar al backend
  static formatDateForBackend(dateString) {
    if (!dateString) return null;
    
    // Si ya está en formato YYYY-MM-DD, está bien
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    return dateString;
  }

  // Obtener estados disponibles
  static getEstados() {
    return [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' }
    ];
  }

  // Obtener estado de la persona con color para UI
  static getEstadoInfo(estado) {
    const estadoMap = {
      activo: { label: 'Activo', color: 'success' },
      inactivo: { label: 'Inactivo', color: 'error' },
    };

    return estadoMap[estado] || { label: estado, color: 'default' };
  }
}

export default PersonaService;