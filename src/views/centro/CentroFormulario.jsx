// src/views/centro/CentroFormulario.jsx
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
  Business,
  Phone,
  Email,
  LocationOn,
  Schedule,
  Notes
} from '@mui/icons-material';

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

const turnos = [
  { value: 'matutino', label: 'Matutino' },
  { value: 'vespertino', label: 'Vespertino' },
  { value: 'mixto', label: 'Mixto' },
];

const CentroFormulario = ({
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

  const canSubmit = Boolean(formData?.nombre?.trim()) && Boolean(formData?.codigo?.trim());
  const iconColor = { color: 'text.primary' };

  return (
    <Card elevation={8} sx={getCardShellSX(theme)}>
      {/* Header dinamico (azul crear / naranja editar) */}
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
            <Business sx={{ mr: 1 }} />
            {editingId ? 'Editar Centro' : 'Registrar Centro'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {editingId
              ? 'Modifica los campos necesarios y guarda los cambios'
              : 'Completa la informacion del nuevo centro'}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* ===== Informacion basica ===== */}
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
              <Business sx={{ mr: 1 }} />
              Informacion del Centro
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
                placeholder="Ej: Centro Tia Glenda - Sede Principal"
                sx={neutralInputSX}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={iconColor} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Codigo */}
            <Box sx={rowGridSX}>
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                Codigo <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                name="codigo"
                value={formData.codigo}
                onChange={onChange}
                error={!!errors.codigo}
                helperText={errors.codigo || 'Se convertira a mayusculas automaticamente'}
                placeholder="Ej: CTG-01"
                sx={neutralInputSX}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Box>

            {/* Direccion */}
            <Box sx={rowGridSX}>
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                Direccion
              </Typography>
              <TextField
                fullWidth
                name="direccion"
                value={formData.direccion}
                onChange={onChange}
                error={!!errors.direccion}
                helperText={errors.direccion}
                placeholder="Ej: Av. Principal #123"
                sx={neutralInputSX}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={iconColor} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Box>

          {/* ===== Contacto ===== */}
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
              <Phone sx={{ mr: 1 }} />
              Contacto
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Telefono */}
            <Box sx={rowGridSX}>
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                Telefono
              </Typography>
              <TextField
                fullWidth
                name="telefono"
                value={formData.telefono}
                onChange={onChange}
                placeholder="Ej: 0412-1234567"
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

            {/* Email */}
            <Box sx={rowGridSX}>
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                Email
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Ej: centro@ejemplo.com"
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
          </Box>

          {/* ===== Horario y Turno ===== */}
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
              <Schedule sx={{ mr: 1 }} />
              Horario y Turno
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Turno principal */}
            <Box sx={rowGridSX}>
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                Turno principal
              </Typography>
              <TextField
                select
                fullWidth
                name="turno_principal"
                value={formData.turno_principal}
                onChange={onChange}
                sx={neutralInputSX}
              >
                {turnos.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Horario apertura */}
            <Box sx={rowGridSX}>
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                Horario apertura
              </Typography>
              <TextField
                fullWidth
                name="horario_apertura"
                type="time"
                value={formData.horario_apertura}
                onChange={onChange}
                sx={neutralInputSX}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Schedule sx={iconColor} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Horario cierre */}
            <Box sx={rowGridSX}>
              <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                Horario cierre
              </Typography>
              <TextField
                fullWidth
                name="horario_cierre"
                type="time"
                value={formData.horario_cierre}
                onChange={onChange}
                sx={neutralInputSX}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Schedule sx={iconColor} />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Box>

          {/* ===== Observaciones ===== */}
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
              <Notes sx={{ mr: 1 }} />
              Observaciones
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              name="observaciones"
              value={formData.observaciones}
              onChange={onChange}
              multiline
              rows={3}
              placeholder="Notas adicionales sobre el centro..."
              sx={neutralInputSX}
            />
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
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.getContrastText(theme.palette.primary.main),
                '&:hover': { bgcolor: theme.palette.primary.dark }
              }}
            >
              {editingId ? 'Actualizar Centro' : 'Crear Centro'}
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

export default CentroFormulario;
