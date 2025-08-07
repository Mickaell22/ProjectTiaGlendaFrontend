// src/views/admin/Paciente.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, Dialog, DialogContent, DialogTitle, Grid,
  IconButton, MenuItem, Paper, Snackbar, Table, TableBody, TableCell,
  TableHead, TablePagination, TableRow, TextField, Typography, Alert, Tooltip
} from '@mui/material';
import { Delete, Edit, Visibility, Search } from '@mui/icons-material';
import axios from 'axios';

const Paciente = () => {
  const [pacientes, setPacientes] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchCedulaPersona, setSearchCedulaPersona] = useState('');
  const [searchCedulaTutor, setSearchCedulaTutor] = useState('');
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [tutorEncontrado, setTutorEncontrado] = useState(null);

  const [formData, setFormData] = useState({
    persona_id: '', tutor_id: '', tipo_terapia: '', fecha_ingreso: '',
    observaciones: '', estado: 'activo'
  });

  const token = localStorage.getItem('jwt_token');
  const headers = { Authorization: `Bearer ${token}` };
  const tiposTerapia = ['Física', 'Ocupacional', 'Lenguaje', 'Psicológica'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/pacientes', { headers });
      setPacientes(res.data.data || []);
    } catch (err) {
      console.error('Error al obtener pacientes:', err);
    }
  };

  const handleBuscarPersona = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/personas?cedula=${searchCedulaPersona}`, { headers });
      const persona = res.data?.data;
      if (persona && typeof persona === 'object' && Object.keys(persona).length > 0) {
        setPersonaEncontrada(persona);
        setFormData(prev => ({ ...prev, persona_id: persona.id }));
        setSnackbar({ open: true, message: 'Persona encontrada', severity: 'success' });
      } else {
        setPersonaEncontrada(null);
        setSnackbar({ open: true, message: 'Persona no encontrada', severity: 'warning' });
      }
    } catch (error) {
      console.error('Error al buscar persona:', error);
      setPersonaEncontrada(null);
      setSnackbar({ open: true, message: 'Error al buscar persona', severity: 'error' });
    }
  };

  const handleBuscarTutor = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/personas?cedula=${searchCedulaTutor}`, { headers });
      const persona = res.data?.data;
      if (persona && typeof persona === 'object' && Object.keys(persona).length > 0) {
        const tutoresRes = await axios.get('http://localhost:5000/api/tutores', { headers });
        const tutor = tutoresRes.data.data.find(t => t.persona_id === persona.id);
        if (tutor) {
          setTutorEncontrado(persona);
          setFormData(prev => ({ ...prev, tutor_id: tutor.id }));
          setSnackbar({ open: true, message: 'Tutor encontrado', severity: 'success' });
        } else {
          setTutorEncontrado(null);
          setSnackbar({ open: true, message: 'No existe tutor con esa cédula', severity: 'warning' });
        }
      } else {
        setTutorEncontrado(null);
        setSnackbar({ open: true, message: 'Persona no encontrada', severity: 'warning' });
      }
    } catch (err) {
      console.error('Error al buscar tutor:', err);
      setTutorEncontrado(null);
      setSnackbar({ open: true, message: 'Error al buscar tutor', severity: 'error' });
    }
  };

  const handleGuardar = async () => {
    try {
      if (!formData.persona_id || !formData.fecha_ingreso) {
        return setSnackbar({ open: true, message: 'Persona y fecha requeridas', severity: 'warning' });
      }

      const usuario_creacion = JSON.parse(localStorage.getItem('user_data'))?.id;
      const dataToSend = { ...formData, usuario_creacion };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/pacientes/${editingId}`, dataToSend, { headers });
        setSnackbar({ open: true, message: 'Paciente actualizado', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/pacientes', dataToSend, { headers });
        setSnackbar({ open: true, message: 'Paciente registrado', severity: 'success' });
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error al guardar:', err);
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({ persona_id: '', tutor_id: '', tipo_terapia: '', fecha_ingreso: '', observaciones: '', estado: 'activo' });
    setPersonaEncontrada(null);
    setTutorEncontrado(null);
    setSearchCedulaPersona('');
    setSearchCedulaTutor('');
    setEditingId(null);
  };

  const handleEdit = (p) => {
    setFormData({
      persona_id: p.persona_id, tutor_id: p.tutor_id || '', tipo_terapia: p.tipo_terapia || '',
      fecha_ingreso: p.fecha_ingreso?.split('T')[0] || '', observaciones: p.observaciones || '', estado: p.estado || 'activo'
    });
    setPersonaEncontrada({ nombre: p.nombre, apellido: p.apellido, cedula: p.cedula });
    setEditingId(p.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/pacientes/${id}`, { headers });
      setSnackbar({ open: true, message: 'Paciente eliminado', severity: 'info' });
      fetchData();
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' });
    }
  };

  return (
    <Box p={2}>
      <Container maxWidth="xl">
        {/* Cabecera */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" fontWeight="bold">Gestión de Pacientes</Typography>
        </Paper>

        {/* Buscar Persona */}
        <Paper elevation={3} sx={{ p: 3, maxWidth: 1000, mx: 'auto', mb: 3 }}>
          <Typography variant="h6">Buscar Persona</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Cédula de Persona" value={searchCedulaPersona} onChange={e => setSearchCedulaPersona(e.target.value)} />
              <Button variant="outlined" fullWidth onClick={handleBuscarPersona} startIcon={<Search />} sx={{ mt: 1 }}>
                Buscar Persona
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              {personaEncontrada && (
                <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f3f3f3' }}>
                  <Typography><strong>Nombre:</strong> {personaEncontrada.nombre} {personaEncontrada.apellido}</Typography>
                  <Typography><strong>Cédula:</strong> {personaEncontrada.cedula}</Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Buscar Tutor */}
        <Paper elevation={3} sx={{ p: 3, maxWidth: 1000, mx: 'auto', mb: 3 }}>
          <Typography variant="h6">Buscar Tutor</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Cédula del Tutor" value={searchCedulaTutor} onChange={e => setSearchCedulaTutor(e.target.value)} />
              <Button variant="outlined" fullWidth onClick={handleBuscarTutor} startIcon={<Search />} sx={{ mt: 1 }}>
                Buscar Tutor
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              {tutorEncontrado && (
                <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f3f3f3' }}>
                  <Typography><strong>Nombre:</strong> {tutorEncontrado.nombre} {tutorEncontrado.apellido}</Typography>
                  <Typography><strong>Cédula:</strong> {tutorEncontrado.cedula}</Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Formulario */}
        <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mb: 4 }}>
          <Typography variant="h6" textAlign="center" color="primary">{editingId ? 'Editar Paciente' : 'Registrar Paciente'}</Typography>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <TextField select fullWidth label="Tipo de Terapia" value={formData.tipo_terapia} onChange={e => setFormData(prev => ({ ...prev, tipo_terapia: e.target.value }))}>
                <MenuItem value="">Seleccione</MenuItem>
                {tiposTerapia.map((t, i) => <MenuItem key={i} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item>
              <TextField type="date" fullWidth label="Fecha Ingreso" InputLabelProps={{ shrink: true }} value={formData.fecha_ingreso} onChange={e => setFormData(prev => ({ ...prev, fecha_ingreso: e.target.value }))} />
            </Grid>
            <Grid item>
              <TextField fullWidth multiline rows={3} label="Observaciones" value={formData.observaciones} onChange={e => setFormData(prev => ({ ...prev, observaciones: e.target.value }))} />
            </Grid>
            <Grid item>
              <Button variant="contained" color="success" fullWidth onClick={handleGuardar}>
                {editingId ? 'Actualizar' : 'Guardar Paciente'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de Pacientes */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>Listado de Pacientes</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Tutor</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Terapia</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pacientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.nombre_completo}</TableCell>
                  <TableCell>{p.cedula}</TableCell>
                  <TableCell>{p.tutor_nombre || 'Sin tutor'}</TableCell>
                  <TableCell>{p.fecha_ingreso?.split('T')[0]}</TableCell>
                  <TableCell>{p.tipo_terapia}</TableCell>
                  <TableCell>
                    <Tooltip title="Ver Detalles"><IconButton color="primary" onClick={() => setDetalle(p)}><Visibility /></IconButton></Tooltip>
                    <Tooltip title="Editar"><IconButton color="success" onClick={() => handleEdit(p)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Eliminar"><IconButton color="error" onClick={() => handleDelete(p.id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination component="div" count={pacientes.length} page={page} onPageChange={(e, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[]} />
        </Paper>

        {/* Detalle del Paciente */}
        <Dialog open={!!detalle} onClose={() => setDetalle(null)}>
          <DialogTitle>Detalle del Paciente</DialogTitle>
          <DialogContent>
            {detalle && (
              <Box>
                <Typography><strong>Nombre:</strong> {detalle.nombre_completo}</Typography>
                <Typography><strong>Cédula:</strong> {detalle.cedula}</Typography>
                <Typography><strong>Tutor:</strong> {detalle.tutor_nombre || 'Sin tutor'}</Typography>
                <Typography><strong>Fecha:</strong> {detalle.fecha_ingreso?.split('T')[0]}</Typography>
                <Typography><strong>Terapia:</strong> {detalle.tipo_terapia}</Typography>
                <Typography><strong>Observaciones:</strong> {detalle.observaciones}</Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Snackbar de notificación */}
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Paciente;
