// src/services/documentosPersonalService.js
// Servicio específico para el manejo de documentos del personal

import ApiService, { extractData } from './apiService.js';
import { API_ENDPOINTS } from '../config/api.js';

export class DocumentosPersonalService {
  // Obtener documentos de un miembro del personal
  static async getDocumentosPersonal(personalId) {
    const response = await ApiService.get(API_ENDPOINTS.DOCUMENTOS_PERSONAL.BY_PERSONAL(personalId));
    return extractData(response);
  }

  // Obtener documento específico por ID
  static async getDocumentById(documentoId) {
    const response = await ApiService.get(API_ENDPOINTS.DOCUMENTOS_PERSONAL.BY_ID(documentoId));
    return extractData(response);
  }

  // Subir un documento
  static async subirDocumento(formData) {
    // Construir la URL correcta con el personal_id
    const personalId = formData.get('personal_id');
    const uploadUrl = API_ENDPOINTS.DOCUMENTOS_PERSONAL.UPLOAD.replace('{personal_id}', personalId);
    
    const response = await ApiService.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return extractData(response);
  }

  // Actualizar información de un documento
  static async actualizarDocumento(documentoId, data) {
    const response = await ApiService.put(API_ENDPOINTS.DOCUMENTOS_PERSONAL.BY_ID(documentoId), data);
    return extractData(response);
  }

  // Eliminar un documento
  static async eliminarDocumento(documentoId) {
    const response = await ApiService.delete(API_ENDPOINTS.DOCUMENTOS_PERSONAL.BY_ID(documentoId));
    return extractData(response);
  }

  // Descargar un documento
  static async descargarDocumento(documentoId) {
    const response = await ApiService.get(API_ENDPOINTS.DOCUMENTOS_PERSONAL.DOWNLOAD(documentoId), {
      responseType: 'blob'
    });
    return response;
  }

  // Obtener documentos por tipo
  static async getDocumentosPorTipo(tipo, centroId = null) {
    const params = centroId ? { centro_id: centroId } : {};
    const response = await ApiService.get(API_ENDPOINTS.DOCUMENTOS_PERSONAL.BY_TYPE(tipo), { params });
    return extractData(response);
  }

  // Obtener tipos de documentos soportados
  static async getTiposDocumentos() {
    const response = await ApiService.get(API_ENDPOINTS.DOCUMENTOS_PERSONAL.TIPOS);
    return extractData(response);
  }

  // Obtener documentos próximos a vencer
  static async getDocumentosVencimientos(diasAlerta = 90) {
    const response = await ApiService.get(API_ENDPOINTS.DOCUMENTOS_PERSONAL.VENCIMIENTOS, {
      params: { dias_alerta: diasAlerta }
    });
    return extractData(response);
  }

  // Obtener documentos pendientes de validación
  static async getDocumentosPendientesValidacion() {
    const response = await ApiService.get(API_ENDPOINTS.DOCUMENTOS_PERSONAL.PENDIENTES_VALIDACION);
    return extractData(response);
  }

  // Obtener estadísticas de documentos
  static async getEstadisticasDocumentos() {
    const response = await ApiService.get(API_ENDPOINTS.DOCUMENTOS_PERSONAL.ESTADISTICAS);
    return extractData(response);
  }

  // Buscar documentos con filtros
  static async buscarDocumentos(filters = {}) {
    const response = await ApiService.get(API_ENDPOINTS.DOCUMENTOS_PERSONAL.BUSCAR, {
      params: filters
    });
    return extractData(response);
  }

  // Validar documento
  static async validarDocumento(documentoId, data) {
    const response = await ApiService.put(API_ENDPOINTS.DOCUMENTOS_PERSONAL.VALIDAR(documentoId), data);
    return extractData(response);
  }

  // Obtener documentos que están por vencer
  static async getDocumentosPorVencer(diasAdelanto = 30, centroId = null) {
    const params = { 
      dias_adelanto: diasAdelanto,
      ...(centroId && { centro_id: centroId })
    };
    const response = await ApiService.get(API_ENDPOINTS.DOCUMENTOS_PERSONAL.POR_VENCER, { params });
    return extractData(response);
  }

