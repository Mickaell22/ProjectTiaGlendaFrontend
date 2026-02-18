import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para obtener el rol del usuario actual y verificar permisos.
 * Lee el usuario directamente desde AuthContext (siempre actualizado).
 */
export const useUserRole = () => {
  const { user, isLoading } = useAuth();

  // Extraer el rol canónico usando la misma lógica que DashboardMain y withRole
  const getUserRoleCanonical = () => {
    if (!user) return '';

    let rawRole = user.rol_nombre || user.rol?.nombre || user.rol;
    if (typeof rawRole === 'object' && rawRole !== null) {
      rawRole = rawRole.nombre || rawRole.label || '';
    }
    const roleLower = typeof rawRole === 'string' ? rawRole.trim().toLowerCase() : '';

    if (roleLower === 'administrador' || roleLower === 'admin') return 'administrador';

    // Verificar por especialidades primero
    if (user.especialidades && user.especialidades.length > 0) {
      const hasTherapeutic = user.especialidades.some(esp =>
        esp.area?.toLowerCase().includes('terap')
      );
      const hasPedagogical = user.especialidades.some(esp =>
        esp.area?.toLowerCase().includes('pedag')
      );
      if (hasTherapeutic) return 'terapeuta';
      if (hasPedagogical) return 'pedagogo';
    }

    if (roleLower.includes('terap')) return 'terapeuta';
    if (roleLower.includes('pedag')) return 'pedagogo';
    if (roleLower.includes('admin')) return 'administrador';

    return roleLower;
  };

  const userRole = getUserRoleCanonical();

  // Mientras AuthContext carga, no se conoce el rol
  const loading = isLoading;

  // Funciones de verificación de permisos
  const isAdmin = userRole === 'administrador';
  const isTherapist = userRole === 'terapeuta';
  const isPedagogue = userRole.includes('pedag');

  // Permisos específicos por módulo
  const permissions = {
    // Personas - Solo admins
    personas: {
      view: isAdmin,
      create: isAdmin,
      edit: isAdmin
    },

    // Pacientes - Admins, terapeutas y pedagogos
    pacientes: {
      view: isAdmin || isTherapist || isPedagogue,
      create: isAdmin,
      edit: isAdmin,
      viewOwn: isTherapist || isPedagogue
    },

    // Personal - Solo admins
    personal: {
      view: isAdmin,
      create: isAdmin,
      edit: isAdmin
    },

    // Usuarios - Solo admins
    usuarios: {
      view: isAdmin,
      create: isAdmin,
      edit: isAdmin
    },

    // Sesiones Terapéuticas - Admins y terapeutas
    sesionesTerapeuticas: {
      view: isAdmin || isTherapist,
      create: isAdmin,
      edit: isAdmin,
      viewCronograma: isAdmin || isTherapist,
      editCronograma: isAdmin,
      viewAsistencia: isAdmin || isTherapist,
      registerAsistencia: isAdmin || isTherapist
    },

    // Sesiones Pedagógicas - Admins y pedagogos
    sesionesPedagogicas: {
      view: isAdmin || isPedagogue,
      create: isAdmin,
      edit: isAdmin,
      viewCronograma: isAdmin || isPedagogue,
      editCronograma: isAdmin,
      viewAsistencia: isAdmin || isPedagogue,
      registerAsistencia: isAdmin || isPedagogue
    },

    // Tutores - Admins, terapeutas y pedagogos (solo ver)
    tutores: {
      view: isAdmin || isTherapist || isPedagogue,
      create: isAdmin,
      edit: isAdmin,
      viewOwn: isTherapist || isPedagogue
    },

    // Especialidades - Solo admins
    especialidades: {
      view: isAdmin,
      create: isAdmin,
      edit: isAdmin
    },

    // Configuración - Solo admins
    configuracion: {
      view: isAdmin,
      edit: isAdmin
    }
  };

  return {
    role: userRole,
    loading,
    isAdmin,
    isTherapist,
    isPedagogue,
    permissions,

    canAccess: (module) => permissions[module]?.view || false,
    canCreate: (module) => permissions[module]?.create || false,
    canEdit: (module) => permissions[module]?.edit || false,

    shouldShowInNavbar: (module) => {
      switch (module) {
        case 'personas':
        case 'personal':
        case 'usuarios':
        case 'especialidades':
        case 'configuracion':
          return isAdmin;
        case 'pacientes':
        case 'tutores':
          return isAdmin || isTherapist || isPedagogue;
        case 'sesionesTerapeuticas':
          return isAdmin || isTherapist;
        case 'sesionesPedagogicas':
          return isAdmin || isPedagogue;
        default:
          return true;
      }
    }
  };
};
