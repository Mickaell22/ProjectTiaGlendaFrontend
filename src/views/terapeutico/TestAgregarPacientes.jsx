// src/views/terapeutico/TestAgregarPacientes.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Container, Paper, Typography,
  Alert, Grid, List, ListItem, ListItemText, Chip, Divider,
  TextField
} from '@mui/material';
import {
  PlayArrow, CheckCircle, Error, Person, PersonAdd, BugReport
} from '@mui/icons-material';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

const TestAgregarPacientes = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [pacientesDisponibles, setPacientesDisponibles] = useState([]);
  const [selectedSesion, setSelectedSesion] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState('');

  const addResult = (test, success, message, data = null) => {
    setResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const sesionesResponse = await sesionTerapiaService.getSesiones();
      setSesiones(sesionesResponse.data || []);
      
      const pacientesResponse = await sesionTerapiaService.getPacientesDisponibles();
      let pacientesData = [];
      if (pacientesResponse?.data) {
        pacientesData = Array.isArray(pacientesResponse.data) 
          ? pacientesResponse.data 
          : pacientesResponse.data.data || [];
      } else if (Array.isArray(pacientesResponse)) {
        pacientesData = pacientesResponse;
      }
      setPacientesDisponibles(pacientesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const runDiagnosticTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Test 1: Check if we can get sessions
      addResult('Sesiones', null, 'Verificando sesiones disponibles...');
      const sesionesResponse = await sesionTerapiaService.getSesiones();
      const sesionesData = sesionesResponse.data || [];
      addResult('Sesiones', true, `✅ ${sesionesData.length} sesión(es) encontrada(s)`, sesionesData);

      // Test 2: Check if we can get available patients
      addResult('Pacientes', null, 'Verificando pacientes disponibles...');
      const pacientesResponse = await sesionTerapiaService.getPacientesDisponibles();
      
      let pacientesData = [];
      if (pacientesResponse?.data) {
        pacientesData = Array.isArray(pacientesResponse.data) 
          ? pacientesResponse.data 
          : pacientesResponse.data.data || [];
      } else if (Array.isArray(pacientesResponse)) {
        pacientesData = pacientesResponse;
      }
      
      addResult('Pacientes', pacientesData.length > 0, 
        `${pacientesData.length > 0 ? '✅' : '❌'} ${pacientesData.length} paciente(s) disponible(s)`, 
        pacientesData);

      // Test 3: Test specific session patients
      if (sesionesData.length > 0) {
        const firstSession = sesionesData[0];
        addResult('Pacientes de Sesión', null, `Verificando pacientes de la sesión "${firstSession.titulo}"...`);
        
        try {
          const sessionPatientsResponse = await sesionTerapiaService.getPacientesSesion(firstSession.id);
          const sessionPatients = sessionPatientsResponse.data || [];
          addResult('Pacientes de Sesión', true, 
            `✅ ${sessionPatients.length} paciente(s) asignado(s) a la sesión`, 
            sessionPatients);
        } catch (error) {
          addResult('Pacientes de Sesión', false, 
            `❌ Error obteniendo pacientes de sesión: ${error.message}`);
        }
      }

      // Test 4: Test endpoint alternatives
      addResult('Endpoints Alternativos', null, 'Probando endpoints alternativos...');
      try {
        const altResponse = await sesionTerapiaService.api.get('/api/pacientes');
        const altData = altResponse.data?.data || altResponse.data || [];
        addResult('Endpoints Alternativos', true, 
          `✅ Endpoint /api/pacientes funciona: ${altData.length} paciente(s)`, 
          altData);
      } catch (error) {
        addResult('Endpoints Alternativos', false, 
          `❌ Endpoint alternativo falló: ${error.message}`);
      }

      // Test 5: Test manual add patient if we have data
      if (selectedSesion && selectedPaciente && pacientesData.length > 0) {
        addResult('Agregar Paciente', null, 'Probando agregar paciente manualmente...');
        
        try {
          const patientData = {
            paciente_id: parseInt(selectedPaciente),
            fecha_incorporacion: new Date().toISOString().split('T')[0]
          };
          
          const response = await sesionTerapiaService.addPacienteToSesion(selectedSesion, patientData);
          addResult('Agregar Paciente', true, '✅ Paciente agregado exitosamente', response);
        } catch (error) {
          addResult('Agregar Paciente', false, 
            `❌ Error agregando paciente: ${error.response?.data?.message || error.message}`, 
            {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message
            });
        }
      }

    } catch (error) {
      addResult('Error', false, `❌ Error crítico en diagnóstico: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (success) => {
    if (success === null) return 'info';
    return success ? 'success' : 'error';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card elevation={8} sx={{ borderRadius: 4, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <BugReport sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Diagnóstico: Agregar Pacientes
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Herramienta de diagnóstico para problemas al agregar pacientes a sesiones
              </Typography>
            </Box>
          </Box>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Esta herramienta diagnosticará:</strong><br />
              • Disponibilidad de sesiones terapéuticas<br />
              • Disponibilidad de pacientes<br />
              • Funcionamiento de endpoints alternativos<br />
              • Proceso completo de agregar pacientes<br />
              • Errores específicos y códigos de estado
            </Typography>
          </Alert>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary" mb={2}>
                    Sesiones Disponibles
                  </Typography>
                  <Typography variant="h4" color={sesiones.length > 0 ? 'success.main' : 'error.main'}>
                    {sesiones.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sesiones.length > 0 ? 'Sesiones encontradas' : 'No hay sesiones'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary" mb={2}>
                    Pacientes Disponibles
                  </Typography>
                  <Typography variant="h4" color={pacientesDisponibles.length > 0 ? 'success.main' : 'error.main'}>
                    {pacientesDisponibles.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pacientesDisponibles.length > 0 ? 'Pacientes disponibles' : 'No hay pacientes'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" color="primary" mb={2}>
                    Test Manual
                  </Typography>
                  <TextField
                    fullWidth
                    label="ID Sesión"
                    value={selectedSesion}
                    onChange={(e) => setSelectedSesion(e.target.value)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    label="ID Paciente"
                    value={selectedPaciente}
                    onChange={(e) => setSelectedPaciente(e.target.value)}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            size="large"
            startIcon={loading ? null : <PlayArrow />}
            onClick={runDiagnosticTests}
            disabled={loading}
            fullWidth
            sx={{ mb: 4 }}
          >
            {loading ? 'Ejecutando Diagnóstico...' : 'Ejecutar Diagnóstico Completo'}
          </Button>

          {results.length > 0 && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" mb={2} display="flex" alignItems="center">
                <CheckCircle sx={{ mr: 1 }} />
                Resultados del Diagnóstico
              </Typography>
              
              <List>
                {results.map((result, index) => (
                  <ListItem key={index} sx={{ py: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box display="flex" alignItems="center" width="100%" mb={1}>
                      <Chip
                        label={result.success === null ? 'Procesando' : (result.success ? 'OK' : 'Error')}
                        color={getResultColor(result.success)}
                        size="small"
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="body1" fontWeight="medium">
                        [{result.timestamp}] {result.test}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
                      {result.message}
                    </Typography>
                    
                    {result.data && (
                      <Box sx={{ ml: 7, mt: 1, p: 2, backgroundColor: 'grey.100', borderRadius: 1, width: '100%' }}>
                        <Typography variant="caption" fontWeight="bold" display="block" mb={1}>
                          Datos ({Array.isArray(result.data) ? result.data.length : 'objeto'} elementos):
                        </Typography>
                        <pre style={{ 
                          fontSize: '11px', 
                          margin: 0,
                          overflow: 'auto',
                          maxHeight: '150px',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </Box>
                    )}
                    
                    {index < results.length - 1 && <Divider sx={{ width: '100%', mt: 2 }} />}
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Para usar este diagnóstico:</strong><br />
              1. Abra las herramientas de desarrollador (F12) y vaya a la pestaña "Console"<br />
              2. Ejecute el diagnóstico y revise tanto los resultados aquí como los logs en console<br />
              3. Si encuentra errores específicos, úselos para identificar el problema exacto<br />
              4. Para test manual, ingrese un ID de sesión e ID de paciente válidos arriba
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TestAgregarPacientes;