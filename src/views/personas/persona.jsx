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
  DialogContent
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
    fechaNacimiento: ''
  });

  const [personas, setPersonas] = useState([
    {
      nombre: 'Juan',
      apellido: 'Pérez',
      cedula: '0102030405',
      telefono: '0991234567',
      correo: 'juan@example.com',
      direccion: 'Av. Siempre Viva 123',
      fechaNacimiento: '1990-01-01'
    },
    {
      nombre: 'Ana',
      apellido: 'Gómez',
      cedula: '0605040302',
      telefono: '0987654321',
      correo: 'ana@example.com',
      direccion: 'Calle Falsa 456',
      fechaNacimiento: '1988-05-15'
    },
    {
      nombre: 'Carlos',
      apellido: 'Ramírez',
      cedula: '1102938475',
      telefono: '0976543210',
      correo: 'carlos@example.com',
      direccion: 'Av. de los Shyris 789',
      fechaNacimiento: '1992-11-20'
    },
    {
      nombre: 'Lucía',
      apellido: 'Fernández',
      cedula: '0807060504',
      telefono: '0965432109',
      correo: 'lucia@example.com',
      direccion: 'Calle Amazonas 321',
      fechaNacimiento: '1995-03-08'
    },
    {
      nombre: 'Pedro',
      apellido: 'Sánchez',
      cedula: '0504030201',
      telefono: '0954321098',
      correo: 'pedro@example.com',
      direccion: 'Malecón 2000',
      fechaNacimiento: '1993-09-25'
    }
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
      fechaNacimiento: ''
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
    <Box p={4}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 6, mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Registro de Persona
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Cédula" name="cedula" value={formData.cedula} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Correo" name="correo" value={formData.correo} onChange={handleChange} type="email" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha de Nacimiento"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button variant="contained" color="primary" type="submit">
                  Guardar Persona
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>Listado de Personas</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {personas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((persona, index) => (
                <TableRow key={index}>
                  <TableCell>{persona.nombre}</TableCell>
                  <TableCell>{persona.apellido}</TableCell>
                  <TableCell>{persona.cedula}</TableCell>
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
