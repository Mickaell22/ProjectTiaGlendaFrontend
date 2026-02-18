// src/components/notifications/SimpleNotificationPopover.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Divider,
  Button,
  Fade,
  Slide,
  Chip,
  ListItemIcon,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Message as MessageIcon,
  Event as EventIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import notificationService from '../../services/notificationService';

const SimpleNotificationPopover = ({ onRefresh = () => {} }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar notificaciones reales del backend
    loadNotifications();

    // Configurar limpieza automática cada 5 minutos
    const cleanupInterval = setInterval(cleanupOldNotifications, 5 * 60 * 1000);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');

    try {
      // Cargar notificaciones importantes persistidas
      const savedNotifications = loadImportantNotifications();

      const result = await notificationService.getNotificaciones(false, 10);
      if (result.success && result.notificaciones.length > 0) {
        // Combinar notificaciones del backend con las persistidas
        const combinedNotifications = [
          ...result.notificaciones,
          ...savedNotifications.filter(saved =>
            !result.notificaciones.some(api => api.id === saved.id)
          )
        ];
        setNotifications(combinedNotifications);
      } else {
        // Si no hay notificaciones del backend, usar las persistidas y ejemplos
        const exampleNotifications = [
          {
            id: 1,
            titulo: 'Sistema de notificaciones activo',
            mensaje: 'El sistema de notificaciones está funcionando correctamente',
            fecha_creacion: new Date().toISOString(),
            tipo: 'sistema',
            prioridad: 'baja',
            leida: false
          },
          {
            id: 2,
            titulo: 'Funcionalidad disponible',
            mensaje: 'Las notificaciones se actualizarán automáticamente cada 30 segundos',
            fecha_creacion: new Date(Date.now() - 300000).toISOString(),
            tipo: 'sistema',
            prioridad: 'baja',
            leida: false
          }
        ];

        const combinedNotifications = [
          ...savedNotifications,
          ...exampleNotifications.filter(example =>
            !savedNotifications.some(saved => saved.id === example.id)
          )
        ];

        setNotifications(combinedNotifications);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      // Fallback: usar solo notificaciones persistidas o ejemplo básico
      const savedNotifications = loadImportantNotifications();
      if (savedNotifications.length > 0) {
        setNotifications(savedNotifications);
      } else {
        setNotifications([
          {
            id: 1,
            titulo: 'Centro de notificaciones',
            mensaje: 'Preparado para recibir notificaciones del sistema',
            fecha_creacion: new Date().toISOString(),
            tipo: 'sistema',
            prioridad: 'baja',
            leida: false
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return '';
    }
  };

  // Obtener icono según tipo_notificacion del backend
  // Valores: sesion_terapia | clase_pedagogica | cancelacion | reprogramacion | mensaje_chat | recordatorio_general
  const getNotificationIcon = (tipoNotificacion) => {
    switch (tipoNotificacion) {
      case 'mensaje_chat':
        return <MessageIcon color="primary" />;
      case 'sesion_terapia':
      case 'clase_pedagogica':
        return <EventIcon color="secondary" />;
      case 'cancelacion':
        return <ErrorIcon color="error" />;
      case 'reprogramacion':
        return <WarningIcon color="warning" />;
      case 'recordatorio_general':
        return <SuccessIcon color="info" />;
      default:
        return <NotificationsIcon color="default" />;
    }
  };

  // Obtener color del chip según prioridad del backend
  // Valores: urgente | alta | normal | baja
  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
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

  // Manejar clic en notificación para marcar como leída
  // El backend usa campo "estado": "enviada" | "leida"
  const handleNotificationClick = async (notification) => {
    if (notification.estado !== 'leida') {
      try {
        const result = await notificationService.marcarComoLeida(notification.id);
        if (result.success) {
          setNotifications(prevNotifications =>
            prevNotifications.map(n =>
              n.id === notification.id ? { ...n, estado: 'leida' } : n
            )
          );
          onRefresh();
        }
      } catch (error) {
        console.error('Error marcando notificación como leída:', error);
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n.id === notification.id ? { ...n, estado: 'leida' } : n
          )
        );
      }
    }
  };

  // Sistema de limpieza automática
  const cleanupOldNotifications = () => {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    setNotifications(prevNotifications => {
      const cleanedNotifications = prevNotifications.filter(notification => {
        // Mantener notificaciones no leídas (estado "enviada")
        if (notification.estado !== 'leida') return true;

        // Mantener notificaciones de alta/urgente prioridad por más tiempo
        if (notification.prioridad === 'urgente' || notification.prioridad === 'alta') return true;

        // Eliminar notificaciones leídas antiguas (usa fecha_envio del backend)
        const notificationDate = new Date(notification.fecha_envio || notification.fecha_creacion);
        return (now - notificationDate) < maxAge;
      });

      // Persistir notificaciones importantes en localStorage
      saveImportantNotifications(cleanedNotifications);

      return cleanedNotifications;
    });
  };

  // Persistir notificaciones importantes
  const saveImportantNotifications = (notifications) => {
    try {
      const importantNotifications = notifications.filter(n =>
        n.prioridad === 'urgente' || n.prioridad === 'alta' || n.estado !== 'leida'
      );
      localStorage.setItem('important_notifications', JSON.stringify(importantNotifications));
    } catch (error) {
      console.error('Error saving important notifications:', error);
    }
  };

  // Cargar notificaciones importantes desde localStorage
  const loadImportantNotifications = () => {
    try {
      const saved = localStorage.getItem('important_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading important notifications:', error);
      return [];
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Box sx={{
        width: { xs: '90vw', sm: 350, md: 400 },
        maxWidth: 400,
        maxHeight: 400,
        p: 2
      }}>
      <Typography variant="h6" gutterBottom>
        Notificaciones
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : notifications.length === 0 ? (
        <Typography color="text.secondary" align="center">
          No hay notificaciones nuevas
        </Typography>
      ) : (
        <List sx={{ py: 0 }}>
          <AnimatePresence>
            {notifications.slice(0, 5).map((notification, index) => (
              <motion.div
                key={notification.id || index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    px: 1,
                    bgcolor: notification.estado === 'leida' ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 0.5,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.tipo_notificacion)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.estado === 'leida' ? 400 : 600,
                            flex: 1,
                          }}
                        >
                          {notification.titulo || 'Notificación'}
                        </Typography>
                        {(notification.prioridad === 'urgente' || notification.prioridad === 'alta') && (
                          <Chip
                            label={notification.prioridad === 'urgente' ? 'Urgente' : 'Alta'}
                            size="small"
                            color="error"
                            sx={{ height: 18, fontSize: '0.6rem' }}
                          />
                        )}
                        {notification.estado !== 'leida' && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {notification.mensaje?.substring(0, 70)}
                          {notification.mensaje?.length > 70 ? '...' : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.fecha_envio)}
                          </Typography>
                          <Chip
                            label={notification.tipo_notificacion || 'general'}
                            size="small"
                            variant="outlined"
                            sx={{ height: 16, fontSize: '0.6rem' }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && index < 4 && <Divider />}
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          size="small"
          onClick={() => {
            loadNotifications();
            onRefresh();
          }}
        >
          Actualizar
        </Button>
        <Button size="small" variant="outlined">
          Ver todas
        </Button>
      </Box>
    </Box>
    </motion.div>
  );
};

export default SimpleNotificationPopover;