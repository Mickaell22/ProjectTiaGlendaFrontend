// src/services/apiService.js
// Servicio centralizado para todas las llamadas a la API

import axios from 'axios';
import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '../config/api.js';

// Instancia de Axios configurada
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo centralizado de errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejo centralizado de errores
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // Token expirado o inválido
      localStorage.removeItem('jwt_token');
      window.location.href = '/auth/login';
      return Promise.reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error(ERROR_MESSAGES.TIMEOUT));
    }

    if (!error.response) {
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
    }

    // Mapear códigos de estado a mensajes amigables
    const statusMessages = {
      [HTTP_STATUS.BAD_REQUEST]: error.response.data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
      [HTTP_STATUS.FORBIDDEN]: ERROR_MESSAGES.FORBIDDEN,
      [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: ERROR_MESSAGES.SERVER_ERROR,
    };

    const message = statusMessages[error.response.status] || 
                   error.response.data?.message || 
                   ERROR_MESSAGES.SERVER_ERROR;

    // Preserve original error for debugging
    const customError = new Error(message);
    customError.response = error.response;
    customError.originalError = error;
    return Promise.reject(customError);
  }
);

// Función helper para hacer requests con retry logic
const requestWithRetry = async (requestFn, retries = API_CONFIG.RETRY_ATTEMPTS) => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && error.message === ERROR_MESSAGES.NETWORK_ERROR) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return requestWithRetry(requestFn, retries - 1);
    }
    throw error;
  }
};

// Servicio API principal
export class ApiService {
  // GET request
  static async get(url, config = {}) {
    return requestWithRetry(() => apiClient.get(url, config));
  }

  // POST request
  static async post(url, data = {}, config = {}) {
    return requestWithRetry(() => apiClient.post(url, data, config));
  }

  // PUT request
  static async put(url, data = {}, config = {}) {
    return requestWithRetry(() => apiClient.put(url, data, config));
  }

  // DELETE request
  static async delete(url, config = {}) {
    return requestWithRetry(() => apiClient.delete(url, config));
  }

  // PATCH request
  static async patch(url, data = {}, config = {}) {
    return requestWithRetry(() => apiClient.patch(url, data, config));
  }

  // Upload file
  static async uploadFile(url, file, onUploadProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onUploadProgress) {
      config.onUploadProgress = onUploadProgress;
    }

    return requestWithRetry(() => apiClient.post(url, formData, config));
  }

  // Download file
  static async downloadFile(url, filename) {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    // Crear link para descargar
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return response;
  }
}

// Función helper para extraer datos de la respuesta
export const extractData = (response) => {
  return response.data?.data || response.data;
};

// Función helper para manejar errores de forma consistente
export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  const message = customMessage || error.message || ERROR_MESSAGES.SERVER_ERROR;
  
  // Aquí se puede integrar con un sistema de notificaciones global
  // Por ejemplo: toast.error(message);
  
  return {
    success: false,
    message,
    error: error.response?.data || error.message,
  };
};

// Exportar la instancia de axios configurada para casos especiales
export { apiClient };

export default ApiService;