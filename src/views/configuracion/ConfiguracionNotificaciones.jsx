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
  Schedule,
  NotificationsActive,
  DoNotDisturb,
  CheckCircle,
  Info,
  AccessTime,
  Chat,
  Timer
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
    notificar_sesiones_terapia: true,
    minutos_previos_sesion_terapia: 15,
    notificar_clases_pedagogicas: true,
    minutos_previos_clase_pedagogica: 15,
    notificar_cancelaciones: true,
    notificar_reprogramaciones: true,
    notificar_mensajes_chat: true,
    notificar_solo_mensajes_urgentes: false,
    horario_silencio_inicio: '',
    horario_silencio_fin: '',
    intervalo_verificacion_minutos: 1,
    ...configuracion
  });

  const tiemposPrevios = [
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
    onSave(formData);
  };

  const testNotificacion = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Configuracion de Prueba', {
            body: 'Las notificaciones estan funcionando correctamente.',
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
              Configuracion de Notificaciones
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Administra alertas, recordatorios y preferencias del sistema
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

              {/* Configuracion General */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mr: 2 }}>
                      <Notifications sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        Configuracion General
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

                    <Grid item xs={12} md={6}>
                      <TextField
                        select
                        fullWidth
                        label="Verificar notificaciones cada"
                        name="intervalo_verificacion_minutos"
                        value={formData.intervalo_verificacion_minutos}
                        onChange={handleChange}
                        helperText="Con que frecuencia se consultan notificaciones nuevas (1-60 minutos)"
                        disabled={!formData.notificaciones_habilitadas}
                        variant="outlined"
                        sx={purpleOutlineSX}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Timer color="primary" />
                            </InputAdornment>
                          )
                        }}
                      >
                        {[1, 2, 5, 10, 15, 30, 60].map(v => (
                          <MenuItem key={v} value={v}>{v} {v === 1 ? 'minuto' : 'minutos'}</MenuItem>
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
                    height: '100%',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48, mr: 2 }}>
                      <NotificationsActive sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="warning.main">
                        Tipos de Notificaciones
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Selecciona que alertas recibir
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    {[
                      { name: 'notificar_sesiones_terapia', label: 'Sesiones Terapeuticas', desc: 'Recordatorios de citas individuales' },
                      { name: 'notificar_clases_pedagogicas', label: 'Clases Pedagogicas', desc: 'Recordatorios de clases grupales' },
                      { name: 'notificar_cancelaciones', label: 'Cancelaciones', desc: 'Alertas de sesiones canceladas' },
                      { name: 'notificar_reprogramaciones', label: 'Reprogramaciones', desc: 'Alertas de cambios de horario' },
                      { name: 'notificar_mensajes_chat', label: 'Mensajes de Chat', desc: 'Notificaciones de mensajes nuevos' }
                    ].map(item => (
                      <Grid item xs={12} key={item.name}>
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
                                checked={formData[item.name]}
                                onChange={handleChange}
                                name={item.name}
                                disabled={!formData.notificaciones_habilitadas}
                                size="small"
                                color="warning"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight="medium">{item.label}</Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary' }}>
                                  {item.desc}
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>
                      </Grid>
                    ))}

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
                              checked={formData.notificar_solo_mensajes_urgentes}
                              onChange={handleChange}
                              name="notificar_solo_mensajes_urgentes"
                              disabled={!formData.notificaciones_habilitadas || !formData.notificar_mensajes_chat}
                              size="small"
                              color="error"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight="medium">Solo mensajes urgentes</Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary' }}>
                                Filtrar solo los mensajes marcados como urgentes
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Tiempo Previo y Modo Silencioso */}
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  {/* Tiempo de anticipacion por tipo */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={3}>
                      <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48, mr: 2 }}>
                        <AccessTime sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="info.main">
                          Anticipacion de Recordatorios
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Con cuanta anticipacion recibir alertas
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Sesiones Terapeuticas"
                          name="minutos_previos_sesion_terapia"
                          value={formData.minutos_previos_sesion_terapia}
                          onChange={handleChange}
                          disabled={!formData.notificaciones_habilitadas || !formData.notificar_sesiones_terapia}
                          variant="outlined"
                          sx={purpleOutlineSX}
                        >
                          {tiemposPrevios.map(t => (
                            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Clases Pedagogicas"
                          name="minutos_previos_clase_pedagogica"
                          value={formData.minutos_previos_clase_pedagogica}
                          onChange={handleChange}
                          disabled={!formData.notificaciones_habilitadas || !formData.notificar_clases_pedagogicas}
                          variant="outlined"
                          sx={purpleOutlineSX}
                        >
                          {tiemposPrevios.map(t => (
                            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Modo Silencioso */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={3}>
                      <Avatar sx={{ bgcolor: 'error.main', width: 48, height: 48, mr: 2 }}>
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
                          name="horario_silencio_inicio"
                          value={formData.horario_silencio_inicio}
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
                          name="horario_silencio_fin"
                          value={formData.horario_silencio_fin}
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
                                Periodo Silencioso Actual
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary' }}>
                                {formData.horario_silencio_inicio && formData.horario_silencio_fin
                                  ? `${formData.horario_silencio_inicio} - ${formData.horario_silencio_fin}`
                                  : 'No configurado'}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Paper>
                </Stack>
              </Grid>

              {/* Informacion importante */}
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
                    Informacion importante
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                        <li>Las notificaciones push requieren permiso del navegador</li>
                        <li>El modo silencioso suspende las notificaciones en ese horario</li>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                        <li>Los recordatorios se envian segun el tiempo de anticipacion configurado</li>
                        <li>Los cambios se aplicaran inmediatamente</li>
                      </Typography>
                    </Grid>
                  </Grid>
                </Alert>
              </Grid>

              {/* Boton de guardar */}
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
                    Guardar Configuracion de Notificaciones
                  </Button>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1} sx={{ mt: 2 }}>
                    <CheckCircle sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Las notificaciones se activaran segun tus preferencias
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
