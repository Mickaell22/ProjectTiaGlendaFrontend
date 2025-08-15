// Temporary test component for attendance functionality
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Container, Typography, Alert, 
  Grid, Button, FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { BugReport, Assignment } from '@mui/icons-material';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

const TestAsistencias = () => {
  const [testResults, setTestResults] = useState({});
  const [sesiones, setSesiones] = useState([]);
  const [selectedSesion, setSelectedSesion] = useState('');
  const [cronogramas, setCronogramas] = useState([]);
  const [selectedCronograma, setSelectedCronograma] = useState('');
  const [asistencias, setAsistencias] = useState([]);
  const [pacientesDisponibles, setPacientesDisponibles] = useState([]);
  const [showAddPatient, setShowAddPatient] = useState(false);

  const runTest = async (testName, testFunction) => {
    console.log(`🧪 Running test: ${testName}`);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result, error: null }
      }));
      console.log(`✅ ${testName} passed:`, result);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, data: null, error: error.message }
      }));
      console.error(`❌ ${testName} failed:`, error);
    }
  };

  const testGetSesiones = async () => {
    const response = await sesionTerapiaService.getSesiones();
    setSesiones(response.data || []);
    return `Found ${(response.data || []).length} sessions`;
  };

  const testGetCronograma = async () => {
    if (!selectedSesion) throw new Error('No session selected');
    const response = await sesionTerapiaService.getCronograma(selectedSesion);
    setCronogramas(response.data || []);
    return `Found ${(response.data || []).length} cronograma items`;
  };

  const testGetPacientes = async () => {
    if (!selectedSesion) throw new Error('No session selected');
    const response = await sesionTerapiaService.getPacientesSesion(selectedSesion);
    console.log('Patients response:', response);
    return `Found ${(response.data || []).length} patients in session`;
  };

  const testGetAsistencias = async () => {
    if (!selectedCronograma) throw new Error('No cronograma selected');
    const response = await sesionTerapiaService.getAsistencia(selectedCronograma, selectedSesion);
    setAsistencias(response.data || []);
    return `Found ${(response.data || []).length} attendance records`;
  };

  const testRegistrarAsistencia = async () => {
    if (!selectedCronograma) throw new Error('No cronograma selected');
    if (!selectedSesion) throw new Error('No session selected');
    
    // Get patients from session first
    console.log('Getting patients for session:', selectedSesion);
    const pacientesRes = await sesionTerapiaService.getPacientesSesion(selectedSesion);
    const pacientes = pacientesRes.data || [];
    console.log('Found patients:', pacientes);
    
    if (pacientes.length === 0) {
      throw new Error('No patients in this session. Add patients to the session first.');
    }
    
    const testData = {
      asistio: true,
      llegada_tardanza_minutos: 0,
      observaciones_asistencia: 'Test de registro de asistencia - ' + new Date().toISOString(),
      notas_progreso: 'Prueba automática del sistema'
    };
    
    console.log('Registering attendance with data:', testData);
    console.log('Cronograma ID:', selectedCronograma);
    console.log('Patient ID:', pacientes[0].paciente_id);
    
    const response = await sesionTerapiaService.registrarAsistencia(
      selectedCronograma, 
      pacientes[0].paciente_id, 
      testData,
      selectedSesion
    );
    
    return `Attendance registered successfully for patient ${pacientes[0].paciente_nombre || pacientes[0].paciente_id}`;
  };

  const runAllTests = async () => {
    await runTest('Get Sessions', testGetSesiones);
  };

  const runCronogramaTest = async () => {
    await runTest('Get Cronograma', testGetCronograma);
  };

  const runPacientesTest = async () => {
    await runTest('Get Pacientes', testGetPacientes);
  };

  const runAsistenciasTest = async () => {
    await runTest('Get Asistencias', testGetAsistencias);
  };

  const runRegistroTest = async () => {
    await runTest('Register Attendance', testRegistrarAsistencia);
  };

  const loadPacientesDisponibles = async () => {
    try {
      const response = await sesionTerapiaService.getPacientesDisponibles();
      setPacientesDisponibles(response.data || []);
      setShowAddPatient(true);
    } catch (error) {
      console.error('Error loading available patients:', error);
    }
  };

  const addPacienteToSesion = async (pacienteId) => {
    try {
      await sesionTerapiaService.addPacienteToSesion(selectedSesion, {
        paciente_id: pacienteId,
        fecha_incorporacion: new Date().toISOString().split('T')[0]
      });
      setShowAddPatient(false);
      await runPacientesTest(); // Refresh patients list
      return `Patient ${pacienteId} added successfully`;
    } catch (error) {
      console.error('Error adding patient to session:', error);
      throw error;
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const TestResult = ({ testName, result }) => {
    if (!result) return null;
    
    return (
      <Alert 
        severity={result.success ? 'success' : 'error'} 
        sx={{ mb: 1 }}
      >
        <Typography variant="body2">
          <strong>{testName}:</strong> {result.success ? result.data : result.error}
        </Typography>
      </Alert>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" display="flex" alignItems="center" gap={1} mb={2}>
            <BugReport color="warning" />
            Test de Funcionalidades de Asistencias
          </Typography>
          
          <Typography variant="body2" color="text.secondary" mb={3}>
            Esta página prueba todas las funcionalidades corregidas de asistencias.
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Pasos para probar:</strong><br/>
              1. Primero, asegúrate de que las sesiones tengan pacientes asignados<br/>
              2. Ejecuta "Test Pacientes" para verificar que hay pacientes en la sesión<br/>
              3. Si no hay pacientes, ve a la vista detallada de la sesión y agrega pacientes<br/>
              4. Luego prueba los demás endpoints
            </Typography>
          </Alert>

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Seleccionar Sesión para Pruebas</InputLabel>
                <Select
                  value={selectedSesion}
                  onChange={(e) => setSelectedSesion(e.target.value)}
                  label="Seleccionar Sesión para Pruebas"
                >
                  <MenuItem value="">Ninguna sesión seleccionada</MenuItem>
                  {sesiones.map((sesion) => (
                    <MenuItem key={sesion.id} value={sesion.id}>
                      {sesion.codigo_sesion} - {sesion.titulo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedSesion}>
                <InputLabel>Seleccionar Cronograma</InputLabel>
                <Select
                  value={selectedCronograma}
                  onChange={(e) => setSelectedCronograma(e.target.value)}
                  label="Seleccionar Cronograma"
                >
                  <MenuItem value="">Ningún cronograma seleccionado</MenuItem>
                  {cronogramas.map((cronograma) => (
                    <MenuItem key={cronograma.id} value={cronograma.id}>
                      Sesión #{cronograma.numero_sesion} - {cronograma.fecha_programada}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={runAllTests}
                startIcon={<Assignment />}
                size="small"
              >
                Test Sesiones
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="contained" 
                fullWidth 
                disabled={!selectedSesion}
                onClick={runCronogramaTest}
                startIcon={<Assignment />}
                size="small"
              >
                Test Cronograma
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="contained" 
                fullWidth 
                disabled={!selectedSesion}
                onClick={runPacientesTest}
                startIcon={<Assignment />}
                size="small"
              >
                Test Pacientes
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="contained" 
                fullWidth 
                disabled={!selectedCronograma}
                onClick={runAsistenciasTest}
                startIcon={<Assignment />}
                size="small"
              >
                Test Asistencias
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="contained" 
                fullWidth 
                disabled={!selectedCronograma}
                onClick={runRegistroTest}
                startIcon={<Assignment />}
                color="success"
                size="small"
              >
                Test Registro
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                variant="outlined" 
                fullWidth 
                disabled={!selectedSesion}
                onClick={loadPacientesDisponibles}
                startIcon={<Assignment />}
                color="secondary"
                size="small"
              >
                Agregar Paciente
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
          
          {Object.keys(testResults).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No se han ejecutado pruebas aún.
            </Typography>
          ) : (
            Object.entries(testResults).map(([testName, result]) => (
              <TestResult key={testName} testName={testName} result={result} />
            ))
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Estado de los Datos
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Sesiones Cargadas:</Typography>
              <Typography variant="body2">{sesiones.length}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Cronogramas Disponibles:</Typography>
              <Typography variant="body2">{cronogramas.length}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Asistencias Encontradas:</Typography>
              <Typography variant="body2">{asistencias.length}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dialog for adding patients */}
      <Dialog 
        open={showAddPatient} 
        onClose={() => setShowAddPatient(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Paciente a la Sesión</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Selecciona un paciente para agregar a esta sesión terapéutica.
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Pacientes Disponibles</InputLabel>
            <Select
              label="Pacientes Disponibles"
              defaultValue=""
            >
              <MenuItem value="">Selecciona un paciente</MenuItem>
              {pacientesDisponibles.map((paciente) => (
                <MenuItem 
                  key={paciente.id} 
                  value={paciente.id}
                  onClick={() => {
                    runTest('Add Patient', () => addPacienteToSesion(paciente.id));
                  }}
                >
                  {paciente.nombre_completo || paciente.nombre} - {paciente.cedula}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddPatient(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TestAsistencias;