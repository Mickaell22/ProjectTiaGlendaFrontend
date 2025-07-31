import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, Delete, Edit } from '@mui/icons-material';

const pacientesMock = [
  {
    cedula: '0102030405',
    nombre: 'Juan',
    apellido: 'Pérez',
    tutorNombre: 'Carlos',
    tutorApellido: 'Pérez',
    tipoTerapia: 'Física',
    observaciones: 'Paciente con lesión lumbar'
  },
  {
    cedula: '0605040302',
    nombre: 'Ana',
    apellido: 'Gómez',
    tutorNombre: 'María',
    tutorApellido: 'Gómez',
    tipoTerapia: 'Lenguaje',
    observaciones: 'Dificultades en pronunciación'
  },
];

const tiposTerapia = ['Física', 'Ocupacional', 'Lenguaje', 'Psicológica'];

const Paciente = () => {
  const [cedulaSeleccionada, setCedulaSeleccionada] = useState('');
  const [datosPaciente, setDatosPaciente] = useState({
    nombre: '',
    apellido: '',
    tutorNombre: '',
    tutorApellido: '',
  });
  const [observaciones, setObservaciones] = useState('');
  const [tipoTerapia, setTipoTerapia] = useState('');
  const [pacientes, setPacientes] = useState(pacientesMock);
  const [detalle, setDetalle] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  const handleCedulaChange = (e) => {
    const cedula = e.target.value;
    setCedulaSeleccionada(cedula);
    const paciente = pacientesMock.find((p) => p.cedula === cedula);
    if (paciente) {
      setDatosPaciente(paciente);
      setTipoTerapia(paciente.tipoTerapia || '');
      setObservaciones(paciente.observaciones || '');
    }
  };

  const handleView = (p) => setDetalle(p);
  const handleClose = () => setDetalle(null);
  const handleDelete = (index) => {
    const lista = [...pacientes];
    lista.splice(index, 1);
    setPacientes(lista);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  return (
    <Box p={2} sx={{ ml: { lg: 3, md: 2, sm: 1 } }}>
      <Container maxWidth="xl">
        <Paper elevation={6} sx={{ borderRadius: 3, backgroundColor: '#fff', mb: 4, p: 0, overflow: 'hidden', border: '4px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, red, orange, yellow, green, blue, indigo, violet)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', animation: 'rainbow 5s linear infinite', '@keyframes rainbow': { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '100% 50%' }, }, backgroundSize: '300% 100%' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="black">
              Gestión de Pacientes
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Typography variant="h6" gutterBottom>
            Registro de Paciente
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Cédula del Paciente</Typography>
              <TextField select fullWidth value={cedulaSeleccionada} onChange={handleCedulaChange}>
                {pacientesMock.map((p) => (
                  <MenuItem key={p.cedula} value={p.cedula}>
                    {p.cedula}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Nombre</Typography>
              <TextField fullWidth value={datosPaciente.nombre} disabled />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Apellido</Typography>
              <TextField fullWidth value={datosPaciente.apellido} disabled />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Nombre del Tutor</Typography>
              <TextField fullWidth value={datosPaciente.tutorNombre} disabled />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Apellido del Tutor</Typography>
              <TextField fullWidth value={datosPaciente.tutorApellido} disabled />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Tipo de Terapia</Typography>
              <TextField select fullWidth value={tipoTerapia} onChange={(e) => setTipoTerapia(e.target.value)}>
                {tiposTerapia.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography gutterBottom>Observaciones</Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4} display="flex" justifyContent="flex-end" alignItems="flex-end">
              <Button variant="contained" color="primary" sx={{ px: 4, py: 1.5 }}>
                Guardar Paciente
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Listado de Pacientes
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Tipo Terapia</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pacientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pac, index) => (
                <TableRow key={index}>
                  <TableCell>{pac.nombre}</TableCell>
                  <TableCell>{pac.apellido}</TableCell>
                  <TableCell>{pac.cedula}</TableCell>
                  <TableCell>{pac.tipoTerapia}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleView(pac)}>
                      <Visibility />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(index + page * rowsPerPage)}>
                      <Delete />
                    </IconButton>
                    <IconButton disabled>
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={pacientes.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </Paper>
      </Container>

      <Dialog open={!!detalle} onClose={handleClose}>
        <DialogTitle>Detalle del Paciente</DialogTitle>
        <DialogContent>
          {detalle && (
            <Box>
              <Typography><strong>Nombre:</strong> {detalle.nombre}</Typography>
              <Typography><strong>Apellido:</strong> {detalle.apellido}</Typography>
              <Typography><strong>Cédula:</strong> {detalle.cedula}</Typography>
              <Typography><strong>Tutor:</strong> {detalle.tutorNombre} {detalle.tutorApellido}</Typography>
              <Typography><strong>Tipo de Terapia:</strong> {detalle.tipoTerapia}</Typography>
              <Typography><strong>Observaciones:</strong> {detalle.observaciones}</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Paciente;