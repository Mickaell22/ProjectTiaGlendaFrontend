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
  InputAdornment
} from '@mui/material';
import {
  Save,
  Security,
  Lock,
  Timer,
  Visibility,
  History,
  Warning,
  Block
} from '@mui/icons-material';

const ConfiguracionSeguridad = ({ configuracion = {}, onSave }) => {
  const [formData, setFormData] = useState({
    longitud_minima_password: 8,
    requerir_mayusculas: true,
    requerir_minusculas: true,
    requerir_numeros: true,
    requerir_simbolos: false,
    tiempo_sesion_minutos: 480,
    intentos_login_maximo: 5,
    tiempo_bloqueo_minutos: 15,
    habilitar_logs_auditoria: true,
    tiempo_retencion_logs_dias: 30,
    forzar_cambio_password_dias: 90,
    ...configuracion
  });

  const tiemposSesion = [
    { value: 60, label: '1 hora' },
    { value: 120, label: '2 horas' },
    { value: 240, label: '4 horas' },
    { value: 480, label: '8 horas' },
    { value: 720, label: '12 horas' },
    { value: 1440, label: '24 horas' },
    { value: 0, label: 'Sin límite' }
  ];

  const tiemposBloqueo = [
    { value: 5, label: '5 minutos' },
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 120, label: '2 horas' },
    { value: 1440, label: '24 horas' }
  ];

  const tiemposRetencion = [
    { value: 7, label: '7 días' },
    { value: 15, label: '15 días' },
    { value: 30, label: '30 días' },
    { value: 60, label: '60 días' },
    { value: 90, label: '90 días' },
    { value: 180, label: '180 días' },
    { value: 365, label: '1 año' }
  ];

  const tiemposCambioPassword = [
    { value: 30, label: '30 días' },
    { value: 60, label: '60 días' },
    { value: 90, label: '90 días' },
    { value: 180, label: '180 días' },
    { value: 365, label: '1 año' },
    { value: 0, label: 'Nunca forzar' }
  ];

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...configuracion }));
  }, [configuracion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const processedValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (formData.longitud_minima_password < 6 || formData.longitud_minima_password > 50) {
      alert('La longitud mínima de contraseña debe estar entre 6 y 50 caracteres');
      return;
    }
    
    if (formData.intentos_login_maximo < 1 || formData.intentos_login_maximo > 20) {
      alert('Los intentos máximos de login deben estar entre 1 y 20');
      return;
    }
    
    if (formData.tiempo_sesion_minutos > 0 && formData.tiempo_sesion_minutos < 30) {
      alert('El tiempo de sesión debe ser de al menos 30 minutos o 0 para sin límite');
      return;
    }
    
    onSave(formData);
  };

  const getPasswordStrength = () => {
    let strength = 0;
    let requirements = [];
    
    if (formData.longitud_minima_password >= 8) {
      strength += 20;
      requirements.push('8+ caracteres');
    }
    
    if (formData.requerir_minusculas) {
      strength += 15;
      requirements.push('minúsculas');
    }
    
    if (formData.requerir_mayusculas) {
      strength += 15;
      requirements.push('mayúsculas');
    }
    
    if (formData.requerir_numeros) {
      strength += 25;
      requirements.push('números');
    }
    
    if (formData.requerir_simbolos) {
      strength += 25;
      requirements.push('símbolos');
    }
    
    return { strength, requirements };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header mejorado */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', 
        color: 'white',
        boxShadow: '0 8px 32px rgba(211, 47, 47, 0.3)'
      }}>
        <CardContent sx={{ py: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="center" textAlign="center">
            <Security sx={{ mr: 3, fontSize: 48 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Configuración de Seguridad
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                Administra políticas de contraseñas, sesiones y auditoría del sistema
              </Typography>
              <Chip 
                label="Solo Administradores" 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  fontWeight: 'bold',
                  mt: 1
                }}
                icon={<Warning sx={{ color: 'white !important' }} />}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>

      {/* Políticas de Contraseñas */}
      <Grid size={{ xs: 12, lg: 8 }}>
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
                background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                mr: 2
              }}>
                <Lock sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Políticas de Contraseñas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Requisitos y validaciones de contraseñas
                </Typography>
              </Box>
            </Box>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Longitud Mínima"
                    name="longitud_minima_password"
                    value={formData.longitud_minima_password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">chars</InputAdornment>,
                    }}
                    helperText="Mínimo de caracteres"
                    inputProps={{ min: 6, max: 50 }}
                    variant="outlined"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Forzar Cambio"
                    name="forzar_cambio_password_dias"
                    value={formData.forzar_cambio_password_dias}
                    onChange={handleChange}
                    helperText="Frecuencia de cambio"
                    variant="outlined"
                  >
                    {tiemposCambioPassword.map((tiempo) => (
                      <MenuItem key={tiempo.value} value={tiempo.value}>
                        {tiempo.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.requerir_minusculas}
                          onChange={handleChange}
                          name="requerir_minusculas"
                          size="small"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Letras minúsculas (a-z)
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.requerir_mayusculas}
                          onChange={handleChange}
                          name="requerir_mayusculas"
                          size="small"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Letras mayúsculas (A-Z)
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.requerir_numeros}
                          onChange={handleChange}
                          name="requerir_numeros"
                          size="small"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Números (0-9)
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.requerir_simbolos}
                          onChange={handleChange}
                          name="requerir_simbolos"
                          size="small"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            Símbolos (!@#$%^&*)
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Medidor de Fortaleza */}
      <Grid size={{ xs: 12, lg: 4 }}>
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
                background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                mr: 2
              }}>
                <Visibility sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Fortaleza de Política
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Medidor de seguridad
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box 
                sx={{ 
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: passwordStrength.strength >= 80 
                    ? 'linear-gradient(45deg, #4caf50, #81c784)' 
                    : passwordStrength.strength >= 60 
                      ? 'linear-gradient(45deg, #ff9800, #ffb74d)' 
                      : 'linear-gradient(45deg, #f44336, #ef5350)',
                  color: 'white'
                }}
              >
                <Typography variant="h4" fontWeight="bold">
                  {passwordStrength.strength}%
                </Typography>
              </Box>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                {passwordStrength.strength >= 80 ? 'Fuerte' : 
                 passwordStrength.strength >= 60 ? 'Media' : 'Débil'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Requiere: {passwordStrength.requirements.join(', ')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Control de Sesiones */}
      <Grid size={{ xs: 12, md: 6 }}>
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
                <Timer sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Control de Sesiones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tiempo de inactividad y sesiones
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label="Tiempo de Sesión"
                  name="tiempo_sesion_minutos"
                  value={formData.tiempo_sesion_minutos}
                  onChange={handleChange}
                  helperText="Tiempo máximo de inactividad"
                  variant="outlined"
                >
                  {tiemposSesion.map((tiempo) => (
                    <MenuItem key={tiempo.value} value={tiempo.value}>
                      {tiempo.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Protección de Acceso */}
      <Grid size={{ xs: 12, md: 6 }}>
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
                <Block sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Protección de Acceso
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Control de intentos fallidos
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Intentos Máximos de Login"
                  name="intentos_login_maximo"
                  value={formData.intentos_login_maximo}
                  onChange={handleChange}
                  helperText="Intentos antes de bloqueo"
                  inputProps={{ min: 1, max: 20 }}
                  variant="outlined"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label="Tiempo de Bloqueo"
                  name="tiempo_bloqueo_minutos"
                  value={formData.tiempo_bloqueo_minutos}
                  onChange={handleChange}
                  helperText="Duración del bloqueo"
                  variant="outlined"
                >
                  {tiemposBloqueo.map((tiempo) => (
                    <MenuItem key={tiempo.value} value={tiempo.value}>
                      {tiempo.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Auditoría y Logs */}
      <Grid size={{ xs: 12, md: 6 }}>
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
                <History sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Auditoría y Logs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registro de eventos de seguridad
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.habilitar_logs_auditoria}
                        onChange={handleChange}
                        name="habilitar_logs_auditoria"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Logs de Auditoría
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Registrar eventos de seguridad
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label="Retención de Logs"
                  name="tiempo_retencion_logs_dias"
                  value={formData.tiempo_retencion_logs_dias}
                  onChange={handleChange}
                  helperText="Tiempo de conservación"
                  disabled={!formData.habilitar_logs_auditoria}
                  variant="outlined"
                >
                  {tiemposRetencion.map((tiempo) => (
                    <MenuItem key={tiempo.value} value={tiempo.value}>
                      {tiempo.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Panel de Estado de Seguridad */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)', border: '1px solid #ffb74d' }}>
          <CardContent>
            <Typography variant="h6" color="primary" display="flex" alignItems="center" gutterBottom>
              <Warning sx={{ mr: 1 }} />
              Estado de Seguridad
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Configuración Actual:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Contraseña: {formData.longitud_minima_password} caracteres mínimo
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Sesión: {tiemposSesion.find(t => t.value === formData.tiempo_sesion_minutos)?.label}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Intentos login: {formData.intentos_login_maximo} máximo
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Bloqueo: {tiemposBloqueo.find(t => t.value === formData.tiempo_bloqueo_minutos)?.label}
              </Typography>
              <Typography variant="body2">
                • Auditoría: {formData.habilitar_logs_auditoria ? 'Habilitada' : 'Deshabilitada'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Advertencias */}
      <Grid size={{ xs: 12 }}>
        <Alert severity="warning" sx={{ mb: 0 }}>
          <Typography variant="body2" gutterBottom>
            <strong>⚠️ Advertencia:</strong> Los cambios afectan inmediatamente a todos los usuarios. Las sesiones activas podrían cerrarse automáticamente.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>Use al menos 8 caracteres con mayúsculas, minúsculas y números</li>
                <li>Limite los intentos de login a 5 o menos</li>
                <li>Configure sesiones de máximo 8 horas</li>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                <li>Mantenga habilitados los logs de auditoría</li>
                <li>Revise regularmente los logs de acceso</li>
                <li>Mantenga políticas de contraseña robustas</li>
              </Typography>
            </Grid>
          </Grid>
        </Alert>
      </Grid>

      {/* Botón centrado y espacioso */}
      <Grid size={{ xs: 12 }}>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            startIcon={<Save />}
            size="large"
            sx={{ 
              background: 'linear-gradient(45deg, #d32f2f, #f44336)',
              color: 'white',
              fontWeight: 'bold',
              px: 6,
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(211, 47, 47, 0.3)',
              '&:hover': { 
                background: 'linear-gradient(45deg, #b71c1c, #d32f2f)',
                boxShadow: '0 6px 25px rgba(211, 47, 47, 0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Guardar Configuración de Seguridad
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            ⚠️ Los cambios se aplicarán inmediatamente para todos los usuarios
          </Typography>
        </Box>
      </Grid>
      </Grid>
    </Box>
  );
};

export default ConfiguracionSeguridad;