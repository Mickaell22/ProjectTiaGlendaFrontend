// src/views/admin/Paciente.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
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
} from '@mui/material';
import { Delete, Edit, Visibility, Search, Description } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BuscadorPersonas from 'src/components/shared/BuscadorPersonas';

/* ---------- Helpers ---------- */
function formatFecha(valor) {
  if (!valor) return '—';
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  if (typeof valor === 'string' && valor.includes('T')) return valor.split('T')[0];
  const d = new Date(valor);
  if (isNaN(d.getTime())) return '—';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
const normalizeDate = (v) => (!v ? null : formatFecha(v));
const toIntOrNull = (v) =>
  v === '' || v === null || v === undefined ? null : parseInt(v, 10);

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
const Paciente = () => {
  const navigate = useNavigate();

  // Listado
  const [pacientes, setPacientes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  // Modal Detalle
  const [detalle, setDetalle] = useState(null);
  
  // Buscador avanzado
  const [showBuscador, setShowBuscador] = useState(false);

  // Formulario
  const [editingId, setEditingId] = useState(null);
  const [especialidades, setEspecialidades] = useState([]);
  const [formData, setFormData] = useState({
    persona_id: '',
    tutor_id: '',
    especialidad_id: '',
    fecha_ingreso: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    fecha_inicio_tratamiento: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    fecha_fin_tratamiento: '',
    estado_tratamiento: 'activo',
    observaciones_tratamiento: '',
    observaciones: '',
  });
  const [errors, setErrors] = useState({});

  // Buscar Persona/Tutor por cédula
  const [searchCedulaPersona, setSearchCedulaPersona] = useState('');
  const [searchCedulaTutor, setSearchCedulaTutor] = useState('');
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [tutorEncontrado, setTutorEncontrado] = useState(null);

  // UI
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const token = localStorage.getItem('jwt_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  /* ---------- Carga inicial ---------- */
  useEffect(() => {
    fetchPacientes();
    fetchEspecialidades();
  }, []);

  const fetchPacientes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/pacientes', { headers });
      setPacientes(res.data?.data || []);
    } catch (err) {
      console.error('Error al obtener pacientes:', err);
    }
  };

  const fetchEspecialidades = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/especialidades', { headers });
      setEspecialidades(res.data?.data || []);
    } catch (err) {
      console.error('Error al obtener especialidades:', err);
    }
  };

  /* ---------- Buscar Persona/Tutor por cédula ---------- */
  const handleBuscarPersona = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/personas', { headers });
      const persona = res.data?.data?.find((p) => p.cedula === searchCedulaPersona);
      if (persona) {
        setPersonaEncontrada(persona);
        setFormData((prev) => ({ ...prev, persona_id: persona.id }));
        setSnackbar({ open: true, message: 'Persona encontrada', severity: 'success' });
      } else {
        setPersonaEncontrada(null);
        setFormData((prev) => ({ ...prev, persona_id: '' }));
        setSnackbar({ open: true, message: 'Persona no encontrada', severity: 'warning' });
      }
    } catch (error) {
      console.error('Error al buscar persona:', error);
      setSnackbar({ open: true, message: 'Error al buscar persona', severity: 'error' });
    }
  };

  const handleBuscarTutor = async () => {
    try {
      const resPersonas = await axios.get('http://localhost:5000/api/personas', { headers });
      const persona = resPersonas.data?.data?.find((p) => p.cedula === searchCedulaTutor);

      if (persona) {
        const tutoresRes = await axios.get('http://localhost:5000/api/tutores', { headers });
        const tutor = tutoresRes.data?.data?.find((t) => t.persona_id === persona.id);
        if (tutor) {
          setTutorEncontrado(persona);
          setFormData((prev) => ({ ...prev, tutor_id: tutor.id }));
          setSnackbar({ open: true, message: 'Tutor encontrado', severity: 'success' });
        } else {
          setTutorEncontrado(null);
          setFormData((prev) => ({ ...prev, tutor_id: '' }));
          setSnackbar({ open: true, message: 'No existe tutor con esa cédula', severity: 'warning' });
        }
      } else {
        setTutorEncontrado(null);
        setFormData((prev) => ({ ...prev, tutor_id: '' }));
        setSnackbar({ open: true, message: 'Persona no encontrada', severity: 'warning' });
      }
    } catch (err) {
      console.error('Error al buscar tutor:', err);
      setSnackbar({ open: true, message: 'Error al buscar tutor', severity: 'error' });
    }
  };

  /* ---------- Form handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validaciones obligatorias
    if (!formData.persona_id) newErrors.persona_id = 'Debe seleccionar una persona';
    if (!formData.tutor_id) newErrors.tutor_id = 'Debe seleccionar un tutor';
    if (!formData.especialidad_id) newErrors.especialidad_id = 'Debe seleccionar una especialidad';
    
    // Validación de fecha de ingreso (obligatoria)
    if (!formData.fecha_ingreso) {
      newErrors.fecha_ingreso = 'Debe especificar la fecha de ingreso';
    } else {
      const fechaIngreso = new Date(formData.fecha_ingreso);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (fechaIngreso > today) {
        newErrors.fecha_ingreso = 'La fecha de ingreso no puede ser futura';
      }
    }
    
    // Validación de fecha de inicio de tratamiento (obligatoria)
    if (!formData.fecha_inicio_tratamiento) {
      newErrors.fecha_inicio_tratamiento = 'La fecha de inicio de tratamiento es obligatoria';
    } else {
      // Validar que no sea anterior a la fecha de ingreso
      if (formData.fecha_ingreso && formData.fecha_inicio_tratamiento < formData.fecha_ingreso) {
        newErrors.fecha_inicio_tratamiento = 'La fecha de inicio no puede ser anterior a la fecha de ingreso';
      }
    }
    
    // Validar fecha fin si se proporciona
    if (formData.fecha_fin_tratamiento && formData.fecha_inicio_tratamiento) {
      if (formData.fecha_fin_tratamiento <= formData.fecha_inicio_tratamiento) {
        newErrors.fecha_fin_tratamiento = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    if (!formData.estado_tratamiento) newErrors.estado_tratamiento = 'Seleccione el estado del tratamiento.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    
    console.log('🔥 Payload a enviar:', JSON.stringify(base, null, 2));
    
    return isUpdate
      ? { ...base, usuario_modificacion: usuarioId }
      : { ...base, usuario_creacion: usuarioId };
  };

  const handleGuardar = async () => {
    try {
      console.log('🔥 INICIANDO GUARDADO - Estado actual del formData:', formData);
      console.log('🔥 Persona encontrada:', personaEncontrada);
      console.log('🔥 Tutor encontrado:', tutorEncontrado);
      
      if (!token) {
        console.log('❌ Error: No hay token');
        return setSnackbar({ open: true, message: 'No autenticado. Inicia sesión.', severity: 'warning' });
      }
      
      console.log('🔥 Validando formulario...');
      const isValid = validateForm();
      console.log('🔥 Resultado validación:', isValid, 'Errores:', errors);
      
      if (!isValid) {
        console.log('❌ Formulario no válido, deteniendo proceso');
        return;
      }

      const usuarioId = getUsuarioId();
      console.log('🔥 Usuario ID obtenido:', usuarioId);
      
      if (!usuarioId) {
        console.log('❌ Error: No se pudo obtener usuario ID');
        return setSnackbar({
          open: true,
          message: 'No pude obtener tu ID de usuario. Inicia sesión nuevamente.',
          severity: 'warning',
        });
      }

      console.log('🔥 Preparando payload...');
      const payload = buildPayload(editingId ? true : false);
      console.log('🔥 Payload final a enviar:', payload);

      if (editingId) {
        console.log('🔥 ACTUALIZANDO paciente ID:', editingId);
        const response = await axios.put(`http://localhost:5000/api/pacientes/${editingId}`, payload, { headers });
        console.log('🔥 Respuesta UPDATE:', response.data);
        setSnackbar({ open: true, message: 'Paciente actualizado', severity: 'success' });
      } else {
        console.log('🔥 CREANDO nuevo paciente...');
        console.log('🔥 URL:', 'http://localhost:5000/api/pacientes');
        console.log('🔥 Headers:', headers);
        
        const response = await axios.post('http://localhost:5000/api/pacientes', payload, { headers });
        console.log('🔥 Respuesta CREATE:', response);
        console.log('🔥 Respuesta CREATE data:', response.data);
        console.log('🔥 Respuesta CREATE status:', response.status);
        
        setSnackbar({ open: true, message: 'Paciente registrado exitosamente', severity: 'success' });
      }

      console.log('🔥 Limpiando formulario y recargando lista...');
      resetForm();
      await fetchPacientes();
      console.log('🔥 Proceso completado exitosamente');
      
    } catch (err) {
      console.log('❌ ERROR EN handleGuardar:', err);
      console.log('❌ Error response:', err.response);
      console.log('❌ Error response data:', err.response?.data);
      console.log('❌ Error response status:', err.response?.status);
      console.log('❌ Error message:', err.message);
      
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        (typeof err?.response?.data === 'string' ? err.response.data : JSON.stringify(err?.response?.data)) ||
        err?.message ||
        'Error desconocido';
      setSnackbar({ open: true, message: `Error al guardar: ${apiMsg}`, severity: 'error' });
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      persona_id: '',
      tutor_id: '',
      especialidad_id: '',
      fecha_ingreso: today, // Fecha actual por defecto
      fecha_inicio_tratamiento: today, // Fecha actual por defecto
      fecha_fin_tratamiento: '',
      estado_tratamiento: 'activo',
      observaciones_tratamiento: '',
      observaciones: '',
    });
    setPersonaEncontrada(null);
    setTutorEncontrado(null);
    setSearchCedulaPersona('');
    setSearchCedulaTutor('');
    setEditingId(null);
    setErrors({});
    setShowBuscador(false); // Volver a búsqueda simple al resetear
  };

  const handleEdit = (p) => {
    setFormData({
      persona_id: p.persona_id,
      tutor_id: p.tutor_id || '',
      especialidad_id: p.especialidad_id || '',
      fecha_ingreso: formatFecha(p.fecha_ingreso) === '—' ? '' : formatFecha(p.fecha_ingreso),
      fecha_inicio_tratamiento:
        formatFecha(p.fecha_inicio_tratamiento) === '—' ? '' : formatFecha(p.fecha_inicio_tratamiento),
      fecha_fin_tratamiento:
        formatFecha(p.fecha_fin_tratamiento) === '—' ? '' : formatFecha(p.fecha_fin_tratamiento),
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
      await axios.delete(`http://localhost:5000/api/pacientes/${id}`, { headers });
      setSnackbar({ open: true, message: 'Paciente eliminado', severity: 'info' });
      fetchPacientes();
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
  };

  const handleDocs = (p) => {
    navigate(`/pacientes/${p.id}/documentos`);
  };

  // Handlers del buscador avanzado
  const handlePersonaSelectBuscador = (persona) => {
    setPersonaEncontrada(persona);
    setFormData((prev) => ({ ...prev, persona_id: persona.id }));
    setSearchCedulaPersona(persona.cedula || '');
    setSnackbar({ open: true, message: `Persona seleccionada: ${persona.nombre_completo}`, severity: 'success' });
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
    setSearchCedulaTutor(tutor.cedula || tutor.cedula_display || '');
    
    setSnackbar({ 
      open: true, 
      message: `Tutor seleccionado: ${tutor.nombre_completo}`, 
      severity: 'success' 
    });
  };

  const handleBuscarTutorPorPersona = async (persona) => {
    try {
      const tutoresRes = await axios.get('http://localhost:5000/api/tutores', { headers });
      const tutor = tutoresRes.data?.data?.find((t) => t.persona_id === persona.id);
      if (tutor) {
        setFormData((prev) => ({ ...prev, tutor_id: tutor.id }));
      } else {
        setSnackbar({ open: true, message: 'Esta persona no está registrada como tutor', severity: 'warning' });
      }
    } catch (err) {
      console.error('Error al buscar tutor:', err);
      setSnackbar({ open: true, message: 'Error al buscar tutor', severity: 'error' });
    }
  };

  /* ---------- Render ---------- */
  return (
    <Box p={2}>
      <Container maxWidth="xl">
        {/* Encabezado */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" fontWeight="bold">
            Gestión de Pacientes
          </Typography>
        </Paper>

        {/* Opciones de Búsqueda */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" fontWeight="bold">
                Búsqueda de Persona y Tutor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Puedes buscar por cédula individual o usar el buscador avanzado
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant={showBuscador ? "outlined" : "contained"}
                fullWidth
                onClick={() => setShowBuscador(!showBuscador)}
                startIcon={<Search />}
              >
                {showBuscador ? "Búsqueda Simple" : "Buscador Avanzado"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Buscador Avanzado */}
        {showBuscador && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
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
        )}

        {/* Búsqueda Simple - Solo cuando no está el buscador avanzado */}
        {!showBuscador && (
          <>
            {/* Buscar Persona */}
            <Paper elevation={3} sx={{ p: 3, maxWidth: 1000, mx: 'auto', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Buscar Persona (Paciente)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cédula de Persona"
                    value={searchCedulaPersona}
                    onChange={(e) => setSearchCedulaPersona(e.target.value)}
                    error={!!errors.persona_id}
                    helperText={errors.persona_id}
                  />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleBuscarPersona}
                    startIcon={<Search />}
                    sx={{ mt: 1 }}
                  >
                    Buscar Persona
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  {personaEncontrada && (
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f7f7f7' }}>
                      <Typography>
                        <strong>Nombre:</strong> {personaEncontrada.nombre} {personaEncontrada.apellido}
                      </Typography>
                      <Typography>
                        <strong>Cédula:</strong> {personaEncontrada.cedula}
                      </Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* Buscar Tutor */}
            <Paper elevation={3} sx={{ p: 3, maxWidth: 1000, mx: 'auto', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Buscar Tutor/Representante
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cédula del Tutor"
                    value={searchCedulaTutor}
                    onChange={(e) => setSearchCedulaTutor(e.target.value)}
                    error={!!errors.tutor_id}
                    helperText={errors.tutor_id}
                  />
                  <Button variant="outlined" fullWidth onClick={handleBuscarTutor} startIcon={<Search />} sx={{ mt: 1 }}>
                    Buscar Tutor
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  {tutorEncontrado && (
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f7f7f7' }}>
                      <Typography>
                        <strong>Nombre:</strong> {tutorEncontrado.nombre_completo || `${tutorEncontrado.nombre} ${tutorEncontrado.apellido}`}
                      </Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </>
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
        <Card elevation={3} sx={{ borderRadius: 2, p: 0, mb: 4 }}>
          <CardContent sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
            <Typography variant="h6" textAlign="center" color="primary" fontWeight="bold" mb={2}>
              {editingId ? 'Editar Paciente' : 'Registrar Paciente'}
            </Typography>

            <Grid container spacing={2}>
              {/* Especialidad */}
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Especialidad Asignada *"
                  name="especialidad_id"
                  value={formData.especialidad_id}
                  onChange={handleChange}
                  error={!!errors.especialidad_id}
                  helperText={errors.especialidad_id}
                >
                  <MenuItem value="">Seleccione una especialidad</MenuItem>
                  {especialidades.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.nombre} {e.area ? `— ${e.area}` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Fechas */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Ingreso *"
                  name="fecha_ingreso"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                  value={formData.fecha_ingreso}
                  onChange={handleChange}
                  error={!!errors.fecha_ingreso}
                  helperText={errors.fecha_ingreso || "Fecha en que el paciente ingresó al centro"}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Inicio Tratamiento *"
                  name="fecha_inicio_tratamiento"
                  InputLabelProps={{ shrink: true }}
                  value={formData.fecha_inicio_tratamiento}
                  onChange={handleChange}
                  error={!!errors.fecha_inicio_tratamiento}
                  helperText={errors.fecha_inicio_tratamiento || "Fecha de inicio del tratamiento asignado"}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha Fin Tratamiento"
                  name="fecha_fin_tratamiento"
                  InputLabelProps={{ shrink: true }}
                  value={formData.fecha_fin_tratamiento}
                  onChange={handleChange}
                />
              </Grid>

              {/* Estado del Tratamiento */}
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Estado del Tratamiento *"
                  name="estado_tratamiento"
                  value={formData.estado_tratamiento}
                  onChange={handleChange}
                  error={!!errors.estado_tratamiento}
                  helperText={errors.estado_tratamiento}
                >
                  {['activo', 'en pausa', 'completado', 'suspendido'].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Observaciones Tratamiento */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observaciones del Tratamiento"
                  name="observaciones_tratamiento"
                  placeholder="Objetivos, progreso esperado, notas específicas del plan terapéutico..."
                  value={formData.observaciones_tratamiento}
                  onChange={handleChange}
                />
              </Grid>

              {/* Observaciones Generales */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Observaciones Generales"
                  name="observaciones"
                  placeholder="Información relevante sobre diagnóstico, necesidades especiales, etc."
                  value={formData.observaciones}
                  onChange={handleChange}
                />
              </Grid>

              {/* Botones */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, maxWidth: 600, mx: 'auto' }}>
                  <Button variant="contained" color="success" fullWidth onClick={handleGuardar}>
                    {editingId ? 'Actualizar' : 'Guardar Paciente'}
                  </Button>
                  {editingId && (
                    <Button variant="outlined" fullWidth onClick={resetForm}>
                      Cancelar Edición
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Listado de Pacientes
          </Typography>
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
              {pacientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.nombre_completo}</TableCell>
                  <TableCell>{p.cedula}</TableCell>
                  <TableCell>{p.nombre_tutor || 'Sin tutor'}</TableCell>
                  <TableCell>{formatFecha(p.fecha_ingreso)}</TableCell>
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
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={pacientes.length}
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
                    <Typography variant="body1" fontWeight="bold">{formatFecha(detalle.fecha_ingreso)}</Typography>
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
                      {formatFecha(detalle.fecha_inicio_tratamiento)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Fin Tratamiento</Typography>
                    <Typography variant="body1" fontWeight="bold">{formatFecha(detalle.fecha_fin_tratamiento)}</Typography>
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
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Paciente;
