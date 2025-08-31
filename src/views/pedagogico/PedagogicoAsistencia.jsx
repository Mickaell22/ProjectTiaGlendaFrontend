// src/views/pedagogico/PedagogicoAsistencia.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Card, CardContent,
  Grid, Button, IconButton, Tooltip, Alert, Snackbar,
  Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Avatar, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, TextField, Tabs, Tab, Divider,
  Checkbox, FormControlLabel, Switch
} from '@mui/material';
import {
  Assignment, CheckCircle, School, Today, Add,
  PersonSearch, Groups, TrendingUp, Event, 
  FilterList, Download, Refresh, Edit, QrCode,
  NotificationImportant, Warning, Info
} from '@mui/icons-material';
import { useAuth } from 'src/contexts/AuthContext';
import sesionPedagogicaService from 'src/services/SesionPedagogicaService';

const PedagogicoAsistencia = () => {
  const [sesiones, setSesiones] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [vistaActual, setVistaActual] = useState(0); // 0: lista, 1: reporte, 2: justificaciones
  const [filtros, setFiltros] = useState({ sesion: '', fecha: '', estado: '' });
  const [dialogAsistencia, setDialogAsistencia] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchSesiones();
    generarDatosMock();
  }, []);

  const fetchSesiones = async () => {
    setLoading(true);
    try {
      const response = await sesionPedagogicaService.getSesiones();
      setSesiones(response.data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar las sesiones',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generarDatosMock = () => {
    // Generar datos simulados de estudiantes y asistencias
    const estudiantesMock = [
      { id: 1, nombre: 'Ana Gómez', nivel: 'Primaria', sesiones_asignadas: 5, asistencias: 4, tardanzas: 1, faltas: 0 },
      { id: 2, nombre: 'Carlos Ruiz', nivel: 'Secundaria', sesiones_asignadas: 6, asistencias: 5, tardanzas: 0, faltas: 1 },
      { id: 3, nombre: 'María Torres', nivel: 'Primaria', sesiones_asignadas: 4, asistencias: 4, tardanzas: 0, faltas: 0 },
      { id: 4, nombre: 'José Miranda', nivel: 'Secundaria', sesiones_asignadas: 5, asistencias: 3, tardanzas: 2, faltas: 0 },
      { id: 5, nombre: 'Laura Vega', nivel: 'Primaria', sesiones_asignadas: 6, asistencias: 6, tardanzas: 0, faltas: 0 },
      { id: 6, nombre: 'Pedro Sánchez', nivel: 'Secundaria', sesiones_asignadas: 4, asistencias: 2, tardanzas: 1, faltas: 1 }
    ];

    const asistenciasMock = [
      { id: 1, sesion: 'Matemáticas Básicas', fecha: '2024-01-15', estudiante: 'Ana Gómez', estado: 'presente', observaciones: '' },
      { id: 2, sesion: 'Matemáticas Básicas', fecha: '2024-01-15', estudiante: 'Carlos Ruiz', estado: 'tardanza', observaciones: 'Llegó 10 minutos tarde' },
      { id: 3, sesion: 'Lenguaje y Comunicación', fecha: '2024-01-16', estudiante: 'María Torres', estado: 'presente', observaciones: '' },
      { id: 4, sesion: 'Lenguaje y Comunicación', fecha: '2024-01-16', estudiante: 'José Miranda', estado: 'ausente', observaciones: 'Sin justificación' },
      { id: 5, sesion: 'Ciencias Naturales', fecha: '2024-01-17', estudiante: 'Laura Vega', estado: 'presente', observaciones: '' },
      { id: 6, sesion: 'Ciencias Naturales', fecha: '2024-01-17', estudiante: 'Pedro Sánchez', estado: 'ausente', observaciones: 'Certificado médico' }
    ];

    setEstudiantes(estudiantesMock);
    setAsistencias(asistenciasMock);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'presente': return 'success';
      case 'tardanza': return 'warning';
      case 'ausente': return 'error';
      default: return 'default';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'presente': return 'Presente';
      case 'tardanza': return 'Tardanza';
      case 'ausente': return 'Ausente';
      default: return 'No registrado';
    }
  };

  const calcularPorcentajeAsistencia = (estudiante) => {
    if (estudiante.sesiones_asignadas === 0) return 0;
    return Math.round((estudiante.asistencias / estudiante.sesiones_asignadas) * 100);
  };

  const marcarAsistencia = (estudianteId, estado) => {
    setSnackbar({
      open: true,
      message: `Asistencia registrada: ${getEstadoTexto(estado)}`,
      severity: 'success'
    });
  };

  const exportarReporte = () => {
    setSnackbar({
      open: true,
      message: 'Reporte de asistencia exportado exitosamente',
      severity: 'success'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1000, md: 1200 },
          mx: 'auto'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <Assignment sx={{ mr: 1 }} />
              Control de Asistencia Estudiantil
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Seguimiento de asistencia y tardanzas de estudiantes
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Tooltip title="Código QR">
              <IconButton sx={{ color: 'white' }}>
                <QrCode />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar">
              <IconButton sx={{ color: 'white' }} onClick={exportarReporte}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Actualizar">
              <IconButton sx={{ color: 'white' }} onClick={fetchSesiones}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {/* Estadísticas principales */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', height: '100%' }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  89%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Asistencia General
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={89} 
                  color="success" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', height: '100%' }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'warning.main' }}>
                  <Warning />
                </Avatar>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  4
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tardanzas Hoy
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={15} 
                  color="warning" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50', height: '100%' }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'error.main' }}>
                  <NotificationImportant />
                </Avatar>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  2
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ausencias Sin Justificar
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={8} 
                  color="error" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50', height: '100%' }}>
                <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: 'info.main' }}>
                  <Groups />
                </Avatar>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {estudiantes.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estudiantes Activos
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  color="info" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
          </Grid>

          {/* Filtros */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sesión</InputLabel>
                <Select
                  value={filtros.sesion}
                  onChange={(e) => setFiltros(prev => ({ ...prev, sesion: e.target.value }))}
                  label="Sesión"
                >
                  <MenuItem value="">Todas las sesiones</MenuItem>
                  <MenuItem value="matematicas">Matemáticas Básicas</MenuItem>
                  <MenuItem value="lenguaje">Lenguaje y Comunicación</MenuItem>
                  <MenuItem value="ciencias">Ciencias Naturales</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Fecha"
                type="date"
                value={filtros.fecha}
                onChange={(e) => setFiltros(prev => ({ ...prev, fecha: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.estado}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="presente">Presente</MenuItem>
                  <MenuItem value="tardanza">Tardanza</MenuItem>
                  <MenuItem value="ausente">Ausente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                onClick={() => setDialogAsistencia(true)}
                sx={{ height: '40px' }}
              >
                Tomar Asistencia
              </Button>
            </Grid>
          </Grid>

          {/* Pestañas */}
          <Tabs value={vistaActual} onChange={(e, newValue) => setVistaActual(newValue)} sx={{ mb: 3 }}>
            <Tab label="Lista de Estudiantes" icon={<Groups />} iconPosition="start" />
            <Tab label="Registro Diario" icon={<Today />} iconPosition="start" />
            <Tab label="Reportes" icon={<TrendingUp />} iconPosition="start" />
          </Tabs>

          {/* Vista de Lista de Estudiantes */}
          {vistaActual === 0 && (
            <Card sx={{ overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Estudiante</strong></TableCell>
                    <TableCell align="center"><strong>Nivel</strong></TableCell>
                    <TableCell align="center"><strong>Sesiones Asignadas</strong></TableCell>
                    <TableCell align="center"><strong>Asistencias</strong></TableCell>
                    <TableCell align="center"><strong>Tardanzas</strong></TableCell>
                    <TableCell align="center"><strong>Faltas</strong></TableCell>
                    <TableCell align="center"><strong>% Asistencia</strong></TableCell>
                    <TableCell align="center"><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estudiantes.map((estudiante) => {
                    const porcentaje = calcularPorcentajeAsistencia(estudiante);
                    return (
                      <TableRow key={estudiante.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                              {estudiante.nombre.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {estudiante.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            size="small" 
                            label={estudiante.nivel} 
                            color={estudiante.nivel === 'Primaria' ? 'success' : 'warning'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">{estudiante.sesiones_asignadas}</TableCell>
                        <TableCell align="center">
                          <Typography color="success.main" fontWeight="bold">
                            {estudiante.asistencias}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography color="warning.main" fontWeight="bold">
                            {estudiante.tardanzas}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography color="error.main" fontWeight="bold">
                            {estudiante.faltas}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center">
                            <LinearProgress 
                              variant="determinate" 
                              value={porcentaje} 
                              color={porcentaje >= 80 ? 'success' : porcentaje >= 60 ? 'warning' : 'error'}
                              sx={{ width: 60, mr: 1 }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {porcentaje}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            size="small" 
                            label={porcentaje >= 80 ? 'Excelente' : porcentaje >= 60 ? 'Bueno' : 'Riesgo'}
                            color={porcentaje >= 80 ? 'success' : porcentaje >= 60 ? 'warning' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Vista de Registro Diario */}
          {vistaActual === 1 && (
            <Card sx={{ overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Sesión</strong></TableCell>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Estudiante</strong></TableCell>
                    <TableCell align="center"><strong>Estado</strong></TableCell>
                    <TableCell><strong>Observaciones</strong></TableCell>
                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {asistencias.map((asistencia) => (
                    <TableRow key={asistencia.id} hover>
                      <TableCell fontWeight="medium">{asistencia.sesion}</TableCell>
                      <TableCell>{new Date(asistencia.fecha).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, width: 24, height: 24, fontSize: '0.8rem' }}>
                            {asistencia.estudiante.charAt(0)}
                          </Avatar>
                          {asistencia.estudiante}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small" 
                          label={getEstadoTexto(asistencia.estado)} 
                          color={getEstadoColor(asistencia.estado)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {asistencia.observaciones || 'Sin observaciones'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton size="small">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Vista de Reportes */}
          {vistaActual === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Resumen Semanal
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Total Estudiantes:</Typography>
                    <Typography variant="body2" fontWeight="bold">{estudiantes.length}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Presentes:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">24</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Tardanzas:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">4</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Ausencias:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">2</Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Alertas de Riesgo
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {estudiantes
                    .filter(e => calcularPorcentajeAsistencia(e) < 70)
                    .map(estudiante => (
                      <Alert key={estudiante.id} severity="warning" sx={{ mb: 1 }}>
                        <strong>{estudiante.nombre}</strong> - Asistencia: {calcularPorcentajeAsistencia(estudiante)}%
                      </Alert>
                    ))}
                  {estudiantes.filter(e => calcularPorcentajeAsistencia(e) < 70).length === 0 && (
                    <Alert severity="success">
                      No hay estudiantes en riesgo académico por asistencia
                    </Alert>
                  )}
                </Card>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Dialog para tomar asistencia */}
      <Dialog open={dialogAsistencia} onClose={() => setDialogAsistencia(false)} maxWidth="md" fullWidth>
        <DialogTitle>Tomar Asistencia - Sesión del Día</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Seleccionar Sesión</InputLabel>
                <Select
                  value={sesionSeleccionada}
                  onChange={(e) => setSesionSeleccionada(e.target.value)}
                  label="Seleccionar Sesión"
                >
                  <MenuItem value="matematicas">Matemáticas Básicas - 09:00</MenuItem>
                  <MenuItem value="lenguaje">Lenguaje y Comunicación - 11:00</MenuItem>
                  <MenuItem value="ciencias">Ciencias Naturales - 14:00</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Marcar asistencia para los estudiantes:
              </Typography>
              {estudiantes.slice(0, 4).map(estudiante => (
                <Box key={estudiante.id} display="flex" alignItems="center" justifyContent="space-between" p={1} mb={1} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="body2">{estudiante.nombre}</Typography>
                  <Box>
                    <Button 
                      size="small" 
                      color="success" 
                      onClick={() => marcarAsistencia(estudiante.id, 'presente')}
                      sx={{ mr: 1 }}
                    >
                      Presente
                    </Button>
                    <Button 
                      size="small" 
                      color="warning" 
                      onClick={() => marcarAsistencia(estudiante.id, 'tardanza')}
                      sx={{ mr: 1 }}
                    >
                      Tardanza
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => marcarAsistencia(estudiante.id, 'ausente')}
                    >
                      Ausente
                    </Button>
                  </Box>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAsistencia(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setDialogAsistencia(false);
              setSnackbar({
                open: true,
                message: 'Asistencia registrada exitosamente',
                severity: 'success'
              });
            }}
          >
            Guardar Asistencia
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PedagogicoAsistencia;