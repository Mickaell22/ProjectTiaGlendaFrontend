// src/views/terapeutico/SesionesTerapeuticas.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, Stack
} from '@mui/material';
import { 
  Delete, Edit, Search, Visibility, Add, AccessTime, Person, 
  MedicalServices, EventNote, Psychology, CheckCircle, Schedule
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SesionesTerapeuticas = () => {
  const [sesiones, setSesiones] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [formData, setFormData] = useState({
    paciente_id: '',
    terapeuta_id: '',
    fecha_sesion: '',
    hora_inicio: '',
    hora_fin: '',
    tipo_sesion: '',
    estado: 'programada',
    observaciones_previas: '',
    notas_sesion: '',
    objetivos: '',
    actividades_realizadas: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sesionesRes, pacientesRes, personalRes] = await Promise.all([
        axios.get('http://localhost:5000/api/sesiones-terapeuticas', { headers: getAuthHeaders() }),
        axios.get('http://localhost:5000/api/pacientes', { headers: getAuthHeaders() }),
        axios.get('http://localhost:5000/api/personal/terapeuticos', { headers: getAuthHeaders() })
      ]);
      
      setSesiones(sesionesRes.data.data || []);
      setPacientes(pacientesRes.data.data || []);
      setPersonal(personalRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setSnackbar({ open: true, message: 'Sesión expirada.', severity: 'error' });
        setTimeout(() => navigate('/auth/login'), 2000);
      } else {
        setSnackbar({ open: true, message: 'Error al cargar datos', severity: 'error' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.paciente_id) newErrors.paciente_id = 'Paciente requerido';
    if (!formData.terapeuta_id) newErrors.terapeuta_id = 'Terapeuta requerido';
    if (!formData.fecha_sesion) newErrors.fecha_sesion = 'Fecha requerida';
    if (!formData.hora_inicio) newErrors.hora_inicio = 'Hora de inicio requerida';
    if (!formData.hora_fin) newErrors.hora_fin = 'Hora de fin requerida';
    if (!formData.tipo_sesion) newErrors.tipo_sesion = 'Tipo de sesión requerido';
    
    // Validar que hora_fin sea posterior a hora_inicio
    if (formData.hora_inicio && formData.hora_fin && formData.hora_inicio >= formData.hora_fin) {
      newErrors.hora_fin = 'La hora de fin debe ser posterior a la hora de inicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const sessionData = {
        ...formData,
        fecha_sesion: new Date(formData.fecha_sesion + 'T' + formData.hora_inicio).toISOString(),
        duracion_minutos: calculateDuration(formData.hora_inicio, formData.hora_fin)
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/sesiones-terapeuticas/id/${editingId}`, sessionData, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Sesión actualizada correctamente', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/sesiones-terapeuticas', sessionData, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Sesión programada correctamente', severity: 'success' });
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar sesión';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const calculateDuration = (inicio, fin) => {
    const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
    const [horaFin, minutoFin] = fin.split(':').map(Number);
    const minutosInicio = horaInicio * 60 + minutoInicio;
    const minutosFin = horaFin * 60 + minutoFin;
    return minutosFin - minutosInicio;
  };

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      terapeuta_id: '',
      fecha_sesion: '',
      hora_inicio: '',
      hora_fin: '',
      tipo_sesion: '',
      estado: 'programada',
      observaciones_previas: '',
      notas_sesion: '',
      objetivos: '',
      actividades_realizadas: ''
    });
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (item) => {
    const fechaSesion = new Date(item.fecha_sesion);
    const horaInicio = fechaSesion.toTimeString().slice(0, 5);
    const duracionMs = item.duracion_minutos * 60 * 1000;
    const fechaFin = new Date(fechaSesion.getTime() + duracionMs);
    const horaFin = fechaFin.toTimeString().slice(0, 5);

    setFormData({
      paciente_id: item.paciente_id,
      terapeuta_id: item.terapeuta_id,
      fecha_sesion: fechaSesion.toISOString().split('T')[0],
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      tipo_sesion: item.tipo_sesion,
      estado: item.estado,
      observaciones_previas: item.observaciones_previas || '',
      notas_sesion: item.notas_sesion || '',
      objetivos: item.objetivos || '',
      actividades_realizadas: item.actividades_realizadas || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta sesión terapéutica?')) {
      try {
        await axios.delete(`http://localhost:5000/api/sesiones-terapeuticas/id/${id}`, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Sesión eliminada correctamente', severity: 'info' });
        fetchData();
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al eliminar sesión';
        setSnackbar({ open: true, message: msg, severity: 'error' });
      }
    }
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programada': return 'info';
      case 'en_curso': return 'warning';
      case 'completada': return 'success';
      case 'cancelada': return 'error';
      case 'no_asistio': return 'default';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'programada': return <Schedule />;
      case 'en_curso': return <AccessTime />;
      case 'completada': return <CheckCircle />;
      case 'cancelada': return <Delete />;
      default: return <EventNote />;
    }
  };

  const filteredSesiones = sesiones.filter(s => {
    const matchesSearch = (
      s.paciente?.persona?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.paciente?.persona?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.terapeuta?.persona?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.terapeuta?.persona?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tipo_sesion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesEstado = filterEstado === '' || s.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <Box p={2}>
      <Container maxWidth="xl">
        <Paper 
          elevation={4} 
          sx={{ 
            borderRadius: 3, 
            backgroundColor: '#fff', 
            mb: 4, 
            p: 0, 
            overflow: 'hidden', 
            border: '4px solid transparent', 
            backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #E91E63, #9C27B0, #673AB7, #3F51B5)', 
            backgroundOrigin: 'border-box', 
            backgroundClip: 'padding-box, border-box', 
            animation: 'rainbow 5s linear infinite', 
            '@keyframes rainbow': { 
              '0%': { backgroundPosition: '0% 50%' }, 
              '100%': { backgroundPosition: '100% 50%' } 
            }, 
            backgroundSize: '300% 100%' 
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="black" display="flex" alignItems="center">
              <Psychology sx={{ mr: 2 }} />
              Sesiones Terapéuticas
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ borderRadius: 2, p: 3, mb: 4 }}>
          <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
            {editingId ? 'Editar Sesión Terapéutica' : 'Programar Nueva Sesión'}
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" mb={1}>Paciente:</Typography>
                <TextField
                  select
                  fullWidth
                  name="paciente_id"
                  value={formData.paciente_id}
                  onChange={handleChange}
                  error={!!errors.paciente_id}
                  helperText={errors.paciente_id}
                >
                  <MenuItem value="">Seleccione un paciente</MenuItem>
                  {pacientes.map((paciente) => (
                    <MenuItem key={paciente.id} value={paciente.id}>
                      {`${paciente.persona?.nombres} ${paciente.persona?.apellidos} - ${paciente.numero_historial}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" mb={1}>Terapeuta:</Typography>
                <TextField
                  select
                  fullWidth
                  name="terapeuta_id"
                  value={formData.terapeuta_id}
                  onChange={handleChange}
                  error={!!errors.terapeuta_id}
                  helperText={errors.terapeuta_id}
                >
                  <MenuItem value="">Seleccione un terapeuta</MenuItem>
                  {personal.map((terapeuta) => (
                    <MenuItem key={terapeuta.id} value={terapeuta.id}>
                      {`${terapeuta.persona?.nombres} ${terapeuta.persona?.apellidos} - ${terapeuta.especialidad?.nombre}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body1" mb={1}>Fecha:</Typography>
                <TextField
                  type="date"
                  fullWidth
                  name="fecha_sesion"
                  value={formData.fecha_sesion}
                  onChange={handleChange}
                  error={!!errors.fecha_sesion}
                  helperText={errors.fecha_sesion}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body1" mb={1}>Hora Inicio:</Typography>
                <TextField
                  type="time"
                  fullWidth
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                  error={!!errors.hora_inicio}
                  helperText={errors.hora_inicio}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="body1" mb={1}>Hora Fin:</Typography>
                <TextField
                  type="time"
                  fullWidth
                  name="hora_fin"
                  value={formData.hora_fin}
                  onChange={handleChange}
                  error={!!errors.hora_fin}
                  helperText={errors.hora_fin}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" mb={1}>Tipo de Sesión:</Typography>
                <TextField
                  select
                  fullWidth
                  name="tipo_sesion"
                  value={formData.tipo_sesion}
                  onChange={handleChange}
                  error={!!errors.tipo_sesion}
                  helperText={errors.tipo_sesion}
                  SelectProps={{ native: true }}
                >
                  <option value="">Seleccione tipo</option>
                  <option value="terapia_fisica">Terapia Física</option>
                  <option value="terapia_ocupacional">Terapia Ocupacional</option>
                  <option value="terapia_lenguaje">Terapia del Lenguaje</option>
                  <option value="psicologia">Psicología</option>
                  <option value="terapia_conductual">Terapia Conductual</option>
                  <option value="evaluacion_inicial">Evaluación Inicial</option>
                  <option value="seguimiento">Seguimiento</option>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" mb={1}>Estado:</Typography>
                <TextField
                  select
                  fullWidth
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  SelectProps={{ native: true }}
                >
                  <option value="programada">Programada</option>
                  <option value="en_curso">En Curso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="no_asistio">No Asistió</option>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1" mb={1}>Objetivos de la Sesión:</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="objetivos"
                  value={formData.objetivos}
                  onChange={handleChange}
                  placeholder="Objetivos específicos para esta sesión..."
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1" mb={1}>Observaciones Previas:</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="observaciones_previas"
                  value={formData.observaciones_previas}
                  onChange={handleChange}
                  placeholder="Observaciones antes de la sesión..."
                />
              </Grid>

              {(formData.estado === 'completada' || formData.estado === 'en_curso') && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Actividades Realizadas:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="actividades_realizadas"
                      value={formData.actividades_realizadas}
                      onChange={handleChange}
                      placeholder="Descripción de las actividades realizadas durante la sesión..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Notas de la Sesión:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="notas_sesion"
                      value={formData.notas_sesion}
                      onChange={handleChange}
                      placeholder="Notas importantes sobre el desarrollo de la sesión..."
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="contained" 
                    type="submit" 
                    color="primary"
                    startIcon={<Add />}
                  >
                    {editingId ? 'Actualizar' : 'Programar'}
                  </Button>
                  {editingId && (
                    <Button 
                      variant="outlined" 
                      onClick={resetForm}
                      color="secondary"
                    >
                      Cancelar
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Lista de Sesiones Terapéuticas</Typography>
            
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={8}>
                <Box display="flex" alignItems="center">
                  <Search sx={{ mr: 1 }} />
                  <TextField
                    label="Buscar sesión..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    placeholder="Buscar por paciente, terapeuta o tipo de sesión"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Filtrar por estado"
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="">Todos los estados</option>
                  <option value="programada">Programada</option>
                  <option value="en_curso">En Curso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="no_asistio">No Asistió</option>
                </TextField>
              </Grid>
            </Grid>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Terapeuta</TableCell>
                  <TableCell>Fecha y Hora</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Duración</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSesiones
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {`${item.paciente?.persona?.nombres || ''} ${item.paciente?.persona?.apellidos || ''}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.paciente?.numero_historial}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {`${item.terapeuta?.persona?.nombres || ''} ${item.terapeuta?.persona?.apellidos || ''}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.terapeuta?.especialidad?.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {new Date(item.fecha_sesion).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.fecha_sesion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.tipo_sesion?.replace(/_/g, ' ')} 
                          color="secondary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.duracion_minutos} min</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.estado?.replace(/_/g, ' ')} 
                          color={getEstadoColor(item.estado)}
                          size="small"
                          icon={getEstadoIcon(item.estado)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Ver detalles">
                            <IconButton 
                              color="info" 
                              size="small"
                              onClick={() => handleViewDetail(item)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filteredSesiones.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </CardContent>
        </Card>

        {/* Dialog de detalles */}
        <Dialog 
          open={detailDialog.open} 
          onClose={() => setDetailDialog({ open: false, data: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Psychology sx={{ mr: 2 }} />
              Detalles de la Sesión Terapéutica
            </Box>
          </DialogTitle>
          <DialogContent>
            {detailDialog.data && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Información del Paciente</Typography>
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {`${detailDialog.data.paciente?.persona?.nombres} ${detailDialog.data.paciente?.persona?.apellidos}`}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Historial:</strong> {detailDialog.data.paciente?.numero_historial}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Información del Terapeuta</Typography>
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {`${detailDialog.data.terapeuta?.persona?.nombres} ${detailDialog.data.terapeuta?.persona?.apellidos}`}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Especialidad:</strong> {detailDialog.data.terapeuta?.especialidad?.nombre}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Detalles de la Sesión</Typography>
                  <Typography variant="body2">
                    <strong>Fecha:</strong> {new Date(detailDialog.data.fecha_sesion).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hora:</strong> {new Date(detailDialog.data.fecha_sesion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Duración:</strong> {detailDialog.data.duracion_minutos} minutos
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tipo:</strong> {detailDialog.data.tipo_sesion?.replace(/_/g, ' ')}
                  </Typography>
                  <Box mt={1}>
                    <Chip 
                      label={detailDialog.data.estado?.replace(/_/g, ' ')} 
                      color={getEstadoColor(detailDialog.data.estado)}
                      size="small"
                      icon={getEstadoIcon(detailDialog.data.estado)}
                    />
                  </Box>
                </Grid>

                {detailDialog.data.objetivos && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Objetivos</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.objetivos}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.actividades_realizadas && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Actividades Realizadas</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.actividades_realizadas}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.notas_sesion && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Notas de la Sesión</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.notas_sesion}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.observaciones_previas && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Observaciones Previas</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.observaciones_previas}</Typography>
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
    </Box>
  );
};

export default SesionesTerapeuticas;