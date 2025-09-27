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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton
} from '@mui/material';
import {
  Save,
  DataUsage,
  Backup,
  GetApp,
  Publish,
  Delete,
  Schedule,
  Storage,
  CloudDownload,
  Warning
} from '@mui/icons-material';

const ConfiguracionDatos = ({ configuracion = {}, onSave }) => {
  const [formData, setFormData] = useState({
    backupAutomatico: true,
    frecuenciaBackup: 'diario',
    horaBackup: '02:00',
    retencionDatos: 365, // días
    formatosExportacion: ['pdf', 'excel', 'csv'],
    importacionMasiva: true,
    compresionBackup: true,
    encriptacionBackup: true,
    ubicacionBackup: 'local',
    limiteTamanoBackup: 1000, // MB
    // Configuraciones de limpieza automática
    limpiezaAutomatica: true,
    limpiarLogsAuditoria: 90, // días
    limpiarNotificacionesLeidas: 30, // días
    limpiarSesionesExpiradas: 7, // días
    ...configuracion
  });

  const [espacioUsado, setEspacioUsado] = useState({
    total: 2500, // MB
    usado: 1200, // MB
    disponible: 1300 // MB
  });

  const frecuenciasBackup = [
    { value: 'diario', label: 'Diariamente' },
    { value: 'semanal', label: 'Semanalmente' },
    { value: 'mensual', label: 'Mensualmente' },
    { value: 'manual', label: 'Solo manual' }
  ];

  const formatosDisponibles = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel (XLSX)' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' }
  ];

  const ubicacionesBackup = [
    { value: 'local', label: 'Servidor Local' },
    { value: 'cloud', label: 'Nube (Cloud)' },
    { value: 'externo', label: 'Disco Externo' },
    { value: 'red', label: 'Servidor de Red' }
  ];

  const retencionOpciones = [
    { value: 30, label: '30 días' },
    { value: 90, label: '3 meses' },
    { value: 180, label: '6 meses' },
    { value: 365, label: '1 año' },
    { value: 730, label: '2 años' },
    { value: 1825, label: '5 años' },
    { value: -1, label: 'Permanente' }
  ];

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...configuracion }));
    calcularEspacioUsado();
  }, [configuracion]);

  const calcularEspacioUsado = () => {
    // Simulación del cálculo del espacio usado
    const pacientes = localStorage.getItem('pacientes') || '[]';
    const personal = localStorage.getItem('personal') || '[]';
    const configs = localStorage.getItem('sistema_configuraciones') || '{}';
    
    const totalSize = (pacientes.length + personal.length + configs.length) / 1024; // KB aproximado
    
    setEspacioUsado(prev => ({
      ...prev,
      usado: Math.min(prev.total, totalSize)
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormatosChange = (formato) => {
    setFormData(prev => ({
      ...prev,
      formatosExportacion: prev.formatosExportacion.includes(formato)
        ? prev.formatosExportacion.filter(f => f !== formato)
        : [...prev.formatosExportacion, formato]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const ejecutarBackupManual = () => {
    // Simulación de backup manual
    const data = {
      timestamp: new Date().toISOString(),
      pacientes: JSON.parse(localStorage.getItem('pacientes') || '[]'),
      personal: JSON.parse(localStorage.getItem('personal') || '[]'),
      configuraciones: JSON.parse(localStorage.getItem('sistema_configuraciones') || '{}')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_sistema_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const limpiarDatos = (tipo) => {
    // Simulación de limpieza de datos
    switch (tipo) {
      case 'logs':
        localStorage.removeItem('audit_logs');
        break;
      case 'notificaciones':
        localStorage.removeItem('read_notifications');
        break;
      case 'sesiones':
        localStorage.removeItem('expired_sessions');
        break;
      default:
        break;
    }
    calcularEspacioUsado();
  };

  const porcentajeUsado = (espacioUsado.usado / espacioUsado.total) * 100;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3} display="flex" alignItems="center">
          <DataUsage sx={{ mr: 1 }} />
          Configuraciones de Datos
          <Chip 
            label={`${espacioUsado.usado}MB / ${espacioUsado.total}MB`}
            color={porcentajeUsado > 80 ? 'error' : porcentajeUsado > 60 ? 'warning' : 'primary'}
            size="small"
            sx={{ ml: 2 }}
          />
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Uso de Espacio */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Storage sx={{ mr: 1, verticalAlign: 'middle' }} />
                Uso de Espacio de Almacenamiento
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Espacio utilizado: {espacioUsado.usado}MB de {espacioUsado.total}MB
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={porcentajeUsado}
                  color={porcentajeUsado > 80 ? 'error' : porcentajeUsado > 60 ? 'warning' : 'primary'}
                  sx={{ height: 10, borderRadius: 5, mt: 1 }}
                />
              </Box>
            </Grid>

            {porcentajeUsado > 80 && (
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  El espacio de almacenamiento está llegando al límite. 
                  Considera hacer limpieza de datos antiguos o aumentar el espacio disponible.
                </Alert>
              </Grid>
            )}

            {/* Configuración de Backup */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Backup sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuración de Respaldos
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.backupAutomatico}
                    onChange={handleChange}
                    name="backupAutomatico"
                  />
                }
                label="Habilitar respaldos automáticos"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                startIcon={<CloudDownload />}
                onClick={ejecutarBackupManual}
                fullWidth
              >
                Ejecutar Backup Manual
              </Button>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Frecuencia de Backup"
                name="frecuenciaBackup"
                value={formData.frecuenciaBackup}
                onChange={handleChange}
                disabled={!formData.backupAutomatico}
              >
                {frecuenciasBackup.map((freq) => (
                  <MenuItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="time"
                label="Hora del Backup"
                name="horaBackup"
                value={formData.horaBackup}
                onChange={handleChange}
                disabled={!formData.backupAutomatico || formData.frecuenciaBackup === 'manual'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Ubicación del Backup"
                name="ubicacionBackup"
                value={formData.ubicacionBackup}
                onChange={handleChange}
              >
                {ubicacionesBackup.map((ubicacion) => (
                  <MenuItem key={ubicacion.value} value={ubicacion.value}>
                    {ubicacion.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.compresionBackup}
                    onChange={handleChange}
                    name="compresionBackup"
                  />
                }
                label="Comprimir archivos de backup"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.encriptacionBackup}
                    onChange={handleChange}
                    name="encriptacionBackup"
                  />
                }
                label="Encriptar archivos de backup"
              />
            </Grid>

            {/* Retención de Datos */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Retención de Datos
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tiempo de Retención de Datos"
                name="retencionDatos"
                value={formData.retencionDatos}
                onChange={handleChange}
                helperText="Tiempo que se conservan los datos antes de archivarse"
              >
                {retencionOpciones.map((opcion) => (
                  <MenuItem key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Limpieza Automática */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Delete sx={{ mr: 1, verticalAlign: 'middle' }} />
                Limpieza Automática de Datos
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.limpiezaAutomatica}
                    onChange={handleChange}
                    name="limpiezaAutomatica"
                  />
                }
                label="Habilitar limpieza automática de datos temporales"
              />
            </Grid>

            <Grid item xs={12}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText
                    primary="Logs de Auditoría"
                    secondary={`Eliminar después de ${formData.limpiarLogsAuditoria} días`}
                  />
                  <TextField
                    size="small"
                    type="number"
                    value={formData.limpiarLogsAuditoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, limpiarLogsAuditoria: parseInt(e.target.value) }))}
                    inputProps={{ min: 1, max: 365 }}
                    sx={{ width: 100, mr: 1 }}
                    disabled={!formData.limpiezaAutomatica}
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => limpiarDatos('logs')}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <DataUsage />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notificaciones Leídas"
                    secondary={`Eliminar después de ${formData.limpiarNotificacionesLeidas} días`}
                  />
                  <TextField
                    size="small"
                    type="number"
                    value={formData.limpiarNotificacionesLeidas}
                    onChange={(e) => setFormData(prev => ({ ...prev, limpiarNotificacionesLeidas: parseInt(e.target.value) }))}
                    inputProps={{ min: 1, max: 365 }}
                    sx={{ width: 100, mr: 1 }}
                    disabled={!formData.limpiezaAutomatica}
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => limpiarDatos('notificaciones')}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Storage />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sesiones Expiradas"
                    secondary={`Eliminar después de ${formData.limpiarSesionesExpiradas} días`}
                  />
                  <TextField
                    size="small"
                    type="number"
                    value={formData.limpiarSesionesExpiradas}
                    onChange={(e) => setFormData(prev => ({ ...prev, limpiarSesionesExpiradas: parseInt(e.target.value) }))}
                    inputProps={{ min: 1, max: 30 }}
                    sx={{ width: 100, mr: 1 }}
                    disabled={!formData.limpiezaAutomatica}
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => limpiarDatos('sesiones')}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
              </List>
            </Grid>

            {/* Formatos de Exportación */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <GetApp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Formatos de Exportación
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Selecciona los formatos disponibles para exportar datos:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formatosDisponibles.map((formato) => (
                  <Chip
                    key={formato.value}
                    label={formato.label}
                    onClick={() => handleFormatosChange(formato.value)}
                    color={formData.formatosExportacion.includes(formato.value) ? 'primary' : 'default'}
                    variant={formData.formatosExportacion.includes(formato.value) ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.importacionMasiva}
                    onChange={handleChange}
                    name="importacionMasiva"
                  />
                }
                label="Habilitar importación masiva de datos"
              />
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
                  Guardar Configuraciones de Datos
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConfiguracionDatos;