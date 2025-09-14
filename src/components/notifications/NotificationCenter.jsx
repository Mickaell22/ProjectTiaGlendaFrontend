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
  position = { top: 8, right: 8 }, // Posición del botón
  maxHeight = 400,
  autoRefresh = true,
  refreshInterval = 30000, // 30 segundos
}) => {
  // Estados principales
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados de configuración
  const [showSettings, setShowSettings] = useState(false);
  const [includeRead, setIncludeRead] = useState(false);

  const open = Boolean(anchorEl);

  // Cargar notificaciones al montar
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

  // Recargar cuando cambia includeRead
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [includeRead]);

  /**
   * Configurar refresh automático
   */
  const setupAutoRefresh = useCallback(() => {
    // Configurar callback para actualización de conteo
    notificationService.onCountUpdate((count) => {
      setUnreadCount(count);
    });

    // Configurar callback para nuevas notificaciones
    notificationService.onNewNotification((newCount) => {
      console.log(`${newCount} nuevas notificaciones recibidas`);
      // Recargar lista si el popover está abierto
      if (open) {
        loadNotifications();
      }
    });

    // Iniciar polling
    notificationService.startPolling(refreshInterval);
  }, [open, refreshInterval]);

  /**
   * Configurar notificaciones del navegador
   */
  const setupBrowserNotifications = useCallback(async () => {
    const permission = await notificationService.requestBrowserPermission();
    if (permission === 'granted') {
      notificationService.enableBrowserNotifications();
    }
  }, []);

  /**
   * Cargar notificaciones desde el servidor
   */
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await notificationService.getNotificaciones(includeRead, 50);
      if (result.success) {
        setNotifications(result.notificaciones);
        setUnreadCount(result.notificaciones.filter(n => !n.leida).length);
      } else {
        setError(result.error || 'Error al cargar notificaciones');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      setError('Error de conexión');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [includeRead]);

  /**
   * Abrir/cerrar popover
   */
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

  /**
   * Marcar notificación como leída
   */
  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.marcarComoLeida(notificationId);
      if (result.success) {
        // Actualizar la notificación en la lista local
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, leida: true }
              : notification
          )
        );
        
        // Actualizar contador
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      } else {
        console.error('Error marcando notificación como leída:', result.error);
      }
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  /**
   * Marcar todas como leídas
   */
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.leida);
    
    try {
      // Marcar todas las no leídas
      await Promise.all(
        unreadNotifications.map(notification =>
          notificationService.marcarComoLeida(notification.id)
        )
      );
      
      // Actualizar estado local
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          leida: true,
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  };

  /**
   * Filtrar notificaciones para mostrar
   */
  const filteredNotifications = notifications.filter(notification => 
    includeRead || !notification.leida
  );

  /**
   * Renderizar contenido del popover
   */
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
            sx: { boxShadow: 4 }
          }
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