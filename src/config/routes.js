// src/config/routes.js
// Configuración centralizada de todas las rutas de la aplicación

export const ROUTES = {
  // Ruta raíz
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
  DASHBOARD: '/dashboard',

  // Perfil de usuario
  PROFILE: '/mi-perfil',

  // Módulo de gestión
  GESTION: {
    PERSONA: '/gestion/persona',
    USUARIO: '/gestion/usuario',
    PACIENTE: '/gestion/paciente',
    TUTOR: '/gestion/tutor',
    ESPECIALIDAD: '/gestion/especialidad',
    PERSONAL: '/gestion/personal',
    ROLES: '/gestion/roles',
  },

  // Módulo terapéutico
  TERAPEUTICO: {
    BASE: '/terapeutico',
    SESION: (id) => `/terapeutico/sesion/${id}`,
    CREAR_SESION: '/terapeutico/crear-sesion',
  },

  // Módulo pedagógico
  PEDAGOGICO: {
    BASE: '/pedagogico',
    SESIONES: '/pedagogico/sesiones',
    CRONOGRAMAS: '/pedagogico/cronogramas',
    ASISTENCIA: '/pedagogico/asistencia',
    EVALUACIONES: '/pedagogico/evaluaciones',
    ESTADISTICAS: '/pedagogico/estadisticas',
    SESION: (id) => `/pedagogico/sesion/${id}`,
    CREAR_SESION: '/pedagogico/crear-sesion',
  },

  // Documentos
  DOCUMENTOS: {
    PACIENTE: (pacienteId) => `/pacientes/${pacienteId}/documentos`,
    PERSONAL: (personalId) => `/personal/${personalId}/documentos`,
  },

  // Consultas especializadas
  CONSULTAS: {
    PACIENTES_DISPONIBLES: '/consultas/pacientes-disponibles',
    TERAPEUTAS_DISPONIBLES: '/consultas/terapeutas-disponibles',
    SESIONES_TERAPEUTA: '/consultas/sesiones-terapeuta',
    HISTORIAL_ASISTENCIA: '/consultas/historial-asistencia',
  },

  // Reportes y estadísticas
  REPORTES: {
    BASE: '/reportes',
    DASHBOARD: '/reportes/dashboard',
    ESTADISTICAS: '/reportes/estadisticas',
    PDF: '/reportes/pdf',
    SISTEMA: '/reportes/sistema',
  },

  // Configuración del sistema
  CONFIGURACION: {
    BASE: '/configuracion',
    GENERAL: '/configuracion/general',
    SISTEMA: '/configuracion/sistema',
  },

  // Rutas legacy/temporales (para compatibilidad)
  LEGACY: {
    APPS: {
      CONTACTS: '/apps/contacts',
      USER_PROFILE: {
        FOLLOWERS: '/apps/user-profile/followers',
        FRIENDS: '/apps/user-profile/friends',
        GALLERY: '/apps/user-profile/gallery',
      },
    },
    PAGES: {
      ACCOUNT_SETTINGS: '/pages/account-settings',
    },
    FORMS: {
      LAYOUTS: '/forms/form-layouts',
      VALIDATION: '/forms/form-validation',
    },
    TABLES: {
      BASIC: '/tables/basic',
      PAGINATION: '/tables/pagination',
      SEARCH: '/tables/search',
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