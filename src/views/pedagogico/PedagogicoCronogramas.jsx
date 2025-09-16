// src/views/pedagogico/PedagogicoCronogramas.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, FormControl, InputLabel, Select, InputAdornment,
 useTheme
} from '@mui/material';
import {
  CalendarMonth, Edit, Search, Visibility, Refresh, CheckCircle, Cancel,
  Schedule, AccessTime, Today, School, EventNote, EditCalendar, Save, Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionPedagogicaService from 'src/services/SesionPedagogicaService';
import { formatDateLocal } from 'src/utils/dateUtils';

/* ---------- Estilos compartidos tipo "listar" ---------- */
const greenOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#4caf50' },
    '&:hover fieldset': { borderColor: '#4caf50' },
    '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: 2 }
  }
};

// Evita "saltos" al seleccionar opciones y trunca texto largo
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

const PedagogicoCronogramas = () => {
  const theme = useTheme();
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
  const [editingTopic, setEditingTopic] = useState({ id: null, value: '' });
  const [loading, setLoading] = useState(false);
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
      console.error('Error fetching sessions:', err);
      const errorMessage = sesionPedagogicaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const fetchCronograma = async (sesionId) => {
    setLoading(true);
    try {
      const response = await sesionPedagogicaService.getCronograma(sesionId);
      const cronogramaData = response.data?.data || response.data || [];
      setCronogramas(cronogramaData);
    } catch (err) {
      console.error('Error fetching cronograma:', err);
      const errorMessage = sesionPedagogicaService.handleError(err);
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
        await sesionPedagogicaService.generarCronograma(sesionId);
        setSnackbar({ open: true, message: 'Cronograma regenerado exitosamente', severity: 'success' });
        fetchCronograma(sesionId);
      } catch (error) {
        console.error('Error regenerating cronograma:', error);
        const errorMessage = sesionPedagogicaService.handleError(error);
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

  const handleEditTopic = (item) => {
    setEditingTopic({ id: item.id, value: item.tema_clase || '' });
  };

  const handleCancelEditTopic = () => {
    setEditingTopic({ id: null, value: '' });
  };

  const handleSaveTopicEdit = async () => {
    if (!editingTopic.id || editingTopic.value.trim() === '') return;

    setLoading(true);
    try {
      await sesionPedagogicaService.updateClaseInfo(editingTopic.id, {
        tema_clase: editingTopic.value.trim()
      });
      
      setEditingTopic({ id: null, value: '' });
      setSnackbar({ open: true, message: 'Tema de clase actualizado exitosamente', severity: 'success' });
      
      if (selectedSesion) {
        await fetchCronograma(selectedSesion);
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      const errorMessage = sesionPedagogicaService.handleError(error);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmMarcarRealizada = async (observaciones) => {
    setLoading(true);
    try {
      const { data: item } = realizadaDialog;
      
      // Safety check - ensure item exists and has an id
      if (!item || !item.id) {
        console.error('Error: No se pudo obtener los datos de la clase para marcar como realizada');
        setSnackbar({ 
          open: true, 
          message: 'Error: No se pudo obtener los datos de la clase', 
          severity: 'error' 
        });
        setLoading(false);
        return;
      }
      
      await sesionPedagogicaService.marcarSesionRealizada(item.id, observaciones || 'Clase completada desde cronograma');
      
      // Close dialog first
      setRealizadaDialog({ open: false, data: null });
      
      // Show success message
      setSnackbar({ open: true, message: 'Clase marcada como realizada exitosamente', severity: 'success' });
      
      // Force refresh cronograma data
      if (selectedSesion) {
        await fetchCronograma(selectedSesion);
      }
    } catch (error) {
      console.error('Error marking class as completed:', error);
      const errorMessage = sesionPedagogicaService.handleError(error);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmarReprogramacion = async (reprogramData) => {
    try {
      setLoading(true);
      await sesionPedagogicaService.reprogramarSesion(reprogramDialog.data.id, reprogramData);
      
      // Close dialog first
      setReprogramDialog({ open: false, data: null });
      
      // Show success message
      setSnackbar({ open: true, message: 'Clase reprogramada exitosamente', severity: 'success' });
      
      // Force refresh cronograma data
      if (selectedSesion) {
        await fetchCronograma(selectedSesion);
      }
    } catch (error) {
      console.error('Error reprogramming class:', error);
      let errorMessage = 'Error al reprogramar la clase';
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.response?.status === 400) errorMessage = 'Datos de reprogramación inválidos. Verifique la fecha y hora.';
      else if (error.response?.status === 404) errorMessage = 'Clase no encontrada';
      else if (error.response?.status === 500) errorMessage = 'Error del servidor. Intente nuevamente.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmarCancelacion = async (cancelData) => {
    try {
      setLoading(true);
      await sesionPedagogicaService.cancelarSesionCronograma(cancelDialog.data.id, cancelData.motivo_cancelacion);
      
      // Close dialog first
      setCancelDialog({ open: false, data: null });
      
      // Show success message
      setSnackbar({ open: true, message: 'Clase cancelada exitosamente', severity: 'success' });
      
      // Force refresh cronograma data
      if (selectedSesion) {
        await fetchCronograma(selectedSesion);
      }
    } catch (error) {
      console.error('Error canceling class:', error);
      const errorMessage = sesionPedagogicaService.handleError(error);
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
    if (!timeString) return '--:--';
    
    // Handle different time formats
    if (timeString.includes('T') || timeString.includes(' ')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Handle time strings like "14:30:00" or "14:30"
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    
    return timeString;
  };

  const getSesionInfo = (sesionId) => sesiones.find(s => s.id === parseInt(sesionId));

  const filteredCronogramas = cronogramas
    .filter(c => {
      const sesionInfo = getSesionInfo(selectedSesion);
      const matchesSearch = (
        sesionInfo?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sesionInfo?.pedagogo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numero_clase?.toString().includes(searchTerm.toLowerCase()) ||
        c.tema_clase?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesEstado = filterEstado === '' || c.estado === filterEstado;
      return matchesSearch && matchesEstado;
    })
    .sort((a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada));

  const truncateObservations = (text, maxLength = 40) => {
    // Handle all problematic values including "undefined" strings
    if (!text || text.trim() === '' || text === 'undefined' || text === 'null') {
      return '-';
    }
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
              <CalendarMonth sx={{ mr: 1 }} />
              Cronogramas de Sesiones Pedagógicas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Selecciona una sesión y gestiona su cronograma de clases
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
                <InputLabel shrink>Sesión Pedagógica</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...greenOutlineSX }}
                  value={selectedSesion}
                  onChange={handleSesionChange}
                  label="Sesión Pedagógica"
                  displayEmpty
                  MenuProps={menuProps}
                  renderValue={(val) => {
                    if (!val) return 'Seleccione una sesión pedagógica';
                    const s = sesiones.find(x => String(x.id) === String(val));
                    return s
                      ? `${s.titulo || s.nombre_clase} — ${s.pedagogo?.nombre || s.pedagogo_nombre}`
                      : 'Seleccione una sesión pedagógica';
                  }}
                >
                  <MenuItem value="">Seleccione una sesión pedagógica</MenuItem>
                  {sesiones.map((sesion) => (
                    <MenuItem key={sesion.id} value={sesion.id}>
                      {`${sesion.titulo || sesion.nombre_clase} — ${sesion.pedagogo?.nombre || sesion.pedagogo_nombre}`}
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
                      sx={{ borderColor: '#4caf50', color: '#4caf50', '&:hover': { borderColor: '#388e3c', bgcolor: '#e8f5e8' } }}
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
            <Paper sx={{ mt: 3, p: 2, backgroundColor: '#e8f5e8' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Título:</Typography>
                  <Typography variant="body2">{getSesionInfo(selectedSesion).titulo || getSesionInfo(selectedSesion).nombre_clase}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Pedagogo:</Typography>
                  <Typography variant="body2">{getSesionInfo(selectedSesion).pedagogo?.nombre || getSesionInfo(selectedSesion).pedagogo_nombre}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Especialidad:</Typography>
                  <Typography variant="body2">{getSesionInfo(selectedSesion).especialidad?.nombre || getSesionInfo(selectedSesion).especialidad_nombre}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Card de listado con toolbar tipo "listar" */}
      {selectedSesion ? (
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
                <Schedule sx={{ mr: 1 }} />
                Cronograma de Clases
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {cronogramas.length} clase{cronogramas.length !== 1 ? 's' : ''} programada{cronogramas.length !== 1 ? 's' : ''}
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
                placeholder="Buscar por título/pedagogo, # clase o tema..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
                sx={{ ...greenOutlineSX, minWidth: 260, flex: '1 1 380px' }}
              />

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel shrink>Filtrar por estado</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...greenOutlineSX }}
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
                        <TableCell>Clase</TableCell>
                        <TableCell>Fecha Programada</TableCell>
                        <TableCell>Hora</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Tema de Clase</TableCell>
                        <TableCell>Observaciones</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCronogramas
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((item) => (
                          <TableRow 
                            key={item.id}
                            sx={{
                              ...(item.estado === 'realizada' || item.estado === 'completada' ? {
                                backgroundColor: 'success.50',
                                '& .MuiTableCell-root': {
                                  color: 'success.800',
                                  borderBottomColor: 'success.100'
                                }
                              } : {}),
                              ...(item.estado === 'cancelada' ? {
                                backgroundColor: 'error.50',
                                '& .MuiTableCell-root': {
                                  color: 'error.700',
                                  borderBottomColor: 'error.100',
                                  textDecoration: 'line-through',
                                  opacity: 0.7
                                }
                              } : {}),
                              '&:hover': {
                                backgroundColor: item.estado === 'realizada' || item.estado === 'completada' 
                                  ? 'success.100' 
                                  : item.estado === 'cancelada' 
                                  ? 'error.100' 
                                  : 'grey.50'
                              }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {item.numero_clase || item.numero_clase_semanal}
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
                                  {formatTime(item.hora_programada)} - {formatTime(item.hora_fin || item.hora_programada)}
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
                              {editingTopic.id === item.id ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <TextField
                                    size="small"
                                    value={editingTopic.value}
                                    onChange={(e) => setEditingTopic({ ...editingTopic, value: e.target.value })}
                                    placeholder="Ingrese el tema de la clase"
                                    autoFocus
                                    fullWidth
                                    sx={{ ...greenOutlineSX }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveTopicEdit();
                                      if (e.key === 'Escape') handleCancelEditTopic();
                                    }}
                                  />
                                  <Tooltip title="Guardar">
                                    <IconButton 
                                      size="small" 
                                      color="success" 
                                      onClick={handleSaveTopicEdit}
                                      disabled={loading || !editingTopic.value.trim()}
                                    >
                                      <Save fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Cancelar">
                                    <IconButton 
                                      size="small" 
                                      color="default" 
                                      onClick={handleCancelEditTopic}
                                      disabled={loading}
                                    >
                                      <Close fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              ) : (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" sx={{ flex: 1 }}>
                                    {item.tema_clase || 'Sin tema definido'}
                                  </Typography>
                                  {(item.estado === 'programada' || item.estado === 'reprogramada') && (
                                    <Tooltip title="Editar tema">
                                      <IconButton
                                        size="small"
                                        color="info"
                                        onClick={() => handleEditTopic(item)}
                                        disabled={loading}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                title={
                                  item.observaciones ||
                                  item.observaciones_cronograma ||
                                  item.motivo_reprogramacion ||
                                  ''
                                }
                              >
                                {truncateObservations(
                                  item.observaciones ||
                                  item.observaciones_cronograma ||
                                  (item.motivo_reprogramacion ? `Reprogramada: ${item.motivo_reprogramacion}` : '')
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

                                {(item.estado === 'programada' || item.estado === 'reprogramada') && (
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
                                
                                {(item.estado === 'realizada' || item.estado === 'completada') && (
                                  <Tooltip title={`Clase completada${item.fecha_realizacion ? ` el ${formatDate(item.fecha_realizacion)}` : ''}`}>
                                    <Chip 
                                      label="Completada" 
                                      color="success" 
                                      size="small"
                                      icon={<CheckCircle />}
                                      sx={{ 
                                        fontWeight: 'bold',
                                        '& .MuiChip-icon': {
                                          color: 'success.main'
                                        }
                                      }}
                                    />
                                  </Tooltip>
                                )}

                                {item.estado === 'cancelada' && (
                                  <Tooltip title="Clase cancelada">
                                    <Chip 
                                      label="Cancelada" 
                                      color="error" 
                                      size="small"
                                      icon={<Cancel />}
                                      variant="outlined"
                                    />
                                  </Tooltip>
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
                Seleccione una Sesión Pedagógica
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Para ver el cronograma de clases, seleccione una sesión pedagógica del menú desplegable
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dialog de detalles */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <EventNote sx={{ mr: 2 }} />
            Detalles de la Clase del Cronograma
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información de la Clase</Typography>
                <Typography variant="body2"><strong>Número de Clase:</strong> {detailDialog.data.numero_clase || detailDialog.data.numero_clase_semanal}</Typography>
                <Typography variant="body2"><strong>Fecha Programada:</strong> {formatDate(detailDialog.data.fecha_programada)}</Typography>
                <Typography variant="body2"><strong>Hora:</strong> {formatTime(detailDialog.data.hora_programada)}</Typography>
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

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Contenido de la Clase</Typography>
                <Typography variant="body2"><strong>Tema:</strong> {detailDialog.data.tema_clase || 'Sin tema definido'}</Typography>
              </Grid>

              {(detailDialog.data.observaciones_cronograma || detailDialog.data.observaciones) && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Observaciones</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'background.paper' }}>
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
                  <Typography variant="subtitle2" color="primary">Información de la Sesión Pedagógica</Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#e8f5e8', border: '1px solid', borderColor: '#4caf50' }}>
                    <Typography variant="body2"><strong>Título:</strong> {getSesionInfo(selectedSesion).titulo || getSesionInfo(selectedSesion).nombre_clase}</Typography>
                    <Typography variant="body2"><strong>Pedagogo:</strong> {getSesionInfo(selectedSesion).pedagogo?.nombre || getSesionInfo(selectedSesion).pedagogo_nombre}</Typography>
                    <Typography variant="body2"><strong>Especialidad:</strong> {getSesionInfo(selectedSesion).especialidad?.nombre || getSesionInfo(selectedSesion).especialidad_nombre}</Typography>
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

      {/* Marcar como realizada */}
      <RealizadaDialogPedagogico
        open={realizadaDialog.open}
        data={realizadaDialog.data}
        onClose={() => setRealizadaDialog({ open: false, data: null })}
        onConfirm={confirmMarcarRealizada}
        loading={loading}
      />

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

// Reprogramar Dialog para clases pedagógicas
const ReprogramarDialog = ({ open, data, onClose, onConfirm, loading }) => {
  const theme = useTheme();
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [fechaOriginal, setFechaOriginal] = useState('');

  useEffect(() => {
    if (data) {
      const fechaBase = data.fecha_programada?.split('T')[0] || '';
      setFechaOriginal(fechaBase);
      setNuevaFecha(fechaBase);
      
      // Set current time as default instead of original class time
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setNuevaHora(currentTime);
      setMotivo('Reprogramación de clase pedagógica');
    }
  }, [data]);

  const moverFecha = (dias) => {
    if (!fechaOriginal) return;
    const fecha = new Date(fechaOriginal);
    fecha.setDate(fecha.getDate() + dias);
    const nuevaFechaStr = fecha.toISOString().split('T')[0];
    setNuevaFecha(nuevaFechaStr);
    const diasTexto = dias > 0 ? `+${dias}` : dias.toString();
    const motivoMovimiento = `Clase movida ${diasTexto} día${Math.abs(dias) !== 1 ? 's' : ''}`;
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
    
    const motivoFinal = motivo && motivo.trim() ? motivo.trim() : 'Reprogramación de clase pedagógica';
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
      <DialogTitle>Reprogramar Clase #{data?.numero_clase || data?.numero_clase_semanal}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Fecha y hora actual: {formatDateLocal(data?.fecha_programada)} a las {data?.hora_inicio}
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
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={loading || !nuevaFecha || !nuevaHora || !motivo || !motivo.trim()}
          sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
        >
          Reprogramar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Cancelar Dialog para clases pedagógicas
const CancelarDialog = ({ open, data, onClose, onConfirm, loading }) => {
  const theme = useTheme();
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (data) setMotivo('');
  }, [data]);

  const handleConfirm = () => {
    onConfirm({ motivo_cancelacion: motivo || 'Cancelada por el usuario' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cancelar Clase #{data?.numero_clase || data?.numero_clase_semanal}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Fecha programada: {formatDateLocal(data?.fecha_programada)} a las {data?.hora_inicio}
            </Typography>
            <Typography variant="body2" color="error" mb={2}>
              ⚠️ Esta acción marcará la clase como cancelada y no se podrá deshacer.
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

// Marcar como Realizada Dialog para Pedagogico
const RealizadaDialogPedagogico = ({ open, data, onClose, onConfirm, loading }) => {
  const theme = useTheme();
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (data) setObservaciones('');
  }, [data]);

  const handleConfirm = () => {
    if (!data) return; // Safety check
    onConfirm(observaciones);
  };

  const formatDate = (dateString) => formatDateLocal(dateString);
  const formatTime = (timeString) => {
    if (!timeString) return '';
    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString.substring(0, 5); // Formato HH:MM
    }
    return timeString;
  };

  // Don't render if no data to prevent null errors
  if (!open || !data) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Marcar Clase como Realizada</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Clase #{data.numero_clase || data.numero_clase_semanal || 'N/A'}</strong>
              {data.fecha_programada && (
                <><br />📅 {formatDate(data.fecha_programada)} a las {formatTime(data.hora_programada)}</>
              )}
              {data.tema_clase && (
                <><br />📚 <strong>Tema:</strong> {data.tema_clase}</>
              )}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" mb={2}>
              ¿Desea agregar observaciones sobre esta clase pedagógica?
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Observaciones de la clase"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Escriba aquí cualquier observación sobre el desarrollo de la clase, participación de los estudiantes, objetivos alcanzados, actividades realizadas, etc. (Opcional)"
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
              ✅ Esta acción marcará la clase como completada exitosamente.
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

export default PedagogicoCronogramas;