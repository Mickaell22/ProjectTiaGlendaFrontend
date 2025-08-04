// src/views/admin/Usuario.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid
} from '@mui/material';
import { Delete, Edit, Search } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Usuario = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    usuario: '',
    contrasenia: '',
    confirmarContrasenia: '',
    persona_id: '',
    rol_id: '',
    estado: 'activo',
    usuario_creacion: 1
  });
  const [editingId, setEditingId] = useState(null);
  const [personaEdit, setPersonaEdit] = useState(null);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, personaRes, rolRes] = await Promise.all([
        axios.get('http://localhost:5000/api/usuarios', { headers: getAuthHeaders() }),
        axios.get('http://localhost:5000/api/personas/disponibles', { headers: getAuthHeaders() }),
        axios.get('http://localhost:5000/api/roles', { headers: getAuthHeaders() }),
      ]);
      setUsuarios(userRes.data.data || []);
      setPersonasDisponibles(personaRes.data.data || []);
      setRoles(rolRes.data.data || []);
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
    if (!formData.usuario.trim()) newErrors.usuario = 'Usuario requerido';
    if (!formData.persona_id) newErrors.persona_id = 'Persona requerida';
    if (!formData.rol_id) newErrors.rol_id = 'Rol requerido';
    if (!formData.contrasenia.trim() && !editingId) newErrors.contrasenia = 'Contraseña requerida';
    if (formData.contrasenia && formData.confirmarContrasenia !== formData.contrasenia) newErrors.confirmarContrasenia = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = {
        ...formData,
        persona_id: parseInt(formData.persona_id),
        rol_id: parseInt(formData.rol_id)
      };
      delete payload.confirmarContrasenia;

      if (editingId) {
        await axios.put(`http://localhost:5000/api/usuarios/${editingId}`, {
          ...payload,
          usuario_modificacion: 1,
        }, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Usuario actualizado', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/usuarios', payload, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Usuario creado', severity: 'success' });
      }
      setFormData({ usuario: '', contrasenia: '', confirmarContrasenia: '', persona_id: '', rol_id: '', estado: 'activo', usuario_creacion: 1 });
      setEditingId(null);
      setPersonaEdit(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar usuario';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      usuario: usuario.usuario,
      contrasenia: '',
      confirmarContrasenia: '',
      persona_id: usuario.persona_id,
      rol_id: usuario.rol_id,
      estado: usuario.estado,
      usuario_modificacion: 1,
    });
    setEditingId(usuario.id);
    setPersonaEdit({ id: usuario.persona_id, nombre_completo: usuario.nombre_completo });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/usuarios/${id}`, { headers: getAuthHeaders() });
      setSnackbar({ open: true, message: 'Usuario eliminado', severity: 'info' });
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar usuario', severity: 'error' });
    }
  };

  const filteredUsuarios = usuarios.filter(u =>
    u.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const personasFinal = personaEdit && !personasDisponibles.find(p => p.id === personaEdit.id)
    ? [personaEdit, ...personasDisponibles]
    : personasDisponibles;

  return (
    <Box p={2}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ borderRadius: 3, backgroundColor: '#fff', mb: 4, p: 0, overflow: 'hidden', border: '4px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, red, orange, yellow, green, blue, indigo, violet)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', animation: 'rainbow 5s linear infinite', '@keyframes rainbow': { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '100% 50%' }, }, backgroundSize: '300% 100%' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="black">Gestión de Usuarios</Typography>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 600, mx: 'auto', mb: 4 }}>
          <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>{editingId ? 'Editar Usuario' : 'Registrar Usuario'}</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2} direction="column">
              <Grid item>
                <Typography variant="body1">Usuario:</Typography>
                <TextField fullWidth name="usuario" value={formData.usuario} onChange={handleChange} error={!!errors.usuario} helperText={errors.usuario} />
              </Grid>
              <Grid item>
                <Typography variant="body1">Contraseña:</Typography>
                <TextField fullWidth name="contrasenia" type="password" value={formData.contrasenia} onChange={handleChange} error={!!errors.contrasenia} helperText={errors.contrasenia} />
              </Grid>
              <Grid item>
                <Typography variant="body1">Confirmar Contraseña:</Typography>
                <TextField fullWidth name="confirmarContrasenia" type="password" value={formData.confirmarContrasenia} onChange={handleChange} error={!!errors.confirmarContrasenia} helperText={errors.confirmarContrasenia} />
              </Grid>
              <Grid item>
                <Typography variant="body1">Persona:</Typography>
                <TextField select fullWidth name="persona_id" value={formData.persona_id} onChange={handleChange} error={!!errors.persona_id} helperText={errors.persona_id} SelectProps={{ native: true }}>
                  <option value="">Seleccione</option>
                  {personasFinal.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_completo || `${p.nombre} ${p.apellido}`}</option>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <Typography variant="body1">Rol:</Typography>
                <TextField select fullWidth name="rol_id" value={formData.rol_id} onChange={handleChange} error={!!errors.rol_id} helperText={errors.rol_id} SelectProps={{ native: true }}>
                  <option value="">Seleccione</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
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
            <Typography variant="h6">Listado de Usuarios</Typography>
            <Box mb={2} display="flex" alignItems="center">
              <Search sx={{ mr: 1 }} />
              <TextField label="Buscar por usuario" variant="standard" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} fullWidth />
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Persona</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsuarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>{usuario.usuario}</TableCell>
                    <TableCell>{usuario.nombre_completo}</TableCell>
                    <TableCell>{usuario.rol}</TableCell>
                    <TableCell>{usuario.estado}</TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton color="primary" onClick={() => handleEdit(usuario)}><Edit /></IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleDelete(usuario.id)}><Delete /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination component="div" count={filteredUsuarios.length} page={page} onPageChange={(e, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[10]} />
          </CardContent>
        </Card>

        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Usuario;
