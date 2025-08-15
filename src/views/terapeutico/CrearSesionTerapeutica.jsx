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
  Alert
} from '@mui/material';
import { Add, Psychology } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

/* ---------- Estilos (como en UsuarioFormulario.jsx) ---------- */
const cardShellSX = {
  borderRadius: 4,
  mb: 3,
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
  overflow: 'hidden',
  width: '100%',
  maxWidth: { xs: '100%', sm: 680, md: 820, lg: 900 },
  mx: 'auto'
};

const mainHeaderSX = {
  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
  color: 'white',
  p: 3,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const sectionBoxSX = {
  mb: 3,
  p: 3,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  bgcolor: '#fff'
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

const CrearSesionTerapeutica = () => {
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
    estado: 'activo',
    observaciones: '',
    paciente_id: ''
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    } catch (err) {
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo?.trim()) newErrors.titulo = 'Título requerido';
    if (!formData.terapeuta_id) newErrors.terapeuta_id = 'Terapeuta requerido';
    if (!formData.especialidad_id) newErrors.especialidad_id = 'Especialidad requerida';
    if (!formData.fecha_inicio) newErrors.fecha_inicio = 'Fecha de inicio requerida';
    if (!formData.fecha_fin) newErrors.fecha_fin = 'Fecha de fin requerida';
    if (!formData.dias_semana.length) newErrors.dias_semana = 'Seleccione al menos un día';
    if (!formData.hora_inicio) newErrors.hora_inicio = 'Hora de inicio requerida';
    if (!formData.numero_sesiones_contratadas || formData.numero_sesiones_contratadas < 1) {
      newErrors.numero_sesiones_contratadas = 'Número de sesiones debe ser mayor a 0';
    }
    if (!formData.costo_total || formData.costo_total < 0) {
      newErrors.costo_total = 'Costo total debe ser mayor o igual a 0';
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const fechaInicio = new Date(formData.fecha_inicio);
      const fechaFin = new Date(formData.fecha_fin);
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
        terapeuta_id: parseInt(formData.terapeuta_id),
        especialidad_id: parseInt(formData.especialidad_id),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        dias_semana: formData.dias_semana,
        hora_inicio: formData.hora_inicio,
        duracion_minutos: parseInt(formData.duracion_minutos),
        numero_sesiones_contratadas: parseInt(formData.numero_sesiones_contratadas),
        costo_total: parseFloat(formData.costo_total),
        meses_contrato: formData.meses_contrato ? parseInt(formData.meses_contrato) : null,
        estado: formData.estado,
        observaciones: formData.observaciones?.trim() || null
      };

      if (formData.paciente_id) {
        sessionData.paciente_id = parseInt(formData.paciente_id);
      }

      await sesionTerapiaService.createSesion(sessionData);

      setSnackbar({ open: true, message: 'Sesión creada correctamente', severity: 'success' });
      resetForm();
    } catch (err) {
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
      estado: 'activo',
      observaciones: '',
      paciente_id: ''
    });
    setErrors({});
  };

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, py: 0 }}>
      {/* ===== Card principal con header estilo UsuarioFormulario ===== */}
      <Card elevation={8} sx={cardShellSX}>
        <Box sx={mainHeaderSX}>
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
                  <FormControl fullWidth error={!!errors.terapeuta_id}>
                    <InputLabel shrink>Terapeuta</InputLabel>
                    <Select
                      sx={selectStableSX}
                      name="terapeuta_id"
                      value={formData.terapeuta_id}
                      onChange={handleChange}
                      label="Terapeuta"
                      disabled={loading}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return 'Seleccione un terapeuta';
                        const t = terapeutasDisponibles.find(x => x.id === selected || String(x.id) === String(selected));
                        return t
                          ? `${t.nombre_completo || t.nombre || 'Sin nombre'} - ${t.titulo_profesional || t.especialidad_nombre || 'Especialista'}`
                          : 'Seleccione un terapeuta';
                      }}
                      MenuProps={menuProps}
                    >
                      <MenuItem value="">{loading ? 'Cargando terapeutas...' : 'Seleccione un terapeuta'}</MenuItem>
                      {!loading && terapeutasDisponibles.length === 0 ? (
                        <MenuItem disabled>No hay terapeutas disponibles</MenuItem>
                      ) : (
                        terapeutasDisponibles.map((terapeuta) => (
                          <MenuItem key={terapeuta.id} value={terapeuta.id}>
                            {`${terapeuta.nombre_completo || terapeuta.nombre || 'Sin nombre'} - ${terapeuta.titulo_profesional || terapeuta.especialidad_nombre || 'Especialista'}`}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.terapeuta_id && <FormHelperText>{errors.terapeuta_id}</FormHelperText>}
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
                        especialidades.map((especialidad) => (
                          <MenuItem key={especialidad.id} value={especialidad.id}>
                            {`${especialidad.nombre || 'Sin nombre'} - ${especialidad.area || 'General'}`}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.especialidad_id && <FormHelperText>{errors.especialidad_id}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.paciente_id}>
                    <InputLabel shrink>Paciente (Opcional - Sesión Individual)</InputLabel>
                    <Select
                      sx={selectStableSX}
                      name="paciente_id"
                      value={formData.paciente_id}
                      onChange={handleChange}
                      label="Paciente (Opcional - Sesión Individual)"
                      disabled={loading}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) return 'Sin paciente asignado (Sesión grupal)';
                        const p = pacientesDisponibles.find(x => x.id === selected || String(x.id) === String(selected));
                        return p
                          ? `${p.nombre_completo || p.nombre || 'Sin nombre'} - ${p.numero_historial || p.cedula || 'Sin ID'}`
                          : 'Sin paciente asignado (Sesión grupal)';
                      }}
                      MenuProps={menuProps}
                    >
                      <MenuItem value="">{loading ? 'Cargando pacientes...' : 'Sin paciente asignado (Sesión grupal)'}</MenuItem>
                      {!loading && pacientesDisponibles.length === 0 ? (
                        <MenuItem disabled>No hay pacientes disponibles</MenuItem>
                      ) : (
                        pacientesDisponibles.map((paciente) => (
                          <MenuItem key={paciente.id} value={paciente.id}>
                            {`${paciente.nombre_completo || paciente.nombre || 'Sin nombre'} - ${paciente.numero_historial || paciente.cedula || 'Sin ID'}`}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.paciente_id && <FormHelperText>{errors.paciente_id}</FormHelperText>}
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
                    helperText={errors.fecha_inicio}
                    InputLabelProps={{ shrink: true }}
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
                  <TextField
                    type="time"
                    fullWidth
                    label="Hora de Inicio"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                    error={!!errors.hora_inicio}
                    helperText={errors.hora_inicio}
                    InputLabelProps={{ shrink: true }}
                  />
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
                      {diasSemana.map((dia) => (
                        <MenuItem key={dia.value} value={dia.value}>
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
    </Box>
  );
};

export default CrearSesionTerapeutica;
