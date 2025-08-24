// src/views/terapeutico/SesionesTerapeuticas.jsx
import React, { useEffect, useState, Fragment } from 'react';
import {
  Box, Card, CardContent, Container, IconButton, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, Button, InputAdornment, ToggleButtonGroup,
  ToggleButton, Paper, Divider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Delete, Search, Visibility, Person,
  Schedule, Group, PersonAdd, ViewList, CalendarViewWeek,
  AccessTime, Event
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

/* ---------- Estilos compartidos (como TutorLista) ---------- */
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const SesionesTerapeuticas = ({ onNavigateToCreate }) => {
  const [sesiones, setSesiones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [addPatientDialog, setAddPatientDialog] = useState({ open: false, sessionId: null });
  const [pacientesDisponibles, setPacientesDisponibles] = useState([]);
  const [newPatientId, setNewPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'schedule'
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await sesionTerapiaService.getSesiones();
      let sesionesData = response.data || [];
      
      // Filtrar por rol: si es terapeuta, mostrar solo sus sesiones
      if (user?.rol?.nombre === 'Terapeuta') {
        const userId = user.id_personal || user.id;
        sesionesData = sesionesData.filter(sesion => 
          sesion.terapeuta_id === userId || 
          sesion.id_terapeuta === userId
        );
      }
      // Si es admin, mostrar todas (no se filtra)
      
      setSesiones(sesionesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de cancelar esta sesión terapéutica?')) {
      try {
        await sesionTerapiaService.deleteSesion(id);
        setSnackbar({ open: true, message: 'Sesión cancelada correctamente', severity: 'info' });
        fetchData();
      } catch (error) {
        console.error('Error deleting session:', error);
        const errorMessage = sesionTerapiaService.handleError(error);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
    }
  };

  const handleViewDetail = (item) => {
    console.log('Opening session detail dialog:', item.id);
    // En lugar de navegar, abrir el modal de detalles
    setDetailDialog({ open: true, data: item });
  };

  const fetchAvailablePatients = async () => {
    try {
      console.log('Fetching available patients...');
      const response = await sesionTerapiaService.getPacientesDisponibles();
      console.log('Available patients response:', response);
      
      let pacientesData = [];
      if (response?.data) {
        pacientesData = Array.isArray(response.data) ? response.data : response.data.data || [];
      } else if (Array.isArray(response)) {
        pacientesData = response;
      }
      
      console.log('Processed available patients:', pacientesData);
      setPacientesDisponibles(pacientesData);
      
      if (pacientesData.length === 0) {
        setSnackbar({ 
          open: true, 
          message: 'No hay pacientes disponibles para agregar', 
          severity: 'warning' 
        });
      }
    } catch (error) {
      console.error('Error fetching available patients:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error al cargar pacientes disponibles: ' + (error.message || 'Error desconocido'), 
        severity: 'error' 
      });
      setPacientesDisponibles([]);
    }
  };

  const handleOpenAddPatient = (sessionId) => {
    fetchAvailablePatients();
    setAddPatientDialog({ open: true, sessionId });
  };

  const handleAddPatient = async () => {
    console.log('handleAddPatient called with:', {
      newPatientId,
      sessionId: addPatientDialog.sessionId,
      pacientesDisponibles: pacientesDisponibles.length
    });
    
    // Validate required data
    if (!newPatientId) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor seleccione un paciente', 
        severity: 'warning' 
      });
      return;
    }
    
    if (!addPatientDialog.sessionId) {
      setSnackbar({ 
        open: true, 
        message: 'Error: ID de sesión no encontrado', 
        severity: 'error' 
      });
      return;
    }
    
    // Find selected patient info for logging
    const selectedPatient = pacientesDisponibles.find(p => String(p.id) === String(newPatientId));
    console.log('Selected patient:', selectedPatient);
    
    try {
      const patientData = {
        paciente_id: parseInt(newPatientId),
        fecha_incorporacion: new Date().toISOString().split('T')[0]
      };
      
      console.log('Sending patient data:', patientData);
      
      const response = await sesionTerapiaService.addPacienteToSesion(addPatientDialog.sessionId, patientData);
      
      console.log('Add patient response:', response);
      
      setSnackbar({ 
        open: true, 
        message: `Paciente ${selectedPatient?.nombre_completo || 'seleccionado'} agregado correctamente a la sesión`, 
        severity: 'success' 
      });
      
      // Refresh data and close dialog
      await fetchData();
      setAddPatientDialog({ open: false, sessionId: null });
      setNewPatientId('');
      
    } catch (error) {
      console.error('Error adding patient to session:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Error al agregar paciente a la sesión';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos. Verifique que el paciente no esté ya asignado a esta sesión.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Sesión o paciente no encontrado.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Por favor intente nuevamente.';
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    }
  };

  // Render seguro de pacientes: nombre único o lista
  const renderPacientes = (item) => {
    // Compatibilidad con diferentes estructuras de backend
    const nombres =
      (Array.isArray(item.pacientes) && item.pacientes.map(p => p.nombre_completo || p.nombre || '').filter(Boolean)) ||
      (item.pacientes_nombres && Array.isArray(item.pacientes_nombres) && item.pacientes_nombres) ||
      (item.paciente_nombre ? [item.paciente_nombre] : []);

    if (!nombres.length) {
      const count = item.total_pacientes || item.pacientes_count || (item.pacientes && item.pacientes.length) || 0;
      if (count > 1) return `Grupo (${count})`;
      return count === 1 ? '1 paciente' : '—';
    }

    if (nombres.length === 1) return nombres[0];

    const [first, second, ...rest] = nombres;
    const extra = rest.length;
    return extra > 0 ? `${first}, ${second} +${extra}` : `${first}, ${second}`;
  };


  const filteredSesiones = sesiones.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      s.titulo?.toLowerCase().includes(term) ||
      s.terapeuta_nombre?.toLowerCase().includes(term) ||
      s.especialidad_nombre?.toLowerCase().includes(term) ||
      s.codigo_sesion?.toLowerCase().includes(term) // ok si sigue existiendo en datos aunque ya no se muestre
    );
    return matchesSearch;
  });

  // Función para generar horarios de la semana (después de filteredSesiones)
  const generateWeekSchedule = () => {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const horas = Array.from({ length: 12 }, (_, i) => {
      const hora = 7 + i; // De 7 AM a 6 PM
      return `${hora.toString().padStart(2, '0')}:00`;
    });
    
    const horario = {};
    
    filteredSesiones.forEach(sesion => {
      if (!sesion.dias_semana || !sesion.hora_inicio) return;
      
      const diasSesion = Array.isArray(sesion.dias_semana) 
        ? sesion.dias_semana 
        : sesion.dias_semana.split(',').map(d => d.trim());
      
      const horaInicio = sesion.hora_inicio.substring(0, 5); // HH:MM
      
      diasSesion.forEach(dia => {
        // Normalizar día: mapear nombres completos  
        const diasMap = {
          'lunes': 'Lunes',
          'martes': 'Martes', 
          'miercoles': 'Miércoles',
          'miércoles': 'Miércoles',
          'jueves': 'Jueves',
          'viernes': 'Viernes',
          'sabado': 'Sábado',
          'sábado': 'Sábado',
          'domingo': 'Domingo'
        };
        
        const diaLowerCase = dia.toLowerCase().trim();
        const diaNormalizado = diasMap[diaLowerCase] || dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
        
        if (!horario[diaNormalizado]) horario[diaNormalizado] = {};
        if (!horario[diaNormalizado][horaInicio]) horario[diaNormalizado][horaInicio] = [];
        
        horario[diaNormalizado][horaInicio].push(sesion);
      });
    });
    
    return { dias, horas, horario };
  };

  const { dias, horas, horario } = generateWeekSchedule();

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1000, md: 1200 },
          mx: 'auto'
        }}
      >
        {/* Header morado al estilo TutorLista */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #7e57c2 0%, #673ab7 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <Schedule sx={{ mr: 1 }} />
              Sesiones Terapéuticas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Busca y gestiona las sesiones registradas
            </Typography>
          </Box>

          <Chip
            label={`${filteredSesiones.length} sesión${filteredSesiones.length !== 1 ? 'es' : ''}`}
            color="default"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            size="small"
          />
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {/* Toolbar (búsqueda + botón nueva sesión) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
              flexWrap: 'nowrap',
              overflowX: 'auto',
              pb: 1,
              '& > *': { flex: '0 0 auto' }
            }}
          >
            <TextField
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, terapeuta o especialidad..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{
                ...purpleOutlineSX,
                minWidth: 260,
                flex: '1 1 380px'
              }}
            />

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{ mr: 2 }}
            >
              <ToggleButton value="list" aria-label="vista lista">
                <ViewList />
                <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                  Lista
                </Typography>
              </ToggleButton>
              <ToggleButton value="schedule" aria-label="vista horario">
                <CalendarViewWeek />
                <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                  Horario
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => {
                if (onNavigateToCreate) {
                  onNavigateToCreate();
                } else {
                  navigate('/terapeutico/crear-sesion');
                }
              }}
              sx={{ height: 40, px: 2 }}
            >
              Nueva Sesión
            </Button>
          </Box>

          {/* Contenido principal - Vista lista o horario */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <Typography>Cargando sesiones...</Typography>
            </Box>
          ) : viewMode === 'schedule' ? (
            /* Vista de Horario */
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', display: 'flex', alignItems: 'center' }}>
                  <Event sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary">
                    Vista de Horario Semanal
                  </Typography>
                  <Chip 
                    label={`${filteredSesiones.length} sesiones`} 
                    size="small" 
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                <Divider />
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: `80px repeat(${Math.min(dias.length, 3)}, 1fr)`, 
                    sm: `90px repeat(${Math.min(dias.length, 5)}, 1fr)`,
                    md: `100px repeat(${dias.length}, 1fr)` 
                  }, 
                  gap: 1, 
                  p: 2,
                  overflowX: 'auto',
                  minWidth: { xs: '600px', md: 'auto' }
                }}>
                  {/* Encabezado con días */}
                  <Box /> {/* Espacio para la columna de horas */}
                  {dias.map(dia => (
                    <Box key={dia} sx={{ textAlign: 'center', p: 1, fontWeight: 'bold', color: 'primary.main' }}>
                      {dia}
                    </Box>
                  ))}
                  
                  {/* Filas de horarios */}
                  {horas.map(hora => (
                    <Fragment key={hora}>
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 1, fontWeight: 'medium', color: 'text.secondary' }}>
                        <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                        {hora}
                      </Box>
                      {dias.map(dia => (
                        <Box 
                          key={`${dia}-${hora}`} 
                          sx={{ 
                            minHeight: 60, 
                            p: 0.5, 
                            border: '1px solid', 
                            borderColor: 'divider',
                            borderRadius: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                          }}
                        >
                          {horario[dia] && horario[dia][hora] && horario[dia][hora].map((sesion, index) => (
                            <Paper 
                              key={`${sesion.id}-${index}`}
                              sx={{ 
                                p: 1.5, 
                                cursor: 'pointer',
                                bgcolor: '#f8f9fa',
                                border: '1px solid',
                                borderColor: 'primary.main',
                                color: 'text.primary',
                                fontSize: '0.75rem',
                                borderRadius: 1,
                                '&:hover': {
                                  bgcolor: 'primary.light',
                                  borderColor: 'primary.dark',
                                  transform: 'translateY(-2px)',
                                  boxShadow: 2
                                },
                                transition: 'all 0.3s ease',
                                position: 'relative'
                              }}
                              onClick={() => handleViewDetail(sesion)}
                            >
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  display: 'block',
                                  color: 'text.primary',
                                  mb: 0.5,
                                  fontSize: '0.75rem'
                                }}
                              >
                                {sesion.titulo}
                              </Typography>
                              
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'primary.main',
                                  fontWeight: 'medium',
                                  display: 'block',
                                  mb: 0.3,
                                  fontSize: '0.7rem'
                                }}
                              >
                                {sesion.hora_inicio}
                                {sesion.hora_fin && ` - ${sesion.hora_fin}`}
                              </Typography>
                              
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  display: 'block',
                                  mb: 0.3,
                                  fontSize: '0.65rem'
                                }}
                              >
                                {sesion.terapeuta_nombre}
                              </Typography>
                              
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  display: 'block',
                                  fontSize: '0.6rem'
                                }}
                              >
                                {renderPacientes(sesion)}
                              </Typography>

                              {/* Botón de detalles pequeño */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  display: 'flex',
                                  gap: 0.5
                                }}
                              >
                                <Tooltip title="Ver detalles">
                                  <IconButton
                                    size="small"
                                    sx={{ 
                                      width: 18, 
                                      height: 18,
                                      bgcolor: 'primary.main',
                                      color: 'white',
                                      '&:hover': {
                                        bgcolor: 'primary.dark'
                                      }
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetail(sesion);
                                    }}
                                  >
                                    <Visibility sx={{ fontSize: 10 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      ))}
                    </Fragment>
                  ))}
                </Box>
              </Paper>
            </Box>
          ) : (
            /* Vista de Lista */
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {/* Código: eliminado */}
                    <TableCell>Título</TableCell>
                    <TableCell>Terapeuta</TableCell>
                    <TableCell>Especialidad</TableCell>
                    <TableCell>Horario</TableCell>
                    <TableCell>Días</TableCell>
                    <TableCell>Paciente(s)</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSesiones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Box>
                          <Search sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm ? 'No se encontraron sesiones' : 'No hay sesiones registradas'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {searchTerm
                              ? 'Intenta con otros términos de búsqueda'
                              : 'Comienza creando la primera sesión'}
                          </Typography>
                          {!searchTerm && (
                            <Button
                              variant="contained"
                              startIcon={<PersonAdd />}
                              onClick={() => {
                                if (onNavigateToCreate) {
                                  onNavigateToCreate();
                                } else {
                                  navigate('/terapeutico/crear-sesion');
                                }
                              }}
                              sx={{ mt: 2 }}
                            >
                              Crear Primera Sesión
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSesiones
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => (
                        <TableRow key={item.id}>
                          {/* Título */}
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {item.titulo}
                            </Typography>
                          </TableCell>

                          {/* Terapeuta con avatar */}
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, bgcolor: '#7e57c2' }}>
                                <Person />
                              </Avatar>
                              <Typography variant="body2">
                                {item.terapeuta_nombre}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Especialidad (solo nombre) */}
                          <TableCell>
                            <Typography variant="body2">{item.especialidad_nombre}</Typography>
                          </TableCell>

                          {/* Horario */}
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                                {item.hora_inicio || 'No definido'}
                                {item.hora_fin && ` - ${item.hora_fin}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.duracion_minutos || 45} min
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Días */}
                          <TableCell>
                            <Box>
                              {item.dias_semana?.map(dia => (
                                <Chip
                                  key={dia}
                                  label={dia}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          </TableCell>

                          {/* Paciente(s) – nombres */}
                          <TableCell>
                            <Typography variant="body2">
                              {renderPacientes(item)}
                            </Typography>
                          </TableCell>

                          {/* Acciones */}
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Ver detalles">
                                <IconButton
                                  color="info"
                                  size="small"
                                  onClick={() => handleViewDetail(item)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancelar">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleDelete(item.id)}
                                  disabled={item.estado === 'cancelado'}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Paginación - solo mostrar en vista lista */}
          {viewMode === 'list' && (
            <TablePagination
              component="div"
              count={filteredSesiones.length}
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
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalles (sin cambios solicitados, se mantiene completo) */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Schedule sx={{ mr: 2 }} />
            Detalles de la Sesión Terapéutica
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información General</Typography>
                <Typography variant="body2">
                  <strong>Código:</strong> {detailDialog.data.codigo_sesion}
                </Typography>
                <Typography variant="body2">
                  <strong>Título:</strong> {detailDialog.data.titulo}
                </Typography>
                <Typography variant="body2">
                  <strong>Estado:</strong> {detailDialog.data.estado}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Terapeuta y Especialidad</Typography>
                <Typography variant="body2">
                  <strong>Terapeuta:</strong> {detailDialog.data.terapeuta_nombre}
                </Typography>
                <Typography variant="body2">
                  <strong>Especialidad:</strong> {detailDialog.data.especialidad_nombre}
                </Typography>
                <Typography variant="body2">
                  <strong>Área:</strong> {detailDialog.data.especialidad_area}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Programación</Typography>
                <Typography variant="body2">
                  <strong>Período:</strong> {detailDialog.data.fecha_inicio} - {detailDialog.data.fecha_fin}
                </Typography>
                <Typography variant="body2">
                  <strong>Días:</strong> {detailDialog.data.dias_semana?.join(', ')}
                </Typography>
                <Typography variant="body2">
                  <strong>Horario:</strong> {detailDialog.data.hora_inicio}
                  {detailDialog.data.hora_fin && ` - ${detailDialog.data.hora_fin}`}
                </Typography>
                <Typography variant="body2">
                  <strong>Duración:</strong> {detailDialog.data.duracion_minutos || 45} minutos
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Pacientes Asignados</Typography>
                <Typography variant="body2">
                  <strong>Total Pacientes:</strong> {detailDialog.data.total_pacientes || detailDialog.data.estadisticas?.total_pacientes || 'No especificado'}
                </Typography>
                <Typography variant="body2">
                  <strong>Pacientes:</strong> {renderPacientes(detailDialog.data)}
                </Typography>
                <Typography variant="body2">
                  <strong>Tipo de Sesión:</strong> {detailDialog.data.tipo_sesion || 'Individual'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información Financiera</Typography>
                <Typography variant="body2">
                  <strong>Sesiones Contratadas:</strong> {detailDialog.data.numero_sesiones_contratadas}
                </Typography>
                <Typography variant="body2">
                  <strong>Costo Total:</strong> ${detailDialog.data.costo_total}
                </Typography>
                <Typography variant="body2">
                  <strong>Costo por Sesión:</strong> ${detailDialog.data.costo_por_sesion}
                </Typography>
                <Typography variant="body2">
                  <strong>Meses de Contrato:</strong> {detailDialog.data.meses_contrato}
                </Typography>
              </Grid>

              {detailDialog.data.observaciones && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Observaciones</Typography>
                  <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2">{detailDialog.data.observaciones}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={() => {
              if (detailDialog.data?.id) {
                handleOpenAddPatient(detailDialog.data.id);
              }
            }}
            disabled={!detailDialog.data?.id}
            color="success"
          >
            Agregar Paciente
          </Button>
          <Button 
            variant="outlined"
            onClick={() => {
              setDetailDialog({ open: false, data: null });
              navigate(`/dashboard/terapeutico/sesion/${detailDialog.data?.id}`);
            }}
            disabled={!detailDialog.data?.id}
          >
            Ver Detalle Completo
          </Button>
          <Button onClick={() => setDetailDialog({ open: false, data: null })}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Patient Dialog */}
      <Dialog
        open={addPatientDialog.open}
        onClose={() => {
          setAddPatientDialog({ open: false, sessionId: null });
          setNewPatientId('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PersonAdd sx={{ mr: 2, color: 'primary.main' }} />
            Agregar Paciente a la Sesión
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel shrink>Seleccionar Paciente</InputLabel>
              <Select
                sx={{...purpleOutlineSX}}
                value={newPatientId}
                onChange={(e) => setNewPatientId(e.target.value)}
                label="Seleccionar Paciente"
                displayEmpty
                renderValue={(val) => {
                  if (!val) return 'Seleccione un paciente disponible';
                  const paciente = pacientesDisponibles.find(p => String(p.id) === String(val));
                  return paciente 
                    ? `${paciente.nombre_completo || `${paciente.nombre} ${paciente.apellido}`} - ${paciente.cedula}`
                    : 'Seleccione un paciente disponible';
                }}
              >
                <MenuItem value="">Seleccione un paciente disponible</MenuItem>
                {pacientesDisponibles.map((paciente) => (
                  <MenuItem key={paciente.id} value={paciente.id}>
                    <Box display="flex" alignItems="center" width="100%">
                      <Avatar sx={{ mr: 2, bgcolor: '#7e57c2', width: 32, height: 32 }}>
                        <Person fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {paciente.nombre_completo || `${paciente.nombre} ${paciente.apellido}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cédula: {paciente.cedula}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {pacientesDisponibles.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No hay pacientes disponibles para agregar. Todos los pacientes activos ya pueden estar asignados a sesiones.
                <br />
                <small>Si este mensaje persiste, revise la consola del navegador (F12) para más detalles.</small>
              </Alert>
            )}
            
            {/* Debug info - remove in production */}
            <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.100', fontSize: '0.75rem', borderRadius: 1 }}>
              <Typography variant="caption" display="block">
                <strong>Debug Info:</strong>
              </Typography>
              <Typography variant="caption" display="block">
                Session ID: {addPatientDialog.sessionId || 'No ID'}
              </Typography>
              <Typography variant="caption" display="block">
                Available Patients: {pacientesDisponibles.length}
              </Typography>
              <Typography variant="caption" display="block">
                Selected Patient ID: {newPatientId || 'None'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setAddPatientDialog({ open: false, sessionId: null });
              setNewPatientId('');
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddPatient} 
            variant="contained"
            disabled={!newPatientId}
            startIcon={<PersonAdd />}
          >
            Agregar Paciente
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
  );
};

export default SesionesTerapeuticas;
