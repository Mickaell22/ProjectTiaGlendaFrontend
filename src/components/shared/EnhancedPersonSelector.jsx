import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  InputAdornment,
  MenuItem,
  Autocomplete,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search,
  Person,
  Clear,
  Add,
  Edit,
  School,
  LocalHospital,
  SupervisorAccount,
  Phone,
  Email,
  Badge,
  CheckCircle,
  Warning,
  PersonAdd,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ApiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../config/api';

const EnhancedPersonSelector = ({
  // Configuración básica
  selectedPerson,
  onPersonSelect,
  onClear,
  label = "Persona",
  placeholder = "Buscar y seleccionar persona",
  required = false,
  error = "",
  disabled = false,

  // Configuración de búsqueda
  searchTypes = ['personas'], // ['personas', 'tutores', 'personal', 'pacientes']
  filterOptions = {}, // { especialidad_id: 1, activo: true, etc. }
  excludeIds = [], // IDs a excluir de la búsqueda
  showCreateButton = false,
  onCreateNew = null,

  // Configuración visual
  variant = 'outlined', // 'outlined', 'filled', 'standard'
  size = 'medium', // 'small', 'medium', 'large'
  showAvatar = true,
  showChips = true,
  maxWidth = 'md',

  // Configuración avanzada
  enableQuickActions = true,
  showRecentSelections = true,
  enableFavorites = false,
  contextInfo = true, // Mostrar información contextual adicional

  // Props específicas del tipo de búsqueda
  hideRegisteredPatients = false,
  editingPatientId = null,
  roleFilter = null, // Para filtrar personal por rol
  especialidadFilter = null, // Para filtrar por especialidad
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [recentSelections, setRecentSelections] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Cargar datos cuando se abre el selector
  useEffect(() => {
    if (open) {
      loadData();
      loadRecentSelections();
    }
  }, [open, searchTypes, filterOptions]);

  // Filtrar datos cuando cambia el término de búsqueda
  useEffect(() => {
    filterData();
  }, [data, searchTerm, excludeIds]);

  const loadData = async () => {
    try {
      setLoading(true);
      const allData = [];

      for (const type of searchTypes) {
        let endpoint;
        let transformer = (item) => ({ ...item, sourceType: type });

        switch (type) {
          case 'personas':
            endpoint = API_ENDPOINTS.PERSONAS.BASE;
            transformer = (item) => ({
              ...item,
              sourceType: 'persona',
              displayName: `${item.nombre} ${item.apellido}`,
              avatar: getPersonAvatar(item),
              contextInfo: getPersonContextInfo(item)
            });
            break;
          case 'tutores':
            endpoint = API_ENDPOINTS.TUTORES.BASE;
            transformer = (item) => ({
              ...item,
              sourceType: 'tutor',
              displayName: item.nombre_completo || `${item.nombre || ''} ${item.apellido || ''}`.trim(),
              avatar: getTutorAvatar(item),
              contextInfo: getTutorContextInfo(item)
            });
            break;
          case 'personal':
            endpoint = API_ENDPOINTS.PERSONAL.BASE;
            transformer = (item) => ({
              ...item,
              sourceType: 'personal',
              displayName: item.nombre_completo || `${item.nombre || ''} ${item.apellido || ''}`.trim(),
              avatar: getPersonalAvatar(item),
              contextInfo: getPersonalContextInfo(item)
            });
            break;
          case 'pacientes':
            endpoint = API_ENDPOINTS.PACIENTES.BASE;
            transformer = (item) => ({
              ...item,
              sourceType: 'paciente',
              displayName: item.nombre_completo || 'Paciente sin nombre',
              avatar: getPacienteAvatar(item),
              contextInfo: getPacienteContextInfo(item)
            });
            break;
          default:
            continue;
        }

        const response = await ApiService.get(endpoint);
        if (response.data?.data) {
          const transformedData = response.data.data.map(transformer);
          allData.push(...transformedData);
        }
      }

      // Aplicar filtros específicos
      let filteredAllData = allData;

      // Filtro por IDs excluidos
      if (excludeIds.length > 0) {
        filteredAllData = filteredAllData.filter(item => !excludeIds.includes(item.id));
      }

      // Filtros específicos por opciones
      Object.keys(filterOptions).forEach(key => {
        const value = filterOptions[key];
        if (value !== null && value !== undefined) {
          filteredAllData = filteredAllData.filter(item => item[key] === value);
        }
      });

      // Filtro especial para pacientes registrados
      if (hideRegisteredPatients && searchTypes.includes('personas')) {
        const pacientesResponse = await ApiService.get(API_ENDPOINTS.PACIENTES.BASE);
        const pacientesIds = pacientesResponse.data?.data?.map(p => p.persona_id) || [];
        filteredAllData = filteredAllData.filter(item => {
          if (item.sourceType === 'persona') {
            // Permitir si es el paciente que se está editando
            if (editingPatientId) {
              const editingPersonaId = data.find(p => p.id === editingPatientId)?.persona_id;
              if (editingPersonaId === item.id) return true;
            }
            return !pacientesIds.includes(item.id);
          }
          return true;
        });
      }

      setData(filteredAllData);
    } catch (error) {
      console.error('Error loading data:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = data.filter(item =>
      item.displayName?.toLowerCase().includes(term) ||
      item.cedula?.includes(term) ||
      item.telefono?.includes(term) ||
      item.correo?.toLowerCase().includes(term) ||
      item.especialidad_nombre?.toLowerCase().includes(term) ||
      item.titulo_profesional?.toLowerCase().includes(term)
    );

    setFilteredData(filtered);
  };

  const loadRecentSelections = () => {
    if (!showRecentSelections) return;

    try {
      const stored = localStorage.getItem(`recentSelections_${label}`);
      if (stored) {
        setRecentSelections(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent selections:', error);
    }
  };

  const saveRecentSelection = (person) => {
    if (!showRecentSelections) return;

    try {
      const updated = [
        person,
        ...recentSelections.filter(r => r.id !== person.id)
      ].slice(0, 5); // Mantener solo los últimos 5

      setRecentSelections(updated);
      localStorage.setItem(`recentSelections_${label}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent selection:', error);
    }
  };

  const handleSelect = (person) => {
    onPersonSelect(person);
    saveRecentSelection(person);
    setOpen(false);
    setSearchTerm('');
    setSnackbar({
      open: true,
      message: `${person.displayName} seleccionado`,
      severity: 'success'
    });
  };

  const handleClear = () => {
    onClear();
    setSnackbar({
      open: true,
      message: 'Selección limpiada',
      severity: 'info'
    });
  };

  const handleCreateNew = () => {
    setOpen(false);
    if (onCreateNew) {
      onCreateNew();
    }
  };

  // Funciones auxiliares para avatares y contexto
  const getPersonAvatar = (person) => {
    return person.nombre ? person.nombre[0].toUpperCase() : 'P';
  };

  const getTutorAvatar = (tutor) => {
    return tutor.nombre ? tutor.nombre[0].toUpperCase() : 'T';
  };

  const getPersonalAvatar = (personal) => {
    return personal.nombre ? personal.nombre[0].toUpperCase() : 'S';
  };

  const getPacienteAvatar = (paciente) => {
    return paciente.nombre_completo ? paciente.nombre_completo[0].toUpperCase() : 'P';
  };

  const getPersonContextInfo = (person) => {
    const info = [];
    if (person.telefono) info.push(`📞 ${person.telefono}`);
    if (person.correo) info.push(`📧 ${person.correo}`);
    return info.join(' • ');
  };

  const getTutorContextInfo = (tutor) => {
    const info = [];
    if (tutor.telefono) info.push(`📞 ${tutor.telefono}`);
    if (tutor.relacion) info.push(`👥 ${tutor.relacion}`);
    return info.join(' • ');
  };

  const getPersonalContextInfo = (personal) => {
    const info = [];
    if (personal.especialidad_nombre) info.push(`🏥 ${personal.especialidad_nombre}`);
    if (personal.titulo_profesional) info.push(`🎓 ${personal.titulo_profesional}`);
    return info.join(' • ');
  };

  const getPacienteContextInfo = (paciente) => {
    const info = [];
    if (paciente.fecha_nacimiento) {
      const edad = new Date().getFullYear() - new Date(paciente.fecha_nacimiento).getFullYear();
      info.push(`👶 ${edad} años`);
    }
    if (paciente.estado) info.push(`📋 ${paciente.estado}`);
    return info.join(' • ');
  };

  const getSourceTypeChip = (sourceType) => {
    const config = {
      persona: { icon: <Person />, label: 'Persona', color: 'primary' },
      tutor: { icon: <SupervisorAccount />, label: 'Tutor', color: 'secondary' },
      personal: { icon: <LocalHospital />, label: 'Personal', color: 'success' },
      paciente: { icon: <School />, label: 'Paciente', color: 'info' }
    };

    const { icon, label, color } = config[sourceType] || config.persona;

    return (
      <Chip
        icon={icon}
        label={label}
        size="small"
        color={color}
        variant="outlined"
      />
    );
  };

  const getSelectedPersonCard = () => (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
        color: 'white',
        border: `2px solid ${theme.palette.success.main}`
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {showAvatar && (
            <Grid item>
              <Avatar
                sx={{
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  width: 48,
                  height: 48,
                  fontSize: '1.2rem'
                }}
              >
                {selectedPerson.displayName?.[0] || selectedPerson.nombre?.[0] || 'P'}
              </Avatar>
            </Grid>
          )}
          <Grid item xs>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              {selectedPerson.displayName || `${selectedPerson.nombre} ${selectedPerson.apellido}`}
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
              {selectedPerson.cedula && `Cédula: ${selectedPerson.cedula}`}
            </Typography>
            {contextInfo && selectedPerson.contextInfo && (
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, mt: 0.5 }}>
                {selectedPerson.contextInfo}
              </Typography>
            )}
            {showChips && selectedPerson.sourceType && (
              <Box sx={{ mt: 1 }}>
                {getSourceTypeChip(selectedPerson.sourceType)}
              </Box>
            )}
          </Grid>
          <Grid item>
            <Box display="flex" gap={1}>
              {enableQuickActions && (
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    sx={{ color: 'white' }}
                    onClick={() => {/* Implementar edición */}}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Cambiar selección">
                <IconButton
                  size="small"
                  sx={{ color: 'white' }}
                  onClick={() => setOpen(true)}
                >
                  <Search />
                </IconButton>
              </Tooltip>
              <Tooltip title="Limpiar selección">
                <IconButton
                  size="small"
                  sx={{ color: 'white' }}
                  onClick={handleClear}
                >
                  <Clear />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const getEmptySelector = () => (
    <Button
      fullWidth
      variant={variant}
      size={size === 'small' ? 'medium' : 'large'}
      onClick={() => setOpen(true)}
      disabled={disabled}
      startIcon={<Search />}
      sx={{
        py: size === 'large' ? 3 : size === 'medium' ? 2 : 1.5,
        borderStyle: error ? 'solid' : 'dashed',
        borderColor: error ? 'error.main' : 'primary.main',
        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
        '&:hover': {
          borderStyle: 'solid',
          backgroundColor: 'action.hover'
        }
      }}
    >
      {placeholder}
    </Button>
  );

  const displayData = searchTerm.trim() ? filteredData : data;

  return (
    <Box>
      {/* Label */}
      <Typography variant="body1" mb={1} fontWeight={required ? 'bold' : 'normal'}>
        {label}{required && ' *'}
      </Typography>

      {/* Selector Display */}
      {selectedPerson ? getSelectedPersonCard() : getEmptySelector()}

      {/* Error Message */}
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}

      {/* Selection Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth={maxWidth}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Search color="primary" />
              <Typography variant="h6">Seleccionar {label}</Typography>
            </Box>
            <Box display="flex" gap={1}>
              {showCreateButton && onCreateNew && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PersonAdd />}
                  onClick={handleCreateNew}
                  color="success"
                >
                  Crear Nuevo
                </Button>
              )}
              <IconButton onClick={loadData} disabled={loading}>
                <Refresh />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          {/* Search Input */}
          <TextField
            fullWidth
            placeholder="Buscar por nombre, cédula, teléfono, correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          {/* Recent Selections */}
          {showRecentSelections && recentSelections.length > 0 && !searchTerm.trim() && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Selecciones Recientes
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {recentSelections.map((recent, index) => (
                  <Chip
                    key={index}
                    label={recent.displayName || recent.nombre}
                    onClick={() => handleSelect(recent)}
                    variant="outlined"
                    size="small"
                    color="primary"
                  />
                ))}
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          )}

          {/* Loading State */}
          {loading && (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          )}

          {/* Results */}
          {!loading && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Resultados ({displayData.length})
              </Typography>

              {displayData.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <Typography color="text.secondary">
                    {searchTerm.trim() ? 'No se encontraron resultados' : 'No hay datos disponibles'}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {displayData.map((item, index) => (
                    <Card
                      key={`${item.sourceType}-${item.id}-${index}`}
                      elevation={1}
                      sx={{
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          elevation: 3,
                          backgroundColor: 'action.hover'
                        }
                      }}
                      onClick={() => handleSelect(item)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          {showAvatar && (
                            <Grid item>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {item.avatar}
                              </Avatar>
                            </Grid>
                          )}
                          <Grid item xs>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <Typography variant="body1" fontWeight="medium">
                                {item.displayName}
                              </Typography>
                              {showChips && getSourceTypeChip(item.sourceType)}
                            </Box>
                            <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                              Cédula: {item.cedula || 'No disponible'}
                            </Typography>
                            {contextInfo && item.contextInfo && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {item.contextInfo}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(item);
                              }}
                            >
                              Seleccionar
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedPersonSelector;