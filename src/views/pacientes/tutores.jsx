import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';

const tutoresMock = [
  {
    cedula: '0102030405',
    nombre: 'Carlos',
    apellido: 'Pérez',
    direccion: 'Av. Siempre Viva 123',
    telefono: '0991234567',
    correo: 'carlos@example.com',
    parentesco: 'Padre',
    fechaIngreso: '2023-01-10',
    observaciones: 'Tutor puntual',
    personaACargo: {
      cedula: '1111222233',
      nombre: 'Juan',
      apellido: 'Pérez',
    },
  },
  {
    cedula: '0605040302',
    nombre: 'María',
    apellido: 'Gómez',
    direccion: 'Calle Falsa 456',
    telefono: '0987654321',
    correo: 'maria@example.com',
    parentesco: 'Madre',
    fechaIngreso: '2023-03-15',
    observaciones: 'Participa en reuniones',
    personaACargo: {
      cedula: '3333444455',
      nombre: 'Ana',
      apellido: 'Gómez',
    },
  },
];

const opcionesParentesco = ['Madre', 'Padre', 'Abuela/o', 'Hermana/o', 'Otro'];

const Tutor = () => {
  const [cedulaTutorSeleccionada, setCedulaTutorSeleccionada] = useState('');
  const [datosTutor, setDatosTutor] = useState({
    nombre: '', apellido: '', direccion: '', telefono: '', correo: '', parentesco: '', fechaIngreso: '', observaciones: ''
  });
  const [personaACargoCedula, setPersonaACargoCedula] = useState('');
  const [personaACargo, setPersonaACargo] = useState({ nombre: '', apellido: '' });
  const [tutores, setTutores] = useState(tutoresMock);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  const handleBuscarTutor = () => {
    const tutor = tutoresMock.find((t) => t.cedula === cedulaTutorSeleccionada);
    if (tutor) {
      setDatosTutor(tutor);
      setPersonaACargoCedula(tutor.personaACargo.cedula || '');
      setPersonaACargo({
        nombre: tutor.personaACargo.nombre || '',
        apellido: tutor.personaACargo.apellido || '',
      });
    }
  };

  const handleBuscarPersonaACargo = () => {
    const tutor = tutoresMock.find((t) => t.personaACargo.cedula === personaACargoCedula);
    if (tutor) {
      setPersonaACargo({
        nombre: tutor.personaACargo.nombre,
        apellido: tutor.personaACargo.apellido,
      });
    } else {
      setPersonaACargo({ nombre: '', apellido: '' });
    }
  };

  const handleGuardarTutor = () => {
    const nuevoTutor = {
      cedula: cedulaTutorSeleccionada,
      ...datosTutor,
      personaACargo: {
        cedula: personaACargoCedula,
        nombre: personaACargo.nombre,
        apellido: personaACargo.apellido,
      },
    };
    setTutores([...tutores, nuevoTutor]);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  return (
    <Box p={2} sx={{ ml: { lg: 3, md: 2, sm: 1 } }}>
      <Container maxWidth="xl">
        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            backgroundColor: '#fff',
            mb: 4,
            p: 0,
            overflow: 'hidden',
            border: '4px solid transparent',
            backgroundImage:
              'linear-gradient(white, white), linear-gradient(270deg, #ff0000, #ff9900, #33cc33, #3399ff, #cc33ff)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            animation: 'gradient 5s linear infinite',
            backgroundSize: '300% 100%',
            '@keyframes gradient': {
              '0%': { backgroundPosition: '0% 50%' },
              '100%': { backgroundPosition: '100% 50%' },
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="black">
              Gestión de Tutores
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
  <Typography variant="h6" gutterBottom>
    Registro de Tutores
  </Typography>
  <Grid container spacing={2} alignItems="flex-end">

            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Cédula del Tutor</Typography>
              <TextField select fullWidth value={cedulaTutorSeleccionada} onChange={(e) => setCedulaTutorSeleccionada(e.target.value)}>
                {tutoresMock.map((t) => (
                  <MenuItem key={t.cedula} value={t.cedula}>{t.cedula}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button fullWidth variant="contained" color="primary" onClick={handleBuscarTutor}>
                Buscar
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={4}><Typography gutterBottom>Nombre</Typography><TextField fullWidth value={datosTutor.nombre} disabled /></Grid>
            <Grid item xs={12} sm={6} md={4}><Typography gutterBottom>Apellido</Typography><TextField fullWidth value={datosTutor.apellido} disabled /></Grid>
            <Grid item xs={12} sm={6} md={4}><Typography gutterBottom>Dirección</Typography><TextField fullWidth value={datosTutor.direccion} disabled /></Grid>
            <Grid item xs={12} sm={6} md={4}><Typography gutterBottom>Teléfono</Typography><TextField fullWidth value={datosTutor.telefono} disabled /></Grid>
            <Grid item xs={12} sm={6} md={4}><Typography gutterBottom>Correo</Typography><TextField fullWidth value={datosTutor.correo} disabled /></Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Parentesco</Typography>
              <TextField select fullWidth value={datosTutor.parentesco} disabled>
                {opcionesParentesco.map((opcion) => (
                  <MenuItem key={opcion} value={opcion}>{opcion}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Fecha de Ingreso</Typography>
              <TextField fullWidth type="date" value={datosTutor.fechaIngreso} disabled />
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography gutterBottom>Observaciones</Typography>
              <TextField fullWidth multiline minRows={2} value={datosTutor.observaciones} disabled />
            </Grid>

            <Grid item xs={12} sm={6} md={4}><Typography gutterBottom>Cédula Persona a Cargo</Typography><TextField fullWidth value={personaACargoCedula} onChange={(e) => setPersonaACargoCedula(e.target.value)} /></Grid>
            <Grid item xs={12} sm={6} md={2}><Button fullWidth variant="contained" color="primary" onClick={handleBuscarPersonaACargo}>Buscar</Button></Grid>
            <Grid item xs={12} sm={6} md={3}><Typography gutterBottom>Nombre Persona a Cargo</Typography><TextField fullWidth value={personaACargo.nombre} disabled /></Grid>
            <Grid item xs={12} sm={6} md={3}><Typography gutterBottom>Apellido Persona a Cargo</Typography><TextField fullWidth value={personaACargo.apellido} disabled /></Grid>

            <Grid item xs={12} display="flex" justifyContent="flex-end">
              <Button variant="contained" color="success" onClick={handleGuardarTutor}>Guardar Tutor</Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Listado de Tutores
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cédula</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Parentesco</TableCell>
                <TableCell>Persona a Cargo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tutores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tutor, index) => (
                <TableRow key={index}>
                  <TableCell>{tutor.cedula}</TableCell>
                  <TableCell>{tutor.nombre}</TableCell>
                  <TableCell>{tutor.apellido}</TableCell>
                  <TableCell>{tutor.parentesco}</TableCell>
                  <TableCell>{tutor.personaACargo?.nombre} {tutor.personaACargo?.apellido}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={tutores.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default Tutor;
