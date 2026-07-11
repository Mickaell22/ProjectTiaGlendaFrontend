// src/views/pedagogico/PedagogicoEstadisticas.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Card, CardContent,
  Grid, Button, IconButton, Tooltip, Alert, Snackbar,
  Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Avatar, LinearProgress, Divider,
 useTheme
} from '@mui/material';
import {
  BarChart, TrendingUp, School, Groups, 
  Event, Assignment, CheckCircle, AccessTime,
  PersonSearch, CalendarMonth
} from '@mui/icons-material';

const PedagogicoEstadisticas = () => {
  const theme = useTheme();
  const [estadisticas, setEstadisticas] = useState({});
  const [_loading, _setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Aquí se cargarían las estadísticas desde el backend
    // fetchEstadisticas();
    generateMockData();
  }, []);

  const generateMockData = () => {
    setEstadisticas({
      totalSesiones: 156,
      sesionesCompletadas: 142,
      sesionesActivas: 8,
      sesionesProgramadas: 24,
      totalEstudiantes: 89,
      asistenciaPromedio: 92.5,
      pedagogosActivos: 12,
      especialidades: 6,
      horasImpartidas: 468,
      calificacionPromedio: 4.2,
      porEspecialidad: [
        { nombre: 'Matemáticas', sesiones: 45, estudiantes: 28, asistencia: 95 },
        { nombre: 'Lenguaje', sesiones: 38, estudiantes: 32, asistencia: 89 },
        { nombre: 'Ciencias', sesiones: 32, estudiantes: 25, asistencia: 93 },
        { nombre: 'Educación Física', sesiones: 28, estudiantes: 35, asistencia: 87 },
        { nombre: 'Arte', sesiones: 13, estudiantes: 15, asistencia: 96 }
      ],
      tendenciaSemanal: [
        { semana: 'Sem 1', sesiones: 28, asistencia: 91 },
        { semana: 'Sem 2', sesiones: 32, asistencia: 94 },
        { semana: 'Sem 3', sesiones: 29, asistencia: 88 },
        { semana: 'Sem 4', sesiones: 35, asistencia: 96 }
      ]
    });
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          backgroundColor: 'background.paper',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1000, md: 1200 },
          mx: 'auto'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <BarChart sx={{ mr: 1 }} />
              Estadísticas Pedagógicas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Análisis de rendimiento y métricas educativas
            </Typography>
          </Box>

          <Chip
            label={`Actualizado: ${currentDate.split(',')[0]}`}
            color="default"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            size="small"
          />
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {/* Métricas principales */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', height: '100%' }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'success.main' }}>
                  <Event />
                </Avatar>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {estadisticas.totalSesiones}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sesiones
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={85} 
                  color="success" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50', height: '100%' }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                  <Groups />
                </Avatar>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {estadisticas.totalEstudiantes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estudiantes Activos
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={78} 
                  color="primary" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50', height: '100%' }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'info.main' }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {estadisticas.asistenciaPromedio}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Asistencia Promedio
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={estadisticas.asistenciaPromedio} 
                  color="info" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', height: '100%' }}>
                <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'warning.main' }}>
                  <AccessTime />
                </Avatar>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {estadisticas.horasImpartidas}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Horas Impartidas
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={68} 
                  color="warning" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
          </Grid>

          {/* Estadísticas por especialidad */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="primary" display="flex" alignItems="center">
              <Assignment sx={{ mr: 1 }} />
              Rendimiento por Especialidad
            </Typography>
            <Card sx={{ overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Especialidad</strong></TableCell>
                    <TableCell align="center"><strong>Sesiones</strong></TableCell>
                    <TableCell align="center"><strong>Estudiantes</strong></TableCell>
                    <TableCell align="center"><strong>Asistencia</strong></TableCell>
                    <TableCell align="center"><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estadisticas.porEspecialidad?.map((especialidad, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'success.main', width: 32, height: 32 }}>
                            <School fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {especialidad.nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={especialidad.sesiones} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {especialidad.estudiantes}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <LinearProgress 
                            variant="determinate" 
                            value={especialidad.asistencia} 
                            color={especialidad.asistencia >= 90 ? 'success' : 'warning'}
                            sx={{ width: 60, mr: 1 }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {especialidad.asistencia}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={especialidad.asistencia >= 90 ? 'Excelente' : 'Bueno'} 
                          color={especialidad.asistencia >= 90 ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Box>

          {/* Tendencia semanal */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="primary" display="flex" alignItems="center">
              <TrendingUp sx={{ mr: 1 }} />
              Tendencia de las Últimas Semanas
            </Typography>
            <Grid container spacing={2}>
              {estadisticas.tendenciaSemanal?.map((semana, index) => (
                <Grid key={index} size={{ xs: 12, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {semana.semana}
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      {semana.sesiones}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      sesiones
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {semana.asistencia}% asistencia
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Resumen ejecutivo */}
          <Box sx={{ p: 3, bgcolor: 'success.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="success.dark">
              Resumen Ejecutivo
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Fortalezas:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  • Alta tasa de asistencia general ({estadisticas.asistenciaPromedio}%)
                  <br />
                  • Especialidad de Arte con 96% de asistencia
                  <br />
                  • Tendencia positiva en las últimas semanas
                  <br />
                  • {estadisticas.pedagogosActivos} pedagogos activos cubriendo {estadisticas.especialidades} especialidades
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Áreas de Mejora:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Educación Física con menor asistencia (87%)
                  <br />
                  • Oportunidad de incrementar sesiones en Ciencias
                  <br />
                  • Balancear carga entre especialidades
                  <br />
                  • Implementar estrategias de retención estudiantil
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default PedagogicoEstadisticas;