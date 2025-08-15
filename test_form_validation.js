// Test rápido para verificar validación del formulario
// Este archivo simula la validación que hace el formulario

import { UsuarioService } from './src/services/usuarioService.js';

// Datos de prueba que enviaría el formulario
const testFormData = {
  persona_id: 11,
  nombre_usuario: 'test_usuario_123',
  contrasenia: 'TestPass123',
  rol_id: 4,
  estado: 'activo'
};

console.log('=== TEST VALIDACIÓN FRONTEND ===');
console.log('Datos del formulario:', testFormData);

// Test 1: Validación con datos correctos
const validation1 = UsuarioService.validateUsuarioData(testFormData);
console.log('\nValidación con datos correctos:', validation1);

// Test 2: Validación sin nombre_usuario
const testDataSinUsuario = { ...testFormData };
delete testDataSinUsuario.nombre_usuario;
const validation2 = UsuarioService.validateUsuarioData(testDataSinUsuario);
console.log('\nValidación sin nombre_usuario:', validation2);

// Test 3: Formato para backend
const backendData = UsuarioService.formatForBackend(testFormData);
console.log('\nDatos formateados para backend:', backendData);

// Test 4: Validación de datos formateados para backend (esto causaba el error)
const validation3 = UsuarioService.validateUsuarioData(backendData);
console.log('\nValidación de datos backend (debería fallar):', validation3);

console.log('\n=== RESULTADO ===');
console.log('La validación debería usar datos frontend, NO datos backend');