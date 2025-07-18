// src/layouts/full/vertical/sidebar/MenuItems.js
import {
  Dashboard,
  People,
  Business,
  FiberManualRecord,
  TableChart,
  Description,
  Settings,
  CalendarToday,
  Assignment,
  Favorite,
  School,
  Camera,
  TrendingUp,
  Login,
  PersonAdd,
  Error,
} from '@mui/icons-material';

// Función simple para generar IDs únicos
const uniqueId = () => Math.random().toString(36).substring(2, 15);

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Principal',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: Dashboard,
    href: '/dashboard',
  },
  
  {
    navlabel: true,
    subheader: 'Gestión de Personas',
  },
  {
    id: uniqueId(),
    title: 'Pacientes/Alumnos',
    icon: People,
    href: '/apps/contacts',
  },
  {
    id: uniqueId(),
    title: 'Personal',
    icon: Business,
    href: '/apps/user-profile/followers',
    children: [
      {
        id: uniqueId(),
        title: 'Lista de Personal',
        icon: FiberManualRecord,
        href: '/apps/user-profile/followers',
      },
      {
        id: uniqueId(),
        title: 'Equipos de Trabajo',
        icon: FiberManualRecord,
        href: '/apps/user-profile/friends',
      },
    ],
  },

  {
    navlabel: true,
    subheader: 'Módulos Específicos',
  },
  {
    id: uniqueId(),
    title: 'Módulo Terapéutico',
    icon: Favorite,
    href: '/terapeutico',
    children: [
      {
        id: uniqueId(),
        title: 'Evaluaciones',
        icon: FiberManualRecord,
        href: '/terapeutico/evaluaciones',
      },
      {
        id: uniqueId(),
        title: 'Planes de Tratamiento',
        icon: FiberManualRecord,
        href: '/terapeutico/planes',
      },
      {
        id: uniqueId(),
        title: 'Seguimiento',
        icon: FiberManualRecord,
        href: '/terapeutico/seguimiento',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Módulo Pedagógico',
    icon: School,
    href: '/pedagogico',
    children: [
      {
        id: uniqueId(),
        title: 'Programas Educativos',
        icon: FiberManualRecord,
        href: '/pedagogico/programas',
      },
      {
        id: uniqueId(),
        title: 'Evaluaciones Académicas',
        icon: FiberManualRecord,
        href: '/pedagogico/evaluaciones',
      },
      {
        id: uniqueId(),
        title: 'Progreso Académico',
        icon: FiberManualRecord,
        href: '/pedagogico/progreso',
      },
    ],
  },

  {
    navlabel: true,
    subheader: 'Gestión del Centro',
  },
  {
    id: uniqueId(),
    title: 'Horarios',
    icon: CalendarToday,
    href: '/horarios',
    children: [
      {
        id: uniqueId(),
        title: 'Programar Citas',
        icon: FiberManualRecord,
        href: '/horarios/citas',
      },
      {
        id: uniqueId(),
        title: 'Calendario Semanal',
        icon: FiberManualRecord,
        href: '/horarios/semanal',
      },
      {
        id: uniqueId(),
        title: 'Disponibilidad',
        icon: FiberManualRecord,
        href: '/horarios/disponibilidad',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Informes',
    icon: Assignment,
    href: '/informes',
    children: [
      {
        id: uniqueId(),
        title: 'Generar Informes',
        icon: FiberManualRecord,
        href: '/informes/generar',
      },
      {
        id: uniqueId(),
        title: 'Estadísticas',
        icon: TrendingUp,
        href: '/informes/estadisticas',
      },
      {
        id: uniqueId(),
        title: 'Reportes Mensuales',
        icon: FiberManualRecord,
        href: '/informes/mensuales',
      },
    ],
  },

  {
    navlabel: true,
    subheader: 'Centro',
  },
  {
    id: uniqueId(),
    title: 'Galería',
    icon: Camera,
    href: '/apps/user-profile/gallery',
  },
  {
    id: uniqueId(),
    title: 'Configuración',
    icon: Settings,
    href: '/pages/account-settings',
  },

  // Mantener elementos útiles para desarrollo/formularios
  {
    navlabel: true,
    subheader: 'Herramientas',
  },
  {
    id: uniqueId(),
    title: 'Formularios',
    icon: Description,
    href: '/forms/form-layouts',
    children: [
      {
        id: uniqueId(),
        title: 'Layouts',
        icon: FiberManualRecord,
        href: '/forms/form-layouts',
      },
      {
        id: uniqueId(),
        title: 'Validación',
        icon: FiberManualRecord,
        href: '/forms/form-validation',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Tablas',
    icon: TableChart,
    href: '/tables/basic',
    children: [
      {
        id: uniqueId(),
        title: 'Básica',
        icon: FiberManualRecord,
        href: '/tables/basic',
      },
      {
        id: uniqueId(),
        title: 'Con Paginación',
        icon: FiberManualRecord,
        href: '/tables/pagination',
      },
      {
        id: uniqueId(),
        title: 'Con Búsqueda',
        icon: FiberManualRecord,
        href: '/tables/search',
      },
    ],
  },

  // Mantener autenticación para referencia
  {
    navlabel: true,
    subheader: 'Autenticación',
  },
  {
    id: uniqueId(),
    title: 'Iniciar Sesión',
    icon: Login,
    href: '/auth/login',
  },
  {
    id: uniqueId(),
    title: 'Registrarse',
    icon: PersonAdd,
    href: '/auth/register',
  },
  {
    id: uniqueId(),
    title: 'Error 404',
    icon: Error,
    href: '/auth/404',
  },
];

export default Menuitems;