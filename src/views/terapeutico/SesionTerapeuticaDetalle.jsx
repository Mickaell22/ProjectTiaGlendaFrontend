// src/views/terapeutico/SesionTerapeuticaDetalle.jsx
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
  EventAvailable, EventBusy, Psychology, Today, Delete, PersonRemove,
  Close, Search, PersonAdd, Visibility, NoteAdd, Lock, Warning
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import { useUserRole } from 'src/hooks/useUserRole';
import sesionTerapiaService from 'src/services/SesionTerapiaService';
import observacionesService from 'src/services/observacionesService';
import { formatDateLocal } from 'src/utils/dateUtils';

/* ---------- Estilos tipo "listar" ---------- */
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

// Evita “saltos” al seleccionar y trunca texto largo
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
        <Box sx={{ p: 3 }}>
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

const SesionTerapeuticaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const theme = useTheme();

  const [tabValue, setTabValue] = useState(0);
  const [sesion, setSesion] = useState(null);
  const [cronograma, setCronograma] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);
  const [asistenciasLoaded, setAsistenciasLoaded] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialogs state
  const [attendanceDialog, setAttendanceDialog] = useState({
    open: false,
    cronogramaId: null,
    pacienteId: null,
    data: null
  });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [addPatientDialog, setAddPatientDialog] = useState({ open: false });
  const [pacientesDisponibles, setPacientesDisponibles] = useState([]);
  const [newPatientId, setNewPatientId] = useState('');
  const [searchPatientTerm, setSearchPatientTerm] = useState('');
  const [pacientesRetirados, setPacientesRetirados] = useState([]);
  const [showRetirados, setShowRetirados] = useState(false);
  const [reincorporarDialog, setReincorporarDialog] = useState({
    open: false,
    pacienteId: null,
    pacienteNombre: ''
  });
  const [finalizarDialog, setFinalizarDialog] = useState({ open: false });

  // Observaciones state
  const [observaciones, setObservaciones] = useState([]);
  const [loadingObservaciones, setLoadingObservaciones] = useState(false);
  const [observacionesLoaded, setObservacionesLoaded] = useState(false);
  const [obsDialog, setObsDialog] = useState({ open: false, mode: 'create', data: null });
  const [obsDeleteDialog, setObsDeleteDialog] = useState({ open: false, id: null });
  const obsInitial = {
    observacion: '',
    tipo_observacion: 'observacion',
    es_privada: false,
    es_critica: false,
    requiere_seguimiento: false,
    fecha_seguimiento: '',
  };
  const [obsForm, setObsForm] = useState(obsInitial);

  useEffect(() => {
    if (id) {
      fetchSessionData();
    }
  }, [id]);

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      const [sessionRes, cronogramaRes, pacientesRes] = await Promise.all([
        sesionTerapiaService.getSesionById(id),
        sesionTerapiaService.getCronograma(id),
        sesionTerapiaService.getPacientesSesion(id)
      ]);

      setSesion(sessionRes.data);
      setCronograma(cronogramaRes.data || []);
      const pacientesData = pacientesRes.data || [];
      setPacientes(pacientesData);
    } catch (err) {
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAsistencias = async () => {
    if (asistenciasLoaded) return;

    setLoadingAsistencias(true);
    try {
      const asistenciasRes = await sesionTerapiaService.getAsistenciasSession(id);
      setAsistencias(asistenciasRes.data || []);
      setAsistenciasLoaded(true);
    } catch (err) {
      setAsistencias([]);
    } finally {
      setLoadingAsistencias(false);
    }
  };

  const getEstadoCronogramaColor = (estado) => {
    switch (estado) {
      case 'completada': return 'success';
      case 'programada': return 'primary';
      case 'confirmada': return 'info';
      case 'en_curso': return 'primary';
      case 'cancelada': return 'error';
      case 'reprogramada': return 'warning';
      case 'no_asistio': return 'error';
      default: return 'default';
    }
  };

  const getEstadoCronogramaIcon = (sesionCronograma) => {
    if (sesionCronograma.estado === 'completada') return <CheckCircle />;
    if (sesionCronograma.estado === 'cancelada') return <Cancel />;
    if (sesionCronograma.estado === 'no_asistio') return <EventBusy />;
    if (sesionCronograma.estado_actual === 'vencida') return <EventBusy />;
    if (sesionCronograma.estado_actual === 'hoy') return <Today />;
    return <Schedule />;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 3 && !asistenciasLoaded) {
      fetchAsistencias();
    }
    if (newValue === 4 && !observacionesLoaded) {
      fetchObservaciones();
    }
  };

  const fetchObservaciones = async () => {
    setLoadingObservaciones(true);
    try {
      const res = await observacionesService.getObservacionesSesion(id, 'terapeutica', isAdmin);
      const data = res?.data || res || [];
      setObservaciones(Array.isArray(data) ? data : []);
      setObservacionesLoaded(true);
    } catch (err) {
      setObservaciones([]);
    } finally {
      setLoadingObservaciones(false);
    }
  };

  const handleOpenCreateObs = () => {
    setObsForm(obsInitial);
    setObsDialog({ open: true, mode: 'create', data: null });
  };

  const handleOpenEditObs = (obs) => {
    setObsForm({
      observacion: obs.observacion || '',
      tipo_observacion: obs.tipo_observacion || 'observacion',
      es_privada: obs.es_privada || false,
      es_critica: obs.es_critica || false,
      requiere_seguimiento: obs.requiere_seguimiento || false,
      fecha_seguimiento: obs.fecha_seguimiento ? obs.fecha_seguimiento.split('T')[0] : '',
    });
    setObsDialog({ open: true, mode: 'edit', data: obs });
  };

  const handleSaveObs = async () => {
    if (!obsForm.observacion.trim()) return;
    try {
      if (obsDialog.mode === 'create') {
        const payload = {
          id_sesion: parseInt(id),
          tipo_sesion: 'terapeutica',
          observacion: obsForm.observacion.trim(),
          tipo_observacion: obsForm.tipo_observacion,
          es_privada: obsForm.es_privada,
          es_critica: obsForm.es_critica,
          requiere_seguimiento: obsForm.requiere_seguimiento,
        };
        if (obsForm.requiere_seguimiento && obsForm.fecha_seguimiento) {
          payload.fecha_seguimiento = obsForm.fecha_seguimiento;
        }
        await observacionesService.createObservacion(payload);
        setSnackbar({ open: true, message: 'Observacion creada correctamente', severity: 'success' });
      } else {
        const payload = {
          observacion: obsForm.observacion.trim(),
          tipo_observacion: obsForm.tipo_observacion,
          es_privada: obsForm.es_privada,
          es_critica: obsForm.es_critica,
          requiere_seguimiento: obsForm.requiere_seguimiento,
        };
        if (obsForm.requiere_seguimiento && obsForm.fecha_seguimiento) {
          payload.fecha_seguimiento = obsForm.fecha_seguimiento;
        } else {
          payload.fecha_seguimiento = null;
        }
        await observacionesService.updateObservacion(obsDialog.data.id, payload);
        setSnackbar({ open: true, message: 'Observacion actualizada correctamente', severity: 'success' });
      }
      setObsDialog({ open: false, mode: 'create', data: null });
      setObservacionesLoaded(false);
      await fetchObservaciones();
    } catch (err) {
      const msg = observacionesService.handleError(err);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleDeleteObs = async () => {
    try {
      await observacionesService.deleteObservacion(obsDeleteDialog.id);
      setSnackbar({ open: true, message: 'Observacion eliminada', severity: 'info' });
      setObsDeleteDialog({ open: false, id: null });
      setObservacionesLoaded(false);
      await fetchObservaciones();
    } catch (err) {
      const msg = observacionesService.handleError(err);
      setSnackbar({ open: true, message: msg, severity: 'error' });
      setObsDeleteDialog({ open: false, id: null });
    }
  };

  const getTipoObservacionColor = (tipo) => {
    switch (tipo) {
      case 'incidente': return 'error';
      case 'falta': return 'warning';
      case 'progreso': return 'success';
      case 'nota': return 'info';
      case 'recomendacion': return 'secondary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const formattedDate = formatDateLocal(dateString);
      if (formattedDate === '—') return 'N/A';
      const [day, month, year] = formattedDate.split('/');
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  const handleRegisterAttendance = async (cronogramaId, pacienteId, attendanceData) => {
    try {
      await sesionTerapiaService.registrarAsistencia(cronogramaId, pacienteId, attendanceData);
      setSnackbar({ open: true, message: 'Asistencia registrada correctamente', severity: 'success' });
      await fetchSessionData();
      setAttendanceDialog({ open: false, cronogramaId: null, pacienteId: null, data: null });
    } catch (err) {
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleAddPatient = async () => {
    // Validate required data
    if (!newPatientId) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor seleccione un paciente', 
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
    
    // Find selected patient info
    const selectedPatient = pacientesDisponibles.find(p => String(p.id) === String(newPatientId));

    try {
      const patientData = {
        paciente_id: parseInt(newPatientId),
        fecha_incorporacion: new Date().toISOString().split('T')[0]
      };
      
      const response = await sesionTerapiaService.addPacienteToSesion(id, patientData);
      
      setSnackbar({ 
        open: true, 
        message: `Paciente ${selectedPatient?.nombre_completo || 'seleccionado'} agregado correctamente`, 
        severity: 'success' 
      });
      
      await fetchSessionData();
      setAddPatientDialog({ open: false });
      setNewPatientId('');
      
    } catch (error) {
      console.error('Error adding patient in detail:', error);
      console.error('Error response in detail:', error.response?.data);
      console.error('Error status in detail:', error.response?.status);
      
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

  const handleRemovePatient = async (pacienteId, pacienteNombre) => {
    if (window.confirm(`¿Está seguro de remover a ${pacienteNombre} de esta sesión terapéutica?`)) {
      try {
        await sesionTerapiaService.removePacienteFromSesion(id, pacienteId);
        setSnackbar({ 
          open: true, 
          message: `${pacienteNombre} ha sido removido de la sesión`, 
          severity: 'info' 
        });
        await fetchSessionData();
      } catch (err) {
        const errorMessage = sesionTerapiaService.handleError(err);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
    }
  };

  const fetchAvailablePatients = async () => {
    try {
      const response = await sesionTerapiaService.getPacientesDisponibles();
      
      let pacientesData = [];
      if (response?.data) {
        pacientesData = Array.isArray(response.data) ? response.data : response.data.data || [];
      } else if (Array.isArray(response)) {
        pacientesData = response;
      }
      
      setPacientesDisponibles(pacientesData);
      
      if (pacientesData.length === 0) {
        setSnackbar({ 
          open: true, 
          message: 'No hay pacientes disponibles para agregar a esta sesión', 
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

  const fetchPacientesRetirados = async () => {
    try {
      const response = await sesionTerapiaService.getPacientesRetirados(id);
      const retiradosData = response.data?.data || response.data || [];
      setPacientesRetirados(retiradosData);
    } catch (error) {
      console.error('Error fetching retired patients:', error);
    }
  };

  const handleOpenReincorporarDialog = (pacienteId, pacienteNombre) => {
    setReincorporarDialog({
      open: true,
      pacienteId,
      pacienteNombre
    });
  };

  const handleConfirmReincorporar = async () => {
    try {
      await sesionTerapiaService.reincorporarPaciente(id, reincorporarDialog.pacienteId);
      setSnackbar({
        open: true,
        message: `${reincorporarDialog.pacienteNombre} ha sido reincorporado a la sesión`,
        severity: 'success'
      });
      await fetchSessionData();
      await fetchPacientesRetirados();
      setReincorporarDialog({ open: false, pacienteId: null, pacienteNombre: '' });
    } catch (error) {
      const errorMessage = sesionTerapiaService.handleError(error);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setReincorporarDialog({ open: false, pacienteId: null, pacienteNombre: '' });
    }
  };

  const handleToggleRetirados = async () => {
    if (!showRetirados) {
      await fetchPacientesRetirados();
    }
    setShowRetirados(!showRetirados);
  };

  const handleFinalizarSesion = async () => {
    try {
      await sesionTerapiaService.finalizarSesion(id);
      setSnackbar({
        open: true,
        message: 'Sesion finalizada exitosamente',
        severity: 'success'
      });
      await fetchSessionData();
      setFinalizarDialog({ open: false });
    } catch (error) {
      const errorMessage = sesionTerapiaService.handleError(error);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setFinalizarDialog({ open: false });
    }
  };

  const getCronogramaStats = () => {
    const total = cronograma.length;
    const completados = cronograma.filter(c => c.estado === 'completada').length;
    const pendientes = cronograma.filter(c => c.estado !== 'completada' && c.estado !== 'cancelada' && c.estado !== 'reprogramada').length;
    return { total, completados, pendientes };
  };

  const getEstadoSesionColor = (estado) => {
    switch (estado) {
      case 'finalizada': return 'success';
      case 'en_curso': return 'primary';
      case 'planificada': return 'info';
      case 'pausada': return 'warning';
      case 'cancelada': return 'error';
      default: return 'default';
    }
  };

  if (!sesion) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Typography>Cargando sesión...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>

      {/* ===== Header estilo "listar" con degradado morado ===== */}
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
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, color: 'white' }}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
                <Psychology sx={{ mr: 1 }} />
                {sesion.titulo}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {sesion.codigo_sesion} • {sesion.terapeuta?.nombre} • {sesion.especialidad?.nombre}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={`${pacientes.length} paciente${pacientes.length !== 1 ? 's' : ''}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              size="small"
            />
            <Chip
              label={sesion.estado}
              color={getEstadoSesionColor(sesion.estado)}
              size="small"
              sx={{
                bgcolor: sesion.estado === 'finalizada' || sesion.estado === 'en_curso' ? undefined : 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            />
            {cronograma.length > 0 && (
              <Chip
                label={`${getCronogramaStats().completados}/${getCronogramaStats().total} completados`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                size="small"
              />
            )}
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
            <Tab icon={<Psychology />} label="Información" {...a11yProps(0)} />
            <Tab icon={<CalendarMonth />} label="Cronograma" {...a11yProps(1)} />
            <Tab icon={<Group />} label="Pacientes" {...a11yProps(2)} />
            <Tab icon={<Assignment />} label="Asistencias" {...a11yProps(3)} />
            <Tab icon={<NoteAdd />} label="Observaciones" {...a11yProps(4)} />
          </Tabs>
        </CardContent>
      </Card>

      {/* ===== Tab Panels ===== */}
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
                        Código de Sesión
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.codigo_sesion}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Título
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.titulo}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Tipo de Sesión
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.tipo_sesion || 'Individual'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Estado
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={sesion.estado}
                          color={getEstadoSesionColor(sesion.estado)}
                          size="small"
                        />
                        {sesion.estado === 'en_curso' && getCronogramaStats().pendientes === 0 && getCronogramaStats().total > 0 && (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => setFinalizarDialog({ open: true })}
                            startIcon={<CheckCircle />}
                          >
                            Finalizar Sesion
                          </Button>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Duración
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.duracion_minutos} minutos
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Fecha de Creación
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(sesion.fecha_creacion)}
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
                  Programación
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Período
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(sesion.fecha_inicio)} - {formatDate(sesion.fecha_fin)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Días de la Semana
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {sesion.dias_semana?.map((dia, idx) => (
                          <Chip key={idx} label={dia} size="small" color="primary" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Hora de Inicio
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.hora_inicio}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Sesiones Contratadas
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {sesion.numero_sesiones_contratadas}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {sesion.objetivo_general && (
            <Grid item xs={12}>
              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" color="primary" mb={2} fontWeight="bold">
                    Objetivo General
                  </Typography>
                  <Paper sx={{ p: 2.5, backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body1">{sesion.objetivo_general}</Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} md={isAdmin ? 6 : 12}>
            <Card elevation={4} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" color="primary" mb={3} fontWeight="bold">
                  Terapeuta y Especialidad
                </Typography>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Terapeuta
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {sesion.terapeuta?.nombre}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Especialidad
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {sesion.especialidad?.nombre}
                  </Typography>
                </Box>
                <Box sx={{ mb: 0 }}>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    Área
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {sesion.especialidad?.area}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {isAdmin && (
            <Grid item xs={12} md={6}>
              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" color="primary" mb={3} fontWeight="bold">
                    Información Financiera
                  </Typography>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Costo Total
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="success.main">
                      ${sesion.costo_total}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Costo por Sesión
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ${sesion.costo_por_sesion}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 0 }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Meses de Contrato
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {sesion.meses_contrato}
                    </Typography>
                  </Box>
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

      <TabPanel value={tabValue} index={1}>
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h6" fontWeight="bold">Cronograma de Sesiones</Typography>
            <Button
              startIcon={<Refresh />}
              onClick={fetchSessionData}
              variant="outlined"
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)' }}
            >
              Actualizar
            </Button>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Hora</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Observaciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cronograma.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.numero_sesion}</TableCell>
                      <TableCell>{formatDate(item.fecha_programada)}</TableCell>
                      <TableCell>{formatTime(item.hora_programada)}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.estado_actual || item.estado}
                          color={getEstadoCronogramaColor(item.estado)}
                          size="small"
                          icon={getEstadoCronogramaIcon(item)}
                        />
                      </TableCell>
                      <TableCell>
                        {item.observaciones_cronograma ||
                          item.observaciones ||
                          item.observaciones_asistencias ||
                          item.notas_progreso_sesion ||
                          '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card
          elevation={8}
          sx={{ borderRadius: 4, overflow: 'hidden' }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Pacientes Asignados ({pacientes.length})
            </Typography>
            <Button
              startIcon={<Add />}
              onClick={() => {
                fetchAvailablePatients();
                setAddPatientDialog({ open: true });
              }}
              variant="contained"
              size="small"
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark
                },
                color: theme.palette.primary.contrastText
              }}
            >
              Agregar Paciente
            </Button>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <List>
              {pacientes.map((paciente) => {
                const pacienteId = paciente.paciente?.id || paciente.paciente_id || paciente.id;
                const pacienteNombre = paciente.paciente?.nombre || paciente.paciente_nombre || paciente.nombre_completo || `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim() || 'Sin nombre';
                const pacienteCedula = paciente.paciente?.cedula || paciente.paciente_cedula || paciente.cedula || 'No especificada';
                const isRetirado = paciente.estado === 'retirado';

                return (
                  <ListItem
                    key={pacienteId}
                    divider
                    sx={{
                      opacity: isRetirado ? 0.6 : 1,
                      backgroundColor: isRetirado ? 'action.hover' : 'transparent'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: isRetirado ? theme.palette.warning.main : theme.palette.primary.main }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={pacienteNombre}
                      secondary={
                        <>
                          {`Cédula: ${pacienteCedula} • Incorporado: ${formatDateLocal(paciente.fecha_incorporacion || paciente.fecha_inscripcion)}`}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {!isRetirado && (
                        <Chip
                          label={paciente.estado}
                          color="success"
                          size="small"
                        />
                      )}
                      {isRetirado ? (
                        <Tooltip title="Reincorporar paciente a la sesión">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenReincorporarDialog(pacienteId, pacienteNombre)}
                          >
                            <PersonAdd fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Remover paciente de la sesión">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemovePatient(pacienteId, pacienteNombre)}
                          >
                            <PersonRemove fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

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
                      <TableCell>Paciente</TableCell>
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
                        <TableRow key={`${asistencia.cronograma_sesion_id}_${asistencia.paciente_id}_${index}`}>
                          <TableCell>{formatDate(asistencia.fecha_programada)}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32 }}>
                                <Person fontSize="small" />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {asistencia.paciente_nombre}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {asistencia.paciente_cedula || 'N/A'}
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
                            <Typography variant="body2" noWrap title={asistencia.observaciones_terapeuta || asistencia.notas_progreso || '-'}>
                              {asistencia.observaciones_terapeuta || asistencia.notas_progreso || '-'}
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

      {/* Tab 4: Observaciones */}
      <TabPanel value={tabValue} index={4}>
        <Card elevation={8} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h6" fontWeight="bold">Observaciones de la Sesion</Typography>
            <Button
              startIcon={<Add />}
              onClick={handleOpenCreateObs}
              variant="outlined"
              size="small"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)' }}
            >
              Nueva Observacion
            </Button>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {loadingObservaciones ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">Cargando observaciones...</Typography>
              </Box>
            ) : observaciones.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <NoteAdd sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No hay observaciones registradas para esta sesion.
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={handleOpenCreateObs}
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Agregar primera observacion
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {observaciones.map((obs) => (
                  <Paper
                    key={obs.id}
                    elevation={2}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      borderLeft: obs.es_critica ? '4px solid' : '1px solid',
                      borderLeftColor: obs.es_critica ? 'error.main' : 'divider',
                      backgroundColor: obs.es_critica
                        ? (theme.palette.mode === 'dark' ? 'rgba(211,47,47,0.08)' : 'rgba(211,47,47,0.04)')
                        : 'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip
                          label={obs.tipo_observacion || 'observacion'}
                          color={getTipoObservacionColor(obs.tipo_observacion)}
                          size="small"
                        />
                        {obs.es_critica && (
                          <Chip icon={<Warning fontSize="small" />} label="Critica" color="error" size="small" />
                        )}
                        {obs.es_privada && (
                          <Chip icon={<Lock fontSize="small" />} label="Privada" size="small" />
                        )}
                        {obs.requiere_seguimiento && (
                          <Chip label={`Seguimiento: ${obs.estado_seguimiento || 'pendiente'}`} color="warning" size="small" variant="outlined" />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEditObs(obs)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" color="error" onClick={() => setObsDeleteDialog({ open: true, id: obs.id })}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="body1" sx={{ mb: 1.5, whiteSpace: 'pre-wrap' }}>
                      {obs.observacion}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        Autor: {obs.autor_nombre || 'Desconocido'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {obs.fecha_registro ? new Date(obs.fecha_registro).toLocaleString('es-ES') : ''}
                      </Typography>
                      {obs.requiere_seguimiento && obs.fecha_seguimiento && (
                        <Typography variant="caption" color="warning.main">
                          Fecha seguimiento: {obs.fecha_seguimiento.split('T')[0]}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Dialog: Crear / Editar Observacion */}
      <Dialog
        open={obsDialog.open}
        onClose={() => setObsDialog({ open: false, mode: 'create', data: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <NoteAdd sx={{ mr: 2, color: 'primary.main' }} />
            {obsDialog.mode === 'create' ? 'Nueva Observacion' : 'Editar Observacion'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Observacion *"
              value={obsForm.observacion}
              onChange={(e) => setObsForm(prev => ({ ...prev, observacion: e.target.value }))}
              inputProps={{ maxLength: 2000 }}
              helperText={`${obsForm.observacion.length}/2000 caracteres`}
              sx={purpleOutlineSX}
            />
            <FormControl fullWidth sx={purpleOutlineSX}>
              <InputLabel>Tipo de observacion</InputLabel>
              <Select
                sx={selectStableSX}
                value={obsForm.tipo_observacion}
                onChange={(e) => setObsForm(prev => ({ ...prev, tipo_observacion: e.target.value }))}
                label="Tipo de observacion"
                MenuProps={menuProps}
              >
                <MenuItem value="observacion">Observacion general</MenuItem>
                <MenuItem value="falta">Falta</MenuItem>
                <MenuItem value="nota">Nota</MenuItem>
                <MenuItem value="incidente">Incidente</MenuItem>
                <MenuItem value="progreso">Progreso</MenuItem>
                <MenuItem value="recomendacion">Recomendacion</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={obsForm.es_critica}
                    onChange={(e) => setObsForm(prev => ({ ...prev, es_critica: e.target.checked }))}
                    color="error"
                  />
                }
                label="Critica"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={obsForm.es_privada}
                    onChange={(e) => setObsForm(prev => ({ ...prev, es_privada: e.target.checked }))}
                  />
                }
                label="Privada"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={obsForm.requiere_seguimiento}
                    onChange={(e) => setObsForm(prev => ({ ...prev, requiere_seguimiento: e.target.checked }))}
                    color="warning"
                  />
                }
                label="Requiere seguimiento"
              />
            </Box>
            {obsForm.requiere_seguimiento && (
              <TextField
                fullWidth
                type="date"
                label="Fecha de seguimiento"
                value={obsForm.fecha_seguimiento}
                onChange={(e) => setObsForm(prev => ({ ...prev, fecha_seguimiento: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={purpleOutlineSX}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setObsDialog({ open: false, mode: 'create', data: null })}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveObs}
            variant="contained"
            disabled={!obsForm.observacion.trim()}
            startIcon={obsDialog.mode === 'create' ? <Add /> : <Edit />}
          >
            {obsDialog.mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Confirmar eliminacion de observacion */}
      <Dialog
        open={obsDeleteDialog.open}
        onClose={() => setObsDeleteDialog({ open: false, id: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar Observacion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Esta accion es permanente. La observacion sera eliminada definitivamente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setObsDeleteDialog({ open: false, id: null })}>Cancelar</Button>
          <Button onClick={handleDeleteObs} variant="contained" color="error" startIcon={<Delete />}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog
        open={attendanceDialog.open}
        onClose={() => setAttendanceDialog({ open: false, cronogramaId: null, pacienteId: null, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Registrar Asistencia</DialogTitle>
        <DialogContent>
          <AttendanceForm
            cronogramaData={attendanceDialog.data}
            pacientes={pacientes}
            onSubmit={handleRegisterAttendance}
          />
        </DialogContent>
      </Dialog>

      {/* Add Patient Dialog - Diseño mejorado */}
      <Dialog
        open={addPatientDialog.open}
        onClose={() => {
          setAddPatientDialog({ open: false });
          setNewPatientId('');
          setSearchPatientTerm('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PersonAdd sx={{ mr: 2, color: 'success.main' }} />
            Agregar Paciente a la Sesión
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              placeholder="Buscar paciente por nombre o cédula..."
              value={searchPatientTerm}
              onChange={(e) => setSearchPatientTerm(e.target.value)}
              sx={{ ...purpleOutlineSX, mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />

            {pacientesDisponibles.length === 0 ? (
              <Alert severity="info">
                No hay pacientes disponibles para agregar.
              </Alert>
            ) : (
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {pacientesDisponibles
                  .filter(p => {
                    if (!searchPatientTerm) return true;
                    const term = searchPatientTerm.toLowerCase();
                    const nombreCompleto = (p.nombre_completo || `${p.nombre} ${p.apellido}`).toLowerCase();
                    const cedula = (p.cedula || '').toLowerCase();
                    return nombreCompleto.includes(term) || cedula.includes(term);
                  })
                  .length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No se encontraron pacientes con "{searchPatientTerm}"
                  </Typography>
                ) : (
                  pacientesDisponibles
                    .filter(p => {
                      if (!searchPatientTerm) return true;
                      const term = searchPatientTerm.toLowerCase();
                      const nombreCompleto = (p.nombre_completo || `${p.nombre} ${p.apellido}`).toLowerCase();
                      const cedula = (p.cedula || '').toLowerCase();
                      return nombreCompleto.includes(term) || cedula.includes(term);
                    })
                    .map((paciente) => (
                      <Box
                        key={paciente.id}
                        onClick={() => setNewPatientId(paciente.id)}
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: newPatientId === paciente.id ? 'primary.main' : 'divider',
                          backgroundColor: newPatientId === paciente.id
                            ? theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light'
                            : 'background.paper',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
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
                              {paciente.nombre_completo || `${paciente.nombre} ${paciente.apellido}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Cédula: {paciente.cedula || 'N/A'}
                            </Typography>
                          </Box>
                          {newPatientId === paciente.id && (
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
              setAddPatientDialog({ open: false });
              setNewPatientId('');
              setSearchPatientTerm('');
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddPatient}
            variant="contained"
            disabled={!newPatientId}
            startIcon={<PersonAdd />}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark
              },
              color: theme.palette.primary.contrastText
            }}
          >
            Agregar Paciente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Reincorporar Paciente */}
      <Dialog
        open={reincorporarDialog.open}
        onClose={() => setReincorporarDialog({ open: false, pacienteId: null, pacienteNombre: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PersonAdd sx={{ mr: 2, color: 'success.main' }} />
            Reincorporar Paciente
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ py: 2 }}>
            ¿Está seguro de que desea reincorporar a <strong>{reincorporarDialog.pacienteNombre}</strong> a esta sesión?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            El paciente volverá a estar activo en la sesión y podrá registrar asistencias.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReincorporarDialog({ open: false, pacienteId: null, pacienteNombre: '' })}>
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

      {/* Dialog: Finalizar Sesion */}
      <Dialog
        open={finalizarDialog.open}
        onClose={() => setFinalizarDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
            Finalizar Sesion Terapeutica
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ py: 2 }}>
            Esta seguro de que desea finalizar la sesion <strong>{sesion.titulo}</strong>?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Todos los cronogramas han sido completados ({getCronogramaStats().completados}/{getCronogramaStats().total}).
            La sesion se marcara como finalizada.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFinalizarDialog({ open: false })}>
            Cancelar
          </Button>
          <Button
            onClick={handleFinalizarSesion}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
          >
            Finalizar Sesion
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
            <Assignment sx={{ mr: 2, color: 'primary.main' }} />
            Detalles de Asistencia
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary" mb={1}>Información del Paciente</Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2"><strong>Nombre:</strong> {detailDialog.data.paciente_nombre}</Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2"><strong>Cédula:</strong> {detailDialog.data.paciente_cedula || 'N/A'}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary" mb={1}>Información de Asistencia</Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" display="flex" alignItems="center">
                    <strong>Estado:</strong>
                    <Chip
                      label={detailDialog.data.asistio ? 'Asistió' : 'No Asistió'}
                      color={detailDialog.data.asistio ? 'success' : 'error'}
                      size="small"
                      sx={{ ml: 1 }}
                      icon={detailDialog.data.asistio ? <CheckCircle /> : <Cancel />}
                    />
                  </Typography>
                </Box>
                {detailDialog.data.llegada_tardanza_minutos > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2"><strong>Tardanza:</strong> {detailDialog.data.llegada_tardanza_minutos} minutos</Typography>
                  </Box>
                )}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2"><strong>Fecha:</strong> {formatDate(detailDialog.data.fecha_programada)}</Typography>
                </Box>
              </Grid>

              {detailDialog.data.observaciones_terapeuta && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" mb={1}>Observaciones del Terapeuta</Typography>
                  <Paper sx={{ p: 2, backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2">{detailDialog.data.observaciones_terapeuta}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.progreso_observado && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" mb={1}>Progreso Observado</Typography>
                  <Paper sx={{ p: 2, backgroundColor: theme.palette.mode === 'dark' ? 'success.dark' : 'success.50', border: '1px solid', borderColor: 'success.200', borderRadius: 2 }}>
                    <Typography variant="body2">{detailDialog.data.progreso_observado}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.tareas_asignadas && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" mb={1}>Tareas Asignadas</Typography>
                  <Paper sx={{ p: 2, backgroundColor: theme.palette.mode === 'dark' ? 'info.dark' : 'info.50', border: '1px solid', borderColor: 'info.200', borderRadius: 2 }}>
                    <Typography variant="body2">{detailDialog.data.tareas_asignadas}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.objetivos_trabajados && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" mb={1}>Objetivos Trabajados</Typography>
                  <Paper sx={{ p: 2, backgroundColor: theme.palette.mode === 'dark' ? 'warning.dark' : 'warning.50', border: '1px solid', borderColor: 'warning.200', borderRadius: 2 }}>
                    <Typography variant="body2">{detailDialog.data.objetivos_trabajados}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.notas_progreso && !detailDialog.data.progreso_observado && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" mb={1}>Notas de Progreso</Typography>
                  <Paper sx={{ p: 2, backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2">{detailDialog.data.notas_progreso}</Typography>
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

// Attendance Form Component
const AttendanceForm = ({ cronogramaData, pacientes, onSubmit }) => {
  const theme = useTheme();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [attendanceData, setAttendanceData] = useState({
    asistio: true,
    llegada_tardanza_minutos: 0,
    observaciones_terapeuta: '',
    progreso_observado: '',
    tareas_asignadas: '',
    objetivos_trabajados: ''
  });

  const handleSubmit = () => {
    if (!selectedPatient) return;
    onSubmit(cronogramaData.id, selectedPatient, attendanceData);
  };

  return (
    <Box>
      <Typography variant="subtitle1" mb={2}>
        Sesión #{cronogramaData?.numero_sesion} - {formatDateLocal(cronogramaData?.fecha_programada)}
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel shrink>Paciente</InputLabel>
        <Select
          sx={{ ...selectStableSX, ...purpleOutlineSX }}
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          label="Paciente"
          displayEmpty
          MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
          renderValue={(val) => {
            if (!val) return 'Seleccione un paciente';
            const p = pacientes.find(x => String(x.paciente_id || x.id) === String(val));
            return p ? (p.paciente_nombre || p.nombre_completo) : 'Seleccione un paciente';
          }}
        >
          <MenuItem value="">Seleccione un paciente</MenuItem>
          {pacientes.map((paciente) => (
            <MenuItem key={paciente.paciente_id || paciente.id} value={paciente.paciente_id || paciente.id}>
              {paciente.paciente_nombre || paciente.nombre_completo}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={
          <Switch
            checked={attendanceData.asistio}
            onChange={(e) => setAttendanceData(prev => ({ ...prev, asistio: e.target.checked }))}
          />
        }
        label="Asistió a la sesión"
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type="number"
        label="Tardanza (minutos)"
        value={attendanceData.llegada_tardanza_minutos}
        onChange={(e) => setAttendanceData(prev => ({ ...prev, llegada_tardanza_minutos: parseInt(e.target.value) || 0 }))}
        sx={{ mb: 2 }}
        disabled={!attendanceData.asistio}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Observaciones del Terapeuta"
        value={attendanceData.observaciones_terapeuta}
        onChange={(e) => setAttendanceData(prev => ({ ...prev, observaciones_terapeuta: e.target.value }))}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Progreso Observado"
        value={attendanceData.progreso_observado}
        onChange={(e) => setAttendanceData(prev => ({ ...prev, progreso_observado: e.target.value }))}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Tareas Asignadas"
        value={attendanceData.tareas_asignadas}
        onChange={(e) => setAttendanceData(prev => ({ ...prev, tareas_asignadas: e.target.value }))}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Objetivos Trabajados"
        value={attendanceData.objetivos_trabajados}
        onChange={(e) => setAttendanceData(prev => ({ ...prev, objetivos_trabajados: e.target.value }))}
        sx={{ mb: 2 }}
      />
      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button
        variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            },
            color: theme.palette.primary.contrastText
          }}
        >
          Registrar Asistencia
        </Button>
      </Box>
    </Box>
  );
};

export default SesionTerapeuticaDetalle;
