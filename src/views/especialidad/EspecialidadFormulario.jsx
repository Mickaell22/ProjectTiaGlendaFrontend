// src/views/especialidades/EspecialidadFormulario.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Box,
  MenuItem,
  InputAdornment,

  useTheme
} from '@mui/material';
import {
  Add,
  Edit,
  MedicalServices,
  Work
} from '@mui/icons-material';

// Servicios
import EspecialidadService from '../../services/especialidadService.js';

/* ---------- Estilos ---------- */
const neutralInputSX = {};

const getCardShellSX = (theme) => ({
  borderRadius: 4,
  mb: 4,
  backgroundColor: 'background.paper',
  border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : '1px solid transparent',
  borderColor: theme.palette.mode === 'dark' ? 'divider' : 'divider',
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

const EspecialidadFormulario = ({
  formData,
  errors,
  editingId,
  onChange,
  onSubmit,
  onCancel
}) => {
  const theme = useTheme();
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const canSubmit = Boolean(formData?.nombre) && Boolean(formData?.area);
  const iconColor = { color: 'text.primary' };

  return (
    <Card elevation={8} sx={getCardShellSX(theme)}>
      {/* Header dinámico (azul crear / naranja editar) */}
      <Box
        sx={{
          background: editingId
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
            <MedicalServices sx={{ mr: 1 }} />
            {editingId ? 'Editar Especialidad' : 'Registrar Especialidad'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {editingId
              ? 'Modifica los campos necesarios y guarda los cambios'
              : 'Completa la información básica de la especialidad'}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* ===== Información de la Especialidad ===== */}
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
            <Typography
              variant="overline"
              sx={{ fontWeight: 'bold', color: 'text.secondary' }}
              display="flex" alignItems="center"
            >
              <MedicalServices sx={{ mr: 1 }} />
              Información de la Especialidad
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Nombre */}
            <Box sx={rowGridSX}>
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                Nombre <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="nombre"
                value={formData.nombre}
                onChange={onChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
                placeholder="Ej: Psicología Clínica, Terapia Ocupacional…"
                sx={neutralInputSX}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MedicalServices sx={iconColor} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Área */}
            <Box sx={rowGridSX}>
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                Área <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
              </Typography>
              <TextField
                select
                fullWidth
                name="area"
                value={formData.area}
                onChange={onChange}
                error={!!errors.area}
                helperText={errors.area || 'Selecciona el área de esta especialidad'}
                sx={neutralInputSX}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Work sx={iconColor} />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="">Seleccione un área</MenuItem>
                {EspecialidadService.getAreas().map((area) => (
                  <MenuItem key={area.value} value={area.value}>
                    {area.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
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
        </Box>
      </CardContent>
    </Card>
  );
};

export default EspecialidadFormulario;
