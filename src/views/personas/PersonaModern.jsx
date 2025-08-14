// src/views/personas/PersonaModern.jsx
// Módulo de personas con diseño moderno alineado a PacienteModern (formulario vertical)

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
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Person,
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Email,
  Phone,
  LocationOn,
  CalendarToday
} from '@mui/icons-material';

// Servicios y hooks personalizados
import PersonaService from '../../services/personaService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';

// Componentes reutilizables
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/shared/ConfirmDialog.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

/* ---------- Helpers ---------- */
const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

function formatDateLocal(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  } catch {
    return '—';
  }
}

function normalize(s = '') {
  return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/* ---------- Componente ---------- */
const PersonaModern = () => {
  // Estados principales
  const [personas, setPersonas] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    fecha_nacimiento: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: 'activo'
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  // UI
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  // Hooks
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  /* ---------- Efectos ---------- */
  useEffect(() => {
    if (requireAuth()) {
      fetchPersonas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- API ---------- */
  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const data = await PersonaService.getAll();
      setPersonas(data);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Form handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const backendData = PersonaService.formatForBackend(formData);
    const validation = PersonaService.validatePersonaData(backendData);

    if (PersonaService.checkCedulaExists(personas, formData.cedula, editingId)) {
      validation.errors.cedula = 'Esta cédula ya está registrada';
      validation.isValid = false;
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.correo)) {
      validation.errors.correo = 'Correo inválido';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = PersonaService.formatForBackend(formData);

      if (editingId) {
        await PersonaService.update(editingId, backendData);
        showSuccess('Persona actualizada correctamente');
      } else {
        await PersonaService.create(backendData);
        showSuccess('Persona registrada exitosamente');
      }

      resetForm();
      await fetchPersonas();
      setActiveTab(0);
    } catch (error) {
      showError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      fecha_nacimiento: '',
      telefono: '',
      correo: '',
      direccion: '',
      estado: 'activo'
    });
    setEditingId(null);
    setErrors({});
  };

  /* ---------- Manejadores de acciones ---------- */
  const handleEdit = (item) => {
    setFormData({
      nombre: item.nombre || '',
      apellido: item.apellido || '',
      cedula: item.cedula || '',
      fecha_nacimiento: item.fecha_nacimiento || '',
      telefono: item.telefono || '',
      correo: item.correo || '',
      direccion: item.direccion || '',
      estado: item.estado || 'activo'
    });
    setEditingId(item.id);
    setActiveTab(1);
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await PersonaService.delete(confirmDialog.id);
      showSuccess('Persona eliminada correctamente');
      fetchPersonas();
    } catch (error) {
      showError(error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  /* ---------- Filtros/derivados ---------- */
  let filtered = personas;

  if (searchTerm.trim()) {
    const q = normalize(searchTerm.trim());
    filtered = filtered.filter((p) => {
      const campos = [
        PersonaService.getFullName(p),
        p.cedula,
        p.telefono,
        p.correo,
        p.direccion
      ];
      return campos.some((c) => normalize(c || '').includes(q));
    });
  }

  if (filterEstado) {
    filtered = filtered.filter((p) => (p.estado || '').toLowerCase() === filterEstado);
  }

  /* ---------- Loading ---------- */
  if (loading) {
    return <LoadingSpinner message="Cargando personas..." fullHeight />;
  }

  /* ---------- Render ---------- */
  return (
    <ErrorBoundary>
      <Box p={2}>
        <Container maxWidth="xl">
          {/* Encabezado con borde arcoíris */}
          <Paper
            elevation={6}
            sx={{
              borderRadius: 3,
              backgroundColor: '#fff',
              mb: 4,
              p: 0,
              overflow: 'hidden',
              border: '4px solid transparent',
              backgroundImage:
                'linear-gradient(white, white), linear-gradient(270deg, #2196F3, #4CAF50, #FF9800, #E91E63)',
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
              <Typography variant="h5" fontWeight="bold" color="black" display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} />
                Gestión de Personas
              </Typography>
            </Box>
          </Paper>

          {/* Tabs navegación */}
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Lista de Personas" icon={<Person />} />
              <Tab label={editingId ? "Editar Persona" : "Nueva Persona"} icon={<Add />} />
            </Tabs>
          </Paper>

          {/* ======== LISTA ======== */}
          <TabPanel value={activeTab} index={0}>
            <Card elevation={8} sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                {/* --- Bloque de filtros con borde morado (primary) --- */}
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* Buscador */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Buscar personas"
                        value={searchTerm}
                        onChange={(e) => {
                          setPage(0);
                          setSearchTerm(e.target.value);
                        }}
                        placeholder="Buscar por nombre, apellido, cédula, teléfono, correo…"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    {/* Estado (etiqueta a la izquierda y select a la derecha, ancho fijo) */}
                    <Grid item xs={12} md={3}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 200px',
                          gap: 1,
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Estado
                        </Typography>

                        <TextField
                          select
                          size="small"
                          value={filterEstado}
                          onChange={(e) => {
                            setPage(0);
                            setFilterEstado(e.target.value);
                          }}
                          // sin label para que no “salte” el campo
                          placeholder="Todos"
                          fullWidth={false}
                          sx={{ width: 200 }}
                        >
                          <MenuItem value="">Todos</MenuItem>
                          {PersonaService.getEstados().map((estado) => (
                            <MenuItem key={estado.value} value={estado.value}>
                              {estado.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </Grid>

                    {/* Botón Nueva Persona */}
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => {
                          resetForm();
                          setActiveTab(1);
                        }}
                        sx={{ height: 40 }}
                      >
                        Nueva Persona
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <Typography variant="h6" mb={2} display="flex" alignItems="center">
                  <Person sx={{ mr: 1 }} />
                  Lista de Personas
                  <Chip
                    label={`${filtered.length} persona${filtered.length !== 1 ? 's' : ''}`}
                    color="primary"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Typography>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Persona</TableCell>
                      <TableCell>Contacto</TableCell>
                      <TableCell>Ubicación</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => {
                        const estadoInfo = PersonaService.getEstadoInfo(item.estado);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                                  <Person />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {PersonaService.getFullName(item)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1}>
                                    {item.cedula}
                                    <Chip
                                      size="small"
                                      label={`Edad: ${PersonaService.calculateAge(item.fecha_nacimiento)}`}
                                      variant="outlined"
                                    />
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" display="flex" alignItems="center" fontSize="0.85rem">
                                  <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                                  {item.telefono || 'Sin teléfono'}
                                </Typography>
                                <Typography variant="body2" display="flex" alignItems="center" fontSize="0.85rem" color="text.secondary">
                                  <Email sx={{ fontSize: 16, mr: 0.5 }} />
                                  {item.correo || 'Sin correo'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" display="flex" alignItems="center" fontSize="0.85rem">
                                <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                                {item.direccion || 'Sin dirección'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={estadoInfo.label} color={estadoInfo.color} size="small" />
                              <Typography variant="caption" display="block" color="text.secondary">
                                Desde: {formatDateLocal(item.fecha_creacion)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Ver detalles">
                                  <IconButton color="info" size="small" onClick={() => handleViewDetail(item)}>
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Editar">
                                  <IconButton color="primary" size="small" onClick={() => handleEdit(item)}>
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                  <IconButton color="error" size="small" onClick={() => handleDelete(item.id)}>
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
                  count={filtered.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) => {
                    const total = count !== -1 ? count : `más de ${to}`;
                    return `${from}-${to} de ${total}`;
                  }}
                />
              </CardContent>
            </Card>
          </TabPanel>

          {/* ======== FORMULARIO (VERTICAL) ======== */}
          <TabPanel value={activeTab} index={1}>
            <Card
              elevation={8}
              sx={{
                borderRadius: 4,
                mb: 4,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
              {/* Header dinámico */}
              <Box
                sx={{
                  background: editingId
                    ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                    : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  color: 'white',
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {editingId ? 'Editar Persona' : 'Registrar Persona'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {editingId
                      ? 'Modifica los campos necesarios y guarda los cambios'
                      : 'Ingresa los datos personales y de contacto'}
                  </Typography>
                </Box>
              </Box>

              {/* maxWidth más angosto para un look centrado */}
              <CardContent sx={{ p: { xs: 2, md: 4 }, maxWidth: 640, mx: 'auto' }}>
                <Box component="form" onSubmit={handleSubmit}>
                  {/* ===== Bloque: Información Personal (vertical) ===== */}
                  <Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
                    <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                      Información Personal
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="Nombre *"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        error={!!errors.nombre}
                        helperText={errors.nombre}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Apellido *"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        error={!!errors.apellido}
                        helperText={errors.apellido}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Cédula *"
                        name="cedula"
                        value={formData.cedula}
                        onChange={handleChange}
                        error={!!errors.cedula}
                        helperText={errors.cedula}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        fullWidth
                        type="date"
                        label="Fecha de nacimiento"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleChange}
                        error={!!errors.fecha_nacimiento}
                        helperText={errors.fecha_nacimiento}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Stack>
                  </Box>

                  {/* ===== Bloque: Contacto (vertical) ===== */}
<Box sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
  <Typography variant="overline" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
    Información de Contacto
  </Typography>
  <Divider sx={{ mb: 2 }} />

  <Stack spacing={2}>
    <TextField
      fullWidth
      label="Teléfono"
      name="telefono"
      value={formData.telefono}
      onChange={handleChange}
      error={!!errors.telefono}
      helperText={errors.telefono}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Phone />
          </InputAdornment>
        ),
      }}
    />

    <TextField
      fullWidth
      type="email"
      label="Correo electrónico"
      name="correo"
      value={formData.correo}
      onChange={handleChange}
      error={!!errors.correo}
      helperText={errors.correo}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Email />
          </InputAdornment>
        ),
      }}
    />

    <TextField
      fullWidth
      multiline
      minRows={2}
      label="Dirección"
      name="direccion"
      value={formData.direccion}
      onChange={handleChange}
      error={!!errors.direccion}
      helperText={errors.direccion}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LocationOn />
          </InputAdornment>
        ),
      }}
    />
  </Stack>
</Box>


                  {/* ===== Acciones ===== */}
                  <Box
                    sx={{
                      mt: 3,
                      pt: 2,
                      display: 'flex',
                      gap: 2,
                      maxWidth: 600,
                      mx: 'auto',
                      borderTop: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      type="submit"
                      startIcon={editingId ? <Edit /> : <Add />}
                      sx={{ py: 1.4, fontWeight: 'bold', textTransform: 'none' }}
                      disabled={!formData.nombre || !formData.apellido || !formData.cedula}
                    >
                      {editingId ? 'Actualizar' : 'Guardar Persona'}
                    </Button>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        resetForm();
                        setActiveTab(0);
                      }}
                      sx={{ py: 1.4, fontWeight: 'bold', textTransform: 'none' }}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* ===== Detalles ===== */}
          <Dialog
            open={detailDialog.open}
            onClose={() => setDetailDialog({ open: false, data: null })}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} />
                Detalles de la Persona
              </Box>
            </DialogTitle>
            <DialogContent>
              {detailDialog.data && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información Personal</Typography>
                    <Typography variant="body2">
                      <strong>Nombre completo:</strong> {PersonaService.getFullName(detailDialog.data)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cédula:</strong> {detailDialog.data.cedula}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Edad:</strong> {PersonaService.calculateAge(detailDialog.data.fecha_nacimiento)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="primary">Información de Contacto</Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Phone fontSize="small" sx={{ mr: 1 }} />
                      {detailDialog.data.telefono || 'Sin teléfono'}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Email fontSize="small" sx={{ mr: 1 }} />
                      {detailDialog.data.correo || 'Sin correo'}
                    </Typography>
                    <Typography variant="body2" display="flex" alignItems="center">
                      <LocationOn fontSize="small" sx={{ mr: 1 }} />
                      {detailDialog.data.direccion || 'Sin dirección'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
                    <Typography variant="body2">
                      <strong>Estado:</strong>{' '}
                      <Chip
                        label={PersonaService.getEstadoInfo(detailDialog.data.estado).label}
                        color={PersonaService.getEstadoInfo(detailDialog.data.estado).color}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fecha de creación:</strong> {formatDateLocal(detailDialog.data.fecha_creacion)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Última modificación:</strong> {formatDateLocal(detailDialog.data.fecha_modificacion)}
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

          {/* Confirmación */}
          <ConfirmDialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ open: false, id: null })}
            onConfirm={confirmDelete}
            title="¿Eliminar persona?"
            message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta persona?"
            confirmText="Eliminar"
            confirmColor="error"
            severity="error"
          />

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={hideSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ErrorBoundary>
  );
};

export default PersonaModern;
