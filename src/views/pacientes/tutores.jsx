import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, Grid, MenuItem, Paper, TextField, Typography,
  Table, TableBody, TableCell, TableHead, TableRow, TablePagination,
  IconButton, Snackbar, Alert, Tooltip
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const opcionesParentesco = ['madre', 'padre', 'abuelo', 'abuela', 'hermano', 'hermana', 'tio', 'tia', 'otro'];

const Tutor = () => {
  const [tutores, setTutores] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [formData, setFormData] = useState({
    persona_id: '',
    parentesco: '',
    es_contacto_emergencia: true,
    observaciones_tutor: '',
    paciente_id: '',
  });
  const [editingTutorId, setEditingTutorId] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem('jwt_token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchTutores = async () => {
    const res = await axios.get('http://localhost:5000/api/tutores', { headers });
    setTutores(res.data.data || []);
  };

  const fetchPersonasDisponibles = async () => {
    const res = await axios.get('http://localhost:5000/api/tutores/personas-disponibles', { headers });
    setPersonasDisponibles(res.data.data || []);
  };

  const fetchPacientes = async () => {
    const res = await axios.get('http://localhost:5000/api/pacientes', { headers });
    setPacientes(res.data.data || []);
  };

  useEffect(() => {
    fetchTutores();
    fetchPersonasDisponibles();
    fetchPacientes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const resetForm = () => {
    setFormData({
      persona_id: '',
      parentesco: '',
      es_contacto_emergencia: true,
      observaciones_tutor: '',
      paciente_id: '',
    });
    setEditingTutorId(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.persona_id) newErrors.persona_id = 'Seleccione una persona';
    if (!formData.paciente_id && !editingTutorId) newErrors.paciente_id = 'Seleccione un paciente';
    if (!formData.parentesco) newErrors.parentesco = 'Parentesco requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardarTutor = async () => {
    if (!validateForm()) return;

    try {
      if (editingTutorId) {
        await axios.put(`http://localhost:5000/api/tutores/${editingTutorId}`, {
          parentesco: formData.parentesco,
          es_contacto_emergencia: formData.es_contacto_emergencia,
          observaciones_tutor: formData.observaciones_tutor
        }, { headers });
        setSnackbar({ open: true, message: 'Tutor actualizado correctamente', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/tutores', {
          persona_id: parseInt(formData.persona_id),
          parentesco: formData.parentesco,
          es_contacto_emergencia: formData.es_contacto_emergencia,
          observaciones_tutor: formData.observaciones_tutor
        }, { headers });

        const pacienteRes = await axios.get(`http://localhost:5000/api/pacientes/${formData.paciente_id}`, { headers });
        const paciente = pacienteRes.data.data;

        await axios.put(`http://localhost:5000/api/pacientes/${formData.paciente_id}`, {
          persona_id: paciente.persona_id,
          tutor_id: parseInt(formData.persona_id),
          fecha_ingreso: paciente.fecha_ingreso,
          observaciones: paciente.observaciones
        }, { headers });

        setSnackbar({ open: true, message: 'Tutor creado y asignado correctamente', severity: 'success' });
      }

      await fetchTutores();
      await fetchPersonasDisponibles();
      resetForm();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al guardar tutor', severity: 'error' });
      console.error(err);
    }
  };

  const handleEditar = (tutor) => {
    setEditingTutorId(tutor.id);
    setFormData({
      persona_id: tutor.persona_id,
      parentesco: tutor.parentesco,
      es_contacto_emergencia: tutor.es_contacto_emergencia,
      observaciones_tutor: tutor.observaciones_tutor,
      paciente_id: '' // no editable
    });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Desea eliminar este tutor?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/tutores/${id}`, { headers });
      await fetchTutores();
      setSnackbar({ open: true, message: 'Tutor eliminado correctamente', severity: 'info' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar tutor', severity: 'error' });
    }
  };

  return (
    <Box p={2}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{
          borderRadius: 3,
          backgroundColor: '#fff',
          mb: 4,
          p: 0,
          overflow: 'hidden',
          border: '4px solid transparent',
          backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, red, orange, yellow, green, blue, indigo, violet)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          animation: 'rainbow 5s linear infinite',
          '@keyframes rainbow': {
            '0%': { backgroundPosition: '0% 50%' },
            '100%': { backgroundPosition: '100% 50%' },
          },
          backgroundSize: '300% 100%'
        }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="black">Gestión de Tutores</Typography>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 600, mx: 'auto', mb: 4 }}>
          <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
            {editingTutorId ? 'Editar Tutor' : 'Registrar Tutor'}
          </Typography>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Typography>Persona (Tutor):</Typography>
              <TextField select fullWidth name="persona_id" value={formData.persona_id} onChange={handleChange} error={!!errors.persona_id} helperText={errors.persona_id} disabled={!!editingTutorId}>
                <MenuItem value="">Seleccione</MenuItem>
                {personasDisponibles.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.cedula} - {p.nombre} {p.apellido}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {!editingTutorId && (
              <Grid item>
                <Typography>Paciente a Cargo:</Typography>
                <TextField select fullWidth name="paciente_id" value={formData.paciente_id} onChange={handleChange} error={!!errors.paciente_id} helperText={errors.paciente_id}>
                  <MenuItem value="">Seleccione</MenuItem>
                  {pacientes.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.cedula} - {p.nombre} {p.apellido}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item>
              <Typography>Parentesco:</Typography>
              <TextField select fullWidth name="parentesco" value={formData.parentesco} onChange={handleChange} error={!!errors.parentesco} helperText={errors.parentesco}>
                <MenuItem value="">Seleccione</MenuItem>
                {opcionesParentesco.map(op => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item>
              <Typography>Observaciones:</Typography>
              <TextField name="observaciones_tutor" fullWidth multiline rows={2} value={formData.observaciones_tutor} onChange={handleChange} />
            </Grid>
            <Grid item>
              <Button variant="contained" color="success" fullWidth onClick={handleGuardarTutor}>
                {editingTutorId ? 'Actualizar' : 'Guardar Tutor'}
              </Button>
            </Grid>
            {editingTutorId && (
              <Grid item>
                <Button variant="outlined" fullWidth onClick={resetForm}>Cancelar Edición</Button>
              </Grid>
            )}
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>Listado de Tutores</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Parentesco</TableCell>
                <TableCell>Observaciones</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tutores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(tutor => (
                <TableRow key={tutor.id}>
                  <TableCell>{tutor.id}</TableCell>
                  <TableCell>{tutor.nombre_completo}</TableCell>
                  <TableCell>{tutor.parentesco}</TableCell>
                  <TableCell>{tutor.observaciones_tutor}</TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleEditar(tutor)}><Edit /></IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => handleEliminar(tutor.id)}><Delete /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination component="div" count={tutores.length} page={page} onPageChange={(e, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[]} />
        </Paper>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Tutor;
