// src/views/pacientes/PacienteFormulario.jsx
import React, { useState, useEffect } from 'react';
import {
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
  useTheme
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  LocalHospital,
  CalendarToday,
  Assignment
} from '@mui/icons-material';

import PacienteService from '../../services/pacienteService.js';
import ModernPersonSelector from '../../components/shared/ModernPersonSelector.jsx';
import UnifiedPersonForm from '../../components/shared/UnifiedPersonForm.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';

/* ---------- Helpers ---------- */
function getCurrentDateForInput() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getUsuarioId() {
  const raw = localStorage.getItem('user_data');
  if (raw) {
    try {
      const u = JSON.parse(raw);
      if (u?.id) return u.id;
    } catch {}
  }
  const token = localStorage.getItem('jwt_token');
  if (token && token.split('.').length === 3) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.id || payload.sub || null;
    } catch {}
  }
  return null;
}

/* ---------- Estilos coherentes con Usuario/Personal/Tutor ---------- */
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

const PacienteFormulario = ({
  editingData = null,
  especialidades = [],
  onSubmit,
  onCancel,
  loading = false
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    persona_id: '',
    tutor_id: '',
    especialidad_id: '',
    fecha_ingreso: getCurrentDateForInput(),
    fecha_inicio_tratamiento: getCurrentDateForInput(),
    fecha_fin_tratamiento: '',
    estado_tratamiento: 'activo',
    observaciones_tratamiento: '',
    observaciones: ''
  });
  const [errors, setErrors] = useState({});
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [tutorEncontrado, setTutorEncontrado] = useState(null);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showTutorForm, setShowTutorForm] = useState(false);
  const [personFormType, setPersonFormType] = useState('persona');

  const { showError } = useSnackbar();
  const isEditing = !!editingData;

  /* ---------- Effects ---------- */
  useEffect(() => {
    if (editingData) {
      setFormData({
        persona_id: editingData.persona_id || '',
        tutor_id: editingData.tutor_id || '',
        especialidad_id: editingData.especialidad_id || '',
        fecha_ingreso: editingData.fecha_ingreso
          ? editingData.fecha_ingreso.split('T')[0]
          : getCurrentDateForInput(),
        fecha_inicio_tratamiento: editingData.fecha_inicio_tratamiento
          ? editingData.fecha_inicio_tratamiento.split('T')[0]
          : getCurrentDateForInput(),
        fecha_fin_tratamiento: editingData.fecha_fin_tratamiento
          ? editingData.fecha_fin_tratamiento.split('T')[0]
          : '',
        estado_tratamiento: editingData.estado_tratamiento || 'activo',
        observaciones_tratamiento: editingData.observaciones_tratamiento || '',
        observaciones: editingData.observaciones || ''
      });

      if (editingData.persona_id) {
        setPersonaEncontrada({
          id: editingData.persona_id,
          nombre_completo: editingData.nombre_completo,
          cedula: editingData.cedula
        });
      }
      if (editingData.tutor_id) {
        setTutorEncontrado({
          id: editingData.tutor_id,
          nombre_completo: editingData.nombre_tutor,
          cedula: editingData.tutor_cedula || ''
        });
      }
    } else {
      resetForm();
    }
  }, [editingData]);

  /* ---------- Handlers ---------- */
  const resetForm = () => {
    setFormData({
      persona_id: '',
      tutor_id: '',
      especialidad_id: '',
      fecha_ingreso: getCurrentDateForInput(),
      fecha_inicio_tratamiento: getCurrentDateForInput(),
      fecha_fin_tratamiento: '',
      estado_tratamiento: 'activo',
      observaciones_tratamiento: '',
      observaciones: ''
    });
    setErrors({});
    setPersonaEncontrada(null);
    setTutorEncontrado(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePersonaSelectBuscador = (persona) => {
    setPersonaEncontrada({
      ...persona,
      displayName: persona.displayName || `${persona.nombre} ${persona.apellido}`,
      sourceType: 'persona'
    });
    setFormData((prev) => ({ ...prev, persona_id: persona.id }));
    if (errors.persona_id) setErrors((prev) => ({ ...prev, persona_id: '' }));
  };

  const handleTutorSelectBuscador = (tutor) => {
    setTutorEncontrado({
      ...tutor,
      displayName: tutor.displayName || tutor.nombre_completo || `${tutor.nombre} ${tutor.apellido}`,
      sourceType: 'tutor'
    });
    // For tutors, use the tutor ID, not the persona ID
    setFormData((prev) => ({ ...prev, tutor_id: tutor.id }));
    if (errors.tutor_id) setErrors((prev) => ({ ...prev, tutor_id: '' }));
  };

  const handlePersonCreated = (newPerson) => {
    if (newPerson.sourceType === 'persona') {
      handlePersonaSelectBuscador(newPerson);
      setShowPersonForm(false);
    } else if (newPerson.sourceType === 'tutor') {
      handleTutorSelectBuscador(newPerson);
      setShowTutorForm(false);
    }
  };

  const validateForm = () => {
    const backendData = PacienteService.formatForBackend(formData);
    const validation = PacienteService.validatePacienteData(backendData);

    if (!formData.persona_id)
      validation.errors.persona_id = 'Debe seleccionar una persona';
    if (!formData.tutor_id)
      validation.errors.tutor_id = 'Debe seleccionar un tutor';
    if (!formData.especialidad_id)
      validation.errors.especialidad_id = 'Debe seleccionar una especialidad';
    if (!formData.fecha_ingreso)
      validation.errors.fecha_ingreso = 'Debe especificar la fecha de ingreso';
    if (!formData.fecha_inicio_tratamiento)
      validation.errors.fecha_inicio_tratamiento =
        'Debe especificar la fecha de inicio del tratamiento';

    setErrors(validation.errors);
    return (
      validation.isValid &&
      !validation.errors.persona_id &&
      !validation.errors.tutor_id &&
      !validation.errors.especialidad_id
    );
  };

  const buildPayload = (isEdit) => {
    const usuarioId = getUsuarioId();
    const payload = {
      persona_id: parseInt(formData.persona_id, 10),
      tutor_id: parseInt(formData.tutor_id, 10),
      especialidad_id: parseInt(formData.especialidad_id, 10),
      fecha_ingreso: formData.fecha_ingreso || null,
      fecha_inicio_tratamiento: formData.fecha_inicio_tratamiento || null,
      fecha_fin_tratamiento: formData.fecha_fin_tratamiento || null,
      estado_tratamiento: formData.estado_tratamiento || 'activo',
      observaciones_tratamiento: formData.observaciones_tratamiento || '',
      observaciones: formData.observaciones || ''
    };
    if (!isEdit && usuarioId) payload.created_by = usuarioId;
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = buildPayload(isEditing);
      await onSubmit(payload, isEditing);
      resetForm();
    } catch (error) {
      showError(error?.message || 'Ocurrió un error al guardar');
    }
  };

  const personaNombre =
    personaEncontrada?.nombre_completo ||
    '' /* ya viene armado desde el buscador */;
  const tutorNombre =
    tutorEncontrado?.nombre_completo || '' /* idem */;

  const canSubmit =
    !!formData.persona_id &&
    !!formData.tutor_id &&
    !!formData.especialidad_id &&
    !!formData.fecha_ingreso &&
    !!formData.fecha_inicio_tratamiento;

  return (
    <Box>
      {/* Esta sección fue reemplazada por los nuevos componentes individuales arriba */}


      {/* ====== Card Principal (form) ====== */}
      <Card elevation={8} sx={getCardShellSX(theme)}>
        {/* Header dinámico */}
        <Box
          sx={{
            background: isEditing
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
              {isEditing ? 'Editar Paciente' : 'Registrar Paciente'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isEditing
                ? 'Modifica los campos necesarios y guarda los cambios'
                : 'Selecciona persona y tutor, asigna especialidad y define fechas'}
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
                <ModernPersonSelector
                  label="Persona (Paciente)"
                  placeholder="Busca y selecciona la persona que será el paciente"
                  selectedPerson={personaEncontrada}
                  onPersonSelect={handlePersonaSelectBuscador}
                  onClear={() => {
                    setPersonaEncontrada(null);
                    setFormData((p) => ({ ...p, persona_id: '' }));
                  }}
                  searchTypes={['personas']}
                  hideRegisteredPatients={!isEditing}
                  editingPatientId={isEditing ? editingData?.id : null}
                  required={true}
                  error={errors.persona_id}
                  showCreateButton={true}
                  onCreateNew={() => setShowPersonForm(true)}
                  enableFavorites={true}
                  showRecentSelections={true}
                  contextualInfo={true}
                />
              </Box>

              {/* Tutor Selector */}
              <Box sx={{ mb: 3 }}>
                <ModernPersonSelector
                  label="Tutor (Responsable)"
                  placeholder="Busca y selecciona el tutor o responsable del paciente"
                  selectedPerson={tutorEncontrado}
                  onPersonSelect={handleTutorSelectBuscador}
                  onClear={() => {
                    setTutorEncontrado(null);
                    setFormData((p) => ({ ...p, tutor_id: '' }));
                  }}
                  searchTypes={['tutores']}
                  required={true}
                  error={errors.tutor_id}
                  showCreateButton={true}
                  onCreateNew={() => setShowTutorForm(true)}
                  enableFavorites={true}
                  showRecentSelections={true}
                  contextualInfo={true}
                />
              </Box>

              {/* Especialidad */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Especialidad Asignada *
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="especialidad_id"
                  value={formData.especialidad_id}
                  onChange={handleChange}
                  error={!!errors.especialidad_id}
                  helperText={
                    errors.especialidad_id || 'Selecciona la especialidad del plan'
                  }
                  sx={neutralInputSX}
                >
                  <MenuItem value="">Seleccione una especialidad</MenuItem>
                  {especialidades.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.nombre} {e.area ? `— ${e.area}` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Estado de Tratamiento */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Estado del Tratamiento *
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="estado_tratamiento"
                  value={formData.estado_tratamiento}
                  onChange={handleChange}
                  error={!!errors.estado_tratamiento}
                  helperText={errors.estado_tratamiento || 'Define el estado actual'}
                  sx={neutralInputSX}
                >
                  {['activo', 'en pausa', 'completado', 'suspendido'].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {/* ===== Bloque: Fechas ===== */}
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
                <CalendarToday sx={{ mr: 1 }} />
                Fechas del Tratamiento
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Fecha de Ingreso */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Fecha de Ingreso *
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  name="fecha_ingreso"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: getCurrentDateForInput() }}
                  value={formData.fecha_ingreso}
                  onChange={handleChange}
                  error={!!errors.fecha_ingreso}
                  helperText={
                    errors.fecha_ingreso ||
                    'Fecha en que el paciente ingresó al centro'
                  }
                  sx={neutralInputSX}
                />
              </Box>

              {/* Inicio Tratamiento */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Inicio Tratamiento *
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  name="fecha_inicio_tratamiento"
                  InputLabelProps={{ shrink: true }}
                  value={formData.fecha_inicio_tratamiento}
                  onChange={handleChange}
                  error={!!errors.fecha_inicio_tratamiento}
                  helperText={
                    errors.fecha_inicio_tratamiento ||
                    'Fecha de inicio del tratamiento'
                  }
                  sx={neutralInputSX}
                />
              </Box>

              {/* Fin Tratamiento */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Fin Tratamiento
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  name="fecha_fin_tratamiento"
                  InputLabelProps={{ shrink: true }}
                  value={formData.fecha_fin_tratamiento}
                  onChange={handleChange}
                  error={!!errors.fecha_fin_tratamiento}
                  helperText={
                    errors.fecha_fin_tratamiento ||
                    'Fecha estimada de finalización (opcional)'
                  }
                  sx={neutralInputSX}
                />
              </Box>
            </Box>

            {/* ===== Bloque: Observaciones ===== */}
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
              >
                Observaciones
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Observaciones del Tratamiento
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="observaciones_tratamiento"
                  value={formData.observaciones_tratamiento}
                  onChange={handleChange}
                  error={!!errors.observaciones_tratamiento}
                  helperText={
                    errors.observaciones_tratamiento ||
                    'Notas específicas del tratamiento'
                  }
                  placeholder="Detalles específicos del plan de tratamiento..."
                  sx={neutralInputSX}
                />
              </Box>

              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Observaciones Generales
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  error={!!errors.observaciones}
                  helperText={
                    errors.observaciones || 'Notas generales sobre el paciente'
                  }
                  placeholder="Información adicional relevante..."
                  sx={neutralInputSX}
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
                startIcon={isEditing ? <Edit /> : <PersonAdd />}
                size="large"
                disabled={loading || !canSubmit}
              >
                {isEditing ? 'Actualizar Paciente' : 'Registrar Paciente'}
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

      {/* Formularios de Creación */}
      <UnifiedPersonForm
        open={showPersonForm}
        onClose={() => setShowPersonForm(false)}
        onPersonCreated={handlePersonCreated}
        personType="persona"
        title="Crear Nueva Persona (Paciente)"
        enableMultiStep={false}
      />

      <UnifiedPersonForm
        open={showTutorForm}
        onClose={() => setShowTutorForm(false)}
        onPersonCreated={handlePersonCreated}
        personType="tutor"
        title="Crear Nuevo Tutor"
        enableMultiStep={true}
      />
    </Box>
  );
};

export default PacienteFormulario;
