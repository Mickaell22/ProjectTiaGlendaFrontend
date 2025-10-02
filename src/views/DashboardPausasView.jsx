import React from 'react';
import { Container, Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, Speed } from '@mui/icons-material';
import DashboardPausas from '../components/Pacientes/DashboardPausas';

const DashboardPausasView = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/')}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Inicio
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          <Speed sx={{ mr: 0.5 }} fontSize="inherit" />
          Control de Pausas
        </Typography>
      </Breadcrumbs>

      {/* Dashboard component */}
      <DashboardPausas />
    </Container>
  );
};

export default DashboardPausasView;
