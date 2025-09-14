// src/views/chat/ChatTestPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Componentes de chat y notificaciones
import ChatContainer from '../../components/chat/ChatContainer';
import NotificationCenter from '../../components/notifications/NotificationCenter';

// Servicios
import chatService from '../../services/chatService';
import notificationService from '../../services/notificationService';

const ChatTestPage = () => {
  // Estados principales
  const [chatOpen, setChatOpen] = useState(false);
  const [testResults, setTestResults] = useState({
    apiConnection: 'pending',
    chatService: 'pending',
    notificationService: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    runInitialTests();
  }, []);

  /**
   * Ejecutar pruebas iniciales de conectividad
   */
  const runInitialTests = async () => {
    setLoading(true);
    const results = { ...testResults };

    try {
      // Test 1: Verificar conexión con API
      try {
        const response = await fetch('/api/test');
        if (response.ok) {
          results.apiConnection = 'success';
        } else {
          results.apiConnection = 'error';
        }
      } catch (error) {
        results.apiConnection = 'error';
      }

      // Test 2: Verificar servicio de chat
      try {
        const chatResult = await chatService.getConversaciones();
        results.chatService = chatResult.success ? 'success' : 'error';
      } catch (error) {
        results.chatService = 'error';
      }

      // Test 3: Verificar servicio de notificaciones
      try {
        const notifResult = await notificationService.getNotificaciones();
        results.notificationService = notifResult.success ? 'success' : 'error';
      } catch (error) {
        results.notificationService = 'error';
      }

    } catch (error) {
      console.error('Error en pruebas iniciales:', error);
      setError('Error ejecutando pruebas de conectividad');
    }

    setTestResults(results);
    setLoading(false);
  };

  /**
   * Obtener color del chip según el estado
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  /**
   * Obtener texto del estado
   */
  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Conectado';
      case 'error':
        return 'Error';
      case 'pending':
        return 'Verificando...';
      default:
        return 'Desconocido';
    }
  };

  /**
   * Obtener icono del estado
   */
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'pending':
        return <CircularProgress size={20} />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sistema de Chat y Notificaciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Panel de pruebas para el sistema de comunicación interna
        </Typography>
      </Box>

      {/* Error general */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Panel de Estado del Sistema */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado del Sistema
              </Typography>
              
              <Stack spacing={2}>
                {/* Estado API */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    Conexión API Backend
                  </Typography>
                  <Chip
                    icon={getStatusIcon(testResults.apiConnection)}
                    label={getStatusText(testResults.apiConnection)}
                    color={getStatusColor(testResults.apiConnection)}
                    size="small"
                  />
                </Box>

                <Divider />

                {/* Estado Chat */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    Servicio de Chat
                  </Typography>
                  <Chip
                    icon={getStatusIcon(testResults.chatService)}
                    label={getStatusText(testResults.chatService)}
                    color={getStatusColor(testResults.chatService)}
                    size="small"
                  />
                </Box>

                <Divider />

                {/* Estado Notificaciones */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    Servicio de Notificaciones
                  </Typography>
                  <Chip
                    icon={getStatusIcon(testResults.notificationService)}
                    label={getStatusText(testResults.notificationService)}
                    color={getStatusColor(testResults.notificationService)}
                    size="small"
                  />
                </Box>
              </Stack>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={runInitialTests}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                {loading ? 'Verificando...' : 'Verificar Estado'}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Panel de Pruebas de Chat */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pruebas de Chat
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Prueba el sistema de chat interno con otros usuarios del sistema.
              </Typography>

              <Stack spacing={2}>
                <Alert severity="info">
                  <Typography variant="body2">
                    • El chat se abre desde el header (icono de chat)
                    <br />
                    • También puedes usar el botón de abajo para probarlo
                    <br />
                    • Los mensajes se sincronizan en tiempo real
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<ChatIcon />}
                onClick={() => setChatOpen(true)}
                disabled={testResults.chatService === 'error'}
              >
                Abrir Chat
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Panel de Pruebas de Notificaciones */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pruebas de Notificaciones
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                El centro de notificaciones se encuentra en la esquina superior derecha.
              </Typography>

              <Stack spacing={2}>
                <Alert severity="info">
                  <Typography variant="body2">
                    • Las notificaciones aparecen automáticamente
                    <br />
                    • Se actualizan cada 30 segundos
                    <br />
                    • Puedes activar notificaciones del navegador
                    <br />
                    • Configuración personalizable por usuario
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                startIcon={<NotificationsIcon />}
                disabled={testResults.notificationService === 'error'}
                onClick={() => {
                  // Aquí podrías disparar una notificación de prueba
                  alert('¡Mira el centro de notificaciones en la esquina superior derecha!');
                }}
              >
                Ver Notificaciones
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Información adicional */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información del Sistema
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    APIs Disponibles:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • GET /api/chat/conversaciones
                    <br />
                    • GET /api/chat/mensajes/[id]
                    <br />
                    • POST /api/chat/enviar
                    <br />
                    • GET /api/notificaciones
                    <br />
                    • PUT /api/notificaciones/[id]/leer
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Características:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Chat interno entre usuarios
                    <br />
                    • Notificaciones push personalizables
                    <br />
                    • Interfaz responsive
                    <br />
                    • Integración con sistema de autenticación
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chat Modal */}
      <ChatContainer 
        isOpen={chatOpen}
        onClose={setChatOpen}
        mode="modal"
      />
    </Box>
  );
};

export default ChatTestPage;