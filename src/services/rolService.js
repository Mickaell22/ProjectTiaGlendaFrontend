// src/services/rolService.js
// Servicio para el manejo de roles del sistema

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class RolService {
  // Obtener todos los roles disponibles
  static async getAll() {
    const response = await ApiService.get(API_ENDPOINTS.ROLES.BASE);
    return extractData(response);
  }

  // Obtener rol por ID
  static async getById(id) {
    const response = await ApiService.get(API_ENDPOINTS.ROLES.BY_ID(id));
    return extractData(response);
  }

  // Formatear roles para usar en selects
  static formatRolesForSelect(roles) {
    return roles.map(rol => ({
      value: rol.id,
      label: rol.nombre,
      description: rol.descripcion,
      name: rol.nombre.toLowerCase()
    }));
  }

  // Obtener información del rol con icono y color
  static getRolInfo(rolId, rolNombre = null) {
    // Mapeo de roles con sus características visuales (solo roles existentes en BD)
    const rolMap = {
      1: { label: 'Administrador', color: 'error', icon: 'AdminPanelSettings', name: 'administrador' },
      2: { label: 'Terapeuta', color: 'primary', icon: 'Psychology', name: 'terapeuta' },
      3: { label: 'Pedagógico', color: 'secondary', icon: 'School', name: 'pedagogico' },
      // Compatibilidad con nombres de rol
      administrador: { label: 'Administrador', color: 'error', icon: 'AdminPanelSettings', name: 'administrador' },
      terapeuta: { label: 'Terapeuta', color: 'primary', icon: 'Psychology', name: 'terapeuta' },
      pedagogico: { label: 'Pedagógico', color: 'secondary', icon: 'School', name: 'pedagogico' },
      'pedagógico': { label: 'Pedagógico', color: 'secondary', icon: 'School', name: 'pedagogico' }
    };

    // Buscar por ID primero
    if (rolId && rolMap[rolId]) {
      return rolMap[rolId];
    }

    // Buscar por nombre si el ID no coincide
    if (rolNombre) {
      const nombreLower = rolNombre.toLowerCase();
      if (rolMap[nombreLower]) {
        return rolMap[nombreLower];
      }
      // Si hay un nombre de rol pero no coincide con el mapeo, usarlo
      return {
        label: rolNombre,
        color: 'default',
        icon: 'Person',
        name: nombreLower
      };
    }

    // Si no hay ni ID ni nombre válido
    return {
      label: 'Sin rol',
      color: 'warning',
      icon: 'Person',
      name: 'unknown'
    };
  }
}

export default RolService;