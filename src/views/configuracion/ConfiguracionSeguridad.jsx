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
  Chip
} from '@mui/material';
import {
  Save,
  Security,
  Lock,
  Timer,
  Visibility,
  History,
  Warning
} from '@mui/icons-material';

const ConfiguracionSeguridad = ({ configuracion = {}, onSave }) => {
  const [formData, setFormData] = useState({
    tiempoInactividad: 30, // minutos
    complejidadPassword: {
      minimoCaracteres: 8,
      requiereMinusculas: true,
      requiereMayusculas: true,
      requiereNumeros: true,
      requiereSimbolos: false
    },
    intentosMaximos: 5,
    tiempoBloqueo: 15, // minutos
    sesionesMultiples: false,
    recordarSesion: 7, // días
    logsAuditoria: true,
    cerrarSesionInactiva: true,
    verificacionDosPasos: false,
    ...configuracion
  });

  const tiemposInactividad = [
    { value: 5, label: '5 minutos' },
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 120, label: '2 horas' },
    { value: 240, label: '4 horas' },
    { value: 0, label: 'Nunca cerrar automáticamente' }
  ];

  const tiemposBloqueo = [
    { value: 5, label: '5 minutos' },
    { value: 15, label: '15 minutos' },
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 1440, label: '24 horas' }
  ];

  const tiemposRecordar = [
    { value: 1, label: '1 día' },
    { value: 7, label: '7 días' },
    { value: 15, label: '15 días' },
    { value: 30, label: '30 días' },
    { value: 90, label: '90 días' }
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

  const handlePasswordComplexityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      complejidadPassword: {
        ...prev.complejidadPassword,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    
    // Aplicar inmediatamente el cierre automático por inactividad
    if (formData.cerrarSesionInactiva && formData.tiempoInactividad > 0) {
      aplicarCierreAutomatico(formData.tiempoInactividad);
    }
  };

  const aplicarCierreAutomatico = (minutos) => {
    // Guardar configuración para el hook de inactividad
    localStorage.setItem('inactivity_timeout', minutos.toString());
    
    // Disparar evento personalizado para que el AuthContext se entere
    window.dispatchEvent(new CustomEvent('inactivity-config-changed', {
      detail: { timeout: minutos }
    }));
  };

  const getNivelSeguridad = () => {
    let puntos = 0;
    const { complejidadPassword } = formData;
    
    if (complejidadPassword.minimoCaracteres >= 8) puntos += 1;
    if (complejidadPassword.requiereMayusculas) puntos += 1;
    if (complejidadPassword.requiereNumeros) puntos += 1;
    if (complejidadPassword.requiereSimbolos) puntos += 1;
    if (formData.tiempoInactividad > 0 && formData.tiempoInactividad <= 60) puntos += 1;
    if (formData.intentosMaximos <= 5) puntos += 1;
    if (formData.logsAuditoria) puntos += 1;
    if (formData.verificacionDosPasos) puntos += 2;

    if (puntos <= 3) return { nivel: 'Bajo', color: 'error' };
    if (puntos <= 6) return { nivel: 'Medio', color: 'warning' };
    return { nivel: 'Alto', color: 'success' };
  };

  const nivelSeguridad = getNivelSeguridad();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3} display="flex" alignItems="center">
          <Security sx={{ mr: 1 }} />
          Configuraciones de Seguridad
          <Chip 
            label={`Nivel: ${nivelSeguridad.nivel}`}
            color={nivelSeguridad.color}
            size="small"
            sx={{ ml: 2 }}
          />
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Configuración de Sesión */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Timer sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuración de Sesión
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.cerrarSesionInactiva}
                    onChange={handleChange}
                    name="cerrarSesionInactiva"
                  />
                }
                label="Cerrar sesión automáticamente por inactividad"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tiempo de Inactividad"
                name="tiempoInactividad"
                value={formData.tiempoInactividad}
                onChange={handleChange}
                disabled={!formData.cerrarSesionInactiva}
                helperText="Tiempo sin actividad antes de cerrar sesión automáticamente"
              >
                {tiemposInactividad.map((tiempo) => (
                  <MenuItem key={tiempo.value} value={tiempo.value}>
                    {tiempo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Recordar Sesión"
                name="recordarSesion"
                value={formData.recordarSesion}
                onChange={handleChange}
                helperText="Duración de 'Recordarme' al iniciar sesión"
              >
                {tiemposRecordar.map((tiempo) => (
                  <MenuItem key={tiempo.value} value={tiempo.value}>
                    {tiempo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sesionesMultiples}
                    onChange={handleChange}
                    name="sesionesMultiples"
                  />
                }
                label="Permitir múltiples sesiones por usuario"
              />
            </Grid>

            {/* Configuración de Contraseñas */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
                Política de Contraseñas
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Mínimo de Caracteres"
                value={formData.complejidadPassword.minimoCaracteres}
                onChange={(e) => handlePasswordComplexityChange('minimoCaracteres', parseInt(e.target.value))}
                inputProps={{ min: 4, max: 20 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Intentos Máximos de Login"
                name="intentosMaximos"
                value={formData.intentosMaximos}
                onChange={handleChange}
                helperText="Intentos antes de bloquear la cuenta"
              >
                {[3, 5, 7, 10].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num} intentos
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.complejidadPassword.requiereMayusculas}
                    onChange={(e) => handlePasswordComplexityChange('requiereMayusculas', e.target.checked)}
                  />
                }
                label="Requiere letras mayúsculas (A-Z)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.complejidadPassword.requiereMinusculas}
                    onChange={(e) => handlePasswordComplexityChange('requiereMinusculas', e.target.checked)}
                  />
                }
                label="Requiere letras minúsculas (a-z)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.complejidadPassword.requiereNumeros}
                    onChange={(e) => handlePasswordComplexityChange('requiereNumeros', e.target.checked)}
                  />
                }
                label="Requiere números (0-9)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.complejidadPassword.requiereSimbolos}
                    onChange={(e) => handlePasswordComplexityChange('requiereSimbolos', e.target.checked)}
                  />
                }
                label="Requiere símbolos (!@#$%)"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tiempo de Bloqueo"
                name="tiempoBloqueo"
                value={formData.tiempoBloqueo}
                onChange={handleChange}
                helperText="Duración del bloqueo por intentos fallidos"
              >
                {tiemposBloqueo.map((tiempo) => (
                  <MenuItem key={tiempo.value} value={tiempo.value}>
                    {tiempo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Configuración de Auditoría */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                Auditoría y Monitoreo
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.logsAuditoria}
                    onChange={handleChange}
                    name="logsAuditoria"
                  />
                }
                label="Habilitar logs de auditoría"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.verificacionDosPasos}
                    onChange={handleChange}
                    name="verificacionDosPasos"
                  />
                }
                label="Verificación en dos pasos (2FA)"
              />
            </Grid>

            {/* Alerta de Seguridad */}
            <Grid item xs={12}>
              <Alert 
                severity={nivelSeguridad.color} 
                icon={<Security />}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>Nivel de Seguridad: {nivelSeguridad.nivel}</strong>
                  <br />
                  {nivelSeguridad.nivel === 'Bajo' && 'Se recomienda aumentar los requisitos de seguridad.'}
                  {nivelSeguridad.nivel === 'Medio' && 'Configuración de seguridad aceptable.'}
                  {nivelSeguridad.nivel === 'Alto' && '¡Excelente configuración de seguridad!'}
                </Typography>
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
                  Guardar Configuraciones de Seguridad
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