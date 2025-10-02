import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Button, Breadcrumbs, Link, Typography } from '@mui/material';
import { ArrowBack, Home, Person } from '@mui/icons-material';
import HistorialPausas from '../../components/Pacientes/HistorialPausas';

const HistorialPausasView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // En una implementacion real, se obtendria el nombre del paciente de la API
  const pacienteNombre = 'Paciente'; // Placeholder

  const handleVolver = () => {
    navigate('/gestion/paciente');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/dashboard')}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Inicio
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/gestion/paciente')}
        >
          <Person sx={{ mr: 0.5 }} fontSize="inherit" />
          Pacientes
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          Historial de Pausas
        </Typography>
      </Breadcrumbs>

      {/* Boton volver */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleVolver}
          variant="outlined"
        >
          Volver al Paciente
        </Button>
      </Box>

      {/* Componente de historial */}
      <Paper sx={{ p: 3 }}>
        <HistorialPausas pacienteId={id} pacienteNombre={pacienteNombre} />
      </Paper>
    </Container>
  );
};

export default HistorialPausasView;
