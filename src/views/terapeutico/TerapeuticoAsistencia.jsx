// src/views/terapeutico/TerapeuticoAsistencia.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, FormControl, InputLabel, Select, Switch,
  FormControlLabel, InputAdornment
} from '@mui/material';
import {
  CheckCircle, Cancel, Search, Visibility, Add, Edit, AccessTime,
  Person, Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
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

const TerapeuticoAsistencia = () => {
  const [sesiones, setSesiones] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [selectedSesion, setSelectedSesion] = useState('');
  const [selectedCronograma, setSelectedCronograma] = useState('');
  const [pacientesSesion, setPacientesSesion] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsistio, setFilterAsistio] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [asistenciaDialog, setAsistenciaDialog] = useState({ open: false, data: null, isEdit: false });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asistio: false,
    llegada_tardanza_minutos: 0,
    observaciones_asistencia: '',
    notas_progreso: '',
    tareas_asignadas: '',
    proximos_objetivos: ''
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSesiones();
  }, []);

  const fetchSesiones = async () => {
    try {
      const response = await sesionTerapiaService.getSesiones();
      setSesiones(response.data || []);
    } catch (err) {
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const fetchCronogramas = async (sesionId) => {
    try {
      const [cronogramasRes, pacientesRes] = await Promise.all([
        sesionTerapiaService.getCronograma(sesionId),
        sesionTerapiaService.getPacientesSesion(sesionId)
      ]);

      const allCronogramas = cronogramasRes.data || [];
      setCronogramas(allCronogramas);
      setPacientesSesion(pacientesRes.data || []);

      // Opcional debug de asistencias por sesión
      try { await sesionTerapiaService.getAsistenciasSession(sesionId); } catch {}
    } catch (err) {
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setCronogramas([]);
      setPacientesSesion([]);
    }
  };

  const fetchAsistencias = async (cronogramaId) => {
    setLoading(true);
    try {
      console.log('Fetching asistencias for cronograma:', cronogramaId);
      
      // Try to get control de asistencia first (more complete data)
      let response = null;
      try {
        response = await sesionTerapiaService.getControlAsistencia(cronogramaId);
        console.log('Control asistencia response:', response);
      } catch (controlError) {
        console.warn('Control asistencia failed, trying regular asistencia:', controlError);
        // Fallback to regular asistencia endpoint
        response = await sesionTerapiaService.getAsistencia(cronogramaId);
        console.log('Regular asistencia response:', response);
      }
      
      // Extract data from response
      let asistenciasData = [];
      if (response?.data) {
        asistenciasData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        asistenciasData = response;
      }
      
      console.log('Final asistencias data:', asistenciasData);
      setAsistencias(asistenciasData);
      
      // If no asistencias found, create placeholders for all patients in the session
      if (asistenciasData.length === 0 && pacientesSesion.length > 0) {
        console.log('No asistencias found, creating placeholders for patients:', pacientesSesion);
        const placeholderAsistencias = pacientesSesion.map(paciente => ({
          cronograma_id: cronogramaId,
          paciente_id: paciente.paciente_id || paciente.id,
          paciente_nombre: paciente.paciente_nombre || paciente.nombre,
          paciente_cedula: paciente.paciente_cedula || paciente.cedula,
          asistio: null,
          fecha_asistencia: null,
          observaciones_asistencia: null,
          notas_progreso: null,
          es_placeholder: true
        }));
        setAsistencias(placeholderAsistencias);
      }
      
    } catch (err) {
      console.error('Error fetching asistencias:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setAsistencias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSesionChange = (event) => {
    const sesionId = event.target.value;
    setSelectedSesion(sesionId);
    setSelectedCronograma('');
    setAsistencias([]);
    if (sesionId) fetchCronogramas(sesionId);
    else {
      setCronogramas([]);
      setPacientesSesion([]);
    }
  };

  const handleCronogramaChange = (event) => {
    const cronogramaId = event.target.value;
    setSelectedCronograma(cronogramaId);
    if (cronogramaId) fetchAsistencias(cronogramaId);
    else setAsistencias([]);
  };

  const handleRegistrarAsistencia = (paciente) => {
    setFormData({
      asistio: false,
      llegada_tardanza_minutos: 0,
      observaciones_asistencia: '',
      notas_progreso: '',
      tareas_asignadas: '',
      proximos_objetivos: ''
    });
    setAsistenciaDialog({
      open: true,
      data: { paciente, cronograma_id: selectedCronograma },
      isEdit: false
    });
  };

  const handleEditarAsistencia = (asistencia) => {
    setFormData({
      asistio: asistencia.asistio || false,
      llegada_tardanza_minutos: asistencia.llegada_tardanza_minutos || 0,
      observaciones_asistencia: asistencia.observaciones_asistencia || '',
      notas_progreso: asistencia.notas_progreso || '',
      tareas_asignadas: asistencia.tareas_asignadas || '',
      proximos_objetivos: asistencia.proximos_objetivos || ''
    });
    setAsistenciaDialog({
      open: true,
      data: asistencia,
      isEdit: true
    });
  };

  const handleSubmitAsistencia = async () => {
    try {
      const { paciente, cronograma_id } = asistenciaDialog.data;
      const pacienteId = paciente?.paciente_id || paciente?.id || asistenciaDialog.data.paciente_id;

      console.log('Datos del diálogo de asistencia:', asistenciaDialog.data);
      console.log('Paciente ID extraído:', pacienteId);
      console.log('Cronograma ID:', cronograma_id);

      if (!pacienteId) {
        setSnackbar({ open: true, message: 'Error: No se pudo identificar el paciente', severity: 'error' });
        return;
      }

      if (!cronograma_id) {
        setSnackbar({ open: true, message: 'Error: No se pudo identificar la sesión del cronograma', severity: 'error' });
        return;
      }

      const asistenciaData = {
        asistio: formData.asistio,
        llegada_tardanza_minutos: parseInt(formData.llegada_tardanza_minutos) || 0,
        observaciones_asistencia: formData.observaciones_asistencia?.trim() || null,
        notas_progreso: formData.notas_progreso?.trim() || null,
        tareas_asignadas: formData.tareas_asignadas?.trim() || null,
        proximos_objetivos: formData.proximos_objetivos?.trim() || null
      };

      console.log('Datos de asistencia a enviar:', asistenciaData);

      if (asistenciaDialog.isEdit) {
        await sesionTerapiaService.updateAsistencia(cronograma_id, pacienteId, asistenciaData);
        setSnackbar({ open: true, message: 'Asistencia actualizada correctamente', severity: 'success' });
      } else {
        await sesionTerapiaService.registrarAsistencia(cronograma_id, pacienteId, asistenciaData);
        setSnackbar({ open: true, message: 'Asistencia registrada correctamente', severity: 'success' });
      }

      setAsistenciaDialog({ open: false, data: null, isEdit: false });
      await fetchAsistencias(selectedCronograma);
      if (selectedSesion) await fetchCronogramas(selectedSesion);
    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      const errorMessage = sesionTerapiaService.handleError(error);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleViewDetail = (item) => setDetailDialog({ open: true, data: item });

  const formatDate = (dateString) => formatDateLocal(dateString);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (timeString.includes('T') || timeString.includes(' ')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return timeString;
  };

  const getSesionInfo = (sesionId) => sesiones.find(s => s.id === parseInt(sesionId));
  const getCronogramaInfo = (cronogramaId) => cronogramas.find(c => c.id === parseInt(cronogramaId));
  const getPacienteAsistencia = (pacienteId) => asistencias.find(a => a.paciente_id === pacienteId);

  const filteredAsistencias = asistencias.filter(a => {
    const matchesSearch = (
      a.paciente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.observaciones_asistencia?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    let matchesAsistio = true;
    if (filterAsistio !== '') matchesAsistio = filterAsistio === 'true' ? a.asistio : !a.asistio;
    return matchesSearch && matchesAsistio;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>

      {/* Card de selección (header degradado estilo listar) */}
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1200 },
          mx: 'auto'
        }}
      >
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
              <Assignment sx={{ mr: 1 }} />
              Registro de Asistencias
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Selecciona una sesión y una fecha para gestionar asistencias
            </Typography>
          </Box>

          <Chip
            label={`${sesiones.length} sesión${sesiones.length !== 1 ? 'es' : ''}`}
            color="default"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            size="small"
          />
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel shrink>Sesión Terapéutica</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...purpleOutlineSX }}
                  value={selectedSesion}
                  onChange={handleSesionChange}
                  label="Sesión Terapéutica"
                  displayEmpty
                  MenuProps={menuProps}
                  renderValue={(val) => {
                    if (!val) return 'Seleccione una sesión';
                    const s = sesiones.find(x => String(x.id) === String(val));
                    return s ? `${s.titulo}` : 'Seleccione una sesión';
                  }}
                >
                  <MenuItem value="">Seleccione una sesión</MenuItem>
                  {sesiones.map((sesion) => (
                    <MenuItem key={sesion.id} value={sesion.id}>
                      {`${sesion.titulo}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedSesion}>
                <InputLabel shrink>Fecha de Sesión</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...purpleOutlineSX }}
                  value={selectedCronograma}
                  onChange={handleCronogramaChange}
                  label="Fecha de Sesión"
                  displayEmpty
                  MenuProps={menuProps}
                  renderValue={(val) => {
                    if (!val) return cronogramas.length === 0 ? 'No hay sesiones disponibles para registro' : 'Seleccione una fecha';
                    const c = cronogramas.find(x => String(x.id) === String(val));
                    return c ? `Sesión ${c.numero_sesion} - ${formatDate(c.fecha_programada)} ${formatTime(c.hora_programada)}` : 'Seleccione una fecha';
                  }}
                >
                  <MenuItem value="">
                    {cronogramas.length === 0 ? 'No hay sesiones disponibles para registro' : 'Seleccione una fecha'}
                  </MenuItem>
                  {cronogramas.map((cronograma) => (
                    <MenuItem key={cronograma.id} value={cronograma.id}>
                      {`Sesión ${cronograma.numero_sesion} - ${formatDate(cronograma.fecha_programada)} ${formatTime(cronograma.hora_programada)}`}
                    </MenuItem>
                  ))}
                  {cronogramas.length === 0 && selectedSesion && (
                    <MenuItem disabled>Solo se puede registrar asistencia para fechas pasadas o de hoy</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {selectedSesion && selectedCronograma && getSesionInfo(selectedSesion) && getCronogramaInfo(selectedCronograma) && (
            <Paper sx={{ mt: 3, p: 2, backgroundColor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">Sesión:</Typography>
                  <Typography variant="body2">{getSesionInfo(selectedSesion).titulo}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">Fecha:</Typography>
                  <Typography variant="body2">{formatDate(getCronogramaInfo(selectedCronograma).fecha_programada)}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">Hora:</Typography>
                  <Typography variant="body2">{formatTime(getCronogramaInfo(selectedCronograma).hora_programada)}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">Terapeuta:</Typography>
                  <Typography variant="body2">{getSesionInfo(selectedSesion).terapeuta_nombre}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Card de listado de asistencias (header degradado) */}
      {selectedSesion && selectedCronograma ? (
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            mb: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            overflow: 'hidden',
            width: '100%',
            maxWidth: { xs: '100%', sm: 1200 },
            mx: 'auto'
          }}
        >
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
                <Assignment sx={{ mr: 1 }} />
                Control de Asistencia
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {pacientesSesion.length} paciente{pacientesSesion.length !== 1 ? 's' : ''} en esta sesión
              </Typography>
            </Box>

            <Chip
              label={`${filteredAsistencias.length} registro${filteredAsistencias.length !== 1 ? 's' : ''}`}
              color="default"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              size="small"
            />
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            {/* Toolbar (búsqueda + filtro) */}
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
                placeholder="Buscar por paciente u observaciones…"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                sx={{ ...purpleOutlineSX, minWidth: 260, flex: '1 1 380px' }}
              />

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel shrink>Filtrar por asistencia</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...purpleOutlineSX }}
                  value={filterAsistio}
                  onChange={(e) => setFilterAsistio(e.target.value)}
                  label="Filtrar por asistencia"
                  displayEmpty
                  MenuProps={menuProps}
                  renderValue={(val) => (val === '' ? 'Todos' : val === 'true' ? 'Asistió' : 'No Asistió')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Asistió</MenuItem>
                  <MenuItem value="false">No Asistió</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Typography>Cargando asistencias...</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Paciente</TableCell>
                        <TableCell>Asistencia</TableCell>
                        <TableCell>Tardanza</TableCell>
                        <TableCell>Observaciones</TableCell>
                        <TableCell>Fecha Registro</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pacientesSesion.map((paciente) => {
                        const pacienteId = paciente.paciente_id || paciente.id;
                        const asistencia = getPacienteAsistencia(pacienteId);
                        return (
                          <TableRow key={pacienteId}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: '#7e57c2' }}>
                                  <Person />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {paciente.paciente_nombre || paciente.nombre_completo}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {paciente.paciente_cedula || paciente.cedula}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {asistencia ? (
                                <Chip
                                  label={asistencia.asistio ? 'Asistió' : 'No Asistió'}
                                  color={asistencia.asistio ? 'success' : 'error'}
                                  size="small"
                                  icon={asistencia.asistio ? <CheckCircle /> : <Cancel />}
                                />
                              ) : (
                                <Chip label="Sin Registro" color="default" size="small" />
                              )}
                            </TableCell>
                            <TableCell>
                              {asistencia?.llegada_tardanza_minutos ? (
                                <Typography variant="body2" color="warning.main">
                                  {asistencia.llegada_tardanza_minutos} min
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap title={asistencia?.observaciones_asistencia || '-'}>
                                {asistencia?.observaciones_asistencia || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {asistencia?.fecha_creacion ? (
                                <Typography variant="caption">
                                  {formatDate(asistencia.fecha_creacion)}
                                </Typography>
                              ) : (
                                <Typography variant="caption" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {asistencia ? (
                                  <>
                                    <Tooltip title="Ver detalles">
                                      <IconButton color="info" size="small" onClick={() => handleViewDetail(asistencia)}>
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Editar asistencia">
                                      <IconButton color="primary" size="small" onClick={() => handleEditarAsistencia(asistencia)}>
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                ) : (
                                  <Tooltip title="Registrar asistencia">
                                    <IconButton color="success" size="small" onClick={() => handleRegistrarAsistencia(paciente)}>
                                      <Add fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>

                <TablePagination
                  component="div"
                  count={filteredAsistencias.length || asistencias.length || pacientesSesion.length}
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
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={8}
            >
              <Assignment sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={1}>
                Seleccione una Sesión y Fecha
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Para registrar asistencias, seleccione una sesión terapéutica y una fecha específica
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dialog Registrar/Editar asistencia (lógica igual) */}
      <Dialog
        open={asistenciaDialog.open}
        onClose={() => setAsistenciaDialog({ open: false, data: null, isEdit: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {asistenciaDialog.isEdit ? 'Editar Asistencia' : 'Registrar Asistencia'}
        </DialogTitle>
        <DialogContent>
          {asistenciaDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" mb={2}>
                  Paciente: {asistenciaDialog.data.paciente?.paciente_nombre || asistenciaDialog.data.paciente_nombre}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.asistio}
                      onChange={(e) => setFormData(prev => ({ ...prev, asistio: e.target.checked }))}
                      color="success"
                    />
                  }
                  label="Asistió a la sesión"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minutos de tardanza"
                  value={formData.llegada_tardanza_minutos}
                  onChange={(e) => setFormData(prev => ({ ...prev, llegada_tardanza_minutos: e.target.value }))}
                  inputProps={{ min: 0 }}
                  disabled={!formData.asistio}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Observaciones de Asistencia"
                  value={formData.observaciones_asistencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones_asistencia: e.target.value }))}
                  placeholder="Observaciones sobre la asistencia..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notas de Progreso"
                  value={formData.notas_progreso}
                  onChange={(e) => setFormData(prev => ({ ...prev, notas_progreso: e.target.value }))}
                  placeholder="Notas sobre el progreso del paciente en esta sesión..."
                  disabled={!formData.asistio}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Tareas Asignadas"
                  value={formData.tareas_asignadas}
                  onChange={(e) => setFormData(prev => ({ ...prev, tareas_asignadas: e.target.value }))}
                  placeholder="Tareas o ejercicios asignados para casa..."
                  disabled={!formData.asistio}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Próximos Objetivos"
                  value={formData.proximos_objetivos}
                  onChange={(e) => setFormData(prev => ({ ...prev, proximos_objetivos: e.target.value }))}
                  placeholder="Objetivos para las próximas sesiones..."
                  disabled={!formData.asistio}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAsistenciaDialog({ open: false, data: null, isEdit: false })}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmitAsistencia}>
            {asistenciaDialog.isEdit ? 'Actualizar' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalles (lógica igual) */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Assignment sx={{ mr: 2 }} />
            Detalles de Asistencia
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información del Paciente</Typography>
                <Typography variant="body2"><strong>Nombre:</strong> {detailDialog.data.paciente_nombre}</Typography>
                <Typography variant="body2"><strong>Cédula:</strong> {detailDialog.data.paciente_cedula}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información de Asistencia</Typography>
                <Typography variant="body2" display="flex" alignItems="center">
                  <strong>Estado:</strong>
                  <Chip
                    label={detailDialog.data.asistio ? 'Asistió' : 'No Asistió'}
                    color={detailDialog.data.asistio ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                {detailDialog.data.llegada_tardanza_minutos > 0 && (
                  <Typography variant="body2"><strong>Tardanza:</strong> {detailDialog.data.llegada_tardanza_minutos} minutos</Typography>
                )}
                <Typography variant="body2"><strong>Fecha de Registro:</strong> {formatDate(detailDialog.data.fecha_creacion)}</Typography>
              </Grid>

              {detailDialog.data.observaciones_asistencia && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Observaciones de Asistencia</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="body2">{detailDialog.data.observaciones_asistencia}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.notas_progreso && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Notas de Progreso</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                    <Typography variant="body2">{detailDialog.data.notas_progreso}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.tareas_asignadas && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Tareas Asignadas</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                    <Typography variant="body2">{detailDialog.data.tareas_asignadas}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.proximos_objetivos && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Próximos Objetivos</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                    <Typography variant="body2">{detailDialog.data.proximos_objetivos}</Typography>
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
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TerapeuticoAsistencia;
