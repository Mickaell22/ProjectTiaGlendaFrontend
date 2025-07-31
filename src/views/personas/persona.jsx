import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

const Persona = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    direccion: '',
    fechaNacimiento: '',
  });

  const [personas, setPersonas] = useState([
    {
      nombre: 'Juan',
      apellido: 'Pérez',
      cedula: '0102030405',
      telefono: '0991234567',
      correo: 'juan@example.com',
      direccion: 'Av. Siempre Viva 123',
      fechaNacimiento: '1990-01-01',
    },
    {
      nombre: 'Ana',
      apellido: 'Gómez',
      cedula: '0605040302',
      telefono: '0987654321',
      correo: 'ana@example.com',
      direccion: 'Calle Falsa 456',
      fechaNacimiento: '1988-05-15',
    },
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [detalle, setDetalle] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPersonas([...personas, formData]);
    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      correo: '',
      direccion: '',
      fechaNacimiento: '',
    });
  };

  const handleDelete = (index) => {
    const nuevasPersonas = [...personas];
    nuevasPersonas.splice(index, 1);
    setPersonas(nuevasPersonas);
  };

  const handleView = (persona) => {
    setDetalle(persona);
  };

  const handleClose = () => {
    setDetalle(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box p={2} sx={{ ml: { lg: 2, md: 2, sm: 1 } }}>
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
              Gestión de Personas
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Typography variant="h6" gutterBottom>
            Registro de Persona
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Nombre :</Typography>
                <TextField fullWidth variant="outlined" name="nombre" value={formData.nombre} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Apellido :</Typography>
                <TextField fullWidth variant="outlined" name="apellido" value={formData.apellido} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Cédula :</Typography>
                <TextField fullWidth variant="outlined" name="cedula" value={formData.cedula} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Teléfono :</Typography>
                <TextField fullWidth variant="outlined" name="telefono" value={formData.telefono} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Dirección :</Typography>
                <TextField fullWidth variant="outlined" name="direccion" value={formData.direccion} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Correo :</Typography>
                <TextField fullWidth variant="outlined" name="correo" type="email" value={formData.correo} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Fecha de Nacimiento</Typography>
                <TextField fullWidth variant="outlined" name="fechaNacimiento" type="date" InputLabelProps={{ shrink: true }} value={formData.fechaNacimiento} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={4} display="flex" alignItems="flex-end">
                <Button variant="contained" color="primary" type="submit">
                  Guardar Persona
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Listado de Personas
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {personas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((persona, index) => (
                  <TableRow key={index}>
                    <TableCell>{persona.nombre}</TableCell>
                    <TableCell>{persona.apellido}</TableCell>
                    <TableCell>{persona.cedula}</TableCell>
                    <TableCell>{persona.direccion}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleView(persona)}>
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
            count={personas.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </Paper>
      </Container>

      <Dialog open={!!detalle} onClose={handleClose}>
        <DialogTitle>Detalle de Persona</DialogTitle>
        <DialogContent>
          {detalle && (
            <Box>
              <Typography><strong>Nombre:</strong> {detalle.nombre}</Typography>
              <Typography><strong>Apellido:</strong> {detalle.apellido}</Typography>
              <Typography><strong>Cédula:</strong> {detalle.cedula}</Typography>
              <Typography><strong>Teléfono:</strong> {detalle.telefono}</Typography>
              <Typography><strong>Correo:</strong> {detalle.correo}</Typography>
              <Typography><strong>Dirección:</strong> {detalle.direccion}</Typography>
              <Typography><strong>Fecha de Nacimiento:</strong> {detalle.fechaNacimiento}</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Persona;