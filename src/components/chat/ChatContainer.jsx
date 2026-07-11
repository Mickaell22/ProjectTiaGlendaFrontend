// src/components/chat/ChatContainer.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Fab,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  Chat as ChatIcon,
  Menu as MenuIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import UserSearch from './UserSearch';
import chatService from '../../services/chatService';
import useNotifications from '../../hooks/useNotifications';

const ChatContainer = ({
  isOpen = false,
  onClose = () => {},
  mode = 'modal', // 'modal', 'drawer', 'embedded'
}) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados principales
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Estados para búsqueda de usuarios
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Contador de mensajes no leídos
  const [_totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Sistema de detección de nuevos mensajes (CONTROLADO)
  const [isCheckingMessages, setIsCheckingMessages] = useState(false);
  const messageCheckIntervalRef = useRef(null);
  const lastMessageCheckRef = useRef(0);

  // Hook de notificaciones
  const notifications = useNotifications();

  // Referencias para detectar cambios en mensajes
  const previousMessageCountRef = useRef(0);
  const lastMessageIdRef = useRef(null);
  const lastCheckTimeRef = useRef(0);

  // Cargar conversaciones al abrir el chat y solicitar permisos
  useEffect(() => {
    if (isOpen) {
      loadConversations();

      // Solicitar permisos de notificación la primera vez que se abre
      if (notifications.permission === 'default') {
        setTimeout(() => {
          notifications.requestPermission();
        }, 1000); // Esperar un poco para mejor UX
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, [isOpen]);

  // Recargar mensajes cuando cambia la conversación activa
  useEffect(() => {
    if (activeConversation) {
      // Resetear todas las referencias al cambiar conversación
      previousMessageCountRef.current = 0;
      lastMessageIdRef.current = null;
      lastCheckTimeRef.current = 0;

      // Llamar loadMessages directamente sin depender de la función memoizada
      const loadMessagesDirectly = async (idContacto, limite = 30) => {
        try {
          const result = await chatService.getMensajes(idContacto, limite);
          if (result.success) {
            const newMessages = result.mensajes || [];
            setMessages(newMessages);

            // Actualizar referencias
            previousMessageCountRef.current = newMessages.length;
            lastMessageIdRef.current = newMessages.length > 0 ? newMessages[newMessages.length - 1]?.id : null;
          } else {
            setMessages([]);
          }
        } catch {
          setMessages([]);
        }
      };

      loadMessagesDirectly(activeConversation.id_contacto);
    }
  }, [activeConversation]); // Solo depende de activeConversation

  /**
   * Cargar lista de conversaciones
   */
  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await chatService.getConversaciones();
      if (result.success) {
        setConversations(result.conversaciones);

        // Calcular total de mensajes no leídos
        const totalUnread = result.conversaciones.reduce((total, conv) => {
          return total + (conv.mensajes_no_leidos || 0);
        }, 0);
        setTotalUnreadCount(totalUnread);

        // Si no hay conversación activa, seleccionar la primera
        setActiveConversation(prev => {
          if (!prev && result.conversaciones.length > 0) {
            return result.conversaciones[0];
          }
          return prev;
        });
      }
    } catch {
      // Error al cargar conversaciones: se ignora y se reintenta en el siguiente ciclo
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar re-creación

  /**
   * Cargar mensajes de una conversación
   */
  const loadMessages = useCallback(async (idContacto, limite = 30) => {
    try {
      const result = await chatService.getMensajes(idContacto, limite);
      if (result.success) {
        const newMessages = result.mensajes || [];
        setMessages(newMessages);

        // Actualizar referencias
        previousMessageCountRef.current = newMessages.length;
        lastMessageIdRef.current = newMessages.length > 0 ? newMessages[newMessages.length - 1]?.id : null;
      } else {
        console.error('❌ [ChatContainer] Error cargando mensajes:', result.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('💥 [ChatContainer] Excepción cargando mensajes:', error);
      setMessages([]);
    }
  }, []);


  /**
   * Seleccionar una conversación
   */
  const handleSelectConversation = useCallback((conversation) => {
    setActiveConversation(conversation);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  }, [isMobile]);

  /**
   * Enviar mensaje
   */
  const handleSendMessage = useCallback(async (messageData) => {
    if (!activeConversation) {
      return { success: false, error: 'No hay conversación activa' };
    }

    try {
      const result = await chatService.enviarMensaje({
        id_destinatario: activeConversation.id_contacto,
        mensaje: messageData.mensaje,
        tipo_mensaje: messageData.tipo_mensaje || 'texto',
        prioridad: messageData.prioridad || 'normal',
      });

      if (result.success) {
        // Agregar el mensaje inmediatamente a la lista local
        const newMessage = {
          id: result.id_mensaje,
          mensaje: messageData.mensaje,
          fecha_envio: result.fecha_envio || new Date().toISOString(),
          es_remitente: true,
          nombre_remitente: 'Tú',
          tipo_mensaje: messageData.tipo_mensaje || 'texto',
          prioridad: messageData.prioridad || 'normal',
          leido: false
        };

        setMessages(prevMessages => [...prevMessages, newMessage]);

        // Actualizar referencias
        previousMessageCountRef.current += 1;
        lastMessageIdRef.current = result.id_mensaje;

        // Actualizar conversaciones para mostrar último mensaje
        setTimeout(() => {
          loadConversations();
        }, 500);
      } else {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Error al enviar mensaje' };
    }
  }, [activeConversation, loadConversations]); // Mantener dependencias necesarias

  /**
   * Detectar nuevos mensajes de forma inteligente
   */
  const checkForNewMessages = useCallback(async () => {
    if (!activeConversation || isCheckingMessages) return;

    const now = Date.now();
    // Solo verificar cada 10 segundos mínimo
    if (now - lastMessageCheckRef.current < 10000) return;

    setIsCheckingMessages(true);
    lastMessageCheckRef.current = now;

    try {
      const result = await chatService.getMensajes(activeConversation.id_contacto, 5); // Solo los últimos 5
      if (result.success) {
        const newMessages = result.mensajes || [];

        // Verificar si hay mensajes nuevos comparando IDs
        const lastKnownId = lastMessageIdRef.current;
        const hasNewMessages = newMessages.some(msg =>
          !lastKnownId || msg.id > lastKnownId
        );

        if (hasNewMessages) {

          // Recargar todos los mensajes si hay nuevos
          const fullResult = await chatService.getMensajes(activeConversation.id_contacto, 30);
          if (fullResult.success) {
            const allMessages = fullResult.mensajes || [];
            setMessages(allMessages);

            // Actualizar referencias
            previousMessageCountRef.current = allMessages.length;
            lastMessageIdRef.current = allMessages.length > 0 ?
              allMessages[allMessages.length - 1]?.id : null;

            // Notificar al usuario si el mensaje no es propio
            const newestMessage = allMessages[allMessages.length - 1];
            if (newestMessage && !newestMessage.es_remitente) {
              notifications.notify(
                `💬 ${newestMessage.nombre_remitente || 'Nuevo mensaje'}`,
                newestMessage.mensaje?.substring(0, 50) + '...' || 'Mensaje recibido'
              );
            }
          }
        }
      }
    } catch {
      // Polling de mensajes: un fallo puntual se ignora
    } finally {
      setIsCheckingMessages(false);
    }
  }, [activeConversation, isCheckingMessages, notifications]);

  // Sistema controlado de detección de nuevos mensajes
  useEffect(() => {
    if (activeConversation && isOpen) {
      // Limpiar intervalo anterior
      if (messageCheckIntervalRef.current) {
        clearInterval(messageCheckIntervalRef.current);
      }

      // Configurar intervalo cada 15 segundos para verificar nuevos mensajes
      messageCheckIntervalRef.current = setInterval(checkForNewMessages, 15000);

      // Limpiar al desmontar o cambiar conversación
      return () => {
        if (messageCheckIntervalRef.current) {
          clearInterval(messageCheckIntervalRef.current);
          messageCheckIntervalRef.current = null;
        }
      };
    }

    return () => {
      if (messageCheckIntervalRef.current) {
        clearInterval(messageCheckIntervalRef.current);
        messageCheckIntervalRef.current = null;
      }
    };
  }, [activeConversation, isOpen, checkForNewMessages]);

  /**
   * Función de refresh memoizada
   */
  const handleRefresh = useCallback(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id_contacto);
    }
  }, [activeConversation, loadMessages]);

  /**
   * Iniciar nueva conversación
   */
  const handleNewConversation = useCallback(async (usuario) => {
    // Verificar si ya existe una conversación con este usuario
    const existingConversation = conversations.find(
      conv => conv.id_contacto === usuario.id
    );

    if (existingConversation) {
      // Seleccionar conversación existente
      setActiveConversation(existingConversation);
    } else {
      // Crear nueva conversación (simulada)
      const newConversation = {
        id_contacto: usuario.id,
        nombre_contacto: usuario.nombre || `${usuario.nombre} ${usuario.apellido}`,
        ultimo_mensaje: '',
        fecha_ultimo_mensaje: new Date().toISOString(),
        no_leidos: 0,
        avatar: usuario.avatar || null,
      };
      
      setActiveConversation(newConversation);
      setMessages([]);
    }
    
    setShowUserSearch(false);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  }, [conversations, isMobile]);

  /**
   * Renderizar contenido del sidebar (lista de conversaciones)
   */
  const renderSidebar = () => (
    <Box sx={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del sidebar */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Conversaciones
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Lista de conversaciones o búsqueda de usuarios */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {showUserSearch ? (
          <UserSearch
            onSelectUser={handleNewConversation}
            onBack={() => setShowUserSearch(false)}
          />
        ) : (
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
            onNewConversation={() => setShowUserSearch(true)}
            loading={loading}
          />
        )}
      </Box>
    </Box>
  );

  /**
   * Renderizar en modo modal
   */
  if (mode === 'modal') {
    return (
      <>
        {/* Botón flotante para abrir chat - DESACTIVADO: ya tenemos botón en header */}
        {/*
        {!isOpen && (
          <Fab
            color="primary"
            aria-label="chat"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
            onClick={() => onClose(true)}
          >
            <Badge badgeContent={totalUnreadCount || unreadCount} color="error" max={99}>
              <ChatIcon />
            </Badge>
          </Fab>
        )}
        */}

        {/* Modal del chat */}
        <Drawer
          anchor="right"
          open={isOpen}
          onClose={() => onClose(false)}
          variant="temporary"
          PaperProps={{
            sx: {
              width: isMobile ? '100%' : 800,
              maxWidth: '100%',
              height: '90vh',
              maxHeight: '700px',
            },
          }}
        >
          <Box sx={{ height: '100%', display: 'flex' }}>
            {/* Sidebar en desktop, drawer en mobile */}
            {isMobile ? (
              <>
                <Drawer
                  variant="temporary"
                  open={mobileDrawerOpen}
                  onClose={() => setMobileDrawerOpen(false)}
                  ModalProps={{ keepMounted: true }}
                  PaperProps={{ sx: { width: 280 } }}
                >
                  {renderSidebar()}
                </Drawer>
                
                {/* Contenido principal en mobile */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* App Bar en mobile */}
                  <AppBar position="static" elevation={0}>
                    <Toolbar>
                      <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setMobileDrawerOpen(true)}
                        sx={{ mr: 2 }}
                      >
                        <MenuIcon />
                      </IconButton>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {activeConversation?.nombre_contacto || 'Chat'}
                      </Typography>
                      <IconButton color="inherit" onClick={() => onClose(false)}>
                        <CloseIcon />
                      </IconButton>
                    </Toolbar>
                  </AppBar>
                  
                  {/* Ventana de chat */}
                  <Box sx={{ flex: 1 }}>
                    <ChatWindow
                      conversation={activeConversation}
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      onRefresh={handleRefresh}
                    />
                  </Box>
                </Box>
              </>
            ) : (
              <>
                {/* Sidebar en desktop */}
                <Paper sx={{ width: 320, height: '100%' }} elevation={0}>
                  {renderSidebar()}
                </Paper>
                
                <Divider orientation="vertical" flexItem />
                
                {/* Ventana de chat en desktop */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header del chat */}
                  <Box sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderBottom: 1,
                    borderColor: 'divider',
                    boxShadow: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{
                          fontWeight: 600,
                          color: 'white',
                          textShadow: theme.palette.mode === 'dark'
                            ? '0 1px 2px rgba(255,255,255,0.1)'
                            : '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                          {activeConversation?.nombre_contacto || 'Selecciona una conversación'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Botón refresh manual */}
                        <IconButton
                          onClick={handleRefresh}
                          sx={{ color: 'white', opacity: 0.8 }}
                          title="Actualizar mensajes"
                        >
                          <RefreshIcon />
                        </IconButton>

                        {/* Botón para controlar sonido */}
                        <IconButton
                          onClick={() => notifications.setAudioEnabled(!notifications.audioEnabled)}
                          sx={{ color: 'white', opacity: 0.8 }}
                          title={notifications.audioEnabled ? 'Silenciar notificaciones' : 'Activar sonido'}
                        >
                          {notifications.audioEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                        </IconButton>

                        <IconButton onClick={() => onClose(false)} sx={{ color: 'white' }}>
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Ventana de chat */}
                  <Box sx={{ flex: 1 }}>
                    <ChatWindow
                      conversation={activeConversation}
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      onRefresh={handleRefresh}
                    />
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Drawer>
      </>
    );
  }

  /**
   * Renderizar en modo embebido
   */
  return (
    <Paper sx={{ height: 600, display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Box sx={{ width: 320, borderRight: 1, borderColor: 'divider' }}>
        {renderSidebar()}
      </Box>
      
      {/* Ventana de chat */}
      <Box sx={{ flex: 1 }}>
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onRefresh={() => activeConversation && loadMessages(activeConversation.id_contacto)}
        />
      </Box>
    </Paper>
  );
};

export default ChatContainer;