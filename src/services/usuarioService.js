// src/services/usuarioService.js
// Servicio específico para el manejo de usuarios del sistema

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class UsuarioService {
  // Obtener todos los usuarios
  static async getAll() {
    const response = await ApiService.get(API_ENDPOINTS.USUARIOS.BASE);
    return extractData(response);
  }

  // Obtener usuario por ID
  static async getById(id) {
    const response = await ApiService.get(API_ENDPOINTS.USUARIOS.BY_ID(id));
    return extractData(response);
  }

  // Crear nuevo usuario
  static async create(usuarioData) {
    const response = await ApiService.post(API_ENDPOINTS.USUARIOS.BASE, usuarioData);
    return extractData(response);
  }

  // Actualizar usuario
  static async update(id, usuarioData) {
    const response = await ApiService.put(API_ENDPOINTS.USUARIOS.BY_ID(id), usuarioData);
    return extractData(response);
  }

  // Eliminar usuario
  static async delete(id) {
    const response = await ApiService.delete(API_ENDPOINTS.USUARIOS.BY_ID(id));
    return extractData(response);
  }

  // Cambiar contraseña
  static async changePassword(id, passwordData) {
    const response = await ApiService.put(API_ENDPOINTS.USUARIOS.CHANGE_PASSWORD(id), passwordData);
    return extractData(response);
  }

  // Validar datos de usuario
  static validateUsuarioData(data) {
    const errors = {};

    if (!data.persona_id) {
      errors.persona_id = 'Debe seleccionar una persona';
    }

    if (!data.nombre_usuario?.trim()) {
      errors.nombre_usuario = 'El nombre de usuario es requerido';
    } else if (data.nombre_usuario.trim().length < 3) {
      errors.nombre_usuario = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.nombre_usuario.trim())) {
      errors.nombre_usuario = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }

    if (!data.contrasenia) {
      errors.contrasenia = 'La contraseña es requerida';
    } else if (data.contrasenia.length < 6) {
      errors.contrasenia = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!data.rol_id) {
      errors.rol_id = 'Debe seleccionar un rol';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validar cambio de contraseña
  static validatePasswordChange(data) {
    const errors = {};

    if (!data.nueva_contrasenia) {
      errors.nueva_contrasenia = 'La nueva contraseña es requerida';
    } else if (data.nueva_contrasenia.length < 6) {
      errors.nueva_contrasenia = 'La nueva contraseña debe tener al menos 6 caracteres';
    }

    if (!data.confirmar_contrasenia) {
      errors.confirmar_contrasenia = 'Debe confirmar la nueva contraseña';
    } else if (data.nueva_contrasenia !== data.confirmar_contrasenia) {
      errors.confirmar_contrasenia = 'Las contraseñas no coinciden';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Formatear datos para el backend
  static formatForBackend(frontendData) {
    return {
      persona_id: parseInt(frontendData.persona_id),
      nombre_usuario: frontendData.nombre_usuario?.trim().toLowerCase(),
      contrasenia: frontendData.contrasenia,
      rol_id: parseInt(frontendData.rol_id),
      estado: frontendData.estado || 'activo'
    };
  }

  // Formatear datos de cambio de contraseña
  static formatPasswordChangeForBackend(frontendData) {
    return {
      nueva_contrasenia: frontendData.nueva_contrasenia,
      confirmar_contrasenia: frontendData.confirmar_contrasenia
    };
  }

  // Buscar usuarios por término
  static filterUsuarios(usuarios, searchTerm) {
    if (!searchTerm?.trim()) return usuarios;

    const term = searchTerm.toLowerCase();
    return usuarios.filter(item =>
      item.nombre_completo?.toLowerCase().includes(term) ||
      item.nombre?.toLowerCase().includes(term) ||
      item.apellido?.toLowerCase().includes(term) ||
      item.cedula?.includes(term) ||
      item.nombre_usuario?.toLowerCase().includes(term) ||
      item.rol_nombre?.toLowerCase().includes(term)
    );
  }

  // Filtrar por estado
  static filterByEstado(usuarios, estado) {
    if (!estado) return usuarios;
    return usuarios.filter(item => item.estado === estado);
  }

  // Filtrar por rol
  static filterByRol(usuarios, rolId) {
    if (!rolId) return usuarios;
    return usuarios.filter(item => item.rol_id === parseInt(rolId));
  }

  // Obtener estados disponibles
  static getEstados() {
    return [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' },
      { value: 'bloqueado', label: 'Bloqueado' },
      { value: 'eliminado', label: 'Eliminado' }
    ];
  }

  // Obtener estado con color para UI
  static getEstadoInfo(estado) {
    const estadoMap = {
      activo: { label: 'Activo', color: 'success' },
      inactivo: { label: 'Inactivo', color: 'warning' },
      bloqueado: { label: 'Bloqueado', color: 'error' },
      eliminado: { label: 'Eliminado', color: 'error' }
    };

    return estadoMap[estado] || { label: estado, color: 'default' };
  }

  // Obtener color del rol para UI
  static getRolColor(rolNombre) {
    const colorMap = {
      'administrador': 'error',
      'admin': 'error',
      'supervisor': 'warning',
      'terapeuta': 'primary',
      'pedagogo': 'secondary',
      'usuario': 'default',
      'invitado': 'default'
    };
    
    const rol = rolNombre?.toLowerCase() || '';
    return colorMap[rol] || 'default';
  }

  // Generar nombre completo
  static getFullName(usuario) {
    return usuario.nombre_completo || 
           `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
  }

  // Verificar si un nombre de usuario ya existe
  static checkNombreUsuarioExists(usuarios, nombreUsuario, excludeId = null) {
    return usuarios.some(u => 
      u.nombre_usuario?.toLowerCase() === nombreUsuario?.toLowerCase() && u.id !== excludeId
    );
  }

  // Verificar si una persona ya tiene usuario
  static checkPersonaExists(usuarios, personaId, excludeId = null) {
    return usuarios.some(u => 
      u.persona_id === parseInt(personaId) && u.id !== excludeId
    );
  }

  // Formatear fecha para mostrar
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Formatear fecha y hora para mostrar
  static formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  // Calcular tiempo desde último acceso
  static calculateTimeFromLastAccess(fechaUltimoAcceso) {
    if (!fechaUltimoAcceso) return 'Nunca';
    
    const now = new Date();
    const lastAccess = new Date(fechaUltimoAcceso);
    const diffTime = Math.abs(now - lastAccess);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Hace 1 día';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Hace ${years} año${years > 1 ? 's' : ''}`;
    }
  }

  // Obtener información de contacto
  static getContactInfo(usuario) {
    return {
      telefono: usuario.telefono || 'Sin teléfono',
      correo: usuario.correo || 'Sin correo'
    };
  }

  // Obtener información de seguridad
  static getSecurityInfo(usuario) {
    return {
      ultimoAcceso: this.formatDateTime(usuario.fecha_ultimo_acceso),
      tiempoUltimoAcceso: this.calculateTimeFromLastAccess(usuario.fecha_ultimo_acceso),
      fechaCreacion: this.formatDate(usuario.fecha_creacion),
      fechaModificacion: this.formatDate(usuario.fecha_modificacion)
    };
  }

  // Estadísticas de usuarios
  static getStats(usuarios) {
    const total = usuarios.length;
    const activos = usuarios.filter(u => u.estado === 'activo').length;
    const inactivos = usuarios.filter(u => u.estado === 'inactivo').length;
    const bloqueados = usuarios.filter(u => u.estado === 'bloqueado').length;
    
    const porRol = {};
    usuarios.forEach(u => {
      if (u.rol_nombre) {
        porRol[u.rol_nombre] = (porRol[u.rol_nombre] || 0) + 1;
      }
    });

    // Calcular usuarios activos en los últimos 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    const activosRecientes = usuarios.filter(u => 
      u.fecha_ultimo_acceso && new Date(u.fecha_ultimo_acceso) > hace30Dias
    ).length;

    return {
      total,
      activos,
      inactivos,
      bloqueados,
      activosRecientes,
      porRol
    };
  }

  // Agrupar usuarios por rol
  static groupByRol(usuarios) {
    const grupos = {};
    usuarios.forEach(usuario => {
      const rol = usuario.rol_nombre || 'sin_rol';
      if (!grupos[rol]) {
        grupos[rol] = [];
      }
      grupos[rol].push(usuario);
    });
    return grupos;
  }

  // Obtener usuarios activos por rol
  static getActivosByRol(usuarios, rolId) {
    return usuarios.filter(u => 
      u.rol_id === parseInt(rolId) && u.estado === 'activo'
    );
  }

  // Validar antes de eliminar (verificar dependencias)
  static validateBeforeDelete(usuario) {
    const warnings = [];
    
    // Agregar advertencias según el rol
    if (usuario.rol_nombre?.toLowerCase() === 'administrador') {
      warnings.push('Este usuario tiene permisos de administrador');
    }
    
    if (usuario.fecha_ultimo_acceso) {
      const ultimoAcceso = new Date(usuario.fecha_ultimo_acceso);
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);
      
      if (ultimoAcceso > hace7Dias) {
        warnings.push('Este usuario ha accedido recientemente al sistema');
      }
    }

    return {
      canDelete: true,
      message: warnings.length > 0 ? 'Considere las siguientes advertencias antes de eliminar:' : '',
      warnings
    };
  }

  // Generar sugerencia de nombre de usuario
  static generateUsernameFromName(nombre, apellido) {
    if (!nombre && !apellido) return '';
    
    const nombreLimpio = (nombre || '').trim().toLowerCase().replace(/[^a-z]/g, '');
    const apellidoLimpio = (apellido || '').trim().toLowerCase().replace(/[^a-z]/g, '');
    
    if (nombreLimpio && apellidoLimpio) {
      return `${nombreLimpio.substring(0, 3)}${apellidoLimpio.substring(0, 3)}`;
    } else if (nombreLimpio) {
      return nombreLimpio.substring(0, 6);
    } else if (apellidoLimpio) {
      return apellidoLimpio.substring(0, 6);
    }
    
    return '';
  }

  // Validar fortaleza de contraseña
  static validatePasswordStrength(password) {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(criteria).filter(Boolean).length;
    
    let strength = 'Muy débil';
    let color = 'error';
    
    if (score >= 4) {
      strength = 'Fuerte';
      color = 'success';
    } else if (score >= 3) {
      strength = 'Media';
      color = 'warning';
    } else if (score >= 2) {
      strength = 'Débil';
      color = 'warning';
    }

    return {
      strength,
      color,
      score,
      criteria,
      suggestions: this.getPasswordSuggestions(criteria)
    };
  }

  // Obtener sugerencias para mejorar contraseña
  static getPasswordSuggestions(criteria) {
    const suggestions = [];
    
    if (!criteria.length) suggestions.push('Usar al menos 8 caracteres');
    if (!criteria.uppercase) suggestions.push('Incluir al menos una letra mayúscula');
    if (!criteria.lowercase) suggestions.push('Incluir al menos una letra minúscula');
    if (!criteria.numbers) suggestions.push('Incluir al menos un número');
    if (!criteria.special) suggestions.push('Incluir al menos un carácter especial (!@#$%^&*...)');
    
    return suggestions;
  }
}

export default UsuarioService;