// src/utils/testFrontend.js
// Utilidades para probar el frontend

/**
 * Test de conectividad con el backend
 */
export const testBackendConnection = async () => {
  try {
    const response = await fetch('/api/test');
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      message: response.ok ? 'Conexión exitosa' : 'Error de conexión'
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      data: null,
      message: 'Error de red: Backend no disponible'
    };
  }
};

/**
 * Test de autenticación
 */
export const testAuthentication = async () => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('jwt_token');
    
    if (!token) {
      return {
        success: false,
        message: 'No hay token de autenticación'
      };
    }

    const response = await fetch('/api/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Autenticación válida' : 'Token inválido'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error verificando autenticación'
    };
  }
};

/**
 * Test de servicios de chat
 */
export const testChatServices = async () => {
  try {
    // Importar dinámicamente para evitar errores en build
    const chatService = await import('../services/chatService');
    
    // Test obtener conversaciones
    const conversationsResult = await chatService.default.getConversaciones();
    
    // Test obtener usuarios disponibles
    const usersResult = await chatService.default.getUsuariosDisponibles();
    
    return {
      success: conversationsResult.success && usersResult.success,
      conversaciones: conversationsResult.success,
      usuarios: usersResult.success,
      message: (conversationsResult.success && usersResult.success) 
        ? 'Servicios de chat funcionando'
        : 'Error en servicios de chat'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error cargando servicios de chat'
    };
  }
};

/**
 * Test de servicios de notificaciones
 */
export const testNotificationServices = async () => {
  try {
    // Importar dinámicamente para evitar errores en build
    const notificationService = await import('../services/notificationService');
    
    // Test obtener notificaciones
    const notificationsResult = await notificationService.default.getNotificaciones();
    
    // Test obtener estadísticas
    const statsResult = await notificationService.default.getEstadisticas();
    
    return {
      success: notificationsResult.success && statsResult.success,
      notificaciones: notificationsResult.success,
      estadisticas: statsResult.success,
      message: (notificationsResult.success && statsResult.success)
        ? 'Servicios de notificaciones funcionando'
        : 'Error en servicios de notificaciones'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error cargando servicios de notificaciones'
    };
  }
};

/**
 * Test completo del sistema
 */
export const runCompleteTest = async () => {
  console.log('🚀 Iniciando pruebas completas del sistema...');
  
  const results = {
    backend: await testBackendConnection(),
    auth: await testAuthentication(),
    chat: await testChatServices(),
    notifications: await testNotificationServices(),
  };

  // Mostrar resultados en consola
  console.log('📊 Resultados de las pruebas:');
  console.log('Backend:', results.backend.success ? '✅' : '❌', results.backend.message);
  console.log('Autenticación:', results.auth.success ? '✅' : '❌', results.auth.message);
  console.log('Chat:', results.chat.success ? '✅' : '❌', results.chat.message);
  console.log('Notificaciones:', results.notifications.success ? '✅' : '❌', results.notifications.message);

  const overallSuccess = Object.values(results).every(result => result.success);
  console.log('🏁 Resultado general:', overallSuccess ? '✅ Todos los sistemas funcionando' : '❌ Algunos sistemas fallan');

  return {
    success: overallSuccess,
    results: results,
    summary: {
      total: 4,
      passed: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length
    }
  };
};

/**
 * Mostrar información del entorno
 */
export const showEnvironmentInfo = () => {
  console.log('🔧 Información del entorno:');
  console.log('API URL:', import.meta.env.VITE_API_URL || 'No configurada');
  console.log('Chat habilitado:', import.meta.env.VITE_CHAT_ENABLED || 'true');
  console.log('Notificaciones habilitadas:', import.meta.env.VITE_NOTIFICATIONS_ENABLED || 'true');
  console.log('Modo debug:', import.meta.env.VITE_DEBUG_MODE || 'false');
};

// Hacer disponibles las funciones en el objeto window para debug
if (typeof window !== 'undefined') {
  window.frontendTests = {
    testBackendConnection,
    testAuthentication,
    testChatServices,
    testNotificationServices,
    runCompleteTest,
    showEnvironmentInfo,
  };
}

export default {
  testBackendConnection,
  testAuthentication,
  testChatServices,
  testNotificationServices,
  runCompleteTest,
  showEnvironmentInfo,
};