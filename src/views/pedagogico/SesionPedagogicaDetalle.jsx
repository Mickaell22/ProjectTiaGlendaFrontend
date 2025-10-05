// src/views/pedagogico/SesionPedagogicaDetalle.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Grid, IconButton, Paper, Snackbar, Tab, Tabs,
  Table, TableBody, TableCell, TableHead, TableRow, Typography, Alert,
  Chip, Avatar, List, ListItem, ListItemText, ListItemAvatar, Tooltip,
  TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
 useTheme
} from '@mui/material';
import {
  ArrowBack, Person, Schedule, Group, Assignment, CalendarMonth,
  CheckCircle, Cancel, Edit, Add, Refresh, AccessTime,
  EventAvailable, EventBusy, School, Today, Delete, PersonRemove
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialogs state
  const [attendanceDialog, setAttendanceDialog] = useState({
    open: false,
    cronogramaId: null,
    estudianteId: null,
    data: null
  });

  const [addStudentDialog, setAddStudentDialog] = useState({ open: false });
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    if (id) {
      fetchSesionData();
    }
  }, [id]);

  const fetchSesionData = async () => {
    setLoading(true);
    try {
      const [sesionRes, cronogramaRes, estudiantesRes] = await Promise.all([
        sesionPedagogicaService.getSesionById(id),
        sesionPedagogicaService.getCronograma(id),
        sesionPedagogicaService.getEstudiantesSesion(id)
      ]);

      setSesion(sesionRes.data || sesionRes);
      setCronograma(cronogramaRes.data?.data || cronogramaRes.data || []);
      setEstudiantes(estudiantesRes.data?.data || estudiantesRes.data || []);

    } catch (error) {
      const errorMessage = sesionPedagogicaService.handleError(error);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEstudiantesDisponibles = async () => {
    try {
      const response = await sesionPedagogicaService.getEstudiantesDisponibles();
      const disponibles = response.data || response || [];

      // Filtrar estudiantes que ya están en la sesión
      const estudiantesEnSesion = estudiantes.map(e => e.estudiante_id || e.id);
      const filtrados = disponibles.filter(e => !estudiantesEnSesion.includes(e.id));

      setEstudiantesDisponibles(filtrados);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al cargar estudiantes disponibles: ' + (error.message || 'Error desconocido'),
        severity: 'error'
      });
      setEstudiantesDisponibles([]);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) return;

    try {
      await sesionPedagogicaService.addEstudianteToSesion(id, selectedStudent);
      setSnackbar({ open: true, message: 'Estudiante agregado exitosamente', severity: 'success' });
      setAddStudentDialog({ open: false });
      setSelectedStudent('');
      fetchSesionData(); // Refresh data
    } catch (error) {
      let errorMessage = 'Error al agregar estudiante a la sesión';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Error de validación. Verifique los datos del estudiante.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Sesión o estudiante no encontrado';
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

        {/* ===== Información básica de la sesión ===== */}
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Información General
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Pedagogo:</strong> {sesion.pedagogo_nombre || 'No asignado'}
                </Typography>
                <Typography variant="body2">
                  <strong>Modalidad:</strong> {sesion.modalidad || 'Presencial'}
                </Typography>
                <Typography variant="body2">
                  <strong>Período Académico:</strong> {sesion.periodo_academico || 'No especificado'}
                </Typography>
                <Typography variant="body2" component="div">
                  <strong>Estado:</strong>
                  <Chip
                    label={sesion.estado || 'Programada'}
                    color={getStatusColor(sesion.estado)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Detalles Técnicos
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Clases Totales:</strong> {sesion.numero_clases_programadas || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Clases Completadas:</strong> {cronograma.filter(c => c.estado === 'completada' || c.estado === 'realizada').length}
                </Typography>
                <Typography variant="body2">
                  <strong>Estudiantes Inscritos:</strong> {estudiantes.length}
                </Typography>
                <Typography variant="body2">
                  <strong>Fecha de Creación:</strong> {sesion.fecha_creacion ? formatDate(sesion.fecha_creacion) : 'No especificada'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {sesion.adaptacion_curricular && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Adaptación Curricular
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: 'transparent', border: '1px solid', borderColor: 'primary.main' }}>
                <Typography variant="body2">{sesion.adaptacion_curricular}</Typography>
              </Paper>
            </Box>
          )}

          {sesion.observaciones && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Observaciones
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: 'transparent', border: '1px solid', borderColor: 'primary.main' }}>
                <Typography variant="body2">{sesion.observaciones}</Typography>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ===== Tabs Navigation ===== */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: 'primary.main' },
            '& .MuiTab-root.Mui-selected': { color: 'primary.main' }
          }}
        >
          <Tab
            label="Estudiantes"
            icon={<Group />}
            iconPosition="start"
            {...a11yProps(0)}
          />
          <Tab
            label="Cronograma"
            icon={<CalendarMonth />}
            iconPosition="start"
            {...a11yProps(1)}
          />
          <Tab
            label="Resumen"
            icon={<Assignment />}
            iconPosition="start"
            {...a11yProps(2)}
          />
        </Tabs>
      </Paper>

      {/* ===== Tab Panels ===== */}

      {/* Tab 1: Estudiantes */}
      <TabPanel value={tabValue} index={0}>
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
                {estudiantes.map((estudiante, index) => (
                  <React.Fragment key={estudiante.estudiante_id || estudiante.id || index}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleRemoveStudent(estudiante.estudiante_id || estudiante.id)}
                        >
                          <PersonRemove />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={estudiante.estudiante_nombre || estudiante.nombre_completo}
                        secondary={`Cédula: ${estudiante.estudiante_cedula || estudiante.cedula || 'No especificada'}`}
                      />
                    </ListItem>
                    {index < estudiantes.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 2: Cronograma */}
      <TabPanel value={tabValue} index={1}>
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

      {/* Tab 3: Resumen */}
      <TabPanel value={tabValue} index={2}>
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

      {/* Dialog: Agregar Estudiante */}
      <Dialog
        open={addStudentDialog.open}
        onClose={() => setAddStudentDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Estudiante a la Sesión</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Seleccionar Estudiante</InputLabel>
            <Select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              label="Seleccionar Estudiante"
              sx={{
                ...greenOutlineSX,
                color: 'text.primary',
              }}
            >
              {estudiantesDisponibles.map((estudiante) => (
                <MenuItem key={estudiante.id} value={estudiante.id}>
                  {estudiante.nombres} {estudiante.apellidos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStudentDialog({ open: false })}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddStudent}
            variant="contained"
            disabled={!selectedStudent}
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Agregar
          </Button>
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