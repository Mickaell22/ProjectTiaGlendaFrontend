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
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Person,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  Badge
} from '@mui/icons-material';

import PersonaService from '../../services/personaService.js';
import useSnackbar from '../../hooks/useSnackbar.js';

const PersonaFormulario = ({ 
  editingData = null, 
  personas = [],
  onSubmit, 
  onCancel,
  loading = false 
}) => {
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
  const [errors, setErrors] = useState({});

  const { showError } = useSnackbar();
  const isEditing = !!editingData;

  useEffect(() => {
    if (editingData) {
      console.log('editingData:', editingData);
      console.log('fecha_nacimiento original:', editingData.fecha_nacimiento);
      const formattedDate = PersonaService.formatDateForInput(editingData.fecha_nacimiento);
      console.log('fecha_nacimiento formatted:', formattedDate);
      
      setFormData({
        nombre: editingData.nombre || '',
        apellido: editingData.apellido || '',
        cedula: editingData.cedula || '',
        fecha_nacimiento: formattedDate,
        telefono: editingData.telefono || '',
        correo: editingData.correo || '',
        direccion: editingData.direccion || '',
        estado: editingData.estado || 'activo'
      });
    } else {
      resetForm();
    }
  }, [editingData]);

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
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const backendData = PersonaService.formatForBackend(formData);
    const validation = PersonaService.validatePersonaData(backendData);

    // Verificar cédula duplicada
    if (PersonaService.checkCedulaExists && PersonaService.checkCedulaExists(personas, formData.cedula, editingData?.id)) {
      validation.errors.cedula = 'Esta cédula ya está registrada';
      validation.isValid = false;
    }

    // Verificar email duplicado si existe
    if (formData.correo && PersonaService.checkEmailExists(personas, formData.correo, editingData?.id)) {
      validation.errors.correo = 'Este email ya está registrado';
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
      await onSubmit(backendData, isEditing);
      resetForm();
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
        {isEditing ? 'Editar Persona' : 'Crear Nueva Persona'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
              <Person sx={{ mr: 1 }} />
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
              placeholder="Ingrese el nombre"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                )
              }}
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
              placeholder="Ingrese el apellido"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                )
              }}
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
              placeholder="Ej: 12345678"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge color="primary" />
                  </InputAdornment>
                )
              }}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Información de Contacto */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center" sx={{ mt: 2 }}>
              <Phone sx={{ mr: 1 }} />
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
              placeholder="Ej: +58 414 1234567"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="primary" />
                  </InputAdornment>
                )
              }}
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
              placeholder="ejemplo@correo.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                )
              }}
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
              placeholder="Ingrese la dirección completa"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <LocationOn color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Estado */}
          <Grid item xs={12} md={6}>
            <Typography variant="body1" mb={1}>Estado:</Typography>
            <TextField
              select
              fullWidth
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              error={!!errors.estado}
              helperText={errors.estado}
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </TextField>
          </Grid>

          {/* Botones de acción */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                type="submit" 
                color="primary"
                startIcon={isEditing ? <Edit /> : <Add />}
                size="large"
                disabled={loading || !formData.nombre || !formData.apellido || !formData.cedula}
              >
                {isEditing ? 'Actualizar Persona' : 'Crear Persona'}
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
  );
};

export default PersonaFormulario;