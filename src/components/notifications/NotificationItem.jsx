// src/components/notifications/NotificationItem.jsx
import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  MarkEmailRead as MarkEmailReadIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Message as MessageIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationItem = ({ 
  notification, 
  onMarkAsRead = () => {},
  onClose = () => {},
}) => {
  /**
   * Obtener icono según el tipo de notificación
   */
  const getNotificationIcon = () => {
    switch (notification.tipo) {
      case 'chat':
        return <MessageIcon color="primary" />;
      case 'cita':
      case 'sesion':
        return <EventIcon color="secondary" />;
      case 'usuario':
        return <PersonIcon color="info" />;
      case 'sistema':
        return <InfoIcon color="default" />;
      default:
        return <InfoIcon color="default" />;
    }
  };

  /**
   * Formatear fecha de forma amigable
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return '';
    }
  };

  /**
   * Manejar clic en la notificación
   */
  const handleClick = () => {
    // Si no está leída, marcarla como leída
    if (!notification.leida) {
      onMarkAsRead(notification.id);
    }

    // Manejar navegación según el tipo de notificación
    handleNotificationAction();
  };

  /**
   * Manejar acción específica de la notificación
   */
  const handleNotificationAction = () => {
    // Cerrar el centro de notificaciones
    onClose();

    // Navegar según el tipo y datos de la notificación
    if (notification.datos_adicionales) {
      try {
        const datos = typeof notification.datos_adicionales === 'string' 
          ? JSON.parse(notification.datos_adicionales)
          : notification.datos_adicionales;

        switch (notification.tipo) {
          case 'chat':
            // Abrir chat con el usuario específico
            if (datos.id_remitente) {
              // Aquí podrías emitir un evento para abrir el chat
              // TODO: Implementar apertura del chat
            }
            break;
          
          case 'cita':
          case 'sesion':
            // Navegar a la página de citas/sesiones
            if (datos.id_sesion || datos.id_cita) {
              // TODO: Implementar navegación a sesión/cita
            }
            break;
          
          case 'usuario':
            // Navegar a gestión de usuarios
            if (datos.id_usuario) {
              // TODO: Implementar navegación a usuario
            }
            break;
          
          default:
            // Notificación marcada como vista
        }
      } catch (error) {
        console.error('Error procesando datos de notificación:', error);
      }
    }
  };

  /**
   * Manejar marcar como leída sin hacer clic en la notificación
   */
  const handleMarkAsReadOnly = (e) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  /**
   * Truncar mensaje largo
   */
  const truncateMessage = (message, maxLength = 100) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return `${message.substring(0, maxLength)}...`;
  };

  return (
    <ListItem
      disablePadding
      sx={{
        bgcolor: notification.leida ? 'transparent' : 'action.hover',
        '&:hover': {
          bgcolor: 'action.selected',
        },
      }}
    >
      <ListItemButton onClick={handleClick} sx={{ py: 1.5 }}>
        {/* Icono de tipo */}
        <ListItemIcon sx={{ minWidth: 40 }}>
          {getNotificationIcon()}
        </ListItemIcon>

        {/* Contenido principal */}
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  flex: 1,
                  fontWeight: notification.leida ? 400 : 600,
                  lineHeight: 1.2,
                }}
              >
                {notification.titulo}
              </Typography>
              
              {/* Chip de prioridad */}
              {notification.prioridad === 'alta' && (
                <Chip
                  label="Urgente"
                  size="small"
                  color="error"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Box>
          }
          secondary={
            <Box sx={{ mt: 0.5 }}>
              {/* Mensaje */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: notification.leida ? 400 : 500,
                  mb: 0.5,
                }}
              >
                {truncateMessage(notification.mensaje)}
              </Typography>

              {/* Información adicional */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Fecha */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {formatDate(notification.fecha_creacion)}
                </Typography>

                {/* Chip de tipo */}
                <Chip
                  label={notification.tipo}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    height: 16, 
                    fontSize: '0.6rem',
                    textTransform: 'capitalize',
                  }}
                />

                {/* Indicador de no leída */}
                {!notification.leida && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      ml: 'auto',
                    }}
                  />
                )}
              </Box>
            </Box>
          }
        />

        {/* Botón marcar como leída */}
        {!notification.leida && (
          <Box sx={{ ml: 1 }}>
            <Tooltip title="Marcar como leída">
              <IconButton
                size="small"
                onClick={handleMarkAsReadOnly}
                sx={{ 
                  opacity: 0.7,
                  '&:hover': { opacity: 1 }
                }}
              >
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </ListItemButton>
    </ListItem>
  );
};

export default NotificationItem;