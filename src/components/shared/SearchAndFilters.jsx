// src/components/shared/SearchAndFilters.jsx
// Componente reutilizable para búsqueda y filtros

import React from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Autocomplete
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';

const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  onAddNew,
  addNewText = "Nuevo",
  addNewIcon = <Add />
}) => {
  return (
    <Grid container spacing={2} mb={3}>
      {/* Campo de búsqueda */}
      <Grid size={{ xs: 12, md: filters.length > 0 ? 4 : 8 }}>
        <TextField
          fullWidth
          size="small"
          label="Buscar"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          placeholder={searchPlaceholder}
        />
      </Grid>

      {/* Filtros dinámicos */}
      {filters.map((filter, index) => (
        <Grid key={index} size={{ xs: 12, md: filter.width || 2 }}>
          {filter.type === 'select' ? (
            <FormControl fullWidth size="small">
              <InputLabel>{filter.label}</InputLabel>
              <Select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                label={filter.label}
              >
                <MenuItem value="">Todos</MenuItem>
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : filter.type === 'autocomplete' ? (
            <Autocomplete
              size="small"
              options={filter.options}
              value={filter.value}
              onChange={(e, value) => filter.onChange(value || '')}
              renderInput={(params) => (
                <TextField {...params} label={filter.label} />
              )}
              freeSolo={filter.freeSolo}
            />
          ) : (
            <TextField
              select={filter.type === 'select'}
              fullWidth
              size="small"
              label={filter.label}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
            >
              {filter.type === 'select' && (
                <>
                  <MenuItem value="">Todos</MenuItem>
                  {filter.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </>
              )}
            </TextField>
          )}
        </Grid>
      ))}

      {/* Botón de agregar nuevo */}
      {onAddNew && (
        <Grid size={{ xs: 12, md: filters.length > 0 ? 3 : 4 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={addNewIcon}
            onClick={onAddNew}
            sx={{ height: '40px' }}
          >
            {addNewText}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default SearchAndFilters;