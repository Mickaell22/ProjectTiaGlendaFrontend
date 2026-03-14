import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
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
  Alert,
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Refresh,
  FilterList,
  History,
  Pause,
  PlayArrow,
  CalendarToday,
  PauseCircle
} from '@mui/icons-material';
import PausasService from '../../services/pausasService';

const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const HistorialPausas = ({ pacienteId, pacienteNombre }) => {
  const theme = useTheme();
  const [historial, setHistorial] = useState([]);
  const [historialFiltrado, setHistorialFiltrado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [stats, setStats] = useState(null);

  useEffect(() => { cargarHistorial(); }, [pacienteId]);
  useEffect(() => { aplicarFiltros(); }, [historial, filtroTipo, filtroAccion, busqueda]);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PausasService.getHistorialPausas(pacienteId);
      const ordenado = PausasService.sortHistorialByDate(data, false);
      setHistorial(ordenado);
      setStats(PausasService.getHistorialStats(ordenado));
    } catch (err) {
      setError(err.message || 'Error al cargar el historial de pausas');
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...historial];
    if (filtroTipo) resultado = PausasService.filterHistorialByTipo(resultado, filtroTipo);
    if (filtroAccion) resultado = PausasService.filterHistorialByAccion(resultado, filtroAccion);
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
    setPage(0);
  };

  const limpiarFiltros = () => {
    setFiltroTipo('');
    setFiltroAccion('');
    setBusqueda('');
  };

  const getIconoAccion = (accion) => {
    if (accion?.includes('pausar')) return <Pause fontSize="small" />;
    if (accion?.includes('reactivar')) return <PlayArrow fontSize="small" />;
    return <History fontSize="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress color="primary" />
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
    <Card
      elevation={8}
      sx={{
        borderRadius: 4,
        mb: 4,
        backgroundColor: 'background.paper',
        overflow: 'hidden',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      {/* Header */}
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
            <PauseCircle sx={{ mr: 1 }} />
            Historial de Pausas
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {pacienteNombre ? `Paciente: ${pacienteNombre}` : 'Registro de pausas y reactivaciones'}
          </Typography>
        </Box>
        {stats && (
          <Chip
            label={`${stats.total} registro${stats.total !== 1 ? 's' : ''}`}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            size="small"
          />
        )}
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>

        {/* Estadisticas */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total Registros', value: stats.total, color: 'text.primary' },
              { label: 'Pausas Generales', value: stats.pausasGenerales, color: 'error.main' },
              { label: 'Pausas Especialidad', value: stats.pausasEspecialidad, color: 'warning.main' },
              { label: 'Reactivaciones', value: stats.reactivaciones, color: 'success.main' },
            ].map((stat) => (
              <Grid item xs={6} sm={3} key={stat.label}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.default',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Filtros */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          <TextField
            size="small"
            label="Buscar"
            placeholder="Motivo, observaciones, usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            sx={{ minWidth: 220, ...purpleOutlineSX }}
          />

          <FormControl size="small" sx={{ minWidth: 150, ...purpleOutlineSX }}>
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

          <FormControl size="small" sx={{ minWidth: 150, ...purpleOutlineSX }}>
            <InputLabel>Acción</InputLabel>
            <Select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              label="Acción"
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="pausar">Pausas</MenuItem>
              <MenuItem value="reactivar">Reactivaciones</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Limpiar filtros">
              <IconButton onClick={limpiarFiltros} size="small" color="primary">
                <FilterList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Recargar">
              <IconButton onClick={cargarHistorial} size="small" color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Tabla */}
        {historialFiltrado.length === 0 ? (
          <Alert severity="info">
            {historial.length === 0
              ? 'No hay registros de pausas para este paciente'
              : 'No se encontraron registros con los filtros aplicados'}
          </Alert>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    }}
                  >
                    {['Fecha', 'Acción', 'Tipo', 'Especialidad', 'Fechas de Pausa', 'Motivo', 'Usuario'].map((col) => (
                      <TableCell
                        key={col}
                        sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrosPaginados.map((registro, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        '&:nth-of-type(even)': { bgcolor: 'action.hover' },
                        '&:hover': { bgcolor: `${theme.palette.primary.main}10` }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2">
                            {PausasService.formatDateShort(registro.fecha_accion)}
                          </Typography>
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
                          color={registro.tipo_pausa === 'general' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {registro.especialidad_nombre || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {registro.fecha_inicio_pausa ? (
                          <Box>
                            <Typography variant="caption" display="block">
                              Desde: {PausasService.formatDateShort(registro.fecha_inicio_pausa)}
                            </Typography>
                            {registro.fecha_fin_pausa && (
                              <Typography variant="caption" display="block">
                                Hasta: {PausasService.formatDateShort(registro.fecha_fin_pausa)}
                              </Typography>
                            )}
                          </Box>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={registro.observaciones || 'Sin observaciones'}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                            {registro.motivo || '—'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {registro.usuario_nombre || 'Sistema'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <TablePagination
              component="div"
              count={historialFiltrado.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HistorialPausas;
