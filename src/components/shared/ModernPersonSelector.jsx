import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Slide,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Paper,
  Badge,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Search,
  Person,
  SupervisorAccount,
  Clear,
  Close,
  FilterList,
  SortByAlpha,
  ViewModule,
  ViewList,
  StarBorder,
  Star,
  Phone,
  Email,
  Badge as BadgeIcon,
  TrendingUp,
  Groups,
  PersonAdd,
  Refresh,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import PersonCard from './PersonCard';
import PersonSearchFilters from './PersonSearchFilters';
import { ApiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../config/api';

const ModernPersonSelector = ({
  label = "Seleccionar Persona",
  placeholder = "Busca por nombre, cédula, teléfono o email...",
  selectedPerson = null,
  onPersonSelect,
  onClear,
  searchTypes = ['personas'], // ['personas', 'tutores', 'pacientes']
  hideRegisteredPatients = false,
  hideRegisteredTutors = false, // NUEVO: Filtrar tutores registrados
  hideRegisteredPersonal = false, // NUEVO: Filtrar personal registrado
  hideRegisteredUsers = false, // NUEVO: Filtrar usuarios registrados
  filterByRole = null, // NUEVO: 'terapeuta', 'pedagogo', etc.
  excludeRoles = [], // NUEVO: Array de roles a excluir
  editingPatientId = null,
  editingTutorId = null, // NUEVO: Para permitir edición
  editingPersonalId = null, // NUEVO: Para permitir edición
  editingUserId = null, // NUEVO: Para permitir edición
  disabled = false,
  required = false,
  error = "",
  showCreateButton = false,
  onCreateNew = null,
  maxHeight = 600,
  multiple = false,
  selectedPersons = [],
  enableFavorites = true,
  showRecentSelections = true,
  contextualInfo = true
}) => {
  const theme = useTheme();

  // Main states
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allPersons, setAllPersons] = useState([]);
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'recent' | 'relevance'

  // Filter states - DEFAULT: Solo personas disponibles por defecto
  const [activeFilters, setActiveFilters] = useState({
    type: 'all', // 'all' | 'personas' | 'tutores'
    availability: 'available', // 'all' | 'available' | 'registered' - CAMBIO: default a 'available'
    hasContact: 'all' // 'all' | 'phone' | 'email' | 'both'
  });

  // UX enhancement states
  const [recentSelections, setRecentSelections] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [quickStats, setQuickStats] = useState({});

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadPersons();
      loadRecentSelections();
      loadFavorites();
    }
  }, [open]); // Removido searchTypes para evitar re-renders infinitos

  // Filter and sort data when dependencies change
  useEffect(() => {
    filterAndSortPersons();
  }, [allPersons, searchTerm, activeFilters, sortBy]);

  const loadPersons = async () => {
    try {
      setLoading(true);
      const allData = [];
      let pacientesData = [];
      let tutoresData = [];
      let personalData = [];
      let usuariosData = [];

      // Load patients if we need to filter them out OR if we want to show only patients
      if (hideRegisteredPatients || searchTypes.includes('pacientes')) {
        const pacientesResponse = await ApiService.get(API_ENDPOINTS.PACIENTES.BASE);
        pacientesData = pacientesResponse.data?.data || [];
      }

      // Load tutors if we need to filter them out
      if (hideRegisteredTutors) {
        const tutoresResponse = await ApiService.get(API_ENDPOINTS.TUTORES.BASE);
        tutoresData = tutoresResponse.data?.data || [];
      }

      // Load personal only if explicitly needed
      if (hideRegisteredPersonal || (filterByRole && (filterByRole.includes('terapeuta') || filterByRole.includes('pedagog')))) {
        try {
          const personalResponse = await ApiService.get(API_ENDPOINTS.PERSONAL.BASE);
          personalData = personalResponse.data?.data || [];
        } catch (error) {
          console.error('Error loading personal data:', error);
          personalData = [];
        }
      }

      // Load users if we need to filter them out
      if (hideRegisteredUsers) {
        const usuariosResponse = await ApiService.get(API_ENDPOINTS.USUARIOS.BASE);
        usuariosData = usuariosResponse.data?.data || [];
      }

      // Load persons
      if (searchTypes.includes('personas')) {
        const personasResponse = await ApiService.get(API_ENDPOINTS.PERSONAS.BASE);
        const personas = personasResponse.data?.data || [];

        const personasWithType = personas.map(persona => {
          const isRegisteredPatient = pacientesData.some(p => p.persona_id === persona.id);
          const isEditingPatient = editingPatientId && pacientesData.some(p =>
            p.id === editingPatientId && p.persona_id === persona.id
          );

          const isRegisteredTutor = tutoresData.some(t => t.persona_id === persona.id);
          const isEditingTutor = editingTutorId && tutoresData.some(t =>
            t.id === editingTutorId && t.persona_id === persona.id
          );

          const isRegisteredPersonal = personalData.some(p => p.persona_id === persona.id);
          const isEditingPersonal = editingPersonalId && personalData.some(p =>
            p.id === editingPersonalId && p.persona_id === persona.id
          );

          const isRegisteredUser = usuariosData.some(u => u.persona_id === persona.id);
          const isEditingUser = editingUserId && usuariosData.some(u =>
            u.id === editingUserId && u.persona_id === persona.id
          );

          // Lógica de disponibilidad más flexible:
          // - Pacientes: no puede ser paciente a menos que se esté editando
          // - Tutores: SÍ pueden tener múltiples pacientes (no excluir)
          // - Personal: no puede duplicarse a menos que se esté editando
          // - Usuarios: no puede duplicarse a menos que se esté editando
          const isAvailable = (!isRegisteredPatient || isEditingPatient) &&
                             (!isRegisteredPersonal || isEditingPersonal) &&
                             (!isRegisteredUser || isEditingUser);
          // Nota: Tutores removidos de la lógica de disponibilidad - pueden tener múltiples pacientes

          // Obtener información de rol desde personal (solo si está cargado)
          const personalInfo = personalData.find(p => p.persona_id === persona.id);
          const personRole = personalInfo ? (personalInfo.rol || personalInfo.cargo || '').toLowerCase() : null;

          return {
            ...persona,
            sourceType: 'persona',
            displayName: `${persona.nombre} ${persona.apellido}`,
            avatar: getInitials(persona.nombre, persona.apellido),
            isRegisteredPatient,
            isEditingPatient,
            isRegisteredTutor,
            isEditingTutor,
            isRegisteredPersonal,
            isEditingPersonal,
            isRegisteredUser,
            isEditingUser,
            isAvailable,
            personRole, // NUEVO: rol de la persona
            personalInfo, // NUEVO: información completa del personal
            contactInfo: getContactInfo(persona),
            contextInfo: getPersonContextInfo(persona),
            searchableText: `${persona.nombre} ${persona.apellido} ${persona.cedula || ''} ${persona.telefono || ''} ${persona.correo || ''} ${personRole || ''}`.toLowerCase()
          };
        });

        allData.push(...personasWithType);
      }

      // Load tutors
      if (searchTypes.includes('tutores')) {
        const tutoresResponse = await ApiService.get(API_ENDPOINTS.TUTORES.BASE);
        const tutores = tutoresResponse.data?.data || [];

        // Also load personas to enrich tutor data
        const personasResponse = await ApiService.get(API_ENDPOINTS.PERSONAS.BASE);
        const personas = personasResponse.data?.data || [];

        const tutoresWithType = tutores.map(tutor => {
          const persona = personas.find(p => p.id === tutor.persona_id);
          const enrichedTutor = persona ? { ...tutor, ...persona } : tutor;

          return {
            ...enrichedTutor,
            sourceType: 'tutor',
            displayName: enrichedTutor.nombre_completo || `${enrichedTutor.nombre || ''} ${enrichedTutor.apellido || ''}`.trim(),
            avatar: getInitials(enrichedTutor.nombre, enrichedTutor.apellido),
            contactInfo: getContactInfo(enrichedTutor),
            contextInfo: getTutorContextInfo(enrichedTutor),
            searchableText: `${enrichedTutor.nombre || ''} ${enrichedTutor.apellido || ''} ${enrichedTutor.cedula || ''} ${enrichedTutor.telefono || ''} ${enrichedTutor.correo || ''} ${enrichedTutor.relacion || ''}`.toLowerCase()
          };
        });

        allData.push(...tutoresWithType);
      }

      // Load patients as searchable entities
      if (searchTypes.includes('pacientes')) {
        // También cargar personas para enriquecer datos de pacientes
        const personasResponse = await ApiService.get(API_ENDPOINTS.PERSONAS.BASE);
        const personas = personasResponse.data?.data || [];

        const pacientesWithType = pacientesData.map(paciente => {
          const persona = personas.find(p => p.id === paciente.persona_id);
          const enrichedPaciente = persona ? { ...paciente, ...persona } : paciente;

          const displayName = enrichedPaciente.nombre_completo ||
                             `${enrichedPaciente.nombre || ''} ${enrichedPaciente.apellido || ''}`.trim();

          return {
            ...enrichedPaciente,
            sourceType: 'paciente',
            displayName,
            avatar: getInitials(enrichedPaciente.nombre, enrichedPaciente.apellido),
            contactInfo: getContactInfo(enrichedPaciente),
            contextInfo: getPacienteContextInfo(enrichedPaciente),
            searchableText: `${enrichedPaciente.nombre || ''} ${enrichedPaciente.apellido || ''} ${enrichedPaciente.cedula || ''} ${enrichedPaciente.telefono || ''} ${enrichedPaciente.correo || ''} paciente`.toLowerCase(),
            isAvailable: true, // Los pacientes siempre están "disponibles" para selección
            personRole: 'paciente'
          };
        });

        allData.push(...pacientesWithType);
      }

      setAllPersons(allData);
      calculateQuickStats(allData);
    } catch (error) {
      console.error('Error loading persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPersons = useCallback(() => {
    let filtered = [...allPersons];

    // Apply text search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(person =>
        person.searchableText.includes(term)
      );
    }

    // Apply type filter
    if (activeFilters.type !== 'all') {
      filtered = filtered.filter(person =>
        person.sourceType === activeFilters.type
      );
    }

    // Apply availability filter
    if (activeFilters.availability === 'available') {
      filtered = filtered.filter(person => person.isAvailable);
    } else if (activeFilters.availability === 'registered') {
      filtered = filtered.filter(person => !person.isAvailable);
    }

    // Apply contact filter
    if (activeFilters.hasContact === 'phone') {
      filtered = filtered.filter(person => person.telefono);
    } else if (activeFilters.hasContact === 'email') {
      filtered = filtered.filter(person => person.correo);
    } else if (activeFilters.hasContact === 'both') {
      filtered = filtered.filter(person => person.telefono && person.correo);
    }

    // FILTRO POR ROL SIMPLE - Solo filtrar si tenemos datos de personal cargados
    if (filterByRole && personalData.length > 0) {
      const targetRole = filterByRole.toLowerCase();

      // Obtener IDs de personas con el rol deseado
      const personasConRol = personalData
        .filter(personal => {
          const rol = (personal.rol || personal.cargo || '').toLowerCase();

          if (targetRole.includes('terapeuta')) {
            return rol.includes('terapeuta') || rol.includes('psicolog') || rol.includes('terapia');
          }

          if (targetRole.includes('pedagog')) {
            return rol.includes('pedagog') || rol.includes('educat') || rol.includes('maestr') || rol.includes('profesor');
          }

          return rol.includes(targetRole);
        })
        .map(personal => personal.persona_id);

      // Si no hay personas con ese rol, mostrar todas (más flexible)
      if (personasConRol.length > 0) {
        filtered = filtered.filter(person => personasConRol.includes(person.id));
      }
    }

    // Apply exclude roles filter
    if (excludeRoles && excludeRoles.length > 0) {
      filtered = filtered.filter(person => {
        if (!person.personRole) return true; // Si no tiene rol, no excluir
        return !excludeRoles.some(role =>
          person.personRole.includes(role.toLowerCase()) || person.personRole === role.toLowerCase()
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'recent':
        case 'relevance':
          // Simplified sorting - just alphabetical for now to avoid circular dependencies
          return a.displayName.localeCompare(b.displayName);
        default:
          return 0;
      }
    });

    setFilteredPersons(filtered);
  }, [allPersons, searchTerm, activeFilters, sortBy]); // Removidas dependencias problemáticas

  const calculateQuickStats = (data) => {
    const stats = {
      total: data.length,
      personas: data.filter(p => p.sourceType === 'persona').length,
      tutores: data.filter(p => p.sourceType === 'tutor').length,
      pacientes: data.filter(p => p.sourceType === 'paciente').length,
      available: data.filter(p => p.isAvailable).length,
      withPhone: data.filter(p => p.telefono).length,
      withEmail: data.filter(p => p.correo).length,
      terapeutas: data.filter(p => p.personRole && p.personRole.includes('terapeuta')).length,
      pedagogos: data.filter(p => p.personRole && (p.personRole.includes('pedagog') || p.personRole.includes('educat'))).length
    };
    setQuickStats(stats);
  };

  const loadRecentSelections = () => {
    if (!showRecentSelections) return;
    try {
      const stored = localStorage.getItem('modernPersonSelector_recent');
      if (stored) {
        setRecentSelections(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent selections:', error);
    }
  };

  const loadFavorites = () => {
    if (!enableFavorites) return;
    try {
      const stored = localStorage.getItem('modernPersonSelector_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveRecentSelection = (person) => {
    if (!showRecentSelections) return;
    try {
      const updated = [
        { id: person.id, displayName: person.displayName, sourceType: person.sourceType },
        ...recentSelections.filter(r => r.id !== person.id)
      ].slice(0, 10);

      setRecentSelections(updated);
      localStorage.setItem('modernPersonSelector_recent', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent selection:', error);
    }
  };

  const toggleFavorite = (personId) => {
    if (!enableFavorites) return;
    try {
      const updated = favorites.includes(personId)
        ? favorites.filter(id => id !== personId)
        : [...favorites, personId];

      setFavorites(updated);
      localStorage.setItem('modernPersonSelector_favorites', JSON.stringify(updated));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePersonSelect = (person) => {
    if (multiple) {
      const isSelected = selectedPersons.some(p => p.id === person.id);
      if (isSelected) {
        onPersonSelect(selectedPersons.filter(p => p.id !== person.id));
      } else {
        onPersonSelect([...selectedPersons, person]);
      }
    } else {
      onPersonSelect(person);
      saveRecentSelection(person);
      setOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = () => {
    if (multiple) {
      onPersonSelect([]);
    } else {
      onClear();
    }
  };

  const handleCreateNew = () => {
    setOpen(false);
    if (onCreateNew) {
      onCreateNew();
    }
  };

  // Utility functions
  const getInitials = (nombre, apellido) => {
    const n = nombre?.[0] || '';
    const a = apellido?.[0] || '';
    return `${n}${a}`.toUpperCase() || '?';
  };

  const getContactInfo = (person) => {
    const info = [];
    if (person.telefono) info.push({ type: 'phone', value: person.telefono });
    if (person.correo) info.push({ type: 'email', value: person.correo });
    return info;
  };

  const getPersonContextInfo = (person) => {
    const info = [];
    if (person.telefono) info.push(`📞 ${person.telefono}`);
    if (person.correo) info.push(`📧 ${person.correo}`);
    return info.join(' • ');
  };

  const getTutorContextInfo = (tutor) => {
    const info = [];
    if (tutor.relacion) info.push(`👥 ${tutor.relacion}`);
    if (tutor.telefono) info.push(`📞 ${tutor.telefono}`);
    return info.join(' • ');
  };

  const getPacienteContextInfo = (paciente) => {
    const info = [];
    if (paciente.especialidad_nombre) info.push(`🏥 ${paciente.especialidad_nombre}`);
    if (paciente.estado_tratamiento) info.push(`📋 ${paciente.estado_tratamiento}`);
    if (paciente.telefono) info.push(`📞 ${paciente.telefono}`);
    return info.join(' • ');
  };

  const getSelectedPersonDisplay = () => {
    if (multiple && selectedPersons.length > 0) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 2,
            border: `2px solid ${theme.palette.primary.main}`,
            background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}20)`
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" color="primary">
              {selectedPersons.length} persona{selectedPersons.length !== 1 ? 's' : ''} seleccionada{selectedPersons.length !== 1 ? 's' : ''}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpen(true)}
              startIcon={<Edit />}
            >
              Modificar
            </Button>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {selectedPersons.map((person, index) => (
              <Chip
                key={index}
                avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{person.avatar}</Avatar>}
                label={person.displayName}
                onDelete={() => handlePersonSelect(person)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </Paper>
      );
    }

    if (selectedPerson) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            elevation={6}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
              color: theme.palette.success.contrastText,
              border: `2px solid ${theme.palette.success.main}`,
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.success.contrastText,
                      color: theme.palette.success.main,
                      width: 56,
                      height: 56,
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {selectedPerson.avatar}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {selectedPerson.displayName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedPerson.cedula && `Cédula: ${selectedPerson.cedula}`}
                  </Typography>
                  {contextualInfo && selectedPerson.contextInfo && (
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                      {selectedPerson.contextInfo}
                    </Typography>
                  )}
                  <Chip
                    icon={selectedPerson.sourceType === 'persona' ? <Person /> : <SupervisorAccount />}
                    label={selectedPerson.sourceType === 'persona' ? 'Persona' : 'Tutor'}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: theme.palette.success.contrastText,
                      color: theme.palette.success.main,
                      '& .MuiChip-icon': { color: 'success.main' }
                    }}
                  />
                </Grid>
                <Grid item>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Cambiar selección">
                      <IconButton
                        size="small"
                        sx={{ color: theme.palette.success.contrastText }}
                        onClick={() => setOpen(true)}
                      >
                        <Search />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Limpiar selección">
                      <IconButton
                        size="small"
                        sx={{ color: theme.palette.success.contrastText }}
                        onClick={handleClear}
                      >
                        <Clear />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={() => setOpen(true)}
          disabled={disabled}
          startIcon={<Search />}
          sx={{
            py: 3,
            borderRadius: 3,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: error ? 'error.main' : 'primary.main',
            backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
            '&:hover': {
              borderStyle: 'solid',
              backgroundColor: theme.palette.action.hover,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4]
            },
            transition: 'all 0.3s ease'
          }}
        >
          <Box textAlign="center">
            <Typography variant="h6" component="div">
              {placeholder}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Haz clic para buscar y seleccionar
            </Typography>
          </Box>
        </Button>
      </motion.div>
    );
  };

  return (
    <Box>
      {/* Label */}
      <Typography variant="body1" mb={2} fontWeight={required ? 'bold' : 'normal'}>
        {label}{required && ' *'}
      </Typography>

      {/* Selected Person Display */}
      {getSelectedPersonDisplay()}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Selection Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
            bgcolor: 'background.default'
          }
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: theme.palette.primary.contrastText,
              borderRadius: 0
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Busca y selecciona de manera intuitiva
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                {showCreateButton && onCreateNew && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PersonAdd />}
                    onClick={handleCreateNew}
                    sx={{ color: theme.palette.primary.contrastText }}
                  >
                    Crear Nuevo
                  </Button>
                )}
                <IconButton
                  onClick={loadPersons}
                  disabled={loading}
                  sx={{ color: theme.palette.primary.contrastText }}
                >
                  <Refresh />
                </IconButton>
                <IconButton
                  onClick={() => setOpen(false)}
                  sx={{ color: theme.palette.primary.contrastText }}
                >
                  <Close />
                </IconButton>
              </Box>
            </Box>
          </Paper>

          {/* Search and Filters */}
          <PersonSearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            quickStats={quickStats}
            loading={loading}
          />

          {/* Recent Selections */}
          {showRecentSelections && recentSelections.length > 0 && !searchTerm.trim() && (
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                ⏱️ Selecciones Recientes
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {recentSelections.slice(0, 5).map((recent) => (
                  <Chip
                    key={recent.id}
                    avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>R</Avatar>}
                    label={recent.displayName}
                    onClick={() => {
                      const person = allPersons.find(p => p.id === recent.id);
                      if (person) handlePersonSelect(person);
                    }}
                    variant="outlined"
                    color="primary"
                    sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}
                  />
                ))}
              </Stack>
              <Divider sx={{ mt: 2 }} />
            </Box>
          )}

          {/* Results */}
          <Box sx={{ p: 2, minHeight: 400, maxHeight: maxHeight, overflowY: 'auto' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                <CircularProgress size={48} />
              </Box>
            ) : filteredPersons.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm.trim() ? '🔍 No se encontraron resultados' : '📋 No hay datos disponibles'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm.trim()
                    ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                    : 'Parece que no hay personas disponibles en este momento'
                  }
                </Typography>
                {searchTerm.trim() && (
                  <Button
                    variant="outlined"
                    onClick={() => setSearchTerm('')}
                    sx={{ mt: 2 }}
                    startIcon={<Clear />}
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </Box>
            ) : (
              <Grid container spacing={2}>
                <AnimatePresence>
                  {filteredPersons.map((person, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={viewMode === 'cards' ? 6 : 12}
                      md={viewMode === 'cards' ? 4 : 12}
                      key={`${person.sourceType}-${person.id}`}
                    >
                      <PersonCard
                        person={person}
                        onSelect={() => handlePersonSelect(person)}
                        viewMode={viewMode}
                        isFavorite={favorites.includes(person.id)}
                        onToggleFavorite={() => toggleFavorite(person.id)}
                        enableFavorites={enableFavorites}
                        isSelected={multiple && selectedPersons.some(p => p.id === person.id)}
                        multiple={multiple}
                        index={index}
                      />
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ModernPersonSelector;