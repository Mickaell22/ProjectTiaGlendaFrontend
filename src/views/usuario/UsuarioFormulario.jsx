import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  AccountBox,
  Security,
  Search,
  Visibility as VisibilityIcon,
  VisibilityOff,
  AdminPanelSettings,
  SupervisorAccount,
  Psychology,
  School,
  Person
} from '@mui/icons-material';

import UsuarioService from '../../services/usuarioService.js';
import PersonaService from '../../services/personaService.js';
import BuscadorPersonas from '../../components/shared/BuscadorPersonas.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';

const UsuarioFormulario = ({ 
  editingData = null, 
  personasDisponibles = [], 
  onSubmit, 
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    persona_id: '',
    nombre_usuario: '',
    contrasenia: '',
    rol_id: '',
    estado: 'activo'
  });
  const [errors, setErrors] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { showError } = useSnackbar();
  const isEditing = !!editingData;

  useEffect(() => {
    if (editingData) {
      setFormData({
        persona_id: editingData.persona_id,
        nombre_usuario: editingData.nombre_usuario,
        contrasenia: '', // No mostrar contraseña existente
        rol_id: editingData.rol_id,
        estado: editingData.estado
      });
      
      // Encontrar la persona seleccionada
      const persona = personasDisponibles.find(p => p.id === editingData.persona_id);
      if (persona) {
        setSelectedPerson(persona);
      }
    } else {
      resetForm();
    }
  }, [editingData, personasDisponibles]);

  useEffect(() => {
    // Auto-generar nombre de usuario cuando se selecciona una persona
    if (selectedPerson && !isEditing) {
      const sugerencia = UsuarioService.generateUsernameFromName(
        selectedPerson.nombre, 
        selectedPerson.apellido
      );
      setFormData(prev => ({ ...prev, nombre_usuario: sugerencia }));
    }
  }, [selectedPerson, isEditing]);

  const resetForm = () => {
    setFormData({
      persona_id: '',
      nombre_usuario: '',
      contrasenia: '',
      rol_id: '',
      estado: 'activo'
    });
    setErrors({});
    setSelectedPerson(null);
    setShowPersonSelector(false);
    setShowPassword(false);
  };

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
    
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = UsuarioService.formatForBackend(formData);
      await onSubmit(backendData, isEditing);
      resetForm();
    } catch (error) {
      showError(error.message);
    }
  };

  const handlePersonaSelect = (persona) => {
    setSelectedPerson(persona);
    setFormData(prev => ({ ...prev, persona_id: persona.id }));
    setShowPersonSelector(false);
    if (errors.persona_id) {
      setErrors(prev => ({ ...prev, persona_id: '' }));
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
          {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario del Sistema'}
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
                name="rol_id"
                value={formData.rol_id}
                onChange={handleChange}
                error={!!errors.rol_id}
                helperText={errors.rol_id}
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

            {!isEditing && (
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

            {isEditing && (
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
                  startIcon={isEditing ? <Edit /> : <PersonAdd />}
                  size="large"
                  disabled={loading || !formData.persona_id || !formData.nombre_usuario || !formData.rol_id || (!isEditing && !formData.contrasenia)}
                >
                  {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={onCancel}
                  color="secondary"
                  size="large"
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>

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
    </>
  );
};

export default UsuarioFormulario;