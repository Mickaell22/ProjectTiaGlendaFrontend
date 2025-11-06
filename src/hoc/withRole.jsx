// src/hoc/withRole.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AccessDenied from '../components/shared/AccessDenied';
import LoadingSpinner from '../components/shared/LoadingSpinner';

/**
 * Higher Order Component (HOC) genérico para proteger rutas por rol
 * Más flexible que withAdminRole, permite cualquier combinación de roles
 *
 * @param {React.Component} WrappedComponent - Componente a proteger
 * @param {Object} options - Opciones de configuración
 * @param {Array<string>} options.allowedRoles - Array de roles permitidos (requerido)
 * @param {string} options.redirectTo - Ruta a la que redirigir si no tiene acceso (opcional)
 * @param {boolean} options.showAccessDenied - Si debe mostrar el componente AccessDenied (por defecto: true)
 * @param {string} options.moduleName - Nombre del módulo para mensajes personalizados (opcional)
 *
 * @example
 * // Solo administradores
 * export default withRole(PersonalMain, { allowedRoles: ['administrador'] });
 *
 * @example
 * // Administrador y Terapeuta
 * export default withRole(TerapeuticoMain, {
 *   allowedRoles: ['administrador', 'terapeuta'],
 *   moduleName: 'Módulo Terapéutico'
 * });
 *
 * @example
 * // Redirigir en lugar de mostrar AccessDenied
 * export default withRole(ConfigMain, {
 *   allowedRoles: ['administrador'],
 *   redirectTo: '/dashboard',
 *   showAccessDenied: false
 * });
 */
const withRole = (WrappedComponent, options = {}) => {
  const {
    allowedRoles = [],
    redirectTo = null,
    showAccessDenied = true,
    moduleName = 'esta sección'
  } = options;

  // Validación de configuración
  if (!allowedRoles || allowedRoles.length === 0) {
    console.error('withRole: allowedRoles es requerido y no puede estar vacío');
    throw new Error('withRole requiere al menos un rol en allowedRoles');
  }

  return function ProtectedComponent(props) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
      checkAccess();
    }, [user, isAuthenticated, isLoading]);

    const checkAccess = () => {
      // Si todavía está cargando el estado de autenticación, esperar
      if (isLoading) {
        return;
      }

      // Si no está autenticado, redirigir al login
      if (!isAuthenticated) {
        navigate('/auth/login', { replace: true });
        return;
      }

      // Verificar si el usuario tiene alguno de los roles permitidos
      const userRole = getUserRole();
      const hasPermission = checkRolePermission(userRole);

      if (!hasPermission) {
        setHasAccess(false);

        // Si se especificó una ruta de redirección y no se debe mostrar AccessDenied
        if (redirectTo && !showAccessDenied) {
          navigate(redirectTo, { replace: true });
        }
      } else {
        setHasAccess(true);
      }

      setIsChecking(false);
    };

    /**
     * Obtiene el rol del usuario actual desde diferentes fuentes posibles
     * @returns {string|null} - Rol del usuario en minúsculas
     */
    const getUserRole = () => {
      if (!user) return null;

      // Intentar obtener el rol de diferentes propiedades
      let role = user.rol_nombre || user.rol?.nombre || user.rol;

      // Si el rol es un objeto, intentar extraer el nombre
      if (typeof role === 'object' && role !== null) {
        role = role.nombre || role.label || null;
      }

      // Convertir a minúsculas y limpiar espacios
      if (typeof role === 'string') {
        return role.trim().toLowerCase();
      }

      return null;
    };

    /**
     * Verifica si el rol del usuario está en la lista de roles permitidos
     * @param {string|null} userRole - Rol del usuario
     * @returns {boolean} - True si tiene permiso, false en caso contrario
     */
    const checkRolePermission = (userRole) => {
      if (!userRole) return false;

      // Convertir roles permitidos a minúsculas para comparación case-insensitive
      const normalizedAllowedRoles = allowedRoles.map(role =>
        role.trim().toLowerCase()
      );

      return normalizedAllowedRoles.includes(userRole);
    };

    /**
     * Genera el texto de roles requeridos para mostrar
     * @returns {string} - Texto formateado de roles
     */
    const getRequiredRolesText = () => {
      if (allowedRoles.length === 1) {
        return allowedRoles[0].charAt(0).toUpperCase() + allowedRoles[0].slice(1);
      }

      const formatted = allowedRoles.map(r =>
        r.charAt(0).toUpperCase() + r.slice(1)
      );

      if (formatted.length === 2) {
        return formatted.join(' o ');
      }

      const last = formatted.pop();
      return formatted.join(', ') + ' o ' + last;
    };

    // Mostrar spinner mientras se verifica el acceso
    if (isLoading || isChecking) {
      return <LoadingSpinner message="Verificando permisos..." fullHeight />;
    }

    // Si no tiene acceso y se debe mostrar AccessDenied
    if (!hasAccess && showAccessDenied) {
      return (
        <AccessDenied
          title="Acceso Denegado"
          message={`No tienes permisos suficientes para acceder a ${moduleName}.`}
          requiredRole={getRequiredRolesText()}
          showHomeButton={true}
          showBackButton={true}
        />
      );
    }

    // Si no tiene acceso y ya se redirigió, no renderizar nada
    if (!hasAccess) {
      return null;
    }

    // Si tiene acceso, renderizar el componente protegido
    return <WrappedComponent {...props} />;
  };
};

export default withRole;
