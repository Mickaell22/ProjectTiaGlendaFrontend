// src/views/pedagogico/DebugPedagogico.jsx
import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, Typography, 
  Alert, Paper, Divider
} from '@mui/material';
import sesionPedagogicaService from 'src/services/SesionPedagogicaService';

const DebugPedagogico = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info', data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { message, type, data, timestamp }]);
  };

  const clearResults = () => setResults([]);

  const testAuthentication = () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      addResult(`✅ JWT Token found (length: ${token.length})`, 'success');
      console.log('Token preview:', token.substring(0, 50) + '...');
    } else {
      addResult('❌ No JWT Token found in localStorage', 'error');
    }
  };

  const testGetSesiones = async () => {
    setLoading(true);
    try {
      addResult('🧪 Testing getSesiones...', 'info');
      const response = await sesionPedagogicaService.getSesiones();
      addResult(`✅ Sessions retrieved: ${response.data?.length || 0}`, 'success', response);
    } catch (error) {
      addResult(`❌ Error getting sessions: ${error.message}`, 'error', error);
    } finally {
      setLoading(false);
    }
  };

  const testGetCronograma = async () => {
    setLoading(true);
    try {
      // First get sessions to get a valid ID
      const sessionsResponse = await sesionPedagogicaService.getSesiones();
      const sessions = sessionsResponse.data?.data || sessionsResponse.data || [];
      
      if (sessions.length === 0) {
        addResult('❌ No sessions available for cronograma test', 'error');
        return;
      }

      const firstSession = sessions[0];
      addResult(`🧪 Testing getCronograma for session ${firstSession.id}...`, 'info');
      
      const response = await sesionPedagogicaService.getCronograma(firstSession.id);
      addResult(`✅ Cronograma retrieved: ${response.data?.length || 0} classes`, 'success', response);
    } catch (error) {
      addResult(`❌ Error getting cronograma: ${error.message}`, 'error', error);
    } finally {
      setLoading(false);
    }
  };

  const testRegistrarAsistencia = async () => {
    setLoading(true);
    try {
      addResult('🧪 Testing registrarAsistencia (this will likely fail without valid data)...', 'warning');
      
      // This will fail, but we want to see the error details
      const testData = {
        asistio: true,
        observaciones_asistencia: 'Test attendance'
      };
      
      const response = await sesionPedagogicaService.registrarAsistenciaClase(999, 999, testData);
      addResult('✅ Attendance registered (unexpected)', 'success', response);
    } catch (error) {
      addResult(`❌ Expected error in attendance: ${error.message}`, 'warning', error);
      
      // Show more detailed error info
      if (error.response) {
        addResult(`📝 Status: ${error.response.status}`, 'info');
        addResult(`📝 URL: ${error.config?.url || 'Unknown'}`, 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  const testMarcarRealizada = async () => {
    setLoading(true);
    try {
      addResult('🧪 Testing marcarClaseRealizada (this will likely fail)...', 'warning');
      
      const response = await sesionPedagogicaService.marcarClaseRealizada(999, 'Test observation');
      addResult('✅ Class marked as completed (unexpected)', 'success', response);
    } catch (error) {
      addResult(`❌ Expected error marking class: ${error.message}`, 'warning', error);
      
      if (error.response) {
        addResult(`📝 Status: ${error.response.status}`, 'info');
        addResult(`📝 URL: ${error.config?.url || 'Unknown'}`, 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  const getAlertSeverity = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            🐛 Debug Pedagógico
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Panel de debugging para diagnosticar problemas con sesiones pedagógicas
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <Button 
              variant="outlined" 
              onClick={testAuthentication}
            >
              Test Authentication
            </Button>
            <Button 
              variant="outlined" 
              onClick={testGetSesiones}
              disabled={loading}
            >
              Test Get Sesiones
            </Button>
            <Button 
              variant="outlined" 
              onClick={testGetCronograma}
              disabled={loading}
            >
              Test Get Cronograma
            </Button>
            <Button 
              variant="outlined" 
              onClick={testRegistrarAsistencia}
              disabled={loading}
            >
              Test Registrar Asistencia
            </Button>
            <Button 
              variant="outlined" 
              onClick={testMarcarRealizada}
              disabled={loading}
            >
              Test Marcar Realizada
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={clearResults}
            >
              Clear Results
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Results:
          </Typography>

          <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
            {results.length === 0 && (
              <Typography color="textSecondary">
                No test results yet. Click a test button above.
              </Typography>
            )}
            
            {results.map((result, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Alert severity={getAlertSeverity(result.type)} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    [{result.timestamp}] {result.message}
                  </Typography>
                </Alert>
                
                {result.data && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" component="pre" sx={{ fontSize: '0.7rem' }}>
                      {JSON.stringify(result.data, null, 2).substring(0, 500)}
                      {JSON.stringify(result.data, null, 2).length > 500 && '...'}
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              💡 Debugging Tips:
            </Typography>
            <Typography variant="body2" component="div">
              <ul>
                <li>Check browser console for detailed logs</li>
                <li>Verify JWT token is present and not expired</li>
                <li>Ensure backend is running on http://localhost:5000</li>
                <li>Check if endpoints exist in backend routes</li>
                <li>Verify user has proper permissions</li>
              </ul>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DebugPedagogico;