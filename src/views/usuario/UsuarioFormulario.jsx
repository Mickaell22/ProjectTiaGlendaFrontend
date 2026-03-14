// src/views/usuarios/UsuarioFormulario.jsx
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
  InputAdornment,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  useTheme
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Security,
  LocalHospital,
  Assignment,
  Visibility as VisibilityIcon,
  VisibilityOff,
  Business,
  Person
} from '@mui/icons-material';

import UsuarioService from '../../services/usuarioService.js';
import PersonaService from '../../services/personaService.js';
import CentroService from '../../services/centroService.js';
import PersonaGeneralSelector from '../../components/shared/PersonaGeneralSelector.jsx';
import UnifiedPersonForm from '../../components/shared/UnifiedPersonForm.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';

/* ---------- Componente ---------- */
const UsuarioFormulario = ({
  editingData = null,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    persona_id: '',
    nombre_usuario: '',
    contrasenia: '',
    rol_id: '',
    centro_id: '', // Se mantiene para compatibilidad con edición
    centros_ids: [], // NUEVO: Array de IDs de centros seleccionados
    estado: 'activo' // default interno; NO se muestra en UI
  });
  const [errors, setErrors] = useState({});
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [centrosDisponibles, setCentrosDisponibles] = useState([]);
  const [showPersonForm, setShowPersonForm] = useState(false);

  const { showError } = useSnackbar();
  const isEditing = !!editingData;

  // ancho responsivo y centrado para las tarjetas
  const cardShellSX = {
    borderRadius: 4,
    mb: 3,
    backgroundColor: 'background.paper',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
    overflow: 'hidden',
    // 🔹 Responsivo: 100% en móvil, límites progresivos en pantallas mayores
    width: '100%',
    maxWidth: { xs: '100%', sm: 680, md: 820, lg: 900 },
    mx: 'auto'
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [roles, centros] = await Promise.all([
          UsuarioService.getRolesFromBackend().catch(() => UsuarioService.getRoles()),
          CentroService.getAll().catch(() => [])
        ]);
        setRolesDisponibles(roles);
        setCentrosDisponibles(centros);
      } catch (error) {
        console.error('Error cargando datos:', error);
        showError('Error cargando datos del sistema');
      }
    };
    
    cargarDatos();
  }, [showError]);

  useEffect(() => {
    if (editingData) {
      // Buscar persona_id en diferentes variantes
      const personaIdRaw = editingData.persona_id ?? editingData.id_persona ?? null;
      const personaIdStr = personaIdRaw != null ? String(personaIdRaw) : '';

      const rolIdStr = editingData.rol_id != null ? String(editingData.rol_id) : '';
      const centroIdStr = editingData.centro_id != null ? String(editingData.centro_id) : '';

      // Obtener centros del usuario para edición
      let centrosIds = [];
      if (editingData.centros && Array.isArray(editingData.centros) && editingData.centros.length > 0) {
        // Si viene como array de objetos
        centrosIds = editingData.centros.map(c => parseInt(c.id ?? c, 10)).filter(id => !isNaN(id));
      } else if (editingData.centros_ids && Array.isArray(editingData.centros_ids) && editingData.centros_ids.length > 0) {
        // Si viene como array de IDs
        centrosIds = editingData.centros_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      } else if (centroIdStr) {
        // Fallback: solo tiene un centro
        centrosIds = [parseInt(centroIdStr, 10)];
      }

      setFormData({
        persona_id: personaIdStr,
        nombre_usuario: editingData.usuario || editingData.nombre_usuario || '',
        contrasenia: '',
        rol_id: rolIdStr,
        centro_id: centroIdStr,
        centros_ids: centrosIds,
        estado: editingData.estado || 'activo'
      });

      // Cargar datos de la persona si existe
      if (personaIdRaw) {
        const personaData = {
          id: personaIdRaw,
          nombre: editingData.nombre_persona || editingData.nombre || '',
          apellido: editingData.apellido_persona || editingData.apellido || '',
          nombre_completo:
            editingData.nombre_persona_completo ||
            editingData.nombre_completo ||
            `${editingData.nombre_persona || editingData.nombre || ''} ${editingData.apellido_persona || editingData.apellido || ''}`.trim(),
          cedula: editingData.cedula || editingData.cedula_persona || ''
        };

        setPersonaEncontrada(personaData);
      }
    } else {
      resetForm();
    }
  }, [editingData]);

  // Sugerir username al elegir persona (solo creación)
  useEffect(() => {
    if (personaEncontrada && !isEditing) {
      const full =
        personaEncontrada.nombre_completo ||
        `${personaEncontrada.nombre || ''} ${personaEncontrada.apellido || ''}`.trim();
      const [nombre = '', apellido = ''] = full.split(' ');
      const sugerido = UsuarioService.generateUsernameFromName(nombre, apellido);
      setFormData(prev => ({ ...prev, nombre_usuario: sugerido }));
    }
  }, [personaEncontrada, isEditing]);

  /* ---------- Handlers ---------- */
  const resetForm = () => {
    setFormData({
      persona_id: '',
      nombre_usuario: '',
      contrasenia: '',
      rol_id: '',
      centro_id: '',
      centros_ids: [],
      estado: 'activo'
    });
    setErrors({});
    setPersonaEncontrada(null);
    setShowPassword(false);
  };

  // Manejador para selección de centros (solo en modo creación)
  const handleCentroToggle = (centroId) => {
    setFormData(prev => {
      const currentIds = prev.centros_ids || [];
      const isSelected = currentIds.includes(centroId);

      return {
        ...prev,
        centros_ids: isSelected
          ? currentIds.filter(id => id !== centroId)
          : [...currentIds, centroId]
      };
    });

    if (errors.centros_ids) setErrors(prev => ({ ...prev, centros_ids: '' }));
  };

  // Manejador para "Seleccionar Todos"
  const handleSeleccionarTodos = () => {
    const todosLosIds = centrosDisponibles.map(c => c.id);
    setFormData(prev => ({ ...prev, centros_ids: todosLosIds }));
    if (errors.centros_ids) setErrors(prev => ({ ...prev, centros_ids: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: String(value) }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };


  const handlePersonaSelect = (persona) => {
    setPersonaEncontrada(persona);
    setFormData(prev => ({ ...prev, persona_id: String(persona.id) }));
    if (errors.persona_id) setErrors(prev => ({ ...prev, persona_id: '' }));
  };

  const validateForm = () => {
    const personaIdNum = parseInt(formData.persona_id, 10);
    const rolIdNum = parseInt(formData.rol_id, 10);
    const centroIdNum = parseInt(formData.centro_id, 10);

    // Inicializar errores manualmente en lugar de usar el servicio
    const validationErrors = {};

    // Reglas del UI
    // En edición, persona_id NO es obligatoria (ya tiene una asignada)
    if (!isEditing && (!Number.isInteger(personaIdNum) || personaIdNum <= 0)) {
      validationErrors.persona_id = 'Debe seleccionar una persona';
    }

    if (!Number.isInteger(rolIdNum) || rolIdNum <= 0) {
      validationErrors.rol_id = 'Debe seleccionar un rol';
    }

    // Validación de centros: AHORA SIEMPRE valida centros_ids (múltiples centros)
    if (!formData.centros_ids || formData.centros_ids.length === 0) {
      validationErrors.centros_ids = 'Debe seleccionar al menos un centro';
    }

    if (!formData.nombre_usuario?.trim()) {
      validationErrors.nombre_usuario = 'Ingrese un nombre de usuario';
    } else if (formData.nombre_usuario.trim().length < 3) {
      validationErrors.nombre_usuario = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.nombre_usuario.trim())) {
      validationErrors.nombre_usuario = 'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos';
    }

    // Validar contraseña solo en modo creación
    if (!isEditing) {
      if (!formData.contrasenia) {
        validationErrors.contrasenia = 'Ingrese una contraseña';
      } else if (formData.contrasenia.length < 6) {
        validationErrors.contrasenia = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const buildPayload = (isEdit) => {
    const payload = {
      usuario: formData.nombre_usuario?.trim(),
      id_rol: parseInt(formData.rol_id, 10),
      estado: formData.estado,
      centros_ids: formData.centros_ids.map(id => parseInt(id, 10))
    };

    if (!isEdit) {
      payload.id_persona = parseInt(formData.persona_id, 10);
      payload.contrasenia = formData.contrasenia;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = buildPayload(isEditing);

      await onSubmit(payload, isEditing);

      resetForm();
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      showError(error?.message || 'Ocurrió un error al guardar');
    }
  };

  /* ---------- Password Strength UI ---------- */
  const PasswordStrength = ({ value }) => {
    if (!value) return null;
    const strength = UsuarioService.validatePasswordStrength(value);
    const pct = (strength.score / 5) * 100;
    return (
      <Box mt={1}>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="caption" sx={{ mr: 1 }}>
            Fortaleza:
          </Typography>
          <Chip label={strength.strength} color={strength.color} size="small" />
        </Box>
        <LinearProgress variant="determinate" value={pct} color={strength.color} sx={{ mb: 1 }} />
        {strength.suggestions.length > 0 && (
          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="caption">Sugerencias:</Typography>
            <List dense>
              {strength.suggestions.map((s, i) => (
                <ListItem key={i} sx={{ py: 0 }}>
                  <ListItemText
                    primary={`• ${s}`}
                    primaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
      </Box>
    );
  };

  /* ---------- Render ---------- */
  // En edición, persona es OK si ya tiene persona_id (no necesita reseleccionar)
  // En creación, persona es OK solo si está seleccionada
  const personaOk = isEditing
    ? (Number.isInteger(parseInt(formData.persona_id, 10)) && parseInt(formData.persona_id, 10) > 0)
    : (Number.isInteger(parseInt(formData.persona_id, 10)) && parseInt(formData.persona_id, 10) > 0);

  const rolOk = Number.isInteger(parseInt(formData.rol_id, 10)) && parseInt(formData.rol_id, 10) > 0;

  // SIEMPRE valida centros_ids (tanto en creación como edición)
  const centroOk = formData.centros_ids && formData.centros_ids.length > 0;

  const userOk = !!formData.nombre_usuario?.trim();
  const passOk = isEditing || !!formData.contrasenia;

  return (
    <Box>


      {/* ===== Card principal (estilo Paciente) ===== */}
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          backgroundColor: 'background.paper',
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : '1px solid transparent',
          borderColor: theme.palette.mode === 'dark' ? 'divider' : 'divider',
          overflow: 'hidden',
          // 🔹 Responsivo: mismo ancho que los otros cards
          width: '100%',
          maxWidth: { xs: '100%', sm: 680, md: 820, lg: 900 },
          mx: 'auto'
        }}
      >
        {/* Header dinámico */}
        <Box
          sx={{
            background: isEditing
              ? `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: isEditing ? theme.palette.warning.contrastText : theme.palette.primary.contrastText,
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" >
              <LocalHospital sx={{ mr: 1 }} />
              {isEditing ? 'Editar Usuario' : 'Registrar Usuario'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isEditing
                ? 'Modifica los campos necesarios y guarda los cambios'
                : 'Selecciona una persona y define rol y credenciales'}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* ===== Bloque: Asignación ===== */}
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }} display="flex" alignItems="center">
                <Assignment sx={{ mr: 1 }} />
                Asignación
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Persona Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" mb={1}>
                  Persona (Usuario): {!isEditing && <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>}
                  {isEditing && <span style={{ color: 'gray', fontSize: '0.85rem' }}> (Opcional - ya asignada)</span>}
                </Typography>

                {isEditing ? (
                  // Modo edición: Mostrar persona actual con opción de cambiar
                  <Box>
                    {personaEncontrada ? (
                      <Box
                        sx={{
                          p: 2,
                          border: '2px solid',
                          borderColor: 'success.main',
                          borderRadius: 2,
                          bgcolor: 'success.50',
                          mb: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Person sx={{ fontSize: 32, color: 'success.main' }} />
                            <Box>
                              <Typography variant="body1" fontWeight="bold">
                                {personaEncontrada.nombre_completo ||
                                 `${personaEncontrada.nombre || ''} ${personaEncontrada.apellido || ''}`.trim() ||
                                 'Sin nombre'}
                              </Typography>
                              {personaEncontrada.cedula && (
                                <Typography variant="caption" color="text.secondary">
                                  Cédula: {personaEncontrada.cedula}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Chip label="Persona asignada" color="success" size="small" />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          ID de Persona: {formData.persona_id || 'No disponible'}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          p: 2,
                          border: '2px solid',
                          borderColor: 'info.main',
                          borderRadius: 2,
                          bgcolor: 'info.50',
                          mb: 1
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Persona asignada (ID: {formData.persona_id || 'No disponible'})
                        </Typography>
                      </Box>
                    )}

                    {/* Selector opcional para cambiar persona */}
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Si deseas cambiar la persona asignada, selecciona una nueva:
                      </Typography>
                      <PersonaGeneralSelector
                        selectedPersona={personaEncontrada}
                        onSelect={(persona) => handlePersonaSelect(persona)}
                        placeholder="Cambiar persona (opcional)"
                      />
                    </Box>
                  </Box>
                ) : (
                  // Modo creación: Selector obligatorio
                  <PersonaGeneralSelector
                    selectedPersona={personaEncontrada}
                    onSelect={(persona) => handlePersonaSelect(persona)}
                    placeholder="Busca y selecciona la persona para el usuario"
                  />
                )}

                {errors.persona_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.persona_id}
                  </Typography>
                )}
              </Box>

              {/* Rol */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
                  gap: 2,
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Rol <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="rol_id"
                  value={formData.rol_id}
                  onChange={handleChange}
                  error={!!errors.rol_id}
                  helperText={errors.rol_id || 'Seleccione el rol del usuario'}
                  size="medium"
                >
                  <MenuItem value="">Seleccione un rol</MenuItem>
                  {rolesDisponibles.map((rol) => (
                    <MenuItem key={String(rol.value)} value={String(rol.value)}>
                      {rol.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Centros (múltiples) - SIEMPRE (creación y edición) */}
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business />
                  Centros de Trabajo <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    border: '2px solid',
                    borderColor: errors.centros_ids ? 'error.main' : 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.default'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {isEditing
                        ? 'Modifica los centros a los que tiene acceso el usuario'
                        : 'Selecciona los centros a los que tendrá acceso el usuario'}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleSeleccionarTodos}
                      disabled={formData.centros_ids?.length === centrosDisponibles.length}
                    >
                      Seleccionar Todos
                    </Button>
                  </Stack>

                  <FormGroup>
                    {centrosDisponibles.map((centro) => (
                      <FormControlLabel
                        key={centro.id}
                        control={
                          <Checkbox
                            checked={formData.centros_ids?.includes(centro.id) || false}
                            onChange={() => handleCentroToggle(centro.id)}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business sx={{ fontSize: 20, color: 'primary.main' }} />
                            <Typography variant="body1">{centro.nombre}</Typography>
                            {centro.codigo && (
                              <Chip label={centro.codigo} size="small" variant="outlined" />
                            )}
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>

                  {errors.centros_ids && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {errors.centros_ids}
                    </FormHelperText>
                  )}

                  {formData.centros_ids?.length > 0 && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Centros seleccionados: {formData.centros_ids.length}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* ===== Bloque: Credenciales ===== */}
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }} display="flex" alignItems="center">
                <Security sx={{ mr: 1 }} />
                Credenciales
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {/* Nombre de usuario */}
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                    Nombre de usuario <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    name="nombre_usuario"
                    value={formData.nombre_usuario}
                    onChange={handleChange}
                    error={!!errors.nombre_usuario}
                    helperText={errors.nombre_usuario || 'Solo letras, números, puntos, guiones y guiones bajos'}
                    placeholder="usuario123"
                  />
                </Grid>

                {/* Contraseña (solo creación) */}
                {!isEditing && (
                  <Grid item xs={12} md={6}>
                    <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                      Contraseña <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      name="contrasenia"
                      value={formData.contrasenia}
                      onChange={handleChange}
                      error={!!errors.contrasenia}
                      helperText={errors.contrasenia}
                      placeholder="MiPassword123!"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <PasswordStrength value={formData.contrasenia} />
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* ===== Acciones ===== */}
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                type="submit"
                startIcon={isEditing ? <Edit /> : <PersonAdd />}
                size="large"
                disabled={loading || !personaOk || !rolOk || !centroOk || !userOk || !passOk}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                {isEditing ? 'Actualizar Usuario' : 'Registrar Usuario'}
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

      {/* Formulario de Creación de Persona */}
      <UnifiedPersonForm
        open={showPersonForm}
        onClose={() => setShowPersonForm(false)}
        onPersonCreated={(newPerson) => {
          handlePersonaSelect({
            ...newPerson,
            displayName: newPerson.displayName || `${newPerson.nombre} ${newPerson.apellido}`
          });
          setShowPersonForm(false);
        }}
        personType="persona"
        title="Crear Nueva Persona (Usuario)"
        enableMultiStep={false}
      />
    </Box>
  );
};

export default UsuarioFormulario;
