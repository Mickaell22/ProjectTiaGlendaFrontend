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
  InputAdornment
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  FamilyRestroom,
  Work,
  Phone,
  Home
} from '@mui/icons-material';

import TutorService from '../../services/tutorService.js';
import BuscadorPersonas from '../../components/shared/BuscadorPersonas.jsx';
import useSnackbar from '../../hooks/useSnackbar.js';

/* ---------- Estilos coherentes con Persona/Personal ---------- */
// Inputs sin estilos morados: usamos el tema por defecto
const neutralInputSX = {};

// Misma “carcasa”/tamaño que Persona/Usuario/Personal
const cardShellSX = {
  borderRadius: 4,
  mb: 4,
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
  border: '1px solid',
  borderColor: 'divider',
  overflow: 'hidden',
  width: '100%',
  maxWidth: { xs: '100%', sm: 680, md: 820, lg: 900 },
  mx: 'auto'
};

// Fila con etiqueta a la izquierda y campo a la derecha
const rowGridSX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
  gap: 2,
  alignItems: 'center',
  mb: 2
};

/* ---------- Helpers para edición robusta ---------- */
function buildNombreCompleto({ nombre = '', apellido = '', nombre_completo = '' }) {
  const n = (nombre || '').trim();
  const a = (apellido || '').trim();
  if (nombre_completo && nombre_completo.trim()) return nombre_completo.trim();
  return `${n} ${a}`.trim();
}

