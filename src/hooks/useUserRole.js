import { useState, useEffect } from 'react';

/**
 * Hook para obtener el rol del usuario actual y verificar permisos
 */
export const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = () => {
      try {
        // Intentar obtener desde user_data primero
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          const role = (user.rol_nombre || user.rol || '').toLowerCase();
          setUserRole(role);
          setLoading(false);
          return;
        }

        // Fallback a JWT token
        const token = localStorage.getItem('jwt_token');
        if (token && token.split('.').length === 3) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = (payload.rol || payload.rol_nombre || '').toLowerCase();
          setUserRole(role);
          setLoading(false);
          return;
        }

        // Si no hay datos, establecer como null
        setUserRole(null);
        setLoading(false);
      } catch (error) {
        console.error('Error getting user role:', error);
        setUserRole(null);
        setLoading(false);
      }
    };

    getUserRole();
  }, []);

  // Funciones de verificación de permisos
  const isAdmin = userRole === 'administrador';
  const isTherapist = userRole === 'terapeuta';
  const isPedagogue = userRole && userRole.includes('pedag');

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
      viewOwn: isTherapist || isPedagogue // Terapeutas y pedagogos solo ven sus pacientes/estudiantes asignados
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
      viewOwn: isTherapist || isPedagogue // Terapeutas y pedagogos solo ven tutores de sus pacientes/estudiantes
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

    // Funciones helper
    canAccess: (module) => permissions[module]?.view || false,
    canCreate: (module) => permissions[module]?.create || false,
    canEdit: (module) => permissions[module]?.edit || false,

    // Función para verificar si debe mostrar un elemento en el navbar
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
          return true; // Dashboard y otros módulos generales
      }
    }
  };
};