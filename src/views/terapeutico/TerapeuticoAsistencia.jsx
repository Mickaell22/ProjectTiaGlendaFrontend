// src/views/terapeutico/TerapeuticoAsistencia.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, Stack, FormControl, InputLabel, Select, Switch,
  FormControlLabel
} from '@mui/material';
import { 
  CheckCircle, Cancel, Search, Visibility, Add, Edit, AccessTime, 
  Person, Psychology, EventNote, Schedule, Today, Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

const TerapeuticoAsistencia = () => {
  const [sesiones, setSesiones] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [selectedSesion, setSelectedSesion] = useState('');
  const [selectedCronograma, setSelectedCronograma] = useState('');
  const [pacientesSesion, setPacientesSesion] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsistio, setFilterAsistio] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [asistenciaDialog, setAsistenciaDialog] = useState({ open: false, data: null, isEdit: false });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asistio: false,
    llegada_tardanza_minutos: 0,
    observaciones_asistencia: '',
    notas_progreso: '',
    tareas_asignadas: '',
    proximos_objetivos: ''
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSesiones();
  }, []);

  const fetchSesiones = async () => {
    try {
      const response = await sesionTerapiaService.getSesiones();
      setSesiones(response.data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const fetchCronogramas = async (sesionId) => {
    try {
      const [cronogramasRes, pacientesRes] = await Promise.all([
        sesionTerapiaService.getCronograma(sesionId),
        sesionTerapiaService.getPacientesSesion(sesionId)
      ]);
      
      setCronogramas(cronogramasRes.data || []);
      setPacientesSesion(pacientesRes.data || []);
    } catch (err) {
      console.error('Error fetching cronogramas:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setCronogramas([]);
      setPacientesSesion([]);
    }
  };

  const fetchAsistencias = async (cronogramaId) => {
    setLoading(true);
    try {
      const response = await sesionTerapiaService.getAsistencia(cronogramaId);
      setAsistencias(response.data || []);
    } catch (err) {
      console.error('Error fetching asistencias:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setAsistencias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSesionChange = (event) => {
    const sesionId = event.target.value;
    setSelectedSesion(sesionId);
    setSelectedCronograma('');
    setAsistencias([]);
    
    if (sesionId) {
      fetchCronogramas(sesionId);
    } else {
      setCronogramas([]);
      setPacientesSesion([]);
    }
  };

  const handleCronogramaChange = (event) => {
    const cronogramaId = event.target.value;
    setSelectedCronograma(cronogramaId);
    
    if (cronogramaId) {
      fetchAsistencias(cronogramaId);
    } else {
      setAsistencias([]);
    }
  };

  const handleRegistrarAsistencia = (paciente) => {
    setFormData({
      asistio: false,
      llegada_tardanza_minutos: 0,
      observaciones_asistencia: '',
      notas_progreso: '',
      tareas_asignadas: '',
      proximos_objetivos: ''
    });
    setAsistenciaDialog({ 
      open: true, 
      data: { paciente, cronograma_id: selectedCronograma },
      isEdit: false 
    });
  };

  const handleEditarAsistencia = (asistencia) => {
    setFormData({
      asistio: asistencia.asistio || false,
      llegada_tardanza_minutos: asistencia.llegada_tardanza_minutos || 0,
      observaciones_asistencia: asistencia.observaciones_asistencia || '',
      notas_progreso: asistencia.notas_progreso || '',
      tareas_asignadas: asistencia.tareas_asignadas || '',
      proximos_objetivos: asistencia.proximos_objetivos || ''
    });
    setAsistenciaDialog({ 
      open: true, 
      data: asistencia,
      isEdit: true 
    });
  };

  const handleSubmitAsistencia = async () => {
    try {
      const { paciente, cronograma_id } = asistenciaDialog.data;
      const pacienteId = paciente?.id || asistenciaDialog.data.paciente_id;
      
      const asistenciaData = {
        asistio: formData.asistio,
        llegada_tardanza_minutos: parseInt(formData.llegada_tardanza_minutos) || 0,
        observaciones_asistencia: formData.observaciones_asistencia?.trim() || null,
        notas_progreso: formData.notas_progreso?.trim() || null,
        tareas_asignadas: formData.tareas_asignadas?.trim() || null,
        proximos_objetivos: formData.proximos_objetivos?.trim() || null
      };

      if (asistenciaDialog.isEdit) {
        await sesionTerapiaService.updateAsistencia(cronograma_id, pacienteId, asistenciaData);
        setSnackbar({ open: true, message: 'Asistencia actualizada correctamente', severity: 'success' });
      } else {
        await sesionTerapiaService.registrarAsistencia(cronograma_id, pacienteId, asistenciaData);
        setSnackbar({ open: true, message: 'Asistencia registrada correctamente', severity: 'success' });
      }
      
      setAsistenciaDialog({ open: false, data: null, isEdit: false });
      fetchAsistencias(selectedCronograma);
    } catch (error) {
      console.error('Error saving asistencia:', error);
      const errorMessage = sesionTerapiaService.handleError(error);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes('T') || timeString.includes(' ')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return timeString;
  };

  const getSesionInfo = (sesionId) => {
    return sesiones.find(s => s.id === parseInt(sesionId));
  };

  const getCronogramaInfo = (cronogramaId) => {
    return cronogramas.find(c => c.id === parseInt(cronogramaId));
  };

  const getPacienteAsistencia = (pacienteId) => {
    return asistencias.find(a => a.paciente_id === pacienteId);
  };

  const filteredAsistencias = asistencias.filter(a => {
    const matchesSearch = (
      a.paciente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.observaciones_asistencia?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    let matchesAsistio = true;
    if (filterAsistio !== '') {
      matchesAsistio = filterAsistio === 'true' ? a.asistio : !a.asistio;
    }
    return matchesSearch && matchesAsistio;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" mb={3}>Seleccionar Sesión y Fecha</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sesión Terapéutica</InputLabel>
                  <Select
                    value={selectedSesion}
                    onChange={handleSesionChange}
                    label="Sesión Terapéutica"
                  >
                    <MenuItem value="">Seleccione una sesión</MenuItem>
                    {sesiones.map((sesion) => (
                      <MenuItem key={sesion.id} value={sesion.id}>
                        {`${sesion.codigo_sesion} - ${sesion.titulo}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={!selectedSesion}>
                  <InputLabel>Fecha de Sesión</InputLabel>
                  <Select
                    value={selectedCronograma}
                    onChange={handleCronogramaChange}
                    label="Fecha de Sesión"
                  >
                    <MenuItem value="">Seleccione una fecha</MenuItem>
                    {cronogramas.map((cronograma) => (
                      <MenuItem key={cronograma.id} value={cronograma.id}>
                        {`Sesión ${cronograma.numero_sesion} - ${formatDate(cronograma.fecha_programada)} ${formatTime(cronograma.hora_programada)}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {selectedSesion && selectedCronograma && getSesionInfo(selectedSesion) && getCronogramaInfo(selectedCronograma) && (
              <Paper sx={{ mt: 3, p: 2, backgroundColor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">Sesión:</Typography>
                    <Typography variant="body2">{getSesionInfo(selectedSesion).codigo_sesion}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">Fecha:</Typography>
                    <Typography variant="body2">{formatDate(getCronogramaInfo(selectedCronograma).fecha_programada)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">Hora:</Typography>
                    <Typography variant="body2">{formatTime(getCronogramaInfo(selectedCronograma).hora_programada)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">Terapeuta:</Typography>
                    <Typography variant="body2">{getSesionInfo(selectedSesion).terapeuta_nombre}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </CardContent>
        </Card>

        {selectedSesion && selectedCronograma && (
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Control de Asistencia - {pacientesSesion.length} pacientes
              </Typography>
              
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center">
                    <Search sx={{ mr: 1 }} />
                    <TextField
                      label="Buscar paciente..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      placeholder="Buscar por nombre de paciente..."
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filtrar por asistencia</InputLabel>
                    <Select
                      value={filterAsistio}
                      onChange={(e) => setFilterAsistio(e.target.value)}
                      label="Filtrar por asistencia"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="true">Asistió</MenuItem>
                      <MenuItem value="false">No Asistió</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <Typography>Cargando asistencias...</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Paciente</TableCell>
                      <TableCell>Asistencia</TableCell>
                      <TableCell>Tardanza</TableCell>
                      <TableCell>Observaciones</TableCell>
                      <TableCell>Fecha Registro</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pacientesSesion.map((paciente) => {
                      const asistencia = getPacienteAsistencia(paciente.paciente_id);
                      return (
                        <TableRow key={paciente.paciente_id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                                <Person />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {paciente.paciente_nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {paciente.paciente_cedula}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {asistencia ? (
                              <Chip 
                                label={asistencia.asistio ? 'Asistió' : 'No Asistió'} 
                                color={asistencia.asistio ? 'success' : 'error'}
                                size="small"
                                icon={asistencia.asistio ? <CheckCircle /> : <Cancel />}
                              />
                            ) : (
                              <Chip 
                                label="Sin Registro" 
                                color="default"
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {asistencia?.llegada_tardanza_minutos ? (
                              <Typography variant="body2" color="warning.main">
                                {asistencia.llegada_tardanza_minutos} min
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {asistencia?.observaciones_asistencia || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {asistencia?.fecha_creacion ? (
                              <Typography variant="caption">
                                {formatDate(asistencia.fecha_creacion)}
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              {asistencia ? (
                                <>
                                  <Tooltip title="Ver detalles">
                                    <IconButton 
                                      color="info" 
                                      size="small"
                                      onClick={() => handleViewDetail(asistencia)}
                                    >
                                      <Visibility />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Editar asistencia">
                                    <IconButton 
                                      color="primary" 
                                      size="small"
                                      onClick={() => handleEditarAsistencia(asistencia)}
                                    >
                                      <Edit />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <Tooltip title="Registrar asistencia">
                                  <IconButton 
                                    color="success" 
                                    size="small"
                                    onClick={() => handleRegistrarAsistencia(paciente)}
                                  >
                                    <Add />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedSesion && (
          <Card>
            <CardContent>
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                py={8}
              >
                <Assignment sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" mb={1}>
                  Seleccione una Sesión y Fecha
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Para registrar asistencias, seleccione una sesión terapéutica y una fecha específica
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Dialog para registrar/editar asistencia */}
        <Dialog 
          open={asistenciaDialog.open} 
          onClose={() => setAsistenciaDialog({ open: false, data: null, isEdit: false })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {asistenciaDialog.isEdit ? 'Editar Asistencia' : 'Registrar Asistencia'}
          </DialogTitle>
          <DialogContent>
            {asistenciaDialog.data && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" mb={2}>
                    Paciente: {asistenciaDialog.data.paciente?.paciente_nombre || asistenciaDialog.data.paciente_nombre}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.asistio}
                        onChange={(e) => setFormData(prev => ({ ...prev, asistio: e.target.checked }))}
                        color="success"
                      />
                    }
                    label="Asistió a la sesión"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minutos de tardanza"
                    value={formData.llegada_tardanza_minutos}
                    onChange={(e) => setFormData(prev => ({ ...prev, llegada_tardanza_minutos: e.target.value }))}
                    inputProps={{ min: 0 }}
                    disabled={!formData.asistio}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Observaciones de Asistencia"
                    value={formData.observaciones_asistencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, observaciones_asistencia: e.target.value }))}
                    placeholder="Observaciones sobre la asistencia..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notas de Progreso"
                    value={formData.notas_progreso}
                    onChange={(e) => setFormData(prev => ({ ...prev, notas_progreso: e.target.value }))}
                    placeholder="Notas sobre el progreso del paciente en esta sesión..."
                    disabled={!formData.asistio}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Tareas Asignadas"
                    value={formData.tareas_asignadas}
                    onChange={(e) => setFormData(prev => ({ ...prev, tareas_asignadas: e.target.value }))}
                    placeholder="Tareas o ejercicios asignados para casa..."
                    disabled={!formData.asistio}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Próximos Objetivos"
                    value={formData.proximos_objetivos}
                    onChange={(e) => setFormData(prev => ({ ...prev, proximos_objetivos: e.target.value }))}
                    placeholder="Objetivos para las próximas sesiones..."
                    disabled={!formData.asistio}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAsistenciaDialog({ open: false, data: null, isEdit: false })}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmitAsistencia}>
              {asistenciaDialog.isEdit ? 'Actualizar' : 'Registrar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de detalles */}
        <Dialog 
          open={detailDialog.open} 
          onClose={() => setDetailDialog({ open: false, data: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Assignment sx={{ mr: 2 }} />
              Detalles de Asistencia
            </Box>
          </DialogTitle>
          <DialogContent>
            {detailDialog.data && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Información del Paciente</Typography>
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {detailDialog.data.paciente_nombre}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cédula:</strong> {detailDialog.data.paciente_cedula}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Información de Asistencia</Typography>
                  <Typography variant="body2" display="flex" alignItems="center">
                    <strong>Estado:</strong> 
                    <Chip 
                      label={detailDialog.data.asistio ? 'Asistió' : 'No Asistió'} 
                      color={detailDialog.data.asistio ? 'success' : 'error'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  {detailDialog.data.llegada_tardanza_minutos > 0 && (
                    <Typography variant="body2">
                      <strong>Tardanza:</strong> {detailDialog.data.llegada_tardanza_minutos} minutos
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <strong>Fecha de Registro:</strong> {formatDate(detailDialog.data.fecha_creacion)}
                  </Typography>
                </Grid>

                {detailDialog.data.observaciones_asistencia && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Observaciones de Asistencia</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.observaciones_asistencia}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.notas_progreso && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Notas de Progreso</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                      <Typography variant="body2">{detailDialog.data.notas_progreso}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.tareas_asignadas && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Tareas Asignadas</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                      <Typography variant="body2">{detailDialog.data.tareas_asignadas}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.proximos_objetivos && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Próximos Objetivos</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                      <Typography variant="body2">{detailDialog.data.proximos_objetivos}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog({ open: false, data: null })}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
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

export default TerapeuticoAsistencia;