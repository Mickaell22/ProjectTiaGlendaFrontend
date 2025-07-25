import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

// Datos de ejemplo para selección
const pacientesMock = [
  {
    cedula: '0102030405',
    nombre: 'Juan',
    apellido: 'Pérez',
    tutorNombre: 'Carlos',
    tutorApellido: 'Pérez',
  },
  {
    cedula: '0605040302',
    nombre: 'Ana',
    apellido: 'Gómez',
    tutorNombre: 'María',
    tutorApellido: 'Gómez',
  },
  {
    cedula: '0908070605',
    nombre: 'Luis',
    apellido: 'Ramírez',
    tutorNombre: 'José',
    tutorApellido: 'Ramírez',
  },
];

const tiposTerapia = ['Física', 'Ocupacional', 'Lenguaje', 'Psicológica'];

const PacienteForm = () => {
  const [cedulaSeleccionada, setCedulaSeleccionada] = useState('');
  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    tutorNombre: '',
    tutorApellido: '',
  });
  const [observaciones, setObservaciones] = useState('');
  const [tipoTerapia, setTipoTerapia] = useState('');

  // Manejo de cambio de cédula
  const handleCedulaChange = (e) => {
    setCedulaSeleccionada(e.target.value);
  };

  // Buscar datos de paciente por cédula
  const handleBuscar = () => {
    const paciente = pacientesMock.find((p) => p.cedula === cedulaSeleccionada);
    if (paciente) {
      setDatosPaciente(paciente);
    } else {
      setDatosPaciente({
        nombre: '',
        apellido: '',
        cedula: '',
        tutorNombre: '',
        tutorApellido: '',
      });
    }
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const datosFinales = {
      ...datosPaciente,
      observaciones,
      tipoTerapia,
    };
    console.log(datosFinales);
    alert('Datos del paciente registrados');
    // Aquí podrías hacer una llamada a API
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body2">Cédula del Paciente</Typography>
          <TextField
            fullWidth
            select
            value={cedulaSeleccionada}
            onChange={handleCedulaChange}
            label="Selecciona una cédula"
          >
            {pacientesMock.map((p) => (
              <MenuItem key={p.cedula} value={p.cedula}>
                {p.cedula}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={handleBuscar}>
            Buscar
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2">Nombre</Typography>
          <TextField fullWidth value={datosPaciente.nombre} disabled />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2">Apellido</Typography>
          <TextField fullWidth value={datosPaciente.apellido} disabled />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2">Tutor - Nombre</Typography>
          <TextField fullWidth value={datosPaciente.tutorNombre} disabled />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2">Tutor - Apellido</Typography>
          <TextField fullWidth value={datosPaciente.tutorApellido} disabled />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2">Observaciones</Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Escriba aquí las observaciones..."
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2">Tipo de Terapia</Typography>
          <TextField
            fullWidth
            select
            value={tipoTerapia}
            onChange={(e) => setTipoTerapia(e.target.value)}
            label="Seleccione el tipo"
          >
            {tiposTerapia.map((tipo, i) => (
              <MenuItem key={i} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="success" fullWidth>
            Guardar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PacienteForm;
