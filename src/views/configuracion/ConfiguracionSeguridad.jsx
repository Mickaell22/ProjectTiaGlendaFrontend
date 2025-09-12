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
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3} display="flex" alignItems="center">
          <Security sx={{ mr: 1 }} />
          Configuración de Seguridad
          <Chip 
            label="Solo Administradores" 
            color="warning" 
            size="small" 
            sx={{ ml: 2 }} 
          />
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            
            {/* Políticas de Contraseñas */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
                Políticas de Contraseñas
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Longitud Mínima"
                name="longitud_minima_password"
                value={formData.longitud_minima_password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">caracteres</InputAdornment>,
                }}
                helperText="Número mínimo de caracteres para contraseñas"
                inputProps={{ min: 6, max: 50 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  backgroundColor: passwordStrength.strength >= 80 ? 'success.light' : 
                                   passwordStrength.strength >= 60 ? 'warning.light' : 'error.light'
                }}
              >
                <Typography variant="body2" gutterBottom>
                  Fortaleza: {passwordStrength.strength}% 
                  {passwordStrength.strength >= 80 ? ' (Fuerte)' : 
                   passwordStrength.strength >= 60 ? ' (Media)' : ' (Débil)'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Requiere: {passwordStrength.requirements.join(', ')}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requerir_minusculas}
                    onChange={handleChange}
                    name="requerir_minusculas"
                  />
                }
                label="Requerir letras minúsculas (a-z)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requerir_mayusculas}
                    onChange={handleChange}
                    name="requerir_mayusculas"
                  />
                }
                label="Requerir letras mayúsculas (A-Z)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requerir_numeros}
                    onChange={handleChange}
                    name="requerir_numeros"
                  />
                }
                label="Requerir números (0-9)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requerir_simbolos}
                    onChange={handleChange}
                    name="requerir_simbolos"
                  />
                }
                label="Requerir símbolos (!@#$%^&*)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Forzar Cambio de Contraseña"
                name="forzar_cambio_password_dias"
                value={formData.forzar_cambio_password_dias}
                onChange={handleChange}
                helperText="Cada cuánto tiempo forzar cambio de contraseña"
              >
                {tiemposCambioPassword.map((tiempo) => (
                  <MenuItem key={tiempo.value} value={tiempo.value}>
                    {tiempo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Control de Sesiones */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
                <Timer sx={{ mr: 1, verticalAlign: 'middle' }} />
                Control de Sesiones
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tiempo de Sesión"
                name="tiempo_sesion_minutos"
                value={formData.tiempo_sesion_minutos}
                onChange={handleChange}
                helperText="Tiempo máximo de inactividad antes de cerrar sesión"
              >
                {tiemposSesion.map((tiempo) => (
                  <MenuItem key={tiempo.value} value={tiempo.value}>
                    {tiempo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Protección de Acceso */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
                <Block sx={{ mr: 1, verticalAlign: 'middle' }} />
                Protección de Acceso
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Intentos Máximos de Login"
                name="intentos_login_maximo"
                value={formData.intentos_login_maximo}
                onChange={handleChange}
                helperText="Intentos fallidos antes de bloquear la cuenta"
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tiempo de Bloqueo"
                name="tiempo_bloqueo_minutos"
                value={formData.tiempo_bloqueo_minutos}
                onChange={handleChange}
                helperText="Duración del bloqueo tras superar intentos máximos"
              >
                {tiemposBloqueo.map((tiempo) => (
                  <MenuItem key={tiempo.value} value={tiempo.value}>
                    {tiempo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Auditoría y Logs */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3 }}>
                <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                Auditoría y Logs
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.habilitar_logs_auditoria}
                    onChange={handleChange}
                    name="habilitar_logs_auditoria"
                  />
                }
                label="Habilitar logs de auditoría"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tiempo de Retención de Logs"
                name="tiempo_retencion_logs_dias"
                value={formData.tiempo_retencion_logs_dias}
                onChange={handleChange}
                helperText="Cuánto tiempo mantener los logs de auditoría"
                disabled={!formData.habilitar_logs_auditoria}
              >
                {tiemposRetencion.map((tiempo) => (
                  <MenuItem key={tiempo.value} value={tiempo.value}>
                    {tiempo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Información de Seguridad */}
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>⚠️ Advertencia:</strong> Los cambios en la configuración de seguridad 
                afectan inmediatamente a todos los usuarios del sistema. Las sesiones activas 
                podrían cerrarse automáticamente según la nueva configuración.
              </Alert>
            </Grid>

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
                  <strong>🔒 Recomendaciones de Seguridad:</strong>
                </Typography>
                <Typography variant="body2" color="info.contrastText" component="ul" sx={{ mt: 1, pl: 2 }}>
                  <li>Use al menos 8 caracteres con mayúsculas, minúsculas y números</li>
                  <li>Limite los intentos de login a 5 o menos</li>
                  <li>Configure sesiones de máximo 8 horas para mayor seguridad</li>
                  <li>Mantenga habilitados los logs de auditoría</li>
                  <li>Revise regularmente los logs de acceso</li>
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
                  Guardar Configuración de Seguridad
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConfiguracionSeguridad;