// src/config/routes.js
// Configuración centralizada de todas las rutas de la aplicación

export const ROUTES = {
  // Ruta raíz (Landing page)
  ROOT: '/',

  // Autenticación
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ERROR_404: '/auth/404',
  },

  // Dashboard principal
  DASHBOARD: '/app/dashboard',

  // Perfil de usuario
  PROFILE: '/app/mi-perfil',

  // Módulo de gestión
  GESTION: {
    PERSONA: '/app/gestion/persona',
    USUARIO: '/app/gestion/usuario',
    PACIENTE: '/app/gestion/paciente',
    TUTOR: '/app/gestion/tutor',
    ESPECIALIDAD: '/app/gestion/especialidad',
    PERSONAL: '/app/gestion/personal',
    ROLES: '/app/gestion/roles',
  },

  // Módulo terapéutico
  TERAPEUTICO: {
    BASE: '/app/terapeutico',
    SESION: (id) => `/app/terapeutico/sesion/${id}`,
    CREAR_SESION: '/app/terapeutico/crear-sesion',
  },

  // Módulo pedagógico
  PEDAGOGICO: {
    BASE: '/app/pedagogico',
    SESIONES: '/app/pedagogico/sesiones',
    CRONOGRAMAS: '/app/pedagogico/cronogramas',
    ASISTENCIA: '/app/pedagogico/asistencia',
    EVALUACIONES: '/app/pedagogico/evaluaciones',
    ESTADISTICAS: '/app/pedagogico/estadisticas',
    SESION: (id) => `/app/pedagogico/sesion/${id}`,
    CREAR_SESION: '/app/pedagogico/crear-sesion',
  },

  // Documentos
  DOCUMENTOS: {
    PACIENTE: (pacienteId) => `/app/pacientes/${pacienteId}/documentos`,
    PERSONAL: (personalId) => `/app/personal/${personalId}/documentos`,
  },

  // Consultas especializadas
  CONSULTAS: {
    PACIENTES_DISPONIBLES: '/app/consultas/pacientes-disponibles',
    TERAPEUTAS_DISPONIBLES: '/app/consultas/terapeutas-disponibles',
    SESIONES_TERAPEUTA: '/app/consultas/sesiones-terapeuta',
    HISTORIAL_ASISTENCIA: '/app/consultas/historial-asistencia',
  },

  // Reportes y estadísticas
  REPORTES: {
    BASE: '/app/reportes',
    DASHBOARD: '/app/reportes/dashboard',
    ESTADISTICAS: '/app/reportes/estadisticas',
    PDF: '/app/reportes/pdf',
    SISTEMA: '/app/reportes/sistema',
  },

  // Configuración del sistema
  CONFIGURACION: {
    BASE: '/app/configuracion',
    GENERAL: '/app/configuracion/general',
    SISTEMA: '/app/configuracion/sistema',
  },

  // Rutas legacy/temporales (para compatibilidad)
  LEGACY: {
    APPS: {
      CONTACTS: '/app/apps/contacts',
      USER_PROFILE: {
        FOLLOWERS: '/app/apps/user-profile/followers',
        FRIENDS: '/app/apps/user-profile/friends',
        GALLERY: '/app/apps/user-profile/gallery',
      },
    },
    PAGES: {
      ACCOUNT_SETTINGS: '/app/pages/account-settings',
    },
    FORMS: {
      LAYOUTS: '/app/forms/form-layouts',
      VALIDATION: '/app/forms/form-validation',
    },
    TABLES: {
      BASIC: '/app/tables/basic',
      PAGINATION: '/app/tables/pagination',
      SEARCH: '/app/tables/search',
    },
  },
};

// Helper functions para navegación
export const getRouteParams = {
  terapeuticoSesion: (id) => ROUTES.TERAPEUTICO.SESION(id),
  documentosPaciente: (pacienteId) => ROUTES.DOCUMENTOS.PACIENTE(pacienteId),
  documentosPersonal: (personalId) => ROUTES.DOCUMENTOS.PERSONAL(personalId),
};

// Rutas que requieren autenticación
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ...Object.values(ROUTES.GESTION),
  ROUTES.TERAPEUTICO.BASE,
  ...Object.values(ROUTES.PEDAGOGICO),
  ...Object.values(ROUTES.CONSULTAS),
  ...Object.values(ROUTES.REPORTES),
  ...Object.values(ROUTES.CONFIGURACION),
];

// Rutas públicas (sin autenticación)
export const PUBLIC_ROUTES = [
  ROUTES.ROOT,
  ...Object.values(ROUTES.AUTH),
];

// Validar si una ruta requiere autenticación
export const isProtectedRoute = (path) => {
  return PROTECTED_ROUTES.some(route => {
    // Soporte para rutas dinámicas
    if (typeof route === 'function') return false;
    return path.startsWith(route);
  });
};

// Validar si una ruta es pública
export const isPublicRoute = (path) => {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
};