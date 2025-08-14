import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Stack,
  Divider,
  Box,
  Autocomplete,
  Avatar
} from '@mui/material';
import {
  Add,
  Edit,
  Person
} from '@mui/icons-material';

// Servicios
import PersonalService from '../../services/personalService.js';

const PersonalFormulario = ({ 
  formData, 
  errors, 
  editingId, 
  personasDisponibles = [],
  selectedPerson,
  onChange, 
  onPersonChange,
  onSubmit, 
  onCancel 
}) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
        {editingId ? 'Editar Personal' : 'Registrar Nuevo Personal'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              Información del Personal
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" mb={1}>Persona: *</Typography>
            <Autocomplete
              value={selectedPerson}
              onChange={(event, newValue) => onPersonChange(newValue)}
              options={personasDisponibles}
              getOptionLabel={(option) => `${option.nombre} ${option.apellido} - ${option.cedula}`}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {option.nombre} {option.apellido}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.cedula}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Buscar y seleccionar persona..."
                  error={!!errors.persona_id}
                  helperText={errors.persona_id}
                />
              )}
              noOptionsText="No se encontraron personas"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" mb={1}>Título Profesional: *</Typography>
            <TextField
              fullWidth
              name="titulo_profesional"
              value={formData.titulo_profesional}
              onChange={onChange}
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
              onChange={onChange}
            >
              {PersonalService.getEstados().map((estado) => (
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
                disabled={!formData.persona_id || !formData.titulo_profesional}
              >
                {editingId ? 'Actualizar Personal' : 'Crear Personal'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={onCancel}
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
  );
};

export default PersonalFormulario;