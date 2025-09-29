// src/views/public/PublicSessionView.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Container, Typography, Alert, Grid,
  Chip, Avatar, Paper, Divider, LinearProgress, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, useTheme
} from '@mui/material';
import {
  Schedule, Person, CalendarToday, AccessTime, TrendingUp,
  CheckCircle, PendingActions, School
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

const PublicSessionView = () => {
  const theme = useTheme();
  const { token } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchSessionData();
    }
  }, [token]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const response = await sesionTerapiaService.viewPublicSession(token);

      if (response.status === 'success') {
        setSessionData(response.data);
      } else {
        setError(response.message || 'Error al cargar la información de la sesión');
      }
    } catch (err) {
      console.error('Error fetching public session:', err);
      if (err.message.includes('Token inválido') || err.message.includes('expirado')) {
        setError('El enlace ha expirado o no es válido');
      } else {
        setError(err.message || 'Error al cargar la información de la sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    try {
      if (timeString && timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'realizada':
      case 'completada':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'realizada':
      case 'completada':
        return <CheckCircle fontSize="small" />;
      case 'pendiente':
        return <PendingActions fontSize="small" />;
      default:
        return <AccessTime fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando información de la sesión...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box textAlign="center">
          <Typography variant="h6" color="text.secondary">
            No se pudo cargar la información de la sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Verifica que el enlace sea correcto y no haya expirado
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!sessionData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          No se encontró información de la sesión
        </Alert>
      </Container>
    );
  }

  const { sesion, estadisticas, cronograma, enlace_info } = sessionData;

  return (
    <Container maxWidth="lg" sx={{ py: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Centro Tía Glenda
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Progreso de Sesión Terapéutica
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {enlace_info?.descripcion}
        </Typography>
      </Box>

      {/* Session Information */}
      <Card elevation={6} sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Schedule sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {sesion.titulo}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1 }} />
                  Información General
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Terapeuta:</strong> {sesion.terapeuta}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Especialidad:</strong> {sesion.especialidad?.nombre}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Área:</strong> {sesion.especialidad?.area}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Tipo de Sesión:</strong> {sesion.tipo || 'Individual'}
                  </Typography>
                  <Chip
                    label={sesion.estado}
                    color={getStatusColor(sesion.estado)}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Schedule Information */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1 }} />
                  Horario y Duración
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Período:</strong> {formatDate(sesion.periodo?.inicio)} - {formatDate(sesion.periodo?.fin)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Días:</strong> {Array.isArray(sesion.horario?.dias) ? sesion.horario.dias.join(', ') : sesion.horario?.dias}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Horario:</strong> {formatTime(sesion.horario?.hora_inicio)} - {formatTime(sesion.horario?.hora_fin)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Duración:</strong> {sesion.horario?.duracion_minutos || 45} minutos
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Objective */}
            {sesion.objetivo_general && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    <School sx={{ mr: 1 }} />
                    Objetivo de la Sesión
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {sesion.objetivo_general}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card elevation={6} sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ mr: 2 }} />
            Estadísticas de Progreso
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', width: 56, height: 56, mb: 2 }}>
                  <Person />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {estadisticas?.total_pacientes || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pacientes
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', width: 56, height: 56, mb: 2 }}>
                  <Schedule />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {estadisticas?.sesiones_programadas || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sesiones Programadas
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', width: 56, height: 56, mb: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {estadisticas?.sesiones_realizadas || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sesiones Completadas
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', width: 56, height: 56, mb: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {Math.round(estadisticas?.porcentaje_asistencia || 0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Asistencia
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Box sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight="medium">
                Progreso General
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {estadisticas?.sesiones_realizadas || 0} / {estadisticas?.sesiones_programadas || 0} sesiones
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={estadisticas?.sesiones_programadas > 0 ?
                (estadisticas.sesiones_realizadas / estadisticas.sesiones_programadas) * 100 : 0
              }
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200'
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Schedule/Cronograma */}
      {cronograma && cronograma.length > 0 && (
        <Card elevation={6} sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ mr: 2 }} />
              Cronograma de Sesiones
            </Typography>

            <Box sx={{ overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Hora</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Asistencia</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cronograma.map((sesion, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(sesion.fecha)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Semana {sesion.semana} - Sesión {sesion.sesion_semanal}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatTime(sesion.hora_inicio)} - {formatTime(sesion.hora_fin)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={sesion.estado}
                          color={getStatusColor(sesion.estado)}
                          icon={getStatusIcon(sesion.estado)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={sesion.estado_asistencia === 'realizada' ? 'Asistió' : 'Pendiente'}
                          color={sesion.estado_asistencia === 'realizada' ? 'success' : 'default'}
                          icon={sesion.estado_asistencia === 'realizada' ? <CheckCircle fontSize="small" /> : <PendingActions fontSize="small" />}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Footer Information */}
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Este enlace expirará el: <strong>{formatDate(enlace_info?.fecha_expiracion)}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Para obtener información más detallada, contacte directamente con el centro.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="primary.main" fontWeight="bold">
          Centro Tía Glenda - Sistema de Seguimiento de Sesiones Terapéuticas
        </Typography>
      </Paper>
    </Container>
  );
};

export default PublicSessionView;