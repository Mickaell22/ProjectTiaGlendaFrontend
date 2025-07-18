// src/views/dashboard/Dashboard.js
import React from 'react';
import { Box, Grid, Typography, Card, CardContent, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCustomizer } from 'src/store/customizer/CustomizerSlice';
import PageContainer from 'src/components/container/PageContainer';

const Dashboard = () => {
  const dispatch = useDispatch();
  const customizer = useSelector((state) => state.customizer);

  return (
    <PageContainer title="Dashboard" description="Panel principal">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h2" mb={3}>
              ¡Bienvenido al Dashboard! 🎉
            </Typography>
          </Grid>

          {/* Tarjeta de bienvenida */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" mb={2}>
                  Sistema de Theming Implementado
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  Tu aplicación ahora cuenta con un sistema completo de personalización de temas. 
                  Puedes cambiar entre modo claro/oscuro, seleccionar diferentes colores primarios 
                  y configurar la dirección del texto.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => dispatch(toggleCustomizer())}
                >
                  Abrir Customizer
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Información del tema actual */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Configuración Actual
                </Typography>
                <Box>
                  <Typography variant="body2" mb={1}>
                    <strong>Modo:</strong> {customizer.activeMode === 'dark' ? 'Oscuro' : 'Claro'}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Tema:</strong> {customizer.activeTheme.replace('_THEME', '')}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>Dirección:</strong> {customizer.activeDir.toUpperCase()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Sidebar:</strong> {customizer.sidebarCollapse ? 'Contraído' : 'Expandido'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Tarjetas de ejemplo */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="primary.main" mb={1}>
                  24
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios Activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="secondary.main" mb={1}>
                  156
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Proyectos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="success.main" mb={1}>
                  89%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rendimiento
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="error.main" mb={1}>
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tareas Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;