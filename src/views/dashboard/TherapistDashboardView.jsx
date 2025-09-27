import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, LinearProgress,
  Divider, Paper, Button, Alert, List, ListItem, ListItemText, Chip, CircularProgress
} from '@mui/material';
import {
  Psychology, EventNote, AccessTime, TrendingUp, CalendarToday,
  CheckCircle, Person, Assignment, Schedule, Settings, Refresh
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from 'src/contexts/AuthContext';
import PageContainer from 'src/components/container/PageContainer';
import { dashboardService } from 'src/services/dashboardService';
import { useNavigate } from 'react-router-dom';

const TherapistDashboardView = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTherapistData();
  }, []);

  const loadTherapistData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dashboardService.getTherapistDashboard();

      if (result && result.status === 'success') {
        setDashboardData(result.data);
      } else {
        throw new Error(result?.message || 'Error al cargar datos del terapeuta');
      }
    } catch (error) {
      console.error('Error loading therapist dashboard:', error);
      setError(error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadTherapistData();
  };

  const handleVerSesiones = () => {
    navigate('/terapeutico', { state: { initialTab: 0 } }); // Tab "Sesiones"
  };

  const handleVerCronogramas = () => {
    navigate('/terapeutico', { state: { initialTab: 1 } }); // Tab "Cronogramas"
  };

  const handleVerAsistencia = () => {
    navigate('/terapeutico', { state: { initialTab: 2 } }); // Tab "Asistencia"
  };

  const handleVerHoy = () => {
    navigate('/terapeutico', { state: { initialTab: 3 } }); // Tab "Hoy"
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'confirmada': return 'success';
      case 'pendiente': return 'warning';
      case 'reprogramada': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <PageContainer title="Mi Panel Terapéutico" description="Dashboard del terapeuta">
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px" gap={2}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Cargando tu panel terapéutico...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Mi Panel Terapéutico" description="Dashboard del terapeuta">
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Error al cargar tu dashboard
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRetry}
              sx={{ mt: 1 }}
            >
              Reintentar
            </Button>
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  if (!dashboardData) {
    return (
      <PageContainer title="Mi Panel Terapéutico" description="Dashboard del terapeuta">
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Alert severity="warning" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              No hay datos disponibles
            </Typography>
            <Typography variant="body2">
              No se pudieron cargar los datos de tu dashboard.
            </Typography>
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Mi Panel Terapéutico" description="Dashboard del terapeuta">
      <Box>
        {/* Welcome Header */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: theme.palette.getContrastText(theme.palette.primary.main)
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            ¡Hola, {user?.nombre || 'Terapeuta'}!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Tu Panel Terapéutico Personal
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Gestiona tus pacientes y sesiones de terapia de forma eficiente
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                📅 Hoy: {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                👥 {dashboardData?.mis_pacientes?.total || 0} pacientes asignados
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Main Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <Person fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {dashboardData.mis_pacientes?.total || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mis Pacientes
                </Typography>
                <Typography variant="caption" color="success.main">
                  {dashboardData.mis_pacientes?.dados_alta || 0} con alta
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.mis_pacientes?.total > 0 ? ((dashboardData.mis_pacientes?.dados_alta || 0) / dashboardData.mis_pacientes?.total) * 100 : 0}
                  color="primary"
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CalendarToday fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {dashboardData.sesiones?.hoy || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sesiones Hoy
                </Typography>
                <Typography variant="caption" color="primary.main">
                  {dashboardData.sesiones?.pendientes || 0} pendientes
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  color="success"
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <Psychology fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {dashboardData.estadisticas?.asistencia_promedio || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Asistencia Promedio
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.estadisticas?.asistencia_promedio || 0}
                  color="warning"
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'info.main', width: 56, height: 56 }}>
                  <CheckCircle fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {dashboardData.mis_pacientes?.activos || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tratamientos Activos
                </Typography>
                <Typography variant="caption" color="warning.main">
                  {dashboardData.estadisticas?.evaluaciones_pendientes || 0} evaluaciones pendientes
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={85}
                  color="info"
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Today's Schedule */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Mi Agenda de Hoy
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List sx={{ p: 0 }}>
                  {(dashboardData.agenda_hoy || []).map((sesion, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ mr: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <AccessTime fontSize="small" />
                        </Avatar>
                      </Box>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="medium">
                              {sesion.paciente_nombre || 'Paciente'}
                            </Typography>
                            <Chip
                              size="small"
                              label={sesion.estado || 'programada'}
                              color={getEstadoColor(sesion.estado || 'programada')}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {sesion.especialidad || 'Sesión de Terapia'}
                            </Typography>
                            <Typography variant="caption" color="primary.main" fontWeight="bold">
                              {sesion.hora_inicio || '--:--'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {(!dashboardData.agenda_hoy || dashboardData.agenda_hoy.length === 0) && (
                  <Box textAlign="center" py={4}>
                    <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'action.hover', width: 60, height: 60 }}>
                      <CalendarToday sx={{ fontSize: 30, color: 'text.secondary' }} />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Sin sesiones programadas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tu agenda está libre para hoy. Es un buen momento para revisar casos pendientes o contactar al administrador para nuevas asignaciones.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>

      </Box>
    </PageContainer>
  );
};

export default TherapistDashboardView;