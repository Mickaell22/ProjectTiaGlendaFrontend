// src/views/tutores/TutorFormulario.jsx
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
  Chip,
  useTheme
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  FamilyRestroom,
  Work,
  Phone,
  Home,
  Assignment,
  Person
} from '@mui/icons-material';

import TutorService from '../../services/tutorService.js';
import PersonaGeneralSelector from '../../components/shared/PersonaGeneralSelector.jsx';
import UnifiedPersonForm from '../../components/shared/UnifiedPersonForm.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';

/* ---------- Estilos coherentes con Persona/Personal ---------- */
// Inputs sin estilos morados: usamos el tema por defecto
const neutralInputSX = {};

// Misma “carcasa”/tamaño que Persona/Usuario/Personal
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

/* ---------- Helpers para edición robusta ---------- */
function buildNombreCompleto({ nombre = '', apellido = '', nombres = '', apellidos = '', nombre_completo = '' }) {
  if (nombre_completo && nombre_completo.trim()) return nombre_completo.trim();

  const n = (nombres || nombre || '').trim();
  const a = (apellidos || apellido || '').trim();
  return `${n} ${a}`.trim();
}

function resolveSelectedPerson(editingData, personasDisponibles) {
  if (!editingData) return null;

  // 1) Si viene anidado (editingData.persona o .person)
  const p = editingData.persona || editingData.person || null;
  if (p) {
    return {
      id: p.id ?? editingData.id_persona ?? editingData.persona_id ?? editingData.personaId ?? null,
      nombre: p.nombre || '',
      apellido: p.apellido || '',
      nombre_completo: buildNombreCompleto(p),
      cedula: p.cedula || editingData.cedula || '',
      telefono: p.telefono || editingData.telefono || '',
      correo: p.correo || editingData.correo || ''
    };
  }

  // 2) Intentar encontrarla en la lista recibida por props
  const pid = editingData.id_persona ?? editingData.persona_id ?? editingData.personaId ?? null;
  if (pid && Array.isArray(personasDisponibles) && personasDisponibles.length) {
    const fromList = personasDisponibles.find(x => x.id === pid);
    if (fromList) {
      return {
        id: fromList.id,
        nombre: fromList.nombre || '',
        apellido: fromList.apellido || '',
        nombre_completo: buildNombreCompleto(fromList),
        cedula: fromList.cedula || '',
        telefono: fromList.telefono || '',
        correo: fromList.correo || ''
      };
    }
  }

  // 3) Campos planos en editingData
  const flat = {
    id: pid || null,
    nombre: editingData.nombre || editingData.nombre_persona || '',
    apellido: editingData.apellido || editingData.apellido_persona || '',
    nombre_completo:
      editingData.nombre_completo ||
      editingData.nombre_persona_completo ||
      '',
    cedula: editingData.cedula || '',
    telefono: editingData.telefono || '',
    correo: editingData.correo || ''
  };

  // Si hay alguna pista, devolver objeto
  if (flat.id || flat.nombre || flat.apellido || flat.cedula) {
    return { ...flat, nombre_completo: buildNombreCompleto(flat) };
  }

  return null;
}

