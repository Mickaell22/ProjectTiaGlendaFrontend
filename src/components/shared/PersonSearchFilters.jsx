import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Typography,
  IconButton,
  Button,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Collapse,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Badge,
  Divider
} from '@mui/material';
import {
  Search,
  Clear,
  FilterList,
  SortByAlpha,
  ViewModule,
  ViewList,
  TrendingUp,
  Person,
  SupervisorAccount,
  Groups,
  Phone,
  Email,
  CheckCircle,
  Warning,
  ExpandMore,
  ExpandLess,
  Tune,
  Analytics,
  Speed
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { AnimatePresence } from 'framer-motion';

const PersonSearchFilters = ({
  searchTerm,
  onSearchChange,
  activeFilters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  quickStats = {},
  loading = false
}) => {
  const theme = useTheme();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...activeFilters,
      [filterType]: value
    });
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onFiltersChange({
      type: 'all',
      availability: 'all',
      hasContact: 'all'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeFilters.type !== 'all') count++;
    if (activeFilters.availability !== 'all') count++;
    if (activeFilters.hasContact !== 'all') count++;
    return count;
  };

  const getQuickFilterChips = () => {
    const chips = [];

    if (activeFilters.type !== 'all') {
      chips.push({
        key: 'type',
        label: activeFilters.type === 'persona' ? 'Solo Personas' : 'Solo Tutores',
        icon: activeFilters.type === 'persona' ? <Person /> : <SupervisorAccount />,
        color: activeFilters.type === 'persona' ? 'primary' : 'secondary'
      });
    }

    if (activeFilters.availability !== 'all') {
      chips.push({
        key: 'availability',
        label: activeFilters.availability === 'available' ? 'Disponibles' : 'Ya Registrados',
        icon: activeFilters.availability === 'available' ? <CheckCircle /> : <Warning />,
        color: activeFilters.availability === 'available' ? 'success' : 'warning'
      });
    }

    if (activeFilters.hasContact !== 'all') {
      const contactLabels = {
        phone: 'Con Teléfono',
        email: 'Con Email',
        both: 'Con Ambos Contactos'
      };
      chips.push({
        key: 'hasContact',
        label: contactLabels[activeFilters.hasContact],
        icon: activeFilters.hasContact === 'email' ? <Email /> : <Phone />,
        color: 'info'
      });
    }

    return chips;
  };

  return (
    <Paper elevation={2} sx={{ mx: 2, mt: 2, borderRadius: 2, overflow: 'hidden' }}>
      {/* Main search and quick controls */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              animate={{ scale: searchFocused ? 1.02 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <TextField
                fullWidth
                placeholder="Buscar por nombre, cédula, teléfono o email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color={searchFocused ? 'primary' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => onSearchChange('')}
                        edge="end"
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`
                    }
                  }
                }}
              />
            </motion.div>
          </Grid>

          {/* View mode toggle */}
          <Grid size={{ xs: 6, md: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && onViewModeChange(newMode)}
              size="small"
              fullWidth
            >
              <ToggleButton value="cards" aria-label="vista de tarjetas">
                <Tooltip title="Vista de tarjetas">
                  <ViewModule />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="list" aria-label="vista de lista">
                <Tooltip title="Vista de lista">
                  <ViewList />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Sort options */}
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SortByAlpha fontSize="small" />
                  </InputAdornment>
                )
              }}
            >
              <MenuItem value="name">A-Z</MenuItem>
              <MenuItem value="recent">Recientes</MenuItem>
              <MenuItem value="relevance">Relevancia</MenuItem>
            </TextField>
          </Grid>

          {/* Advanced filters toggle */}
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant={showAdvancedFilters ? 'contained' : 'outlined'}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              startIcon={
                <Badge badgeContent={getActiveFiltersCount()} color="primary">
                  <Tune />
                </Badge>
              }
              endIcon={showAdvancedFilters ? <ExpandLess /> : <ExpandMore />}
              size="small"
            >
              Filtros
            </Button>
          </Grid>
        </Grid>

        {/* Active filters chips */}
        <AnimatePresence>
          {getActiveFiltersCount() > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Filtros activos:
                </Typography>
                {getQuickFilterChips().map((chip) => (
                  <Chip
                    key={chip.key}
                    icon={chip.icon}
                    label={chip.label}
                    color={chip.color}
                    variant="filled"
                    size="small"
                    onDelete={() => handleFilterChange(chip.key, 'all')}
                  />
                ))}
                <Button
                  size="small"
                  startIcon={<Clear />}
                  onClick={clearAllFilters}
                  color="error"
                  variant="outlined"
                >
                  Limpiar todo
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Advanced filters */}
      <Collapse in={showAdvancedFilters}>
        <Divider />
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Grid container spacing={3}>
            {/* Type filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                <Groups sx={{ mr: 1, verticalAlign: 'middle' }} />
                Tipo de Persona
              </Typography>
              <ToggleButtonGroup
                value={activeFilters.type}
                exclusive
                onChange={(e, value) => value && handleFilterChange('type', value)}
                fullWidth
                size="small"
              >
                <ToggleButton value="all">Todos</ToggleButton>
                <ToggleButton value="persona">Personas</ToggleButton>
                <ToggleButton value="tutor">Tutores</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Availability filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Disponibilidad
              </Typography>
              <ToggleButtonGroup
                value={activeFilters.availability}
                exclusive
                onChange={(e, value) => value && handleFilterChange('availability', value)}
                fullWidth
                size="small"
              >
                <ToggleButton value="all">Todos</ToggleButton>
                <ToggleButton value="available">Disponibles</ToggleButton>
                <ToggleButton value="registered">Registrados</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Contact filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                Información de Contacto
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={activeFilters.hasContact}
                onChange={(e) => handleFilterChange('hasContact', e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="phone">Con teléfono</MenuItem>
                <MenuItem value="email">Con email</MenuItem>
                <MenuItem value="both">Con ambos</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      {/* Quick stats */}
      <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Chip
                  icon={<Analytics />}
                  label={`${quickStats.total || 0} Total`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </motion.div>

              {quickStats.personas > 0 && (
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Chip
                    icon={<Person />}
                    label={`${quickStats.personas} Personas`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </motion.div>
              )}

              {quickStats.tutores > 0 && (
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Chip
                    icon={<SupervisorAccount />}
                    label={`${quickStats.tutores} Tutores`}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                </motion.div>
              )}

              {quickStats.available > 0 && (
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Chip
                    icon={<CheckCircle />}
                    label={`${quickStats.available} Disponibles`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                </motion.div>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
              {loading && (
                <Chip
                  icon={<Speed />}
                  label="Cargando..."
                  color="info"
                  variant="filled"
                  size="small"
                />
              )}

              <Typography variant="caption" color="text.secondary">
                {searchTerm.trim() && `"${searchTerm}"`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default PersonSearchFilters;