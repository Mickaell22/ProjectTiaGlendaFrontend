// src/views/terapeutico/CrearSesionTerapeutica.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, Paper, Snackbar, TextField,
  Typography, Alert, Grid, MenuItem, Stack, FormControl, InputLabel, 
  Select, FormHelperText
} from '@mui/material';
import { 
  Add, Psychology
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

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
      
      setPacientesDisponibles(pacientesRes.data || []);
      setTerapeutasDisponibles(terapeutasRes.data || []);
      setEspecialidades(especialidadesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
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
    
    // Validar fechas
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

      // Si es sesión individual, agregar paciente
      if (formData.paciente_id) {
        sessionData.paciente_id = parseInt(formData.paciente_id);
      }

      await sesionTerapiaService.createSesion(sessionData);
      
      setSnackbar({ open: true, message: 'Sesión creada correctamente', severity: 'success' });
      resetForm();
    } catch (err) {
      console.error('Error saving session:', err);
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
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, p: 3, mb: 4 }}>
        <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
          <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
          Crear Nueva Sesión Terapéutica
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Título de la Sesión"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                error={!!errors.titulo}
                helperText={errors.titulo}
                placeholder="Ej: Terapia física para rehabilitación"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.terapeuta_id}>
                <InputLabel>Terapeuta</InputLabel>
                <Select
                  name="terapeuta_id"
                  value={formData.terapeuta_id}
                  onChange={handleChange}
                  label="Terapeuta"
                >
                  <MenuItem value="">Seleccione un terapeuta</MenuItem>
                  {terapeutasDisponibles.map((terapeuta) => (
                    <MenuItem key={terapeuta.id} value={terapeuta.id}>
                      {`${terapeuta.nombre} - ${terapeuta.especialidad_nombre}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.terapeuta_id && <FormHelperText>{errors.terapeuta_id}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.especialidad_id}>
                <InputLabel>Especialidad</InputLabel>
                <Select
                  name="especialidad_id"
                  value={formData.especialidad_id}
                  onChange={handleChange}
                  label="Especialidad"
                >
                  <MenuItem value="">Seleccione una especialidad</MenuItem>
                  {especialidades.map((especialidad) => (
                    <MenuItem key={especialidad.id} value={especialidad.id}>
                      {`${especialidad.nombre} - ${especialidad.area}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.especialidad_id && <FormHelperText>{errors.especialidad_id}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.paciente_id}>
                <InputLabel>Paciente (Opcional - Sesión Individual)</InputLabel>
                <Select
                  name="paciente_id"
                  value={formData.paciente_id}
                  onChange={handleChange}
                  label="Paciente (Opcional - Sesión Individual)"
                >
                  <MenuItem value="">Sin paciente asignado (Sesión grupal)</MenuItem>
                  {pacientesDisponibles.map((paciente) => (
                    <MenuItem key={paciente.id} value={paciente.id}>
                      {`${paciente.nombre} - ${paciente.numero_historial || paciente.cedula}`}
                    </MenuItem>
                  ))}
                </Select>
                {errors.paciente_id && <FormHelperText>{errors.paciente_id}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.dias_semana}>
                <InputLabel>Días de la Semana</InputLabel>
                <Select
                  multiple
                  name="dias_semana"
                  value={formData.dias_semana}
                  onChange={handleDiasChange}
                  label="Días de la Semana"
                  renderValue={(selected) => selected.map(dia => 
                    diasSemana.find(d => d.value === dia)?.label
                  ).join(', ')}
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Duración (minutos)"
                name="duracion_minutos"
                value={formData.duracion_minutos}
                onChange={handleChange}
                inputProps={{ min: 15, max: 120 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
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
              />
            </Grid>

            <Grid item xs={12} md={4}>
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
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Meses de Contrato"
                name="meses_contrato"
                value={formData.meses_contrato}
                onChange={handleChange}
                inputProps={{ min: 1 }}
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
              />
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
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
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CrearSesionTerapeutica;