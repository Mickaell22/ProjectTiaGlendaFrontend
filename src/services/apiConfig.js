// src/services/apiConfig.js
import axios from 'axios';

// Configuración base para las peticiones HTTP
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Crear instancia de Axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    // Buscar token en diferentes ubicaciones (según tu sistema de auth)
    const token = localStorage.getItem('jwt_token') || 
                 localStorage.getItem('authToken') || 
                 sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo de errores de autenticación (sin redirección automática)
    if (error.response?.status === 401) {
      // No redirigir automáticamente, dejar que los componentes manejen el error
    }
    
    // Manejo de errores de red
    if (error.code === 'NETWORK_ERROR') {
      console.error('Error de red - Servidor no disponible');
    }
    
    return Promise.reject(error);
  }
);

export { apiClient, API_BASE_URL };