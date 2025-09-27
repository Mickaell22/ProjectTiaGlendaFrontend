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
  Switch,
  FormControlLabel,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Save,
  Notifications,
  VolumeUp,
  Schedule,
  NotificationsActive,
  DoNotDisturb
} from '@mui/icons-material';

const ConfiguracionNotificaciones = ({ configuracion = {}, onSave }) => {
  const [formData, setFormData] = useState({
    notificaciones_habilitadas: true,
    notificaciones_sesion_terapia: true,
    notificaciones_clase_pedagogica: true,
    notificaciones_cancelaciones: true,
    notificaciones_reprogramaciones: true,
    tiempo_anticipacion_minutos: 15,
    sonido_habilitado: true,
    modo_silencioso_inicio: '',
    modo_silencioso_fin: '',
    ...configuracion
  });

  const tiemposAnticipacion = [
    { value: 5, label: '5 minutos antes' },
    { value: 10, label: '10 minutos antes' },
    { value: 15, label: '15 minutos antes' },
    { value: 30, label: '30 minutos antes' },
    { value: 60, label: '60 minutos antes' }
  ];

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...configuracion }));
  }, [configuracion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación del modo silencioso
    if (formData.modo_silencioso_inicio && formData.modo_silencioso_fin) {
      if (formData.modo_silencioso_inicio >= formData.modo_silencioso_fin) {
        alert('La hora de inicio del modo silencioso debe ser anterior a la hora de fin');
        return;
      }
    }
    
    onSave(formData);
  };

  const testNotificacion = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('¡Configuración de Prueba!', {
            body: 'Las notificaciones están funcionando correctamente.',
            icon: '/favicon.ico'
          });
        }
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header mejorado */}
      <Card sx={{ 
        mb: 4, 
        backgroundColor: 'primary.main', 
        color: 'white',
        boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)'
      }}>
        <CardContent sx={{ py: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="center" textAlign="center">
            <Notifications sx={{ mr: 3, fontSize: 48 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Configuración de Notificaciones
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                Administra alertas, recordatorios y preferencias de sonido
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button 
              variant="outlined"
              onClick={testNotificacion}
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                px: 3,
                py: 1
              }}
              startIcon={<NotificationsActive />}
            >
              Probar Notificación
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>

      {/* Configuración General */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: 'fit-content',
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
                <Notifications sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Configuración General
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Preferencias principales de notificaciones
                </Typography>
              </Box>
            </Box>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 3, 
                    border: '2px solid', 
                    borderColor: formData.notificaciones_habilitadas ? 'success.main' : 'grey.300',
                    borderRadius: 2,
                    backgroundColor: formData.notificaciones_habilitadas ? 'success.50' : 'grey.50'
                  }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.notificaciones_habilitadas}
                          onChange={handleChange}
                          name="notificaciones_habilitadas"
                          size="large"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Habilitar Notificaciones
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Activar/desactivar todas las notificaciones del sistema
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Tiempo de Anticipación"
                    name="tiempo_anticipacion_minutos"
                    value={formData.tiempo_anticipacion_minutos}
                    onChange={handleChange}
                    helperText="Con qué anticipación recibir las notificaciones"
                    disabled={!formData.notificaciones_habilitadas}
                    variant="outlined"
                  >
                    {tiemposAnticipacion.map((tiempo) => (
                      <MenuItem key={tiempo.value} value={tiempo.value}>
                        {tiempo.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Tipos de Notificaciones */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: 'fit-content',
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
                background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                mr: 2
              }}>
                <NotificationsActive sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Tipos de Notificaciones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Selecciona qué alertas recibir
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notificaciones_sesion_terapia}
                        onChange={handleChange}
                        name="notificaciones_sesion_terapia"
                        disabled={!formData.notificaciones_habilitadas}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Sesiones Terapéuticas
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recordatorios de citas individuales
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notificaciones_clase_pedagogica}
                        onChange={handleChange}
                        name="notificaciones_clase_pedagogica"
                        disabled={!formData.notificaciones_habilitadas}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Clases Pedagógicas
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recordatorios de clases grupales
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notificaciones_cancelaciones}
                        onChange={handleChange}
                        name="notificaciones_cancelaciones"
                        disabled={!formData.notificaciones_habilitadas}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Cancelaciones
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Alertas de sesiones canceladas
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notificaciones_reprogramaciones}
                        onChange={handleChange}
                        name="notificaciones_reprogramaciones"
                        disabled={!formData.notificaciones_habilitadas}
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Reprogramaciones
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Alertas de cambios de horario
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Audio y Modo Silencioso */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: 'fit-content',
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
                <VolumeUp sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Audio y Sonidos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configuración de sonidos
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.sonido_habilitado}
                        onChange={handleChange}
                        name="sonido_habilitado"
                        disabled={!formData.notificaciones_habilitadas}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Sonidos de Notificación
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Reproducir sonidos cuando lleguen notificaciones
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Modo Silencioso */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          height: 'fit-content',
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
                background: 'linear-gradient(45deg, #f44336, #ef5350)',
                mr: 2
              }}>
                <DoNotDisturb sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Modo Silencioso
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Horario de silencio programado
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Inicio"
                  name="modo_silencioso_inicio"
                  value={formData.modo_silencioso_inicio}
                  onChange={handleChange}
                  helperText="Hora de inicio"
                  disabled={!formData.notificaciones_habilitadas}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Fin"
                  name="modo_silencioso_fin"
                  value={formData.modo_silencioso_fin}
                  onChange={handleChange}
                  helperText="Hora de fin"
                  disabled={!formData.notificaciones_habilitadas}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Período Silencioso Actual:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formData.modo_silencioso_inicio && formData.modo_silencioso_fin 
                      ? `${formData.modo_silencioso_inicio} - ${formData.modo_silencioso_fin}` 
                      : 'No configurado'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Información Importante */}
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 0 }}>
          <Typography variant="body2" gutterBottom>
            <strong>📋 Información importante:</strong>
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>Las notificaciones push requieren permiso del navegador</li>
                <li>El modo silencioso solo aplica a sonidos de notificación</li>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>Los recordatorios se envían con la anticipación configurada</li>
                <li>Los cambios se aplicarán inmediatamente</li>
              </Typography>
            </Grid>
          </Grid>
        </Alert>
      </Grid>

      {/* Botón centrado y espacioso */}
      <Grid item xs={12}>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            startIcon={<Save />}
            size="large"
            sx={{ 
              backgroundColor: "primary.main",
              color: 'white',
              fontWeight: 'bold',
              px: 6,
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(156, 39, 176, 0.3)',
              '&:hover': { 
                backgroundColor: 'primary.dark',
                boxShadow: '0 6px 25px rgba(156, 39, 176, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Guardar Configuración de Notificaciones
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Las notificaciones se activarán según tus preferencias
          </Typography>
        </Box>
      </Grid>
      </Grid>
    </Box>
  );
};

export default ConfiguracionNotificaciones;