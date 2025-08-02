// src/views/dashboard/Dashboard.js
import React from 'react';
import { Box, Typography, Card, CardContent, Button, Stack } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCustomizer } from 'src/store/customizer/CustomizerSlice';
import PageContainer from 'src/components/container/PageContainer';

const Dashboard = () => {
  const dispatch = useDispatch();
  const customizer = useSelector((state) => state.customizer);

  // Estilo para la línea arcoíris
  const rainbowLineStyle = {
    height: '4px',
    width: '100%',
    borderRadius: '2px',
    background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
    marginBottom: '24px',
  };

  return (
    <PageContainer title="Dashboard" description="Panel principal">
      <Box>
        <Stack spacing={3}>
          <Typography variant="h2" mb={1}>
           Plataforma del Centro Tía Glenda
          </Typography>
          <Box sx={rainbowLineStyle} />

          {/* Tarjeta de bienvenida */}
          <Card>
            <CardContent>
              <Typography variant="h5" mb={2}>
                Elegir Temas
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

          {/* Información del tema actual */}
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Configuración Actual
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Modo:</strong> {customizer.activeMode === 'dark' ? 'Oscuro' : 'Claro'}
                </Typography>
                <Typography variant="body2">
                  <strong>Tema:</strong> {customizer.activeTheme.replace('_THEME', '')}
                </Typography>
                <Typography variant="body2">
                  <strong>Dirección:</strong> {customizer.activeDir.toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  <strong>Sidebar:</strong> {customizer.sidebarCollapse ? 'Contraído' : 'Expandido'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Tarjetas de estadísticas */}
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <Card sx={{ minWidth: 200, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="primary.main" mb={1}>
                  9
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios Activos
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ minWidth: 200, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="secondary.main" mb={1}>
                  124
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pacientes
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ minWidth: 200, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="success.main" mb={1}>
                  89%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rendimiento
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ minWidth: 200, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="error.main" mb={1}>
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tareas Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
