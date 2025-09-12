// src/components/dashboard/DashboardE1.jsx
// Phase E1 - Clean role-based dashboard component

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Avatar, Chip, List, 
  ListItem, ListItemAvatar, ListItemText, Divider, IconButton, 
  Tooltip, Alert, CircularProgress, Button
} from '@mui/material';
import {
  Psychology, School, EventNote, AccessTime, Person, 
  Group, Refresh, TrendingUp, AdminPanelSettings,
  CheckCircle, Warning, Info
} from '@mui/icons-material';

import { useAuth } from 'src/contexts/AuthContext';
import dashboardE1Service from 'src/services/dashboardE1Service';
import { detectUserRole, ROLE_LABELS } from 'src/config/dashboardE1Api';

const DashboardE1 = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('guest');

  useEffect(() => {
    if (user) {
      const role = detectUserRole(user);
      setUserRole(role);
      loadDashboardData(role);
    } else {
      setUserRole('guest');
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async (role) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[DashboardE1] Loading data for role:', role);
      
      const data = await dashboardE1Service.getRoleBasedDashboardData(role);
      setDashboardData(data);
      
      console.log('[DashboardE1] Data loaded successfully');
    } catch (err) {
      console.error('[DashboardE1] Error loading data:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(userRole);
  };

  // Loading state
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="300px"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Cargando panel personalizado...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Reintentar
          </Button>
        }
      >
        <Typography variant="body2">
          <strong>Error:</strong> {error}
        </Typography>
      </Alert>
    );
  }

  // Guest state
  if (userRole === 'guest' || !user) {
    return (
      <Alert severity="info">
        <Typography variant="body2">
          Inicia sesión para ver tu panel personalizado.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with role information */}
      <Card 
        sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white' 
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🎯 Panel {ROLE_LABELS[userRole]}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Información personalizada para {user?.nombre || user?.email}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Última actualización: {dashboardData?.timestamp ? 
                  new Date(dashboardData.timestamp).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
            <Tooltip title="Actualizar datos">
              <IconButton 
                onClick={handleRefresh} 
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Role-specific content */}
      {userRole === 'therapist' && <TherapistDashboard data={dashboardData} />}
      {userRole === 'pedagogue' && <PedagogueDashboard data={dashboardData} />}
      {userRole === 'admin' && <AdminDashboard data={dashboardData} />}
      {userRole === 'staff' && <StaffDashboard data={dashboardData} />}
    </Box>
  );
};

// Therapist Dashboard Component
const TherapistDashboard = ({ data }) => (
  <Grid container spacing={3}>
    {/* Today's Sessions */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <EventNote />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              Mis Sesiones Hoy
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {data?.sessions?.data?.length > 0 ? (
            <List sx={{ p: 0 }}>
              {data.sessions.data.slice(0, 5).map((session, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                      <AccessTime fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={session.codigo_sesion || `Sesión ${index + 1}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {session.descripcion || 'Sesión terapéutica'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {session.fecha_programada ? 
                            new Date(session.fecha_programada).toLocaleTimeString() : 
                            'Hora por definir'}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip 
                    size="small" 
                    label={session.estado || 'Programada'} 
                    color="primary"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={3}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No tienes sesiones programadas para hoy
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>

    {/* My Patients */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
              <Person />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              Mis Pacientes
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Box textAlign="center" py={2}>
            <Typography variant="h2" fontWeight="bold" color="success.main">
              {data?.patients?.data?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pacientes Asignados
            </Typography>
          </Box>
          
          {data?.patients?.data?.length > 0 && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Últimos pacientes:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {data.patients.data.slice(0, 3).map((patient, index) => (
                  <Chip 
                    key={index}
                    size="small" 
                    label={patient.nombre || `Paciente ${index + 1}`}
                    color="success"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// Pedagogue Dashboard Component
const PedagogueDashboard = ({ data }) => (
  <Grid container spacing={3}>
    {/* Today's Classes */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
              <School />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              Mis Clases Hoy
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {data?.classes?.data?.length > 0 ? (
            <List sx={{ p: 0 }}>
              {data.classes.data.slice(0, 5).map((clase, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.light', width: 32, height: 32 }}>
                      <AccessTime fontSize="small" />
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
                            'Hora por definir'}
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
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No tienes clases programadas para hoy
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>

    {/* My Students */}
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
              <Group />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              Mis Estudiantes
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Box textAlign="center" py={2}>
            <Typography variant="h2" fontWeight="bold" color="info.main">
              {data?.students?.data?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estudiantes Asignados
            </Typography>
          </Box>
          
          {data?.students?.data?.length > 0 && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Últimos estudiantes:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {data.students.data.slice(0, 3).map((student, index) => (
                  <Chip 
                    key={index}
                    size="small" 
                    label={student.nombre || `Estudiante ${index + 1}`}
                    color="info"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// Admin Dashboard Component
const AdminDashboard = ({ data }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Vista Administrativa:</strong> Resumen general del sistema con acceso completo a todas las estadísticas.
        </Typography>
      </Alert>
    </Grid>
    
    {/* Quick Stats Cards */}
    {[
      { label: 'Sesiones Totales', value: data?.sessions?.data?.length || 0, color: 'primary', icon: Psychology },
      { label: 'Clases Totales', value: data?.classes?.data?.length || 0, color: 'warning', icon: School },
      { label: 'Total Pacientes', value: data?.patients?.data?.length || 0, color: 'success', icon: Person },
      { label: 'Total Estudiantes', value: data?.students?.data?.length || 0, color: 'info', icon: Group }
    ].map((stat, index) => (
      <Grid item xs={12} md={3} key={index}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: `${stat.color}.main`, width: 56, height: 56 }}>
              <stat.icon fontSize="large" />
            </Avatar>
            <Typography variant="h3" fontWeight="bold" color={`${stat.color}.main`}>
              {stat.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stat.label}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// Staff Dashboard Component
const StaffDashboard = ({ data }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Alert severity="warning">
        <Typography variant="body2">
          <strong>Panel de Personal:</strong> Tu usuario no tiene especialidades específicas asignadas. 
          Contacta al administrador para configurar tu perfil como terapeuta o pedagogo.
        </Typography>
      </Alert>
    </Grid>
    
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'grey.500', mr: 2 }}>
              <TrendingUp />
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              Información General
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            Datos disponibles en el sistema:
          </Typography>
          <Box mt={2} display="flex" gap={2} flexWrap="wrap">
            <Chip label={`${data?.sessions?.data?.length || 0} sesiones`} size="small" />
            <Chip label={`${data?.classes?.data?.length || 0} clases`} size="small" />
            <Chip label={`${data?.patients?.data?.length || 0} pacientes`} size="small" />
            <Chip label={`${data?.students?.data?.length || 0} estudiantes`} size="small" />
          </Box>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

export default DashboardE1;