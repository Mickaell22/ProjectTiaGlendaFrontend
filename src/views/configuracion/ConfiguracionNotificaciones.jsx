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
  InputAdornment,
  Paper,
  Container,
  useTheme,
  Avatar,
  Chip
} from '@mui/material';
import {
  Save,
  Notifications,
  VolumeUp,
  Schedule,
  NotificationsActive,
  DoNotDisturb,
  CheckCircle,
  Info,
  AccessTime
} from '@mui/icons-material';

// Estilos compartidos para inputs
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const ConfiguracionNotificaciones = ({ configuracion = {}, onSave }) => {
  const theme = useTheme();
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
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          backgroundColor: 'background.paper',
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1000, md: 1200 },
          mx: 'auto'
        }}
      >
        {/* Header con gradiente */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <Notifications sx={{ mr: 1, fontSize: 28 }} />
              Configuración de Notificaciones
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Administra alertas, recordatorios y preferencias de sonido
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={testNotificacion}
            size="small"
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            startIcon={<NotificationsActive />}
          >
            Probar
          </Button>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>

              {/* Configuración General */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 48,
                        height: 48,
                        mr: 2
                      }}
                    >
                      <Notifications sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        Configuración General
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Preferencias principales de notificaciones
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Paper
                        sx={{
                          p: 3,
                          border: '2px solid',
                          borderColor: formData.notificaciones_habilitadas ? 'success.main' : theme.palette.divider,
                          borderRadius: 2,
                          bgcolor: formData.notificaciones_habilitadas
                            ? theme.palette.mode === 'dark'
                              ? 'rgba(76, 175, 80, 0.1)'
                              : 'rgba(76, 175, 80, 0.08)'
                            : theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.02)'
                              : 'rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.notificaciones_habilitadas}
                              onChange={handleChange}
                              name="notificaciones_habilitadas"
                              size="large"
                              color="success"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Habilitar Notificaciones
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary' }}>
                                Activar/desactivar todas las notificaciones del sistema
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
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
                        sx={purpleOutlineSX}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTime color="primary" />
                            </InputAdornment>
                          )
                        }}
                      >
                        {tiemposAnticipacion.map((tiempo) => (
                          <MenuItem key={tiempo.value} value={tiempo.value}>
                            {tiempo.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Tipos de Notificaciones */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: 'warning.main',
                        width: 48,
                        height: 48,
                        mr: 2
                      }}
                    >
                      <NotificationsActive sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="warning.main">
                        Tipos de Notificaciones
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Selecciona qué alertas recibir
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Paper
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          borderRadius: 2,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.notificaciones_sesion_terapia}
                              onChange={handleChange}
                              name="notificaciones_sesion_terapia"
                              disabled={!formData.notificaciones_habilitadas}
                              size="small"
                              color="warning"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                Sesiones Terapéuticas
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary' }}>
                                Recordatorios de citas individuales
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Paper
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          borderRadius: 2,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.notificaciones_clase_pedagogica}
                              onChange={handleChange}
                              name="notificaciones_clase_pedagogica"
                              disabled={!formData.notificaciones_habilitadas}
                              size="small"
                              color="warning"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                Clases Pedagógicas
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary' }}>
                                Recordatorios de clases grupales
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Paper
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          borderRadius: 2,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.notificaciones_cancelaciones}
                              onChange={handleChange}
                              name="notificaciones_cancelaciones"
                              disabled={!formData.notificaciones_habilitadas}
                              size="small"
                              color="warning"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                Cancelaciones
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary' }}>
                                Alertas de sesiones canceladas
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Paper
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          borderRadius: 2,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.notificaciones_reprogramaciones}
                              onChange={handleChange}
                              name="notificaciones_reprogramaciones"
                              disabled={!formData.notificaciones_habilitadas}
                              size="small"
                              color="warning"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                Reprogramaciones
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary' }}>
                                Alertas de cambios de horario
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Audio y Sonidos */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: 'success.main',
                        width: 48,
                        height: 48,
                        mr: 2
                      }}
                    >
                      <VolumeUp sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        Audio y Sonidos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Configuración de sonidos
                      </Typography>
                    </Box>
                  </Box>

                  <Paper
                    sx={{
                      p: 3,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.sonido_habilitado}
                          onChange={handleChange}
                          name="sonido_habilitado"
                          disabled={!formData.notificaciones_habilitadas}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Sonidos de Notificación
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary' }}>
                            Reproducir sonidos cuando lleguen notificaciones
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                </Paper>
              </Grid>

              {/* Modo Silencioso */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: 'error.main',
                        width: 48,
                        height: 48,
                        mr: 2
                      }}
                    >
                      <DoNotDisturb sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="error.main">
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
                        sx={purpleOutlineSX}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTime color="error" />
                            </InputAdornment>
                          )
                        }}
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
                        sx={purpleOutlineSX}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTime color="error" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Paper
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)',
                          border: `1px solid ${theme.palette.error.main}`
                        }}
                      >
                        <Box display="flex" alignItems="flex-start" gap={2}>
                          <Info sx={{ color: 'error.main', mt: 0.5 }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium" color="error.main" gutterBottom>
                              Período Silencioso Actual
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary' }}>
                              {formData.modo_silencioso_inicio && formData.modo_silencioso_fin
                                ? `${formData.modo_silencioso_inicio} - ${formData.modo_silencioso_fin}`
                                : 'No configurado'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Información Importante */}
              <Grid item xs={12}>
                <Alert
                  severity="info"
                  icon={<Info />}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.info.main}`
                  }}
                >
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Información importante
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

              {/* Botón de guardar */}
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 3, mb: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    size="large"
                    sx={{
                      fontWeight: 'bold',
                      px: 6,
                      py: 1.5,
                      borderRadius: 3,
                      boxShadow: 4,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Guardar Configuración de Notificaciones
                  </Button>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1} sx={{ mt: 2 }}>
                    <CheckCircle sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Las notificaciones se activarán según tus preferencias
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ConfiguracionNotificaciones;