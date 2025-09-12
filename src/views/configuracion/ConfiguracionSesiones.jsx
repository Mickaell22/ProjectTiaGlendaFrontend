import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Stack,
  Divider,
  Box,
  InputAdornment
} from '@mui/material';
import {
  Save,
  Schedule,
  School,
  AccessTime,
  Notifications,
  Group,
  Grade
} from '@mui/icons-material';

const ConfiguracionSesiones = ({ configuracion = {}, onSave }) => {
  const [formData, setFormData] = useState({
    duracionSesionTerapia: 60,
    duracionClasePedagogica: 45,
    toleranciaLlegadaTarde: 15,
    tiempoRecordatorio: 15,
    permitirCancelacionHoras: 24,
    permitirReprogramacionHoras: 24,
    capacidadMaximaClase: 12,
    sistemaCalificaciones: 'numerico',
    escalaCalificacionMin: 1,
    escalaCalificacionMax: 10,
    ...configuracion
  });

  const sistemasCalificaciones = [
    { value: 'numerico', label: 'Numérico (1-10)' },
    { value: 'alfabetico', label: 'Alfabético (A-F)' },
    { value: 'conceptual', label: 'Conceptual (Excelente, Bueno, Regular, Deficiente)' }
  ];

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...configuracion }));
  }, [configuracion]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (formData.duracionSesionTerapia <= 0 || formData.duracionSesionTerapia > 300) {
      alert('La duración de sesión terapéutica debe estar entre 1 y 300 minutos');
      return;
    }
    
    if (formData.duracionClasePedagogica <= 0 || formData.duracionClasePedagogica > 300) {
      alert('La duración de clase pedagógica debe estar entre 1 y 300 minutos');
      return;
    }
    
    if (formData.capacidadMaximaClase <= 0 || formData.capacidadMaximaClase > 100) {
      alert('La capacidad máxima de clase debe estar entre 1 y 100 estudiantes');
      return;
    }

    if (formData.escalaCalificacionMin >= formData.escalaCalificacionMax) {
      alert('La escala mínima debe ser menor que la escala máxima');
      return;
    }
    
    onSave(formData);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3} display="flex" alignItems="center">
          <Schedule sx={{ mr: 1 }} />
          Configuración de Sesiones y Clases
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            
            {/* Sesiones Terapéuticas */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Sesiones Terapéuticas
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Duración por Defecto"
                name="duracionSesionTerapia"
                value={formData.duracionSesionTerapia}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">minutos</InputAdornment>,
                }}
                helperText="Duración estándar de una sesión terapéutica"
                inputProps={{ min: 15, max: 300 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Tolerancia Llegada Tarde"
                name="toleranciaLlegadaTarde"
                value={formData.toleranciaLlegadaTarde}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">minutos</InputAdornment>,
                }}
                helperText="Tiempo máximo de tolerancia para llegadas tardías"
                inputProps={{ min: 0, max: 60 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Recordatorio Anticipado"
                name="tiempoRecordatorio"
                value={formData.tiempoRecordatorio}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">minutos</InputAdornment>,
                }}
                helperText="Tiempo antes de la sesión para enviar recordatorio"
                inputProps={{ min: 5, max: 120 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Cancelación Mínima"
                name="permitirCancelacionHoras"
                value={formData.permitirCancelacionHoras}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">horas</InputAdornment>,
                }}
                helperText="Horas mínimas requeridas para cancelar"
                inputProps={{ min: 1, max: 168 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Reprogramación Mínima"
                name="permitirReprogramacionHoras"
                value={formData.permitirReprogramacionHoras}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">horas</InputAdornment>,
                }}
                helperText="Horas mínimas requeridas para reprogramar"
                inputProps={{ min: 1, max: 168 }}
              />
            </Grid>

            {/* Clases Pedagógicas */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
                <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                Clases Pedagógicas
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Duración por Defecto"
                name="duracionClasePedagogica"
                value={formData.duracionClasePedagogica}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">minutos</InputAdornment>,
                }}
                helperText="Duración estándar de una clase pedagógica"
                inputProps={{ min: 15, max: 300 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Capacidad Máxima"
                name="capacidadMaximaClase"
                value={formData.capacidadMaximaClase}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">estudiantes</InputAdornment>,
                }}
                helperText="Número máximo de estudiantes por clase"
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>

            {/* Sistema de Calificaciones */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
                <Grade sx={{ mr: 1, verticalAlign: 'middle' }} />
                Sistema de Calificaciones
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tipo de Calificación"
                name="sistemaCalificaciones"
                value={formData.sistemaCalificaciones}
                onChange={handleChange}
                helperText="Sistema de calificación a utilizar"
              >
                {sistemasCalificaciones.map((sistema) => (
                  <MenuItem key={sistema.value} value={sistema.value}>
                    {sistema.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {formData.sistemaCalificaciones === 'numerico' && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Calificación Mínima"
                    name="escalaCalificacionMin"
                    value={formData.escalaCalificacionMin}
                    onChange={handleChange}
                    helperText="Nota más baja"
                    inputProps={{ min: 0, max: 20 }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Calificación Máxima"
                    name="escalaCalificacionMax"
                    value={formData.escalaCalificacionMax}
                    onChange={handleChange}
                    helperText="Nota más alta"
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
              </>
            )}

            {/* Información adicional */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.100', 
                  borderRadius: 1, 
                  mt: 2 
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  <strong>Información importante:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" component="ul" sx={{ mt: 1, pl: 2 }}>
                  <li>Los cambios en duración afectarán solo a las nuevas sesiones creadas</li>
                  <li>Las políticas de cancelación y reprogramación se aplicarán inmediatamente</li>
                  <li>El sistema de calificaciones puede cambiarse, pero afectará la visualización de calificaciones existentes</li>
                  <li>Los recordatorios se enviarán automáticamente según la configuración establecida</li>
                </Typography>
              </Box>
            </Grid>

            {/* Botones de acción */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button 
                  variant="contained" 
                  type="submit" 
                  color="primary"
                  startIcon={<Save />}
                  size="large"
                >
                  Guardar Configuración de Sesiones
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConfiguracionSesiones;