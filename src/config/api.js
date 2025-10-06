// src/config/api.js
// Configuración centralizada de la API

// Configuración del entorno
export const API_CONFIG = {
  // URL base de la API - se puede configurar por entorno
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // Timeouts
  TIMEOUT: 30000, // 30 segundos
  
  // Configuración de reintentos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/api/login',
    LOGOUT: '/api/logout',
    VERIFY_TOKEN: '/api/verify-token',
    ME: '/api/me',
  },

  // Personas
  PERSONAS: {
    BASE: '/api/personas',
    BY_ID: (id) => `/api/personas/${id}`,
    DISPONIBLES: '/api/personas/disponibles',
    DISPONIBLES_PERSONAL: '/api/personas',
  },

  // Usuarios
  USUARIOS: {
    BASE: '/api/usuarios',
    BY_ID: (id) => `/api/usuarios/${id}`,
    CHANGE_PASSWORD: (id) => `/api/usuarios/${id}/cambiar-contrasenia`,
  },

  // Personal
  PERSONAL: {
    BASE: '/api/personal',
    BY_ID: (id) => `/api/personal/${id}`,
  },

  // Documentos Personal
  DOCUMENTOS_PERSONAL: {
    BASE: '/api/documentos-personal',
    BY_ID: (id) => `/api/documentos-personal/${id}`,
    BY_PERSONAL: (personalId) => `/api/personal/${personalId}/documentos`,
    UPLOAD: '/api/personal/{personal_id}/documentos',
    DOWNLOAD: (id) => `/api/documentos-personal/${id}/descargar`,
    BY_TYPE: (tipo) => `/api/documentos-personal/tipo/${tipo}`,
    TIPOS: '/api/documentos-personal/tipos',
    VENCIMIENTOS: '/api/documentos-personal/vencimientos',
    PENDIENTES_VALIDACION: '/api/documentos-personal/pendientes-validacion',
    ESTADISTICAS: '/api/documentos-personal/estadisticas',
    BUSCAR: '/api/documentos-personal/buscar',
    VALIDAR: (id) => `/api/documentos-personal/${id}/validar`,
    POR_VENCER: '/api/documentos-personal/por-vencer',
  },

  // Especialidades
  ESPECIALIDADES: {
    BASE: '/api/especialidades',
    BY_ID: (id) => `/api/especialidades/id/${id}`,
    BY_AREA: (area) => `/api/especialidades/area/${encodeURIComponent(area)}`,
    TERAPEUTICAS: '/api/especialidades/area/Especialidad%20terapéutica',
    PEDAGOGICAS: '/api/especialidades/area/Especialidad%20pedagógica',
  },

  // Pacientes
  PACIENTES: {
    BASE: '/api/pacientes',
    BY_ID: (id) => `/api/pacientes/${id}`,
    DOCUMENTOS: (id) => `/api/pacientes/${id}/documentos`,
  },

  // Sistema de Pausas de Pacientes
  PAUSAS: {
    // Pausas basicas
    PAUSAR_GENERAL: (id) => `/api/pacientes/${id}/pausar`,
    REACTIVAR_GENERAL: (id) => `/api/pacientes/${id}/reactivar`,
    PAUSAR_ESPECIALIDAD: (pacienteId, especialidadId) =>
      `/api/pacientes/${pacienteId}/especialidades-multiples/${especialidadId}/pausar`,
    REACTIVAR_ESPECIALIDAD: (pacienteId, especialidadId) =>
      `/api/pacientes/${pacienteId}/especialidades-multiples/${especialidadId}/reactivar`,
    LISTA_PAUSADOS: '/api/pacientes/pausados',

    // Control de pausas avanzado
    ESTADO_PAUSAS: (id) => `/api/pacientes/${id}/pausas`,
    PAUSA_ACTIVA: (id) => `/api/pacientes/${id}/pausa-activa`,
    HISTORIAL: (id) => `/api/pacientes/${id}/historial-pausas`,
  },

  // Control de Pausas - Sistema
  CONTROL_PAUSAS: {
    VENCIDAS: '/api/control-pausas/vencidas',
    PROXIMAS_VENCER: '/api/control-pausas/proximas-vencer',
    PROCESAR_AUTOMATICAS: '/api/control-pausas/procesar-automaticas',
    ESTADISTICAS: '/api/control-pausas/estadisticas',
  },

  // Tutores
  TUTORES: {
    BASE: '/api/tutores',
    BY_ID: (id) => `/api/tutores/${id}`,
  },

  // Sesiones Terapéuticas
  SESIONES_TERAPIA: {
    BASE: '/api/sesiones-terapia',
    BY_ID: (id) => `/api/sesiones-terapia/${id}`,
    PACIENTES: (id) => `/api/sesiones-terapia/${id}/pacientes`,
    PACIENTES_RETIRADOS: (sesionId) => `/api/sesiones-terapia/${sesionId}/pacientes-retirados`,
    REINCORPORAR_PACIENTE: (sesionId, pacienteId) => `/api/sesiones-terapia/${sesionId}/pacientes/${pacienteId}/reincorporar`,
    CRONOGRAMA: (id) => `/api/sesiones-terapia/${id}/cronograma`,
    GENERAR_CRONOGRAMA: (id) => `/api/sesiones-terapia/${id}/cronograma/generar`,
    ASISTENCIAS: (id) => `/api/sesiones-terapia/${id}/asistencias`,
    BY_TERAPEUTA: (id) => `/api/sesiones-terapia/terapeuta/${id}`,
    HOY: '/api/sesiones-terapia/hoy',
    ESTADISTICAS: '/api/sesiones-terapia/estadisticas',
    PACIENTES_DISPONIBLES: '/api/sesiones-terapia/pacientes-disponibles',
    TERAPEUTAS_DISPONIBLES: '/api/sesiones-terapia/terapeutas-disponibles',
    REGISTRAR_ASISTENCIA: (cronogramaId, pacienteId) =>
      `/api/sesiones-terapia/cronograma/${cronogramaId}/pacientes/${pacienteId}/asistencia`,
    ASISTENCIAS_CRONOGRAMA: (cronogramaId) =>
      `/api/sesiones-terapia/cronograma/${cronogramaId}/asistencia`,
    ASISTENCIAS_PACIENTE: (pacienteId) =>
      `/api/sesiones-terapia/asistencias/paciente/${pacienteId}`,
    ESTADISTICAS_ASISTENCIA: (id) =>
      `/api/sesiones-terapia/${id}/estadisticas-asistencia`,
    // Public link endpoints
    GENERAR_ENLACE_PUBLICO: (id) => `/api/sesiones-terapia/${id}/generar-enlace-publico`,
    ENLACES_PUBLICOS: (id) => `/api/sesiones-terapia/${id}/enlaces-publicos`,
    INVALIDAR_ENLACE_PUBLICO: (token) => `/api/sesiones-terapia/enlace-publico/${token}/invalidar`,
    SESION_PUBLICA: (token) => `/api/sesion-publica/${token}`,
  },

  // Sesiones Pedagógicas
  SESIONES_PEDAGOGICAS: {
    BASE: '/api/sesiones-pedagogicas',
    BY_ID: (id) => `/api/sesiones-pedagogicas/${id}`,
    ESTUDIANTES: (id) => `/api/sesiones-pedagogicas/${id}/estudiantes`,
    AGREGAR_ESTUDIANTE: (sesionId) => `/api/sesiones-pedagogicas/${sesionId}/estudiantes`,
    REMOVER_ESTUDIANTE: (sesionId, pacienteId) => `/api/sesiones-pedagogicas/${sesionId}/estudiantes/${pacienteId}`,
    ESTUDIANTES_RETIRADOS: (sesionId) => `/api/sesiones-pedagogicas/${sesionId}/estudiantes-retirados`,
    REINCORPORAR_ESTUDIANTE: (sesionId, pacienteId) => `/api/sesiones-pedagogicas/${sesionId}/estudiantes/${pacienteId}/reincorporar`,
    CRONOGRAMA: (id) => `/api/sesiones-pedagogicas/${id}/cronograma`,
    CRONOGRAMA_GENERAL: '/api/sesiones-pedagogicas/cronograma',
    GENERAR_CRONOGRAMA: (id) => `/api/sesiones-pedagogicas/${id}/cronograma/generar`,
    BY_PEDAGOGO: (id) => `/api/sesiones-pedagogicas/pedagogo/${id}`,
    HOY: '/api/sesiones-pedagogicas/hoy',
    ESTADISTICAS: '/api/sesiones-pedagogicas/estadisticas',
    ESTUDIANTES_DISPONIBLES: '/api/sesiones-pedagogicas/estudiantes-disponibles',
    PEDAGOGOS_DISPONIBLES: '/api/sesiones-pedagogicas/pedagogos-disponibles',
    CLASES_HOY: '/api/sesiones-pedagogicas/clases-hoy',
    // ==================== ATTENDANCE SYSTEM ====================
    // Get all attendance for a session
    ASISTENCIAS: (sesionId) => `/api/sesiones-pedagogicas/${sesionId}/asistencias`,
    // Register/Update attendance for specific cronograma and student
    REGISTRAR_ASISTENCIA: (cronogramaId, estudianteId) => 
      `/api/sesiones-pedagogicas/cronograma/${cronogramaId}/estudiantes/${estudianteId}/asistencia`,
    // Get attendance control for a specific class
    CONTROL_ASISTENCIA: (cronogramaId) => 
      `/api/sesiones-pedagogicas/cronograma/${cronogramaId}/control-asistencia`,
    // ==================== CRONOGRAMA MANAGEMENT ====================
    // Mark class as completed
    MARCAR_REALIZADA: (cronogramaId) => 
      `/api/sesiones-pedagogicas/cronograma/${cronogramaId}/realizar`,
    // Reschedule a class
    REPROGRAMAR_CLASE: (cronogramaId) => 
      `/api/sesiones-pedagogicas/cronograma/${cronogramaId}/reprogramar`,
    // Cancel a class
    CANCELAR_CLASE: (cronogramaId) => 
      `/api/sesiones-pedagogicas/cronograma/${cronogramaId}/cancelar`,
  },

  // Roles
  ROLES: {
    BASE: '/api/roles',
    BY_ID: (id) => `/api/roles/${id}`,
  },

  // Centros
  CENTROS: {
    BASE: '/api/centros-disponibles',
    BY_ID: (id) => `/api/centros/${id}`,
    DISPONIBLES: '/api/centros-disponibles',
  },

  // Fotos de Perfil
  FOTOS_PERFIL: {
    MI_FOTO: '/api/perfil/foto',
    USUARIO_FOTO: (id) => `/api/usuarios/${id}/foto`,
    ARCHIVO_FOTO: (rutaFoto) => `/api/fotos-perfil/archivo/${rutaFoto}`,
    ESTADISTICAS: '/api/fotos-perfil/estadisticas',
    FORMATOS: '/api/fotos-perfil/formatos',
  },

  // Dashboard
  DASHBOARD: {
    ESTADISTICAS: '/api/dashboard/estadisticas',
    USUARIOS_ACTIVOS: '/api/dashboard/usuarios-activos',
    ACTIVIDAD_RECIENTE: '/api/dashboard/actividad-reciente',
    ALERTAS: '/api/dashboard/alertas',
    CONTADOR_PACIENTES: '/api/dashboard/contador-pacientes',
    RESUMEN_PERSONAL: '/api/dashboard/resumen-personal',
    RENDIMIENTO_SEMANAL: '/api/dashboard/rendimiento-semanal',
    METRICAS_ASISTENCIA: '/api/dashboard/metricas-asistencia',
    // Role-based dashboard endpoints - Phase E1
    MIS_SESIONES_HOY: '/api/dashboard/mis-sesiones-hoy',
    MIS_CLASES_HOY: '/api/dashboard/mis-clases-hoy',
    MIS_PACIENTES: '/api/dashboard/mis-pacientes',
    MIS_ESTUDIANTES: '/api/dashboard/mis-estudiantes',
  },

  // Sistema
  SYSTEM: {
    TEST: '/api/test',
    TEST_DB: '/api/test-db',
    HEALTH: '/health',
  },
};

// Estados HTTP comunes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Mensajes de error por defecto
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  VALIDATION_ERROR: 'Los datos enviados no son válidos.',
  SERVER_ERROR: 'Error interno del servidor. Intenta nuevamente.',
  TIMEOUT: 'La solicitud tardó demasiado tiempo. Intenta nuevamente.',
};