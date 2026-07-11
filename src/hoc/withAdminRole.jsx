// src/hoc/withAdminRole.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AccessDenied from '../components/shared/AccessDenied';
import LoadingSpinner from '../components/shared/LoadingSpinner';

/**
 * Higher Order Component (HOC) para proteger rutas que requieren rol de Administrador
 *
 * @param {React.Component} WrappedComponent - Componente a proteger
 * @param {Object} options - Opciones de configuración
 * @param {Array<string>} options.allowedRoles - Array de roles permitidos (por defecto ['administrador'])
 * @param {string} options.redirectTo - Ruta a la que redirigir si no tiene acceso (por defecto: muestra AccessDenied)
 * @param {boolean} options.showAccessDenied - Si debe mostrar el componente AccessDenied (por defecto: true)
 *
 * @example
 * // Uso básico - solo administradores
 * export default withAdminRole(UsuarioMain);
 *
 * @example
 * // Permitir múltiples roles
 * export default withAdminRole(ReportesMain, {
 *   allowedRoles: ['administrador', 'supervisor']
 * });
 *
 * @example
 * // Redirigir en lugar de mostrar AccessDenied
 * export default withAdminRole(ConfigMain, {
 *   redirectTo: '/dashboard',
 *   showAccessDenied: false
 * });
 */
const withAdminRole = (WrappedComponent, options = {}) => {
  const {
    allowedRoles = ['administrador'],
    redirectTo = null,
    showAccessDenied = true,
  } = options;

  return function ProtectedComponent(props) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
      checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
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

    // Mostrar spinner mientras se verifica el acceso
    if (isLoading || isChecking) {
      return <LoadingSpinner message="Verificando permisos..." fullHeight />;
    }

    // Si no tiene acceso y se debe mostrar AccessDenied
    if (!hasAccess && showAccessDenied) {
      const requiredRoles = allowedRoles.length === 1
        ? allowedRoles[0].charAt(0).toUpperCase() + allowedRoles[0].slice(1)
        : allowedRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' o ');

      return (
        <AccessDenied
          title="Acceso Denegado"
          message="No tienes permisos suficientes para acceder a esta sección."
          requiredRole={requiredRoles}
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

export default withAdminRole;
