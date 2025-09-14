// src/components/notifications/NotificationSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
} from '@mui/icons-material';
import notificationService from '../../services/notificationService';

const NotificationSettings = ({ 
  onBack = () => {},
  onClose = () => {},
}) => {
  // Estados de configuración
  const [config, setConfig] = useState({
    // Configuración general
    notificaciones_activas: true,
    notificaciones_navegador: false,
    sonido_activo: true,
    
    // Configuración por tipo
    notificaciones_chat: true,
    notificaciones_citas: true,
    notificaciones_sesiones: true,
    notificaciones_usuarios: true,
    notificaciones_sistema: true,
    
    // Configuración por prioridad
    prioridad_alta: true,
    prioridad_media: true,
    prioridad_baja: false,
    
    // Configuración de horarios
    horario_inicio: '08:00',
    horario_fin: '20:00',
    notificaciones_fines_semana: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [browserPermission, setBrowserPermission] = useState('default');

  // Cargar configuración al montar
  useEffect(() => {
    loadConfiguration();
    checkBrowserPermission();
  }, []);

  /**
   * Cargar configuración actual del usuario
   */
  const loadConfiguration = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await notificationService.getConfiguracion();
      if (result.success) {
        setConfig(prev => ({
          ...prev,
          ...result.configuracion,
        }));
      } else {
        setError(result.error || 'Error al cargar configuración');
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setError('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verificar permisos del navegador para notificaciones
   */
  const checkBrowserPermission = () => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    } else {
      setBrowserPermission('not-supported');
    }
  };

  /**
   * Guardar configuración
   */
  const saveConfiguration = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await notificationService.updateConfiguracion(config);
      if (result.success) {
        setSuccess('Configuración guardada correctamente');
        setTimeout(() => {
          setSuccess('');
          onBack(); // Volver a la lista de notificaciones
        }, 2000);
      } else {
        setError(result.error || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      setError('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Solicitar permisos del navegador
   */
  const requestBrowserPermission = async () => {
    const permission = await notificationService.requestBrowserPermission();
    setBrowserPermission(permission);
    
    if (permission === 'granted') {
      setConfig(prev => ({ ...prev, notificaciones_navegador: true }));
    }
  };

  /**
   * Manejar cambio en la configuración
   */
  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Renderizar switch de configuración
   */
  const renderConfigSwitch = (field, label, description = '') => (
    <ListItem>
      <ListItemText
        primary={label}
        secondary={description}
      />
      <ListItemSecondaryAction>
        <Switch
          checked={config[field] || false}
          onChange={(e) => handleConfigChange(field, e.target.checked)}
          disabled={saving}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );

  /**
   * Obtener color del estado de permisos
   */
  const getPermissionColor = () => {
    switch (browserPermission) {
      case 'granted':
        return 'success';
      case 'denied':
        return 'error';
      case 'not-supported':
        return 'warning';
      default:
        return 'default';
    }
  };

  /**
   * Obtener texto del estado de permisos
   */
  const getPermissionText = () => {
    switch (browserPermission) {
      case 'granted':
        return 'Permitidas';
      case 'denied':
        return 'Bloqueadas';
      case 'not-supported':
        return 'No compatibles';
      default:
        return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: 360, p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: 360, maxHeight: 600, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={onBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Configuración
          </Typography>
          <IconButton
            size="small"
            onClick={saveConfiguration}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : <SaveIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Contenido */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Alerts */}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Box>
        )}
        
        {success && (
          <Box sx={{ p: 2 }}>
            <Alert severity="success">
              {success}
            </Alert>
          </Box>
        )}

        <List sx={{ py: 0 }}>
          {/* Configuración General */}
          <ListItem>
            <ListItemText
              primary="Configuración General"
              sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }}
            />
          </ListItem>
          
          {renderConfigSwitch(
            'notificaciones_activas',
            'Notificaciones activas',
            'Activar o desactivar todas las notificaciones'
          )}

          <ListItem>
            <ListItemText
              primary="Notificaciones del navegador"
              secondary="Mostrar notificaciones fuera de la aplicación"
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={getPermissionText()}
                  size="small"
                  color={getPermissionColor()}
                  sx={{ fontSize: '0.7rem' }}
                />
                {browserPermission !== 'granted' && browserPermission !== 'not-supported' && (
                  <Button
                    size="small"
                    onClick={requestBrowserPermission}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Permitir
                  </Button>
                )}
                <Switch
                  checked={config.notificaciones_navegador && browserPermission === 'granted'}
                  onChange={(e) => handleConfigChange('notificaciones_navegador', e.target.checked)}
                  disabled={browserPermission !== 'granted' || saving}
                />
              </Box>
            </ListItemSecondaryAction>
          </ListItem>

          {renderConfigSwitch(
            'sonido_activo',
            'Sonido de notificación',
            'Reproducir sonido al recibir notificaciones'
          )}

          <Divider sx={{ my: 1 }} />

          {/* Configuración por Tipo */}
          <ListItem>
            <ListItemText
              primary="Tipos de Notificación"
              sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }}
            />
          </ListItem>

          {renderConfigSwitch(
            'notificaciones_chat',
            'Mensajes de Chat',
            'Notificaciones de nuevos mensajes'
          )}

          {renderConfigSwitch(
            'notificaciones_citas',
            'Citas Médicas',
            'Notificaciones de citas programadas'
          )}

          {renderConfigSwitch(
            'notificaciones_sesiones',
            'Sesiones Terapéuticas',
            'Notificaciones de sesiones de terapia'
          )}

          {renderConfigSwitch(
            'notificaciones_usuarios',
            'Gestión de Usuarios',
            'Notificaciones de cambios de usuarios'
          )}

          {renderConfigSwitch(
            'notificaciones_sistema',
            'Sistema',
            'Notificaciones del sistema y actualizaciones'
          )}

          <Divider sx={{ my: 1 }} />

          {/* Configuración por Prioridad */}
          <ListItem>
            <ListItemText
              primary="Prioridad de Notificaciones"
              sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }}
            />
          </ListItem>

          {renderConfigSwitch(
            'prioridad_alta',
            'Prioridad Alta',
            'Notificaciones urgentes e importantes'
          )}

          {renderConfigSwitch(
            'prioridad_media',
            'Prioridad Media',
            'Notificaciones regulares'
          )}

          {renderConfigSwitch(
            'prioridad_baja',
            'Prioridad Baja',
            'Notificaciones informativas'
          )}

          <Divider sx={{ my: 1 }} />

          {/* Configuración de Horarios */}
          <ListItem>
            <ListItemText
              primary="Horarios"
              sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }}
            />
          </ListItem>

          {renderConfigSwitch(
            'notificaciones_fines_semana',
            'Fines de semana',
            'Recibir notificaciones los fines de semana'
          )}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          onClick={saveConfiguration}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
        >
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationSettings;