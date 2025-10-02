// src/services/pacienteService.js
// Servicio específico para el manejo de pacientes

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class PacienteService {
  // Obtener todos los pacientes
  static async getAll() {
    const response = await ApiService.get(API_ENDPOINTS.PACIENTES.BASE);
    return extractData(response);
  }

  // Obtener paciente por ID
  static async getById(id) {
    const response = await ApiService.get(API_ENDPOINTS.PACIENTES.BY_ID(id));
    return extractData(response);
  }

  // Crear nuevo paciente
  static async create(pacienteData) {
    const response = await ApiService.post(API_ENDPOINTS.PACIENTES.BASE, pacienteData);
    return extractData(response);
  }

  // Actualizar paciente
  static async update(id, pacienteData) {
    const response = await ApiService.put(API_ENDPOINTS.PACIENTES.BY_ID(id), pacienteData);
    return extractData(response);
  }

  // Eliminar paciente
  static async delete(id) {
    const response = await ApiService.delete(API_ENDPOINTS.PACIENTES.BY_ID(id));
    return extractData(response);
  }

  // Obtener documentos de un paciente
  static async getDocumentos(pacienteId) {
    const response = await ApiService.get(API_ENDPOINTS.PACIENTES.DOCUMENTOS(pacienteId));
    return extractData(response);
  }

  // Pausar paciente (todas las especialidades)
  static async pausarPacienteGeneral(pacienteId, pauseData) {
    const response = await ApiService.put(`${API_ENDPOINTS.PACIENTES.BASE}/${pacienteId}/pausar`, pauseData);
    return extractData(response);
  }

  // Reactivar paciente
  static async reactivarPacienteGeneral(pacienteId) {
    const response = await ApiService.put(`${API_ENDPOINTS.PACIENTES.BASE}/${pacienteId}/reactivar`, { paciente_id: pacienteId });
    return extractData(response);
  }

  // Pausar especialidad específica
  static async pausarEspecialidadPaciente(pacienteId, especialidadId, pauseData) {
    const response = await ApiService.put(`${API_ENDPOINTS.PACIENTES.BASE}/${pacienteId}/especialidades-multiples/${especialidadId}/pausar`, pauseData);
    return extractData(response);
  }

  // Reactivar especialidad específica
  static async reactivarEspecialidadPaciente(pacienteId, especialidadId) {
    const response = await ApiService.put(`${API_ENDPOINTS.PACIENTES.BASE}/${pacienteId}/especialidades-multiples/${especialidadId}/reactivar`, {
      paciente_id: pacienteId,
      especialidad_id: especialidadId
    });
    return extractData(response);
  }

  // Obtener pacientes pausados
  static async getPacientesPausados() {
    const response = await ApiService.get(`${API_ENDPOINTS.PACIENTES.BASE}/pausados`);
    return extractData(response);
  }

  // ==================== CONTROL DE PAUSAS AVANZADO ====================

  // Obtener estado completo de pausas de un paciente
  static async getEstadoPausas(pacienteId) {
    const response = await ApiService.get(API_ENDPOINTS.PAUSAS.ESTADO_PAUSAS(pacienteId));
    return extractData(response);
  }

  // Verificar si paciente tiene pausa activa
  static async verificarPausaActiva(pacienteId) {
    const response = await ApiService.get(API_ENDPOINTS.PAUSAS.PAUSA_ACTIVA(pacienteId));
    return extractData(response);
  }

  // Obtener historial completo de pausas
  static async getHistorialPausas(pacienteId) {
    const response = await ApiService.get(API_ENDPOINTS.PAUSAS.HISTORIAL(pacienteId));
    return extractData(response);
  }

  // Validar datos de paciente
  static validatePacienteData(data) {
    const errors = {};

    if (!data.persona_id) {
      errors.persona_id = 'Debe seleccionar una persona';
    }

    if (!data.tutor_id) {
      errors.tutor_id = 'Debe seleccionar un tutor';
    }

    if (!data.fecha_ingreso) {
      errors.fecha_ingreso = 'La fecha de ingreso es requerida';
    }

    // Validar fechas lógicas
    if (data.fecha_ingreso && data.fecha_inicio_tratamiento) {
      const fechaIngreso = new Date(data.fecha_ingreso);
      const fechaInicioTratamiento = new Date(data.fecha_inicio_tratamiento);
      
      if (fechaInicioTratamiento < fechaIngreso) {
        errors.fecha_inicio_tratamiento = 'La fecha de inicio de tratamiento no puede ser anterior a la fecha de ingreso';
      }
    }

    if (data.fecha_inicio_tratamiento && data.fecha_fin_tratamiento) {
      const fechaInicio = new Date(data.fecha_inicio_tratamiento);
      const fechaFin = new Date(data.fecha_fin_tratamiento);
      
      if (fechaFin < fechaInicio) {
        errors.fecha_fin_tratamiento = 'La fecha de fin no puede ser anterior a la fecha de inicio';
      }
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
      tutor_id: parseInt(frontendData.tutor_id),
      especialidad_id: frontendData.especialidad_id ? parseInt(frontendData.especialidad_id) : null,
      fecha_ingreso: frontendData.fecha_ingreso,
      fecha_inicio_tratamiento: frontendData.fecha_inicio_tratamiento || null,
      fecha_fin_tratamiento: frontendData.fecha_fin_tratamiento || null,
      estado_tratamiento: frontendData.estado_tratamiento || 'activo',
      observaciones_tratamiento: frontendData.observaciones_tratamiento?.trim() || null,
      observaciones: frontendData.observaciones?.trim() || null,
      estado: frontendData.estado || 'activo'
    };
  }

  // Buscar pacientes por término
  static filterPacientes(pacientes, searchTerm) {
    if (!searchTerm?.trim()) return pacientes;

    const term = searchTerm.toLowerCase();
    return pacientes.filter(item =>
      item.nombre_completo?.toLowerCase().includes(term) ||
      item.nombre?.toLowerCase().includes(term) ||
      item.apellido?.toLowerCase().includes(term) ||
      item.cedula?.includes(term) ||
      item.tutor_nombre?.toLowerCase().includes(term) ||
      item.especialidad_nombre?.toLowerCase().includes(term)
    );
  }

  // Filtrar por estado
  static filterByEstado(pacientes, estado) {
    if (!estado) return pacientes;
    return pacientes.filter(item => item.estado === estado);
  }

  // Filtrar por estado de tratamiento
  static filterByEstadoTratamiento(pacientes, estadoTratamiento) {
    if (!estadoTratamiento) return pacientes;
    return pacientes.filter(item => item.estado_tratamiento === estadoTratamiento);
  }

  // Filtrar por especialidad
  static filterByEspecialidad(pacientes, especialidadId) {
    if (!especialidadId) return pacientes;
    return pacientes.filter(item => item.especialidad_id === parseInt(especialidadId));
  }

  // Obtener estados disponibles
  static getEstados() {
    return [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' },
      { value: 'alta', label: 'Alta' },
      { value: 'derivado', label: 'Derivado' },
      { value: 'eliminado', label: 'Eliminado' }
    ];
  }

  // Obtener estados de tratamiento disponibles
  static getEstadosTratamiento() {
    return [
      { value: 'activo', label: 'Activo' },
      { value: 'completado', label: 'Completado' },
      { value: 'suspendido', label: 'Suspendido' },
      { value: 'pausado', label: 'Pausado' }
    ];
  }

  // Obtener estados de pausa
  static getEstadosPausa() {
    return [
      { value: 'activo', label: 'Activo' },
      { value: 'pausado', label: 'Pausado' }
    ];
  }

  // Obtener estado con color para UI
  static getEstadoInfo(estado) {
    if (!estado) {
      return { label: 'Sin estado', color: 'default' };
    }

    const estadoMap = {
      activo: { label: 'Activo', color: 'success' },
      inactivo: { label: 'Inactivo', color: 'error' },
      alta: { label: 'Alta', color: 'info' },
      derivado: { label: 'Derivado', color: 'warning' },
      eliminado: { label: 'Eliminado', color: 'error' }
    };

    return estadoMap[estado] || { label: estado, color: 'default' };
  }

  // Obtener estado de tratamiento con color para UI
  static getEstadoTratamientoInfo(estadoTratamiento) {
    const estadoMap = {
      activo: { label: 'Activo', color: 'success' },
      completado: { label: 'Completado', color: 'info' },
      suspendido: { label: 'Suspendido', color: 'warning' },
      pausado: { label: 'Pausado', color: 'error' }
    };

    return estadoMap[estadoTratamiento] || { label: estadoTratamiento, color: 'default' };
  }

  // Obtener estado de pausa con color para UI
  static getEstadoPausaInfo(estadoPausa) {
    const estadoMap = {
      activo: { label: 'Activo', color: 'success' },
      pausado: { label: 'Pausado', color: 'error' }
    };

    return estadoMap[estadoPausa] || { label: estadoPausa, color: 'default' };
  }

  // Verificar si un paciente está pausado
  static isPacientePausado(paciente) {
    if (!paciente) {
      return { pausado: false };
    }

    // Verificar si está pausado generalmente
    if (paciente.fecha_inicio_pausa || paciente.estado === 'pausado') {
      return {
        pausado: true,
        tipo: 'general',
        motivo: paciente.motivo_pausa || paciente.motivo_pausa_general
      };
    }

    // Verificar especialidades pausadas
    if (paciente.especialidades && paciente.especialidades.length > 0) {
      const especialidadesPausadas = paciente.especialidades.filter(esp =>
        esp.estado_pausa === 'pausado_especialidad' || esp.estado_pausa === 'pausado_general'
      );
      if (especialidadesPausadas.length > 0) {
        return {
          pausado: true,
          tipo: 'especialidad',
          especialidades_pausadas: especialidadesPausadas.length,
          detalles: especialidadesPausadas
        };
      }
    }

    return { pausado: false, tipo: 'activo' };
  }

  // Validar datos de pausa
  static validatePauseData(data) {
    const errors = {};

    if (!data.fecha_inicio_pausa) {
      errors.fecha_inicio_pausa = 'La fecha de inicio de pausa es requerida';
    }

    // Validar que la fecha de inicio no sea futura
    if (data.fecha_inicio_pausa) {
      const fechaInicio = new Date(data.fecha_inicio_pausa);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaInicio > hoy) {
        errors.fecha_inicio_pausa = 'La fecha de inicio no puede ser futura';
      }
    }

    // Validar fecha de fin si se proporciona
    if (data.fecha_fin_pausa && data.fecha_inicio_pausa) {
      const fechaInicio = new Date(data.fecha_inicio_pausa);
      const fechaFin = new Date(data.fecha_fin_pausa);

      if (fechaFin <= fechaInicio) {
        errors.fecha_fin_pausa = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (!data.motivo_pausa?.trim()) {
      errors.motivo_pausa = 'El motivo de la pausa es requerido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Generar nombre completo
  static getFullName(paciente) {
    return paciente.nombre_completo || 
           `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim();
  }

  // Verificar si una persona ya está registrada como paciente
  static checkPersonaExists(pacientes, personaId, excludeId = null) {
    return pacientes.some(p => 
      p.persona_id === parseInt(personaId) && p.id !== excludeId
    );
  }

  // Formatear fecha para mostrar
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // Calcular edad
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

  // Calcular tiempo en tratamiento
  static calculateTiempoTratamiento(fechaInicio, fechaFin = null) {
    if (!fechaInicio) return 'Sin fecha de inicio';
    
    const inicio = new Date(fechaInicio);
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    const diffTime = Math.abs(fin - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffMonths > 0) {
      return `${diffMonths} mes${diffMonths > 1 ? 'es' : ''}`;
    } else {
      return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
    }
  }

  // Obtener información de contacto del tutor
  static getTutorContactInfo(paciente) {
    return {
      nombre: paciente.tutor_nombre || 'Sin tutor asignado',
      telefono: paciente.tutor_telefono || 'Sin teléfono',
      parentesco: paciente.tutor_parentesco || 'N/A'
    };
  }

  // Estadísticas de pacientes
  static getStats(pacientes) {
    const total = pacientes.length;
    const activos = pacientes.filter(p => p.estado === 'activo').length;
    const enTratamiento = pacientes.filter(p => p.estado_tratamiento === 'activo').length;
    
    const porEspecialidad = {};
    pacientes.forEach(p => {
      if (p.especialidad_nombre) {
        porEspecialidad[p.especialidad_nombre] = (porEspecialidad[p.especialidad_nombre] || 0) + 1;
      }
    });

    return {
      total,
      activos,
      inactivos: total - activos,
      enTratamiento,
      porEspecialidad
    };
  }

  // Obtener próximas citas o fechas importantes
  static getProximasCitas(pacientes) {
    // Esta función se puede expandir cuando se integre con el sistema de citas
    return pacientes
      .filter(p => p.fecha_inicio_tratamiento && p.estado_tratamiento === 'activo')
      .map(p => ({
        paciente: this.getFullName(p),
        fecha: p.fecha_inicio_tratamiento,
        especialidad: p.especialidad_nombre
      }));
  }
}

export default PacienteService;