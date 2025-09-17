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
  InputAdornment,
  useTheme
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
  const theme = useTheme();
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
    <Box sx={{ p: 3 }}>
      {/* Header mejorado */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', 
        color: 'white',
        boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)'
      }}>
        <CardContent sx={{ py: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="center" textAlign="center">
            <Schedule sx={{ mr: 3, fontSize: 48 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Configuración de Sesiones
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                Administra duraciones, políticas y sistemas de calificación
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Sesiones Terapéuticas */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': { 
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                  mr: 2
                }}>
                  <Schedule sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Sesiones Terapéuticas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configuración para terapias individuales
                  </Typography>
                </Box>
              </Box>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
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
                      helperText="Entre 15 y 300 minutos"
                      inputProps={{ min: 15, max: 300 }}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tolerancia Llegada"
                      name="toleranciaLlegadaTarde"
                      value={formData.toleranciaLlegadaTarde}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">min</InputAdornment>,
                      }}
                      helperText="0-60 minutos"
                      inputProps={{ min: 0, max: 60 }}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Recordatorio"
                      name="tiempoRecordatorio"
                      value={formData.tiempoRecordatorio}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">min</InputAdornment>,
                      }}
                      helperText="5-120 minutos"
                      inputProps={{ min: 5, max: 120 }}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Cancelación Mínima"
                      name="permitirCancelacionHoras"
                      value={formData.permitirCancelacionHoras}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
                      }}
                      helperText="1-168 horas"
                      inputProps={{ min: 1, max: 168 }}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Reprogramación Mínima"
                      name="permitirReprogramacionHoras"
                      value={formData.permitirReprogramacionHoras}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
                      }}
                      helperText="1-168 horas"
                      inputProps={{ min: 1, max: 168 }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Clases Pedagógicas */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': { 
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(45deg, #4caf50, #81c784)',
                  mr: 2
                }}>
                  <School sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Clases Pedagógicas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configuración para clases grupales
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
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
                    helperText="Entre 15 y 300 minutos"
                    inputProps={{ min: 15, max: 300 }}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
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
                    helperText="Entre 1 y 30 estudiantes máximo"
                    inputProps={{ min: 1, max: 30 }}
                    variant="outlined"
                  />
                </Grid>

                {/* Estadísticas actuales */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : '#f8f9fa', 
                    borderRadius: 2, 
                    border: `1px solid ${theme.palette.divider}` 
                  }}>
                    <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                      Configuración Actual:
                    </Typography>
                    <Typography variant="body2">
                      • Duración: <strong>{formData.duracionClasePedagogica} min</strong>
                    </Typography>
                    <Typography variant="body2">
                      • Capacidad: <strong>{formData.capacidadMaximaClase} estudiantes</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sistema de Calificaciones */}
        <Grid item xs={12}>
          <Card sx={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': { 
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                  mr: 2
                }}>
                  <Grade sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Sistema de Calificaciones
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configuración para evaluación académica
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de Calificación"
                    name="sistemaCalificaciones"
                    value={formData.sistemaCalificaciones}
                    onChange={handleChange}
                    helperText="Selecciona el sistema de evaluación"
                    variant="outlined"
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
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Calificación Mínima"
                        name="escalaCalificacionMin"
                        value={formData.escalaCalificacionMin}
                        onChange={handleChange}
                        helperText="Entre 0 y 20"
                        inputProps={{ min: 0, max: 20 }}
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Calificación Máxima"
                        name="escalaCalificacionMax"
                        value={formData.escalaCalificacionMax}
                        onChange={handleChange}
                        helperText="Entre 1 y 100"
                        inputProps={{ min: 1, max: 100 }}
                        variant="outlined"
                      />
                    </Grid>
                  </>
                )}

                {/* Preview de calificaciones */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 3, 
                    backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : '#f8f9fa', 
                    borderRadius: 2, 
                    border: `1px solid ${theme.palette.divider}`,
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                      Vista Previa del Sistema:
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {sistemasCalificaciones.find(s => s.value === formData.sistemaCalificaciones)?.label}
                    </Typography>
                    {formData.sistemaCalificaciones === 'numerico' && (
                      <Typography variant="body2" color="text.secondary">
                        Escala: <strong>{formData.escalaCalificacionMin} - {formData.escalaCalificacionMax}</strong>
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Información de ayuda y botones */}
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={handleSubmit} 
              startIcon={<Save />}
              size="large"
              sx={{ 
                background: 'linear-gradient(45deg, #4caf50, #81c784)',
                color: 'white',
                fontWeight: 'bold',
                px: 6,
                py: 1.5,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                '&:hover': { 
                  background: 'linear-gradient(45deg, #43a047, #66bb6a)',
                  boxShadow: '0 6px 25px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Guardar Configuración de Sesiones
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Los cambios se aplicarán según las políticas establecidas
            </Typography>
          </Box>
        </Grid>

        {/* Panel informativo */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', 
            border: '1px solid #81c784',
            mt: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <AccessTime sx={{ mr: 2, color: '#4caf50' }} />
                <Typography variant="h6" color="#2e7d32" fontWeight="bold">
                  Información Importante
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>📋 Políticas de Cambio:</strong>
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                    <li>Los cambios en duración afectan solo a nuevas sesiones</li>
                    <li>Las políticas de cancelación se aplican inmediatamente</li>
                    <li>Los recordatorios se envían automáticamente</li>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>⚠️ Validaciones Activas:</strong>
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                    <li>Capacidad máxima limitada a 30 estudiantes</li>
                    <li>Duraciones entre 15 y 300 minutos</li>
                    <li>El sistema valida automáticamente los rangos</li>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConfiguracionSesiones;