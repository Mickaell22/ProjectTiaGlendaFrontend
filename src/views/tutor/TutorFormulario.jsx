import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  FamilyRestroom,
  Search,
  Work,
  Phone,
  Home
} from '@mui/icons-material';

import TutorService from '../../services/tutorService.js';
import PersonaService from '../../services/personaService.js';
import BuscadorPersonas from '../../components/shared/BuscadorPersonas.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';

const TutorFormulario = ({ 
  editingData = null, 
  personasDisponibles = [], 
  onSubmit, 
  onCancel,
  loading = false 
}) => {
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
  const [errors, setErrors] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPersonSelector, setShowPersonSelector] = useState(false);

  const { showError } = useSnackbar();
  const isEditing = !!editingData;

  useEffect(() => {
    if (editingData) {
      setFormData({
        persona_id: editingData.persona_id || '',
        parentesco: editingData.parentesco || '',
        telefono_emergencia: editingData.telefono_emergencia || '',
        direccion_trabajo: editingData.direccion_trabajo || '',
        empresa_trabajo: editingData.empresa_trabajo || '',
        cargo_trabajo: editingData.cargo_trabajo || '',
        observaciones: editingData.observaciones || '',
        estado: editingData.estado || 'activo'
      });
      
      // Si estamos editando, cargar la persona actual
      if (editingData.persona_id) {
        setSelectedPerson({
          id: editingData.persona_id,
          nombre_completo: editingData.nombre_completo,
          cedula: editingData.cedula,
          telefono: editingData.telefono,
          correo: editingData.correo
        });
      }
    } else {
      resetForm();
    }
  }, [editingData]);

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
    setErrors({});
    setSelectedPerson(null);
    setShowPersonSelector(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const backendData = TutorService.formatForBackend(formData);
    const validation = TutorService.validateTutorData(backendData);
    
    // Validaciones adicionales específicas
    if (!formData.persona_id) validation.errors.persona_id = 'Debe seleccionar una persona';
    if (!formData.parentesco) validation.errors.parentesco = 'Debe especificar el parentesco';
    
    setErrors(validation.errors);
    return validation.isValid && !validation.errors.persona_id && !validation.errors.parentesco;
  };

  const handlePersonaSelect = (persona) => {
    setSelectedPerson(persona);
    setFormData(prev => ({ ...prev, persona_id: persona.id }));
    setShowPersonSelector(false);
    if (errors.persona_id) {
      setErrors(prev => ({ ...prev, persona_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = TutorService.formatForBackend(formData);
      await onSubmit(backendData, isEditing);
      resetForm();
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
          {isEditing ? 'Editar Tutor' : 'Crear Nuevo Tutor'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                <FamilyRestroom sx={{ mr: 1 }} />
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
                        {PersonaService.getFullName ? PersonaService.getFullName(selectedPerson) : selectedPerson.nombre_completo}
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

            {/* Información de Tutor */}
            <Grid item xs={12} md={6}>
              <Typography variant="body1" mb={1}>Parentesco: *</Typography>
              <TextField
                select
                fullWidth
                name="parentesco"
                value={formData.parentesco}
                onChange={handleChange}
                error={!!errors.parentesco}
                helperText={errors.parentesco}
              >
                <MenuItem value="">Seleccione el parentesco</MenuItem>
                {TutorService.getParentescos ? TutorService.getParentescos().map((parentesco) => (
                  <MenuItem key={parentesco.value} value={parentesco.value}>
                    {parentesco.label}
                  </MenuItem>
                )) : (
                  <>
                    <MenuItem value="padre">Padre</MenuItem>
                    <MenuItem value="madre">Madre</MenuItem>
                    <MenuItem value="abuelo">Abuelo/a</MenuItem>
                    <MenuItem value="tio">Tío/a</MenuItem>
                    <MenuItem value="hermano">Hermano/a</MenuItem>
                    <MenuItem value="tutor_legal">Tutor Legal</MenuItem>
                    <MenuItem value="otro">Otro</MenuItem>
                  </>
                )}
              </TextField>
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
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            {/* Información Laboral */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center" sx={{ mt: 2 }}>
                <Work sx={{ mr: 1 }} />
                Información Laboral
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1" mb={1}>Empresa/Lugar de Trabajo:</Typography>
              <TextField
                fullWidth
                name="empresa_trabajo"
                value={formData.empresa_trabajo}
                onChange={handleChange}
                error={!!errors.empresa_trabajo}
                helperText={errors.empresa_trabajo}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1" mb={1}>Cargo:</Typography>
              <TextField
                fullWidth
                name="cargo_trabajo"
                value={formData.cargo_trabajo}
                onChange={handleChange}
                error={!!errors.cargo_trabajo}
                helperText={errors.cargo_trabajo}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" mb={1}>Dirección de Trabajo:</Typography>
              <TextField
                fullWidth
                name="direccion_trabajo"
                value={formData.direccion_trabajo}
                onChange={handleChange}
                error={!!errors.direccion_trabajo}
                helperText={errors.direccion_trabajo}
                InputProps={{
                  startAdornment: <Home sx={{ mr: 1, color: 'text.secondary' }} />
                }}
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
              <Typography variant="body1" mb={1}>Observaciones:</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                error={!!errors.observaciones}
                helperText={errors.observaciones || "Información adicional sobre el tutor"}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button 
                  variant="contained" 
                  type="submit" 
                  color="primary"
                  startIcon={isEditing ? <Edit /> : <PersonAdd />}
                  size="large"
                  disabled={loading || !formData.persona_id || !formData.parentesco}
                >
                  {isEditing ? 'Actualizar Tutor' : 'Crear Tutor'}
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
    </>
  );
};

export default TutorFormulario;