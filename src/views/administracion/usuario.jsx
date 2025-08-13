// src/views/admin/Usuario.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider
} from '@mui/material';
import { Delete, Edit, Search, Visibility, PersonAdd } from '@mui/icons-material';
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
    usuario_creacion: 1,
  });
  const [editingId, setEditingId] = useState(null);
  const [personaEdit, setPersonaEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detalle, setDetalle] = useState(null);
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
    if (formData.contrasenia && formData.confirmarContrasenia !== formData.contrasenia)
      newErrors.confirmarContrasenia = 'Las contraseñas no coinciden';
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
        rol_id: parseInt(formData.rol_id),
      };
      delete payload.confirmarContrasenia;

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/usuarios/${editingId}`,
          { ...payload, usuario_modificacion: 1 },
          { headers: getAuthHeaders() }
        );
        setSnackbar({ open: true, message: 'Usuario actualizado', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/usuarios', payload, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Usuario creado', severity: 'success' });
      }
      setFormData({
        usuario: '',
        contrasenia: '',
        confirmarContrasenia: '',
        persona_id: '',
        rol_id: '',
        estado: 'activo',
        usuario_creacion: 1,
      });
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

  const filteredUsuarios = usuarios.filter((u) =>
    u.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const personasFinal =
    personaEdit && !personasDisponibles.find((p) => p.id === personaEdit.id)
      ? [personaEdit, ...personasDisponibles]
      : personasDisponibles;

  return (
    <Box p={2}>
      <Container maxWidth="md">
        {/* Card con arcoíris (NO tocar) */}
        <Paper
          elevation={4}
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
              Gestión de Usuarios
            </Typography>
          </Box>
        </Paper>

        {/* FORMULARIO (más centrado y angosto) */}
        <Card
          elevation={8}
          sx={{
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header degradado como en Tutor */}
            <Box
              sx={{
                background: editingId
                  ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                  : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white',
                p: 3,
                borderRadius: '16px 16px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonAdd sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {editingId ? 'Editar Usuario' : 'Registrar Usuario'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {editingId
                    ? 'Modifica los campos necesarios y guarda los cambios'
                    : 'Completa los campos para crear un usuario'}
                </Typography>
              </Box>
            </Box>

            {/* Contenedor del formulario centrado */}
            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  width: '100%',
                  maxWidth: 520,      // <-- más angosto
                  mx: 'auto',         // <-- centrado
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: 'primary.main', fontWeight: 'bold', textAlign: 'center', mb: 1 }}
                >
                  Información del Usuario
                </Typography>

                <Grid container spacing={2} direction="column">
                  <Grid item>
                    <Typography variant="body1">Usuario:</Typography>
                    <TextField
                      fullWidth
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      error={!!errors.usuario}
                      helperText={errors.usuario}
                    />
                  </Grid>

                  {!editingId && (
                    <>
                      <Grid item>
                        <Typography variant="body1">Contraseña:</Typography>
                        <TextField
                          fullWidth
                          name="contrasenia"
                          type="password"
                          value={formData.contrasenia}
                          onChange={handleChange}
                          error={!!errors.contrasenia}
                          helperText={errors.contrasenia}
                        />
                      </Grid>
                      <Grid item>
                        <Typography variant="body1">Confirmar Contraseña:</Typography>
                        <TextField
                          fullWidth
                          name="confirmarContrasenia"
                          type="password"
                          value={formData.confirmarContrasenia}
                          onChange={handleChange}
                          error={!!errors.confirmarContrasenia}
                          helperText={errors.confirmarContrasenia}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item>
                    <Typography variant="body1">Persona:</Typography>
                    <TextField
                      select
                      fullWidth
                      name="persona_id"
                      value={formData.persona_id}
                      onChange={handleChange}
                      error={!!errors.persona_id}
                      helperText={errors.persona_id}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {personasFinal.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.nombre_completo || `${p.nombre} ${p.apellido}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item>
                    <Typography variant="body1">Rol:</Typography>
                    <TextField
                      select
                      fullWidth
                      name="rol_id"
                      value={formData.rol_id}
                      onChange={handleChange}
                      error={!!errors.rol_id}
                      helperText={errors.rol_id}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {roles.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item>
                    <Button variant="contained" type="submit" color="primary" fullWidth>
                      {editingId ? 'Actualizar' : 'Registrar'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* LISTADO */}
        <Card>
          <CardContent>
            <Typography variant="h6">Listado de Usuarios</Typography>

            <Box mb={2} display="flex" alignItems="center">
              <Search sx={{ mr: 1 }} />
              <TextField
                label="Buscar por usuario"
                variant="standard"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Persona</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell sx={{ width: 200 }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsuarios
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>{usuario.usuario}</TableCell>
                      <TableCell>{usuario.nombre_completo}</TableCell>
                      <TableCell>{usuario.rol}</TableCell>
                      <TableCell>{usuario.estado}</TableCell>
                      <TableCell align="right" sx={{ minWidth: 200, whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
                          <Tooltip title="Ver detalles">
                            <IconButton color="primary" size="small" onClick={() => setDetalle(usuario)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton color="primary" size="small" onClick={() => handleEdit(usuario)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton color="error" size="small" onClick={() => handleDelete(usuario.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filteredUsuarios.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
              rowsPerPageOptions={[10]}
            />
          </CardContent>
        </Card>

        {/* MODAL DETALLE */}
        <Dialog open={!!detalle} onClose={() => setDetalle(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
            <Visibility sx={{ mr: 1 }} /> Detalle de Usuario
          </DialogTitle>
          <DialogContent sx={{ p: 3, mt: 2 }}>
            {detalle && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Usuario</Typography>
                  <Typography variant="body1" fontWeight="bold">{detalle.usuario}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Estado</Typography>
                  <Typography variant="body1" fontWeight="bold">{detalle.estado}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Persona</Typography>
                  <Typography variant="body1" fontWeight="bold">{detalle.nombre_completo}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Rol</Typography>
                  <Typography variant="body1" fontWeight="bold">{detalle.rol}</Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDetalle(null)} variant="contained" color="primary">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Usuario;
