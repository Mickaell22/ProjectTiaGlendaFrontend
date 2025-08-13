// src/views/personal/Especialidad.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, InputAdornment, Divider, Stack, Avatar, Tabs, Tab
} from '@mui/material';
import { 
  Delete, Edit, Search, Visibility, Add, School, Psychology,
  LocalHospital, Work, CalendarToday, Person, Group
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Especialidad = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', area: '', estado: 'activo' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/especialidades', { headers: getAuthHeaders() });
      setEspecialidades(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setSnackbar({ open: true, message: 'Sesión expirada.', severity: 'error' });
        setTimeout(() => navigate('/auth/login'), 2000);
      } else {
        setSnackbar({ open: true, message: 'Error al cargar especialidades', severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre de la especialidad es requerido';
    if (formData.nombre.trim().length < 3) newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    if (!formData.area) newErrors.area = 'Debe seleccionar un área';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const especialidadData = {
        nombre: formData.nombre.trim(),
        area: formData.area,
        estado: formData.estado
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/especialidades/${editingId}`, especialidadData, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Especialidad actualizada correctamente', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/especialidades', especialidadData, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Especialidad creada correctamente', severity: 'success' });
      }
      resetForm();
      fetchEspecialidades();
      setActiveTab(0); // Volver a la lista
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar especialidad';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleEdit = (item) => {
    setFormData({ nombre: item.nombre, area: item.area, estado: item.estado });
    setEditingId(item.id);
    setActiveTab(1); // Cambiar a la tab del formulario
  };
  
  const resetForm = () => {
    setFormData({ nombre: '', area: '', estado: 'activo' });
    setEditingId(null);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta especialidad?')) {
      try {
        await axios.delete(`http://localhost:5000/api/especialidades/${id}`, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Especialidad eliminada correctamente', severity: 'info' });
        fetchEspecialidades();
      } catch (error) {
        const msg = error.response?.data?.message || 'No se puede eliminar. Está siendo utilizada.';
        setSnackbar({ open: true, message: msg, severity: 'error' });
      }
    }
  };
  
  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const getAreaIcon = (area) => {
    return area === 'terapeutico' ? <LocalHospital /> : <School />;
  };
  
  const getAreaColor = (area) => {
    return area === 'terapeutico' ? 'primary' : 'secondary';
  };
  
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'inactivo': return 'error';
      default: return 'default';
    }
  };
  
  const getAreas = () => {
    return ['terapeutico', 'pedagogico'];
  };
  
  const filteredList = especialidades.filter(e => {
    const matchesSearch = e.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = filterArea === '' || e.area === filterArea;
    return matchesSearch && matchesArea;
  });
  
  const TabPanel = ({ children, value, index, ...other }) => (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
  
  if (loading) {
    return (
      <Box p={2}>
        <Container maxWidth="xl">
          <Paper elevation={4} sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Cargando especialidades...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Por favor espere mientras se cargan los datos.
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Container maxWidth="xl">
        <Paper 
          elevation={4} 
          sx={{ 
            borderRadius: 3, 
            backgroundColor: '#fff', 
            mb: 4, 
            p: 0, 
            overflow: 'hidden', 
            border: '4px solid transparent', 
            backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #FF9800, #2196F3, #4CAF50, #9C27B0)', 
            backgroundOrigin: 'border-box', 
            backgroundClip: 'padding-box, border-box', 
            animation: 'rainbow 5s linear infinite', 
            '@keyframes rainbow': { 
              '0%': { backgroundPosition: '0% 50%' }, 
              '100%': { backgroundPosition: '100% 50%' } 
            }, 
            backgroundSize: '300% 100%' 
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="black" display="flex" alignItems="center">
              <Work sx={{ mr: 2 }} />
              Gestión de Especialidades
            </Typography>
          </Box>
        </Paper>

        {/* Navegación por pestañas */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Lista de Especialidades" icon={<Work />} />
            <Tab label={editingId ? "Editar Especialidad" : "Nueva Especialidad"} icon={<Add />} />
          </Tabs>
        </Paper>

        {/* Tab Panel 0 - Lista */}
        <TabPanel value={activeTab} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2} display="flex" alignItems="center">
                <Work sx={{ mr: 1 }} />
                Lista de Especialidades
                <Chip 
                  label={`${filteredList.length} especialidad${filteredList.length !== 1 ? 'es' : ''}`} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Typography>
              
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Buscar especialidades"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      )
                    }}
                    placeholder="Buscar por nombre de especialidad"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Filtrar por área"
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                  >
                    <MenuItem value="">Todas las áreas</MenuItem>
                    <MenuItem value="terapeutico">Terapéutico</MenuItem>
                    <MenuItem value="pedagogico">Pedagógico</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      resetForm();
                      setActiveTab(1);
                    }}
                    sx={{ height: '40px' }}
                  >
                    Nueva Especialidad
                  </Button>
                </Grid>
              </Grid>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Especialidad</TableCell>
                    <TableCell>Área</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fechas</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredList
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: getAreaColor(item.area) + '.light' }}>
                              {getAreaIcon(item.area)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {item.nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {item.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.area === 'terapeutico' ? 'Terapéutico' : 'Pedagógico'} 
                            color={getAreaColor(item.area)}
                            size="small"
                            icon={getAreaIcon(item.area)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.estado} 
                            color={getEstadoColor(item.estado)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontSize="0.75rem">
                            <strong>Creado:</strong> {item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString() : 'N/A'}
                          </Typography>
                          <Typography variant="body2" fontSize="0.75rem" color="text.secondary">
                            <strong>Modificado:</strong> {item.fecha_modificacion ? new Date(item.fecha_modificacion).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Ver detalles">
                              <IconButton 
                                color="info" 
                                size="small"
                                onClick={() => handleViewDetail(item)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton 
                                color="primary" 
                                size="small"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton 
                                color="error" 
                                size="small"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={filteredList.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </CardContent>
          </Card>
        </TabPanel>

        {/* Tab Panel 1 - Formulario */}
        <TabPanel value={activeTab} index={1}>
          <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
              {editingId ? 'Editar Especialidad' : 'Registrar Nueva Especialidad'}
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <Work sx={{ mr: 1 }} />
                    Información de la Especialidad
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" mb={1}>Nombre de la Especialidad: *</Typography>
                  <TextField
                    fullWidth
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                    placeholder="Ej: Terapia Ocupacional, Psicopedagogía, etc."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body1" mb={1}>Área: *</Typography>
                  <TextField
                    select
                    fullWidth
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    error={!!errors.area}
                    helperText={errors.area}
                  >
                    <MenuItem value="">Seleccione un área</MenuItem>
                    <MenuItem value="terapeutico">
                      <Box display="flex" alignItems="center">
                        <LocalHospital sx={{ mr: 1 }} />
                        Terapéutico
                      </Box>
                    </MenuItem>
                    <MenuItem value="pedagogico">
                      <Box display="flex" alignItems="center">
                        <School sx={{ mr: 1 }} />
                        Pedagógico
                      </Box>
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body1" mb={1}>Estado:</Typography>
                  <TextField
                    select
                    fullWidth
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <MenuItem value="activo">Activo</MenuItem>
                    <MenuItem value="inactivo">Inactivo</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button 
                      variant="contained" 
                      type="submit" 
                      color="primary"
                      startIcon={editingId ? <Edit /> : <Add />}
                      size="large"
                      disabled={!formData.nombre.trim() || !formData.area}
                    >
                      {editingId ? 'Actualizar Especialidad' : 'Crear Especialidad'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        resetForm();
                        setActiveTab(0);
                      }}
                      color="secondary"
                      size="large"
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </TabPanel>

        {/* Dialog de detalles */}
        <Dialog 
          open={detailDialog.open} 
          onClose={() => setDetailDialog({ open: false, data: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Work sx={{ mr: 2 }} />
              Detalles de la Especialidad
            </Box>
          </DialogTitle>
          <DialogContent>
            {detailDialog.data && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Información General</Typography>
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {detailDialog.data.nombre}
                  </Typography>
                  <Typography variant="body2">
                    <strong>ID:</strong> {detailDialog.data.id}
                  </Typography>
                  <Box mt={1}>
                    <Chip 
                      label={detailDialog.data.area === 'terapeutico' ? 'Terapéutico' : 'Pedagógico'} 
                      color={getAreaColor(detailDialog.data.area)}
                      icon={getAreaIcon(detailDialog.data.area)}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
                  <Typography variant="body2">
                    <strong>Estado:</strong> 
                    <Chip 
                      label={detailDialog.data.estado} 
                      color={getEstadoColor(detailDialog.data.estado)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fecha de creación:</strong> {
                      detailDialog.data.fecha_creacion ? 
                        new Date(detailDialog.data.fecha_creacion).toLocaleDateString() : 
                        'N/A'
                    }
                  </Typography>
                  <Typography variant="body2">
                    <strong>Última modificación:</strong> {
                      detailDialog.data.fecha_modificacion ? 
                        new Date(detailDialog.data.fecha_modificacion).toLocaleDateString() : 
                        'N/A'
                    }
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog({ open: false, data: null })}>
              Cerrar
            </Button>
            {detailDialog.data && (
              <Button 
                variant="contained" 
                onClick={() => {
                  handleEdit(detailDialog.data);
                  setDetailDialog({ open: false, data: null });
                }}
                startIcon={<Edit />}
              >
                Editar
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            severity={snackbar.severity} 
            variant="filled" 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Especialidad;
