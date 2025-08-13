import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, Grid, MenuItem, Paper, TextField, Typography,
  Table, TableBody, TableCell, TableHead, TableRow, TablePagination,
  IconButton, Snackbar, Alert, Tooltip, Card, CardContent, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Edit, Delete, PersonAdd, Search, Visibility } from '@mui/icons-material';
import axios from 'axios';

const opcionesParentesco = ['madre', 'padre', 'abuelo', 'abuela', 'hermano', 'hermana', 'tio', 'tia', 'otro'];

const Tutor = () => {
  const [tutores, setTutores] = useState([]);
  const [formData, setFormData] = useState({
    persona_id: '',
    parentesco: '',
    es_contacto_emergencia: true,
    observaciones_tutor: '',
  });
  const [editingTutorId, setEditingTutorId] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});

  // Buscar Persona (Tutor) por cédula
  const [searchCedulaPersona, setSearchCedulaPersona] = useState('');
  const [personaEncontrada, setPersonaEncontrada] = useState(null);

  // Detalle (modal)
  const [detalle, setDetalle] = useState(null);

  const token = localStorage.getItem('jwt_token');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchTutores = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tutores', { headers });
      setTutores(res.data?.data || []);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error cargando tutores', severity: 'error' });
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTutores();
  }, []);

  const handleBuscarPersona = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/personas', { headers });
      const persona = res.data?.data?.find(p => p.cedula === searchCedulaPersona);
      if (persona) {
        setPersonaEncontrada(persona);
        setFormData(prev => ({ ...prev, persona_id: persona.id }));
        setSnackbar({ open: true, message: 'Persona (tutor) encontrada', severity: 'success' });
      } else {
        setPersonaEncontrada(null);
        setFormData(prev => ({ ...prev, persona_id: '' }));
        setSnackbar({ open: true, message: 'Persona no encontrada', severity: 'warning' });
      }
    } catch (error) {
      console.error('Error al buscar persona:', error);
      setSnackbar({ open: true, message: 'Error al buscar persona', severity: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'es_contacto_emergencia') {
      setFormData(prev => ({ ...prev, es_contacto_emergencia: value === 'true' || value === true }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const resetForm = () => {
    setFormData({
      persona_id: '',
      parentesco: '',
      es_contacto_emergencia: true,
      observaciones_tutor: '',
    });
    setPersonaEncontrada(null);
    setSearchCedulaPersona('');
    setEditingTutorId(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.persona_id) newErrors.persona_id = 'Seleccione la persona (tutor) usando la búsqueda por cédula';
    if (!formData.parentesco) newErrors.parentesco = 'Parentesco requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGuardarTutor = async () => {
    if (!validateForm()) return;

    try {
      if (editingTutorId) {
        await axios.put(`http://localhost:5000/api/tutores/${editingTutorId}`, {
          persona_id: formData.persona_id, // si tu backend no permite cambiar persona, puedes omitirlo
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
        setSnackbar({ open: true, message: 'Tutor creado correctamente', severity: 'success' });
      }

      await fetchTutores();
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
      parentesco: tutor.parentesco || '',
      es_contacto_emergencia: !!tutor.es_contacto_emergencia,
      observaciones_tutor: tutor.observaciones_tutor || '',
    });

    // Prellenar panel de persona encontrada para mostrarla
    const [nombre, ...resto] = (tutor.nombre_completo || '').split(' ');
    setPersonaEncontrada({
      id: tutor.persona_id,
      nombre: nombre || '',
      apellido: resto.join(' ') || '',
      cedula: tutor.cedula || '',
    });
    setSearchCedulaPersona(tutor.cedula || '');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Desea eliminar este tutor?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/tutores/${id}`, { headers });
      await fetchTutores();
      setSnackbar({ open: true, message: 'Tutor eliminado correctamente', severity: 'info' });
      if (editingTutorId === id) resetForm();
      if (detalle?.id === id) setDetalle(null);
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar tutor', severity: 'error' });
    }
  };

  const boolToSiNo = (v) => (v ? 'Sí' : 'No');

  return (
    <Box p={2}>
      <Container maxWidth="md">
        {/* Cabecera con arcoíris (no tocar) */}
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

        {/* FORMULARIO (estilo Persona) */}
        <Card
          elevation={8}
          sx={{
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                background: editingTutorId
                  ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                  : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white',
                p: 3,
                borderRadius: '16px 16px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PersonAdd sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {editingTutorId ? 'Editar Tutor' : 'Registrar Tutor'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {editingTutorId
                    ? 'Modifica los campos necesarios y guarda los cambios'
                    : 'Busca a la persona por cédula y completa los datos del tutor'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Buscar Persona (Tutor) */}
              <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Buscar Persona (Tutor)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cédula de Persona"
                      value={searchCedulaPersona}
                      onChange={(e) => setSearchCedulaPersona(e.target.value)}
                      disabled={!!editingTutorId}
                      error={!!errors.persona_id}
                      helperText={errors.persona_id}
                    />
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleBuscarPersona}
                      startIcon={<Search />}
                      sx={{ mt: 1 }}
                      disabled={!!editingTutorId}
                    >
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

              <Divider sx={{ my: 1 }} />

              <Grid container spacing={2} direction="column">
                {/* Parentesco */}
                <Grid item>
                  <Typography>Parentesco:</Typography>
                  <TextField
                    select
                    fullWidth
                    name="parentesco"
                    value={formData.parentesco}
                    onChange={handleChange}
                    error={!!errors.parentesco}
                    helperText={errors.parentesco}
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {opcionesParentesco.map(op => (
                      <MenuItem key={op} value={op}>{op}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* ¿Es contacto de emergencia? */}
                <Grid item>
                  <Typography>¿Es contacto de emergencia?</Typography>
                  <TextField
                    select
                    fullWidth
                    name="es_contacto_emergencia"
                    value={formData.es_contacto_emergencia}
                    onChange={handleChange}
                  >
                    <MenuItem value={true}>Sí</MenuItem>
                    <MenuItem value={false}>No</MenuItem>
                  </TextField>
                </Grid>

                {/* Observaciones */}
                <Grid item>
                  <Typography>Observaciones:</Typography>
                  <TextField
                    name="observaciones_tutor"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.observaciones_tutor}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Botones */}
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
            </Box>
          </CardContent>
        </Card>

        {/* Listado de Tutores */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>Listado de Tutores</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Parentesco</TableCell>
                <TableCell>Observaciones</TableCell>
                <TableCell sx={{ width: 160 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tutores.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(tutor => (
                <TableRow key={tutor.id}>
                  <TableCell>{tutor.id}</TableCell>
                  <TableCell>{tutor.nombre_completo || '—'}</TableCell>
                  <TableCell>{tutor.parentesco || '—'}</TableCell>
                  <TableCell>{tutor.observaciones_tutor || '—'}</TableCell>
                  <TableCell align="right" sx={{ minWidth: 160, whiteSpace: 'nowrap' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: 0.5,
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Tooltip title="Ver Detalles">
                        <IconButton color="primary" size="small" onClick={() => setDetalle(tutor)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton color="success" size="small" onClick={() => handleEditar(tutor)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="error" size="small" onClick={() => handleEliminar(tutor.id)}>
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
            count={tutores.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </Paper>

        {/* Detalles (igual estilo que Persona) */}
        <Dialog open={!!detalle} onClose={() => setDetalle(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
            <Visibility sx={{ mr: 1 }} />
            Detalle de Tutor
          </DialogTitle>
          <DialogContent sx={{ p: 3, mt: 2 }}>
            {detalle && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Nombre</Typography>
                  <Typography variant="body1" fontWeight="bold">{detalle.nombre_completo || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Cédula</Typography>
                  <Typography variant="body1" fontWeight="bold">{detalle.cedula || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Parentesco</Typography>
                  <Typography variant="body1" fontWeight="bold">{detalle.parentesco || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Contacto de Emergencia</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {typeof detalle.es_contacto_emergencia === 'boolean'
                      ? (detalle.es_contacto_emergencia ? 'Sí' : 'No')
                      : boolToSiNo(!!detalle.es_contacto_emergencia)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Observaciones</Typography>
                  <Typography variant="body1" fontWeight="bold">{detalle.observaciones_tutor || '—'}</Typography>
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

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Tutor;
