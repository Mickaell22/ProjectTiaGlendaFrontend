import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Typography,
  InputAdornment,
  Grid,
  MenuItem,
  Collapse,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Search,
  Clear,
  Person,
  SupervisorAccount,
  ExpandMore,
  ExpandLess,
  FilterList,
  ToggleOn,
  ToggleOff,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import axios from 'axios';

const BuscadorPersonas = ({ 
  onPersonaSelect, 
  onTutorSelect, 
  showPersonas = true, 
  showTutores = true,
  maxHeight = 400,
  compact = false,
  hideRegisteredPatients = true, // Nueva prop para filtrar pacientes registrados
  editingPatientId = null // ID del paciente que se está editando (para no filtrarlo)
}) => {
  // Estados principales
  const [personas, setPersonas] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [pacientesExistentes, setPacientesExistentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, persona, tutor
  const [expanded, setExpanded] = useState(true);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(hideRegisteredPatients);
  
  const token = localStorage.getItem('jwt_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const promises = [];
      
      // Siempre cargar pacientes existentes para filtrar
      if (hideRegisteredPatients) {
        promises.push(axios.get('http://localhost:5000/api/pacientes', { headers }));
      }
      
      if (showPersonas) {
        promises.push(axios.get('http://localhost:5000/api/personas', { headers }));
      }
      
      if (showTutores) {
        promises.push(axios.get('http://localhost:5000/api/tutores', { headers }));
        // También cargar personas para mapear los tutores
        if (!showPersonas) {
          promises.push(axios.get('http://localhost:5000/api/personas', { headers }));
        }
      }

      const responses = await Promise.all(promises);
      
      let responseIndex = 0;
      let pacientesData = [];
      let personasData = [];
      let tutoresData = [];
      let personasParaTutores = [];
      
      // Obtener pacientes existentes si se solicitó filtrar
      if (hideRegisteredPatients) {
        pacientesData = responses[responseIndex].data?.data || [];
        responseIndex++;
      }
      
      if (showPersonas && showTutores) {
        personasData = responses[responseIndex].data?.data || [];
        tutoresData = responses[responseIndex + 1].data?.data || [];
        personasParaTutores = personasData; // Usar las mismas personas
      } else if (showPersonas) {
        personasData = responses[responseIndex].data?.data || [];
      } else if (showTutores) {
        tutoresData = responses[responseIndex].data?.data || [];
        personasParaTutores = responses[responseIndex + 1].data?.data || [];
      }

      // Marcar qué personas ya son pacientes para mostrar indicadores
      if (personasData.length > 0 && pacientesData.length > 0) {
        const personasYaPacientes = pacientesData.map(p => p.persona_id);
        personasData = personasData.map(persona => ({
          ...persona,
          yaEsPaciente: personasYaPacientes.includes(persona.id)
        }));
      }

      // Enriquecer tutores con datos de personas
      if (tutoresData.length > 0 && personasParaTutores.length > 0) {
        tutoresData = tutoresData.map(tutor => {
          const persona = personasParaTutores.find(p => p.id === tutor.persona_id);
          if (persona) {
            return {
              ...tutor,
              nombre: persona.nombre,
              apellido: persona.apellido,
              cedula: persona.cedula,
              telefono: persona.telefono,
              correo: persona.correo,
              nombre_completo: `${persona.nombre} ${persona.apellido}`,
            };
          }
          return tutor;
        });
      }

      setPacientesExistentes(pacientesData);
      setPersonas(personasData);
      setTutores(tutoresData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y combinar datos
  const filteredData = useMemo(() => {
    let combinedData = [];

    // Agregar personas
    if (showPersonas && (filterType === 'all' || filterType === 'persona')) {
      let personasToShow = personas;
      
      // Filtrar según el toggle de disponibilidad
      if (showOnlyAvailable) {
        personasToShow = personas.filter(persona => {
          // Mostrar si no es paciente, O si es el paciente que se está editando
          if (editingPatientId) {
            const pacienteEditando = pacientesExistentes.find(p => p.id === editingPatientId);
            if (pacienteEditando && pacienteEditando.persona_id === persona.id) {
              return true;
            }
          }
          return !persona.yaEsPaciente;
        });
      }
      
      const personasWithType = personasToShow.map(persona => ({
        ...persona,
        tipo: 'persona',
        nombre_completo: `${persona.nombre} ${persona.apellido}`,
        telefono_display: persona.telefono || 'Sin teléfono',
        correo_display: persona.correo || 'Sin correo'
      }));
      combinedData = [...combinedData, ...personasWithType];
    }

    // Agregar tutores
    if (showTutores && (filterType === 'all' || filterType === 'tutor')) {
      const tutoresWithType = tutores.map(tutor => ({
        ...tutor,
        tipo: 'tutor',
        nombre_completo: tutor.nombre_completo || `${tutor.nombre || ''} ${tutor.apellido || ''}`.trim(),
        telefono_display: tutor.telefono || 'Sin teléfono',
        correo_display: tutor.correo || 'Sin correo',
        cedula_display: tutor.cedula || 'Sin cédula',
        // Mantener el ID del tutor para la selección
        tutor_id: tutor.id,
        persona_id: tutor.persona_id
      }));
      combinedData = [...combinedData, ...tutoresWithType];
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      combinedData = combinedData.filter(item => 
        item.nombre_completo?.toLowerCase().includes(term) ||
        item.cedula?.includes(term) ||
        item.cedula_display?.includes(term) ||
        item.telefono_display?.includes(term) ||
        item.correo_display?.toLowerCase().includes(term)
      );
    }

    return combinedData;
  }, [personas, tutores, searchTerm, filterType, showPersonas, showTutores, showOnlyAvailable, pacientesExistentes, editingPatientId]);

  const handleSelect = (item) => {
    if (item.tipo === 'persona' && onPersonaSelect) {
      onPersonaSelect(item);
    } else if (item.tipo === 'tutor' && onTutorSelect) {
      onTutorSelect(item);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilterType('all');
  };

  const getTipoChip = (tipo) => {
    if (tipo === 'persona') {
      return (
        <Chip
          icon={<Person />}
          label="Persona"
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    } else {
      return (
        <Chip
          icon={<SupervisorAccount />}
          label="Tutor"
          size="small"
          color="secondary"
          variant="outlined"
        />
      );
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button size="small" onClick={loadData} sx={{ ml: 1 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header con controles */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <Search />
          Buscador de Personas
        </Typography>
        <Tooltip title={expanded ? "Contraer" : "Expandir"}>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={expanded}>
        {/* Controles de búsqueda */}
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre, cédula, teléfono o correo..."
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
                size={compact ? "small" : "medium"}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Filtrar por tipo"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                size={compact ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterList />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="all">📋 Todos</MenuItem>
                {showPersonas && <MenuItem value="persona">👤 Solo Personas</MenuItem>}
                {showTutores && <MenuItem value="tutor">👥 Solo Tutores</MenuItem>}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearSearch}
                startIcon={<Clear />}
                size={compact ? "small" : "medium"}
              >
                Limpiar
              </Button>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={loadData}
                startIcon={<Search />}
                size={compact ? "small" : "medium"}
                color="success"
              >
                Actualizar
              </Button>
            </Grid>
          </Grid>
          
          {/* Toggle y estadísticas */}
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            {/* Indicadores rápidos */}
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                icon={<Person />} 
                label={`${personas.length} Personas`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                icon={<SupervisorAccount />} 
                label={`${tutores.length} Tutores`} 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
              {searchTerm && (
                <Chip 
                  icon={<Search />} 
                  label={`${filteredData.length} resultados`} 
                  size="small" 
                  color="success" 
                  variant="filled"
                />
              )}
            </Box>
            
            {/* Toggle para mostrar solo disponibles */}
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" color="text.secondary">
                Solo disponibles
              </Typography>
              <IconButton 
                onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                color={showOnlyAvailable ? "success" : "default"}
              >
                {showOnlyAvailable ? <ToggleOn /> : <ToggleOff />}
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Información del filtro */}
        {showOnlyAvailable && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Filtro activo:</strong> Solo se muestran personas que AÚN NO están registradas como pacientes
          </Alert>
        )}
        
        {!showOnlyAvailable && pacientesExistentes.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Atención:</strong> Se muestran todas las personas, incluso las que ya son pacientes. 
            Activa el filtro "Solo disponibles" para ver únicamente personas disponibles.
          </Alert>
        )}

        {/* Resultados */}
        <Paper elevation={2}>
          <Box p={2}>
            <Typography variant="subtitle1" gutterBottom>
              Resultados ({filteredData.length})
            </Typography>
            
            {loading ? (
              <Box textAlign="center" py={3}>
                <Typography>Cargando...</Typography>
              </Box>
            ) : filteredData.length === 0 ? (
              <Box textAlign="center" py={3}>
                <Typography color="text.secondary">
                  {searchTerm.trim() ? 'No se encontraron resultados' : 'No hay datos disponibles'}
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: maxHeight }}>
                <Table stickyHeader size={compact ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Nombre Completo</TableCell>
                      <TableCell>Cédula</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Correo</TableCell>
                      <TableCell align="center">Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow 
                        key={`${item.tipo}-${item.id}-${index}`}
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getTipoChip(item.tipo)}
                            {item.yaEsPaciente && (
                              <Tooltip title="Esta persona ya está registrada como paciente">
                                <Chip
                                  icon={<Warning />}
                                  label="Ya es paciente"
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              </Tooltip>
                            )}
                            {!item.yaEsPaciente && item.tipo === 'persona' && (
                              <Tooltip title="Persona disponible para registrar como paciente">
                                <CheckCircle color="success" fontSize="small" />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.nombre_completo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {item.cedula || item.cedula_display || 'Sin cédula'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {item.telefono_display}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            maxWidth: 150, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {item.correo_display}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="contained"
                            color={item.tipo === 'persona' ? 'primary' : 'secondary'}
                            onClick={() => handleSelect(item)}
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default BuscadorPersonas;