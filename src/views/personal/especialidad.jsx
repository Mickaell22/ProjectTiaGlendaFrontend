// src/views/admin/Especialidad.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid
} from '@mui/material';
import { Delete, Edit, Search } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Especialidad = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', area: '', estado: 'activo' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/especialidades', { headers: getAuthHeaders() });
      setEspecialidades(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setSnackbar({ open: true, message: 'Sesión expirada.', severity: 'error' });
        setTimeout(() => navigate('/auth/login'), 2000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre requerido';
    if (!formData.area) newErrors.area = 'Área requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/especialidades/id/${editingId}`, formData, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Especialidad actualizada', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/especialidades', formData, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Especialidad creada', severity: 'success' });
      }
      setFormData({ nombre: '', area: '', estado: 'activo' });
      setEditingId(null);
      fetchEspecialidades();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar especialidad';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleEdit = (item) => {
    setFormData({ nombre: item.nombre, area: item.area, estado: item.estado });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/especialidades/id/${id}`, { headers: getAuthHeaders() });
      setSnackbar({ open: true, message: 'Especialidad eliminada correctamente', severity: 'info' });
      setEspecialidades((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      setSnackbar({ open: true, message: 'No se puede eliminar. Está siendo utilizada.', severity: 'error' });
    }
  };

  const filteredList = especialidades.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={2}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ borderRadius: 3, backgroundColor: '#fff', mb: 4, p: 0, overflow: 'hidden', border: '4px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, red, orange, yellow, green, blue, indigo, violet)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', animation: 'rainbow 5s linear infinite', '@keyframes rainbow': { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '100% 50%' }, }, backgroundSize: '300% 100%' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="black">Gestión de Especialidades</Typography>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 600, mx: 'auto', mb: 4 }}>
          <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>{editingId ? 'Editar Especialidad' : 'Registrar Especialidad'}</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2} direction="column">
              <Grid item>
                <Typography variant="body1">Nombre:</Typography>
                <TextField fullWidth name="nombre" value={formData.nombre} onChange={handleChange} error={!!errors.nombre} helperText={errors.nombre} />
              </Grid>
              <Grid item>
                <Typography variant="body1">Área:</Typography>
                <TextField select fullWidth name="area" value={formData.area} onChange={handleChange} error={!!errors.area} helperText={errors.area} SelectProps={{ native: true }}>
                  <option value="">Seleccione</option>
                  <option value="terapeutico">Terapéutico</option>
                  <option value="pedagogico">Pedagógico</option>
                </TextField>
              </Grid>
              <Grid item>
                <Button variant="contained" type="submit" color="primary" fullWidth>{editingId ? 'Actualizar' : 'Registrar'}</Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Card>
          <CardContent>
            <Typography variant="h6">Listado de Especialidades</Typography>
            <Box mb={2} display="flex" alignItems="center">
              <Search sx={{ mr: 1 }} />
              <TextField label="Buscar por nombre" variant="standard" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth />
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>{item.area}</TableCell>
                    <TableCell>{item.estado}</TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton color="primary" onClick={() => handleEdit(item)}><Edit /></IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleDelete(item.id)}><Delete /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination component="div" count={filteredList.length} page={page} onPageChange={(e, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[10]} />
          </CardContent>
        </Card>

        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Especialidad;
