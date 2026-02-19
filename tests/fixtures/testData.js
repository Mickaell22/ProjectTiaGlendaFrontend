// Test data fixtures for E2E tests

export const credentials = {
  admin: {
    username: process.env.TEST_ADMIN_USER || 'admin.norte',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
  },
  terapeuta: {
    username: process.env.TEST_TERAPEUTA_USER || 'terapeuta.ana',
    password: process.env.TEST_TERAPEUTA_PASSWORD || 'admin123',
  },
  pedagogo: {
    username: process.env.TEST_PEDAGOGO_USER || 'pedagogo.sandra',
    password: process.env.TEST_PEDAGOGO_PASSWORD || 'admin123',
  },
};

export const routes = {
  login: '/auth/login',
  dashboard: '/app/dashboard',
  persona: '/app/gestion/persona',
  usuario: '/app/gestion/usuario',
  paciente: '/app/gestion/paciente',
  tutor: '/app/gestion/tutor',
  especialidad: '/app/gestion/especialidad',
  personal: '/app/gestion/personal',
  centro: '/app/gestion/centro',
  terapeutico: '/app/terapeutico',
  pedagogico: '/app/pedagogico',
  pedagogicoSesiones: '/app/pedagogico/sesiones',
  pedagogicoCronogramas: '/app/pedagogico/cronogramas',
  pedagogicoAsistencia: '/app/pedagogico/asistencia',
  reportes: '/app/reportes',
  perfil: '/app/mi-perfil',
};

export const testPersona = {
  nombre: 'Test',
  apellido: 'Playwright',
  cedula: `99${Date.now().toString().slice(-7)}`,
  telefono: '0999999999',
  correo: `test.playwright.${Date.now()}@example.com`,
  direccion: 'Av. Test 123, Ciudad',
  fecha_nacimiento: '1990-06-15',
};

export const testEspecialidad = {
  nombre: `Especialidad Test ${Date.now()}`,
  area: 'Especialidad terapeutica',
};

export const tooltips = {
  verDetalles: 'Ver detalles',
  editar: 'Editar',
  desactivar: 'Desactivar',
  reactivar: 'Reactivar',
};
