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
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Add, School } from '@mui/icons-material';
import sesionPedagogicaService from 'src/services/SesionPedagogicaService';

/* ---------- Estilos ---------- */
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
  background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
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

const selectStableSX = {
  width: '100%',
  '& .MuiSelect-select': {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '1.4375em',
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
    hora_fin: '',
    duracion_minutos: 60,
    numero_clases_programadas: 8,
    costo_total: 0,
    costo_por_clase: 0,
    nivel_academico: '',
    modalidad_delivery: 'presencial',
    modalidad_formato: 'grupal',
    capacidad_maxima: 10,
    periodo_academico: '',
    estado: 'planificada',
    observaciones: ''
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // Opciones para días de la semana
  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  // Opciones para niveles académicos
  const nivelesAcademicos = [
    { value: 'inicial', label: 'Educación Inicial' },
    { value: 'preescolar', label: 'Preescolar' },
    { value: 'primaria_basica', label: 'Primaria Básica' },
    { value: 'primaria_avanzada', label: 'Primaria Avanzada' },
    { value: 'secundaria', label: 'Secundaria' },
    { value: 'bachillerato', label: 'Bachillerato' },
    { value: 'adultos', label: 'Educación de Adultos' },
    { value: 'especial', label: 'Educación Especial' }
  ];

  // Opciones para modalidades (organizadas por tipo)
  const modalidadesDelivery = [
    { value: 'presencial', label: 'Presencial', icon: '🏫' },
    { value: 'virtual', label: 'Virtual', icon: '💻' },
    { value: 'hibrida', label: 'Híbrida', icon: '🔄' }
  ];

  const modalidadesFormato = [
    { value: 'individual', label: 'Individual', icon: '👤' },
    { value: 'grupal', label: 'Grupal', icon: '👥' }
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

      setEstudiantesDisponibles(estudiantesRes.data || []);
      setPedagogosDisponibles(pedagogosRes.data || []);
      setEspecialidades(especialidadesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos necesarios',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Ajustar capacidad automáticamente cuando cambie el formato
    if (name === 'modalidad_formato') {
      const newCapacidad = value === 'individual' ? 1 : 10;
      setFormData(prev => ({
        ...prev,
        [name]: value,
        capacidad_maxima: newCapacidad
      }));
    }

    // Calcular costo por clase automáticamente
    if (name === 'costo_total' || name === 'numero_clases_programadas') {
      const total = name === 'costo_total' ? parseFloat(value) || 0 : formData.costo_total;
      const clases = name === 'numero_clases_programadas' ? parseInt(value) || 1 : formData.numero_clases_programadas;
      const costoPorClase = clases > 0 ? (total / clases).toFixed(2) : 0;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        costo_por_clase: parseFloat(costoPorClase)
      }));
    }

    // Calcular duración automáticamente si se cambian las horas
    if (name === 'hora_inicio' || name === 'hora_fin') {
      if (formData.hora_inicio && formData.hora_fin) {
        const inicio = name === 'hora_inicio' ? value : formData.hora_inicio;
        const fin = name === 'hora_fin' ? value : formData.hora_fin;
        
        if (inicio && fin) {
          const duracion = calcularDuracion(inicio, fin);
          setFormData(prev => ({
            ...prev,
            [name]: value,
            duracion_minutos: duracion
          }));
        }
      }
    }
  };

  const handleDiaSemanaChange = (dia) => {
    const diasActuales = [...formData.dias_semana];
    const index = diasActuales.indexOf(dia);
    
    if (index > -1) {
      diasActuales.splice(index, 1);
    } else {
      diasActuales.push(dia);
    }
    
    setFormData(prev => ({
      ...prev,
      dias_semana: diasActuales
    }));
  };

  const calcularDuracion = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return 60;
    
    const [horaIni, minIni] = horaInicio.split(':').map(Number);
    const [horaEnd, minEnd] = horaFin.split(':').map(Number);
    
    const minutosInicio = horaIni * 60 + minIni;
    const minutosFin = horaEnd * 60 + minEnd;
    
    return minutosFin - minutosInicio;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) newErrors.titulo = 'El título es requerido';
    if (!formData.pedagogo_id) newErrors.pedagogo_id = 'Debe seleccionar un pedagogo';
    if (!formData.especialidad_id) newErrors.especialidad_id = 'Debe seleccionar una especialidad';
    if (!formData.fecha_inicio) newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    if (!formData.fecha_fin) newErrors.fecha_fin = 'La fecha de fin es requerida';
    if (formData.dias_semana.length === 0) newErrors.dias_semana = 'Debe seleccionar al menos un día';
    if (!formData.hora_inicio) newErrors.hora_inicio = 'La hora de inicio es requerida';
    if (!formData.hora_fin) newErrors.hora_fin = 'La hora de fin es requerida';
    if (!formData.nivel_academico) newErrors.nivel_academico = 'El nivel académico es requerido';
    if (!formData.modalidad_delivery) newErrors.modalidad_delivery = 'Debe seleccionar una modalidad de entrega';
    if (!formData.modalidad_formato) newErrors.modalidad_formato = 'Debe seleccionar un formato de sesión';

    // Validar capacidad según formato
    if (formData.modalidad_formato === 'individual' && formData.capacidad_maxima > 1) {
      newErrors.capacidad_maxima = 'Para sesiones individuales, la capacidad debe ser 1';
    }
    if (formData.modalidad_formato === 'grupal' && formData.capacidad_maxima < 2) {
      newErrors.capacidad_maxima = 'Para sesiones grupales, la capacidad debe ser mayor a 1';
    }

    // Validar fechas
    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_inicio) >= new Date(formData.fecha_fin)) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    // Validar horas
    if (formData.hora_inicio && formData.hora_fin) {
      if (formData.hora_inicio >= formData.hora_fin) {
        newErrors.hora_fin = 'La hora de fin debe ser posterior a la hora de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Por favor corrija los errores en el formulario',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Combinar modalidades para envío al backend y procesar datos
      const dataToSubmit = {
        ...formData,
        modalidad: `${formData.modalidad_delivery}|${formData.modalidad_formato}`,
        // Convert numeric fields to proper types
        duracion_minutos: parseInt(formData.duracion_minutos) || 60,
        numero_clases_programadas: parseInt(formData.numero_clases_programadas) || 8,
        capacidad_maxima: parseInt(formData.capacidad_maxima) || 10,
        costo_total: parseFloat(formData.costo_total) || 0,
        costo_por_clase: parseFloat(formData.costo_por_clase) || 0,
        // Ensure we have hora_fin calculated if it's empty
        hora_fin: formData.hora_fin || (() => {
          if (formData.hora_inicio && formData.duracion_minutos) {
            const [hora, min] = formData.hora_inicio.split(':').map(Number);
            const totalMinutos = hora * 60 + min + parseInt(formData.duracion_minutos);
            const horaFin = Math.floor(totalMinutos / 60);
            const minFin = totalMinutos % 60;
            return `${horaFin.toString().padStart(2, '0')}:${minFin.toString().padStart(2, '0')}`;
          }
          return null;
        })()
      };
      delete dataToSubmit.modalidad_delivery;
      delete dataToSubmit.modalidad_formato;
      
      // Debug: Log data being submitted
      console.log('Data to submit:', dataToSubmit);
      
      await sesionPedagogicaService.createSesion(dataToSubmit);
      
      setSnackbar({
        open: true,
        message: 'Sesión pedagógica creada exitosamente',
        severity: 'success'
      });
      
      // Refresh data after successful creation
      fetchData();
      
      // Limpiar formulario
      setFormData({
        titulo: '',
        pedagogo_id: '',
        especialidad_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        dias_semana: [],
        hora_inicio: '',
        hora_fin: '',
        duracion_minutos: 60,
        numero_clases_programadas: 8,
        costo_total: 0,
        costo_por_clase: 0,
        nivel_academico: '',
        modalidad_delivery: 'presencial',
        modalidad_formato: 'grupal',
        capacidad_maxima: 10,
        periodo_academico: '',
        estado: 'planificada',
        observaciones: ''
      });
      
    } catch (error) {
      console.error('Error creating session:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = sesionPedagogicaService.handleError(error);
      
      // Try to get more specific error message
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Card elevation={8} sx={cardShellSX}>
        {/* Header */}
        <Box sx={mainHeaderSX}>
          <Box>
            <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center">
              <School sx={{ mr: 2 }} />
              Crear Nueva Sesión Pedagógica
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
              Complete la información para programar una nueva sesión educativa
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Información Básica */}
            <Box sx={sectionBoxSX}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                Información Básica
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
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
                    placeholder="Ej: Matemáticas Básicas - Grupo A"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.pedagogo_id}>
                    <InputLabel>Pedagogo/Educador</InputLabel>
                    <Select
                      name="pedagogo_id"
                      value={formData.pedagogo_id}
                      onChange={handleChange}
                      label="Pedagogo/Educador"
                      MenuProps={menuProps}
                      sx={selectStableSX}
                    >
                      {pedagogosDisponibles.map((pedagogo) => (
                        <MenuItem key={pedagogo.id} value={pedagogo.id}>
                          {pedagogo.nombre_completo || `${pedagogo.nombres} ${pedagogo.apellidos}`}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.pedagogo_id && <FormHelperText>{errors.pedagogo_id}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.especialidad_id}>
                    <InputLabel>Especialidad Pedagógica</InputLabel>
                    <Select
                      name="especialidad_id"
                      value={formData.especialidad_id}
                      onChange={handleChange}
                      label="Especialidad Pedagógica"
                      MenuProps={menuProps}
                      sx={selectStableSX}
                    >
                      {especialidades.map((especialidad) => (
                        <MenuItem key={especialidad.id} value={especialidad.id}>
                          {especialidad.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.especialidad_id && <FormHelperText>{errors.especialidad_id}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.nivel_academico}>
                    <InputLabel>Nivel Académico</InputLabel>
                    <Select
                      name="nivel_academico"
                      value={formData.nivel_academico}
                      onChange={handleChange}
                      label="Nivel Académico"
                      MenuProps={menuProps}
                      sx={selectStableSX}
                    >
                      {nivelesAcademicos.map((nivel) => (
                        <MenuItem key={nivel.value} value={nivel.value}>
                          {nivel.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.nivel_academico && <FormHelperText>{errors.nivel_academico}</FormHelperText>}
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Programación */}
            <Box sx={sectionBoxSX}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                Programación de Clases
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    error={!!errors.fecha_inicio}
                    helperText={errors.fecha_inicio}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Finalización"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    error={!!errors.fecha_fin}
                    helperText={errors.fecha_fin}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Días de la Semana {errors.dias_semana && <span style={{color: 'red'}}>*</span>}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {diasSemana.map((dia) => (
                      <FormControlLabel
                        key={dia}
                        control={
                          <Checkbox
                            checked={formData.dias_semana.includes(dia)}
                            onChange={() => handleDiaSemanaChange(dia)}
                          />
                        }
                        label={dia}
                      />
                    ))}
                  </Box>
                  {errors.dias_semana && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.dias_semana}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora de Inicio"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleChange}
                    error={!!errors.hora_inicio}
                    helperText={errors.hora_inicio}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora de Finalización"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleChange}
                    error={!!errors.hora_fin}
                    helperText={errors.hora_fin}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Duración (minutos)"
                    name="duracion_minutos"
                    value={formData.duracion_minutos}
                    onChange={handleChange}
                    disabled
                    helperText="Se calcula automáticamente"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Configuración Académica */}
            <Box sx={sectionBoxSX}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                Configuración Académica
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Número de Clases Programadas"
                    name="numero_clases_programadas"
                    value={formData.numero_clases_programadas}
                    onChange={handleChange}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.modalidad_delivery}>
                    <InputLabel>Modalidad de Entrega</InputLabel>
                    <Select
                      name="modalidad_delivery"
                      value={formData.modalidad_delivery}
                      onChange={handleChange}
                      label="Modalidad de Entrega"
                      sx={selectStableSX}
                    >
                      {modalidadesDelivery.map((modalidad) => (
                        <MenuItem key={modalidad.value} value={modalidad.value}>
                          <Box display="flex" alignItems="center">
                            <Typography sx={{ mr: 1 }}>{modalidad.icon}</Typography>
                            {modalidad.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.modalidad_delivery && <FormHelperText>{errors.modalidad_delivery}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.modalidad_formato}>
                    <InputLabel>Formato de Sesión</InputLabel>
                    <Select
                      name="modalidad_formato"
                      value={formData.modalidad_formato}
                      onChange={handleChange}
                      label="Formato de Sesión"
                      sx={selectStableSX}
                    >
                      {modalidadesFormato.map((modalidad) => (
                        <MenuItem key={modalidad.value} value={modalidad.value}>
                          <Box display="flex" alignItems="center">
                            <Typography sx={{ mr: 1 }}>{modalidad.icon}</Typography>
                            {modalidad.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.modalidad_formato && <FormHelperText>{errors.modalidad_formato}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Capacidad Máxima de Estudiantes"
                    name="capacidad_maxima"
                    value={formData.capacidad_maxima}
                    onChange={handleChange}
                    error={!!errors.capacidad_maxima}
                    inputProps={{ min: 1, max: 50 }}
                    helperText={errors.capacidad_maxima || `Número máximo de estudiantes permitidos en la sesión (recomendado: ${formData.modalidad_formato === 'individual' ? '1' : '8-12'} estudiantes)`}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Período Académico"
                    name="periodo_academico"
                    value={formData.periodo_academico}
                    onChange={handleChange}
                    placeholder="Ej: 2024-I, Trimestre 1, etc."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      label="Estado"
                      sx={selectStableSX}
                    >
                      <MenuItem value="planificada">Planificada</MenuItem>
                      <MenuItem value="activa">Activa</MenuItem>
                      <MenuItem value="pausada">Pausada</MenuItem>
                      <MenuItem value="completada">Completada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Información Financiera */}
            <Box sx={sectionBoxSX}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                Información Financiera
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Costo Total"
                    name="costo_total"
                    value={formData.costo_total}
                    onChange={handleChange}
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText="Costo total del programa completo"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Costo por Clase"
                    name="costo_por_clase"
                    value={formData.costo_por_clase}
                    disabled
                    helperText="Se calcula automáticamente"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Observaciones */}
            <Box sx={sectionBoxSX}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                Observaciones Adicionales
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Información adicional sobre la sesión pedagógica..."
              />
            </Box>

            {/* Botones de acción */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                startIcon={<Add />}
                disabled={loading}
                sx={{ 
                  bgcolor: '#4CAF50', 
                  '&:hover': { bgcolor: '#388E3C' },
                  minWidth: 140
                }}
              >
                {loading ? 'Creando...' : 'Crear Sesión'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CrearSesionPedagogica;