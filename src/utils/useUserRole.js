import { useState, useEffect } from 'react';

/**
 * Hook personalizado para obtener y gestionar el rol del usuario actual
 * Funciona con el sistema de autenticación existente
 */
const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setUserData(user);

          const role = determineUserRole(user);
          setUserRole(role);
        } else {
          setUserRole(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        setUserRole(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Escuchar cambios en localStorage (por si el usuario cambia de sesión)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const determineUserRole = (user) => {
    if (!user) return null;

    // Verificar si es administrador
    if (user.rol === 'Administrador' || user.rol?.toLowerCase() === 'administrador') {
      return 'admin';
    }

    // Verificar por especialidades si las tiene
    if (user.especialidades && user.especialidades.length > 0) {
      const tieneEspecialidadTerapeutica = user.especialidades.some(esp =>
        esp.area === 'Especialidad terapeutica' ||
        esp.area?.toLowerCase().includes('terap')
      );
      const tieneEspecialidadPedagogica = user.especialidades.some(esp =>
        esp.area === 'Especialidad pedagogica' ||
        esp.area?.toLowerCase().includes('pedag')
      );

      if (tieneEspecialidadTerapeutica) return 'terapeuta';
      if (tieneEspecialidadPedagogica) return 'pedagogo';
    }

    // Verificar por rol directamente (fallback para usuarios sin especialidades)
    const rolLowerCase = user.rol?.toLowerCase() || '';

    if (rolLowerCase.includes('terap')) return 'terapeuta';
    if (rolLowerCase.includes('pedag') || rolLowerCase.includes('pedagog')) return 'pedagogo';

    // Si no se puede determinar el rol específico
    return 'general';
  };

  const refetchUserRole = () => {
    setLoading(true);
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const user = JSON.parse(userDataString);
        setUserData(user);
        const role = determineUserRole(user);
        setUserRole(role);
      } catch (error) {
        console.error('Error refetching user role:', error);
        setUserRole(null);
        setUserData(null);
      }
    }
    setLoading(false);
  };

  return {
    // Estado del rol
    role: userRole,
    userData,
    loading,

    // Helpers booleanos para verificación rápida
    isAdmin: userRole === 'admin',
    isTherapist: userRole === 'terapeuta',
    isPedagogue: userRole === 'pedagogo',
    isGeneral: userRole === 'general',

    // Funciones útiles
    refetchUserRole,
    hasSpecificRole: userRole && userRole !== 'general',

    // Información adicional
    centerName: userData?.centro_nombre || null,
    userName: userData?.nombre || userData?.email || null,
    userRole: userData?.rol || null,
    specialties: userData?.especialidades || []
  };
};

export default useUserRole;