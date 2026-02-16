// src/routes/Router.jsx - Versión completa con páginas en desarrollo
import { Navigate } from 'react-router-dom';

// Layouts
import FullLayout from 'src/layouts/full/FullLayout';
import BlankLayout from 'src/layouts/blank/BlankLayout';

// Páginas principales
import Login from 'src/views/authentication/auth1/Login';
import DashboardMain from 'src/views/dashboard/DashboardMain';
import PersonaMain from 'src/views/persona/PersonaMain';
import PacienteMain from 'src/views/paciente/PacienteMain';
 
import TutorMain from 'src/views/tutor/TutorMain';
import UsuarioMain from 'src/views/usuario/UsuarioMain';
import EspecialidadMain from 'src/views/especialidad/EspecialidadMain';
import CentroMain from 'src/views/centro/CentroMain';
import PersonalMain from 'src/views/personal/PersonalMain';
import TerapeuticoMain from 'src/views/terapeutico/TerapeuticoMain';
import SesionTerapeuticaDetalle from 'src/views/terapeutico/SesionTerapeuticaDetalle';
import CrearSesionTerapeutica from 'src/views/terapeutico/CrearSesionTerapeutica';
import PedagogicoMain from 'src/views/pedagogico/PedagogicoMain';
import SesionPedagogicaDetalle from 'src/views/pedagogico/SesionPedagogicaDetalle';
import CrearSesionPedagogica from 'src/views/pedagogico/CrearSesionPedagogica';
import DocumentosPaciente from 'src/components/Pacientes/DocumentosPaciente';
import DocumentosPersonal from 'src/components/Personal/DocumentosPersonal';
import ConfiguracionMain from 'src/views/configuracion/ConfiguracionMain';
import MiPerfil from 'src/views/perfil/MiPerfil';
import { ReportesPage } from 'src/views/reportes';
import PublicSessionView from 'src/views/public/PublicSessionView';
import PublicPedagogicalSessionView from 'src/views/public/PublicPedagogicalSessionView';
import HistorialPausasView from 'src/views/paciente/HistorialPausasView';
import DashboardPausasView from 'src/views/DashboardPausasView';
import LandingPage from 'src/views/landing/LandingPage';






// Componente para páginas en desarrollo
import ComingSoon from 'src/components/shared/ComingSoon';
import ProtectedRoute from 'src/components/shared/ProtectedRoute';
import { ROUTES } from '../config/routes';

// Páginas específicas del área pedagógica
import PedagogicoCronogramasImpl from 'src/views/pedagogico/PedagogicoCronogramas';
import PedagogicoAsistenciaImpl from 'src/views/pedagogico/PedagogicoAsistencia';

const PedagogicoCronogramas = PedagogicoCronogramasImpl;

const PedagogicoAsistencia = PedagogicoAsistenciaImpl;

const PedagogicoEvaluaciones = () => (
  <ComingSoon
    title="Evaluaciones y Notas"
    description="Sistema de evaluación académica y gestión de calificaciones"
    module="Pedagógico"
    progress={30}
  />
);

const PedagogicoEstadisticas = () => (
  <ComingSoon
    title="Estadísticas Académicas"
    description="Análisis del rendimiento académico y métricas educativas"
    module="Pedagógico"
    progress={25}
  />
);

// Los demás componentes de reportes serán implementados en futuras fases

// Configuraciones del sistema
const GestionRoles = () => (
  <ComingSoon
    title="Gestión de Roles"
    description="Administración de roles y permisos del sistema"
    module="Configuración"
    progress={30}
  />
);

const ConfiguracionGeneral = () => (
  <ComingSoon
    title="Configuración General"
    description="Configuraciones generales del sistema"
    module="Configuración"
    progress={40}
  />
);

const PacientesAlumnos = () => (
  <ComingSoon
    title="Pacientes/Alumnos"
    description="Gestión integral de pacientes y alumnos del centro"
    module="Gestión de Personas"
    progress={60}
  />
);

const PersonalLista = () => (
  <ComingSoon
    title="Lista de Personal"
    description="Directorio y gestión del personal del centro"
    module="Gestión de Personas"
    progress={45}
  />
);

const PersonalEquipos = () => (
  <ComingSoon
    title="Equipos de Trabajo"
    description="Organización y gestión de equipos multidisciplinarios"
    module="Gestión de Personas"
    progress={30}
  />
);

const Galeria = () => (
  <ComingSoon
    title="Galería"
    description="Galería de fotos y recursos multimedia del centro"
    module="Centro"
    progress={70}
  />
);

const Configuracion = () => (
  <ComingSoon
    title="Configuración"
    description="Configuración general del sistema y preferencias"
    module="Centro"
    progress={80}
  />
);

