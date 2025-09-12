// src/views/dashboard/DashboardE1Main.jsx  
// Phase E1 - Clean main dashboard with tab interface

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Paper, Tabs, Tab, 
  Avatar, Button, Grid, Fade
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Person as PersonIcon, BarChart, 
  Psychology, School, AdminPanelSettings
} from '@mui/icons-material';

import { useAuth } from 'src/contexts/AuthContext';
import PageContainer from 'src/components/container/PageContainer';
import DashboardE1 from 'src/components/dashboard/DashboardE1';
import { detectUserRole, ROLE_LABELS } from 'src/config/dashboardE1Api';

// Import the original dashboard component for general view
import OriginalDashboard from './Dashboard';

const DashboardE1Main = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const userRole = detectUserRole(user);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'therapist': return <Psychology />;
      case 'pedagogue': return <School />;
      default: return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#9c27b0';
      case 'therapist': return '#2196f3'; 
      case 'pedagogue': return '#ff9800';
      default: return '#607d8b';
    }
  };

  // Don't show role-based tab for guests or users without specific roles
  const showRoleBasedTab = userRole !== 'guest' && userRole !== 'staff';

  return (
    <PageContainer 
      title="Dashboard Centro Tía Glenda" 
      description="Panel principal del sistema"
    >
      <Box>
        {/* Welcome Header */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  ¡Bienvenido, {user?.nombre || user?.email || 'Usuario'}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  Centro de Desarrollo Integral Tía Glenda
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600 }}>
                  Sistema integral de gestión para actividades terapéuticas y pedagógicas.
                  {showRoleBasedTab && ' Accede a tu panel personalizado para una experiencia optimizada.'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                {user && (
                  <Box display="flex" alignItems="center" gap={2} sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: getRoleColor(userRole),
                        width: 60, 
                        height: 60,
                        border: '3px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      {getRoleIcon(userRole)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {ROLE_LABELS[userRole]}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
          
          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 0
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              zIndex: 0
            }}
          />
        </Paper>

        {/* Navigation Tabs - Only show if user has specific role */}
        {showRoleBasedTab && (
          <Card sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 80,
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }
                }}
              >
                <Tab 
                  icon={<BarChart />} 
                  label="Vista General del Sistema"
                  iconPosition="start"
                />
                <Tab 
                  icon={getRoleIcon(userRole)} 
                  label={`Mi Panel ${ROLE_LABELS[userRole]}`}
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          </Card>
        )}

        {/* Tab Content with Fade Transition */}
        <Box sx={{ mt: 3 }}>
          {/* General Dashboard Tab */}
          {activeTab === 0 && (
            <Fade in={true} timeout={500}>
              <Box>
                <OriginalDashboard />
              </Box>
            </Fade>
          )}

          {/* Role-Based Dashboard Tab */}
          {activeTab === 1 && showRoleBasedTab && (
            <Fade in={true} timeout={500}>
              <Box>
                <DashboardE1 />
              </Box>
            </Fade>
          )}

          {/* Default content when no role-based tab is available */}
          {!showRoleBasedTab && (
            <Box>
              <OriginalDashboard />
              
              {userRole === 'staff' && (
                <Card sx={{ mt: 3, bgcolor: 'warning.50' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="warning.main">
                      💡 Configura tu Perfil
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Para acceder a funciones personalizadas, solicita al administrador que configure 
                      tus especialidades (Terapéutica o Pedagógica) en tu perfil de usuario.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={() => {
                        console.log('Redirect to profile or contact admin');
                      }}
                    >
                      Más Información
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>

        {/* Phase E1 Info Badge */}
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            zIndex: 1000,
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Card 
            sx={{ 
              p: 1, 
              bgcolor: 'primary.main', 
              color: 'white',
              minWidth: 120
            }}
          >
            <Typography variant="caption" fontWeight="bold" align="center" display="block">
              🚀 Phase E1 Active
            </Typography>
            <Typography variant="caption" align="center" display="block" sx={{ opacity: 0.8 }}>
              Role-Based Dashboard
            </Typography>
          </Card>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default DashboardE1Main;