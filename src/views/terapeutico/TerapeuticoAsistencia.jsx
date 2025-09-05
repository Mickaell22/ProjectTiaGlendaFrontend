// src/views/terapeutico/TerapeuticoAsistencia.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Container, IconButton, Paper, Snackbar,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField,
  Tooltip, Typography, Alert, Grid, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Avatar, FormControl, InputLabel, Select, Switch,
  FormControlLabel, InputAdornment
} from '@mui/material';
import {
  CheckCircle, Cancel, Search, Visibility, Add, Edit, AccessTime,
  Person, Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import sesionTerapiaService from 'src/services/SesionTerapiaService';
import { formatDateLocal } from 'src/utils/dateUtils';

/* ---------- Estilos tipo "listar" ---------- */
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

// Evita “saltos” al seleccionar y trunca texto largo
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

const TerapeuticoAsistencia = () => {
  const [sesiones, setSesiones] = useState([]);
  const [cronogramas, setCronogramas] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [selectedSesion, setSelectedSesion] = useState('');
  const [selectedCronograma, setSelectedCronograma] = useState('');
  const [pacientesSesion, setPacientesSesion] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsistio, setFilterAsistio] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [asistenciaDialog, setAsistenciaDialog] = useState({ open: false, data: null, isEdit: false });
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asistio: false,
    llegada_tardanza_minutos: 0,
    observaciones_terapeuta: '',
    progreso_observado: '',
    tareas_asignadas: '',
    objetivos_trabajados: ''
  });
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
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const fetchCronogramas = async (sesionId) => {
    try {
      const [cronogramasRes, pacientesRes] = await Promise.all([
        sesionTerapiaService.getCronograma(sesionId),
        sesionTerapiaService.getPacientesSesion(sesionId)
      ]);

      const allCronogramas = cronogramasRes.data || [];
      setCronogramas(allCronogramas);
      setPacientesSesion(pacientesRes.data || []);

      // Opcional debug de asistencias por sesión
      try { await sesionTerapiaService.getAsistenciasSession(sesionId); } catch {}
    } catch (err) {
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      setCronogramas([]);
      setPacientesSesion([]);
    }
  };

  const fetchAsistencias = async (cronogramaId) => {
    if (!cronogramaId) {
      console.warn('fetchAsistencias called without cronogramaId');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Fetching asistencias for cronograma:', cronogramaId);
      console.log('📝 Current pacientes in session:', pacientesSesion.length);
      
      // Get REAL asistencias (not cronograma data) for the session
      console.log('🔄 Using sesion ID for asistencias:', selectedSesion);
      const response = await sesionTerapiaService.getAsistencias(selectedSesion);
      console.log('📥 Asistencias cronograma raw response:', response);
      
      // Extract data from response with more robust error handling
      let allAsistenciasData = [];
      try {
        if (response?.data?.data) {
          // Response wrapped in { data: { data: [...] } }
          allAsistenciasData = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (response?.data) {
          // Response wrapped in { data: [...] }
          allAsistenciasData = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
          // Direct array response
          allAsistenciasData = response;
        }
      } catch (extractError) {
        console.warn('Error extracting asistencias data:', extractError);
        allAsistenciasData = [];
      }
      
      // Filter asistencias for the specific cronograma
      console.log('🔍 Filtering asistencias for cronograma ID:', cronogramaId);
      console.log('📊 Total asistencias from session:', allAsistenciasData.length);
      
      let asistenciasData = allAsistenciasData.filter(asistencia => {
        const matchesCronograma = asistencia.cronograma_id == cronogramaId || 
                                  asistencia.id_cronograma == cronogramaId;
        console.log(`   Asistencia ${asistencia.id}: cronograma_id=${asistencia.cronograma_id}, id_cronograma=${asistencia.id_cronograma}, matches=${matchesCronograma}`);
        return matchesCronograma;
      });
      
      console.log('✅ Filtered asistencias for this cronograma:', asistenciasData.length);
      
      console.log('📊 Extracted asistencias data count:', asistenciasData.length);
      
      // Normalize data to ensure consistent field names
      asistenciasData = asistenciasData.map(asistencia => {
        const normalized = {
          ...asistencia,
          // Ensure both id_paciente and paciente_id exist for consistency
          id_paciente: asistencia.id_paciente || asistencia.paciente_id,
          paciente_id: asistencia.paciente_id || asistencia.id_paciente,
          // Ensure proper boolean conversion for asistio field, preserving null/undefined
          asistio: asistencia.asistio === null || asistencia.asistio === undefined 
            ? asistencia.asistio 
            : (asistencia.asistio === true || asistencia.asistio === 'true' || asistencia.asistio === 1 || asistencia.asistio === '1'),
          es_placeholder: false
        };
        
        console.log('✅ Normalized asistencia completa:', {
          id: normalized.id,
          paciente_id: normalized.paciente_id,
          paciente_nombre: normalized.paciente_nombre,
          asistio: normalized.asistio,
          llegada_tardanza_minutos: normalized.llegada_tardanza_minutos,
          observaciones_terapeuta: normalized.observaciones_terapeuta,
          progreso_observado: normalized.progreso_observado,
          tareas_asignadas: normalized.tareas_asignadas,
          objetivos_trabajados: normalized.objetivos_trabajados,
          es_placeholder: normalized.es_placeholder
        });
        
        return normalized;
      });
      
      console.log('📋 Final normalized asistencias:', asistenciasData.length);
      
      // Set the data immediately
      setAsistencias(asistenciasData);
      
      // Create placeholders if needed
      let placeholderAsistencias = [];
      if (asistenciasData.length === 0 && pacientesSesion.length > 0) {
        console.log('📝 No asistencias found, creating placeholders for', pacientesSesion.length, 'patients');
        
        placeholderAsistencias = pacientesSesion.map(paciente => {
          const patientId = paciente.paciente_id || paciente.id;
          const placeholder = {
            cronograma_id: parseInt(cronogramaId),
            paciente_id: patientId,
            id_paciente: patientId,
            paciente_nombre: paciente.paciente_nombre || paciente.nombre || paciente.nombre_completo,
            paciente_cedula: paciente.paciente_cedula || paciente.cedula,
            asistio: null,
            fecha_asistencia: null,
            observaciones_terapeuta: null,
            progreso_observado: null,
            es_placeholder: true
          };
          
          console.log('📋 Created placeholder for:', placeholder.paciente_nombre, 'ID:', patientId);
          return placeholder;
        });
        
        setAsistencias(placeholderAsistencias);
        console.log('📋 Set', placeholderAsistencias.length, 'placeholder asistencias');
      }
      
      // Log final state before and after setting
      const finalData = asistenciasData.length > 0 ? asistenciasData : placeholderAsistencias;
      console.log('✅ fetchAsistencias completed successfully');
      console.log('📊 DATOS FINALES QUE SE ESTÁN ENVIANDO AL ESTADO:', finalData.map(a => ({
        id: a.id,
        paciente_id: a.paciente_id || a.id_paciente,
        paciente_nombre: a.paciente_nombre,
        asistio: a.asistio,
        asistio_type: typeof a.asistio,
        es_placeholder: a.es_placeholder
      })));
      
    } catch (err) {
      console.error('❌ Error fetching asistencias:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = sesionTerapiaService.handleError(err);
      setSnackbar({ open: true, message: `Error al cargar asistencias: ${errorMessage}`, severity: 'error' });
      setAsistencias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSesionChange = (event) => {
    const sesionId = event.target.value;
    setSelectedSesion(sesionId);
    setSelectedCronograma('');
    setAsistencias([]);
    if (sesionId) fetchCronogramas(sesionId);
    else {
      setCronogramas([]);
      setPacientesSesion([]);
    }
  };

  const handleCronogramaChange = (event) => {
    const cronogramaId = event.target.value;
    setSelectedCronograma(cronogramaId);
    if (cronogramaId) fetchAsistencias(cronogramaId);
    else setAsistencias([]);
  };

  const handleRegistrarAsistencia = (paciente) => {
    setFormData({
      asistio: false,
      llegada_tardanza_minutos: 0,
      observaciones_terapeuta: '',
      progreso_observado: '',
      tareas_asignadas: '',
      objetivos_trabajados: ''
    });
    setAsistenciaDialog({
      open: true,
      data: { paciente, cronograma_id: selectedCronograma },
      isEdit: false
    });
  };

  const handleEditarAsistencia = (asistencia) => {
    console.log('🔧 EDITANDO ASISTENCIA:', asistencia);
    console.log('📋 Cronograma seleccionado actual:', selectedCronograma);
    
    setFormData({
      asistio: asistencia.asistio || false,
      llegada_tardanza_minutos: asistencia.llegada_tardanza_minutos || 0,
      observaciones_terapeuta: asistencia.observaciones_terapeuta || '',
      progreso_observado: asistencia.progreso_observado || '',
      tareas_asignadas: asistencia.tareas_asignadas || '',
      objetivos_trabajados: asistencia.objetivos_trabajados || ''
    });
    
    // CRITICAL FIX: Ensure cronograma_id is available for edit mode
    const editData = {
      ...asistencia,
      // Add cronograma_id from the current selection if not present in asistencia
      cronograma_id: asistencia.cronograma_id || selectedCronograma,
      // Also ensure paciente data is structured consistently
      paciente: {
        paciente_id: asistencia.paciente_id || asistencia.id_paciente,
        id: asistencia.paciente_id || asistencia.id_paciente,
        paciente_nombre: asistencia.paciente_nombre,
        paciente_cedula: asistencia.paciente_cedula
      }
    };
    
    console.log('📝 Datos preparados para edición:', editData);
    
    setAsistenciaDialog({
      open: true,
      data: editData,
      isEdit: true
    });
  };

  const handleSubmitAsistencia = async () => {
    try {
      console.log('=== INICIO PROCESO ASISTENCIA ===');
      console.log('📋 Dialog data completo:', JSON.stringify(asistenciaDialog.data, null, 2));
      console.log('🔄 Es edición:', asistenciaDialog.isEdit);
      console.log('📍 Cronograma seleccionado:', selectedCronograma);
      
      // Extract data with robust fallbacks
      const dialogData = asistenciaDialog.data;
      const paciente = dialogData.paciente || dialogData;
      
      // Extract cronograma_id with multiple fallbacks
      const cronograma_id = dialogData.cronograma_id || 
                           dialogData.cronograma_clase_id || 
                           selectedCronograma;
                           
      // Extract paciente_id with multiple fallbacks
      const pacienteId = paciente?.paciente_id || 
                        paciente?.id || 
                        dialogData.paciente_id || 
                        dialogData.id_paciente;

      console.log('=== EXTRACCIÓN DE DATOS ===');
      console.log('🆔 Paciente ID extraído:', pacienteId);
      console.log('📅 Cronograma ID extraído:', cronograma_id);
      console.log('🔑 Token JWT presente:', localStorage.getItem('jwt_token') ? '✅' : '❌');
      console.log('👤 Datos del paciente:', paciente);

      // Validation with detailed error messages
      if (!pacienteId) {
        console.error('❌ Error: No se pudo extraer paciente_id');
        console.error('Datos disponibles:', { dialogData, paciente, selectedCronograma });
        setSnackbar({ open: true, message: 'Error: No se pudo identificar el paciente. Revisa la consola para detalles.', severity: 'error' });
        return;
      }

      if (!cronograma_id) {
        console.error('❌ Error: No se pudo extraer cronograma_id');
        console.error('Datos disponibles:', { dialogData, selectedCronograma });
        setSnackbar({ open: true, message: 'Error: No se pudo identificar la sesión del cronograma. Asegúrate de tener una fecha seleccionada.', severity: 'error' });
        return;
      }

      const asistenciaData = {
        asistio: formData.asistio,
        llegada_tardanza_minutos: parseInt(formData.llegada_tardanza_minutos) || 0,
        observaciones_terapeuta: formData.observaciones_terapeuta?.trim() || null,
        progreso_observado: formData.progreso_observado?.trim() || null,
        tareas_asignadas: formData.tareas_asignadas?.trim() || null,
        objetivos_trabajados: formData.objetivos_trabajados?.trim() || null
      };

      console.log('=== DATOS COMPLETOS A ENVIAR ===');
      console.log('📋 Form Data Original:', JSON.stringify(formData, null, 2));
      console.log('📦 Asistencia Data Procesado:', JSON.stringify(asistenciaData, null, 2));
      console.log('🔍 Campos específicos:', {
        observaciones_terapeuta: asistenciaData.observaciones_terapeuta,
        progreso_observado: asistenciaData.progreso_observado,
        tareas_asignadas: asistenciaData.tareas_asignadas,
        objetivos_trabajados: asistenciaData.objetivos_trabajados,
        llegada_tardanza_minutos: asistenciaData.llegada_tardanza_minutos
      });

      let response;
      if (asistenciaDialog.isEdit) {
        console.log('📝 Ejecutando UPDATE asistencia...');
        response = await sesionTerapiaService.updateAsistencia(cronograma_id, pacienteId, asistenciaData);
        console.log('📥 Respuesta UPDATE completa:', JSON.stringify(response, null, 2));
        setSnackbar({ open: true, message: 'Asistencia actualizada correctamente', severity: 'success' });
      } else {
        console.log('➕ Ejecutando REGISTRAR asistencia...');
        response = await sesionTerapiaService.registrarAsistencia(cronograma_id, pacienteId, asistenciaData);
        console.log('📥 Respuesta REGISTRAR completa:', JSON.stringify(response, null, 2));
        setSnackbar({ open: true, message: 'Asistencia registrada correctamente', severity: 'success' });
      }

      // Cerrar diálogo ANTES de refrescar datos
      setAsistenciaDialog({ open: false, data: null, isEdit: false });
      
      console.log('=== POST-SUBMIT REFRESH ===');
      console.log('Cronograma seleccionado para refresh:', selectedCronograma);
      console.log('Sesión seleccionada para refresh:', selectedSesion);
      
      // Forzar refresh completo de datos con pequeño delay para asegurar consistencia
      console.log('🔄 Iniciando refresh de asistencias...');
      setTimeout(async () => {
        try {
          // Limpiar estado actual primero
          setLoading(true);
          setAsistencias([]);
          
          // Refrescar asistencias
          await fetchAsistencias(selectedCronograma);
          
          // Refrescar cronogramas si es necesario 
          if (selectedSesion) {
            console.log('🔄 Refrescando cronogramas también...');
            await fetchCronogramas(selectedSesion);
          }
          
          console.log('✅ Refresh completado exitosamente');
        } catch (refreshError) {
          console.error('❌ Error durante el refresh:', refreshError);
        }
      }, 500); // 500ms delay para asegurar que el backend procesó el cambio
      
    } catch (error) {
      console.error('❌ ERROR AL GUARDAR ASISTENCIA:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      });
      
      const errorMessage = sesionTerapiaService.handleError(error);
      setSnackbar({ open: true, message: `Error: ${errorMessage}`, severity: 'error' });
    }
  };

  const handleViewDetail = (item) => setDetailDialog({ open: true, data: item });

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
  const getCronogramaInfo = (cronogramaId) => cronogramas.find(c => c.id === parseInt(cronogramaId));
  const getPacienteAsistencia = (pacienteId) => asistencias.find(a => a.id_paciente === pacienteId || a.paciente_id === pacienteId);

  const filteredAsistencias = asistencias.filter(a => {
    const matchesSearch = (
      a.paciente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.observaciones_terapeuta?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    let matchesAsistio = true;
    if (filterAsistio !== '') matchesAsistio = filterAsistio === 'true' ? a.asistio : !a.asistio;
    return matchesSearch && matchesAsistio;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>

      {/* Card de selección (header degradado estilo listar) */}
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
              <Assignment sx={{ mr: 1 }} />
              Registro de Asistencias
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Selecciona una sesión y una fecha para gestionar asistencias
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
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
                    return s ? `${s.titulo}` : 'Seleccione una sesión';
                  }}
                >
                  <MenuItem value="">Seleccione una sesión</MenuItem>
                  {sesiones.map((sesion) => (
                    <MenuItem key={sesion.id} value={sesion.id}>
                      {`${sesion.titulo}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!selectedSesion}>
                <InputLabel shrink>Fecha de Sesión</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...purpleOutlineSX }}
                  value={selectedCronograma}
                  onChange={handleCronogramaChange}
                  label="Fecha de Sesión"
                  displayEmpty
                  MenuProps={menuProps}
                  renderValue={(val) => {
                    if (!val) return cronogramas.length === 0 ? 'No hay sesiones disponibles para registro' : 'Seleccione una fecha';
                    const c = cronogramas.find(x => String(x.id) === String(val));
                    return c ? `Sesión ${c.numero_sesion} - ${formatDate(c.fecha_programada)} ${formatTime(c.hora_programada)}` : 'Seleccione una fecha';
                  }}
                >
                  <MenuItem value="">
                    {cronogramas.length === 0 ? 'No hay sesiones disponibles para registro' : 'Seleccione una fecha'}
                  </MenuItem>
                  {cronogramas.map((cronograma) => (
                    <MenuItem key={cronograma.id} value={cronograma.id}>
                      {`Sesión ${cronograma.numero_sesion} - ${formatDate(cronograma.fecha_programada)} ${formatTime(cronograma.hora_programada)}`}
                    </MenuItem>
                  ))}
                  {cronogramas.length === 0 && selectedSesion && (
                    <MenuItem disabled>Solo se puede registrar asistencia para fechas pasadas o de hoy</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {selectedSesion && selectedCronograma && getSesionInfo(selectedSesion) && getCronogramaInfo(selectedCronograma) && (
            <Paper sx={{ mt: 3, p: 2, backgroundColor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">Sesión:</Typography>
                  <Typography variant="body2">{getSesionInfo(selectedSesion).titulo}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">Fecha:</Typography>
                  <Typography variant="body2">{formatDate(getCronogramaInfo(selectedCronograma).fecha_programada)}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">Hora:</Typography>
                  <Typography variant="body2">{formatTime(getCronogramaInfo(selectedCronograma).hora_programada)}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2">Terapeuta:</Typography>
                  <Typography variant="body2">{getSesionInfo(selectedSesion).terapeuta_nombre}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Card de listado de asistencias (header degradado) */}
      {selectedSesion && selectedCronograma ? (
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
                <Assignment sx={{ mr: 1 }} />
                Control de Asistencia
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {pacientesSesion.length} paciente{pacientesSesion.length !== 1 ? 's' : ''} en esta sesión
              </Typography>
            </Box>

            <Chip
              label={`${filteredAsistencias.length} registro${filteredAsistencias.length !== 1 ? 's' : ''}`}
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
                placeholder="Buscar por paciente u observaciones…"
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
                <InputLabel shrink>Filtrar por asistencia</InputLabel>
                <Select
                  sx={{ ...selectStableSX, ...purpleOutlineSX }}
                  value={filterAsistio}
                  onChange={(e) => setFilterAsistio(e.target.value)}
                  label="Filtrar por asistencia"
                  displayEmpty
                  MenuProps={menuProps}
                  renderValue={(val) => (val === '' ? 'Todos' : val === 'true' ? 'Asistió' : 'No Asistió')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Asistió</MenuItem>
                  <MenuItem value="false">No Asistió</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Typography>Cargando asistencias...</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Paciente</TableCell>
                        <TableCell>Asistencia</TableCell>
                        <TableCell>Tardanza</TableCell>
                        <TableCell>Observaciones</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pacientesSesion.map((paciente) => {
                        const pacienteId = paciente.paciente_id || paciente.id;
                        const asistencia = getPacienteAsistencia(pacienteId);
                        return (
                          <TableRow key={pacienteId}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ mr: 2, bgcolor: '#7e57c2' }}>
                                  <Person />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {paciente.paciente_nombre || paciente.nombre_completo}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {paciente.paciente_cedula || paciente.cedula}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                // Debug básico para verificar funcionamiento
                                if (!asistencia) {
                                  console.log('❌ No asistencia found for patient:', pacienteId);
                                }
                                
                                if (!asistencia || asistencia.es_placeholder) {
                                  return <Chip label="Sin Registro" color="default" size="small" />;
                                }
                                
                                // Verificación del valor de asistencia
                                const asistioValue = asistencia.asistio;
                                
                                if (asistioValue === null || asistioValue === undefined) {
                                  return <Chip label="Pendiente" color="warning" size="small" />;
                                }
                                
                                const hasAsistido = asistioValue === true;
                                
                                return (
                                  <Chip
                                    label={hasAsistido ? 'Asistió' : 'No Asistió'}
                                    color={hasAsistido ? 'success' : 'error'}
                                    size="small"
                                    icon={hasAsistido ? <CheckCircle /> : <Cancel />}
                                  />
                                );
                              })()}
                            </TableCell>
                            <TableCell>
                              {asistencia && !asistencia.es_placeholder && asistencia.llegada_tardanza_minutos ? (
                                <Typography variant="body2" color="warning.main">
                                  {asistencia.llegada_tardanza_minutos} min
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap title={(asistencia && !asistencia.es_placeholder) ? asistencia.observaciones_terapeuta || '-' : '-'}>
                                {(asistencia && !asistencia.es_placeholder) ? asistencia.observaciones_terapeuta || '-' : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {asistencia && !asistencia.es_placeholder ? (
                                  <>
                                    <Tooltip title="Ver detalles">
                                      <IconButton color="info" size="small" onClick={() => handleViewDetail(asistencia)}>
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Editar asistencia">
                                      <IconButton color="primary" size="small" onClick={() => handleEditarAsistencia(asistencia)}>
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                ) : (
                                  <Tooltip title="Registrar asistencia">
                                    <IconButton color="success" size="small" onClick={() => handleRegistrarAsistencia(paciente)}>
                                      <Add fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>

                <TablePagination
                  component="div"
                  count={filteredAsistencias.length || asistencias.length || pacientesSesion.length}
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
              <Assignment sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={1}>
                Seleccione una Sesión y Fecha
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Para registrar asistencias, seleccione una sesión terapéutica y una fecha específica
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Dialog Registrar/Editar asistencia (lógica igual) */}
      <Dialog
        open={asistenciaDialog.open}
        onClose={() => setAsistenciaDialog({ open: false, data: null, isEdit: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {asistenciaDialog.isEdit ? 'Editar Asistencia' : 'Registrar Asistencia'}
        </DialogTitle>
        <DialogContent>
          {asistenciaDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" mb={2}>
                  Paciente: {asistenciaDialog.data.paciente?.paciente_nombre || asistenciaDialog.data.paciente_nombre}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.asistio}
                      onChange={(e) => setFormData(prev => ({ ...prev, asistio: e.target.checked }))}
                      color="success"
                    />
                  }
                  label="Asistió a la sesión"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minutos de tardanza"
                  value={formData.llegada_tardanza_minutos}
                  onChange={(e) => setFormData(prev => ({ ...prev, llegada_tardanza_minutos: e.target.value }))}
                  inputProps={{ min: 0 }}
                  disabled={!formData.asistio}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Observaciones del Terapeuta"
                  value={formData.observaciones_terapeuta}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones_terapeuta: e.target.value }))}
                  placeholder="Observaciones sobre la asistencia..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Progreso Observado"
                  value={formData.progreso_observado}
                  onChange={(e) => setFormData(prev => ({ ...prev, progreso_observado: e.target.value }))}
                  placeholder="Notas sobre el progreso del paciente en esta sesión..."
                  disabled={!formData.asistio}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Tareas Asignadas"
                  value={formData.tareas_asignadas}
                  onChange={(e) => setFormData(prev => ({ ...prev, tareas_asignadas: e.target.value }))}
                  placeholder="Tareas o ejercicios asignados para casa..."
                  disabled={!formData.asistio}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Objetivos Trabajados"
                  value={formData.objetivos_trabajados}
                  onChange={(e) => setFormData(prev => ({ ...prev, objetivos_trabajados: e.target.value }))}
                  placeholder="Objetivos para las próximas sesiones..."
                  disabled={!formData.asistio}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAsistenciaDialog({ open: false, data: null, isEdit: false })}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSubmitAsistencia}>
            {asistenciaDialog.isEdit ? 'Actualizar' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de detalles (lógica igual) */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Assignment sx={{ mr: 2 }} />
            Detalles de Asistencia
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.data && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información del Paciente</Typography>
                <Typography variant="body2"><strong>Nombre:</strong> {detailDialog.data.paciente_nombre}</Typography>
                <Typography variant="body2"><strong>Cédula:</strong> {detailDialog.data.paciente_cedula}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información de Asistencia</Typography>
                <Typography variant="body2" display="flex" alignItems="center">
                  <strong>Estado:</strong>
                  <Chip
                    label={detailDialog.data.asistio ? 'Asistió' : 'No Asistió'}
                    color={detailDialog.data.asistio ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                {detailDialog.data.llegada_tardanza_minutos > 0 && (
                  <Typography variant="body2"><strong>Tardanza:</strong> {detailDialog.data.llegada_tardanza_minutos} minutos</Typography>
                )}
              </Grid>

              {detailDialog.data.observaciones_terapeuta && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Observaciones del Terapeuta</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="body2">{detailDialog.data.observaciones_terapeuta}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.progreso_observado && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Progreso Observado</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                    <Typography variant="body2">{detailDialog.data.progreso_observado}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.tareas_asignadas && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Tareas Asignadas</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                    <Typography variant="body2">{detailDialog.data.tareas_asignadas}</Typography>
                  </Paper>
                </Grid>
              )}

              {detailDialog.data.objetivos_trabajados && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary">Objetivos Trabajados</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                    <Typography variant="body2">{detailDialog.data.objetivos_trabajados}</Typography>
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

export default TerapeuticoAsistencia;
