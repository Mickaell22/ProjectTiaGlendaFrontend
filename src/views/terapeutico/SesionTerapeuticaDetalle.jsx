// src/views/terapeutico/SesionTerapeuticaDetalle.jsx
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
  EventAvailable, EventBusy, Psychology, Today, Delete, PersonRemove
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import { useUserRole } from 'src/hooks/useUserRole';
import sesionTerapiaService from 'src/services/SesionTerapiaService';
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialogs state
  const [attendanceDialog, setAttendanceDialog] = useState({
    open: false,
    cronogramaId: null,
    pacienteId: null,
    data: null
  });
  const [addPatientDialog, setAddPatientDialog] = useState({ open: false });
  const [pacientesDisponibles, setPacientesDisponibles] = useState([]);
  const [newPatientId, setNewPatientId] = useState('');

  useEffect(() => {
    if (id) {
      fetchSessionData();
    }
  }, [id]);

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      const [sessionRes, cronogramaRes, pacientesRes, asistenciasRes] = await Promise.all([
        sesionTerapiaService.getSesionById(id),
        sesionTerapiaService.getCronograma(id),
        sesionTerapiaService.getPacientesSesion(id),
        sesionTerapiaService.getAsistenciasSession(id)
      ]);

      setSesion(sessionRes.data);
      setCronograma(cronogramaRes.data || []);
      setPacientes(pacientesRes.data || []);
      setAsistencias(asistenciasRes.data || []);
    } catch (err) {
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoCronogramaColor = (estado) => {
    switch (estado) {
      case 'realizada': return 'success';
      case 'programada': return 'primary';
      case 'cancelada': return 'error';
      case 'reprogramada': return 'warning';
      default: return 'default';
    }
  };

  const getEstadoCronogramaIcon = (sesionCronograma) => {
    if (sesionCronograma.estado === 'realizada') return <CheckCircle />;
    if (sesionCronograma.estado === 'cancelada') return <Cancel />;
    if (sesionCronograma.estado_actual === 'vencida') return <EventBusy />;
    if (sesionCronograma.estado_actual === 'hoy') return <Today />;
    return <Schedule />;
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
              color={sesion.estado === 'activo' ? 'success' : 'default'}
              size="small"
              sx={{ bgcolor: sesion.estado === 'activo' ? undefined : 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </Box>

        {/* Tabs (mantengo lógica, solo estética del contenedor) */}
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
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
          </Tabs>
        </CardContent>
      </Card>

      {/* ===== Tab Panels ===== */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary" mb={2}>
                  Información General
                </Typography>
                <Box sx={{ '& > *': { mb: 1 } }}>
                  <Typography><strong>Código:</strong> {sesion.codigo_sesion}</Typography>
                  <Typography><strong>Título:</strong> {sesion.titulo}</Typography>
                  <Typography><strong>Tipo:</strong> {sesion.tipo_sesion || 'Individual'}</Typography>
                  <Typography><strong>Estado:</strong> {sesion.estado}</Typography>
                  <Typography><strong>Duración:</strong> {sesion.duracion_minutos} minutos</Typography>
                  <Typography><strong>Creada:</strong> {formatDate(sesion.fecha_creacion)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary" mb={2}>
                  Programación
                </Typography>
                <Box sx={{ '& > *': { mb: 1 } }}>
                  <Typography><strong>Período:</strong> {formatDate(sesion.fecha_inicio)} - {formatDate(sesion.fecha_fin)}</Typography>
                  <Typography><strong>Días:</strong> {sesion.dias_semana?.join(', ')}</Typography>
                  <Typography><strong>Hora:</strong> {sesion.hora_inicio}</Typography>
                  <Typography><strong>Sesiones contratadas:</strong> {sesion.numero_sesiones_contratadas}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {sesion.objetivo_general && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" mb={2}>
                    Objetivo General
                  </Typography>
                  <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2">{sesion.objetivo_general}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary" mb={2}>
                  Terapeuta y Especialidad
                </Typography>
                <Box sx={{ '& > *': { mb: 1 } }}>
                  <Typography><strong>Terapeuta:</strong> {sesion.terapeuta?.nombre}</Typography>
                  <Typography><strong>Especialidad:</strong> {sesion.especialidad?.nombre}</Typography>
                  <Typography><strong>Área:</strong> {sesion.especialidad?.area}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {isAdmin && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" mb={2}>
                    Información Financiera
                  </Typography>
                  <Box sx={{ '& > *': { mb: 1 } }}>
                    <Typography><strong>Costo total:</strong> ${sesion.costo_total}</Typography>
                    <Typography><strong>Costo por sesión:</strong> ${sesion.costo_por_sesion}</Typography>
                    <Typography><strong>Meses de contrato:</strong> {sesion.meses_contrato}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {sesion.observaciones && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" mb={2}>
                    Observaciones
                  </Typography>
                  <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2">{sesion.observaciones}</Typography>
                  </Box>
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
                    <TableCell>Acciones</TableCell>
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
                      <TableCell>
                        <Tooltip title="Registrar asistencia">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setAttendanceDialog({
                              open: true,
                              cronogramaId: item.id,
                              pacienteId: null,
                              data: item
                            })}
                          >
                            <Assignment />
                          </IconButton>
                        </Tooltip>
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
              sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
            >
              Agregar Paciente
            </Button>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <List>
              {pacientes.map((paciente) => {
                const pacienteId = paciente.id || paciente.paciente_id;
                const pacienteNombre = paciente.paciente_nombre || paciente.nombre_completo;
                
                return (
                  <ListItem key={pacienteId} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#7e57c2' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={pacienteNombre}
                      secondary={`Cédula: ${paciente.paciente_cedula || paciente.cedula} • Incorporado: ${formatDateLocal(paciente.fecha_incorporacion)}`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={paciente.estado}
                        color={paciente.estado === 'activo' ? 'success' : 'default'}
                        size="small"
                      />
                      <Tooltip title="Remover paciente de la sesión">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemovePatient(pacienteId, pacienteNombre)}
                        >
                          <PersonRemove fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Paciente</TableCell>
                    <TableCell>Asistió</TableCell>
                    <TableCell>Tardanza</TableCell>
                    <TableCell>Notas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {asistencias.map((asistencia) => (
                    <TableRow key={`${asistencia.cronograma_sesion_id}_${asistencia.paciente_id}`}>
                      <TableCell>{formatDate(asistencia.fecha_programada)}</TableCell>
                      <TableCell>{asistencia.paciente_nombre}</TableCell>
                      <TableCell>
                        <Chip
                          label={asistencia.asistio ? 'Sí' : 'No'}
                          color={asistencia.asistio ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {asistencia.llegada_tardanza_minutos > 0 ?
                          `${asistencia.llegada_tardanza_minutos} min` : '-'}
                      </TableCell>
                      <TableCell>{asistencia.notas_progreso || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

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

      {/* Add Patient Dialog */}
      <Dialog
        open={addPatientDialog.open}
        onClose={() => setAddPatientDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Paciente a la Sesión</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel shrink>Seleccionar Paciente</InputLabel>
            <Select
              sx={{ ...selectStableSX, ...purpleOutlineSX }}
              value={newPatientId}
              onChange={(e) => setNewPatientId(e.target.value)}
              label="Seleccionar Paciente"
              displayEmpty
              MenuProps={menuProps}
              renderValue={(val) => {
                if (!val) return 'Seleccione un paciente';
                const p = pacientesDisponibles.find(x => String(x.id) === String(val));
                return p ? `${p.nombre_completo} - ${p.cedula}` : 'Seleccione un paciente';
              }}
            >
              <MenuItem value="">Seleccione un paciente</MenuItem>
              {pacientesDisponibles.map((paciente) => (
                <MenuItem key={paciente.id} value={paciente.id}>
                  {paciente.nombre_completo} - {paciente.cedula}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPatientDialog({ open: false })}>
            Cancelar
          </Button>
          <Button onClick={handleAddPatient} variant="contained">
            Agregar
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

// Attendance Form Component
const AttendanceForm = ({ cronogramaData, pacientes, onSubmit }) => {
  const theme = useTheme();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [attendanceData, setAttendanceData] = useState({
    asistio: true,
    llegada_tardanza_minutos: 0,
    observaciones_asistencia: '',
    notas_progreso: '',
    tareas_asignadas: '',
    proximos_objetivos: ''
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
        label="Observaciones de asistencia"
        value={attendanceData.observaciones_asistencia}
        onChange={(e) => setAttendanceData(prev => ({ ...prev, observaciones_asistencia: e.target.value }))}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Notas de progreso"
        value={attendanceData.notas_progreso}
        onChange={(e) => setAttendanceData(prev => ({ ...prev, notas_progreso: e.target.value }))}
        sx={{ mb: 2 }}
      />

      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button variant="contained" onClick={handleSubmit}>
          Registrar Asistencia
        </Button>
      </Box>
    </Box>
  );
};

export default SesionTerapeuticaDetalle;
