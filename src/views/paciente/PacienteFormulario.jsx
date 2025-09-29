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
  useTheme,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  LocalHospital,
  CalendarToday,
  Assignment,
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon
} from '@mui/icons-material';

import PacienteService from '../../services/pacienteService.js';
import PersonaGeneralSelector from '../../components/shared/PersonaGeneralSelector.jsx';
import TutorSelector from '../../components/shared/TutorSelector.jsx';
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
    especialidades: [], // Array de especialidades
    fecha_ingreso: getCurrentDateForInput(),
    estado_tratamiento: 'activo',
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
      // Formatear especialidades del backend
      const especialidadesList = editingData.especialidades || [];

      setFormData({
        persona_id: editingData.persona_id || '',
        tutor_id: editingData.tutor_id || '',
        especialidades: especialidadesList.map(esp => ({
          id_especialidad: esp.id_especialidad,
          es_principal: esp.es_principal || false,
          prioridad: esp.prioridad || 'media',
          fecha_inicio_tratamiento: esp.fecha_inicio_tratamiento
            ? esp.fecha_inicio_tratamiento.split('T')[0]
            : getCurrentDateForInput(),
          fecha_fin_tratamiento: esp.fecha_fin_tratamiento
            ? esp.fecha_fin_tratamiento.split('T')[0]
            : '',
          observaciones: esp.observaciones || ''
        })),
        fecha_ingreso: editingData.fecha_ingreso
          ? editingData.fecha_ingreso.split('T')[0]
          : getCurrentDateForInput(),
        estado_tratamiento: editingData.estado_tratamiento || 'activo',
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
      especialidades: [],
      fecha_ingreso: getCurrentDateForInput(),
      estado_tratamiento: 'activo',
      observaciones: ''
    });
    setErrors({});
    setPersonaEncontrada(null);
    setTutorEncontrado(null);
  };

  // Handlers para especialidades múltiples
  const agregarEspecialidad = () => {
    const nuevaEspecialidad = {
      id_especialidad: '',
      es_principal: formData.especialidades.length === 0, // Primera especialidad es principal
      prioridad: 'media',
      fecha_inicio_tratamiento: getCurrentDateForInput(),
      fecha_fin_tratamiento: '',
      observaciones: ''
    };

    setFormData(prev => ({
      ...prev,
      especialidades: [...prev.especialidades, nuevaEspecialidad]
    }));
  };

  const removerEspecialidad = (index) => {
    const nuevasEspecialidades = formData.especialidades.filter((_, i) => i !== index);

    // Si removemos la principal, hacer principal la primera disponible
    if (formData.especialidades[index].es_principal && nuevasEspecialidades.length > 0) {
      nuevasEspecialidades[0].es_principal = true;
    }

    setFormData(prev => ({
      ...prev,
      especialidades: nuevasEspecialidades
    }));
  };

  const actualizarEspecialidad = (index, campo, valor) => {
    const nuevasEspecialidades = [...formData.especialidades];
    nuevasEspecialidades[index][campo] = valor;

    // Si se marca como principal, quitar principal de las demás
    if (campo === 'es_principal' && valor === true) {
      nuevasEspecialidades.forEach((esp, i) => {
        if (i !== index) esp.es_principal = false;
      });
    }

    setFormData(prev => ({
      ...prev,
      especialidades: nuevasEspecialidades
    }));
  };

  const marcarComoPrincipal = (index) => {
    actualizarEspecialidad(index, 'es_principal', true);
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
    const errors = {};

    if (!formData.persona_id)
      errors.persona_id = 'Debe seleccionar una persona';
    if (!formData.tutor_id)
      errors.tutor_id = 'Debe seleccionar un tutor';
    if (!formData.fecha_ingreso)
      errors.fecha_ingreso = 'Debe especificar la fecha de ingreso';

    // Validar especialidades
    if (formData.especialidades.length === 0) {
      errors.especialidades = 'Debe agregar al menos una especialidad';
    } else {
      // Validar cada especialidad
      let hasErrors = false;
      formData.especialidades.forEach((esp, index) => {
        if (!esp.id_especialidad) {
          errors[`especialidad_${index}`] = 'Debe seleccionar una especialidad';
          hasErrors = true;
        }
      });

      // Verificar que hay al menos una especialidad principal
      const tieneEspecialidadPrincipal = formData.especialidades.some(esp => esp.es_principal);
      if (!tieneEspecialidadPrincipal && formData.especialidades.length > 0) {
        errors.especialidades = 'Debe marcar al menos una especialidad como principal';
        hasErrors = true;
      }
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = (isEdit) => {
    const usuarioId = getUsuarioId();

    // Para compatibilidad con el backend actual, usar la especialidad principal como especialidad_id
    const especialidadPrincipal = formData.especialidades.find(esp => esp.es_principal);

    const payload = {
      persona_id: parseInt(formData.persona_id, 10),
      tutor_id: parseInt(formData.tutor_id, 10),
      especialidad_id: especialidadPrincipal ? parseInt(especialidadPrincipal.id_especialidad, 10) : null,
      fecha_ingreso: formData.fecha_ingreso || null,
      fecha_inicio_tratamiento: especialidadPrincipal?.fecha_inicio_tratamiento || null,
      fecha_fin_tratamiento: especialidadPrincipal?.fecha_fin_tratamiento || null,
      estado_tratamiento: formData.estado_tratamiento || 'activo',
      observaciones_tratamiento: especialidadPrincipal?.observaciones || '',
      observaciones: formData.observaciones || '',

      // Incluir todas las especialidades para el backend
      especialidades: formData.especialidades.map(esp => ({
        id_especialidad: parseInt(esp.id_especialidad, 10),
        es_principal: esp.es_principal,
        prioridad: esp.prioridad || 'media',
        fecha_inicio_tratamiento: esp.fecha_inicio_tratamiento || null,
        fecha_fin_tratamiento: esp.fecha_fin_tratamiento || null,
        observaciones: esp.observaciones || ''
      }))
    };

    if (!isEdit && usuarioId) {
      payload.created_by = usuarioId;
      payload.usuario_creacion = usuarioId;
    }

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
    formData.especialidades.length > 0 &&
    formData.especialidades.every(esp => esp.id_especialidad) &&
    !!formData.fecha_ingreso;

  return (
    <Box>
      {/* Esta sección fue reemplazada por los nuevos componentes individuales arriba */}


      {/* ====== Card Principal (form) ====== */}
      <Card elevation={8} sx={getCardShellSX(theme)}>
        {/* Header dinámico */}
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
                <Typography variant="body1" mb={1}>
                  Persona (Paciente): <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <PersonaGeneralSelector
                  selectedPersona={personaEncontrada}
                  onSelect={(persona) => {
                    setPersonaEncontrada(persona);
                    setFormData(p => ({ ...p, persona_id: persona.id }));
                  }}
                  placeholder="Busca y selecciona la persona que será el paciente"
                />
                {errors.persona_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.persona_id}
                  </Typography>
                )}
              </Box>

              {/* Tutor Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" mb={1}>
                  Tutor (Responsable): <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <TutorSelector
                  selectedTutor={tutorEncontrado}
                  onSelect={(tutor) => {
                    setTutorEncontrado(tutor);
                    setFormData(p => ({ ...p, tutor_id: tutor.id }));
                  }}
                  placeholder="Busca y selecciona el tutor o responsable del paciente"
                />
                {errors.tutor_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.tutor_id}
                  </Typography>
                )}
              </Box>

              {/* Especialidades Múltiples */}
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Especialidades <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={agregarEspecialidad}
                  >
                    Agregar Especialidad
                  </Button>
                </Box>

                {formData.especialidades.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No hay especialidades asignadas. Haz clic en "Agregar Especialidad" para añadir una.
                  </Typography>
                )}

                {formData.especialidades.map((especialidad, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ pb: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" color="primary">
                          Especialidad {index + 1}
                          {especialidad.es_principal && (
                            <Chip
                              icon={<StarIcon />}
                              label="Principal"
                              color="primary"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Box>
                          {!especialidad.es_principal && (
                            <IconButton
                              size="small"
                              onClick={() => marcarComoPrincipal(index)}
                              title="Marcar como principal"
                            >
                              <StarIcon />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removerEspecialidad(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        {/* Especialidad Select */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            fullWidth
                            label="Especialidad"
                            value={especialidad.id_especialidad}
                            onChange={(e) => actualizarEspecialidad(index, 'id_especialidad', e.target.value)}
                            error={!!errors[`especialidad_${index}`]}
                            helperText={errors[`especialidad_${index}`] || 'Selecciona la especialidad'}
                          >
                            <MenuItem value="">Seleccione una especialidad</MenuItem>
                            {especialidades.map((e) => (
                              <MenuItem key={e.id} value={e.id}>
                                {e.nombre} {e.area ? `— ${e.area}` : ''}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        {/* Prioridad */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            fullWidth
                            label="Prioridad"
                            value={especialidad.prioridad}
                            onChange={(e) => actualizarEspecialidad(index, 'prioridad', e.target.value)}
                          >
                            <MenuItem value="baja">Baja</MenuItem>
                            <MenuItem value="media">Media</MenuItem>
                            <MenuItem value="alta">Alta</MenuItem>
                            <MenuItem value="urgente">Urgente</MenuItem>
                          </TextField>
                        </Grid>

                        {/* Fecha Inicio */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Fecha Inicio Tratamiento"
                            InputLabelProps={{ shrink: true }}
                            value={especialidad.fecha_inicio_tratamiento}
                            onChange={(e) => actualizarEspecialidad(index, 'fecha_inicio_tratamiento', e.target.value)}
                          />
                        </Grid>

                        {/* Fecha Fin */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Fecha Fin Tratamiento (opcional)"
                            InputLabelProps={{ shrink: true }}
                            value={especialidad.fecha_fin_tratamiento}
                            onChange={(e) => actualizarEspecialidad(index, 'fecha_fin_tratamiento', e.target.value)}
                          />
                        </Grid>

                        {/* Observaciones */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Observaciones de la especialidad"
                            value={especialidad.observaciones}
                            onChange={(e) => actualizarEspecialidad(index, 'observaciones', e.target.value)}
                            placeholder="Notas específicas de esta especialidad..."
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}

                {errors.especialidades && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.especialidades}
                  </Typography>
                )}
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
                  Fecha de Ingreso <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
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
                  Inicio Tratamiento <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
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
