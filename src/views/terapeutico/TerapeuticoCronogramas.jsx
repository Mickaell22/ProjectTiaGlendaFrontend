// src/views/terapeutico/TerapeuticoCronogramas.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, Stack, FormControl, InputLabel, Select
} from '@mui/material';
import { 
  CalendarMonth, Edit, Search, Visibility, Refresh, CheckCircle, Cancel, 
  Schedule, AccessTime, Today, Person, Psychology, EventNote
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

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

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programada': return 'info';
      case 'realizada': return 'success';
      case 'cancelada': return 'error';
      case 'reprogramada': return 'warning';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'programada': return <Schedule />;
      case 'realizada': return <CheckCircle />;
      case 'cancelada': return <Cancel />;
      case 'reprogramada': return <AccessTime />;
      default: return <EventNote />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Handle both full datetime and time-only strings
    if (timeString.includes('T') || timeString.includes(' ')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return timeString; // Already formatted as HH:MM
  };

  const getSesionInfo = (sesionId) => {
    return sesiones.find(s => s.id === parseInt(sesionId));
  };

  const filteredCronogramas = cronogramas.filter(c => {
    const sesionInfo = getSesionInfo(selectedSesion);
    const matchesSearch = (
      sesionInfo?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sesionInfo?.terapeuta_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numero_sesion?.toString().includes(searchTerm.toLowerCase())
    );
    const matchesEstado = filterEstado === '' || c.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" mb={3}>Seleccionar Sesión Terapéutica</Typography>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <FormControl fullWidth>
                  <InputLabel>Sesión Terapéutica</InputLabel>
                  <Select
                    value={selectedSesion}
                    onChange={handleSesionChange}
                    label="Sesión Terapéutica"
                  >
                    <MenuItem value="">Seleccione una sesión</MenuItem>
                    {sesiones.map((sesion) => (
                      <MenuItem key={sesion.id} value={sesion.id}>
                        {`${sesion.codigo_sesion} - ${sesion.titulo} (${sesion.terapeuta_nombre})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {selectedSesion && (
                <Grid item xs={12} md={4}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Refresh />}
                    onClick={() => regenerarCronograma(selectedSesion)}
                    disabled={loading}
                    fullWidth
                  >
                    Regenerar Cronograma
                  </Button>
                </Grid>
              )}
            </Grid>

            {selectedSesion && getSesionInfo(selectedSesion) && (
              <Paper sx={{ mt: 3, p: 2, backgroundColor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">Código:</Typography>
                    <Typography variant="body2">{getSesionInfo(selectedSesion).codigo_sesion}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">Terapeuta:</Typography>
                    <Typography variant="body2">{getSesionInfo(selectedSesion).terapeuta_nombre}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">Especialidad:</Typography>
                    <Typography variant="body2">{getSesionInfo(selectedSesion).especialidad_nombre}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2">Estado:</Typography>
                    <Chip 
                      label={getSesionInfo(selectedSesion).estado} 
                      color={getEstadoColor(getSesionInfo(selectedSesion).estado)}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}
          </CardContent>
        </Card>

        {selectedSesion && (
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Cronograma - {cronogramas.length} sesiones programadas
              </Typography>
              
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center">
                    <Search sx={{ mr: 1 }} />
                    <TextField
                      label="Buscar..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      placeholder="Buscar por número de sesión..."
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filtrar por estado</InputLabel>
                    <Select
                      value={filterEstado}
                      onChange={(e) => setFilterEstado(e.target.value)}
                      label="Filtrar por estado"
                    >
                      <MenuItem value="">Todos los estados</MenuItem>
                      <MenuItem value="programada">Programada</MenuItem>
                      <MenuItem value="realizada">Realizada</MenuItem>
                      <MenuItem value="cancelada">Cancelada</MenuItem>
                      <MenuItem value="reprogramada">Reprogramada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <Typography>Cargando cronograma...</Typography>
                </Box>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Fecha Programada</TableCell>
                        <TableCell>Hora</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Fecha Realización</TableCell>
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
                              {item.fecha_realizacion ? (
                                <Typography variant="body2" color="success.main">
                                  {formatDate(item.fecha_realizacion)}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap>
                                {item.observaciones_cronograma || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Ver detalles">
                                <IconButton 
                                  color="info" 
                                  size="small"
                                  onClick={() => handleViewDetail(item)}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>

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
        )}

        {!selectedSesion && (
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
              Detalles de la Sesión del Cronograma
            </Box>
          </DialogTitle>
          <DialogContent>
            {detailDialog.data && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="primary">Información de la Sesión</Typography>
                  <Typography variant="body2">
                    <strong>Número de Sesión:</strong> {detailDialog.data.numero_sesion}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fecha Programada:</strong> {formatDate(detailDialog.data.fecha_programada)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hora Programada:</strong> {formatTime(detailDialog.data.hora_programada)}
                  </Typography>
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
                  {detailDialog.data.fecha_realizacion && (
                    <Typography variant="body2">
                      <strong>Fecha de Realización:</strong> {formatDate(detailDialog.data.fecha_realizacion)}
                    </Typography>
                  )}
                </Grid>

                {detailDialog.data.observaciones_cronograma && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary">Observaciones</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant="body2">{detailDialog.data.observaciones_cronograma}</Typography>
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
                      <Typography variant="body2">
                        <strong>Código:</strong> {getSesionInfo(selectedSesion).codigo_sesion}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Título:</strong> {getSesionInfo(selectedSesion).titulo}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Terapeuta:</strong> {getSesionInfo(selectedSesion).terapeuta_nombre}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Especialidad:</strong> {getSesionInfo(selectedSesion).especialidad_nombre}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialog({ open: false, data: null })}>
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

export default TerapeuticoCronogramas;