  // Validar datos del documento
  static validateDocumentoData(data) {
    const errors = {};

    if (!data.personal_id || data.personal_id <= 0) {
      errors.personal_id = 'Debe seleccionar un personal';
    }

    if (!data.tipo_documento?.trim()) {
      errors.tipo_documento = 'El tipo de documento es requerido';
    }

    if (!data.archivo && !data.documento_id) {
      errors.archivo = 'Debe seleccionar un archivo';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Formatear datos para el backend
  static formatForBackend(frontendData, personalId) {
    const formData = new FormData();
    
    formData.append('personal_id', personalId);
    formData.append('tipo_documento', frontendData.tipo_documento);
    
    if (frontendData.archivo) {
      formData.append('documento', frontendData.archivo);
    }
    
    if (frontendData.nombre_documento?.trim()) {
      formData.append('nombre_documento', frontendData.nombre_documento.trim());
    }
    
    if (frontendData.descripcion?.trim()) {
      formData.append('descripcion', frontendData.descripcion.trim());
    }
    
    if (frontendData.fecha_vencimiento) {
      formData.append('fecha_vencimiento', frontendData.fecha_vencimiento);
    }

    return formData;
  }

  // Obtener información del estado de un documento
  static getEstadoInfo(estado) {
    const estadoMap = {
      pendiente: { label: 'Pendiente', color: 'warning' },
      en_revision: { label: 'En Revision', color: 'info' },
      aprobado: { label: 'Aprobado', color: 'success' },
      rechazado: { label: 'Rechazado', color: 'error' },
      vencido: { label: 'Vencido', color: 'error' },
    };

    return estadoMap[estado] || { label: estado || 'Sin estado', color: 'default' };
  }

  // Obtener información del tipo de documento
  static getTipoDocumentoInfo(tipo) {
    const tipoMap = {
      cedula: { label: 'Cédula', icon: 'assignment_ind' },
      curriculum: { label: 'Currículum', icon: 'description' },
      titulo: { label: 'Título', icon: 'school' },
      certificado: { label: 'Certificado', icon: 'verified' },
      contrato: { label: 'Contrato', icon: 'handshake' },
      foto: { label: 'Foto', icon: 'photo' },
      otro: { label: 'Otro', icon: 'attachment' },
    };

    return tipoMap[tipo] || { label: tipo || 'Desconocido', icon: 'description' };
  }

  // Formatear tamaño de archivo
  static formatFileSize(bytes) {
    if (!bytes) return 'N/A';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Formatear fecha
  static formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  // Verificar si un documento está próximo a vencer
  static isDocumentoProximoVencer(fechaVencimiento, diasAdelanto = 30) {
    if (!fechaVencimiento) return false;
    
    const fechaVenc = new Date(fechaVencimiento);
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAdelanto);
    
    return fechaVenc <= fechaLimite;
  }

  // Verificar si un documento está vencido
  static isDocumentoVencido(fechaVencimiento) {
    if (!fechaVencimiento) return false;
    
    const fechaVenc = new Date(fechaVencimiento);
    const hoy = new Date();
    
    return fechaVenc < hoy;
  }

  // Obtener color para el estado de vencimiento
  static getVencimientoColor(fechaVencimiento) {
    if (!fechaVencimiento) return 'default';
    
    if (this.isDocumentoVencido(fechaVencimiento)) {
      return 'error';
    } else if (this.isDocumentoProximoVencer(fechaVencimiento)) {
      return 'warning';
    }
    return 'success';
  }

  // Filtrar documentos por término de búsqueda
  static filterDocumentos(documentos, searchTerm) {
    if (!searchTerm?.trim()) return documentos;

    const term = searchTerm.toLowerCase();
    return documentos.filter(doc =>
      doc.tipo_documento?.toLowerCase().includes(term) ||
      doc.descripcion?.toLowerCase().includes(term) ||
      doc.nombre_archivo?.toLowerCase().includes(term) ||
      doc.nombre_personal?.toLowerCase().includes(term)
    );
  }

  // Estadísticas de documentos
  static getDocumentosStats(documentos) {
    const total = documentos.length;
    const aprobados = documentos.filter(d => d.estado_validacion === 'aprobado').length;
    const pendientes = documentos.filter(d => d.estado_validacion === 'pendiente').length;
    const enRevision = documentos.filter(d => d.estado_validacion === 'en_revision').length;
    const rechazados = documentos.filter(d => d.estado_validacion === 'rechazado').length;
    const vencidos = documentos.filter(d => this.isDocumentoVencido(d.fecha_vencimiento)).length;
    const proximosVencer = documentos.filter(d => 
      !this.isDocumentoVencido(d.fecha_vencimiento) && 
      this.isDocumentoProximoVencer(d.fecha_vencimiento)
    ).length;

    const porTipo = {};
    documentos.forEach(d => {
      if (d.tipo_documento) {
        porTipo[d.tipo_documento] = (porTipo[d.tipo_documento] || 0) + 1;
      }
    });

    return {
      total,
      aprobados,
      pendientes,
      enRevision,
      rechazados,
      vencidos,
      proximosVencer,
      porTipo
    };
  }
}

export default DocumentosPersonalService;