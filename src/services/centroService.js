// src/services/centroService.js
// Servicio específico para el manejo de centros

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class CentroService {
  // Obtener todos los centros
  static async getAll() {
    const response = await ApiService.get(API_ENDPOINTS.CENTROS.DISPONIBLES);
    return extractData(response);
  }

  // Obtener centro por ID
  static async getById(id) {
    const response = await ApiService.get(API_ENDPOINTS.CENTROS.BY_ID(id));
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

  // Eliminar centro
  static async delete(id) {
    const response = await ApiService.delete(API_ENDPOINTS.CENTROS.BY_ID(id));
    return extractData(response);
  }

  // Filtrar centros por término de búsqueda
  static filterCentros(centros, searchTerm) {
    if (!searchTerm?.trim()) return centros;

    const term = searchTerm.toLowerCase();
    return centros.filter(centro =>
      centro.nombre?.toLowerCase().includes(term) ||
      centro.direccion?.toLowerCase().includes(term) ||
      centro.telefono?.includes(term)
    );
  }

  // Obtener centros activos solamente
  static getActiveCentros(centros) {
    // Los centros del endpoint centros-disponibles no tienen campo estado
    // Todos los que devuelve son considerados activos
    return centros;
  }

  // Formatear datos para el backend
  static formatForBackend(frontendData) {
    return {
      nombre: frontendData.nombre?.trim(),
      direccion: frontendData.direccion?.trim(),
      telefono: frontendData.telefono?.trim(),
      estado: frontendData.estado || 'activo'
    };
  }

  // Validar datos de centro
  static validateCentroData(data) {
    const errors = {};

    if (!data.nombre?.trim()) {
      errors.nombre = 'El nombre del centro es requerido';
    }

    if (!data.direccion?.trim()) {
      errors.direccion = 'La dirección es requerida';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default CentroService;