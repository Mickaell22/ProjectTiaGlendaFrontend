// src/views/terapeutico/SesionesTerapeuticas.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Container, IconButton, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, Button, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  Delete, Search, Visibility, Person, 
  CheckCircle, Schedule, Group
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

const SesionesTerapeuticas = () => {
  const [sesiones, setSesiones] = useState([]);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await sesionTerapiaService.getSesiones();
      setSesiones(response.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de cancelar esta sesión terapéutica?')) {
      try {
        await sesionTerapiaService.deleteSesion(id);
        setSnackbar({ open: true, message: 'Sesión cancelada correctamente', severity: 'info' });
        fetchData();
      } catch (error) {
        console.error('Error deleting session:', error);
        const errorMessage = sesionTerapiaService.handleError(error);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      }
    }
  };

  const handleViewDetail = (item) => {
    navigate(`/terapeutico/sesion/${item.id}`);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'suspendido': return 'warning';
      case 'completado': return 'info';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'activo': return <CheckCircle />;
      case 'suspendido': return <Schedule />;
      case 'completado': return <CheckCircle />;
      case 'cancelado': return <Delete />;
      default: return <Schedule />;
    }
  };

  const filteredSesiones = sesiones.filter(s => {
    const matchesSearch = (
      s.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.terapeuta_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.especialidad_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.codigo_sesion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesEstado = filterEstado === '' || s.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Lista de Sesiones Terapéuticas ({sesiones.length} sesiones)
          </Typography>
          
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center">
                <Search sx={{ mr: 1 }} />
                <TextField
                  label="Buscar sesión..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  placeholder="Buscar por título, terapeuta, código o especialidad"
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
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="suspendido">Suspendido</MenuItem>
                  <MenuItem value="completado">Completado</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <Typography>Cargando sesiones...</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell>Terapeuta</TableCell>
                  <TableCell>Especialidad</TableCell>
                  <TableCell>Fechas</TableCell>
                  <TableCell>Días</TableCell>
                  <TableCell>Pacientes</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSesiones
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {item.codigo_sesion}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {item.titulo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'secondary.light' }}>
                            <Person />
                          </Avatar>
                          <Typography variant="body2">
                            {item.terapeuta_nombre}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{item.especialidad_nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.especialidad_area}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="caption">
                            {item.fecha_inicio} - {item.fecha_fin}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {item.hora_inicio} ({item.duracion_minutos}min)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {item.dias_semana?.map(dia => (
                            <Chip 
                              key={dia}
                              label={dia} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {(item.total_pacientes || item.pacientes_count || (item.pacientes && item.pacientes.length) || 0) > 1 ? 
                            <Group sx={{ mr: 1 }} /> : <Person sx={{ mr: 1 }} />}
                          <Typography variant="body2">
                            {item.total_pacientes || item.pacientes_count || (item.pacientes && item.pacientes.length) || 0}
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
                        <Box display="flex" gap={1}>
                          <Tooltip title="Ver detalles">
                            <IconButton 
                              color="info" 
                              size="small"
                              onClick={() => handleViewDetail(item)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancelar">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleDelete(item.id)}
                              disabled={item.estado === 'cancelado'}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}

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
        </CardContent>
      </Card>

      {/* Dialog de detalles */}
      <Dialog 
        open={detailDialog.open} 
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Schedule sx={{ mr: 2 }} />
            Detalles de la Sesión Terapéutica
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información General</Typography>
                <Typography variant="body2">
                  <strong>Código:</strong> {detailDialog.data.codigo_sesion}
                </Typography>
                <Typography variant="body2">
                  <strong>Título:</strong> {detailDialog.data.titulo}
                </Typography>
                <Typography variant="body2">
                  <strong>Estado:</strong> {detailDialog.data.estado}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Terapeuta y Especialidad</Typography>
                <Typography variant="body2">
                  <strong>Terapeuta:</strong> {detailDialog.data.terapeuta_nombre}
                </Typography>
                <Typography variant="body2">
                  <strong>Especialidad:</strong> {detailDialog.data.especialidad_nombre}
                </Typography>
                <Typography variant="body2">
                  <strong>Área:</strong> {detailDialog.data.especialidad_area}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Programación</Typography>
                <Typography variant="body2">
                  <strong>Período:</strong> {detailDialog.data.fecha_inicio} - {detailDialog.data.fecha_fin}
                </Typography>
                <Typography variant="body2">
                  <strong>Días:</strong> {detailDialog.data.dias_semana?.join(', ')}
                </Typography>
                <Typography variant="body2">
                  <strong>Hora:</strong> {detailDialog.data.hora_inicio}
                </Typography>
                <Typography variant="body2">
                  <strong>Duración:</strong> {detailDialog.data.duracion_minutos} minutos
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información Financiera</Typography>
                <Typography variant="body2">
                  <strong>Sesiones Contratadas:</strong> {detailDialog.data.numero_sesiones_contratadas}
                </Typography>
                <Typography variant="body2">
                  <strong>Costo Total:</strong> ${detailDialog.data.costo_total}
                </Typography>
                <Typography variant="body2">
                  <strong>Costo por Sesión:</strong> ${detailDialog.data.costo_por_sesion}
                </Typography>
                <Typography variant="body2">
                  <strong>Meses de Contrato:</strong> {detailDialog.data.meses_contrato}
                </Typography>
              </Grid>

              {detailDialog.data.observaciones && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Observaciones</Typography>
                  <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2">{detailDialog.data.observaciones}</Typography>
                  </Box>
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

export default SesionesTerapeuticas;