import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Chip
} from '@mui/material';
import { Search, Person, Phone, Email, Badge } from '@mui/icons-material';

const PersonSelector = ({
  persons = [],
  loading = false,
  selectedPerson = null,
  onSelect,
  placeholder = "Seleccionar persona",
  triggerText = "Seleccionar",
  title = "Seleccionar Persona",
  emptyMessage = "No hay personas disponibles",
  className = ""
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Función para resaltar texto de búsqueda
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ?
        <span key={index} style={{ backgroundColor: '#ffeb3b', fontWeight: 'bold' }}>{part}</span> :
        part
    );
  };

  // Filtrado y ordenamiento inteligente
  const filteredPersons = useMemo(() => {
    if (!searchTerm || !Array.isArray(persons)) return persons;

    const term = searchTerm.toLowerCase().trim();

    const filtered = persons.filter(person => {
      const nombres = (person.nombres || person.nombre || '').toLowerCase();
      const apellidos = (person.apellidos || person.apellido || '').toLowerCase();
      const nombreCompleto = person.nombre_completo ?
        person.nombre_completo.toLowerCase() :
        `${nombres} ${apellidos}`;
      const cedula = (person.cedula || '').replace(/[-\s]/g, '');
      const especialidad = (person.especialidad || '').toLowerCase();
      const telefono = (person.telefono || '').replace(/[-\s()]/g, '');
      const email = (person.email || person.correo || '').toLowerCase();

      const termLimpio = term.replace(/[-\s]/g, '');

      return nombreCompleto.includes(term) ||
             nombres.includes(term) ||
             apellidos.includes(term) ||
             cedula.includes(termLimpio) ||
             especialidad.includes(term) ||
             telefono.includes(termLimpio) ||
             email.includes(term) ||
             term.split(' ').every(palabra =>
               nombreCompleto.includes(palabra) ||
               cedula.includes(palabra.replace(/[-\s]/g, ''))
             );
    });

    // Ordenamiento inteligente: coincidencias exactas primero
    return filtered.sort((a, b) => {
      const anombres = (a.nombres || a.nombre || '').toLowerCase();
      const bnombres = (b.nombres || b.nombre || '').toLowerCase();
      const anombrecompleto = a.nombre_completo ?
        a.nombre_completo.toLowerCase() :
        `${anombres} ${(a.apellidos || a.apellido || '').toLowerCase()}`;
      const bnombrecompleto = b.nombre_completo ?
        b.nombre_completo.toLowerCase() :
        `${bnombres} ${(b.apellidos || b.apellido || '').toLowerCase()}`;

      // Prioridad 1: Coincidencia exacta de nombre
      if (anombres === term) return -1;
      if (bnombres === term) return 1;

      // Prioridad 2: Coincidencia exacta de cédula
      if ((a.cedula || '').replace(/[-\s]/g, '') === term.replace(/[-\s]/g, '')) return -1;
      if ((b.cedula || '').replace(/[-\s]/g, '') === term.replace(/[-\s]/g, '')) return 1;

      // Prioridad 3: Empieza con el término
      if (anombrecompleto.startsWith(term) && !bnombrecompleto.startsWith(term)) return -1;
      if (bnombrecompleto.startsWith(term) && !anombrecompleto.startsWith(term)) return 1;

      // Prioridad 4: Orden alfabético
      return anombrecompleto.localeCompare(bnombrecompleto);
    });
  }, [persons, searchTerm]);

  const handleSelect = (person) => {
    onSelect(person);
    setOpen(false);
    setSearchTerm(''); // Reset search
    setSelectedIndex(-1);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm(''); // Reset search when closing
      setSelectedIndex(-1);
    }
  };

  // Navegación por teclado
  const handleKeyDown = (event) => {
    if (!open || !filteredPersons.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredPersons.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredPersons.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && filteredPersons[selectedIndex]) {
          handleSelect(filteredPersons[selectedIndex]);
        }
        break;
      case 'Escape':
        handleOpenChange(false);
        break;
    }
  };


  return (
    <Box className={className}>
      <Box sx={{ position: 'relative' }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => setOpen(true)}
          startIcon={<Person />}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            minHeight: 56,
            py: 1.5,
            '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: 'primary.main'
            }
          }}
        >
          {selectedPerson ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedPerson.nombre_completo ||
                 `${selectedPerson.nombres || selectedPerson.nombre || ''} ${selectedPerson.apellidos || selectedPerson.apellido || ''}`.trim() ||
                 'Sin nombre'}
              </Typography>
              {selectedPerson.cedula && (
                <Typography variant="caption" color="text.secondary">
                  Cédula: {selectedPerson.cedula}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              {placeholder}
            </Typography>
          )}
        </Button>

        {/* Botón para deseleccionar */}
        {selectedPerson && (
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handlePersonSelect(null);
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              minWidth: 32,
              height: 32,
              p: 0,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'error.contrastText'
              }
            }}
          >
            ×
          </Button>
        )}
      </Box>

      <Dialog
        open={open}
        onClose={() => handleOpenChange(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Search Input */}
            <TextField
              placeholder="Buscar por nombre, apellido, cédula, teléfono, email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIndex(-1); // Reset selection when typing
              }}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              autoFocus
              fullWidth
              helperText={searchTerm && `${filteredPersons.length} resultado${filteredPersons.length !== 1 ? 's' : ''} encontrado${filteredPersons.length !== 1 ? 's' : ''} ${filteredPersons.length > 0 ? '• Use ↑↓ para navegar, Enter para seleccionar' : ''}`}
            />

            {/* Loading State */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress size={32} />
                <Typography sx={{ ml: 2 }}>Cargando...</Typography>
              </Box>
            )}

            {/* Empty State */}
            {!loading && filteredPersons.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  {searchTerm ? 'No se encontraron resultados' : emptyMessage}
                </Typography>
              </Box>
            )}

            {/* Person List */}
            {!loading && filteredPersons.length > 0 && (
              <Box sx={{ maxHeight: 400, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filteredPersons.map((person, index) => (
                  <Box
                    key={person.id || person.persona_id}
                    onClick={() => handleSelect(person)}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: selectedIndex === index ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: selectedIndex === index ? 'primary.50' : 'transparent',
                      '&:hover': { bgcolor: selectedIndex === index ? 'primary.100' : 'action.hover' },
                      transition: 'all 0.2s'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="medium" sx={{ mb: 0.5 }}>
                          {highlightText(
                            person.nombre_completo ||
                            `${person.nombres || person.nombre || ''} ${person.apellidos || person.apellido || ''}`.trim(),
                            searchTerm
                          )}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Badge sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {highlightText(person.cedula || 'Sin cédula', searchTerm)}
                          </Typography>
                        </Box>

                        {person.telefono && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {highlightText(person.telefono, searchTerm)}
                            </Typography>
                          </Box>
                        )}

                        {(person.email || person.correo) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {highlightText(person.email || person.correo, searchTerm)}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 2 }}>
                        {person.especialidad && (
                          <Chip
                            size="small"
                            label={person.especialidad}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {person.rol && (
                          <Chip
                            size="small"
                            label={person.rol}
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PersonSelector;