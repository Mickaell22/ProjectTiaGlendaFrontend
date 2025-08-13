// src/views/pacientes/TutorModern.jsx
// Módulo de tutores completamente refactorizado con buenas prácticas

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
  Select,
  Autocomplete
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
  FamilyRestroom,
  Work,
  Home,
  ContactEmergency,
  Business,
  Add,
  AccountBox,
  Assignment,
  LocationOn
} from '@mui/icons-material';

// Servicios y hooks personalizados
import TutorService from '../../services/tutorService.js';
import PersonaService from '../../services/personaService.js';
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

const TutorModern = () => {
  // Estados principales
  const [tutores, setTutores] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterParentesco, setFilterParentesco] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados del formulario
  const [formData, setFormData] = useState({
    persona_id: '',
    parentesco: '',
    telefono_emergencia: '',
    direccion_trabajo: '',
    empresa_trabajo: '',
    cargo_trabajo: '',
    observaciones: '',
    estado: 'activo'
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPersonSelector, setShowPersonSelector] = useState(false);

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
      const [tutoresData, personasData] = await Promise.all([
        TutorService.getAll().catch(() => []),
        PersonaService.getAll().catch(() => [])
      ]);
      
      setTutores(tutoresData);
      setPersonasDisponibles(personasData);
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
    const backendData = TutorService.formatForBackend(formData);
    const validation = TutorService.validateTutorData(backendData);
    
    // Verificar persona duplicada
    if (TutorService.checkPersonaExists(tutores, formData.persona_id, editingId)) {
      validation.errors.persona_id = 'Esta persona ya está registrada como tutor';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = TutorService.formatForBackend(formData);
      
      if (editingId) {
        await TutorService.update(editingId, backendData);
        showSuccess('Tutor actualizado correctamente');
      } else {
        await TutorService.create(backendData);
        showSuccess('Tutor registrado correctamente');
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
      parentesco: '',
      telefono_emergencia: '',
      direccion_trabajo: '',
      empresa_trabajo: '',
      cargo_trabajo: '',
      observaciones: '',
      estado: 'activo'
    });
    setEditingId(null);
    setErrors({});
    setSelectedPerson(null);
    setShowPersonSelector(false);
  };

  // Manejadores de acciones
  const handleEdit = (item) => {
    setFormData({
      persona_id: item.persona_id,
      parentesco: item.parentesco || '',
      telefono_emergencia: item.telefono_emergencia || '',
      direccion_trabajo: item.direccion_trabajo || '',
      empresa_trabajo: item.empresa_trabajo || '',
      cargo_trabajo: item.cargo_trabajo || '',
      observaciones: item.observaciones || '',
      estado: item.estado
    });
    
    // Encontrar la persona seleccionada
    const persona = personasDisponibles.find(p => p.id === item.persona_id);
    if (persona) {
      setSelectedPerson(persona);
    }
    
    setEditingId(item.id);
    setActiveTab(1);
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await TutorService.delete(confirmDialog.id);
      showSuccess('Tutor eliminado correctamente');
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

  // Datos filtrados
  let filteredTutores = TutorService.filterTutores(tutores, searchTerm);
  filteredTutores = TutorService.filterByEstado(filteredTutores, filterEstado);
  filteredTutores = TutorService.filterByParentesco(filteredTutores, filterParentesco);

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Cargando datos de tutores..." fullHeight />;
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
              backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #FF5722, #4CAF50, #2196F3, #9C27B0)', 
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
                <FamilyRestroom sx={{ mr: 2 }} />
                Gestión de Tutores
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
              <Tab label="Lista de Tutores" icon={<FamilyRestroom />} />
              <Tab label={editingId ? "Editar Tutor" : "Nuevo Tutor"} icon={<PersonAdd />} />
            </Tabs>
          </Paper>

          {/* Tab Panel 0 - Lista */}
          <TabPanel value={activeTab} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2} display="flex" alignItems="center">
                  <FamilyRestroom sx={{ mr: 1 }} />
                  Lista de Tutores
                  <Chip 
                    label={`${filteredTutores.length} tutor${filteredTutores.length !== 1 ? 'es' : ''}`} 
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
                      label="Buscar tutores"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        )
                      }}
                      placeholder="Buscar por nombre, parentesco, empresa..."
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
                        {TutorService.getEstados().map((estado) => (
                          <MenuItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Autocomplete
                      size="small"
                      options={['padre', 'madre', 'abuelo', 'abuela', 'tio', 'tia', 'hermano', 'hermana', 'tutor_legal', 'cuidador']}
                      value={filterParentesco}
                      onChange={(e, value) => setFilterParentesco(value || '')}
                      renderInput={(params) => (
                        <TextField {...params} label="Parentesco" />
                      )}
                    />
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
                      Nuevo Tutor
                    </Button>
                  </Grid>
                </Grid>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tutor</TableCell>
                      <TableCell>Parentesco</TableCell>
                      <TableCell>Contacto</TableCell>
                      <TableCell>Información Laboral</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTutores
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => {
                        const estadoInfo = TutorService.getEstadoInfo(item.estado);
                        const contactInfo = TutorService.getContactInfo(item);
                        const laboralInfo = TutorService.getLaboralInfo(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: 'secondary.light' }}>
                                  <Person />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {TutorService.getFullName(item)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.cedula} • Edad: {TutorService.calculateAge(item.fecha_nacimiento)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={TutorService.formatParentesco(item.parentesco)} 
                                color={TutorService.getParentescoColor(item.parentesco)}
                                size="small"
                                icon={<FamilyRestroom />}
                              />
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
                                  <Phone sx={{ fontSize: '14px', mr: 0.5 }} />
                                  {contactInfo.telefono}
                                </Typography>
                                {item.telefono_emergencia && (
                                  <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem" color="error.main">
                                    <ContactEmergency sx={{ fontSize: '14px', mr: 0.5 }} />
                                    {contactInfo.telefonoEmergencia}
                                  </Typography>
                                )}
                                <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem" color="text.secondary">
                                  <Email sx={{ fontSize: '14px', mr: 0.5 }} />
                                  {contactInfo.correo}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                {item.empresa_trabajo ? (
                                  <>
                                    <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
                                      <Business sx={{ fontSize: '14px', mr: 0.5 }} />
                                      {laboralInfo.empresa}
                                    </Typography>
                                    <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem" color="text.secondary">
                                      <Work sx={{ fontSize: '14px', mr: 0.5 }} />
                                      {laboralInfo.cargo}
                                    </Typography>
                                  </>
                                ) : (
                                  <Typography variant="caption" color="text.secondary">
                                    Sin información laboral
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
                                Desde: {TutorService.formatDate(item.fecha_creacion)}
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
                  count={filteredTutores.length}
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
            <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 900, mx: 'auto' }}>
              <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
                {editingId ? 'Editar Tutor' : 'Registrar Nuevo Tutor'}
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Información Personal */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                      <AccountBox sx={{ mr: 1 }} />
                      Información Personal
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12}>
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
                              Cédula: {selectedPerson.cedula} • Teléfono: {selectedPerson.telefono || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Email: {selectedPerson.correo || 'N/A'}
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
                    <Typography variant="body1" mb={1}>Parentesco: *</Typography>
                    <Autocomplete
                      options={TutorService.getParentescosComunes()}
                      getOptionLabel={(option) => option.label}
                      value={TutorService.getParentescosComunes().find(p => p.value === formData.parentesco) || null}
                      onChange={(e, value) => {
                        setFormData(prev => ({ ...prev, parentesco: value?.value || '' }));
                        if (errors.parentesco) {
                          setErrors(prev => ({ ...prev, parentesco: '' }));
                        }
                      }}
                      freeSolo
                      onInputChange={(e, value) => {
                        if (typeof value === 'string') {
                          setFormData(prev => ({ ...prev, parentesco: value }));
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errors.parentesco}
                          helperText={errors.parentesco}
                          placeholder="Seleccione o escriba el parentesco"
                        />
                      )}
                    />
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
                      {TutorService.getEstados().map((estado) => (
                        <MenuItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Información de Contacto */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center" sx={{ mt: 2 }}>
                      <ContactEmergency sx={{ mr: 1 }} />
                      Información de Contacto de Emergencia
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Teléfono de Emergencia:</Typography>
                    <TextField
                      fullWidth
                      name="telefono_emergencia"
                      value={formData.telefono_emergencia}
                      onChange={handleChange}
                      error={!!errors.telefono_emergencia}
                      helperText={errors.telefono_emergencia}
                      placeholder="Ej: 0987654321"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ContactEmergency />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  {/* Información Laboral */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center" sx={{ mt: 2 }}>
                      <Work sx={{ mr: 1 }} />
                      Información Laboral (Opcional)
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Empresa:</Typography>
                    <TextField
                      fullWidth
                      name="empresa_trabajo"
                      value={formData.empresa_trabajo}
                      onChange={handleChange}
                      placeholder="Nombre de la empresa"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Cargo:</Typography>
                    <TextField
                      fullWidth
                      name="cargo_trabajo"
                      value={formData.cargo_trabajo}
                      onChange={handleChange}
                      placeholder="Cargo o posición"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Assignment />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Dirección de Trabajo:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      name="direccion_trabajo"
                      value={formData.direccion_trabajo}
                      onChange={handleChange}
                      error={!!errors.direccion_trabajo}
                      helperText={errors.direccion_trabajo}
                      placeholder="Dirección completa del lugar de trabajo"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Observaciones:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      placeholder="Observaciones adicionales sobre el tutor..."
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
                        disabled={!formData.persona_id || !formData.parentesco}
                      >
                        {editingId ? 'Actualizar Tutor' : 'Registrar Tutor'}
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
                Seleccionar Persona para Tutor
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

          {/* Dialog de detalles */}
          <Dialog 
            open={detailDialog.open} 
            onClose={() => setDetailDialog({ open: false, data: null })}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <FamilyRestroom sx={{ mr: 2 }} />
                Detalles del Tutor
              </Box>
            </DialogTitle>
            <DialogContent>
              {detailDialog.data && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información Personal</Typography>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {TutorService.getFullName(detailDialog.data)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cédula:</strong> {detailDialog.data.cedula}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Edad:</strong> {TutorService.calculateAge(detailDialog.data.fecha_nacimiento)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Parentesco:</strong> 
                      <Chip 
                        label={TutorService.formatParentesco(detailDialog.data.parentesco)} 
                        color={TutorService.getParentescoColor(detailDialog.data.parentesco)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información de Contacto</Typography>
                    {(() => {
                      const contactInfo = TutorService.getContactInfo(detailDialog.data);
                      return (
                        <Box>
                          <Typography variant="body2" display="flex" alignItems="center">
                            <Phone fontSize="small" sx={{ mr: 1 }} />
                            {contactInfo.telefono}
                          </Typography>
                          <Typography variant="body2" display="flex" alignItems="center">
                            <ContactEmergency fontSize="small" sx={{ mr: 1 }} />
                            {contactInfo.telefonoEmergencia}
                          </Typography>
                          <Typography variant="body2" display="flex" alignItems="center">
                            <Email fontSize="small" sx={{ mr: 1 }} />
                            {contactInfo.correo}
                          </Typography>
                          <Typography variant="body2" display="flex" alignItems="center">
                            <Home fontSize="small" sx={{ mr: 1 }} />
                            {contactInfo.direccion}
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información Laboral</Typography>
                    {(() => {
                      const laboralInfo = TutorService.getLaboralInfo(detailDialog.data);
                      return (
                        <Box>
                          <Typography variant="body2" display="flex" alignItems="center">
                            <Business fontSize="small" sx={{ mr: 1 }} />
                            {laboralInfo.empresa}
                          </Typography>
                          <Typography variant="body2" display="flex" alignItems="center">
                            <Work fontSize="small" sx={{ mr: 1 }} />
                            {laboralInfo.cargo}
                          </Typography>
                          <Typography variant="body2" display="flex" alignItems="center">
                            <LocationOn fontSize="small" sx={{ mr: 1 }} />
                            {laboralInfo.direccionTrabajo}
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
                    <Typography variant="body2">
                      <strong>Estado:</strong> 
                      <Chip 
                        label={TutorService.getEstadoInfo(detailDialog.data.estado).label} 
                        color={TutorService.getEstadoInfo(detailDialog.data.estado).color}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fecha de creación:</strong> {TutorService.formatDate(detailDialog.data.fecha_creacion)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Última modificación:</strong> {TutorService.formatDate(detailDialog.data.fecha_modificacion)}
                    </Typography>
                  </Grid>

                  {detailDialog.data.observaciones && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="primary">Observaciones</Typography>
                      <Typography variant="body2">
                        {detailDialog.data.observaciones}
                      </Typography>
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
            title="¿Eliminar tutor?"
            message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este tutor?"
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

export default TutorModern;