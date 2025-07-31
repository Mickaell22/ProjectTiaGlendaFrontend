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

const alumnosMock = [
  {
    cedula: '0102030405',
    nombre: 'Juan',
    apellido: 'Pérez',
    tutorNombre: 'Carlos',
    tutorApellido: 'Pérez',
    tipoAyuda: 'Refuerzo académico',
    observaciones: 'Necesita apoyo en matemáticas'
  },
  {
    cedula: '0605040302',
    nombre: 'Ana',
    apellido: 'Gómez',
    tutorNombre: 'María',
    tutorApellido: 'Gómez',
    tipoAyuda: 'Apoyo emocional',
    observaciones: 'Dificultades para integrarse al grupo'
  },
];

const tiposAyuda = ['Refuerzo académico', 'Apoyo emocional', 'Orientación vocacional'];

const Alumno = () => {
  const [cedulaSeleccionada, setCedulaSeleccionada] = useState('');
  const [datosAlumno, setDatosAlumno] = useState({
    nombre: '',
    apellido: '',
    tutorNombre: '',
    tutorApellido: '',
  });
  const [observaciones, setObservaciones] = useState('');
  const [tipoAyuda, setTipoAyuda] = useState('');
  const [alumnos, setAlumnos] = useState(alumnosMock);
  const [detalle, setDetalle] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  const handleCedulaChange = (e) => {
    const cedula = e.target.value;
    setCedulaSeleccionada(cedula);
    const alumno = alumnosMock.find((a) => a.cedula === cedula);
    if (alumno) {
      setDatosAlumno(alumno);
      setTipoAyuda(alumno.tipoAyuda || '');
      setObservaciones(alumno.observaciones || '');
    }
  };

  const handleView = (a) => setDetalle(a);
  const handleClose = () => setDetalle(null);
  const handleDelete = (index) => {
    const lista = [...alumnos];
    lista.splice(index, 1);
    setAlumnos(lista);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  return (
    <Box p={2}>
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
              'linear-gradient(white, white), linear-gradient(270deg, red, orange, yellow, green, blue, indigo, violet)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            animation: 'rainbow 5s linear infinite',
            '@keyframes rainbow': {
              '0%': { backgroundPosition: '0% 50%' },
              '100%': { backgroundPosition: '100% 50%' },
            },
            backgroundSize: '300% 100%',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="black">
              Gestión de Alumnos
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Typography variant="h6" gutterBottom>
            Registro de Alumno
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Cédula del Alumno</Typography>
              <TextField select fullWidth value={cedulaSeleccionada} onChange={handleCedulaChange}>
                {alumnosMock.map((a) => (
                  <MenuItem key={a.cedula} value={a.cedula}>
                    {a.cedula}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Nombre</Typography>
              <TextField fullWidth value={datosAlumno.nombre} disabled />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Apellido</Typography>
              <TextField fullWidth value={datosAlumno.apellido} disabled />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Nombre del Tutor</Typography>
              <TextField fullWidth value={datosAlumno.tutorNombre} disabled />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Apellido del Tutor</Typography>
              <TextField fullWidth value={datosAlumno.tutorApellido} disabled />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>Tipo de Ayuda Pedagógica</Typography>
              <TextField select fullWidth value={tipoAyuda} onChange={(e) => setTipoAyuda(e.target.value)}>
                {tiposAyuda.map((tipo) => (
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
                Guardar Alumno
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Listado de Alumnos
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Tipo Ayuda</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alumnos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((alumno, index) => (
                <TableRow key={index}>
                  <TableCell>{alumno.nombre}</TableCell>
                  <TableCell>{alumno.apellido}</TableCell>
                  <TableCell>{alumno.cedula}</TableCell>
                  <TableCell>{alumno.tipoAyuda}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleView(alumno)}>
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
            count={alumnos.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </Paper>
      </Container>

      <Dialog open={!!detalle} onClose={handleClose}>
        <DialogTitle>Detalle del Alumno</DialogTitle>
        <DialogContent>
          {detalle && (
            <Box>
              <Typography><strong>Nombre:</strong> {detalle.nombre}</Typography>
              <Typography><strong>Apellido:</strong> {detalle.apellido}</Typography>
              <Typography><strong>Cédula:</strong> {detalle.cedula}</Typography>
              <Typography><strong>Tutor:</strong> {detalle.tutorNombre} {detalle.tutorApellido}</Typography>
              <Typography><strong>Tipo de Ayuda Pedagógica:</strong> {detalle.tipoAyuda}</Typography>
              <Typography><strong>Observaciones:</strong> {detalle.observaciones}</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Alumno;