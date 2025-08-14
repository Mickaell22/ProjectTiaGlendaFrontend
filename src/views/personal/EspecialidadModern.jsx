// src/views/personal/EspecialidadModern.jsx
// Módulo de especialidades con diseño moderno original

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
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
  DialogActions,
  Grid,
  MenuItem,
  InputAdornment,
  Stack,
  Avatar,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import {
  MedicalServices,
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Work,
  LocalHospital,
  Psychology,
  School
} from '@mui/icons-material';

// Servicios y hooks personalizados
import EspecialidadService from '../../services/especialidadService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';

// Componentes reutilizables
import CustomSnackbar from '../../components/shared/CustomSnackbar.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/shared/ConfirmDialog.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const EspecialidadModern = () => {
  // Estados principales
  const [especialidades, setEspecialidades] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    area: '',
    estado: 'activo'
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  // Estados de UI
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  // Hooks personalizados
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  // Efectos
  useEffect(() => {
    if (requireAuth()) {
      fetchEspecialidades();
    }
  }, []);

  // Funciones de API
  const fetchEspecialidades = async () => {
    try {
      setLoading(true);
      const data = await EspecialidadService.getAll();
      setEspecialidades(data);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejadores del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const backendData = EspecialidadService.formatForBackend(formData);
    const validation = EspecialidadService.validateEspecialidadData(backendData);
    
    // Verificar nombre duplicado
    if (EspecialidadService.checkNombreExists(especialidades, formData.nombre, editingId)) {
      validation.errors.nombre = 'Esta especialidad ya está registrada';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = EspecialidadService.formatForBackend(formData);
      
      if (editingId) {
        await EspecialidadService.update(editingId, backendData);
        showSuccess('Especialidad actualizada correctamente');
      } else {
        await EspecialidadService.create(backendData);
        showSuccess('Especialidad creada correctamente');
      }
      
      resetForm();
      fetchEspecialidades();
      setActiveTab(0);
    } catch (error) {
      showError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      area: '',
      estado: 'activo'
    });
    setEditingId(null);
    setErrors({});
  };

  // Manejadores de acciones
  const handleEdit = (item) => {
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      area: item.area,
      estado: item.estado
    });
    setEditingId(item.id);
    setActiveTab(1);
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await EspecialidadService.delete(confirmDialog.id);
      showSuccess('Especialidad eliminada correctamente');
      fetchEspecialidades();
    } catch (error) {
      showError(error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  // Datos filtrados
  let filteredEspecialidades = EspecialidadService.filterEspecialidades(especialidades, searchTerm);
  filteredEspecialidades = EspecialidadService.filterByArea(filteredEspecialidades, filterArea);

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Cargando especialidades..." fullHeight />;
  }

  return (
    <ErrorBoundary>
      <Box p={2}>
        <Container maxWidth="xl">
          {/* Header con borde arcoíris */}
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
                <MedicalServices sx={{ mr: 2 }} />
                Gestión de Especialidades
              </Typography>
            </Box>
          </Paper>

          {/* Navegación por pestañas */}
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)} 
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Lista de Especialidades" icon={<MedicalServices />} />
              <Tab label={editingId ? "Editar Especialidad" : "Nueva Especialidad"} icon={<Add />} />
            </Tabs>
          </Paper>

          {/* Tab Panel 0 - Lista */}
          <TabPanel value={activeTab} index={0}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2} display="flex" alignItems="center">
                  <MedicalServices sx={{ mr: 1 }} />
                  Lista de Especialidades
                  <Chip 
                    label={`${filteredEspecialidades.length} especialidad${filteredEspecialidades.length !== 1 ? 'es' : ''}`} 
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
                      placeholder="Buscar por nombre o descripción..."
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
                      {EspecialidadService.getAreas().map((area) => (
                        <MenuItem key={area.value} value={area.value}>
                          {area.label}
                        </MenuItem>
                      ))}
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
                      <TableCell>Descripción</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEspecialidades
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => {
                        const estadoInfo = EspecialidadService.getEstadoInfo(item.estado);
                        const areaInfo = EspecialidadService.getAreaInfo(item.area);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: areaInfo.color }}>
                                  {areaInfo.icon === 'LocalHospital' ? <LocalHospital /> : 
                                   areaInfo.icon === 'School' ? <School /> : <Work />}
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
                                label={areaInfo.label} 
                                color={areaInfo.color}
                                size="small"
                                icon={areaInfo.icon === 'LocalHospital' ? <LocalHospital /> : 
                                      areaInfo.icon === 'School' ? <School /> : <Work />}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontSize="0.75rem">
                                {item.descripcion || 'Sin descripción'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={estadoInfo.label} 
                                color={estadoInfo.color}
                                size="small"
                              />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Desde: {EspecialidadService.formatDate(item.fecha_creacion)}
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
                        );
                      })}
                  </TableBody>
                </Table>

                <TablePagination
                  component="div"
                  count={filteredEspecialidades.length}
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
            <Paper elevation={3} sx={{ borderRadius: 2, p: 3, maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
                {editingId ? 'Editar Especialidad' : 'Registrar Nueva Especialidad'}
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Información de la Especialidad
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" mb={1}>Nombre: *</Typography>
                    <TextField
                      fullWidth
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      error={!!errors.nombre}
                      helperText={errors.nombre}
                      placeholder="Ej: Psicología Clínica, Terapia Ocupacional..."
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
                      {EspecialidadService.getAreas().map((area) => (
                        <MenuItem key={area.value} value={area.value}>
                          {area.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body1" mb={1}>Descripción:</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      error={!!errors.descripcion}
                      helperText={errors.descripcion}
                      placeholder="Describe los servicios y enfoques de esta especialidad..."
                    />
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
                      {EspecialidadService.getEstados().map((estado) => (
                        <MenuItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </MenuItem>
                      ))}
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
                        disabled={!formData.nombre || !formData.area}
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
                <MedicalServices sx={{ mr: 2 }} />
                Detalles de la Especialidad
              </Box>
            </DialogTitle>
            <DialogContent>
              {detailDialog.data && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información Básica</Typography>
                    <Typography variant="body2">
                      <strong>Nombre:</strong> {detailDialog.data.nombre}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Área:</strong> {EspecialidadService.getAreaInfo(detailDialog.data.area).label}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ID:</strong> {detailDialog.data.id}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
                    <Typography variant="body2">
                      <strong>Estado:</strong> 
                      <Chip 
                        label={EspecialidadService.getEstadoInfo(detailDialog.data.estado).label} 
                        color={EspecialidadService.getEstadoInfo(detailDialog.data.estado).color}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fecha de creación:</strong> {EspecialidadService.formatDate(detailDialog.data.fecha_creacion)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Última modificación:</strong> {EspecialidadService.formatDate(detailDialog.data.fecha_modificacion)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Descripción</Typography>
                    <Typography variant="body2">
                      {detailDialog.data.descripcion || 'Sin descripción disponible'}
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

          {/* Dialog de confirmación */}
          <ConfirmDialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ open: false, id: null })}
            onConfirm={confirmDelete}
            title="¿Eliminar especialidad?"
            message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta especialidad?"
            confirmText="Eliminar"
            confirmColor="error"
            severity="error"
          />

          {/* Notificaciones */}
          <CustomSnackbar
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={hideSnackbar}
          />
        </Container>
      </Box>
    </ErrorBoundary>
  );
};

export default EspecialidadModern;