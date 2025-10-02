// src/services/pausasService.js
// Servicio especializado para el manejo del sistema de pausas de pacientes

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class PausasService {
  // ==================== PAUSAS BASICAS ====================

  // Pausar paciente general (todas las especialidades)
  static async pausarPacienteGeneral(pacienteId, pauseData) {
    const response = await ApiService.put(
      API_ENDPOINTS.PAUSAS.PAUSAR_GENERAL(pacienteId),
      pauseData
    );
    return extractData(response);
  }

  // Reactivar paciente general
  static async reactivarPacienteGeneral(pacienteId) {
    const response = await ApiService.put(
      API_ENDPOINTS.PAUSAS.REACTIVAR_GENERAL(pacienteId),
      { paciente_id: pacienteId }
    );
    return extractData(response);
  }

  // Pausar especialidad especifica
  static async pausarEspecialidad(pacienteId, especialidadId, pauseData) {
    const response = await ApiService.put(
      API_ENDPOINTS.PAUSAS.PAUSAR_ESPECIALIDAD(pacienteId, especialidadId),
      pauseData
    );
    return extractData(response);
  }

  // Reactivar especialidad especifica
  static async reactivarEspecialidad(pacienteId, especialidadId) {
    const response = await ApiService.put(
      API_ENDPOINTS.PAUSAS.REACTIVAR_ESPECIALIDAD(pacienteId, especialidadId),
      { paciente_id: pacienteId, especialidad_id: especialidadId }
    );
    return extractData(response);
  }

  // Obtener lista de pacientes pausados
  static async getPacientesPausados() {
    const response = await ApiService.get(API_ENDPOINTS.PAUSAS.LISTA_PAUSADOS);
    return extractData(response);
  }

  // ==================== CONTROL DE PAUSAS AVANZADO ====================

  // Obtener estado completo de pausas de un paciente
  static async getEstadoPausas(pacienteId) {
    const response = await ApiService.get(
      API_ENDPOINTS.PAUSAS.ESTADO_PAUSAS(pacienteId)
    );
    return extractData(response);
  }

  // Verificar si paciente tiene pausa activa
  static async verificarPausaActiva(pacienteId) {
    const response = await ApiService.get(
      API_ENDPOINTS.PAUSAS.PAUSA_ACTIVA(pacienteId)
    );
    return extractData(response);
  }

  // Obtener historial completo de pausas
  static async getHistorialPausas(pacienteId) {
    const response = await ApiService.get(
      API_ENDPOINTS.PAUSAS.HISTORIAL(pacienteId)
    );
    return extractData(response);
  }

  // Obtener pausas vencidas que deben reactivarse
  static async getPausasVencidas() {
    const response = await ApiService.get(
      API_ENDPOINTS.CONTROL_PAUSAS.VENCIDAS
    );
    return extractData(response);
  }

  // Obtener pausas proximas a vencer
  static async getPausasProximasVencer(dias = 7) {
    const response = await ApiService.get(
      `${API_ENDPOINTS.CONTROL_PAUSAS.PROXIMAS_VENCER}?dias=${dias}`
    );
    return extractData(response);
  }

  // Procesar pausas vencidas automaticamente
  static async procesarPausasAutomaticas() {
    const response = await ApiService.post(
      API_ENDPOINTS.CONTROL_PAUSAS.PROCESAR_AUTOMATICAS,
      {}
    );
    return extractData(response);
  }

  // Obtener estadisticas del sistema de pausas
  static async getEstadisticas() {
    const response = await ApiService.get(
      API_ENDPOINTS.CONTROL_PAUSAS.ESTADISTICAS
    );
    return extractData(response);
  }

  // ==================== VALIDACIONES Y UTILIDADES ====================

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

  // Formatear datos para el backend
  static formatForBackend(formData) {
    return {
      fecha_inicio_pausa: formData.fecha_inicio_pausa,
      fecha_fin_pausa: formData.fecha_fin_pausa || null,
      motivo_pausa: formData.motivo_pausa.trim(),
      observaciones_pausa: formData.observaciones_pausa?.trim() || null
    };
  }

  // Obtener informacion de pausa con color para UI
  static getTipoPausaInfo(tipo) {
    const tipoMap = {
      general: {
        label: 'Pausa General',
        color: 'error',
        descripcion: 'Todas las especialidades pausadas'
      },
      especialidad: {
        label: 'Pausa por Especialidad',
        color: 'warning',
        descripcion: 'Solo especialidades especificas pausadas'
      },
      activo: {
        label: 'Activo',
        color: 'success',
        descripcion: 'Sin pausas activas'
      }
    };

    return tipoMap[tipo] || { label: tipo, color: 'default', descripcion: '' };
  }

  // Calcular dias restantes de pausa
  static calcularDiasRestantes(fechaFin) {
    if (!fechaFin) return null;

    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diffTime = fin - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  // Calcular duracion de pausa
  static calcularDuracionPausa(fechaInicio, fechaFin = null) {
    if (!fechaInicio) return 'Sin fecha de inicio';

    const inicio = new Date(fechaInicio);
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    const diffTime = Math.abs(fin - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      const meses = Math.floor(diffDays / 30);
      const dias = diffDays % 30;
      return `${meses} mes${meses > 1 ? 'es' : ''}${dias > 0 ? ` y ${dias} dia${dias > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
  }

  // Verificar si pausa esta vencida
  static isPausaVencida(fechaFin) {
    if (!fechaFin) return false;
    const hoy = new Date();
    const fin = new Date(fechaFin);
    return hoy > fin;
  }

  // Verificar si pausa esta proxima a vencer
  static isPausaProximaVencer(fechaFin, diasUmbral = 7) {
    if (!fechaFin) return false;
    const diasRestantes = this.calcularDiasRestantes(fechaFin);
    return diasRestantes !== null && diasRestantes > 0 && diasRestantes <= diasUmbral;
  }

  // Formatear fecha para mostrar
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha invalida';
    }
  }

  // Formatear fecha corta
  static formatDateShort(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha invalida';
    }
  }

  // Obtener tipo de accion
  static getTipoAccion(accion) {
    const accionMap = {
      'pausar_general': 'Pausa General',
      'pausar_especialidad': 'Pausa Especialidad',
      'reactivar_general': 'Reactivacion General',
      'reactivar_especialidad': 'Reactivacion Especialidad',
      'automatica': 'Reactivacion Automatica'
    };
    return accionMap[accion] || accion;
  }

  // Obtener color para tipo de accion
  static getColorAccion(accion) {
    if (accion.includes('pausar')) return 'warning';
    if (accion.includes('reactivar')) return 'success';
    return 'default';
  }

  // Filtrar historial por tipo
  static filterHistorialByTipo(historial, tipo) {
    if (!tipo) return historial;
    return historial.filter(item => item.tipo_pausa === tipo);
  }

  // Filtrar historial por accion
  static filterHistorialByAccion(historial, accion) {
    if (!accion) return historial;
    return historial.filter(item => item.accion?.includes(accion));
  }

  // Ordenar historial por fecha
  static sortHistorialByDate(historial, ascending = false) {
    return [...historial].sort((a, b) => {
      const dateA = new Date(a.fecha_accion);
      const dateB = new Date(b.fecha_accion);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  // Obtener estadisticas del historial
  static getHistorialStats(historial) {
    const total = historial.length;
    const pausasGenerales = historial.filter(h => h.accion === 'pausar_general').length;
    const pausasEspecialidad = historial.filter(h => h.accion === 'pausar_especialidad').length;
    const reactivaciones = historial.filter(h => h.accion?.includes('reactivar')).length;

    return {
      total,
      pausasGenerales,
      pausasEspecialidad,
      reactivaciones,
      totalPausas: pausasGenerales + pausasEspecialidad
    };
  }

  // Obtener motivos mas comunes
  static getMotivosComunes(historial) {
    const motivos = {};
    historial.forEach(h => {
      if (h.motivo_pausa) {
        motivos[h.motivo_pausa] = (motivos[h.motivo_pausa] || 0) + 1;
      }
    });

    return Object.entries(motivos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([motivo, cantidad]) => ({ motivo, cantidad }));
  }

  // Generar resumen de estado de pausa
  static generarResumenEstado(estadoPausas) {
    if (!estadoPausas) return 'Sin informacion';

    if (!estadoPausas.tiene_pausa_activa) {
      return 'Paciente activo sin pausas';
    }

    if (estadoPausas.tipo_pausa === 'general') {
      const diasRestantes = this.calcularDiasRestantes(estadoPausas.fecha_fin_pausa);
      return `Pausa general${diasRestantes ? ` - ${diasRestantes} dias restantes` : ' - Sin fecha de fin'}`;
    }

    if (estadoPausas.tipo_pausa === 'especialidad') {
      const count = estadoPausas.especialidades_pausadas?.length || 0;
      return `${count} especialidad${count > 1 ? 'es' : ''} pausada${count > 1 ? 's' : ''}`;
    }

    return 'Estado desconocido';
  }
}

export default PausasService;
