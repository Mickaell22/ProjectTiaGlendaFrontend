// src/utils/tokenValidator.js
// Utilidades para validación de tokens JWT

import { jwtDecode } from 'jwt-decode';
import logger from './logger';

/**
 * Decodificar token JWT
 * @param {string} token - Token JWT
 * @returns {object|null} - Payload decodificado o null si hay error
 */
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    logger.warn('Error al decodificar token', error);
    return null;
  }
};

/**
 * Verificar si un token está expirado
 * @param {string} token - Token JWT
 * @returns {boolean} - true si está expirado
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);

    if (!decoded || !decoded.exp) {
      logger.warn('Token no tiene claim de expiración');
      return true;
    }

    // exp está en segundos, Date.now() en milisegundos
    const currentTime = Date.now() / 1000;
    const isExpired = decoded.exp < currentTime;

    if (isExpired) {
      logger.info('Token expirado', {
        exp: new Date(decoded.exp * 1000).toISOString(),
        now: new Date().toISOString(),
      });
    }

    return isExpired;
  } catch (error) {
    logger.warn('Error al verificar expiración de token', error);
    return true; // Si hay error, considerar como expirado por seguridad
  }
};

/**
 * Obtener tiempo restante hasta expiración (en minutos)
 * @param {string} token - Token JWT
 * @returns {number|null} - Minutos restantes o null si hay error
 */
export const getTokenRemainingTime = (token) => {
  try {
    const decoded = jwtDecode(token);

    if (!decoded || !decoded.exp) {
      return null;
    }

    const currentTime = Date.now() / 1000;
    const remainingSeconds = decoded.exp - currentTime;

    if (remainingSeconds <= 0) {
      return 0;
    }

    return Math.floor(remainingSeconds / 60); // Convertir a minutos
  } catch (error) {
    logger.warn('Error al calcular tiempo restante de token', error);
    return null;
  }
};

/**
 * Verificar si un token necesita renovarse (menos de 5 minutos para expirar)
 * @param {string} token - Token JWT
 * @returns {boolean} - true si necesita renovarse
 */
export const shouldRefreshToken = (token) => {
  const remainingMinutes = getTokenRemainingTime(token);

  if (remainingMinutes === null) {
    return true; // Si hay error, intentar renovar
  }

  // Renovar si quedan menos de 5 minutos
  return remainingMinutes < 5;
};

/**
 * Obtener información del usuario desde el token
 * @param {string} token - Token JWT
 * @returns {object|null} - Información del usuario o null
 */
export const getUserFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    // El payload del JWT del backend usa: user_id, username, rol, id_centro, centros_disponibles
    return {
      id: decoded.user_id,
      usuario: decoded.username,
      rol: decoded.rol,
      id_centro: decoded.id_centro || null,
      centros_disponibles: decoded.centros_disponibles || [],
      exp: decoded.exp,
      iat: decoded.iat,
    };
  } catch (error) {
    logger.warn('Error al extraer usuario de token', error);
    return null;
  }
};

/**
 * Validar estructura básica del token
 * @param {string} token - Token JWT
 * @returns {boolean} - true si tiene estructura válida
 */
export const isValidTokenFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // JWT tiene 3 partes separadas por puntos
  const parts = token.split('.');

  if (parts.length !== 3) {
    return false;
  }

  // Cada parte debe ser base64
  const base64Regex = /^[A-Za-z0-9-_]+$/;

  return parts.every(part => base64Regex.test(part));
};

/**
 * Validar token completamente
 * @param {string} token - Token JWT
 * @returns {object} - { valid: boolean, reason: string }
 */
export const validateToken = (token) => {
  // Verificar que existe
  if (!token) {
    return { valid: false, reason: 'Token no proporcionado' };
  }

  // Verificar formato
  if (!isValidTokenFormat(token)) {
    return { valid: false, reason: 'Formato de token inválido' };
  }

  // Verificar expiración
  if (isTokenExpired(token)) {
    return { valid: false, reason: 'Token expirado' };
  }

  return { valid: true, reason: 'Token válido' };
};
