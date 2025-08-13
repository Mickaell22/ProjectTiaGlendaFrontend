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

  // Especialidades
  ESPECIALIDADES: {
    BASE: '/api/especialidades',
    BY_ID: (id) => `/api/especialidades/${id}`,
  },

  // Pacientes
  PACIENTES: {
    BASE: '/api/pacientes',
    BY_ID: (id) => `/api/pacientes/${id}`,
    DOCUMENTOS: (id) => `/api/pacientes/${id}/documentos`,
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
  },

  // Sesiones Pedagógicas
  SESIONES_PEDAGOGICAS: {
    BASE: '/api/sesiones-pedagogicas',
    BY_ID: (id) => `/api/sesiones-pedagogicas/${id}`,
    // Se pueden agregar más endpoints cuando estén implementados
  },

  // Roles
  ROLES: {
    BASE: '/api/roles',
    BY_ID: (id) => `/api/roles/${id}`,
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