const TutorFormulario = ({
  editingData = null,
  personasDisponibles = [],
  onSubmit,
  onCancel,
  loading = false
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    id_persona: '',
    parentesco: '',
    ocupacion: '',
    direccion_empresa: '',
    telefono_empresa: '',
    nombre_empresa: ''
    // estado eliminado de la UI
  });
  const [errors, setErrors] = useState({});
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [showPersonForm, setShowPersonForm] = useState(false);

  const { showError } = useSnackbar();
  const isEditing = !!editingData;

  // Cuando llega editingData o cambia la lista de personas, precargar todo
  useEffect(() => {
    if (editingData) {
      // Intentar obtener persona_id de TODAS las variantes posibles
      const personaId =
        editingData.id_persona ||
        editingData.persona_id ||
        editingData.personaId ||
        editingData.id_Persona ||
        editingData.Persona_id ||
        editingData.IdPersona ||
        '';

      // Precargar campos del formulario
      setFormData({
        id_persona: String(personaId), // Convertir a string para consistencia
        parentesco: editingData.parentesco || '',
        ocupacion: editingData.ocupacion || '',
        direccion_empresa: editingData.direccion_empresa || '',
        telefono_empresa: editingData.telefono_empresa || '',
        nombre_empresa: editingData.nombre_empresa || ''
      });

      // Resolver persona seleccionada desde distintas formas de payload
      const resolved = resolveSelectedPerson(editingData, personasDisponibles);
      if (resolved) {
        setPersonaEncontrada(resolved);
      } else if (personaId) {
        // Si no se resolvió pero hay persona_id, crear objeto mínimo
        setPersonaEncontrada({
          id: personaId,
          nombre: editingData.nombre || editingData.nombre_persona || '',
          apellido: editingData.apellido || editingData.apellido_persona || '',
          nombre_completo: editingData.nombre_completo ||
                          `${editingData.nombre || editingData.nombre_persona || ''} ${editingData.apellido || editingData.apellido_persona || ''}`.trim(),
          cedula: editingData.cedula || editingData.cedula_persona || ''
        });
      }
    } else {
      resetForm();
    }

  }, [editingData, personasDisponibles]); // importante: incluir personasDisponibles

  const resetForm = () => {
    setFormData({
      id_persona: '',
      parentesco: '',
      ocupacion: '',
      direccion_empresa: '',
      telefono_empresa: '',
      nombre_empresa: ''
    });
    setErrors({});
    setPersonaEncontrada(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    // Formateo/validación del servicio
    const backendData = TutorService.formatForBackend
      ? TutorService.formatForBackend(formData, personaEncontrada, isEditing)
      : { ...formData };

    const validation = TutorService.validateTutorData
      ? TutorService.validateTutorData(backendData, isEditing)
      : { isValid: true, errors: {} };

    // Reglas adicionales de UI (solo parentesco, el resto lo valida el servicio)
    if (!formData.parentesco) {
      validation.errors.parentesco = 'Debe especificar el parentesco';
      validation.isValid = false;
    }

    setErrors(validation.errors || {});
    return !!validation.isValid;
  };

  const handlePersonaSelect = (persona) => {
    setPersonaEncontrada(persona);
    setFormData(prev => ({ ...prev, id_persona: persona.id }));
    if (errors.id_persona) {
      setErrors(prev => ({ ...prev, id_persona: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = TutorService.formatForBackend
        ? TutorService.formatForBackend(formData, personaEncontrada, isEditing)
        : { ...formData };

      await onSubmit(backendData, isEditing);
      resetForm();
    } catch (error) {
      showError(error?.message || 'Ocurrió un error al guardar');
    }
  };

  // Nombre completo robusto
  const fullName =
    personaEncontrada?.nombre_completo ||
    buildNombreCompleto(personaEncontrada || {});

  const parentescos = TutorService.getParentescosComunes
    ? TutorService.getParentescosComunes()
    : [
        { value: 'padre', label: 'Padre' },
        { value: 'madre', label: 'Madre' },
        { value: 'abuelo', label: 'Abuelo' },
        { value: 'abuela', label: 'Abuela' },
        { value: 'tio', label: 'Tío' },
        { value: 'tia', label: 'Tía' },
        { value: 'hermano', label: 'Hermano' },
        { value: 'hermana', label: 'Hermana' },
        { value: 'tutor_legal', label: 'Tutor Legal' }
      ];

  const iconColor = { color: 'text.primary' };

  return (
    <>
      {/* ====== Card Principal (form) ====== */}
      <Card elevation={8} sx={getCardShellSX(theme)}>
        {/* Header dinámico (azul crear / naranja editar) */}
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
              <FamilyRestroom sx={{ mr: 1 }} />
              {isEditing ? 'Editar Tutor' : 'Registrar Nuevo Tutor'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isEditing
                ? 'Modifica los campos necesarios y guarda los cambios'
                : 'Selecciona una persona y completa la información del tutor'}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* ===== Asignación ===== */}
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }} display="flex" alignItems="center">
                <Assignment sx={{ mr: 1 }} />
                Asignación
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Persona Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" mb={1}>
                  Persona (Tutor): {!isEditing && <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>}
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
                          ID de Persona: {formData.id_persona || 'No disponible'}
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
                          Persona asignada (ID: {formData.id_persona || 'No disponible'})
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
                        onSelect={(persona) => {
                          setPersonaEncontrada(persona);
                          setFormData(prev => ({ ...prev, id_persona: persona.id }));
                        }}
                        placeholder="Cambiar persona (opcional)"
                      />
                    </Box>
                  </Box>
                ) : (
                  // Modo creación: Selector obligatorio
                  <PersonaGeneralSelector
                    selectedPersona={personaEncontrada}
                    onSelect={(persona) => {
                      setPersonaEncontrada(persona);
                      setFormData(prev => ({ ...prev, id_persona: persona.id }));
                    }}
                    placeholder="Busca y selecciona la persona que será el tutor"
                  />
                )}

                {errors.id_persona && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.id_persona}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* ===== Datos del Tutor ===== */}
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Datos del Tutor
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Parentesco */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Parentesco <span style={{ color: 'red', fontWeight: 'bold' }}>*</span>
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="parentesco"
                  value={formData.parentesco}
                  onChange={handleChange}
                  error={!!errors.parentesco}
                  helperText={errors.parentesco || 'Relación familiar con el paciente'}
                  sx={neutralInputSX}
                >
                  <MenuItem value="">Seleccione el parentesco</MenuItem>
                  {parentescos.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Ocupación */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Ocupación
                </Typography>
                <TextField
                  fullWidth
                  name="ocupacion"
                  value={formData.ocupacion}
                  onChange={handleChange}
                  error={!!errors.ocupacion}
                  helperText={errors.ocupacion || 'Profesión u ocupación del tutor'}
                  placeholder="Ej: Ingeniero, Doctora, Contador, Abogada..."
                  sx={neutralInputSX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Work sx={iconColor} />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </Box>

            {/* ===== Información Laboral ===== */}
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Información Laboral
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Nombre de empresa */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Nombre de Empresa
                </Typography>
                <TextField
                  fullWidth
                  name="nombre_empresa"
                  value={formData.nombre_empresa}
                  onChange={handleChange}
                  error={!!errors.nombre_empresa}
                  helperText={errors.nombre_empresa || 'Nombre de la empresa donde trabaja (opcional)'}
                  placeholder="Ej: Hospital San Juan, Empresa ABC, Colegio Norte..."
                  sx={neutralInputSX}
                />
              </Box>

              {/* Dirección de empresa */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Dirección de Empresa
                </Typography>
                <TextField
                  fullWidth
                  name="direccion_empresa"
                  value={formData.direccion_empresa}
                  onChange={handleChange}
                  error={!!errors.direccion_empresa}
                  helperText={errors.direccion_empresa || 'Dirección de la empresa o lugar de trabajo'}
                  placeholder="Ej: Av. Principal #123, Sector Norte, Ciudad..."
                  sx={neutralInputSX}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home sx={iconColor} />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {/* Teléfono de empresa */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Teléfono de Empresa
                </Typography>
                <TextField
                  fullWidth
                  name="telefono_empresa"
                  value={formData.telefono_empresa}
                  onChange={handleChange}
                  error={!!errors.telefono_empresa}
                  helperText={errors.telefono_empresa || 'Teléfono laboral para contacto de emergencia'}
                  placeholder="Ej: 02-234-5678, 0999-123-456"
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
                disabled={
                  loading ||
                  !formData.parentesco ||
                  (!isEditing && !formData.id_persona)
                }
                sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), '&:hover': { bgcolor: theme.palette.primary.dark } }}
              >
                {isEditing ? 'Actualizar Tutor' : 'Crear Tutor'}
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
        title="Crear Nueva Persona (Tutor)"
        enableMultiStep={false}
      />
    </>
  );
};

export default TutorFormulario;
