// src/views/personal/Personal.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, InputAdornment, Divider, Stack, Badge, Avatar, Tabs, Tab
} from '@mui/material';
import { 
  Delete, Edit, Search, Visibility, PersonAdd, Phone, Email, 
  Work, School, CalendarToday, Assignment, Person, SupervisorAccount,
  Badge as BadgeIcon, ContactPhone, LocationOn, Description, AccountBox,
  Business, MonetizationOn, Schedule, CheckCircle
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatDateLocal, formatDateForInput, getCurrentDateForInput } from 'src/utils/dateUtils';
import BuscadorPersonas from 'src/components/shared/BuscadorPersonas';

const Personal = () => {
  const [personal, setPersonal] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPersonSelector, setShowPersonSelector] = useState(false);
  
  const [formData, setFormData] = useState({
    persona_id: '',
    titulo_profesional: '',
    estado: 'activo'
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [selectedPerson, setSelectedPerson] = useState(null);
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
      console.log('🔥 Iniciando carga de datos de personal...');
      const headers = getAuthHeaders();
      console.log('🔥 Headers:', headers);
      
      const [personalRes, personasRes, especialidadesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/personal', { headers }).catch(err => {
          console.error('❌ Error al cargar personal:', err.response?.data || err.message);
          return { data: { data: [] } };
        }),
        axios.get('http://localhost:5000/api/personas', { headers }).catch(err => {
          console.error('❌ Error al cargar personas:', err.response?.data || err.message);
          return { data: { data: [] } };
        }),
        axios.get('http://localhost:5000/api/especialidades', { headers }).catch(err => {
          console.error('❌ Error al cargar especialidades:', err.response?.data || err.message);
          return { data: { data: [] } };
        })
      ]);
      
      console.log('✅ Datos cargados:');
      console.log('- Personal:', personalRes.data.data?.length || 0, 'registros');
      console.log('- Personas:', personasRes.data.data?.length || 0, 'registros');  
      console.log('- Especialidades:', especialidadesRes.data.data?.length || 0, 'registros');
      
      setPersonal(personalRes.data.data || []);
      setPersonasDisponibles(personasRes.data.data || []);
      setEspecialidades(especialidadesRes.data.data || []);
    } catch (err) {
      console.error('❌ Error general al cargar datos:', err);
      if (err.response?.status === 401) {
        setSnackbar({ open: true, message: 'Sesión expirada.', severity: 'error' });
        setTimeout(() => navigate('/auth/login'), 2000);
      } else {
        setSnackbar({ open: true, message: 'Error al cargar datos: ' + (err.response?.data?.message || err.message), severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonal = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/personal', { headers: getAuthHeaders() });
      setPersonal(res.data.data || []);
    } catch (err) {
      console.error('Error fetching personal:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validaciones obligatorias
    if (!formData.persona_id) newErrors.persona_id = 'Debe seleccionar una persona';
    if (!formData.titulo_profesional.trim()) newErrors.titulo_profesional = 'El título profesional es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const personalData = {
        persona_id: parseInt(formData.persona_id),
        titulo_profesional: formData.titulo_profesional.trim(),
        estado: formData.estado
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/personal/${editingId}`, personalData, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Personal actualizado correctamente', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/personal', personalData, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Personal registrado correctamente', severity: 'success' });
      }
      
      resetForm();
      fetchPersonal();
      await fetchData(); // Actualizar datos
      setActiveTab(0); // Volver a la lista
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar personal';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      persona_id: '',
      titulo_profesional: '',
      estado: 'activo'
    });
    setEditingId(null);
    setErrors({});
    setSelectedPerson(null);
    setShowPersonSelector(false);
  };

  const handleEdit = (item) => {
    setFormData({
      persona_id: item.persona_id,
      titulo_profesional: item.titulo_profesional || '',
      estado: item.estado
    });
    
    // Encontrar la persona seleccionada para mostrar en el formulario
    const persona = personasDisponibles.find(p => p.id === item.persona_id);
    if (persona) {
      setSelectedPerson(persona);
    }
    
    setEditingId(item.id);
    setActiveTab(1); // Cambiar a la tab del formulario
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este miembro del personal?')) {
      try {
        await axios.delete(`http://localhost:5000/api/personal/${id}`, { headers: getAuthHeaders() });
        setSnackbar({ open: true, message: 'Personal eliminado correctamente', severity: 'info' });
        fetchPersonal();
        await fetchData(); // Actualizar datos
      } catch (error) {
        const msg = error.response?.data?.message || 'Error al eliminar personal';
        setSnackbar({ open: true, message: msg, severity: 'error' });
      }
    }
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'inactivo': return 'error';
      case 'suspendido': return 'warning';
      case 'vacaciones': return 'info';
      default: return 'default';
    }
  };

  const getAreas = () => {
    const areas = [...new Set(personal.map(p => p.especialidades).flat().map(e => e?.area).filter(Boolean))];
    return areas;
  };
  
  const handlePersonaSelect = (persona) => {
    setSelectedPerson(persona);
    setFormData(prev => ({ ...prev, persona_id: persona.id }));
    setShowPersonSelector(false);
    if (errors.persona_id) {
      setErrors(prev => ({ ...prev, persona_id: '' }));
    }
  };

  const filteredPersonal = personal.filter(p => {
    const matchesSearch = (
      p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.titulo_profesional?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.especialidades?.some(e => e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    const matchesArea = filterArea === '' || p.especialidades?.some(e => e.area === filterArea);
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
              Cargando datos de personal...
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
            backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #4CAF50, #2196F3, #FF9800, #9C27B0)', 
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
              <SupervisorAccount sx={{ mr: 2 }} />
              Gestión de Personal
            </Typography>
          </Box>
        </Paper>

        {/* Navegación por pestañas */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Lista de Personal" icon={<SupervisorAccount />} />
            <Tab label={editingId ? "Editar Personal" : "Registrar Personal"} icon={<PersonAdd />} />
          </Tabs>
        </Paper>

        {/* Tab Panel 0 - Lista */}
        <TabPanel value={activeTab} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2} display="flex" alignItems="center">
                <SupervisorAccount sx={{ mr: 1 }} />
                Lista de Personal
                <Chip 
                  label={`${filteredPersonal.length} empleado${filteredPersonal.length !== 1 ? 's' : ''}`} 
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
                    label="Buscar personal"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      )
                    }}
                    placeholder="Buscar por nombre, título profesional o especialidad"
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
                    {getAreas().map((area) => (
                      <MenuItem key={area} value={area}>{area}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => {
                      resetForm();
                      setActiveTab(1);
                    }}
                    sx={{ height: '40px' }}
                  >
                    Nuevo Personal
                  </Button>
                </Grid>
              </Grid>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell>Título Profesional</TableCell>
                    <TableCell>Especialidades</TableCell>
                    <TableCell>Contacto</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPersonal
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                              <Person />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {item.nombre_completo || `${item.nombre || ''} ${item.apellido || ''}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.cedula}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {item.titulo_profesional}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {item.especialidades && item.especialidades.length > 0 ? (
                              item.especialidades.map((esp, index) => (
                                <Chip 
                                  key={index}
                                  label={esp.nombre} 
                                  color={esp.area === 'terapeutico' ? 'primary' : 'secondary'}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Sin especialidades asignadas
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            {item.telefono && (
                              <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
                                <Phone sx={{ fontSize: '14px', mr: 0.5 }} />
                                {item.telefono}
                              </Typography>
                            )}
                            {item.correo && (
                              <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem" color="text.secondary">
                                <Email sx={{ fontSize: '14px', mr: 0.5 }} />
                                {item.correo}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.estado} 
                            color={getEstadoColor(item.estado)}
                            size="small"
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Desde: {item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString() : 'N/A'}
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
                count={filteredPersonal.length}
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
          <Paper elevation={3} sx={{ borderRadius: 2, p: 3 }}>
            <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary.main" mb={3}>
              {editingId ? 'Editar Personal' : 'Registrar Nuevo Personal'}
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Información Personal */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <AccountBox sx={{ mr: 1 }} />
                    Información Personal
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" mb={1}>Persona: *</Typography>
                  {selectedPerson ? (
                    <Box>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'success.50', 
                          border: '1px solid', 
                          borderColor: 'success.main',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {`${selectedPerson.nombre} ${selectedPerson.apellido}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cédula: {selectedPerson.cedula} • Teléfono: {selectedPerson.telefono || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Email: {selectedPerson.correo || 'N/A'}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedPerson(null);
                            setFormData(prev => ({ ...prev, persona_id: '' }));
                            setShowPersonSelector(true);
                          }}
                        >
                          Cambiar
                        </Button>
                      </Paper>
                      {errors.persona_id && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {errors.persona_id}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        onClick={() => setShowPersonSelector(true)}
                        startIcon={<Search />}
                        sx={{ 
                          py: 2,
                          borderStyle: errors.persona_id ? 'solid' : 'dashed',
                          borderColor: errors.persona_id ? 'error.main' : 'primary.main'
                        }}
                      >
                        Buscar y Seleccionar Persona
                      </Button>
                      {errors.persona_id && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {errors.persona_id}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body1" mb={1}>Título Profesional: *</Typography>
                  <TextField
                    fullWidth
                    name="titulo_profesional"
                    value={formData.titulo_profesional}
                    onChange={handleChange}
                    error={!!errors.titulo_profesional}
                    helperText={errors.titulo_profesional}
                    placeholder="Ej: Licenciado en Psicología, Doctor en Medicina, etc."
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
                      startIcon={editingId ? <Edit /> : <PersonAdd />}
                      size="large"
                      disabled={!formData.persona_id || !formData.titulo_profesional}
                    >
                      {editingId ? 'Actualizar Personal' : 'Registrar Personal'}
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

        {/* Modal del Buscador de Personas */}
        <Dialog
          open={showPersonSelector}
          onClose={() => setShowPersonSelector(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Search sx={{ mr: 2 }} />
              Seleccionar Persona para Personal
            </Box>
          </DialogTitle>
          <DialogContent>
            <BuscadorPersonas
              onPersonaSelect={handlePersonaSelect}
              showTutores={false}
              showPersonas={true}
              compact={true}
              maxHeight={400}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPersonSelector(false)}>Cancelar</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de detalles */}
        <Dialog 
          open={detailDialog.open} 
          onClose={() => setDetailDialog({ open: false, data: null })}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <SupervisorAccount sx={{ mr: 2 }} />
              Detalles del Personal
            </Box>
          </DialogTitle>
          <DialogContent>
            {detailDialog.data && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Información Personal</Typography>
                  <Typography variant="body2">
                    <strong>Nombre:</strong> {detailDialog.data.nombre_completo || `${detailDialog.data.nombre} ${detailDialog.data.apellido}`}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cédula:</strong> {detailDialog.data.cedula}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Título:</strong> {detailDialog.data.titulo_profesional}
                  </Typography>
                  {detailDialog.data.telefono && (
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Phone fontSize="small" sx={{ mr: 1 }} />
                      {detailDialog.data.telefono}
                    </Typography>
                  )}
                  {detailDialog.data.correo && (
                    <Typography variant="body2" display="flex" alignItems="center">
                      <Email fontSize="small" sx={{ mr: 1 }} />
                      {detailDialog.data.correo}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Especialidades Asignadas</Typography>
                  {detailDialog.data.especialidades && detailDialog.data.especialidades.length > 0 ? (
                    <Box>
                      {detailDialog.data.especialidades.map((esp, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Chip 
                            label={esp.nombre} 
                            color={esp.area === 'terapeutico' ? 'primary' : 'secondary'}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Área: {esp.area}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin especialidades asignadas
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
                  <Typography variant="body2">
                    <strong>Fecha de creación:</strong> {
                      detailDialog.data.fecha_creacion ? 
                        new Date(detailDialog.data.fecha_creacion).toLocaleDateString() : 
                        'N/A'
                    }
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fecha de modificación:</strong> {
                      detailDialog.data.fecha_modificacion ? 
                        new Date(detailDialog.data.fecha_modificacion).toLocaleDateString() : 
                        'N/A'
                    }
                  </Typography>
                  <Box mt={1}>
                    <Chip 
                      label={detailDialog.data.estado} 
                      color={getEstadoColor(detailDialog.data.estado)}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Información de Usuario</Typography>
                  {detailDialog.data.usuario_id ? (
                    <Box>
                      <Typography variant="body2">
                        <strong>Usuario del sistema:</strong> {detailDialog.data.nombre_usuario || 'Sí'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Rol:</strong> {detailDialog.data.rol_usuario || 'N/A'}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No tiene usuario del sistema asignado
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog({ open: false, data: null })}>
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

export default Personal;