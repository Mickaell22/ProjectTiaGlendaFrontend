// src/views/terapeutico/TerapeuticoHoy.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Typography, Alert, Grid, Chip, Avatar, Divider, Stack
} from '@mui/material';
import { 
  Today, AccessTime, Person, Psychology, Schedule, CheckCircle, 
  Cancel, Refresh, EventNote, Group, MedicalServices
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

const TerapeuticoHoy = () => {
  const [sesionesHoy, setSesionesHoy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSesionesHoy();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchSesionesHoy, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSesionesHoy = async () => {
    setLoading(true);
    try {
      const response = await sesionTerapiaService.getSesionesHoy();
      setSesionesHoy(response.data || []);
    } catch (err) {
      console.error('Error fetching sessions today:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programada': return 'info';
      case 'realizada': return 'success';
      case 'cancelada': return 'error';
      case 'reprogramada': return 'warning';
      case 'en_curso': return 'primary';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'programada': return <Schedule />;
      case 'realizada': return <CheckCircle />;
      case 'cancelada': return <Cancel />;
      case 'reprogramada': return <AccessTime />;
      case 'en_curso': return <AccessTime />;
      default: return <EventNote />;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Handle different time formats
    if (timeString.includes('T') || timeString.includes(' ')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return timeString; // Already formatted as HH:MM
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const agruparPorHora = (sesiones) => {
    const grupos = {};
    sesiones.forEach(sesion => {
      const hora = formatTime(sesion.hora_programada);
      if (!grupos[hora]) {
        grupos[hora] = [];
      }
      grupos[hora].push(sesion);
    });
    
    // Ordenar las horas
    const horasOrdenadas = Object.keys(grupos).sort();
    const gruposOrdenados = {};
    horasOrdenadas.forEach(hora => {
      gruposOrdenados[hora] = grupos[hora];
    });
    
    return gruposOrdenados;
  };

  const sesionesAgrupadas = agruparPorHora(sesionesHoy);
  const totalSesiones = sesionesHoy.length;
  const sesionesRealizadas = sesionesHoy.filter(s => s.estado === 'realizada').length;
  const sesionesCanceladas = sesionesHoy.filter(s => s.estado === 'cancelada').length;
  const sesionesPendientes = sesionesHoy.filter(s => s.estado === 'programada').length;

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>

        <Grid container spacing={3} mb={4}>
          {/* Información del día */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" mb={1}>
                      {formatDate(new Date())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hora actual: {getCurrentTime()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={fetchSesionesHoy}
                      disabled={loading}
                    >
                      Actualizar
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Resumen estadístico */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {totalSesiones}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Sesiones
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {sesionesRealizadas}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Realizadas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {sesionesPendientes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pendientes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main" fontWeight="bold">
                      {sesionesCanceladas}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Canceladas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Lista de sesiones agrupadas por hora */}
        {Object.keys(sesionesAgrupadas).length > 0 ? (
          Object.entries(sesionesAgrupadas).map(([hora, sesiones]) => (
            <Card key={hora} sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccessTime sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {hora}
                  </Typography>
                  <Chip 
                    label={`${sesiones.length} sesión${sesiones.length !== 1 ? 'es' : ''}`}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  {sesiones.map((sesion, index) => (
                    <Grid item xs={12} md={6} lg={4} key={sesion.id || index}>
                      <Paper 
                        elevation={2}
                        sx={{ 
                          p: 2, 
                          borderLeft: 4, 
                          borderColor: getEstadoColor(sesion.estado) + '.main',
                          '&:hover': {
                            elevation: 4,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s'
                          }
                        }}
                      >
                        <Stack spacing={1}>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2" fontWeight="bold" noWrap>
                              {sesion.codigo_sesion || 'Sin código'}
                            </Typography>
                            <Chip 
                              label={sesion.estado} 
                              color={getEstadoColor(sesion.estado)}
                              size="small"
                              icon={getEstadoIcon(sesion.estado)}
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {sesion.titulo || 'Sin título'}
                          </Typography>
                          
                          <Box display="flex" alignItems="center">
                            <Person sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="caption">
                              {sesion.terapeuta_nombre || 'Sin terapeuta'}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center">
                            <MedicalServices sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="caption">
                              {sesion.especialidad_nombre || 'Sin especialidad'}
                            </Typography>
                          </Box>
                          
                          {sesion.total_pacientes && (
                            <Box display="flex" alignItems="center">
                              {sesion.total_pacientes > 1 ? (
                                <Group sx={{ mr: 1, fontSize: 16 }} />
                              ) : (
                                <Person sx={{ mr: 1, fontSize: 16 }} />
                              )}
                              <Typography variant="caption">
                                {sesion.total_pacientes} paciente{sesion.total_pacientes !== 1 ? 's' : ''}
                              </Typography>
                            </Box>
                          )}
                          
                          {sesion.duracion_minutos && (
                            <Typography variant="caption" color="text.secondary">
                              Duración: {sesion.duracion_minutos} min
                            </Typography>
                          )}
                          
                          {sesion.observaciones && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {sesion.observaciones}
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                
                {Object.entries(sesionesAgrupadas).indexOf([hora, sesiones]) < Object.entries(sesionesAgrupadas).length - 1 && (
                  <Divider sx={{ mt: 2 }} />
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent>
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                py={8}
              >
                {loading ? (
                  <>
                    <AccessTime sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      Cargando sesiones...
                    </Typography>
                  </>
                ) : (
                  <>
                    <Today sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      No hay sesiones programadas para hoy
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      ¡Excelente! Hoy no tienes sesiones terapéuticas programadas.
                    </Typography>
                  </>
                )}
              </Box>
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

export default TerapeuticoHoy;