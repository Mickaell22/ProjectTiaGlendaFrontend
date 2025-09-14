// src/views/reportes/ReportesPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Autocomplete,
  TextField,
  Alert,
  AlertTitle,
  Chip,
  Divider,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { reportesService } from '../../services/reportesService';

const ReportesPage = () => {
  // Estados principales
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [tipoPersona, setTipoPersona] = useState('paciente'); // 'paciente' o 'personal'
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  // Estados de carga y datos
  const [pacientes, setPacientes] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const [reporteGenerado, setReporteGenerado] = useState(null);
  const [error, setError] = useState(null);
  const [estadoConexion, setEstadoConexion] = useState({ autenticado: null, servidor: null });

  // Cargar datos iniciales
  useEffect(() => {
    verificarConexion();
    cargarDatosIniciales();
  }, []);

  // Verificar conexión y autenticación
  const verificarConexion = async () => {
    try {
      // Verificar si hay token
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setEstadoConexion({ autenticado: false, servidor: null });
        setError('No hay sesión activa. Por favor, inicia sesión.');
        return;
      }

      // Verificar conexión con el servidor
      const response = await ApiService.get('/api/test');
      setEstadoConexion({ autenticado: true, servidor: true });
    } catch (error) {
      console.error('Error verificando conexión:', error);
      setEstadoConexion({ 
        autenticado: localStorage.getItem('jwt_token') ? true : false, 
        servidor: false 
      });
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setError('Sesión expirada. Por favor, recarga la página e inicia sesión nuevamente.');
      } else {
        setError('No se puede conectar al servidor. Verifica que el backend esté funcionando en http://localhost:5000');
      }
    }
  };

  const cargarDatosIniciales = async () => {
    setLoadingPersonas(true);
    setError(null);
    
    try {
      
      const [pacientesRes, personalRes] = await Promise.all([
        reportesService.getPacientesParaSelector(),
        reportesService.getPersonalParaSelector()
      ]);


      if (pacientesRes.success) {
        setPacientes(pacientesRes.data);
      } else {
        setError(`Error cargando pacientes: ${pacientesRes.error}`);
      }

      if (personalRes.success) {
        setPersonal(personalRes.data);
      } else {
        setError(prev => prev ? `${prev}. Error cargando personal: ${personalRes.error}` : `Error cargando personal: ${personalRes.error}`);
      }

    } catch (error) {
      const errorMessage = 'Error cargando datos iniciales - Verifique la conexión con el servidor';
      setError(errorMessage);
      console.error('Error cargando datos:', error);
    } finally {
      setLoadingPersonas(false);
    }
  };

  // Obtener reportes disponibles para una persona
  const obtenerReportesParaPersona = (persona, tipo) => {
    if (!persona) return [];

    const reportes = [];

    if (tipo === 'paciente') {
      reportes.push(
        {
          id: 'asistencia_paciente',
          nombre: `Reporte de Asistencia`,
          descripcion: `Historial detallado de asistencias a terapias de ${persona.label}`,
          color: 'primary',
          filtros: { id_paciente: persona.id }
        },
        {
          id: 'progreso_terapeutico',
          nombre: `Progreso Terapéutico`,
          descripcion: `Evaluación del progreso y evolución terapéutica de ${persona.label}`,
          color: 'success',
          filtros: { id_paciente: persona.id }
        },
        {
          id: 'academico_estudiante',
          nombre: `Rendimiento Académico`,
          descripcion: `Desempeño académico y educativo de ${persona.label}`,
          color: 'info',
          filtros: { id_estudiante: persona.id }
        }
      );
    } else if (tipo === 'personal') {
      reportes.push(
        {
          id: 'asistencia_paciente',
          nombre: `Pacientes Atendidos`,
          descripcion: `Historial de pacientes atendidos por ${persona.label}`,
          color: 'primary',
          filtros: { id_terapeuta: persona.id }
        },
        {
          id: 'progreso_terapeutico',
          nombre: `Progreso de Pacientes`,
          descripcion: `Progreso terapéutico de pacientes bajo el cuidado de ${persona.label}`,
          color: 'success',
          filtros: { id_terapeuta: persona.id }
        },
        {
          id: 'academico_estudiante',
          nombre: `Estudiantes a Cargo`,
          descripcion: `Rendimiento académico de estudiantes supervisados por ${persona.label}`,
          color: 'info',
          filtros: { id_educador: persona.id }
        },
        {
          id: 'rendimiento_clase',
          nombre: `Rendimiento de Clases`,
          descripcion: `Análisis del rendimiento de las clases impartidas por ${persona.label}`,
          color: 'warning',
          filtros: { id_educador: persona.id }
        }
      );
    }

    return reportes;
  };

  // Limpiar selecciones cuando cambia el tipo de persona
  const handleTipoPersonaChange = (event) => {
    setTipoPersona(event.target.value);
    setPersonaSeleccionada(null);
    setReporteSeleccionado(null);
    setReporteGenerado(null);
    setError(null);
  };

  // Limpiar reporte seleccionado cuando cambia la persona
  const handlePersonaChange = (event, newValue) => {
    setPersonaSeleccionada(newValue);
    setReporteSeleccionado(null);
    setReporteGenerado(null);
    setError(null);
  };

  // Generar reporte
  const generarReporte = async () => {
    if (!reporteSeleccionado || !fechaInicio || !fechaFin) return;

    setGenerandoReporte(true);
    setError(null);

    try {
      const filtros = {
        ...reporteSeleccionado.filtros,
        fecha_inicio: dayjs(fechaInicio).format('YYYY-MM-DD'),
        fecha_fin: dayjs(fechaFin).format('YYYY-MM-DD')
      };

      let resultado;
      switch (reporteSeleccionado.id) {
        case 'asistencia_paciente':
          resultado = await reportesService.getReporteAsistenciaPaciente(filtros);
          break;
        case 'progreso_terapeutico':
          resultado = await reportesService.getReporteProgresoTerapeutico(filtros);
          break;
        case 'academico_estudiante':
          resultado = await reportesService.getReporteAcademicoEstudiante(filtros);
          break;
        case 'rendimiento_clase':
          resultado = await reportesService.getReporteRendimientoClase(filtros);
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      if (resultado.success) {
        setReporteGenerado(resultado);
      } else {
        setError(resultado.error || 'Error generando el reporte');
      }
    } catch (error) {
      setError('Error generando el reporte');
      console.error('Error:', error);
    } finally {
      setGenerandoReporte(false);
    }
  };

  // Exportar reporte
  const exportarReporte = async (formato) => {
    if (!reporteGenerado) {
      setError('No hay datos para exportar');
      return;
    }

    try {
      
      const exportData = {
        data: reporteGenerado.data,
        metadata: {
          ...reporteGenerado.metadata,
          tipo_reporte: reporteSeleccionado?.nombre || 'reporte',
          paciente_nombre: personaSeleccionada?.label || '',
          fecha_inicio: dayjs(fechaInicio).format('YYYY-MM-DD'),
          fecha_fin: dayjs(fechaFin).format('YYYY-MM-DD')
        }
      };


      let resultado;
      if (formato === 'pdf') {
        resultado = await reportesService.exportarPDF(exportData);
      } else if (formato === 'excel') {
        resultado = await reportesService.exportarExcel(exportData);
      }


      if (resultado.success) {
        reportesService.descargarArchivo(resultado.url, resultado.fileName);
      } else {
        const errorMsg = `Error exportando a ${formato.toUpperCase()}: ${resultado.error}`;
        setError(errorMsg);
        console.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = `Error inesperado exportando a ${formato.toUpperCase()}: ${error.message}`;
      setError(errorMsg);
      console.error('Error de exportación:', error);
    }
  };

  const reportesDisponibles = obtenerReportesParaPersona(personaSeleccionada, tipoPersona);
  const personasDisponibles = tipoPersona === 'paciente' ? pacientes : personal;

  // Función para renderizar los datos de manera bonita
  const renderizarDatosReporte = (datos, tipoReporte) => {
    if (!datos || datos.length === 0) {
      return (
        <Alert severity="info">
          <AlertTitle>Sin datos</AlertTitle>
          No se encontraron registros para el período seleccionado.
        </Alert>
      );
    }

    // Renderizar según el tipo de reporte
    switch (tipoReporte) {
      case 'asistencia_paciente':
        return (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Paciente</strong></TableCell>
                  <TableCell><strong>Cédula</strong></TableCell>
                  <TableCell><strong>Especialidad</strong></TableCell>
                  <TableCell><strong>Terapeuta</strong></TableCell>
                  <TableCell align="center"><strong>Sesiones Programadas</strong></TableCell>
                  <TableCell align="center"><strong>Asistidas</strong></TableCell>
                  <TableCell align="center"><strong>Perdidas</strong></TableCell>
                  <TableCell align="center"><strong>% Asistencia</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datos.map((fila, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{fila.paciente_nombre}</TableCell>
                    <TableCell>{fila.cedula}</TableCell>
                    <TableCell>{fila.especialidad}</TableCell>
                    <TableCell>{fila.terapeuta_nombre}</TableCell>
                    <TableCell align="center">{fila.total_sesiones_programadas}</TableCell>
                    <TableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      {fila.sesiones_asistidas}
                    </TableCell>
                    <TableCell align="center" sx={{ color: fila.sesiones_perdidas > 0 ? 'error.main' : 'text.secondary' }}>
                      {fila.sesiones_perdidas}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={`${fila.porcentaje_asistencia}%`}
                        color={
                          parseFloat(fila.porcentaje_asistencia) >= 80 ? 'success' :
                          parseFloat(fila.porcentaje_asistencia) >= 60 ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'progreso_terapeutico':
        return (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Paciente</strong></TableCell>
                  <TableCell><strong>Sesión</strong></TableCell>
                  <TableCell><strong>Especialidad</strong></TableCell>
                  <TableCell><strong>Terapeuta</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell align="center"><strong>Sesiones Completadas</strong></TableCell>
                  <TableCell><strong>Fecha Ingreso</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datos.map((fila, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{fila.paciente_nombre}</TableCell>
                    <TableCell>{fila.sesion_titulo}</TableCell>
                    <TableCell>{fila.especialidad}</TableCell>
                    <TableCell>{fila.terapeuta_nombre}</TableCell>
                    <TableCell>
                      <Chip 
                        label={fila.estado_tratamiento}
                        color={fila.estado_tratamiento === 'activo' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {fila.sesiones_completadas} / {fila.total_sesiones}
                    </TableCell>
                    <TableCell>{new Date(fila.fecha_ingreso).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      default:
        // Para otros tipos de reporte, mostrar tabla genérica
        const columnas = Object.keys(datos[0]);
        return (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columnas.map((columna) => (
                    <TableCell key={columna}><strong>{columna.replace(/_/g, ' ').toUpperCase()}</strong></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {datos.map((fila, index) => (
                  <TableRow key={index} hover>
                    {columnas.map((columna) => (
                      <TableCell key={columna}>{fila[columna]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sistema de Reportes
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Proceso simplificado: selecciona una persona, elige el tipo de reporte y define el período de tiempo
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <AlertTitle>¿Cómo funciona?</AlertTitle>
          <Typography variant="body2">
            1. Primero elige si quieres ver reportes de pacientes o personal del centro<br/>
            2. Selecciona la persona específica<br/>
            3. Elige el tipo de reporte que necesitas<br/>
            4. Define las fechas y genera el reporte
          </Typography>
        </Alert>

        {estadoConexion.autenticado === false && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Sin autenticación</AlertTitle>
            No hay una sesión activa. Por favor, inicia sesión para usar el sistema de reportes.
          </Alert>
        )}

        {estadoConexion.servidor === false && estadoConexion.autenticado !== false && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Sin conexión al servidor</AlertTitle>
            No se puede conectar al backend. Verifica que esté funcionando en http://localhost:5000
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={verificarConexion}
              >
                Verificar conexión
              </Button>
            </Box>
          </Alert>
        )}

        {loadingPersonas && !error && estadoConexion.servidor !== false && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography>Cargando pacientes y personal del centro...</Typography>
            </Box>
          </Alert>
        )}

        {estadoConexion.servidor === true && estadoConexion.autenticado === true && !loadingPersonas && !error && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Sistema listo</AlertTitle>
            Conectado al servidor. {pacientes.length} pacientes y {personal.length} personal disponibles.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={cargarDatosIniciales}
                disabled={loadingPersonas}
              >
                {loadingPersonas ? 'Cargando...' : 'Reintentar'}
              </Button>
            </Box>
          </Alert>
        )}

        {/* Paso 1: Seleccionar tipo de persona */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
              1
            </Box>
            Seleccionar tipo de persona
          </Typography>
          
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">¿Qué tipo de persona quieres consultar?</FormLabel>
            <RadioGroup
              row
              value={tipoPersona}
              onChange={handleTipoPersonaChange}
              sx={{ mt: 1 }}
            >
              <FormControlLabel
                value="paciente"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Pacientes</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ver reportes de pacientes del centro
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="personal"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Personal</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ver reportes de terapeutas y educadores
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Paso 2: Seleccionar persona específica */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ bgcolor: personaSeleccionada ? 'success.main' : 'grey.400', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
              2
            </Box>
            Seleccionar {tipoPersona === 'paciente' ? 'paciente' : 'personal'}
          </Typography>

          <Autocomplete
            fullWidth
            options={personasDisponibles || []}
            getOptionLabel={(option) => option?.label || ''}
            value={personaSeleccionada}
            onChange={handlePersonaChange}
            loading={loadingPersonas}
            noOptionsText={`No hay ${tipoPersona === 'paciente' ? 'pacientes' : 'personal'} disponibles`}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={`Seleccionar ${tipoPersona === 'paciente' ? 'Paciente' : 'Personal'}`}
                placeholder="Buscar por nombre..."
                helperText={`${personasDisponibles?.length || 0} ${tipoPersona === 'paciente' ? 'pacientes' : 'personas'} disponibles`}
                sx={{ mt: 2 }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body1">{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tipoPersona === 'paciente' 
                      ? `Cédula: ${option.cedula}` 
                      : `${option.titulo_profesional || 'Personal del centro'}`
                    }
                  </Typography>
                  {tipoPersona === 'personal' && option.especialidades && option.especialidades.length > 0 && (
                    <Typography variant="caption" color="primary.main" sx={{ display: 'block' }}>
                      Especialidades: {option.especialidades.map(esp => esp.nombre).join(', ')}
                    </Typography>
                  )}
                </Box>
              </li>
            )}
          />
        </Box>

        {/* Paso 3: Seleccionar tipo de reporte */}
        {personaSeleccionada && (
          <>
            <Divider sx={{ mb: 4 }} />
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ bgcolor: reporteSeleccionado ? 'success.main' : 'grey.400', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                  3
                </Box>
                Seleccionar tipo de reporte para {personaSeleccionada.label}
              </Typography>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                {reportesDisponibles.map((reporte) => (
                  <Grid item xs={12} md={6} key={reporte.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer', 
                        border: reporteSeleccionado?.id === reporte.id ? 2 : 1,
                        borderColor: reporteSeleccionado?.id === reporte.id ? `${reporte.color}.main` : 'divider',
                        '&:hover': { 
                          borderColor: `${reporte.color}.main`,
                          boxShadow: 2
                        }
                      }}
                      onClick={() => setReporteSeleccionado(reporte)}
                    >
                      <CardContent>
                        <Typography variant="h6" color={`${reporte.color}.main`} gutterBottom>
                          {reporte.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reporte.descripcion}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}

        {/* Paso 4: Seleccionar fechas y generar */}
        {reporteSeleccionado && (
          <>
            <Divider sx={{ mb: 4 }} />
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ bgcolor: fechaInicio && fechaFin ? 'success.main' : 'grey.400', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                  4
                </Box>
                Seleccionar período y generar reporte
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={3} sx={{ mt: 2, mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Fecha de inicio"
                      value={fechaInicio}
                      onChange={(newValue) => setFechaInicio(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: 'Selecciona la fecha de inicio del período'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Fecha de fin"
                      value={fechaFin}
                      onChange={(newValue) => setFechaFin(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          helperText: 'Selecciona la fecha de fin del período'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>

              <LoadingButton
                loading={generandoReporte}
                variant="contained"
                size="large"
                onClick={generarReporte}
                disabled={!fechaInicio || !fechaFin}
                sx={{ 
                  bgcolor: 'success.main',
                  '&:hover': { bgcolor: 'success.dark' },
                  minWidth: 200
                }}
              >
                Generar Reporte
              </LoadingButton>
            </Box>
          </>
        )}

        {/* Resultados del reporte */}
        {reporteGenerado && (
          <>
            <Divider sx={{ mb: 4 }} />
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ bgcolor: 'success.main', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                  ✓
                </Box>
                Reporte Generado
              </Typography>

              <Alert severity="success" sx={{ mb: 3 }}>
                <AlertTitle>Reporte generado exitosamente</AlertTitle>
                Se encontraron {reporteGenerado.data?.length || 0} registros para el período seleccionado
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => exportarReporte('pdf')}
                  size="large"
                >
                  Exportar PDF
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => exportarReporte('excel')}
                  size="large"
                >
                  Exportar Excel
                </Button>
              </Box>

              {/* Vista de datos mejorada */}
              {reporteGenerado.data && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Datos del reporte
                  </Typography>
                  {renderizarDatosReporte(reporteGenerado.data, reporteSeleccionado.id)}
                </Box>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ReportesPage;