// src/components/chat/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Button,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';
import MessageBubble from './MessageBubble';

const ChatWindow = ({
  conversation = null,
  messages = [],
  onSendMessage = () => {},
  onRefresh = () => {},
}) => {
  const theme = useTheme();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [justSent, setJustSent] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll al final cuando llegan nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Hacer scroll automático al final de los mensajes
   */
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Scroll directo al contenedor para mejor control
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    } else if (messagesEndRef.current) {
      // Fallback al método anterior
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  /**
   * Enviar mensaje
   */
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!messageText.trim() || sending || !conversation) {
      return;
    }

    setSending(true);
    setError('');

    try {
      const result = await onSendMessage({
        mensaje: messageText.trim(),
        tipo_mensaje: 'texto',
        prioridad: 'normal',
      });

      if (result.success) {
        setMessageText('');
        setJustSent(true);
        // Auto-scroll después de enviar
        setTimeout(scrollToBottom, 100);
        // Ocultar indicador después de 2 segundos
        setTimeout(() => setJustSent(false), 2000);
      } else {
        setError(result.error || 'Error al enviar mensaje');
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setError('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  /**
   * Manejar tecla Enter para enviar
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Formatear fecha del mensaje
   */
  const formatMessageDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      // Si es hoy, mostrar solo la hora
      if (messageDate.getTime() === today.getTime()) {
        return date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      // Si es ayer
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (messageDate.getTime() === yesterday.getTime()) {
        return `Ayer ${date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`;
      }
      
      // Si es más antiguo, mostrar fecha completa
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  /**
   * Agrupar mensajes por fecha
   */
  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;
    
    messages.forEach((message, index) => {
      const messageDate = new Date(message.fecha_envio);
      const dateKey = messageDate.toDateString();
      
      if (!currentGroup || currentGroup.date !== dateKey) {
        currentGroup = {
          date: dateKey,
          dateLabel: formatDateGroup(messageDate),
          messages: [],
        };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });
    
    return groups;
  };

  /**
   * Formatear fecha para el separador de grupo
   */
  const formatDateGroup = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Hoy';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Ayer';
    }
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Si no hay conversación seleccionada
  if (!conversation) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="h6" gutterBottom>
            Selecciona una conversación
          </Typography>
          <Typography variant="body2">
            Elige un contacto para comenzar a chatear
          </Typography>
        </Box>
      </Box>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Box
      sx={{
        height: '100%',
        maxHeight: '600px', // Limitar altura total del componente
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Área de mensajes */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          minHeight: '300px',   // Altura mínima
          maxHeight: '450px',   // Altura máxima específica para área de mensajes
          overflow: 'auto',     // Scroll cuando exceda la altura
          overflowX: 'hidden',  // No scroll horizontal
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          // Estilos de scrollbar personalizados
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(0,0,0,0.3)',
            },
          },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(to bottom, #2e2e2e 0%, #1e1e1e 100%)'
            : 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)',
          backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(120, 144, 156, 0.03) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4,
            }}
          >
            <Box sx={{
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 3,
              boxShadow: 1,
              maxWidth: 400
            }}>
              <Typography variant="h6" color="primary.main" gutterBottom sx={{ fontWeight: 600 }}>
                ¡Inicia la conversación!
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                No hay mensajes con {conversation?.nombre_contacto}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Envía el primer mensaje para comenzar a chatear
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            {messageGroups.map((group, groupIndex) => (
              <Box key={group.date}>
                {/* Separador de fecha */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 0.5,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      color: 'text.secondary',
                    }}
                  >
                    {group.dateLabel}
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>

                {/* Mensajes del grupo */}
                {group.messages.map((message, messageIndex) => (
                  <MessageBubble
                    key={`${message.id_mensaje || messageIndex}`}
                    message={message}
                    formatDate={formatMessageDate}
                  />
                ))}
              </Box>
            ))}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Error de envío */}
      {error && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            action={
              <Button size="small" onClick={handleSendMessage}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Área de input */}
      <Paper
        elevation={3}
        sx={{
          p: 2.5,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            minRows={1}
            placeholder={justSent ? "¡Mensaje enviado! ✓" : "Escribe tu mensaje..."}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default',
                borderRadius: 3,
                fontSize: '0.95rem',
                '&:hover': {
                  '& > fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '&.Mui-focused': {
                  '& > fieldset': {
                    borderWidth: '2px',
                    borderColor: 'primary.main',
                  },
                },
                '& > fieldset': {
                  borderColor: 'grey.300',
                  transition: 'border-color 0.2s ease-in-out',
                },
              },
              '& .MuiInputBase-input': {
                py: 1.5,
              },
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* Botón refresh */}
            <IconButton
              onClick={onRefresh}
              disabled={sending}
              size="small"
              color="default"
            >
              <RefreshIcon />
            </IconButton>

            {/* Botón enviar */}
            <IconButton
              type="submit"
              disabled={!messageText.trim() || sending}
              color="primary"
              sx={{
                bgcolor: messageText.trim() ? 'primary.main' : 'grey.300',
                color: 'white',
                width: 48,
                height: 48,
                boxShadow: messageText.trim() ? '0 2px 8px rgba(25, 118, 210, 0.3)' : 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: messageText.trim() ? 'primary.dark' : 'grey.400',
                  transform: 'scale(1.05)',
                },
                '&:disabled': {
                  bgcolor: 'grey.300',
                  color: 'grey.500',
                },
              }}
            >
              {sending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatWindow;