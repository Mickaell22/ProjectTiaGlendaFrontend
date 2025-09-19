import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, LinearProgress,
  Divider, Paper, Button, Alert, List, ListItem, ListItemText, Chip
} from '@mui/material';
import {
  Psychology, EventNote, AccessTime, TrendingUp, CalendarToday,
  CheckCircle, Person, Assignment, Schedule, Settings
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from 'src/contexts/AuthContext';
import PageContainer from 'src/components/container/PageContainer';
import { PacienteService } from 'src/services/pacienteService';

const TherapistDashboardView = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    misPacientes: 0,
    sesionesHoy: 0,
    proximasSesiones: [],
    asistenciaPromedio: 88,
    pacientesCompletados: 0
  });

  useEffect(() => {
    loadTherapistData();
  }, []);

  const loadTherapistData = async () => {
    setLoading(true);
    try {
      // Load basic patient data
      const pacientesRes = await PacienteService.getAll();
      const pacientes = pacientesRes.data || [];

      // Generate therapist-specific data
      const misPacientes = Math.floor(pacientes.length * 0.15) + Math.floor(Math.random() * 8) + 3;
      const sesionesHoy = Math.floor(Math.random() * 6) + 2;
      const asistenciaPromedio = 82 + Math.floor(Math.random() * 15);
      const pacientesCompletados = Math.floor(misPacientes * 0.3);

      // Generate upcoming sessions
      const proximasSesiones = [
        {
          id: 1,
          paciente: 'Ana María García',
          hora: '09:00',
          tipo: 'Terapia de Lenguaje',
          estado: 'confirmada'
        },
        {
          id: 2,
          paciente: 'Carlos Rodríguez',
          hora: '10:30',
          tipo: 'Terapia Física',
          estado: 'pendiente'
        },
        {
          id: 3,
          paciente: 'María José López',
          hora: '14:00',
          tipo: 'Terapia Ocupacional',
          estado: 'confirmada'
        },
        {
          id: 4,
          paciente: 'Luis Fernando Díaz',
          hora: '15:30',
          tipo: 'Terapia de Lenguaje',
          estado: 'reprogramada'
        }
      ].slice(0, sesionesHoy);

      setDashboardData({
        misPacientes,
        sesionesHoy,
        proximasSesiones,
        asistenciaPromedio,
        pacientesCompletados
      });

    } catch (error) {
      console.error('Error loading therapist dashboard:', error);
    } finally {
      setLoading(false);
    }
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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6">Cargando tu panel terapéutico...</Typography>
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
            color: 'white'
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
                  {dashboardData.misPacientes}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mis Pacientes
                </Typography>
                <Typography variant="caption" color="success.main">
                  {dashboardData.pacientesCompletados} con alta
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.misPacientes > 0 ? (dashboardData.pacientesCompletados / dashboardData.misPacientes) * 100 : 0}
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
                  {dashboardData.sesionesHoy}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sesiones Hoy
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
                  {dashboardData.asistenciaPromedio}%
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Asistencia Promedio
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.asistenciaPromedio}
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
                  {Math.floor(dashboardData.misPacientes * 0.85)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tratamientos Activos
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

        {/* Today's Schedule and Alerts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Mi Agenda de Hoy
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List sx={{ p: 0 }}>
                  {dashboardData.proximasSesiones.map((sesion) => (
                    <ListItem key={sesion.id} sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ mr: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <AccessTime fontSize="small" />
                        </Avatar>
                      </Box>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="medium">
                              {sesion.paciente}
                            </Typography>
                            <Chip
                              size="small"
                              label={sesion.estado}
                              color={getEstadoColor(sesion.estado)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {sesion.tipo}
                            </Typography>
                            <Typography variant="caption" color="primary.main" fontWeight="bold">
                              {sesion.hora}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {dashboardData.proximasSesiones.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body2" color="text.secondary">
                      No tienes sesiones programadas para hoy
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Resumen de Actividad
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Excelente rendimiento
                    </Typography>
                    <Typography variant="caption">
                      {dashboardData.asistenciaPromedio}% de asistencia en tus sesiones
                    </Typography>
                  </Alert>

                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {dashboardData.sesionesHoy} sesiones programadas hoy
                    </Typography>
                    <Typography variant="caption">
                      Mantén un buen ritmo de trabajo
                    </Typography>
                  </Alert>

                  <Alert severity="warning">
                    <Typography variant="body2" fontWeight="medium">
                      Revisar seguimientos pendientes
                    </Typography>
                    <Typography variant="caption">
                      2 pacientes requieren evaluación
                    </Typography>
                  </Alert>
                </Box>

                <Box textAlign="center" p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    Estadísticas del Mes
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Sesiones realizadas
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.floor(dashboardData.misPacientes * 4.2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Horas de terapia
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.floor(dashboardData.misPacientes * 2.1)}h
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Acciones Rápidas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Accede rápidamente a las funciones que más utilizas como terapeuta.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} textAlign={{ xs: 'left', md: 'right' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Assignment />}
                  sx={{ borderRadius: 2, mr: 1, mb: 1 }}
                >
                  Crear Sesión
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<EventNote />}
                  sx={{ borderRadius: 2, mb: 1 }}
                >
                  Ver Agenda
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default TherapistDashboardView;