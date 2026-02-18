import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, LinearProgress,
  Divider, Paper, Button, Alert, List, ListItem, ListItemText, Chip, Skeleton
} from '@mui/material';
import {
  School, MenuBook, AccessTime, CalendarToday,
  Person, Class, Refresh
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from 'src/contexts/AuthContext';
import PageContainer from 'src/components/container/PageContainer';
import { dashboardService } from 'src/services/dashboardService';

const PedagogueDashboardView = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPedagogueData();
  }, []);

  const loadPedagogueData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dashboardService.getPedagogueDashboard();

      if (result && result.status === 'success') {
        setDashboardData(result.data);
      } else {
        throw new Error(result?.message || 'Error al cargar datos del pedagogo');
      }
    } catch (error) {
      console.error('Error loading pedagogue dashboard:', error);
      setError(error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadPedagogueData();
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Paper elevation={4} sx={{ p: 4, mb: 4, borderRadius: 3, maxWidth: 900, width: '100%' }}>
            <Skeleton variant="text" width="50%" height={50} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width="70%" height={30} sx={{ mt: 1, mx: 'auto' }} />
          </Paper>

          <Grid container spacing={2} sx={{ mb: 4, maxWidth: 1000, mx: 'auto', justifyContent: 'center' }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="center" key={item}>
                <Card sx={{ height: 200, width: 200 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                      <Skeleton variant="circular" width={56} height={56} sx={{ mb: 2 }} />
                      <Skeleton variant="text" width="60%" height={40} />
                      <Skeleton variant="text" width="80%" height={20} />
                      <Skeleton variant="rectangular" width="100%" height={10} sx={{ mt: 1, borderRadius: 1 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4, maxWidth: 900, mx: 'auto', justifyContent: 'center' }}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ borderRadius: 3, p: 3, width: '100%', maxWidth: 900 }}>
                <CardContent>
                  <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2, mx: 'auto' }} />
                  {[1, 2, 3, 4].map((item) => (
                    <Box key={item} sx={{ mb: 2 }}>
                      <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
                    </Box>
                  ))}
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Mi Panel Pedagógico" description="Dashboard del pedagogo">
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
      <PageContainer title="Mi Panel Pedagógico" description="Dashboard del pedagogo">
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

  const totalEstudiantes = dashboardData.mis_estudiantes?.total || 0;
  const activosEstudiantes = dashboardData.mis_estudiantes?.activos || 0;
  const asistenciaPromedio = dashboardData.estadisticas?.asistencia_promedio || 0;

  return (
    <PageContainer title="Mi Panel Pedagógico" description="Dashboard del pedagogo">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Welcome Header */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            maxWidth: 900,
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
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
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              📅 Hoy: {new Date().toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              🎓 {totalEstudiantes} estudiantes asignados
            </Typography>
          </Box>
        </Paper>

        {/* Main Statistics */}
        <Grid container spacing={2} sx={{ mb: 4, maxWidth: 1000, mx: 'auto', justifyContent: 'center' }}>
          <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="center">
            <Card sx={{ height: 200, width: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', mx: 1, my: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <Avatar sx={{ mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <Person fontSize="large" />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>
                    {totalEstudiantes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Mis Estudiantes
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    {dashboardData.mis_estudiantes?.graduados || 0} graduados
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={totalEstudiantes > 0 ? ((dashboardData.mis_estudiantes?.graduados || 0) / totalEstudiantes) * 100 : 0}
                    color="primary"
                    sx={{ mt: 1, borderRadius: 1, width: '100%' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="center">
            <Card sx={{ height: 200, width: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', mx: 1, my: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <Avatar sx={{ mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <Class fontSize="large" />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>
                    {dashboardData.clases?.hoy || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Clases Hoy
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    {dashboardData.clases?.esta_semana || 0} esta semana
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardData.clases?.esta_semana > 0
                      ? Math.min(((dashboardData.clases.hoy / Math.max(dashboardData.clases.esta_semana / 5, 1)) * 100), 100)
                      : 0}
                    color="primary"
                    sx={{ mt: 1, borderRadius: 1, width: '100%' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="center">
            <Card sx={{ height: 200, width: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', mx: 1, my: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <Avatar sx={{ mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <School fontSize="large" />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>
                    {asistenciaPromedio}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Asistencia Promedio
                  </Typography>
                  <Box my={1} />
                  <LinearProgress
                    variant="determinate"
                    value={asistenciaPromedio}
                    color="primary"
                    sx={{ mt: 1, borderRadius: 1, width: '100%' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3} display="flex" justifyContent="center">
            <Card sx={{ height: 200, width: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', mx: 1, my: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <Avatar sx={{ mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <MenuBook fontSize="large" />
                  </Avatar>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}>
                    {activosEstudiantes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Estudiantes Activos
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    {dashboardData.estadisticas?.evaluaciones_pendientes || 0} Eval. pendientes
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={activosEstudiantes > 0
                      ? Math.min(((activosEstudiantes - (dashboardData.estadisticas?.evaluaciones_pendientes || 0)) / activosEstudiantes) * 100, 100)
                      : 0}
                    color="primary"
                    sx={{ mt: 1, borderRadius: 1, width: '100%' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Student Summary Progress Bars */}
        <Card sx={{ maxWidth: 900, width: '100%', mx: 'auto', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Resumen de Estudiantes
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2">
                  Estudiantes activos
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {activosEstudiantes} / {totalEstudiantes}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalEstudiantes > 0 ? Math.min((activosEstudiantes / totalEstudiantes) * 100, 100) : 0}
                color="success"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2">
                  Asistencia promedio
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {asistenciaPromedio}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={asistenciaPromedio}
                color="primary"
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card sx={{ maxWidth: 900, width: '100%', mx: 'auto', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom align="center">
              Mi Horario de Clases Hoy
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List sx={{ p: 0 }}>
              {(dashboardData.horario_hoy || []).map((clase, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      <AccessTime fontSize="small" />
                    </Avatar>
                  </Box>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                        <Typography variant="body1" fontWeight="medium">
                          {clase.materia || 'Clase Pedagógica'}
                        </Typography>
                        <Chip
                          size="small"
                          label={(clase.estado || 'programada').replace('_', ' ')}
                          color={getEstadoColor(clase.estado || 'programada')}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                        <Typography variant="body2" color="text.secondary">
                          {clase.total_estudiantes || 0} estudiantes{clase.observaciones ? ` • ${clase.observaciones}` : ''}
                        </Typography>
                        <Typography variant="caption" color="primary.main" fontWeight="bold">
                          {clase.hora_inicio || '--:--'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {(!dashboardData.horario_hoy || dashboardData.horario_hoy.length === 0) && (
              <Box textAlign="center" py={4}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'action.hover', width: 60, height: 60 }}>
                  <CalendarToday sx={{ fontSize: 30, color: 'text.secondary' }} />
                </Avatar>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sin clases programadas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tu horario está libre para hoy. Es un buen momento para revisar material educativo o coordinar con el administrador para nuevas asignaciones.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

      </Box>
    </PageContainer>
  );
};

export default PedagogueDashboardView;
