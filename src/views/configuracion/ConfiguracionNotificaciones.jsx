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
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3} display="flex" alignItems="center">
          <Notifications sx={{ mr: 1 }} />
          Configuración de Notificaciones
          <Button 
            size="small" 
            variant="outlined"
            onClick={testNotificacion}
            sx={{ ml: 2 }}
          >
            Probar Notificación
          </Button>
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            
            {/* Configuración General */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuración General
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificaciones_habilitadas}
                    onChange={handleChange}
                    name="notificaciones_habilitadas"
                  />
                }
                label="Habilitar notificaciones del sistema"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tiempo de Anticipación"
                name="tiempo_anticipacion_minutos"
                value={formData.tiempo_anticipacion_minutos}
                onChange={handleChange}
                helperText="Con qué anticipación recibir las notificaciones"
                disabled={!formData.notificaciones_habilitadas}
              >
                {tiemposAnticipacion.map((tiempo) => (
                  <MenuItem key={tiempo.value} value={tiempo.value}>
                    {tiempo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Tipos de Notificaciones */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                <NotificationsActive sx={{ mr: 1, verticalAlign: 'middle' }} />
                Tipos de Notificaciones
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificaciones_sesion_terapia}
                    onChange={handleChange}
                    name="notificaciones_sesion_terapia"
                    disabled={!formData.notificaciones_habilitadas}
                  />
                }
                label="Notificaciones de sesiones terapéuticas"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificaciones_clase_pedagogica}
                    onChange={handleChange}
                    name="notificaciones_clase_pedagogica"
                    disabled={!formData.notificaciones_habilitadas}
                  />
                }
                label="Notificaciones de clases pedagógicas"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificaciones_cancelaciones}
                    onChange={handleChange}
                    name="notificaciones_cancelaciones"
                    disabled={!formData.notificaciones_habilitadas}
                  />
                }
                label="Notificaciones de cancelaciones"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificaciones_reprogramaciones}
                    onChange={handleChange}
                    name="notificaciones_reprogramaciones"
                    disabled={!formData.notificaciones_habilitadas}
                  />
                }
                label="Notificaciones de reprogramaciones"
              />
            </Grid>

            {/* Configuración de Audio */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                <VolumeUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuración de Audio
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sonido_habilitado}
                    onChange={handleChange}
                    name="sonido_habilitado"
                    disabled={!formData.notificaciones_habilitadas}
                  />
                }
                label="Habilitar sonidos de notificación"
              />
            </Grid>

            {/* Modo Silencioso */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                <DoNotDisturb sx={{ mr: 1, verticalAlign: 'middle' }} />
                Modo Silencioso
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="time"
                label="Inicio del Modo Silencioso"
                name="modo_silencioso_inicio"
                value={formData.modo_silencioso_inicio}
                onChange={handleChange}
                helperText="Hora de inicio para no recibir notificaciones"
                disabled={!formData.notificaciones_habilitadas}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="time"
                label="Fin del Modo Silencioso"
                name="modo_silencioso_fin"
                value={formData.modo_silencioso_fin}
                onChange={handleChange}
                helperText="Hora de fin del modo silencioso"
                disabled={!formData.notificaciones_habilitadas}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Información adicional */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'info.light', 
                  borderRadius: 1, 
                  mt: 2 
                }}
              >
                <Typography variant="body2" color="info.contrastText" gutterBottom>
                  <strong>ℹ️ Información importante:</strong>
                </Typography>
                <Typography variant="body2" color="info.contrastText" component="ul" sx={{ mt: 1, pl: 2 }}>
                  <li>Las notificaciones push requieren permiso del navegador</li>
                  <li>El modo silencioso aplica solo a notificaciones de sonido</li>
                  <li>Los recordatorios se enviarán con la anticipación configurada</li>
                  <li>Los cambios se aplicarán inmediatamente</li>
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Nota:</strong> Para recibir notificaciones push del navegador, 
                debe permitir las notificaciones cuando el navegador se lo solicite.
              </Alert>
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
                  Guardar Configuración de Notificaciones
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConfiguracionNotificaciones;