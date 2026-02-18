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
} from '@mui/material';
import {
  MarkEmailRead as MarkEmailReadIcon,
  Info as InfoIcon,
  Message as MessageIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({
  notification,
  onMarkAsRead = () => {},
  onDelete = () => {},
  onClose = () => {},
}) => {
  const navigate = useNavigate();

  // Determinar si la notificacion esta leida usando el campo "estado" del backend
  const esLeida = notification.estado === 'leida';

  /**
   * Obtener icono según el tipo_notificacion del backend
   * Valores: sesion_terapia | clase_pedagogica | cancelacion | reprogramacion | mensaje_chat | recordatorio_general
   */
  const getNotificationIcon = () => {
    switch (notification.tipo_notificacion) {
      case 'mensaje_chat':
        return <MessageIcon color="primary" />;
      case 'sesion_terapia':
      case 'clase_pedagogica':
        return <EventIcon color="secondary" />;
      case 'cancelacion':
        return <CancelIcon color="error" />;
      case 'reprogramacion':
        return <ScheduleIcon color="warning" />;
      case 'recordatorio_general':
        return <NotificationsIcon color="info" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  /**
   * Obtener color según la prioridad del backend
   * Valores: urgente | alta | normal | baja
   */
  const getPriorityColor = () => {
    switch (notification.prioridad) {
      case 'urgente':
        return 'error';
      case 'alta':
        return 'error';
      case 'normal':
        return 'default';
      case 'baja':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * Formatear fecha de forma amigable
   * El backend devuelve fecha_envio en formato ISO
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: es,
      });
    } catch (error) {
      return '';
    }
  };

  /**
   * Manejar clic en la notificación
   */
  const handleClick = () => {
    if (!esLeida) {
      onMarkAsRead(notification.id);
    }
    handleNotificationAction();
  };

  /**
   * Navegar usando url_accion si está disponible, o usar contexto como fallback
   */
  const handleNotificationAction = () => {
    onClose();

    if (notification.url_accion) {
      navigate(notification.url_accion);
      return;
    }

    // Fallback: navegar usando contexto (ya viene como objeto, sin JSON.parse)
    if (notification.contexto) {
      const contexto = notification.contexto;
      switch (notification.tipo_notificacion) {
        case 'mensaje_chat':
          // TODO: Implementar apertura del chat con contexto.id_remitente
          break;
        case 'sesion_terapia':
          if (contexto.id_sesion) {
            navigate(`/terapeutico/sesiones/${contexto.id_sesion}`);
          }
          break;
        case 'clase_pedagogica':
          if (contexto.id_sesion) {
            navigate(`/pedagogico/sesiones/${contexto.id_sesion}`);
          }
          break;
        default:
          break;
      }
    }
  };

  /**
   * Manejar marcar como leída sin navegar
   */
  const handleMarkAsReadOnly = (e) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  /**
   * Manejar eliminación de la notificacion
   */
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notification.id);
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
        bgcolor: esLeida ? 'transparent' : 'action.hover',
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
                  fontWeight: esLeida ? 400 : 600,
                  lineHeight: 1.2,
                }}
              >
                {notification.titulo}
              </Typography>

              {/* Chip de prioridad para urgente y alta */}
              {(notification.prioridad === 'urgente' || notification.prioridad === 'alta') && (
                <Chip
                  label={notification.prioridad === 'urgente' ? 'Urgente' : 'Alta'}
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
                  fontWeight: esLeida ? 400 : 500,
                  mb: 0.5,
                }}
              >
                {truncateMessage(notification.mensaje)}
              </Typography>

              {/* Información adicional */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Fecha - usa fecha_envio del backend */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {formatDate(notification.fecha_envio)}
                </Typography>

                {/* Chip de tipo */}
                <Chip
                  label={notification.tipo_notificacion || 'general'}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 16,
                    fontSize: '0.6rem',
                    textTransform: 'capitalize',
                  }}
                />

                {/* Indicador de no leída */}
                {!esLeida && (
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

        {/* Botones de acción */}
        <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {/* Botón marcar como leída */}
          {!esLeida && (
            <Tooltip title="Marcar como leída">
              <IconButton
                size="small"
                onClick={handleMarkAsReadOnly}
                sx={{
                  opacity: 0.7,
                  '&:hover': { opacity: 1 },
                }}
              >
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Botón eliminar */}
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={handleDelete}
              sx={{
                opacity: 0.5,
                '&:hover': { opacity: 1, color: 'error.main' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItemButton>
    </ListItem>
  );
};

export default NotificationItem;
