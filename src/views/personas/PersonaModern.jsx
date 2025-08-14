// src/views/personas/PersonaModern.jsx
// Módulo de personas completamente refactorizado con buenas prácticas

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
  Tooltip
} from '@mui/material';
import {
  Person,
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Email,
  Phone,
  LocationOn,
  CalendarToday
} from '@mui/icons-material';

// Servicios y hooks personalizados
import PersonaService from '../../services/personaService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';

// Componentes reutilizables
import CustomSnackbar from '../../components/shared/CustomSnackbar.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/shared/ConfirmDialog.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const PersonaModern = () => {
  // Estados principales
  const [personas, setPersonas] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    fecha_nacimiento: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: 'activo'
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  // Estados de UI
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  // Hooks personalizados
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  // Efectos
  useEffect(() => {
    if (requireAuth()) {
      fetchPersonas();
    }
  }, []);

  // Funciones de API
  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const data = await PersonaService.getAll();
      setPersonas(data);
    } catch (error) {
      showError(error.message);
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
    const backendData = PersonaService.formatForBackend(formData);
    const validation = PersonaService.validatePersonaData(backendData);
    
    // Verificar cédula duplicada
    if (PersonaService.checkCedulaExists(personas, formData.cedula, editingId)) {
      validation.errors.cedula = 'Esta cédula ya está registrada';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = PersonaService.formatForBackend(formData);
      
      if (editingId) {
        await PersonaService.update(editingId, backendData);
        showSuccess('Persona actualizada correctamente');
      } else {
        await PersonaService.create(backendData);
        showSuccess('Persona creada correctamente');
      }
      
      resetForm();
      fetchPersonas();
      setActiveTab(0);
    } catch (error) {
      showError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      fecha_nacimiento: '',
      telefono: '',
      correo: '',
      direccion: '',
      estado: 'activo'
    });
    setEditingId(null);
    setErrors({});
  };

  // Manejadores de acciones
  const handleEdit = (item) => {
    setFormData({
      nombre: item.nombre,
      apellido: item.apellido,
      cedula: item.cedula,
      fecha_nacimiento: item.fecha_nacimiento || '',
      telefono: item.telefono || '',
      correo: item.correo || '',
      direccion: item.direccion || '',
      estado: item.estado
    });
    setEditingId(item.id);
    setActiveTab(1);
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await PersonaService.delete(confirmDialog.id);
      showSuccess('Persona eliminada correctamente');
      fetchPersonas();
    } catch (error) {
      showError(error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  // Datos filtrados
  let filteredPersonas = PersonaService.filterPersonas(personas, searchTerm);
  filteredPersonas = PersonaService.filterByEstado(filteredPersonas, filterEstado);

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Cargando personas..." fullHeight />;
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
              backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #2196F3, #4CAF50, #FF9800, #9C27B0)', 
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
                <Person sx={{ mr: 2 }} />
                Gestión de Personas
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
              <Tab label="Lista de Personas" icon={<Person />} />
              <Tab label={editingId ? "Editar Persona" : "Nueva Persona"} icon={<Add />} />
            </Tabs>
          </Paper>

          {/* Tab Panel 0 - Lista */}
          <TabPanel value={activeTab} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2} display="flex" alignItems="center">
                  <Person sx={{ mr: 1 }} />
                  Lista de Personas
                  <Chip 
                    label={`${filteredPersonas.length} persona${filteredPersonas.length !== 1 ? 's' : ''}`} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 2 }}
                  />
                </Typography>
                
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Buscar personas"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        )
                      }}
                      placeholder="Buscar por nombre, apellido, cédula..."
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Filtrar por estado"
                      value={filterEstado}
                      onChange={(e) => setFilterEstado(e.target.value)}
                    >
                      <MenuItem value="">Todos los estados</MenuItem>
                      {PersonaService.getEstados().map((estado) => (
                        <MenuItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => {
                        resetForm();
                        setActiveTab(1);
                      }}
                      sx={{ height: '40px' }}
                    >
                      Nueva Persona
                    </Button>
                  </Grid>
                </Grid>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Persona</TableCell>
                      <TableCell>Contacto</TableCell>
                      <TableCell>Ubicación</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPersonas
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => {
                        const estadoInfo = PersonaService.getEstadoInfo(item.estado);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                                  <Person />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {PersonaService.getFullName(item)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.cedula} • Edad: {PersonaService.calculateAge(item.fecha_nacimiento)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
                                  <Phone sx={{ fontSize: '14px', mr: 0.5 }} />
                                  {item.telefono || 'Sin teléfono'}
                                </Typography>
                                <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem" color="text.secondary">
                                  <Email sx={{ fontSize: '14px', mr: 0.5 }} />
                                  {item.correo || 'Sin email'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
                                <LocationOn sx={{ fontSize: '14px', mr: 0.5 }} />
                                {item.direccion || 'Sin dirección'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={estadoInfo.label} 
                                color={estadoInfo.color}
                                size="small"
                              />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Desde: {PersonaService.formatDate(item.fecha_creacion)}
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
                  count={filteredPersonas.length}
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
            <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
                {editingId ? 'Editar Persona' : 'Registrar Nueva Persona'}
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Información Personal
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Nombre: *</Typography>
                    <TextField
                      fullWidth
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      error={!!errors.nombre}
                      helperText={errors.nombre}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Apellido: *</Typography>
                    <TextField
                      fullWidth
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      error={!!errors.apellido}
                      helperText={errors.apellido}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Cédula: *</Typography>
                    <TextField
                      fullWidth
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      error={!!errors.cedula}
                      helperText={errors.cedula}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Fecha de Nacimiento:</Typography>
                    <TextField
                      fullWidth
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      error={!!errors.fecha_nacimiento}
                      helperText={errors.fecha_nacimiento}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                      Información de Contacto
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Teléfono:</Typography>
                    <TextField
                      fullWidth
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      error={!!errors.telefono}
                      helperText={errors.telefono}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Correo Electrónico:</Typography>
                    <TextField
                      fullWidth
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      error={!!errors.correo}
                      helperText={errors.correo}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Dirección:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      error={!!errors.direccion}
                      helperText={errors.direccion}
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
                      {PersonaService.getEstados().map((estado) => (
                        <MenuItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button 
                        variant="contained" 
                        type="submit" 
                        color="primary"
                        startIcon={editingId ? <Edit /> : <Add />}
                        size="large"
                        disabled={!formData.nombre || !formData.apellido || !formData.cedula}
                      >
                        {editingId ? 'Actualizar Persona' : 'Crear Persona'}
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

          {/* Dialog de detalles */}
          <Dialog 
            open={detailDialog.open} 
            onClose={() => setDetailDialog({ open: false, data: null })}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Person sx={{ mr: 2 }} />
                Detalles de la Persona
              </Box>
            </DialogTitle>
            <DialogContent>
              {detailDialog.data && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información Personal</Typography>
                    <Typography variant="body2">
                      <strong>Nombre completo:</strong> {PersonaService.getFullName(detailDialog.data)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cédula:</strong> {detailDialog.data.cedula}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Edad:</strong> {PersonaService.calculateAge(detailDialog.data.fecha_nacimiento)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información de Contacto</Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Phone fontSize="small" sx={{ mr: 1 }} />
                      {detailDialog.data.telefono || 'Sin teléfono'}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Email fontSize="small" sx={{ mr: 1 }} />
                      {detailDialog.data.correo || 'Sin correo'}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <LocationOn fontSize="small" sx={{ mr: 1 }} />
                      {detailDialog.data.direccion || 'Sin dirección'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
                    <Typography variant="body2">
                      <strong>Estado:</strong> 
                      <Chip 
                        label={PersonaService.getEstadoInfo(detailDialog.data.estado).label} 
                        color={PersonaService.getEstadoInfo(detailDialog.data.estado).color}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fecha de creación:</strong> {PersonaService.formatDate(detailDialog.data.fecha_creacion)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Última modificación:</strong> {PersonaService.formatDate(detailDialog.data.fecha_modificacion)}
                    </Typography>
                  </Grid>
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
            title="¿Eliminar persona?"
            message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta persona?"
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

export default PersonaModern;