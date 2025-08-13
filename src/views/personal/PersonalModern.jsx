// src/views/personal/PersonalModern.jsx
// Módulo de personal completamente refactorizado con buenas prácticas

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
  SupervisorAccount,
  PersonAdd,
  Edit,
  Delete,
  Visibility,
  Search,
  Person,
  Phone,
  Email,
  Work,
  Add,
  AccountBox
} from '@mui/icons-material';

// Servicios y hooks personalizados
import PersonalService from '../../services/personalService.js';
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

const PersonalModern = () => {
  // Estados principales
  const [personal, setPersonal] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados del formulario
  const [formData, setFormData] = useState({
    persona_id: '',
    titulo_profesional: '',
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
      const [personalData, personasData, especialidadesData] = await Promise.all([
        PersonalService.getAll().catch(() => []),
        PersonaService.getAll().catch(() => []),
        EspecialidadService.getAll().catch(() => [])
      ]);
      
      setPersonal(personalData);
      setPersonasDisponibles(personasData);
      setEspecialidades(especialidadesData);
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
    const backendData = PersonalService.formatForBackend(formData);
    const validation = PersonalService.validatePersonalData(backendData);
    
    // Verificar persona duplicada
    if (PersonalService.checkPersonaExists(personal, formData.persona_id, editingId)) {
      validation.errors.persona_id = 'Esta persona ya está registrada como personal';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = PersonalService.formatForBackend(formData);
      
      if (editingId) {
        await PersonalService.update(editingId, backendData);
        showSuccess('Personal actualizado correctamente');
      } else {
        await PersonalService.create(backendData);
        showSuccess('Personal registrado correctamente');
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
      titulo_profesional: '',
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
      titulo_profesional: item.titulo_profesional || '',
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
      await PersonalService.delete(confirmDialog.id);
      showSuccess('Personal eliminado correctamente');
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
  const filteredPersonal = PersonalService.filterPersonal(
    PersonalService.filterByArea(personal, filterArea),
    searchTerm
  );

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Cargando datos de personal..." fullHeight />;
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
              backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #4CAF50, #2196F3, #FF9800, #9C27B0)', 
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
                <SupervisorAccount sx={{ mr: 2 }} />
                Gestión de Personal
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
              <Tab label="Lista de Personal" icon={<SupervisorAccount />} />
              <Tab label={editingId ? "Editar Personal" : "Registrar Personal"} icon={<PersonAdd />} />
            </Tabs>
          </Paper>

          {/* Tab Panel 0 - Lista */}
          <TabPanel value={activeTab} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2} display="flex" alignItems="center">
                  <SupervisorAccount sx={{ mr: 1 }} />
                  Lista de Personal
                  <Chip 
                    label={`${filteredPersonal.length} empleado${filteredPersonal.length !== 1 ? 's' : ''}`} 
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
                      label="Buscar personal"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        )
                      }}
                      placeholder="Buscar por nombre, título profesional o especialidad"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Filtrar por área"
                      value={filterArea}
                      onChange={(e) => setFilterArea(e.target.value)}
                    >
                      <MenuItem value="">Todas las áreas</MenuItem>
                      {PersonalService.getUniqueAreas(personal).map((area) => (
                        <MenuItem key={area} value={area}>
                          {EspecialidadService.getAreaLabel(area)}
                        </MenuItem>
                      ))}
                    </TextField>
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
                      Nuevo Personal
                    </Button>
                  </Grid>
                </Grid>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Empleado</TableCell>
                      <TableCell>Título Profesional</TableCell>
                      <TableCell>Especialidades</TableCell>
                      <TableCell>Contacto</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPersonal
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => {
                        const estadoInfo = PersonalService.getEstadoInfo(item.estado);
                        const contactInfo = PersonalService.getContactInfo(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                                  <Person />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {PersonalService.getFullName(item)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.cedula}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {item.titulo_profesional}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box>
                                {item.especialidades && item.especialidades.length > 0 ? (
                                  item.especialidades.map((esp, index) => (
                                    <Chip 
                                      key={index}
                                      label={esp.nombre} 
                                      color={PersonalService.getEspecialidadColor(esp.area)}
                                      size="small"
                                      sx={{ mr: 0.5, mb: 0.5 }}
                                    />
                                  ))
                                ) : (
                                  <Typography variant="caption" color="text.secondary">
                                    Sin especialidades asignadas
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
                                  <Phone sx={{ fontSize: '14px', mr: 0.5 }} />
                                  {contactInfo.telefono}
                                </Typography>
                                <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem" color="text.secondary">
                                  <Email sx={{ fontSize: '14px', mr: 0.5 }} />
                                  {contactInfo.correo}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={estadoInfo.label} 
                                color={estadoInfo.color}
                                size="small"
                              />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Desde: {PersonalService.formatDate(item.fecha_creacion)}
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
                  count={filteredPersonal.length}
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
                {editingId ? 'Editar Personal' : 'Registrar Nuevo Personal'}
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

                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Título Profesional: *</Typography>
                    <TextField
                      fullWidth
                      name="titulo_profesional"
                      value={formData.titulo_profesional}
                      onChange={handleChange}
                      error={!!errors.titulo_profesional}
                      helperText={errors.titulo_profesional}
                      placeholder="Ej: Licenciado en Psicología, Doctor en Medicina, etc."
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
                      <MenuItem value="activo">Activo</MenuItem>
                      <MenuItem value="inactivo">Inactivo</MenuItem>
                    </TextField>
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
                        disabled={!formData.persona_id || !formData.titulo_profesional}
                      >
                        {editingId ? 'Actualizar Personal' : 'Registrar Personal'}
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
                Seleccionar Persona para Personal
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
                <SupervisorAccount sx={{ mr: 2 }} />
                Detalles del Personal
              </Box>
            </DialogTitle>
            <DialogContent>
              {detailDialog.data && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información Personal</Typography>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {PersonalService.getFullName(detailDialog.data)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cédula:</strong> {detailDialog.data.cedula}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Título:</strong> {detailDialog.data.titulo_profesional}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Phone fontSize="small" sx={{ mr: 1 }} />
                      {PersonalService.getContactInfo(detailDialog.data).telefono}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Email fontSize="small" sx={{ mr: 1 }} />
                      {PersonalService.getContactInfo(detailDialog.data).correo}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Especialidades Asignadas</Typography>
                    {detailDialog.data.especialidades && detailDialog.data.especialidades.length > 0 ? (
                      <Box>
                        {detailDialog.data.especialidades.map((esp, index) => (
                          <Box key={index} sx={{ mb: 1 }}>
                            <Chip 
                              label={esp.nombre} 
                              color={PersonalService.getEspecialidadColor(esp.area)}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Área: {EspecialidadService.getAreaLabel(esp.area)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin especialidades asignadas
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
                    <Typography variant="body2">
                      <strong>Fecha de creación:</strong> {PersonalService.formatDate(detailDialog.data.fecha_creacion)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fecha de modificación:</strong> {PersonalService.formatDate(detailDialog.data.fecha_modificacion)}
                    </Typography>
                    <Box mt={1}>
                      <Chip 
                        label={PersonalService.getEstadoInfo(detailDialog.data.estado).label} 
                        color={PersonalService.getEstadoInfo(detailDialog.data.estado).color}
                        size="small"
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información de Usuario</Typography>
                    {detailDialog.data.usuario_id ? (
                      <Box>
                        <Typography variant="body2">
                          <strong>Usuario del sistema:</strong> {detailDialog.data.nombre_usuario || 'Sí'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Rol:</strong> {detailDialog.data.rol_usuario || 'N/A'}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No tiene usuario del sistema asignado
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialog({ open: false, data: null })}>
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog de confirmación */}
          <ConfirmDialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ open: false, id: null })}
            onConfirm={confirmDelete}
            title="¿Eliminar personal?"
            message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este miembro del personal?"
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

export default PersonalModern;