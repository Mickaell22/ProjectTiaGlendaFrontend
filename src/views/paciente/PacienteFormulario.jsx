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
  CardContent
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  LocalHospital,
  CalendarToday,
  Assignment
} from '@mui/icons-material';

import PacienteService from '../../services/pacienteService.js';
import BuscadorPersonas from '../../components/shared/BuscadorPersonas.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';

// Helper functions
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

const PacienteFormulario = ({ 
  editingData = null, 
  especialidades = [], 
  onSubmit, 
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    persona_id: '',
    tutor_id: '',
    especialidad_id: '',
    fecha_ingreso: getCurrentDateForInput(),
    fecha_inicio_tratamiento: getCurrentDateForInput(),
    fecha_fin_tratamiento: '',
    estado_tratamiento: 'activo',
    observaciones_tratamiento: '',
    observaciones: '',
  });
  const [errors, setErrors] = useState({});
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [tutorEncontrado, setTutorEncontrado] = useState(null);

  const { showError } = useSnackbar();
  const isEditing = !!editingData;

  useEffect(() => {
    if (editingData) {
      setFormData({
        persona_id: editingData.persona_id || '',
        tutor_id: editingData.tutor_id || '',
        especialidad_id: editingData.especialidad_id || '',
        fecha_ingreso: editingData.fecha_ingreso ? editingData.fecha_ingreso.split('T')[0] : getCurrentDateForInput(),
        fecha_inicio_tratamiento: editingData.fecha_inicio_tratamiento ? editingData.fecha_inicio_tratamiento.split('T')[0] : getCurrentDateForInput(),
        fecha_fin_tratamiento: editingData.fecha_fin_tratamiento ? editingData.fecha_fin_tratamiento.split('T')[0] : '',
        estado_tratamiento: editingData.estado_tratamiento || 'activo',
        observaciones_tratamiento: editingData.observaciones_tratamiento || '',
        observaciones: editingData.observaciones || '',
      });
      
      // Si estamos editando, cargar la persona y tutor actuales
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
      observaciones: '',
    });
    setErrors({});
    setPersonaEncontrada(null);
    setTutorEncontrado(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePersonaSelectBuscador = (persona) => {
    setPersonaEncontrada(persona);
    setFormData(prev => ({ ...prev, persona_id: persona.id }));
    if (errors.persona_id) setErrors(prev => ({ ...prev, persona_id: '' }));
  };

  const handleTutorSelectBuscador = (tutor) => {
    setTutorEncontrado(tutor);
    setFormData(prev => ({ ...prev, tutor_id: tutor.id }));
    if (errors.tutor_id) setErrors(prev => ({ ...prev, tutor_id: '' }));
  };

  const validateForm = () => {
    const backendData = PacienteService.formatForBackend(formData);
    const validation = PacienteService.validatePacienteData(backendData);
    
    // Validaciones adicionales específicas
    if (!formData.persona_id) validation.errors.persona_id = 'Debe seleccionar una persona';
    if (!formData.tutor_id) validation.errors.tutor_id = 'Debe seleccionar un tutor';
    if (!formData.especialidad_id) validation.errors.especialidad_id = 'Debe seleccionar una especialidad';
    
    // Validación de fecha de ingreso (obligatoria)
    if (!formData.fecha_ingreso) {
      validation.errors.fecha_ingreso = 'Debe especificar la fecha de ingreso';
    }

    // Validación de fecha de inicio de tratamiento (obligatoria)
    if (!formData.fecha_inicio_tratamiento) {
      validation.errors.fecha_inicio_tratamiento = 'Debe especificar la fecha de inicio del tratamiento';
    }

    setErrors(validation.errors);
    return validation.isValid && !validation.errors.persona_id && !validation.errors.tutor_id && !validation.errors.especialidad_id;
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
      observaciones: formData.observaciones || '',
    };

    if (!isEdit && usuarioId) {
      payload.created_by = usuarioId;
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
      showError(error.message);
    }
  };

  return (
    <Box>
      {/* Buscador de Personas */}
      {!isEditing && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            🔍 Buscar Persona y Tutor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Busca y selecciona la persona (paciente) y el tutor/representante
          </Typography>
          <BuscadorPersonas
            onPersonaSelect={handlePersonaSelectBuscador}
            onTutorSelect={handleTutorSelectBuscador}
            showPersonas={true}
            showTutores={true}
            compact={true}
            maxHeight={350}
            hideRegisteredPatients={true}
            editingPatientId={editingData?.id}
          />
        </Paper>
      )}

      {/* Mostrar Persona y Tutor Seleccionados */}
      {(personaEncontrada || tutorEncontrado) && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9ff' }}>
          <Typography variant="h6" gutterBottom color="primary">
            ✅ Selección Actual
          </Typography>
          <Grid container spacing={3}>
            {personaEncontrada && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    👤 PERSONA SELECCIONADA
                  </Typography>
                  <Typography><strong>Nombre:</strong> {personaEncontrada.nombre_completo || `${personaEncontrada.nombre} ${personaEncontrada.apellido}`}</Typography>
                  <Typography><strong>Cédula:</strong> {personaEncontrada.cedula}</Typography>
                </Box>
              </Grid>
            )}
            {tutorEncontrado && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'secondary.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="secondary" gutterBottom>
                    👥 TUTOR SELECCIONADO
                  </Typography>
                  <Typography><strong>Nombre:</strong> {tutorEncontrado.nombre_completo || `${tutorEncontrado.nombre} ${tutorEncontrado.apellido}`}</Typography>
                  <Typography><strong>Cédula:</strong> {tutorEncontrado.cedula}</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Formulario Principal */}
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
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

        <CardContent sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* ===== Bloque: Asignación ===== */}
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }} display="flex" alignItems="center">
                <Assignment sx={{ mr: 1 }} />
                Asignación
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Especialidad */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
                  gap: 2,
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Especialidad Asignada *</Typography>
                <TextField
                  select
                  fullWidth
                  name="especialidad_id"
                  value={formData.especialidad_id}
                  onChange={handleChange}
                  error={!!errors.especialidad_id}
                  helperText={errors.especialidad_id || 'Selecciona la especialidad del plan'}
                  size="medium"
                >
                  <MenuItem value="">Seleccione una especialidad</MenuItem>
                  {especialidades.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.nombre} {e.area ? `— ${e.area}` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Estado Tratamiento */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Estado del Tratamiento *</Typography>
                <TextField
                  select
                  fullWidth
                  name="estado_tratamiento"
                  value={formData.estado_tratamiento}
                  onChange={handleChange}
                  error={!!errors.estado_tratamiento}
                  helperText={errors.estado_tratamiento || 'Define el estado actual'}
                  size="medium"
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
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }} display="flex" alignItems="center">
                <CalendarToday sx={{ mr: 1 }} />
                Fechas del Tratamiento
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {/* Fecha de Ingreso */}
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>Fecha de Ingreso *</Typography>
                  <TextField
                    fullWidth
                    type="date"
                    name="fecha_ingreso"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: getCurrentDateForInput() }}
                    value={formData.fecha_ingreso}
                    onChange={handleChange}
                    error={!!errors.fecha_ingreso}
                    helperText={errors.fecha_ingreso || 'Fecha en que el paciente ingresó al centro'}
                    size="medium"
                  />
                </Grid>

                {/* Inicio Tratamiento */}
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>Inicio Tratamiento *</Typography>
                  <TextField
                    fullWidth
                    type="date"
                    name="fecha_inicio_tratamiento"
                    InputLabelProps={{ shrink: true }}
                    value={formData.fecha_inicio_tratamiento}
                    onChange={handleChange}
                    error={!!errors.fecha_inicio_tratamiento}
                    helperText={errors.fecha_inicio_tratamiento || 'Fecha de inicio del tratamiento'}
                    size="medium"
                  />
                </Grid>

                {/* Fin Tratamiento */}
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>Fin Tratamiento</Typography>
                  <TextField
                    fullWidth
                    type="date"
                    name="fecha_fin_tratamiento"
                    InputLabelProps={{ shrink: true }}
                    value={formData.fecha_fin_tratamiento}
                    onChange={handleChange}
                    error={!!errors.fecha_fin_tratamiento}
                    helperText={errors.fecha_fin_tratamiento || 'Fecha estimada de finalización (opcional)'}
                    size="medium"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ===== Bloque: Observaciones ===== */}
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Observaciones
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {/* Observaciones del Tratamiento */}
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>Observaciones del Tratamiento</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="observaciones_tratamiento"
                    value={formData.observaciones_tratamiento}
                    onChange={handleChange}
                    error={!!errors.observaciones_tratamiento}
                    helperText={errors.observaciones_tratamiento || 'Notas específicas del tratamiento'}
                    placeholder="Detalles específicos del plan de tratamiento..."
                  />
                </Grid>

                {/* Observaciones Generales */}
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>Observaciones Generales</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    error={!!errors.observaciones}
                    helperText={errors.observaciones || 'Notas generales sobre el paciente'}
                    placeholder="Información adicional relevante..."
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Botones de acción */}
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                type="submit" 
                color="primary"
                startIcon={isEditing ? <Edit /> : <PersonAdd />}
                size="large"
                disabled={loading || !formData.persona_id || !formData.tutor_id || !formData.especialidad_id}
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
                Cancelar xd
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PacienteFormulario;