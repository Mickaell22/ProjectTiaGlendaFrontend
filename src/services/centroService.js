// src/services/centroService.js
// Servicio específico para el manejo de centros

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class CentroService {
  // Obtener todos los centros activos (requiere autenticación)
  static async getAll() {
    const response = await ApiService.get(API_ENDPOINTS.CENTROS.BASE);
    return extractData(response);
  }

  // Obtener centros disponibles para selector de login (público, sin token)
  static async getCentrosDisponibles() {
    const response = await ApiService.get(API_ENDPOINTS.CENTROS.DISPONIBLES);
    return extractData(response);
  }

  // Obtener centro por ID
  static async getById(id) {
    const response = await ApiService.get(API_ENDPOINTS.CENTROS.BY_ID(id));
    return extractData(response);
  }

  // Obtener centro por código
  static async getByCode(codigo) {
    const response = await ApiService.get(API_ENDPOINTS.CENTROS.BY_CODIGO(codigo));
    return extractData(response);
  }

  // Obtener estadísticas del centro
  static async getEstadisticas(id) {
    const response = await ApiService.get(API_ENDPOINTS.CENTROS.ESTADISTICAS(id));
    return extractData(response);
  }

  // Crear nuevo centro
  static async create(centroData) {
    const response = await ApiService.post(API_ENDPOINTS.CENTROS.BASE, centroData);
    return extractData(response);
  }

  // Actualizar centro
  static async update(id, centroData) {
    const response = await ApiService.put(API_ENDPOINTS.CENTROS.BY_ID(id), centroData);
    return extractData(response);
  }

  // Eliminar centro (soft delete)
  static async delete(id) {
    const response = await ApiService.delete(API_ENDPOINTS.CENTROS.BY_ID(id));
    return extractData(response);
  }

  // Reactivar centro inactivo
  static async reactivar(id) {
    const response = await ApiService.put(API_ENDPOINTS.CENTROS.REACTIVAR(id));
    return extractData(response);
  }

  // Filtrar centros por término de búsqueda
  static filterCentros(centros, searchTerm) {
    if (!searchTerm?.trim()) return centros;

    const term = searchTerm.toLowerCase();
    return centros.filter(centro =>
      centro.nombre?.toLowerCase().includes(term) ||
      centro.codigo?.toLowerCase().includes(term) ||
      centro.direccion?.toLowerCase().includes(term) ||
      centro.telefono?.includes(term)
    );
  }

  // Obtener centros activos solamente
  static getActiveCentros(centros) {
    return centros.filter(centro => centro.estado === 'activo');
  }

  // Formatear datos para el backend
  static formatForBackend(frontendData) {
    return {
      nombre: frontendData.nombre?.trim(),
      codigo: frontendData.codigo?.trim()?.toUpperCase(),
      direccion: frontendData.direccion?.trim() || undefined,
      telefono: frontendData.telefono?.trim() || undefined,
      email: frontendData.email?.trim() || undefined,
      turno_principal: frontendData.turno_principal || undefined,
      horario_apertura: frontendData.horario_apertura || undefined,
      horario_cierre: frontendData.horario_cierre || undefined,
      observaciones: frontendData.observaciones?.trim() || undefined,
    };
  }

  // Validar datos de centro
  static validateCentroData(data) {
    const errors = {};

    if (!data.nombre?.trim()) {
      errors.nombre = 'El nombre del centro es requerido';
    }

    if (!data.codigo?.trim()) {
      errors.codigo = 'El código del centro es requerido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default CentroService;
