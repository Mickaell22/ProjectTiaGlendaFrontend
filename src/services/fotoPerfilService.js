// src/services/fotoPerfilService.js
import { API_CONFIG, API_ENDPOINTS } from '../config/api.js';

/**
 * Servicio para gestionar fotos de perfil
 */
class FotoPerfilService {
  /**
   * Obtener token de autorización
   */
  static getAuthHeaders() {
    const token = localStorage.getItem('jwt_token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Subir foto de perfil del usuario actual
   * @param {File} archivo - Archivo de imagen a subir
   * @returns {Promise<Object>} Respuesta de la API
   */
  static async subirMiFoto(archivo) {
    try {
      const formData = new FormData();
      formData.append('foto', archivo);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FOTOS_PERFIL.MI_FOTO}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error subiendo foto de perfil');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Foto subida exitosamente'
      };
    } catch (error) {
      console.error('Error en subirMiFoto:', error);
      return {
        success: false,
        message: error.message || 'Error subiendo foto de perfil'
      };
    }
  }

  /**
   * Obtener información de mi foto de perfil
   * @returns {Promise<Object>} Información de la foto
   */
  static async obtenerMiFoto() {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.FOTOS_PERFIL.MI_FOTO}`;

      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo foto de perfil');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Foto obtenida exitosamente'
      };
    } catch (error) {
      console.error('💥 Error en obtenerMiFoto:', error);
      return {
        success: false,
        message: error.message || 'Error obteniendo foto de perfil'
      };
    }
  }

  /**
   * Eliminar mi foto de perfil
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  static async eliminarMiFoto() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FOTOS_PERFIL.MI_FOTO}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error eliminando foto de perfil');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Foto eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error en eliminarMiFoto:', error);
      return {
        success: false,
        message: error.message || 'Error eliminando foto de perfil'
      };
    }
  }

  /**
   * Obtener foto de perfil de otro usuario (admin)
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object>} Información de la foto
   */
  static async obtenerFotoUsuario(usuarioId) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FOTOS_PERFIL.USUARIO_FOTO(usuarioId)}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo foto del usuario');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Foto obtenida exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerFotoUsuario:', error);
      return {
        success: false,
        message: error.message || 'Error obteniendo foto del usuario'
      };
    }
  }

  /**
   * Subir foto de perfil para otro usuario (admin)
   * @param {number} usuarioId - ID del usuario
   * @param {File} archivo - Archivo de imagen a subir
   * @returns {Promise<Object>} Respuesta de la API
   */
  static async subirFotoUsuario(usuarioId, archivo) {
    try {
      const formData = new FormData();
      formData.append('foto', archivo);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FOTOS_PERFIL.USUARIO_FOTO(usuarioId)}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error subiendo foto del usuario');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Foto subida exitosamente'
      };
    } catch (error) {
      console.error('Error en subirFotoUsuario:', error);
      return {
        success: false,
        message: error.message || 'Error subiendo foto del usuario'
      };
    }
  }

  /**
   * Eliminar foto de perfil de otro usuario (admin)
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object>} Respuesta de la eliminación
   */
  static async eliminarFotoUsuario(usuarioId) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FOTOS_PERFIL.USUARIO_FOTO(usuarioId)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error eliminando foto del usuario');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Foto eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error en eliminarFotoUsuario:', error);
      return {
        success: false,
        message: error.message || 'Error eliminando foto del usuario'
      };
    }
  }

  /**
   * Obtener estadísticas de fotos de perfil (admin)
   * @returns {Promise<Object>} Estadísticas de uso
   */
  static async obtenerEstadisticas() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FOTOS_PERFIL.ESTADISTICAS}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo estadísticas');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Estadísticas obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      return {
        success: false,
        message: error.message || 'Error obteniendo estadísticas'
      };
    }
  }

  /**
   * Obtener formatos soportados
   * @returns {Promise<Object>} Información de formatos
   */
  static async obtenerFormatos() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.FOTOS_PERFIL.FORMATOS}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo formatos');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Formatos obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error en obtenerFormatos:', error);
      return {
        success: false,
        message: error.message || 'Error obteniendo formatos'
      };
    }
  }

  /**
   * Generar URL de foto de perfil
   * @param {string} rutaFoto - Ruta relativa de la foto
   * @returns {string} URL completa de la foto
   */
  static generarUrlFoto(rutaFoto) {
    if (!rutaFoto) {
      return null;
    }
    
    // Normalizar ruta para URL (reemplazar backslashes con forward slashes)
    const rutaNormalizada = rutaFoto.replace(/\\/g, '/');
    const fullUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.FOTOS_PERFIL.ARCHIVO_FOTO(rutaNormalizada)}`;

    return fullUrl;
  }

  /**
   * Validar archivo de imagen antes del upload
   * @param {File} archivo - Archivo a validar
   * @returns {Object} Resultado de validación
   */
  static validarArchivo(archivo) {
    if (!archivo) {
      return {
        valido: false,
        mensaje: 'No se proporcionó archivo'
      };
    }

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(archivo.type.toLowerCase())) {
      return {
        valido: false,
        mensaje: 'Solo se permiten archivos JPG, PNG, GIF y WebP'
      };
    }

    // Validar tamaño (5MB máximo)
    const tamañoMaximo = 5 * 1024 * 1024; // 5MB
    if (archivo.size > tamañoMaximo) {
      return {
        valido: false,
        mensaje: 'El archivo no debe exceder 5MB'
      };
    }

    return {
      valido: true,
      mensaje: 'Archivo válido'
    };
  }

  /**
   * Crear preview de imagen
   * @param {File} archivo - Archivo de imagen
   * @returns {Promise<string>} URL del preview
   */
  static crearPreview(archivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
    });
  }
}

export default FotoPerfilService;