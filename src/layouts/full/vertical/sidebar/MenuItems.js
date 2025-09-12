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
    href: ROUTES.PEDAGOGICO.BASE,
  },

  {
    navlabel: true,
    subheader: 'Reportes',
  },
  {
    id: uniqueId(),
    title: 'Sistema de Reportes',
    icon: Assessment,
    href: ROUTES.REPORTES.SISTEMA,
  },

  {
    navlabel: true,
    subheader: 'Configuración del Sistema',
  },
  {
    id: uniqueId(),
    title: 'Configuraciones del Sistema',
    icon: AdminPanelSettings,
    href: '/configuracion',
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
