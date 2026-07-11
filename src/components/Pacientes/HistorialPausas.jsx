import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Refresh,
  FilterList,
  History,
  Pause,
  PlayArrow,
  Person,
  CalendarToday
} from '@mui/icons-material';
import PausasService from '../../services/pausasService';

const HistorialPausas = ({ pacienteId, pacienteNombre }) => {
  const [historial, setHistorial] = useState([]);
  const [historialFiltrado, setHistorialFiltrado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paginacion
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Estadisticas
  const [stats, setStats] = useState(null);

  useEffect(() => {
    cargarHistorial();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, [pacienteId]);

  useEffect(() => {
    aplicarFiltros();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, [historial, filtroTipo, filtroAccion, busqueda]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PausasService.getHistorialPausas(pacienteId);

      // Ordenar por fecha descendente
      const ordenado = PausasService.sortHistorialByDate(data, false);
      setHistorial(ordenado);

      // Calcular estadisticas
      const estadisticas = PausasService.getHistorialStats(ordenado);
      setStats(estadisticas);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setError(err.message || 'Error al cargar el historial de pausas');
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...historial];

    // Filtrar por tipo
    if (filtroTipo) {
      resultado = PausasService.filterHistorialByTipo(resultado, filtroTipo);
    }

    // Filtrar por accion
    if (filtroAccion) {
      resultado = PausasService.filterHistorialByAccion(resultado, filtroAccion);
    }

    // Busqueda por texto
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(item =>
        item.motivo?.toLowerCase().includes(termino) ||
        item.observaciones?.toLowerCase().includes(termino) ||
        item.usuario_nombre?.toLowerCase().includes(termino) ||
        item.especialidad_nombre?.toLowerCase().includes(termino)
      );
    }

    setHistorialFiltrado(resultado);
    setPage(0); // Reset a primera pagina al filtrar
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const limpiarFiltros = () => {
    setFiltroTipo('');
    setFiltroAccion('');
    setBusqueda('');
  };

  const getIconoAccion = (accion) => {
    if (accion?.includes('pausar')) {
      return <Pause fontSize="small" />;
    }
    if (accion?.includes('reactivar')) {
      return <PlayArrow fontSize="small" />;
    }
    return <History fontSize="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton color="inherit" size="small" onClick={cargarHistorial}>
            <Refresh />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  const registrosPaginados = historialFiltrado.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Header con informacion del paciente */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <History sx={{ mr: 1 }} />
          Historial de Pausas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <Person fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          {pacienteNombre || 'Paciente'}
        </Typography>
      </Box>

      {/* Estadisticas */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Total Registros</Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Pausas Generales</Typography>
                <Typography variant="h4" color="error.main">{stats.pausasGenerales}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Pausas Especialidad</Typography>
                <Typography variant="h4" color="warning.main">{stats.pausasEspecialidad}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Reactivaciones</Typography>
                <Typography variant="h4" color="success.main">{stats.reactivaciones}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Pausa</InputLabel>
              <Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                label="Tipo de Pausa"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="especialidad">Especialidad</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Accion</InputLabel>
              <Select
                value={filtroAccion}
                onChange={(e) => setFiltroAccion(e.target.value)}
                label="Accion"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="pausar">Pausas</MenuItem>
                <MenuItem value="reactivar">Reactivaciones</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Buscar"
              placeholder="Motivo, observaciones, usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Limpiar filtros">
                <IconButton onClick={limpiarFiltros} size="small">
                  <FilterList />
                </IconButton>
              </Tooltip>
              <Tooltip title="Recargar">
                <IconButton onClick={cargarHistorial} size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de historial */}
      {historialFiltrado.length === 0 ? (
        <Alert severity="info">
          {historial.length === 0
            ? 'No hay registros de pausas para este paciente'
            : 'No se encontraron registros con los filtros aplicados'}
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Accion</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Especialidad</TableCell>
                  <TableCell>Fechas de Pausa</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Usuario</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrosPaginados.map((registro, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        {PausasService.formatDateShort(registro.fecha_accion)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PausasService.getTipoAccion(registro.accion)}
                        color={PausasService.getColorAccion(registro.accion)}
                        size="small"
                        icon={getIconoAccion(registro.accion)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={registro.tipo_pausa === 'general' ? 'General' : 'Especialidad'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {registro.especialidad_nombre || '-'}
                    </TableCell>
                    <TableCell>
                      {registro.fecha_inicio_pausa && (
                        <Box>
                          <Typography variant="body2">
                            Desde: {PausasService.formatDateShort(registro.fecha_inicio_pausa)}
                          </Typography>
                          {registro.fecha_fin_pausa && (
                            <Typography variant="body2">
                              Hasta: {PausasService.formatDateShort(registro.fecha_fin_pausa)}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={registro.observaciones || 'Sin observaciones'}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {registro.motivo || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {registro.usuario_nombre || 'Sistema'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={historialFiltrado.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Registros por pagina:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mas de ${to}`}`
            }
          />
        </>
      )}
    </Box>
  );
};

export default HistorialPausas;
