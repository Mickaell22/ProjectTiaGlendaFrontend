// src/hooks/useAuth.js
// Hook customizado para manejar autenticación

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('jwt_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  const login = (token) => {
    localStorage.setItem('jwt_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setIsAuthenticated(false);
    navigate('/auth/login');
  };

  const getToken = () => {
    return localStorage.getItem('jwt_token');
  };

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
    getAuthHeaders,
    requireAuth,
    checkAuthStatus
  };
};

export default useAuth;