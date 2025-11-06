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
  Chip,
  useTheme
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
import PersonaGeneralSelector from '../../components/shared/PersonaGeneralSelector.jsx';
import UnifiedPersonForm from '../../components/shared/UnifiedPersonForm.jsx';
import useAuth from '../../hooks/useAuth.js';

/* ---------- Estilos coherentes con PersonaFormulario ---------- */
// Inputs sin estilos morados: usamos el tema por defecto
const neutralInputSX = {};

// Misma "carcasa"/tamaño que Persona/Usuario
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
  centros = [],
  personaEncontrada,
  onChange,
  onPersonChange,
  showPersonForm = false,
  setShowPersonForm = () => {},
  onSubmit,
  onCancel
}) => {
  const theme = useTheme();
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  // Filtrar especialidades solo del centro del usuario logueado
  const especialidadesFiltradas = React.useMemo(() => {
    // Obtener el id del centro del usuario de cualquier variante posible
    const centroId = user?.id_centro || user?.centro_id || user?.centro?.id;

    if (!centroId) {
      return especialidades;
    }

    return especialidades.filter(esp => esp.id_centro == centroId && esp.estado === 'activo');
  }, [especialidades, user]);

  const canSubmit =
    (personaEncontrada?.id || formData.persona_id) &&
    formData.id_especialidad &&
    formData.fecha_ingreso &&
    formData.titulo_profesional?.trim() &&
    formData.cargo?.trim() &&
    formData.tipo_contrato &&
    formData.id_centro;

  const fullName =
    personaEncontrada
      ? (personaEncontrada.nombre_completo || `${personaEncontrada?.nombres || personaEncontrada?.nombre || ''} ${personaEncontrada?.apellidos || personaEncontrada?.apellido || ''}`.trim())
      : '';

  // Iconos con mismo color que el texto
  const iconColor = { color: 'text.primary' };

  return (
    <Box>
      {/* ====== Card Principal (form) ====== */}
      <Card elevation={8} sx={getCardShellSX(theme)}>
        {/* Header dinámico (azul crear / naranja editar), igual a PersonaFormulario */}
        <Box
          sx={{
            background: editingId
              ? `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: editingId ? theme.palette.warning.contrastText : theme.palette.primary.contrastText,
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
                backgroundColor: 'background.paper'
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

              {/* Persona Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" mb={1}>
                  Persona (Personal): <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <PersonaGeneralSelector
                  selectedPersona={personaEncontrada}
                  onSelect={(persona) => onPersonChange(persona)}
                  placeholder="Busca y selecciona la persona para el personal"
                />
                {errors.persona_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.persona_id}
                  </Typography>
                )}
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
                backgroundColor: 'background.paper'
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

              {/* Especialidad Principal */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Especialidad Principal <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <Autocomplete
                  value={especialidadesFiltradas.find(esp => esp.id === formData.id_especialidad) || null}
                  onChange={(event, newValue) => {
                    onChange({
                      target: {
                        name: 'id_especialidad',
                        value: newValue?.id || ''
                      }
                    });
                  }}
                  options={especialidadesFiltradas}
                  getOptionLabel={(option) =>
                    `${option.nombre} (${EspecialidadService.getAreaLabel(option.area)})`
                  }
                  groupBy={(option) => EspecialidadService.getAreaLabel(option.area)}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
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
                      placeholder="Selecciona la especialidad principal..."
                      error={!!errors.id_especialidad}
                      helperText={errors.id_especialidad || 'Selecciona la especialidad principal del personal'}
                      sx={neutralInputSX}
                    />
                  )}
                  noOptionsText="No hay especialidades disponibles para tu centro"
                />
              </Box>

              {/* Fecha de Ingreso */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Fecha de Ingreso <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  name="fecha_ingreso"
                  value={formData.fecha_ingreso}
                  onChange={onChange}
                  error={!!errors.fecha_ingreso}
                  helperText={errors.fecha_ingreso || 'Fecha en que inicia el personal'}
                  sx={neutralInputSX}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              {/* Fecha de Salida */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Fecha de Salida
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  name="fecha_salida"
                  value={formData.fecha_salida || ''}
                  onChange={onChange}
                  error={!!errors.fecha_salida}
                  helperText={errors.fecha_salida || 'Fecha de finalización (opcional)'}
                  sx={neutralInputSX}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              {/* Título Profesional */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Título Profesional <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  name="titulo_profesional"
                  value={formData.titulo_profesional}
                  onChange={onChange}
                  error={!!errors.titulo_profesional}
                  helperText={errors.titulo_profesional || 'Ej: Licenciado en Psicología, Doctor en Medicina'}
                  placeholder="Ej: Licenciado en Psicología, Doctor en Medicina, etc."
                  sx={neutralInputSX}
                />
              </Box>

              {/* Cargo */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Cargo <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  name="cargo"
                  value={formData.cargo}
                  onChange={onChange}
                  error={!!errors.cargo}
                  helperText={errors.cargo || 'Ej: Psicólogo Clínico, Terapeuta Físico'}
                  placeholder="Ej: Psicólogo Clínico, Terapeuta Físico, etc."
                  sx={neutralInputSX}
                />
              </Box>

              {/* Tipo de Contrato */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Tipo de Contrato <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <Autocomplete
                  value={{ value: formData.tipo_contrato, label: formData.tipo_contrato ? 
                    formData.tipo_contrato.charAt(0).toUpperCase() + formData.tipo_contrato.slice(1) : '' } || null}
                  onChange={(event, newValue) => {
                    onChange({
                      target: {
                        name: 'tipo_contrato',
                        value: newValue?.value || ''
                      }
                    });
                  }}
                  options={[
                    { value: 'indefinido', label: 'Indefinido' },
                    { value: 'temporal', label: 'Temporal' },
                    { value: 'honorarios', label: 'Honorarios' },
                    { value: 'practicante', label: 'Practicante' }
                  ]}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(opt, val) => opt.value === val.value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Selecciona el tipo de contrato..."
                      error={!!errors.tipo_contrato}
                      helperText={errors.tipo_contrato || 'Tipo de contrato del personal'}
                      sx={neutralInputSX}
                    />
                  )}
                  noOptionsText="No hay tipos de contrato disponibles"
                />
              </Box>

              {/* Centro */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Centro <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <Autocomplete
                  value={centros.find(centro => centro.id === formData.id_centro) || null}
                  onChange={(event, newValue) => {
                    onChange({
                      target: {
                        name: 'id_centro',
                        value: newValue?.id || ''
                      }
                    });
                  }}
                  options={centros}
                  getOptionLabel={(option) => option.nombre}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Selecciona el centro..."
                      error={!!errors.id_centro}
                      helperText={errors.id_centro || 'Centro donde trabajará el personal'}
                      sx={neutralInputSX}
                    />
                  )}
                  noOptionsText="No hay centros disponibles"
                />
              </Box>

              {/* Observaciones */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Observaciones
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="observaciones"
                  value={formData.observaciones || ''}
                  onChange={onChange}
                  error={!!errors.observaciones}
                  helperText={errors.observaciones || 'Observaciones adicionales (opcional)'}
                  placeholder="Observaciones adicionales sobre el personal..."
                  sx={neutralInputSX}
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
                startIcon={editingId ? <Edit /> : <Add />}
                size="large"
                disabled={!canSubmit}
                sx={(theme) => ({
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                })}
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

      {/* Formulario de Creación de Persona */}
      <UnifiedPersonForm
        open={showPersonForm}
        onClose={() => setShowPersonForm(false)}
        onPersonCreated={(newPerson) => {
          onPersonChange({
            ...newPerson,
            displayName: newPerson.displayName || `${newPerson.nombre} ${newPerson.apellido}`
          });
          setShowPersonForm(false);
        }}
        personType="persona"
        title="Crear Nueva Persona (Personal)"
        enableMultiStep={false}
      />
    </Box>
  );
};

export default PersonalFormulario;
