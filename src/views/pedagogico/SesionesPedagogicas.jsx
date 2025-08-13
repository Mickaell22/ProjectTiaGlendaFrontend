// src/views/pedagogico/SesionesPedagogicas.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, Stack, Rating
} from '@mui/material';
import { 
  Delete, Edit, Search, Visibility, Add, AccessTime, Person, 
  School, EventNote, MenuBook, CheckCircle, Schedule, Star,
  Assignment, Group, TrendingUp
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SesionesPedagogicas = () => {
  const [sesiones, setSesiones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [educadores, setEducadores] = useState([]);
  const [formData, setFormData] = useState({
    alumno_id: '',
    educador_id: '',
    fecha_sesion: '',
    hora_inicio: '',
    hora_fin: '',
    tipo_sesion: '',
    materia: '',
    nivel_educativo: '',
    modalidad: '',
    estado: 'programada',
    objetivos_academicos: '',
    contenido_trabajado: '',
    metodologia: '',
    recursos_utilizados: '',
    evaluacion: '',
    calificacion: 0,
    observaciones: '',
    tareas_asignadas: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterMateria, setFilterMateria] = useState('');
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
      const [sesionesRes, alumnosRes, educadoresRes] = await Promise.all([
        axios.get('http://localhost:5000/api/sesiones-pedagogicas', { headers: getAuthHeaders() }),
        axios.get('http://localhost:5000/api/alumnos', { headers: getAuthHeaders() }),
        axios.get('http://localhost:5000/api/personal/pedagogicos', { headers: getAuthHeaders() })
      ]);
      
      setSesiones(sesionesRes.data.data || []);
      setAlumnos(alumnosRes.data.data || []);
      setEducadores(educadoresRes.data.data || []);
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
    if (!formData.alumno_id) newErrors.alumno_id = 'Alumno requerido';
    if (!formData.educador_id) newErrors.educador_id = 'Educador requerido';
    if (!formData.fecha_sesion) newErrors.fecha_sesion = 'Fecha requerida';
    if (!formData.hora_inicio) newErrors.hora_inicio = 'Hora de inicio requerida';
    if (!formData.hora_fin) newErrors.hora_fin = 'Hora de fin requerida';
    if (!formData.tipo_sesion) newErrors.tipo_sesion = 'Tipo de sesión requerido';
    if (!formData.materia) newErrors.materia = 'Materia requerida';
    if (!formData.nivel_educativo) newErrors.nivel_educativo = 'Nivel educativo requerido';
    if (!formData.modalidad) newErrors.modalidad = 'Modalidad requerida';
    
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
        duracion_minutos: calculateDuration(formData.hora_inicio, formData.hora_fin),
        calificacion: parseFloat(formData.calificacion) || 0
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/sesiones-pedagogicas/id/${editingId}`, sessionData, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Sesión actualizada correctamente', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/sesiones-pedagogicas', sessionData, { headers: getAuthHeaders() });
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
      alumno_id: '',
      educador_id: '',
      fecha_sesion: '',
      hora_inicio: '',
      hora_fin: '',
      tipo_sesion: '',
      materia: '',
      nivel_educativo: '',
      modalidad: '',
      estado: 'programada',
      objetivos_academicos: '',
      contenido_trabajado: '',
      metodologia: '',
      recursos_utilizados: '',
      evaluacion: '',
      calificacion: 0,
      observaciones: '',
      tareas_asignadas: ''
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
      alumno_id: item.alumno_id,
      educador_id: item.educador_id,
      fecha_sesion: fechaSesion.toISOString().split('T')[0],
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      tipo_sesion: item.tipo_sesion,
      materia: item.materia,
      nivel_educativo: item.nivel_educativo,
      modalidad: item.modalidad,
      estado: item.estado,
      objetivos_academicos: item.objetivos_academicos || '',
      contenido_trabajado: item.contenido_trabajado || '',
      metodologia: item.metodologia || '',
      recursos_utilizados: item.recursos_utilizados || '',
      evaluacion: item.evaluacion || '',
      calificacion: item.calificacion || 0,
      observaciones: item.observaciones || '',
      tareas_asignadas: item.tareas_asignadas || ''
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta sesión pedagógica?')) {
      try {
        await axios.delete(`http://localhost:5000/api/sesiones-pedagogicas/id/${id}`, { headers: getAuthHeaders() });
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

  const getMateriaColor = (materia) => {
    const colors = {
      matematicas: 'primary',
      lenguaje: 'secondary',
      ciencias: 'success',
      historia: 'warning',
      arte: 'error',
      educacion_fisica: 'info'
    };
    return colors[materia] || 'default';
  };

  const filteredSesiones = sesiones.filter(s => {
    const matchesSearch = (
      s.alumno?.persona?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.alumno?.persona?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.educador?.persona?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.educador?.persona?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.materia?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesEstado = filterEstado === '' || s.estado === filterEstado;
    const matchesMateria = filterMateria === '' || s.materia === filterMateria;
    return matchesSearch && matchesEstado && matchesMateria;
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
            backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #4CAF50, #2196F3, #FF9800, #E91E63)', 
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
              <MenuBook sx={{ mr: 2 }} />
              Sesiones Pedagógicas
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ borderRadius: 2, p: 3, mb: 4 }}>
          <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
            {editingId ? 'Editar Sesión Pedagógica' : 'Programar Nueva Sesión'}
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" mb={1}>Alumno:</Typography>
                <TextField
                  select
                  fullWidth
                  name="alumno_id"
                  value={formData.alumno_id}
                  onChange={handleChange}
                  error={!!errors.alumno_id}
                  helperText={errors.alumno_id}
                >
                  <MenuItem value="">Seleccione un alumno</MenuItem>
                  {alumnos.map((alumno) => (
                    <MenuItem key={alumno.id} value={alumno.id}>
                      {`${alumno.persona?.nombres} ${alumno.persona?.apellidos} - ${alumno.numero_matricula}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" mb={1}>Educador:</Typography>
                <TextField
                  select
                  fullWidth
                  name="educador_id"
                  value={formData.educador_id}
                  onChange={handleChange}
                  error={!!errors.educador_id}
                  helperText={errors.educador_id}
                >
                  <MenuItem value="">Seleccione un educador</MenuItem>
                  {educadores.map((educador) => (
                    <MenuItem key={educador.id} value={educador.id}>
                      {`${educador.persona?.nombres} ${educador.persona?.apellidos} - ${educador.especialidad?.nombre}`}
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
                  <option value="clase_regular">Clase Regular</option>
                  <option value="refuerzo">Refuerzo Académico</option>
                  <option value="evaluacion">Evaluación</option>
                  <option value="tutoria">Tutoría Individual</option>
                  <option value="taller">Taller</option>
                  <option value="proyecto">Proyecto</option>
                  <option value="recuperacion">Recuperación</option>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" mb={1}>Materia:</Typography>
                <TextField
                  select
                  fullWidth
                  name="materia"
                  value={formData.materia}
                  onChange={handleChange}
                  error={!!errors.materia}
                  helperText={errors.materia}
                  SelectProps={{ native: true }}
                >
                  <option value="">Seleccione materia</option>
                  <option value="matematicas">Matemáticas</option>
                  <option value="lenguaje">Lenguaje y Comunicación</option>
                  <option value="ciencias">Ciencias Naturales</option>
                  <option value="historia">Historia y Geografía</option>
                  <option value="arte">Arte y Creatividad</option>
                  <option value="educacion_fisica">Educación Física</option>
                  <option value="musica">Música</option>
                  <option value="ingles">Inglés</option>
                  <option value="computacion">Computación</option>
                  <option value="habilidades_sociales">Habilidades Sociales</option>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" mb={1}>Nivel Educativo:</Typography>
                <TextField
                  select
                  fullWidth
                  name="nivel_educativo"
                  value={formData.nivel_educativo}
                  onChange={handleChange}
                  error={!!errors.nivel_educativo}
                  helperText={errors.nivel_educativo}
                  SelectProps={{ native: true }}
                >
                  <option value="">Seleccione nivel</option>
                  <option value="preescolar">Preescolar</option>
                  <option value="basica_1">Básica 1° - 2°</option>
                  <option value="basica_2">Básica 3° - 4°</option>
                  <option value="basica_3">Básica 5° - 6°</option>
                  <option value="basica_4">Básica 7° - 8°</option>
                  <option value="media">Media</option>
                  <option value="adultos">Educación de Adultos</option>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" mb={1}>Modalidad:</Typography>
                <TextField
                  select
                  fullWidth
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  error={!!errors.modalidad}
                  helperText={errors.modalidad}
                  SelectProps={{ native: true }}
                >
                  <option value="">Seleccione modalidad</option>
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrida">Híbrida</option>
                  <option value="individual">Individual</option>
                  <option value="grupal">Grupal</option>
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
                <Typography variant="body1" mb={1}>Objetivos Académicos:</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="objetivos_academicos"
                  value={formData.objetivos_academicos}
                  onChange={handleChange}
                  placeholder="Objetivos específicos a lograr en esta sesión..."
                />
              </Grid>

              {(formData.estado === 'completada' || formData.estado === 'en_curso') && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Contenido Trabajado:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="contenido_trabajado"
                      value={formData.contenido_trabajado}
                      onChange={handleChange}
                      placeholder="Descripción del contenido abordado durante la sesión..."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Metodología Utilizada:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      name="metodologia"
                      value={formData.metodologia}
                      onChange={handleChange}
                      placeholder="Metodología y técnicas pedagógicas empleadas..."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Recursos Utilizados:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      name="recursos_utilizados"
                      value={formData.recursos_utilizados}
                      onChange={handleChange}
                      placeholder="Materiales, tecnología y recursos empleados..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Evaluación del Aprendizaje:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      name="evaluacion"
                      value={formData.evaluacion}
                      onChange={handleChange}
                      placeholder="Evaluación del progreso y logros del alumno..."
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Calificación (0-10):</Typography>
                    <TextField
                      type="number"
                      fullWidth
                      name="calificacion"
                      value={formData.calificacion}
                      onChange={handleChange}
                      inputProps={{ min: 0, max: 10, step: 0.1 }}
                    />
                    <Box mt={1}>
                      <Rating
                        value={formData.calificacion / 2}
                        onChange={(event, newValue) => {
                          setFormData({ ...formData, calificacion: newValue * 2 });
                        }}
                        precision={0.5}
                        max={5}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Tareas Asignadas:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      name="tareas_asignadas"
                      value={formData.tareas_asignadas}
                      onChange={handleChange}
                      placeholder="Tareas y actividades asignadas para realizar en casa..."
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Typography variant="body1" mb={1}>Observaciones:</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  placeholder="Observaciones adicionales sobre la sesión..."
                />
              </Grid>

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
            <Typography variant="h6" mb={2}>Lista de Sesiones Pedagógicas</Typography>
            
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <Search sx={{ mr: 1 }} />
                  <TextField
                    label="Buscar sesión..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    placeholder="Buscar por alumno, educador o materia"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Filtrar por materia"
                  value={filterMateria}
                  onChange={(e) => setFilterMateria(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="">Todas las materias</option>
                  <option value="matematicas">Matemáticas</option>
                  <option value="lenguaje">Lenguaje</option>
                  <option value="ciencias">Ciencias</option>
                  <option value="historia">Historia</option>
                  <option value="arte">Arte</option>
                  <option value="educacion_fisica">Ed. Física</option>
                </TextField>
              </Grid>
            </Grid>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Alumno</TableCell>
                  <TableCell>Educador</TableCell>
                  <TableCell>Fecha y Hora</TableCell>
                  <TableCell>Materia</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Calificación</TableCell>
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
                              {`${item.alumno?.persona?.nombres || ''} ${item.alumno?.persona?.apellidos || ''}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.alumno?.numero_matricula}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {`${item.educador?.persona?.nombres || ''} ${item.educador?.persona?.apellidos || ''}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.educador?.especialidad?.nombre}
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
                          label={item.materia?.replace(/_/g, ' ')} 
                          color={getMateriaColor(item.materia)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.tipo_sesion?.replace(/_/g, ' ')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {item.calificacion > 0 ? (
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" mr={1}>
                              {item.calificacion}
                            </Typography>
                            <Rating 
                              value={item.calificacion / 2} 
                              readOnly 
                              size="small"
                              max={5}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sin calificar
                          </Typography>
                        )}
                      </TableCell>
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
              <MenuBook sx={{ mr: 2 }} />
              Detalles de la Sesión Pedagógica
            </Box>
          </DialogTitle>
          <DialogContent>
            {detailDialog.data && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Información del Alumno</Typography>
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {`${detailDialog.data.alumno?.persona?.nombres} ${detailDialog.data.alumno?.persona?.apellidos}`}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Matrícula:</strong> {detailDialog.data.alumno?.numero_matricula}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Información del Educador</Typography>
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {`${detailDialog.data.educador?.persona?.nombres} ${detailDialog.data.educador?.persona?.apellidos}`}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Especialidad:</strong> {detailDialog.data.educador?.especialidad?.nombre}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Detalles Académicos</Typography>
                  <Typography variant="body2">
                    <strong>Materia:</strong> {detailDialog.data.materia?.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nivel:</strong> {detailDialog.data.nivel_educativo?.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Modalidad:</strong> {detailDialog.data.modalidad}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tipo:</strong> {detailDialog.data.tipo_sesion?.replace(/_/g, ' ')}
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
                  <Box mt={1} display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={detailDialog.data.estado?.replace(/_/g, ' ')} 
                      color={getEstadoColor(detailDialog.data.estado)}
                      size="small"
                      icon={getEstadoIcon(detailDialog.data.estado)}
                    />
                    {detailDialog.data.calificacion > 0 && (
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" mr={1}>
                          {detailDialog.data.calificacion}/10
                        </Typography>
                        <Rating 
                          value={detailDialog.data.calificacion / 2} 
                          readOnly 
                          size="small"
                          max={5}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>

                {detailDialog.data.objetivos_academicos && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Objetivos Académicos</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.objetivos_academicos}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.contenido_trabajado && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Contenido Trabajado</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.contenido_trabajado}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.metodologia && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Metodología</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.metodologia}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.recursos_utilizados && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Recursos Utilizados</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.recursos_utilizados}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.evaluacion && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Evaluación del Aprendizaje</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.evaluacion}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.tareas_asignadas && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Tareas Asignadas</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.tareas_asignadas}</Typography>
                    </Paper>
                  </Grid>
                )}

                {detailDialog.data.observaciones && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Observaciones</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.observaciones}</Typography>
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

export default SesionesPedagogicas;