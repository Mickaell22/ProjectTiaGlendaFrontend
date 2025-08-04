// src/routes/Router.jsx - Versión completa con páginas en desarrollo
import { Navigate } from 'react-router-dom';
import { lazy } from 'react';

// Layouts
import FullLayout from 'src/layouts/full/FullLayout';
import BlankLayout from 'src/layouts/blank/BlankLayout';

// Páginas principales
import Login from 'src/views/authentication/auth1/Login';
import Register from 'src/views/authentication/auth1/Register';
import Dashboard from 'src/views/dashboard/Dashboard';
import Persona from 'src/views/personas/persona';
import Paciente from 'src/views/pacientes/paciente';
import Alumno from 'src/views/pacientes/alumno'; 
import Tutor from 'src/views/pacientes/tutores';
import Usuario from 'src/views/administracion/usuario';
import Especialidad from 'src/views/personal/especialidad';





// Componente para páginas en desarrollo
import ComingSoon from 'src/components/shared/ComingSoon';

// Páginas específicas en desarrollo
const TerapeuticoEvaluaciones = () => (
  <ComingSoon
    title="Evaluaciones Terapéuticas"
    description="Sistema para crear, gestionar y realizar seguimiento de evaluaciones terapéuticas"
    module="Terapéutico"
    progress={30}
  />
);

const TerapeuticoPlanes = () => (
  <ComingSoon
    title="Planes de Tratamiento"
    description="Herramienta para diseñar planes de tratamiento personalizados"
    module="Terapéutico"
    progress={25}
  />
);

const TerapeuticoSeguimiento = () => (
  <ComingSoon
    title="Seguimiento Terapéutico"
    description="Monitor del progreso de pacientes en tratamientos"
    module="Terapéutico"
    progress={20}
  />
);

const PedagogicoProgramas = () => (
  <ComingSoon
    title="Programas Educativos"
    description="Gestión de programas educativos y currículos especializados"
    module="Pedagógico"
    progress={35}
  />
);

const PedagogicoEvaluaciones = () => (
  <ComingSoon
    title="Evaluaciones Académicas"
    description="Sistema de evaluación del rendimiento académico"
    module="Pedagógico"
    progress={40}
  />
);

const PedagogicoProgreso = () => (
  <ComingSoon
    title="Progreso Académico"
    description="Seguimiento del avance académico de los alumnos"
    module="Pedagógico"
    progress={30}
  />
);

const HorariosCitas = () => (
  <ComingSoon
    title="Programar Citas"
    description="Sistema de agendamiento de citas y consultas"
    module="Horarios"
    progress={45}
  />
);

const HorariosSemanal = () => (
  <ComingSoon
    title="Calendario Semanal"
    description="Vista semanal con todas las actividades programadas"
    module="Horarios"
    progress={50}
  />
);

const HorariosDisponibilidad = () => (
  <ComingSoon
    title="Gestión de Disponibilidad"
    description="Configuración de horarios disponibles"
    module="Horarios"
    progress={35}
  />
);

const InformesGenerar = () => (
  <ComingSoon
    title="Generar Informes"
    description="Herramienta para crear reportes personalizados"
    module="Informes"
    progress={40}
  />
);

const InformesEstadisticas = () => (
  <ComingSoon
    title="Estadísticas"
    description="Dashboard con métricas y análisis del centro"
    module="Informes"
    progress={55}
  />
);

const InformesMensuales = () => (
  <ComingSoon
    title="Reportes Mensuales"
    description="Generación automática de reportes consolidados"
    module="Informes"
    progress={25}
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
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: '/dashboard', element: <Dashboard /> },
      
      // Gestión de Personas
      { path: '/apps/contacts', element: <PacientesAlumnos /> },
      { path: '/apps/user-profile/followers', element: <PersonalLista /> },
      { path: '/apps/user-profile/friends', element: <PersonalEquipos /> },
      { path: '/gestion/persona', element: <Persona /> },
      { path: '/gestion/paciente', element: <Paciente /> },
      { path: '/gestion/alumno', element: <Alumno /> },
      { path: '/gestion/tutor', element: <Tutor /> },
      { path: '/gestion/usuario', element: <Usuario /> },
      { path: '/gestion/especialidad', element: <Especialidad /> },



      // Módulo Terapéutico
      { path: '/terapeutico/evaluaciones', element: <TerapeuticoEvaluaciones /> },
      { path: '/terapeutico/planes', element: <TerapeuticoPlanes /> },
      { path: '/terapeutico/seguimiento', element: <TerapeuticoSeguimiento /> },
      
      // Módulo Pedagógico
      { path: '/pedagogico/programas', element: <PedagogicoProgramas /> },
      { path: '/pedagogico/evaluaciones', element: <PedagogicoEvaluaciones /> },
      { path: '/pedagogico/progreso', element: <PedagogicoProgreso /> },
      
      // Horarios
      { path: '/horarios/citas', element: <HorariosCitas /> },
      { path: '/horarios/semanal', element: <HorariosSemanal /> },
      { path: '/horarios/disponibilidad', element: <HorariosDisponibilidad /> },
      
      // Informes
      { path: '/informes/generar', element: <InformesGenerar /> },
      { path: '/informes/estadisticas', element: <InformesEstadisticas /> },
      { path: '/informes/mensuales', element: <InformesMensuales /> },
      
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