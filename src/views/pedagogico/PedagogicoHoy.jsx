// src/views/pedagogico/PedagogicoHoy.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Card, CardContent,
  Grid, Button, IconButton, Tooltip, Alert, Snackbar,
  Avatar, Chip, Divider
} from '@mui/material';
import {
  Today, School, AccessTime, Person,
  Event, Schedule, Groups, Assignment
} from '@mui/icons-material';
import { useAuth } from 'src/contexts/AuthContext';
import sesionPedagogicaService from 'src/services/SesionPedagogicaService';

const PedagogicoHoy = () => {
  const [sesionesHoy, setSesionesHoy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useAuth();

  useEffect(() => {
    fetchSesionesHoy();
  }, []);

  const fetchSesionesHoy = async () => {
    setLoading(true);
    try {
      // Try to get today's classes from the specific endpoint
      let response = null;
      try {
        response = await sesionPedagogicaService.getClasesHoy();
      } catch (classError) {
        // Fallback to general sessions endpoint
        response = await sesionPedagogicaService.getSesionesHoy();
      }
      
      const clasesData = response.data?.data || response.data || [];
      setSesionesHoy(clasesData);
      
    } catch (error) {
      console.error('Error fetching today sessions:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar las sesiones de hoy',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSesionEstado = (sesion) => {
    const now = new Date();
    const horaActual = now.toTimeString().slice(0, 5);
    
    if (horaActual < sesion.hora_inicio) return 'pendiente';
    if (horaActual >= sesion.hora_inicio && horaActual <= sesion.hora_fin) return 'en_curso';
    return 'completada';
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'info';
      case 'en_curso': return 'success';
      case 'completada': return 'default';
      default: return 'default';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Por Iniciar';
      case 'en_curso': return 'En Curso';
      case 'completada': return 'Finalizada';
      default: return 'Desconocido';
    }
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
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1000, md: 1200 },
          mx: 'auto'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <Today sx={{ mr: 1 }} />
              Sesiones de Hoy
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {currentDate}
            </Typography>
          </Box>

          <Chip
            label={`${sesionesHoy.length} sesión${sesionesHoy.length !== 1 ? 'es' : ''}`}
            color="default"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            size="small"
          />
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <Typography>Cargando sesiones de hoy...</Typography>
            </Box>
          ) : sesionesHoy.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>No hay sesiones programadas para hoy</strong>
              </Typography>
              <Typography variant="body2">
                No se encontraron sesiones pedagógicas programadas para el día de hoy.
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {sesionesHoy.map((sesion, index) => {
                const estado = getSesionEstado(sesion);
                return (
                  <Grid item xs={12} md={6} lg={4} key={sesion.id || index}>
                    <Card
                      elevation={2}
                      sx={{
                        height: '100%',
                        border: '1px solid',
                        borderColor: estado === 'en_curso' ? 'success.main' : 'divider',
                        borderRadius: 2,
                        '&:hover': {
                          elevation: 4,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    >
                      <CardContent>
                        {/* Header de la sesión */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="bold" noWrap>
                              {sesion.titulo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {sesion.especialidad?.nombre || sesion.especialidad_nombre}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={getEstadoTexto(estado)}
                            color={getEstadoColor(estado)}
                            sx={{ ml: 1 }}
                          />
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Información del pedagogo */}
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar
                            sx={{
                              mr: 2,
                              bgcolor: '#4caf50',
                              width: 32,
                              height: 32
                            }}
                          >
                            <School fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {sesion.pedagogo?.nombre || sesion.pedagogo_nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Pedagogo
                            </Typography>
                          </Box>
                        </Box>

                        {/* Información de horario */}
                        <Box display="flex" alignItems="center" mb={2}>
                          <AccessTime sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {sesion.hora_inicio} - {sesion.hora_fin}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {sesion.duracion_minutos || 60} minutos
                            </Typography>
                          </Box>
                        </Box>

                        {/* Información de estudiantes */}
                        <Box display="flex" alignItems="center" mb={2}>
                          <Groups sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {sesion.total_estudiantes || sesion.estudiantes?.length || 0} estudiante(s)
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Capacidad: {sesion.capacidad_maxima || 'No definida'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Información del nivel */}
                        {sesion.nivel_academico && (
                          <Box display="flex" alignItems="center" mb={2}>
                            <Assignment sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {sesion.nivel_academico.replace(/_/g, ' ')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Nivel académico
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Modalidad */}
                        {sesion.modalidad && (
                          <Chip
                            size="small"
                            label={sesion.modalidad.charAt(0).toUpperCase() + sesion.modalidad.slice(1)}
                            variant="outlined"
                            color="primary"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Resumen del día */}
          {sesionesHoy.length > 0 && (
            <Box sx={{ mt: 4, p: 3, bgcolor: 'success.50', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom color="success.dark">
                Resumen del Día
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {sesionesHoy.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Sesiones
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {sesionesHoy.filter(s => getSesionEstado(s) === 'pendiente').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Por Iniciar
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {sesionesHoy.filter(s => getSesionEstado(s) === 'en_curso').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En Curso
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="text.secondary" fontWeight="bold">
                      {sesionesHoy.filter(s => getSesionEstado(s) === 'completada').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Finalizadas
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
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

export default PedagogicoHoy;