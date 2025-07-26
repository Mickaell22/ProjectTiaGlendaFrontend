import React from 'react';
import { Container, Typography } from '@mui/material';
import PacienteForm from "src/views/forms/PacienteForm";


const TestPacienteView = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Prueba
      </Typography>
      <PacienteForm />
    </Container>
  );
};

export default TestPacienteView;
