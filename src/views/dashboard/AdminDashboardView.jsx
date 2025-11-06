import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, LinearProgress,
  Divider, Paper, Button, Alert, useTheme, CircularProgress, Skeleton
} from '@mui/material';
import {
  Dashboard as DashboardIcon, TrendingUp, Group, EventNote, School,
  Psychology, Assignment, CalendarToday, CheckCircle, Warning,
  Settings, Refresh, BarChart, PieChart
} from '@mui/icons-material';
import { useAuth } from 'src/contexts/AuthContext';
import { useDispatch } from 'react-redux';
import { toggleCustomizer } from 'src/store/customizer/CustomizerSlice';
import PageContainer from 'src/components/container/PageContainer';
import { dashboardService } from 'src/services/dashboardService';

const AdminDashboardView = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dashboardService.getAdminDashboard();

      if (result && result.status === 'success') {
        setDashboardData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result?.message || 'Error al cargar datos del dashboard');
      }
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      setError(error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <PageContainer title="Panel Administrativo" description="Dashboard administrativo">
        <Box>
          {/* Header Skeleton */}
          <Paper elevation={4} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Skeleton variant="text" width="60%" height={50} />
            <Skeleton variant="text" width="80%" height={30} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="50%" height={25} sx={{ mt: 1 }} />
          </Paper>

          {/* Stats Cards Skeleton */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid size={{ xs: 12, md: 3 }} key={item}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Skeleton variant="circular" width={56} height={56} sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="text" width="60%" height={40} sx={{ mx: 'auto' }} />
                    <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto' }} />
                    <Skeleton variant="text" width="50%" height={15} sx={{ mx: 'auto', mt: 1 }} />
                    <Skeleton variant="rectangular" width="100%" height={10} sx={{ mt: 1, borderRadius: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Staff Overview Skeleton */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={12}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4].map((item) => (
                      <Grid size={6} key={item}>
                        <Box textAlign="center" p={2}>
                          <Skeleton variant="circular" width={64} height={64} sx={{ mx: 'auto', mb: 1 }} />
                          <Skeleton variant="text" width="50%" height={30} sx={{ mx: 'auto' }} />
                          <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto' }} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Panel Administrativo" description="Dashboard administrativo">
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Error al cargar el dashboard
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
      <PageContainer title="Panel Administrativo" description="Dashboard administrativo">
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Alert severity="warning" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              No hay datos disponibles
            </Typography>
            <Typography variant="body2">
              No se pudieron cargar los datos del dashboard.
            </Typography>
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Panel Administrativo" description="Dashboard administrativo">
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
            ¡Bienvenido, {user?.nombre || 'Administrador'}!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Panel de Control Administrativo - Centro Tía Glenda
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Aquí tienes un resumen de la actividad del centro médico
          </Typography>
          {lastUpdated && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Última actualización: {lastUpdated.toLocaleTimeString()}
              </Typography>
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={handleRetry}
                sx={{ color: theme.palette.getContrastText(theme.palette.primary.main), borderColor: theme.palette.action.selected }}
                variant="outlined"
              >
                Actualizar
              </Button>
            </Box>
          )}
        </Paper>

        {/* Data Status Notice */}
        {dashboardData && Object.values(dashboardData).every(section =>
          !section || Object.values(section).every(value =>
            value === 0 || value === null || value === undefined ||
            (typeof value === 'object' && Object.values(value).every(v => v === 0))
          )
        ) && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              Configuración inicial del sistema
            </Typography>
            <Typography variant="body2">
              Los datos del dashboard se actualizarán una vez que se registren usuarios, pacientes y se programen sesiones en el sistema.
              El backend está funcionando correctamente, pero aún no hay información para mostrar.
            </Typography>
          </Alert>
        )}

        {/* Main Statistics Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: '100%', backgroundColor: theme.palette.background.paper }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: theme.palette.background.paper, width: 56, height: 56 }}>
                  <Group sx={{ color: theme.palette.primary.main }} fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color={theme.palette.text.primary}>
                  {dashboardData.usuarios?.total || 0}
                </Typography>
                <Typography variant="body2" color={theme.palette.text.secondary} gutterBottom>
                  Total Usuarios
                </Typography>
                <Typography variant="caption" color={theme.palette.primary.main}>
                  {dashboardData.usuarios?.activos || 0} activos
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.usuarios?.total > 0 ? (dashboardData.usuarios?.activos / dashboardData.usuarios?.total) * 100 : 0}
                  color="primary"
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: '100%', backgroundColor: theme.palette.background.paper }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: theme.palette.background.paper, width: 56, height: 56 }}>
                  <EventNote sx={{ color: theme.palette.primary.main }} fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color={theme.palette.text.primary}>
                  {dashboardData.pacientes?.total || 0}
                </Typography>
                <Typography variant="body2" color={theme.palette.text.secondary} gutterBottom>
                  Pacientes Registrados
                </Typography>
                <Typography variant="caption" color={theme.palette.primary.main}>
                  {dashboardData.pacientes?.nuevos_este_mes || 0} nuevos este mes
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.pacientes?.total > 0
                    ? Math.min(((dashboardData.pacientes?.activos || 0) / dashboardData.pacientes.total) * 100, 100)
                    : 0}
                  color="primary"
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: '100%', backgroundColor: theme.palette.background.paper }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: theme.palette.background.paper, width: 56, height: 56 }}>
                  <CalendarToday sx={{ color: theme.palette.primary.main }} fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color={theme.palette.text.primary}>
                  {dashboardData.sesiones?.hoy || 0}
                </Typography>
                <Typography variant="body2" color={theme.palette.text.secondary} gutterBottom>
                  Sesiones Hoy
                </Typography>
                <Typography variant="caption" color={theme.palette.primary.main}>
                  {dashboardData.sesiones?.esta_semana || 0} esta semana
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.sesiones?.esta_semana > 0 && dashboardData.sesiones?.hoy >= 0
                    ? Math.min(((dashboardData.sesiones.hoy / Math.max(dashboardData.sesiones.esta_semana / 5, 1)) * 100), 100)
                    : 0}
                  color="primary"
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: '100%', backgroundColor: theme.palette.background.paper }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: theme.palette.background.paper, width: 56, height: 56 }}>
                  <TrendingUp sx={{ color: theme.palette.primary.main }} fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color={theme.palette.text.primary}>
                  {dashboardData.estadisticas?.asistencia_promedio || 0}%
                </Typography>
                <Box sx={{ mb: 2 }} />
                <Typography variant="caption" color={theme.palette.primary.main}>
                  Asistencia Promedio
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.estadisticas?.asistencia_promedio || 0}
                  color="primary"
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Staff and Specialties Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Personal del Centro
                  </Typography>
                  <BarChart color="primary" />
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid size={6}>
                      <Box textAlign="center" p={2} sx={{ bgcolor: theme.palette.background.paper, borderRadius: 2 }}>
                        <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: theme.palette.background.paper, width: 64, height: 64 }}>
                          <Psychology sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main, fontSize: 48 }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold" color={theme.palette.text.primary}>
                          {dashboardData.personal?.terapeutas || 0}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary}>
                          Terapeutas
                        </Typography>
                      </Box>
                  </Grid>

                  <Grid size={6}>
                      <Box textAlign="center" p={2} sx={{ bgcolor: theme.palette.background.paper, borderRadius: 2 }}>
                        <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: theme.palette.background.paper, width: 64, height: 64 }}>
                          <School sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main, fontSize: 48 }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold" color={theme.palette.text.primary}>
                          {dashboardData.personal?.pedagogos || 0}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary}>
                          Pedagogos
                        </Typography>
                      </Box>
                  </Grid>

                  <Grid size={6}>
                      <Box textAlign="center" p={2} sx={{ bgcolor: theme.palette.background.paper, borderRadius: 2 }}>
                        <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: theme.palette.background.paper, width: 64, height: 64 }}>
                          <Assignment sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main, fontSize: 48 }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold" color={theme.palette.text.primary}>
                          {dashboardData.especialidades?.total || 0}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary}>
                          Especialidades
                        </Typography>
                      </Box>
                  </Grid>

                  <Grid size={6}>
                      <Box textAlign="center" p={2} sx={{ bgcolor: theme.palette.background.paper, borderRadius: 2 }}>
                        <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: theme.palette.background.paper, width: 64, height: 64 }}>
                          <Group sx={{ color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main, fontSize: 48 }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold" color={theme.palette.text.primary}>
                          {dashboardData.personal?.total || 0}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary}>
                          Total Personal
                        </Typography>
                      </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

        </Grid>

        {/* Quick Actions */}
        <Card sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h6" fontWeight="bold" color={theme.palette.primary.main} gutterBottom>
                  Personalizar Interfaz
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ajusta temas, colores y configuraciones según tus preferencias.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} textAlign={{ xs: 'left', md: 'right' }}>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  startIcon={<Settings />}
                  onClick={() => dispatch(toggleCustomizer())}
                  sx={{ borderRadius: 2, bgcolor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), '&:hover': { bgcolor: theme.palette.primary.dark } }}
                >
                  Abrir Configuración
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default AdminDashboardView;