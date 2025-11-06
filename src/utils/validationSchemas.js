// src/utils/validationSchemas.js
// Esquemas de validación reutilizables con Yup

import * as Yup from 'yup';

/**
 * Validación ESTRICTA de contraseña (para creación y cambio)
 * Requiere:
 * - Mínimo 8 caracteres
 * - Al menos una minúscula
 * - Al menos una mayúscula
 * - Al menos un número
 * - Al menos un carácter especial
 */
export const strongPasswordSchema = Yup.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'La contraseña no puede exceder 100 caracteres')
  .matches(/[a-z]/, 'Debe contener al menos una letra minúscula')
  .matches(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
  .matches(/[0-9]/, 'Debe contener al menos un número')
  .matches(/[@$!%*?&#]/, 'Debe contener al menos un carácter especial (@$!%*?&#)')
  .required('La contraseña es requerida');

/**
 * Validación BÁSICA de contraseña (para login)
 * Solo requiere mínimo 6 caracteres
 */
export const basicPasswordSchema = Yup.string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .max(100, 'La contraseña no puede exceder 100 caracteres')
  .required('La contraseña es requerida');

/**
 * Validación de usuario
 */
export const usernameSchema = Yup.string()
  .min(3, 'El usuario debe tener al menos 3 caracteres')
  .max(50, 'El usuario no puede exceder 50 caracteres')
  .matches(/^[a-zA-Z0-9_.-]+$/, 'El usuario solo puede contener letras, números, guiones y puntos')
  .required('El usuario es requerido');

/**
 * Validación de email
 */
export const emailSchema = Yup.string()
  .email('Email inválido')
  .max(100, 'El email no puede exceder 100 caracteres')
  .required('El email es requerido');

/**
 * Esquema completo para cambio de contraseña
 */
export const changePasswordSchema = Yup.object({
  currentPassword: basicPasswordSchema,
  newPassword: strongPasswordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Las contraseñas no coinciden')
    .required('Confirma la nueva contraseña'),
});

/**
 * Esquema para creación de usuario (por administrador)
 */
export const createUserSchema = Yup.object({
  usuario: usernameSchema,
  email: emailSchema.optional(),
  contrasenia: strongPasswordSchema,
  confirmarContrasenia: Yup.string()
    .oneOf([Yup.ref('contrasenia'), null], 'Las contraseñas no coinciden')
    .required('Confirma la contraseña'),
  rol: Yup.string().required('El rol es requerido'),
});

/**
 * Esquema básico para login
 */
export const loginSchema = Yup.object({
  usuario: Yup.string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(50, 'El usuario no puede exceder 50 caracteres')
    .required('El usuario es requerido'),
  contrasenia: basicPasswordSchema,
});
