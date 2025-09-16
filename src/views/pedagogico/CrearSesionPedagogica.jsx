// src/views/pedagogico/CrearSesionPedagogica.jsx
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
import { Add, School } from '@mui/icons-material';
import sesionPedagogicaService from 'src/services/SesionPedagogicaService';

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
  color: 'white',
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

const CrearSesionPedagogica = () => {
  const theme = useTheme();
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [pedagogosDisponibles, setPedagogosDisponibles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    pedagogo_id: '',
    especialidad_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    dias_semana: [],
    hora_inicio: '',
    duracion_minutos: 60,
    numero_clases_programadas: 8,
    costo_total: 0,
    costo_por_clase: 0,
    nivel_academico: '',
    modalidad: 'presencial',
    capacidad_maxima: 10,
    periodo_academico: '',
    estado: 'planificada',
    observaciones: ''
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' }
  ];

  const nivelesAcademicos = [
    { value: 'preescolar', label: 'Preescolar' },
    { value: 'primaria', label: 'Primaria' },
    { value: 'secundaria', label: 'Secundaria' },
    { value: 'bachillerato', label: 'Bachillerato' }
  ];

  const modalidades = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Virtual' },
    { value: 'hibrida', label: 'Híbrida' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      
      const [estudiantesRes, pedagogosRes, especialidadesRes] = await Promise.all([
        sesionPedagogicaService.getEstudiantesDisponibles(),
        sesionPedagogicaService.getPedagogosDisponibles(),
        sesionPedagogicaService.getEspecialidades()
      ]);


      const estudiantes = estudiantesRes?.data || estudiantesRes || [];
      const pedagogos = pedagogosRes?.data || pedagogosRes || [];
      const especialidades = especialidadesRes?.data || especialidadesRes || [];


      setEstudiantesDisponibles(estudiantes);
      setPedagogosDisponibles(pedagogos);
      setEspecialidades(especialidades);
      
      setSnackbar({ 
        open: true, 
        message: `Datos cargados: ${estudiantes.length} estudiantes, ${pedagogos.length} pedagogos, ${especialidades.length} especialidades`, 
        severity: 'info' 
      });
    } catch (err) {
      console.error('Error fetching form data:', err);
      const errorMessage = sesionPedagogicaService.handleError(err);
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

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Solo comparar fechas, no horas

    if (!formData.titulo?.trim()) newErrors.titulo = 'Título requerido';
    if (!formData.pedagogo_id) newErrors.pedagogo_id = 'Pedagogo requerido';
    if (!formData.especialidad_id) newErrors.especialidad_id = 'Especialidad requerida';
    if (!formData.nivel_academico) newErrors.nivel_academico = 'Nivel académico requerido';
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
    if (!formData.numero_clases_programadas || formData.numero_clases_programadas < 1) {
      newErrors.numero_clases_programadas = 'Número de clases debe ser mayor a 0';
    }
    if (formData.costo_total < 0) {
      newErrors.costo_total = 'Costo total debe ser mayor o igual a 0';
    }
    if (!formData.capacidad_maxima || formData.capacidad_maxima < 1) {
      newErrors.capacidad_maxima = 'Capacidad máxima debe ser mayor a 0';
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
        pedagogo_id: parseInt(formData.pedagogo_id),
        especialidad_id: parseInt(formData.especialidad_id),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        dias_semana: formData.dias_semana,
        hora_inicio: formData.hora_inicio,
        duracion_minutos: parseInt(formData.duracion_minutos),
        numero_clases_programadas: parseInt(formData.numero_clases_programadas),
        costo_total: parseFloat(formData.costo_total),
        costo_por_clase: parseFloat(formData.costo_total) / parseInt(formData.numero_clases_programadas),
        nivel_academico: formData.nivel_academico,
        modalidad: formData.modalidad,
        capacidad_maxima: parseInt(formData.capacidad_maxima),
        periodo_academico: formData.periodo_academico?.trim() || null,
        estado: formData.estado,
        observaciones: formData.observaciones?.trim() || null
      };

      const response = await sesionPedagogicaService.createSesion(sessionData);

      setSnackbar({ 
        open: true, 
        message: `Sesión "${sessionData.titulo}" creada correctamente`, 
        severity: 'success' 
      });
      resetForm();
    } catch (err) {
      console.error('Error creating session:', err);
      console.error('Error details:', err.response?.data);
      const errorMessage = sesionPedagogicaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      pedagogo_id: '',
      especialidad_id: '',
      fecha_inicio: '',
      fecha_fin: '',
      dias_semana: [],
      hora_inicio: '',
      duracion_minutos: 60,
      numero_clases_programadas: 8,
      costo_total: 0,
      costo_por_clase: 0,
      nivel_academico: '',
      modalidad: 'presencial',
      capacidad_maxima: 10,
      periodo_academico: '',
      estado: 'planificada',
      observaciones: ''
    });
    setErrors({});
  };

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, py: 0 }}>
      {/* ===== Card principal con header estilo UsuarioFormulario ===== */}
      <Card elevation={8} sx={getCardShellSX(theme)}>
        <Box sx={getMainHeaderSX(theme)}>
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <School sx={{ mr: 1 }} />
              Crear Nueva Sesión Pedagógica
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Define la programación, costos y capacidad para una sesión educativa grupal.
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
                    placeholder="Ej: Lectoescritura Inicial 2025"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.pedagogo_id}>
                    <InputLabel shrink>Pedagogo/Educador</InputLabel>
                    <Select
                      sx={selectStableSX}
                      name="pedagogo_id"
                      value={formData.pedagogo_id}
                      onChange={handleChange}
                      label="Pedagogo/Educador"
                      disabled={loading}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return 'Seleccione un pedagogo';
                        const p = pedagogosDisponibles.find(x => x.id === selected || String(x.id) === String(selected));
                        return p
                          ? `${p.nombre_completo || p.nombre || 'Sin nombre'} - ${p.titulo_profesional || p.especialidad_nombre || 'Educador'}`
                          : 'Seleccione un pedagogo';
                      }}
                      MenuProps={menuProps}
                    >
                      <MenuItem value="">{loading ? 'Cargando pedagogos...' : 'Seleccione un pedagogo'}</MenuItem>
                      {!loading && pedagogosDisponibles.length === 0 ? (
                        <MenuItem disabled>No hay pedagogos disponibles</MenuItem>
                      ) : (
                        pedagogosDisponibles.map((pedagogo, index) => (
                          <MenuItem key={`pedagogo-${pedagogo.id || index}`} value={pedagogo.id}>
                            {`${pedagogo.nombre_completo || pedagogo.nombre || 'Sin nombre'} - ${pedagogo.titulo_profesional || pedagogo.especialidad_nombre || 'Educador'}`}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.pedagogo_id && <FormHelperText>{errors.pedagogo_id}</FormHelperText>}
                  </FormControl>
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
                  <FormControl fullWidth error={!!errors.nivel_academico}>
                    <InputLabel shrink>Nivel Académico</InputLabel>
                    <Select
                      sx={selectStableSX}
                      name="nivel_academico"
                      value={formData.nivel_academico}
                      onChange={handleChange}
                      label="Nivel Académico"
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return 'Seleccione un nivel académico';
                        const nivel = nivelesAcademicos.find(n => n.value === selected);
                        return nivel ? nivel.label : 'Seleccione un nivel académico';
                      }}
                      MenuProps={menuProps}
                    >
                      <MenuItem value="">Seleccione un nivel académico</MenuItem>
                      {nivelesAcademicos.map((nivel, index) => (
                        <MenuItem key={`nivel-${nivel.value || index}`} value={nivel.value}>
                          {nivel.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.nivel_academico && <FormHelperText>{errors.nivel_academico}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Modalidad</InputLabel>
                    <Select
                      sx={selectStableSX}
                      name="modalidad"
                      value={formData.modalidad}
                      onChange={handleChange}
                      label="Modalidad"
                      renderValue={(selected) => {
                        const modalidad = modalidades.find(m => m.value === selected);
                        return modalidad ? modalidad.label : 'Presencial';
                      }}
                      MenuProps={menuProps}
                    >
                      {modalidades.map((modalidad, index) => (
                        <MenuItem key={`modalidad-${modalidad.value || index}`} value={modalidad.value}>
                          {modalidad.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                    inputProps={{ min: 30, max: 180 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* ===== Configuración Académica (vertical) ===== */}
            <Box sx={sectionBoxSX}>
              <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Configuración Académica
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2} direction="column">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Número de Clases"
                    name="numero_clases_programadas"
                    value={formData.numero_clases_programadas}
                    onChange={handleChange}
                    error={!!errors.numero_clases_programadas}
                    helperText={errors.numero_clases_programadas}
                    inputProps={{ min: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Capacidad Máxima"
                    name="capacidad_maxima"
                    value={formData.capacidad_maxima}
                    onChange={handleChange}
                    error={!!errors.capacidad_maxima}
                    helperText={errors.capacidad_maxima}
                    inputProps={{ min: 1, max: 50 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Período Académico"
                    name="periodo_academico"
                    value={formData.periodo_academico}
                    onChange={handleChange}
                    placeholder="Ej: 2025-A, Trimestre I, etc."
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
                    multiline
                    rows={3}
                    label="Observaciones"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Observaciones adicionales sobre la sesión pedagógica..."
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
    </Box>
  );
};

export default CrearSesionPedagogica;