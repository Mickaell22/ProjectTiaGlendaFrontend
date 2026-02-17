// src/views/pedagogico/PedagogicoAsistencia.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, FormControl, InputLabel, Select, Switch,
  FormControlLabel, InputAdornment,
 useTheme
} from '@mui/material';
import {
  CheckCircle, Cancel, Search, Visibility, Add, Edit, AccessTime,
  Person, Assignment, School, EventAvailable, Note, TrendingUp, TaskAlt,
  Flag, Grade, EmojiEvents
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionPedagogicaService from 'src/services/SesionPedagogicaService';
import { formatDateLocal } from 'src/utils/dateUtils';

/* ---------- Estilos tipo "listar" ---------- */
const getGreenOutlineSX = (theme) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: theme.palette.success.main },
    '&:hover fieldset': { borderColor: theme.palette.success.main },
    '&.Mui-focused fieldset': { borderColor: theme.palette.success.main, borderWidth: 2 }
  }
});

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

const PedagogicoAsistencia = () => {
  const theme = useTheme();
  const [sesiones, setSesiones] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [selectedSesion, setSelectedSesion] = useState('');
  const [selectedCronograma, setSelectedCronograma] = useState('');
  const [currentCronogramaId, setCurrentCronogramaId] = useState('');
  const [estudiantesSesion, setEstudiantesSesion] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsistio, setFilterAsistio] = useState('');
  const [filterPedagogo, setFilterPedagogo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [asistenciaDialog, setAsistenciaDialog] = useState({ open: false, data: null, isEdit: false });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asistio: false,
    llegada_tardanza_minutos: 0,
    observaciones_educador: '',
    participacion_clase: '',
    objetivos_trabajados: '',
    actividades_completadas: false,
    tareas_asignadas: '',
    calificacion_evaluacion: null
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSesiones();
  }, []);

  const fetchSesiones = async () => {
    try {
      const response = await sesionPedagogicaService.getSesiones();
      setSesiones(response.data?.data || response.data || []);
    } catch (err) {
      const errorMessage = sesionPedagogicaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const fetchCronogramas = async (sesionId) => {
    try {
      const [cronogramasRes, estudiantesRes] = await Promise.all([
        sesionPedagogicaService.getCronograma(sesionId),
        sesionPedagogicaService.getEstudiantesSesion(sesionId)
      ]);

      const allCronogramas = cronogramasRes.data?.data || cronogramasRes.data || [];
      setCronogramas(allCronogramas);
      setEstudiantesSesion(estudiantesRes.data?.data || estudiantesRes.data || []);

    } catch (err) {
      const errorMessage = sesionPedagogicaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setCronogramas([]);
      setEstudiantesSesion([]);
    }
  };

  const fetchAsistencias = async (cronogramaId) => {
    setLoading(true);
    try {
      
      // Try to get attendance data from the backend using the correct method
      let response = null;
      try {
        response = await sesionPedagogicaService.getControlAsistencia(cronogramaId);
      } catch (attendanceError) {
        response = { data: [] };
      }
      
      // Extract data from response - fix for correct backend response structure
      let asistenciasData = [];
      if (response?.data?.estudiantes) {
        // Backend returns: { data: { estudiantes: [...] } }
        asistenciasData = response.data.estudiantes;
      } else if (response?.data && Array.isArray(response.data)) {
        // Fallback for array response
        asistenciasData = response.data;
      }
      
      setAsistencias(asistenciasData);
      
      // If no asistencias found, create placeholders for all students in the session
      if (asistenciasData.length === 0 && estudiantesSesion.length > 0) {
        const placeholderAsistencias = estudiantesSesion.map(estudiante => ({
          cronograma_id: cronogramaId,
          paciente_id: estudiante.paciente_id || estudiante.id,
          estudiante_nombre: estudiante.estudiante?.nombre || estudiante.nombre_completo,
          estudiante_cedula: estudiante.estudiante?.cedula || estudiante.cedula,
          asistio: null,
          fecha_asistencia: null,
          observaciones_educador: null,
          notas_progreso_academico: null,
          es_placeholder: true
        }));
        setAsistencias(placeholderAsistencias);
      }
      
    } catch (err) {
      const errorMessage = sesionPedagogicaService.handleError(err);
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
      setEstudiantesSesion([]);
    }
  };

  const handleCronogramaChange = (event) => {
    const cronogramaId = event.target.value;
    setSelectedCronograma(cronogramaId);
    setCurrentCronogramaId(cronogramaId);
    if (cronogramaId) fetchAsistencias(cronogramaId);
    else setAsistencias([]);
  };

  const handleRegistrarAsistencia = (estudianteData) => {

    // Get the cronograma ID - prioritize selectedCronograma since it's the main state
    const cronogramaId = selectedCronograma || currentCronogramaId;

    if (!cronogramaId) {
      setSnackbar({
        open: true,
        message: 'Error: No se ha seleccionado una fecha de clase. Seleccione una fecha antes de registrar asistencias.',
        severity: 'error'
      });
      return;
    }

    setFormData({
      asistio: false,
      llegada_tardanza_minutos: 0,
      observaciones_educador: '',
      participacion_clase: '',
      objetivos_trabajados: '',
      actividades_completadas: false,
      tareas_asignadas: '',
      calificacion_evaluacion: null
    });

    // Preservar toda la información del estudiante
    const estudiante = {
      estudiante_id: estudianteData.estudiante_id || estudianteData.paciente_id || estudianteData.id,
      estudiante: {
        nombre: estudianteData.nombre || estudianteData.estudiante_nombre,
        cedula: estudianteData.cedula || estudianteData.estudiante_cedula
      }
    };

    setAsistenciaDialog({
      open: true,
      data: { estudiante, cronograma_id: cronogramaId },
      isEdit: false
    });
  };

  const handleEditarAsistencia = (asistencia) => {
    setFormData({
      asistio: asistencia.asistio || false,
      llegada_tardanza_minutos: asistencia.llegada_tardanza_minutos || 0,
      observaciones_educador: asistencia.observaciones_educador || '',
      participacion_clase: asistencia.participacion_clase || '',
      objetivos_trabajados: asistencia.objetivos_trabajados || '',
      actividades_completadas: asistencia.actividades_completadas || false,
      tareas_asignadas: asistencia.tareas_asignadas || '',
      calificacion_evaluacion: asistencia.calificacion_clase || null
    });

    // Asegurar que la información del estudiante esté correctamente estructurada
    const asistenciaConEstudiante = {
      ...asistencia,
      estudiante_nombre: asistencia.estudiante_nombre || asistencia.nombre,
      estudiante_cedula: asistencia.estudiante_cedula || asistencia.cedula
    };

    setAsistenciaDialog({
      open: true,
      data: asistenciaConEstudiante,
      isEdit: true
    });
  };

  const handleSubmitAsistencia = async () => {
    try {
      const { estudiante, cronograma_id } = asistenciaDialog.data;
      const estudianteId = estudiante?.estudiante_id || estudiante?.paciente_id || estudiante?.id || asistenciaDialog.data.estudiante_id || asistenciaDialog.data.paciente_id;

      // Extra fallback for cronograma_id
      const finalCronogramaId = cronograma_id || selectedCronograma || currentCronogramaId;


      if (!estudianteId) {
        setSnackbar({ open: true, message: 'Error: No se pudo identificar el estudiante', severity: 'error' });
        return;
      }

      if (!finalCronogramaId) {
        setSnackbar({ open: true, message: 'Error: No se pudo identificar la clase del cronograma. Asegúrese de haber seleccionado una fecha de clase.', severity: 'error' });
        return;
      }

      const asistenciaData = {
        // Campos que espera el backend (alineados con asistencia_clases)
        asistio: formData.asistio,
        llegada_tardanza_minutos: parseInt(formData.llegada_tardanza_minutos) || 0,
        observaciones_educador: formData.observaciones_educador?.trim() || null,
        objetivos_trabajados: formData.objetivos_trabajados?.trim() || null,
        participacion_clase: formData.participacion_clase?.trim() || null,
        actividades_completadas: formData.actividades_completadas || false,
        tareas_asignadas: formData.tareas_asignadas?.trim() || null,
        calificacion_clase: parseInt(formData.calificacion_evaluacion) || null
      };


      // Usar siempre updateAsistenciaClase porque usa UPSERT (maneja tanto INSERT como UPDATE)
      await sesionPedagogicaService.updateAsistenciaClase(finalCronogramaId, estudianteId, asistenciaData);
      
      if (asistenciaDialog.isEdit) {
        setSnackbar({ open: true, message: 'Asistencia actualizada correctamente', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'Asistencia registrada correctamente', severity: 'success' });
      }

      setAsistenciaDialog({ open: false, data: null, isEdit: false });
      await fetchAsistencias(selectedCronograma);
      if (selectedSesion) await fetchCronogramas(selectedSesion);
    } catch (error) {
      const errorMessage = sesionPedagogicaService.handleError(error);
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
  const getEstudianteAsistencia = (estudianteId) => asistencias.find(a => 
    a.estudiante_id === estudianteId || a.paciente_id === estudianteId
  );

  const filteredAsistencias = asistencias.filter(a => {
    const matchesSearch = (
      a.estudiante_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.observaciones_educador?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    let matchesAsistio = true;
    if (filterAsistio !== '') matchesAsistio = filterAsistio === 'true' ? a.asistio : !a.asistio;
    return matchesSearch && matchesAsistio;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {/* Card de selección (header degradado estilo listar) */}
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          backgroundColor: 'background.paper',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1200 },
          mx: 'auto'
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
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <Assignment sx={{ mr: 1 }} />
              Registro de Asistencias Pedagógicas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Selecciona una sesión y una fecha para gestionar asistencias de clases
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
          {/* Filtro por Pedagogo */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={8} md={9}>
              <FormControl fullWidth size="small">
                <InputLabel shrink>Filtrar por Pedagogo</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...getGreenOutlineSX(theme) }}
                  value={filterPedagogo}
                  onChange={(e) => setFilterPedagogo(e.target.value)}
                  displayEmpty
                  label="Filtrar por Pedagogo"
                  MenuProps={menuProps}
                  renderValue={(val) => (val ? val : 'Todos los pedagogos')}
                >
                  <MenuItem value="">Todos los pedagogos</MenuItem>
                  {[...new Set(sesiones.map(s => s.pedagogo?.nombre || s.pedagogo_nombre))].filter(Boolean).sort().map((pedagogo) => (
                    <MenuItem key={pedagogo} value={pedagogo}>
                      {pedagogo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setFilterPedagogo('')}
                disabled={!filterPedagogo}
                sx={{ height: '40px' }}
              >
                Limpiar Filtro
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel shrink>Sesión Pedagógica</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...getGreenOutlineSX(theme) }}
                  value={selectedSesion}
                  onChange={handleSesionChange}
                  label="Sesión Pedagógica"
                  displayEmpty
                  MenuProps={menuProps}
                  renderValue={(val) => {
                    if (!val) return 'Seleccione una sesión pedagógica';
                    const s = sesiones.find(x => String(x.id) === String(val));
                    return s ? `${s.titulo || s.nombre_clase}` : 'Seleccione una sesión pedagógica';
                  }}
                >
                  <MenuItem value="">Seleccione una sesión pedagógica</MenuItem>
                  {sesiones
                    .filter(sesion => !filterPedagogo || (sesion.pedagogo?.nombre || sesion.pedagogo_nombre) === filterPedagogo)
                    .map((sesion) => (
                    <MenuItem key={sesion.id} value={sesion.id}>
                      {`${sesion.titulo || sesion.nombre_clase}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedSesion}>
                <InputLabel shrink>Fecha de Clase</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...getGreenOutlineSX(theme) }}
                  value={selectedCronograma}
                  onChange={handleCronogramaChange}
                  label="Fecha de Clase"
                  displayEmpty
                  MenuProps={menuProps}
                  renderValue={(val) => {
                    if (!val) return cronogramas.length === 0 ? 'No hay clases disponibles para registro' : 'Seleccione una fecha';
                    const c = cronogramas.find(x => String(x.id) === String(val));
                    return c ? `Clase ${c.numero_clase || c.numero_clase_semanal} - ${formatDate(c.fecha_programada)} ${formatTime(c.hora_programada)}` : 'Seleccione una fecha';
                  }}
                >
                  <MenuItem value="">
                    {cronogramas.length === 0 ? 'No hay clases disponibles para registro' : 'Seleccione una fecha'}
                  </MenuItem>
                  {cronogramas.map((cronograma) => (
                    <MenuItem key={cronograma.id} value={cronograma.id}>
                      {`Clase ${cronograma.numero_clase || cronograma.numero_clase_semanal} - ${formatDate(cronograma.fecha_programada)} ${formatTime(cronograma.hora_programada)}`}
                    </MenuItem>
                  ))}
                  {cronogramas.length === 0 && selectedSesion && (
                    <MenuItem disabled>Solo se puede registrar asistencia para fechas pasadas o de hoy</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          
        </CardContent>
      </Card>

      {/* Card de listado de asistencias (header degradado) */}
      {selectedSesion && selectedCronograma ? (
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            mb: 4,
            backgroundColor: 'background.paper',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
            overflow: 'hidden',
            width: '100%',
            maxWidth: { xs: '100%', sm: 1200 },
            mx: 'auto'
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
            <Box>
              <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
                <Assignment sx={{ mr: 1 }} />
                Control de Asistencia de Clase
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {estudiantesSesion.length} estudiante{estudiantesSesion.length !== 1 ? 's' : ''} en esta sesión
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
                placeholder="Buscar por estudiante u observaciones…"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                sx={{ ...getGreenOutlineSX(theme), minWidth: 260, flex: '1 1 380px' }}
              />

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel shrink>Filtrar por asistencia</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...getGreenOutlineSX(theme) }}
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
                        <TableCell>Estudiante</TableCell>
                        <TableCell>Asistencia</TableCell>
                        <TableCell>Tardanza</TableCell>
                        <TableCell>Calificación</TableCell>
                        <TableCell>Observaciones</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {asistencias.map((asistencia) => {
                        const estudianteId = asistencia.estudiante_id || asistencia.paciente_id;
                        return (
                          <TableRow key={estudianteId}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                  <School />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {asistencia.nombre || asistencia.estudiante_nombre}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {asistencia.cedula || asistencia.estudiante_cedula}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {asistencia.asistio !== null && asistencia.asistio !== undefined ? (
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
                              {asistencia?.calificacion_clase ? (
                                <Chip
                                  label={`${asistencia.calificacion_clase}/10`}
                                  color={asistencia.calificacion_clase >= 7 ? 'success' : asistencia.calificacion_clase >= 5 ? 'warning' : 'error'}
                                  size="small"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap title={asistencia?.observaciones_educador || '-'}>
                                {asistencia?.observaciones_educador || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {asistencia.asistio !== null && asistencia.asistio !== undefined ? (
                                  <>
                                    <Tooltip title="Ver detalles">
                                      <IconButton color="info" size="small" onClick={() => handleViewDetail(asistencia)}>
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Editar asistencia">
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleEditarAsistencia(asistencia)}
                                        sx={{ color: 'success.main' }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                ) : (
                                  <Tooltip title="Registrar asistencia">
                                    <IconButton color="success" size="small" onClick={() => handleRegistrarAsistencia(asistencia)}>
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
                  count={filteredAsistencias.length || asistencias.length || estudiantesSesion.length}
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
                Para registrar asistencias, seleccione una sesión pedagógica y una fecha específica de clase
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dialog Registrar/Editar asistencia (diseño mejorado) */}
      <Dialog
        open={asistenciaDialog.open}
        onClose={() => setAsistenciaDialog({ open: false, data: null, isEdit: false })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[10]
          }
        }}
      >
        {/* Header del diálogo con diseño mejorado */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 48,
              height: 48
            }}
          >
            {asistenciaDialog.isEdit ? <Edit /> : <Add />}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              {asistenciaDialog.isEdit ? 'Editar Asistencia Pedagógica' : 'Registrar Asistencia Pedagógica'}
            </Typography>
            {asistenciaDialog.data && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {asistenciaDialog.data.estudiante?.estudiante?.nombre || asistenciaDialog.data.estudiante_nombre}
              </Typography>
            )}
          </Box>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {asistenciaDialog.data && (
            <Box>
              {/* Información del estudiante */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <School />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      {asistenciaDialog.data.estudiante?.estudiante?.nombre || asistenciaDialog.data.estudiante_nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cédula: {asistenciaDialog.data.estudiante?.estudiante?.cedula || asistenciaDialog.data.estudiante_cedula || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Control de asistencia */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventAvailable fontSize="small" />
                  Estado de Asistencia
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={7}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: `2px solid ${formData.asistio ? theme.palette.success.main : theme.palette.grey[300]}`,
                        borderRadius: 2,
                        backgroundColor: formData.asistio
                          ? theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.1)' : 'success.50'
                          : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.asistio}
                            onChange={(e) => setFormData(prev => ({ ...prev, asistio: e.target.checked }))}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: 'success.main' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'success.main' }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {formData.asistio ? 'Asistió a la clase' : 'No asistió'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formData.asistio ? 'El estudiante estuvo presente' : 'Marcar como presente'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Minutos de tardanza"
                      value={formData.llegada_tardanza_minutos}
                      onChange={(e) => setFormData(prev => ({ ...prev, llegada_tardanza_minutos: e.target.value }))}
                      inputProps={{ min: 0, max: 120 }}
                      disabled={!formData.asistio}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTime />
                          </InputAdornment>
                        ),
                      }}
                      helperText={formData.asistio ? 'Ingrese 0 si llegó puntual' : 'Solo si asistió'}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: '100%'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Evaluación de la clase */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Grade fontSize="small" />
                  Evaluación y Desempeño
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!formData.asistio}>
                      <InputLabel>Participación en clase</InputLabel>
                      <Select
                        value={formData.participacion_clase}
                        onChange={(e) => setFormData(prev => ({ ...prev, participacion_clase: e.target.value }))}
                        label="Participación en clase"
                        startAdornment={
                          <InputAdornment position="start">
                            <TrendingUp color={formData.asistio ? 'action' : 'disabled'} />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">Sin especificar</MenuItem>
                        <MenuItem value="excelente">Excelente</MenuItem>
                        <MenuItem value="buena">Buena</MenuItem>
                        <MenuItem value="regular">Regular</MenuItem>
                        <MenuItem value="deficiente">Deficiente</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Calificación de clase (1-10)"
                      value={formData.calificacion_evaluacion || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || (Number.isInteger(Number(val)) && Number(val) >= 1 && Number(val) <= 10)) {
                          setFormData(prev => ({ ...prev, calificacion_evaluacion: val }));
                        }
                      }}
                      inputProps={{ min: 1, max: 10, step: 1 }}
                      disabled={!formData.asistio}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmojiEvents color={formData.asistio ? 'warning' : 'disabled'} />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Calificación del 1 al 10"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: `2px solid ${formData.actividades_completadas ? theme.palette.success.main : theme.palette.grey[300]}`,
                        borderRadius: 2,
                        backgroundColor: formData.actividades_completadas
                          ? theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.1)' : 'success.50'
                          : 'transparent',
                        transition: 'all 0.3s ease',
                        opacity: formData.asistio ? 1 : 0.5
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.actividades_completadas}
                            onChange={(e) => setFormData(prev => ({ ...prev, actividades_completadas: e.target.checked }))}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: 'success.main' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'success.main' }
                            }}
                            disabled={!formData.asistio}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              Actividades completadas
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Marcar si el estudiante completó todas las actividades de clase
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Campos de observaciones y notas */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Note fontSize="small" />
                  Observaciones y Notas Académicas
                </Typography>
                <Grid container spacing={2.5}>
                  {/* Observaciones del Educador */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Observaciones del Educador"
                      value={formData.observaciones_educador}
                      onChange={(e) => setFormData(prev => ({ ...prev, observaciones_educador: e.target.value }))}
                      placeholder="Observaciones generales sobre la asistencia y comportamiento del estudiante..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                            <Note color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          alignItems: 'flex-start'
                        }
                      }}
                    />
                  </Grid>

                  {/* Objetivos Trabajados */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Objetivos Trabajados en Clase"
                      value={formData.objetivos_trabajados}
                      onChange={(e) => setFormData(prev => ({ ...prev, objetivos_trabajados: e.target.value }))}
                      placeholder="Descripción de los objetivos específicos trabajados durante la clase..."
                      disabled={!formData.asistio}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                            <Flag color={formData.asistio ? 'success' : 'disabled'} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          alignItems: 'flex-start'
                        }
                      }}
                    />
                  </Grid>

                  {/* Tareas Asignadas */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Tareas Asignadas para Casa"
                      value={formData.tareas_asignadas}
                      onChange={(e) => setFormData(prev => ({ ...prev, tareas_asignadas: e.target.value }))}
                      placeholder="Tareas o ejercicios asignados para realizar en casa..."
                      disabled={!formData.asistio}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                            <TaskAlt color={formData.asistio ? 'primary' : 'disabled'} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          alignItems: 'flex-start'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            onClick={() => setAsistenciaDialog({ open: false, data: null, isEdit: false })}
            variant="outlined"
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitAsistencia}
            startIcon={asistenciaDialog.isEdit ? <Edit /> : <CheckCircle />}
            sx={{
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' },
              px: 3
            }}
          >
            {asistenciaDialog.isEdit ? 'Actualizar Asistencia' : 'Registrar Asistencia'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalles */}
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
                <Typography variant="body2"><strong>Cédula:</strong> {detailDialog.data.estudiante_cedula}</Typography>
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

export default PedagogicoAsistencia;