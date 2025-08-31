// src/layouts/full/vertical/sidebar/MenuItems.js
import {
  Dashboard,
  People,
  AdminPanelSettings,
  LocalHospital,
  AccountCircle,
  School,
  CalendarMonth,
  TrendingUp,
  Person,
  SupervisorAccount,
  FamilyRestroom,
  MedicalServices,
  Psychology,
  MenuBook,
  Assessment,
  BarChart,
  PictureAsPdf,
  AutoGraph,
  Security,
  CheckCircle,
  PersonSearch,
  DateRange,
  Groups,
  Work,
  Business,
  Logout,
  AccountBox
} from '@mui/icons-material';
import { ROUTES } from '../../../../config/routes';

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
    href: ROUTES.DASHBOARD,
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
        href: ROUTES.GESTION.PERSONA,
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
        href: ROUTES.GESTION.USUARIO,
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
        href: ROUTES.GESTION.PACIENTE,
      },
      {
        id: uniqueId(),
        title: 'Gestión de Tutores',
        icon: FamilyRestroom,
        href: ROUTES.GESTION.TUTOR,
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
        href: ROUTES.GESTION.ESPECIALIDAD,
      },
      {
        id: uniqueId(),
        title: 'Gestión de Personal',
        icon: SupervisorAccount,
        href: ROUTES.GESTION.PERSONAL,
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
    icon: Psychology,
    href: ROUTES.TERAPEUTICO.BASE,
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
        href: ROUTES.PEDAGOGICO.SESIONES,
      },
      {
        id: uniqueId(),
        title: 'Cronograma de Clases',
        icon: CalendarMonth,
        href: ROUTES.PEDAGOGICO.CRONOGRAMAS,
      },
      {
        id: uniqueId(),
        title: 'Asistencia Estudiantil',
        icon: CheckCircle,
        href: ROUTES.PEDAGOGICO.ASISTENCIA,
      },
      {
        id: uniqueId(),
        title: 'Evaluaciones y Notas',
        icon: Assessment,
        href: ROUTES.PEDAGOGICO.EVALUACIONES,
      },
      {
        id: uniqueId(),
        title: 'Estadísticas Académicas',
        icon: AutoGraph,
        href: ROUTES.PEDAGOGICO.ESTADISTICAS,
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
        href: ROUTES.CONSULTAS.PACIENTES_DISPONIBLES,
      },
      {
        id: uniqueId(),
        title: 'Terapeutas Disponibles',
        icon: Work,
        href: ROUTES.CONSULTAS.TERAPEUTAS_DISPONIBLES,
      },
      {
        id: uniqueId(),
        title: 'Sesiones por Terapeuta',
        icon: Person,
        href: ROUTES.CONSULTAS.SESIONES_TERAPEUTA,
      },
      {
        id: uniqueId(),
        title: 'Historial de Asistencia',
        icon: DateRange,
        href: ROUTES.CONSULTAS.HISTORIAL_ASISTENCIA,
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
        href: ROUTES.REPORTES.DASHBOARD,
      },
      {
        id: uniqueId(),
        title: 'Estadísticas Generales',
        icon: TrendingUp,
        href: ROUTES.REPORTES.ESTADISTICAS,
      },
      {
        id: uniqueId(),
        title: 'Informes PDF',
        icon: PictureAsPdf,
        href: ROUTES.REPORTES.PDF,
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
        href: ROUTES.GESTION.ROLES,
      },
      {
        id: uniqueId(),
        title: 'Configuración General',
        icon: Business,
        href: ROUTES.CONFIGURACION.GENERAL,
      },
      {
        id: uniqueId(),
        title: 'Configuraciones del Sistema',
        icon: AdminPanelSettings,
        href: ROUTES.CONFIGURACION.SISTEMA,
      },
    ],
  },

  {
    navlabel: true,
    subheader: 'Mi Cuenta',
  },
  {
    id: uniqueId(),
    title: 'Mi Perfil',
    icon: AccountBox,
    href: ROUTES.PROFILE,
  },
  {
    id: uniqueId(),
    title: 'Cerrar Sesión',
    icon: Logout,
    href: ROUTES.AUTH.LOGOUT,
    action: 'logout'
  },
];

export default Menuitems;
