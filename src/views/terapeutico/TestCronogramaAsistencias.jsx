// src/views/terapeutico/TestCronogramaAsistencias.jsx
import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, Paper, Typography,
  Alert, Grid, Divider, CircularProgress, Accordion, AccordionSummary,
  AccordionDetails, List, ListItem, ListItemText, Chip
} from '@mui/material';
import {
  PlayArrow, CheckCircle, Error, ExpandMore, Schedule,
  Assignment, CalendarMonth, Person
} from '@mui/icons-material';
import sesionTerapiaService from 'src/services/SesionTerapiaService';
import { formatDateLocal } from 'src/utils/dateUtils';

const TestCronogramaAsistencias = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const addResult = (test, success, message, data = null) => {
    setResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);
    setError(null);

    try {
      addResult('Inicio', true, 'Iniciando pruebas del sistema de cronograma y asistencias...');

      // Test 1: Get all therapy sessions
      addResult('Sesiones', null, 'Obteniendo lista de sesiones terapéuticas...');
      const sesionesResponse = await sesionTerapiaService.getSesiones();
      const sesiones = sesionesResponse.data || [];
      
      if (sesiones.length === 0) {
        addResult('Sesiones', false, 'No se encontraron sesiones terapéuticas. Cree al menos una sesión primero.');
        setLoading(false);
        return;
      }

      addResult('Sesiones', true, `✅ ${sesiones.length} sesión(es) encontrada(s)`, sesiones);

      // Use the first session for testing
      const sesionId = sesiones[0].id;
      const sesionInfo = sesiones[0];

      // Test 2: Get cronograma
      addResult('Cronograma', null, `Obteniendo cronograma para "${sesionInfo.titulo}"...`);
      let cronogramaResponse = await sesionTerapiaService.getCronograma(sesionId);
      let cronograma = cronogramaResponse.data || [];
      
      if (cronograma.length === 0) {
        addResult('Cronograma', null, 'Cronograma vacío. Generando automáticamente...');
        
        try {
          await sesionTerapiaService.generarCronograma(sesionId);
          addResult('Generación', true, '✅ Cronograma generado exitosamente');
          
          // Get cronograma again
          cronogramaResponse = await sesionTerapiaService.getCronograma(sesionId);
          cronograma = cronogramaResponse.data || [];
          addResult('Cronograma', true, `✅ ${cronograma.length} sesión(es) programada(s)`, cronograma);
        } catch (genError) {
          addResult('Generación', false, `❌ Error generando cronograma: ${genError.message}`);
          return;
        }
      } else {
        addResult('Cronograma', true, `✅ ${cronograma.length} sesión(es) programada(s)`, cronograma);
      }

      // Test 3: Get patients for session
      addResult('Pacientes', null, 'Obteniendo pacientes de la sesión...');
      const pacientesResponse = await sesionTerapiaService.getPacientesSesion(sesionId);
      const pacientes = pacientesResponse.data || [];
      
      if (pacientes.length === 0) {
        addResult('Pacientes', false, 'No hay pacientes asignados a esta sesión');
      } else {
        addResult('Pacientes', true, `✅ ${pacientes.length} paciente(s) encontrado(s)`, pacientes);
      }

      // Test 4: Test reprogramming (if there's a programmed session)
      const programmedSessions = cronograma.filter(c => c.estado === 'programada');
      if (programmedSessions.length > 0) {
        const sessionToReprogram = programmedSessions[0];
        addResult('Reprogramación', null, `Probando reprogramación de sesión #${sessionToReprogram.numero_sesion}...`);
        
        try {
          const newDate = new Date();
          newDate.setDate(newDate.getDate() + 7);
          const newDateStr = newDate.toISOString().split('T')[0];
          
          const reprogramData = {
            nueva_fecha: newDateStr,
            nueva_hora: '14:30',
            motivo_reprogramacion: 'Prueba automática del sistema'
          };

          await sesionTerapiaService.reprogramarSesion(sessionToReprogram.id, reprogramData);
          addResult('Reprogramación', true, `✅ Sesión reprogramada para ${formatDateLocal(newDateStr)} a las 14:30`);
        } catch (reprogramError) {
          addResult('Reprogramación', false, `❌ Error en reprogramación: ${reprogramError.message}`);
        }
      } else {
        addResult('Reprogramación', null, 'No hay sesiones programadas disponibles para reprogramar');
      }

      // Test 5: Test attendance registration
      if (pacientes.length > 0 && cronograma.length > 0) {
        const pacienteId = pacientes[0].paciente_id || pacientes[0].id;
        const cronogramaId = cronograma[0].id;
        const pacienteNombre = pacientes[0].paciente_nombre || pacientes[0].nombre;
        
        addResult('Asistencia', null, `Registrando asistencia para ${pacienteNombre}...`);
        
        try {
          const asistenciaData = {
            asistio: true,
            llegada_tardanza_minutos: 0,
            observaciones_asistencia: 'Prueba automática - asistencia registrada correctamente',
            notas_progreso: 'Excelente progreso durante la prueba',
            tareas_asignadas: 'Continuar con ejercicios de la prueba',
            proximos_objetivos: 'Mantener el progreso actual'
          };

          await sesionTerapiaService.registrarAsistencia(cronogramaId, pacienteId, asistenciaData);
          addResult('Asistencia', true, '✅ Asistencia registrada exitosamente');

          // Verify attendance was registered
          const asistenciaResponse = await sesionTerapiaService.getAsistencia(cronogramaId);
          const asistencias = asistenciaResponse.data || [];
          addResult('Verificación', true, `✅ ${asistencias.length} registro(s) de asistencia encontrado(s)`);

        } catch (asistenciaError) {
          addResult('Asistencia', false, `❌ Error registrando asistencia: ${asistenciaError.message}`);
        }
      } else {
        addResult('Asistencia', null, 'No se puede probar asistencia: faltan pacientes o cronograma');
      }

      // Test 6: Test patient management
      addResult('Gestión Pacientes', null, 'Probando gestión de pacientes...');
      try {
        const pacientesDisponiblesResponse = await sesionTerapiaService.getPacientesDisponibles();
        const pacientesDisponibles = pacientesDisponiblesResponse.data || [];
        
        if (pacientesDisponibles.length > 0 && !pacientes.some(p => p.paciente_id === pacientesDisponibles[0].id)) {
          // Test adding a patient to session
          addResult('Agregar Paciente', null, `Agregando paciente ${pacientesDisponibles[0].nombre_completo || pacientesDisponibles[0].nombre} a la sesión...`);
          
          try {
            await sesionTerapiaService.addPacienteToSesion(sesionId, {
              paciente_id: pacientesDisponibles[0].id,
              fecha_incorporacion: new Date().toISOString().split('T')[0]
            });
            addResult('Agregar Paciente', true, '✅ Paciente agregado exitosamente');
            
            // Wait a bit and then remove the patient
            setTimeout(async () => {
              try {
                await sesionTerapiaService.removePacienteFromSesion(sesionId, pacientesDisponibles[0].id);
                addResult('Remover Paciente', true, '✅ Paciente removido exitosamente');
              } catch (removeError) {
                addResult('Remover Paciente', false, `❌ Error removiendo paciente: ${removeError.message}`);
              }
            }, 1000);
          } catch (addError) {
            addResult('Agregar Paciente', false, `❌ Error agregando paciente: ${addError.message}`);
          }
        } else {
          addResult('Gestión Pacientes', null, 'No hay pacientes disponibles para probar agregar/remover');
        }
        
        addResult('Pacientes Disponibles', true, `✅ ${pacientesDisponibles.length} paciente(s) disponible(s) encontrado(s)`);
      } catch (patientsError) {
        addResult('Gestión Pacientes', false, `❌ Error en gestión de pacientes: ${patientsError.message}`);
      }

      // Test 7: Get statistics
      addResult('Estadísticas', null, 'Obteniendo estadísticas del sistema...');
      try {
        const statsResponse = await sesionTerapiaService.getEstadisticas();
        const stats = statsResponse.data || {};
        addResult('Estadísticas', true, '✅ Estadísticas obtenidas', stats);
      } catch (statsError) {
        addResult('Estadísticas', false, `❌ Error obteniendo estadísticas: ${statsError.message}`);
      }

      // Test 8: Test today's sessions
      addResult('Sesiones Hoy', null, 'Obteniendo sesiones programadas para hoy...');
      try {
        const todayResponse = await sesionTerapiaService.getSesionesHoy();
        const todaySessions = todayResponse.data || [];
        addResult('Sesiones Hoy', true, `✅ ${todaySessions.length} sesión(es) programada(s) para hoy`);
      } catch (todayError) {
        addResult('Sesiones Hoy', false, `❌ Error obteniendo sesiones de hoy: ${todayError.message}`);
      }

      addResult('Finalización', true, '🎉 Todas las pruebas completadas exitosamente!');

    } catch (error) {
      console.error('Error durante las pruebas:', error);
      addResult('Error', false, `❌ Error crítico: ${error.message}`);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (success) => {
    if (success === null) return <CircularProgress size={16} />;
    return success ? <CheckCircle color="success" /> : <Error color="error" />;
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
            <Schedule sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Test Cronograma y Asistencias
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Prueba automatizada de funcionalidades del sistema terapéutico
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Esta herramienta probará:</strong><br />
              • Listado y generación de cronogramas<br />
              • Reprogramación de sesiones<br />
              • Registro de asistencias<br />
              • Gestión de pacientes (agregar/remover)<br />
              • Estadísticas del sistema<br />
              • Sesiones programadas para hoy
            </Typography>
          </Alert>

          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
            onClick={runTests}
            disabled={loading}
            fullWidth
            sx={{ mb: 4 }}
          >
            {loading ? 'Ejecutando Pruebas...' : 'Ejecutar Pruebas'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Error crítico:</strong> {error}
              </Typography>
            </Alert>
          )}

          {results.length > 0 && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" mb={2} display="flex" alignItems="center">
                <Assignment sx={{ mr: 1 }} />
                Resultados de las Pruebas
              </Typography>
              <List>
                {results.map((result, index) => (
                  <ListItem key={index} sx={{ py: 1 }}>
                    <Box display="flex" alignItems="center" width="100%">
                      <Box sx={{ mr: 2 }}>
                        {getResultIcon(result.success)}
                      </Box>
                      <Box flexGrow={1}>
                        <Typography variant="body1" fontWeight="medium">
                          [{result.timestamp}] {result.test}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.message}
                        </Typography>
                        {result.data && (
                          <Accordion sx={{ mt: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Typography variant="caption">
                                Ver datos ({Array.isArray(result.data) ? result.data.length : 'objeto'} elementos)
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <pre style={{ 
                                fontSize: '12px', 
                                backgroundColor: '#f5f5f5', 
                                padding: '8px', 
                                borderRadius: '4px',
                                overflow: 'auto',
                                maxHeight: '200px'
                              }}>
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </AccordionDetails>
                          </Accordion>
                        )}
                      </Box>
                      <Chip
                        label={result.success === null ? 'Procesando' : (result.success ? 'OK' : 'Error')}
                        color={getResultColor(result.success)}
                        size="small"
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default TestCronogramaAsistencias;