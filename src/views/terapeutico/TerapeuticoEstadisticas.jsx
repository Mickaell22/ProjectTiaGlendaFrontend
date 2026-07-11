// src/views/terapeutico/TerapeuticoEstadisticas.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Container, Paper, Snackbar, Typography, Alert,
  Grid, Chip, LinearProgress, Divider, IconButton, Tooltip
} from '@mui/material';
import {
  BarChart, TrendingUp, Psychology, CheckCircle, Schedule, Cancel,
  AccessTime, AttachMoney, EventAvailable, Group, Person, Refresh,
  CalendarMonth, Timer, Assessment
} from '@mui/icons-material';
import { useUserRole } from 'src/hooks/useUserRole';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

const TerapeuticoEstadisticas = () => {
  const { isAdmin } = useUserRole();
  const [estadisticas, setEstadisticas] = useState({
    sesiones: {
      total: 0,
      activas: 0,
      completadas: 0,
      suspendidas: 0,
      canceladas: 0
    },
    cronograma: {
      total_programadas: 0,
      realizadas: 0,
      pendientes: 0,
      canceladas: 0,
      reprogramadas: 0
    },
    financiero: {
      ingresos_totales: 0,
      sesiones_contratadas: 0
    },
    operacional: {
      duracion_promedio_minutos: 0,
      porcentaje_cumplimiento: 0
    }
  });
  const [_loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    setLoading(true);
    try {
      const response = await sesionTerapiaService.getEstadisticas();
      setEstadisticas(response.data || {});
    } catch (err) {
      console.error('Error fetching statistics:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-EC').format(number || 0);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'primary', progress }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" color={`${color}.main`}>
            {title}
          </Typography>
          {React.cloneElement(icon, { sx: { color: `${color}.main` } })}
        </Box>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {progress !== undefined && (
          <Box mt={2}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={getProgressColor(progress)}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" mt={1}>
              {progress.toFixed(1)}% de cumplimiento
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const ProgressSection = ({ title, items, icon }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" fontWeight="bold" ml={1}>
            {title}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid key={index} size={{ xs: 12 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  {item.label}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatNumber(item.value)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={item.percentage || 0}
                color={item.color || 'primary'}
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary">
                {(item.percentage || 0).toFixed(1)}%
              </Typography>
              {index < items.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const sesionesItems = [
    {
      label: 'Activas',
      value: estadisticas.sesiones?.activas || 0,
      percentage: estadisticas.sesiones?.total > 0 ? 
        (estadisticas.sesiones.activas / estadisticas.sesiones.total) * 100 : 0,
      color: 'success'
    },
    {
      label: 'Completadas',
      value: estadisticas.sesiones?.completadas || 0,
      percentage: estadisticas.sesiones?.total > 0 ? 
        (estadisticas.sesiones.completadas / estadisticas.sesiones.total) * 100 : 0,
      color: 'info'
    },
    {
      label: 'Suspendidas',
      value: estadisticas.sesiones?.suspendidas || 0,
      percentage: estadisticas.sesiones?.total > 0 ? 
        (estadisticas.sesiones.suspendidas / estadisticas.sesiones.total) * 100 : 0,
      color: 'warning'
    },
    {
      label: 'Canceladas',
      value: estadisticas.sesiones?.canceladas || 0,
      percentage: estadisticas.sesiones?.total > 0 ? 
        (estadisticas.sesiones.canceladas / estadisticas.sesiones.total) * 100 : 0,
      color: 'error'
    }
  ];

  const cronogramaItems = [
    {
      label: 'Realizadas',
      value: estadisticas.cronograma?.realizadas || 0,
      percentage: estadisticas.cronograma?.total_programadas > 0 ? 
        (estadisticas.cronograma.realizadas / estadisticas.cronograma.total_programadas) * 100 : 0,
      color: 'success'
    },
    {
      label: 'Pendientes',
      value: estadisticas.cronograma?.pendientes || 0,
      percentage: estadisticas.cronograma?.total_programadas > 0 ? 
        (estadisticas.cronograma.pendientes / estadisticas.cronograma.total_programadas) * 100 : 0,
      color: 'info'
    },
    {
      label: 'Reprogramadas',
      value: estadisticas.cronograma?.reprogramadas || 0,
      percentage: estadisticas.cronograma?.total_programadas > 0 ? 
        (estadisticas.cronograma.reprogramadas / estadisticas.cronograma.total_programadas) * 100 : 0,
      color: 'warning'
    },
    {
      label: 'Canceladas',
      value: estadisticas.cronograma?.canceladas || 0,
      percentage: estadisticas.cronograma?.total_programadas > 0 ? 
        (estadisticas.cronograma.canceladas / estadisticas.cronograma.total_programadas) * 100 : 0,
      color: 'error'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>

        {/* Métricas principales */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Sesiones"
              value={formatNumber(estadisticas.sesiones?.total)}
              subtitle="Sesiones registradas"
              icon={<Psychology />}
              color="primary"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Sesiones Programadas"
              value={formatNumber(estadisticas.cronograma?.total_programadas)}
              subtitle="En cronograma"
              icon={<CalendarMonth />}
              color="info"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Cumplimiento"
              value={`${(estadisticas.operacional?.porcentaje_cumplimiento || 0).toFixed(1)}%`}
              subtitle="Sesiones realizadas"
              icon={<TrendingUp />}
              color="success"
              progress={estadisticas.operacional?.porcentaje_cumplimiento || 0}
            />
          </Grid>
          
          {isAdmin && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Ingresos Totales"
                value={formatCurrency(estadisticas.financiero?.ingresos_totales)}
                subtitle="Valor de contratos"
                icon={<AttachMoney />}
                color="warning"
              />
            </Grid>
          )}
        </Grid>

        {/* Métricas operacionales */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Sesiones Activas"
              value={formatNumber(estadisticas.sesiones?.activas)}
              subtitle="En curso"
              icon={<CheckCircle />}
              color="success"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Sesiones Completadas"
              value={formatNumber(estadisticas.sesiones?.completadas)}
              subtitle="Finalizadas"
              icon={<EventAvailable />}
              color="info"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Duración Promedio"
              value={`${estadisticas.operacional?.duracion_promedio_minutos || 0} min`}
              subtitle="Por sesión"
              icon={<Timer />}
              color="secondary"
            />
          </Grid>
          
          {isAdmin && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Sesiones Contratadas"
                value={formatNumber(estadisticas.financiero?.sesiones_contratadas)}
                subtitle="Total contratadas"
                icon={<Assessment />}
                color="primary"
              />
            </Grid>
          )}
        </Grid>

        {/* Gráficos de progreso */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ProgressSection
              title="Estado de Sesiones"
              items={sesionesItems}
              icon={<Psychology sx={{ color: 'primary.main' }} />}
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <ProgressSection
              title="Estado del Cronograma"
              items={cronogramaItems}
              icon={<Schedule sx={{ color: 'secondary.main' }} />}
            />
          </Grid>
        </Grid>

        {/* Resumen financiero */}
        {isAdmin && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center">
                <AttachMoney sx={{ mr: 1 }} />
                Resumen Financiero
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {formatCurrency(estadisticas.financiero?.ingresos_totales)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ingresos Totales
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {formatNumber(estadisticas.financiero?.sesiones_contratadas)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sesiones Contratadas
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {estadisticas.financiero?.sesiones_contratadas > 0 ?
                        formatCurrency(estadisticas.financiero.ingresos_totales / estadisticas.financiero.sesiones_contratadas) :
                        formatCurrency(0)
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Precio Promedio por Sesión
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            severity={snackbar.severity} 
            variant="filled" 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
    </Container>
  );
};

export default TerapeuticoEstadisticas;