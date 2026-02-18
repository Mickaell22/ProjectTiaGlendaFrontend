// src/components/notifications/NotificationCenter.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Paper,
  Typography,
  List,
  Divider,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import NotificationItem from './NotificationItem';
import NotificationSettings from './NotificationSettings';
import notificationService from '../../services/notificationService';

const NotificationCenter = ({
  position = { top: 8, right: 8 },
  maxHeight = 400,
  autoRefresh = true,
  refreshInterval = 30000, // 30 segundos
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showSettings, setShowSettings] = useState(false);
  const [includeRead, setIncludeRead] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    loadNotifications();

    if (autoRefresh) {
      setupAutoRefresh();
      setupBrowserNotifications();
    }

    return () => {
      if (autoRefresh) {
        notificationService.cleanup();
      }
    };
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [includeRead]);

  const setupAutoRefresh = useCallback(() => {
    notificationService.onCountUpdate((count) => {
      setUnreadCount(count);
    });

    notificationService.onNewNotification(() => {
      if (open) {
        loadNotifications();
      }
    });

    notificationService.startPolling(refreshInterval);
  }, [open, refreshInterval]);

  const setupBrowserNotifications = useCallback(async () => {
    const permission = await notificationService.requestBrowserPermission();
    if (permission === 'granted') {
      notificationService.enableBrowserNotifications();
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await notificationService.getNotificaciones(includeRead, 50);
      if (result.success) {
        setNotifications(result.notificaciones);
        // Contar no leidas usando campo "estado" del backend
        setUnreadCount(result.notificaciones.filter(n => n.estado !== 'leida').length);
      } else {
        setError(result.error || 'Error al cargar notificaciones');
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      setError('Error de conexión');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [includeRead]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (!open) {
      loadNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowSettings(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.marcarComoLeida(notificationId);
      if (result.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, estado: 'leida' } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marcando notificación como leída:', err);
    }
  };

  /**
   * Marcar todas como leídas usando el endpoint dedicado PUT /api/notificaciones/leer-todas
   */
  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationService.marcarTodasComoLeidas();
      if (result.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, estado: 'leida' }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marcando todas las notificaciones como leídas:', err);
    }
  };

  /**
   * Eliminar una notificacion usando DELETE /api/notificaciones/<id>
   */
  const handleDelete = async (notificationId) => {
    try {
      const result = await notificationService.eliminarNotificacion(notificationId);
      if (result.success) {
        const removed = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (removed && removed.estado !== 'leida') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error eliminando notificación:', err);
    }
  };

  // Filtrar usando campo "estado" del backend
  const filteredNotifications = notifications.filter(n =>
    includeRead || n.estado !== 'leida'
  );

  const renderContent = () => {
    if (showSettings) {
      return (
        <NotificationSettings
          onBack={() => setShowSettings(false)}
          onClose={handleClose}
        />
      );
    }

    return (
      <Box sx={{ width: 360, maxHeight, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Notificaciones
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={loadNotifications}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>

              <IconButton
                size="small"
                onClick={() => setShowSettings(true)}
              >
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Filtros y acciones */}
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={includeRead ? 'Todas' : 'No leídas'}
              size="small"
              color={includeRead ? 'default' : 'primary'}
              onClick={() => setIncludeRead(!includeRead)}
              clickable
            />

            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{ fontSize: '0.7rem' }}
              >
                Marcar todas como leídas
              </Button>
            )}
          </Box>
        </Box>

        {/* Contenido */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={loadNotifications}>
                    Reintentar
                  </Button>
                }
              >
                {error}
              </Alert>
            </Box>
          ) : filteredNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography color="text.secondary">
                {includeRead
                  ? 'No hay notificaciones'
                  : 'No hay notificaciones nuevas'
                }
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onClose={handleClose}
                  />
                  {index < filteredNotifications.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      {/* Botón de notificaciones */}
      <Box sx={{ position: 'fixed', ...position, zIndex: 1000 }}>
        <IconButton
          onClick={handleClick}
          size="large"
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
              boxShadow: 4,
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Box>

      {/* Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: { boxShadow: 4 },
          },
        }}
      >
        <Paper elevation={0}>
          {renderContent()}
        </Paper>
      </Popover>
    </>
  );
};

export default NotificationCenter;
