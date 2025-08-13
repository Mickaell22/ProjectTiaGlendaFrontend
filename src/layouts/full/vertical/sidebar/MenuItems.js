// src/layouts/full/vertical/sidebar/MenuItems.js
import {
  Dashboard,
  People,
  Group,
  AdminPanelSettings,
  LocalHospital,
  SchoolOutlined,
  AccountCircle,
  Favorite,
  School,
  CalendarMonth,
  InsertChart,
  Login,
  PersonAdd,
  TrendingUp,
  Person,
  SupervisorAccount,
  FamilyRestroom,
  MedicalServices,
  Psychology,
  MenuBook,
  Assignment,
  Assessment,
  Timeline,
  Event,
  Schedule,
  BarChart,
  PictureAsPdf,
  AutoGraph,
  Security
} from '@mui/icons-material';

// Función simple para generar IDs únicos
const uniqueId = () => Math.random().toString(36).substring(2, 15);

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Panel Principal',
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
    title: 'Registro de Personas',
    icon: Person,
    href: '/apps/contacts',
    children: [
      {
        id: uniqueId(),
        title: 'Gestión de Personas',
        icon: People,
        href: '/gestion/persona',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Administración del Sistema',
    icon: Security,
    href: '/apps/user-profile/followers',
    children: [
      {
        id: uniqueId(),
        title: 'Gestión de Usuarios',
        icon: SupervisorAccount,
        href: '/gestion/usuario',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Pacientes y Estudiantes',
    icon: LocalHospital,
    href: '/apps/user-profile/followers',
    children: [
      {
        id: uniqueId(),
        title: 'Gestión de Pacientes',
        icon: MedicalServices,
        href: '/gestion/paciente',
      },
      {
        id: uniqueId(),
        title: 'Gestión de Estudiantes',
        icon: School,
        href: '/gestion/alumno',
      },
      {
        id: uniqueId(),
        title: 'Gestión de Tutores',
        icon: FamilyRestroom,
        href: '/gestion/tutor',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Personal del Centro',
    icon: AccountCircle,
    href: '/apps/user-profile/followers',
    children: [
      {
        id: uniqueId(),
        title: 'Gestión de Especialidades',
        icon: Psychology,
        href: '/gestion/especialidad',
      },
      {
        id: uniqueId(),
        title: 'Gestión de Personal',
        icon: SupervisorAccount,
        href: '/gestion/personal',
      },
    ],
  },

  {
    navlabel: true,
    subheader: 'Área Clínica y Educativa',
  },
  {
    id: uniqueId(),
    title: 'Área Terapéutica',
    icon: Favorite,
    href: '/terapeutico',
    children: [
      {
        id: uniqueId(),
        title: 'Sesiones Terapéuticas',
        icon: MedicalServices,
        href: '/terapeutico/sesiones',
      },
      {
        id: uniqueId(),
        title: 'Evaluaciones Clínicas',
        icon: Assessment,
        href: '/terapeutico/evaluaciones',
      },
      {
        id: uniqueId(),
        title: 'Planes de Tratamiento',
        icon: Assignment,
        href: '/terapeutico/planes',
      },
      {
        id: uniqueId(),
        title: 'Seguimiento y Progreso',
        icon: Timeline,
        href: '/terapeutico/seguimiento',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Área Pedagógica',
    icon: MenuBook,
    href: '/pedagogico',
    children: [
      {
        id: uniqueId(),
        title: 'Sesiones Pedagógicas',
        icon: School,
        href: '/pedagogico/sesiones',
      },
      {
        id: uniqueId(),
        title: 'Programas Educativos',
        icon: SchoolOutlined,
        href: '/pedagogico/programas',
      },
      {
        id: uniqueId(),
        title: 'Evaluaciones Académicas',
        icon: Assessment,
        href: '/pedagogico/evaluaciones',
      },
      {
        id: uniqueId(),
        title: 'Progreso Académico',
        icon: AutoGraph,
        href: '/pedagogico/progreso',
      },
    ],
  },

  {
    navlabel: true,
    subheader: 'Programación y Reportes',
  },
  {
    id: uniqueId(),
    title: 'Gestión de Horarios',
    icon: Schedule,
    href: '/horarios',
    children: [
      {
        id: uniqueId(),
        title: 'Programar Sesiones',
        icon: Event,
        href: '/horarios/citas',
      },
      {
        id: uniqueId(),
        title: 'Calendario Semanal',
        icon: CalendarMonth,
        href: '/horarios/semanal',
      },
      {
        id: uniqueId(),
        title: 'Disponibilidad Personal',
        icon: Schedule,
        href: '/horarios/disponibilidad',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Informes y Estadísticas',
    icon: BarChart,
    href: '/informes',
    children: [
      {
        id: uniqueId(),
        title: 'Generar Informes',
        icon: PictureAsPdf,
        href: '/informes/generar',
      },
      {
        id: uniqueId(),
        title: 'Panel de Estadísticas',
        icon: TrendingUp,
        href: '/informes/estadisticas',
      },
      {
        id: uniqueId(),
        title: 'Reportes Mensuales',
        icon: InsertChart,
        href: '/informes/mensuales',
      },
    ],
  },

  {
    navlabel: true,
    subheader: 'Autenticación y Acceso',
  },
  {
    id: uniqueId(),
    title: 'Iniciar Sesión',
    icon: Login,
    href: '/auth/login',
  },
  {
    id: uniqueId(),
    title: 'Crear Cuenta',
    icon: PersonAdd,
    href: '/auth/register',
  },
];

export default Menuitems;
