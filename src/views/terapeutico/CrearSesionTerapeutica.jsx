// src/views/terapeutico/CrearSesionTerapeutica.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  FormControl,
  Select,
  InputLabel,
  FormHelperText,
  Snackbar,
  Alert,

  useTheme
} from '@mui/material';
import { Add, Psychology } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';
import ModernPersonSelector from '../../components/shared/ModernPersonSelector.jsx';
import UnifiedPersonForm from '../../components/shared/UnifiedPersonForm.jsx';

/* ---------- Estilos (como en UsuarioFormulario.jsx) ---------- */
const getCardShellSX = (theme) => ({
  borderRadius: 4,
  mb: 3,
  backgroundColor: 'background.paper',
  border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
  overflow: 'hidden',
  width: '100%',
  maxWidth: { xs: '100%', sm: 680, md: 820, lg: 900 },
  mx: 'auto'
});

const getMainHeaderSX = (theme) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  p: 3,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
});

const sectionBoxSX = {
  mb: 3,
  p: 3,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  backgroundColor: 'background.paper'
};

/** Mantiene altura/ancho constantes de los Select
 *  - Evita que "salten" al elegir valor
 *  - Trunca valores largos con '...'
 */
const selectStableSX = {
  width: '100%',
  '& .MuiSelect-select': {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '1.4375em', // altura estable
    lineHeight: '1.4375em'
  }
};

const menuProps = {
  PaperProps: {
    sx: {
      maxHeight: 280
    }
  }
};

