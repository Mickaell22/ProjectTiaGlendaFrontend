import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Refresh,
  Warning,
  CheckCircle,
  Pause,
  TrendingUp,
  PlayArrow,
  Info,
  CalendarToday,
  Speed
} from '@mui/icons-material';
import PausasService from '../../services/pausasService';

const DashboardPausas = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [pausasVencidas, setPausasVencidas] = useState([]);
  const [pausasProximas, setPausasProximas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProcesar, setLoadingProcesar] = useState(false);
  const [error, setError] = useState(null);
  const [diasUmbral, setDiasUmbral] = useState(7);

  // Dialog de confirmacion
  const [openConfirm, setOpenConfirm] = useState(false);
  const [mensajeProcesamiento, setMensajeProcesamiento] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [diasUmbral]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stats, vencidas, proximas] = await Promise.all([
        PausasService.getEstadisticas(),
        PausasService.getPausasVencidas(),
        PausasService.getPausasProximasVencer(diasUmbral)
      ]);

      setEstadisticas(stats);
      setPausasVencidas(vencidas);
      setPausasProximas(proximas);
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleProcesarAutomaticas = async () => {
    setOpenConfirm(false);
    setLoadingProcesar(true);
    setMensajeProcesamiento(null);

    try {
      const resultado = await PausasService.procesarPausasAutomaticas();

      const totalProcesadas = (resultado.pausas_generales_reactivadas || 0) + (resultado.pausas_especialidades_reactivadas || 0);
      setMensajeProcesamiento({
        tipo: 'success',
        mensaje: `Procesamiento exitoso: ${totalProcesadas} pausas reactivadas`
      });

      // Recargar datos
      await cargarDatos();
    } catch (err) {
      console.error('Error procesando pausas:', err);
      setMensajeProcesamiento({
        tipo: 'error',
        mensaje: err.message || 'Error al procesar las pausas vencidas'
      });
    } finally {
      setLoadingProcesar(false);
    }
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
          <IconButton color="inherit" size="small" onClick={cargarDatos}>
            <Refresh />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  const getTasaPausasActivas = () => {
    if (!estadisticas || estadisticas.total_pacientes === 0) return 0;
    return ((estadisticas.pausas_activas / estadisticas.total_pacientes) * 100).toFixed(1);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Speed sx={{ mr: 1, fontSize: 32 }} />
          Control de Pausas
        </Typography>
        <Tooltip title="Recargar datos">
          <IconButton onClick={cargarDatos} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Mensaje de procesamiento */}
      {mensajeProcesamiento && (
        <Alert
          severity={mensajeProcesamiento.tipo}
          onClose={() => setMensajeProcesamiento(null)}
          sx={{ mb: 3 }}
        >
          {mensajeProcesamiento.mensaje}
        </Alert>
      )}

      {/* Tarjetas de estadisticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Pausas Activas</Typography>
                  <Typography variant="h4" color="error.main">
                    {estadisticas?.pausas_activas || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getTasaPausasActivas()}% del total
                  </Typography>
                </Box>
                <Pause sx={{ fontSize: 48, color: 'error.light', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Pausas Vencidas</Typography>
                  <Typography variant="h4" color="warning.main">
                    {pausasVencidas.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Requieren atencion
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 48, color: 'warning.light', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Proximas a Vencer</Typography>
                  <Typography variant="h4" color="info.main">
                    {pausasProximas.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    En {diasUmbral} dias
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 48, color: 'info.light', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Pacientes</Typography>
                  <Typography variant="h4" color="success.main">
                    {estadisticas?.total_pacientes || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    En el sistema
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, color: 'success.light', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barra de progreso de pausas activas */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Tasa de Pausas Activas
        </Typography>
        <LinearProgress
          variant="determinate"
          value={parseFloat(getTasaPausasActivas())}
          color={parseFloat(getTasaPausasActivas()) > 50 ? 'error' : 'primary'}
          sx={{ height: 10, borderRadius: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption">0%</Typography>
          <Typography variant="caption" fontWeight="bold">
            {getTasaPausasActivas()}%
          </Typography>
          <Typography variant="caption">100%</Typography>
        </Box>
      </Paper>

      {/* Seccion de pausas vencidas */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1, color: 'warning.main' }} />
            Pausas Vencidas ({pausasVencidas.length})
          </Typography>
          {pausasVencidas.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenConfirm(true)}
              disabled={loadingProcesar}
              startIcon={loadingProcesar ? <CircularProgress size={20} /> : <PlayArrow />}
            >
              {loadingProcesar ? 'Procesando...' : 'Procesar Automaticamente'}
            </Button>
          )}
        </Box>

        {pausasVencidas.length === 0 ? (
          <Alert severity="success" icon={<CheckCircle />}>
            No hay pausas vencidas en este momento
          </Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Especialidad</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                  <TableCell>Dias Vencida</TableCell>
                  <TableCell>Motivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pausasVencidas.map((pausa, index) => {
                  const diasVencida = Math.abs(PausasService.calcularDiasRestantes(pausa.fecha_fin_pausa));
                  return (
                    <TableRow key={index} hover>
                      <TableCell>{pausa.paciente_nombre}</TableCell>
                      <TableCell>
                        <Chip
                          label={pausa.tipo_pausa === 'general' ? 'General' : 'Especialidad'}
                          size="small"
                          color={pausa.tipo_pausa === 'general' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{pausa.especialidad_nombre || '-'}</TableCell>
                      <TableCell>{PausasService.formatDateShort(pausa.fecha_fin_pausa)}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${diasVencida} dia${diasVencida !== 1 ? 's' : ''}`}
                          size="small"
                          color="error"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={pausa.observaciones_pausa || 'Sin observaciones'}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {pausa.motivo_pausa}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Seccion de pausas proximas a vencer */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <Info sx={{ mr: 1, color: 'info.main' }} />
            Pausas Proximas a Vencer ({pausasProximas.length})
          </Typography>
        </Box>

        {pausasProximas.length === 0 ? (
          <Alert severity="info" icon={<Info />}>
            No hay pausas proximas a vencer en los proximos {diasUmbral} dias
          </Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Especialidad</TableCell>
                  <TableCell>Fecha Fin</TableCell>
                  <TableCell>Dias Restantes</TableCell>
                  <TableCell>Motivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pausasProximas.map((pausa, index) => {
                  const diasRestantes = PausasService.calcularDiasRestantes(pausa.fecha_fin_pausa);
                  return (
                    <TableRow key={index} hover>
                      <TableCell>{pausa.paciente_nombre}</TableCell>
                      <TableCell>
                        <Chip
                          label={pausa.tipo_pausa === 'general' ? 'General' : 'Especialidad'}
                          size="small"
                          color={pausa.tipo_pausa === 'general' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{pausa.especialidad_nombre || '-'}</TableCell>
                      <TableCell>{PausasService.formatDateShort(pausa.fecha_fin_pausa)}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}`}
                          size="small"
                          color={diasRestantes <= 3 ? 'warning' : 'info'}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={pausa.observaciones_pausa || 'Sin observaciones'}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {pausa.motivo_pausa}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog de confirmacion */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmar Procesamiento Automatico</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta accion reactivara automaticamente todas las pausas vencidas ({pausasVencidas.length}).
          </Alert>
          <Typography variant="body2">
            Las pausas seran reactivadas y los pacientes volveran a su estado activo.
            Esta accion no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancelar</Button>
          <Button
            onClick={handleProcesarAutomaticas}
            variant="contained"
            color="primary"
            autoFocus
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPausas;
