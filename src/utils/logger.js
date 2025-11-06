// src/utils/logger.js
// Sistema de logging centralizado para la aplicación

/**
 * Niveles de log
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

/**
 * Configuración del logger
 */
const config = {
  // En desarrollo, mostrar todos los logs
  // En producción, solo errores (o enviar a servicio externo)
  enabled: import.meta.env.MODE === 'development',
  minLevel: import.meta.env.MODE === 'development' ? LogLevel.DEBUG : LogLevel.ERROR,

  // Opcional: URL de servicio de logging externo (ej: Sentry, LogRocket)
  remoteLoggingUrl: import.meta.env.VITE_LOGGING_URL || null,
};

/**
 * Formatear mensaje de log
 */
const formatMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 ? JSON.stringify(context) : '';

  return {
    timestamp,
    level,
    message,
    context,
    formatted: `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`,
  };
};

/**
 * Enviar log a servicio remoto (opcional)
 */
const sendToRemote = async (logData) => {
  if (!config.remoteLoggingUrl) return;

  try {
    await fetch(config.remoteLoggingUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
  } catch (error) {
    // Si falla el envío remoto, no hacer nada para evitar loops
  }
};

/**
 * Determinar si un nivel de log debe mostrarse
 */
const shouldLog = (level) => {
  if (!config.enabled) return false;

  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
  const minIndex = levels.indexOf(config.minLevel);
  const currentIndex = levels.indexOf(level);

  return currentIndex >= minIndex;
};

/**
 * Logger principal
 */
class Logger {
  /**
   * Log de debug (desarrollo)
   */
  debug(message, context = {}) {
    if (!shouldLog(LogLevel.DEBUG)) return;

    const logData = formatMessage(LogLevel.DEBUG, message, context);
    console.debug(logData.formatted, context);
  }

  /**
   * Log informativo
   */
  info(message, context = {}) {
    if (!shouldLog(LogLevel.INFO)) return;

    const logData = formatMessage(LogLevel.INFO, message, context);
    console.info(logData.formatted, context);
  }

  /**
   * Log de advertencia
   */
  warn(message, context = {}) {
    if (!shouldLog(LogLevel.WARN)) return;

    const logData = formatMessage(LogLevel.WARN, message, context);
    console.warn(logData.formatted, context);

    // En producción, enviar warnings a servicio remoto
    if (import.meta.env.MODE === 'production') {
      sendToRemote(logData);
    }
  }

  /**
   * Log de error
   */
  error(message, error = null, context = {}) {
    if (!shouldLog(LogLevel.ERROR)) return;

    // Extraer información del error si existe
    const errorInfo = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
    } : context;

    const logData = formatMessage(LogLevel.ERROR, message, errorInfo);

    // En desarrollo, mostrar en consola con stack trace
    if (import.meta.env.MODE === 'development') {
      console.error(logData.formatted);
      if (error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
      if (Object.keys(context).length > 0) {
        console.error('Context:', context);
      }
    }

    // En producción, enviar a servicio remoto
    if (import.meta.env.MODE === 'production') {
      sendToRemote(logData);
    }
  }

  /**
   * Log de error de autenticación
   */
  authError(message, error = null, context = {}) {
    this.error(`[AUTH] ${message}`, error, {
      ...context,
      module: 'authentication',
    });
  }

  /**
   * Log de error de API
   */
  apiError(message, error = null, context = {}) {
    this.error(`[API] ${message}`, error, {
      ...context,
      module: 'api',
      endpoint: context.endpoint || 'unknown',
      statusCode: error?.response?.status || null,
    });
  }

  /**
   * Log de inicio de sesión
   */
  loginAttempt(usuario, success = true) {
    const message = success
      ? `Login exitoso: ${usuario}`
      : `Login fallido: ${usuario}`;

    this.info(message, {
      module: 'authentication',
      action: 'login',
      usuario,
      success,
    });
  }

  /**
   * Log de cierre de sesión
   */
  logoutEvent(reason = 'manual') {
    this.info(`Logout ejecutado: ${reason}`, {
      module: 'authentication',
      action: 'logout',
      reason,
    });
  }
}

// Instancia singleton del logger
const logger = new Logger();

/**
 * Exportar logger por defecto
 */
export default logger;

/**
 * Configurar logger (opcional)
 */
export const configureLogger = (options) => {
  Object.assign(config, options);
};

/**
 * Helper para capturar errores no manejados globalmente
 */
export const setupGlobalErrorHandlers = () => {
  // Capturar errores no manejados
  window.addEventListener('error', (event) => {
    logger.error('Error no manejado', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Capturar promesas rechazadas sin catch
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Promesa rechazada sin catch', event.reason, {
      promise: 'unhandled',
    });
  });
};
