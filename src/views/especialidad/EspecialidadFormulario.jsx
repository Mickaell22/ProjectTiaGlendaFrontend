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
  Box
} from '@mui/material';
import {
  Add,
  Edit
} from '@mui/icons-material';

// Servicios
import EspecialidadService from '../../services/especialidadService.js';

const EspecialidadFormulario = ({ 
  formData, 
  errors, 
  editingId, 
  onChange, 
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
        {editingId ? 'Editar Especialidad' : 'Registrar Nueva Especialidad'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              Información de la Especialidad
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1" mb={1}>Nombre: *</Typography>
            <TextField
              fullWidth
              name="nombre"
              value={formData.nombre}
              onChange={onChange}
              error={!!errors.nombre}
              helperText={errors.nombre}
              placeholder="Ej: Psicología Clínica, Terapia Ocupacional..."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1" mb={1}>Área: *</Typography>
            <TextField
              select
              fullWidth
              name="area"
              value={formData.area}
              onChange={onChange}
              error={!!errors.area}
              helperText={errors.area}
            >
              {EspecialidadService.getAreas().map((area) => (
                <MenuItem key={area.value} value={area.value}>
                  {area.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" mb={1}>Descripción:</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="descripcion"
              value={formData.descripcion}
              onChange={onChange}
              error={!!errors.descripcion}
              helperText={errors.descripcion}
              placeholder="Describe los servicios y enfoques de esta especialidad..."
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
              {EspecialidadService.getEstados().map((estado) => (
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
                disabled={!formData.nombre || !formData.area}
              >
                {editingId ? 'Actualizar Especialidad' : 'Crear Especialidad'}
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

export default EspecialidadFormulario;