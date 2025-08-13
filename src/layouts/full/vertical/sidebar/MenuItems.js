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
  Security,
  EventAvailable,
  CheckCircle,
  PersonSearch,
  Today,
  DateRange,
  Groups,
  Work,
  Business
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
    icon: LocalHospital,
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
        title: 'Cronogramas',
        icon: Schedule,
        href: '/terapeutico/cronogramas',
      },
      {
        id: uniqueId(),
        title: 'Control de Asistencia',
        icon: CheckCircle,
        href: '/terapeutico/asistencia',
      },
      {
        id: uniqueId(),
        title: 'Sesiones de Hoy',
        icon: Today,
        href: '/terapeutico/hoy',
      },
      {
        id: uniqueId(),
        title: 'Estadísticas Terapéuticas',
        icon: BarChart,
        href: '/terapeutico/estadisticas',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Área Pedagógica',
    icon: School,
    href: '/pedagogico',
    children: [
      {
        id: uniqueId(),
        title: 'Sesiones Pedagógicas',
        icon: MenuBook,
        href: '/pedagogico/sesiones',
      },
      {
        id: uniqueId(),
        title: 'Cronograma de Clases',
        icon: CalendarMonth,
        href: '/pedagogico/cronogramas',
      },
      {
        id: uniqueId(),
        title: 'Asistencia Estudiantil',
        icon: CheckCircle,
        href: '/pedagogico/asistencia',
      },
      {
        id: uniqueId(),
        title: 'Evaluaciones y Notas',
        icon: Assessment,
        href: '/pedagogico/evaluaciones',
      },
      {
        id: uniqueId(),
        title: 'Estadísticas Académicas',
        icon: AutoGraph,
        href: '/pedagogico/estadisticas',
      },
    ],
  },

  {
    navlabel: true,
    subheader: 'Consultas y Reportes',
  },
  {
    id: uniqueId(),
    title: 'Consultas Especializadas',
    icon: PersonSearch,
    href: '/consultas',
    children: [
      {
        id: uniqueId(),
        title: 'Pacientes Disponibles',
        icon: Groups,
        href: '/consultas/pacientes-disponibles',
      },
      {
        id: uniqueId(),
        title: 'Terapeutas Disponibles',
        icon: Work,
        href: '/consultas/terapeutas-disponibles',
      },
      {
        id: uniqueId(),
        title: 'Sesiones por Terapeuta',
        icon: Person,
        href: '/consultas/sesiones-terapeuta',
      },
      {
        id: uniqueId(),
        title: 'Historial de Asistencia',
        icon: DateRange,
        href: '/consultas/historial-asistencia',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Reportes y Estadísticas',
    icon: BarChart,
    href: '/reportes',
    children: [
      {
        id: uniqueId(),
        title: 'Dashboard Ejecutivo',
        icon: Dashboard,
        href: '/reportes/dashboard',
      },
      {
        id: uniqueId(),
        title: 'Estadísticas Generales',
        icon: TrendingUp,
        href: '/reportes/estadisticas',
      },
      {
        id: uniqueId(),
        title: 'Informes PDF',
        icon: PictureAsPdf,
        href: '/reportes/pdf',
      },
    ],
  },

  {
    navlabel: true,
    subheader: 'Configuración del Sistema',
  },
  {
    id: uniqueId(),
    title: 'Configuraciones',
    icon: AdminPanelSettings,
    href: '/configuracion',
    children: [
      {
        id: uniqueId(),
        title: 'Gestión de Roles',
        icon: Security,
        href: '/gestion/roles',
      },
      {
        id: uniqueId(),
        title: 'Configuración General',
        icon: Business,
        href: '/configuracion/general',
      },
    ],
  },
];

export default Menuitems;
