import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, Chip, List, 
  ListItem, ListItemAvatar, ListItemText, Divider, IconButton, 
  Tooltip, Alert, CircularProgress
} from '@mui/material';
import {
  Psychology, School, EventNote, AccessTime, CheckCircle, 
  Warning, Person, Class, Refresh, TrendingUp
} from '@mui/icons-material';
import { useAuth } from 'src/contexts/AuthContext';
import dashboardService from 'src/services/dashboardService';

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roleData, setRoleData] = useState({
    sesiones: { data: [] },
    clases: { data: [] },
    pacientes: { data: [] },
    estudiantes: { data: [] }
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      cargarDatosPersonalizados();
    }
  }, [user]);

  const cargarDatosPersonalizados = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDatosPersonalizadosPorRol();
      setRoleData(data);
    } catch (error) {
      console.error('Error loading role-based dashboard:', error);
      setError('Error al cargar datos personalizados');
    } finally {
      setLoading(false);
    }
  };

  // Determinar el rol del usuario basado en su especialidad o rol
  const getUserRole = () => {
    if (!user) return null;
    
    // Si el usuario tiene rol de Administrador, mostrar vista administrativa
    if (user.rol === 'Administrador') {
      return 'admin';
    }
    
    // Determinar si es terapeuta o pedagogo basado en especialidades
    if (user.especialidades && user.especialidades.length > 0) {
      const tieneEspecialidadTerapeutica = user.especialidades.some(esp => 
        esp.area === 'Especialidad terapéutica' || 
        esp.area?.toLowerCase().includes('terap')
      );
      const tieneEspecialidadPedagogica = user.especialidades.some(esp => 
        esp.area === 'Especialidad pedagógica' || 
        esp.area?.toLowerCase().includes('pedag')
      );
      
      if (tieneEspecialidadTerapeutica) return 'terapeuta';
      if (tieneEspecialidadPedagogica) return 'pedagogo';
    }
    
    return 'general';
  };

  const renderTerapeutaView = () => (
    <Grid container spacing={3}>
      {/* Mis Sesiones Hoy */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Mis Sesiones Hoy
              </Typography>
              <Tooltip title="Actualizar">
                <IconButton size="small" onClick={cargarDatosPersonalizados}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {roleData.sesiones?.data?.length > 0 ? (
              <List sx={{ p: 0 }}>
                {roleData.sesiones.data.slice(0, 5).map((sesion, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <EventNote />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={sesion.codigo_sesion || `Sesión ${index + 1}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {sesion.descripcion || 'Sesión terapéutica'}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {sesion.fecha_programada ? 
                              new Date(sesion.fecha_programada).toLocaleTimeString() : 
                              'Hora por definir'
                            }
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip 
                      size="small" 
                      label={sesion.estado || 'Programada'} 
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="text.secondary">
                  No tienes sesiones programadas para hoy
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Mis Pacientes */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Mis Pacientes
              </Typography>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <Person />
              </Avatar>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box textAlign="center" p={2}>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {roleData.pacientes?.data?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pacientes Asignados
              </Typography>
            </Box>
            
            {roleData.pacientes?.data?.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Últimos pacientes:
                </Typography>
                {roleData.pacientes.data.slice(0, 3).map((paciente, index) => (
                  <Chip 
                    key={index}
                    size="small" 
                    label={paciente.nombre || `Paciente ${index + 1}`}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPedagogoView = () => (
    <Grid container spacing={3}>
      {/* Mis Clases Hoy */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Mis Clases Hoy
              </Typography>
              <Tooltip title="Actualizar">
                <IconButton size="small" onClick={cargarDatosPersonalizados}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {roleData.clases?.data?.length > 0 ? (
              <List sx={{ p: 0 }}>
                {roleData.clases.data.slice(0, 5).map((clase, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <Class />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={clase.tema || `Clase ${index + 1}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {clase.descripcion || 'Clase pedagógica'}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {clase.fecha_programada ? 
                              new Date(clase.fecha_programada).toLocaleTimeString() : 
                              'Hora por definir'
                            }
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip 
                      size="small" 
                      label={clase.estado || 'Programada'} 
                      color="warning"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="text.secondary">
                  No tienes clases programadas para hoy
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Mis Estudiantes */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Mis Estudiantes
              </Typography>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <School />
              </Avatar>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box textAlign="center" p={2}>
              <Typography variant="h3" fontWeight="bold" color="info.main">
                {roleData.estudiantes?.data?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estudiantes Asignados
              </Typography>
            </Box>
            
            {roleData.estudiantes?.data?.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Últimos estudiantes:
                </Typography>
                {roleData.estudiantes.data.slice(0, 3).map((estudiante, index) => (
                  <Chip 
                    key={index}
                    size="small" 
                    label={estudiante.nombre || `Estudiante ${index + 1}`}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAdminView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Vista Administrativa:</strong> Como administrador, tienes acceso completo a todas las 
            estadísticas del sistema en el dashboard principal.
          </Typography>
        </Alert>
      </Grid>
      
      {/* Resumen rápido */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'primary.main', width: 56, height: 56 }}>
              <Psychology fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {(roleData.sesiones?.data?.length || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sesiones Totales Hoy
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'warning.main', width: 56, height: 56 }}>
              <School fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {(roleData.clases?.data?.length || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clases Totales Hoy
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'success.main', width: 56, height: 56 }}>
              <Person fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {(roleData.pacientes?.data?.length || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Pacientes
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'info.main', width: 56, height: 56 }}>
              <TrendingUp fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {(roleData.estudiantes?.data?.length || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Estudiantes
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderGeneralView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Vista General:</strong> Tu usuario no tiene especialidades específicas asignadas. 
            Contacta al administrador para configurar tu perfil.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando datos personalizados...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {error}
        </Typography>
      </Alert>
    );
  }

  const userRole = getUserRole();

  return (
    <Box>
      {/* Encabezado personalizado */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {userRole === 'terapeuta' && '🔬 Panel del Terapeuta'}
            {userRole === 'pedagogo' && '📚 Panel del Pedagogo'}
            {userRole === 'admin' && '⚙️ Panel del Administrador'}
            {userRole === 'general' && '👤 Panel Personal'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Información personalizada para {user?.nombre || user?.email}
          </Typography>
        </CardContent>
      </Card>

      {/* Contenido según rol */}
      {userRole === 'terapeuta' && renderTerapeutaView()}
      {userRole === 'pedagogo' && renderPedagogoView()}
      {userRole === 'admin' && renderAdminView()}
      {userRole === 'general' && renderGeneralView()}
    </Box>
  );
};

export default RoleBasedDashboard;