// Component to test which endpoints actually exist in the backend
import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Container, Typography, Alert, 
  Grid, Button, TextField
} from '@mui/material';
import { BugReport, CheckCircle, Cancel } from '@mui/icons-material';
import sesionTerapiaService from 'src/services/SesionTerapiaService';
import { useAuth } from 'src/contexts/AuthContext';

const EndpointTester = () => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);

  // List of endpoints to test based on backend analysis
  const endpointsToTest = [
    // Basic endpoints
    { method: 'GET', url: '/api/test', description: 'API Health Check' },
    { method: 'GET', url: '/api/test-db', description: 'Database Connection' },
    { method: 'GET', url: '/api/verify-token', description: 'Verify JWT Token' },
    { method: 'GET', url: '/api/me', description: 'Get Current User' },
    
    // Therapy session endpoints
    { method: 'GET', url: '/api/sesiones-terapia', description: 'Get All Sessions' },
    { method: 'GET', url: '/api/sesiones-terapia/hoy', description: 'Today Sessions' },
    { method: 'GET', url: '/api/sesiones-terapia/estadisticas', description: 'Statistics' },
    
    // Patient and therapist endpoints
    { method: 'GET', url: '/api/sesiones-terapia/pacientes-disponibles', description: 'Available Patients' },
    { method: 'GET', url: '/api/sesiones-terapia/terapeutas-disponibles', description: 'Available Therapists' },
    
    // Attendance endpoints (REAL endpoints from backend)
    { method: 'GET', url: '/api/cronograma-sesiones/1/asistencias', description: 'GET Cronograma Asistencias' },
    { method: 'GET', url: '/api/sesiones-terapia/cronograma/1/asistencia', description: 'GET Sesion Cronograma Asistencia' },
    { method: 'GET', url: '/api/sesiones-terapia/1/asistencias', description: 'GET Session Asistencias' },
    
    // REAL POST endpoints for attendance registration
    { method: 'POST', url: '/api/cronograma-sesiones/1/asistencias/1', description: 'POST Cronograma Patient Attendance' },
    { method: 'POST', url: '/api/sesiones-terapia/cronograma/1/pacientes/1/asistencia', description: 'POST Session Patient Attendance' },
    
    // PUT endpoint for updates
    { method: 'PUT', url: '/api/sesiones-terapia/cronograma/1/pacientes/1/asistencia', description: 'PUT Update Attendance' },
    
    // Individual session endpoints
    { method: 'GET', url: '/api/sesiones-terapia/1', description: 'Get Session 1' },
    { method: 'GET', url: '/api/sesiones-terapia/1/cronograma', description: 'Cronograma for Session 1' },
    { method: 'GET', url: '/api/sesiones-terapia/1/pacientes', description: 'Patients in Session 1' },
    
    // Other basic endpoints
    { method: 'GET', url: '/api/pacientes', description: 'All Patients' },
    { method: 'GET', url: '/api/personal', description: 'All Staff' },
    { method: 'GET', url: '/api/especialidades', description: 'All Specialties' },
  ];

  const testEndpoint = async (endpoint) => {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.url}`);
      let response;
      
      if (endpoint.method === 'GET') {
        // Use the authenticated API instance from the service
        response = await sesionTerapiaService.api.get(endpoint.url);
      } else if (endpoint.method === 'POST' || endpoint.method === 'PUT') {
        // For POST/PUT requests, send minimal test data
        const testData = endpoint.url.includes('asistencia') ? {
          asistio: true,
          llegada_tardanza_minutos: 0,
          observaciones_asistencia: 'Test data from endpoint tester',
          notas_progreso: 'Test progress notes'
        } : {};
        
        if (endpoint.method === 'POST') {
          response = await sesionTerapiaService.api.post(endpoint.url, testData);
        } else {
          response = await sesionTerapiaService.api.put(endpoint.url, testData);
        }
      }
      
      console.log(`✅ ${endpoint.url} - Status: ${response.status}`);
      
      return {
        success: true,
        status: response.status,
        data: response.data,
        error: null,
        dataSize: response.data ? (Array.isArray(response.data) ? response.data.length : Object.keys(response.data).length) : 0,
        dataType: response.data ? (Array.isArray(response.data) ? 'array' : typeof response.data) : 'none'
      };
    } catch (error) {
      console.log(`❌ ${endpoint.url} - Status: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
      
      return {
        success: false,
        status: error.response?.status || 'Network Error',
        data: null,
        error: error.response?.data?.message || error.message,
        dataSize: 0,
        dataType: 'error'
      };
    }
  };

  const checkTokenInfo = () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        // Decode JWT token (just for viewing, not for security)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        setTokenInfo({
          token: token.substring(0, 20) + '...', // Show only first 20 chars
          payload: decoded,
          valid: decoded.exp > Date.now() / 1000 // Check if not expired
        });
      } catch (error) {
        setTokenInfo({
          token: 'Invalid token format',
          payload: null,
          valid: false
        });
      }
    } else {
      setTokenInfo({
        token: 'No token found',
        payload: null,
        valid: false
      });
    }
  };

  const testAllEndpoints = async () => {
    setTesting(true);
    setResults({});
    
    // Check token info first
    checkTokenInfo();
    
    for (const endpoint of endpointsToTest) {
      console.log(`Testing ${endpoint.method} ${endpoint.url}`);
      const result = await testEndpoint(endpoint);
      
      setResults(prev => ({
        ...prev,
        [endpoint.url]: {
          ...endpoint,
          ...result
        }
      }));
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setTesting(false);
  };

  const testCustomEndpoint = async () => {
    if (!customEndpoint.trim()) return;
    
    const endpoint = {
      method: 'GET',
      url: customEndpoint,
      description: 'Custom Test'
    };
    
    const result = await testEndpoint(endpoint);
    setResults(prev => ({
      ...prev,
      [endpoint.url]: {
        ...endpoint,
        ...result
      }
    }));
  };

  // Quick test for specific attendance endpoints
  const testAttendanceEndpoints = async () => {
    const attendanceEndpoints = [
      '/api/sesiones-terapia/1/asistencias',
      '/api/sesiones-terapia/asistencias', 
      '/api/sesiones-terapia/cronograma/1/asistencias',
      '/api/asistencias',
      '/api/asistencia'
    ];

    for (const url of attendanceEndpoints) {
      const endpoint = { method: 'GET', url, description: 'Attendance Test' };
      const result = await testEndpoint(endpoint);
      setResults(prev => ({
        ...prev,
        [url]: { ...endpoint, ...result }
      }));
    }
  };

  const getResultIcon = (result) => {
    if (!result) return null;
    if (result.success) return <CheckCircle color="success" />;
    return <Cancel color="error" />;
  };

  // Initialize token check on component mount
  useEffect(() => {
    checkTokenInfo();
  }, []);

  const getResultColor = (result) => {
    if (!result) return 'default';
    if (result.success) return 'success';
    if (result.status === 404) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" display="flex" alignItems="center" gap={1} mb={2}>
            <BugReport color="warning" />
            Test de Endpoints del Backend
          </Typography>
          
          <Typography variant="body2" color="text.secondary" mb={3}>
            Esta página verifica qué endpoints existen realmente en el backend.
          </Typography>

          {/* Token Information Section */}
          <Card sx={{ mb: 3, backgroundColor: tokenInfo?.valid ? 'success.50' : 'error.50' }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Token de Autenticación</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={checkTokenInfo}
                sx={{ mb: 2 }}
              >
                Verificar Token
              </Button>
              {tokenInfo && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Estado:</strong> {tokenInfo.valid ? 'Válido' : 'Inválido/Expirado'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Token:</strong> {tokenInfo.token}
                    </Typography>
                  </Grid>
                  {tokenInfo.payload && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Usuario:</strong> {tokenInfo.payload.sub || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Expira:</strong> {new Date(tokenInfo.payload.exp * 1000).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Endpoint personalizado"
                placeholder="/api/endpoint-to-test"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={testCustomEndpoint}
                disabled={!customEndpoint.trim()}
              >
                Test Custom
              </Button>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={testAllEndpoints}
                disabled={testing}
                size="small"
              >
                {testing ? 'Testing...' : 'Test All'}
              </Button>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={testAttendanceEndpoints}
                disabled={testing}
                size="small"
                color="secondary"
              >
                Test Attendance
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Resultados de las Pruebas
          </Typography>
          
          {Object.keys(results).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No se han ejecutado pruebas aún. Haz clic en "Test All" para comenzar.
            </Typography>
          ) : (
            <Grid container spacing={1}>
              {Object.entries(results).map(([url, result]) => (
                <Grid item xs={12} key={url}>
                  <Alert 
                    severity={getResultColor(result)} 
                    icon={getResultIcon(result)}
                    sx={{ mb: 1 }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {result.method} {url}
                      </Typography>
                      <Typography variant="caption">
                        {result.description} - Status: {result.status}
                      </Typography>
                      {result.success && result.data && (
                        <Typography variant="caption" display="block">
                          Data: {result.dataType} - {result.dataSize} {result.dataType === 'array' ? 'items' : 'keys'}
                          {result.data?.data && Array.isArray(result.data.data) && (
                            ` | Nested array: ${result.data.data.length} items`
                          )}
                        </Typography>
                      )}
                      {!result.success && (
                        <Typography variant="caption" display="block" color="error">
                          Error: {result.error}
                        </Typography>
                      )}
                    </Box>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Resumen
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Endpoints Exitosos:</Typography>
              <Typography variant="h4" color="success.main">
                {Object.values(results).filter(r => r.success).length}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Endpoints con Error:</Typography>
              <Typography variant="h4" color="error.main">
                {Object.values(results).filter(r => !r.success && r.status !== 404).length}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Endpoints No Encontrados (404):</Typography>
              <Typography variant="h4" color="warning.main">
                {Object.values(results).filter(r => r.status === 404).length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EndpointTester;