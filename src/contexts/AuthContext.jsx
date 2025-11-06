// src/contexts/AuthContext.jsx
// Context de autenticación para gestión global del estado

import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/apiService';
import { API_ENDPOINTS } from '../config/api';
import logger from '../utils/logger';
import { validateToken, isTokenExpired } from '../utils/tokenValidator';

// Estados del reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      };
    case 'UPDATE_CENTRO':
      return {
        ...state,
        user: {
          ...state.user,
          id_centro: action.payload.centroId,
          centro_id: action.payload.centroId,
          centro: action.payload.centro,
        },
        token: action.payload.token || state.token,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Estado inicial
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
};

// Crear el contexto
const AuthContext = createContext();

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const userStr = localStorage.getItem('user');

      if (token) {
        // Validar token antes de continuar
        const validation = validateToken(token);

        if (!validation.valid) {
          logger.warn('Token inválido durante checkAuthStatus', { reason: validation.reason });
          // Limpiar localStorage
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user');
          localStorage.removeItem('login_data');
          localStorage.removeItem('full_login_data');
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
          return;
        }

        let user = null;
        if (userStr) {
          try {
            user = JSON.parse(userStr);
          } catch (e) {
            logger.warn('Error al parsear usuario de localStorage', e);
          }
        }

        // Verificar si el usuario tiene un centro seleccionado
        const tieneCentro = user?.id_centro || user?.centro_id || user?.centro?.id;

        // Solo marcar como autenticado si tiene token Y centro seleccionado
        if (tieneCentro) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token, user }
          });
        } else {
          // Tiene token pero no centro, no marcar como autenticado completamente
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        }
      } else {
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      }
    } catch (error) {
      logger.authError('Error checking auth status', error);
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    }
  };

  const login = useCallback((token, user = null, fullLoginData = null) => {
    try {
      localStorage.setItem('jwt_token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        // También guardar datos completos de login para acceso desde otros componentes
        localStorage.setItem('login_data', JSON.stringify({ user, token }));
      }
      
      // Si se proporciona datos completos de login, guardarlos también
      if (fullLoginData) {
        localStorage.setItem('full_login_data', JSON.stringify(fullLoginData));
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      });

      return true;
    } catch (error) {
      logger.authError('Error during login', error);
      return false;
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      localStorage.removeItem('login_data');
      localStorage.removeItem('full_login_data');
      
      dispatch({ type: 'LOGOUT' });
      
      // Redirigir al login
      navigate('/auth/login');
      logger.logoutEvent('manual');
    } catch (error) {
      logger.authError('Error during logout', error);
    }
  }, [navigate, dispatch]);

  const getToken = useCallback(() => {
    const token = state.token || localStorage.getItem('jwt_token');

    // Verificar si el token está expirado
    if (token && isTokenExpired(token)) {
      logger.warn('Token expirado detectado en getToken()');
      // Auto-logout si el token está expirado
      logout();
      return null;
    }

    return token;
  }, [state.token]);

  const getAuthHeaders = useCallback(() => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }, [getToken]);

  const requireAuth = useCallback(() => {
    const token = getToken();

    if (!token) {
      navigate('/auth/login');
      return false;
    }

    // Si no está marcado como autenticado pero tiene token, actualizar estado
    if (!state.isAuthenticated && token) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    }

    return true;
  }, [getToken, state.isAuthenticated, navigate, dispatch]);

  // Seleccionar centro después del login
  const seleccionarCentro = useCallback(async (idCentro) => {
    try {
      const response = await ApiService.post(API_ENDPOINTS.AUTH.SELECCIONAR_CENTRO, {
        id_centro: idCentro
      });

      const data = response?.data || response;

      if (data.status === 'success' && data.data?.token) {
        // Actualizar token y usuario con el centro seleccionado
        const newToken = data.data.token;

        // IMPORTANTE: Preservar el array de centros del estado actual
        const centrosPreservados = state.user?.centros || [];

        const updatedUser = {
          ...data.data.user,
          centro: data.data.centro_seleccionado,
          centro_id: data.data.user.id_centro,
          centros: centrosPreservados.length > 0 ? centrosPreservados : data.data.user.centros || []
        };

        // Guardar nuevo token y usuario actualizado
        localStorage.setItem('jwt_token', newToken);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        dispatch({
          type: 'UPDATE_CENTRO',
          payload: {
            centroId: updatedUser.id_centro,
            centro: data.data.centro_seleccionado,
            token: newToken
          }
        });

        return { success: true, data: data.data };
      }

      return { success: false, message: data.message || 'Error al seleccionar centro' };
    } catch (error) {
      logger.authError('Error al seleccionar centro', error, { centroId: idCentro });
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Error al seleccionar centro'
      };
    }
  }, [state.user, dispatch]);

  // Cambiar de centro sin hacer logout
  const cambiarCentro = useCallback(async (idCentro) => {
    try {
      const response = await ApiService.post(API_ENDPOINTS.AUTH.CAMBIAR_CENTRO, {
        id_centro: idCentro
      });

      const data = response?.data || response;

      if (data.status === 'success' && data.data?.token) {
        // Actualizar token y usuario
        const newToken = data.data.token;
        const updatedUser = data.data.user;

        // IMPORTANTE: Preservar el array de centros del usuario actual
        // El backend puede no devolverlo en el cambio de centro
        const centrosPreservados = state.user?.centros || [];
        const userConCentros = {
          ...updatedUser,
          centros: centrosPreservados.length > 0 ? centrosPreservados : updatedUser.centros || []
        };

        localStorage.setItem('jwt_token', newToken);
        localStorage.setItem('user', JSON.stringify(userConCentros));

        dispatch({
          type: 'UPDATE_CENTRO',
          payload: {
            centroId: updatedUser.id_centro,
            centro: updatedUser.centro,
            token: newToken
          }
        });

        // Recargar la página para actualizar todos los datos
        window.location.reload();

        return { success: true };
      }

      return { success: false, message: data.message || 'Error al cambiar de centro' };
    } catch (error) {
      logger.authError('Error al cambiar de centro', error, { centroId: idCentro });
      return {
        success: false,
        message: error?.response?.data?.message || error?.message || 'Error al cambiar de centro'
      };
    }
  }, [state.user, dispatch]);

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
    getToken,
    getAuthHeaders,
    requireAuth,
    checkAuthStatus,
    seleccionarCentro,
    cambiarCentro,
  }), [
    state,
    login,
    logout,
    getToken,
    getAuthHeaders,
    requireAuth,
    seleccionarCentro,
    cambiarCentro,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;