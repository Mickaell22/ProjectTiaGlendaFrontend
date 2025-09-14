// test-backend.js - Script para probar conexión con el backend
// Ejecutar con: node test-backend.js

const https = require('https');
const http = require('http');

// Configuración
const API_BASE = 'http://localhost:5000'; // Cambia si tu backend usa otro puerto
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluLm5vcnRlIiwicm9sIjoiQWRtaW5pc3RyYWRvciIsImV4cCI6MTc1Nzc5NDI0MSwiaWF0IjoxNzU3NzA3ODQxfQ.7TKuUN9fJirw-IOJ3jF4HZxSiJmKgTp8t9iZHNBVFWM';

/**
 * Hacer petición HTTP
 */
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonBody,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: body,
            success: false
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Ejecutar pruebas
 */
async function runTests() {
  console.log('🚀 Iniciando pruebas del backend...\n');
  
  const tests = [
    {
      name: 'Conectividad API',
      path: '/api/test',
      method: 'GET'
    },
    {
      name: 'Test Base de Datos',
      path: '/api/test-db',
      method: 'GET'
    },
    {
      name: 'Conversaciones de Chat',
      path: '/api/chat/conversaciones',
      method: 'GET'
    },
    {
      name: 'Usuarios Disponibles para Chat',
      path: '/api/chat/usuarios-disponibles',
      method: 'GET'
    },
    {
      name: 'Notificaciones',
      path: '/api/notificaciones',
      method: 'GET'
    },
    {
      name: 'Estadísticas de Notificaciones',
      path: '/api/notificaciones/estadisticas',
      method: 'GET'
    },
  ];

  for (const test of tests) {
    try {
      console.log(`📋 Probando: ${test.name}...`);
      const result = await makeRequest(test.path, test.method, test.data);
      
      if (result.success) {
        console.log(`✅ ${test.name}: OK`);
        if (result.data) {
          console.log(`   Datos recibidos: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
      } else {
        console.log(`❌ ${test.name}: ERROR (${result.status})`);
        console.log(`   Error: ${JSON.stringify(result.data)}`);
      }
    } catch (error) {
      console.log(`💥 ${test.name}: ERROR DE CONEXIÓN`);
      console.log(`   Error: ${error.message}`);
    }
    
    console.log(''); // Línea en blanco
  }

  console.log('🏁 Pruebas completadas.');
}

// Verificar si el backend está corriendo
async function checkBackendStatus() {
  try {
    console.log('🔍 Verificando si el backend está corriendo...');
    const result = await makeRequest('/api/test');
    
    if (result.success) {
      console.log('✅ Backend está corriendo correctamente\n');
      return true;
    } else {
      console.log('❌ Backend respondió con error\n');
      return false;
    }
  } catch (error) {
    console.log('💥 No se puede conectar al backend');
    console.log('   Asegúrate de que el servidor Flask esté corriendo en http://localhost:5000');
    console.log('   Ejecuta: python app.py\n');
    return false;
  }
}

// Ejecutar
async function main() {
  console.log('='.repeat(60));
  console.log('🧪 PRUEBAS DEL SISTEMA DE CHAT Y NOTIFICACIONES');
  console.log('='.repeat(60));
  console.log('');

  const backendRunning = await checkBackendStatus();
  
  if (backendRunning) {
    await runTests();
  } else {
    console.log('⚠️  No se pueden ejecutar las pruebas sin el backend corriendo.');
    console.log('');
    console.log('📝 Para iniciar el backend:');
    console.log('   1. Navega al directorio del backend');
    console.log('   2. Ejecuta: python app.py');
    console.log('   3. Vuelve a ejecutar este script');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { makeRequest, runTests };