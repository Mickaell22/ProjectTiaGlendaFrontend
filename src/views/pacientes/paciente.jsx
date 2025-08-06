import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, Dialog, DialogContent, DialogTitle, Grid, IconButton,
  MenuItem, Paper, Snackbar, Table, TableBody, TableCell, TableHead, TablePagination,
  TableRow, TextField, Typography, Alert, Tooltip, InputLabel
} from '@mui/material';
import { Delete, Edit, Visibility, Search, UploadFile } from '@mui/icons-material';
import axios from 'axios';

const Paciente = () => {
  const [pacientes, setPacientes] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchCedula, setSearchCedula] = useState('');
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [documentoFile, setDocumentoFile] = useState(null);

  const [formData, setFormData] = useState({
    persona_id: '', tutor_id: '', tipo_terapia: '', fecha_ingreso: '',
    observaciones: '', estado: 'activo'
  });

  const token = localStorage.getItem('jwt_token');
  const headers = {
    Authorization: `Bearer ${token}`
  };

  const tiposTerapia = ['Física', 'Ocupacional', 'Lenguaje', 'Psicológica'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pacRes, tutRes] = await Promise.all([
        axios.get('http://localhost:5000/api/pacientes', { headers }),
        axios.get('http://localhost:5000/api/tutores', { headers })
      ]);
      setPacientes(pacRes.data.data || []);
      setTutores(tutRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuscarPersona = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/personas?cedula=${searchCedula}`, { headers });
      const persona = res.data.data;
      if (persona && persona.id) {
        setPersonaEncontrada(persona);
        setFormData(prev => ({ ...prev, persona_id: persona.id }));
        setSnackbar({ open: true, message: 'Persona encontrada', severity: 'success' });
      } else {
        setPersonaEncontrada(null);
        setSnackbar({ open: true, message: 'Persona no encontrada', severity: 'warning' });
      }
    } catch (error) {
      setPersonaEncontrada(null);
      setSnackbar({ open: true, message: 'Error al buscar persona', severity: 'error' });
    }
  };

  const handleFileChange = (e) => {
    setDocumentoFile(e.target.files[0]);
  };

  const handleGuardar = async () => {
    try {
      if (!formData.persona_id || !formData.fecha_ingreso) {
        return setSnackbar({ open: true, message: 'Persona y fecha requeridas', severity: 'warning' });
      }

      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => form.append(key, value));
      if (documentoFile) form.append('documento', documentoFile);

      if (editingId) {
        await axios.put(`http://localhost:5000/api/pacientes/${editingId}`, form, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        setSnackbar({ open: true, message: 'Paciente actualizado', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/pacientes', form, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        setSnackbar({ open: true, message: 'Paciente registrado', severity: 'success' });
      }

      resetForm();
      fetchData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      persona_id: '', tutor_id: '', tipo_terapia: '', fecha_ingreso: '', observaciones: '', estado: 'activo'
    });
    setDocumentoFile(null);
    setPersonaEncontrada(null);
    setSearchCedula('');
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

  const filteredPacientes = pacientes.filter(p =>
    p.cedula && p.cedula.toLowerCase().includes(searchCedula.toLowerCase())
  );

  return (
    <Box p={2}>
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" fontWeight="bold">Gestión de Pacientes</Typography>
        </Paper>

        {/* Buscador de Persona */}
        <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mb: 3 }}>
          <Typography variant="h6">Buscar Persona por Cédula</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8}>
              <TextField fullWidth label="Cédula" value={searchCedula} onChange={e => setSearchCedula(e.target.value)} />
            </Grid>
            <Grid item xs={4}>
              <Button variant="outlined" fullWidth onClick={handleBuscarPersona} startIcon={<Search />}>Buscar</Button>
            </Grid>
          </Grid>
          {personaEncontrada && (
            <Box mt={2}>
              <Alert severity="info">
                {personaEncontrada.nombre} {personaEncontrada.apellido} - Cédula: {personaEncontrada.cedula}
              </Alert>
            </Box>
          )}
        </Paper>

        {/* Formulario */}
        <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 600, mx: 'auto', mb: 4 }}>
          <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
            {editingId ? 'Editar Paciente' : 'Registrar Paciente'}
          </Typography>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Typography>Tutor:</Typography>
              <TextField select fullWidth name="tutor_id" value={formData.tutor_id} onChange={e => setFormData(prev => ({ ...prev, tutor_id: e.target.value }))}>
                <MenuItem value="">Sin asignar</MenuItem>
                {tutores.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.nombre_completo}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item>
              <Typography>Tipo de Terapia:</Typography>
              <TextField select fullWidth name="tipo_terapia" value={formData.tipo_terapia} onChange={e => setFormData(prev => ({ ...prev, tipo_terapia: e.target.value }))}>
                <MenuItem value="">Seleccione</MenuItem>
                {tiposTerapia.map((t, i) => (
                  <MenuItem key={i} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item>
              <Typography>Fecha Ingreso:</Typography>
              <TextField type="date" fullWidth name="fecha_ingreso" value={formData.fecha_ingreso} onChange={e => setFormData(prev => ({ ...prev, fecha_ingreso: e.target.value }))} />
            </Grid>
            <Grid item>
              <Typography>Observaciones:</Typography>
              <TextField name="observaciones" fullWidth multiline rows={2} value={formData.observaciones} onChange={e => setFormData(prev => ({ ...prev, observaciones: e.target.value }))} />
            </Grid>
            <Grid item>
              <InputLabel>Documento (PDF):</InputLabel>
              <Button variant="outlined" component="label" startIcon={<UploadFile />}>
                Subir Documento
                <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
              </Button>
              {documentoFile && <Typography mt={1}>{documentoFile.name}</Typography>}
            </Grid>
            <Grid item>
              <Button variant="contained" color="success" fullWidth onClick={handleGuardar}>
                {editingId ? 'Actualizar' : 'Guardar Paciente'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de pacientes */}
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
              {filteredPacientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
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
          <TablePagination
            component="div" count={filteredPacientes.length}
            page={page} onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage} rowsPerPageOptions={[]}
          />
        </Paper>

        {/* Detalle */}
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

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Paciente;
