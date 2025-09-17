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

  useTheme
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Security,
  LocalHospital,
  Assignment,
  Visibility as VisibilityIcon,
  VisibilityOff
} from '@mui/icons-material';

import UsuarioService from '../../services/usuarioService.js';
import PersonaService from '../../services/personaService.js';
import CentroService from '../../services/centroService.js';
import ModernPersonSelector from '../../components/shared/ModernPersonSelector.jsx';
import UnifiedPersonForm from '../../components/shared/UnifiedPersonForm.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';

/* ---------- Helpers ---------- */
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
    centro_id: '',
    estado: 'activo' // default interno; NO se muestra en UI
  });
  const [errors, setErrors] = useState({});
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
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
      const personaIdStr = editingData.persona_id != null ? String(editingData.persona_id) : '';
      const rolIdStr = editingData.rol_id != null ? String(editingData.rol_id) : '';

      const centroIdStr = editingData.centro_id != null ? String(editingData.centro_id) : '';

      setFormData({
        persona_id: personaIdStr,
        nombre_usuario: editingData.usuario || editingData.nombre_usuario || '',
        contrasenia: '',
        rol_id: rolIdStr,
        centro_id: centroIdStr,
        estado: editingData.estado || 'activo'
      });

      if (editingData.persona_id) {
        const personaData = {
          id: editingData.persona_id,
          nombre: editingData.nombre_persona || editingData.nombre || '',
          apellido: editingData.apellido_persona || editingData.apellido || '',
          nombre_completo:
            editingData.nombre_persona_completo ||
            editingData.nombre_completo ||
            `${editingData.nombre_persona || editingData.nombre || ''} ${editingData.apellido_persona || editingData.apellido || ''}`.trim(),
          cedula: editingData.cedula || editingData.cedula_persona || ''
        };
        
        setPersonaSeleccionada(personaData);
      }
    } else {
      resetForm();
    }
  }, [editingData]);

  // Sugerir username al elegir persona (solo creación)
  useEffect(() => {
    if (personaSeleccionada && !isEditing) {
      const full =
        personaSeleccionada.nombre_completo ||
        `${personaSeleccionada.nombre || ''} ${personaSeleccionada.apellido || ''}`.trim();
      const [nombre = '', apellido = ''] = full.split(' ');
      const sugerido = UsuarioService.generateUsernameFromName(nombre, apellido);
      setFormData(prev => ({ ...prev, nombre_usuario: sugerido }));
    }
  }, [personaSeleccionada, isEditing]);

  /* ---------- Handlers ---------- */
  const resetForm = () => {
    setFormData({
      persona_id: '',
      nombre_usuario: '',
      contrasenia: '',
      rol_id: '',
      centro_id: '',
      estado: 'activo'
    });
    setErrors({});
    setPersonaSeleccionada(null);
    setShowPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: String(value) }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };


  const handlePersonaSelect = (persona) => {
    setPersonaSeleccionada(persona);
    setFormData(prev => ({ ...prev, persona_id: String(persona.id) }));
    if (errors.persona_id) setErrors(prev => ({ ...prev, persona_id: '' }));
  };

  const validateForm = () => {
    const personaIdNum = parseInt(formData.persona_id, 10);
    const rolIdNum = parseInt(formData.rol_id, 10);
    const centroIdNum = parseInt(formData.centro_id, 10);

    // Usar datos del frontend para validación (sin formatear para backend)
    const frontendData = {
      ...formData,
      persona_id: Number.isInteger(personaIdNum) ? personaIdNum : null,
      rol_id: Number.isInteger(rolIdNum) ? rolIdNum : null,
      centro_id: Number.isInteger(centroIdNum) ? centroIdNum : null
    };

    const validation = UsuarioService.validateUsuarioData(frontendData);

    // Reglas del UI
    if (!Number.isInteger(personaIdNum) || personaIdNum <= 0) {
      validation.errors.persona_id = 'Debe seleccionar una persona';
    }
    if (!Number.isInteger(rolIdNum) || rolIdNum <= 0) {
      validation.errors.rol_id = 'Debe seleccionar un rol';
    }
    if (!Number.isInteger(centroIdNum) || centroIdNum <= 0) {
      validation.errors.centro_id = 'Debe seleccionar un centro';
    }
    if (!formData.nombre_usuario?.trim()) {
      validation.errors.nombre_usuario = 'Ingrese un nombre de usuario';
    }
    if (!isEditing && !formData.contrasenia) {
      validation.errors.contrasenia = 'Ingrese una contraseña';
    }

    setErrors(validation.errors);
    return Object.keys(validation.errors).length === 0;
  };

  const buildPayload = (isEdit) => {
    const payload = {
      persona_id: parseInt(formData.persona_id, 10),
      nombre_usuario: formData.nombre_usuario?.trim(),
      rol_id: parseInt(formData.rol_id, 10),
      centro_id: parseInt(formData.centro_id, 10),
      estado: formData.estado
    };
    
    // Don't include photo in user creation/update payload
    // Photos are handled separately via dedicated endpoint
    
    if (!isEdit) {
      payload.contrasenia = formData.contrasenia;
      const uid = getUsuarioId();
      if (uid) payload.created_by = uid;
    }
    return UsuarioService.formatForBackend(payload);
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
  const personaOk = Number.isInteger(parseInt(formData.persona_id, 10)) && parseInt(formData.persona_id, 10) > 0;
  const rolOk = Number.isInteger(parseInt(formData.rol_id, 10)) && parseInt(formData.rol_id, 10) > 0;
  const centroOk = Number.isInteger(parseInt(formData.centro_id, 10)) && parseInt(formData.centro_id, 10) > 0;
  const userOk = !!formData.nombre_usuario?.trim();
  const passOk = isEditing || !!formData.contrasenia;

  return (
    <Box>
      {/* ===== Buscador de Persona (SOLO personas) con header morado ===== */}
      {!personaSeleccionada && (
        <Card elevation={8} sx={cardShellSX}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: theme.palette.secondary.contrastText,
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
                Busca y selecciona la persona que será asociada a este usuario del sistema.
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <ModernPersonSelector
              selectedPerson={personaSeleccionada ? {
                ...personaSeleccionada,
                displayName: personaSeleccionada.nombre_completo || `${personaSeleccionada.nombre} ${personaSeleccionada.apellido}`,
                sourceType: 'persona'
              } : null}
              onPersonSelect={(person) => handlePersonaSelect({
                ...person,
                displayName: person.displayName || `${person.nombre} ${person.apellido}`
              })}
              onClear={() => {
                setPersonaSeleccionada(null);
                setFormData(prev => ({ ...prev, persona_id: '', nombre_usuario: '' }));
              }}
              label="Usuario"
              placeholder="Buscar y seleccionar persona para el usuario"
              required
              error={errors.persona_id}
              searchTypes={['personas']}
              hideRegisteredPatients={false}
              showCreateButton={true}
              onCreateNew={() => setShowPersonForm(true)}
              contextualInfo={true}
              enableFavorites={true}
              showRecentSelections={true}
            />
          </CardContent>
        </Card>
      )}

      {/* ===== Persona Seleccionada con el mismo estilo morado ===== */}
      {personaSeleccionada && (
        <Card elevation={8} sx={cardShellSX}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: theme.palette.success.contrastText,
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

            {!isEditing && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setPersonaSeleccionada(null);
                  setFormData(prev => ({ ...prev, persona_id: '', nombre_usuario: '' }));
                }}
              >
                Cambiar Persona
              </Button>
            )}
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.light', borderRadius: 1, backgroundColor: 'background.paper' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    👤 DATOS DE LA PERSONA
                  </Typography>
                  <Typography>
                    <strong>Nombre:</strong>{' '}
                    {personaSeleccionada.nombre_completo ||
                      (PersonaService.getFullName
                        ? PersonaService.getFullName(personaSeleccionada)
                        : `${personaSeleccionada.nombre || ''} ${personaSeleccionada.apellido || ''}`.trim())}
                  </Typography>
                  <Typography><strong>Cédula:</strong> {personaSeleccionada.cedula || '—'}</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

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
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
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

              {/* Persona */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
                  gap: 2,
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Persona *</Typography>
                <TextField
                  fullWidth
                  value={
                    personaSeleccionada
                      ? (personaSeleccionada.nombre_completo ||
                        (PersonaService.getFullName
                          ? PersonaService.getFullName(personaSeleccionada)
                          : `${personaSeleccionada.nombre || ''} ${personaSeleccionada.apellido || ''}`.trim()))
                      : ''
                  }
                  placeholder="Seleccione una persona desde el buscador"
                  InputProps={{ readOnly: true }}
                  error={!!errors.persona_id}
                  helperText={errors.persona_id}
                />
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
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Rol *</Typography>
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

              {/* Centro */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
                  gap: 2,
                  alignItems: 'center'
                }}
              >
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Centro *</Typography>
                <TextField
                  select
                  fullWidth
                  name="centro_id"
                  value={formData.centro_id}
                  onChange={handleChange}
                  error={!!errors.centro_id}
                  helperText={errors.centro_id || 'Seleccione el centro donde trabajará'}
                  size="medium"
                >
                  <MenuItem value="">Seleccione un centro</MenuItem>
                  {centrosDisponibles.map((centro) => (
                    <MenuItem key={String(centro.id)} value={String(centro.id)}>
                      {centro.nombre}
                    </MenuItem>
                  ))}
                </TextField>
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
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>Nombre de usuario *</Typography>
                  <TextField
                    fullWidth
                    name="nombre_usuario"
                    value={formData.nombre_usuario}
                    onChange={handleChange}
                    error={!!errors.nombre_usuario}
                    helperText={errors.nombre_usuario || 'Solo letras, números y guiones bajos'}
                    placeholder="usuario123"
                  />
                </Grid>

                {/* Contraseña (solo creación) */}
                {!isEditing && (
                  <Grid item xs={12} md={6}>
                    <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>Contraseña *</Typography>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      name="contrasenia"
                      value={formData.contrasenia}
                      onChange={handleChange}
                      error={!!errors.contrasenia}
                      helperText={errors.contrasenia}
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
                color="primary"
                startIcon={isEditing ? <Edit /> : <PersonAdd />}
                size="large"
                disabled={loading || !personaOk || !rolOk || !centroOk || !userOk || !passOk}
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
