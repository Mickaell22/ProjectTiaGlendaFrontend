import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Paper,
} from '@mui/material';

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
    tutorNombre: '',
    tutorApellido: '',
  });
  const [observaciones, setObservaciones] = useState('');
  const [tipoTerapia, setTipoTerapia] = useState('');

  const handleCedulaChange = (e) => {
    setCedulaSeleccionada(e.target.value);
  };

  const handleBuscar = () => {
    const paciente = pacientesMock.find((p) => p.cedula === cedulaSeleccionada);
    if (paciente) {
      setDatosPaciente({
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        tutorNombre: paciente.tutorNombre,
        tutorApellido: paciente.tutorApellido,
      });
    } else {
      setDatosPaciente({
        nombre: '',
        apellido: '',
        tutorNombre: '',
        tutorApellido: '',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const datosFinales = {
      ...datosPaciente,
      observaciones,
      tipoTerapia,
    };
    console.log(datosFinales);
    alert('Datos del paciente registrados');
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        my: 4,
      }}
    >
      <Typography variant="h6" align="center" mb={3}>
        Formulario de Paciente
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Fila 1: Cédula y Buscar */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Cédula del Paciente"
              value={cedulaSeleccionada}
              onChange={handleCedulaChange}
            >
              {pacientesMock.map((p) => (
                <MenuItem key={p.cedula} value={p.cedula}>
                  {p.cedula}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleBuscar}
              sx={{ height: '100%' }}
            >
              Buscar
            </Button>
          </Grid>

          {/* Fila 2: Nombre y Apellido */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre"
              value={datosPaciente.nombre}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellido"
              value={datosPaciente.apellido}
              disabled
            />
          </Grid>

          {/* Fila 3: Tutor Nombre y Apellido */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tutor - Nombre"
              value={datosPaciente.tutorNombre}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tutor - Apellido"
              value={datosPaciente.tutorApellido}
              disabled
            />
          </Grid>

          {/* Fila 4: Observaciones y Tipo Terapia */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Observaciones"
              multiline
              minRows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Tipo de Terapia"
              value={tipoTerapia}
              onChange={(e) => setTipoTerapia(e.target.value)}
            >
              {tiposTerapia.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Fila 5: Botón Guardar centrado */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Button type="submit" variant="contained" color="success">
                Guardar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default PacienteForm;
