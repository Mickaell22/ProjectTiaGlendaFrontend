// src/components/Pacientes/MultipleTutoresManager.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Stack,
  Divider,
  Tooltip,
  FormControlLabel,
  Checkbox,
  useTheme,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  FamilyRestroom as FamilyIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

import TutorSelector from '../shared/TutorSelector.jsx';

const TIPOS_RELACION = [
  'padre',
  'madre',
  'abuelo',
  'abuela',
  'tio',
  'tia',
  'hermano',
  'hermana',
  'primo',
  'prima',
  'tutor_legal',
  'cuidador',
  'otro'
];

const MultipleTutoresManager = ({
  tutores = [],
  onTutoresChange,
  disabled = false,
  errors = {},
  modoEdicion = false
}) => {
  const theme = useTheme();
  const [tutorSeleccionadoIndex, setTutorSeleccionadoIndex] = useState(null);

  const agregarTutor = () => {
    const nuevoTutor = {
      tutor_id: '',
      es_principal: tutores.length === 0, // Primer tutor es principal
      tipo_relacion: '',
      puede_autorizar: true,
      puede_retirar: true,
      contacto_emergencia: tutores.length === 0, // Primer tutor es contacto de emergencia
      prioridad_contacto: tutores.length + 1,
      observaciones: '',
      // Info para mostrar (se llenara al seleccionar)
      nombre_completo: '',
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      cedula: ''
    };

    onTutoresChange([...tutores, nuevoTutor]);
    setTutorSeleccionadoIndex(tutores.length);
  };

  const removerTutor = (index) => {
    if (tutores.length === 1) {
      alert('No se puede remover el único tutor. El paciente debe tener al menos un tutor.');
      return;
    }

    const nuevosTutores = tutores.filter((_, i) => i !== index);

    // Si removemos el principal, hacer principal el primero disponible
    if (tutores[index].es_principal && nuevosTutores.length > 0) {
      nuevosTutores[0].es_principal = true;
      nuevosTutores[0].contacto_emergencia = true;
      nuevosTutores[0].prioridad_contacto = 1;
    }

    // Reordenar prioridades
    nuevosTutores.forEach((tutor, i) => {
      tutor.prioridad_contacto = i + 1;
    });

    onTutoresChange(nuevosTutores);
    setTutorSeleccionadoIndex(null);
  };

  const actualizarTutor = (index, campo, valor) => {
    const nuevosTutores = [...tutores];
    nuevosTutores[index][campo] = valor;

    // Si se marca como principal, quitar principal de los demas
    if (campo === 'es_principal' && valor === true) {
      nuevosTutores.forEach((tut, i) => {
        if (i !== index) {
          tut.es_principal = false;
        }
      });
      // El tutor principal tambien debe ser contacto de emergencia prioritario
      nuevosTutores[index].contacto_emergencia = true;
      nuevosTutores[index].prioridad_contacto = 1;
    }

    onTutoresChange(nuevosTutores);
  };

  const marcarComoPrincipal = (index) => {
    actualizarTutor(index, 'es_principal', true);
  };

  const handleTutorSelect = (index, tutorData) => {
    const nuevosTutores = [...tutores];
    nuevosTutores[index] = {
      ...nuevosTutores[index],
      tutor_id: tutorData.id,
      nombre: tutorData.nombre || '',
      apellido: tutorData.apellido || '',
      nombre_completo: tutorData.nombre_completo || `${tutorData.nombre || ''} ${tutorData.apellido || ''}`.trim(),
      telefono: tutorData.telefono || '',
      correo: tutorData.correo || tutorData.email || '',
      cedula: tutorData.cedula || '',
      tipo_relacion: tutorData.parentesco || nuevosTutores[index].tipo_relacion || '',
      // Guardar el objeto completo para el selector
      _tutorObject: tutorData
    };
    onTutoresChange(nuevosTutores);
  };

  const getTutorLabel = (tutor, index) => {
    if (tutor.nombre_completo && tutor.nombre_completo.trim() !== '') {
      return tutor.nombre_completo;
    }
    if (tutor.nombre || tutor.apellido) {
      return `${tutor.nombre || ''} ${tutor.apellido || ''}`.trim();
    }
    return `Tutor ${index + 1}`;
  };

  const getPrioridadColor = (prioridad) => {
    if (prioridad === 1) return 'error';
    if (prioridad === 2) return 'warning';
    return 'default';
  };

  return (
    <Box>
      {/* Boton Agregar Tutor */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {tutores.length === 0
            ? 'Agrega al menos un tutor responsable para el paciente'
            : `${tutores.length} tutor${tutores.length > 1 ? 'es' : ''} asignado${tutores.length > 1 ? 's' : ''}`
          }
        </Typography>
        <Button
          variant="contained"
          size="medium"
          startIcon={<AddIcon />}
          onClick={agregarTutor}
          disabled={disabled}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Agregar Tutor
        </Button>
      </Box>

      {/* Mensaje si no hay tutores */}
      {tutores.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: 'center',
            border: '3px dashed',
            borderColor: 'primary.light',
            borderRadius: 3,
            backgroundColor: 'primary.lighter',
            mb: 3
          }}
        >
          <FamilyIcon sx={{ fontSize: 72, color: 'primary.main', mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" color="primary.main" gutterBottom fontWeight={600}>
            No hay tutores asignados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Cada paciente debe tener al menos un tutor o responsable legal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Haz clic en "Agregar Tutor" para comenzar
          </Typography>
        </Paper>
      )}

      {/* Lista de Tutores */}
      {tutores.map((tutor, index) => (
        <Card
          key={index}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: tutor.es_principal ? `2px solid ${theme.palette.primary.main}` : '1px solid',
            borderColor: tutor.es_principal ? 'primary.main' : 'divider',
            boxShadow: tutor.es_principal ? 4 : 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: tutor.es_principal ? 6 : 4,
              transform: 'translateY(-2px)'
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Header del tutor con badges */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <FamilyIcon sx={{ fontSize: 28, color: tutor.es_principal ? 'primary.main' : 'text.secondary' }} />
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    {getTutorLabel(tutor, index)}
                  </Typography>
                  {tutor.es_principal && (
                    <Chip
                      icon={<StarIcon />}
                      label="Principal"
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {tutor.contacto_emergencia && (
                    <Chip
                      icon={<WarningIcon />}
                      label={`Emergencia P${tutor.prioridad_contacto}`}
                      size="small"
                      color={getPrioridadColor(tutor.prioridad_contacto)}
                      variant="filled"
                    />
                  )}
                  {tutor.tipo_relacion && (
                    <Chip
                      icon={<FamilyIcon />}
                      label={tutor.tipo_relacion.replace('_', ' ').toUpperCase()}
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  )}
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {!tutor.es_principal && (
                  <Tooltip title="Marcar como principal">
                    <IconButton
                      size="small"
                      onClick={() => marcarComoPrincipal(index)}
                      disabled={disabled}
                      color="primary"
                    >
                      <StarBorderIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Eliminar tutor">
                  <IconButton
                    size="small"
                    onClick={() => removerTutor(index)}
                    disabled={disabled || tutores.length === 1}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Chip label="INFORMACIÓN DEL TUTOR" size="small" color="primary" variant="outlined" />
            </Divider>

            {/* SECCION 1: DATOS BASICOS */}
            <Grid container spacing={3}>
              {/* Selector de Tutor */}
              <Grid item xs={12} md={7}>
                <TutorSelector
                  selectedTutor={tutor._tutorObject || (tutor.tutor_id ? {
                    id: tutor.tutor_id,
                    nombre: tutor.nombre,
                    apellido: tutor.apellido,
                    nombre_completo: tutor.nombre_completo,
                    cedula: tutor.cedula,
                    telefono: tutor.telefono,
                    correo: tutor.correo
                  } : null)}
                  onSelect={(tutorData) => handleTutorSelect(index, tutorData)}
                  placeholder="Buscar y seleccionar tutor..."
                  disabled={disabled || modoEdicion}
                />
                {errors[`tutores.${index}.tutor_id`] && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                    {errors[`tutores.${index}.tutor_id`]}
                  </Typography>
                )}
              </Grid>

              {/* Tipo de Relacion */}
              <Grid item xs={12} md={5}>
                <TextField
                  select
                  fullWidth
                  label="Tipo de Relación *"
                  value={tutor.tipo_relacion || ''}
                  onChange={(e) => actualizarTutor(index, 'tipo_relacion', e.target.value)}
                  disabled={disabled}
                  error={Boolean(errors[`tutores.${index}.tipo_relacion`])}
                  helperText={errors[`tutores.${index}.tipo_relacion`] || 'Especifica la relación con el paciente'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper'
                    }
                  }}
                >
                  {TIPOS_RELACION.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo.replace('_', ' ').charAt(0).toUpperCase() + tipo.replace('_', ' ').slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* SECCION 2: INFO CONTACTO (solo si hay tutor seleccionado) */}
            {tutor.tutor_id && (tutor.nombre_completo || tutor.telefono || tutor.correo || tutor.cedula) && (
              <>
                <Divider sx={{ my: 3 }}>
                  <Chip label="INFORMACIÓN DE CONTACTO" size="small" color="info" variant="outlined" />
                </Divider>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {tutor.telefono && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Teléfono
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {tutor.telefono}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {tutor.correo && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Email
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tutor.correo}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {tutor.cedula && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                        <BadgeIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Cédula
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {tutor.cedula}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {/* SECCION 3: PERMISOS */}
            <Divider sx={{ my: 3 }}>
              <Chip label="PERMISOS Y AUTORIZACIONES" size="small" color="success" variant="outlined" />
            </Divider>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tutor.puede_autorizar}
                      onChange={(e) => actualizarTutor(index, 'puede_autorizar', e.target.checked)}
                      disabled={disabled}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Autorizar tratamientos
                    </Typography>
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tutor.puede_retirar}
                      onChange={(e) => actualizarTutor(index, 'puede_retirar', e.target.checked)}
                      disabled={disabled}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Retirar paciente
                    </Typography>
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tutor.contacto_emergencia}
                      onChange={(e) => actualizarTutor(index, 'contacto_emergencia', e.target.checked)}
                      disabled={disabled || tutor.es_principal}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Contacto emergencia
                    </Typography>
                  }
                />
              </Grid>

              {/* Prioridad de Contacto */}
              {tutor.contacto_emergencia && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="number"
                    fullWidth
                    size="small"
                    label="Prioridad de Contacto"
                    value={tutor.prioridad_contacto}
                    onChange={(e) => actualizarTutor(index, 'prioridad_contacto', parseInt(e.target.value) || 1)}
                    disabled={disabled || tutor.es_principal}
                    inputProps={{ min: 1, max: tutores.length }}
                    helperText="1 = Primera opción, 2 = Segunda opción, etc."
                  />
                </Grid>
              )}
            </Grid>

            {/* SECCION 4: OBSERVACIONES - Ocupa toda la parte inferior */}
            <Divider sx={{ my: 3 }}>
              <Chip label="OBSERVACIONES Y NOTAS ADICIONALES" size="small" color="default" variant="outlined" />
            </Divider>

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Observaciones y Notas Adicionales"
                value={tutor.observaciones || ''}
                onChange={(e) => actualizarTutor(index, 'observaciones', e.target.value)}
                disabled={disabled}
                placeholder="Escribe aquí cualquier información relevante sobre este tutor: horarios preferidos de contacto, restricciones especiales, ubicación, situaciones particulares, acuerdos específicos, etc."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1rem',
                    borderRadius: 2
                  },
                  '& .MuiInputBase-input': {
                    lineHeight: 1.8
                  },
                  '& .MuiInputLabel-root': {
                    fontWeight: 500
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Validacion general */}
      {errors.tutores && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2.5,
            backgroundColor: 'error.lighter',
            borderRadius: 2,
            border: '2px solid',
            borderColor: 'error.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <WarningIcon sx={{ color: 'error.main', fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle2" color="error.main" fontWeight={600}>
              Error de Validación
            </Typography>
            <Typography variant="body2" color="error.dark">
              {errors.tutores}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default MultipleTutoresManager;
