// src/views/pacientes/PacienteModern.jsx
// Módulo de pacientes con diseño moderno con pestañas

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  Divider,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Stack
} from '@mui/material';
import { 
  Delete, 
  Edit, 
  Visibility, 
  Search, 
  Description,
  PersonAdd,
  Add,
  Person,
  Phone,
  Email,
  LocalHospital,
  FamilyRestroom,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Servicios y hooks personalizados
import PacienteService from '../../services/pacienteService.js';
import PersonaService from '../../services/personaService.js';
import EspecialidadService from '../../services/especialidadService.js';
import TutorService from '../../services/tutorService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';

// Componentes reutilizables
import BuscadorPersonas from '../../components/shared/BuscadorPersonas.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

/* ---------- Helpers ---------- */
const normalizeDate = (v) => (!v ? null : v);
const toIntOrNull = (v) =>
  v === '' || v === null || v === undefined ? null : parseInt(v, 10);

// Obtener fecha actual en formato YYYY-MM-DD
function getCurrentDateForInput() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Formatear fecha para mostrar
function formatDateLocal(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  } catch {
    return '—';
  }
}

// Formatear fecha para input
function formatDateForInput(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

// Intenta obtener el ID del usuario: primero de localStorage.user_data, luego del JWT
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
const PacienteModern = () => {
  const navigate = useNavigate();

  // Estados principales
  const [pacientes, setPacientes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  // Modal Detalle
  const [detalle, setDetalle] = useState(null);
  
  // Formulario
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    persona_id: '',
    tutor_id: '',
    especialidad_id: '',
    fecha_ingreso: getCurrentDateForInput(), // Fecha actual por defecto
    fecha_inicio_tratamiento: getCurrentDateForInput(), // Fecha actual por defecto
    fecha_fin_tratamiento: '',
    estado_tratamiento: 'activo',
    observaciones_tratamiento: '',
    observaciones: '',
  });
  const [errors, setErrors] = useState({});

  // Variables para personas y tutores encontrados
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [tutorEncontrado, setTutorEncontrado] = useState(null);

  // Hooks personalizados
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  /* ---------- Carga inicial ---------- */
  useEffect(() => {
    if (requireAuth()) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pacientesData, especialidadesData] = await Promise.all([
        PacienteService.getAll(),
        EspecialidadService.getAll()
      ]);
      
      setPacientes(pacientesData);
      setEspecialidades(especialidadesData);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Form handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
    } else {
      const fechaIngreso = new Date(formData.fecha_ingreso);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (fechaIngreso > today) {
        validation.errors.fecha_ingreso = 'La fecha de ingreso no puede ser futura';
      }
    }
    
    // Validación de fecha de inicio de tratamiento (obligatoria)
    if (!formData.fecha_inicio_tratamiento) {
      validation.errors.fecha_inicio_tratamiento = 'La fecha de inicio de tratamiento es obligatoria';
    } else {
      // Validar que no sea anterior a la fecha de ingreso
      if (formData.fecha_ingreso && formData.fecha_inicio_tratamiento < formData.fecha_ingreso) {
        validation.errors.fecha_inicio_tratamiento = 'La fecha de inicio no puede ser anterior a la fecha de ingreso';
      }
    }
    
    // Validar fecha fin si se proporciona
    if (formData.fecha_fin_tratamiento && formData.fecha_inicio_tratamiento) {
      if (formData.fecha_fin_tratamiento <= formData.fecha_inicio_tratamiento) {
        validation.errors.fecha_fin_tratamiento = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    if (!formData.estado_tratamiento) validation.errors.estado_tratamiento = 'Seleccione el estado del tratamiento.';
    
    setErrors(validation.errors);
    validation.isValid = Object.keys(validation.errors).length === 0;
    return validation.isValid;
  };

  const buildPayload = (isUpdate = false) => {
    const usuarioId = getUsuarioId();
    
    const base = {
      persona_id: toIntOrNull(formData.persona_id),
      tutor_id: toIntOrNull(formData.tutor_id),
      especialidad_id: toIntOrNull(formData.especialidad_id),
      fecha_ingreso: normalizeDate(formData.fecha_ingreso),
      fecha_inicio_tratamiento: normalizeDate(formData.fecha_inicio_tratamiento),
      fecha_fin_tratamiento: formData.fecha_fin_tratamiento ? normalizeDate(formData.fecha_fin_tratamiento) : null,
      estado_tratamiento: formData.estado_tratamiento || 'activo',
      observaciones_tratamiento: formData.observaciones_tratamiento?.trim() || null,
      observaciones: formData.observaciones?.trim() || null,
      estado: 'activo',
    };
    
    return isUpdate
      ? { ...base, usuario_modificacion: usuarioId }
      : { ...base, usuario_creacion: usuarioId };
  };

  const handleGuardar = async () => {
    try {
      if (!validateForm()) return;

      const usuarioId = getUsuarioId();
      if (!usuarioId) {
        return showError('No se pudo obtener tu ID de usuario. Inicia sesión nuevamente.');
      }

      const payload = buildPayload(editingId ? true : false);

      if (editingId) {
        await PacienteService.update(editingId, payload);
        showSuccess('Paciente actualizado correctamente');
      } else {
        await PacienteService.create(payload);
        showSuccess('Paciente registrado exitosamente');
      }

      resetForm();
      await fetchData();
      
    } catch (err) {
      showError(`Error al guardar: ${err.message}`);
    }
  };

  const resetForm = () => {
    const today = getCurrentDateForInput();
    setFormData({
      persona_id: '',
      tutor_id: '',
      especialidad_id: '',
      fecha_ingreso: today,
      fecha_inicio_tratamiento: today,
      fecha_fin_tratamiento: '',
      estado_tratamiento: 'activo',
      observaciones_tratamiento: '',
      observaciones: '',
    });
    setPersonaEncontrada(null);
    setTutorEncontrado(null);
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (p) => {
    setFormData({
      persona_id: p.persona_id,
      tutor_id: p.tutor_id || '',
      especialidad_id: p.especialidad_id || '',
      fecha_ingreso: formatDateForInput(p.fecha_ingreso) || '',
      fecha_inicio_tratamiento: formatDateForInput(p.fecha_inicio_tratamiento) || '',
      fecha_fin_tratamiento: formatDateForInput(p.fecha_fin_tratamiento) || '',
      estado_tratamiento: p.estado_tratamiento || 'activo',
      observaciones_tratamiento: p.observaciones_tratamiento || '',
      observaciones: p.observaciones || '',
    });
    setPersonaEncontrada({ nombre: p.nombre, apellido: p.apellido, cedula: p.cedula });
    setTutorEncontrado({
      nombre: (p.nombre_tutor || '').split(' ')[0] || '',
      apellido: (p.nombre_tutor || '').split(' ').slice(1).join(' '),
      cedula: '',
    });
    setEditingId(p.id);
  };

  const handleDelete = async (id) => {
    try {
      await PacienteService.delete(id);
      showSuccess('Paciente eliminado correctamente');
      fetchData();
    } catch (error) {
      showError(error.message);
    }
  };

  const handleDocs = (p) => {
    navigate(`/pacientes/${p.id}/documentos`);
  };

  // Handlers del buscador avanzado
  const handlePersonaSelectBuscador = (persona) => {
    setPersonaEncontrada(persona);
    setFormData((prev) => ({ ...prev, persona_id: persona.id }));
    showSuccess(`Persona seleccionada: ${persona.nombre_completo}`);
  };

  const handleTutorSelectBuscador = (tutor) => {
    // Configurar los datos del tutor encontrado
    setTutorEncontrado({
      nombre_completo: tutor.nombre_completo,
      cedula: tutor.cedula || tutor.cedula_display,
      nombre: tutor.nombre,
      apellido: tutor.apellido
    });
    
    // Usar el tutor_id si está disponible, sino usar el id
    const tutorId = tutor.tutor_id || tutor.id;
    setFormData((prev) => ({ ...prev, tutor_id: tutorId }));
    
    showSuccess(`Tutor seleccionado: ${tutor.nombre_completo}`);
  };

  /* ---------- Filtros del listado de pacientes ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    especialidad: '',
    estado_tratamiento: '',
    tutor: '',
    fecha_ingreso_desde: '',
    fecha_ingreso_hasta: ''
  });
  
  const normalize = (s = '') =>
    s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredPacientes = React.useMemo(() => {
    let result = pacientes;
    
    // Filtro por texto general
    if (searchTerm.trim()) {
      const q = normalize(searchTerm.trim());
      result = result.filter((p) => {
        const campos = [
          p.nombre_completo,
          p.cedula,
          p.nombre_tutor,
          p.especialidad_nombre,
          p.estado_tratamiento,
        ];
        return campos.some((c) => normalize(c || '').includes(q));
      });
    }
    
    return result;
  }, [pacientes, searchTerm, filters]);
  
  const clearFilters = () => {
    setFilters({
      especialidad: '',
      estado_tratamiento: '',
      tutor: '',
      fecha_ingreso_desde: '',
      fecha_ingreso_hasta: ''
    });
    setSearchTerm('');
    setPage(0);
  };
  
  const hasActiveFilters = () => {
    return searchTerm.trim() || 
           filters.especialidad || 
           filters.estado_tratamiento || 
           filters.tutor.trim() || 
           filters.fecha_ingreso_desde || 
           filters.fecha_ingreso_hasta;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Cargando pacientes...</Typography>
      </Box>
    );
  }

  /* ---------- Render ---------- */
  return (
    <ErrorBoundary>
      <Box p={2}>
        <Container maxWidth="xl">
          {/* Encabezado con borde arcoíris */}
          <Paper
            elevation={6}
            sx={{
              borderRadius: 3,
              backgroundColor: '#fff',
              mb: 4,
              p: 0,
              overflow: 'hidden',
              border: '4px solid transparent',
              backgroundImage:
                'linear-gradient(white, white), linear-gradient(270deg, #2196F3, #4CAF50, #FF9800, #E91E63)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              animation: 'rainbow 5s linear infinite',
              '@keyframes rainbow': {
                '0%': { backgroundPosition: '0% 50%' },
                '100%': { backgroundPosition: '100% 50%' },
              },
              backgroundSize: '300% 100%',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" color="black">
                Gestión de Pacientes
              </Typography>
            </Box>
          </Paper>

          {/* Buscador Avanzado */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Búsqueda de Persona y Tutor
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
              editingPatientId={editingId}
            />
          </Paper>

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
                background: editingId
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
                <Typography variant="h6" fontWeight="bold">
                  {editingId ? 'Editar Paciente' : 'Registrar Paciente'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {editingId
                    ? 'Modifica los campos necesarios y guarda los cambios'
                    : 'Selecciona persona y tutor, asigna especialidad y define fechas'}
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
              {/* ===== Bloque: Asignación ===== */}
              <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
                <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  Asignación
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Fila: Especialidad */}
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

                {/* Fila: Estado Tratamiento */}
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
                <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  Fechas del Tratamiento
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Fecha de Ingreso */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
                    gap: 2,
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Fecha de Ingreso *</Typography>
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
                </Box>

                {/* Inicio Tratamiento */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
                    gap: 2,
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Inicio Tratamiento *</Typography>
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
                </Box>

                {/* Fin Tratamiento */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>Fin Tratamiento</Typography>
                  <TextField
                    fullWidth
                    type="date"
                    name="fecha_fin_tratamiento"
                    InputLabelProps={{ shrink: true }}
                    value={formData.fecha_fin_tratamiento}
                    onChange={handleChange}
                    helperText="(Opcional) Fecha estimada de finalización"
                    size="medium"
                  />
                </Box>
              </Box>

              {/* ===== Bloque: Observaciones ===== */}
              <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
                <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  Observaciones
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Observaciones del Tratamiento */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
                    gap: 2,
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', pt: { md: 1 } }}>
                    Observaciones del Tratamiento
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    name="observaciones_tratamiento"
                    placeholder="Objetivos, progreso esperado, notas del plan terapéutico..."
                    value={formData.observaciones_tratamiento}
                    onChange={handleChange}
                    size="medium"
                  />
                </Box>

                {/* Observaciones Generales */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
                    gap: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', pt: { md: 1 } }}>
                    Observaciones Generales
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    name="observaciones"
                    placeholder="Información relevante: diagnóstico, necesidades especiales, etc."
                    value={formData.observaciones}
                    onChange={handleChange}
                    size="medium"
                  />
                </Box>
              </Box>

              {/* ===== Acciones ===== */}
              <Box
                sx={{
                  mt: 3,
                  pt: 2,
                  display: 'flex',
                  gap: 2,
                  maxWidth: 600,
                  mx: 'auto',
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={handleGuardar}
                  sx={{ py: 1.4, fontWeight: 'bold', textTransform: 'none' }}
                >
                  {editingId ? 'Actualizar' : 'Guardar Paciente'}
                </Button>

                {editingId && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={resetForm}
                    sx={{ py: 1.4, fontWeight: 'bold', textTransform: 'none' }}
                  >
                    Cancelar Edición
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Tabla */}
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                Listado de Pacientes ({filteredPacientes.length})
              </Typography>

              <TextField
                size="small"
                placeholder="Buscar por nombre, cédula, tutor, especialidad o estado…"
                value={searchTerm}
                onChange={(e) => {
                  setPage(0);
                  setSearchTerm(e.target.value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: { xs: 220, sm: 320 } }}
              />
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Cédula</TableCell>
                  <TableCell>Tutor</TableCell>
                  <TableCell>Fecha Ingreso</TableCell>
                  <TableCell>Especialidad</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPacientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Box>
                        <Search sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No se encontraron pacientes
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                          {hasActiveFilters() 
                            ? 'Intenta modificar o limpiar los filtros de búsqueda'
                            : 'No hay pacientes registrados en el sistema'
                          }
                        </Typography>
                        {hasActiveFilters() && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={clearFilters}
                            sx={{ mt: 2 }}
                          >
                            Limpiar Filtros
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.nombre_completo}</TableCell>
                    <TableCell>{p.cedula}</TableCell>
                    <TableCell>{p.nombre_tutor || 'Sin tutor'}</TableCell>
                    <TableCell>{formatDateLocal(p.fecha_ingreso)}</TableCell>
                    <TableCell>{p.especialidad_nombre || '—'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'nowrap' }}>
                        <Tooltip title="Ver Detalles">
                          <IconButton color="primary" onClick={() => setDetalle(p)} size="small">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton color="success" onClick={() => handleEdit(p)} size="small">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton color="error" onClick={() => handleDelete(p.id)} size="small">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Documentos">
                          <IconButton color="info" onClick={() => handleDocs(p)} size="small">
                            <Description fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredPacientes.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
            />
          </Paper>

          {/* Detalles */}
          <Dialog open={!!detalle} onClose={() => setDetalle(null)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
              <Visibility sx={{ mr: 1 }} />
              Detalle del Paciente
            </DialogTitle>
            <DialogContent sx={{ p: 3, mt: 2 }}>
              {detalle && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Nombre</Typography>
                      <Typography variant="body1" fontWeight="bold">{detalle.nombre_completo}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Cédula</Typography>
                      <Typography variant="body1" fontWeight="bold">{detalle.cedula}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Tutor</Typography>
                      <Typography variant="body1" fontWeight="bold">{detalle.nombre_tutor || 'Sin tutor'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Fecha Ingreso</Typography>
                      <Typography variant="body1" fontWeight="bold">{formatDateLocal(detalle.fecha_ingreso)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Especialidad</Typography>
                      <Typography variant="body1" fontWeight="bold">{detalle.especialidad_nombre || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Estado Tratamiento</Typography>
                      <Typography variant="body1" fontWeight="bold">{detalle.estado_tratamiento || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Inicio Tratamiento</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatDateLocal(detalle.fecha_inicio_tratamiento)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Fin Tratamiento</Typography>
                      <Typography variant="body1" fontWeight="bold">{formatDateLocal(detalle.fecha_fin_tratamiento)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Obs. Tratamiento</Typography>
                      <Typography variant="body1" fontWeight="bold">{detalle.observaciones_tratamiento || '—'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Obs. Generales</Typography>
                      <Typography variant="body1" fontWeight="bold">{detalle.observaciones || '—'}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setDetalle(null)} variant="contained" color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={hideSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ErrorBoundary>
  );
};

export default PacienteModern;