const CrearSesionTerapeutica = ({ onSessionCreated }) => {
  const theme = useTheme();
  const [pacientesDisponibles, setPacientesDisponibles] = useState([]);
  const [terapeutasDisponibles, setTerapeutasDisponibles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    terapeuta_id: '',
    especialidad_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    dias_semana: [],
    hora_inicio: '',
    duracion_minutos: 45,
    numero_sesiones_contratadas: 1,
    costo_total: 0,
    meses_contrato: 1,
    estado: 'planificada',
    observaciones: '',
    paciente_id: ''
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [selectedTerapeuta, setSelectedTerapeuta] = useState(null);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [showPersonForm, setShowPersonForm] = useState(false);
  // const navigate = useNavigate();
  // const { user } = useAuth();

  const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      
      const [pacientesRes, terapeutasRes, especialidadesRes] = await Promise.all([
        sesionTerapiaService.getPacientesDisponibles(),
        sesionTerapiaService.getTerapeutasDisponibles(),
        sesionTerapiaService.getEspecialidades()
      ]);


      const pacientes = pacientesRes?.data || pacientesRes || [];
      const terapeutas = terapeutasRes?.data || terapeutasRes || [];
      const especialidades = especialidadesRes?.data || especialidadesRes || [];


      setPacientesDisponibles(pacientes);
      setTerapeutasDisponibles(terapeutas);
      setEspecialidades(especialidades);
      
      setSnackbar({ 
        open: true, 
        message: `Datos cargados: ${pacientes.length} pacientes, ${terapeutas.length} terapeutas, ${especialidades.length} especialidades`, 
        severity: 'info' 
      });
    } catch (err) {
      console.error('Error fetching form data:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDiasChange = (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, dias_semana: typeof value === 'string' ? value.split(',') : value }));
    if (errors.dias_semana) {
      setErrors(prev => ({ ...prev, dias_semana: '' }));
    }
  };

  const handleTerapeutaSelect = (person) => {
    setSelectedTerapeuta(person);
    setFormData(prev => ({ ...prev, terapeuta_id: person.id }));
    if (errors.terapeuta_id) {
      setErrors(prev => ({ ...prev, terapeuta_id: '' }));
    }
  };

  const handlePacienteSelect = (person) => {
    setSelectedPaciente(person);
    setFormData(prev => ({ ...prev, paciente_id: person.id }));
    if (errors.paciente_id) {
      setErrors(prev => ({ ...prev, paciente_id: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Solo comparar fechas, no horas

    if (!formData.titulo?.trim()) newErrors.titulo = 'Título requerido';
    if (!formData.terapeuta_id) newErrors.terapeuta_id = 'Terapeuta requerido';
    if (!formData.especialidad_id) newErrors.especialidad_id = 'Especialidad requerida';
    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'Fecha de inicio requerida';
    } else {
      const fechaInicio = new Date(formData.fecha_inicio + 'T00:00:00');
      if (fechaInicio < today) {
        newErrors.fecha_inicio = 'La fecha de inicio no puede ser en el pasado';
      }
    }
    if (!formData.fecha_fin) newErrors.fecha_fin = 'Fecha de fin requerida';
    if (!formData.dias_semana.length) newErrors.dias_semana = 'Seleccione al menos un día';
    if (!formData.hora_inicio) {
      newErrors.hora_inicio = 'Hora de inicio requerida';
    } else {
      // Validar horario laboral (7 AM - 5 PM)
      const [hora, minuto] = formData.hora_inicio.split(':').map(Number);
      const horaDecimal = hora + minuto / 60;
      if (horaDecimal < 7 || horaDecimal > 17) {
        newErrors.hora_inicio = 'La hora debe estar entre 7:00 AM y 5:00 PM';
      }
    }
    if (!formData.numero_sesiones_contratadas || formData.numero_sesiones_contratadas < 1) {
      newErrors.numero_sesiones_contratadas = 'Número de sesiones debe ser mayor a 0';
    }
    if (!formData.costo_total || formData.costo_total < 0) {
      newErrors.costo_total = 'Costo total debe ser mayor o igual a 0';
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const fechaInicio = new Date(formData.fecha_inicio + 'T00:00:00');
      const fechaFin = new Date(formData.fecha_fin + 'T00:00:00');
      if (fechaFin <= fechaInicio) {
        newErrors.fecha_fin = 'Fecha de fin debe ser posterior a fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const sessionData = {
        titulo: formData.titulo.trim(),
        objetivo_general: formData.objetivo_general?.trim() || 'Objetivo general de la sesión terapéutica',
        terapeuta_id: parseInt(formData.terapeuta_id),
        especialidad_id: parseInt(formData.especialidad_id),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        dias_semana: formData.dias_semana,
        hora_inicio: formData.hora_inicio,
        duracion_minutos: parseInt(formData.duracion_minutos),
        numero_sesiones_contratadas: parseInt(formData.numero_sesiones_contratadas),
        costo_total: parseFloat(formData.costo_total),
        costo_sesion: parseFloat(formData.costo_total) / parseInt(formData.numero_sesiones_contratadas),
        meses_contrato: formData.meses_contrato ? parseInt(formData.meses_contrato) : null,
        estado: formData.estado,
        observaciones: formData.observaciones?.trim() || null,
        tipo_sesion: formData.tipo_sesion || 'individual'
      };

      if (formData.paciente_id) {
        sessionData.paciente_id = parseInt(formData.paciente_id);
      }

      const response = await sesionTerapiaService.createSesion(sessionData);

      setSnackbar({
        open: true,
        message: `Sesión "${sessionData.titulo}" creada correctamente`,
        severity: 'success'
      });
      resetForm();

      // Notificar al componente padre que se creó una sesión (con delay para mostrar Snackbar)
      if (onSessionCreated) {
        setTimeout(() => {
          onSessionCreated();
        }, 1500); // Delay de 1.5 segundos para que se vea el Snackbar
      }
    } catch (err) {
      console.error('Error creating session:', err);
      console.error('Error details:', err.response?.data);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      terapeuta_id: '',
      especialidad_id: '',
      fecha_inicio: '',
      fecha_fin: '',
      dias_semana: [],
      hora_inicio: '',
      duracion_minutos: 45,
      numero_sesiones_contratadas: 1,
      costo_total: 0,
      meses_contrato: 1,
      estado: 'planificada',
      observaciones: '',
      paciente_id: ''
    });
    setErrors({});
    setSelectedTerapeuta(null);
    setSelectedPaciente(null);
  };

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, py: 0 }}>
      {/* ===== Card principal con header estilo UsuarioFormulario ===== */}
      <Card elevation={8} sx={getCardShellSX(theme)}>
        <Box sx={getMainHeaderSX(theme)}>
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <Psychology sx={{ mr: 1 }} />
              Crear Nueva Sesión Terapéutica
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Define la programación, costos y (opcionalmente) el paciente para una sesión individual.
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* ===== Información General (vertical) ===== */}
            <Box sx={sectionBoxSX}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Información General
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título de la Sesión"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    error={!!errors.titulo}
                    helperText={errors.titulo}
                    placeholder="Ej: Terapia física para rehabilitación"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <ModernPersonSelector
                    selectedPerson={selectedTerapeuta ? {
                      ...selectedTerapeuta,
                      displayName: selectedTerapeuta.displayName || `${selectedTerapeuta.nombre} ${selectedTerapeuta.apellido}`,
                      sourceType: 'personal'
                    } : null}
                    onPersonSelect={(person) => handleTerapeutaSelect({
                      ...person,
                      displayName: person.displayName || `${person.nombre} ${person.apellido}`
                    })}
                    onClear={() => {
                      setSelectedTerapeuta(null);
                      setFormData(prev => ({ ...prev, terapeuta_id: '' }));
                    }}
                    label="Terapeuta"
                    placeholder="Buscar y seleccionar terapeuta para la sesión"
                    required
                    error={errors.terapeuta_id}
                    searchTypes={['personas']}
                    hideRegisteredPatients={false}
                    showCreateButton={true}
                    onCreateNew={() => setShowPersonForm(true)}
                    contextualInfo={true}
                    enableFavorites={true}
                    showRecentSelections={true}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.especialidad_id}>
                    <InputLabel shrink>Especialidad</InputLabel>
                    <Select
                      sx={selectStableSX}
                      name="especialidad_id"
                      value={formData.especialidad_id}
                      onChange={handleChange}
                      label="Especialidad"
                      disabled={loading}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return 'Seleccione una especialidad';
                        const e = especialidades.find(x => x.id === selected || String(x.id) === String(selected));
                        return e ? `${e.nombre || 'Sin nombre'} - ${e.area || 'General'}` : 'Seleccione una especialidad';
                      }}
                      MenuProps={menuProps}
                    >
                      <MenuItem value="">{loading ? 'Cargando especialidades...' : 'Seleccione una especialidad'}</MenuItem>
                      {!loading && especialidades.length === 0 ? (
                        <MenuItem disabled>No hay especialidades disponibles</MenuItem>
                      ) : (
                        especialidades.map((especialidad, index) => (
                          <MenuItem key={`especialidad-${especialidad.id || index}`} value={especialidad.id}>
                            {`${especialidad.nombre || 'Sin nombre'} - ${especialidad.area || 'General'}`}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.especialidad_id && <FormHelperText>{errors.especialidad_id}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <ModernPersonSelector
                    selectedPerson={selectedPaciente ? {
                      ...selectedPaciente,
                      displayName: selectedPaciente.displayName || `${selectedPaciente.nombre} ${selectedPaciente.apellido}`,
                      sourceType: 'persona'
                    } : null}
                    onPersonSelect={(person) => handlePacienteSelect({
                      ...person,
                      displayName: person.displayName || `${person.nombre} ${person.apellido}`
                    })}
                    onClear={() => {
                      setSelectedPaciente(null);
                      setFormData(prev => ({ ...prev, paciente_id: '' }));
                    }}
                    label="Paciente (Opcional - Sesión Individual)"
                    placeholder="Buscar paciente para sesión individual (opcional)"
                    required={false}
                    error={errors.paciente_id}
                    searchTypes={['personas']}
                    hideRegisteredPatients={false}
                    showCreateButton={true}
                    onCreateNew={() => setShowPersonForm(true)}
                    contextualInfo={true}
                    enableFavorites={true}
                    showRecentSelections={true}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ===== Programación (vertical) ===== */}
            <Box sx={sectionBoxSX}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Programación
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Fecha de Inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    error={!!errors.fecha_inicio}
                    helperText={errors.fecha_inicio || 'No se permiten fechas pasadas'}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      inputProps: {
                        min: new Date().toISOString().split('T')[0] // Fecha mínima: hoy
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Fecha de Fin"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    error={!!errors.fecha_fin}
                    helperText={errors.fecha_fin}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.hora_inicio}>
                    <InputLabel shrink>Hora de Inicio</InputLabel>
                    <Select
                      sx={selectStableSX}
                      name="hora_inicio"
                      value={formData.hora_inicio}
                      onChange={handleChange}
                      MenuProps={menuProps}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>Seleccionar horario</em>
                      </MenuItem>
                      {/* Horario laboral de 7 AM a 5 PM */}
                      {Array.from({ length: 21 }, (_, i) => {
                        const hour = Math.floor(7 + i / 2); // 7, 7, 8, 8, 9...
                        const minute = (i % 2) * 30; // 0, 30, 0, 30...
                        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        // const displayTime = `${hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
                        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                        const finalDisplay = `${displayHour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
                        
                        // Solo mostrar hasta 5:00 PM
                        if (hour > 17 || (hour === 17 && minute > 0)) return null;
                        
                        return (
                          <MenuItem key={`time-${i}-${timeString}`} value={timeString}>
                            {finalDisplay}
                          </MenuItem>
                        );
                      }).filter(Boolean)}
                    </Select>
                    <FormHelperText>
                      {errors.hora_inicio || 'Horario laboral: 7:00 AM - 5:00 PM'}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.dias_semana}>
                    <InputLabel shrink>Días de la Semana</InputLabel>
                    <Select
                      sx={selectStableSX}
                      multiple
                      name="dias_semana"
                      value={formData.dias_semana}
                      onChange={handleDiasChange}
                      label="Días de la Semana"
                      renderValue={(selected) =>
                        (selected || [])
                          .map(dia => diasSemana.find(d => d.value === dia)?.label)
                          .filter(Boolean)
                          .join(', ')
                      }
                      MenuProps={menuProps}
                    >
                      {diasSemana.map((dia, index) => (
                        <MenuItem key={`dia-${dia.value || index}`} value={dia.value}>
                          {dia.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.dias_semana && <FormHelperText>{errors.dias_semana}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Duración (minutos)"
                    name="duracion_minutos"
                    value={formData.duracion_minutos}
                    onChange={handleChange}
                    inputProps={{ min: 15, max: 120 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ===== Costos y Contrato (vertical) ===== */}
            <Box sx={sectionBoxSX}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Costos y Contrato
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Número de Sesiones"
                    name="numero_sesiones_contratadas"
                    value={formData.numero_sesiones_contratadas}
                    onChange={handleChange}
                    error={!!errors.numero_sesiones_contratadas}
                    helperText={errors.numero_sesiones_contratadas}
                    inputProps={{ min: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Costo Total"
                    name="costo_total"
                    value={formData.costo_total}
                    onChange={handleChange}
                    error={!!errors.costo_total}
                    helperText={errors.costo_total}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Meses de Contrato"
                    name="meses_contrato"
                    value={formData.meses_contrato}
                    onChange={handleChange}
                    inputProps={{ min: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Observaciones"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Observaciones adicionales sobre la sesión..."
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ===== Acciones ===== */}
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                type="submit"
                color="primary"
                startIcon={<Add />}
                disabled={loading}
                size="large"
              >
                Crear Sesión
              </Button>
              <Button
                variant="outlined"
                onClick={resetForm}
                color="secondary"
                disabled={loading}
                size="large"
              >
                Limpiar Formulario
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar (sin cambios de lógica) */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Formulario de Creación de Persona */}
      <UnifiedPersonForm
        open={showPersonForm}
        onClose={() => setShowPersonForm(false)}
        onPersonCreated={(newPerson) => {
          // Default to treating as terapeuta, but user can select role later
          handleTerapeutaSelect({
            ...newPerson,
            displayName: newPerson.displayName || `${newPerson.nombre} ${newPerson.apellido}`
          });
          setShowPersonForm(false);
        }}
        personType="persona"
        title="Crear Nueva Persona (Terapeuta/Paciente)"
        enableMultiStep={false}
      />
    </Box>
  );
};

export default CrearSesionTerapeutica;