function resolveSelectedPerson(editingData, personasDisponibles) {
  if (!editingData) return null;

  // 1) Si viene anidado (editingData.persona o .person)
  const p = editingData.persona || editingData.person || null;
  if (p) {
    return {
      id: p.id ?? editingData.persona_id ?? editingData.personaId ?? null,
      nombre: p.nombre || '',
      apellido: p.apellido || '',
      nombre_completo: buildNombreCompleto(p),
      cedula: p.cedula || editingData.cedula || '',
      telefono: p.telefono || editingData.telefono || '',
      correo: p.correo || editingData.correo || ''
    };
  }

  // 2) Intentar encontrarla en la lista recibida por props
  const pid = editingData.persona_id ?? editingData.personaId ?? null;
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
  const [formData, setFormData] = useState({
    persona_id: '',
    parentesco: '',
    telefono_emergencia: '',
    direccion_trabajo: '',
    empresa_trabajo: '',
    cargo_trabajo: '',
    observaciones: ''
    // estado eliminado de la UI
  });
  const [errors, setErrors] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { showError } = useSnackbar();
  const isEditing = !!editingData;

  // Cuando llega editingData o cambia la lista de personas, precargar todo
  useEffect(() => {
    if (editingData) {
      // Precargar campos del formulario
      setFormData({
        persona_id: editingData.persona_id || editingData.personaId || '',
        parentesco: editingData.parentesco || '',
        telefono_emergencia: editingData.telefono_emergencia || '',
        direccion_trabajo: editingData.direccion_trabajo || '',
        empresa_trabajo: editingData.empresa_trabajo || '',
        cargo_trabajo: editingData.cargo_trabajo || '',
        observaciones: editingData.observaciones || ''
      });

      // Resolver persona seleccionada desde distintas formas de payload
      const resolved = resolveSelectedPerson(editingData, personasDisponibles);
      if (resolved) setSelectedPerson(resolved);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingData, personasDisponibles]); // importante: incluir personasDisponibles

  const resetForm = () => {
    setFormData({
      persona_id: '',
      parentesco: '',
      telefono_emergencia: '',
      direccion_trabajo: '',
      empresa_trabajo: '',
      cargo_trabajo: '',
      observaciones: ''
    });
    setErrors({});
    setSelectedPerson(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    // Formateo/validación del servicio
    const backendData = TutorService.formatForBackend
      ? TutorService.formatForBackend(formData)
      : { ...formData };
    const validation = TutorService.validateTutorData
      ? TutorService.validateTutorData(backendData)
      : { isValid: true, errors: {} };

    // Reglas adicionales de UI
    if (!formData.persona_id) {
      validation.errors.persona_id = 'Debe seleccionar una persona';
      validation.isValid = false;
    }
    if (!formData.parentesco) {
      validation.errors.parentesco = 'Debe especificar el parentesco';
      validation.isValid = false;
    }

    setErrors(validation.errors || {});
    return !!validation.isValid;
  };

  const handlePersonaSelect = (persona) => {
    setSelectedPerson(persona);
    setFormData(prev => ({ ...prev, persona_id: persona.id }));
    if (errors.persona_id) {
      setErrors(prev => ({ ...prev, persona_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = TutorService.formatForBackend
        ? TutorService.formatForBackend(formData)
        : { ...formData };
      await onSubmit(backendData, isEditing);
      resetForm();
    } catch (error) {
      showError(error?.message || 'Ocurrió un error al guardar');
    }
  };

  // Nombre completo robusto
  const fullName =
    selectedPerson?.nombre_completo ||
    buildNombreCompleto(selectedPerson || {});

  const parentescos = TutorService.getParentescos
    ? TutorService.getParentescos()
    : [
        { value: 'padre', label: 'Padre' },
        { value: 'madre', label: 'Madre' },
        { value: 'abuelo', label: 'Abuelo/a' },
        { value: 'tio', label: 'Tío/a' },
        { value: 'hermano', label: 'Hermano/a' },
        { value: 'tutor_legal', label: 'Tutor Legal' },
        { value: 'otro', label: 'Otro' }
      ];

  const iconColor = { color: 'text.primary' };

  return (
    <>
      {/* ====== Card: Buscar Persona integrado (cuando NO hay selección) ====== */}
      {!selectedPerson && (
        <Card elevation={8} sx={cardShellSX}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #7e57c2 0%, #673ab7 100%)',
              color: 'white',
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
                Busca y selecciona la persona que será asociada a este tutor.
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <BuscadorPersonas
              onPersonaSelect={handlePersonaSelect}
              showTutores={false}
              showPersonas={true}
              compact={true}
              maxHeight={420}
            />
            {errors.persona_id && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.persona_id}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* ====== Card: Persona Seleccionada ====== */}
      {selectedPerson && (
        <Card elevation={8} sx={cardShellSX}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #7e57c2 0%, #673ab7 100%)',
              color: 'white',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">✅ Persona Seleccionada</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Verifica la información antes de continuar.
              </Typography>
            </Box>

            {!isEditing && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setSelectedPerson(null);
                  setFormData(prev => ({ ...prev, persona_id: '' }));
                }}
              >
                Cambiar Persona
              </Button>
            )}
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'primary.light',
                borderRadius: 1,
                bgcolor: '#fff'
              }}
            >
              <Typography variant="subtitle2" color="primary" gutterBottom>
                👤 DATOS DE LA PERSONA
              </Typography>
              <Typography><strong>Nombre:</strong> {fullName || '—'}</Typography>
              <Typography><strong>Cédula:</strong> {selectedPerson?.cedula || '—'}</Typography>
              <Typography><strong>Teléfono:</strong> {selectedPerson?.telefono || 'N/A'}</Typography>
              <Typography><strong>Email:</strong> {selectedPerson?.correo || 'N/A'}</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ====== Card Principal (form) ====== */}
      <Card elevation={8} sx={cardShellSX}>
        {/* Header dinámico (azul crear / naranja editar) */}
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
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Asignación
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Persona *
                </Typography>
                <TextField
                  fullWidth
                  value={fullName || ''}
                  placeholder="Seleccione una persona desde el buscador"
                  InputProps={{ readOnly: true }}
                  error={!!errors.persona_id}
                  helperText={errors.persona_id}
                  sx={neutralInputSX}
                />
              </Box>
            </Box>

            {/* ===== Datos del Tutor ===== */}
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Datos del Tutor
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Parentesco */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Parentesco *
                </Typography>
                <TextField
                  select
                  fullWidth
                  name="parentesco"
                  value={formData.parentesco}
                  onChange={handleChange}
                  error={!!errors.parentesco}
                  helperText={errors.parentesco}
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

              {/* Teléfono de emergencia */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Teléfono de Emergencia
                </Typography>
                <TextField
                  fullWidth
                  name="telefono_emergencia"
                  value={formData.telefono_emergencia}
                  onChange={handleChange}
                  error={!!errors.telefono_emergencia}
                  helperText={errors.telefono_emergencia}
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
                  value={formData.observaciones}
                  onChange={handleChange}
                  error={!!errors.observaciones}
                  helperText={errors.observaciones || 'Información adicional sobre el tutor'}
                  sx={neutralInputSX}
                />
              </Box>
            </Box>

            {/* ===== Información Laboral ===== */}
            <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Información Laboral
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Empresa */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Empresa / Lugar de Trabajo
                </Typography>
                <TextField
                  fullWidth
                  name="empresa_trabajo"
                  value={formData.empresa_trabajo}
                  onChange={handleChange}
                  error={!!errors.empresa_trabajo}
                  helperText={errors.empresa_trabajo}
                  sx={neutralInputSX}
                />
              </Box>

              {/* Cargo */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Cargo
                </Typography>
                <TextField
                  fullWidth
                  name="cargo_trabajo"
                  value={formData.cargo_trabajo}
                  onChange={handleChange}
                  error={!!errors.cargo_trabajo}
                  helperText={errors.cargo_trabajo}
                  sx={neutralInputSX}
                />
              </Box>

              {/* Dirección de trabajo */}
              <Box sx={rowGridSX}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Dirección de Trabajo
                </Typography>
                <TextField
                  fullWidth
                  name="direccion_trabajo"
                  value={formData.direccion_trabajo}
                  onChange={handleChange}
                  error={!!errors.direccion_trabajo}
                  helperText={errors.direccion_trabajo}
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
                disabled={loading || !formData.persona_id || !formData.parentesco}
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
    </>
  );
};

export default TutorFormulario;
