// src/views/pacientes/PacienteModern.jsx
// Módulo de pacientes completamente refactorizado con buenas prácticas

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  InputAdornment,
  Stack,
  Avatar,
  Chip,
  Divider,
  Tooltip,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Delete,
  Visibility,
  Search,
  Person,
  Phone,
  Email,
  LocalHospital,
  FamilyRestroom,
  CalendarToday,
  Assignment,
  AttachFile,
  AccessTime,
  Add,
  AccountBox,
  MedicalServices
} from '@mui/icons-material';

// Servicios y hooks personalizados
import PacienteService from '../../services/pacienteService.js';
import PersonaService from '../../services/personaService.js';
import EspecialidadService from '../../services/especialidadService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';

// Componentes reutilizables
import CustomSnackbar from '../../components/shared/CustomSnackbar.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/shared/ConfirmDialog.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';
import BuscadorPersonas from '../../components/shared/BuscadorPersonas.jsx';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const PacienteModern = () => {
  // Estados principales
  const [pacientes, setPacientes] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [tutoresDisponibles, setTutoresDisponibles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados del formulario
  const [formData, setFormData] = useState({
    persona_id: '',
    tutor_id: '',
    especialidad_id: '',
    fecha_ingreso: '',
    fecha_inicio_tratamiento: '',
    fecha_fin_tratamiento: '',
    estado_tratamiento: 'activo',
    observaciones_tratamiento: '',
    observaciones: '',
    estado: 'activo'
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  const [showTutorSelector, setShowTutorSelector] = useState(false);

  // Estados de UI
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  // Hooks personalizados
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  // Efectos
  useEffect(() => {
    if (requireAuth()) {
      fetchData();
    }
  }, []);

  // Funciones de API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [pacientesData, personasData, especialidadesData] = await Promise.all([
        PacienteService.getAll().catch(() => []),
        PersonaService.getAll().catch(() => []),
        EspecialidadService.getAll().catch(() => [])
      ]);
      
      setPacientes(pacientesData);
      setPersonasDisponibles(personasData);
      // Los tutores se obtienen del mismo endpoint de personas pero filtrados
      setTutoresDisponibles(personasData.filter(p => p.es_tutor || p.tipo === 'tutor'));
      setEspecialidades(especialidadesData.filter(e => e.estado === 'activo'));
    } catch (error) {
      showError('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejadores del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const backendData = PacienteService.formatForBackend(formData);
    const validation = PacienteService.validatePacienteData(backendData);
    
    // Verificar persona duplicada
    if (PacienteService.checkPersonaExists(pacientes, formData.persona_id, editingId)) {
      validation.errors.persona_id = 'Esta persona ya está registrada como paciente';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = PacienteService.formatForBackend(formData);
      
      if (editingId) {
        await PacienteService.update(editingId, backendData);
        showSuccess('Paciente actualizado correctamente');
      } else {
        await PacienteService.create(backendData);
        showSuccess('Paciente registrado correctamente');
      }
      
      resetForm();
      fetchData();
      setActiveTab(0);
    } catch (error) {
      showError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      persona_id: '',
      tutor_id: '',
      especialidad_id: '',
      fecha_ingreso: '',
      fecha_inicio_tratamiento: '',
      fecha_fin_tratamiento: '',
      estado_tratamiento: 'activo',
      observaciones_tratamiento: '',
      observaciones: '',
      estado: 'activo'
    });
    setEditingId(null);
    setErrors({});
    setSelectedPerson(null);
    setSelectedTutor(null);
    setShowPersonSelector(false);
    setShowTutorSelector(false);
  };

  // Manejadores de acciones
  const handleEdit = (item) => {
    setFormData({
      persona_id: item.persona_id,
      tutor_id: item.tutor_id || '',
      especialidad_id: item.especialidad_id || '',
      fecha_ingreso: item.fecha_ingreso || '',
      fecha_inicio_tratamiento: item.fecha_inicio_tratamiento || '',
      fecha_fin_tratamiento: item.fecha_fin_tratamiento || '',
      estado_tratamiento: item.estado_tratamiento || 'activo',
      observaciones_tratamiento: item.observaciones_tratamiento || '',
      observaciones: item.observaciones || '',
      estado: item.estado
    });
    
    // Encontrar la persona y tutor seleccionados
    const persona = personasDisponibles.find(p => p.id === item.persona_id);
    const tutor = tutoresDisponibles.find(t => t.id === item.tutor_id);
    
    if (persona) setSelectedPerson(persona);
    if (tutor) setSelectedTutor(tutor);
    
    setEditingId(item.id);
    setActiveTab(1);
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await PacienteService.delete(confirmDialog.id);
      showSuccess('Paciente eliminado correctamente');
      fetchData();
    } catch (error) {
      showError(error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const handlePersonaSelect = (persona) => {
    setSelectedPerson(persona);
    setFormData(prev => ({ ...prev, persona_id: persona.id }));
    setShowPersonSelector(false);
    if (errors.persona_id) {
      setErrors(prev => ({ ...prev, persona_id: '' }));
    }
  };

  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor);
    setFormData(prev => ({ ...prev, tutor_id: tutor.id }));
    setShowTutorSelector(false);
    if (errors.tutor_id) {
      setErrors(prev => ({ ...prev, tutor_id: '' }));
    }
  };

  // Datos filtrados
  let filteredPacientes = PacienteService.filterPacientes(pacientes, searchTerm);
  filteredPacientes = PacienteService.filterByEstado(filteredPacientes, filterEstado);
  filteredPacientes = PacienteService.filterByEspecialidad(filteredPacientes, filterEspecialidad);

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Cargando datos de pacientes..." fullHeight />;
  }

  return (
    <ErrorBoundary>
      <Box p={2}>
        <Container maxWidth="xl">
          {/* Header con borde arcoíris */}
          <Paper 
            elevation={4} 
            sx={{ 
              borderRadius: 3, 
              backgroundColor: '#fff', 
              mb: 4, 
              p: 0, 
              overflow: 'hidden', 
              border: '4px solid transparent', 
              backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #2196F3, #4CAF50, #FF9800, #E91E63)', 
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
                <LocalHospital sx={{ mr: 2 }} />
                Gestión de Pacientes
              </Typography>
            </Box>
          </Paper>

          {/* Navegación por pestañas */}
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)} 
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Lista de Pacientes" icon={<LocalHospital />} />
              <Tab label={editingId ? "Editar Paciente" : "Nuevo Paciente"} icon={<PersonAdd />} />
            </Tabs>
          </Paper>

          {/* Tab Panel 0 - Lista */}
          <TabPanel value={activeTab} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2} display="flex" alignItems="center">
                  <LocalHospital sx={{ mr: 1 }} />
                  Lista de Pacientes
                  <Chip 
                    label={`${filteredPacientes.length} paciente${filteredPacientes.length !== 1 ? 's' : ''}`} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 2 }}
                  />
                </Typography>
                
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Buscar pacientes"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        )
                      }}
                      placeholder="Buscar por nombre, cédula, tutor..."
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Estado</InputLabel>
                      <Select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        label="Estado"
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {PacienteService.getEstados().map((estado) => (
                          <MenuItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Especialidad</InputLabel>
                      <Select
                        value={filterEspecialidad}
                        onChange={(e) => setFilterEspecialidad(e.target.value)}
                        label="Especialidad"
                      >
                        <MenuItem value="">Todas</MenuItem>
                        {especialidades.map((esp) => (
                          <MenuItem key={esp.id} value={esp.id}>
                            {esp.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => {
                        resetForm();
                        setActiveTab(1);
                      }}
                      sx={{ height: '40px' }}
                    >
                      Nuevo Paciente
                    </Button>
                  </Grid>
                </Grid>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Paciente</TableCell>
                      <TableCell>Tutor</TableCell>
                      <TableCell>Especialidad</TableCell>
                      <TableCell>Tratamiento</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPacientes
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => {
                        const estadoInfo = PacienteService.getEstadoInfo(item.estado);
                        const estadoTratamientoInfo = PacienteService.getEstadoTratamientoInfo(item.estado_tratamiento);
                        const tutorInfo = PacienteService.getTutorContactInfo(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                                  <Person />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {PacienteService.getFullName(item)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.cedula} • Edad: {PacienteService.calculateAge(item.fecha_nacimiento)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {tutorInfo.nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                                  <Phone sx={{ fontSize: '12px', mr: 0.5 }} />
                                  {tutorInfo.telefono}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {tutorInfo.parentesco}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {item.especialidad_nombre ? (
                                <Chip 
                                  label={item.especialidad_nombre} 
                                  color="secondary"
                                  size="small"
                                  icon={<MedicalServices />}
                                />
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  Sin especialidad
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Chip 
                                  label={estadoTratamientoInfo.label} 
                                  color={estadoTratamientoInfo.color}
                                  size="small"
                                  sx={{ mb: 0.5 }}
                                />
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {item.fecha_inicio_tratamiento ? 
                                    `Inicio: ${PacienteService.formatDate(item.fecha_inicio_tratamiento)}` :
                                    'Sin fecha de inicio'
                                  }
                                </Typography>
                                {item.fecha_inicio_tratamiento && (
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    Tiempo: {PacienteService.calculateTiempoTratamiento(item.fecha_inicio_tratamiento, item.fecha_fin_tratamiento)}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={estadoInfo.label} 
                                color={estadoInfo.color}
                                size="small"
                              />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Ingreso: {PacienteService.formatDate(item.fecha_ingreso)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
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
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>

                <TablePagination
                  component="div"
                  count={filteredPacientes.length}
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
          </TabPanel>

          {/* Tab Panel 1 - Formulario */}
          <TabPanel value={activeTab} index={1}>
            <Paper elevation={3} sx={{ borderRadius: 2, p: 3 }}>
              <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
                {editingId ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Información del Paciente */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                      <AccountBox sx={{ mr: 1 }} />
                      Información del Paciente
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Persona: *</Typography>
                    {selectedPerson ? (
                      <Box>
                        <Paper 
                          elevation={1} 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'success.50', 
                            border: '1px solid', 
                            borderColor: 'success.main',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {PersonaService.getFullName(selectedPerson)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Cédula: {selectedPerson.cedula}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedPerson(null);
                              setFormData(prev => ({ ...prev, persona_id: '' }));
                              setShowPersonSelector(true);
                            }}
                          >
                            Cambiar
                          </Button>
                        </Paper>
                        {errors.persona_id && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {errors.persona_id}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="large"
                          onClick={() => setShowPersonSelector(true)}
                          startIcon={<Search />}
                          sx={{ 
                            py: 2,
                            borderStyle: errors.persona_id ? 'solid' : 'dashed',
                            borderColor: errors.persona_id ? 'error.main' : 'primary.main'
                          }}
                        >
                          Buscar y Seleccionar Persona
                        </Button>
                        {errors.persona_id && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {errors.persona_id}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Tutor: *</Typography>
                    {selectedTutor ? (
                      <Box>
                        <Paper 
                          elevation={1} 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'info.50', 
                            border: '1px solid', 
                            borderColor: 'info.main',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {PersonaService.getFullName(selectedTutor)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Cédula: {selectedTutor.cedula}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedTutor(null);
                              setFormData(prev => ({ ...prev, tutor_id: '' }));
                              setShowTutorSelector(true);
                            }}
                          >
                            Cambiar
                          </Button>
                        </Paper>
                        {errors.tutor_id && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {errors.tutor_id}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="large"
                          onClick={() => setShowTutorSelector(true)}
                          startIcon={<FamilyRestroom />}
                          sx={{ 
                            py: 2,
                            borderStyle: errors.tutor_id ? 'solid' : 'dashed',
                            borderColor: errors.tutor_id ? 'error.main' : 'info.main'
                          }}
                        >
                          Buscar y Seleccionar Tutor
                        </Button>
                        {errors.tutor_id && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {errors.tutor_id}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>

                  {/* Información de Tratamiento */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center" sx={{ mt: 2 }}>
                      <MedicalServices sx={{ mr: 1 }} />
                      Información de Tratamiento
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Especialidad:</Typography>
                    <TextField
                      select
                      fullWidth
                      name="especialidad_id"
                      value={formData.especialidad_id}
                      onChange={handleChange}
                      error={!!errors.especialidad_id}
                      helperText={errors.especialidad_id}
                    >
                      <MenuItem value="">Sin especialidad asignada</MenuItem>
                      {especialidades.map((esp) => (
                        <MenuItem key={esp.id} value={esp.id}>
                          {esp.nombre} - {EspecialidadService.getAreaLabel(esp.area)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Fecha de Ingreso: *</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      name="fecha_ingreso"
                      value={formData.fecha_ingreso}
                      onChange={handleChange}
                      error={!!errors.fecha_ingreso}
                      helperText={errors.fecha_ingreso}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Fecha Inicio Tratamiento:</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      name="fecha_inicio_tratamiento"
                      value={formData.fecha_inicio_tratamiento}
                      onChange={handleChange}
                      error={!!errors.fecha_inicio_tratamiento}
                      helperText={errors.fecha_inicio_tratamiento}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Fecha Fin Tratamiento:</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      name="fecha_fin_tratamiento"
                      value={formData.fecha_fin_tratamiento}
                      onChange={handleChange}
                      error={!!errors.fecha_fin_tratamiento}
                      helperText={errors.fecha_fin_tratamiento}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Estado de Tratamiento:</Typography>
                    <TextField
                      select
                      fullWidth
                      name="estado_tratamiento"
                      value={formData.estado_tratamiento}
                      onChange={handleChange}
                    >
                      {PacienteService.getEstadosTratamiento().map((estado) => (
                        <MenuItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </MenuItem>
                      ))}
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
                    >
                      {PacienteService.getEstados().map((estado) => (
                        <MenuItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Observaciones de Tratamiento:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="observaciones_tratamiento"
                      value={formData.observaciones_tratamiento}
                      onChange={handleChange}
                      placeholder="Observaciones específicas del tratamiento..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Observaciones Generales:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      placeholder="Observaciones generales del paciente..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button 
                        variant="contained" 
                        type="submit" 
                        color="primary"
                        startIcon={editingId ? <Edit /> : <PersonAdd />}
                        size="large"
                        disabled={!formData.persona_id || !formData.tutor_id || !formData.fecha_ingreso}
                      >
                        {editingId ? 'Actualizar Paciente' : 'Registrar Paciente'}
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          resetForm();
                          setActiveTab(0);
                        }}
                        color="secondary"
                        size="large"
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </TabPanel>

          {/* Modal del Buscador de Personas */}
          <Dialog
            open={showPersonSelector}
            onClose={() => setShowPersonSelector(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Search sx={{ mr: 2 }} />
                Seleccionar Persona para Paciente
              </Box>
            </DialogTitle>
            <DialogContent>
              <BuscadorPersonas
                onPersonaSelect={handlePersonaSelect}
                showTutores={false}
                showPersonas={true}
                compact={true}
                maxHeight={400}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowPersonSelector(false)}>Cancelar</Button>
            </DialogActions>
          </Dialog>

          {/* Modal del Buscador de Tutores */}
          <Dialog
            open={showTutorSelector}
            onClose={() => setShowTutorSelector(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <FamilyRestroom sx={{ mr: 2 }} />
                Seleccionar Tutor para Paciente
              </Box>
            </DialogTitle>
            <DialogContent>
              <BuscadorPersonas
                onPersonaSelect={handleTutorSelect}
                showTutores={true}
                showPersonas={false}
                compact={true}
                maxHeight={400}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowTutorSelector(false)}>Cancelar</Button>
            </DialogActions>
          </Dialog>

          {/* Dialog de detalles */}
          <Dialog 
            open={detailDialog.open} 
            onClose={() => setDetailDialog({ open: false, data: null })}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <LocalHospital sx={{ mr: 2 }} />
                Detalles del Paciente
              </Box>
            </DialogTitle>
            <DialogContent>
              {detailDialog.data && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información Personal</Typography>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {PacienteService.getFullName(detailDialog.data)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cédula:</strong> {detailDialog.data.cedula}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Edad:</strong> {PacienteService.calculateAge(detailDialog.data.fecha_nacimiento)}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Phone fontSize="small" sx={{ mr: 1 }} />
                      {detailDialog.data.telefono || 'Sin teléfono'}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Email fontSize="small" sx={{ mr: 1 }} />
                      {detailDialog.data.correo || 'Sin email'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información del Tutor</Typography>
                    {(() => {
                      const tutorInfo = PacienteService.getTutorContactInfo(detailDialog.data);
                      return (
                        <Box>
                          <Typography variant="body2">
                            <strong>Nombre:</strong> {tutorInfo.nombre}
                          </Typography>
                          <Typography variant="body2" display="flex" alignItems="center">
                            <Phone fontSize="small" sx={{ mr: 1 }} />
                            {tutorInfo.telefono}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Parentesco:</strong> {tutorInfo.parentesco}
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Tratamiento</Typography>
                    <Typography variant="body2">
                      <strong>Especialidad:</strong> {detailDialog.data.especialidad_nombre || 'Sin especialidad'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fecha de ingreso:</strong> {PacienteService.formatDate(detailDialog.data.fecha_ingreso)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Inicio tratamiento:</strong> {PacienteService.formatDate(detailDialog.data.fecha_inicio_tratamiento)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fin tratamiento:</strong> {PacienteService.formatDate(detailDialog.data.fecha_fin_tratamiento)}
                    </Typography>
                    {detailDialog.data.fecha_inicio_tratamiento && (
                      <Typography variant="body2">
                        <strong>Tiempo en tratamiento:</strong> {PacienteService.calculateTiempoTratamiento(detailDialog.data.fecha_inicio_tratamiento, detailDialog.data.fecha_fin_tratamiento)}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Estado</Typography>
                    <Box mt={1}>
                      <Chip 
                        label={PacienteService.getEstadoInfo(detailDialog.data.estado).label} 
                        color={PacienteService.getEstadoInfo(detailDialog.data.estado).color}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={PacienteService.getEstadoTratamientoInfo(detailDialog.data.estado_tratamiento).label} 
                        color={PacienteService.getEstadoTratamientoInfo(detailDialog.data.estado_tratamiento).color}
                        size="small"
                      />
                    </Box>
                  </Grid>

                  {(detailDialog.data.observaciones_tratamiento || detailDialog.data.observaciones) && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="primary">Observaciones</Typography>
                      {detailDialog.data.observaciones_tratamiento && (
                        <Typography variant="body2">
                          <strong>Tratamiento:</strong> {detailDialog.data.observaciones_tratamiento}
                        </Typography>
                      )}
                      {detailDialog.data.observaciones && (
                        <Typography variant="body2">
                          <strong>Generales:</strong> {detailDialog.data.observaciones}
                        </Typography>
                      )}
                    </Grid>
                  )}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialog({ open: false, data: null })}>
                Cerrar
              </Button>
              {detailDialog.data && (
                <Button 
                  variant="contained" 
                  onClick={() => {
                    handleEdit(detailDialog.data);
                    setDetailDialog({ open: false, data: null });
                  }}
                  startIcon={<Edit />}
                >
                  Editar
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* Dialog de confirmación */}
          <ConfirmDialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ open: false, id: null })}
            onConfirm={confirmDelete}
            title="¿Eliminar paciente?"
            message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este paciente?"
            confirmText="Eliminar"
            confirmColor="error"
            severity="error"
          />

          {/* Notificaciones */}
          <CustomSnackbar
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={hideSnackbar}
          />
        </Container>
      </Box>
    </ErrorBoundary>
  );
};

export default PacienteModern;