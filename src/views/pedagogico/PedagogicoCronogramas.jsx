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
  const [, setCronogramaSemanal] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [pedagogos, setPedagogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filtros, setFiltros] = useState({ especialidad: '', pedagogo: '', semana: 'actual' });
  const [vistaActual, setVistaActual] = useState(0); // 0: semanal, 1: mensual
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchSesiones();
    fetchEspecialidades();
    fetchPedagogos();
  }, [filtros]);

  useEffect(() => {
    if (sesiones.length > 0) {
      fetchCronogramaSemanal();
    }
  }, [sesiones, filtros.semana]);

  const fetchSesiones = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching sesiones...');
      const response = await sesionPedagogicaService.getSesiones(filtros);
      const sesionesData = response.data?.data || response.data || [];
      console.log('✅ Sesiones fetched:', sesionesData.length, 'sesiones');
      setSesiones(sesionesData);
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      setSnackbar({
        open: true,
        message: `Error al cargar las sesiones: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCronogramaSemanal = async () => {
    try {
      console.log('🔄 Fetching cronograma semanal...');
      const response = await sesionPedagogicaService.getCronogramaSesiones(filtros);
      const cronogramaData = response.data || [];
      console.log('✅ Cronograma fetched:', cronogramaData.length, 'clases');
      setCronogramaSemanal(cronogramaData);
      generarCronogramas(cronogramaData);
    } catch (error) {
      console.error('❌ Error fetching weekly schedule:', error);
      // Fallback: generar cronograma basado en sesiones
      generarCronogramas(sesiones);
    }
  };

  const fetchEspecialidades = async () => {
    try {
      const response = await sesionPedagogicaService.getEspecialidades();
      const especialidadesData = response.data?.data || response.data || [];
      setEspecialidades(especialidadesData);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      // No mostrar error para especialidades, usar array vacío como fallback
    }
  };

  const fetchPedagogos = async () => {
    try {
      const response = await sesionPedagogicaService.getPedagogos();
      const pedagogosData = response.data?.data || response.data || [];
      setPedagogos(pedagogosData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // No mostrar error para pedagogos, usar array vacío como fallback
    }
  };

  const generarCronogramas = (cronogramaData) => {
    // Generar cronograma basado en los datos reales del cronograma semanal
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const horasDelDia = Array.from({ length: 12 }, (_, i) => 7 + i); // 7:00 a 18:00
    
    const cronogramaProcesado = diasSemana.map(dia => {
      const horariosDelDia = horasDelDia.map(hora => {
        // Buscar clases que coincidan con este día y hora
        const clasesEnHora = cronogramaData.filter(clase => {
          if (!clase.fecha_programada || !clase.hora_inicio) return false;
          
          // Convertir fecha a día de la semana
          const fechaClase = new Date(clase.fecha_programada);
          const diasMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          const diaClase = diasMap[fechaClase.getDay()];
          
          // Verificar si coincide el día
          if (diaClase !== dia) return false;
          
          // Verificar si coincide la hora
          const horaClase = parseInt(clase.hora_inicio.split(':')[0]);
          return horaClase === hora;
        });
        
        return {
          hora,
          clases: clasesEnHora
        };
      });
      
      return {
        dia,
        horarios: horariosDelDia
      };
    });

    setCronogramas(cronogramaProcesado);
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
                  {especialidades.map((especialidad) => (
                    <MenuItem key={especialidad.id} value={especialidad.id}>
                      {especialidad.nombre}
                    </MenuItem>
                  ))}
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
                  {pedagogos.map((pedagogo) => (
                    <MenuItem key={pedagogo.id} value={pedagogo.id}>
                      {pedagogo.nombre_completo || `${pedagogo.nombre} ${pedagogo.apellido}`}
                    </MenuItem>
                  ))}
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
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Typography>Cargando cronograma...</Typography>
                </Box>
              )}
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
                          // Buscar el cronograma para este día
                          const cronogramaDia = cronogramas.find(c => c.dia === dia);
                          // Buscar el horario para esta hora específica
                          const horarioHora = cronogramaDia?.horarios?.find(h => h.hora === hora);
                          const clasesEnHora = horarioHora?.clases || [];
                          
                          return (
                            <TableCell key={dia} sx={{ p: 1, height: 60 }}>
                              {clasesEnHora.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  {clasesEnHora.slice(0, 2).map((clase, index) => (
                                    <Chip
                                      key={`${clase.id}-${index}`}
                                      size="small"
                                      label={clase.nombre_clase || clase.especialidad_nombre || 'Clase'}
                                      color={getHorarioColor(clase.especialidad_nombre)}
                                      sx={{
                                        width: '100%',
                                        height: clasesEnHora.length > 1 ? '20px' : '40px',
                                        fontSize: '0.65rem',
                                        '& .MuiChip-label': {
                                          fontSize: '0.65rem',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }
                                      }}
                                      onClick={() => {
                                        setSnackbar({
                                          open: true,
                                          message: `${clase.nombre_clase || 'Clase'} - ${clase.educador_nombre || 'Educador'}`,
                                          severity: 'info'
                                        });
                                      }}
                                    />
                                  ))}
                                  {clasesEnHora.length > 2 && (
                                    <Typography 
                                      variant="caption" 
                                      sx={{ fontSize: '0.6rem', textAlign: 'center', color: 'text.secondary' }}
                                    >
                                      +{clasesEnHora.length - 2} más
                                    </Typography>
                                  )}
                                </Box>
                              ) : null}
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
            <Card sx={{ overflow: 'hidden' }}>
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Typography>Cargando vista mensual...</Typography>
                </Box>
              )}
              
              {/* Header del mes */}
              <Box sx={{ p: 2, bgcolor: 'grey.50', textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                  {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </Typography>
              </Box>

              {/* Calendario mensual */}
              <Box sx={{ p: 2 }}>
                <Grid container spacing={1}>
                  {/* Días de la semana - Headers */}
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                    <Grid item xs={12/7} key={dia}>
                      <Box sx={{ 
                        p: 1, 
                        textAlign: 'center', 
                        fontWeight: 'bold', 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        borderRadius: 1,
                        mb: 1
                      }}>
                        <Typography variant="caption">{dia}</Typography>
                      </Box>
                    </Grid>
                  ))}
                  
                  {/* Días del mes */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const currentDate = new Date();
                    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    const startDate = new Date(firstDay);
                    startDate.setDate(startDate.getDate() - firstDay.getDay());
                    
                    const displayDate = new Date(startDate);
                    displayDate.setDate(startDate.getDate() + i);
                    
                    const isCurrentMonth = displayDate.getMonth() === currentDate.getMonth();
                    const isToday = displayDate.toDateString() === currentDate.toDateString();
                    
                    // Buscar clases para este día usando el cronograma semanal
                    const clasesDelDia = [];
                    
                    // Si tenemos datos del cronograma semanal, usarlos
                    if (cronogramas && cronogramas.length > 0) {
                      cronogramas.forEach(cronogramaDia => {
                        if (cronogramaDia.horarios) {
                          cronogramaDia.horarios.forEach(horario => {
                            if (horario.clases) {
                              horario.clases.forEach(clase => {
                                const fechaClase = new Date(clase.fecha_programada);
                                if (fechaClase.toDateString() === displayDate.toDateString()) {
                                  clasesDelDia.push(clase);
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                    
                    return (
                      <Grid item xs={12/7} key={i}>
                        <Box sx={{ 
                          minHeight: 80,
                          p: 1,
                          border: 1,
                          borderColor: isToday ? 'primary.main' : 'grey.200',
                          borderRadius: 1,
                          bgcolor: isCurrentMonth ? 'white' : 'grey.50',
                          opacity: isCurrentMonth ? 1 : 0.6,
                          position: 'relative'
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: isToday ? 'bold' : 'normal',
                              color: isToday ? 'primary.main' : 'inherit'
                            }}
                          >
                            {displayDate.getDate()}
                          </Typography>
                          
                          {/* Mostrar clases del día */}
                          {clasesDelDia.length > 0 && (
                            <Box sx={{ mt: 0.5 }}>
                              {clasesDelDia.slice(0, 2).map((clase, index) => (
                                <Chip
                                  key={`clase-${index}`}
                                  size="small"
                                  label={clase.nombre_clase || clase.tema_clase || 'Clase'}
                                  color={getHorarioColor(clase.especialidad_nombre)}
                                  sx={{
                                    fontSize: '0.6rem',
                                    height: '16px',
                                    mb: 0.2,
                                    width: '100%',
                                    '& .MuiChip-label': {
                                      fontSize: '0.6rem',
                                      padding: '0 4px'
                                    }
                                  }}
                                />
                              ))}
                              {clasesDelDia.length > 2 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{clasesDelDia.length - 2} más
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Resumen del mes */}
              <Box sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Resumen del mes:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total clases: <strong>{cronogramas.reduce((total, dia) => 
                        total + (dia.horarios?.reduce((sum, horario) => 
                          sum + (horario.clases?.length || 0), 0) || 0), 0)}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Sesiones activas: <strong>{sesiones.length}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Especialidades: <strong>{especialidades.length}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Pedagogos: <strong>{pedagogos.length}</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Card>
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