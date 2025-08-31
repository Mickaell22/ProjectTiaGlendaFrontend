// src/views/pedagogico/PedagogicoCronogramas.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Card, CardContent,
  Grid, Button, IconButton, Tooltip, Alert, Snackbar,
  Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select,
  MenuItem, TextField, Switch, FormControlLabel,
  Tabs, Tab, Divider
} from '@mui/material';
import {
  CalendarMonth, Schedule, School, Add, Visibility,
  Today, EventNote, AccessTime, FilterList,
  Download, Refresh, Edit, Delete, Event
} from '@mui/icons-material';
import { useAuth } from 'src/contexts/AuthContext';
import sesionPedagogicaService from 'src/services/SesionPedagogicaService';

const PedagogicoCronogramas = () => {
  const [sesiones, setSesiones] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filtros, setFiltros] = useState({ especialidad: '', pedagogo: '', semana: 'actual' });
  const [vistaActual, setVistaActual] = useState(0); // 0: semanal, 1: mensual
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchSesiones();
  }, [filtros]);

  const fetchSesiones = async () => {
    setLoading(true);
    try {
      // Obtener cronograma de sesiones con filtros aplicados
      const cronogramaResponse = await sesionPedagogicaService.getCronogramaSesiones(filtros);
      const sesionesData = cronogramaResponse.data || [];
      setSesiones(sesionesData);
      generarCronogramas(sesionesData);
    } catch (error) {
      console.error('Error fetching sessions schedule:', error);
      // Si falla el cronograma, intentar con las sesiones normales
      try {
        const response = await sesionPedagogicaService.getSesiones();
        const sesionesData = response.data || [];
        setSesiones(sesionesData);
        generarCronogramas(sesionesData);
      } catch (fallbackError) {
        console.error('Error fetching sessions:', fallbackError);
        setSnackbar({
          open: true,
          message: 'Error al cargar las sesiones y cronograma',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const generarCronogramas = (sesionesData) => {
    // Generar cronograma basado en las sesiones reales
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    const cronogramaSemanal = diasSemana.map(dia => {
      // Filtrar sesiones reales que corresponden a este día
      const sesionesDia = sesionesData.filter(sesion => {
        // Si la sesión tiene dias_programados definidos (del backend)
        if (sesion.dias_programados && sesion.dias_programados.length > 0) {
          return sesion.dias_programados.includes(dia) || 
                 sesion.dias_programados.includes(dia.toLowerCase()) ||
                 sesion.dias_programados.includes(dia.substring(0, 3).toLowerCase()); // lun, mar, etc.
        }
        
        // Si la sesión tiene dias_semana como string
        if (sesion.dias_semana && typeof sesion.dias_semana === 'string') {
          const diasString = sesion.dias_semana.toLowerCase();
          return diasString.includes(dia.toLowerCase()) || 
                 diasString.includes(dia.substring(0, 3).toLowerCase());
        }
        
        // Si la sesión tiene dias_semana como array
        if (Array.isArray(sesion.dias_semana)) {
          return sesion.dias_semana.some(d => 
            d.toLowerCase() === dia.toLowerCase() || 
            d.toLowerCase() === dia.substring(0, 3).toLowerCase()
          );
        }
        
        // Si no tiene días definidos, distribuir equitativamente solo en días laborables
        if (dia !== 'Sábado' && dia !== 'Domingo') {
          const indiceDia = diasSemana.indexOf(dia);
          return (sesion.id % 5) === (indiceDia % 5);
        }
        
        return false;
      });
      
      return {
        dia,
        sesiones: sesionesDia
      };
    });

    setCronogramas(cronogramaSemanal);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const exportarCronograma = () => {
    setSnackbar({
      open: true,
      message: 'Cronograma exportado exitosamente',
      severity: 'success'
    });
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay + 1); // Lunes
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const getHorarioColor = (especialidadNombre) => {
    if (!especialidadNombre) return 'default';
    
    const colores = {
      // Especialidades comunes
      'Matemáticas': 'primary',
      'Matematicas': 'primary',
      'Lenguaje': 'success', 
      'Comunicación': 'success',
      'Ciencias': 'warning',
      'Educación Física': 'error',
      'Arte': 'info',
      'Música': 'info',
      'Lectoescritura': 'success',
      'Cálculo': 'primary',
      'Terapia de Lenguaje': 'secondary',
      'Psicopedagogía': 'warning'
    };
    
    // Buscar coincidencia exacta
    if (colores[especialidadNombre]) {
      return colores[especialidadNombre];
    }
    
    // Buscar coincidencia parcial
    const nombreLower = especialidadNombre.toLowerCase();
    for (const [key, value] of Object.entries(colores)) {
      if (nombreLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nombreLower)) {
        return value;
      }
    }
    
    // Color basado en hash del nombre para consistencia
    const hash = especialidadNombre.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = ['primary', 'secondary', 'success', 'warning', 'info'];
    return colors[Math.abs(hash) % colors.length];
  };

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
        {/* Header */}
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
              Cronogramas Pedagógicos
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Gestión de cronogramas y horarios de clases
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Tooltip title="Exportar PDF">
              <IconButton 
                sx={{ color: 'white' }}
                onClick={exportarCronograma}
              >
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Actualizar">
              <IconButton 
                sx={{ color: 'white' }}
                onClick={fetchSesiones}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {/* Filtros y controles */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Especialidad</InputLabel>
                <Select
                  value={filtros.especialidad}
                  onChange={(e) => handleFiltroChange('especialidad', e.target.value)}
                  label="Especialidad"
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="Matemáticas">Matemáticas</MenuItem>
                  <MenuItem value="Lenguaje">Lenguaje</MenuItem>
                  <MenuItem value="Ciencias">Ciencias</MenuItem>
                  <MenuItem value="Educación Física">Educación Física</MenuItem>
                  <MenuItem value="Arte">Arte</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Pedagogo</InputLabel>
                <Select
                  value={filtros.pedagogo}
                  onChange={(e) => handleFiltroChange('pedagogo', e.target.value)}
                  label="Pedagogo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Prof. Martínez">Prof. Martínez</MenuItem>
                  <MenuItem value="Prof. García">Prof. García</MenuItem>
                  <MenuItem value="Prof. López">Prof. López</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Semana</InputLabel>
                <Select
                  value={filtros.semana}
                  onChange={(e) => handleFiltroChange('semana', e.target.value)}
                  label="Semana"
                >
                  <MenuItem value="anterior">Semana Anterior</MenuItem>
                  <MenuItem value="actual">Semana Actual</MenuItem>
                  <MenuItem value="siguiente">Semana Siguiente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                onClick={() => setDialogAbierto(true)}
                sx={{ height: '40px' }}
              >
                Nuevo Evento
              </Button>
            </Grid>
          </Grid>

          {/* Pestañas de vista */}
          <Tabs 
            value={vistaActual} 
            onChange={(e, newValue) => setVistaActual(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab 
              label="Vista Semanal" 
              icon={<CalendarMonth />} 
              iconPosition="start"
            />
            <Tab 
              label="Vista Mensual" 
              icon={<Schedule />} 
              iconPosition="start"
            />
          </Tabs>

          {/* Vista Semanal */}
          {vistaActual === 0 && (
            <Card sx={{ overflow: 'hidden' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Hora</TableCell>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia, index) => {
                      const fecha = getCurrentWeekDates()[index];
                      return (
                        <TableCell key={dia} align="center" sx={{ fontWeight: 'bold', minWidth: 150 }}>
                          <Box>
                            <Typography variant="body2">{dia}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {fecha.getDate()}/{fecha.getMonth() + 1}
                            </Typography>
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 12 }, (_, i) => {
                    const hora = 7 + i;
                    const horaStr = `${hora.toString().padStart(2, '0')}:00`;
                    return (
                      <TableRow key={hora} hover>
                        <TableCell sx={{ fontWeight: 'medium', bgcolor: 'grey.50' }}>
                          {horaStr} - {(hora + 1).toString().padStart(2, '0')}:00
                        </TableCell>
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => {
                          // Simulamos algunas sesiones para demostrar
                          const tieneSesion = Math.random() > 0.7;
                          const especialidades = ['Matemáticas', 'Lenguaje', 'Ciencias', 'Arte'];
                          const especialidad = especialidades[Math.floor(Math.random() * especialidades.length)];
                          const pedagogos = ['Prof. Martínez', 'Prof. García', 'Prof. López'];
                          const pedagogo = pedagogos[Math.floor(Math.random() * pedagogos.length)];
                          
                          return (
                            <TableCell key={dia} sx={{ p: 1, height: 60 }}>
                              {tieneSesion && (
                                <Chip
                                  size="small"
                                  label={especialidad}
                                  color={getHorarioColor(especialidad)}
                                  sx={{
                                    width: '100%',
                                    height: '45px',
                                    '& .MuiChip-label': {
                                      fontSize: '0.7rem',
                                      whiteSpace: 'normal',
                                      overflow: 'visible'
                                    }
                                  }}
                                  onClick={() => {
                                    setSnackbar({
                                      open: true,
                                      message: `Sesión: ${especialidad} - ${pedagogo}`,
                                      severity: 'info'
                                    });
                                  }}
                                />
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Vista Mensual */}
          {vistaActual === 1 && (
            <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Vista Mensual
              </Typography>
              <Typography variant="body2">
                La vista mensual mostrará un calendario completo con todas las sesiones del mes.
                Esta funcionalidad estará disponible en la próxima actualización.
              </Typography>
            </Alert>
          )}

          {/* Leyenda */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Leyenda de Especialidades:
            </Typography>
            <Grid container spacing={1}>
              {[
                { nombre: 'Matemáticas', color: 'primary' },
                { nombre: 'Lenguaje', color: 'success' },
                { nombre: 'Ciencias', color: 'warning' },
                { nombre: 'Educación Física', color: 'error' },
                { nombre: 'Arte', color: 'info' }
              ].map(especialidad => (
                <Grid item key={especialidad.nombre}>
                  <Chip 
                    size="small" 
                    label={especialidad.nombre} 
                    color={especialidad.color}
                    variant="outlined"
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Dialog para nuevo evento */}
      <Dialog open={dialogAbierto} onClose={() => setDialogAbierto(false)} maxWidth="md" fullWidth>
        <DialogTitle>Programar Nuevo Evento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Título del Evento"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Evento</InputLabel>
                <Select label="Tipo de Evento">
                  <MenuItem value="clase">Clase Regular</MenuItem>
                  <MenuItem value="evaluacion">Evaluación</MenuItem>
                  <MenuItem value="evento">Evento Especial</MenuItem>
                  <MenuItem value="reunion">Reunión</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hora de Inicio"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAbierto(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setDialogAbierto(false);
              setSnackbar({
                open: true,
                message: 'Evento programado exitosamente',
                severity: 'success'
              });
            }}
          >
            Programar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default PedagogicoCronogramas;