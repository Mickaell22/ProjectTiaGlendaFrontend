// src/contexts/AuthContext.jsx
// Context de autenticación para gestión global del estado

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
        let user = null;
        if (userStr) {
          try {
            user = JSON.parse(userStr);
          } catch (e) {
            // Silently handle parsing error
          }
        }
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, user }
        });
      } else {
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    }
  };

  const login = (token, user = null, fullLoginData = null) => {
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
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      localStorage.removeItem('login_data');
      localStorage.removeItem('full_login_data');
      
      dispatch({ type: 'LOGOUT' });
      
      // Redirigir al login
      navigate('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getToken = () => {
    return state.token || localStorage.getItem('jwt_token');
  };

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  const requireAuth = () => {
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
  };

  const value = {
    ...state,
    login,
    logout,
    getToken,
    getAuthHeaders,
    requireAuth,
    checkAuthStatus,
  };

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