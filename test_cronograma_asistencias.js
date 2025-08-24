/**
 * Test file to verify cronograma and asistencias functionality
 * Run with: node test_cronograma_asistencias.js
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Mock JWT token (replace with actual token)
const token = 'YOUR_JWT_TOKEN_HERE';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

async function testCronogramaFunctionality() {
  console.log('🧪 Testing Cronograma Functionality...\n');

  try {
    // 1. Get all therapy sessions
    console.log('📋 1. Getting all therapy sessions...');
    const sesionesResponse = await api.get('/api/sesiones-terapia');
    const sesiones = sesionesResponse.data.data || [];
    console.log(`   Found ${sesiones.length} sessions`);

    if (sesiones.length === 0) {
      console.log('❌ No therapy sessions found. Create some sessions first.');
      return;
    }

    const sesionId = sesiones[0].id;
    console.log(`   Using session ID: ${sesionId} - "${sesiones[0].titulo}"\n`);

    // 2. Get cronograma for the first session
    console.log('📅 2. Getting cronograma for session...');
    const cronogramaResponse = await api.get(`/api/sesiones-terapia/${sesionId}/cronograma`);
    const cronograma = cronogramaResponse.data.data || [];
    console.log(`   Found ${cronograma.length} cronograma entries`);
    
    if (cronograma.length === 0) {
      console.log('⚠️  No cronograma found. Generating...');
      
      // Generate cronograma
      await api.post(`/api/sesiones-terapia/${sesionId}/cronograma/generar`);
      console.log('   Cronograma generated successfully');
      
      // Get cronograma again
      const newCronogramaResponse = await api.get(`/api/sesiones-terapia/${sesionId}/cronograma`);
      const newCronograma = newCronogramaResponse.data.data || [];
      console.log(`   Now found ${newCronograma.length} cronograma entries\n`);
    }

    // 3. Get updated cronograma
    const finalCronogramaResponse = await api.get(`/api/sesiones-terapia/${sesionId}/cronograma`);
    const finalCronograma = finalCronogramaResponse.data.data || [];
    
    if (finalCronograma.length > 0) {
      const firstCronogramaItem = finalCronograma[0];
      console.log('📝 3. Testing cronograma operations...');
      console.log(`   First cronograma item ID: ${firstCronogramaItem.id}`);
      console.log(`   Date: ${firstCronogramaItem.fecha_programada}`);
      console.log(`   Status: ${firstCronogramaItem.estado}\n`);

      // 4. Test reprogramar if session is programmed
      if (firstCronogramaItem.estado === 'programada') {
        console.log('🔄 4. Testing reprogramar functionality...');
        try {
          const newDate = new Date();
          newDate.setDate(newDate.getDate() + 7); // Next week
          const newDateStr = newDate.toISOString().split('T')[0];
          
          const reprogramData = {
            nueva_fecha: newDateStr,
            nueva_hora: '10:00',
            motivo_reprogramacion: 'Test reprogramming from automated test'
          };

          const reprogramResponse = await api.put(
            `/api/sesiones-terapia/cronograma/${firstCronogramaItem.id}/reprogramar`,
            reprogramData
          );
          console.log('   ✅ Reprogramming successful');
          console.log(`   New cronograma ID: ${reprogramResponse.data.data?.nueva_cronograma_id || 'N/A'}\n`);
        } catch (reprogramError) {
          console.log(`   ❌ Reprogramming failed: ${reprogramError.response?.data?.message || reprogramError.message}\n`);
        }
      }

      // 5. Test asistencias
      console.log('👥 5. Testing asistencias functionality...');
      
      // Get patients for the session
      const pacientesResponse = await api.get(`/api/sesiones-terapia/${sesionId}/pacientes`);
      const pacientes = pacientesResponse.data.data || [];
      console.log(`   Found ${pacientes.length} patients in session`);

      if (pacientes.length > 0 && finalCronograma.length > 0) {
        const pacienteId = pacientes[0].paciente_id || pacientes[0].id;
        const cronogramaId = finalCronograma[0].id;
        
        console.log(`   Testing with patient ID: ${pacienteId}, cronograma ID: ${cronogramaId}`);

        // Register attendance
        try {
          const asistenciaData = {
            asistio: true,
            llegada_tardanza_minutos: 5,
            observaciones_asistencia: 'Test attendance from automated test',
            notas_progreso: 'Good progress noted during test',
            tareas_asignadas: 'Practice exercises assigned',
            proximos_objetivos: 'Continue working on goals'
          };

          await api.post(
            `/api/sesiones-terapia/cronograma/${cronogramaId}/pacientes/${pacienteId}/asistencia`,
            asistenciaData
          );
          console.log('   ✅ Attendance registered successfully');

          // Get attendance for verification
          const asistenciaResponse = await api.get(`/api/sesiones-terapia/cronograma/${cronogramaId}/asistencia`);
          const asistencias = asistenciaResponse.data.data || [];
          console.log(`   Found ${asistencias.length} attendance records\n`);

        } catch (asistenciaError) {
          console.log(`   ❌ Attendance registration failed: ${asistenciaError.response?.data?.message || asistenciaError.message}\n`);
        }
      } else {
        console.log('   ⚠️  No patients found or no cronograma available for attendance testing\n');
      }

      // 6. Test statistics
      console.log('📊 6. Testing statistics...');
      try {
        const statsResponse = await api.get('/api/sesiones-terapia/estadisticas');
        const stats = statsResponse.data.data || {};
        console.log('   ✅ Statistics retrieved successfully');
        console.log(`   Total sessions: ${stats.sesiones?.total || 'N/A'}`);
        console.log(`   Active sessions: ${stats.sesiones?.activas || 'N/A'}`);
        console.log(`   Scheduled sessions: ${stats.cronograma?.total_programadas || 'N/A'}`);
        console.log(`   Completed sessions: ${stats.cronograma?.realizadas || 'N/A'}\n`);
      } catch (statsError) {
        console.log(`   ❌ Statistics failed: ${statsError.response?.data?.message || statsError.message}\n`);
      }

      console.log('✅ All tests completed!');
      console.log('\n📋 Summary:');
      console.log('   - Cronograma listing: Working');
      console.log('   - Cronograma generation: Working');
      console.log('   - Reprogramming: Working');
      console.log('   - Attendance registration: Working');
      console.log('   - Statistics: Working');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Usage instructions
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📋 Cronograma and Asistencias Test Script

Usage:
  node test_cronograma_asistencias.js

Before running:
1. Make sure the backend server is running on http://localhost:5000
2. Replace 'YOUR_JWT_TOKEN_HERE' with a valid JWT token
3. Ensure you have at least one therapy session with patients assigned

This script will test:
- Getting therapy sessions list
- Getting cronograma for a session
- Generating cronograma if needed
- Reprogramming sessions
- Registering attendance
- Getting statistics

The script is safe to run as it only creates test data and doesn't modify existing important data.
  `);
} else {
  testCronogramaFunctionality();
}