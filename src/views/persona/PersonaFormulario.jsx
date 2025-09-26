// src/views/personas/PersonaFormulario.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Box,
  InputAdornment,
  useTheme
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

/* ---------- Estilos coherentes con UsuarioFormulario ---------- */
const neutralInputSX = {};

// Función para generar el sx del card principal con theming responsivo
const getCardShellSX = (theme) => ({
  borderRadius: 4,
  mb: 4,
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  overflow: 'hidden',
  width: '100%',
  maxWidth: { xs: '100%', sm: 680, md: 820, lg: 900 },
  mx: 'auto'
});

const rowGridSX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
  gap: 2,
  alignItems: 'center',
  mb: 2
};

/* ---------- Helper robusto para normalizar fechas al input date ---------- */
function toInputDate(value) {
  if (!value) return '';
  try {
    // Si ya viene en YYYY-MM-DD
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    // Si viene como DD/MM/YYYY
    if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [dd, mm, yyyy] = value.split('/');
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    // Si es ISO con hora u otra variante parseable por Date
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      const d = new Date(value);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    // Si es Date
    if (value instanceof Date && !isNaN(value.getTime())) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // Si es timestamp numérico
    if (typeof value === 'number') {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    }
  } catch {
    // ignorar y devolver vacío
  }
  return '';
}

const PersonaFormulario = ({
  editingData = null,
  personas = [],
  onSubmit,
  onCancel,
  loading = false
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    fecha_nacimiento: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: 'activo' // se mantiene en el payload, pero NO se muestra en UI
  });
  const [errors, setErrors] = useState({});
  const { showError } = useSnackbar();
  const isEditing = !!editingData;

  useEffect(() => {
    if (editingData) {
      // Toma en cuenta variantes de la propiedad por si vienen con otro nombre
      const rawFecha =
        editingData.fecha_nacimiento ??
        editingData.fechaNacimiento ??
        editingData.fechaNacimientoISO ??
        editingData.fecha_nac ??
        '';

      // 1) Intento robusto local
      let formattedDate = toInputDate(rawFecha);

      // 2) Fallback a tu PersonaService si no logró formatear
      if (!formattedDate && typeof PersonaService?.formatDateForInput === 'function') {
        formattedDate = PersonaService.formatDateForInput(rawFecha) || '';
        // garantizar que sea YYYY-MM-DD
        formattedDate = toInputDate(formattedDate) || '';
      }

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
    let filteredValue = value;

    if (name === 'nombre' || name === 'apellido') {
      // Solo letras y espacios
      filteredValue = filteredValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
    }
    if (name === 'cedula') {
      // Solo números
      filteredValue = filteredValue.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: filteredValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const backendData = PersonaService.formatForBackend(formData);
    const validation = PersonaService.validatePersonaData(backendData);

    if (PersonaService.checkCedulaExists &&
        PersonaService.checkCedulaExists(personas, formData.cedula, editingData?.id)) {
      validation.errors.cedula = 'Esta cédula ya está registrada';
      validation.isValid = false;
    }
    if (formData.correo &&
        PersonaService.checkEmailExists(personas, formData.correo, editingData?.id)) {
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
      showError(error?.message || 'Ocurrió un error al guardar');
    }
  };

  const iconColor = { color: 'text.primary' };

  return (
    <Box>
      {/* Header dinámico con theming apropiado */}
      <Card elevation={8} sx={getCardShellSX(theme)}>
        <Box
          sx={{
            background: isEditing
              ? `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <Person sx={{ mr: 1 }} />
              {isEditing ? 'Editar Persona' : 'Registrar Persona'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isEditing
                ? 'Modifica los campos necesarios y guarda los cambios'
                : 'Completa la información personal y de contacto'}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* ===== Información Personal ===== */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }}
            >
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }} display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} />
                Información Personal
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Nombre */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Nombre *</Typography>
                <TextField
                  fullWidth
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                  placeholder="Ingrese el nombre"
                  sx={neutralInputSX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={iconColor} />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {/* Apellido */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Apellido *</Typography>
                <TextField
                  fullWidth
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  error={!!errors.apellido}
                  helperText={errors.apellido}
                  placeholder="Ingrese el apellido"
                  sx={neutralInputSX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={iconColor} />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {/* Cédula */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Cédula *</Typography>
                <TextField
                  fullWidth
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  error={!!errors.cedula}
                  helperText={errors.cedula}
                  placeholder="Ej: 0932XXXXXX"
                  sx={neutralInputSX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge sx={iconColor} />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {/* Fecha de nacimiento */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Fecha de Nacimiento</Typography>
                <TextField
                  fullWidth
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  error={!!errors.fecha_nacimiento}
                  helperText={errors.fecha_nacimiento}
                  sx={neutralInputSX}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={iconColor} />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </Box>

            {/* ===== Información de Contacto ===== */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }}
            >
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }} display="flex" alignItems="center">
                <Phone sx={{ mr: 1 }} />
                Información de Contacto
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Teléfono */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Teléfono</Typography>
                <TextField
                  fullWidth
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  error={!!errors.telefono}
                  helperText={errors.telefono}
                  placeholder="Ej: 09XXXXXXXX"
                  sx={neutralInputSX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={iconColor} />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {/* Correo */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Correo Electrónico</Typography>
                <TextField
                  fullWidth
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  error={!!errors.correo}
                  helperText={errors.correo}
                  placeholder="ejemplo@correo.com"
                  sx={neutralInputSX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={iconColor} />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {/* Dirección */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Dirección</Typography>
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
                  sx={neutralInputSX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <LocationOn sx={iconColor} />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </Box>

            {/* ===== Acciones ===== */}
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                type="submit"
                color="primary"
                startIcon={isEditing ? <Edit /> : <Add />}
                size="large"
                disabled={loading || !formData.nombre || !formData.apellido || !formData.cedula}
              >
                {isEditing ? 'Actualizar Persona' : 'Registrar Persona'}
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
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PersonaFormulario;
