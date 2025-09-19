import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, LinearProgress,
  Divider, Paper, Button, Alert, List, ListItem, ListItemText, Chip
} from '@mui/material';
import {
  School, MenuBook, AccessTime, TrendingUp, CalendarToday,
  CheckCircle, Person, Assignment, Class, Settings
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from 'src/contexts/AuthContext';
import PageContainer from 'src/components/container/PageContainer';
import { PacienteService } from 'src/services/pacienteService';

const PedagogueDashboardView = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    misEstudiantes: 0,
    clasesHoy: 0,
    proximasClases: [],
    asistenciaPromedio: 92,
    estudiantesGraduados: 0
  });

  useEffect(() => {
    loadPedagogueData();
  }, []);

  const loadPedagogueData = async () => {
    setLoading(true);
    try {
      // Load basic patient data (students)
      const pacientesRes = await PacienteService.getAll();
      const pacientes = pacientesRes.data || [];

      // Generate pedagogue-specific data
      const misEstudiantes = Math.floor(pacientes.length * 0.2) + Math.floor(Math.random() * 12) + 5;
      const clasesHoy = Math.floor(Math.random() * 5) + 2;
      const asistenciaPromedio = 88 + Math.floor(Math.random() * 10);
      const estudiantesGraduados = Math.floor(misEstudiantes * 0.25);

      // Generate upcoming classes
      const proximasClases = [
        {
          id: 1,
          clase: 'Matemáticas Básicas',
          hora: '08:30',
          estudiantes: 8,
          aula: 'Aula 101',
          estado: 'programada'
        },
        {
          id: 2,
          clase: 'Lectoescritura',
          hora: '10:00',
          estudiantes: 6,
          aula: 'Aula 102',
          estado: 'en_curso'
        },
        {
          id: 3,
          clase: 'Ciencias Naturales',
          hora: '13:30',
          estudiantes: 10,
          aula: 'Lab. Ciencias',
          estado: 'programada'
        },
        {
          id: 4,
          clase: 'Arte y Creatividad',
          hora: '15:00',
          estudiantes: 12,
          aula: 'Taller Arte',
          estado: 'pendiente'
        }
      ].slice(0, clasesHoy);

      setDashboardData({
        misEstudiantes,
        clasesHoy,
        proximasClases,
        asistenciaPromedio,
        estudiantesGraduados
      });

    } catch (error) {
      console.error('Error loading pedagogue dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programada': return 'success';
      case 'en_curso': return 'primary';
      case 'pendiente': return 'warning';
      case 'completada': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <PageContainer title="Mi Panel Pedagógico" description="Dashboard del pedagogo">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6">Cargando tu panel pedagógico...</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Mi Panel Pedagógico" description="Dashboard del pedagogo">
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
            ¡Hola, {user?.nombre || 'Pedagogo'}!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Tu Panel Pedagógico Personal
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Gestiona tus estudiantes y clases académicas de manera efectiva
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
                  {dashboardData.misEstudiantes}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mis Estudiantes
                </Typography>
                <Typography variant="caption" color="success.main">
                  {dashboardData.estudiantesGraduados} graduados
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.misEstudiantes > 0 ? (dashboardData.estudiantesGraduados / dashboardData.misEstudiantes) * 100 : 0}
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
                  <Class fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {dashboardData.clasesHoy}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Clases Hoy
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={80}
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
                  <School fontSize="large" />
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
                  <MenuBook fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {Math.floor(dashboardData.misEstudiantes * 0.9)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Cursos Activos
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={90}
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
                  Mi Horario de Clases Hoy
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List sx={{ p: 0 }}>
                  {dashboardData.proximasClases.map((clase) => (
                    <ListItem key={clase.id} sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ mr: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <AccessTime fontSize="small" />
                        </Avatar>
                      </Box>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="medium">
                              {clase.clase}
                            </Typography>
                            <Chip
                              size="small"
                              label={clase.estado.replace('_', ' ')}
                              color={getEstadoColor(clase.estado)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {clase.estudiantes} estudiantes • {clase.aula}
                            </Typography>
                            <Typography variant="caption" color="primary.main" fontWeight="bold">
                              {clase.hora}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {dashboardData.proximasClases.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body2" color="text.secondary">
                      No tienes clases programadas para hoy
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
                  Resumen Académico
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Excelente participación
                    </Typography>
                    <Typography variant="caption">
                      {dashboardData.asistenciaPromedio}% de asistencia en tus clases
                    </Typography>
                  </Alert>

                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {dashboardData.clasesHoy} clases programadas hoy
                    </Typography>
                    <Typography variant="caption">
                      Buen nivel de actividad académica
                    </Typography>
                  </Alert>

                  <Alert severity="warning">
                    <Typography variant="body2" fontWeight="medium">
                      Revisar evaluaciones pendientes
                    </Typography>
                    <Typography variant="caption">
                      3 estudiantes necesitan retroalimentación
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
                        Clases impartidas
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.floor(dashboardData.misEstudiantes * 3.8)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Horas académicas
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.floor(dashboardData.misEstudiantes * 1.9)}h
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
                  Acciones Pedagógicas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Herramientas esenciales para tu labor como educador especializado.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} textAlign={{ xs: 'left', md: 'right' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Assignment />}
                  sx={{ borderRadius: 2, mr: 1, mb: 1 }}
                >
                  Nueva Clase
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CalendarToday />}
                  sx={{ borderRadius: 2, mb: 1 }}
                >
                  Ver Horario
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default PedagogueDashboardView;