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
} from '@mui/icons-material';
import notificationService from '../../services/notificationService';

const NotificationSettings = ({
  onBack = () => {},
  onClose = () => {},
}) => {
  const [config, setConfig] = useState({
    notificaciones_habilitadas: true,
    notificar_sesiones_terapia: true,
    notificar_clases_pedagogicas: true,
    notificar_cancelaciones: true,
    notificar_reprogramaciones: true,
    notificar_mensajes_chat: true,
    notificar_solo_mensajes_urgentes: false,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [browserPermission, setBrowserPermission] = useState('default');

  useEffect(() => {
    loadConfiguration();
    checkBrowserPermission();
  }, []);

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
        setError(result.error || 'Error al cargar configuracion');
      }
    } catch (err) {
      console.error('Error cargando configuracion:', err);
      setError('Error al cargar configuracion');
    } finally {
      setLoading(false);
    }
  };

  const checkBrowserPermission = () => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    } else {
      setBrowserPermission('not-supported');
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const result = await notificationService.updateConfiguracion(config);
      if (result.success) {
        setSuccess('Configuracion guardada correctamente');
        setTimeout(() => {
          setSuccess('');
          onBack();
        }, 2000);
      } else {
        setError(result.error || 'Error al guardar configuracion');
      }
    } catch (err) {
      console.error('Error guardando configuracion:', err);
      setError('Error al guardar configuracion');
    } finally {
      setSaving(false);
    }
  };

  const requestBrowserPermission = async () => {
    const permission = await notificationService.requestBrowserPermission();
    setBrowserPermission(permission);
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const renderSwitch = (field, label, description = '', disabled = false) => (
    <ListItem>
      <ListItemText primary={label} secondary={description} />
      <ListItemSecondaryAction>
        <Switch
          checked={config[field] || false}
          onChange={(e) => handleConfigChange(field, e.target.checked)}
          disabled={saving || disabled}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );

  const getPermissionColor = () => {
    switch (browserPermission) {
      case 'granted': return 'success';
      case 'denied': return 'error';
      case 'not-supported': return 'warning';
      default: return 'default';
    }
  };

  const getPermissionText = () => {
    switch (browserPermission) {
      case 'granted': return 'Permitidas';
      case 'denied': return 'Bloqueadas';
      case 'not-supported': return 'No compatibles';
      default: return 'Pendiente';
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
            Configuracion
          </Typography>
          <IconButton size="small" onClick={saveConfiguration} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : <SaveIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Contenido */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
          </Box>
        )}
        {success && (
          <Box sx={{ p: 2 }}>
            <Alert severity="success">{success}</Alert>
          </Box>
        )}

        <List sx={{ py: 0 }}>
          {/* General */}
          <ListItem>
            <ListItemText
              primary="Configuracion General"
              sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }}
            />
          </ListItem>

          {renderSwitch('notificaciones_habilitadas', 'Notificaciones activas', 'Activar o desactivar todas las notificaciones')}

          <ListItem>
            <ListItemText
              primary="Notificaciones del navegador"
              secondary="Mostrar notificaciones fuera de la aplicacion"
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
                  <Button size="small" onClick={requestBrowserPermission} sx={{ fontSize: '0.7rem' }}>
                    Permitir
                  </Button>
                )}
              </Box>
            </ListItemSecondaryAction>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* Tipos */}
          <ListItem>
            <ListItemText
              primary="Tipos de Notificacion"
              sx={{ '& .MuiListItemText-primary': { fontWeight: 600 } }}
            />
          </ListItem>

          {renderSwitch(
            'notificar_sesiones_terapia',
            'Sesiones Terapeuticas',
            'Recordatorios de citas de terapia',
            !config.notificaciones_habilitadas
          )}

          {renderSwitch(
            'notificar_clases_pedagogicas',
            'Clases Pedagogicas',
            'Recordatorios de clases grupales',
            !config.notificaciones_habilitadas
          )}

          {renderSwitch(
            'notificar_cancelaciones',
            'Cancelaciones',
            'Alertas de sesiones o clases canceladas',
            !config.notificaciones_habilitadas
          )}

          {renderSwitch(
            'notificar_reprogramaciones',
            'Reprogramaciones',
            'Alertas de cambios de horario',
            !config.notificaciones_habilitadas
          )}

          {renderSwitch(
            'notificar_mensajes_chat',
            'Mensajes de Chat',
            'Notificaciones de mensajes nuevos',
            !config.notificaciones_habilitadas
          )}

          {renderSwitch(
            'notificar_solo_mensajes_urgentes',
            'Solo mensajes urgentes',
            'Filtrar unicamente mensajes marcados como urgentes',
            !config.notificaciones_habilitadas || !config.notificar_mensajes_chat
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
          {saving ? 'Guardando...' : 'Guardar Configuracion'}
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationSettings;
