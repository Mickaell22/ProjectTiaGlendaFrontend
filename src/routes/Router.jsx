// src/routes/Router.jsx - Versión completa con páginas en desarrollo
import { Navigate } from 'react-router-dom';

// Layouts
import FullLayout from 'src/layouts/full/FullLayout';
import BlankLayout from 'src/layouts/blank/BlankLayout';

// Páginas principales
import Login from 'src/views/authentication/auth1/Login';
import Register from 'src/views/authentication/auth1/Register';
import Dashboard from 'src/views/dashboard/Dashboard';
import PersonaMain from 'src/views/persona/PersonaMain';
import PacienteMain from 'src/views/paciente/PacienteMain';
 
import TutorMain from 'src/views/tutor/TutorMain';
import UsuarioMain from 'src/views/usuario/UsuarioMain';
import EspecialidadMain from 'src/views/especialidad/EspecialidadMain';
import PersonalMain from 'src/views/personal/PersonalMain';
import TerapeuticoMain from 'src/views/terapeutico/TerapeuticoMain';
import SesionesPedagogicas from 'src/views/pedagogico/SesionesPedagogicas';
import DocumentosPaciente from 'src/components/Pacientes/DocumentosPaciente';
import ConfiguracionMain from 'src/views/configuracion/ConfiguracionMain';





// Componente para páginas en desarrollo
import ComingSoon from 'src/components/shared/ComingSoon';
import ProtectedRoute from 'src/components/shared/ProtectedRoute';

// Páginas específicas del área pedagógica

const PedagogicoCronogramas = () => (
  <ComingSoon
    title="Cronograma de Clases"
    description="Programación y gestión de cronogramas de clases pedagógicas"
    module="Pedagógico"
    progress={35}
  />
);

const PedagogicoAsistencia = () => (
  <ComingSoon
    title="Asistencia Estudiantil"
    description="Control de asistencia y tardanzas de estudiantes"
    module="Pedagógico"
    progress={40}
  />
);

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

// Consultas especializadas
const ConsultasPacientesDisponibles = () => (
  <ComingSoon
    title="Pacientes Disponibles"
    description="Lista de pacientes disponibles para asignar a sesiones"
    module="Consultas"
    progress={50}
  />
);

const ConsultasTerapeutasDisponibles = () => (
  <ComingSoon
    title="Terapeutas Disponibles"
    description="Personal terapéutico disponible para asignación"
    module="Consultas"
    progress={45}
  />
);

const ConsultasSesionesTerapeuta = () => (
  <ComingSoon
    title="Sesiones por Terapeuta"
    description="Vista de sesiones agrupadas por terapeuta"
    module="Consultas"
    progress={40}
  />
);

const ConsultasHistorialAsistencia = () => (
  <ComingSoon
    title="Historial de Asistencia"
    description="Consulta histórica de asistencia de pacientes"
    module="Consultas"
    progress={35}
  />
);

// Reportes y estadísticas
const ReportesDashboard = () => (
  <ComingSoon
    title="Dashboard Ejecutivo"
    description="Panel principal con métricas clave del centro"
    module="Reportes"
    progress={60}
  />
);

const ReportesEstadisticas = () => (
  <ComingSoon
    title="Estadísticas Generales"
    description="Dashboard con métricas y análisis del centro"
    module="Reportes"
    progress={55}
  />
);

const ReportesPDF = () => (
  <ComingSoon
    title="Informes PDF"
    description="Generación de informes en formato PDF"
    module="Reportes"
    progress={45}
  />
);

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
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: '/dashboard', element: <Dashboard /> },
      
      // Gestión de Personas
      { path: '/apps/contacts', element: <PacientesAlumnos /> },
      { path: '/apps/user-profile/followers', element: <PersonalLista /> },
      { path: '/apps/user-profile/friends', element: <PersonalEquipos /> },
      { path: '/gestion/persona', element: <PersonaMain /> },
      { path: '/gestion/paciente', element: <PacienteMain /> },
      { path: '/gestion/tutor', element: <TutorMain /> },
      { path: '/gestion/usuario', element: <UsuarioMain /> },
      { path: '/gestion/especialidad', element: <EspecialidadMain /> },
      { path: '/gestion/personal', element: <PersonalMain /> },
      { path: '/pacientes/:pacienteId/documentos', element: <DocumentosPaciente /> },



      // Módulo Terapéutico
      { path: '/terapeutico/*', element: <TerapeuticoMain /> },
      
      // Módulo Pedagógico
      { path: '/pedagogico/sesiones', element: <SesionesPedagogicas /> },
      { path: '/pedagogico/cronogramas', element: <PedagogicoCronogramas /> },
      { path: '/pedagogico/asistencia', element: <PedagogicoAsistencia /> },
      { path: '/pedagogico/evaluaciones', element: <PedagogicoEvaluaciones /> },
      { path: '/pedagogico/estadisticas', element: <PedagogicoEstadisticas /> },
      
      // Consultas especializadas
      { path: '/consultas/pacientes-disponibles', element: <ConsultasPacientesDisponibles /> },
      { path: '/consultas/terapeutas-disponibles', element: <ConsultasTerapeutasDisponibles /> },
      { path: '/consultas/sesiones-terapeuta', element: <ConsultasSesionesTerapeuta /> },
      { path: '/consultas/historial-asistencia', element: <ConsultasHistorialAsistencia /> },
      
      // Reportes
      { path: '/reportes/dashboard', element: <ReportesDashboard /> },
      { path: '/reportes/estadisticas', element: <ReportesEstadisticas /> },
      { path: '/reportes/pdf', element: <ReportesPDF /> },
      
      // Configuración del sistema
      { path: '/gestion/roles', element: <GestionRoles /> },
      { path: '/configuracion/general', element: <ConfiguracionGeneral /> },
      { path: '/configuracion/sistema', element: <ConfiguracionMain /> },
      
      // Centro
      { path: '/apps/user-profile/gallery', element: <Galeria /> },
      { path: '/pages/account-settings', element: <Configuracion /> },
      
      // Herramientas (en desarrollo)
      { path: '/forms/form-layouts', element: () => <ComingSoon title="Formularios - Layouts" module="Herramientas" progress={90} /> },
      { path: '/forms/form-validation', element: () => <ComingSoon title="Formularios - Validación" module="Herramientas" progress={85} /> },
      { path: '/tables/basic', element: () => <ComingSoon title="Tablas Básicas" module="Herramientas" progress={95} /> },
      { path: '/tables/pagination', element: () => <ComingSoon title="Tablas con Paginación" module="Herramientas" progress={90} /> },
      { path: '/tables/search', element: () => <ComingSoon title="Tablas con Búsqueda" module="Herramientas" progress={85} /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/404', element: () => <ComingSoon title="Error 404" description="Esta página no existe" module="Error" progress={100} /> },
      { path: '*', element: <Navigate to="/auth/login" /> },
    ],
  },
];

export default Router;