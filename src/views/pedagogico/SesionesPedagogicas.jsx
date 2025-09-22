// src/views/pedagogico/SesionesPedagogicas.jsx
import React, { useEffect, useState, Fragment } from 'react';
import {
  Box, Card, CardContent, Container, IconButton, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, Button, InputAdornment, ToggleButtonGroup,
  ToggleButton, Paper, Divider, FormControl, InputLabel, Select, MenuItem,
 useTheme
} from '@mui/material';
import {
  Delete, Search, Visibility, Person,
  Schedule, PersonAdd, ViewList, CalendarViewWeek,
  AccessTime, Event, School
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionPedagogicaService from 'src/services/SesionPedagogicaService';

/* ---------- Estilos compartidos ---------- */
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const SesionesPedagogicas = ({ onNavigateToCreate }) => {
  const theme = useTheme();
  const [sesiones, setSesiones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [addStudentDialog, setAddStudentDialog] = useState({ open: false, sessionId: null });
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [newEstudianteId, setNewEstudianteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await sesionPedagogicaService.getSesiones();
      let sesionesData = response.data || [];
      
      // Filtrar por rol: si es pedagogo, mostrar solo sus sesiones
      if (user?.rol?.nombre === 'Pedagogo' || user?.rol?.nombre === 'Educador') {
        const userId = user.id_personal || user.id;
        sesionesData = sesionesData.filter(sesion => 
          sesion.pedagogo?.id === userId || 
          sesion.id_pedagogo === userId
        );
      }
      
      setSesiones(sesionesData);
    } catch (err) {
      const errorMessage = sesionPedagogicaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de cancelar esta sesión pedagógica?')) {
      try {
        await sesionPedagogicaService.deleteSesion(id);
        setSnackbar({ open: true, message: 'Sesión cancelada correctamente', severity: 'info' });
        fetchData();
      } catch (error) {
        const errorMessage = sesionPedagogicaService.handleError(error);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
    }
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await sesionPedagogicaService.getEstudiantesDisponibles();
      let estudiantesData = [];
      if (response?.data) {
        estudiantesData = Array.isArray(response.data) ? response.data : response.data.data || [];
      } else if (Array.isArray(response)) {
        estudiantesData = response;
      }
      
      setEstudiantesDisponibles(estudiantesData);
      
      if (estudiantesData.length === 0) {
        setSnackbar({ 
          open: true, 
          message: 'No hay estudiantes disponibles para agregar', 
          severity: 'warning' 
        });
      }
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Error al cargar estudiantes disponibles', 
        severity: 'error' 
      });
      setEstudiantesDisponibles([]);
    }
  };

  const handleOpenAddStudent = (sessionId) => {
    fetchAvailableStudents();
    setAddStudentDialog({ open: true, sessionId });
  };

  const handleAddStudent = async () => {
    if (!newEstudianteId) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor seleccione un estudiante', 
        severity: 'warning' 
      });
      return;
    }
    
    if (!addStudentDialog.sessionId) {
      setSnackbar({ 
        open: true, 
        message: 'Error: ID de sesión no encontrado', 
        severity: 'error' 
      });
      return;
    }
    
    const selectedStudent = estudiantesDisponibles.find(e => String(e.id) === String(newEstudianteId));
    
    try {
      const studentData = {
        paciente_id: parseInt(newEstudianteId),
        fecha_incorporacion: new Date().toISOString().split('T')[0],
        nivel_actual: 'basico',
        observaciones_estudiante: 'Estudiante agregado desde la interfaz'
      };
      
      await sesionPedagogicaService.addEstudianteToSesion(addStudentDialog.sessionId, studentData);
      
      setSnackbar({ 
        open: true, 
        message: `Estudiante ${selectedStudent?.nombre_completo || 'seleccionado'} agregado correctamente`, 
        severity: 'success' 
      });
      
      await fetchData();
      setAddStudentDialog({ open: false, sessionId: null });
      setNewEstudianteId('');
      
    } catch (error) {
      
      let errorMessage = 'Error al agregar estudiante a la sesión';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos. Verifique que el estudiante no esté ya asignado a esta sesión.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Sesión o estudiante no encontrado.';
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

  // Render seguro de estudiantes
  const renderEstudiantes = (item) => {
    const nombres =
      (Array.isArray(item.estudiantes) && item.estudiantes.map(e => e.nombre_completo || e.nombre || '').filter(Boolean)) ||
      (item.estudiantes_nombres && Array.isArray(item.estudiantes_nombres) && item.estudiantes_nombres) ||
      (item.estudiante_nombre ? [item.estudiante_nombre] : []);

    if (!nombres.length) {
      // Acceder a total_estudiantes desde estadisticas o directamente
      const count = item.estadisticas?.total_estudiantes || 
                   item.total_estudiantes || 
                   item.estudiantes_count || 
                   (item.estudiantes && item.estudiantes.length) || 0;
      if (count > 1) return `Grupo (${count})`;
      return count === 1 ? '1 estudiante' : '—';
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
      s.pedagogo?.nombre?.toLowerCase().includes(term) ||
      s.pedagogo_nombre?.toLowerCase().includes(term) ||
      s.especialidad?.nombre?.toLowerCase().includes(term) ||
      s.especialidad_nombre?.toLowerCase().includes(term) ||
      s.codigo_sesion?.toLowerCase().includes(term)
    );
    return matchesSearch;
  });

  // Función para generar horarios de la semana
  const generateWeekSchedule = () => {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const horas = Array.from({ length: 12 }, (_, i) => {
      const hora = 7 + i;
      return `${hora.toString().padStart(2, '0')}:00`;
    });
    
    const horario = {};
    
    filteredSesiones.forEach(sesion => {
      if (!sesion.dias_semana || !sesion.hora_inicio) return;
      
      const diasSesion = Array.isArray(sesion.dias_semana) 
        ? sesion.dias_semana 
        : sesion.dias_semana.split(',').map(d => d.trim());
      
      const horaInicio = sesion.hora_inicio.substring(0, 5);
      
      diasSesion.forEach(dia => {
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
          backgroundColor: 'background.paper',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1000, md: 1200 },
          mx: 'auto'
        }}
      >
        {/* Header verde para sesiones pedagógicas */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <School sx={{ mr: 1 }} />
              Sesiones Pedagógicas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Busca y gestiona las sesiones educativas registradas
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
          {/* Toolbar */}
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
              placeholder="Buscar por título, pedagogo o especialidad..."
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
                  navigate('/pedagogico/crear-sesion');
                }
              }}
              sx={{ height: 40, px: 2, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
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
                <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50', display: 'flex', alignItems: 'center' }}>
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
                  <Box />
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
                                bgcolor: theme.palette.mode === 'dark' ? 'success.dark' : '#e8f5e8',
                                border: '1px solid',
                                borderColor: '#4caf50',
                                color: 'text.primary',
                                fontSize: '0.75rem',
                                borderRadius: 1,
                                '&:hover': {
                                  bgcolor: theme.palette.mode === 'dark' ? 'success.main' : '#c8e6c9',
                                  borderColor: '#388e3c',
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
                                  color: '#4caf50',
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
                                {sesion.pedagogo?.nombre || sesion.pedagogo_nombre}
                              </Typography>
                              
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  display: 'block',
                                  fontSize: '0.6rem'
                                }}
                              >
                                {renderEstudiantes(sesion)}
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
                                      bgcolor: 'success.main',
                                      color: 'white',
                                      '&:hover': {
                                        bgcolor: '#388e3c'
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
                    <TableCell>Título</TableCell>
                    <TableCell>Pedagogo</TableCell>
                    <TableCell>Especialidad</TableCell>
                    <TableCell>Horario</TableCell>
                    <TableCell>Días</TableCell>
                    <TableCell>Estudiante(s)</TableCell>
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
                              : 'Comienza creando la primera sesión pedagógica'}
                          </Typography>
                          {!searchTerm && (
                            <Button
                              variant="contained"
                              startIcon={<PersonAdd />}
                              onClick={() => {
                                if (onNavigateToCreate) {
                                  onNavigateToCreate();
                                } else {
                                  navigate('/pedagogico/crear-sesion');
                                }
                              }}
                              sx={{ mt: 2, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
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
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {item.titulo}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, bgcolor: 'success.main' }}>
                                <School />
                              </Avatar>
                              <Typography variant="body2">
                                {item.pedagogo?.nombre || item.pedagogo_nombre}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {item.especialidad?.nombre || item.especialidad_nombre}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#4caf50' }}>
                                {item.hora_inicio || 'No definido'}
                                {item.hora_fin && ` - ${item.hora_fin}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.duracion_minutos || 60} min
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box>
                              {(Array.isArray(item.dias_semana) ? item.dias_semana : 
                                item.dias_semana?.split(',').map(d => d.trim()) || [])
                                .map(dia => (
                                <Chip
                                  key={dia}
                                  label={dia}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5, bgcolor: theme.palette.mode === 'dark' ? 'success.dark' : '#e8f5e8', color: theme.palette.mode === 'dark' ? 'success.contrastText' : '#2e7d32' }}
                                />
                              ))}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {renderEstudiantes(item)}
                            </Typography>
                          </TableCell>

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

      {/* Dialog de detalles */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <School sx={{ mr: 2 }} />
            Detalles de la Sesión Pedagógica
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información General</Typography>
                <Typography variant="body2">
                  <strong>Código:</strong> {detailDialog.data.codigo_sesion || 'No asignado'}
                </Typography>
                <Typography variant="body2">
                  <strong>Título:</strong> {detailDialog.data.titulo}
                </Typography>
                <Typography variant="body2">
                  <strong>Estado:</strong> {detailDialog.data.estado}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Pedagogo y Especialidad</Typography>
                <Typography variant="body2">
                  <strong>Pedagogo:</strong> {detailDialog.data.pedagogo?.nombre || detailDialog.data.pedagogo_nombre}
                </Typography>
                <Typography variant="body2">
                  <strong>Especialidad:</strong> {detailDialog.data.especialidad?.nombre || detailDialog.data.especialidad_nombre}
                </Typography>
                <Typography variant="body2">
                  <strong>Área:</strong> {detailDialog.data.especialidad?.area || detailDialog.data.especialidad_area}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Programación</Typography>
                <Typography variant="body2">
                  <strong>Período:</strong> {detailDialog.data.fecha_inicio} - {detailDialog.data.fecha_fin}
                </Typography>
                <Typography variant="body2">
                  <strong>Días:</strong> {Array.isArray(detailDialog.data.dias_semana) ? 
                    detailDialog.data.dias_semana.join(', ') : 
                    (detailDialog.data.dias_semana?.split(',').join(', ') || 'No definido')}
                </Typography>
                <Typography variant="body2">
                  <strong>Horario:</strong> {detailDialog.data.hora_inicio}
                  {detailDialog.data.hora_fin && ` - ${detailDialog.data.hora_fin}`}
                </Typography>
                <Typography variant="body2">
                  <strong>Duración:</strong> {detailDialog.data.duracion_minutos || 60} minutos
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Estudiantes</Typography>
                <Typography variant="body2">
                  <strong>Total Estudiantes:</strong> {detailDialog.data.total_estudiantes || 
                    detailDialog.data.estadisticas?.total_estudiantes || 'No especificado'}
                </Typography>
                <Typography variant="body2">
                  <strong>Estudiantes:</strong> {renderEstudiantes(detailDialog.data)}
                </Typography>
                <Typography variant="body2">
                  <strong>Nivel Académico:</strong> {detailDialog.data.nivel_academico || 'No especificado'}
                </Typography>
                <Typography variant="body2">
                  <strong>Capacidad Máxima:</strong> {detailDialog.data.capacidad_maxima || 'No especificado'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información Académica</Typography>
                <Typography variant="body2">
                  <strong>Clases Programadas:</strong> {detailDialog.data.numero_clases_programadas || 'No especificado'}
                </Typography>
                <Typography variant="body2">
                  <strong>Modalidad:</strong> {detailDialog.data.modalidad || 'Presencial'}
                </Typography>
                <Typography variant="body2">
                  <strong>Período Académico:</strong> {detailDialog.data.periodo_academico || 'No especificado'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información Financiera</Typography>
                <Typography variant="body2">
                  <strong>Costo Total:</strong> ${detailDialog.data.costo_total || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Costo por Clase:</strong> ${detailDialog.data.costo_por_clase || 0}
                </Typography>
              </Grid>

              {detailDialog.data.observaciones && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Observaciones</Typography>
                  <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
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
                handleOpenAddStudent(detailDialog.data.id);
              }
            }}
            disabled={!detailDialog.data?.id}
            color="success"
          >
            Agregar Estudiante
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setDetailDialog({ open: false, data: null });
              navigate(`/pedagogico/sesion/${detailDialog.data?.id}`);
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

      {/* Add Student Dialog */}
      <Dialog
        open={addStudentDialog.open}
        onClose={() => {
          setAddStudentDialog({ open: false, sessionId: null });
          setNewEstudianteId('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PersonAdd sx={{ mr: 2, color: 'primary.main' }} />
            Agregar Estudiante a la Sesión
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel shrink>Seleccionar Estudiante</InputLabel>
              <Select
                sx={{...purpleOutlineSX}}
                value={newEstudianteId}
                onChange={(e) => setNewEstudianteId(e.target.value)}
                label="Seleccionar Estudiante"
                displayEmpty
                renderValue={(val) => {
                  if (!val) return 'Seleccione un estudiante disponible';
                  const estudiante = estudiantesDisponibles.find(e => String(e.id) === String(val));
                  return estudiante 
                    ? `${estudiante.nombre_completo || `${estudiante.nombre} ${estudiante.apellido}`} - ${estudiante.cedula}`
                    : 'Seleccione un estudiante disponible';
                }}
              >
                <MenuItem value="">Seleccione un estudiante disponible</MenuItem>
                {estudiantesDisponibles.map((estudiante) => (
                  <MenuItem key={estudiante.id} value={estudiante.id}>
                    <Box display="flex" alignItems="center" width="100%">
                      <Avatar sx={{ mr: 2, bgcolor: 'success.main', width: 32, height: 32 }}>
                        <Person fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {estudiante.nombre_completo || `${estudiante.nombre} ${estudiante.apellido}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cédula: {estudiante.cedula}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {estudiantesDisponibles.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No hay estudiantes disponibles para agregar. Todos los estudiantes activos ya pueden estar asignados a sesiones.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setAddStudentDialog({ open: false, sessionId: null });
              setNewEstudianteId('');
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddStudent} 
            variant="contained"
            disabled={!newEstudianteId}
            startIcon={<PersonAdd />}
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
          >
            Agregar Estudiante
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

export default SesionesPedagogicas;