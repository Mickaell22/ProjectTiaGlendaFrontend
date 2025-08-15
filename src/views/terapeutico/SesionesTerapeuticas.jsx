// src/views/terapeutico/SesionesTerapeuticas.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Container, IconButton, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, Button, InputAdornment
} from '@mui/material';
import {
  Delete, Search, Visibility, Person,
  Schedule, Group, PersonAdd
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';

/* ---------- Estilos compartidos (como TutorLista) ---------- */
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const SesionesTerapeuticas = () => {
  const [sesiones, setSesiones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Render seguro de pacientes: nombre único o lista
  const renderPacientes = (item) => {
    // Compatibilidad con diferentes estructuras de backend
    const nombres =
      (Array.isArray(item.pacientes) && item.pacientes.map(p => p.nombre_completo || p.nombre || '').filter(Boolean)) ||
      (item.pacientes_nombres && Array.isArray(item.pacientes_nombres) && item.pacientes_nombres) ||
      (item.paciente_nombre ? [item.paciente_nombre] : []);

    if (!nombres.length) {
      const count = item.total_pacientes || item.pacientes_count || (item.pacientes && item.pacientes.length) || 0;
      if (count > 1) return `Grupo (${count})`;
      return count === 1 ? '1 paciente' : '—';
    }

    if (nombres.length === 1) return nombres[0];

    const [first, second, ...rest] = nombres;
    const extra = rest.length;
    return extra > 0 ? `${first}, ${second} +${extra}` : `${first}, ${second}`;
  };

  const filteredSesiones = sesiones.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      s.titulo?.toLowerCase().includes(term) ||
      s.terapeuta_nombre?.toLowerCase().includes(term) ||
      s.especialidad_nombre?.toLowerCase().includes(term) ||
      s.codigo_sesion?.toLowerCase().includes(term) // ok si sigue existiendo en datos aunque ya no se muestre
    );
    return matchesSearch;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1000, md: 1200 },
          mx: 'auto'
        }}
      >
        {/* Header morado al estilo TutorLista */}
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
              Sesiones Terapéuticas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Busca y gestiona las sesiones registradas
            </Typography>
          </Box>

          <Chip
            label={`${filteredSesiones.length} sesión${filteredSesiones.length !== 1 ? 'es' : ''}`}
            color="default"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            size="small"
          />
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {/* Toolbar (búsqueda + botón nueva sesión) */}
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
              placeholder="Buscar por título, terapeuta o especialidad..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{
                ...purpleOutlineSX,
                minWidth: 260,
                flex: '1 1 380px'
              }}
            />

            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/terapeutico/crear-sesion')}
              sx={{ height: 40, px: 2 }}
            >
              Nueva Sesión
            </Button>
          </Box>

          {/* Tabla */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <Typography>Cargando sesiones...</Typography>
            </Box>
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {/* Código: eliminado */}
                    <TableCell>Título</TableCell>
                    <TableCell>Terapeuta</TableCell>
                    <TableCell>Especialidad</TableCell>
                    {/* Fechas: eliminado */}
                    <TableCell>Días</TableCell>
                    <TableCell>Paciente(s)</TableCell>
                    {/* Estado: eliminado */}
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSesiones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Box>
                          <Search sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            {searchTerm ? 'No se encontraron sesiones' : 'No hay sesiones registradas'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {searchTerm
                              ? 'Intenta con otros términos de búsqueda'
                              : 'Comienza creando la primera sesión'}
                          </Typography>
                          {!searchTerm && (
                            <Button
                              variant="contained"
                              startIcon={<PersonAdd />}
                              onClick={() => navigate('/terapeutico/crear-sesion')}
                              sx={{ mt: 2 }}
                            >
                              Crear Primera Sesión
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSesiones
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => (
                        <TableRow key={item.id}>
                          {/* Título */}
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {item.titulo}
                            </Typography>
                          </TableCell>

                          {/* Terapeuta con avatar */}
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 2, bgcolor: '#7e57c2' }}>
                                <Person />
                              </Avatar>
                              <Typography variant="body2">
                                {item.terapeuta_nombre}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Especialidad (solo nombre) */}
                          <TableCell>
                            <Typography variant="body2">{item.especialidad_nombre}</Typography>
                          </TableCell>

                          {/* Días */}
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

                          {/* Paciente(s) – nombres */}
                          <TableCell>
                            <Typography variant="body2">
                              {renderPacientes(item)}
                            </Typography>
                          </TableCell>

                          {/* Acciones */}
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
                              <Tooltip title="Cancelar">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleDelete(item.id)}
                                  disabled={item.estado === 'cancelado'}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Paginación */}
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

      {/* Dialog de detalles (sin cambios solicitados, se mantiene completo) */}
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
