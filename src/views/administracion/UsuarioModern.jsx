// src/views/administracion/UsuarioModern.jsx
// Módulo de usuarios completamente refactorizado con buenas prácticas

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
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText
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
  AdminPanelSettings,
  Security,
  VpnKey,
  Add,
  AccountBox,
  SupervisorAccount,
  Visibility as VisibilityIcon,
  VisibilityOff,
  Key,
  AccessTime,
  Psychology,
  School
} from '@mui/icons-material';

// Servicios y hooks personalizados
import UsuarioService from '../../services/usuarioService.js';
import PersonaService from '../../services/personaService.js';
import ApiService, { extractData } from '../../services/apiService.js';
import { API_ENDPOINTS } from '../../config/api.js';
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

const UsuarioModern = () => {
  // Estados principales
  const [usuarios, setUsuarios] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados del formulario
  const [formData, setFormData] = useState({
    persona_id: '',
    nombre_usuario: '',
    contrasenia: '',
    rol_id: '',
    estado: 'activo'
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados de cambio de contraseña
  const [passwordDialog, setPasswordDialog] = useState({ open: false, userId: null });
  const [passwordData, setPasswordData] = useState({
    nueva_contrasenia: '',
    confirmar_contrasenia: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  useEffect(() => {
    // Auto-generar nombre de usuario cuando se selecciona una persona
    if (selectedPerson && !editingId) {
      const sugerencia = UsuarioService.generateUsernameFromName(
        selectedPerson.nombre, 
        selectedPerson.apellido
      );
      setFormData(prev => ({ ...prev, nombre_usuario: sugerencia }));
    }
  }, [selectedPerson, editingId]);

  // Funciones de API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usuariosData, personasData] = await Promise.all([
        UsuarioService.getAll(),
        PersonaService.getAll()
      ]);
      
      setUsuarios(usuariosData);
      setPersonasDisponibles(personasData);
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
    const backendData = UsuarioService.formatForBackend(formData);
    const validation = UsuarioService.validateUsuarioData(backendData);
    
    // Verificar nombre de usuario duplicado
    if (UsuarioService.checkNombreUsuarioExists(usuarios, formData.nombre_usuario, editingId)) {
      validation.errors.nombre_usuario = 'Este nombre de usuario ya existe';
      validation.isValid = false;
    }

    // Verificar persona duplicada
    if (UsuarioService.checkPersonaExists(usuarios, formData.persona_id, editingId)) {
      validation.errors.persona_id = 'Esta persona ya tiene un usuario asignado';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = UsuarioService.formatForBackend(formData);
      
      if (editingId) {
        // En edición, no enviamos la contraseña a menos que sea nueva
        const { contrasenia, ...updateData } = backendData;
        await UsuarioService.update(editingId, updateData);
        showSuccess('Usuario actualizado correctamente');
      } else {
        await UsuarioService.create(backendData);
        showSuccess('Usuario creado correctamente');
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
      nombre_usuario: '',
      contrasenia: '',
      rol_id: '',
      estado: 'activo'
    });
    setEditingId(null);
    setErrors({});
    setSelectedPerson(null);
    setShowPersonSelector(false);
    setShowPassword(false);
  };

  // Manejadores de acciones
  const handleEdit = (item) => {
    setFormData({
      persona_id: item.persona_id,
      nombre_usuario: item.nombre_usuario,
      contrasenia: '', // No mostrar contraseña existente
      rol_id: item.rol_id,
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
      await UsuarioService.delete(confirmDialog.id);
      showSuccess('Usuario eliminado correctamente');
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

  // Manejadores de cambio de contraseña
  const handleChangePassword = (userId) => {
    setPasswordDialog({ open: true, userId });
    setPasswordData({ nueva_contrasenia: '', confirmar_contrasenia: '' });
    setPasswordErrors({});
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordSubmit = async () => {
    const validation = UsuarioService.validatePasswordChange(passwordData);
    
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      return;
    }

    try {
      const backendData = UsuarioService.formatPasswordChangeForBackend(passwordData);
      await UsuarioService.changePassword(passwordDialog.userId, backendData);
      showSuccess('Contraseña cambiada correctamente');
      setPasswordDialog({ open: false, userId: null });
      setPasswordData({ nueva_contrasenia: '', confirmar_contrasenia: '' });
    } catch (error) {
      showError(error.message);
    }
  };

  // Datos filtrados
  let filteredUsuarios = UsuarioService.filterUsuarios(usuarios, searchTerm);
  filteredUsuarios = UsuarioService.filterByEstado(filteredUsuarios, filterEstado);
  filteredUsuarios = UsuarioService.filterByRol(filteredUsuarios, filterRol);

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Cargando datos de usuarios..." fullHeight />;
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
              backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #673AB7, #E91E63, #FF9800, #4CAF50)', 
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
                <AdminPanelSettings sx={{ mr: 2 }} />
                Gestión de Usuarios del Sistema
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
              <Tab label="Lista de Usuarios" icon={<AdminPanelSettings />} />
              <Tab label={editingId ? "Editar Usuario" : "Nuevo Usuario"} icon={<PersonAdd />} />
            </Tabs>
          </Paper>

          {/* Tab Panel 0 - Lista */}
          <TabPanel value={activeTab} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2} display="flex" alignItems="center">
                  <AdminPanelSettings sx={{ mr: 1 }} />
                  Lista de Usuarios
                  <Chip 
                    label={`${filteredUsuarios.length} usuario${filteredUsuarios.length !== 1 ? 's' : ''}`} 
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
                      label="Buscar usuarios"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        )
                      }}
                      placeholder="Buscar por nombre, usuario, rol..."
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
                        {UsuarioService.getEstados().map((estado) => (
                          <MenuItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Rol</InputLabel>
                      <Select
                        value={filterRol}
                        onChange={(e) => setFilterRol(e.target.value)}
                        label="Rol"
                      >
                        <MenuItem value="">Todos los roles</MenuItem>
                        {UsuarioService.getRoles().map((rol) => (
                          <MenuItem key={rol.value} value={rol.value}>
                            {rol.label}
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
                      Nuevo Usuario
                    </Button>
                  </Grid>
                </Grid>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Nombre de Usuario</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Último Acceso</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsuarios
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => {
                        const estadoInfo = UsuarioService.getEstadoInfo(item.estado);
                        const contactInfo = UsuarioService.getContactInfo(item);
                        const securityInfo = UsuarioService.getSecurityInfo(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                                  <Person />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {UsuarioService.getFullName(item)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                                    <Phone sx={{ fontSize: '12px', mr: 0.5 }} />
                                    {contactInfo.telefono}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                                    <Email sx={{ fontSize: '12px', mr: 0.5 }} />
                                    {contactInfo.correo}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {item.nombre_usuario}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {item.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const rolInfo = UsuarioService.getRolInfo(item.rol_nombre || item.rol);
                                return (
                                  <Chip 
                                    label={rolInfo.label} 
                                    color={rolInfo.color}
                                    size="small"
                                    icon={rolInfo.icon === 'AdminPanelSettings' ? <AdminPanelSettings /> :
                                          rolInfo.icon === 'SupervisorAccount' ? <SupervisorAccount /> :
                                          rolInfo.icon === 'Psychology' ? <Psychology /> :
                                          rolInfo.icon === 'School' ? <School /> :
                                          <Person />}
                                  />
                                );
                              })()}
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
                                  <AccessTime sx={{ fontSize: '14px', mr: 0.5 }} />
                                  {securityInfo.tiempoUltimoAcceso}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {securityInfo.ultimoAcceso}
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
                                Creado: {securityInfo.fechaCreacion}
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
                                <Tooltip title="Cambiar contraseña">
                                  <IconButton 
                                    color="warning" 
                                    size="small"
                                    onClick={() => handleChangePassword(item.id)}
                                  >
                                    <VpnKey />
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
                  count={filteredUsuarios.length}
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
                {editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario del Sistema'}
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
                              setFormData(prev => ({ ...prev, persona_id: '', nombre_usuario: '' }));
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

                  {/* Información de Usuario */}
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center" sx={{ mt: 2 }}>
                      <Security sx={{ mr: 1 }} />
                      Información de Usuario
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Nombre de Usuario: *</Typography>
                    <TextField
                      fullWidth
                      name="nombre_usuario"
                      value={formData.nombre_usuario}
                      onChange={handleChange}
                      error={!!errors.nombre_usuario}
                      helperText={errors.nombre_usuario || "Solo letras, números y guiones bajos"}
                      placeholder="usuario123"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Rol: *</Typography>
                    <TextField
                      select
                      fullWidth
                      name="rol"
                      value={formData.rol}
                      onChange={handleChange}
                      error={!!errors.rol}
                      helperText={errors.rol}
                    >
                      <MenuItem value="">Seleccione un rol</MenuItem>
                      {UsuarioService.getRoles().map((rol) => (
                        <MenuItem key={rol.value} value={rol.value}>
                          <Box display="flex" alignItems="center">
                            {rol.icon === 'AdminPanelSettings' ? <AdminPanelSettings sx={{ mr: 1 }} /> :
                             rol.icon === 'SupervisorAccount' ? <SupervisorAccount sx={{ mr: 1 }} /> :
                             rol.icon === 'Psychology' ? <Psychology sx={{ mr: 1 }} /> :
                             rol.icon === 'School' ? <School sx={{ mr: 1 }} /> :
                             <Person sx={{ mr: 1 }} />}
                            <Typography variant="body2">{rol.label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {!editingId && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1" mb={1}>Contraseña: *</Typography>
                      <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        name="contrasenia"
                        value={formData.contrasenia}
                        onChange={handleChange}
                        error={!!errors.contrasenia}
                        helperText={errors.contrasenia}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      {formData.contrasenia && (
                        <Box mt={1}>
                          {(() => {
                            const strength = UsuarioService.validatePasswordStrength(formData.contrasenia);
                            return (
                              <Box>
                                <Box display="flex" alignItems="center" mb={1}>
                                  <Typography variant="caption" sx={{ mr: 1 }}>
                                    Fortaleza:
                                  </Typography>
                                  <Chip 
                                    label={strength.strength} 
                                    color={strength.color}
                                    size="small"
                                  />
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={(strength.score / 5) * 100}
                                  color={strength.color}
                                  sx={{ mb: 1 }}
                                />
                                {strength.suggestions.length > 0 && (
                                  <Alert severity="info" sx={{ mt: 1 }}>
                                    <Typography variant="caption">Sugerencias:</Typography>
                                    <List dense>
                                      {strength.suggestions.map((suggestion, index) => (
                                        <ListItem key={index} sx={{ py: 0 }}>
                                          <ListItemText 
                                            primary={`• ${suggestion}`}
                                            primaryTypographyProps={{ variant: 'caption' }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Alert>
                                )}
                              </Box>
                            );
                          })()}
                        </Box>
                      )}
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Estado:</Typography>
                    <TextField
                      select
                      fullWidth
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                    >
                      {UsuarioService.getEstados().map((estado) => (
                        <MenuItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {editingId && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Nota:</strong> Para cambiar la contraseña, use el botón "Cambiar Contraseña" en la lista de usuarios.
                        </Typography>
                      </Alert>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button 
                        variant="contained" 
                        type="submit" 
                        color="primary"
                        startIcon={editingId ? <Edit /> : <PersonAdd />}
                        size="large"
                        disabled={!formData.persona_id || !formData.nombre_usuario || !formData.rol_id || (!editingId && !formData.contrasenia)}
                      >
                        {editingId ? 'Actualizar Usuario' : 'Crear Usuario'}
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
                Seleccionar Persona para Usuario
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

          {/* Dialog de cambio de contraseña */}
          <Dialog
            open={passwordDialog.open}
            onClose={() => setPasswordDialog({ open: false, userId: null })}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Key sx={{ mr: 2 }} />
                Cambiar Contraseña
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showNewPassword ? 'text' : 'password'}
                    label="Nueva Contraseña"
                    name="nueva_contrasenia"
                    value={passwordData.nueva_contrasenia}
                    onChange={handlePasswordChange}
                    error={!!passwordErrors.nueva_contrasenia}
                    helperText={passwordErrors.nueva_contrasenia}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirmar Nueva Contraseña"
                    name="confirmar_contrasenia"
                    value={passwordData.confirmar_contrasenia}
                    onChange={handlePasswordChange}
                    error={!!passwordErrors.confirmar_contrasenia}
                    helperText={passwordErrors.confirmar_contrasenia}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                {passwordData.nueva_contrasenia && (
                  <Grid item xs={12}>
                    {(() => {
                      const strength = UsuarioService.validatePasswordStrength(passwordData.nueva_contrasenia);
                      return (
                        <Box>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="caption" sx={{ mr: 1 }}>
                              Fortaleza:
                            </Typography>
                            <Chip 
                              label={strength.strength} 
                              color={strength.color}
                              size="small"
                            />
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(strength.score / 5) * 100}
                            color={strength.color}
                          />
                        </Box>
                      );
                    })()}
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPasswordDialog({ open: false, userId: null })}>
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                onClick={handlePasswordSubmit}
                disabled={!passwordData.nueva_contrasenia || !passwordData.confirmar_contrasenia}
              >
                Cambiar Contraseña
              </Button>
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
                <AdminPanelSettings sx={{ mr: 2 }} />
                Detalles del Usuario
              </Box>
            </DialogTitle>
            <DialogContent>
              {detailDialog.data && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información Personal</Typography>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {UsuarioService.getFullName(detailDialog.data)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cédula:</strong> {detailDialog.data.cedula}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Phone fontSize="small" sx={{ mr: 1 }} />
                      {UsuarioService.getContactInfo(detailDialog.data).telefono}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Email fontSize="small" sx={{ mr: 1 }} />
                      {UsuarioService.getContactInfo(detailDialog.data).correo}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información del Usuario</Typography>
                    <Typography variant="body2">
                      <strong>Nombre de usuario:</strong> {detailDialog.data.nombre_usuario}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Rol:</strong> 
                      <Chip 
                        label={detailDialog.data.rol_nombre || 'Sin rol'} 
                        color={UsuarioService.getRolColor(detailDialog.data.rol_nombre)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Estado:</strong> 
                      <Chip 
                        label={UsuarioService.getEstadoInfo(detailDialog.data.estado).label} 
                        color={UsuarioService.getEstadoInfo(detailDialog.data.estado).color}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información de Seguridad</Typography>
                    {(() => {
                      const securityInfo = UsuarioService.getSecurityInfo(detailDialog.data);
                      return (
                        <Box>
                          <Typography variant="body2">
                            <strong>Último acceso:</strong> {securityInfo.ultimoAcceso}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Hace:</strong> {securityInfo.tiempoUltimoAcceso}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Fecha de creación:</strong> {securityInfo.fechaCreacion}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Última modificación:</strong> {securityInfo.fechaModificacion}
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialog({ open: false, data: null })}>
                Cerrar
              </Button>
              {detailDialog.data && (
                <>
                  <Button 
                    variant="outlined"
                    onClick={() => {
                      handleChangePassword(detailDialog.data.id);
                      setDetailDialog({ open: false, data: null });
                    }}
                    startIcon={<VpnKey />}
                    color="warning"
                  >
                    Cambiar Contraseña
                  </Button>
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
                </>
              )}
            </DialogActions>
          </Dialog>

          {/* Dialog de confirmación */}
          <ConfirmDialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ open: false, id: null })}
            onConfirm={confirmDelete}
            title="¿Eliminar usuario?"
            message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este usuario del sistema?"
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

export default UsuarioModern;