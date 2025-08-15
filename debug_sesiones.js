// Debug script for testing therapy session endpoints
// Run this with: node debug_sesiones.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000'; // Adjust to your backend URL

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

async function testEndpoints() {
  console.log('🔍 Testing Therapy Session Endpoints...\n');

  try {
    // Test 1: Check if API is running
    console.log('1. Testing API health...');
    try {
      const healthResponse = await api.get('/api/test');
      console.log('✅ API Health:', healthResponse.data);
    } catch (error) {
      console.log('❌ API Health failed:', error.message);
      return;
    }

    // Test 2: Get available patients
    console.log('\n2. Testing patients endpoint...');
    try {
      const pacientesResponse = await api.get('/api/sesiones-terapia/pacientes-disponibles');
      console.log('✅ Pacientes disponibles:', pacientesResponse.data);
      console.log('   - Total pacientes:', pacientesResponse.data?.data?.length || 0);
    } catch (error) {
      console.log('❌ Pacientes endpoint failed:', error.response?.data || error.message);
      
      // Try alternative endpoint
      console.log('   Trying alternative endpoint: /api/pacientes');
      try {
        const altResponse = await api.get('/api/pacientes');
        console.log('✅ Alternative pacientes:', altResponse.data);
        console.log('   - Total from alt endpoint:', altResponse.data?.data?.length || 0);
      } catch (altError) {
        console.log('❌ Alternative endpoint also failed:', altError.response?.data || altError.message);
      }
    }

    // Test 3: Get available therapists
    console.log('\n3. Testing therapists endpoint...');
    try {
      const terapeutasResponse = await api.get('/api/sesiones-terapia/terapeutas-disponibles');
      console.log('✅ Terapeutas disponibles:', terapeutasResponse.data);
      console.log('   - Total terapeutas:', terapeutasResponse.data?.data?.length || 0);
    } catch (error) {
      console.log('❌ Terapeutas endpoint failed:', error.response?.data || error.message);
      
      // Try alternative endpoint
      console.log('   Trying alternative endpoint: /api/personal');
      try {
        const altResponse = await api.get('/api/personal');
        console.log('✅ Alternative personal:', altResponse.data);
        console.log('   - Total from alt endpoint:', altResponse.data?.data?.length || 0);
      } catch (altError) {
        console.log('❌ Alternative endpoint also failed:', altError.response?.data || altError.message);
      }
    }

    // Test 4: Get specialties
    console.log('\n4. Testing specialties endpoint...');
    try {
      const especialidadesResponse = await api.get('/api/especialidades');
      console.log('✅ Especialidades:', especialidadesResponse.data);
      console.log('   - Total especialidades:', especialidadesResponse.data?.data?.length || 0);
    } catch (error) {
      console.log('❌ Especialidades endpoint failed:', error.response?.data || error.message);
    }

    // Test 5: Get existing sessions
    console.log('\n5. Testing sessions list endpoint...');
    try {
      const sesionesResponse = await api.get('/api/sesiones-terapia');
      console.log('✅ Sesiones existentes:', sesionesResponse.data);
      console.log('   - Total sesiones:', sesionesResponse.data?.data?.length || 0);
    } catch (error) {
      console.log('❌ Sesiones endpoint failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Test with authentication (if required)
async function testWithAuth() {
  console.log('\n🔐 Testing with authentication...');
  
  try {
    // First, try to login (adjust credentials as needed)
    const loginResponse = await api.post('/api/login', {
      email: 'admin@test.com', // Adjust to your test credentials
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Add token to subsequent requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Now test the endpoints with authentication
    await testEndpoints();
    
  } catch (error) {
    console.log('❌ Authentication failed:', error.response?.data || error.message);
    console.log('   Trying endpoints without authentication...');
    await testEndpoints();
  }
}

// Run the tests
if (require.main === module) {
  testWithAuth();
}

module.exports = { testEndpoints, testWithAuth };