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

// Obtiene el rol desde el usuario del contexto
const getUserRoleFromUser = (user) => {
  if (!user) return null;
  return (user.rol_nombre || user.rol || '').toLowerCase();
};

// Función para verificar permisos
const hasPermission = (module, userRole) => {
  const isAdmin = userRole === 'administrador';
  const isTherapist = userRole === 'terapeuta';
  const isPedagogue = userRole && userRole.includes('pedag');

  switch (module) {
    case 'personas':
    case 'personal':
    case 'usuarios':
    case 'especialidades':
    case 'configuracion':
    case 'reportes':
      return isAdmin;
    case 'pacientes':
    case 'tutores':
      return isAdmin || isTherapist || isPedagogue;
    case 'terapeutico':
      return isAdmin || isTherapist;
    case 'pedagogico':
      return isAdmin || isPedagogue;
    default:
      return true; // Dashboard, perfil, etc.
  }
};

// Función para generar menús basados en rol, recibe el usuario
export const getMenuItems = (user) => {
  const userRole = getUserRoleFromUser(user);

  const allMenuItems = [
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

    // Gestión de Personas - Solo Admins
    ...(hasPermission('personas', userRole) ? [
      {
        navlabel: true,
        subheader: 'Gestión de Personas',
      },
      {
        id: uniqueId(),
        title: 'Registro de Personas',
        icon: Person,
        href: ROUTES.GESTION.PERSONA,
        children: [
          {
            id: uniqueId(),
            title: 'Gestión de Personas',
            icon: People,
            href: ROUTES.GESTION.PERSONA,
          },
        ],
      },
    ] : []),

    // Administración del Sistema - Solo Admins
    ...(hasPermission('usuarios', userRole) ? [
      {
        id: uniqueId(),
        title: 'Administración del Sistema',
        icon: Security,
        href: ROUTES.GESTION.USUARIO,
        children: [
          {
            id: uniqueId(),
            title: 'Gestión de Usuarios',
            icon: SupervisorAccount,
            href: ROUTES.GESTION.USUARIO,
          },
        ],
      },
    ] : []),

    // Pacientes y Tutores - Admins y Terapeutas
    ...(hasPermission('pacientes', userRole) ? [
      {
        navlabel: true,
        subheader: 'Pacientes y Tutores',
      },
      {
        id: uniqueId(),
        title: 'Pacientes y Tutores',
        icon: LocalHospital,
        href: ROUTES.GESTION.PACIENTE,
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
    ] : []),

    // Personal y Especialidades - Solo Admins
    ...(hasPermission('personal', userRole) ? [
      {
        id: uniqueId(),
        title: 'Personal del Centro',
        icon: AccountCircle,
        href: ROUTES.GESTION.PERSONAL,
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
    ] : []),

    // Área Clínica y Educativa
    ...(hasPermission('terapeutico', userRole) || hasPermission('pedagogico', userRole) ? [
      {
        navlabel: true,
        subheader: 'Área Clínica y Educativa',
      },
    ] : []),

    // Área Terapéutica - Admins y Terapeutas
    ...(hasPermission('terapeutico', userRole) ? [
      {
        id: uniqueId(),
        title: 'Área Terapéutica',
        icon: Psychology,
        href: ROUTES.TERAPEUTICO.BASE,
      },
    ] : []),

    // Área Pedagógica - Admins y Pedagogos
    ...(hasPermission('pedagogico', userRole) ? [
      {
        id: uniqueId(),
        title: 'Área Pedagógica',
        icon: School,
        href: ROUTES.PEDAGOGICO.BASE,
      },
    ] : []),

    // Reportes - Solo Admins (OCULTO TEMPORALMENTE)
    // ...(hasPermission('reportes', userRole) ? [
    //   {
    //     navlabel: true,
    //     subheader: 'Reportes',
    //   },
    //   {
    //     id: uniqueId(),
    //     title: 'Sistema de Reportes',
    //     icon: Assessment,
    //     href: ROUTES.REPORTES.SISTEMA,
    //   },
    // ] : []),

    // Configuración - Solo Admins
    ...(hasPermission('configuracion', userRole) ? [
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
    ] : []),

    // Mi Cuenta - Todos
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

  return allMenuItems;
};

// Ya no exportamos el menú estático, sino la función
