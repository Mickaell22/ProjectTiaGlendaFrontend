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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Save,
  Notifications,
  Email,
  VolumeUp,
  Schedule,
  NotificationsActive,
  Phone,
  Sms
} from '@mui/icons-material';

const ConfiguracionNotificaciones = ({ configuracion = {}, onSave }) => {
  const [formData, setFormData] = useState({
    notificacionesSistema: true,
    alertasCitas: true,
    recordatoriosCitas: true,
    notificacionesEmail: true,
    notificacionesSMS: false,
    sonidosAlerta: true,
    notificacionesPush: true,
    frecuenciaRecordatorios: 60, // minutos
    horaInicioNotificaciones: '08:00',
    horaFinNotificaciones: '18:00',
    notificarFinSemanaMañana: false,
    notificarFestivos: false,
    tipoSonido: 'suave',
    volumenSonido: 50,
    // Configuraciones específicas por tipo
    configuraciones: {
      citasProximas: { activo: true, anticipacion: 24 }, // horas
      citasCanceladas: { activo: true, anticipacion: 2 },
      sesionesCompletadas: { activo: true, anticipacion: 0 },
      documentosPendientes: { activo: true, anticipacion: 48 },
      pagosVencidos: { activo: true, anticipacion: 24 },
      cumpleanos: { activo: true, anticipacion: 24 },
      reportesSemanales: { activo: false, dia: 'lunes' }
    },
    ...configuracion
  });

  const tiposSonido = [
    { value: 'suave', label: 'Suave' },
    { value: 'moderado', label: 'Moderado' },
    { value: 'fuerte', label: 'Fuerte' },
    { value: 'personalizado', label: 'Personalizado' }
  ];

  const frecuenciasRecordatorio = [
    { value: 15, label: 'Cada 15 minutos' },
    { value: 30, label: 'Cada 30 minutos' },
    { value: 60, label: 'Cada hora' },
    { value: 120, label: 'Cada 2 horas' },
    { value: 240, label: 'Cada 4 horas' },
    { value: 1440, label: 'Una vez al día' }
  ];

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
    setFormData(prev => ({ ...prev, ...configuracion }));
  }, [configuracion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConfiguracionChange = (tipo, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      configuraciones: {
        ...prev.configuraciones,
        [tipo]: {
          ...prev.configuraciones[tipo],
          [campo]: valor
        }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const testNotificacion = () => {
    if (formData.notificacionesPush && 'Notification' in window) {
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

  const configuracionesNotificacion = [
    {
      key: 'citasProximas',
      titulo: 'Citas Próximas',
      descripcion: 'Recordatorio antes de las citas programadas',
      icon: <Schedule />
    },
    {
      key: 'citasCanceladas',
      titulo: 'Citas Canceladas',
      descripcion: 'Notificación cuando se cancela una cita',
      icon: <NotificationsActive />
    },
    {
      key: 'sesionesCompletadas',
      titulo: 'Sesiones Completadas',
      descripcion: 'Confirmación al completar sesiones',
      icon: <Notifications />
    },
    {
      key: 'documentosPendientes',
      titulo: 'Documentos Pendientes',
      descripcion: 'Recordatorio de documentos por completar',
      icon: <Email />
    },
    {
      key: 'pagosVencidos',
      titulo: 'Pagos Vencidos',
      descripcion: 'Alerta de pagos pendientes o vencidos',
      icon: <Phone />
    },
    {
      key: 'cumpleanos',
      titulo: 'Cumpleaños',
      descripcion: 'Recordatorio de cumpleaños de pacientes',
      icon: <NotificationsActive />
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3} display="flex" alignItems="center">
          <Notifications sx={{ mr: 1 }} />
          Configuraciones de Notificaciones
          <Button 
            size="small" 
            onClick={testNotificacion}
            sx={{ ml: 2 }}
          >
            Probar
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
                    checked={formData.notificacionesSistema}
                    onChange={handleChange}
                    name="notificacionesSistema"
                  />
                }
                label="Habilitar notificaciones del sistema"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificacionesPush}
                    onChange={handleChange}
                    name="notificacionesPush"
                  />
                }
                label="Notificaciones push del navegador"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificacionesEmail}
                    onChange={handleChange}
                    name="notificacionesEmail"
                  />
                }
                label="Notificaciones por email"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificacionesSMS}
                    onChange={handleChange}
                    name="notificacionesSMS"
                  />
                }
                label="Notificaciones por SMS"
              />
            </Grid>

            {/* Horarios de Notificación */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Horarios de Notificación
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="time"
                label="Hora de Inicio"
                name="horaInicioNotificaciones"
                value={formData.horaInicioNotificaciones}
                onChange={handleChange}
                helperText="Hora desde la cual enviar notificaciones"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="time"
                label="Hora de Fin"
                name="horaFinNotificaciones"
                value={formData.horaFinNotificaciones}
                onChange={handleChange}
                helperText="Hora hasta la cual enviar notificaciones"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Frecuencia de Recordatorios"
                name="frecuenciaRecordatorios"
                value={formData.frecuenciaRecordatorios}
                onChange={handleChange}
              >
                {frecuenciasRecordatorio.map((freq) => (
                  <MenuItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notificarFinSemanaMañana}
                    onChange={handleChange}
                    name="notificarFinSemanaMañana"
                  />
                }
                label="Notificar en fines de semana y feriados"
              />
            </Grid>

            {/* Configuración de Audio */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <VolumeUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuración de Audio
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sonidosAlerta}
                    onChange={handleChange}
                    name="sonidosAlerta"
                  />
                }
                label="Habilitar sonidos de alerta"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tipo de Sonido"
                name="tipoSonido"
                value={formData.tipoSonido}
                onChange={handleChange}
                disabled={!formData.sonidosAlerta}
              >
                {tiposSonido.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Volumen: {formData.volumenSonido}%</Typography>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.volumenSonido}
                onChange={(e) => setFormData(prev => ({ ...prev, volumenSonido: parseInt(e.target.value) }))}
                disabled={!formData.sonidosAlerta}
                style={{ width: '100%' }}
              />
            </Grid>

            {/* Configuraciones Específicas */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <NotificationsActive sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuraciones Específicas
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <List>
                {configuracionesNotificacion.map((config) => (
                  <ListItem key={config.key} divider>
                    <Box sx={{ mr: 2 }}>
                      {config.icon}
                    </Box>
                    <ListItemText
                      primary={config.titulo}
                      secondary={config.descripcion}
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.configuraciones[config.key]?.activo || false}
                              onChange={(e) => handleConfiguracionChange(config.key, 'activo', e.target.checked)}
                              size="small"
                            />
                          }
                          label=""
                        />
                        {formData.configuraciones[config.key]?.activo && (
                          <TextField
                            size="small"
                            type="number"
                            label="Horas antes"
                            value={formData.configuraciones[config.key]?.anticipacion || 0}
                            onChange={(e) => handleConfiguracionChange(config.key, 'anticipacion', parseInt(e.target.value))}
                            inputProps={{ min: 0, max: 168 }}
                            sx={{ width: 120 }}
                          />
                        )}
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Información adicional */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Las notificaciones push requieren permiso del navegador. 
                Las notificaciones por email y SMS requieren configuración adicional del servidor.
              </Alert>
            </Grid>

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
                  Guardar Configuraciones de Notificaciones
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