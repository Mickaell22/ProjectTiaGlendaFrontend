// src/views/personal/PersonalFormulario.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Divider,
  Box,
  Autocomplete,
  Avatar,
  Chip
} from '@mui/material';
import {
  Add,
  Edit,
  Person,
  Assignment,
  LocalHospital,
  Work
} from '@mui/icons-material';

import EspecialidadService from '../../services/especialidadService.js';

/* ---------- Estilos coherentes con PersonaFormulario ---------- */
// Inputs sin estilos morados: usamos el tema por defecto
const neutralInputSX = {};

// Misma “carcasa”/tamaño que Persona/Usuario
const cardShellSX = {
  borderRadius: 4,
  mb: 4,
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
  border: '1px solid',
  borderColor: 'divider',
  overflow: 'hidden',
  width: '100%',
  maxWidth: { xs: '100%', sm: 680, md: 820, lg: 900 },
  mx: 'auto'
};

// Fila con etiqueta a la izquierda y campo a la derecha
const rowGridSX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
  gap: 2,
  alignItems: 'center',
  mb: 2
};

const PersonalFormulario = ({
  formData,
  errors,
  editingId,
  personasDisponibles = [],
  especialidades = [],
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

  const canSubmit =
    (selectedPerson?.id || formData.persona_id) &&
    !!formData.titulo_profesional?.trim() &&
    formData.especialidades &&
    formData.especialidades.length > 0;

  const fullName =
    selectedPerson
      ? `${selectedPerson?.nombre || ''} ${selectedPerson?.apellido || ''}`.trim()
      : '';

  // Iconos con mismo color que el texto
  const iconColor = { color: 'text.primary' };

  return (
    <Box>
      {/* ====== Card: Buscar Persona (cuando NO hay selección) ====== */}
      {!selectedPerson && (
        <Card elevation={8} sx={cardShellSX}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #7e57c2 0%, #673ab7 100%)',
              color: 'white',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">
                🔍 Buscar Persona
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Busca y selecciona la persona que será asociada a este registro de personal.
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Autocomplete
              value={selectedPerson || null}
              onChange={(event, newValue) => onPersonChange(newValue)}
              options={personasDisponibles}
              getOptionLabel={(option) =>
                `${option.nombre} ${option.apellido} - ${option.cedula}`
              }
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              noOptionsText="No se encontraron personas"
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
                  sx={neutralInputSX}
                />
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* ====== Card: Persona Seleccionada (cuando SÍ hay selección) ====== */}
      {selectedPerson && (
        <Card elevation={8} sx={cardShellSX}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #7e57c2 0%, #673ab7 100%)',
              color: 'white',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">
                ✅ Persona Seleccionada
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Verifica la información antes de continuar.
              </Typography>
            </Box>

            {!editingId && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => onPersonChange(null)}
              >
                Cambiar Persona
              </Button>
            )}
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'primary.light',
                    borderRadius: 1,
                    bgcolor: '#fff'
                  }}
                >
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    👤 DATOS DE LA PERSONA
                  </Typography>
                  <Typography>
                    <strong>Nombre:</strong> {fullName || '—'}
                  </Typography>
                  <Typography>
                    <strong>Cédula:</strong> {selectedPerson?.cedula || '—'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ====== Card Principal (form) ====== */}
      <Card elevation={8} sx={cardShellSX}>
        {/* Header dinámico (azul crear / naranja editar), igual a PersonaFormulario */}
        <Box
          sx={{
            background: editingId
              ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
              : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <LocalHospital sx={{ mr: 1 }} />
              {editingId ? 'Editar Personal' : 'Registrar Nuevo Personal'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {editingId
                ? 'Modifica los campos necesarios y guarda los cambios'
                : 'Selecciona la persona y completa la información del personal'}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* ===== Bloque: Asignación ===== */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: '#fff'
              }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 'bold', color: 'text.secondary' }}
                display="flex"
                alignItems="center"
              >
                <Assignment sx={{ mr: 1 }} />
                Asignación
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Persona (solo lectura, viene del selector de arriba) */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Persona *
                </Typography>
                <TextField
                  fullWidth
                  value={fullName}
                  placeholder="Seleccione una persona desde el buscador"
                  InputProps={{ readOnly: true }}
                  error={!!errors.persona_id}
                  helperText={errors.persona_id}
                  sx={neutralInputSX}
                />
              </Box>
            </Box>

            {/* ===== Bloque: Datos del Personal ===== */}
            <Box
              sx={{
                mb: 3,
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: '#fff'
              }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 'bold', color: 'text.secondary' }}
                display="flex"
                alignItems="center"
              >
                <Person sx={{ mr: 1 }} />
                Datos del Personal
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Título Profesional */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Título Profesional *
                </Typography>
                <TextField
                  fullWidth
                  name="titulo_profesional"
                  value={formData.titulo_profesional}
                  onChange={onChange}
                  error={!!errors.titulo_profesional}
                  helperText={errors.titulo_profesional || 'Ej: Licenciado en Psicología'}
                  placeholder="Ej: Licenciado en Psicología, Doctor en Medicina, etc."
                  sx={neutralInputSX}
                />
              </Box>

              {/* Especialidades */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Especialidades *
                </Typography>
                <Autocomplete
                  multiple
                  value={formData.especialidades || []}
                  onChange={(event, newValue) => {
                    onChange({
                      target: {
                        name: 'especialidades',
                        value: newValue
                      }
                    });
                  }}
                  options={especialidades.filter(esp => esp.estado === 'activo')}
                  getOptionLabel={(option) =>
                    `${option.nombre} (${EspecialidadService.getAreaLabel(option.area)})`
                  }
                  groupBy={(option) => EspecialidadService.getAreaLabel(option.area)}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.nombre}
                        color={EspecialidadService.getAreaColor(option.area)}
                        size="small"
                        icon={<Work />}
                      />
                    ))
                  }
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Work sx={{ mr: 1, color: `${EspecialidadService.getAreaColor(option.area)}.main` }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {option.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Área: {EspecialidadService.getAreaLabel(option.area)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Selecciona las especialidades del personal..."
                      error={!!errors.especialidades}
                      helperText={errors.especialidades || 'Selecciona al menos una especialidad'}
                      sx={neutralInputSX}
                    />
                  )}
                  noOptionsText="No hay especialidades disponibles"
                />
              </Box>

              {/* 🚫 Campo Estado eliminado */}
            </Box>

            {/* ===== Acciones ===== */}
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                type="submit"
                color="primary"
                startIcon={editingId ? <Edit /> : <Add />}
                size="large"
                disabled={!canSubmit}
              >
                {editingId ? 'Actualizar Personal' : 'Crear Personal'}
              </Button>
              <Button variant="outlined" onClick={onCancel} color="secondary" size="large">
                Cancelar
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PersonalFormulario;
