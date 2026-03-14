import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import HistorialPausas from '../../components/Pacientes/HistorialPausas';
import PacienteService from '../../services/pacienteService';

const HistorialPausasView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pacienteNombre, setPacienteNombre] = useState('');

  useEffect(() => {
    PacienteService.getById(id)
      .then(data => setPacienteNombre(data?.nombre_completo || ''))
      .catch(() => {});
  }, [id]);

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/app/gestion/paciente')}
          variant="outlined"
          size="small"
        >
          Volver a Pacientes
        </Button>
      </Box>

      <HistorialPausas pacienteId={id} pacienteNombre={pacienteNombre} />
    </Box>
  );
};

export default HistorialPausasView;
