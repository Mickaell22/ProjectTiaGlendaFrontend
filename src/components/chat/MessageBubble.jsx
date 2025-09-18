// src/components/chat/MessageBubble.jsx
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const MessageBubble = ({
  message,
  formatDate = () => '',
  currentUserId = null, // ID del usuario actual (obtenerlo del contexto de auth)
}) => {
  const theme = useTheme();

  if (!message) {
    return null;
  }

  // Determinar si el mensaje es propio
  // El backend marca los mensajes propios con es_remitente: true
  const isOwnMessage = message.es_remitente === true || message.es_remitente === 1;
  
  /**
   * Obtener color de fondo según el tipo de mensaje
   */
  const getMessageColor = (theme) => {
    if (isOwnMessage) {
      return theme.palette.primary.main; // Color primario del tema
    }
    return theme.palette.mode === 'dark'
      ? theme.palette.grey[700]
      : theme.palette.grey[100]; // Adaptado al tema
  };

  /**
   * Obtener color del texto
   */
  const getTextColor = () => {
    if (isOwnMessage) {
      return 'white';
    }
    return 'text.primary';
  };

  /**
   * Renderizar icono de estado del mensaje
   */
  const renderStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (message.estado) {
      case 'enviado':
        return (
          <Tooltip title="Enviado">
            <CheckIcon sx={{ fontSize: 16, color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary' }} />
          </Tooltip>
        );
      case 'entregado':
        return (
          <Tooltip title="Entregado">
            <DoneAllIcon sx={{ fontSize: 16, color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary' }} />
          </Tooltip>
        );
      case 'leido':
        return (
          <Tooltip title="Leído">
            <DoneAllIcon sx={{ fontSize: 16, color: 'primary.light' }} />
          </Tooltip>
        );
      case 'enviando':
        return (
          <Tooltip title="Enviando...">
            <ScheduleIcon sx={{ fontSize: 16, color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary' }} />
          </Tooltip>
        );
      case 'error':
        return (
          <Tooltip title="Error al enviar">
            <ErrorIcon sx={{ fontSize: 16, color: 'error.light' }} />
          </Tooltip>
        );
      default:
        return null;
    }
  };

  /**
   * Renderizar chip de prioridad si es alta
   */
  const renderPriorityChip = () => {
    if (message.prioridad === 'alta') {
      return (
        <Chip
          label="Urgente"
          size="small"
          color="error"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            mb: 0.5,
          }}
        />
      );
    }
    return null;
  };

  /**
   * Obtener iniciales para el avatar
   */
  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || 'U';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1.5,
        px: 1,
        animation: 'fadeInUp 0.3s ease-out',
        '@keyframes fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      {/* Avatar del remitente (solo para mensajes de otros) */}
      {!isOwnMessage && (
        <Avatar
          src={message.avatar_remitente}
          sx={{
            width: 32,
            height: 32,
            mr: 1,
            bgcolor: 'secondary.main',
            fontSize: '0.875rem',
          }}
        >
          {getInitials(message.nombre_remitente)}
        </Avatar>
      )}

      {/* Contenedor del mensaje */}
      <Box
        sx={{
          maxWidth: '70%',
          minWidth: '100px',
        }}
      >
        {/* Nombre del remitente (solo para mensajes de otros) */}
        {!isOwnMessage && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 0.5,
              ml: 1,
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            {message.nombre_remitente || 'Usuario'}
          </Typography>
        )}

        {/* Chip de prioridad */}
        {renderPriorityChip()}

        {/* Burbuja del mensaje */}
        <Paper
          elevation={isOwnMessage ? 2 : 1}
          sx={{
            p: 2,
            bgcolor: getMessageColor(theme),
            color: getTextColor(),
            borderRadius: 3,
            borderBottomRightRadius: isOwnMessage ? 0.8 : 3,
            borderBottomLeftRadius: isOwnMessage ? 3 : 0.8,
            position: 'relative',
            wordBreak: 'break-word',
            boxShadow: isOwnMessage
              ? '0 4px 12px rgba(25, 118, 210, 0.15)'
              : '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: isOwnMessage ? 'none' : '1px solid #e0e0e0',
          }}
        >
          {/* Contenido del mensaje */}
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.4,
            }}
          >
            {message.mensaje || message.contenido}
          </Typography>

          {/* Información del mensaje (hora y estado) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              mt: 0.5,
              opacity: isOwnMessage ? 0.8 : 0.6,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                color: isOwnMessage ? 'rgba(255,255,255,0.8)' : 'text.secondary',
              }}
            >
              {formatDate(message.fecha_envio)}
            </Typography>
            
            {renderStatusIcon()}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default MessageBubble;