const Router = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/dashboard',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: '/configuracion',
    element: <Navigate to="/app/configuracion" replace />,
  },
  {
    path: '/mi-perfil',
    element: <Navigate to="/app/mi-perfil" replace />,
  },
  {
    path: '/gestion',
    children: [
      { path: 'persona', element: <Navigate to="/app/gestion/persona" replace /> },
      { path: 'paciente', element: <Navigate to="/app/gestion/paciente" replace /> },
      { path: 'tutor', element: <Navigate to="/app/gestion/tutor" replace /> },
      { path: 'usuario', element: <Navigate to="/app/gestion/usuario" replace /> },
      { path: 'especialidad', element: <Navigate to="/app/gestion/especialidad" replace /> },
      { path: 'centro', element: <Navigate to="/app/gestion/centro" replace /> },
      { path: 'personal', element: <Navigate to="/app/gestion/personal" replace /> },
      { path: 'roles', element: <Navigate to="/app/gestion/roles" replace /> },
    ],
  },
  {
    path: '/terapeutico',
    element: <Navigate to="/app/terapeutico" replace />,
  },
  {
    path: '/pedagogico',
    element: <Navigate to="/app/pedagogico" replace />,
  },
  {
    path: '/reportes',
    element: <Navigate to="/app/reportes/sistema" replace />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/app', element: <Navigate to="/app/dashboard" /> },
      { path: 'dashboard', element: <DashboardMain /> },
      { path: 'mi-perfil', element: <MiPerfil /> },

      // Gestión de Personas
      { path: 'apps/contacts', element: <PacientesAlumnos /> },
      { path: 'apps/user-profile/followers', element: <PersonalLista /> },
      { path: 'apps/user-profile/friends', element: <PersonalEquipos /> },
      { path: 'gestion/persona', element: <PersonaMain /> },
      { path: 'gestion/paciente', element: <PacienteMain /> },
      { path: 'gestion/tutor', element: <TutorMain /> },
      { path: 'gestion/usuario', element: <UsuarioMain /> },
      { path: 'gestion/especialidad', element: <EspecialidadMain /> },
      { path: 'gestion/centro', element: <CentroMain /> },
      { path: 'gestion/personal', element: <PersonalMain /> },
      { path: 'pacientes/:pacienteId/documentos', element: <DocumentosPaciente /> },
      { path: 'personal/:personalId/documentos', element: <DocumentosPersonal /> },

      // Control de Pausas
      { path: 'gestion/pacientes/:id/historial-pausas', element: <HistorialPausasView /> },
      { path: 'gestion/pausas/dashboard', element: <DashboardPausasView /> },

      // Módulo Terapéutico
      { path: 'terapeutico/*', element: <TerapeuticoMain /> },
      { path: 'terapeutico/sesion/:id', element: <SesionTerapeuticaDetalle /> },

      // Módulo Pedagógico
      { path: 'pedagogico/*', element: <PedagogicoMain /> },
      { path: 'pedagogico/sesion/:id', element: <SesionPedagogicaDetalle /> },

      // Reportes
      { path: 'reportes/sistema', element: <ReportesPage /> },

      // Configuración del sistema
      { path: 'configuracion', element: <ConfiguracionMain /> },
      { path: 'gestion/roles', element: <GestionRoles /> },
      { path: 'configuracion/general', element: <ConfiguracionGeneral /> },
      { path: 'configuracion/sistema', element: <ConfiguracionMain /> },


      // Centro
      { path: 'apps/user-profile/gallery', element: <Galeria /> },
      { path: 'pages/account-settings', element: <Configuracion /> },

      // Herramientas (en desarrollo)
      { path: 'forms/form-layouts', element: () => <ComingSoon title="Formularios - Layouts" module="Herramientas" progress={90} /> },
      { path: 'forms/form-validation', element: () => <ComingSoon title="Formularios - Validación" module="Herramientas" progress={85} /> },
      { path: 'tables/basic', element: () => <ComingSoon title="Tablas Básicas" module="Herramientas" progress={95} /> },
      { path: 'tables/pagination', element: () => <ComingSoon title="Tablas con Paginación" module="Herramientas" progress={90} /> },
      { path: 'tables/search', element: () => <ComingSoon title="Tablas con Búsqueda" module="Herramientas" progress={85} /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: ROUTES.AUTH.LOGIN, element: <Login /> },
      { path: '/auth/404', element: () => <ComingSoon title="Error 404" description="Esta página no existe" module="Error" progress={100} /> },
      { path: '*', element: <Navigate to={ROUTES.AUTH.LOGIN} /> },
    ],
  },
  {
    path: '/sesion-publica/:token',
    element: <BlankLayout />,
    children: [
      { path: '', element: <PublicSessionView /> },
    ],
  },
  {
    path: '/sesion-pedagogica-publica/:token',
    element: <BlankLayout />,
    children: [
      { path: '', element: <PublicPedagogicalSessionView /> },
    ],
  },
];

export default Router;