// src/views/terapeutico/TerapeuticoCronogramas.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, FormControl, InputLabel, Select, InputAdornment
} from '@mui/material';
import {
  CalendarMonth, Edit, Search, Visibility, Refresh, CheckCircle, Cancel,
  Schedule, AccessTime, Today, Person, EventNote, EditCalendar
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';
import { formatDateLocal } from 'src/utils/dateUtils';

/* ---------- Estilos compartidos tipo "listar" ---------- */
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

// Evita “saltos” al seleccionar opciones y trunca texto largo
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

const TerapeuticoCronogramas = () => {
  const [sesiones, setSesiones] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [selectedSesion, setSelectedSesion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [reprogramDialog, setReprogramDialog] = useState({ open: false, data: null });
  const [cancelDialog, setCancelDialog] = useState({ open: false, data: null });
  const [realizadaDialog, setRealizadaDialog] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(false);
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
      console.error('Error fetching sessions:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const fetchCronograma = async (sesionId) => {
    setLoading(true);
    try {
      const response = await sesionTerapiaService.getCronograma(sesionId);
      setCronogramas(response.data || []);
    } catch (err) {
      console.error('Error fetching cronograma:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setCronogramas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSesionChange = (event) => {
    const sesionId = event.target.value;
    setSelectedSesion(sesionId);
    if (sesionId) {
      fetchCronograma(sesionId);
    } else {
      setCronogramas([]);
    }
  };

  const regenerarCronograma = async (sesionId) => {
    if (window.confirm('¿Está seguro de regenerar el cronograma? Esto eliminará el cronograma actual y creará uno nuevo.')) {
      setLoading(true);
      try {
        await sesionTerapiaService.generarCronograma(sesionId);
        setSnackbar({ open: true, message: 'Cronograma regenerado exitosamente', severity: 'success' });
        fetchCronograma(sesionId);
      } catch (error) {
        console.error('Error regenerating cronograma:', error);
        const errorMessage = sesionTerapiaService.handleError(error);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const refreshCronograma = () => {
    if (selectedSesion) {
      fetchCronograma(selectedSesion);
    }
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const handleReprogramar = (item) => {
    setReprogramDialog({ open: true, data: item });
  };

  const handleCancelar = (item) => {
    setCancelDialog({ open: true, data: item });
  };

  const handleMarcarRealizada = (item) => {
    setRealizadaDialog({ open: true, data: item });
  };

  const confirmarMarcarRealizada = async (observaciones) => {
    if (realizadaDialog.data) {
      setLoading(true);
      try {
        await sesionTerapiaService.marcarSesionRealizada(realizadaDialog.data.id, observaciones || null);
        
        // Close dialog first
        setRealizadaDialog({ open: false, data: null });
        
        // Show success message
        setSnackbar({ open: true, message: 'Sesión marcada como realizada exitosamente', severity: 'success' });
        
        // Refresh cronograma
        if (selectedSesion) fetchCronograma(selectedSesion);
      } catch (error) {
        console.error('Error marking session as completed:', error);
        const errorMessage = sesionTerapiaService.handleError(error);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const confirmarReprogramacion = async (reprogramData) => {
    try {
      setLoading(true);
      await sesionTerapiaService.reprogramarSesion(reprogramDialog.data.id, reprogramData);
      setSnackbar({ open: true, message: 'Sesión reprogramada exitosamente', severity: 'success' });
      setReprogramDialog({ open: false, data: null });
      if (selectedSesion) fetchCronograma(selectedSesion);
    } catch (error) {
      console.error('Error reprogramming session:', error);
      let errorMessage = 'Error al reprogramar la sesión';
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.response?.status === 400) errorMessage = 'Datos de reprogramación inválidos. Verifique la fecha y hora.';
      else if (error.response?.status === 404) errorMessage = 'Sesión no encontrada';
      else if (error.response?.status === 500) errorMessage = 'Error del servidor. Intente nuevamente.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmarCancelacion = async (cancelData) => {
    try {
      setLoading(true);
      await sesionTerapiaService.cancelarSesion(cancelDialog.data.id, cancelData);
      setSnackbar({ open: true, message: 'Sesión cancelada exitosamente', severity: 'success' });
      setCancelDialog({ open: false, data: null });
      if (selectedSesion) fetchCronograma(selectedSesion);
    } catch (error) {
      console.error('Error canceling session:', error);
      const errorMessage = sesionTerapiaService.handleError(error);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programada': return 'info';
      case 'realizada': return 'success';
      case 'completada': return 'success';
      case 'cancelada': return 'error';
      case 'reprogramada': return 'warning';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'programada': return <Schedule />;
      case 'realizada': return <CheckCircle />;
      case 'completada': return <CheckCircle />;
      case 'cancelada': return <Cancel />;
      case 'reprogramada': return <AccessTime />;
      default: return <EventNote />;
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

  const getSesionInfo = (sesionId) => sesiones.find(s => s.id === parseInt(sesionId));

  const filteredCronogramas = cronogramas
    .filter(c => {
      const sesionInfo = getSesionInfo(selectedSesion);
      const matchesSearch = (
        sesionInfo?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sesionInfo?.terapeuta_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numero_sesion?.toString().includes(searchTerm.toLowerCase())
      );
      const matchesEstado = filterEstado === '' || c.estado === filterEstado;
      return matchesSearch && matchesEstado;
    })
    .sort((a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada));

  const truncateObservations = (text, maxLength = 40) => {
    if (!text) return '-';
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>

      {/* Card de selección de sesión con header degradado */}
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
              <CalendarMonth sx={{ mr: 1 }} />
              Cronogramas de Sesiones
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Selecciona una sesión y gestiona su cronograma
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
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
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
                    return s
                      ? `${s.titulo} — ${s.terapeuta_nombre}`
                      : 'Seleccione una sesión';
                  }}
                >
                  <MenuItem value="">Seleccione una sesión</MenuItem>
                  {sesiones.map((sesion) => (
                    <MenuItem key={sesion.id} value={sesion.id}>
                      {`${sesion.titulo} — ${sesion.terapeuta_nombre}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedSesion && (
              <Grid item xs={12} md={4}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<Refresh />}
                      onClick={refreshCronograma}
                      disabled={loading}
                      fullWidth
                      size="small"
                    >
                      Actualizar
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Refresh />}
                      onClick={() => regenerarCronograma(selectedSesion)}
                      disabled={loading}
                      fullWidth
                      size="small"
                    >
                      Regenerar
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>

          {selectedSesion && getSesionInfo(selectedSesion) && (
            <Paper sx={{ mt: 3, p: 2, backgroundColor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Título:</Typography>
                  <Typography variant="body2">{getSesionInfo(selectedSesion).titulo}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Terapeuta:</Typography>
                  <Typography variant="body2">{getSesionInfo(selectedSesion).terapeuta_nombre}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Especialidad:</Typography>
                  <Typography variant="body2">{getSesionInfo(selectedSesion).especialidad_nombre}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Card de listado con toolbar tipo “listar” */}
      {selectedSesion ? (
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
                <Schedule sx={{ mr: 1 }} />
                Cronograma
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {cronogramas.length} sesión{cronogramas.length !== 1 ? 'es' : ''} programada{cronogramas.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <Chip
              label={`${cronogramas.length} ítem${cronogramas.length !== 1 ? 's' : ''}`}
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
                placeholder="Buscar por título/terapeuta o # de sesión…"
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
                <InputLabel shrink>Filtrar por estado</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...purpleOutlineSX }}
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  label="Filtrar por estado"
                  displayEmpty
                  MenuProps={menuProps}
                  renderValue={(val) => (val ? val : 'Todos los estados')}
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  <MenuItem value="programada">Programada</MenuItem>
                  <MenuItem value="realizada">Realizada</MenuItem>
                  <MenuItem value="completada">Completada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                  <MenuItem value="reprogramada">Reprogramada</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Typography>Cargando cronograma...</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sesión</TableCell>
                        <TableCell>Fecha Programada</TableCell>
                        <TableCell>Hora</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Observaciones</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCronogramas
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {item.numero_sesion}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Today sx={{ mr: 1, fontSize: 16 }} />
                                <Typography variant="body2">
                                  {formatDate(item.fecha_programada)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <AccessTime sx={{ mr: 1, fontSize: 16 }} />
                                <Typography variant="body2">
                                  {formatTime(item.hora_programada)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.estado}
                                color={getEstadoColor(item.estado)}
                                size="small"
                                icon={getEstadoIcon(item.estado)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                title={
                                  item.observaciones_cronograma ||
                                  item.observaciones ||
                                  item.observaciones_asistencias ||
                                  item.notas_progreso_sesion ||
                                  ''
                                }
                              >
                                {truncateObservations(
                                  item.observaciones_cronograma ||
                                  item.observaciones ||
                                  item.observaciones_asistencias ||
                                  item.notas_progreso_sesion
                                )}
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

                                {item.estado === 'programada' && (
                                  <>
                                    <Tooltip title="Marcar como realizada">
                                      <IconButton
                                        color="success"
                                        onClick={() => handleMarcarRealizada(item)}
                                        size="small"
                                      >
                                        <CheckCircle fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Reprogramar">
                                      <IconButton
                                        color="warning"
                                        onClick={() => handleReprogramar(item)}
                                        size="small"
                                      >
                                        <EditCalendar fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Cancelar">
                                      <IconButton
                                        color="error"
                                        onClick={() => handleCancelar(item)}
                                        size="small"
                                      >
                                        <Cancel fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Box>

                <TablePagination
                  component="div"
                  count={filteredCronogramas.length}
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
              <CalendarMonth sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={1}>
                Seleccione una Sesión Terapéutica
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Para ver el cronograma, seleccione una sesión terapéutica del menú desplegable
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dialog de detalles (sin cambios de lógica) */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <EventNote sx={{ mr: 2 }} />
            Detalles de la Sesión del Cronograma
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información de la Sesión</Typography>
                <Typography variant="body2"><strong>Número de Sesión:</strong> {detailDialog.data.numero_sesion}</Typography>
                <Typography variant="body2"><strong>Fecha Programada:</strong> {formatDate(detailDialog.data.fecha_programada)}</Typography>
                <Typography variant="body2"><strong>Hora Programada:</strong> {formatTime(detailDialog.data.hora_programada)}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Estado y Realización</Typography>
                <Typography variant="body2" display="flex" alignItems="center">
                  <strong>Estado:</strong>
                  <Chip
                    label={detailDialog.data.estado}
                    color={getEstadoColor(detailDialog.data.estado)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>

              {(detailDialog.data.observaciones_cronograma || detailDialog.data.observaciones) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Observaciones</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="body2">
                      {detailDialog.data.observaciones_cronograma || detailDialog.data.observaciones}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.motivo_reprogramacion && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Motivo de Reprogramación</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                    <Typography variant="body2">{detailDialog.data.motivo_reprogramacion}</Typography>
                  </Paper>
                </Grid>
              )}

              {selectedSesion && getSesionInfo(selectedSesion) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Información de la Sesión Terapéutica</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                    <Typography variant="body2"><strong>Título:</strong> {getSesionInfo(selectedSesion).titulo}</Typography>
                    <Typography variant="body2"><strong>Terapeuta:</strong> {getSesionInfo(selectedSesion).terapeuta_nombre}</Typography>
                    <Typography variant="body2"><strong>Especialidad:</strong> {getSesionInfo(selectedSesion).especialidad_nombre}</Typography>
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

      {/* Reprogramar */}
      <ReprogramarDialog
        open={reprogramDialog.open}
        data={reprogramDialog.data}
        onClose={() => setReprogramDialog({ open: false, data: null })}
        onConfirm={confirmarReprogramacion}
        loading={loading}
      />

      {/* Cancelar */}
      <CancelarDialog
        open={cancelDialog.open}
        data={cancelDialog.data}
        onClose={() => setCancelDialog({ open: false, data: null })}
        onConfirm={confirmarCancelacion}
        loading={loading}
      />

      {/* Marcar como Realizada */}
      <RealizadaDialog
        open={realizadaDialog.open}
        data={realizadaDialog.data}
        onClose={() => setRealizadaDialog({ open: false, data: null })}
        onConfirm={confirmarMarcarRealizada}
        loading={loading}
      />

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

// Reprogramar
const ReprogramarDialog = ({ open, data, onClose, onConfirm, loading }) => {
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [fechaOriginal, setFechaOriginal] = useState('');

  useEffect(() => {
    if (data) {
      const fechaBase = data.fecha_programada?.split('T')[0] || '';
      setFechaOriginal(fechaBase);
      setNuevaFecha(fechaBase);
      
      // Format the hour properly for time input (HH:MM format)
      let horaFormateada = data.hora_programada || '';
      if (horaFormateada && !horaFormateada.includes(':')) {
        // If it's just a number like "14", convert to "14:00"
        horaFormateada = horaFormateada.padStart(2, '0') + ':00';
      } else if (horaFormateada && horaFormateada.length === 5) {
        // If it's already in HH:MM format, keep it
        horaFormateada = horaFormateada;
      } else if (horaFormateada && horaFormateada.includes('T')) {
        // If it's a datetime string, extract just the time part
        const timePart = horaFormateada.split('T')[1];
        if (timePart) {
          horaFormateada = timePart.split(':').slice(0, 2).join(':');
        }
      }
      
      setNuevaHora(horaFormateada);
      setMotivo('Reprogramación de sesión terapéutica');
    }
  }, [data]);

  const moverFecha = (dias) => {
    if (!fechaOriginal) return;
    const fecha = new Date(fechaOriginal);
    fecha.setDate(fecha.getDate() + dias);
    const nuevaFechaStr = fecha.toISOString().split('T')[0];
    setNuevaFecha(nuevaFechaStr);
    const diasTexto = dias > 0 ? `+${dias}` : dias.toString();
    const motivoMovimiento = `Sesión movida ${diasTexto} día${Math.abs(dias) !== 1 ? 's' : ''}`;
    setMotivo(motivoMovimiento);
  };

  const handleConfirm = () => {
    if (!nuevaFecha || !nuevaHora) return;
    
    // Ensure the hour is in correct format (HH:MM) without seconds
    let horaFormateada = nuevaHora;
    if (horaFormateada.includes(':')) {
      const timeParts = horaFormateada.split(':');
      horaFormateada = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
    } else {
      horaFormateada = horaFormateada.padStart(2, '0') + ':00';
    }
    
    const motivoFinal = motivo && motivo.trim() ? motivo.trim() : 'Reprogramación de sesión terapéutica';
    const dataToSend = {
      nueva_fecha: nuevaFecha,
      nueva_hora: horaFormateada,
      motivo_reprogramacion: motivoFinal,
      motivo: motivoFinal
    };
    
    onConfirm(dataToSend);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reprogramar Sesión #{data?.numero_sesion}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Fecha y hora actual: {formatDateLocal(data?.fecha_programada)} a las {data?.hora_programada}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Mover fecha rápidamente:</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button size="small" variant="outlined" onClick={() => moverFecha(1)}>+1 día</Button>
              <Button size="small" variant="outlined" onClick={() => moverFecha(2)}>+2 días</Button>
              <Button size="small" variant="outlined" onClick={() => moverFecha(7)}>+1 semana</Button>
              <Button size="small" variant="outlined" onClick={() => moverFecha(-1)}>-1 día</Button>
              <Button size="small" variant="outlined" onClick={() => moverFecha(-2)}>-2 días</Button>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Nueva Fecha"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="time"
              label="Nueva Hora"
              value={nuevaHora}
              onChange={(e) => setNuevaHora(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo de la reprogramación"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explique el motivo de la reprogramación..."
              required
              error={!motivo || !motivo.trim()}
              helperText={(!motivo || !motivo.trim()) ? 'El motivo es requerido' : ''}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={loading || !nuevaFecha || !nuevaHora || !motivo || !motivo.trim()}>
          Reprogramar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Cancelar
const CancelarDialog = ({ open, data, onClose, onConfirm, loading }) => {
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (data) setMotivo('');
  }, [data]);

  const handleConfirm = () => {
    onConfirm({ motivo_cancelacion: motivo || 'Cancelada por el usuario' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cancelar Sesión #{data?.numero_sesion}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Fecha programada: {formatDateLocal(data?.fecha_programada)} a las {data?.hora_programada}
            </Typography>
            <Typography variant="body2" color="error" mb={2}>
              ⚠️ Esta acción marcará la sesión como cancelada y no se podrá deshacer.
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Motivo de la cancelación"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explique el motivo de la cancelación..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading}>
          Confirmar Cancelación
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Marcar como Realizada Dialog
const RealizadaDialog = ({ open, data, onClose, onConfirm, loading }) => {
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (data) setObservaciones('');
  }, [data]);

  const handleConfirm = () => {
    onConfirm(observaciones);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Marcar Sesión como Realizada</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Sesión #{data?.numero_sesion}</strong>
              {data?.fecha_programada && (
                <><br />📅 {formatDateLocal(data.fecha_programada)} a las {data.hora_programada}</>
              )}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" mb={2}>
              ¿Desea agregar observaciones sobre esta sesión terapéutica?
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Observaciones de la sesión"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escriba aquí cualquier observación sobre el desarrollo de la sesión, progreso del paciente, actividades realizadas, etc. (Opcional)"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'success.main' },
                  '&:hover fieldset': { borderColor: 'success.main' },
                  '&.Mui-focused fieldset': { borderColor: 'success.main', borderWidth: 2 }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              ✅ Esta acción marcará la sesión como completada exitosamente.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="success"
          disabled={loading}
          startIcon={<CheckCircle />}
        >
          Marcar como Realizada
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TerapeuticoCronogramas;
