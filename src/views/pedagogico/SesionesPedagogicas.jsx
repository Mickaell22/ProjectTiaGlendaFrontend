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
  AccessTime, Event, School, Share, Link, ContentCopy
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import { useUserRole } from 'src/hooks/useUserRole';
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
  const { isAdmin } = useUserRole();
  const [sesiones, setSesiones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [addStudentDialog, setAddStudentDialog] = useState({ open: false, sessionId: null });
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [newEstudianteId, setNewEstudianteId] = useState('');
  const [searchStudentTerm, setSearchStudentTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [shareDialog, setShareDialog] = useState({ open: false, sessionId: null });
  const [publicLinks, setPublicLinks] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [newLinkData, setNewLinkData] = useState({
    description: 'Enlace para padres',
    duration_hours: 168 // 7 días por defecto
  });
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
    console.log('Datos de sesión pedagógica:', item);
    console.log('costo_total:', item.costo_total);
    console.log('costo_por_clase:', item.costo_por_clase);
    console.log('periodo_academico:', item.periodo_academico);
    setDetailDialog({ open: true, data: item });
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await sesionPedagogicaService.getPacientesDisponibles();
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
      console.error('Error fetching available students:', error);
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
        fecha_incorporacion: new Date().toISOString().split('T')[0]
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

  // Funciones para manejo de enlaces públicos
  const handleOpenShareDialog = async (sessionId) => {
    setShareDialog({ open: true, sessionId });
    setShareLoading(true);
    try {
      const response = await sesionPedagogicaService.getPublicLinks(sessionId);
      const enlaces = response?.enlaces || [];
      setPublicLinks(enlaces);
    } catch (error) {
      console.error('Error fetching public links:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar enlaces públicos',
        severity: 'error'
      });
    } finally {
      setShareLoading(false);
    }
  };

  const handleGeneratePublicLink = async () => {
    if (!shareDialog.sessionId) return;

    setShareLoading(true);
    try {
      await sesionPedagogicaService.generatePublicLink(shareDialog.sessionId, newLinkData);

      setSnackbar({
        open: true,
        message: 'Enlace público generado exitosamente',
        severity: 'success'
      });

      // Refresh the links list
      await handleOpenShareDialog(shareDialog.sessionId);

      // Reset form
      setNewLinkData({
        description: 'Enlace para padres',
        duration_hours: 168
      });

    } catch (error) {
      console.error('Error generating public link:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al generar enlace público',
        severity: 'error'
      });
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = (token) => {
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/sesion-pedagogica-publica/${token}`;

    navigator.clipboard.writeText(publicUrl).then(() => {
      setSnackbar({
        open: true,
        message: 'Enlace copiado al portapapeles',
        severity: 'success'
      });
    }).catch(() => {
      setSnackbar({
        open: true,
        message: 'Error al copiar enlace',
        severity: 'error'
      });
    });
  };

  const handleInvalidateLink = async (token) => {
    if (!window.confirm('¿Estás seguro de que deseas invalidar este enlace?')) {
      return;
    }

    setShareLoading(true);
    try {
      await sesionPedagogicaService.invalidatePublicLink(token);

      setSnackbar({
        open: true,
        message: 'Enlace invalidado exitosamente',
        severity: 'success'
      });

      // Refresh the links list
      await handleOpenShareDialog(shareDialog.sessionId);

    } catch (error) {
      console.error('Error invalidating link:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al invalidar enlace',
        severity: 'error'
      });
    } finally {
      setShareLoading(false);
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

  // Filtrar estudiantes disponibles para el diálogo
  const filteredEstudiantesDisponibles = estudiantesDisponibles.filter(e => {
    if (!searchStudentTerm) return true;
    const term = searchStudentTerm.toLowerCase();
    const nombreCompleto = (
      e.nombre_completo ||
      e.nombre_paciente ||
      `${e.nombre || e.nombres || ''} ${e.apellido || e.apellidos || ''}`
    ).toLowerCase();
    const cedula = (e.cedula || e.numero_documento || '').toLowerCase();
    return nombreCompleto.includes(term) || cedula.includes(term);
  });

  // Función para generar horarios de la semana
  const generateWeekSchedule = () => {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
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
          'viernes': 'Viernes'
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
        border: theme.palette.mode === 'primary' ? `1px solid ${theme.palette.divider}` : 'none',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1000, md: 1200 },
          mx: 'auto'
        }}
      >
        {/* Header verde para sesiones pedagógicas */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
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
              color="success"
              startIcon={<PersonAdd />}
              onClick={() => {
                if (onNavigateToCreate) {
                  onNavigateToCreate();
                } else {
                  navigate('/pedagogico/crear-sesion');
                }
              }}
              sx={{ height: 40, px: 2, bgcolor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), '&:hover': { bgcolor: theme.palette.primary.dark } }}
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
                                bgcolor: theme.palette.mode === 'primary' ? 'primary.dark' : 'primary.light',
                                border: '1px solid',
                                borderColor: 'primary.main',
                                color: 'text.primary',
                                fontSize: '0.75rem',
                                borderRadius: 1,
                                '&:hover': {
                                  bgcolor: theme.palette.mode === 'primary' ? 'primary.light' : 'primary.dark',
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
                                      bgcolor: 'primary.main',
                                      color: 'white',
                                      '&:hover': {
                                        bgcolor: 'success.dark'
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
                              sx={{ mt: 2, bgcolor: 'primary.main', '&:hover': { bgcolor: 'success.dark' } }}
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
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
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
                              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
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
                                  sx={{ mr: 0.5, mb: 0.5, bgcolor: theme.palette.mode === 'dark' ? 'success.dark' : 'success.light', color: theme.palette.mode === 'dark' ? 'success.contrastText' : 'success.dark' }}
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

      {/* Dialog de detalles - Diseño mejorado */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[10]
          }
        }}
      >
        {/* Header con gradiente */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: 3
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 48,
                  height: 48,
                  mr: 2
                }}
              >
                <School />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {detailDialog.data?.titulo || 'Sesión Pedagógica'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  {detailDialog.data?.codigo_sesion || 'Sin código'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={detailDialog.data?.estado || 'Activo'}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                height: 32
              }}
            />
          </Box>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {detailDialog.data && (
            <Box>
              {/* Sección: Información Principal */}
              <Box sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
                <Grid container spacing={3}>
                  {/* Pedagogo */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        height: '100%'
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5, width: 32, height: 32 }}>
                          <School sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          Pedagogo
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {detailDialog.data.pedagogo?.nombre || detailDialog.data.pedagogo_nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {detailDialog.data.especialidad?.nombre || detailDialog.data.especialidad_nombre}
                      </Typography>
                      {(detailDialog.data.especialidad?.area || detailDialog.data.especialidad_area) && (
                        <Chip
                          label={detailDialog.data.especialidad?.area || detailDialog.data.especialidad_area}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Paper>
                  </Grid>

                  {/* Estudiantes */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        height: '100%'
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'success.main', mr: 1.5, width: 32, height: 32 }}>
                          <Person sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                          Estudiantes
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6">
                          {detailDialog.data.total_estudiantes || detailDialog.data.estadisticas?.total_estudiantes || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {detailDialog.data.nivel_academico || 'No especificado'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {renderEstudiantes(detailDialog.data)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Capacidad máxima: {detailDialog.data.capacidad_maxima || 'No especificado'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Sección: Programación */}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center">
                  <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                  Programación
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        Fecha Inicio
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ mt: 0.5 }}>
                        {detailDialog.data.fecha_inicio}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        Fecha Fin
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ mt: 0.5 }}>
                        {detailDialog.data.fecha_fin}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        Horario
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ mt: 0.5 }}>
                        {detailDialog.data.hora_inicio}
                        {detailDialog.data.hora_fin && ` - ${detailDialog.data.hora_fin}`}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        Duración
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ mt: 0.5 }}>
                        {detailDialog.data.duracion_minutos || 60} min
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Días de la semana
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {(Array.isArray(detailDialog.data.dias_semana)
                          ? detailDialog.data.dias_semana
                          : detailDialog.data.dias_semana?.split(',').map(d => d.trim()) || []
                        ).map(dia => (
                          <Chip
                            key={dia}
                            label={dia}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Sección: Información Académica */}
              <Divider />
              <Box sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Información Académica
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="primary.main" fontWeight="bold">
                        {detailDialog.data.numero_clases_programadas || detailDialog.data.clases_programadas || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Clases Programadas
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="success.main" fontWeight="bold">
                        {detailDialog.data.clases_realizadas || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Clases Realizadas
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="info.main" fontWeight="bold">
                        {detailDialog.data.clases_programadas > 0
                          ? Math.round((detailDialog.data.clases_realizadas / detailDialog.data.clases_programadas) * 100)
                          : 0}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Progreso
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="warning.main" fontWeight="bold">
                        {detailDialog.data.modalidad || 'Presencial'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Modalidad
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      <strong>Período Académico:</strong> {detailDialog.data.periodo_academico || 'No especificado'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Sección: Información Financiera (solo Admin) */}
              {isAdmin && (
                <>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Información Financiera
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" color="success.main" fontWeight="bold">
                            ${detailDialog.data.costo_total || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Costo Total
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" color="info.main" fontWeight="bold">
                            ${detailDialog.data.costo_por_clase || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Costo por Clase
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}

              {/* Sección: Adaptación Curricular */}
              {detailDialog.data.adaptacion_curricular && (
                <>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Adaptación Curricular
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {detailDialog.data.adaptacion_curricular}
                      </Typography>
                    </Paper>
                  </Box>
                </>
              )}

              {/* Sección: Observaciones */}
              {detailDialog.data.observaciones && (
                <>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Observaciones
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {detailDialog.data.observaciones}
                      </Typography>
                    </Paper>
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, gap: 1, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50' }}>
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
            sx={{ borderRadius: 2 }}
          >
            Agregar Estudiante
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={() => {
              if (detailDialog.data?.id) {
                handleOpenShareDialog(detailDialog.data.id);
              }
            }}
            disabled={!detailDialog.data?.id}
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Compartir Enlace
          </Button>
          <Box flex={1} />
          <Button
            variant="contained"
            onClick={() => {
              setDetailDialog({ open: false, data: null });
              navigate(`/pedagogico/sesion/${detailDialog.data?.id}`);
            }}
            disabled={!detailDialog.data?.id}
            sx={{ borderRadius: 2 }}
          >
            Ver Detalle Completo
          </Button>
          <Button
            onClick={() => setDetailDialog({ open: false, data: null })}
            sx={{ borderRadius: 2 }}
          >
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
          setSearchStudentTerm('');
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
            <TextField
              fullWidth
              placeholder="Buscar estudiante por nombre o cédula..."
              value={searchStudentTerm}
              onChange={(e) => setSearchStudentTerm(e.target.value)}
              sx={{ ...purpleOutlineSX, mb: 2 }}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: 'text.secondary' }} />
                )
              }}
            />

            {estudiantesDisponibles.length === 0 ? (
              <Alert severity="info">
                No hay estudiantes disponibles para agregar.
              </Alert>
            ) : (
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {filteredEstudiantesDisponibles.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No se encontraron estudiantes con "{searchStudentTerm}"
                  </Typography>
                ) : (
                  filteredEstudiantesDisponibles.map((estudiante) => (
                    <Box
                      key={estudiante.id}
                      onClick={() => setNewEstudianteId(estudiante.id)}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: newEstudianteId === estudiante.id ? 'primary.main' : 'divider',
                        backgroundColor: newEstudianteId === estudiante.id
                          ? theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light'
                          : theme.palette.mode === 'dark' ? 'transparent' : 'grey.50',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' ? 'primary.light' : 'grey.100',
                          borderColor: 'primary.main'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <Person />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {estudiante.nombre_completo ||
                             estudiante.nombre_paciente ||
                             `${estudiante.nombre || estudiante.nombres || ''} ${estudiante.apellido || estudiante.apellidos || ''}`.trim() ||
                             'Sin nombre'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Cédula: {estudiante.cedula || estudiante.numero_documento || 'No especificada'}
                          </Typography>
                        </Box>
                        {newEstudianteId === estudiante.id && (
                          <Chip label="Seleccionado" color="primary" size="small" />
                        )}
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddStudentDialog({ open: false, sessionId: null });
              setNewEstudianteId('');
              setSearchStudentTerm('');
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddStudent} 
            variant="contained"
            disabled={!newEstudianteId}
            startIcon={<PersonAdd />}
            sx={{ bgcolor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
          >
            Agregar Estudiante
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Public Links Dialog */}
      <Dialog
        open={shareDialog.open}
        onClose={() => {
          setShareDialog({ open: false, sessionId: null });
          setPublicLinks([]);
          setNewLinkData({ description: 'Enlace para padres', duration_hours: 168 });
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Share sx={{ mr: 2, color: 'primary.main' }} />
            Compartir Enlace Público
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Form to generate new link */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: theme.palette.mode === 'dark' ? 'transparent' : 'grey.50' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Generar Nuevo Enlace
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    value={newLinkData.description}
                    onChange={(e) => setNewLinkData({ ...newLinkData, description: e.target.value })}
                    sx={{ ...purpleOutlineSX }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth sx={{ ...purpleOutlineSX }}>
                    <InputLabel>Duración</InputLabel>
                    <Select
                      value={newLinkData.duration_hours}
                      onChange={(e) => setNewLinkData({ ...newLinkData, duration_hours: e.target.value })}
                      label="Duración"
                    >
                      <MenuItem value={24}>1 día</MenuItem>
                      <MenuItem value={72}>3 días</MenuItem>
                      <MenuItem value={168}>1 semana</MenuItem>
                      <MenuItem value={336}>2 semanas</MenuItem>
                      <MenuItem value={720}>1 mes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Link />}
                  onClick={handleGeneratePublicLink}
                  disabled={shareLoading || !newLinkData.description.trim()}
                >
                  Generar Enlace
                </Button>
              </Box>
            </Paper>

            {/* Existing links list */}
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
              Enlaces Activos ({publicLinks.length})
            </Typography>

            {shareLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Typography>Cargando enlaces...</Typography>
              </Box>
            ) : publicLinks.length === 0 ? (
              <Alert severity="info">
                No hay enlaces públicos activos para esta sesión.
              </Alert>
            ) : (
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {publicLinks.map((link, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2, borderLeft: `4px solid ${link.estado === 'vigente' ? theme.palette.success.main : theme.palette.warning.main}` }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" fontWeight="medium">
                          {link.descripcion}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Creado: {new Date(link.fecha_creacion).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Expira: {new Date(link.fecha_expiracion).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Chip
                          label={link.estado}
                          color={link.estado === 'vigente' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Copiar enlace">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyLink(link.token)}
                              color="primary"
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Invalidar enlace">
                            <IconButton
                              size="small"
                              onClick={() => handleInvalidateLink(link.token)}
                              color="error"
                              disabled={link.estado === 'expirado'}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Información importante:</strong>
                <br />
                • Los enlaces públicos permiten a los padres ver el progreso de las sesiones pedagógicas sin necesidad de iniciar sesión.
                <br />
                • Los enlaces expiran automáticamente después del tiempo seleccionado.
                <br />
                • Puedes invalidar manualmente cualquier enlace activo.
                <br />
                • La información mostrada es limitada y no incluye datos sensibles.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShareDialog({ open: false, sessionId: null });
              setPublicLinks([]);
              setNewLinkData({ description: 'Enlace para padres', duration_hours: 168 });
            }}
          >
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
  );
};

export default SesionesPedagogicas;