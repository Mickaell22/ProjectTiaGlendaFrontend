// src/components/shared/PersonSelector.jsx
// Componente reutilizable para selección de personas

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Search } from '@mui/icons-material';
import PersonaService from '../../services/personaService';
import BuscadorPersonas from './BuscadorPersonas';

const PersonSelector = ({
  selectedPerson,
  onPersonSelect,
  onClear,
  label = "Persona",
  required = false,
  error = "",
  placeholder = "Buscar y Seleccionar Persona",
  showTutores = false,
  showPersonas = true
}) => {
  const [showSelector, setShowSelector] = useState(false);

  const handlePersonSelect = (person) => {
    onPersonSelect(person);
    setShowSelector(false);
  };

  const handleClear = () => {
    onClear();
    setShowSelector(true);
  };

  return (
    <Box>
      <Typography variant="body1" mb={1}>
        {label}: {required && '*'}
      </Typography>
      
      {selectedPerson ? (
        <Box>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              bgcolor: 'success.50', 
              border: '1px solid', 
              borderColor: 'success.main',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {PersonaService.getFullName(selectedPerson)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cédula: {selectedPerson.cedula}
                {selectedPerson.telefono && ` • Teléfono: ${selectedPerson.telefono}`}
              </Typography>
              {selectedPerson.correo && (
                <Typography variant="body2" color="text.secondary">
                  Email: {selectedPerson.correo}
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClear}
            >
              Cambiar
            </Button>
          </Paper>
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {error}
            </Typography>
          )}
        </Box>
      ) : (
        <Box>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => setShowSelector(true)}
            startIcon={<Search />}
            sx={{ 
              py: 2,
              borderStyle: error ? 'solid' : 'dashed',
              borderColor: error ? 'error.main' : 'primary.main'
            }}
          >
            {placeholder}
          </Button>
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {error}
            </Typography>
          )}
        </Box>
      )}

      {/* Dialog de selección */}
      <Dialog
        open={showSelector}
        onClose={() => setShowSelector(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Search sx={{ mr: 2 }} />
            Seleccionar {label}
          </Box>
        </DialogTitle>
        <DialogContent>
          <BuscadorPersonas
            onPersonaSelect={handlePersonSelect}
            showTutores={showTutores}
            showPersonas={showPersonas}
            compact={true}
            maxHeight={400}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSelector(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonSelector;