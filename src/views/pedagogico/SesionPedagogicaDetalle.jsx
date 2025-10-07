// src/views/pedagogico/SesionPedagogicaDetalle.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Grid, IconButton, Paper, Snackbar, Tab, Tabs,
  Table, TableBody, TableCell, TableHead, TableRow, Typography, Alert,
  Chip, Avatar, List, ListItem, ListItemText, ListItemAvatar, Tooltip,
  TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
 useTheme, InputAdornment
} from '@mui/material';
import {
  ArrowBack, Person, Schedule, Group, Assignment, CalendarMonth,
  CheckCircle, Cancel, Edit, Add, Refresh, AccessTime,
  EventAvailable, EventBusy, School, Today, Delete, PersonRemove, Search, PersonAdd,
  Visibility, Info
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionPedagogicaService from 'src/services/SesionPedagogicaService';
import { formatDateLocal } from 'src/utils/dateUtils';

/* ---------- Estilos tipo "listar" ---------- */
const greenOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'success.main' },
    '&:hover fieldset': { borderColor: 'success.main' },
    '&.Mui-focused fieldset': { borderColor: 'success.main', borderWidth: 2 }
  }
};

// Evita "saltos" al seleccionar y trunca texto largo
const selectStableSX = {
  width: '100%',
  '& .MuiSelect-select': {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '1.4375em',
    lineHeight: '1.4375em'
  }
};

const menuProps = { PaperProps: { sx: { maxHeight: 280 } } };

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`session-detail-tabpanel-${index}`}
      aria-labelledby={`session-detail-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `session-detail-tab-${index}`,
    'aria-controls': `session-detail-tabpanel-${index}`,
  };
}

const SesionPedagogicaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const [tabValue, setTabValue] = useState(0);
  const [sesion, setSesion] = useState(null);
  const [cronograma, setCronograma] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);
  const [asistenciasLoaded, setAsistenciasLoaded] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialogs state
  const [attendanceDialog, setAttendanceDialog] = useState({
    open: false,
    cronogramaId: null,
    estudianteId: null,
    data: null
  });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [addStudentDialog, setAddStudentDialog] = useState({ open: false });
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchStudentTerm, setSearchStudentTerm] = useState('');
  const [estudiantesRetirados, setEstudiantesRetirados] = useState([]);
  const [showRetirados, setShowRetirados] = useState(false);
  const [reincorporarDialog, setReincorporarDialog] = useState({
    open: false,
    pacienteId: null,
    estudianteNombre: ''
  });

  useEffect(() => {
    if (id) {
      fetchSesionData();
    }
  }, [id]);

  const fetchSesionData = async () => {
    setLoading(true);
    try {
      // Cargar datos principales
      const [sesionRes, cronogramaRes, estudiantesRes] = await Promise.all([
        sesionPedagogicaService.getSesionById(id),
        sesionPedagogicaService.getCronograma(id),
        sesionPedagogicaService.getEstudiantesSesion(id)
      ]);

      setSesion(sesionRes.data || sesionRes);
      setCronograma(cronogramaRes.data?.data || cronogramaRes.data || []);
      const estudiantesData = estudiantesRes.data?.data || estudiantesRes.data || [];
      setEstudiantes(estudiantesData);

    } catch (error) {
      const errorMessage = sesionPedagogicaService.handleError(error);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAsistencias = async () => {
    if (asistenciasLoaded || cronograma.length === 0) return;

    setLoadingAsistencias(true);
    try {
      // Obtener asistencias de todos los cronogramas
      const asistenciasPromises = cronograma.map(async (cronogramaItem) => {
        try {
          const asistenciaRes = await sesionPedagogicaService.getControlAsistencia(cronogramaItem.id);
          const asistenciaData = asistenciaRes.data?.estudiantes || asistenciaRes.data || [];
          return asistenciaData;
        } catch (err) {
          return [];
        }
      });

      const asistenciasResults = await Promise.all(asistenciasPromises);
      const todasAsistencias = asistenciasResults.flat();
      setAsistencias(todasAsistencias);
      setAsistenciasLoaded(true);
    } catch (asistenciasError) {
      setAsistencias([]);
    } finally {
      setLoadingAsistencias(false);
    }
  };

  const fetchEstudiantesDisponibles = async () => {
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
          message: 'No hay estudiantes disponibles para agregar a esta sesión',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error fetching available students:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar estudiantes disponibles: ' + (error.message || 'Error desconocido'),
        severity: 'error'
      });
      setEstudiantesDisponibles([]);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) {
      setSnackbar({
        open: true,
        message: 'Por favor seleccione un estudiante',
        severity: 'warning'
      });
      return;
    }

    if (!id) {
      setSnackbar({
        open: true,
        message: 'Error: ID de sesión no encontrado',
        severity: 'error'
      });
      return;
    }

    const selectedStudentInfo = estudiantesDisponibles.find(e => String(e.id) === String(selectedStudent));

    try {
      const studentData = {
        paciente_id: parseInt(selectedStudent),
        fecha_incorporacion: new Date().toISOString().split('T')[0]
      };

      await sesionPedagogicaService.addEstudianteToSesion(id, studentData);

      setSnackbar({
        open: true,
        message: `Estudiante ${selectedStudentInfo?.nombre_completo || 'seleccionado'} agregado correctamente`,
        severity: 'success'
      });

      await fetchSesionData();
      setAddStudentDialog({ open: false });
      setSelectedStudent('');
      setSearchStudentTerm('');

    } catch (error) {
      console.error('Error adding student:', error);

      let errorMessage = 'Error al agregar estudiante a la sesión';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Error de validación. Verifique los datos del estudiante.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Sesión o estudiante no encontrado';
      } else if (error.response?.status === 405) {
        errorMessage = 'Método no permitido. Verifique la configuración del servidor.';
      } else if (error.response?.status === 409) {
        errorMessage = 'El estudiante ya está inscrito en esta sesión';
      }

      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleRemoveStudent = async (estudianteId) => {
    if (window.confirm('¿Está seguro de remover este estudiante de la sesión?')) {
      try {
        await sesionPedagogicaService.removeEstudianteFromSesion(id, estudianteId);
        setSnackbar({ open: true, message: 'Estudiante removido de la sesión', severity: 'info' });
        fetchSesionData(); // Refresh data
      } catch (error) {
        const errorMessage = sesionPedagogicaService.handleError(error);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
    }
  };

  const handleOpenAddStudentDialog = () => {
    fetchEstudiantesDisponibles();
    setAddStudentDialog({ open: true });
  };

  const fetchEstudiantesRetirados = async () => {
    try {
      const response = await sesionPedagogicaService.getEstudiantesRetirados(id);
      const retiradosData = response.data?.data || response.data || [];
      setEstudiantesRetirados(retiradosData);
    } catch (error) {
      console.error('Error fetching retired students:', error);
    }
  };

  const handleOpenReincorporarDialog = (pacienteId, estudianteNombre) => {
    setReincorporarDialog({
      open: true,
      pacienteId,
      estudianteNombre
    });
  };

  const handleConfirmReincorporar = async () => {
    try {
      await sesionPedagogicaService.reincorporarEstudiante(id, reincorporarDialog.pacienteId);
      setSnackbar({
        open: true,
        message: `${reincorporarDialog.estudianteNombre} ha sido reincorporado a la sesión`,
        severity: 'success'
      });
      await fetchSesionData();
      await fetchEstudiantesRetirados();
      setReincorporarDialog({ open: false, pacienteId: null, estudianteNombre: '' });
    } catch (error) {
      const errorMessage = sesionPedagogicaService.handleError(error);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setReincorporarDialog({ open: false, pacienteId: null, estudianteNombre: '' });
    }
  };

  const handleToggleRetirados = async () => {
    if (!showRetirados) {
      await fetchEstudiantesRetirados();
    }
    setShowRetirados(!showRetirados);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Si cambió a la pestaña de asistencias (índice 3) y aún no se han cargado
    if (newValue === 3 && !asistenciasLoaded) {
      fetchAsistencias();
    }
  };

  const formatDate = (dateString) => formatDateLocal(dateString);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes('T') || timeString.includes(' ')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return timeString;
  };

  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'programada': return 'primary';
      case 'realizada': return 'success';
      case 'completada': return 'success';
      case 'cancelada': return 'error';
      case 'reprogramada': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'programada': return <Schedule />;
      case 'realizada': return <CheckCircle />;
      case 'completada': return <CheckCircle />;
      case 'cancelada': return <Cancel />;
      case 'reprogramada': return <Edit />;
      default: return <Schedule />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Cargando detalles de la sesión...</Typography>
      </Container>
    );
  }

  if (!sesion) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          No se pudo cargar la información de la sesión pedagógica.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>

      {/* ===== Header estilo "listar" con degradado verde ===== */}
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 3,
          backgroundColor: 'background.paper',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
          overflow: 'hidden'
        }}
      >
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate('/pedagogico')}
              sx={{ color: 'white', mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center">
                <School sx={{ mr: 1.5 }} />
                {sesion.titulo || sesion.nombre_clase}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Detalles de la sesión pedagógica
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={sesion.estado || 'Programada'}
              color={getStatusColor(sesion.estado)}
              icon={getStatusIcon(sesion.estado)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchSesionData}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              Actualizar
            </Button>
          </Box>
        </Box>

        {/* Tabs (mantengo lógica, solo estética del contenedor) */}
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Pestañas de detalle de sesión"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-flexContainer': { gap: 1 },
              '& .MuiTab-root': {
                minHeight: 56,
                textTransform: 'none',
                fontWeight: 500,
                '&.Mui-selected': { fontWeight: 600 }
              },
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
            }}
          >
            <Tab icon={<Info />} label="Información" {...a11yProps(0)} />
            <Tab icon={<Group />} label="Estudiantes" {...a11yProps(1)} />
            <Tab icon={<CalendarMonth />} label="Cronograma" {...a11yProps(2)} />
            <Tab icon={<Assignment />} label="Asistencias" {...a11yProps(3)} />
            <Tab icon={<Assignment />} label="Resumen" {...a11yProps(4)} />
          </Tabs>
        </CardContent>
      </Card>

      {/* ===== Tab Panels ===== */}

      {/* Tab 0: Información */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" color="primary" mb={3} fontWeight="bold">
                  Información General
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Pedagogo Responsable
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.pedagogo_nombre || 'No asignado'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Modalidad
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.modalidad || 'Presencial'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Período Académico
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.periodo_academico || 'No especificado'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Estado
                      </Typography>
                      <Chip
                        label={sesion.estado || 'Programada'}
                        color={getStatusColor(sesion.estado)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Clases Programadas
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.numero_clases_programadas || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Fecha de Creación
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.fecha_creacion ? formatDate(sesion.fecha_creacion) : 'No especificada'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" color="primary" mb={3} fontWeight="bold">
                  Estadísticas
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Clases Totales
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.numero_clases_programadas || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Clases Completadas
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="success.main">
                        {cronograma.filter(c => c.estado === 'completada' || c.estado === 'realizada').length}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Estudiantes Inscritos
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {estudiantes.length}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {sesion.adaptacion_curricular && (
            <Grid item xs={12}>
              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" color="primary" mb={2} fontWeight="bold">
                    Adaptación Curricular
                  </Typography>
                  <Paper sx={{ p: 2.5, backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body1">{sesion.adaptacion_curricular}</Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          )}

          {sesion.observaciones && (
            <Grid item xs={12}>
              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" color="primary" mb={2} fontWeight="bold">
                    Observaciones
                  </Typography>
                  <Paper sx={{ p: 2.5, backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body1">{sesion.observaciones}</Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Tab 1: Estudiantes */}
      <TabPanel value={tabValue} index={1}>
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                Estudiantes Inscritos ({estudiantes.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAddStudentDialog}
                sx={{ bgcolor: 'primary.main', '&:hover': { backgroundColor: "primary.dark" } }}
              >
                Agregar Estudiante
              </Button>
            </Box>

            {estudiantes.length === 0 ? (
              <Alert severity="info">
                No hay estudiantes inscritos en esta sesión.
              </Alert>
            ) : (
              <List>
                {estudiantes.map((estudiante, index) => {
                  const estudianteNombre = estudiante.estudiante?.nombre ||
                    estudiante.estudiante_nombre ||
                    estudiante.nombre_completo ||
                    estudiante.nombre_paciente ||
                    `${estudiante.nombre || estudiante.nombres || ''} ${estudiante.apellido || estudiante.apellidos || ''}`.trim() ||
                    'Sin nombre';
                  const estudianteCedula = estudiante.estudiante?.cedula || estudiante.estudiante_cedula || estudiante.cedula || estudiante.numero_documento || 'No especificada';
                  const pacienteId = estudiante.estudiante?.id || estudiante.paciente_id || estudiante.estudiante_id || estudiante.id;
                  const isRetirado = estudiante.estado === 'retirado';

                  return (
                    <React.Fragment key={estudiante.estudiante_id || estudiante.id || index}>
                      <ListItem
                        sx={{
                          opacity: isRetirado ? 0.6 : 1,
                          backgroundColor: isRetirado ? 'action.hover' : 'transparent'
                        }}
                        secondaryAction={
                          isRetirado ? (
                            <Tooltip title="Reincorporar estudiante">
                              <IconButton
                                edge="end"
                                color="success"
                                onClick={() => handleOpenReincorporarDialog(pacienteId, estudianteNombre)}
                              >
                                <PersonAdd />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <IconButton
                              edge="end"
                              color="error"
                              onClick={() => handleRemoveStudent(pacienteId)}
                            >
                              <PersonRemove />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: isRetirado ? 'warning.main' : 'primary.main' }}>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={estudianteNombre}
                          secondary={
                            <>
                              {`Cédula: ${estudianteCedula}`}
                              {isRetirado && (
                                <Chip
                                  label="Retirado"
                                  size="small"
                                  color="warning"
                                  sx={{ ml: 1, height: 20 }}
                                />
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < estudiantes.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 2: Cronograma */}
      <TabPanel value={tabValue} index={2}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>
              Cronograma de Clases ({cronograma.length})
            </Typography>

            {cronograma.length === 0 ? (
              <Alert severity="info">
                No hay clases programadas para esta sesión.
              </Alert>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Clase #</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Hora</TableCell>
                      <TableCell>Tema</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Observaciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cronograma.map((clase) => (
                      <TableRow key={clase.id}>
                        <TableCell>{clase.numero_clase || clase.numero_clase_semanal}</TableCell>
                        <TableCell>{formatDate(clase.fecha_programada)}</TableCell>
                        <TableCell>
                          {formatTime(clase.hora_inicio)} - {formatTime(clase.hora_fin)}
                        </TableCell>
                        <TableCell>{clase.tema_clase || 'No especificado'}</TableCell>
                        <TableCell>
                          <Chip
                            label={clase.estado || 'Programada'}
                            color={getStatusColor(clase.estado)}
                            size="small"
                            icon={getStatusIcon(clase.estado)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap title={clase.observaciones || '-'}>
                            {clase.observaciones || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: Asistencias */}
      <TabPanel value={tabValue} index={3}>
        <Card
          elevation={8}
          sx={{ borderRadius: 4, overflow: 'hidden' }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              p: 2.5
            }}
          >
            <Typography variant="h6" fontWeight="bold">Registro de Asistencias</Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {loadingAsistencias ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Cargando asistencias...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Estudiante</TableCell>
                      <TableCell>Asistió</TableCell>
                      <TableCell>Tardanza</TableCell>
                      <TableCell>Observaciones</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {asistencias.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary" py={3}>
                            No hay registros de asistencia disponibles
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      asistencias.map((asistencia, index) => (
                        <TableRow key={`${asistencia.cronograma_clase_id || asistencia.cronograma_id}_${asistencia.estudiante_id || asistencia.paciente_id}_${index}`}>
                          <TableCell>{formatDate(asistencia.fecha_programada)}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                                <Person fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {asistencia.estudiante_nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {asistencia.estudiante_cedula || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={asistencia.asistio ? 'Asistió' : 'No Asistió'}
                              color={asistencia.asistio ? 'success' : 'error'}
                              size="small"
                              icon={asistencia.asistio ? <CheckCircle /> : <Cancel />}
                            />
                          </TableCell>
                          <TableCell>
                            {asistencia.llegada_tardanza_minutos > 0 ? (
                              <Typography variant="body2" color="warning.main">
                                {asistencia.llegada_tardanza_minutos} min
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap title={asistencia.observaciones_educador || asistencia.participacion_clase || '-'}>
                              {asistencia.observaciones_educador || asistencia.participacion_clase || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Ver más detalles">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => setDetailDialog({ open: true, data: asistencia })}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 4: Resumen */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>
                  Estadísticas de la Sesión
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total de Clases:</Typography>
                    <Typography variant="body2" fontWeight="bold">{cronograma.length}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Clases Realizadas:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {cronograma.filter(c => c.estado === 'realizada' || c.estado === 'completada').length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Clases Pendientes:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      {cronograma.filter(c => c.estado === 'programada').length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Clases Canceladas:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      {cronograma.filter(c => c.estado === 'cancelada').length}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Estudiantes Activos:</Typography>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {estudiantes.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'primary.main' }} gutterBottom>
                  Información Adicional
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Pedagogo Responsable:</strong> {sesion.pedagogo_nombre || 'No asignado'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Modalidad de Clases:</strong> {sesion.modalidad || 'Presencial'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Período Académico:</strong> {sesion.periodo_academico || 'No especificado'}
                  </Typography>
                  <Typography variant="body2" component="div">
                    <strong>Estado General:</strong>
                    <Chip
                      label={sesion.estado || 'Activa'}
                      color={getStatusColor(sesion.estado)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fecha de Inicio:</strong> {cronograma.length > 0 ? formatDate(cronograma[0]?.fecha_programada) : 'No programada'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fecha de Finalización:</strong> {cronograma.length > 0 ? formatDate(cronograma[cronograma.length - 1]?.fecha_programada) : 'No programada'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Dialog: Agregar Estudiante - Diseño mejorado */}
      <Dialog
        open={addStudentDialog.open}
        onClose={() => {
          setAddStudentDialog({ open: false });
          setSelectedStudent('');
          setSearchStudentTerm('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PersonAdd sx={{ mr: 2, color: 'success.main' }} />
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
              sx={{ ...greenOutlineSX, mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />

            {estudiantesDisponibles.length === 0 ? (
              <Alert severity="info">
                No hay estudiantes disponibles para agregar.
              </Alert>
            ) : (
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {estudiantesDisponibles
                  .filter(e => {
                    if (!searchStudentTerm) return true;
                    const term = searchStudentTerm.toLowerCase();
                    const nombreCompleto = (
                      e.nombre_completo ||
                      e.nombre_paciente ||
                      `${e.nombre || e.nombres || ''} ${e.apellido || e.apellidos || ''}`
                    ).toLowerCase();
                    const cedula = (e.cedula || e.numero_documento || '').toLowerCase();
                    return nombreCompleto.includes(term) || cedula.includes(term);
                  })
                  .length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No se encontraron estudiantes con "{searchStudentTerm}"
                  </Typography>
                ) : (
                  estudiantesDisponibles
                    .filter(e => {
                      if (!searchStudentTerm) return true;
                      const term = searchStudentTerm.toLowerCase();
                      const nombreCompleto = (
                        e.nombre_completo ||
                        e.nombre_paciente ||
                        `${e.nombre || e.nombres || ''} ${e.apellido || e.apellidos || ''}`
                      ).toLowerCase();
                      const cedula = (e.cedula || e.numero_documento || '').toLowerCase();
                      return nombreCompleto.includes(term) || cedula.includes(term);
                    })
                    .map((estudiante) => (
                      <Box
                        key={estudiante.id}
                        onClick={() => setSelectedStudent(estudiante.id)}
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: selectedStudent === estudiante.id ? 'success.main' : 'divider',
                          backgroundColor: selectedStudent === estudiante.id
                            ? theme.palette.mode === 'dark' ? 'success.dark' : 'success.light'
                            : 'background.paper',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                            borderColor: 'success.main'
                          },
                          transition: 'all 0.2s'
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'success.main', width: 40, height: 40 }}>
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
                          {selectedStudent === estudiante.id && (
                            <Chip label="Seleccionado" color="success" size="small" />
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
              setAddStudentDialog({ open: false });
              setSelectedStudent('');
              setSearchStudentTerm('');
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddStudent}
            variant="contained"
            disabled={!selectedStudent}
            startIcon={<PersonAdd />}
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
          >
            Agregar Estudiante
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Reincorporar Estudiante */}
      <Dialog
        open={reincorporarDialog.open}
        onClose={() => setReincorporarDialog({ open: false, pacienteId: null, estudianteNombre: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PersonAdd sx={{ mr: 2, color: 'success.main' }} />
            Reincorporar Estudiante
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ py: 2 }}>
            ¿Está seguro de que desea reincorporar a <strong>{reincorporarDialog.estudianteNombre}</strong> a esta sesión?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            El estudiante volverá a estar activo en la sesión y podrá registrar asistencias.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReincorporarDialog({ open: false, pacienteId: null, estudianteNombre: '' })}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmReincorporar}
            variant="contained"
            color="success"
            startIcon={<PersonAdd />}
          >
            Reincorporar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalles de asistencia */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Assignment sx={{ mr: 2 }} />
            Detalles de Asistencia de Clase
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información del Estudiante</Typography>
                <Typography variant="body2"><strong>Nombre:</strong> {detailDialog.data.estudiante_nombre}</Typography>
                <Typography variant="body2"><strong>Cédula:</strong> {detailDialog.data.estudiante_cedula || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información de Asistencia</Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" component="span"><strong>Estado:</strong></Typography>
                  <Chip
                    label={detailDialog.data.asistio ? 'Asistió' : 'No Asistió'}
                    color={detailDialog.data.asistio ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
                {detailDialog.data.llegada_tardanza_minutos > 0 && (
                  <Typography variant="body2"><strong>Tardanza:</strong> {detailDialog.data.llegada_tardanza_minutos} minutos</Typography>
                )}
              </Grid>

              {(detailDialog.data.calificacion_clase !== null && detailDialog.data.calificacion_clase !== undefined) && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Evaluación Académica</Typography>
                  <Typography variant="body2"><strong>Calificación:</strong> {detailDialog.data.calificacion_clase}/10</Typography>
                </Grid>
              )}

              {detailDialog.data.participacion_clase && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Participación en Clase</Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {detailDialog.data.participacion_clase}
                  </Typography>
                </Grid>
              )}

              {detailDialog.data.actividades_completadas !== null && detailDialog.data.actividades_completadas !== undefined && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Actividades Completadas</Typography>
                  <Chip
                    label={detailDialog.data.actividades_completadas ? 'Sí' : 'No'}
                    color={detailDialog.data.actividades_completadas ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
              )}

              {detailDialog.data.observaciones_educador && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Observaciones del Educador</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'background.paper' }}>
                    <Typography variant="body2">{detailDialog.data.observaciones_educador}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.objetivos_trabajados && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Objetivos Trabajados</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'success.light', border: '1px solid', borderColor: 'success.main' }}>
                    <Typography variant="body2">{detailDialog.data.objetivos_trabajados}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.tareas_asignadas && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Tareas Asignadas</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'warning.light', border: '1px solid', borderColor: 'warning.main' }}>
                    <Typography variant="body2">{detailDialog.data.tareas_asignadas}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, data: null })}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
  );
};

// Attendance Form Component
const AttendanceForm = ({ cronogramaData, estudiantes, onSubmit }) => {
  const theme = useTheme();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [attendanceData, setAttendanceData] = useState({
    asistio: true,
    llegada_tardanza_minutos: 0,
    observaciones_educador: '',
    participacion_clase: '',
    objetivos_trabajados: '',
    tareas_entregadas: false,
    notas_comportamiento: '',
    calificacion_evaluacion: 5,
    observaciones_evaluacion: ''
  });

  const handleSubmit = () => {
    if (!selectedStudent) return;
    onSubmit(cronogramaData.id, selectedStudent, attendanceData);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
    </Container>
  );
};

export default SesionPedagogicaDetalle;