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
} from '@mui/icons-material';
import axios from 'axios';

const BuscadorPersonas = ({ 
  onPersonaSelect, 
  onTutorSelect, 
  showPersonas = true, 
  showTutores = true,
  maxHeight = 400,
  compact = false 
}) => {
  // Estados principales
  const [personas, setPersonas] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, persona, tutor
  const [expanded, setExpanded] = useState(true);
  
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
      
      if (showPersonas) {
        promises.push(axios.get('http://localhost:5000/api/personas', { headers }));
      }
      
      if (showTutores) {
        promises.push(axios.get('http://localhost:5000/api/tutores', { headers }));
      }

      const responses = await Promise.all(promises);
      
      let personasData = [];
      let tutoresData = [];
      
      if (showPersonas) {
        personasData = responses[0].data?.data || [];
      }
      
      if (showTutores) {
        const tutoresResponse = showPersonas ? responses[1] : responses[0];
        tutoresData = tutoresResponse.data?.data || [];
      }

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
      const personasWithType = personas.map(persona => ({
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
        telefono_display: tutor.telefono_tutor || tutor.telefono || 'Sin teléfono',
        correo_display: tutor.correo_tutor || tutor.correo || 'Sin correo',
        cedula: tutor.cedula_tutor || tutor.cedula
      }));
      combinedData = [...combinedData, ...tutoresWithType];
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      combinedData = combinedData.filter(item => 
        item.nombre_completo?.toLowerCase().includes(term) ||
        item.cedula?.includes(term) ||
        item.telefono_display?.includes(term) ||
        item.correo_display?.toLowerCase().includes(term)
      );
    }

    return combinedData;
  }, [personas, tutores, searchTerm, filterType, showPersonas, showTutores]);

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
            <Grid item xs={12} md={6}>
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
            
            <Grid item xs={12} md={4}>
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
                <MenuItem value="all">Todos</MenuItem>
                {showPersonas && <MenuItem value="persona">Solo Personas</MenuItem>}
                {showTutores && <MenuItem value="tutor">Solo Tutores</MenuItem>}
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
          </Grid>
        </Paper>

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
                          {getTipoChip(item.tipo)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.nombre_completo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {item.cedula || 'Sin cédula'}
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