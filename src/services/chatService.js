// src/services/chatService.js
import { apiClient } from './apiConfig';

class ChatService {
  constructor() {
    this.baseURL = '/api/chat';
  }

  /**
   * Obtener lista de conversaciones del usuario actual
   */
  async getConversaciones() {
    try {
      const response = await apiClient.get(`${this.baseURL}/conversaciones`);
      
      // El backend devuelve los datos en response.data.data
      const conversaciones = response.data?.data || [];
      
      return {
        success: true,
        data: response.data,
        conversaciones: conversaciones,
      };
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener conversaciones',
        conversaciones: [],
      };
    }
  }

  /**
   * Obtener mensajes de una conversación específica
   * @param {number} idContacto - ID del contacto
   * @param {number} limite - Límite de mensajes a obtener (default: 50)
   */
  async getMensajes(idContacto, limite = 50) {
    try {
      const response = await apiClient.get(
        `${this.baseURL}/mensajes/${idContacto}?limite=${limite}`
      );
      
      // El backend devuelve los datos en response.data.data
      const mensajes = response.data?.data || [];
      
      return {
        success: true,
        data: response.data,
        mensajes: mensajes,
      };
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener mensajes',
        mensajes: [],
      };
    }
  }

  /**
   * Enviar un nuevo mensaje
   * @param {Object} messageData - Datos del mensaje
   * @param {number} messageData.id_destinatario - ID del destinatario
   * @param {string} messageData.mensaje - Contenido del mensaje
   * @param {string} messageData.tipo_mensaje - Tipo de mensaje (default: 'texto')
   * @param {string} messageData.prioridad - Prioridad del mensaje (default: 'normal')
   */
  async enviarMensaje(messageData) {
    try {
      const payload = {
        id_destinatario: messageData.id_destinatario,
        mensaje: messageData.mensaje,
        tipo_mensaje: messageData.tipo_mensaje || 'texto',
        prioridad: messageData.prioridad || 'normal',
      };

      const response = await apiClient.post(`${this.baseURL}/enviar`, payload);
      
      return {
        success: true,
        data: response.data,
        id_mensaje: response.data?.data?.id_mensaje || response.data?.id_mensaje,
        fecha_envio: response.data?.data?.fecha_envio || response.data?.fecha_envio,
      };
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      console.error('📋 Detalles del error:', error.response);
      console.error('🔍 Status:', error.response?.status);
      console.error('💬 Mensaje:', error.response?.data?.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al enviar mensaje',
      };
    }
  }

  /**
   * Marcar un mensaje como leído
   * @param {number} idMensaje - ID del mensaje
   */
  async marcarComoLeido(idMensaje) {
    try {
      const response = await apiClient.put(`${this.baseURL}/marcar-leido/${idMensaje}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error marcando mensaje como leído:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al marcar mensaje como leído',
      };
    }
  }

  /**
   * Obtener usuarios disponibles para chat
   */
  async getUsuariosDisponibles() {
    try {
      const response = await apiClient.get(`${this.baseURL}/usuarios-disponibles`);
      
      // El backend devuelve los datos en response.data.data
      const usuarios = response.data?.data || [];
      
      return {
        success: true,
        data: response.data,
        usuarios: usuarios,
      };
    } catch (error) {
      console.error('Error obteniendo usuarios disponibles:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener usuarios disponibles',
        usuarios: [],
      };
    }
  }

  /**
   * Buscar mensajes por contenido
   * @param {string} query - Texto a buscar
   * @param {number} contacto - ID del contacto (opcional)
   */
  async buscarMensajes(query, contacto = null) {
    try {
      let url = `${this.baseURL}/buscar?q=${encodeURIComponent(query)}`;
      if (contacto) {
        url += `&contacto=${contacto}`;
      }

      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data,
        mensajes: response.data.mensajes || [],
      };
    } catch (error) {
      console.error('Error buscando mensajes:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al buscar mensajes',
        mensajes: [],
      };
    }
  }

  /**
   * Obtener conteo de mensajes no leídos
   */
  async getUnreadMessagesCount() {
    try {
      const response = await apiClient.get(`${this.baseURL}/mensajes-no-leidos/count`);
      return {
        success: true,
        count: response.data?.count || 0,
        data: response.data,
      };
    } catch (error) {
      console.error('Error obteniendo conteo de mensajes no leídos:', error);
      return {
        success: false,
        count: 0,
        error: error.response?.data?.message || 'Error al obtener conteo de mensajes',
      };
    }
  }

  /**
   * Eliminar un mensaje individual (soft delete para el usuario actual)
   * @param {number} idMensaje - ID del mensaje a eliminar
   */
  async eliminarMensaje(idMensaje) {
    try {
      const response = await apiClient.delete(`${this.baseURL}/mensaje/${idMensaje}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error eliminando mensaje:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar mensaje',
      };
    }
  }

  /**
   * Eliminar toda la conversacion con un contacto (soft delete)
   * @param {number} idContacto - ID del contacto cuya conversacion se elimina
   */
  async eliminarConversacion(idContacto) {
    try {
      const response = await apiClient.delete(`${this.baseURL}/conversacion/${idContacto}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error eliminando conversacion:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar conversacion',
      };
    }
  }

  /**
   * Obtener estadísticas de chat del usuario
   */
  async getEstadisticas() {
    try {
      const response = await apiClient.get(`${this.baseURL}/estadisticas`);
      return {
        success: true,
        data: response.data,
        estadisticas: response.data.estadisticas || {},
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de chat:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas',
        estadisticas: {},
      };
    }
  }
}

// Exportar instancia singleton
export default new ChatService();